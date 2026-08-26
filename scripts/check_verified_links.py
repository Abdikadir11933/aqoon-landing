import json, sys, time, urllib.request, urllib.error
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / 'seo' / 'verified-links.json'
links = json.loads(DATA.read_text(encoding='utf-8'))['links']
failed = []
headers = {'User-Agent': 'AQOON-Link-QA/1.0 (+https://aqoon.live)'}
for item in links:
    url = item['url']
    try:
        req = urllib.request.Request(url, headers=headers, method='GET')
        with urllib.request.urlopen(req, timeout=20) as r:
            code = r.getcode()
            final = r.geturl()
        print(f"OK {code} {item['id']} -> {final}")
        if code < 200 or code >= 400:
            failed.append((item['id'], code, url))
    except Exception as e:
        print(f"FAIL {item['id']} {url}: {e}")
        failed.append((item['id'], 'error', url))
    time.sleep(0.25)
if failed:
    print('\nBroken or unreachable verified links:')
    for row in failed: print(row)
    sys.exit(1)
print(f"\nChecked {len(links)} verified links successfully.")
