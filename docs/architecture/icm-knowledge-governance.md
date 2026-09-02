# AQOON ICM / Knowledge Governance Architecture

The repository is organised as a context router around existing production routes. The architecture deliberately does not move `/caawi`, `/tracker` or `/pilke` simply for folder aesthetics. ADR 0004 is the explicit, redirect-preserving migration that consolidated Somali family guidance from `/so/*` into the canonical `/caawi/*` family surface.

Knowledge flow is one-way:

`official/provider sources -> verified canonical records -> family research / public Somali guidance / product logic -> case-specific outputs`

Business evidence flows separately:

`AQOON primary data -> evidence registry -> business architecture -> messaging -> activation`

Operational learning closes a controlled loop:

`private case work -> PII-free scenario -> source verification -> human review -> operator guidance / public content -> new measured outcomes`

The loop may improve recommendations and content, but private case facts never become public knowledge and automated QA never silently promotes a draft into authoritative advice.

Private operational data stays outside public GitHub. This document records the architecture; `CLAUDE.md`, `CONTEXT.md`, `_core/` policies/schemas and workspace stage contracts implement it.
