"""Normalize existing exercise line art, always reading a verified backup.

Requires Pillow and numpy. Stages outputs for review; --apply copies a verified
stage to public. A shared affine transform per triplet preserves relative motion.
SVG alternatives embed the matching PNG so both formats display identically.
"""
import argparse
import base64
import hashlib
import json
import shutil
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SIZE = 512
MARGIN = 32
STROKE_WIDTH = 2.5
SUPERSAMPLE = 2


def morphology(image, radius, dilate):
    a = np.asarray(image)
    operation = np.maximum if dilate else np.minimum
    for axis in (0, 1):
        padding = [(0, 0), (0, 0)]
        padding[axis] = (radius, radius)
        padded = np.pad(a, padding)
        result = np.full_like(a, 0 if dilate else 255)
        for offset in range(2 * radius + 1):
            view = padded[offset:offset + a.shape[0], :] if axis == 0 else padded[:, offset:offset + a.shape[1]]
            operation(result, view, out=result)
        a = result
    return Image.fromarray(a)


def skeleton(mask):
    a = np.pad(mask.astype(bool), 1)
    while True:
        changed = False
        for phase in (0, 1):
            p = [a[:-2, 1:-1], a[:-2, 2:], a[1:-1, 2:], a[2:, 2:],
                 a[2:, 1:-1], a[2:, :-2], a[1:-1, :-2], a[:-2, :-2]]
            count = sum(x.astype(np.uint8) for x in p)
            transitions = sum((~p[i] & p[(i + 1) % 8]).astype(np.uint8) for i in range(8))
            if phase == 0:
                condition = ~(p[0] & p[2] & p[4]) & ~(p[2] & p[4] & p[6])
            else:
                condition = ~(p[0] & p[2] & p[6]) & ~(p[0] & p[4] & p[6])
            remove = a[1:-1, 1:-1] & (count >= 2) & (count <= 6) & (transitions == 1) & condition
            if remove.any():
                a[1:-1, 1:-1][remove] = False
                changed = True
        if not changed:
            return a[1:-1, 1:-1]


def width(alpha):
    a = np.asarray(alpha, dtype=float) / 255
    sk = skeleton(a >= .5)
    # Stable area / centerline-length proxy, used identically for every image.
    return float(a.sum() / max(1, sk.sum()))


