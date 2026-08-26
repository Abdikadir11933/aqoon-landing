from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
HOSTS = {"aqoon.live", "www.aqoon.live"}


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []

    def handle_starttag(self, tag: str, attrs):
        attrs = dict(attrs)
        if tag in {"a", "link"} and attrs.get("href"):
            self.links.append(attrs["href"].strip())


def route_exists(path: str) -> bool:
    path = path.split("?", 1)[0].split("#", 1)[0]
    if not path or path == "/":
        return (ROOT / "index.html").is_file()
    if not path.startswith("/"):
        return True
    rel = path.lstrip("/").rstrip("/")
    if not rel:
        return (ROOT / "index.html").is_file()
    direct = ROOT / rel
    if direct.is_file():
        return True
    if direct.suffix == ".html":
        return direct.is_file()
    if (direct / "index.html").is_file():
        return True
    if (ROOT / f"{rel}.html").is_file():
        return True
    return False


def normalize_internal(href: str) -> str | None:
    if not href or href.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return None
    u = urlsplit(href)
    if u.scheme in {"http", "https"}:
        if u.hostname not in HOSTS:
            return None
        return u.path or "/"
    if href.startswith("/"):
        return u.path or "/"
    return None


failures: list[str] = []
html_files = sorted(ROOT.rglob("*.html"))
checked_links = 0

for file in html_files:
    parser = LinkParser()
    try:
        parser.feed(file.read_text(encoding="utf-8"))
    except Exception as exc:
        failures.append(f"PARSE {file.relative_to(ROOT)}: {exc}")
        continue
    for href in parser.links:
        path = normalize_internal(href)
        if path is None:
            continue
        checked_links += 1
        if not route_exists(path):
            failures.append(f"BROKEN INTERNAL {file.relative_to(ROOT)} -> {href}")

sitemap = ROOT / "sitemap.xml"
checked_sitemap = 0
if sitemap.is_file():
    try:
        tree = ET.parse(sitemap)
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        for loc in tree.findall(".//sm:loc", ns):
            value = (loc.text or "").strip()
            if not value:
                continue
            u = urlsplit(value)
            if u.hostname not in HOSTS:
                failures.append(f"SITEMAP EXTERNAL HOST {value}")
                continue
            checked_sitemap += 1
            if not route_exists(u.path or "/"):
                failures.append(f"BROKEN SITEMAP ROUTE {value}")
    except Exception as exc:
        failures.append(f"SITEMAP PARSE: {exc}")
else:
    failures.append("MISSING sitemap.xml")

print(f"Checked {len(html_files)} HTML files, {checked_links} internal links and {checked_sitemap} sitemap routes.")
if failures:
    print("\nInternal route QA failed:")
    for item in failures:
        print("-", item)
    sys.exit(1)
print("Internal route and sitemap QA passed.")
