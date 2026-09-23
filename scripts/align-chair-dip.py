"""Create a stable chair-dip sequence from the backed-up reference drawing.

The chair and contact points stay fixed. A landmark-guided warp moves the
torso down and bends the elbows/knees, retaining the reference's line art.
"""
from pathlib import Path
import argparse
import hashlib
import json
import shutil

import numpy as np
from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / 'backups/chair-dip-alignment'
SOURCE = WORK / 'before'
OUTPUT = WORK / 'review'
OUTPUT.mkdir(exist_ok=True)
reference = Image.open(SOURCE / 'frame-3.png').convert('RGBA')

outline = [(239,108),(235,59),(244,34),(272,29),(296,35),(304,65),
           (298,102),(320,105),(342,115),(356,141),(359,179),(362,207),
           (371,225),(375,273),(383,291),(379,314),(335,314),(332,297),
           (339,280),(342,263),(330,230),(328,214),(320,206),(310,208),
           (306,221),(306,238),(311,263),(308,282),(301,294),
           (284,328),(252,337),(228,372),(191,418),(187,442),
           (190,463),(149,477),(107,477),(106,460),(65,460),
           (62,440),(104,414),(142,345),(163,302),(177,273),(219,246),
           (228,238),(230,210),(224,184),(216,169),(214,141),(223,121)]
silhouette = Image.new('L', (2048,2048))
ImageDraw.Draw(silhouette).polygon([(x*4,y*4) for x,y in outline], fill=255)
silhouette = silhouette.resize((512,512), Image.Resampling.LANCZOS)
person_alpha = ImageChops.multiply(reference.getchannel('A'), silhouette)
chair_alpha = ImageChops.multiply(reference.getchannel('A'), ImageChops.invert(silhouette))
chair_region = Image.new('L',(512,512))
chair_pen = ImageDraw.Draw(chair_region)
chair_pen.rectangle((350,198,447,317),fill=255)
chair_pen.rectangle((278,291,447,420),fill=255)
chair_alpha = ImageChops.multiply(chair_alpha,chair_region)
# Continue the seat behind the body so descending reveals a coherent chair.
seat = Image.new('L', (2048,2048))
pen = ImageDraw.Draw(seat)
for line in [[(278,295),(303,295)],[(278,306),(303,306)],[(285,306),(285,334)]]:
    pen.line([(x*4,y*4) for x,y in line], fill=255, width=10, joint='curve')
chair_alpha = ImageChops.lighter(chair_alpha, seat.resize((512,512), Image.Resampling.LANCZOS))

anchors, deltas = [], []
def point(x, y, dx=0, dy=0):
    anchors.append((x,y)); deltas.append((dx,dy))

# Rigid torso/head samples keep the person's proportions through the descent.
for x,y in [(247,42),(274,40),(291,61),(248,93),(277,98),(260,119),
            (233,138),(267,142),(308,130),(312,154),(238,167),(280,170),
            (242,204),(275,205),(303,200),(236,237),(275,238),(298,239),
            (236,262),(272,265),(285,286)]:
    point(x,y,-12,48)
# Elbows travel back while hands remain planted on the seat.
for x,y,dx,dy in [(340,158,4,24),(347,186,20,12),(345,211,29,4),
                  (333,216,27,4),(351,242,14,2),(361,262,5,0),
                  (220,157,-10,41),(232,185,-8,34)]:
    point(x,y,dx,dy)
# Thigh and shin deformation tapers to zero at the fixed feet.
for x,y,dx,dy in [(191,280,-9,32),(171,306,-8,24),(210,299,-8,26),
                  (241,319,-10,24),(221,351,-6,14),(151,354,-4,12),
                  (186,388,-2,6),(127,393,-2,4)]:
    point(x,y,dx,dy)
for y in (279,292,312):
    for x in (335,354,379):
        point(x,y)
for y in (420,441,472):
    for x in (64,105,145,192):
        point(x,y)
for x,y in [(0,0),(512,0),(0,512),(512,512),(440,160),(440,320),(40,240)]:
    point(x,y)
anchors = np.array(anchors, dtype=float)
deltas = np.array(deltas, dtype=float)

def kernel(dist2):
    return dist2 * np.log(np.maximum(dist2, 1e-12))

