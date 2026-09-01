-- Enforces the service-role-only boundary documented by AqoonPRO.
--
-- Caller evidence:
-- - AqoonPRO/src/db/supabase.js constructs its server-side client with
--   SUPABASE_SERVICE_ROLE_KEY.
-- - AqoonPRO's own migrations grant these RPCs only to service_role and
--   define no anon/authenticated RLS policies for the chunk tables.
--
-- PostgreSQL grants EXECUTE to PUBLIC on newly created functions unless it is
-- explicitly revoked. Remove that accidental browser exposure while keeping
-- the verified server caller working.

revoke all on function public.increment_usage(text, integer, integer, integer)
  from public, anon, authenticated;
revoke all on function public.increment_usage(text, integer, integer, integer, integer)
  from public, anon, authenticated;

grant execute on function public.increment_usage(text, integer, integer, integer)
  to service_role;
grant execute on function public.increment_usage(text, integer, integer, integer, integer)
  to service_role;

revoke all on function public.match_debt_chunks(public.vector, double precision, integer)
  from public, anon, authenticated;
revoke all on function public.match_health_chunks(public.vector, double precision, integer)
  from public, anon, authenticated;
revoke all on function public.match_kela_chunks(public.vector, double precision, integer)
  from public, anon, authenticated;
revoke all on function public.match_labor_chunks(public.vector, double precision, integer)
  from public, anon, authenticated;
revoke all on function public.match_lastensuojelu_chunks(public.vector, double precision, integer)
  from public, anon, authenticated;
revoke all on function public.match_migri_chunks(public.vector, double precision, integer)
  from public, anon, authenticated;
revoke all on function public.match_municipal_chunks(public.vector, double precision, integer)
  from public, anon, authenticated;
revoke all on function public.match_oph_chunks(public.vector, double precision, integer)
  from public, anon, authenticated;

grant execute on function public.match_debt_chunks(public.vector, double precision, integer)
  to service_role;
grant execute on function public.match_health_chunks(public.vector, double precision, integer)
  to service_role;
grant execute on function public.match_kela_chunks(public.vector, double precision, integer)
  to service_role;
grant execute on function public.match_labor_chunks(public.vector, double precision, integer)
  to service_role;
grant execute on function public.match_lastensuojelu_chunks(public.vector, double precision, integer)
  to service_role;
grant execute on function public.match_migri_chunks(public.vector, double precision, integer)
  to service_role;
grant execute on function public.match_municipal_chunks(public.vector, double precision, integer)
  to service_role;
grant execute on function public.match_oph_chunks(public.vector, double precision, integer)
  to service_role;

revoke all on table
  public.knowledge_chunks,
  public.kela_knowledge_chunks,
  public.migri_knowledge_chunks,
  public.labor_knowledge_chunks,
  public.municipal_knowledge_chunks,
  public.oph_knowledge_chunks,
  public.health_knowledge_chunks,
  public.lastensuojelu_knowledge_chunks,
  public.debt_knowledge_chunks
from anon, authenticated;
