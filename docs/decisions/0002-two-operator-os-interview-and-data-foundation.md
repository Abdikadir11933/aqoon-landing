# Decision 0002 — Two-operator OS: interview/data foundation

Tila: hyväksytty ja **toteutettu** 28.8.2026 (ks. kohta 6 — operaattori-identiteetti on nyt tuotannossa, ei enää avoin kysymys). Tämä täydentää `docs/qa/current-state-audit-2026-08-28.md` ja `docs/briefs/aqoon-two-operator-os-v2-fast-start.md`:n vaihetta 3 (vaihtoehdot ja päätös). Kattaa erityisesti Abducadirin pyytämän painopisteen: haastattelu, lomake, kysymykset, kerätty data ja operatiiviset tarpeet.

## 0. Korjaus edelliseen nykytilaraporttiin

Vaihe 1 -auditointi (`docs/qa/current-state-audit-2026-08-28.md`) luki `tracker/`-hakemistosta vain osan tiedostoista (`ls`-komento katkesi `head -20`:een). Seuraavat tuotannossa aktiiviset ja `tracker/index.html`:iin kytketyt tiedostot **jäivät kokonaan lukematta ja raportoimatta** vaiheessa 1:

- `universal-proof-questions.js` — toteuttaa `tracker/CONTEXT.md`:n kuvaaman "universal baseline + branching" -haastattelukerroksen (aqoon_awareness_before, household_children-portti, work/daycare/school/vantaa-haarat).
- `operations-system.js` — myynti-CRM:n ja agendan koko UI-logiikka (`ops-admin`-funktion client).
- `call-outcomes.js` — puhelun tulos -modaali (`record_call_outcome`).
- `crm-manage.js` — manuaalinen lead-lisäys/poisto (`family-leads-manage`).
- `incomplete-intake.js` — keskeneräisen intaken loppuunsaattaminen (`family-incomplete-admin`).
- `scenario-learning.js`, `human-labels.js`, `analytics-mobile-v2.js`, `visual-v3.js`, `crm-reactive.js` — ei vielä läpiluettu tässäkään päivityksessä; ei tässä dokumentissa väitetä niistä mitään.

Tämä ei ollut "väärä repo" -virhe (remote, commit-SHA, `package.json`-puute ja `caawi`/`tracker`-rakenne on kaikki vahvistettu täsmäävän oikeaan repoon), vaan puutteellinen tiedostolistaus vaiheessa 1. Korjattu tässä. Vaihe 1 -dokumentin kohta 1 ("Näin järjestelmä toimii nyt") aliarvioi tracker-frontendin toteutuksen laajuutta erityisesti myynti-CRM:n, agendan ja evidenssikerroksen osalta.

## 1. Kriittinen uusi löydös: haastattelukenttien ID:t eivät ole pysyneet

`family_interviews`-taulun ainoan olemassa olevan rivin (`interview_type='work'`) 31 vastausavainta (mm. `area`, `goal`, `transport`, `hygiene_pass`, `finland_time`, `palkkatuki_interest`, `seure_application_status`, `weekly_hours_preference`, `oppisopimus_interest`, `driving_license`) **eivät vastaa yhtään nykyisessä koodissa määriteltyä kenttää** — ei `interview-match.js`:n `F.work`-listaa (jobseeker_active, unemployment_duration, right_to_work_known, palkkatuki, availability, work_tryout, apprenticeship...) eikä `universal-proof-questions.js`:n kenttiä lukuun ottamatta muutamaa yhteistä nimeä (`jobseeker`, `employment_plan_status`, `entry_service_awareness` ym., jotka universal-proof-questions.js:n `ALIASES` selvästi käsittelee jo tunnettuna migraationa vanhoista nimistä).

Tämä tarkoittaa: haastattelulomake on kirjoitettu uusiksi vähintään kerran sen jälkeen kun ainoa tuotantorivi tallennettiin, eikä vanhoja kenttä-ID:itä säilytetty. Tämä rikkoo suoraan `tracker/CONTEXT.md`:n omaa sääntöä: *"Never silently change the meaning of an existing field ID; use a new ID for a new question so historical aggregates remain valid."* Käytännössä tämä tarkoittaa, että minkään tulevan aggregaatin (esim. "kuinka moni työtä hakevista ei tiennyt palkkatuesta") vertailukelpoisuutta ei voi taata ilman skeemaversiointia — yksi rikkinäinen datapiste ei vielä ole ongelma, mutta sama voi tapahtua uudelleen minä tahansa julkaisuna, ja silloin 26 leadin skaalassa se on jo merkittävä.

