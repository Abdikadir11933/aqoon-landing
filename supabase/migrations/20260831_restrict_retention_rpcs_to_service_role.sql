revoke all on function public.cleanup_old_interaction_events() from public, anon, authenticated;
revoke all on function public.cleanup_pending_erasure_users() from public, anon, authenticated;
revoke all on function public.cleanup_family_intake_data() from public, anon, authenticated;
revoke all on function public.take_family_intake_rate_limit(text,text,integer) from public, anon, authenticated;

grant execute on function public.cleanup_old_interaction_events() to service_role;
grant execute on function public.cleanup_pending_erasure_users() to service_role;
grant execute on function public.cleanup_family_intake_data() to service_role;
grant execute on function public.take_family_intake_rate_limit(text,text,integer) to service_role;
