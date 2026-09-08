from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected 1 exact match, found {count}")
    return text.replace(old, new, 1)


# Family-facing Somali page: preserve layout and official programme names while
# correcting current dates and adding only primary-source-verified opportunities.
public_path = Path("caawi/ajankohtaiset/index.html")
public = public_path.read_text(encoding="utf-8")

public = replace_once(
    public,
    "Espoo & Kauniainen · 15–29 jir · Talaado kasta 15–18 laga bilaabo 8.9. · bilaash",
    "Espoo & Kauniainen · 15–29 jir · Talaado kasta 15–18 · 8.9.–24.11.2026 · bilaash",
    "Starttipiste date range",
)
public = replace_once(
    public,
    "Adeeggu wuxuu Lippulaiva Library ka bilaabmaa 8.9.2026, wuxuuna dhacaa Talaado kasta 15–18. Ajanvaraus looma baahna; luqadaha la sheegay waa Finnish, Swedish iyo English.",
    "Adeeggu wuxuu Lippulaiva Library ka socdaa 8.9.–24.11.2026, Talaado kasta 15–18. Ajanvaraus looma baahna; luqadaha la sheegay waa Finnish, Swedish iyo English.",
    "Starttipiste description",
)
public = replace_once(
    public,
    "https://www.espoo.fi/en/events/espooevents%3Aagpqhf4slq",
    "https://www.espoo.fi/en/events/espooevents%3Aagpqhf4miu",
    "Starttipiste series link",
)

new_family_cards = '''<article class="card"><div class="meta urgent">Espoo · Kannusillankatu 8 · 8.9.–8.12.2026 · bilaash · Finnish/Swedish/English</div><h3>Mobile Espoo Info – Kohtaamispaikka Askel</h3><p>La-taliyayaasha Espoo Info waxay bixiyaan talo ku saabsan adeegyada dadweynaha, adeegyada la-hawlgalayaasha sida HSL, Kela iyo Länsi-Uusimaa, iyo caawimaad digital ah oo ku saabsan isticmaalka adeegyada online-ka. Taxanaha hadda jira wuxuu socdaa 8.9.–8.12.2026; bogga rasmiga ahi wuxuu hadda muujinayaa booqashooyinka 8.9., 6.10. iyo 10.11. saacadaha 10–11. Ka hubi bogga rasmiga ah taariikhda xigta ka hor intaadan tegin.</p><a href="https://www.espoo.fi/en/events/espooevents%3Aagqhvp6tem">Espoo, rasmi ↗</a></article>
<article class="card"><div class="meta">Espoo · Entresse · Talaado kasta 16–17.30 · ilaa 15.12.2026 · bilaash · Finnish/English/Arabic</div><h3>Workshop for Families – Entressen kirjasto</h3><p>Qoysaska da' kasta leh waxay Entresse Library Paja ku samayn karaan farshaxan iyo farsamo gacmeed wadajir ah. Kooxdu waxay socotaa Talaado kasta 4.8.–15.12.2026 saacadaha 16–17.30. Gelitaanku waa bilaash, isdiiwaangelinna looma baahna; luqadaha bogga rasmiga ahi sheegayo waa Finnish, English iyo Arabic.</p><a href="https://www.espoo.fi/en/events/espooevents%3Aagphfqw7ne">Espoo, rasmi ↗</a></article>
'''
anchor = '<article class="card"><div class="meta">Espoo · Arbaco kasta 15–18 · bilaash · isdiiwaangelin</div><h3>Naapuriäidit kokkikerho Lippulaiva</h3>'
public = replace_once(public, anchor, new_family_cards + anchor, "new Espoo family cards")
public_path.write_text(public, encoding="utf-8")


# Internal programme registry: mirror the same verified facts and preserve source cautions.
registry_path = Path("internal/open-programmes.md")
registry = registry_path.read_text(encoding="utf-8")
registry = replace_once(
    registry,
    "  - Status: Lippulaiva service resumes 8.9.2026 and is listed every Tuesday 15.00–18.00 at Lippulaiva Library, Espoonlahdenkatu 8. Free; languages listed are Finnish, Swedish and English.",
    "  - Status: the current event series runs 8.9.–24.11.2026, every Tuesday 15.00–18.00 at Lippulaiva Library, Espoonlahdenkatu 8. Free; languages listed are Finnish, Swedish and English. The permanent service page also lists Tuesday opening hours, but use the dated event series for public event wording and re-check after 24.11.",
    "Starttipiste registry dates",
)
registry = replace_once(
    registry,
    "  - Official event: https://www.espoo.fi/en/events/espooevents%3Aagpqhf4slq",
    "  - Official event series: https://www.espoo.fi/en/events/espooevents%3Aagpqhf4miu",
    "Starttipiste registry series link",
)

registry_cards = '''- **Mobile Espoo Info — Kohtaamispaikka Askel** — City of Espoo / Espoo Info
  - Fits: Espoo residents who need low-threshold help finding or using public services or online services; advice is listed in Finnish, Swedish and English.
  - Helps with: City of Espoo public-service advice, partner-service information including HSL, Kela and Western Uusimaa Wellbeing Services County, and digital support for online services.
  - Status: current event series 8.9.–8.12.2026 at Kannusillankatu 8, Espoo; free. The official series currently lists visits on 8.9., 6.10. and 10.11. at 10.00–11.00. Do not infer a weekly schedule or promise an unlisted date; re-check the event series for the next visit.
  - Official: https://www.espoo.fi/en/events/espooevents%3Aagqhvp6tem

- **Workshop for Families — Entresse Library** — City of Espoo
  - Fits: families of any age looking for a free low-threshold activity; languages listed are Finnish, English and Arabic.
  - Helps with: shared art and crafts at Entresse Library's Paja workshop.
  - Status: Tuesdays 16.00–17.30, 4.8.–15.12.2026, Siltakatu 11, Espoo; free and no advance registration required.
  - Official: https://www.espoo.fi/en/events/espooevents%3Aagphfqw7ne

'''
anchor_registry = '- **Kotivanhempien suomen kielen kurssit** — Koto-Espoo / Omnia / Espoon avoin varhaiskasvatus'
registry = replace_once(registry, anchor_registry, registry_cards + anchor_registry, "new Espoo registry entries")
registry_path.write_text(registry, encoding="utf-8")
