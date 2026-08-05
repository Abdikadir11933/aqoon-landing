# AQOON-uudistuksen toteutus, prompti kerrallaan

> **TILA: toteutettu.** Promptit 1–11 on ajettu. Omistajan päätökset:
> sisällön supistus hyväksytty, vanhat sivut poistetaan, BRAND.md päivitetään
> uuden ilmeen mukaiseksi. Hampurilaisvalikko säilytettiin ja vanhoille
> URLeille tehtiin 301-ohjaukset.
>
> **Kaksi asiaa jäi kesken:**
> 1. Vanhojen sivutiedostojen poisto (`palvelut/`, `paketit/`, `miksi/`,
>    `kenelle/`, `yhteys/`) esti ympäristön käyttöoikeustarkistus. Sivut ovat
>    301-ohjattuja eivätkä siis tavoitettavissa, mutta tiedostot ovat yhä
>    repossa. Poista ne komennolla:
>    `git rm -r palvelut paketit miksi kenelle yhteys`
> 2. **Prompti 12 on tekemättä.** Se on omistajan tarkistus, ei agentin työtä.
>    Lue se ennen julkaisua.
>
> Alla oleva ohjeistus on säilytetty sellaisenaan, jotta työn perustelut
> ovat luettavissa jälkikäteen.

Lähtötilanne: 6 B2B-sivua. Uusi suunnitelma: 4 sivua. Tämä ei ole uudelleentyylitys,
vaan **informaatioarkkitehtuurin muutos ja merkittävä sisällön supistus.** Lue
"Päätökset ennen aloitusta" ennen kuin ajat yhtään promptia.

Ajojärjestys on sitova: 1 → 12. Jokainen prompti on itsenäinen ja
kopioitavissa sellaisenaan. Aja yksi kerrallaan, katso tulos, siirry seuraavaan.
CLAUDE.md: *"Muutokset inkrementaalisesti, yksi asia kerrallaan."*

---

## Sivukartan muutos

| Nykyinen | Uusi | Mitä tapahtuu |
|---|---|---|
| `/` | `/` | Kirjoitetaan uusiksi |
| `/palvelut` | `/menetelma` | Korvautuu, sisältö supistuu |
| `/paketit` | `/hinnat` | Korvautuu, sisältö supistuu |
| `/miksi` | `/menetelma` | Sulautuu |
| `/kenelle` | `/` | Sulautuu etusivulle |
| `/yhteys` | `/#yhteys` | Poistuu omana sivunaan |
| — | `/tapaus` | **Uusi sivu** |
| `/pilke`, `/pilke/so` | ennallaan | **Ei kosketa** |

---

## Päätökset ennen aloitusta

Nämä eivät ole agentin päätettävissä. Vastaa itse, kirjaa vastaukset tähän
tiedostoon, ja vasta sitten aja Prompti 1.

**1. Hyväksytkö sisällön menetyksen?** Uusi suunnitelma pudottaa pois sisältöä,
jolla ei ole uutta kotia:

- `/palvelut`: AQOON-sovellus pysyvyyden tukena, asiantuntijahaastattelut ja
  podcastit, hakemus-talkoot, koko tuotokset-lista
- `/miksi`: viisi nimettyä estettä (Institutionaalinen pelko, Tiedollinen
  epäsymmetria, Digitaalinen ekskluusio, Stigma, Käytännön logistiikka) sekä
  nelivaiheinen tutkimusmenetelmä. Uusi `/tapaus` puhuu kuudesta esteestä,
  mutta ne ovat yhden asiakkaan esteitä, eivät yleinen malli.
- `/kenelle`: neljä ostajakorttia perusteluineen. Uusi etusivu listaa neljä
  ostajaa yhdellä rivillä kukin.
- `/paketit`: pakettien kestot ja sisältölistat. Uusi `/hinnat` on selvästi ohuempi.

Vaihtoehdot: (a) hyväksy supistus sellaisenaan, (b) siirrä osa sisällöstä
`/menetelma`-sivun details-lohkoiksi, (c) pidä jokin vanha sivu pystyssä.

**2. Navigaatio mobiilissa.** Suunnitelmassa navi on `flex-wrap`-rivi ilman
hampurilaisvalikkoa. 360 px:ssä neljä kohdetta kietoutuu kahdelle riville.
Nykysivustolla on toimiva hampurilainen ≤800 px. **Suositus: pidä hampurilainen.**
Prompti 2 olettaa tämän.

