# AQOON OS V2 - käynnistysbriefi tekoälyagentille

## Tehtäväsi

Vie AQOONin nykyinen yhden operaattorin V1-järjestelmä turvallisesti kohti oikeaa kahden operaattorin yrityksen käyttöjärjestelmää. Ensimmäiset operaattorit ovat Abducadir ja Mustafe, mutta ratkaisu ei saa lukita järjestelmää vain kahteen henkilöön, somalinkieliseen kohderyhmään tai yhteen palveluun.

Älä aloita keksimällä uutta tietokantakaaviota, käyttöliittymää tai agenttijärjestelmää. Aloita ymmärtämällä repo, tuotannossa oleva Supabase, Edge Functions, nykyinen tracker, funnel, kalenteri, automaatiot, tietopankit, testit ja todellinen työnkulku. Tee ensin todennettava nykytilakartta. Valitse arkkitehtuuri vasta sen jälkeen.

Sinulle annetaan tavoite ja rajat, ei valmista toteutusreseptiä. Käytä omaa harkintaasi, tutki vaihtoehdot ja perustele ratkaisu havaituilla tosiasioilla.

## Liiketoimintatavoite

AQOON on yksi demand-to-outcome-yritys:

`hyödyllinen sisältö/maksuton apu -> suostumuksellinen yhteys -> haastattelu -> varmennettu match -> autettu teko -> kumppaniluovutus -> todennettu lopputulos/pysyvyys -> henkilötiedoton oppi`

Perhepuolella AQOON auttaa ilmaiseksi ymmärtämään ja etenemään. Ostajapuolella AQOON myy mitattua tavoittamista, konversiota, onboardingia, pysyvyyttä, käytännön koulutusta ja todennettuja lopputuloksia. AQOON ei myy perheiden yhteystietolistoja, eikä maksavaa kumppania saa piilottaa suosituksen taakse.

Lue ennen ratkaisuja `docs/architecture/business-operating-model.md`.

## Nykytila, joka sinun pitää itse varmistaa

28.8.2026 tehty auditointi osoitti seuraavan lähtötilan:

- `/caawi` on puhelinnumeron ensin tallentava monitarpeinen intake;
- `/tracker` on salasanalla suojattu perhe-CRM, haastattelu-, analytiikka-, myynti- ja agenda-näkymä;
- Supabase on perheoperaatioiden lähde;
- admin-Edge Functions käyttävät yhtä jaettua tracker-salasanaa ja palvelinpuolen service rolea;
- 26 family leadia olivat kaikki tilassa `new`; yksi haastattelu, yksi follow-up ja nolla uuteen call-outcome-kenttään kirjattua puhelua;
- family lead-, interview-, sales- ja ops event -tietueilla ei ollut operaattorin omistajuutta;
- agenda yhdistää eksplisiittisiä tapahtumia, perheiden follow-up-aikoja ja myynnin next action -aikoja;
- anonyymi funnel-analytiikka erotetaan CRM-tiedoista;
- 33 partner programme -tietuetta oli olemassa;
- PII-vapaat `family_scenarios`- ja `family_scenario_research`-rakenteet sekä match-logiikka olivat olemassa, mutta molemmissa oli nolla tietuetta;
- ensimmäinen haastattelu koostuu reittikohtaisista kysymyksistä, yhteisestä evidenssipohjasta ja ehdollisista life-stage-paketeista, mutta käyttökokemus on edelleen liian pitkä kiireiseen tuotantoon.

Älä luota tähän listaan yksin. Tarkista GitHubin nykyinen commit, kaikki lähimmät `CLAUDE.md`/`CONTEXT.md`/`AGENTS.md`-säännöt, migraatiot, live-skeema, funktioiden nykyiset versiot, ajastukset, nykyiset tietuelajit ja testit. Lue operatiiviset tietueet vain siihen asti kuin nykytilan ymmärtäminen vaatii. Älä kopioi nimiä, puhelimia, viestejä tai case-muistiinpanoja raportteihin tai GitHubiin.

## Nykyinen nopea käyttökartta

Varmista tämä deployatusta versiosta ennen kuin opetat sitä operaattoreille:

1. Operaattori avaa `/tracker`-näkymän ja syöttää nykyisen yhteisen tracker-salasanan.
2. Etusivun `Do next` -nostot priorisoivat keskeneräisiä intakeja, kiireellisiä follow-upeja ja tuoreita uusia perheitä.
3. CRM:n jonot ovat `Finish intake`, `First contact`, `Follow up`, `Active`, `Resolved` ja `All`. Hakua voi rajata statuksella, tarpeella ja kaupungilla.
4. Perhekortista voi soittaa, kirjata puhelun tuloksen, merkitä kontaktoiduksi, avata ensimmäisen haastattelun, vaihtaa journey stagea tai ratkaista casen.
5. Ensimmäinen haastattelu luo reittikohtaiset vastaukset, yhteisen evidenssipohjan, seuraavan teon, follow-up-ajan ja deep-research-briefin. Tallennus siirtää valmiin haastattelun `guide`-vaiheeseen.
6. Analytics-näkymä näyttää reach- ja lomakesuppilon, lähteet, tarpeet, kaupungit, viimeisimmät anonyymit journeyt ja CRM-jonon terveyden. Se ei vielä kerro täydellistä downstream-outcomea.
7. Sales-näkymä hallitsee organisaatiosuhteita, vaiheita, seuraavia tekoja ja aikajanaa.
8. Agenda yhdistää `ops_events`-tapahtumat, family follow-upit ja myynnin päivätyt next actionit.

