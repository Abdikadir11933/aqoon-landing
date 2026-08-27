---
name: production-releasing
description: Release AQOON changes safely to production. Use after code, SEO, tracker, intake, Supabase, or infrastructure changes when the user expects a deployed result or asks whether a change is live.
---

# Production release

1. Inspect the final diff and confirm unrelated UI/routes were not changed.
2. Run the relevant repository, site, SEO, usability, legal, syntax and regression checks.
3. For Supabase changes, verify migration state, RLS/auth boundaries and the deployed Edge Function version.
4. Commit with a focused message. Batch related audit fixes where practical to avoid unnecessary deploy churn.
5. Check CI/status for the exact commit.
6. Check Vercel for a deployment whose Git SHA is the intended commit and whose state is READY.
7. Verify critical production routes after deploy when access permits.
8. Never call code “live” when Vercel is queued, failed, rate-limited, building, or still serving an older commit.
9. Distinguish external deployment blockers from code failures in the final report.
