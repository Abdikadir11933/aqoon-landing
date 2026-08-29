# Pass 3 — Kela income and housing foundation

Date checked: 2026-08-29

## Scope

Population: adults and families in Finland navigating current Kela unemployment-income support, general housing allowance and basic social assistance.

Geography: national Finland/Kela rules only.

Included: Yleistuki, general housing allowance, basic social assistance, official calculators, household/input maps, change reporting, Kela/employment-authority/wellbeing-services-county boundaries.

Excluded: student housing supplement, pensioners' housing allowance, disability/rehabilitation benefits, pregnancy/parental/family benefits, supplementary/preventive social assistance details, wellbeing-services-county service trees, municipality/provider housing services and any case-specific amount calculation.

## What is now verified

1. Yleistuki is the current Kela basic unemployment-income benefit route under the 2026 Yleistuki law; the existing canonical Yleistuki service remains in place and Pass 3 adds current source/route linkage rather than silently overwriting it.
2. General housing allowance is a Kela household-based route. Household composition, municipality, housing costs, income/assets and student/pension status are route-changing facts. Current Kela change-reporting thresholds and municipality-specific limits are high-volatility and must be rechecked for each real case.
3. Basic social assistance is last-resort support. Kela decides the benefit; primary benefits and, where relevant, job-search duties must be checked rather than bypassed. Separate supplementary/preventive assistance and social-work routes belong to wellbeing-services counties.
4. Kela's official calculators for Yleistuki, general housing allowance and social assistance provide estimates only. Calculator use does not establish entitlement, accepted costs, reduction decisions or payment amounts.
5. Since May 2026 Kela's OmaKela form can be used for both Yleistuki and general housing allowance applications/change reporting, while Kela still issues separate decisions.

## Route matrix

| Family/adult goal | Required facts | Decision authority | Official next step | AQOON may do | AQOON must not do | Recheck |
|---|---|---|---|---|---|---|
| Current unemployment-income support | work/unemployment and jobseeker status, dates, work hours/days, income, other benefits, living arrangement | Kela; employment authority for job-search duties | current Yleistuki/OmaKela route and required employment-service steps | explain, collect facts, prepare, remind/report changes | decide entitlement, amount or start date | every case |
| Help with rent/housing costs | household members, municipality, tenure/costs, income/assets, move date, student/pension status | Kela | general housing allowance/OmaKela | gather household inputs, explain branches, prepare, calculator estimate | define household or accepted costs, promise amount/retroactivity | every case |
| Last-resort basic assistance | family unit, income/assets, primary benefits, job-search status where relevant, expenses/docs, urgency | Kela; wellbeing-services county for separate social-support routes | primary benefits where relevant, then Kela application/documents | explain, prepare document checklist, help change report/referral | decide eligibility/reduction/accepted expenses/amount | every case |

## Operator questions

These are information-gathering questions, not eligibility tests:

- What support are you receiving, waiting for or recently decided?
- What is your current work/unemployment/study/pension situation?
- Is your job search active, and have work hours or income changed?
- Who lives in the home now, and has the household changed?
- What is the municipality, housing type and current rent/housing cost?
- Has household monthly income recently increased or decreased?
- Are there assets/other income Kela asks about for the route?
- For social assistance, which primary benefits have already been applied for or are still unresolved?
- Do you have the supporting bank statements/bills/documents Kela requests? Keep them in the private case workflow, never GitHub.
- Is there an urgent need or broader social-work need requiring official escalation?

## PII-free outcome evidence

- **Assisted action:** the official Kela application/change report is started or submitted with the person's approval, or the required document package is prepared and the correct official form is opened.
- **Verified outcome:** a Kela decision, official information request, confirmed payment/status or official wellbeing-services-county handoff is evidenced in the protected private case system. The decision/document itself is never copied to public GitHub.
- **Persistence:** at the agreed follow-up point, required Kela information requests and material change reports have been handled or the case has been escalated to the correct authority. Aggregate reporting records only the route/status/outcome category, not family financial details.

## Gaps / verification pending

- Exact Finlex section-by-section mapping for every February/March 2026 social-assistance reduction and job-search amendment remains `verification_pending` for any case where the exact legal consequence is material; Kela's current official reform guidance is operationally verified, but AQOON must not decide a reduction.
- Student housing supplement and pensioners' housing allowance need separate later service/route records.
- Supplementary/preventive social assistance and social-work escalation require Pass 7 wellbeing-services-county mapping.
- Interactions with family benefits, disability/rehabilitation, student benefits and pensions remain outside this pass.
- Municipality-specific housing-cost tables and any current euro/basic-amount values are HIGH/LIVE data: verify at case time rather than freezing them into operator promises.
- Existing source-ID inconsistency: `src.kela.yleistuki` points to a calculator while `src.kela.yleistuki-benefit` is the current benefit page. Human reconciliation is required; old verified record retained.

## Files created by Pass 3

- `references/sources/kela-income-housing-social-assistance-pass3.md`
- `references/services/kela-income-housing-social-assistance.md`
- `references/routes/kela-income-housing-social-assistance-current.md`
- `references/calculators/kela-income-housing-social-assistance-pass3.md`
- this dated pass record

Coverage register is updated separately after these records are verified in-repo.

## Human review gate

Required before these new/changed high-volatility records guide a real family. Review should especially reconcile the older Yleistuki source ID and approve the Pass 3 route wording/change-reporting thresholds. Public guidance is not deployed automatically.

## Next pass

Pass 4 only: family and child lifecycle — pregnancy to daycare, national first and then Vantaa, Helsinki and Espoo separately.