**Toimenpide (toteutettu, ks. kohta 4):** `family_interviews.interview_schema_version`-sarake. Jatkossa jokainen tallennettu haastattelu leimataan lomakeversiolla, jotta tulevat rikkovat muutokset näkyvät datassa eivätkä vain hiljaa turmele aggregaatteja.

## 2. Haastattelun nykyinen todellinen pituus

Haastattelu koostuu tällä hetkellä **kolmesta päällekkäisestä kerroksesta**, jotka kaikki injektoivat kysymyksiä samaan tyhjään `#questions`-divviin (`tracker/index.html` ei sisällä yhtään staattista kysymystä):

1. `interview-match.js` — reittikohtaiset pakolliset kentät (`F`-objekti). Esim. `work`: 12 kenttää (10 pakollista), `program`: 15 kenttää (13 pakollista), `daycare`: 10 kenttää (8 pakollista).
2. `interview-form-enhancements.js` — `addCoreEvidence` (6 kenttää joka reitille) + reittikohtaiset "proof"-paketit: `addHobbyEvidence` (+9), `addDaycareEvidence` (+11).
3. `universal-proof-questions.js` — "always ask" (9-10 kenttää) + ehdolliset haarat (work-proof +3, daycare +4, school +1, vantaa-hobby +3), jotka **osittain limittyvät** kerroksen 2 kanssa (esim. `hobby_free_awareness` vs. `vantaa_hobbies_awareness_all`, `private_daycare_awareness` vs. `private_daycare_awareness_all`) — `ALIASES`-mekanismi estää saman kysymyksen näyttämisen kahdesti, mutta vain niille pareille, jotka on eksplisiittisesti listattu `ALIASES`-objektissa. Ei kaikki limittymät ole katettu (esim. `hobby_registration_help` kerroksesta 2 ja `vantaa_hobbies_possible_need`/`vantaa_hobbies_reminder` kerroksesta 3 kysyvät hyvin lähellä samaa asiaa eri sanoin, ilman alias-suojaa).

Todellinen kenttämäärä yhdelle daycare-caselle: n. 8 (route, pakollinen) + 10 (route, ei-pakollinen) + 11 (evidence pack) + 9 (universal always-ask) + 4 (daycare-haara) ≈ **32-42 kenttää** riippuen siitä lasketaanko myös ei-pakolliset. Tämä on selvästi enemmän kuin `tracker/CONTEXT.md`:n oma tavoite ("roughly 1–3 extra minutes"; universal-kerros yksinään on suunniteltu ~1-2 minuutiksi, mutta se on vain yksi kolmesta kerroksesta).

**Tämä ei ole arvaus — se on suoraan laskettavissa koodista**, mutta *onko se todella liikaa käytännön puhelussa* vaatisi oikean operaattorin palautteen. Audit-brief mainitsi tämän jo tunnettuna tosiasiana ("käyttökokemus on edelleen liian pitkä kiireiseen tuotantoon"). Tämä dokumentti vahvistaa laskennallisen syyn sille väitteelle täsmällisesti.

**Suositus (ei vielä toteutettu, vaatii sisältöpäätöksen):** Yhdistä kerrokset 2 ja 3 yhdeksi lähteeksi ennen seuraavaa haastattelusisällön muutosta. Käytännössä: siirrä `interview-form-enhancements.js`:n evidenssikysymykset (`addCoreEvidence`, `addHobbyEvidence`, `addDaycareEvidence`) samaan `ALIASES`-hallintaan kuin `universal-proof-questions.js`, tai poista päällekkäiset kysymykset kokonaan toisesta tiedostosta. Tämä on sisältötyötä, ei pelkkää skeemamuutosta, ja koskee suoraan operaattorin päivittäistä puhelukokemusta — **tätä ei toteuteta tässä committissa** ilman että Abducadir/Mustafe vahvistavat, kumman kerroksen sanamuoto ja kysymysjärjestys säilytetään. Ehdotus: pidä `universal-proof-questions.js`:n uudempi, tietoisesti haaroitettu rakenne kanonisena, ja poista limittyvät kysymykset `interview-form-enhancements.js`:stä lisäämällä ne `ALIASES`-tauluun.

## 3. Arkkitehtuurivaihtoehdot: operaattori-identiteetti