**3. Vanhojen URLien kohtalo.** `/palvelut`, `/paketit`, `/miksi`, `/kenelle`,
`/yhteys` ovat indeksoituja. Ilman 301-ohjauksia ne muuttuvat 404:ksi.
Prompti 9 tekee ohjaukset ja poistaa tiedostot. **CLAUDE.md: poistot vain
omistajan vahvistuksella.** Vahvista erikseen ennen Promptia 9.

**4. Perustajan kuva.** Toimitettu kuva on puhelimella otettu kokovartalokuva
käytävällä, hämärä valaistus, verryttelyasu. Suunnitelma rajaa siitä ylävartalon.
Sivusto myy kunnille ja hankintayksiköille. **Suositus: teetä kunnollinen
muotokuva.** Prompti 4 tekee parhaansa nykyisellä, mutta se ei korjaa lähdettä.

**5. Julkaistavat luvut ja väitteet.** `/tapaus` ja `/menetelma` sisältävät
asiakaskohtaista dataa ja yhden juridisen väitteen. Katso Prompti 12. Se on
sinun tarkistettavasi, ei agentin.

---

## Prompti 1 — BRAND.md ensin

> Päivitä `BRAND.md` vastaamaan uutta suunnittelujärjestelmää. Lue ensin
> `design-ref/README.md` ja kaikki neljä `design-ref/*.dc.html` -tiedostoa.
> Älä koske vielä mihinkään muuhun tiedostoon.
>
> BRAND.md on tämän repon totuuslähde ja CLAUDE.md käskee jokaista agenttia
> lukemaan sen ennen UI-muutoksia. Jos sitä ei päivitetä ensin, seuraava agentti
> "korjaa" uuden ilmeen takaisin vanhaksi.
>
> Lisää väritaulukkoon nämä uudet tokenit, jotka esiintyvät suunnitelmassa mutta
> puuttuvat BRAND.md:stä:
>
> | Token | Hex | Käyttö |
> |---|---|---|
> | `--link` | `#07706B` | Tekstilinkit leipätekstissä, tummempi kuin tealdk |
> | `--line` | `#E7E3D8` | Reunaviiva paper-taustalla, kortit ja navin alareuna |
> | `--line-cream` | `#E2DDCF` | Reunaviiva cream-taustalla, listojen erottimet |
> | `--line-sand` | `#EBD9BE` | Perheet-kortin reunaviiva |
> | `--on-navy` | `#C9D2DE` | Toissijainen teksti navyn päällä, footer |
> | `--on-navy-strong` | `#E2E7EE` | Leipäteksti navyn päällä |
> | `--dashed` | `#B9C0CB` | Katkoviivareuna, "ei vielä olemassa" -tila |
> | `--brown` | `#7A4E1E` | "Mitä perheet sanovat" -kortin otsikko ja korostus |
>
> Korjaa fonttiosio. Suunnitelma käyttää **Fraunces 900:aa ainoana
> display-painona**, mukaan lukien h2 ja h3, sekä italic 900:aa `em`-korostuksiin.
> Nykyinen 700/800-käyttö poistuu. Google Fonts -lataus muuttuu muotoon
> `Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,900&family=Outfit:wght@400;500;600;700`.
>
> Korjaa nappihierarkia. Uusi ensisijainen nappi on **navy-täyttö** (`--navy`,
> teksti `--paper`), toissijainen on **2 px navy-reunus läpinäkyvällä taustalla**,
> hover kääntää sen navy-täytöksi. Nykyinen teal-hehkunappi (`.btn.primary`)
> poistuu B2B-sivuilta. `--wa` -vihreä pysyy ennallaan ja on edelleen vain
> pilke-sivujen liity-toiminnoille.
>
> Lisää muotokieleen: korttien pyöristys 20–22 px, sisäkorttien 16 px,
> lukulaattojen 14 px. Kaikki napit ja chipit pysyvät 100 px:ssä.
>
> Lisää typografiaosio: `text-wrap: pretty` otsikoille ja ingresseille,
> `font-variant-numeric: tabular-nums` jokaiselle elementille joka sisältää
> lukuja.
>
> Älä muuta äänensävy- äläkä kielisääntöosioita. Ne pätevät edelleen.
> Tarkista erikseen, ettei uusi sisältö riko sääntöä "ei em-dasheja".

---

## Prompti 2 — CSS-perusta ennen sivuja

