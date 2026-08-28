# AQOON — Nykytila-auditointi ennen V2 Two-Operator OS -suunnittelua

> **Lukujärjestys:** tämä on vaiheen 1 (nykytilakartta) luovutus, kirjoitettu ensin samana päivänä. Katso myös samana päivänä myöhemmin syntyneet `docs/decisions/0002-two-operator-os-interview-and-data-foundation.md` (arkkitehtuuripäätös + toteutus) ja `docs/qa/full-repository-audit-2026-08-28.md` (myöhempi koko-repo-syväauditointi, korjaa mm. tämän raportin tiedostolistausvirheen kohdan 0 mukaisesti myöhemmässä dokumentissa).

Tila: **vaihe 1 luovutus** — nykytilan kartoitus. Ei sisällä arkkitehtuuripäätöstä eikä V2-suunnitelmaa. Ei muuta tuotantokoodia, UI:ta, Supabase-skeemaa, Edge Functioneita, automaatioita tai live-dataa.

Auditoitu kohde: GitHub `Abdikadir11933/aqoon-landing`, branch `master`, commit `ede3885016e50297b0a4d04833975ce88b8c7d79` ("Gate OS redesign behind current-state audit"). Supabase-projekti `qxracwbsyfibcelasxbs` ("aqoon", eu-west-1, Postgres 17.6.1.121), luettu vain read-only-kutsuilla. Auditointi tehty 28.8.2026. Ei perheiden nimiä, puhelinnumeroita, viestejä tai case-muistiinpanoja ole kopioitu tähän dokumenttiin — kaikki tietueesimerkit ovat rivimääriä ja skeematasoisia jakaumia.

Tekijä: tekoälyagentti (Claude), `docs/briefs/aqoon-two-operator-os-v2-fast-start.md` -briefin ensimmäisen vaiheen mukaisesti.

---

## 1. Näin järjestelmä toimii nyt

AQOONin tuotantojärjestelmä on staattinen sivusto (ei `package.json`-build-ketjua, pelkkää HTML/CSS/vanilla-JS:ää), hostattuna Vercelissä, ja se kutsuu Supabasen Edge Functioneita suoraan `fetch`-kutsuin. Kaksi julkista/yksityistä pintaa:

- **`/caawi`** (julkinen intake): puhelinnumeron ensin tallentava monitarpeinen lomake, `FORM_VERSION = "phone-first-v2-multineed"`. `caawi/app.js` hoitaa tilakoneen; honeypot-kenttä `id="website"` botteja vastaan; `normalizeFinnishPhone()` normalisoi numeron `+358`-muotoon; `createSubmitGate` estää tuplalähetykset.
- **`/tracker`** (yksityinen CRM/komentokeskus): yhdellä jaetulla salasanalla suojattu näkymä, jossa perhe-CRM, haastattelu, analytiikka, myynti-CRM ja agenda.

**Yhdeksän aktiivista Edge Functionia** (kaikki `verify_jwt:false` paitsi `nightly-retention`), lähdekoodi luettu suoraan Supabasen deployatusta artefaktista (ei ole repossa):