Tämä on koko kahden operaattorin tavoitteen ydinriippuvuus (audit-brief, kysymys 8.1). Kolme realistista vaihtoehtoa:

| Vaihtoehto | Kuvaus | Hyödyt | Riskit |
|---|---|---|---|
| **A. Supabase Auth per operaattori** | Jokainen operaattori kirjautuu omalla tunnuksellaan; rooli tallennetaan suojattuun `auth.users`-metadataan; Edge Functionit tarkistavat JWT:n service role -kutsun sijaan tai sen lisäksi. | Oikea identiteetti, tukee RLS:ää tulevaisuudessa, skaalautuu uusiin operaattoreihin ilman skeemamuutosta. | Suurin toteutusaskel: kaikki 5 salasanasuojattua funktiota pitää uudelleenkirjoittaa, `/tracker`-kirjautumis-UI uudistuu, migraatio jaetusta salasanasta pitää suunnitella niin, ettei tuotantokäyttö katkea. |
| **B. Kevyt per-operaattori-token samalla service-role-mallilla** | Jaettu salasana korvataan kahdella (tai N:llä) erillisellä salasanalla/tokenilla, jotka mäpätään `operators`-tauluun; funktiot pysyvät service role -pohjaisina mutta lisäävät `operator_id`:n jokaiseen kirjoitukseen. | Paljon pienempi muutos nykyiseen 5 funktioon; nopea käyttöönotto; ei vaadi Supabase Authin opettelua. | Ei todellista identiteetin varmennusta (token voi silti jakautua); ei tue tulevaa RLS-mallia yhtä hyvin kuin A. |
| **C. Nimivalinta UI:ssa ilman erillistä salasanaa** | Sama jaettu salasana pysyy, mutta operaattori valitsee oman nimensä pudotusvalikosta ennen toimintoa; nimi lähetetään mukana `operator_id`:na. | Nopein mahdollinen käyttöönotto (ei backend-muutosta autentikointiin lainkaan). | Ei mitään todellista turvaa — kuka tahansa voi valita väärän nimen; sopii vain väliaikaiseksi askeleeksi kohti A:ta, ei lopulliseksi ratkaisuksi. |

**Suositus tehty 28.8.2026:** Ei B välivaiheena — suoraan A, samassa istunnossa. Abducadir pyysi eksplisiittisesti kirjautumisen yhdistämistä yhdeksi vaiheeksi ("remove the two password one, just make it one"), mikä teki B:n (kaksi näkyvää vaihetta: jaettu salasana + nimivalinta) tarkoituksettomaksi välivaiheeksi. Toteutuksen todellinen kuvaus on kohdassa 6.

## 4. Toteutettu tässä committissa: turvallinen additiivinen skeemaperusta

Seuraava migraatio on **puhtaasti additiivinen**: uusia sarakkeita (kaikki nullable, ei defaulttia joka pakottaisi arvon), uusi `operators`-taulu ja uusi `family_call_log`-taulu. Mitään olemassa olevaa saraketta, funktiota tai UI:ta ei muutettu tai poistettu. RLS on päällä uusissa tauluissa samalla tavalla (ei policyja, pääsy vain service role -Edge Functioneiden kautta) kuin kaikissa muissa perhe-CRM-tauluissa — tämä säilyttää nykyisen, jo dokumentoidun pääsymallin sellaisenaan eikä ota kantaa auditoinnin avoimeen kysymykseen "onko RLS-ilman-policyja tietoinen valinta".

