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


required = [
    "index.html",
    "caawi/index.html",
    "so/index.html",
    "tracker/index.html",
    "tracker/app.css",
    "tracker/app.js",
    "robots.txt",
    "sitemap.xml",
    "llms.txt",
    "vercel.json",
]
for path in required:
    require(path)

tracker = (ROOT / "tracker/index.html").read_text(encoding="utf-8")
robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
caawi = (ROOT / "caawi/index.html").read_text(encoding="utf-8")
llms = (ROOT / "llms.txt").read_text(encoding="utf-8")

# Tracker privacy + asset integrity.
for asset in ("/tracker/app.css", "/tracker/app.js"):
    if asset not in tracker:
        fail(f"tracker/index.html does not reference {asset}")
if "noindex" not in tracker.lower() or "nofollow" not in tracker.lower():
    fail("tracker must stay noindex,nofollow")
if "Disallow: /tracker" not in robots:
    fail("robots.txt must disallow /tracker")

# Family intake architecture guardrails.
for endpoint in ("family-intake-contact", "family-intake-submit", "family-funnel-track"):
    if endpoint not in caawi:
        fail(f"caawi is missing expected Edge Function reference: {endpoint}")
for forbidden in ("SUPABASE_SERVICE_ROLE_KEY", "service_role", "SUPABASE_ANON_KEY"):
    if forbidden in caawi:
        fail(f"caawi contains forbidden browser credential marker: {forbidden}")
if 'rel="canonical" href="https://aqoon.live/caawi"' not in caawi:
    fail("caawi canonical URL is missing or changed")
if "index,follow" not in caawi.replace(" ", "").lower():
    fail("caawi should remain index,follow")

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

sitemap_paths = {urlparse(u).path.rstrip("/") or "/" for u in locs if urlparse(u).netloc == "aqoon.live"}


def route_to_file(route):
    if route == "/":
        return ROOT / "index.html"
    return ROOT / route.lstrip("/") / "index.html"

for route in sorted(sitemap_paths):
    p = route_to_file(route)
    if not p.exists():
        fail(f"Sitemap route has no matching page: {route} -> {p.relative_to(ROOT)}")

# Every Somali public page must be discoverable and carry basic crawl/UX metadata.
so_pages = sorted((ROOT / "so").rglob("index.html"))
seen_titles = {}
for p in so_pages:
    rel = p.parent.relative_to(ROOT).as_posix()
    route = "/" + rel
    clean_route = route.rstrip("/")
    if clean_route not in sitemap_paths:
        fail(f"Somali page missing from sitemap: {route}")

    html = p.read_text(encoding="utf-8")
    low = html.lower()
    if not re.search(r'<html[^>]+lang=["\']so(?:-[^"\']+)?["\']', html, re.I):
        fail(f"Somali page missing lang=so: {p.relative_to(ROOT)}")
    title_match = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
    if not title_match or not title_match.group(1).strip():
        fail(f"Somali page missing title: {p.relative_to(ROOT)}")
    else:
        title = re.sub(r"\s+", " ", title_match.group(1)).strip()
        seen_titles.setdefault(title, []).append(clean_route)
    if not re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\'][^"\']{40,}["\']', html, re.I):
        fail(f"Somali page missing useful meta description: {p.relative_to(ROOT)}")
    expected = f"https://aqoon.live{clean_route}"
    canonical = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']', html, re.I)
    if not canonical or canonical.group(1).rstrip("/") != expected.rstrip("/"):
        fail(f"Somali page canonical mismatch: {p.relative_to(ROOT)} expected {expected}")
    if "noindex" in low:
        fail(f"Public Somali page is noindex: {p.relative_to(ROOT)}")
    if clean_route != "/so" and 'href="/caawi"' not in html and "href='/caawi'" not in html:
        warn(f"Somali topic page has no direct /caawi help CTA: {p.relative_to(ROOT)}")

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

print(f"AQOON site QA passed. Checked {len(sitemap_paths)} sitemap routes and {len(so_pages)} Somali topic pages.")