| Funktio | Versio | Auth | Tehtävä |
|---|---|---|---|
| `family-intake-submit` | v6 | julkinen | Tallentaa täyden intake-lomakkeen `family_leads`-tauluun (upsert `intake_request_id`:llä idempotenssia varten), päivittää `family_intake_contacts.completed=true`, kirjaa `submit_success`-funnel-eventin. |
| `family-intake-contact` | v3 | julkinen | Tallentaa pelkän nimi+puhelin-kontaktin ennen lomakkeen loppuunsaattamista (`family_intake_contacts` upsert), kirjaa `contact_saved`-eventin. |
| `family-funnel-track` | v5 | julkinen | Kirjaa yksittäisiä anonyymejä funnel-eventtejä kiinteästä sallitusta event-nimilistasta (`page_view`, `start`, `city_selected`, ... `send_request`). |
| `family-leads-admin` | v13 | salasana (SHA-256-hash) | `/tracker`:in ydin: `list` (leadit+keskeneräiset kontaktit+haastattelut), `programs`, `save_interview`, `record_call_outcome`, `update` (status/journey_stage/urgency/interview_status/next_follow_up_at), `analytics` (koko funnel-laskenta palvelimella). |
| `family-scenario-admin` | v2 | salasana | PII-vapaa skenaariosovitus: `match_scenario` laskee SHA-256-fingerprintin haastattelun turvallisista avaimista (kiinteä `SAFE_KEYS`-lista, ikä pistetään ikäryhmiin), hakee/luo `family_scenarios`-rivin, merkitsee `family_interviews.scenario_match_status`; `save_research` kirjoittaa varmennetun vastauksen ja pakollisen HTTPS-lähdeviitteen. |
| `family-incomplete-admin` | v2 | salasana | Keskeneräisten intakejen lista/poisto/loppuunsaattaminen operaattorin toimesta. |
| `family-leads-manage` | v1 | salasana | Manuaalinen lead-luonti (duplikaattitarkistus puhelinnumerolla) ja poisto. |
| `ops-admin` | v2 | salasana | Myynti-CRM (`sales_opportunities`, `sales_activities`) ja `ops_events`-kalenteri; `list`-toiminto kokoaa agendan: opportunitiet + aktiviteetit + 14 vrk ops-tapahtumat + kaikki perheet joilla `next_follow_up_at` asetettu. |
| `nightly-retention` | v2 | **JWT vaaditaan** | Ainoa cron-tyyppinen funktio: kutsuu kolmea `SECURITY DEFINER`-RPC:tä (`cleanup_old_interaction_events`, `cleanup_pending_erasure_users`, `cleanup_family_intake_data`) toisistaan riippumattomasti (yhden epäonnistuminen ei estä muita). Ei löytynyt yhtään selainpuolen viittausta tähän funktioon — se on todennäköisesti ajastettu Supabasen puolelta, mutta ajastuksen tarkkaa konfiguraatiota ei tässä auditoinnissa vahvistettu (ks. kohta 8). |

Kaikki viisi salasanasuojattua admin-funktiota käyttävät **täsmälleen samaa kovakoodattua SHA-256-hash-vakiota** (`PASSWORD_HASH = "67541863bd267f78446b60b489625bdd452dca1bd003fa1e620dd98de2fb6c6d"`) suoraan lähdekoodissa — tämä on suoraan lähdekoodista todennettu, ei pääteltävä. Salasana tarkistetaan `x-tracker-password`-headerista, säilötään selaimessa `sessionStorage`-avaimella `aqoon_tracker_password`. Yhtään Supabase Authia tai per-operaattori-identiteettiä ei ole missään ketjun kohdassa. CORS on lukittu vakioon `https://aqoon.live`.

Kaikki funktiot käyttävät `SUPABASE_SERVICE_ROLE_KEY`:tä palvelinpuolella; service role -avainta ei löytynyt selainkoodista (repon oma `scripts/site_qa.py` myös aktiivisesti gréppaa ja kaataa CI:n, jos avain vuotaisi selainkoodiin — tarkistettu, ei löydöksiä).

## 2. Näin Abducadir löytää tämän päivän työnsä nyt

`/tracker`:in etusivun "Do next"-nostot (toteutettu `family-leads-admin`:in `list`-vastauksen päälle client-puolella) priorisoivat: keskeneräiset intaket (`family_intake_contacts` joissa `completed=false`), kiireelliset follow-upit (`next_follow_up_at` lähellä/mennyt) ja tuoreet uudet leadit. CRM:n jonot ovat `Finish intake`, `First contact`, `Follow up`, `Active`, `Resolved`, `All`, suodatettavissa statuksella/tarpeella/kaupungilla. Agenda (`ops-admin`:in `list`) yhdistää `ops_events`, perheiden follow-up-päivät ja myynnin `next_action_at`-päivät yhdeksi listaksi.

Koska koko työnäkymä on rakennettu **yhden operaattorin oletukselle**, Abducadirin "oma työ" tänään on käytännössä koko järjestelmän koko työjono — mitään suodatinta "vain minun" ei ole olemassa, koska mitään omistajakenttää ei ole olemassa.

