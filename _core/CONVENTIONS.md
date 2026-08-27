# AQOON Core Conventions

## Core rule

One fact, one canonical home. References point to IDs; they do not duplicate mutable claims.

## Record IDs

Use stable dot-separated IDs:
- `authority.kela`
- `service.kela.yleistuki`
- `route.daycare.vantaa`
- `src.kela.yleistuki`
- `evidence.pilot.<slug>`

## Volatility

- `low`: stable roles/methodology; scheduled review.
- `medium`: service processes/city routes; periodic review.
- `high`: benefits, fees, immigration rules, employment subsidies, education requirements; verify for each consequential use.
- `live`: jobs, programme openings, deadlines, places/capacity; always verify immediately before use.

## Verification states

`verified` | `verification_pending` | `superseded` | `retired` | `discovery_only`

## Matching states

`confirmed-match` | `possible-must-confirm` | `does-not-fit`

A confirmed match is never an approval promise.

## Source order

1. AQOON primary evidence for AQOON-owned claims.
2. Official primary source for rights, eligibility, law and public procedures.
3. Provider primary source for a specific provider/programme.
4. Research/secondary source for background and business evidence.
5. Discovery-only sources for finding what must be verified elsewhere.

## Language

Public Somali should sound like clear, modern spoken-to-written Somali, not literal translation or bureaucracy. Keep familiar Finnish system/service names where recognition matters and explain them in Somali. See `_core/policies/localization.md`.

## Protected area

`pilke/` is protected. Do not change it unless explicitly requested.
