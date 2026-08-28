# Pass 0 — baseline and terminology verification

Checked: 28 August 2026. Scope: existing public canonical records only. This pass does not add new family guidance.

## Verified baseline

- **Employment authority terminology**: TE offices ended on 31 December 2024 and employment services moved to municipal employment areas on 1 January 2025. Job Market Finland/Asiointi remains the national digital entry point. Use `työllisyyspalvelut` / employment area as default terminology; describe `TE-toimisto` only as legacy language. Source: [Työmarkkinatori](https://tyomarkkinatori.fi/en/news/uudenmaan-te-toimisto-lakkautetaan-ja-tyonhakijoiden-palvelut-siirtyvat-tyollisyysalueille-1.1.2025).
- **Employment source landscape**: Työmarkkinatori currently separates registration, plan/initial-interview information, study routes, unemployment-security information, integration services, work ability and entrepreneurship into distinct pages. One employment source cannot support all of those route claims. Source: [Työmarkkinatori personal customers](https://tyomarkkinatori.fi/henkiloasiakkaat).
- **Yleistuki calculator boundary**: Kela's calculator remains an official estimator, not a decision source; browser inspection did not expose a reusable decision result. Keep the current “estimate only / Kela decides” boundary.
- **Permanent-residence route**: Migri continues to own the decision. Existing record correctly rejects the shortcut “years in Finland + YKI = citizenship”; permanent residence and citizenship require separate current-route verification.

## Source-registry debt

The following source IDs are referenced by canonical records but do not appear in `references/sources/source-records-2026.md` and need formal source records before their claims are expanded:

- `src.finlex.varhaiskasvatus`
- `src.city.current-daycare`
- `src.oph.s2-2026` (referenced but source record should be rechecked against current OPH page)
- any local Vantaa/Helsinki/Espoo employment-area source used in later city routes

`src.jobmarket.te24` is valid evidence for the 2025 transfer, but it is a change/news page. Future registration, plan, jobseeker-duty and municipal-contact records require their own standing current pages.

## Terminology rules preserved

- `työllisyyspalvelut` / employment area: current default.
- `TE-toimisto`: legacy explanation only.
- `yleistuki`: current Kela term; do not present `työmarkkinatuki` or `peruspäiväraha` as current Kela routes without historical context.
- `confirmed match`: an AQOON operator label only; it never replaces an authority, provider, school, employer or Kela decision.

## Pass 0 acceptance result

Baseline terminology is now explicit and the source-register gaps are visible. The employment/integration domain is **not** yet fully researched. Do not use this report to make new case-specific claims.

## Next pass

Pass 1: integration, jobseeker registration and employment plans. It must create formal source records first, then extract only current primary-source route logic and municipal implementation boundaries.
