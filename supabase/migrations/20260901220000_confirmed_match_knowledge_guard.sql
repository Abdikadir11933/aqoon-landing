-- A confirmed match is a durable operational decision. Protect the table
-- itself so no service-role caller can persist one against incomplete, stale,
-- or source-less route knowledge even if a client or Edge Function regresses.

create or replace function public.aqoon_guard_confirmed_match_knowledge()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_route public.knowledge_routes%rowtype;
  now_at timestamptz := now();
begin
  if new.match_status <> 'confirmed_match' then
    return new;
  end if;

  select * into selected_route
  from public.knowledge_routes
  where id = new.route_id
  for key share;

  if not found
     or selected_route.verification_state <> 'verified'
     or selected_route.recheck_after is null
     or selected_route.recheck_after <= now_at
     or cardinality(selected_route.source_ids) = 0 then
    raise exception 'route_not_currently_verified' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.knowledge_criteria criterion
    where criterion.route_id = selected_route.id
  ) then
    raise exception 'confirmed_route_requires_research' using errcode = '22023';
  end if;

  if exists (
    select 1
    from unnest(selected_route.source_ids) source_id
    left join public.knowledge_sources source on source.id = source_id
    where source.id is null
       or source.verification_state <> 'verified'
       or source.recheck_after is null
       or source.recheck_after <= now_at
  ) or exists (
    select 1
    from public.knowledge_criteria criterion
    where criterion.route_id = selected_route.id
      and (
        criterion.verification_state <> 'verified'
        or criterion.recheck_after is null
        or criterion.recheck_after <= now_at
        or exists (
          select 1
          from unnest(criterion.source_ids) source_id
          left join public.knowledge_sources source on source.id = source_id
          where source.id is null
             or source.verification_state <> 'verified'
             or source.recheck_after is null
             or source.recheck_after <= now_at
        )
      )
  ) then
    raise exception 'route_not_currently_verified' using errcode = '22023';
  end if;

  return new;
end;
$$;

drop trigger if exists family_match_runs_confirmed_knowledge_guard
  on public.family_match_runs;
create trigger family_match_runs_confirmed_knowledge_guard
before insert or update of match_status, route_id
on public.family_match_runs
for each row execute function public.aqoon_guard_confirmed_match_knowledge();

revoke all on function public.aqoon_guard_confirmed_match_knowledge() from public;
revoke all on function public.aqoon_guard_confirmed_match_knowledge() from anon;
revoke all on function public.aqoon_guard_confirmed_match_knowledge() from authenticated;
