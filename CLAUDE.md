# CLAUDE.md — AQOON landing repo

## Repo-rakenne

B2B-sivusto, neljä sivua:
- `index.html` — etusivu (hero + kaksi totuutta + yleiskuva-details + perustaja + paketit + CTA `#yhteys`)
- `tapaus/index.html` — pilottitapaus: kuusi estettä, rakenteellinen löydös, luvut (`#luvut`), suppilo
- `menetelma/index.html` — menetelmä, neljä välinettä, viisi porrasta (askelvalitsin), vertailutaulukko
- `hinnat/index.html` — kolme pakettia, hankinta-lohko, miten edetään
- `assets/styles.css` — kaikki jaettu CSS (nav, sektioit, details, taulukot, dark-mode-lock)
- `assets/main.js` — jaettu JS (reveal, hamburger, askelvalitsin, estekortit, liuku)
- `assets/perustaja.webp` / `.jpg` — perustajan kuva

Kampanjasivut (älä koske):
- `pilke/index.html` — FI kampanjasivu perheille (TikTok-liikenne, mobiili edellä)
- `pilke/so/index.html` — SO kampanjasivu perheille (identtinen rakenne, somali)
- Näillä on omat inline-tyylinsä. Ne **eivät** käytä `assets/styles.css`:ää.

Muu:
- `BRAND.md` — brändi-, fontti- ja kielitotuus; **lue ennen mitään UI-muutosta**
- `design-ref/` — uudistuksen lähdeaineisto ja toteutusohje, tilapäinen

**Nav ja footer** toistuvat kaikilla 4 B2B-sivulla (`index.html`, `tapaus/`, `menetelma/`, `hinnat/`). Muutos johonkin näistä vaatii päivityksen **kaikkiin neljään** tiedostoon.

Vanhat URLit `/palvelut`, `/miksi`, `/paketit`, `/kenelle` ja `/yhteys` on 301-ohjattu `vercel.json`:issa. Älä poista ohjauksia.

## JS-moduulit

`assets/main.js` on data-attribuuttiohjattu. Sivut eivät sisällä omia skriptejä.

| Attribuutti | Käyttö |
|---|---|
| `[data-stepper]` + `[data-step]` / `[data-step-panel]` | Askelvalitsin, tab-kuvio nuolinäppäimillä |
| `[data-cards]` + `[data-card-toggle]` | Yksi kortti auki kerrallaan |
| `[data-parallax-pair]` + `[data-parallax="left\|right"]` | Koristeliuku, ei aja alle 860 px eikä reduced motion -tilassa |

**Jokaisen sivun on oltava luettava ilman JavaScriptiä.** Paneelit ovat DOM:issa,
eivät renderöityjä.

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
- **Ilman JS:ää**: jokainen B2B-sivu luettava, askelvalitsimen paneelit näkyvissä
- Tumma tila: sivuston pysyttävä vaaleana (dark-mode-lukko `styles.css`:n lopussa)
- Taulukot vierittyvät omassa `.tablewrap`-kontissaan, `body` ei koskaan sivusuunnassa
- Lomake (pilke): täytä kaikki 5 kenttää, lähetä, varmista että Supabaseen tulee rivi
- Kielilinkit: FI ↔ SO ristilinkit molemmat suuntiin

## Deploy

- Vercel static, `cleanUrls: true`, `trailingSlash: false`
- www → apex-redirect hoituu Vercel-projektiasetuksissa
- **Omistaja deployaa itse** — älä deployaa ilman lupaa
- TikTok-mainosten kohde-URL: `aqoon.live/pilke/so` (somalinkielinen yleisö → SO-sivu)