> Rakenna koko uuden ilmeen CSS `assets/styles.css`:ään. **Älä muuta yhtään
> HTML-sivua tässä vaiheessa.** Lue ensin päivitetty `BRAND.md` ja kaikki neljä
> `design-ref/*.dc.html`.
>
> Suunnitelmatiedostot käyttävät inline-tyylejä joka elementissä. Ne eivät mene
> sellaisenaan tuotantoon: CLAUDE.md sanoo että kaikki jaettu CSS on
> `assets/styles.css`:ssä, ja navi ja footer toistuvat joka sivulla. Muunna
> inline-tyylit luokiksi.
>
> Säilytä nykyisistä tyyleistä ehdottomasti nämä: dark-mode-lukko
> (`@media(prefers-color-scheme:dark)` -lohko), `.reveal`-animaatio,
> hampurilaisvalikon tyylit, `.wrap`-kontti, sekä
> `@media(prefers-reduced-motion:reduce)` -lohko. Laajenna reduced motion
> kattamaan uudet siirtymät.
>
> Lisää uudet tokenit `:root`-lohkoon Prompti 1:n taulukon mukaisesti.
>
> Rakenna nämä luokat. Mitat, välistykset ja `clamp()`-arvot otetaan suoraan
> suunnitelmatiedostoista, älä keksi omia:
>
> - **Navi**: sticky, `rgba(251,250,247,.94)` + `backdrop-filter: blur(8px)`,
>   alareuna 1 px `--line`. Kolme tekstilinkkiä + navy-CTA "Varaa puhelu".
>   `aria-current="page"` -tila: paino 700 ja 2 px `--teal` alaviiva.
>   **Pidä nykyinen hampurilaislogiikka ≤800 px.**
> - **Napit**: `.btn-primary` (navy-täyttö) ja `.btn-outline` (2 px navy-reunus,
>   hover navy-täyttö). Molemmat 100 px pyöristys.
> - **Details-lohko**: `.dets` kortti, `.dets summary` klikattava rivi otsikolla
>   ja alaotsikolla, `.dets-bar` 22×3 px teal-palkki joka kääntyy 90° auettaessa.
>   Ota `::details-content` + `interpolate-size` -animaatio mukaan
>   `@supports`-suojattuna. Vanhemmissa selaimissa se avautuu ilman animaatiota,
>   mikä on hyväksyttävää.
>   Piilota `summary::marker` ja `summary::-webkit-details-marker`.
> - **Kaksi totuutta** (etusivu): kaksi korttia navyn päällä, vasen `--ink`,
>   oikea `--cream` reunuksella `--line-sand`. **Toteuta rivi/sarake-vaihto
>   CSS-media queryllä 860 px:ssä, älä JavaScriptillä.** Suunnitelma tekee sen
>   JS:llä, mikä tarkoittaa että JS:n kaatuessa 360 px:ssä näkyy kolme litistettyä
>   saraketta.
> - **Portaikko**: numeroitu pystylista, 36 px navy-ympyrä ja 2 px teal-viiva
>   numeroiden välissä.
> - **Askelvalitsin** (`/menetelma`): viisi painiketta vaakaviivalla, aktiivinen
>   navy-täyttö. Alle 680 px pystysuunta. Minimikorkeus 44 px.
> - **Estekortit** (`/tapaus`): grid `minmax(210px, 1fr)`, avattava kortti,
>   muut himmenevät `opacity:.55`. Käytä `:has()`-valitsinta kuten suunnitelmassa,
>   mutta lisää luokkapohjainen varapolku.
> - **Taulukot**: `overflow-x:auto` -kääre, `min-width:600px`, otsikkorivi 2 px
>   navy-alaviivalla, rivit 1 px `--line-cream`.
> - **Luvut**: suuri `clamp(3rem, 8vw, 5.5rem)` -numero, laattarivi
>   `flex: 1 1 130px`, katkoviivalaatta tyhjälle tulokselle.
> - **Hintakortit**: kolmen sarakkeen grid `minmax(280px, 1fr)`, cream-tausta.
> - **Perustajaosio**: kuva `aspect-ratio: 3/4`, 22 px pyöristys, teksti vieressä.
> - **Footer**: navy, logo vasemmalla, yhteystiedot oikealla, `flex-wrap`.
>
> Kaksi asiaa joita **et** saa kopioida suunnitelmasta:
> 1. Globaali `a{color:#07706B}`. Se värjäisi navin ja footerin linkit. Pidä
>    nykyinen `a{color:inherit}` ja anna `--link` vain leipätekstin linkeille
>    luokan kautta.
> 2. `style-hover="..."` -attribuutit. Ne eivät ole CSS:ää. Kirjoita oikeat
>    `:hover`-säännöt.
>
> Säilytä `:focus-visible{outline:3px solid var(--teal);outline-offset:2px}`.
>
> Lopuksi: älä poista vielä vanhoja luokkia (`.bcard`, `.pkg-tab`, `.fnode`,
> `.drow`, `.aud`, `.hcard`). Vanhat sivut käyttävät niitä yhä ja hajoaisivat.
> Siivous tehdään Promptissa 9.

