from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE_PARTS = {"design-ref", "internal", ".git"}
errors = []
warnings = []
checked = 0

for path in ROOT.rglob("*.html"):
    rel = path.relative_to(ROOT).as_posix()
    if any(part in EXCLUDE_PARTS for part in path.parts):
        continue
    # Protected Pilke pages are intentionally not modified, but still get basic viewport checks.
    text = path.read_text(encoding="utf-8", errors="replace")
    checked += 1

    if not re.search(r'<meta[^>]+name=["\']viewport["\']', text, re.I):
        errors.append(f"{rel}: missing viewport meta")
    viewport = re.search(r'<meta[^>]+name=["\']viewport["\'][^>]+content=["\']([^"\']+)', text, re.I)
    if viewport:
        content = viewport.group(1).lower()
        if "user-scalable=no" in content or re.search(r"maximum-scale\s*=\s*1(?:\.0)?(?:,|$)", content):
            errors.append(f"{rel}: viewport blocks user zoom")

    lang = re.search(r'<html[^>]*\blang=["\']([^"\']+)', text, re.I)
    if rel == "so/index.html" or rel.startswith("so/"):
        if not lang or not lang.group(1).lower().startswith("so"):
            errors.append(f"{rel}: Somali route missing lang=so")

    # Form controls should have either an associated label, aria-label or aria-labelledby.
    ids_with_labels = set(re.findall(r'<label[^>]+for=["\']([^"\']+)', text, re.I))
    for tag, attrs in re.findall(r'<(input|select|textarea)\b([^>]*)>', text, re.I):
        if re.search(r'type=["\']hidden["\']', attrs, re.I) or "aria-hidden=\"true\"" in attrs or "aria-hidden='true'" in attrs:
            continue
        field_id = re.search(r'\bid=["\']([^"\']+)', attrs, re.I)
        named = re.search(r'\baria-label(?:ledby)?=["\'][^"\']+["\']', attrs, re.I)
        if field_id and field_id.group(1) in ids_with_labels:
            continue
        if named:
            continue
        # Login/search controls may use a meaningful placeholder; warn instead of failing.
        if re.search(r'\bplaceholder=["\'][^"\']+["\']', attrs, re.I):
            warnings.append(f"{rel}: {tag} relies on placeholder instead of explicit label")
        else:
            warnings.append(f"{rel}: {tag} may lack an accessible label")

    # Empty icon-only controls require an accessible name.
    for attrs, inner in re.findall(r'<button\b([^>]*)>(.*?)</button>', text, re.I | re.S):
        plain = re.sub(r'<[^>]+>', '', inner).strip()
        if not plain and not re.search(r'\baria-label=["\'][^"\']+', attrs, re.I):
            errors.append(f"{rel}: empty button missing aria-label")

    # Input font-size below 16px on mobile can trigger iOS zoom. This heuristic catches direct declarations.
    for css in re.findall(r'<style[^>]*>(.*?)</style>', text, re.I | re.S):
        for selector, body in re.findall(r'([^{}]+)\{([^{}]+)\}', css):
            if re.search(r'(^|,)\s*(input|select|textarea)(?:\b|[.#:\[])', selector.strip(), re.I):
                m = re.search(r'font-size\s*:\s*([0-9.]+)px', body, re.I)
                if m and float(m.group(1)) < 16:
                    warnings.append(f"{rel}: form control font-size {m.group(1)}px may trigger mobile zoom")

print(f"Usability QA checked {checked} HTML files")
if warnings:
    print("\nWarnings:")
    for item in sorted(set(warnings)):
        print(" -", item)
if errors:
    print("\nErrors:")
    for item in sorted(set(errors)):
        print(" -", item)
    sys.exit(1)
print("\nUsability QA passed")
