# AQOON Brand

## Värit

| Token | Hex | Käyttö |
|---|---|---|
| `--navy` | `#0E2440` | Otsikot, ensisijainen nappi, tummat sektioit, footer |
| `--ink` | `#0A1A30` | Hover-tila navy-napeille, tummin kortti |
| `--teal` | `#0FB5AE` | Aksentti, A-logon viiva, fokusrengas, aktiivinen navi-alaviiva |
| `--tealdk` | `#0A8F89` | `em`-korostukset otsikoissa, portaikon viivat, numerot |
| `--link` | `#07706B` | Tekstilinkit leipätekstissä, "Katso menetelmä →" |
| `--sand` | `#E8A766` | Toissijainen aksentti, logon piste |
| `--brown` | `#7A4E1E` | "Mitä perheet sanovat" -kortin otsikko ja korostus |
| `--paper` | `#FBFAF7` | Sivun tausta, kortit |
| `--cream` | `#F3F0E9` | Toissijainen tausta, sektioit, hintakortit |
| `--text` | `#16202E` | Leipäteksti |
| `--muted` | `#5C6675` | Toissijainen teksti, alaotsikot, kuvatekstit |
| `--line` | `#E7E3D8` | Reunaviiva paper-taustalla, kortit, navin alareuna |
| `--line-cream` | `#E2DDCF` | Reunaviiva cream-taustalla, listojen erottimet |
| `--line-sand` | `#EBD9BE` | Perheet-kortin reunaviiva |
| `--on-navy` | `#C9D2DE` | Toissijainen teksti navyn päällä, footer-linkit |
| `--on-navy-strong` | `#E2E7EE` | Leipäteksti navyn päällä |
| `--dashed` | `#B9C0CB` | Katkoviivareuna, "ei vielä olemassa" -tila |
| `--wa` | `#1FAF5A` | CTA-vihreä, **VAIN pilke-sivujen liity/lähetä-toiminnoille** |

## Fontit

- **Fraunces**, display, **weight 900 ainoana painona**: h1, h2, h3, logo,
  suuret luvut ja korostuslauseet. Italic 900 (`em`) + `color: var(--tealdk)`
  korostussanoille otsikoissa. Tummalla taustalla korostus on `var(--teal)`.
- **Outfit**, body, weight 400–700. Napit, taulukot, leipäteksti, navi.
- Google Fonts -lataus:
  `Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,900&family=Outfit:wght@400;500;600;700`

## Napit

| Tyyppi | Ulkoasu | Käyttö |
|---|---|---|
| Ensisijainen | Navy-täyttö, teksti `--paper` | "Varaa 30 minuutin puhelu", "Varaa puhelu" |
| Toissijainen | Läpinäkyvä, 2 px navy-reunus, hover navy-täyttö | "Lähetä viesti" |
| Tekstilinkki | `--link`, nuoli `→` | "Katso hinnat →" |

Teal-hehkunappi on poistettu B2B-sivuilta. Vihreä `--wa` on edelleen vain
pilke-sivuilla.

## Muotokieli

- **Napit ja chipit:** `border-radius: 100px` (täysi pill)
- **Kortit:** 20–22 px. Sisäkortit 16 px. Lukulaatat 14 px.
- **Navi:** sticky, `rgba(251,250,247,.94)` + `backdrop-filter: blur(8px)`,
  alareuna 1 px `--line`. Aktiivinen sivu: paino 700 + 2 px `--teal` alaviiva.
  Hampurilaisvalikko ≤800 px.
- **Fokus:** `outline: 3px solid var(--teal); outline-offset: 2px`
- **Mobile-first**, max-width 560px kampanjasivuilla, 1140px B2B-sivuilla.
  Details-lohkojen ja tekstisisällön luettava leveys 800px.

## Typografia

- `text-wrap: pretty` otsikoille ja ingresseille
- `font-variant-numeric: tabular-nums` **jokaiselle elementille joka sisältää
  lukuja**. Luvut ovat myyntiargumentti, ne eivät saa hyppiä.
- Tuhaterotin on kapea välilyönti: `97 523`, ei `97,523`
- Leipätekstin maksimileveys 60–62ch, ingressin 46–52ch

## Äänensävy

- Selkokieli, lyhyet lauseet
- Läpinäkyvyys ennen myyntiä: mainitse aina "Pilke maksaa minulle" tai vastaava
- Ei superlatiiveja; faktat numeroina ("0 €/kk", "4 kuukautta")
- **Ei em-dasheja (—); käytä pistettä, kaksoispistettä tai pilkkua**
- Sanotaan mitä ei tehdä, ei vain mitä tehdään. Rajaus rakentaa luottamusta.
- Kesken oleva luku jätetään tyhjäksi ja merkitään, ei arvata
- Rehellisyyslaatikko (`.honest`) jokaisella kampanjasivulla

## Sosiaalinen sisältö ja video

- Koko kysynnänluonti-, outreach- ja sisältömalli: `workspaces/messaging/references/aqoon-demand-generation-and-content-os.md`.
- Abducadir on oletusarvoinen julkinen kasvot ja käyttää omaa ääntään.
- Perheille suunnattu video on Somali-first, ihmisen puhetta ja ihmisen tarkistamaa. Ei AI-hahmoja, avatar-korvikkeita tai korvaavaa AI-ääntä.
- Yksi video käsittelee yhtä pääasiaa ja sisältää yhden CTA:n.
- Pystyvideo voidaan kuvata luontevasti puhelimella. Käytä selkeää CapCut-ruututekstiä ja tekstitystä.
- Perheiden henkilötietoja, viestejä, lomakkeita tai tunnistettavia tarinoita ei käytetä ilman oikeaa lupaa ja minimointia.
- Maksettu, lahjottu tai muuten kaupallinen vaikuttajayhteistyö merkitään kulloinkin voimassa olevan KKV-ohjeen mukaisesti.
- Yleinen elämäntyylisisältö ei kuulu AQOONin sisältöön, ellei se rakenna suoraan luottamusta AQOONin työtapaan tai vastaa todelliseen perhekysymykseen.

## Kielisäännöt

- **Somalinkielisessä sisällössä** suomalaiset instituutiosanat pysyvät suomeksi:
  `päiväkoti`, `palveluseteli`, `Kela`, `kotihoidon tuki`, `hakemukset`
- **FI-versio tehdään ensin**, hyväksyntä, sitten SO-versio identtisenä
  rakenteeltaan
- **KAIKKI somali tarkistetaan ihmisen toimesta ennen julkaisua**
