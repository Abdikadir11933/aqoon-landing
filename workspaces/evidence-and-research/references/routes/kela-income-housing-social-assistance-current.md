# Kela income, housing and basic social assistance routes — Pass 3

Checked: 2026-08-29. Geography: Finland. Population: adults/families navigating current Kela income, general housing allowance and basic social assistance. Excludes student housing supplement, pensioners' housing allowance, supplementary/preventive social assistance, disability/rehabilitation benefits and municipality-specific housing/provider routes.

## route.kela.yleistuki.current

**Family/adult goal:** understand and start the current Kela unemployment-income route without treating it as automatic entitlement.

**Required facts (information-gathering):** current unemployment/work status; active jobseeker status and relevant dates; whether earnings-related unemployment allowance is relevant/ongoing/exhausted if known; worked days/hours; earned income; other income/capital income; other benefits; living arrangement; application/change-report status.

**Authority:** Kela decides Yleistuki entitlement, amount and payment period. Employment authorities decide jobseeker-service matters; AQOON must keep those boundaries separate.

**Official next step:** use the current Kela Yleistuki page/OmaKela application route. Since May 2026 the same OmaKela application form can be used for Yleistuki and general housing allowance, but Kela issues separate decisions. Report worked hours/days and material income or circumstance changes through the official Kela route.

**AQOON may do:** explain what information Kela asks for; help distinguish Kela and employment-authority steps; prepare supporting facts/documents; help open the official application; remind the person to report changes; explain a Kela decision without re-deciding it.

**AQOON must not do:** say the person qualifies; promise amount/start date; infer eligibility from immigration background; substitute a calculator estimate for a decision; tell a person to ignore employment-service obligations.

**Source IDs:** `src.kela.yleistuki-benefit`, `src.finlex.yleistuki-act`, `src.kela.yleistuki-housing-combined-form-2026`.

**Volatility/recheck:** HIGH — verify current Kela page for every case; recheck law at least every 6 months or on reform notice.

**Outcome definition:** assisted action = official application/change report started or submitted with the person's approval; verified outcome = private-case evidence of Kela's decision/official request or confirmed payment status, never copied into GitHub; persistence = agreed follow-up confirms the route remains current or a required change has been reported.

## route.kela.general-housing-allowance.current

**Family/adult goal:** check whether general housing allowance is the correct housing-support route and prepare the official application/change report.

**Required facts (information-gathering):** who belongs to the household; adults/children; municipality; housing tenure; rent or other housing costs; move/start date; household earned/capital income; household assets; student status; pension status; existing housing benefit/application; known upcoming changes.

**Authority:** Kela decides household composition for the benefit, entitlement, accepted housing costs, amount and payment period.

**Official next step:** apply/report changes in OmaKela using Kela's current general housing allowance route. Kela states the allowance is household-based and can be granted retroactively only within the statutory application window; do not assume retroactivity for a case.

**Change-report triggers to ask about:** move or household-composition change; income increases or decreases meeting Kela's current thresholds; changes in housing costs; study/pension-status changes; other circumstances listed on the current Kela page. As checked 2026-08-29, Kela's published income-change thresholds include an increase of at least EUR 400/month and a decrease of at least EUR 200/month. Treat these as HIGH-volatility and recheck before advising a real household.

**AQOON may do:** identify the likely correct Kela housing-support branch; collect household/input facts; explain accepted-cost versus actual-rent distinction; prepare application documents; open the current calculator for a rough estimate; remind about change reporting.

**AQOON must not do:** promise a percentage/euro result; decide who Kela treats as one household; guarantee that all rent is accepted; promise retroactive payment; use a calculator as a decision; route a student/pensioner automatically without checking the current special housing-support rule.

**Source IDs:** `src.kela.general-housing-allowance`, `src.kela.housing-income-assets`, `src.finlex.general-housing-allowance-act`, `src.kela.yleistuki-housing-combined-form-2026`.

**Volatility/recheck:** HIGH — every case, especially municipality cost limits, income thresholds, student/pension branches and application timing.

**Outcome definition:** assisted action = application/change report submitted or all required application facts/documents prepared and official form started; verified outcome = private-case evidence of Kela's decision or official request; persistence = later check confirms the household has responded to Kela requests and material changes are reported.

## route.kela.basic-social-assistance.current

