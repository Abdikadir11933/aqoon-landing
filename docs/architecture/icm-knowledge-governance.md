# AQOON ICM / Knowledge Governance Architecture

The repository is organised as a context router around existing production routes. The architecture deliberately does not move `/caawi`, `/tracker`, `/so` or `/pilke` simply for folder aesthetics.

Knowledge flow is one-way:

`official/provider sources -> verified canonical records -> family research / public Somali guidance / product logic -> case-specific outputs`

Business evidence flows separately:

`AQOON primary data -> evidence registry -> business architecture -> messaging -> activation`

Private operational data stays outside public GitHub. This document records the architecture; `CLAUDE.md`, `CONTEXT.md`, `_core/` policies/schemas and workspace stage contracts implement it.