## 3. Näin Mustafe voisi käyttää sitä nyt — ja tässä ovat esteet

Mustafe **voisi teknisesti** kirjautua `/tracker`:iin samalla salasanalla ja tehdä kaikkea samaa kuin Abducadir: soittaa, kirjata puhelun tuloksen, tehdä haastattelun, vaihtaa journey stagea, ratkaista casen, hallita myyntiä ja kalenteria. Tämä on todennettu suoraan lähdekoodista — mikään endpoint ei kysy tai tallenna kuka toimii.

Suorat esteet turvalliselle kahden operaattorin käytölle, kaikki todennettu skeemasta ja lähdekoodista:

- **Ei omistajuuskenttää missään.** `family_leads`-taulun 32 saraketta eivät sisällä `assignee`/`owner`/`operator_id`-tyyppistä kenttää (koko sarakelista tarkistettu suoraan `information_schema`:sta). Sama pätee `family_interviews`-, `sales_opportunities`-, `sales_activities`- ja `ops_events`-tauluihin (todennettu Edge Function -lähdekoodin insert/update-kentistä).
- **Ei toimijatunnistetta millään kirjoituksella.** `record_call_outcome` tallentaa *milloin* soitettiin (`last_call_at`) muttei *kuka* soitti. Sama koskee `update`-, `save_interview`- ja `save_opportunity`-toimintoja: kaikki kirjoitukset tapahtuvat service role -identiteetillä, joten tietokantatasolla ei jää mitään jälkeä siitä, kumpi operaattori teki minkäkin muutoksen.
- **Ei case-lukitusta tai tietoista uudelleenjakoa.** Kaksi operaattoria voisivat avata saman perheen samaan aikaan eri välilehdillä ilman mitään ristiriitavaroitusta — `update`-toiminto tekee suoran `UPDATE ... WHERE id = ?` ilman optimistista lukitusta tai versiotarkistusta.
- **Salasanan jako = identiteetin jako.** Koska yksi jaettu salasana *on* koko pääsyoikeus, sen vaihtaminen (esim. jos toinen operaattori vaihtuu) vaatii saman avaimen kovakoodauksen päivittämistä ja uudelleendeployn **viiteen** eri funktioon samanaikaisesti — yhden unohtaminen jättäisi epäjohdonmukaisen pääsytilan.
- **RLS on päällä mutta ilman policyja lähes kaikissa perhe-CRM-tauluissa** (vahvistettu `get_advisors(security)`-kutsulla), joten koko pääsynhallinta nojaa yksinomaan Edge Functioneihin — tämä itsessään ei ole este Mustafen käytölle, mutta tarkoittaa, ettei tietokantataso tarjoa mitään toista turvakerrosta, jos tulevaisuudessa avataan esim. suora REST-pääsy tai toinen frontend.

## 4. Suurimmat riskit ja pullonkaulat

Järjestyksessä operatiivisesta/turvallisuuskriittisimmästä lähtien:

1. **Ei audit trailia kenestäkään operaattorista.** Tämä on koko kahden operaattorin mallin ydineste, ei vain UX-puute — sitä ei voi korjata pelkällä UI-muutoksella, koska mikään taulu ei tallenna toimijaa.
2. **Salasanan hallinta on hauras ja hajautettu.** Sama SHA-256-hash on kovakoodattu viiteen erilliseen Edge Function -tiedostoon Supabasen deploy-artefaktina — ei yhtä keskitettyä secretiä, ei rotaatioprosessia dokumentoitu.
3. **Repo ei riitä ympäristön uudelleenrakentamiseen.** Reposta löytyy vain 2 migraatiotiedostoa (`20260827_aqoon_operations_system.sql`, `20260828_call_outcomes_and_funnel_events.sql`), mutta live-Supabasessa on **56 sovellettua migraatiota**. Suurin osa skeemasta on ilmeisesti tehty suoraan dashboardin/MCP:n kautta ilman että vastaavaa migraatiotiedostoa on koskaan committoitu gittiin.
4. **Edge Function -lähdekoodi ei ole versionhallinnassa lainkaan.** Kaikki 9 funktiota ovat olemassa vain Supabasen deployattuina artefakteina. Tämä tarkoittaa: ei PR-katselmointia funktiomuutoksille, ei diffiä kahden version välillä gitissä, eikä mahdollisuutta palauttaa vanhaa versiota gitin kautta.
5. **CI-automaatiot committaavat suoraan masteriin ilman PR-katselmointia** (`somali-language-rewrite.yml`/`-pass2`/`-pass3`, `legal-trust-pass.yml`, `final-trust-links.yml`) — rajattuja omiin tiedostoihinsa, mutta silti katselmoimaton reitti tuotantoon.
6. **Erillinen, dokumentoimaton tuote samassa Supabase-projektissa.** Clerk-auth-pohjaiset `users`/`interaction_events`/`feedback`-taulut sekä monialainen pgvector-tietopankki (`kela_knowledge_chunks`, `migri_knowledge_chunks`, `oph_knowledge_chunks`, `labor_knowledge_chunks`, `municipal_knowledge_chunks`, `health_knowledge_chunks`, `lastensuojelu_knowledge_chunks`, `debt_knowledge_chunks`, `waiver_acceptances`, `waitlist`) elävät samassa projektissa kuin perhe-CRM, mutta niitä ei mainita missään luetuista CONTEXT.md/CLAUDE.md-tiedostoissa. Näiden joukossa on useita `SECURITY DEFINER`-funktioita (`match_kela_chunks` ym., `increment_usage` x2, `cleanup_*`), jotka security advisor merkitsee `anon`/`authenticated`-roolien kautta REST-kutsuttaviksi.
7. **Suostumuskentät puuttuvat skeemasta.** `business-operating-model.md` ja `CONTEXT.md` edellyttävät erillistä suostumusta eri tarkoituksiin (`relevant_updates_ok`, `outcome_followup_ok` ym. kysytään haastattelussa), mutta `family_leads`-taulun sarakeluettelossa ei ole yhtään `consent_*`-tyyppistä pysyvää kenttää — vastaukset näyttävät jäävän vain `family_interviews.answers`-JSON-kenttään, jos haastattelu ylipäätään tehdään. 23/32 valmiiksi merkitystä intake-kontaktista ja 26 leadista vain 1 on koskaan saanut haastattelun — eli suurimmalta osalta perheistä ei ole minkäänlaista tallennettua suostumusennätystä mihinkään erityistarkoitukseen.
8. **Sisäinen "brain" on rakenteellisesti olemassa mutta operatiivisesti tyhjä.** `family_scenarios` ja `family_scenario_research` ovat 0 riviä; ainoa olemassa oleva haastattelu (`family_interviews`, 1 rivi) ei ole koskaan saanut `scenario_fingerprint`-arvoa — eli `match_scenario`-toimintoa ei ole koskaan kutsuttu tuotannossa, vaikka koodi on olemassa ja deployattu.
9. **`tests/call-outcomes.test.js` ei ole kytketty mihinkään CI-workflowhun** — testi on olemassa mutta ei suojaa mitään pipelinea.
10. **Edellisen itseauditoinnin (`docs/qa/full-repository-audit-2026-08-27.md`) raportoima Vercel-buildin rate-limit-ongelma** ei ole tämän auditoinnin toimesta varmistettu korjatuksi tai edelleen voimassa olevaksi — käytettävissä olleilla työkaluilla ei ollut pääsyä Vercelin deploy-statukseen.
11. Pieniä, ei-kiireellisiä löydöksiä: duplikaatti-indeksi `family_contact_starts`:ssa (`family_contact_starts_request_id_key` / `..._uidx`); `function_search_path_mutable`-varoitukset kolmelle funktiolle; branch `update-current-opportunities-2026-08-28` näyttää sisältävän mergaamattoman sisältöpäivityksen; deprecated-branch `feature/family-lead-tracker` on yhä olemassa remotessa vaikka CONTEXT.md kieltää sen palauttamisen (ei aktiivinen riski, mutta siivottava tietoisesti).

