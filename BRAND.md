# AQOON Brand

Tämä tiedosto määrittää `aqoon.live`-B2B-sivuston ilmeen ja äänensävyn. Perheiden `/caawi`-pinnalla, yksityisellä `/tracker`-pinnalla ja suojatuilla `/pilke`-kampanjasivuilla on omat käyttöliittymäsääntönsä.

## Värit

| Token | Hex | Käyttö |
|---|---|---|
| `--black` | `#0A0A0A` | Pääotsikot, ensisijaiset napit, tummat osiot ja footer |
| `--text` | `#1A1A18` | Leipäteksti |
| `--paper` | `#F8F7F3` | Sivun päätausta ja vaaleat kortit |
| `--cream` | `#FFF0DF` | Lämmin korostustausta ja palvelukortit |
| `--fog` | `#E9E9E6` | Toissijaiset osiot ja rakenteelliset laatikot |
| `--line` | `#C9C8C1` | Reunat, jakoviivat ja navigaation alareuna |
| `--dark-line` | `#2A2A28` | Jakoviivat mustalla taustalla |
| `--muted` | `#62625D` | Toissijainen teksti ja kuvatekstit |
| `--muted-dark` | `#8A8A84` | Toissijainen teksti mustalla taustalla |
| `--teal` | `#079D97` | Aksenttiviiva, aktiivinen navigaatio ja fokus |
| `--link` | `#087D78` | Tekstilinkit vaalealla taustalla |
| `--sand` | `#E8A766` | Logon piste |
| `--wa` | `#1FAF5A` | Vain suojattujen Pilke-sivujen liittymis- ja lähetystoiminnot |

## Fontit

- **Barlow Condensed**, painot 500–700: display-otsikot, suuret luvut ja AQOON-sanamerkki. Otsikot kirjoitetaan pääosin versaalilla.
- **Outfit**, painot 300–600: leipäteksti, navigaatio, napit, taulukot ja käyttöliittymäteksti.
- **Caveat**, paino 600: yksi lyhyt käsinkirjoitettu huomio tai kuvateksti. Ei pitkiä kappaleita.
- Google Fonts -lataus:
  `Barlow+Condensed:wght@500;600;700&family=Outfit:wght@300;400;500;600&family=Caveat:wght@600`.

## Napit ja linkit

| Tyyppi | Ulkoasu | Käyttö |
|---|---|---|
| Ensisijainen | Musta täyttö, teksti `--paper`, täysi pill | “Varaa 30 minuutin keskustelu” |
| Käänteinen | `--paper`-täyttö mustalla taustalla, musta teksti, täysi pill | Tumma loppukehote |
| Tekstilinkki | `--link`, ohut alaviiva tai selkeä linkkityyli | Sivujen väliset syventävät polut |

Yhdellä näkymällä on yksi selvä ensisijainen toiminto. B2B-sivujen CTA ohjaa keskusteluvaraukseen, ei perheiden intakeen.

## Muotokieli

- Tyyli on toimituksellinen ja rakenteellinen: suuret otsikot, selkeät ruudukot, ohut viiva ja paljon tyhjää tilaa.
- Sisältökortit ja tietolaatikot ovat pääosin suorakulmaisia. Niissä ei käytetä koristeellista varjoa tai turhaa pyöristystä.
- CTA-napit ovat täysiä pill-muotoja. Mobiilivalikon painikkeessa käytetään 8 px pyöristystä.
- Navigaatio on sticky, 66 px korkea ja `--paper`-taustainen. Aktiivinen sivu: paino 600 ja 2 px `--teal`-alaviiva.
- Hampurilaisvalikko tulee käyttöön 900 px leveydestä alaspäin.
- Fokus: `outline: 2px solid var(--teal); outline-offset: 3px`.
- B2B-sivujen pääkontti on enintään 1180 px. Leipätekstin luettava leveys on noin 52–62ch.

## Typografia

