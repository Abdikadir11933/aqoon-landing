from pathlib import Path
from urllib.parse import urlparse
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
errors = []
warnings = []


def fail(message):
    errors.append(message)


def warn(message):
    warnings.append(message)


def require(path):
    p = ROOT / path
    if not p.exists():
        fail(f"Missing required file: {path}")
    return p


def meta_content(html, name):
    patterns = [
        rf'<meta[^>]*name="{re.escape(name)}"[^>]*content="([^"]*)"',
        rf"<meta[^>]*name='{re.escape(name)}'[^>]*content='([^']*)'",
        rf'<meta[^>]*content="([^"]*)"[^>]*name="{re.escape(name)}"',
        rf"<meta[^>]*content='([^']*)'[^>]*name='{re.escape(name)}'",
    ]
    for pattern in patterns:
        m = re.search(pattern, html, re.I | re.S)
        if m:
            return re.sub(r"\s+", " ", m.group(1)).strip()
    return None


required = [
    "index.html", "caawi/index.html", "caawi/app.css", "caawi/app.js",
    "caawi/xog/index.html", "tracker/index.html", "tracker/app.css", "tracker/app.js",
    "tests/caawi.test.js", "robots.txt", "sitemap.xml", "llms.txt", "vercel.json",
]
for path in required:
    require(path)

tracker = (ROOT / "tracker/index.html").read_text(encoding="utf-8")
robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
caawi = (ROOT / "caawi/index.html").read_text(encoding="utf-8")
caawi_js = (ROOT / "caawi/app.js").read_text(encoding="utf-8")
llms = (ROOT / "llms.txt").read_text(encoding="utf-8")

# Tracker privacy + asset integrity. CSS is generated into bundle.css;
# JavaScript is deliberately loaded as explicit ordered files so deployed
# behavior is directly auditable and cannot drift behind a stale JS bundle.
if "/tracker/bundle.css" not in tracker:
    fail("tracker/index.html does not reference /tracker/bundle.css")
if "/tracker/bundle.js" in tracker:
    fail("tracker/index.html should not load legacy /tracker/bundle.js")
if "noindex" not in tracker.lower() or "nofollow" not in tracker.lower():
    fail("tracker must stay noindex,nofollow")
if "Disallow: /tracker" not in robots:
    fail("robots.txt must disallow /tracker")

# Family intake architecture guardrails.
for asset in ("/caawi/app.css", "/caawi/app.js"):
    if asset not in caawi:
        fail(f"caawi/index.html does not reference {asset}")
if re.search(r"<style(?:\s|>)", caawi, re.I):
    fail("caawi styles should stay in caawi/app.css, not inline")
if re.search(r'<script(?![^>]*\bsrc=)(?![^>]*type="application/ld\+json")[^>]*>', caawi, re.I):
    fail("caawi application JavaScript should stay in caawi/app.js, not inline")
for endpoint in ("family-intake-contact", "family-intake-submit", "family-funnel-track"):
    if endpoint not in caawi_js:
        fail(f"caawi/app.js is missing expected Edge Function reference: {endpoint}")
for forbidden in ("SUPABASE_SERVICE_ROLE_KEY", "service_role", "SUPABASE_ANON_KEY"):
    if forbidden in caawi or forbidden in caawi_js:
        fail(f"caawi browser code contains forbidden credential marker: {forbidden}")

# Tracker browser code must never carry the service-role credential.
for js_path in sorted((ROOT / "tracker").glob("*.js")):
    js_text = js_path.read_text(encoding="utf-8")
    for forbidden in ("SUPABASE_SERVICE_ROLE_KEY", "service_role"):
        if forbidden in js_text:
            fail(f"tracker/{js_path.name} contains forbidden credential marker: {forbidden}")
if 'rel="canonical" href="https://aqoon.live/caawi"' not in caawi:
    fail("caawi canonical URL is missing or changed")
if "index,follow" not in caawi.replace(" ", "").lower():
    fail("caawi should remain index,follow")