def normalize(alpha, box):
    x0, y0, x1, y1 = box
    scale = (SIZE - 2 * MARGIN) / max(x1 - x0, y1 - y0)
    tx = SIZE / 2 - scale * (x0 + x1) / 2
    ty = SIZE / 2 - scale * (y0 + y1) / 2
    # Work in a common coordinate system: never independently center a frame.
    ss = SUPERSAMPLE
    high = alpha.transform((SIZE * ss, SIZE * ss), Image.Transform.AFFINE,
                           (1 / (scale * ss), 0, -tx / scale,
                            0, 1 / (scale * ss), -ty / scale),
                           resample=Image.Resampling.BICUBIC)
    baseline = high.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    before = width(baseline)
    # Merge sub-2px double contours, extract their centerlines, and render all
    # strokes with one fixed brush at 2x resolution. No pose is synthesized.
    closed = morphology(morphology(high, 2, True), 2, False)
    centerline = skeleton(np.asarray(closed) >= 100)
    ink = Image.fromarray(centerline.astype(np.uint8) * 255)
    best = morphology(ink, 2, True).filter(ImageFilter.GaussianBlur(.35))
    best = best.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    result = Image.new('RGBA', (SIZE, SIZE), (255, 255, 255, 0))
    result.putalpha(best)
    return result, {'scale': scale, 'translate': [tx, ty], 'width_before': before,
                    'width_after': width(best), 'bbox': best.getbbox()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--backup', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    source = args.backup / 'exercises'
    manifest = json.loads((args.backup / 'manifest.json').read_text(encoding='utf-8-sig'))
    for entry in manifest:
        path = source / Path(entry['path'])
        assert hashlib.sha256(path.read_bytes()).hexdigest().upper() == entry['sha256'], path
    if args.apply:
        report = json.loads((args.output / 'report.json').read_text())
        assert len(report['images']) == 937
        for row in report['images']:
            path = args.output / 'exercises' / row['path']
            assert hashlib.sha256(path.read_bytes()).hexdigest() == row['sha256'], path
        expected = {str(Path(e['path'])) for e in manifest}
        actual = {str(p.relative_to(args.output / 'exercises')) for p in (args.output / 'exercises').rglob('*') if p.is_file()}
        assert expected == actual, 'Staged file inventory differs from backup'
        for entry in manifest:
            destination = root / 'public/exercises' / entry['path']
            current_hash = hashlib.sha256(destination.read_bytes()).hexdigest().upper()
            staged_hash = hashlib.sha256((args.output / 'exercises' / entry['path']).read_bytes()).hexdigest().upper()
            assert current_hash in (entry['sha256'], staged_hash), f'File changed since backup: {destination}'
        shutil.copytree(args.output / 'exercises', root / 'public/exercises', dirs_exist_ok=True)
        print('Applied verified staged images.', flush=True)
        return
    args.output.mkdir(parents=True, exist_ok=False)
    out = args.output / 'exercises'
    groups = [[p] for p in sorted(source.glob('*.png'))]
    groups += [sorted(p.glob('*.png')) for p in sorted((source / 'frames').iterdir()) if p.is_dir()]
    records = []
    source_hash_to_frame = {}
    # Normalize triplets first so exact legacy duplicates can reuse that frame.
    groups.sort(key=lambda g: -len(g))
    def process_group(group):
        group_records = []
        alphas = [Image.open(p).convert('RGBA').getchannel('A') for p in group]
        boxes = [a.getbbox() for a in alphas]
        assert all(boxes), group
        box = (min(b[0] for b in boxes), min(b[1] for b in boxes),
               max(b[2] for b in boxes), max(b[3] for b in boxes))
        for p, alpha in zip(group, alphas):
            dest = out / p.relative_to(source)
            dest.parent.mkdir(parents=True, exist_ok=True)
            original_hash = hashlib.sha256(p.read_bytes()).hexdigest()
            if len(group) == 1 and original_hash in source_hash_to_frame:
                previous, info = source_hash_to_frame[original_hash]
                shutil.copy2(previous, dest)
                info = dict(info, reused_frame=str(previous.relative_to(out)))
            else:
                result, info = normalize(alpha, box)
                result.save(dest, optimize=True)
                if len(group) == 3:
                    source_hash_to_frame.setdefault(original_hash, (dest, info))
            group_records.append(dict(path=str(p.relative_to(source)), sha256=hashlib.sha256(dest.read_bytes()).hexdigest(), **info))
        return group_records
    with ThreadPoolExecutor(max_workers=6) as pool:
        triplets = [g for g in groups if len(g) == 3]
        for index, rows in enumerate(pool.map(process_group, triplets)):
            records.extend(rows)
            if index % 10 == 0:
                print(f'{index + 1}/{len(triplets)} triplets processed', flush=True)
    for group in groups:
        if len(group) != 3:
            records.extend(process_group(group))
    for svg in source.rglob('*.svg'):
        dest = out / svg.relative_to(source)
        png = dest.with_suffix('.png')
        data = base64.b64encode(png.read_bytes()).decode()
        dest.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><image width="512" height="512" href="data:image/png;base64,{data}"/></svg>')
    report = {'size': SIZE, 'margin': MARGIN, 'brush_width_pixels': STROKE_WIDTH,
              'method': 'Shared triplet affine transform; sub-2px contour closing; centerline extraction; fixed 2.5px brush with antialiasing. SVG embeds matching PNG.',
              'backup': str(args.backup.resolve()), 'images': records}
    (args.output / 'report.json').write_text(json.dumps(report, indent=2))
    chosen = ['squat', 'bench-press', 'step-up', 'dumbbell-overhead-tricep-extension', 'walking-lunge', 'plank']
    canvas = Image.new('RGB', (6 * 190, len(chosen) * 215), '#273741')
    draw = ImageDraw.Draw(canvas)
    for y, slug in enumerate(chosen):
        draw.text((6, y * 215), slug + ' | original (3) -> padronizado (3)', fill='white')
        for j in range(6):
            base = source if j < 3 else out
            im = Image.open(base / 'frames' / slug / f'frame-{j % 3 + 1}.png').convert('RGBA')
            im.thumbnail((188, 188))
            canvas.paste(im, (j * 190, y * 215 + 24), im)
    canvas.save(args.output / 'comparison.jpg', quality=92)
    print(f'Staged {len(records)} PNGs and SVG alternatives in {args.output}', flush=True)


if __name__ == '__main__':
    main()
