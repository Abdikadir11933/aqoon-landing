# Portfolio walkthrough publication

## Task and scope

The owner approved the read-only review's recommendations: remove the portfolio's AQOON business-site CTA, make walkthroughs the primary evidence, clarify SafkaStock's side-project contribution and current scope, and refresh the PDF. No business-site, family, tracker, protected campaign or backend changes.

## Implementation

Canonical portfolio copy and the new `dist/safkastock.html` are maintained in `Abdikadir11933/aligure-portfolio`. This export adds `/portfolio/safkastock`, with a labelled synthetic calculation example and implementation pointers, not private code or customer records. `docs/showcase.md` keeps AQOON's code/test evidence and now opens with the student's summer pilot work. Its business-site links were removed.

## Verification

Content generation, JavaScript syntax, context, integrity, site, metadata, usability and legal/trust checks passed. The existing unrelated `pkv-treeni` accessibility warning remains. The changed PDF pages were rendered and visually inspected. Record exact commit CI and live route verification in the release handoff. No fresh SafkaStock runtime or test-suite execution is claimed.

## Recovery

Revert this focused export and the matching source update together. The working SafkaStock repository and visibility are unchanged.
