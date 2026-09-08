from pathlib import Path
import re


def read(path):
    return Path(path).read_text(encoding="utf-8")


def write(path, text):
    Path(path).write_text(text, encoding="utf-8")


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected 1 exact match, found {count}")
    return text.replace(old, new, 1)


def regex_once(text, pattern, repl, label, flags=0):
    new_text, count = re.subn(pattern, repl, text, count=1, flags=flags)
    if count != 1:
        raise RuntimeError(f"{label}: expected 1 regex match, found {count}")
    return new_text


# 1) Somali family-facing current opportunities page.
public_path = "caawi/ajankohtaiset/index.html"
public = read(public_path)
public = replace_once(public, "La xaqiijiyey 7.9.2026.", "La xaqiijiyey 8.9.2026.", "public verification date")
public = regex_once(
    public,
    r'<article class="card"><div class="meta urgent">[^<]*</div><h3 data-live-fact-key="stadin_food">Elintarvikeala \+ kielituki</h3>.*?</article>\n',
    "",
    "expired Stadin food-service card",
    flags=re.S,
)

recruitment_cards = '''<article class="card"><div class="meta urgent">Helsinki / Espoo / Vantaa · dhalinyarada shaqo-la'aanta ah · taageerada waxaa hela loo-shaqeeyaha</div><h3>Nuorten rekrytointituki</h3><p>Haddii aad tahay dhalinyaro shaqo-doon ah, loo-shaqeeyaha ku shaqaaleysiinaya waxaa laga yaabaa inuu heli karo taageero mushaharka ah. Helsinki iyo Espoo/Kauniainen waxay taageerada u isticmaalaan qof shaqo-la'aan ah oo ka yar 30 sano; Vantaa waxay u isticmaashaa 18–29 jir Vantaa jooga. Qaddarka hadda la daabacay waa 50% kharashka mushaharka, ugu badnaan 1 500 € bishii, muddo 3–6 bilood ah. Lacagta adiga laguma siiyo: loo-shaqeeyaha ayaa codsada, shuruudahana magaalada ayaa xaqiijisa ka hor inta shaqadu bilaaban.</p><a href="https://www.hel.fi/en/business-and-work/jobseekers/start-your-job-search/recruitment-subsidy-for-young-people">Helsinki, xogta shaqo-doonka ↗</a> · <a href="https://www.espoo.fi/fi/nuorten-rekrytointituki">Espoo, rasmi ↗</a> · <a href="https://www.vantaa.fi/fi/tyonhaku-ja-tyollistaminen/tyonantajapalvelut/rekrytoinnin-tuet-ja-etuudet/nuorten-tyontekijoiden-rekrytoinnin-tuet">Vantaa, rasmi ↗</a></article>
<article class="card"><div class="meta urgent">Espoo · qof ka yar 30 sano AMA vieraskielinen shaqo-doon · 5 000 € loo-shaqeeyaha</div><h3>Espoon rekrytointituki</h3><p>Espoo waxay leedahay taageero kale oo 5 000 € ah oo loo-shaqeeyaha gaarka ah ama ururka ah uu codsan karo marka uu shaqaaleysiinayo qof Espoo jooga oo shaqo-doon ah, kana yar 30 sano ama ah vieraskielinen. Qofka la shaqaaleysiinayo waa inuu shaqo la'aan ahaa ugu yaraan 3 bilood oo uu leeyahay waxbarasho heerka labaad ama sare. Shaqadu waa inay socotaa ugu yaraan 12 bilood, waqtiga shaqaduna ugu yaraan 80% yahay. Taageeradu waa harkinnanvarainen, lacagta loo-shaqeeyaha ayaa hela, shaqaduna ma bilaaban karto ka hor inta taageerada la oggolaado.</p><a href="https://www.espoo.fi/en/rekrytointituki">Espoo, shuruudaha rasmiga ah ↗</a></article>
'''
public = replace_once(
    public,
    '<article class="card"><div class="meta">Tampere · bilaash · 25.9. & 30.10.</div><h3>Career Boost Workshop</h3>',
    recruitment_cards + '<article class="card"><div class="meta">Tampere · bilaash · 25.9. & 30.10.</div><h3>Career Boost Workshop</h3>',
    "recruitment support cards insertion",
)