---

## Prompti 3 — jaettu JavaScript

> Laajenna `assets/main.js`. Älä koske HTML-sivuihin.
>
> Säilytä nykyiset toiminnot muuttumattomina: navin scroll-luokka,
> IntersectionObserver-reveal, hampurilaisvalikko.
>
> Lisää kolme moduulia. Kaikki ohjataan data-attribuuteilla, jotta sama koodi
> palvelee kaikkia sivuja eikä yksikään sivu tarvitse omaa skriptiään:
>
> 1. **Askelvalitsin** `[data-stepper]`. Painikkeet `[data-step="1..5"]`,
>    paneelit `[data-step-panel="1..5"]`. Klikkaus vaihtaa aktiivisen.
>    Käytä oikeaa tab-kuviota: `role="tablist"`, `role="tab"`,
>    `aria-selected`, `role="tabpanel"`, `aria-controls`. Suunnitelma käyttää
>    `aria-expanded`ia, mikä on väärä rooli valitsimelle. Lisää nuolinäppäinten
>    tuki. Oletusaktiivinen on askel 1.
> 2. **Estekorttien avaus** `[data-cards]`. Painike `[data-card-toggle]`,
>    sisältö `[data-card-body]`. Yksi auki kerrallaan, uudelleenklikkaus sulkee.
>    Aseta `aria-expanded` ja `hidden` oikein.
> 3. **Kahden totuuden liuku** `[data-parallax-pair]`. Kaksi korttia liukuvat
>    toisiaan kohti scrollatessa, enintään 40 px, kuten
>    `design-ref/Etusivu.dc.html` -skriptissä. **Ehdot: aja vain jos
>    `innerWidth >= 860` ja `prefers-reduced-motion` ei ole päällä.** Käytä
>    `requestAnimationFrame`-vaimennusta ja `{passive:true}`. Tämä on
>    puhtaasti koristeellista: jos se tuntuu nykivältä, jätä se pois kokonaan.
>
> Kaikki moduulit alustuvat vain jos kohde-elementti löytyy sivulta.
> Ei virheitä konsoliin sivuilla joilla moduulia ei käytetä.
>
> Natiivit `<details>`-lohkot eivät tarvitse JavaScriptiä. Älä kirjoita niille
> mitään.

---

## Prompti 4 — perustajan kuva

> Optimoi `design-ref/perustaja-source.png` (1200×1600, 1,1 MB) julkaisukelpoiseksi
> ja tallenna se hakemistoon `assets/`.
>
> Tuota kaksi tiedostoa: `assets/perustaja.webp` (ensisijainen) ja
> `assets/perustaja.jpg` (varapolku). Kohdeleveys 900 px, tavoitekoko alle 250 kt
> kumpikin. Käytä `cwebp`/`sharp`/ImageMagick, mitä ympäristössä on saatavilla.
>
> Suunnitelma rajaa kuvan näin: kääre `aspect-ratio: 3/4`, kuva `width:150%`,
> `left:-7%`, `top:-10%`. Tarkista rajaus ja säädä arvoja, jos kasvot eivät
> asetu luontevasti. Rajaa mieluummin lähdekuva valmiiksi kuin skaalaa 150 %:iin
> selaimessa. Se on sekä terävämpi että kevyempi.
>
> Käytä sivulla `<picture>`-elementtiä, `loading="lazy"`, `decoding="async"`,
> sekä eksplisiittiset `width` ja `height` layout-siirtymän estämiseksi.
> Alt-teksti: `Abducadir Aligure`.
>
> **Kerro suoraan, jos lopputulos ei kelpaa B2B-sivustolle.** Lähde on
> puhelimella otettu käytäväkuva hämärässä valaistuksessa. Rajaus ja pakkaus
> eivät korjaa valaistusta, terävyyttä eivätkä taustaa.

---

## Prompti 5 — `/hinnat`