- `operators` — `display_name`, `active`. Siemennetty kahdella rivillä (Abducadir, Mustafe), mutta rakenne ei rajoita operaattorimäärää — täyttää brief-vaatimuksen "ei saa lukita järjestelmää vain kahteen henkilöön".
- `family_leads.assigned_operator_id`, `family_leads.last_actor_id` — omistajuus- ja viimeisin toimija -kentät, joita ei ollut ennen missään taulussa.
- `family_leads.consent_relevant_updates_ok`, `consent_outcome_followup_ok`, `consent_recorded_at` — nostaa jo haastattelussa kysytyt (`relevant_updates_ok`, `outcome_followup_ok`) mutta vain JSON:iin jääneet suostumusvastaukset pysyviksi, kyselykelpoisiksi sarakkeiksi `family_leads`-tasolla, kuten `business-operating-model.md` edellyttää eri tarkoituksiin erillistä suostumusta.
- `family_interviews.interview_schema_version`, `family_interviews.operator_id`.
- `sales_opportunities.owner_operator_id`, `ops_events.operator_id`.
- `family_call_log` (uusi taulu) — korvaa `family_leads.last_call_outcome`/`last_call_at`:n ainoan-arvon-ylikirjoitus-mallin täydellä puheluhistorialla (`operator_id`, `outcome`, `next_follow_up_at`, `notes`, `created_at`). Olemassa oleva yksittäinen arvo jokaiselta leadilta, jolla oli `last_call_outcome`, on taannehtivasti kopioitu tämän uuden taulun ensimmäiseksi riviksi (operaattori `null`, koska attribuutiota ei ollut ennen tätä muutosta) — tämä säilyttää olemassa olevan historian sen sijaan että se katoaisi hiljaa uuteen malliin siirryttäessä.
- `family_leads.last_call_outcome`/`last_call_at` **säilytetään ennallaan** (ei poistettu) — `family-leads-admin`-Edge Function kirjoittaa niihin edelleen eikä mikään tuotantokoodi hajoa. Uusi `family_call_log` on rinnakkainen, ei korvaava, kunnes Edge Function -koodi päivitetään erikseen käyttämään sitä ensisijaisena lähteenä.

**Ei tehty tässä committissa, toteutettu myöhemmin samassa istunnossa (ks. kohta 6):**
- Edge Functionien koodin päivitys ja uudelleendeployaus — tehty.
- Tracker-UI:n operaattorivalinta ja kirjautuminen — tehty.
- Puheluhistorianäkymä tracker-UI:ssa — **ei tehty**. `family_call_log` kirjoittaa dataa, mutta mikään näkymä ei vielä lue/näytä sitä operaattorille.
- Suostumusnäkymä tracker-UI:ssa — **ei tehty**. `consent_relevant_updates_ok`/`consent_outcome_followup_ok` ovat kirjoitettavissa Edge Functionin kautta, mutta mikään UI-elementti ei vielä aseta niitä.

**Yhä tekemättä, vaatii erillisen sisältöpäätöksen:**
- Haastattelusisällön lyhentäminen tai kerrosten 2 ja 3 yhdistäminen (kohta 2) — katso `docs/qa/full-repository-audit-2026-08-28.md`, joka vahvisti tämän edelleen avoimeksi.

## 5. Seuraava hyväksyttävä askel (päivitetty — kohta 1 tehty, ks. kohta 6)

1. ~~Abducadir vahvistaa: vaihtoehto B vai suoraan A?~~ **Tehty 28.8.2026: suoraan A.**
2. ~~Abducadir/Mustafe vahvistavat: pidetäänkö `universal-proof-questions.js` kanonisena ja poistetaanko limittyvät kysymykset `interview-form-enhancements.js`:stä, vai päinvastoin?~~ **Tehty 29.8.2026: `universal-proof-questions.js` kanoninen, `interview-form-enhancements.js`:n syvät patterit pilottimoduuliksi oletuksena pois päältä, ks. kohta 7.**
3. Puheluhistorianäkymä ja suostumusnäkymä tracker-UI:iin (kohta 4). **Yhä avoin** — suostumus kirjoittuu nyt oikein tietokantaan (kohta 7), mutta operaattorille ei vielä näytetä sitä UI:ssa.
4. Haastattelu lyhennetään sovitun mukaisesti kohdan 2 päätöksen jälkeen. **Osittain tehty (kohta 7)** — päällekkäiset kerrokset konsolidoitu; reittikohtaisten pakollisten kenttämäärien sisältötiivistys "noin viiteen kenttään" per reitti on **yhä avoin**, vaatii erillisen sanamuoto/järjestys-vahvistuksen.

## 6. Toteutettu: operaattori-identiteetti on nyt reaalinen kirjautuminen (28.8.2026, sama istunto)

Abducadir pyysi live-testauksen jälkeen kirjautumisen yhdistämistä yhdeksi vaiheeksi. Toteutus:

- **Migraatio `operators_auth_link`**: `operators.email`, `operators.auth_user_id` (uniikki, viittaa `auth.users(id)`). Additiivinen, ei riko mitään olemassa olevaa.
- **Historiallinen toteutus tässä päätösvaiheessa:** viisi suojattua Edge Functionia hyväksyi joko jaetun salasanan tai operaattoriksi resolvoituvan Supabase Auth -JWT:n. **Nykytila on muuttunut tämän ADR:n jälkeen:** tracker käyttää vain hyväksyttyyn `operators`-riviin linkitettyä Supabase Auth -istuntoa eikä jaettua Tracker-salasanaa tai fallbackia ole. Nykytila tarkistetaan aina `tracker/CONTEXT.md`:stä ja funktioiden lähdekoodista.
- **`family-leads-admin`:iin lisätty kaksi uutta actionia**: `whoami` (palauttaa kirjautuneen käyttäjän linkitetyn operaattorin, jos on) ja `claim_operator` (linkittää tuoreen Supabase Auth -tilin yhteen `operators`-riviin, kertaalleen — ei voi varastaa toisen jo linkitettyä riviä).
- **`tracker/operator-identity.js`** korvattiin: `#lock`-näytön ensimmäinen (ja yleensä ainoa) näkyvä vaihe on nyt oikea sähköposti+salasana-kirjautuminen/-rekisteröinti, ei jaettu salasana. Onnistuneen kirjautumisen jälkeen skripti asettaa vaarattoman `sessionStorage`-paikkamerkin ja lataa sivun uudelleen — `app.js`:n oma, koskematon bootstrap-logiikka hoitaa loppuunsaattamisen, nyt JWT:llä autentikoituna. `app.js`-tiedostoon (34 kt, koko tracker-renderöinti) ei koskettu lainkaan.
- **Kaksi todellista virhettä löydetty ja korjattu ennen julkaisua** jäljittämällä oikea suoritusjärjestys, ei olettamalla: (1) `window.fetch`-patch piti siirtää synkroniseksi skriptin jäsennyshetkeen ja skriptitagi `app.js`:n edelle, koska `app.js`:n oma automaattinen kirjautumispingaus laukeaa heti latautuessaan; (2) `#lock`-näkyvyystarkkailija olisi tyhjentänyt juuri asetetun kirjautumissession samalla uudelleenlatauksella joka oli tarkoitus viedä loppuun, koska `#lock`:lla ei ole `hidden`-luokkaa alkuperäisessä merkkauksessa — korvattu pollauksella joka odottaa oikeaa lopputulosta.
- Vahvistettu live-datasta committin jälkeen: `operators`-taulussa Abducadirin rivi on linkitetty oikeaan `auth.users`-tiliin (`ad0298@student.jamk.fi`).

**Ei vieläkään tehty tässä:** token-refresh (JWT vanhenee ~1h, jolloin `/tracker` pyytää kirjautumaan uudelleen — ei bugi, ei vielä rakennettu mukavuusominaisuus); `verify_jwt:true`-lippu Edge Functioneille (ne käyttävät yhä omaa käsin kirjoitettua JWT-tarkistusta `db.auth.getUser()`:illa, koska OR-logiikka jaetun salasanan kanssa vaatisi Supabase-tason muutoksia jaetun salasanan käsittelyyn, jos `verify_jwt` pakotettaisiin natiivisti); jaetun salasanan poistaminen kokonaan — se on yhä tarkoituksella olemassa varajärjestelmänä.

## 7. Toteutettu: haastattelu konsolidoitu yhdeksi haaroittuvaksi instrumentiksi (29.8.2026)

Kohdan 5 avoin kysymys 2 ("pidetäänkö `universal-proof-questions.js` kanonisena?") vahvistettiin: Abducadir pyysi suoraan konsolidointia, säilyttäen vanhat vastausaliakset ja lisäten suostumuksen tallennuksen lead-tasolle atomisesti haastattelun kanssa. Toteutus:

- **Staattinen lataus korvasi dynaamisen injektion.** `crm-reactive.js`:n `document.createElement('script')`-injektio poistettiin; `interview-match.js` on nyt tavallinen `<script defer>`-tagi `index.html`:ssä. Koska kaikki `defer`-skriptit suoritetaan taatusti ennen `DOMContentLoaded`:ia dokumenttijärjestyksessä, kohdan 2 kuvaama hiljainen fallback-riski (app.js:n oma vanha kysymyssarja jos injektio epäonnistuu ajoituksen takia) poistuu rakenteellisesti — ei enää verkkokilpa-ajoitusta.
- **`app.js`:n `openInterview()` ei enää renderöi omaa `Q[route]`-kysymyssarjaansa `#questions`-divviin** (yksi rivi muutettu: tyhjentää divin sen sijaan). `Q`, `qHtml`, `bindQ`, `saveInterview`-funktiot jätettiin koskemattomiksi kuolleena varakoodina — `app.js`-tiedostoon ei muutoin koskettu, samaa varovaisuusperiaatetta noudattaen kuin kohdassa 6.
- **`interview-form-enhancements.js`:n pitkät evidenssipatterit (`addCoreEvidence`, `addHobbyEvidence`, `addDaycareEvidence` ja niiden analytiikkakortti) siirrettiin `PILOT_DEPTH_MODULE_ENABLED`-lipun taakse, oletuksena `false`.** `enhanceBarrier`, `addJobSearchProfile` (1.9.2026 työnhakuprofiili-sääntö) ja `addConditionNote` jäivät päälle, koska ne eivät ole päällekkäisiä `universal-proof-questions.js`:n kanssa. Syvä Pilke/hobby-evidenssi palaa vain tietoisena pilottimoduulina (lippu `true`), ei enää oletusarvoisena intake-kuormana joka haastattelussa.
- **Vanhat vastausaliakset tarkastettu, ei muutosta tarvittu:** `universal-proof-questions.js`:n olemassa oleva `ALIASES`-taulu (`entry_service_awareness→prior_awareness`, `entry_service_self_navigation→self_navigation`, `entry_blockers→access_barriers`, `cross_service_needs_all→other_needs_discovered`, `private_daycare_awareness_all→private_daycare_awareness`, `vantaa_hobbies_awareness_all→harrastusten_vantaa_awareness`, `jobseeker→jobseeker_active`) kattaa jo jokaisen todellisen 1:1-merkitysduplikaatin kerrosten 2 ja 3 väliltä; `outcome_followup_ok` käyttää jo identtistä avainta molemmissa. Syvemmät Pilke/hobby-kentät (esim. `daycare_current_state`, `hobby_registration_help`, `eligible_children_count`) EIVÄT saaneet uutta aliasta, koska niillä ei ole 1:1-vastinetta kevyemmässä universal-haarassa — pakotettu aliasointi olisi rikkonut `tracker/CONTEXT.md`:n sääntöä olemassa olevan kentän merkityksen hiljaisesta muuttamisesta. `aqoon_discovery` (mistä kanavasta perhe löysi AQOONin) jää ilman korvaavaa kenttää nyt kun moduuli on oletuksena pois päältä — tietoinen sisältöpäätös, ei bugi.
- **Suostumus tallennetaan lead-tasolle atomisesti haastattelun kanssa.** `family-leads-admin`-Edge Function (`save_interview`-action, nyt tuotannossa versio 19) lukee valmiiksi olemassa olevan `leadPatch`-objektin sisällä `answers.relevant_updates_ok`/`answers.outcome_followup_ok`-arvot ja kirjoittaa `family_leads.consent_relevant_updates_ok`/`consent_outcome_followup_ok`/`consent_recorded_at`-sarakkeisiin **vain kun vastaus on yksiselitteisesti "Yes" tai "No"** — sama `db.from("family_leads").update(leadPatch)`-kutsu joka jo tapahtui, ei erillistä verkkopyyntöä, siis todella atominen. "Not sure"/"Ask each time" ei ylikirjoita aiempaa suostumusarvoa, koska epävarma vastaus ei ole perheen antama suostumustieto.
- **Ei vieläkään tehty:** kohdan 4 puheluhistorianäkymä ja suostumuksen näkyminen tracker-UI:ssa (sarakkeet kirjoittuvat nyt oikein, mutta mikään näkymä ei vielä näytä niitä operaattorille); interview-match.js:n reittikohtaisten pakollisten kenttämäärien (esim. `F.work` 10 pakollista, `F.program` 13 pakollista) tiivistäminen "noin viiteen kenttään" — se on sisältöpäätös joka vaatii erillisen vahvistuksen kysymyskohtaisesta sanamuodosta ja järjestyksestä, ei toteutettu tässä.
- **Ei testattu päästä päähän todellisella kirjautumisella** (ei tunnuksia tässä istunnossa) — vahvistettu vain: kaikki muutetut tiedostot jäsentyvät virheettä (`node --check`), staattinen palvelin + headless-selain lataa `/tracker`:n ilman JS-ajovirheitä ja `interview-match.js` latautuu 200:lla, ja Supabase-deployn oma build-vaihe hyväksyi Edge Functionin ilman virhettä. Todellinen haastattelu-tallennus ja suostumuskirjoitus reaalidatalla vaativat operaattorin oman live-testin.