**Family/adult goal:** navigate last-resort basic social assistance safely when income/assets may not cover necessary expenses.

**Required facts (information-gathering):** family/household unit; current income and assets; bank-account/document availability; primary benefits applied/pending/decided; employment/jobseeker status when relevant; housing costs; other necessary expenses and bills; recent changes; urgency; whether a social-work or supplementary/preventive-assistance need exists.

**Authority:** Kela decides basic social assistance, accepted income/assets/expenses, any reduction of the basic amount, amount and decision period. The wellbeing-services county handles separate supplementary/preventive assistance and social-work routes where applicable.

**Official next step:** first check/apply for relevant primary benefits, then use Kela's basic social assistance application in OmaKela with required supporting documents. Kela's current guidance states normal handling is targeted within seven working days after the necessary application information/documents are received; this is not an approval promise or guaranteed payment date.

**2026 rule context:** Kela's official reform guidance says stricter primary-benefit and job-search requirements took effect from February 2026 and can affect the basic amount in specified situations. Operators must not decide whether a reduction applies. Exact case effect is a Kela decision and any legally material detail should be rechecked from the current Kela/Finlex text.

**Change reporting:** ask whether income, assets, benefits, expenses, housing, homelessness, family composition, relationship status or jobseeker status has changed; use Kela's current change-notification route.

**AQOON may do:** explain why primary benefits matter; prepare the application/document checklist; help organize bills/bank-statement requirements without storing them in GitHub; help submit a change notification; identify when a wellbeing-services-county referral is also needed.

**AQOON must not do:** declare a person eligible/ineligible; decide a basic-amount reduction; promise accepted expenses or an amount; tell a person to stop job search; store bank statements/family financial details in public repo; present social assistance as the first/default benefit when a primary benefit route is unresolved.

**Source IDs:** `src.kela.social-assistance`, `src.kela.social-assistance-expenses`, `src.kela.social-assistance-basic-amount`, `src.kela.social-assistance-how-to-apply`, `src.kela.social-assistance-changes`, `src.finlex.social-assistance-act`.

**Volatility/recheck:** HIGH — every case. Current basic-amount tables, housing-cost limits, primary-benefit duties and job-search consequences require live verification.

**Outcome definition:** assisted action = official application/change report submitted or supporting-document package prepared and official form started; verified outcome = private-case evidence of Kela decision/request plus, when referred, confirmed wellbeing-services-county contact; persistence = follow-up confirms requested documents/changes were handled and unresolved urgent needs were escalated to the correct official service.

## Route matrix

| Goal | Required facts | Authority | Next official step | AQOON may do | AQOON must not do | Recheck |
|---|---|---|---|---|---|---|
| Unemployment-income support | jobseeker/work status, dates, work/income, other benefits, living arrangement | Kela; employment authority for job-search duties | Kela Yleistuki/OmaKela + required jobseeker-service steps | explain, prepare, remind, help report changes | decide entitlement/amount/start | every case |
| Housing support | household, municipality, tenure/costs, income/assets, student/pension status | Kela | general housing allowance/OmaKela | collect inputs, explain branches, prepare, estimate only via official calculator | promise amount, household definition, accepted rent | every case |
| Last-resort basic assistance | family unit, income/assets, primary benefits, job-search status if relevant, expenses/docs, urgency | Kela; wellbeing-services county for separate social-assistance/social-work routes | primary benefits first where relevant, then Kela application + documents | explain, prepare docs, help change report/referral | decide eligibility/reduction/accepted expense | every case |

## Operator questions — information gathering, not eligibility questions

- What support are you receiving or waiting for now, and have you received any recent decision or request for more information?
- Are you currently unemployed, working some hours, studying, on pension, or in another situation that changes the route?
- Is your job search active, and has anything changed in your work hours or income since the last report?
- Who lives in the same home with you, and has anyone moved in or out recently?
- What is the housing type, municipality and current rent/housing cost, and has it changed?
- Has anyone in the household's monthly income recently increased or decreased?
- Are there savings/assets or other income that Kela asks about for this benefit?
- For social assistance, have the primary benefits Kela expects already been applied for, or are any still unresolved?
- Do you have the current bank statements, bills and other documents Kela asks for, without sending them to AQOON's public repository?
- Is there an urgent housing/food/medication/safety need or a broader social-work need that requires an official escalation alongside the Kela application?