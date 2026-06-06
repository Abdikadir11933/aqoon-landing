# CLAUDE.md — AQOON landing repo

## Repo-rakenne

B2B-sivusto (monisivu):
- `index.html` — etusivu (hero + ongelma + 3 nostokorttia + CTA)
- `palvelut/index.html` — 5-vaihemenetelmä + tuotokset + paketti-teaser
- `paketit/index.html` — 3 pakettia välilehtineen (Tutkimus, Onboarding, Pysyvyys)
- `miksi/index.html` — silta-kortit (5 estettä) + tutkimusmenetelmä
- `kenelle/index.html` — perustaja + kohderyhmät + aktiiviset hankkeet
- `yhteys/index.html` — yhteydenottosektiö
- `assets/styles.css` — kaikki jaettu CSS (nav, hero, sektioit, dark-mode-lock)
- `assets/main.js` — jaettu JS (nav scroll, IntersectionObserver reveal, hamburger)

Kampanjasivut (älä koske):
- `pilke/index.html` — FI kampanjasivu perheille (TikTok-liikenne, mobiili edellä)
- `pilke/so/index.html` — SO kampanjasivu perheille (identtinen rakenne, somali)

Muu:
- `BRAND.md` — brändi-, fontti- ja kielitotuus; **lue ennen mitään UI-muutosta**

**Nav ja footer** toistuvat kaikilla 6 B2B-sivulla (`index.html`, `palvelut/`, `paketit/`, `miksi/`, `kenelle/`, `yhteys/`). Muutos johonkin näistä vaatii päivityksen **kaikkiin kuuteen** tiedostoon.

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