- Display-otsikot: Barlow Condensed 700, versaali, tiivis rivikorkeus noin 0.93–1.03.
- Leipäteksti: Outfit, rivikorkeus noin 1.6–1.65.
- Käytä `clamp()`-arvoja, jotta otsikot skaalautuvat ilman erillisiä mobiilikopioita.
- Käytä `text-wrap: pretty` ingresseissä ja pidemmissä otsikoissa, kun selaintuki sallii sen.
- Käytä `font-variant-numeric: tabular-nums` mitatuissa luvuissa.
- Suomenkielinen tuhaterotin on välilyönti: `123 509`, ei `123,509`.

## Äänensävy

- Selkeä, suora ja käytännöllinen. Yksi kappale tekee yhden työn.
- Aloita ostajan ongelmasta ja seurauksesta. Selitä vasta sen jälkeen menetelmä.
- Älä myy näkyvyyttä tuloksena. Erota tavoittaminen, yhteydenotto, tuettu teko, vastuun siirto, varmennettu tulos ja jatkuminen.
- Erota Vaihe 1 ja Vaihe 2: ensin tutkitaan ja testataan, sitten toimivaksi rajattua reittiä toteutetaan jatkuvasti.
- Asiakaspolun ja materiaalien kehitys on ehdollinen lisätyö. Henkilöstön valmennus on erillinen palvelu. Niitä ei esitetä kolmena tasavertaisena pakettina.
- Ei superlatiiveja, keksittyjä konversioita tai varmentamattomia asiakasväitteitä.
- Kesken oleva tai puuttuva luku jätetään pois. Sitä ei arvioida julkiseksi faktaksi.
- Kaupallinen suhde kerrotaan perheelle ennen kaupallista suositusta tai tietojen siirtoa.
- Ei em-viivaa. Käytä pistettä, kaksoispistettä tai pilkkua.

## Julkinen näyttö

- Kanavaluvut kuvaavat tavoittamista ja jakelua. Ne eivät ole yhteydenottoja, hakemuksia tai aloituksia.
- Pilotin sisältökoe ja AQOONin 365 päivän kanava-analyysi ovat eri kohortteja eikä niitä yhdistetä konversiolaskuksi.
- Pilottituloksesta voidaan sanoa, että vähintään yksi reitti vietiin yhteydenotosta varmennettuun aloitukseen. Pilotin tärkein tuotos oli palvelupolun ja katkosten näkyväksi tekeminen.
- Abducadir Aligure on AQOONin oletusarvoinen julkinen kasvo ja ainoa nimeltä esiteltävä perustaja tällä sivustolla. Tiimin muu osaaminen kuvataan kollektiivisesti ilman henkilönimiä.

## Sosiaalinen sisältö ja video

- Kysynnänluonti-, outreach- ja sisältömalli: `workspaces/messaging/references/aqoon-demand-generation-and-content-os.md`.
- Perheille suunnattu sisältö ja somalinkielinen SEO ohjaavat `aqoon.live/caawi`-pintaan. Ostajille suunnattu sisältö ja B2B-SEO ohjaavat `aqoon.live`-pääsivustolle. Yleisöjä tai CTA:ita ei yhdistetä samaan materiaaliin.
- Perheille suunnattu video on Somali-first, ihmisen puhetta ja ihmisen tarkistamaa. Ei AI-hahmoja, avatar-korvikkeita tai korvaavaa AI-ääntä.
- Yksi video käsittelee yhtä pääasiaa ja sisältää yhden CTA:n.
- Perheiden henkilötietoja, viestejä, lomakkeita tai tunnistettavia tarinoita ei käytetä ilman oikeaa lupaa ja minimointia.
- Maksettu, lahjottu tai muuten kaupallinen vaikuttajayhteistyö merkitään kulloinkin voimassa olevan KKV-ohjeen mukaisesti.

## Kielisäännöt

- Somalinkielisessä sisällössä suomalaiset instituutiosanat pysyvät tarvittaessa suomeksi: `päiväkoti`, `palveluseteli`, `Kela`, `kotihoidon tuki`, `hakemukset`.
- FI-versio tehdään ensin ja hyväksytään. SO-versio seuraa samaa rakennetta.
- Kaikki somali tarkistetaan ihmisen toimesta ennen julkaisua.