if "caawi_seo" not in caawi_js:
    fail("caawi/app.js is missing same-site Caawi SEO attribution")

# Sitemap: unique, local routes resolve to real files, tracker excluded.
try:
    tree = ET.parse(ROOT / "sitemap.xml")
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    locs = [n.text.strip() for n in tree.findall("sm:url/sm:loc", ns) if n.text]
except Exception as exc:
    locs = []
    fail(f"sitemap.xml could not be parsed: {exc}")

if len(locs) != len(set(locs)):
    fail("sitemap.xml contains duplicate URLs")
if any(urlparse(u).path.startswith("/tracker") for u in locs):
    fail("tracker must never appear in sitemap.xml")
if any(urlparse(u).path == "/so" or urlparse(u).path.startswith("/so/") for u in locs):
    fail("legacy /so routes must never appear in sitemap.xml")

sitemap_paths = {urlparse(u).path.rstrip("/") or "/" for u in locs if urlparse(u).netloc == "aqoon.live"}


def route_to_file(route):
    if route == "/":
        return ROOT / "index.html"
    return ROOT / route.lstrip("/") / "index.html"

for route in sorted(sitemap_paths):
    p = route_to_file(route)
    if not p.exists():
        fail(f"Sitemap route has no matching page: {route} -> {p.relative_to(ROOT)}")

# Every Caawi family page must be discoverable and carry basic crawl/UX metadata.
caawi_pages = sorted((ROOT / "caawi").rglob("index.html"))
seen_titles = {}
for p in caawi_pages:
    rel = p.parent.relative_to(ROOT).as_posix()
    route = "/" + rel
    clean_route = route.rstrip("/")
    if clean_route not in sitemap_paths:
        fail(f"Caawi page missing from sitemap: {route}")

    html = p.read_text(encoding="utf-8")
    low = html.lower()
    if not re.search(r'<html[^>]+lang=["\']so(?:-[^"\']+)?["\']', html, re.I):
        fail(f"Caawi page missing lang=so: {p.relative_to(ROOT)}")
    title_match = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
    if not title_match or not title_match.group(1).strip():
        fail(f"Caawi page missing title: {p.relative_to(ROOT)}")
    else:
        title = re.sub(r"\s+", " ", title_match.group(1)).strip()
        seen_titles.setdefault(title, []).append(clean_route)
    description = meta_content(html, "description")
    if not description or len(description) < 40:
        fail(f"Caawi page missing useful meta description: {p.relative_to(ROOT)}")
    expected = f"https://aqoon.live{clean_route}"
    canonical = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']', html, re.I)
    if not canonical or canonical.group(1).rstrip("/") != expected.rstrip("/"):
        fail(f"Caawi page canonical mismatch: {p.relative_to(ROOT)} expected {expected}")
    if "noindex" in low:
        fail(f"Public Caawi page is noindex: {p.relative_to(ROOT)}")
    if clean_route != "/caawi" and 'href="/caawi"' not in html and "href='/caawi'" not in html:
        warn(f"Caawi topic page has no direct /caawi help CTA: {p.relative_to(ROOT)}")

for title, routes in seen_titles.items():
    if len(routes) > 1:
        warn(f"Duplicate Somali title '{title}' on: {', '.join(routes)}")

# llms.txt canonical AQOON URLs should point to known crawlable pages (except sitemap itself).
for url in re.findall(r"https://aqoon\.live[^\s)]+", llms):
    url = url.rstrip(".,;:")
    path = urlparse(url).path.rstrip("/") or "/"
    if path in {"/sitemap.xml"}:
        continue
    if path not in sitemap_paths:
        fail(f"llms.txt references AQOON URL not present in sitemap: {path}")

if warnings:
    print("AQOON site QA warnings:\n")
    for w in warnings:
        print(f"- {w}")
    print()

if errors:
    print("AQOON site QA failed:\n")
    for e in errors:
        print(f"- {e}")
    sys.exit(1)

print(f"AQOON site QA passed. Checked {len(sitemap_paths)} sitemap routes and {len(caawi_pages)} Caawi family pages.")
