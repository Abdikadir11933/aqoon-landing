-- Adds operator attribution to the sales activity timeline (calls/emails/meetings
-- logged against a deal). Missed in the initial two-operator-os-foundation
-- migration. Purely additive, nullable, no existing data affected.
-- See docs/decisions/0002-two-operator-os-interview-and-data-foundation.md.

alter table public.sales_activities
  add column if not exists operator_id uuid references public.operators(id);