iso_omena_card = '''<article class="card"><div class="meta urgent">Espoo · Iso Omena · Talaado kasta 17–18.30 · ilaa 15.12.2026 · bilaash</div><h3>Ison Omenan suomenkielinen kielikahvila</h3><p>Haddii aad rabto inaad ku tababarto ku hadalka Finnish-ka, Ison Omenan kirjasto waxaa ka jira koox wada-hadal oo deggan Talaado kasta saacadaha 17–18.30. Waxay socotaa ilaa 15.12.2026, goobtuna waa Suomenlahdentie 1. Gelitaanku waa bilaash, isdiiwaangelinna looma baahna.</p><a href="https://www.espoo.fi/fi/tapahtumat/espooevents%3Aagnsn7bfei">Espoo, rasmi ↗</a></article>
'''
public = replace_once(
    public,
    '<article class="card"><div class="meta">Espoo · bilaash · Talaado kasta 18–19.30</div><h3>Entressen Finnish Language Café</h3>',
    iso_omena_card + '<article class="card"><div class="meta">Espoo · bilaash · Talaado kasta 18–19.30</div><h3>Entressen Finnish Language Café</h3>',
    "Iso Omena language cafe insertion",
)
write(public_path, public)


# 2) Internal programme registry.
registry_path = "internal/open-programmes.md"
registry = read(registry_path)
registry = replace_once(registry, "Last compiled: 7.9.2026", "Last compiled: 8.9.2026", "registry date")
registry = regex_once(
    registry,
    r'  - Status: the \*\*Turvallisuusala \+ S2-tuki\*\* route closed on 4\.9\.2026\. The \*\*Elintarvikealan avustaviin tehtäviin, kielituettu koulutus maahan muuttaneille\*\* route closes \*\*today 7\.9\.2026\*\*; its training period is 13\.10\.2026–18\.6\.2027\. Do not present this route as open from 8\.9\. onward unless the official page changes\. Stadin AO says future trainings will be added during autumn and application dates announced later\.',
    '  - Status: the **Turvallisuusala + S2-tuki** route closed on 4.9.2026. The **Elintarvikealan avustaviin tehtäviin, kielituettu koulutus maahan muuttaneille** route is now **closed/passed**; its official application deadline was 7.9.2026 and the training period is 13.10.2026–18.6.2027. Do not present either route as open from 8.9. onward unless the official page changes. Stadin AO says future trainings will be added during autumn and application dates announced later.',
    "expired Stadin registry status",
)

iso_registry = '''- **Ison Omenan kirjaston suomenkielinen kielikahvila** — City of Espoo / Elinvoima
  - Fits: people who want to practise spoken Finnish in a relaxed conversation group.
  - Helps with: free, low-threshold spoken-Finnish practice.
  - Status: Tuesdays 17.00–18.30 through 15.12.2026 at Iso Omena Library, Suomenlahdentie 1, Espoo; free. The City of Espoo's current library guidance says library language cafés do not require advance registration.
  - Official event: https://www.espoo.fi/fi/tapahtumat/espooevents%3Aagnsn7bfei
  - Official library overview: https://www.espoo.fi/fi/kulttuuri-ja-vapaa-aika/kirjastot/kielikahvilat-espoon-kaupunginkirjastossa

'''
registry = replace_once(
    registry,
    '- **Entresse Library Finnish Language Café** — Finnish Red Cross / Espoo libraries',
    iso_registry + '- **Entresse Library Finnish Language Café** — Finnish Red Cross / Espoo libraries',
    "Iso Omena registry insertion",
)

espoo_support_registry = '''- **Espoon rekrytointituki** — City of Espoo
  - Fits: an unemployed Espoo jobseeker who is under 30 **or** foreign-language, has been unemployed for at least three months and has upper-secondary or higher education; the hiring employer must be private-sector or third-sector.
  - Helps with: a concrete hiring incentive that the jobseeker can flag to a prospective employer. The City can pay the employer a discretionary €5,000 one-off subsidy.
  - Status: current; applications have been open since 3.2.2026. The employment relationship must last at least 12 months at at least 80% working time, and it must not start before the subsidy is granted.
  - Important: the money is paid to the employer, not the jobseeker. AQOON must not promise that an employer or jobseeker qualifies; Espoo Employment Services makes the decision.
  - Official: https://www.espoo.fi/en/rekrytointituki

'''
registry = replace_once(
    registry,
    '- **Kotivanhempien suomen kielen kurssit** — Koto-Espoo / Omnia / Espoon avoin varhaiskasvatus',
    espoo_support_registry + '- **Kotivanhempien suomen kielen kurssit** — Koto-Espoo / Omnia / Espoon avoin varhaiskasvatus',
    "Espoo recruitment subsidy registry insertion",
)

