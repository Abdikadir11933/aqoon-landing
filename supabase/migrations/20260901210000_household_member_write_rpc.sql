-- Transactional operator write for an explicitly identified household member.
-- The Edge Function authenticates the operator; this RPC is service-role only.

create or replace function public.aqoon_save_household_member(
  p_lead_id uuid,
  p_person_id uuid,
  p_role text,
  p_display_label text,
  p_birth_date date default null,
  p_age_years smallint default null,
  p_age_band text default null,
  p_family_need_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  household_id_value uuid;
  person_row public.family_people%rowtype;
  need_row public.family_needs%rowtype;
begin
  if p_role not in ('adult','child','dependent','other') then
    raise exception 'invalid_household_role' using errcode = '22023';
  end if;
  if nullif(btrim(p_display_label), '') is null or length(p_display_label) > 80 then
    raise exception 'invalid_display_label' using errcode = '22023';
  end if;
  if p_age_years is not null and (p_age_years < 0 or p_age_years > 120) then
    raise exception 'invalid_age' using errcode = '22023';
  end if;

  select household_id into household_id_value
  from public.family_leads where id = p_lead_id for update;
  if household_id_value is null then
    raise exception 'household_not_found' using errcode = 'P0002';
  end if;

  if p_person_id is null then
    insert into public.family_people(
      household_id, role, display_label, birth_date, age_years, age_band
    ) values (
      household_id_value, p_role, btrim(p_display_label), p_birth_date, p_age_years, nullif(btrim(p_age_band), '')
    ) returning * into person_row;
  else
    update public.family_people set
      role = p_role,
      display_label = btrim(p_display_label),
      birth_date = p_birth_date,
      age_years = p_age_years,
      age_band = nullif(btrim(p_age_band), ''),
      updated_at = now()
    where id = p_person_id and household_id = household_id_value
    returning * into person_row;
    if not found then raise exception 'household_member_not_found' using errcode = 'P0002'; end if;
  end if;

  if p_family_need_id is not null then
    update public.family_needs set subject_person_id = person_row.id, updated_at = now()
    where id = p_family_need_id and household_id = household_id_value and status <> 'archived'
    returning * into need_row;
    if not found then raise exception 'household_need_not_found' using errcode = 'P0002'; end if;
  end if;

  return jsonb_build_object(
    'person', to_jsonb(person_row),
    'need', case when need_row.id is null then null else to_jsonb(need_row) end
  );
end;
$$;

revoke all on function public.aqoon_save_household_member(uuid,uuid,text,text,date,smallint,text,uuid)
  from public, anon, authenticated;

comment on function public.aqoon_save_household_member(uuid,uuid,text,text,date,smallint,text,uuid)
  is 'Atomically creates/updates an explicitly identified household member and optionally links one need from the same household.';