## 5. Kaikki järjestelmän yhteyspisteet

```
Selain (julkinen /caawi)
  -> family-funnel-track   (anonyymi event-kirjaus)
  -> family-intake-contact (nimi+puhelin ennen lomakkeen loppua)
  -> family-intake-submit  (koko lomake -> family_leads + family_intake_contacts.completed + submit_success-event)

Selain (yksityinen /tracker, x-tracker-password)
  -> family-leads-admin    (list / programs / save_interview / record_call_outcome / update / analytics)
  -> family-scenario-admin (match_scenario / get_scenario / save_research)
  -> family-incomplete-admin (list / delete / complete)
  -> family-leads-manage   (create / delete, manuaaliset leadit)
  -> ops-admin             (list / save_opportunity / delete_opportunity / add_activity / save_event / delete_event)

Kaikki yllä olevat -> Supabase Postgres (service role, RLS ohitettu palvelinpuolella)
  Taulut: family_leads, family_intake_contacts, family_funnel_events, family_interviews,
          family_scenarios, family_scenario_research, partner_programs,
          sales_opportunities, sales_activities, ops_events

Ajastettu / ei-selainlähtöinen:
  nightly-retention (verify_jwt:true, oletettavasti Supabasen ajastettu triggeri — ei suoraan vahvistettu)
    -> RPC cleanup_old_interaction_events
    -> RPC cleanup_pending_erasure_users
    -> RPC cleanup_family_intake_data

CI/CD (GitHub Actions, 9 workflowta):
  site-qa.yml (pää-CI-portti), verify-internal-routes.yml, verify-seo-links.yml,
  somali-language-qa.yml, somali-language-rewrite.yml/-pass2/-pass3 (auto-commit masteriin),
  legal-trust-pass.yml, final-trust-links.yml (auto-commit masteriin)
  -> Vercel (deploy staattisesta sivustosta, build-tooling puuttuu kokonaan repossa)

Erillinen/rinnakkainen tuote SAMASSA Supabase-projektissa (ei osa perhe-CRM:ää):
  users, interaction_events, feedback (Clerk-auth + Stripe)
  knowledge_chunks + 7 toimialakohtaista *_knowledge_chunks (pgvector RAG)
  waiver_acceptances, waitlist (vanha Pilke-kampanjataulu)
```

Ulkoisia kolmannen osapuolen integraatioita (maksu-, viesti- tai muita API-kutsuja) ei löytynyt selain- tai funktiokoodista tämän auditoinnin aikana muualta kuin Vercel-hostingista ja GitHub Actionsista.

## 6. Jokaisen nykyisen vaiheen tehtävä, syöte, vastuu, data, seuraava vaihe ja valmistumisen määritelmä

