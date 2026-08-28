# Bridge family pack — verified AQOON records

**Status:** verified routing knowledge; operator review required  
**Checked:** 2026-08-28  
**Recheck due:** 2026-09-27  
**Origin:** Bridge Finland migration queue, independently refreshed from current primary sources.

## Active routes

| Route | Decision-maker | Match purpose | AQOON must not |
|---|---|---|---|
| route.finland.child-benefit | Kela | Identify whether the family should check/apply for child benefit | decide residency/coverage or quote an unverified amount |
| route.finland.child-home-care-allowance | Kela | Identify a possible home-care route and missing facts | calculate payment or ignore same-child benefit conflicts |
| route.vantaa.kunnallinen-varhaiskasvatus | Vantaan kaupunki | Prepare a municipal early-childhood application | promise a place, area, start date or fee |
| route.vantaa.private-varhaiskasvatus-palveluseteli | Vantaan kaupunki + approved private provider | Explain an optional private/service-voucher route | replace the municipal route, promise availability or conceal a commercial relationship |

## Primary sources

- [Kela: Child benefit](https://www.kela.fi/child-benefit)
- [Kela: Child home care allowance](https://www.kela.fi/child-home-care-allowance)
- [Vantaa: applying for early-childhood education](https://www.vantaa.fi/fi/kasvatus-ja-koulutus/varhaiskasvatus/varhaiskasvatukseen-hakeminen)
- [Vantaa: private early-childhood service voucher](https://www.vantaa.fi/fi/yksityisen-varhaiskasvatuksen-palveluseteli)
- [Vantaa: early-childhood education fees](https://www.vantaa.fi/fi/kasvatus-ja-koulutus/varhaiskasvatus/varhaiskasvatuksen-asiakasmaksut)

## Route-changing facts

### Child benefit

Ask only:

1. Is the child under 17?
2. Is the person a parent, guardian or responsible caregiver?
3. What is the Finland residence or employment context?
4. Is child benefit already being paid?

Kela states that the standard route requires a child under 17, a parent/guardian/responsible caregiver, and permanent residence in Finland with the child. Moving and cross-border work can change the route, so AQOON must use a possible-must-confirm result where that context is not straightforward.

### Child home care allowance

Ask only:

1. Is the youngest child under 3?
2. Does the child attend municipal early-childhood education?
3. Is parental allowance or private day care allowance paid for that same child?
4. Who is the parent, guardian or responsible applicant?

The normal route is for a child under 3 who does not attend municipal day care. It cannot be treated as a generic “child cared for at home” match. AQOON does not calculate the amount.

### Vantaa municipal early-childhood education

Ask:

1. Is Vantaa the relevant municipality?
2. Child age/date of birth.
3. Desired start date.
4. Care schedule and preferred area.
5. Whether a qualifying urgent work/study need exists.

The usual application timing is four months before the need; an August start should be applied for by April. A qualifying urgent need has its own proof-based process. The city decides the place.

### Vantaa private service voucher

Ask:

1. Is the family permanently resident in Vantaa?
2. Child age/date of birth, desired start and care schedule.
3. Preferred provider or area.
4. Is the provider in Vantaa's approved voucher network?
5. Can the family complete the official income statement for the value/fee decision?

Always show the municipal route as well. The private route is optional. The family uses the VaSa application and selects the private provider as first preference; provider availability and any separate provider application must be confirmed. The voucher is income-based, and AQOON must not calculate its value or the family fee. Any paid provider relationship must be disclosed before referral.

## Tracker-preview behavior

For all four routes:

- show a confirmed match only when all route-changing facts are known and the source is current;
- otherwise show possible-must-confirm with the exact next question or official check;
- never surface an internal source record to the family as an official decision;
- never collect documents, exact income or other sensitive information merely to make a preview look more certain.

## Data boundary

These records contain only generalized route knowledge. Family facts, contacts, documents, applications and outcomes remain in protected Supabase case records, never public GitHub.
