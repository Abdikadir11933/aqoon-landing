# AQOON Brand

## Värit

| Token | Hex | Käyttö |
|---|---|---|
| `--navy` | `#0E2440` | Päätausta, hero, lomake-wrapper |
| `--ink` | `#0A1A30` | Hover-tila, tummempi navy |
| `--teal` | `#0FB5AE` | Aksentti, A-logon viiva, em-korostukset |
| `--tealdk` | `#0A8F89` | Tag-tekstit, hover-teal |
| `--sand` | `#E8A766` | Toissijainen aksentti, radial-täplä |
| `--paper` | `#FBFAF7` | Sivun tausta |
| `--cream` | `#F3F0E9` | How-kortit, toissijainen tausta |
| `--text` | `#16202E` | Leipäteksti |
| `--muted` | `#5C6675` | Toissijainen teksti, fact-kortit |
| `--wa` | `#1FAF5A` | CTA-vihreä — VAIN liity/lähetä-toiminnoille |

## Fontit

- **Fraunces** — display, weight 900 otsikoissa (h1/h2/h3), weight 700 korttijaksoissa. Italic + teal-väri (`color: var(--teal)`) korostussanoille otsikoissa.
- **Outfit** — body, weight 400–700. Napit, lomakkeet, leipäteksti.
- Google Fonts -lataus: `Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900` + `Outfit:wght@400;500;600;700`

## Muotokieli

- **Napit ja chipit:** `border-radius: 100px` (täysi pill)
- **Kortit:** `border-radius: 16–22px`
- **Taustat:** radial-gradient-täplät teal + sand navy-pinnoilla:
  ```css
  radial-gradient(ellipse 70% 55% at 85% 0%, rgba(15,181,174,.25), transparent 60%),
  radial-gradient(ellipse 55% 45% at 0% 100%, rgba(232,167,102,.18), transparent 60%)
  ```
- **Mobile-first** — max-width 560px kampanjasivuilla, 1140px B2B-sivulla

## Äänensävy

- Selkokieli, lyhyet lauseet
- Läpinäkyvyys ennen myyntiä: mainitse aina "Pilke maksaa minulle" tai vastaava
- Ei superlatiiveja; faktat numeroina ("0 €/kk", "4 kuukautta")
- Ei em-dasheja (—); käytä pistettä, kaksoispistettä tai pilkkua
- Rehellisyyslaatikko (`.honest`) jokaisella kampanjasivulla

## Kielisäännöt

- **Somalinkielisessä sisällössä** suomalaiset instituutiosanat pysyvät suomeksi: `päiväkoti`, `palveluseteli`, `Kela`, `kotihoidon tuki`, `hakemukset`
- **FI-versio tehdään ensin**, hyväksyntä, sitten SO-versio identtisenä rakenteeltaan
- **KAIKKI somali tarkistetaan ihmisen toimesta ennen julkaisua**