| Vaihe | Tehtävä | Syöte / mistä tulee | Kuka/mikä hoitaa nyt | Tallennettava data | Missä säilyy | Mikä laukaisee seuraavan vaiheen | Valmistumisen määritelmä | Pudotuspisteet | Automaatio / manuaalinen |
|---|---|---|---|---|---|---|---|---|---|
| **Reach** | Sisältö tuo kävijän `/caawi`:iin | TikTok/some, hakukone, suora linkki | Ei järjestelmää — sisältö on Abducadirin käsissä | `page_view`, `visitor_id`, `session_id`, UTM-parametrit | `family_funnel_events` | Kävijä avaa lomakkeen (`start`-event) | Sivu latautuu ja `page_view` kirjautuu | Kävijä ei koskaan aloita lomaketta | Täysin automaattinen kirjaus |
| **Identifiable contact** | Nimi+puhelin talteen mahdollisimman aikaisin | Käyttäjän syöte `/caawi`:ssa | `family-intake-contact` | Nimi, normalisoitu puhelin, `request_id` | `family_intake_contacts` (`completed=false`) | Käyttäjä jatkaa lomaketta loppuun TAI operaattori täydentää sen jälkikäteen | Rivi tallentuu ja `contact_saved`-event kirjautuu | Käyttäjä sulkee selaimen ennen lomakkeen loppua — jää `completed=false`-tilaan pysyvästi ellei operaattori huomaa | Automaattinen tallennus, manuaalinen jälkikäsittely (`family-incomplete-admin`) |
| **Completed intake** | Koko avuntarve talteen | Käyttäjän loput vastaukset | `family-intake-submit` | Kaupunki, päätarve, alatarve, ikäryhmä, lisätarpeet (max 3) | `family_leads` (uusi rivi tai upsert `intake_request_id`:llä), `family_intake_contacts.completed=true` | Operaattori näkee uuden leadin `/tracker`:issa | `family_leads`-rivi luotu tilassa `new`, `journey_stage='reach'` | Käyttäjä keskeyttää validointivirheen jälkeen (18 kirjattua `validation_error`-eventtiä havaittu) | Automaattinen |
| **First interview** | Ymmärrä tilanne, kerää reittikohtaiset+yhteiset+ehdolliset kysymykset | Operaattorin puhelu/tapaaminen | Abducadir (tai teoriassa Mustafe) `/tracker`:in kautta | `answers` (JSON), `summary`, `research_prompt`, `next_action`, `urgency`, `next_follow_up_at` | `family_interviews` (upsert `lead_id`+`interview_type`) | Tallennus siirtää leadin `journey_stage='guide'`, `status='contacted'` | Haastattelu tallennettu `status='completed'` | Perhettä ei koskaan tavoiteta puhelimitse (0/26 kirjattua puhelua havaintohetkellä ennen tätä auditointia) | Manuaalinen (operaattorin syöttämä), tallennuslogiikka automaattinen |
| **Verified match** | Sovita perhe oikeaan palveluun/ohjelmaan, PII-vapaana uudelleenkäytettävänä skenaariona | Haastattelun vastaukset + `partner_programs` | `family-scenario-admin` (`match_scenario`) | PII-vapaa `dimensions`-fingerprint, `scenario_key` | `family_scenarios`, `family_scenario_research` | Skenaario merkitään `matched` TAI luodaan tutkimuspyyntö | Skenaario `status='verified'` ja `family_interviews.scenario_match_status='matched'` | Toiminto ei koskaan käynnisty käytännössä — tuotannossa 0 kutsua tähän mennessä | Rakennettu automaatioksi, mutta operatiivisesti käyttämätön |
| **Assisted action** | Auta perhe tekemään hakemus/ilmoittautuminen | Operaattorin ohjaus puhelimessa/paikan päällä | Abducadir, kumppani (koulu/kunta) | `next_action`, `next_follow_up_at`, vapaat `notes` | `family_leads.notes`, `family_interviews.next_action` | Perhe tekee hakemuksen TAI operaattori kirjaa esteen | Ei erillistä status-kenttää tälle — pääteltävä `notes`-tekstistä | Ei rakenteellista tapaa erottaa "autoin hakemaan" muusta muistiinpanosta | Täysin manuaalinen, ei skeematukea |
| **Partner handoff** | Luovutus kumppanille (koulu, Kela, kunta, Pilke, Vantaa) | Sovittu seuraava askel | Ihminen (Abducadir/Mustafe) | Ei erillistä `handoff_at`/`handoff_to`-kenttää löytynyt skeemasta | — | Kumppani vahvistaa vastaanoton (ei automaattista kanavaa) | Ei koodissa määriteltyä valmistumisen kriteeriä | Luovutus voi hukkua, koska mitään pakollista kenttää ei ole | Täysin manuaalinen |
| **Verified outcome** | Vahvista aloitus/hyväksyntä/palvelun alku | Perheen tai kumppanin vahvistus | Ihminen | `status='resolved'`, `resolved_at`, `journey_stage='resolved'` | `family_leads` | Operaattori merkitsee tilan käsin | `status='resolved'` asetettu | Ei mitään automaattista muistutusta tarkistaa onko outcome varmistunut ajoissa | Manuaalinen |
| **Persistence** | Varmista pysyvyys myöhemmin | Uusi yhteydenotto/follow-up | Ei toteutettua mekanismia | — | — | — | — | Ei skeemassa mitään pysyvyyden seurantakenttää (`journey_stage`-lista sisältää `retention`-arvon, mutta 0/26 leadia on tässä vaiheessa) | Ei toteutettu |

