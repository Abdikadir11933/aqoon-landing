-- Existing completed interviews predate the enforced first-interview-v5 save
-- contract. Do not mislabel their answer keys as v5. Give them an explicit
-- compatibility marker, preserve the prior row through the existing revision
-- trigger, then validate the non-empty-version invariant for the whole table.

update public.family_interviews
set interview_schema_version = 'legacy-unversioned'
where status = 'completed'
  and nullif(btrim(interview_schema_version), '') is null;

alter table public.family_interviews
  validate constraint family_interviews_completed_schema_version_chk;

comment on column public.family_interviews.interview_schema_version is
  'Instrument contract version. legacy-unversioned means the completed record predates versioned interview keys and must not be interpreted as first-interview-v5.';

