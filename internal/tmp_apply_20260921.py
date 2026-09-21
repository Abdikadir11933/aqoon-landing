from pathlib import Path

PAGE = Path("caawi/ajankohtaiset/index.html")
REGISTRY = Path("internal/open-programmes.md")

page = PAGE.read_text(encoding="utf-8")
registry = REGISTRY.read_text(encoding="utf-8")

# Remove the duplicate Career Bootcamp card introduced by today's refresh.
heading = "<h3>Career Bootcamp – Espoo Talent Hub</h3>"
pos = page.find(heading)
if pos < 0:
    raise RuntimeError("duplicate Career Bootcamp public card not found")
start = page.rfind('<article class="card">', 0, pos)
end = page.find("</article>", pos)
if start < 0 or end < 0:
    raise RuntimeError("Career Bootcamp public card boundaries not found")
end += len("</article>")
if end < len(page) and page[end] == "\n":
    end += 1
page = page[:start] + page[end:]

# Remove only the duplicate registry block added today; preserve the pre-existing canonical Career Bootcamp entry.
block_start = registry.find("- **Career Bootcamp — 29.9.2026** — Espoo Talent Hub\n")
block_end = registry.find("- **Vauvamuskari / Baby music group — autumn 2026** — City of Espoo\n", block_start)
if block_start < 0 or block_end < 0:
    raise RuntimeError("duplicate Career Bootcamp registry block boundaries not found")
registry = registry[:block_start] + registry[block_end:]

# Sanity checks: exactly one canonical public and registry Career Bootcamp remain.
if page.count("<h3>Career Bootcamp</h3>") != 1:
    raise RuntimeError("canonical public Career Bootcamp count is not one")
if "Career Bootcamp – Espoo Talent Hub" in page:
    raise RuntimeError("duplicate public Career Bootcamp still present")
if registry.count("- **Career Bootcamp** — Espoo Talent Hub / City of Espoo") != 1:
    raise RuntimeError("canonical registry Career Bootcamp count is not one")
if "- **Career Bootcamp — 29.9.2026** — Espoo Talent Hub" in registry:
    raise RuntimeError("duplicate registry Career Bootcamp still present")

PAGE.write_text(page, encoding="utf-8")
REGISTRY.write_text(registry, encoding="utf-8")
print("Removed duplicate Career Bootcamp only; preserved canonical existing entry.")