Tämä käyttökartta on V1:n kuvaus, ei V2:n suunnitelma. Mustafe voi teknisesti käyttää samaa näkymää ja salasanaa, mutta järjestelmä ei pysty todistamaan, kumpi otti casen, soitti, muutti tietoa tai omistaa seuraavan lupauksen. Tätä puutetta ei saa kiertää pelkillä nimikirjaimilla vapaassa muistiinpanossa.

## Onnistumisen ehdot

Ratkaisun jälkeen:

1. Jokaisella operaattorilla on oma turvallinen identiteetti ja tarkoituksenmukaiset oikeudet. Jaettua salasanaa ei käytetä pysyvänä henkilöllisyytenä.
2. Jokaisella aktiivisella perheellä ja tehtävällä on näkyvä vastuuhenkilö tai selvästi omistamaton jono. Abducadir ja Mustafe näkevät nopeasti oman tämän päivän työnsä.
3. Sama perhe ei vaihdu vahingossa kesken prosessin. Tietoinen uudelleenjako, poissaolokattavuus ja luovutus ovat mahdollisia ja jättävät historian.
4. Koko polku ensimmäisestä yhteydestä lopputulokseen on yksi ymmärrettävä tapahtumaketju. Kuka teki, mitä tapahtui, mitä odotetaan ulkopuolelta ja mikä on seuraava lupaus näkyvät ilman case-muistiinpanojen arvaamista.
5. Kalenteri, follow-upit ja muistutukset muodostavat yhden luotettavan työjonon: päällekkäisyydet, myöhästyneet lupaukset, vastaamattomat yhteydenotot ja ulkopuolista päätöstä odottavat tapaukset löytyvät heti.
6. Ensimmäinen haastattelu on selvästi nopeampi normaalissa tapauksessa, mutta kerää edelleen reitin ratkaisemiseen tarvittavat faktat ja saman vertailukelpoisen evidenssipohjan. Kysymys näytetään vain, jos sen vastaus voi muuttaa reittiä, seuraavaa tekoa tai tärkeää mittaria.
7. Analytiikka erottaa reachin, kontaktin, valmiin intaken, haastattelun, matchin, autetun teon, luovutuksen, lopputuloksen ja pysyvyyden. Sitä voi tarkastella ainakin lähteen, kohortin, tarpeen, kunnan, kumppanin ja vastuullisen operaattorin mukaan sekä vaiheiden välisen ajan kautta.
8. Sisäinen brain muuttaa toistuvan case-oppimisen PII-vapaaksi, lähteistetyksi ja vanhenevaksi operaattoritiedoksi. Case-muistiinpano ja kanoninen tieto pysyvät eri asioina.
9. Muuttuvalla palvelu-, ohjelma-, etuus- ja tapahtumatiedolla on lähde, tarkistushetki, voimassaolo/status, volatiliteetti ja seuraava tarkistus. Vanhentunut tieto ei päädy automaattisesti suositukseksi tai julkaisuksi.
10. Varmennettu tieto voidaan muuttaa hallitusti videoideoiksi, julkisiksi tietosivuiksi, avoimien ohjelmien listoiksi ja ajankohtaisiksi tapahtumanostoiksi ilman, että julkaisu irtoaa lähteestä tai muuttuu piilomainonnaksi.
11. Automaatiot tuottavat ymmärrettäviä havaintoja ja tehtäviä. Ne eivät hiljaa muuta tuotantokoodia, tietokantaa tai viranomaisohjeita. Agentilta toiselle siirtyvä työ sisältää tavoitteen, lähteet, riskin, ehdotetun muutoksen, testitulokset ja hyväksyntätilan.
12. Järjestelmä toimii mobiilissa, säilyttää nykyiset toimivat reitit ja kestää myöhemmin uusia operaattoreita, kieliä, asiakkaita ja palvelukategorioita.

## Pakolliset luottamus- ja turvallisuusrajat