def deformation(fraction):
    # Fit inverse thin-plate spline (output landmarks -> source landmarks).
    target = (anchors + fraction*deltas) / 512
    source = anchors / 512
    n = len(target)
    dist2 = ((target[:,None,:]-target[None,:,:])**2).sum(axis=2)
    affine = np.column_stack([np.ones(n),target])
    system = np.block([[kernel(dist2)+np.eye(n)*1e-8,affine],
                       [affine.T,np.zeros((3,3))]])
    weights = np.linalg.solve(system, np.vstack([source,np.zeros((3,2))]))
    def evaluate(points):
        q = np.asarray(points)/512
        distances = ((q[:,None,:]-target[None,:,:])**2).sum(axis=2)
        basis = np.column_stack([kernel(distances),np.ones(len(q)),q])
        return basis @ weights * 512
    # A regular small mesh gives Pillow a smooth inverse map.
    boxes, coordinates = [], []
    for y in range(0,512,8):
        for x in range(0,512,8):
            boxes.append((x,y,x+8,y+8))
            coordinates.extend([(x,y),(x,y+8),(x+8,y+8),(x+8,y)])
    mapped = evaluate(coordinates).reshape(-1,8)
    return [(b,tuple(q)) for b,q in zip(boxes,mapped)]

def render(fraction):
    if fraction:
        mesh = deformation(fraction)
        ink = person_alpha.transform((512,512), Image.Transform.MESH, mesh, Image.Resampling.BICUBIC)
        cover = silhouette.transform((512,512), Image.Transform.MESH, mesh, Image.Resampling.BICUBIC)
    else:
        ink, cover = person_alpha.copy(), silhouette.copy()
    # Exact contact-point copies eliminate resampling flicker at hands/feet.
    for box in [(334,279,382,315),(60,423,194,480)]:
        ink.paste(person_alpha.crop(box),box[:2])
        cover.paste(silhouette.crop(box),box[:2])
    exposed_chair = ImageChops.multiply(chair_alpha,ImageChops.invert(cover))
    alpha = ImageChops.lighter(exposed_chair, ink)
    frame = Image.new('RGBA',(512,512),'white')
    frame.putalpha(alpha)
    return frame

frames = [render(t) for t in (0,.5,1)]
for i,im in enumerate(frames,1):
    im.save(OUTPUT / f'frame-{i}.png')
sheet = Image.new('RGB',(1536,512),'#273741')
for i,im in enumerate(frames):
    sheet.paste(im,(i*512,0),im)
sheet.save(OUTPUT / 'sequence.jpg')
preview = []
for i in [0,1,2,1]:
    bg = Image.new('RGB',(512,512),'#273741')
    bg.paste(frames[i],(0,0),frames[i]); preview.append(bg)
preview[0].save(OUTPUT / 'sequence.gif',save_all=True,append_images=preview[1:],duration=650,loop=0)

arrays = [np.asarray(f) for f in frames]
for x0,y0,x1,y1 in [(399,200,452,425),(334,279,382,315),(60,423,194,480)]:
    assert all(np.array_equal(arrays[0][y0:y1,x0:x1],a[y0:y1,x0:x1]) for a in arrays)
assert len({hashlib.sha256(a.tobytes()).hexdigest() for a in arrays}) == 3
assert all(min(f.getbbox()[:2]) >= 24 and max(f.getbbox()[2:]) <= 488 for f in frames)
report = {'reference':'frame-3.png','method':'Fixed chair and contact points; landmark-guided body descent.',
          'fixed_regions': ['chair right side','hands','feet'],
          'images':[{'file':f'frame-{i}.png',
                     'before_sha256':hashlib.sha256((SOURCE/f'frame-{i}.png').read_bytes()).hexdigest(),
                     'after_sha256':hashlib.sha256((OUTPUT/f'frame-{i}.png').read_bytes()).hexdigest()}
                    for i in range(1,4)]}
(OUTPUT/'report.json').write_text(json.dumps(report,indent=2))
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--apply',action='store_true')
if parser.parse_args().apply:
    dest = ROOT/'public/exercises/frames/chair-dip'
    for row in report['images']:
        current = hashlib.sha256((dest/row['file']).read_bytes()).hexdigest()
        assert current in (row['before_sha256'],row['after_sha256']), 'Image changed since backup'
    for row in report['images']:
        shutil.copy2(OUTPUT/row['file'],dest/row['file'])
    print('Applied three chair-dip frames.')
print(OUTPUT)
