# Pass 3 source records — Kela income, housing and social assistance

Checked: 2026-08-29. Scope: Finland, national Kela/Finlex routes only. Excludes student housing supplement, pensioners' housing allowance, disability/rehabilitation benefits and municipality/wellbeing-county supplementary assistance.

## src.finlex.yleistuki-act
Publisher: Finlex | level: official-primary | URL: https://www.finlex.fi/fi/lainsaadanto/2026/48 | authority_level: national-law | scope: Finland | volatility: medium | verification_state: verified | checked: 2026-08-29 | recheck: 2027-02-01
Claim supported: Yleistukilaki 48/2026 is the governing statute for the general social security benefit.
Confidence: high.

## src.kela.yleistuki-benefit
Publisher: Kela | level: official-primary | URL: https://www.kela.fi/unemployment-general-social-security-benefit | authority_level: national-authority | scope: Finland | volatility: high | verification_state: verified | checked: 2026-08-29 | recheck: every-case
Claim supported: current Yleistuki route, reporting worked hours/days and income changes, Kela decision boundary.
Confidence: high.

## src.kela.yleistuki-housing-combined-form-2026
Publisher: Kela | level: official-primary | URL: https://www.kela.fi/news/new-application-form-introduced-for-general-social-security-benefit-and-general-housing-allowance | authority_level: national-authority | scope: Finland | volatility: high | verification_state: verified | checked: 2026-08-29 | recheck: 2026-11-29
Claim supported: since May 2026 the same OmaKela form can be used to apply for Yleistuki and general housing allowance, and to report changes affecting them; Kela still gives separate decisions.
Confidence: high.

## src.kela.general-housing-allowance
Publisher: Kela | level: official-primary | URL: https://www.kela.fi/general-housing-allowance | authority_level: national-authority | scope: Finland | volatility: high | verification_state: verified | checked: 2026-08-29 | recheck: every-case
Claim supported: household-based benefit, housing types in scope, main factors, application route, one-month retroactive rule, Kela decision boundary.
Confidence: high.

## src.kela.housing-income-assets
Publisher: Kela | level: official-primary | URL: https://www.kela.fi/housing-allowance-income-and-assets | authority_level: national-authority | scope: Finland | volatility: high | verification_state: verified | checked: 2026-08-29 | recheck: every-case
Claim supported: household income/assets, accepted housing costs, municipality-specific maximums, and reporting thresholds including +EUR 400/month income, -EUR 200/month income and housing-cost changes.
Confidence: high.

## src.finlex.general-housing-allowance-act
Publisher: Finlex | level: official-primary | URL: https://finlex.fi/fi/lainsaadanto/2014/938 | authority_level: national-law | scope: Finland | volatility: medium | verification_state: verified | checked: 2026-08-29 | recheck: 2027-02-01
Claim supported: Kela implements general housing allowance; statutory household/application/reporting framework and up-to-one-month retroactive grant rule.
Confidence: high.

## src.kela.social-assistance
Publisher: Kela | level: official-primary | URL: https://www.kela.fi/social-assistance | authority_level: national-authority | scope: Finland | volatility: high | verification_state: verified | checked: 2026-08-29 | recheck: every-case
Claim supported: basic social assistance is last-resort support and income/assets affect it; other primary benefits should be checked first.
Confidence: high.

## src.kela.social-assistance-expenses
Publisher: Kela | level: official-primary | URL: https://www.kela.fi/social-assistance-for-what-expenses | authority_level: national-authority | scope: Finland | volatility: high | verification_state: verified | checked: 2026-08-29 | recheck: every-case
Claim supported: basic-amount expense categories, housing-cost limits and current 2026 basic-amount context.
Confidence: high.

## src.kela.social-assistance-basic-amount
Publisher: Kela | level: official-primary | URL: https://www.kela.fi/social-assistance-basic-amount | authority_level: national-authority | scope: Finland | volatility: high | verification_state: verified | checked: 2026-08-29 | recheck: 2026-12-15
Claim supported: current basic-amount table for 1 March–31 December 2026.
Confidence: high.

## src.kela.social-assistance-how-to-apply
Publisher: Kela | level: official-primary | URL: https://www.kela.fi/social-assistance-how-to-apply | authority_level: national-authority | scope: Finland | volatility: high | verification_state: verified | checked: 2026-08-29 | recheck: every-case
Claim supported: OmaKela/application path, supporting documents and normal handling target after required documents are received.
Confidence: high.

## src.kela.social-assistance-changes
Publisher: Kela | level: official-primary | URL: https://www.kela.fi/social-assistance-notify-kela-of-changes | authority_level: national-authority | scope: Finland | volatility: high | verification_state: verified | checked: 2026-08-29 | recheck: every-case
Claim supported: examples of changes that must be reported and the change-notification route.
Confidence: high.

## src.finlex.social-assistance-act
Publisher: Finlex | level: official-primary | URL: https://finlex.fi/fi/lainsaadanto/1997/1412 | authority_level: national-law | scope: Finland | volatility: medium | verification_state: verified | checked: 2026-08-29 | recheck: 2027-02-01
Claim supported: social assistance is last-resort support; family/household, income/assets, application and notification framework.
Confidence: high.

## Review note
The older registry currently uses `src.kela.yleistuki` for a calculator URL while `src.kela.yleistuki-benefit` is the actual benefit page. Do not silently replace the older verified record; this Pass 3 ledger treats `src.kela.yleistuki-benefit` as the operational benefit source and leaves the older ID for human reconciliation.