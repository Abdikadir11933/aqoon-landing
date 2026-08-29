-- Explicit close-without-resolution path for family_leads, and a distinct
-- "awaiting decision" journey stage separating "waiting for the
-- authority/provider to respond" from "resolved" (a confirmed positive
-- outcome). Purely additive: no existing column, table or value is altered.
-- journey_stage/status remain unconstrained text validated by
-- family-leads-admin; 'awaiting_decision' and 'closed' are new accepted
-- values there, not enforced at the database level (matching the existing
-- pattern for this table).

alter table public.family_leads
  add column if not exists closed_at timestamptz,
  add column if not exists close_reason text;
