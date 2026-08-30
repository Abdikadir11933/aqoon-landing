#!/usr/bin/env python3
"""One-time script: add OG tags, twitter:card and WebPage JSON-LD to every
so/ page that's missing them. Run once, inspect the diff, then delete or
keep for reference - not part of the ongoing QA pipeline."""
import glob
import json
import re

FILES = sorted(glob.glob('so/*/index.html')) + ['so/index.html']
# Legal boilerplate pages: OG/twitter yes, WebPage JSON-LD no (nothing
# there is really "a page about a topic" the schema would describe truthfully).
SKIP_JSONLD = {'so/tietosuoja/index.html', 'so/disclaimer/index.html'}

added_og, added_jsonld, skipped = [], [], []

for path in FILES:
    content = open(path, encoding='utf-8').read()
    title_m = re.search(r'<title>(.*?)</title>', content)
    desc_m = re.search(r'<meta name="description" content="([^"]*)"', content)
    canon_m = re.search(r'<link rel="canonical" href="([^"]*)">', content)
    lang_m = re.search(r'<html lang="([^"]*)"', content)
    if not (title_m and desc_m and canon_m):
        skipped.append((path, 'missing title/description/canonical'))
        continue
    title, desc, url = title_m.group(1), desc_m.group(1), canon_m.group(1)
    lang = lang_m.group(1) if lang_m else 'so'
    locale = 'so_FI' if lang.startswith('so') else 'fi_FI'

    insert_after = canon_m.end()
    pieces = []

    if 'og:title' not in content:
        og = (
            f'<meta property="og:type" content="website">'
            f'<meta property="og:locale" content="{locale}">'
            f'<meta property="og:site_name" content="AQOON">'
            f'<meta property="og:title" content="{title}">'
            f'<meta property="og:description" content="{desc}">'
            f'<meta property="og:url" content="{url}">'
            f'<meta property="og:image" content="https://aqoon.live/og.png">'
            f'<meta name="twitter:card" content="summary_large_image">'
            f'<meta name="twitter:title" content="{title}">'
            f'<meta name="twitter:description" content="{desc}">'
        )
        pieces.append(og)
        added_og.append(path)

    if 'application/ld+json' not in content and path not in SKIP_JSONLD:
        data = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": title,
            "description": desc,
            "url": url,
            "inLanguage": lang,
            "isPartOf": {"@type": "WebSite", "name": "AQOON", "url": "https://aqoon.live"}
        }
        pieces.append(f'<script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>')
        added_jsonld.append(path)

    if pieces:
        content = content[:insert_after] + ''.join(pieces) + content[insert_after:]
        open(path, 'w', encoding='utf-8').write(content)

print(f'Added OG+twitter to {len(added_og)} files')
print(f'Added JSON-LD to {len(added_jsonld)} files')
if skipped:
    print(f'Skipped {len(skipped)}: {skipped}')