> Luo `hinnat/index.html`. Lähde: `design-ref/hinnat.dc.html`.
>
> Tämä on ensimmäinen uusi sivu ja se ei tarvitse lainkaan JavaScriptiä, joten
> se todentaa Promptissa 2 rakennetun CSS-perustan.
>
> Ota `<head>` mallia nykyisestä `index.html`:stä, älä suunnitelmatiedostosta.
> Suunnitelmasta puuttuu kaikki mitä tuotantosivu tarvitsee. Mukaan on tultava:
> `<html lang="fi">`, `<meta name="color-scheme" content="light only">`,
> favicon-data-URI, `<meta name="description">`, og- ja twitter-tagit,
> canonical `https://aqoon.live/hinnat`, fonttien preconnect ja
> `<link rel="stylesheet" href="/assets/styles.css">`.
>
> Rakenna sivun sisältö suunnitelman järjestyksessä:
> 1. Hero: h1 "Kolme pakettia", ingressi, ja rivi joka linkittää menetelmän
>    portaisiin
> 2. Kolme pakettikorttia: Kartoitus / Kartoitus ja viesti / Koko silta
> 3. Hankinta-lohko navy-taustalla, 60 000 euron kynnysarvo
> 4. "Miten edetään", kolme numeroitua korttia, sekä CTA-parin napit
> 5. "Mitä jos emme tarvitse kaikkea"
>
> Kopioi tekstit **sanatarkasti** suunnitelmatiedostosta. Älä sanoita uudelleen.
> Poikkeus: jos löydät em-dashin, korvaa se pilkulla tai kaksoispisteellä
> (BRAND.md).
>
> Käytä Promptissa 2 tehtyjä luokkia. **Sivulle ei jää yhtään
> `style`-attribuuttia.** Sisäiset linkit osoittavat `/menetelma` ja `/tapaus`,
> eivät `.dc.html`-tiedostoihin.
>
> Navi ja footer: kirjoita ne tässä lopulliseen muotoonsa. Ne kopioidaan tästä
> kolmelle muulle sivulle, joten tee ne kerralla oikein. Navissa "Hinnat" saa
> `aria-current="page"`.
>
> Lisää `.reveal`-luokat samassa hengessä kuin nykysivuilla.
>
> Älä koske muihin tiedostoihin. Sivu ei ole vielä sitemapissa. Se on kunnossa,
> Prompti 9 hoitaa sen.

---

## Prompti 6 — `/menetelma`

> Luo `menetelma/index.html`. Lähde: `design-ref/menetelma.dc.html`.
> Kopioi navi ja footer sellaisenaan `hinnat/index.html`:stä ja vaihda
> `aria-current="page"` kohtaan "Menetelmä".
>
> Sivun lohkot suunnitelman järjestyksessä:
> 1. Hero: "Emme arvaa. Me *selvitämme.*" (`em` teal-italic)
> 2. Details: "Kääntäminen ei ole tavoittamista", **auki oletuksena** (`open`)
> 3. Details: "Missä työ tehdään", sisältää TikTok- ja WhatsApp-perustelun
> 4. Kortti: "Neljä välinettä, neljä eri tehtävää", nelirivinen taulukko
> 5. Details: "Kaksi eri videotyyppiä", kaksi sisäkorttia ja mittaustulokset
> 6. Kortti: "Mitä mittaus opetti"
> 7. **Askelvalitsin: "Viisi porrasta"** — Kartoitus, Viesti, Sisäänpääsy,
>    Tukilinja, Tulos. Käytä Promptissa 3 tehtyä `[data-stepper]`-moduulia.
> 8. Kortti: "Mitä muuta voisitte tehdä", kuusirivinen vertailutaulukko, AQOON-rivi
>    korostettuna
> 9. Details: "Mitä emme tee", neljä rajausta
>
> Taulukot: käytä `<th scope="col">` ja `<th scope="row">` kuten suunnitelmassa.
> Kääri molemmat `overflow-x:auto` -konttiin. Ne ovat 600 px leveitä eivätkä mahdu
> 360 px:n ruudulle muuten.
>
> Askelvalitsimen paneelit ovat DOM:issa aina läsnä, `hidden`-attribuutilla
> piilotettuina. Älä renderöi niitä JavaScriptillä. Ilman JS:ää sivun on
> näytettävä askel 1 ja mieluiten kaikki viisi.
>
> `#luvut`-linkit osoittavat `/tapaus#luvut`.
>
> Sama sääntö: ei yhtään `style`-attribuuttia, tekstit sanatarkasti, ei em-dasheja.

---

## Prompti 7 — `/tapaus`

