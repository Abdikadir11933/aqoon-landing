from __future__ import annotations

import json
import re
import sys
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []


def fail(message: str) -> None:
    errors.append(message)


def require(path: str) -> Path:
    p = ROOT / path
    if not p.exists():
        fail(f"Missing required path: {path}")
    return p


required = [
    "CLAUDE.md",
    "CONTEXT.md",
    "AGENTS.md",
    "BRAND.md",
    "docs/architecture/repo-map.md",
    "seo/CONTEXT.md",
    "scripts/site_qa.py",
    "scripts/check_seo_metadata.py",
    "tracker/index.html",
    "tracker/multineed-adapter.js",
    "tracker/scenario-learning.js",
    "robots.txt",
    "sitemap.xml",
    "vercel.json",
]
for path in required:
    require(path)

claude = (ROOT / "CLAUDE.md").read_text(encoding="utf-8")
if len(claude.splitlines()) > 200:
    fail("Root CLAUDE.md should stay under 200 lines; route detail into local contexts/skills")
for marker in ("Session bootstrap", "CONTEXT.md", ".claude/skills", "docs/architecture/repo-map.md"):
    if marker not in claude:
        fail(f"Root CLAUDE.md missing routing/bootstrap marker: {marker}")

agents = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
for marker in ("CLAUDE.md", "CONTEXT.md", "compatibility router"):
    if marker not in agents:
        fail(f"AGENTS.md should be a compatibility router and reference {marker}")

skills_root = ROOT / ".claude" / "skills"
expected_skills = {
    "session-bootstrap",
    "repository-auditing",
    "seo-growth",
    "family-research",
    "production-releasing",
}
for name in expected_skills:
    skill = skills_root / name / "SKILL.md"
    if not skill.is_file():
        fail(f"Missing required Claude skill: {name}")
        continue
    text = skill.read_text(encoding="utf-8")
    if len(text.splitlines()) > 500:
        fail(f"Skill is too large for progressive disclosure: {name}")
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        fail(f"Skill missing YAML frontmatter: {name}")
        continue
    front = m.group(1)
    nm = re.search(r"^name:\s*(.+?)\s*$", front, re.M)
    desc = re.search(r"^description:\s*(.+?)\s*$", front, re.M)
    if not nm or nm.group(1).strip() != name:
        fail(f"Skill name must match folder: {name}")
    if not re.fullmatch(r"[a-z0-9-]{1,64}", name):
        fail(f"Invalid skill folder/name: {name}")
    if not desc or not desc.group(1).strip():
        fail(f"Skill description missing: {name}")

for forbidden in (".env", "CLAUDE.local.md", ".claude/settings.local.json"):
    if (ROOT / forbidden).exists():
        fail(f"Local/private file must not be tracked: {forbidden}")

# Browser credential guard outside protected legacy Pilke pages.
for top in ("assets", "caawi", "tracker"):
    for p in (ROOT / top).rglob("*"):
        if not p.is_file() or p.suffix.lower() not in {".js", ".html"}:
            continue
        text = p.read_text(encoding="utf-8", errors="ignore")
        if re.search(r"SUPABASE_SERVICE_ROLE_KEY\s*[=:]", text):
            fail(f"Browser code contains service-role credential marker: {p.relative_to(ROOT)}")

tracker = (ROOT / "tracker/index.html").read_text(encoding="utf-8")
for asset in (
    "/tracker/multineed-adapter.js",
    "/tracker/scenario-learning.js",
    "/tracker/app.js",
    "/tracker/visual-v3.js",
    "/tracker/crm-reactive.js",
):
    if asset not in tracker:
        fail(f"tracker/index.html missing required script: {asset}")
adapter = (ROOT / "tracker/multineed-adapter.js").read_text(encoding="utf-8")
if "scenario-learning.js" in adapter:
    fail("scenario-learning.js should load directly from tracker/index.html, not be dynamically injected by the adapter")

robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
if "Disallow: /tracker" not in robots:
    fail("robots.txt must disallow /tracker")
if "noindex" not in tracker.lower() or "nofollow" not in tracker.lower():
    fail("tracker must remain noindex,nofollow")

for json_path in ("vercel.json", "seo/verified-links.json"):
    try:
        json.loads((ROOT / json_path).read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"Invalid JSON in {json_path}: {exc}")

try:
    ET.parse(ROOT / "sitemap.xml")
except Exception as exc:
    fail(f"Invalid sitemap.xml: {exc}")

try:
    links = json.loads((ROOT / "seo/verified-links.json").read_text(encoding="utf-8")).get("links", [])
    ids = [x.get("id") for x in links]
    urls = [x.get("url") for x in links]
    if len(ids) != len(set(ids)):
        fail("seo/verified-links.json contains duplicate ids")
    if len(urls) != len(set(urls)):
        fail("seo/verified-links.json contains duplicate URLs")
    for item in links:
        url = str(item.get("url") or "")
        if not url.startswith("https://"):
            fail(f"Curated SEO link should use HTTPS: {item.get('id')} -> {url}")
except Exception:
    pass

if errors:
    print("AQOON repository integrity QA failed:\n")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print(f"AQOON repository integrity QA passed. Validated {len(expected_skills)} skills and core architecture guards.")
