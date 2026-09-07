# Agent context foundation review — 2026-09-07

Scope: repository structure, instruction clarity, skill discovery, canonical context, dated evidence and reusable task flow. Base: `d0d3300a8f6754baebcf5ef9690619a8efcd5d03` on `master`. The user authorized updating, committing and pushing this foundation. This review does not claim a new runtime, database or website UX audit.

## Assessment

AQOON already had a useful progressive context architecture. Its main weakness was drift between working instructions and newer business/evidence context. A wholesale folder migration would add route risk without solving that problem. The changes retain the existing root router, workspaces and physical application paths, make context ownership explicit and add enforceable navigation checks.

All 461 tracked paths at the base commit were inventoried. The review focused on the 32 existing AGENTS/CLAUDE/CONTEXT routing files, seven skills, their relevant canonical references, stage contracts and QA discovery rules. Historical reports remain dated evidence. Inventory coverage is not a claim that every runtime implementation or private connected record was re-audited in this task.

| Base area | Tracked files | Ownership |
|---|---:|---|
| Root files | 14 | Runtime entry/configuration and root guidance |
| `.claude`, `.github`, `_core` | 36 | Skills, CI and shared conventions |
| `assets`, `caawi`, `tracker`, `supabase` | 169 | Application and data implementation |
| `docs`, `workspaces` | 148 | Architecture, briefs, evidence and task workflows |
| `scripts`, `tests`, `seo` | 63 | QA, regression and search discovery |
| `design-ref`, `internal` | 10 | Reference material, public despite the folder names |
| Other existing public route folders | 21 | Content, campaigns, legal/privacy and training |
| Total | 461 | Current Git tree remains the complete file inventory |

## Changes and rationale

| Finding | Change |
|---|---|
| No clear human entry point | Added README with task destinations and actual static-site setup |
| Codex skill discovery was implicit | Added `.agents/skills` symlinks to the single canonical `.claude/skills` collection |
| E2E skill lacked discovery metadata; QA checked only five named skills | Added metadata and validation of every discovered skill, including the new website review skill |
| Context, quotations and historical instructions could be confused | Defined instruction scope, source roles, conflict handling and continuation of existing authorization |
| New tasks lacked distinct routes | Added strategy context and a concrete website-review procedure |
| Content instructions required the founder's face/voice and prohibited formats without supporting current context | Made on-camera appearance optional, supported faceless explainers and kept historical production uncertainty explicit |
| Unmaintained CRM dates could trigger incorrect backlog diagnoses | Added reliability rules and a demand/business analysis path |
| Messaging maintained an older offer hierarchy | Routed offer decisions to the canonical Phase 1 / Phase 2 model |
| “Latest” evidence pointers were scattered | Added a single index and separate dated demand, TikTok and founder-clarification records |
| Planned channels could read as completed capability | Distinguished observed activity, reported practice and proposed connector networks |
| Tracker coding instructions implied a JavaScript bundle | Corrected the contract to explicit JS loading and generated CSS only |
| Stage handoffs were uneven | Completed family-research Inputs/Process/Outputs and added one reusable task record |
| Broken context links and discovery drift lacked CI coverage | Added context QA to existing site CI; kept runtime guards intact |

## Framework comparison

Jake Van Clief's [routing example](https://github.com/RinDig/Content-Agent-Routing-Promptbase) and the [ICM preprint](https://arxiv.org/html/2603.16021v2) informed the comparison: a small entry point, local task context and explicit stage handoffs. AQOON already followed much of that structure. The adaptation adds maintenance and discovery rather than cloning an example repository or moving live pages into numbered folders.

OpenAI's [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) and [skills](https://learn.chatgpt.com/docs/build-skills) documentation informed the distinction between automatic discovery and explicitly routed references. [Astra guidance](https://developers.openai.com/api/docs/guides/latest-model) informed the review of conflicting instructions, unnecessary pauses and excessive verification. These are design inputs, not benchmark evidence of token savings or universal optimality.

## Verification

- `python scripts/context_qa.py`: passed for maintained links, stage contracts, matching skill symlinks and top-level folder ownership.
- `python scripts/repo_integrity_qa.py`: passed, including metadata for all eight skills and existing architecture/runtime guards.
- Skill Creator's `quick_validate.py`: passed for all eight skills.
- Controlled canaries: a missing Markdown target, a skill linked to the wrong canonical folder and a stage missing Outputs each produced the expected failure. Original files were restored and context QA passed again.
- `git diff --check`: passed.
- Manual route review: website critique reaches buyer/UX context and current evidence; a content review reaches scoped content sections and analytics limitations; business assessment reaches strategy with private financial inputs; a tracker change reaches local implementation contracts; context maintenance reaches canonical owners and focused checks. This was a document-route review, not a multi-agent benchmark or a fresh browser audit.

## Boundaries and next task

No public application HTML, CSS, JavaScript, route configuration, protected Pilke page, Supabase migration or function was changed. CI gained the context check. Private correspondence, family records, financial details and raw TikTok exports were not copied into GitHub. The new public evidence summaries preserve limitations and do not assert causality, a national market size or profitable unit economics.

The next requested task is the current website review, especially the homepage. Its procedure is now discoverable at `.claude/skills/website-review/SKILL.md`; actual browser inspection, critique and implementation remain separate work. Future sessions must verify their available connections rather than assume access from this report.
