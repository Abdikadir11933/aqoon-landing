from pathlib import Path
import re
from html import unescape

ROOT = Path(__file__).resolve().parents[1]
SUSPECT = re.compile(r"\b(official|programme|programmes|deadline|route|resource|resources|eligibility|benefit|application|registration|openings?|jobseeker|jobs|support|current|random|quality check|workshops?)\b", re.I)
# Finnish sentence fragments are useful as official names/terms, but long runs should be reviewed.
FI_WORD = re.compile(r"\b(?:maahanmuutt\w*|maahan muuttane\w*|työnhakij\w*|koulut\w*|palvelu\w*|suomen\s+kielt\w*|työelämä\w*|opinto\w*|hakem\w*|haku\w*|tuke\w*|voi\w*|jossa|joilla|joissain|myös|muille|kuin|kautta|tarkoitettu|maksuton|vuotiaille)\b", re.I)


def visible_text(raw: str) -> str:
    raw = re.sub(r"<script\b[^>]*>.*?</script>", " ", raw, flags=re.I|re.S)
    raw = re.sub(r"<style\b[^>]*>.*?</style>", " ", raw, flags=re.I|re.S)
    raw = re.sub(r"<[^>]+>", " ", raw)
    raw = unescape(raw)
    return re.sub(r"\s+", " ", raw)

hits = []
for p in sorted((ROOT / "so").rglob("index.html")):
    rel = p.relative_to(ROOT).as_posix()
    if "/pilke/" in rel or rel.startswith("pilke/"):
        continue
    text = visible_text(p.read_text(encoding="utf-8"))
    for m in SUSPECT.finditer(text):
        a=max(0,m.start()-70); b=min(len(text),m.end()+100)
        hits.append((rel,"EN",text[a:b]))
    fi=list(FI_WORD.finditer(text))
    # Report pages with at least 3 Finnish grammatical words; isolated service terms are expected.
    if len(fi) >= 3:
        for m in fi[:8]:
            a=max(0,m.start()-70); b=min(len(text),m.end()+110)
            hits.append((rel,"FI",text[a:b]))

print(f"Somali language QA review candidates: {len(hits)}")
for rel,kind,frag in hits:
    print(f"[{kind}] {rel}: {frag}")
