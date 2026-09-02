-- Reconcile live retention helpers into source control and make the final
-- Caawi contact permission auditable at the database boundary.

alter table public.family_intake_contacts
  add column if not exists contact_consent_at timestamptz;

alter table public.family_leads
  add column if not exists contact_consent_at timestamptz;

create or replace function public.cleanup_family_intake_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_events integer := 0;
  deleted_contacts integer := 0;
  deleted_resolved_leads integer := 0;
begin
  delete from public.family_funnel_events
  where created_at < now() - interval '12 months';
  get diagnostics deleted_events = row_count;

  delete from public.family_intake_contacts
  where (completed = true and updated_at < now() - interval '30 days')
     or (completed = false and updated_at < now() - interval '90 days');
  get diagnostics deleted_contacts = row_count;

  delete from public.family_leads
  where status = 'resolved'
    and coalesce(resolved_at, updated_at, created_at) < now() - interval '12 months';
  get diagnostics deleted_resolved_leads = row_count;

  return jsonb_build_object(
    'deleted_funnel_events', deleted_events,
    'deleted_intake_contacts', deleted_contacts,
    'deleted_resolved_leads', deleted_resolved_leads,
    'completed_at', now()
  );
end;
$$;

create or replace function public.cleanup_old_interaction_events()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare deleted_count integer;
begin
  delete from public.interaction_events
  where created_at < now() - interval '24 months';
  get diagnostics deleted_count = row_count;
  return jsonb_build_object('deleted', deleted_count, 'ran_at', now());
end;
$$;

create or replace function public.cleanup_pending_erasure_users()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare events_deleted integer; users_deleted integer;
begin
  delete from public.interaction_events
  where user_id in (
    select clerk_user_id from public.users
    where pending_erasure_at is not null
      and pending_erasure_at < now() - interval '30 days'
  );
  get diagnostics events_deleted = row_count;

  delete from public.users
  where pending_erasure_at is not null
    and pending_erasure_at < now() - interval '30 days';
  get diagnostics users_deleted = row_count;

  return jsonb_build_object(
    'events_deleted', events_deleted,
    'users_deleted', users_deleted,
    'ran_at', now()
  );
end;
$$;

revoke all on function public.cleanup_family_intake_data() from public, anon, authenticated;
revoke all on function public.cleanup_old_interaction_events() from public, anon, authenticated;
revoke all on function public.cleanup_pending_erasure_users() from public, anon, authenticated;
grant execute on function public.cleanup_family_intake_data() to service_role;
grant execute on function public.cleanup_old_interaction_events() to service_role;
grant execute on function public.cleanup_pending_erasure_users() to service_role;
