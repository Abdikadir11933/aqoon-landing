# CLAUDE.md — AQOON landing repo

## Repo-rakenne

- `index.html` — B2B-markkinointisivu (ostajille: kunnat, päiväkodit, järjestöt)
- `pilke/index.html` — FI kampanjasivu perheille (TikTok-liikenne, mobiili edellä)
- `pilke/so/index.html` — SO kampanjasivu perheille (identtinen rakenne, somali)
- `BRAND.md` — brändi-, fontti- ja kielitotuus; **lue ennen mitään UI-muutosta**

## Ennen UI-muutoksia

Lue `BRAND.md`. Noudata värejä, fontteja, muotokieltä ja äänensävyä tarkasti.

## Supabase-waitlist (pilke-sivut)

- Käytettävä avain on anon-julkinen avain — VAIN `INSERT`, ei koskaan `SELECT`-policyä
- Ei koskaan service-role-avainta frontendiin
- Honeypot-kenttä (`id="website"`, `display:none`) säilytettävä kaikissa lomakeversioissa
- Taulun kentät: `lang`, `campaign`, `name`, `area`, `num_children`, `child_age`, `phone`

## Työtapa

- Muutokset inkrementaalisesti — yksi asia kerrallaan, ei useita tiedostoja kerralla
- Kampanjasivuilla: **FI-sivu ensin**, hyväksyntä omistajalta, sitten SO-sivu identtisenä rakenteeltaan
- Regression guard: älä muuta mitään mitä tehtävä ei vaadi
- **Poistot vain omistajan vahvistuksella** — kysy aina ennen poistoa

## Testaus

- Mobiilileveydet 360 px ja 390 px aina
- Lomake: täytä kaikki 5 kenttää, lähetä, varmista että Supabaseen tulee rivi
- Kielilinkit: FI ↔ SO ristilinkit molemmat suuntiin

## Deploy

- Vercel static, `cleanUrls: true`, `trailingSlash: false`
- www → apex-redirect hoituu Vercel-projektiasetuksissa
- **Omistaja deployaa itse** — älä deployaa ilman lupaa
- TikTok-mainosten kohde-URL: `aqoon.live/pilke/so` (somalinkielinen yleisö → SO-sivu)
