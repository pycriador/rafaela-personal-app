"""Build a fixed-camera leg-extension sequence from the existing drawing.

The torso/seat remain pixel-identical; lower legs and rollers rotate about
fixed knee anchors. Inputs are the pre-alignment backup, never generated frames.
"""
from pathlib import Path
import json
import hashlib
import math
import argparse
import base64
import shutil

import numpy as np
from PIL import Image, ImageDraw, ImageChops

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / 'backups/leg-extension-alignment'
SOURCE = WORK / 'before'
OUTPUT = WORK / 'review'
OUTPUT.mkdir(exist_ok=True)

base = Image.open(SOURCE / 'frame-3.png').convert('RGBA')
far_points = [(193, 302), (252, 302), (252, 331), (240, 358), (242, 389),
              (243, 428), (232, 470), (145, 470), (133, 448), (137, 425),
              (156, 413), (155, 389), (162, 365), (186, 357)]
near_points = [(263, 312), (320, 312), (324, 355), (312, 382), (336, 399),
               (337, 444), (306, 478), (240, 479), (239, 452), (251, 436),
               (235, 427), (229, 410), (232, 389), (254, 375), (260, 347)]

def mask(points):
    result = Image.new('L', (512, 512))
    ImageDraw.Draw(result).polygon(points, fill=255)
    return result

def cut(image, selection):
    layer = image.copy()
    layer.putalpha(ImageChops.multiply(image.getchannel('A'), selection))
    return layer

far_mask, near_mask = mask(far_points), mask(near_points)
legs_mask = ImageChops.lighter(far_mask, near_mask)
stationary = cut(base, ImageChops.invert(legs_mask))
far, near = cut(base, far_mask), cut(base, near_mask)

# A fixed chair support under the existing seat, matching the original simple
# line-art equipment. Draw at 4x for the same antialiased white line weight.
support = Image.new('RGBA', (2048, 2048))
draw = ImageDraw.Draw(support)
def line(points):
    draw.line([(int(x*4),int(y*4)) for x,y in points], fill='white', width=10, joint='curve')
line([(289, 332), (285, 423), (345, 441), (348, 456), (335, 465), (208, 432), (207, 419), (269, 434), (269, 339)])
line([(288, 399), (339, 355)])
support = support.resize((512, 512), Image.Resampling.LANCZOS)

def render(angle):
    # Pillow's negative angle rotates clockwise in screen coordinates.
    far_pose = far.rotate(-angle, Image.Resampling.BICUBIC, center=(222, 304))
    near_pose = near.rotate(-angle, Image.Resampling.BICUBIC, center=(298, 313))
    far_cover = far_mask.rotate(-angle, Image.Resampling.BICUBIC, center=(222, 304))
    near_cover = near_mask.rotate(-angle, Image.Resampling.BICUBIC, center=(298, 313))
    background = cut(support, ImageChops.invert(ImageChops.lighter(far_cover, near_cover)))
    result = Image.alpha_composite(background, stationary)
    result = Image.alpha_composite(result, far_pose)
    result = Image.alpha_composite(result, near_pose)
    if angle:
        joints = Image.new('RGBA', (2048, 2048))
        pen = ImageDraw.Draw(joints)
        for pivot, edge in [((222,304),(198,302)), ((222,304),(249,302)),
                            ((298,313),(279,312)), ((298,313),(318,312))]:
            x, y = edge[0]-pivot[0], edge[1]-pivot[1]
            arc = []
            for a in np.linspace(0, math.radians(angle), 30):
                arc.append(((pivot[0]+x*math.cos(a)-y*math.sin(a))*4,
                            (pivot[1]+x*math.sin(a)+y*math.cos(a))*4))
            pen.line(arc, fill='white', width=10, joint='curve')
        result = Image.alpha_composite(result, joints.resize((512,512), Image.Resampling.LANCZOS))
    return result

frames = [render(angle) for angle in (60, 30, 0)]
for i, frame in enumerate(frames):
    white = Image.new('RGBA', (512,512), 'white')
    white.putalpha(frame.getchannel('A'))
    frames[i] = white
assert all(np.array_equal(np.asarray(frames[0])[:240], np.asarray(f)[:240]) for f in frames)
assert len({hashlib.sha256(f.tobytes()).hexdigest() for f in frames}) == 3
assert all(min(f.getbbox()[:2]) >= 24 and max(f.getbbox()[2:]) <= 488 for f in frames)
for i, frame in enumerate(frames, 1):
    frame.save(OUTPUT / f'frame-{i}.png')
sheet = Image.new('RGB', (1536, 512), '#273741')
for i, frame in enumerate(frames):
    sheet.paste(frame, (i*512,0), frame)
sheet.save(OUTPUT / 'sequence.jpg')
preview = []
for i in [0,1,2,1]:
    bg = Image.new('RGB', (512,512), '#273741')
    bg.paste(frames[i], (0,0), frames[i])
    preview.append(bg)
preview[0].save(OUTPUT / 'sequence.gif', save_all=True, append_images=preview[1:], duration=650, loop=0)
manifest = {'method': 'Fixed torso and chair; lower-leg layers rotate around fixed knee anchors.',
            'angles': [60,30,0], 'fixed_upper_region': [0,0,512,240],
            'images': [{'file': f'frame-{i}.png',
                        'before_sha256': hashlib.sha256((SOURCE / f'frame-{i}.png').read_bytes()).hexdigest(),
                        'after_sha256': hashlib.sha256((OUTPUT / f'frame-{i}.png').read_bytes()).hexdigest()}
                       for i in range(1,4)]}
(OUTPUT / 'report.json').write_text(json.dumps(manifest, indent=2))
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--apply', action='store_true')
if parser.parse_args().apply:
    destination = ROOT / 'public/exercises/frames/leg-extension'
    for row in manifest['images']:
        current = hashlib.sha256((destination / row['file']).read_bytes()).hexdigest()
        assert current in (row['before_sha256'], row['after_sha256']), 'Asset changed since backup'
    for i in range(1,4):
        png = OUTPUT / f'frame-{i}.png'
        shutil.copy2(png, destination / png.name)
        svg = destination / f'frame-{i}.svg'
        if svg.exists():
            assert (SOURCE / svg.name).exists(), 'Missing SVG backup'
            encoded = base64.b64encode(png.read_bytes()).decode()
            svg.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><image width="512" height="512" href="data:image/png;base64,{encoded}"/></svg>')
    legacy = ROOT / 'public/exercises/exercise-pernas-04.png'
    legacy_backup = WORK / legacy.name
    if not legacy_backup.exists():
        shutil.copy2(legacy, legacy_backup)
    shutil.copy2(OUTPUT / 'frame-1.png', legacy)
    print('Applied leg-extension frames and matching legacy thumbnail.')
print(OUTPUT)
