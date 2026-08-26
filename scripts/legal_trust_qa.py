from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
errors=[]

caawi=(ROOT/'caawi'/'index.html').read_text(encoding='utf-8')
app=(ROOT/'caawi'/'app.js').read_text(encoding='utf-8')

for bad in ['waxa aad xaq u leedahay','TE-toimisto','TE-palvelut']:
    for p in [ROOT/'caawi'/'index.html', ROOT/'caawi'/'app.js'] + [x for x in (ROOT/'so').rglob('index.html') if '/pilke/' not in x.as_posix()]:
        txt=p.read_text(encoding='utf-8')
        if bad.lower() in txt.lower(): errors.append(f'{p.relative_to(ROOT)} contains risky/outdated phrase: {bad}')

if '/so/disclaimer' not in caawi: errors.append('caawi missing independence disclaimer link')
if '/so/tietosuoja' not in caawi: errors.append('caawi missing privacy link')
if "if(analyticsConsent!=='yes')return;" not in app: errors.append('caawi funnel analytics is not consent-gated')
if "aqoon_analytics_consent" not in app: errors.append('analytics consent preference missing')

for p in (ROOT/'so').rglob('index.html'):
    rel=p.relative_to(ROOT).as_posix()
    if '/pilke/' in rel or rel in {'so/disclaimer/index.html','so/tietosuoja/index.html'}: continue
    txt=p.read_text(encoding='utf-8')
    if 'aqoon-legal-note' not in txt: errors.append(f'{rel} missing independence notice')

for required in [ROOT/'tietosuoja'/'index.html', ROOT/'so'/'tietosuoja'/'index.html', ROOT/'so'/'disclaimer'/'index.html']:
    if not required.exists(): errors.append(f'missing required trust page: {required.relative_to(ROOT)}')

if errors:
    print('\n'.join('ERROR: '+e for e in errors))
    raise SystemExit(1)
print('Legal/trust QA passed')
