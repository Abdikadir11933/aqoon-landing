"""Validate the public live-fact registry and render generated HTML snippets."""
from datetime import date
from html import escape
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "seo" / "live-facts.json"
OUTPUT = ROOT / "seo" / "generated" / "live-facts.html"

def main():
    data = json.loads(REGISTRY.read_text(encoding="utf-8"))
    records = data.get("records", [])
    if not records:
        raise SystemExit("live-facts.json has no records")
    seen = set()
    chunks = []
    today = date.today().isoformat()
    for rec in records:
        key = rec.get("key")
        required = ["key", "title", "summary", "source_url", "source_label", "volatility", "last_verified_at", "recheck_after", "status", "routes"]
        missing = [field for field in required if field not in rec]
        if missing or key in seen:
            raise SystemExit(f"invalid live-fact record {key}: missing={missing} duplicate={key in seen}")
        seen.add(key)
        stale = today > rec["recheck_after"] or rec["status"] != "verified"
        state = "needs-reverification" if stale else "verified"
        warning = '<p class="fact-status needs-reverification">Needs reverification before relying on this fact.</p>' if stale else ''
        chunks.append(
            f'<!-- live-fact:{escape(key)} -->\n'
            f'<article class="now live-fact {state}" data-fact-key="{escape(key)}">'
            f'<strong>{escape(rec["title"])}</strong>'
            f'<p>{escape(rec["summary"])}</p>'
            f'{warning}<a href="{escape(rec["source_url"])}">Source ({escape(rec["source_label"] )}) ↗</a>'
            f'</article>'
        )
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text('<meta name="viewport" content="width=device-width, initial-scale=1">\n' + "\n".join(chunks) + "\n", encoding="utf-8")
    referenced = set()
    for page in (ROOT / "so").rglob("index.html"):
        if "pilke" in page.parts or "tracker" in page.parts:
            continue
        referenced.update(re.findall(r'data-live-fact-key="([^"]+)"', page.read_text(encoding="utf-8")))
    unknown = referenced - seen
    if unknown:
        raise SystemExit(f"pages reference unknown live facts: {sorted(unknown)}")
    print(f"Referenced by {len(referenced)} page fact keys")
    print(f"Validated {len(records)} live facts and wrote {OUTPUT.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
