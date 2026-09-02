-- Save the explicit children entered in the interview setup as one transaction.
-- Omitted existing children are intentionally left unchanged: this is an
-- additive/update operation, never a household-replacement operation.

create or replace function public.aqoon_save_family_setup(
  p_lead_id uuid,
  p_children jsonb,
  p_operator_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  household_id_value uuid;
  child_item jsonb;
  child_index integer := 0;
  person_id_value uuid;
  family_need_id_value uuid;
  age_text text;
  age_years_value smallint;
  age_band_value text;
  display_label_value text;
  person_row public.family_people%rowtype;
  need_row public.family_needs%rowtype;
  seen_person_ids uuid[] := '{}'::uuid[];
  seen_need_ids uuid[] := '{}'::uuid[];
  children_result jsonb := '[]'::jsonb;
  needs_result jsonb := '[]'::jsonb;
begin
  if p_children is null or jsonb_typeof(p_children) <> 'array' then
    raise exception 'invalid_children_array' using errcode = '22023';
  end if;
  if jsonb_array_length(p_children) > 20 then
    raise exception 'too_many_children' using errcode = '22023';
  end if;
  if p_operator_id is null or not exists (
    select 1 from public.operators where id = p_operator_id and active = true
  ) then
    raise exception 'invalid_operator' using errcode = '22023';
  end if;

  select household_id into household_id_value
  from public.family_leads
  where id = p_lead_id
  for update;

  if household_id_value is null then
    raise exception 'household_not_found' using errcode = 'P0002';
  end if;

  for child_item in
    select value from jsonb_array_elements(p_children)
  loop
    child_index := child_index + 1;
    person_id_value := null;
    family_need_id_value := null;
    age_years_value := null;
    age_band_value := null;

    if jsonb_typeof(child_item) <> 'object' then
      raise exception 'invalid_child_record' using errcode = '22023';
    end if;

    begin
      person_id_value := nullif(btrim(child_item ->> 'person_id'), '')::uuid;
    exception when invalid_text_representation then
      raise exception 'invalid_child_person_id' using errcode = '22023';
    end;

    if person_id_value is null then
      raise exception 'missing_child_person_id' using errcode = '22023';
    end if;
    if person_id_value = any(seen_person_ids) then
      raise exception 'duplicate_child_person_id' using errcode = '22023';
    end if;
    seen_person_ids := array_append(seen_person_ids, person_id_value);

    if child_item ? 'age_years' and child_item -> 'age_years' <> 'null'::jsonb then
      age_text := child_item ->> 'age_years';
      if age_text is null or age_text !~ '^(0|[1-9][0-9]{0,2})$' then
        raise exception 'invalid_child_age' using errcode = '22023';
      end if;
      age_years_value := age_text::smallint;
      if age_years_value < 0 or age_years_value > 120 then
        raise exception 'invalid_child_age' using errcode = '22023';
      end if;
      age_band_value := case
        when age_years_value < 3 then '0-2'
        when age_years_value < 7 then '3-6'
        when age_years_value < 16 then '7-15'
        when age_years_value < 18 then '16-17'
        when age_years_value < 30 then '18-29'
        when age_years_value < 45 then '30-44'
        when age_years_value < 65 then '45-64'
        else '65+'
      end;
    end if;

    display_label_value := btrim(coalesce(child_item ->> 'display_label', ''));
    if display_label_value = '' then
      display_label_value := 'Child ' || child_index::text;
    end if;
    if length(display_label_value) > 80 then
      raise exception 'invalid_child_display_label' using errcode = '22023';
    end if;

    select * into person_row
    from public.family_people
    where id = person_id_value
    for update;

    if found then
      if person_row.household_id <> household_id_value or person_row.role <> 'child' then
        raise exception 'invalid_child_ownership_or_role' using errcode = '22023';
      end if;

      update public.family_people
      set display_label = display_label_value,
          age_years = case
            when child_item ? 'age_years' and child_item -> 'age_years' <> 'null'::jsonb
              then age_years_value
            else person_row.age_years
          end,
          age_band = case
            when child_item ? 'age_years' and child_item -> 'age_years' <> 'null'::jsonb
              then age_band_value
            else person_row.age_band
          end,
          updated_at = now()
      where id = person_id_value
      returning * into person_row;
    else
      -- A UUID generated and retained by the browser makes this insert
      -- retry-safe. The lead-row lock serializes retries for this household;
      -- an ID already used by any other household/person is handled above.
      insert into public.family_people(
        id,
        household_id,
        role,
        display_label,
        age_years,
        age_band
      ) values (
        person_id_value,
        household_id_value,
        'child',
        display_label_value,
        age_years_value,
        age_band_value
      )
      returning * into person_row;
    end if;

    children_result := children_result || jsonb_build_array(jsonb_build_object(
      'id', person_row.id,
      'household_id', person_row.household_id,
      'role', person_row.role,
      'display_label', person_row.display_label,
      'birth_date', person_row.birth_date,
      'age_years', person_row.age_years,
      'age_band', person_row.age_band,
      'created_at', person_row.created_at,
      'updated_at', person_row.updated_at
    ));

    begin
      family_need_id_value := nullif(btrim(child_item ->> 'family_need_id'), '')::uuid;
    exception when invalid_text_representation then
      raise exception 'invalid_family_need_id' using errcode = '22023';
    end;

    if family_need_id_value is not null then
      if family_need_id_value = any(seen_need_ids) then
        raise exception 'duplicate_family_need_id' using errcode = '22023';
      end if;
      seen_need_ids := array_append(seen_need_ids, family_need_id_value);

      update public.family_needs
      set subject_person_id = person_row.id,
          updated_at = now()
      where id = family_need_id_value
        and household_id = household_id_value
        and status = 'active'
      returning * into need_row;

      if not found then
        raise exception 'household_need_not_found' using errcode = 'P0002';
      end if;

      needs_result := needs_result || jsonb_build_array(jsonb_build_object(
        'id', need_row.id,
        'subject_person_id', need_row.subject_person_id,
        'updated_at', need_row.updated_at
      ));
    end if;
  end loop;

  update public.family_leads
  set last_actor_id = p_operator_id,
      updated_at = now()
  where id = p_lead_id;

  return jsonb_build_object(
    'children', children_result,
    'needs', needs_result
  );
end;
$$;

revoke all on function public.aqoon_save_family_setup(uuid, jsonb, uuid)
  from public, anon, authenticated;
grant execute on function public.aqoon_save_family_setup(uuid, jsonb, uuid)
  to service_role;

-- The earlier single-member RPC already has this privilege in production,
-- but its migration did not state it explicitly. Keep clean replays aligned
-- so the secondary "another household member" path remains service-only and
-- callable by the authenticated Edge Function.
grant execute on function public.aqoon_save_household_member(uuid, uuid, text, text, date, smallint, text, uuid)
  to service_role;

comment on function public.aqoon_save_family_setup(uuid, jsonb, uuid)
  is 'Atomically creates or updates explicitly supplied child records, optionally linking only needs selected for those children, without deleting omitted household people.';
