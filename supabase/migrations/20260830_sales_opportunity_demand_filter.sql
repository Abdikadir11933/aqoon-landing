-- Let a sales opportunity be tagged with the demand segment it represents
-- (main_need category + optional city), so the pipeline can show a live,
-- anonymized count of matching families against that deal - never a row
-- export, per business-operating-model.md's "aggregate only" rule.
alter table sales_opportunities
  add column demand_need text,
  add column demand_city text;
