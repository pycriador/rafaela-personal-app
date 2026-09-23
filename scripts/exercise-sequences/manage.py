"""Package, validate, review, apply and restore the exercise sequence batch.

Uses only Pillow and NumPy; registration itself lives in engine.py.
All replacements are preflighted by SHA-256 before any public file is changed.
"""
from pathlib import Path
import argparse
import base64
import hashlib
import html
import json
import os
import shutil

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
BACKUP = ROOT / 'backups/exercises-before-sequencing-20260922-234724'
SOURCE = BACKUP / 'exercises'
STAGE = ROOT / 'backups/all-exercise-sequences'
PACKAGE = STAGE / 'exercises'
PUBLIC = ROOT / 'public/exercises'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest().lower()


def manifest():
    return {r['path'].replace('\\', '/'): r['sha256'].lower() for r in json.loads((BACKUP / 'manifest.json').read_text())}


def validate_backup():
    records = manifest()
    actual = {p.relative_to(SOURCE).as_posix() for p in SOURCE.rglob('*') if p.is_file()}
    if actual != set(records):
        raise RuntimeError('Backup inventory differs from its manifest')
    for rel, expected in records.items():
        if digest(SOURCE / rel) != expected:
            raise RuntimeError(f'Backup hash mismatch: {rel}')
    return records


def package():
    records = validate_backup()
    profiles = json.loads((Path(__file__).parent / 'profiles.json').read_text())
    # Verify every candidate exists before constructing the complete package.
    for slug in profiles:
        for i in (1, 2, 3):
            candidate = STAGE / 'candidate' / slug / f'frame-{i}.png'
            with Image.open(candidate) as im:
                im.load()
                if im.size != (512, 512) or im.mode != 'RGBA':
                    raise RuntimeError(f'Invalid candidate: {candidate}')
    shutil.copytree(SOURCE, PACKAGE, dirs_exist_ok=True)
    aliases = {}
    for slug in profiles:
        for i in (1, 2, 3):
            rel = f'frames/{slug}/frame-{i}.png'
            candidate = STAGE / 'candidate' / slug / f'frame-{i}.png'
            destination = PACKAGE / rel
            # Preserve byte-for-byte the two manually approved sequences.
            if profiles[slug]['mode'] != 'approved':
                shutil.copy2(candidate, destination)
            aliases.setdefault(records[rel], destination)
            svg = destination.with_suffix('.svg')
            if svg.exists() and profiles[slug]['mode'] != 'approved':
                encoded = base64.b64encode(destination.read_bytes()).decode('ascii')
                svg.write_text('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">'
                               f'<image width="512" height="512" href="data:image/png;base64,{encoded}"/></svg>')
    for path in SOURCE.glob('*.png'):
        match = aliases.get(digest(path))
        if match:
            shutil.copy2(match, PACKAGE / path.name)
    results = {rel: digest(PACKAGE / rel) for rel in records}
    (STAGE / 'package-manifest.json').write_text(json.dumps(results, indent=2))
    return validate()


