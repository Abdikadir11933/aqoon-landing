revoke execute on function public.cleanup_old_interaction_events() from anon, authenticated;
revoke execute on function public.cleanup_pending_erasure_users() from anon, authenticated;
revoke execute on function public.cleanup_family_intake_data() from anon, authenticated;
revoke execute on function public.take_family_intake_rate_limit(text,text,integer) from anon, authenticated;

do $$
begin
  if exists (select 1 from cron.job where jobid = 5) then
    perform cron.unschedule(5);
  end if;
end $$;

select cron.schedule(
  'aqoon-nightly-retention',
  '0 3 * * *',
  $job$
    select public.cleanup_old_interaction_events();
    select public.cleanup_pending_erasure_users();
    select public.cleanup_family_intake_data();
    delete from public.family_intake_rate_limits
      where bucket_start < now() - interval '48 hours';
  $job$
);