> Luo `tapaus/index.html`. Lähde: `design-ref/tapaus.dc.html`.
> Navi ja footer `hinnat/index.html`:stä, `aria-current="page"` kohtaan "Tapaus".
>
> Sivun lohkot:
> 1. Hero: "Yksi pilotti, kuusi estettä, yksi *rakenteellinen löydös*"
> 2. Details "Asiakkaan ongelma", **auki oletuksena**
> 3. Details "Mitä oletimme kun aloitimme", neljä numeroitua oletusta
> 4. Details "Mitä teimme", neljä sisäkorttia
> 5. Details "Kuusi estettä" — kuusi avattavaa korttia,
>    Promptin 3 `[data-cards]`-moduuli
> 6. Details "Rakenteellinen löydös" **navy-taustalla ja auki oletuksena**.
>    Huomaa: valkoinen teksti tummalla kortilla, tarkista kontrastit
> 7. `id="luvut"` -lohko: 97 523 suurena lukuna ja tukiluvut alla
> 8. Details "Suppilo": viisi laattaa, viimeinen katkoviivalla ja tyhjä
> 9. Details "Toinen toimeksianto"
> 10. Ristilinkit `/menetelma` ja `/hinnat`
>
> `#luvut`-ankkuri: suunnitelma korjaa scroll-offsetin JavaScriptillä, koska
> navi on sticky. Tee se CSS:llä sen sijaan:
> `#luvut{scroll-margin-top:90px}`. Ei tarvita skriptiä eikä `hashchange`-kuuntelijaa.
>
> Kaikki luvut `font-variant-numeric: tabular-nums`. Käytä kapeaa
> välilyöntiä tuhaterottimena kuten suunnitelmassa ("97 523").
>
> Suppilon viimeinen laatta on tyhjä ja katkoviivareunainen. Se on tarkoituksellinen:
> "Hakuikkuna aukeaa 24.8.2026. Tämä luku julkaistaan kun se on olemassa."
> Älä täytä sitä. Ruudunlukijalle se ei saa olla tyhjä laatikko, anna sille
> tekstivastine.
>
> Sama sääntö: ei `style`-attribuutteja, tekstit sanatarkasti.

---

## Prompti 8 — etusivu

> Kirjoita `index.html` kokonaan uusiksi. Lähde: `design-ref/Etusivu.dc.html`.
> Navi ja footer `hinnat/index.html`:stä. Etusivulla ei ole
> `aria-current`-merkintää, koska "/" ei ole navin linkkilistassa, mutta logo
> vie sinne.
>
> **Huom: `design-ref/Etusivu.dc.html:142` sisältää rikkinäisen sulkutagin
> `</ol</ol>`. Kirjoita se oikein.**
>
> Säilytä nykyisestä `index.html`:stä koko `<head>`: title, description,
> keywords, og- ja twitter-tagit, `/og.png`, favicon. Päivitä vain ne kohdat
> joissa sanamuoto muuttuu.
>
> Sivun lohkot:
> 1. **Hero**: h1 "Apu on jo olemassa. Me viemme sen *perille.*", ingressi,
>    kaksi nappia: "Varaa 30 minuutin puhelu" (navy) ja "Lähetä viesti" (reunus).
>    **Huomaa: nykyinen kicker-chip ja kolmen luvun stats-rivi poistuvat.**
>    Uudessa suunnitelmassa niitä ei ole, ja niiden luvut ("464 tavoitettua",
>    "46k+ katselua") ovat vanhentuneita: `/tapaus` puhuu nyt 97 523:sta.
>    Älä siirrä vanhoja lukuja mihinkään.
> 2. **Kaksi totuutta**: navy-osio, vasen kortti "Mitä instituutio näkee",
>    oikea "Mitä perheet sanovat", keskellä yhdistävä lause. Rivi/sarake-vaihto
>    CSS:llä 860 px:ssä. Liuku-efekti `[data-parallax-pair]`-attribuutilla.
> 3. **Yleiskuva**: neljä details-lohkoa — "Tarjonta ei ole ongelma. Katkennut
>    yhteys on.", "Viisi porrasta", "Yksi pilotti, kuusi estettä...",
>    "Kenelle tämä on". Kaikki kiinni oletuksena.
> 4. **Perustaja**: kuva `<picture>`-elementillä Promptista 4, neljä kappaletta
>    tekstiä, viimeinen Fraunces-korostuksella.
> 5. **Paketit**: yksi details-lohko "Kolme pakettia" ja linkki `/hinnat`.
> 6. **Yhteys**: `id="yhteys"`, keskitetty, otsikko ja kaksi nappia. **Tämä
>    ankkuri on pakollinen**, koska `/yhteys` ohjataan tänne Promptissa 9.
>    Lisää `scroll-margin-top:90px`.
>
> Sisäiset linkit: `/tapaus`, `/tapaus#luvut`, `/menetelma`, `/hinnat`.
>
> Sama sääntö: ei `style`-attribuutteja, tekstit sanatarkasti, ei em-dasheja.