def validate():
    records = validate_backup()
    expected = json.loads((STAGE / 'package-manifest.json').read_text())
    actual = {p.relative_to(PACKAGE).as_posix() for p in PACKAGE.rglob('*') if p.is_file()}
    errors = []
    if actual != set(records) or set(expected) != set(records):
        errors.append('Package inventory mismatch')
    changed = []
    for rel, original_hash in records.items():
        path = PACKAGE / rel
        if not path.exists():
            errors.append(f'Missing: {rel}')
            continue
        if digest(path) != expected.get(rel):
            errors.append(f'Package hash mismatch: {rel}')
        if digest(path) != original_hash:
            changed.append(rel)
        if path.suffix == '.png':
            with Image.open(path) as im:
                pixels = np.asarray(im)
                if im.size != (512, 512) or im.mode != 'RGBA':
                    errors.append(f'PNG format: {rel}')
                    continue
                a = pixels[:, :, 3]
                if not np.any(a > 32) or np.any(a[0]) or np.any(a[-1]) or np.any(a[:, 0]) or np.any(a[:, -1]):
                    errors.append(f'Empty or clipped: {rel}')
                if np.any(pixels[:, :, :3][a > 0] != 255):
                    errors.append(f'Non-white strokes: {rel}')
        elif path.suffix == '.svg':
            import xml.etree.ElementTree as ET
            node = ET.fromstring(path.read_text()).find('{http://www.w3.org/2000/svg}image')
            uri = node.get('href', node.get('{http://www.w3.org/1999/xlink}href', '')) if node is not None else ''
            if not uri.startswith('data:image/png;base64,') or base64.b64decode(uri.split(',', 1)[1]) != path.with_suffix('.png').read_bytes():
                errors.append(f'SVG and PNG mismatch: {rel}')
    sequences = []
    for directory in sorted((PACKAGE / 'frames').iterdir()):
        if not directory.is_dir():
            continue
        before = [np.asarray(Image.open(SOURCE / 'frames' / directory.name / f'frame-{i}.png'))[:, :, 3] for i in (1, 2, 3)]
        after = [np.asarray(Image.open(directory / f'frame-{i}.png'))[:, :, 3] for i in (1, 2, 3)]
        if len({a.tobytes() for a in after}) < len({a.tobytes() for a in before}):
            errors.append(f'Lost distinct poses: {directory.name}')
        report = json.loads((STAGE / 'candidate' / directory.name / 'report.json').read_text())
        for i, (a, b) in enumerate(zip(before, after)):
            if not .75 <= float(b.sum()) / max(1, float(a.sum())) <= 1.3:
                errors.append(f'Unexpected ink area: {directory.name}/{i+1}')
        sequences.append({'slug': directory.name, 'mode': report['mode'],
                          'camera_adjusted': any(not np.allclose(m, [[1, 0, 0], [0, 1, 0]]) for m in report.get('camera_matrices', [])),
                          'review_status': 'approved' if report['mode'] == 'approved' else 'individual-visual-review-needed'})
    result = {'files': len(records), 'pngs': sum(r.endswith('.png') for r in records),
              'svgs': sum(r.endswith('.svg') for r in records), 'sequences': len(sequences),
              'changed_files': len(changed), 'camera_adjusted_sequences': sum(s['camera_adjusted'] for s in sequences),
              'errors': errors, 'results': sequences,
              'limitation': 'Automated checks validate file integrity and conservative registration, not biomechanical or perspective consistency.'}
    (STAGE / 'validation.json').write_text(json.dumps(result, indent=2))
    print(json.dumps({k: v for k, v in result.items() if k != 'results'}, indent=2), flush=True)
    if errors:
        raise RuntimeError('Validation failed; public files were not replaced')
    return result


