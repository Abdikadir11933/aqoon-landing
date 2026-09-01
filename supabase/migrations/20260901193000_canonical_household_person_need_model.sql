-- Additive canonical family graph. Existing family_leads remain the
-- compatibility record while every lead is linked to one household, contact
-- person and one-or-more explicit needs.

create table if not exists public.family_households (
  id uuid primary key default gen_random_uuid(),
  contact_fingerprint text not null unique,
  city text,
  identity_basis text not null default 'normalized_phone_exact'
    check (identity_basis in ('normalized_phone_exact','operator_confirmed','operator_split')),
  status text not null default 'active' check (status in ('active','merged','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_people (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.family_households(id) on delete cascade,
  role text not null check (role in ('contact','adult','child','dependent','other')),
  display_label text not null,
  birth_date date,
  age_years smallint check (age_years between 0 and 120),
  age_band text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists family_people_one_contact_per_household_idx
  on public.family_people (household_id) where role = 'contact';
create index if not exists family_people_household_id_idx
  on public.family_people (household_id);

create table if not exists public.family_needs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.family_households(id) on delete cascade,
  subject_person_id uuid references public.family_people(id) on delete set null,
  source_lead_id uuid references public.family_leads(id) on delete cascade,
  source_position smallint not null default 0 check (source_position between 0 and 20),
  need_domain text not null,
  raw_main_need text,
  raw_sub_need text,
  age_group text,
  timing text not null default 'now'
    check (timing in ('now','within_6_months','within_12_months','later','unknown')),
  status text not null default 'active'
    check (status in ('active','future','accepted','declined','resolved','archived')),
  source text not null default 'intake'
    check (source in ('intake','interview','operator','migration')),
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_lead_id, source_position)
);

create index if not exists family_needs_household_status_idx
  on public.family_needs (household_id, status, need_domain);
create index if not exists family_needs_subject_person_id_idx
  on public.family_needs (subject_person_id) where subject_person_id is not null;
create index if not exists family_needs_source_lead_id_idx
  on public.family_needs (source_lead_id) where source_lead_id is not null;

alter table public.family_leads
  add column if not exists household_id uuid references public.family_households(id) on delete set null,
  add column if not exists primary_person_id uuid references public.family_people(id) on delete set null,
  add column if not exists primary_need_id uuid references public.family_needs(id) on delete set null;
create index if not exists family_leads_household_id_idx on public.family_leads (household_id);
create index if not exists family_leads_primary_person_id_idx on public.family_leads (primary_person_id);
create index if not exists family_leads_primary_need_id_idx on public.family_leads (primary_need_id);

alter table public.family_interviews
  add column if not exists household_id uuid references public.family_households(id) on delete set null,
  add column if not exists subject_person_id uuid references public.family_people(id) on delete set null;
create index if not exists family_interviews_household_id_idx on public.family_interviews (household_id);
create index if not exists family_interviews_subject_person_id_idx on public.family_interviews (subject_person_id);

create table if not exists public.family_interview_needs (
  interview_id uuid not null references public.family_interviews(id) on delete cascade,
  family_need_id uuid not null references public.family_needs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (interview_id, family_need_id)
);
create index if not exists family_interview_needs_family_need_id_idx
  on public.family_interview_needs (family_need_id);

alter table public.family_case_plans
  add column if not exists family_need_id uuid references public.family_needs(id) on delete set null;
create index if not exists family_case_plans_family_need_id_idx
  on public.family_case_plans (family_need_id) where family_need_id is not null;

alter table public.family_future_opportunities
  add column if not exists family_need_id uuid references public.family_needs(id) on delete set null,
  add column if not exists subject_person_id uuid references public.family_people(id) on delete set null;
create index if not exists family_future_opportunities_family_need_id_idx
  on public.family_future_opportunities (family_need_id) where family_need_id is not null;
create index if not exists family_future_opportunities_subject_person_id_idx
  on public.family_future_opportunities (subject_person_id) where subject_person_id is not null;

create or replace function public.aqoon_need_domain(p_main text, p_sub text, p_age_group text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  main_value text := lower(coalesce(p_main, ''));
  sub_value text := lower(coalesce(p_sub, ''));
  age_value text := lower(coalesce(p_age_group, ''));
begin
  if main_value ~ 'carruur|child' then
    if sub_value ~ 'harrastus|hobby|ciyaar' then return 'hobby'; end if;
    if sub_value ~ 'wilma|skuul|dugsi|school|s2|taageerada ilmaha' then return 'school'; end if;
    if sub_value ~ 'päiväkoti|xannaano|daycare|esiopetus' then return 'daycare'; end if;
    if sub_value ~ 'codsi|diiwaangelin|application|registration' then
      return case when age_value = 'over7' then 'school' else 'daycare' end;
    end if;
    return case when age_value = 'over7' then 'school' else 'daycare' end;
  end if;
  if main_value ~ 'waxbarasho|education|study' or sub_value ~ 'finnish|yki|shahaad|koulutus|opisk' then return 'education'; end if;
  if main_value ~ 'shaqo|work|employment|job' then
    if sub_value ~ 'ganacsi|business|entrepreneur|starttiraha' then return 'entrepreneurship'; end if;
    return 'work';
  end if;
  if sub_value ~ 'kela|benefit|allowance|tuki|etuus' then return 'family_finances'; end if;
  if sub_value ~ 'housing|asum|debt|dayn' then return 'housing_debt_family'; end if;
  if sub_value ~ 'program|programme|barnaamij|hanke' then return 'live_programme'; end if;
  if sub_value ~ 'authority|service|adeeg|taageero' then return 'service_support'; end if;
  return 'general';
end;
$$;

create or replace function public.aqoon_sync_lead_household(p_lead_id uuid)
returns table(household_id uuid, person_id uuid, primary_need_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  lead_row public.family_leads%rowtype;
  household public.family_households%rowtype;
  contact_person public.family_people%rowtype;
  primary_need public.family_needs%rowtype;
  phone_key text;
  item jsonb;
  item_position integer := 1;
  retained_positions smallint[] := array[0]::smallint[];
begin
  select * into lead_row from public.family_leads where id = p_lead_id for update;
  if not found then raise exception 'lead_not_found' using errcode = 'P0002'; end if;
  phone_key := encode(extensions.digest(regexp_replace(lower(coalesce(lead_row.phone, '')), '[^0-9+]', '', 'g'), 'sha256'), 'hex');
  insert into public.family_households(contact_fingerprint, city, updated_at)
  values (phone_key, lead_row.city, now())
  on conflict (contact_fingerprint) do update
    set city = coalesce(excluded.city, public.family_households.city), updated_at = now()
  returning * into household;

  select * into contact_person from public.family_people
  where family_people.household_id = household.id and role = 'contact' limit 1;
  if not found then
    insert into public.family_people(household_id, role, display_label)
    values (household.id, 'contact', 'Primary contact') returning * into contact_person;
  end if;

  insert into public.family_needs(
    household_id, subject_person_id, source_lead_id, source_position, need_domain,
    raw_main_need, raw_sub_need, age_group, timing, status, source, updated_at
  ) values (
    household.id,
    case when lower(coalesce(lead_row.main_need, '')) ~ 'carruur|child' then null else contact_person.id end,
    lead_row.id, 0,
    public.aqoon_need_domain(lead_row.main_need, lead_row.sub_need, lead_row.age_group),
    lead_row.main_need, lead_row.sub_need, lead_row.age_group, 'now', 'active', 'intake', now()
  )
  on conflict (source_lead_id, source_position) do update set
    household_id = excluded.household_id,
    subject_person_id = excluded.subject_person_id,
    need_domain = excluded.need_domain,
    raw_main_need = excluded.raw_main_need,
    raw_sub_need = excluded.raw_sub_need,
    age_group = excluded.age_group,
    status = case when public.family_needs.status = 'archived' then 'active' else public.family_needs.status end,
    updated_at = now()
  returning * into primary_need;

  for item in select value from jsonb_array_elements(coalesce(lead_row.additional_needs, '[]'::jsonb)) loop
    insert into public.family_needs(
      household_id, subject_person_id, source_lead_id, source_position, need_domain,
      raw_main_need, raw_sub_need, age_group, timing, status, source, updated_at
    ) values (
      household.id,
      case when lower(coalesce(item->>'main_need', '')) ~ 'carruur|child' then null else contact_person.id end,
      lead_row.id, item_position,
      public.aqoon_need_domain(item->>'main_need', item->>'sub_need', item->>'age_group'),
      item->>'main_need', item->>'sub_need', item->>'age_group', 'now', 'active', 'intake', now()
    )
    on conflict (source_lead_id, source_position) do update set
      household_id = excluded.household_id,
      subject_person_id = excluded.subject_person_id,
      need_domain = excluded.need_domain,
      raw_main_need = excluded.raw_main_need,
      raw_sub_need = excluded.raw_sub_need,
      age_group = excluded.age_group,
      status = case when public.family_needs.status = 'archived' then 'active' else public.family_needs.status end,
      updated_at = now();
    retained_positions := array_append(retained_positions, item_position::smallint);
    item_position := item_position + 1;
  end loop;

  update public.family_needs set status = 'archived', updated_at = now()
  where source_lead_id = lead_row.id and not (source_position = any(retained_positions));

  update public.family_leads set
    household_id = household.id,
    primary_person_id = contact_person.id,
    primary_need_id = primary_need.id
  where id = lead_row.id;
  return query select household.id, contact_person.id, primary_need.id;
end;
$$;

create or replace function public.aqoon_sync_lead_household_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.aqoon_sync_lead_household(new.id);
  return new;
end;
$$;

drop trigger if exists aqoon_sync_lead_household_after_write on public.family_leads;
create trigger aqoon_sync_lead_household_after_write
after insert or update of phone, city, main_need, sub_need, age_group, additional_needs
on public.family_leads for each row execute function public.aqoon_sync_lead_household_trigger();

create or replace function public.aqoon_link_interview_family_graph()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  lead_household uuid;
  need_person uuid;
begin
  select l.household_id, n.subject_person_id into lead_household, need_person
  from public.family_leads l left join public.family_needs n on n.id = l.primary_need_id
  where l.id = new.lead_id;
  new.household_id := lead_household;
  new.subject_person_id := coalesce(new.subject_person_id, need_person);
  return new;
end;
$$;

drop trigger if exists aqoon_link_interview_family_graph_before_write on public.family_interviews;
create trigger aqoon_link_interview_family_graph_before_write
before insert or update of lead_id on public.family_interviews
for each row execute function public.aqoon_link_interview_family_graph();

create or replace function public.aqoon_link_interview_needs()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.family_interview_needs(interview_id, family_need_id)
  select new.id, n.id from public.family_needs n
  where n.source_lead_id = new.lead_id and n.status <> 'archived'
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists aqoon_link_interview_needs_after_write on public.family_interviews;
create trigger aqoon_link_interview_needs_after_write
after insert or update of lead_id on public.family_interviews
for each row execute function public.aqoon_link_interview_needs();

alter table public.family_households enable row level security;
alter table public.family_people enable row level security;
alter table public.family_needs enable row level security;
alter table public.family_interview_needs enable row level security;
revoke all on public.family_households, public.family_people, public.family_needs, public.family_interview_needs from anon, authenticated;
revoke all on function public.aqoon_need_domain(text,text,text) from public, anon, authenticated;
revoke all on function public.aqoon_sync_lead_household(uuid) from public, anon, authenticated;
revoke all on function public.aqoon_sync_lead_household_trigger() from public, anon, authenticated;
revoke all on function public.aqoon_link_interview_family_graph() from public, anon, authenticated;
revoke all on function public.aqoon_link_interview_needs() from public, anon, authenticated;

do $$
declare lead_id uuid;
begin
  for lead_id in select id from public.family_leads loop
    perform public.aqoon_sync_lead_household(lead_id);
  end loop;
end $$;

update public.family_interviews i set
  household_id = l.household_id,
  subject_person_id = coalesce(i.subject_person_id, n.subject_person_id)
from public.family_leads l
left join public.family_needs n on n.id = l.primary_need_id
where l.id = i.lead_id;

insert into public.family_interview_needs(interview_id, family_need_id)
select i.id, n.id from public.family_interviews i
join public.family_needs n on n.source_lead_id = i.lead_id and n.status <> 'archived'
on conflict do nothing;

comment on table public.family_households is 'Canonical household identity; stores a private phone fingerprint rather than duplicated plaintext contact data.';
comment on table public.family_people is 'People within a household. Child rows are explicit and may not be inferred from an adult lead.';
comment on table public.family_needs is 'One explicit current or future need for one household/person, with timing and lifecycle status.';
comment on table public.family_interview_needs is 'Many-to-many link between an interview and the explicit needs it covered.';