---

## Prompti 9 — vanhojen sivujen poisto ja ohjaukset

> **Aja vasta kun omistaja on erikseen vahvistanut poistot (CLAUDE.md).**
> Tarkista ensin selaimessa, että `/`, `/tapaus`, `/menetelma` ja `/hinnat`
> toimivat.
>
> Lisää `vercel.json`:iin pysyvät 301-ohjaukset. Nykyiset pilke-ohjaukset ja
> www-ohjaus jäävät ennalleen:
>
> | Lähde | Kohde |
> |---|---|
> | `/palvelut` | `/menetelma` |
> | `/miksi` | `/menetelma` |
> | `/paketit` | `/hinnat` |
> | `/kenelle` | `/` |
> | `/yhteys` | `/#yhteys` |
>
> Poista vasta ohjausten lisäämisen jälkeen: `palvelut/`, `paketit/`, `miksi/`,
> `kenelle/`, `yhteys/`.
>
> Päivitä `sitemap.xml`: poista viisi vanhaa URLia, lisää `/tapaus`,
> `/menetelma`, `/hinnat`. `/pilke` ja `/pilke/so` jäävät.
>
> Siivoa `assets/styles.css`:stä nyt käyttämättömiksi jääneet luokat. Etsi ne
> ripgrepillä repon HTML:stä, älä silmämääräisesti. **Tarkista jokainen luokka
> myös `pilke/index.html`:stä ja `pilke/so/index.html`:stä ennen poistoa.**
> Ne ovat oma järjestelmänsä, mutta varmista ettei jaettu luokka ole yhteinen.
>
> Päivitä `CLAUDE.md`:n repo-rakenneosio vastaamaan neljää sivua. Korjaa myös
> rivi "Nav ja footer toistuvat kaikilla 6 B2B-sivulla" — luku on nyt 4.
>
> Älä koske `pilke/`-hakemistoon.

---

## Prompti 10 — meta, OG ja SEO

> Käy läpi kaikki neljä B2B-sivua ja yhdenmukaista `<head>`.
>
> Jokaisella sivulla on oltava: `<html lang="fi">`,
> `<meta name="color-scheme" content="light only">`, favicon-data-URI,
> sivukohtainen `<title>` ja `<meta name="description">` (150–160 merkkiä),
> `<link rel="canonical">` absoluuttisella URLilla, og:type, og:url, og:title,
> og:description, og:locale `fi_FI`, og:image `/og.png`, twitter:card
> `summary_large_image` ja vastaavat twitter-tagit.
>
> Kirjoita jokaiselle oma description. Älä toista etusivun tekstiä neljästi.
>
> Tarkista `og.png` ja `og.svg`: vastaavatko ne yhä uutta viestiä? Nykyinen
> og:title on "Apu on jo olemassa. Me viemme sen perille." ja se pätee edelleen.
> Jos kuvassa on vanhaa sanomaa, kerro se, älä korjaa ilman lupaa.
>
> Lisää jokaiselle sivulle ohitalinkki (`skip link`) heti `<body>`in jälkeen,
> joka vie `<main>`iin. Sitä ei ole tällä hetkellä millään sivulla.
>
> Tarkista `robots.txt`.

---

## Prompti 11 — laatuportti

> Tee tarkistuskierros. Älä korjaa mitään ennen kuin olet listannut löydökset.
> Käynnistä sivusto paikallisesti ja katso se oikeasti, älä päättele koodista.
>
> **Mobiili.** CLAUDE.md vaatii testin 360 px:ssä ja 390 px:ssä. Ota kuvakaappaus
> jokaisesta neljästä sivusta molemmilla leveyksillä. Etsi: vaakasuuntainen
> vieritys (`body` ei saa vierittyä sivusuunnassa, taulukot vierittyvät omassa
> kontissaan), navin kietoutuminen, katkeavat otsikot, alle 44 px:n
> kosketuskohteet.
>
> **Ilman JavaScriptiä.** Estä `main.js`in lataus ja lataa jokainen sivu.
> Kaiken sisällön on oltava luettavissa. Askelvalitsimen on näytettävä vähintään
> askel 1, estekorttien otsikot, ja details-lohkojen on avauduttava natiivisti.
>
> **Tumma tila.** Aja käyttöjärjestelmä tummassa tilassa. Sivuston on pysyttävä
> vaaleana. Tarkista erityisesti uudet kortit ja taulukot: dark-mode-lukko
> `styles.css`:ssä ei tunne uusia luokkia ennen kuin ne on lisätty siihen.
>
> **Vähennetty liike.** `prefers-reduced-motion: reduce` päällä: ei liukua,
> ei reveal-animaatiota, details avautuu ilman siirtymää.
>
> **Näppäimistö.** Tabbaa jokainen sivu läpi. Fokusrengas näkyy kaikkialla.
> Askelvalitsin toimii nuolinäppäimillä. Details-lohkot avautuvat Enterillä.
> Ohitalinkki toimii.
>
> **Linkit.** Tarkista jokainen `href` repossa. Yksikään ei saa osoittaa
> `.dc.html`-tiedostoon eikä poistettuun sivuun. Ulkoiset: cal.com,
> `mailto:abducadir_abdullahi@aqoon.live`, `tel:+358452591438`.
>
> **Kontrasti.** Uudet väriparit: `--link` #07706B paperilla, `--muted` #5C6675
> paperilla, `--on-navy` #C9D2DE navylla, `--brown` #7A4E1E creamilla.
> Vaadi 4.5:1 leipätekstille.
>
> **Suorituskyky.** Aja Lighthouse jokaiselle sivulle. Perustajan kuva on ainoa
> raskas resurssi. Fonttilataus: varmista ettei mikään sivu lataa
> Fraunces-painoja joita se ei käytä.
>
> Raportoi löydökset listana. Korjaa vasta sitten.

