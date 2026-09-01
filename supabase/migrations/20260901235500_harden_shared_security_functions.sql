-- Hardens shared-project helper functions without changing their public API.
--
-- The two increment_usage overloads intentionally remain callable because
-- they belong to another product in this Supabase project.  Pinning their
-- search path removes object-shadowing risk while preserving their signatures.
--
-- rls_auto_enable is an event-trigger implementation, not a browser RPC.
-- Event-trigger execution does not require client EXECUTE privileges, so
-- remove the default PUBLIC grant and any explicit browser-role grants.

alter function public.increment_usage(text, integer, integer, integer)
  set search_path = pg_catalog, public;

alter function public.increment_usage(text, integer, integer, integer, integer)
  set search_path = pg_catalog, public;

revoke all on function public.rls_auto_enable() from public;
revoke all on function public.rls_auto_enable() from anon, authenticated;
