"""Validate the staged normalization and create a browsable before/after review."""
import argparse
import base64
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET

import numpy as np
from PIL import Image, ImageDraw


parser = argparse.ArgumentParser()
parser.add_argument('stage', type=Path)
args = parser.parse_args()
report = json.loads((args.stage / 'report.json').read_text())
backup = Path(report['backup']) / 'exercises'
output = args.stage / 'exercises'
rows = report['images']
assert len(rows) == 937
by_path = {str(Path(r['path'])): r for r in rows}
for row in rows:
    path = output / row['path']
    assert hashlib.sha256(path.read_bytes()).hexdigest() == row['sha256'], path
    with Image.open(path) as image:
        assert image.mode == 'RGBA' and image.size == (512, 512), path
        pixels = np.asarray(image)
        assert np.all(pixels[:, :, :3] == 255), path
        alpha = pixels[:, :, 3]
        assert (alpha > 128).sum() > 100, path
        assert np.max(alpha[:24]) == np.max(alpha[-24:]) == 0, path
        assert np.max(alpha[:, :24]) == np.max(alpha[:, -24:]) == 0, path
folders = sorted((output / 'frames').iterdir())
assert len(folders) == 302
for folder in folders:
    frames = sorted(folder.glob('*.png'))
    assert [p.name for p in frames] == ['frame-1.png', 'frame-2.png', 'frame-3.png']
    metadata = [by_path[str(p.relative_to(output))] for p in frames]
    assert len({(m['scale'], tuple(m['translate'])) for m in metadata}) == 1, folder
    original_unique = len({hashlib.sha256((backup / p.relative_to(output)).read_bytes()).hexdigest() for p in frames})
    assert len({m['sha256'] for m in metadata}) >= original_unique, folder
svgs = list(output.rglob('*.svg'))
for svg in svgs:
    embedded = ET.parse(svg).getroot().find('{http://www.w3.org/2000/svg}image')
    assert base64.b64decode(embedded.attrib['href'].split(',')[1]) == svg.with_suffix('.png').read_bytes(), svg
summary = {
    'png_count': len(rows), 'svg_count': len(svgs), 'triplets': len(folders),
    'resolution': '512x512 RGBA', 'minimum_clear_border': 24,
    'same_transform_for_each_triplet': True, 'distinct_frames_preserved': True,
    'width_proxy_before': {k: float(fn([r['width_before'] for r in rows])) for k, fn in [('median', np.median), ('std', np.std), ('min', np.min), ('max', np.max)]},
    'width_proxy_after': {k: float(fn([r['width_after'] for r in rows])) for k, fn in [('median', np.median), ('std', np.std), ('min', np.min), ('max', np.max)]},
}
(args.stage / 'validation.json').write_text(json.dumps(summary, indent=2))
names = [f.name for f in folders]
html = '''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Revisão dos exercícios</title>
<style>body{background:#16242c;color:#fff;font:16px system-ui;margin:24px auto;max-width:1120px;padding:0 16px}header{display:flex;gap:12px;flex-wrap:wrap;align-items:center}select,button{padding:10px;border:1px solid #57707d;border-radius:8px;background:#273741;color:white}main{display:grid;grid-template-columns:1fr 1fr;gap:20px}img{display:block;width:100%;background:#273741;border-radius:16px}h2{font-size:18px}p{color:#b9c9d2}#strip{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-top:20px}@media(max-width:600px){main{gap:8px}body{padding:0 8px}}</style>
<h1>Exercícios: antes e depois</h1><p>Os três frames permanecem diferentes. Compare o traço e o enquadramento na mesma fase do movimento.</p>
<header><select id="exercise"></select><button id="play">Pausar</button><button id="step">Próximo frame</button><span id="frame"></span></header>
<main><section><h2>Original</h2><img id="before" alt="Frame original"></section><section><h2>Padronizado</h2><img id="after" alt="Frame padronizado"></section></main><div id="strip"></div>
<p>A normalização conserva as poses existentes. Diferenças de perspectiva ou posicionamento já desenhadas nos originais podem continuar visíveis.</p>
<script>
const names=__NAMES__,original=__ORIGINAL__;
const select=document.querySelector('#exercise'),seq=[1,2,3,2];let index=0,playing=true;
for(const name of names){const o=document.createElement('option');o.value=name;o.textContent=name;select.append(o)}
function render(){const name=select.value,f=seq[index];document.querySelector('#before').src=original+'/frames/'+name+'/frame-'+f+'.png';document.querySelector('#after').src='exercises/frames/'+name+'/frame-'+f+'.png';document.querySelector('#frame').textContent='Frame '+f+' de 3'}
function change(){index=0;render();const strip=document.querySelector('#strip');strip.replaceChildren();for(const root of [original,'exercises'])for(let f=1;f<=3;f++){const im=document.createElement('img');im.src=root+'/frames/'+select.value+'/frame-'+f+'.png';im.alt='Frame '+f;strip.append(im)}}
select.onchange=change;document.querySelector('#play').onclick=()=>{playing=!playing;document.querySelector('#play').textContent=playing?'Pausar':'Reproduzir'};document.querySelector('#step').onclick=()=>{playing=false;document.querySelector('#play').textContent='Reproduzir';index=(index+1)%seq.length;render()};setInterval(()=>{if(playing){index=(index+1)%seq.length;render()}},650);change();
</script></html>'''
import os
relative_backup = os.path.relpath(backup, args.stage).replace('\\', '/')
(args.stage / 'review.html').write_text(html.replace('__NAMES__', json.dumps(names)).replace('__ORIGINAL__', json.dumps(relative_backup)), encoding='utf-8')
# Every final frame appears in these sheets, with triplets adjacent.
for page in range((len(names) + 47) // 48):
    selected = names[page * 48:(page + 1) * 48]
    sheet = Image.new('RGB', (1440, 1680), '#273741')
    draw = ImageDraw.Draw(sheet)
    for i, name in enumerate(selected):
        x, y = (i % 4) * 360, (i // 4) * 140
        draw.text((x + 4, y + 2), name, fill='white')
        for f in range(3):
            im = Image.open(output / 'frames' / name / f'frame-{f + 1}.png').convert('RGBA').resize((120, 120))
            sheet.paste(im, (x + f * 120, y + 18), im)
    sheet.save(args.stage / f'all-frames-{page + 1}.jpg', quality=92)
print(json.dumps(summary, indent=2))