- Noudata repo- ja paikallisia kontekstisääntöjä ennen muutoksia.
- Supabasessa käytä oikeaa käyttäjäidentiteettiä ja vähimmän oikeuden mallia. Roolit kuuluvat suojattuun palvelinpuolen metadataan, eivät käyttäjän itse muokattavaan metadataan.
- RLS on osa toteutusta, ei jälkitarkastus. Browseriin ei tule service role -avainta.
- Erota suostumus pyydettyyn apuun, outcome-seurantaan, relevantteihin päivityksiin, kumppaniluovutukseen ja muuhun markkinointiin.
- Älä kerää etnistä taustaa, uskontoa tai muuta arkaluonteista tietoa vain segmentoinnin vuoksi.
- Älä anna etuus-, paikka-, lupa- tai hyväksymistakuuta.
- Älä vie perheiden PII:tä GitHubiin, yleiseen agenttipromptiin, analytiikkaan tai sisältöpankkiin.
- Tee migraatioille ja työnkulun muutoksille turvallinen käyttöönotto-, varmennus- ja palautussuunnitelma.

## Työjärjestys

### 1. Orientaatio ja nykytilakartta

Lue koko repo hallitusti progressiivisen kontekstin mukaan. Tee kartta ainakin seuraavista:

- käyttäjäpolut ja runtime-pinnat;
- kaikki family-, interview-, funnel-, sales-, programme-, scenario- ja calendar-tietomallit;
- Edge Functions ja niiden autentikointi/oikeudet;
- taulujen todellinen käyttö ja nykyiset tietuevolyymit;
- tracker-näkymät, haastattelulogiikka, agenda ja analytiikkamääritelmät;
- CI, QA, ajastukset, ulkoiset automaatiot ja tuotantoonviennin polku;
- mikä on GitHubissa kanonista ja mikä vain historiallinen tai yksityinen aineisto.

Kirjaa myös ristiriidat: repo vs live-skeema, migraatio vs deployattu funktio, käyttöliittymän väite vs tallennettu data, dokumentoitu automaatio vs oikeasti ajastettu ajo.

### 2. Todellinen työnkulku

Mallinna Abducadirin ja Mustafen työ konkreettisina vastuina ensimmäisestä kontaktista loppuun. Tunnista erityisesti:

- missä työ tulee sisään;
- miten se priorisoidaan ja kuka sen ottaa;
- mitä tietoa tarvitaan ennen puhelua ja puhelun aikana;
- milloin tehdään tutkimus tai match;
- milloin odotetaan perhettä, kumppania, kuntaa, Kelaa tai muuta tahoa;
- miten seuraava lupaus, määräaika, luovutus, outcome ja retention varmistetaan;
- mitkä vaiheet voidaan automatisoida turvallisesti ja missä ihminen on välttämätön.

Älä oleta, että nykyiset statuskentät ovat oikea lopullinen malli. Älä myöskään pura toimivaa V1:tä vain siksi, että jokin toinen arkkitehtuuri on elegantimpi.

### 3. Vaihtoehdot ja päätös

Esitä tarvittaessa muutama realistinen arkkitehtuurivaihtoehto. Vertaa niitä turvallisuuden, käyttöönoton riskin, operaattorin nopeuden, audit trailin, analytiikan, ylläpidon ja tulevan kasvun kannalta. Tee sitten päätös ja tallenna kestävä päätösperustelu `docs/decisions/`-hakemistoon.

### 4. Inkrementaalinen toteutus

Toteuta pieninä, varmennettavina viipaleina siten, että jokainen vaihe parantaa oikeaa päivittäistä työtä. Älä tee suurta kertavaihtoa ilman rinnakkaista varmennusta. Lisää deterministiset testit niihin sääntöihin, jotka voidaan testata.

### 5. Luovutus

Lopputuloksena tarvitaan:

- päivitetty nykytilakartta;
- priorisoitu puute- ja riskilista;
- perusteltu tavoitearkkitehtuuri;
- toimiva toteutus ja migraatiot;
- RLS-, autentikointi-, privacy- ja audit trail -varmennus;
- mobiili- ja end-to-end-testit;
- analytiikkamääritelmät, jotka estävät vanity-mittarien sekoittamisen outcomeihin;
- operaattorin lyhyt käyttöohje Abducadirille ja Mustafelle;
- käyttöönotto- ja rollback-suunnitelma;
- lista asioista, joita ei vielä ratkaistu ja miksi.

## Ensimmäinen vastaus, jonka haluan sinulta

Älä aloita pitkällä filosofialla äläkä lupaa vielä lopullista ratkaisua. Vastaa ensimmäisen auditoinnin jälkeen tiiviisti:

1. Näin järjestelmä toimii nyt.
2. Näin Abducadir löytää tämän päivän työnsä nyt.
3. Näin Mustafe voisi käyttää sitä nyt, ja nämä kohdat estävät turvallisen kahden operaattorin käytön.
4. Tässä ovat suurimmat riskit ja pullonkaulat.
5. Tässä järjestyksessä etenisin kohti tavoitetta, ja näin varmennan jokaisen vaiheen.

Sen jälkeen aloita ensimmäinen turvallinen, eniten arvoa tuottava toteutusviipale.