local_youth_registry = '''- **Nuorten rekrytointituki — local 2026 hiring subsidy** — Helsinki / Espoo / Vantaa employment services
  - Fits: local unemployed young jobseekers; Helsinki and Espoo/Kauniainen use an under-30 criterion, while Vantaa's current route is for unemployed 18–29-year-old Vantaa jobseekers. Always verify municipality-specific conditions.
  - Helps with: lowering an employer's hiring cost. Current city pages publish support equal to 50% of wage costs, up to €1,500/month, generally for 3–6 months.
  - Important: the employer applies and receives the money; it is not a payment to the jobseeker. The support agreement/decision must be in place before the employment starts. It is discretionary and local conditions differ.
  - Helsinki: https://www.hel.fi/en/business-and-work/jobseekers/start-your-job-search/recruitment-subsidy-for-young-people
  - Espoo: https://www.espoo.fi/fi/nuorten-rekrytointituki
  - Vantaa: https://www.vantaa.fi/fi/tyonhaku-ja-tyollistaminen/tyonantajapalvelut/rekrytoinnin-tuet-ja-etuudet/nuorten-tyontekijoiden-rekrytoinnin-tuet

'''
registry = replace_once(
    registry,
    '- **Palkkatuki**\n',
    local_youth_registry + '- **Palkkatuki**\n',
    "youth recruitment subsidy registry insertion",
)
write(registry_path, registry)


# 3) Canonical employment guidance.
employment_path = "workspaces/evidence-and-research/references/routes/employment-services-current.md"
employment = read(employment_path)
employment = replace_once(employment, "last_verified_at: 2026-09-06", "last_verified_at: 2026-09-08", "employment verification date")
local_support_guidance = '''## Local recruitment subsidies for young and foreign-language jobseekers — 2026

Several municipal employment areas currently have employer-paid recruitment subsidies that can be a useful hiring lever for an eligible jobseeker. These are **local, discretionary employer subsidies**, not benefits paid to the jobseeker, and they do not replace the ordinary job-search or unemployment-security rules.

- **Helsinki Nuorten rekrytointituki:** for an unemployed Helsinki jobseeker under 30. Current city guidance says an employer can receive 50% of wage costs, up to EUR 1,500/month, for 3–6 months. The jobseeker can tell a prospective employer about the route, but the employer makes the application/agreement with Helsinki Employment Services before the employment begins. The temporary scheme can currently be applied for through 31.5.2027 and granted through 30.6.2027.
- **Espoo/Kauniainen Nuorten rekrytointituki:** current terms from 1.7.2026 cover an unemployed Espoo or Kauniainen jobseeker under 30. The private- or third-sector employer can receive 50% of wage costs, up to EUR 1,500/month, for 3–6 months. The employment can be part-time or full-time and fixed-term or permanent; the employer must secure the support before the employment begins.
- **Vantaa Nuorten rekrytointituki:** current Vantaa guidance covers an unemployed 18–29-year-old Vantaa jobseeker. A private- or third-sector employer can receive 50% of gross wage costs, up to EUR 1,500/month, for 3–6 months, including part-time or full-time work. Vantaa instructs the young person to contact their responsible employment-services official as part of the employer's application process, and the employment must not start before the support agreement.
- **Espoon rekrytointituki:** separate from the youth subsidy. Espoo can pay a private- or third-sector employer a discretionary EUR 5,000 one-off subsidy for hiring an unemployed Espoo resident who is **under 30 or foreign-language**, has been unemployed for at least three months and has upper-secondary or higher education. The employment must last at least 12 months at at least 80% working time and cannot start before the subsidy is granted.

Primary sources:
- Helsinki, jobseeker-facing youth subsidy: https://www.hel.fi/en/business-and-work/jobseekers/start-your-job-search/recruitment-subsidy-for-young-people
- Espoo, youth subsidy: https://www.espoo.fi/fi/nuorten-rekrytointituki
- Vantaa, youth recruitment support: https://www.vantaa.fi/fi/tyonhaku-ja-tyollistaminen/tyonantajapalvelut/rekrytoinnin-tuet-ja-etuudet/nuorten-tyontekijoiden-rekrytoinnin-tuet
- Espoo, EUR 5,000 recruitment subsidy: https://www.espoo.fi/en/rekrytointituki

Operator implication: when a young unemployed client in Helsinki/Espoo/Vantaa, or a foreign-language unemployed Espoo client, is actively talking to an employer, ask municipality, age, current unemployment status/duration, education, employer type, proposed contract length/hours and whether work has already started. Explain that the employer—not the jobseeker—applies for and receives the support. Never tell a family or employer that the subsidy is guaranteed; route them to the relevant local employment service before the start date.

'''
employment = replace_once(
    employment,
    '## Espoo service-access change from 1.9.2026\n',
    local_support_guidance + '## Espoo service-access change from 1.9.2026\n',
    "local recruitment support employment guidance insertion",
)
write(employment_path, employment)