**Analytiikka mittaa nyt:** kävijät/sessiot/sivunäytöt lähteen, kaupungin, tarpeen ja laitteen mukaan; koko lomakesuppilo (`view_to_start`, `contact_to_attempt`, `contact_to_saved`, `attempt_to_saved`, `saved_to_completed`, `session_to_completed`) laskettuna palvelimella nykyisen lomakeversion sisällä; tunti-/päivätrendit; leadien liikennelähdejakauma.

**Analytiikasta puuttuu:** kaikki match/assisted-action/handoff/outcome/persistence-tason mittarit (näille ei ole tapahtumaa eikä aikaleimaa skeemassa); vaiheiden välinen aika (`time-to-stage`); operaattorikohtainen työmäärä tai suoritus (koska ei omistajakenttää); konversio kumppanikohtaisesti; hankintakustannus per kanava.

## 7. Repo-, live-skeema-, deploy- ja dokumentaatiopoikkeamat

| # | Poikkeama | Todiste |
|---|---|---|
| 1 | Repossa 2 migraatiotiedostoa, live-Supabasessa 56 sovellettua migraatiota | `list_migrations` vs. `supabase/migrations/*.sql` reposta |
| 2 | Kaikkien 9 Edge Functionin lähdekoodi puuttuu revisiohallinnasta kokonaan | `get_edge_function` palautti sisällön, jota ei löytynyt mistään repon polusta |
| 3 | Erillinen Clerk/pgvector-tuote samassa Supabase-projektissa, ei mainita missään luetussa CONTEXT.md/CLAUDE.md-tiedostossa | `list_tables` vs. dokumentaatiohaku repossa |
| 4 | RLS päällä mutta käytännössä ilman policyja lähes kaikissa julkisen skeeman tauluissa | `get_advisors(security)` |
| 5 | Yksittäisiä `SECURITY DEFINER`-funktioita (vanhan tuotteen puolelta) kutsuttavissa `anon`/`authenticated`-roolien REST-rajapinnan kautta | `get_advisors(security)` |
| 6 | CI-workflowt committaavat suoraan masteriin ilman PR-katselmointia | `.github/workflows/somali-language-rewrite*.yml`, `legal-trust-pass.yml`, `final-trust-links.yml` |
| 7 | `tests/call-outcomes.test.js` ei ole kytketty mihinkään workflowhun | Workflow-tiedostojen sisällön tarkistus |
| 8 | Edellisen itseauditoinnin raportoima Vercel-build-rate-limit-ongelma ei ole tässä vahvistettu korjatuksi | `docs/qa/full-repository-audit-2026-08-27.md`; ei Vercel-pääsyä tässä auditoinnissa |
| 9 | `business-operating-model.md`/`CONTEXT.md` edellyttävät erillisiä suostumuksia, mutta `family_leads`-skeemassa ei ole pysyvää `consent_*`-kenttää | `information_schema.columns` vs. dokumentaatio |
| 10 | Skenaario-/tutkimusarkkitehtuuri on deployattu mutta koskaan kutsumaton tuotannossa | `family_interviews.scenario_fingerprint IS NULL` ainoalla rivillä; `family_scenarios`/`family_scenario_research` 0 riviä |
| 11 | Branch `update-current-opportunities-2026-08-28` sisältää mergaamatonta sisältöä; deprecated `feature/family-lead-tracker` on yhä olemassa remotessa vaikka CONTEXT.md kieltää sen palauttamisen | `git log master..origin/<branch>` -vertailu kaikille 15 ei-master-branchille |

## 8. Kysymykset, joihin ei voi vastata nykyisestä aineistosta arvaamatta

