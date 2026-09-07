---
name: website-review
description: Audit AQOON's current website and especially its homepage from a buyer, UX, conversion, accessibility and SEO perspective. Use for critique, revised page structure, copy recommendations or an implementation brief; not for automatic redesign, publishing or a general business pivot.
---

# Website review

## Load the relevant context

Read root `CONTEXT.md`, `workspaces/product-qa/CONTEXT.md`, `BRAND.md`, `docs/architecture/business-operating-model.md` and the evidence index at `workspaces/evidence-and-research/references/aqoon-evidence-index.md`. Load messaging references for copy decisions and `seo/CONTEXT.md` for SEO checks. Inspect the current website and repository implementation; earlier screenshots are dated evidence.

## Review the buyer's journey

1. Confirm the actual live URL and distinguish deployed behavior from local code. Inspect the homepage first, then each relevant navigation, offer, method, evidence and contact page on desktop and mobile. Record coverage and unavailable pages. Use browser screenshots and interaction checks; do not claim visual inspection from HTML alone.
2. Evaluate the first screen as a buyer unfamiliar with AQOON: what is offered, to whom, which costly problem it solves, what outcome is credible, why AQOON and what to do next. Distinguish a heuristic judgment from a timed user test.
3. Check information order, offer clarity, concrete language, evidence near claims, objection handling, trust, contact friction and the separation of buyer and family journeys. Assess whether the site makes the existing offer understandable without introducing services or capacity that are only planned.
4. Inspect mobile navigation, readability, hierarchy, spacing, interaction states, keyboard/focus behavior, labels, contrast and form usability. Check technical SEO, search intent and performance with appropriate tools. Report measured results separately from visual estimates. Avoid live form submissions that contact people unless authorized.
5. Compare relevant primary guidance and a small set of comparable sites. Verify expert names and exact sources before attributing ideas to Tony Fadell's Build, Jake Van Clief or any named SEO expert. Extract applicable principles; do not imitate a personality or invent quotations. Explain why each comparison fits AQOON's buyer and maturity.

## Deliver a concrete brief

Lead with the main verdict and the five highest-impact changes. For each finding give the page/section, observed evidence, buyer consequence, recommended change, priority and effort. Include what already works and should be retained.

Then provide a proposed homepage section order, Finnish draft hero/subheading/CTA and key revised copy, proof placement, mobile-specific changes and a prioritized implementation brief with acceptance criteria. Preserve claim limitations: views are not outcomes and early pilots do not prove national effectiveness. Identify unavailable evidence rather than filling gaps with invented metrics.

Complete the audit and proposed changes before seeking decisions. An audit request authorizes investigation and recommendations; implement and deploy only to the extent the user's task authorizes those actions. Use `workspaces/ai-coding/CONTEXT.md` for authorized implementation and record actual checks and coverage in the handoff.