---

## Prompti 12 — lukujen ja väitteiden tarkistus

**Tämä ei ole agentille. Tämä on sinulle.** Sivusto julkaisee asiakasdataa ja
yhden juridisen väitteen. Käy nämä läpi ennen kuin annat luvan deployata.

| Väite | Sijainti | Tarkista |
|---|---|---|
| "alle 60 000 euron kansallisen kynnysarvon, ei tarvitse kilpailuttaa" | `/hinnat` | **Juridinen väite.** Hankintalain kansallinen kynnysarvo palveluhankinnoille. Sanamuoto "eikä sitä tarvitse kilpailuttaa" on vahva. Hankintayksikkö lukee tämän. Tarkistuta. |
| 97 523 katselua, 2 266 profiilikäyntiä, 695 jakoa, 687 seuraajaa, 85 kommenttia, 124 päivää, ~12 € mainoskulu | `/tapaus` | Vertaa analytiikkaan. Merkitse mistä päivästä luvut ovat. |
| "Jaot ovat 25,4 % tykkäyksistä" | `/tapaus` | Laskutapa: jaot / tykkäykset. Tykkäysten määrää ei kerrota sivulla. |
| 70 % naisia, 80,6 % ikäryhmässä 25–44, 84,9 % Suomessa | `/tapaus` | Alustan oma demografiaraportti. |
| "61,5 % lapsista maksuttoman varhaiskasvatuksen piirissä" | `/tapaus`, este 1 | Ulkoinen tilasto. **Merkitse lähde ja vuosi.** Kaupunkia ei nimetä, joten lukija ei voi tarkistaa sitä. |
| "kuusi nimettyä perhettä" | `/tapaus` | Henkilötietoja ei julkaista, hyvä. Varmista ettei kuvaus yksilöi ketään. |
| "Tarinavideo piti katsojan kiinni noin puolet pidempään ja tuotti lähes kolminkertaisen konversion" | `/menetelma` | Otoskoko oli pieni ja mainoskulu ~12 €. Harkitse varauksen lisäämistä. |
| Asiakas: "valtakunnallinen yksityinen päiväkotiketju" | `/tapaus` koko sivu | **Onko sinulla lupa julkaista tapaus?** Anonymisointi on hyvä, mutta toimiala + koko + aikaväli + alue voi riittää tunnistamiseen. |
| "Hakuikkuna aukeaa 24.8.2026" | `/tapaus` | Vanhenee. Merkitse kalenteriin sivun päivitys. |
| "Työ alkaa elokuussa" (toinen toimeksianto) | `/tapaus` | Sama. |
| "Otan syksyllä yhden tai kaksi uutta projektia" | `/`, `/hinnat` | Sama. |

Sivustolla ei ole tietosuojaselostetta. Se ei kerää lomakedataa, joten pakkoa ei
välttämättä ole, mutta kunta-asiakas saattaa kysyä. Harkitse.

---

## Kun kaikki on valmista

```
git add -A
git commit -m "..."
git push -u origin claude/website-redesign-impl-mmvf7v
```

**Omistaja deployaa itse.** CLAUDE.md: *"älä deployaa ilman lupaa."*

`design-ref/` voidaan poistaa kun sivut on hyväksytty. Poisto vaatii
vahvistuksen.
