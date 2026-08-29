-- The revision-capture trigger function is SECURITY DEFINER (see
-- 20260829_family_interview_revisions.sql) so it can insert into
-- family_interview_revisions regardless of caller. Postgres grants
-- EXECUTE on new functions to PUBLIC by default, which would let the
-- anon/authenticated browser roles call it directly. Revoke that so only
-- the service role (used exclusively by the Edge Functions) and the
-- trigger mechanism itself can invoke it.
-- Recovered from the live schema on 2026-08-29.

revoke all on function public.capture_family_interview_revision() from public;
revoke all on function public.capture_family_interview_revision() from anon, authenticated;
grant execute on function public.capture_family_interview_revision() to service_role;
