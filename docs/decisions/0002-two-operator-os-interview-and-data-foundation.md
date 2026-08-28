# Decision 0002 — Two-operator OS: interview/data foundation

Tila: hyväksytty ja osittain toteutettu 28.8.2026. Tämä täydentää `docs/qa/current-state-audit-2026-08-28.md` ja `docs/briefs/aqoon-two-operator-os-v2-fast-start.md`:n vaihetta 3 (vaihtoehdot ja päätös). Kattaa erityisesti Abducadirin pyytämän painopisteen: haastattelu, lomake, kysymykset, kerätty data ja operatiiviset tarpeet.

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

**Suositus:** B välivaiheena, A lopullisena tavoitteena. C ei kelpaa pysyväksi ratkaisuksi, koska se ei tuota luotettavaa audit trailia — ainoastaan UI:n väittämän siitä, kuka toimi. Tämä päätös (B vai suoraan A) **vaatii Abducadirin vahvistuksen**, koska A:n toteutus on merkittävästi suurempi ja koskee tuotannon kirjautumisvirtaa suoraan.

## 4. Toteutettu tässä committissa: turvallinen additiivinen skeemaperusta

Seuraava migraatio on **puhtaasti additiivinen**: uusia sarakkeita (kaikki nullable, ei defaulttia joka pakottaisi arvon), uusi `operators`-taulu ja uusi `family_call_log`-taulu. Mitään olemassa olevaa saraketta, funktiota tai UI:ta ei muutettu tai poistettu. RLS on päällä uusissa tauluissa samalla tavalla (ei policyja, pääsy vain service role -Edge Functioneiden kautta) kuin kaikissa muissa perhe-CRM-tauluissa — tämä säilyttää nykyisen, jo dokumentoidun pääsymallin sellaisenaan eikä ota kantaa auditoinnin avoimeen kysymykseen "onko RLS-ilman-policyja tietoinen valinta".

- `operators` — `display_name`, `active`. Siemennetty kahdella rivillä (Abducadir, Mustafe), mutta rakenne ei rajoita operaattorimäärää — täyttää brief-vaatimuksen "ei saa lukita järjestelmää vain kahteen henkilöön".
- `family_leads.assigned_operator_id`, `family_leads.last_actor_id` — omistajuus- ja viimeisin toimija -kentät, joita ei ollut ennen missään taulussa.
- `family_leads.consent_relevant_updates_ok`, `consent_outcome_followup_ok`, `consent_recorded_at` — nostaa jo haastattelussa kysytyt (`relevant_updates_ok`, `outcome_followup_ok`) mutta vain JSON:iin jääneet suostumusvastaukset pysyviksi, kyselykelpoisiksi sarakkeiksi `family_leads`-tasolla, kuten `business-operating-model.md` edellyttää eri tarkoituksiin erillistä suostumusta.
- `family_interviews.interview_schema_version`, `family_interviews.operator_id`.
- `sales_opportunities.owner_operator_id`, `ops_events.operator_id`.
- `family_call_log` (uusi taulu) — korvaa `family_leads.last_call_outcome`/`last_call_at`:n ainoan-arvon-ylikirjoitus-mallin täydellä puheluhistorialla (`operator_id`, `outcome`, `next_follow_up_at`, `notes`, `created_at`). Olemassa oleva yksittäinen arvo jokaiselta leadilta, jolla oli `last_call_outcome`, on taannehtivasti kopioitu tämän uuden taulun ensimmäiseksi riviksi (operaattori `null`, koska attribuutiota ei ollut ennen tätä muutosta) — tämä säilyttää olemassa olevan historian sen sijaan että se katoaisi hiljaa uuteen malliin siirryttäessä.
- `family_leads.last_call_outcome`/`last_call_at` **säilytetään ennallaan** (ei poistettu) — `family-leads-admin`-Edge Function kirjoittaa niihin edelleen eikä mikään tuotantokoodi hajoa. Uusi `family_call_log` on rinnakkainen, ei korvaava, kunnes Edge Function -koodi päivitetään erikseen käyttämään sitä ensisijaisena lähteenä.

**Ei tehty tässä committissa** (vaatii erillisen hyväksynnän ennen toteutusta, per audit-briefin oma portti):
- Minkään Edge Functionin koodin muuttaminen tai uudelleendeployaus. `family-leads-admin`, `ops-admin` ym. eivät vielä lue tai kirjoita yllä olevia uusia sarakkeita — ne ovat olemassa skeemassa, mutta operatiivisesti passiivisia kunnes funktiot päivitetään käyttämään niitä.
- Minkään tracker-UI:n muuttaminen (ei operaattorivalintaa, ei suostumusnäkymää, ei puheluhistorianäkymää).
- Haastattelusisällön lyhentäminen tai kerrosten 2 ja 3 yhdistäminen (kohta 2).
- Operaattori-identiteetin lopullinen mekanismi (kohta 3) — `operators`-taulu on olemassa valmiiksi kaikkia kolmea vaihtoehtoa varten, mutta mitään niistä ei ole valittu.

## 5. Seuraava hyväksyttävä askel

1. Abducadir vahvistaa: vaihtoehto B (kevyt per-operaattori-token) välivaiheena vai suoraan A (Supabase Auth)?
2. Abducadir/Mustafe vahvistavat: pidetäänkö `universal-proof-questions.js` kanonisena ja poistetaanko limittyvät kysymykset `interview-form-enhancements.js`:stä, vai päinvastoin?
3. Vasta näiden jälkeen: `family-leads-admin`, `ops-admin` ym. -funktiot päivitetään lukemaan/kirjoittamaan uudet sarakkeet, tracker-UI saa operaattorivalinnan ja puheluhistorianäkymän, ja haastattelu lyhennetään sovitun mukaisesti. Jokainen näistä on oma pieni, varmennettavissa oleva viipale — ei yhtä suurta kertavaihtoa, per brief-vaatimus.
