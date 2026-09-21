from pathlib import Path

PAGE = Path("caawi/ajankohtaiset/index.html")
REGISTRY = Path("internal/open-programmes.md")

page = PAGE.read_text(encoding="utf-8")
registry = REGISTRY.read_text(encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one match, found {count}")
    return text.replace(old, new, 1)


def article_bounds(text: str, heading: str) -> tuple[int, int]:
    needle = f"<h3>{heading}</h3>"
    pos = text.find(needle)
    if pos < 0:
        raise RuntimeError(f"Article heading not found: {heading}")
    start = text.rfind('<article class="card">', 0, pos)
    if start < 0:
        raise RuntimeError(f"Article start not found: {heading}")
    end = text.find("</article>", pos)
    if end < 0:
        raise RuntimeError(f"Article end not found: {heading}")
    end += len("</article>")
    if end < len(text) and text[end] == "\n":
        end += 1
    return start, end


def insert_before_article(text: str, heading: str, block: str) -> str:
    start, _ = article_bounds(text, heading)
    return text[:start] + block + text[start:]


# Public freshness marker.
page = replace_once(
    page,
    "La xaqiijiyey 20.9.2026.",
    "La xaqiijiyey 21.9.2026.",
    "public verification date",
)

# Remove the now-passed Helsinki/Caisa one-day event from current family listings.
start, end = article_bounds(page, "Kolibrí Festival Family Day – Caisa")
page = page[:start] + page[end:]

# Add a current Espoo career event relevant to highly educated jobseekers.
career_card = (
    '<article class="card"><div class="meta urgent">Espoo · 29.9.2026 saacadaha 9–16 · highly educated professionals · English · bilaash · isdiiwaangelin</div>'
    '<h3>Career Bootcamp – Espoo Talent Hub</h3>'
    '<p>Career Bootcamp waa maalin hal maalin ah oo loogu talagalay highly educated professionals doonaya inay horumariyaan jidkooda shaqo. Waxaa jira service fair, networking iyo workshops; dhacdaduna English ayay ku baxaysaa. Goobta: Technopolis Innopoli 2, Tekniikantie 14, Espoo. Gelitaanku waa bilaash, isdiiwaangelinna bogga rasmiga ah ayaa laga sameeyaa. Barnaamijku wuu is beddeli karaa, ka qaybgalka na shaqo ama wareysi ma dammaanad qaadayo.</p>'
    '<a href="https://www.espoo.fi/en/events/espooevents%3Aagp7vb2gqu">Espoo, rasmi & isdiiwaangelin ↗</a></article>\n'
)
page = insert_before_article(page, "Työnantaja Meet & Greet", career_card)

# Add two durable, newly verified Espoo family/youth opportunities.
baby_music_card = (
    '<article class="card"><div class="meta urgent">Espoo · 3 bilood–3 sano · 22.9., 30.9. & 6.10.2026 · bilaash · isdiiwaangelin</div>'
    '<h3>Vauvamuskari / Baby music group – Espoo</h3>'
    '<p>Qoysaska leh ilmo 3 bilood–3 sano jir ah waxay ka qayb geli karaan vauvamuskari bilaash ah: 22.9. saacadaha 11–11.30 Kauklahti Library, 30.9. saacadaha 10.30–11 Iso Omena Library (VOX) iyo 6.10. saacadaha 11–11.30 Sello Library (Jaminurkka). Isdiiwaangelin hore ayaa loo baahan yahay. Afka dhacdadu waa Finnish, laakiin Espoo waxay sheegaysaa in qof walba la soo dhaweynayo iyadoon aqoonta luqadda ama khibradda muusiggu caqabad ahayn.</p>'
    '<a href="https://www.espoo.fi/en/events/espooevents%3Aagp7ljerbq">Espoo, rasmi & isdiiwaangelin ↗</a></article>\n'
)

esports_card = (
    '<article class="card"><div class="meta urgent">Espoo · yläkoululaiset · 10.9.–11.12.2026 · bilaash · isdiiwaangelin</div>'
    '<h3>E-urheilun harrastuspolku – Espoo</h3>'
    '<p>Espoo waxay dayrtan leedahay kooxo eSports oo bilaash ah ardayda yläkoulu / dugsiga dhexe. Fursadaha rasmiga ah waxaa ka mid ah Star Stable online Discord Khamiis 17–18, Counter-Strike 2 Otahalli Talaado 16.30–18.30, Fortnite junior tournaments Khamiista koowaad ee bisha 18–21, gaming evenings gabdhaha Khamiista labaad 18–21, family gaming evenings Talaadooyin isdhaaf ah 18.30–20.30 iyo community evenings laba jeer bishii. Dhammaan kooxaha la sheegay waxay socdaan 10.9.–11.12.; faahfaahinta iyo isdiiwaangelinta waxaa laga hubiyaa Hobby Search-ka Espoo, sababtoo ah boosaska kooxuhu way is beddeli karaan.</p>'
    '<a href="https://www.espoo.fi/en/culture-and-leisure/espoo-hobby-path/esports-hobby-path-project-espoo">Espoo, rasmi & kooxaha ↗</a></article>\n'
)
page = insert_before_article(page, "Minecraft seikkailijat – Espoon harrastuspolku", baby_music_card + esports_card)

# Internal registry freshness marker.
registry = replace_once(
    registry,
    "Last compiled: 20.9.2026",
    "Last compiled: 21.9.2026",
    "registry compilation date",
)

# Keep the passed Caisa event as historical registry knowledge, but stop treating it as current.
registry = replace_once(
    registry,
    "  - Status: Sunday 20.9.2026, 11.00–17.00, Cultural Centre Caisa, Kaikukatu 4; free entry and no registration required.",
    "  - Status: **passed/closed** — the one-day event took place Sunday 20.9.2026, 11.00–17.00, Cultural Centre Caisa, Kaikukatu 4; free entry and no registration was required. Removed from the current family-facing page on 21.9.2026.",
    "Caisa passed status",
)

# Add new verified Espoo routes at the top of the Espoo section.
espoo_anchor = "### Espoo\n\n"
if registry.count(espoo_anchor) != 1:
    raise RuntimeError(f"Espoo registry anchor expected once, found {registry.count(espoo_anchor)}")

new_registry = """- **Career Bootcamp — 29.9.2026** — Espoo Talent Hub
  - Fits: highly educated professionals who want career-development support and professional networking; the official event is in English and does not state an Espoo-residency restriction.
  - Helps with: career development, meeting service providers, networking and a workshop programme.
  - Status: Tuesday 29.9.2026, 09.00–16.00, Technopolis Innopoli 2, Tekniikantie 14, Espoo; free. Registration is available through the official event route. The published programme is subject to change.
  - Caution: do not promise a vacancy, interview or selection; this is a career-development event.
  - Official: https://www.espoo.fi/en/events/espooevents%3Aagp7vb2gqu
  - Checked: 21.9.2026.
  - Public family page: yes, work/career section.

- **Vauvamuskari / Baby music group — autumn 2026** — City of Espoo
  - Fits: families with children aged 3 months–3 years.
  - Helps with: low-threshold shared music, singing, instruments and musical games for a child and parent/guardian; no previous music experience is needed.
  - Upcoming sessions checked 21.9.: 22.9. 11.00–11.30 Kauklahti Library; 30.9. 10.30–11.00 Iso Omena Library (VOX); 6.10. 11.00–11.30 Sello Library (Jaminurkka).
  - Cost / registration: free; advance registration is required through the official sign-up route.
  - Language/access: event language Finnish. Espoo explicitly says everyone is welcome regardless of language skills or musical background.
  - Status: upcoming; re-check capacity before promising a place.
  - Official: https://www.espoo.fi/en/events/espooevents%3Aagp7ljerbq
  - Checked: 21.9.2026.
  - Public family page: yes.

- **E-urheilun harrastuspolku — autumn 2026** — City of Espoo
  - Fits: secondary-school pupils / yläkoululaiset interested in a free esports hobby.
  - Helps with: free organised gaming activities through Espoo's esports hobby path.
  - Status: the current autumn activities run 10.9.–11.12.2026. Published options include Star Stable online via Discord Thursdays 17.00–18.00; Counter-Strike 2 at Otahalli Tuesdays 16.30–18.30; Fortnite junior tournaments at Otahalli on the first Thursday of each month 18.00–21.00; girls' gaming evenings on the second Thursday 18.00–21.00; family gaming evenings on alternating Tuesdays 18.30–20.30; and esports community evenings twice a month on a Friday or Saturday 18.00–21.00.
  - Cost / registration: every listed activity is free; group details and registration are through Espoo's Hobby Search service. Re-check capacity before promising a place.
  - Official: https://www.espoo.fi/en/culture-and-leisure/espoo-hobby-path/esports-hobby-path-project-espoo
  - Checked: 21.9.2026.
  - Public family page: yes.

"""
registry = registry.replace(espoo_anchor, espoo_anchor + new_registry, 1)

# Scope guard: these are the only files this script is allowed to write.
if "Pilke" in str(PAGE) or "Pilke" in str(REGISTRY):
    raise RuntimeError("Pilke path unexpectedly selected")

PAGE.write_text(page, encoding="utf-8")
REGISTRY.write_text(registry, encoding="utf-8")

print("Updated:", PAGE)
print("Updated:", REGISTRY)
# Trigger the corrected owner-authorized temporary workflow.
