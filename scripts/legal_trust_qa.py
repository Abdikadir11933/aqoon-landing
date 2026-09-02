from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
errors=[]

caawi=(ROOT/'caawi'/'index.html').read_text(encoding='utf-8')
app=(ROOT/'caawi'/'app.js').read_text(encoding='utf-8')
home=(ROOT/'index.html').read_text(encoding='utf-8')
privacy=(ROOT/'tietosuoja'/'index.html').read_text(encoding='utf-8')

for bad in ['waxa aad xaq u leedahay','TE-toimisto','TE-palvelut']:
    for p in [ROOT/'caawi'/'index.html', ROOT/'caawi'/'app.js'] + [x for x in (ROOT/'caawi').rglob('index.html') if x != ROOT/'caawi'/'index.html']:
        txt=p.read_text(encoding='utf-8')
        if bad.lower() in txt.lower(): errors.append(f'{p.relative_to(ROOT)} contains risky/outdated phrase: {bad}')

if '/caawi/disclaimer' not in caawi: errors.append('caawi missing independence disclaimer link')
if '/caawi/tietosuoja' not in caawi: errors.append('caawi missing privacy link')
# The implementation deliberately uses the compact `consent` variable.  Keep
# this guard aligned with the runtime condition rather than requiring a stale
# variable name and turning a consent-gated implementation into a false fail.
if "if(consent!=='yes')return;" not in app: errors.append('caawi funnel analytics is not consent-gated')
if "aqoon_analytics_consent" not in app: errors.append('analytics consent preference missing')
if 'aqoon-independence-note' not in home: errors.append('Finnish homepage missing independence notice')
if '/disclaimer' not in home: errors.append('Finnish homepage missing disclaimer link')
if '/disclaimer' not in privacy: errors.append('Finnish privacy notice missing disclaimer link')

for p in (ROOT/'caawi').rglob('index.html'):
    rel=p.relative_to(ROOT).as_posix()
    if '/pilke/' in rel or rel in {'caawi/index.html','caawi/disclaimer/index.html','caawi/tietosuoja/index.html'}: continue
    txt=p.read_text(encoding='utf-8')
    if 'aqoon-legal-note' not in txt: errors.append(f'{rel} missing independence notice')

for required in [ROOT/'tietosuoja'/'index.html', ROOT/'disclaimer'/'index.html', ROOT/'caawi'/'tietosuoja'/'index.html', ROOT/'caawi'/'disclaimer'/'index.html']:
    if not required.exists(): errors.append(f'missing required trust page: {required.relative_to(ROOT)}')

if errors:
    print('\n'.join('ERROR: '+e for e in errors))
    raise SystemExit(1)
print('Legal/trust QA passed')