def gallery():
    validation = json.loads((STAGE / 'validation.json').read_text())
    cards = []
    rows = validation['results']
    for row in rows:
        slug = row['slug']
        before = Path(os.path.relpath(SOURCE / 'frames' / slug, STAGE)).as_posix()
        after = f'exercises/frames/{slug}'
        badge = 'Correção individual aprovada' if row['mode'] == 'approved' else 'Registro automático · revisão individual pendente'
        cards.append(f'<article data-name="{html.escape(slug)}"><h2>{html.escape(slug)}</h2><p>{badge}</p><div class="pair">'
                     f'<figure><img loading="lazy" data-base="{before}" src="{before}/frame-1.png"><figcaption>Antes</figcaption></figure>'
                     f'<figure><img loading="lazy" data-base="{after}" src="{after}/frame-1.png"><figcaption>Depois</figcaption></figure></div></article>')
    page = '''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Revisão das sequências</title>
<style>body{background:#15232d;color:#eef4f8;font:16px system-ui;margin:24px}header{position:sticky;top:0;background:#15232d;padding:12px;z-index:1}h1{font-size:24px}h2{font-size:16px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(440px,1fr));gap:16px}article{background:#273741;padding:14px;border-radius:12px}article p{font-size:12px;color:#b7cbd5}.pair{display:flex}figure{margin:0;width:50%}img{width:100%}figcaption{text-align:center}input,button{padding:10px;margin:4px}</style>
<header><h1>302 sequências — antes e depois</h1><p>Ajustes automáticos preservam as poses. Mudanças de perspectiva ainda exigem reconstrução individual.</p>
<input id="search" placeholder="Buscar exercício"><button id="play">Pausar</button><button id="step">Próximo frame</button><span id="frame">Frame 1</span></header><main>'''+''.join(cards)+'''</main>
<script>let t=0,playing=true;const seq=[1,2,3,2],visible=new Set();const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.isIntersecting?visible.add(e.target):visible.delete(e.target)),{rootMargin:'200px'});document.querySelectorAll('img').forEach(im=>observer.observe(im));function draw(){visible.forEach(im=>im.src=im.dataset.base+'/frame-'+seq[t]+'.png');document.querySelector('#frame').textContent='Frame '+seq[t]}function next(){t=(t+1)%4;draw()}setInterval(()=>{if(playing)next()},650);document.querySelector('#play').onclick=()=>{playing=!playing;document.querySelector('#play').textContent=playing?'Pausar':'Reproduzir'};document.querySelector('#step').onclick=()=>{playing=false;document.querySelector('#play').textContent='Reproduzir';next()};document.querySelector('#search').oninput=e=>document.querySelectorAll('article').forEach(a=>a.hidden=!a.dataset.name.includes(e.target.value.toLowerCase()));</script></html>'''
    (STAGE / 'review.html').write_text(page, encoding='utf-8')
    for start in range(0, len(rows), 24):
        batch = rows[start:start+24]
        sheet = Image.new('RGB', (1152, 154 * len(batch)), '#273741')
        draw = ImageDraw.Draw(sheet)
        for y, row in enumerate(batch):
            draw.text((5, y * 154), row['slug'] + ' | before (left) / after (right)', fill='white')
            for col in range(6):
                parent = SOURCE if col < 3 else PACKAGE
                im = Image.open(parent / 'frames' / row['slug'] / f'frame-{col%3+1}.png').resize((132, 132))
                sheet.paste(im, (col * 192 + 30, y * 154 + 20), im)
        sheet.save(STAGE / f'review-{start//24+1:02}.jpg', quality=88)
    print(f'Review: {STAGE / "review.html"}')


def install(restore=False):
    validate_backup()
    if not restore:
        validate()
    original = manifest()
    staged = json.loads((STAGE / 'package-manifest.json').read_text())
    desired = original if restore else staged
    # Entire preflight first: never overwrite edits made since staging/application.
    actual = {p.relative_to(PUBLIC).as_posix() for p in PUBLIC.rglob('*') if p.is_file()}
    if actual != set(original):
        raise RuntimeError('Public inventory changed; inspect before applying/restoring')
    for rel in original:
        if digest(PUBLIC / rel) not in (original[rel], staged[rel]):
            raise RuntimeError(f'Public file edited since backup: {rel}')
    source = SOURCE if restore else PACKAGE
    changed = 0
    for rel, expected in desired.items():
        target = PUBLIC / rel
        if digest(target) == expected:
            continue
        temporary = target.with_name(target.name + '.sequence-tmp')
        shutil.copy2(source / rel, temporary)
        if digest(temporary) != expected:
            raise RuntimeError(f'Copy verification failed: {rel}')
        os.replace(temporary, target)
        changed += 1
    for rel, expected in desired.items():
        if digest(PUBLIC / rel) != expected:
            raise RuntimeError(f'Installed hash mismatch: {rel}')
    result = {'action': 'restore' if restore else 'apply', 'changed': changed, 'verified': len(desired)}
    (STAGE / ('restore-report.json' if restore else 'apply-report.json')).write_text(json.dumps(result, indent=2))
    print(json.dumps(result))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['package', 'verify', 'review', 'apply', 'restore'])
    parser.add_argument('--backup', type=Path, default=BACKUP)
    parser.add_argument('--output', type=Path, default=STAGE)
    args = parser.parse_args()
    BACKUP = args.backup.resolve()
    SOURCE = BACKUP / 'exercises'
    STAGE = args.output.resolve()
    PACKAGE = STAGE / 'exercises'
    command = args.command
    if command == 'package':
        package()
        gallery()
    elif command == 'verify':
        validate()
    elif command == 'review':
        gallery()
    else:
        install(restore=command == 'restore')