1. Onko "RLS päällä, ei policyja, pääsy vain Edge Functioneiden kautta" **tietoinen arkkitehtuurivalinta** vai jäänyt vahvistamatta tarkoituksellisesti? Tämä pitää vahvistaa suoraan ennen kuin sitä voi kutsua turvalliseksi malliksi.
2. Mikä on `nightly-retention`-funktion todellinen ajastusmekanismi (pg_cron-konfiguraatio vai Supabasen dashboard-triggeri) ja ajoväli? Käytettävissä olleilla työkaluilla ei ollut suoraa pääsyä ajastuskonfiguraatioon.
3. Miksi Clerk-auth- ja pgvector-tietopankkitaulut ovat samassa Supabase-projektissa kuin perhe-CRM — erillinen vanha tuote, suunniteltu tuleva yhdistäminen, vai jäänne? Ei vastattavissa koodista.
4. Onko edellisen itseauditoinnin (27.8.2026) raportoima Vercel-build-rate-limit-ongelma yhä voimassa?
5. Ketkä kaikki tietävät nykyisen tracker-salasanan, ja miten/koska sitä on aiemmin vaihdettu?
6. Onko branch `update-current-opportunities-2026-08-28` tarkoitus mergata vai hylätä?
7. Kutsutaanko vanhan tuotteen `match_*_chunks`/`increment_usage`-RPC:itä oikeasti mistään live-clientistä, vai ovatko ne käytöstä poistunutta pintaa?
8. Mitä suostumusta 32 intake-kontaktista ja 26 leadista on tosiasiassa kysytty/saatu relevanteille päivityksille, outcome-seurannalle ja kumppaniluovutukselle, kun skeemassa ei ole pysyvää tallennuspaikkaa tälle?

## 9. Ehdotettu järjestys seuraavalle deep-research- ja suunnitteluvaiheelle (odottaa hyväksyntää)

Tämä on ehdotus, ei päätös:

1. Vahvista kohdan 8 kysymykset 1–2 ja 5–6 suoraan Abducadirin/Mustafen kanssa — nämä eivät vaadi ulkoista tutkimusta, vain vahvistusta.
2. Sulje skeeman ja repon välinen ristiriita dokumentoimalla (ei koodimuutoksena): rekonstruoi puuttuvat 54 migraatiota gittiin ja vie Edge Function -lähdekoodit repoon versionhallintaan — tämä on edellytys sille, että mitään myöhempää muutosta voi turvallisesti katselmoida tai palauttaa.
3. Tutki operaattori-identiteetin arkkitehtuurivaihtoehdot (esim. Supabase Auth + roolimetadata vs. kevyt per-operaattori-token samalla service-role-mallilla) turvallisuuden, käyttöönottoriskin ja audit trailin kannalta — tämä on koko kahden operaattorin tavoitteen ydinriippuvuus.
4. Suunnittele omistajuus-/audit trail -skeema (`assignee`, `last_actor`, tapahtumaloki) leadeille, haastatteluille, myyntimahdollisuuksille ja ops-tapahtumille.
5. Suunnittele puuttuva suostumusskeema (`consent_*`-kentät) linjassa `business-operating-model.md`:n periaatteiden kanssa.
6. Selvitä ja päätä erillisen Clerk/pgvector-tuotteen kohtalo samassa projektissa (erottaa, dokumentoida rinnakkaiseksi, vai purkaa).
7. Varmista Vercel-deployn nykytila ja korjaa tarvittaessa build-rate-limit-ongelma.
8. Siivoa/päätä `update-current-opportunities-2026-08-28`- ja `feature/family-lead-tracker`-branchien kohtalo.
9. Vasta näiden jälkeen: vertaile 2–3 realistista V2-arkkitehtuurivaihtoehtoa turvallisuuden, käyttöönottoriskin, audit trailin, analytiikan, ylläpidon ja kasvun kannalta, ja tallenna päätös `docs/decisions/`-hakemistoon.

---

**Pysähdys.** Tämä on ensimmäisen vaiheen luovutus. Ei deep researchia, redesignia eikä toteutusta ole aloitettu eikä aloiteta ennen Abducadirin erillistä, nimenomaista hyväksyntää.