# 4) Work/unemployment interview cheat sheet.
cheat_path = "workspaces/family-research/references/interview-cheatsheets/work-and-unemployment.md"
cheat = read(cheat_path)
cheat = replace_once(cheat, "Updated 2026-09-06.", "Updated 2026-09-08.", "cheat sheet date")
recruitment_cheat = '''## Local recruitment subsidies — useful hiring lever, not money for the client
**When to screen:** A young unemployed jobseeker in Helsinki/Espoo/Vantaa is talking with an employer, or an unemployed foreign-language Espoo client has a prospective employer.

**Nuorten rekrytointituki:** Helsinki and Espoo/Kauniainen currently use an under-30 criterion; Vantaa's current route is for unemployed 18–29-year-old Vantaa jobseekers. Current city pages publish employer support of 50% of wage costs, max EUR 1,500/month, generally for 3–6 months. Municipality-specific conditions still control.

**Espoon rekrytointituki:** A separate Espoo route can pay a private/third-sector employer a discretionary EUR 5,000 when hiring an unemployed Espoo resident who is under 30 **or foreign-language**, has at least three months of unemployment and has upper-secondary or higher education. The job must last at least 12 months at at least 80% working time.

**Who applies / gets the money?** The employer. The client does not receive the subsidy directly, and the support agreement/decision must be in place before the job starts.

**Ask:** Missä kunnassa asut? Kuinka vanha olet? Oletko nyt työtön työnhakija ja kuinka kauan? Onko sinulla toisen asteen tai korkeakoulututkinto? Onko työnantaja jo tiedossa? Onko työsuhteen kesto ja työaika sovittu? Onko työ jo alkanut? Onko työnantajalle kerrottu rekrytointituesta?

**Next:** If the route looks relevant, give the employer the correct city link and have the client/employer verify eligibility with the local employment service before the employment starts.

**Watch out:** Do not call this `palkkatuki`, do not promise that a client “has” the subsidy, and do not present EUR 1,500/month or EUR 5,000 as money paid to the jobseeker. These are separate local, discretionary employer supports with different conditions.

**Verify:**
- Helsinki: https://www.hel.fi/en/business-and-work/jobseekers/start-your-job-search/recruitment-subsidy-for-young-people
- Espoo youth subsidy: https://www.espoo.fi/fi/nuorten-rekrytointituki
- Vantaa: https://www.vantaa.fi/fi/tyonhaku-ja-tyollistaminen/tyonantajapalvelut/rekrytoinnin-tuet-ja-etuudet/nuorten-tyontekijoiden-rekrytoinnin-tuet
- Espoo EUR 5,000 subsidy: https://www.espoo.fi/en/rekrytointituki

'''
cheat = replace_once(
    cheat,
    '## Yleistuki\n',
    recruitment_cheat + '## Yleistuki\n',
    "recruitment subsidy interview logic insertion",
)
write(cheat_path, cheat)

print("Verified 2026-09-08 programme and employment updates applied.")
