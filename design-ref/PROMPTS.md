# AQOON B2B -toteutuksen handoff

Tila: toteutettu paikallisesti 2.9.2026. Tämä tiedosto korvaa aikaisemman, vanhaan neljän sivun ja kolmen tasavertaisen paketin malliin perustuneen prompttisarjan.

## Lähteet

1. `BRAND.md`
2. `design-ref/README.md`
3. Neljä hyväksyttyä suunnitteluvientiä: `Etusivu.dc.html`, `tapaus.dc.html`, `menetelma.dc.html` ja `paketit.dc.html`
4. `docs/architecture/business-operating-model.md`
5. `workspaces/messaging/references/aqoon-demand-generation-and-content-os.md`

## Säilytettävä sivurakenne

- `/`: arvolupaus, todistettu tavoittaminen, Vaihe 1:n oppi, palvelumalli ja perustaja
- `/tapaus`: tutkimuslähtöisen varhaiskasvatuspilotoinnin prosessi ja opit
- `/menetelma`: tavoittamisen järjestelmä ja kahdeksanvaiheinen toteutusketju
- `/paketit`: Vaihe 1, Vaihe 2, ehdollinen asiakaspolkutyö, erillinen valmennus ja kaupallinen logiikka ilman julkisia hintoja
- `/havainnot` ja sen artikkelit/oppaat: ostajille tarkoitettu näyttö ja käytännön oppi
- `/sanasto`, `/tietosuoja`, `/disclaimer`: määritelmät ja luottamusrajat

## Sisältörajat

- Älä palauta nimiä `AQOON Outcomes`, `AQOON Journey` tai `AQOON Enablement`.
- Älä esitä lisätyötä ja valmennusta Vaihe 2:n kanssa kolmena tasavertaisena pakettina.
- Älä julkaise asiakaskohtaisia hintoja, yksityisiä tarjouslukuja tai tunnistettavia perhetietoja.
- Älä nimeä muita perustajia tai tiimin jäseniä julkisella sivustolla. Abducadir Aligure on julkinen kasvo; muu osaaminen kuvataan kollektiivisesti.
- Älä yhdistä kanavan tavoittamislukuja yhteydenottoihin, hakemuksiin tai aloituksiin.

## Tekniset rajat

- Älä muuta `/caawi`, `/tracker`, `/pilke` tai `supabase`-pintoja B2B-sivuston yhteydessä.
- Säilytä nykyiset tuotantoreitit ja Vercelin uudelleenohjaukset.
- Mobiilivalikko toimii 900 px leveydestä alaspäin, näppäimistöllä ja Escape-näppäimellä.
- Jokaisella indeksoitavalla sivulla on yksi H1, oma canonical, kuvaus, OG-tiedot ja validi sisäinen linkitys.

## Julkaisua edeltävä tarkistus

```bash
python scripts/repo_integrity_qa.py
python scripts/site_qa.py
python scripts/check_internal_routes.py
python scripts/check_seo_metadata.py
python scripts/usability_qa.py
python scripts/legal_trust_qa.py
```

Tarkista lisäksi `git diff --name-only`, jotta suojattuihin reitteihin tai Supabaseen ei ole tullut muutoksia.
