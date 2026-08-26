from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://aqoon.live"


class MetaParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.lang = ""
        self.title = ""
        self.in_title = False
        self.description = ""
        self.robots = ""
        self.canonical = ""
        self.h1 = 0

    def handle_starttag(self, tag: str, attrs):
        d = dict(attrs)
        if tag == "html":
            self.lang = (d.get("lang") or "").strip()
        elif tag == "title":
            self.in_title = True
        elif tag == "meta":
            name = (d.get("name") or "").lower()
            if name == "description":
                self.description = (d.get("content") or "").strip()
            elif name == "robots":
                self.robots = (d.get("content") or "").strip().lower()
        elif tag == "link" and (d.get("rel") or "").lower() == "canonical":
            self.canonical = (d.get("href") or "").strip()
        elif tag == "h1":
            self.h1 += 1

    def handle_endtag(self, tag: str):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data: str):
        if self.in_title:
            self.title += data


def file_for_route(path: str) -> Path | None:
    if path == "/":
        p = ROOT / "index.html"
        return p if p.is_file() else None
    rel = path.strip("/")
    p = ROOT / rel
    if p.is_file():
        return p
    if (p / "index.html").is_file():
        return p / "index.html"
    html = ROOT / f"{rel}.html"
    return html if html.is_file() else None


failures: list[str] = []
sitemap = ROOT / "sitemap.xml"
if not sitemap.is_file():
    print("Missing sitemap.xml")
    sys.exit(1)

tree = ET.parse(sitemap)
ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
urls = [(node.text or "").strip() for node in tree.findall(".//sm:loc", ns) if (node.text or "").strip()]

if any(urlsplit(u).path.startswith("/tracker") for u in urls):
    failures.append("Private /tracker route must never appear in sitemap.xml")

for url in urls:
    parsed = urlsplit(url)
    if parsed.scheme != "https" or parsed.netloc != "aqoon.live":
        failures.append(f"Non-canonical sitemap host: {url}")
        continue
    route = parsed.path or "/"
    file = file_for_route(route)
    if file is None:
        failures.append(f"Sitemap route has no source HTML: {url}")
        continue
    parser = MetaParser()
    try:
        parser.feed(file.read_text(encoding="utf-8"))
    except Exception as exc:
        failures.append(f"Cannot parse {file.relative_to(ROOT)}: {exc}")
        continue
    if not parser.lang:
        failures.append(f"Missing html lang: {route}")
    if not parser.title.strip():
        failures.append(f"Missing title: {route}")
    if not parser.description:
        failures.append(f"Missing meta description: {route}")
    if "noindex" in parser.robots:
        failures.append(f"Indexed sitemap page is noindex: {route}")
    if not parser.canonical:
        failures.append(f"Missing canonical: {route}")
    else:
        canon = urlsplit(parser.canonical)
        canon_path = (canon.path or "/").rstrip("/") or "/"
        route_path = route.rstrip("/") or "/"
        if canon.scheme != "https" or canon.netloc != "aqoon.live" or canon_path != route_path:
            failures.append(f"Canonical mismatch: {route} -> {parser.canonical}")
    if parser.h1 != 1:
        failures.append(f"Expected exactly one H1 on {route}, found {parser.h1}")

print(f"Checked SEO metadata for {len(urls)} sitemap pages.")
if failures:
    print("\nSEO metadata QA failed:")
    for item in failures:
        print("-", item)
    sys.exit(1)
print("SEO metadata QA passed.")
