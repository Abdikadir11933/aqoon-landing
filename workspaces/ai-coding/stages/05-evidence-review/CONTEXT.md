# Stage 05 — evidence review

## Inputs

The working diff, test results and, when relevant, live route or database
responses.

## Process

Review the diff against the brief. Check for stale wording, duplicate sources,
broken imports, collection/column drift, PII leakage, auth/RLS regressions and
generated-file mismatch. Distinguish observed results from assumptions and
planned behavior.

## Outputs

A concise evidence record: verified, not verified, changed, and remaining risk.
No “done” label is allowed for an unverified production claim.
