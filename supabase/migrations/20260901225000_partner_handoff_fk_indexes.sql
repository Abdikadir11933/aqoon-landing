-- Cover the remaining handoff foreign keys used for need-level reporting and
-- operator retention/deletion checks. Lead, plan and sales relationship keys
-- are covered by the preceding consent-contract migration.

create index if not exists family_partner_handoffs_need_idx
  on public.family_partner_handoffs (family_need_id);

create index if not exists family_partner_handoffs_operator_idx
  on public.family_partner_handoffs (operator_id)
  where operator_id is not null;
