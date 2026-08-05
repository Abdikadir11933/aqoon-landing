# design-ref — uuden sivuston lähdeaineisto

Nämä tiedostot ovat **suunnittelutyökalun vientejä, eivät julkaistavaa koodia.**
Ne on tallennettu tänne vain siksi, että toteutusvaiheessa on yksi totuuslähde.

| Tiedosto | Vastaava sivu |
|---|---|
| `Etusivu.dc.html` | `/` |
| `tapaus.dc.html` | `/tapaus` |
| `menetelma.dc.html` | `/menetelma` |
| `hinnat.dc.html` | `/hinnat` |
| `perustaja-source.png` | perustajan kuva, 1200x1600 PNG, 1,1 MB |

## Miksi näitä ei voi kopioida sellaisenaan

Vientitiedostot käyttävät suunnittelutyökalun omaa React-ajonaikaa, joka ei kuulu
tähän repoon eikä toimi Vercelin staattisella hostauksella:

- `<x-dc>`, `<helmet>`, `<sc-if value="{{ ... }}">` — omia elementtejä
- `ref="{{ x }}"`, `onClick="{{ go1 }}"`, `open="{{ true }}"` — ei HTML:ää
- `style-hover="..."` — ei ole olemassa CSS:ssä
- `<script type="text/x-dc">` + `class Component extends DCLogic` — vaatii Reactin
- Kaikki tyylit ovat inline-attribuutteina, ei luokkina

Toteutus kirjoitetaan siis uudelleen: **semanttinen HTML + luokat
`assets/styles.css`:ssä + vanilla JS `assets/main.js`:ssä.** Vientitiedostot
kertovat rakenteen, sisällön ja mitat. Ne eivät kerro toteutustapaa.

## Tunnetut virheet vientitiedostoissa

- `Etusivu.dc.html:142` — `</ol</ol>` on rikkinäinen sulkutagi
- `perustaja-source.png` on identtinen zipin `pasted-...png`:n kanssa (sama md5)

Kun sivut on toteutettu ja hyväksytty, tämä kansio voidaan poistaa.
**Poisto vaatii omistajan vahvistuksen** (CLAUDE.md).
