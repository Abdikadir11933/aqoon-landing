-- Closes a real gap: the queue UI's "incomplete intake" phase had no way to
-- assign a partial (family_intake_contacts row) to an operator, because the
-- column didn't exist - only family_leads had assigned_operator_id. This was
-- shipped as an honest limitation in the tracker UI rather than a silent
-- no-op; this migration is the follow-up that makes it real.
alter table public.family_intake_contacts
  add column if not exists assigned_operator_id uuid references public.operators(id);

create index if not exists family_intake_contacts_assigned_operator_id_idx
  on public.family_intake_contacts(assigned_operator_id);
