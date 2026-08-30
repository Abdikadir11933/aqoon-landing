-- An incomplete intake (family_intake_contacts, no family_leads row yet) had
-- no way to record a call attempt without the "Log call outcome" shortcut
-- eagerly creating a placeholder family_leads row - moving the case into
-- First Contact even when the operator only got "no answer" and never
-- filled in the intake form. These columns let a call attempt be recorded
-- directly against the still-incomplete contact, so logging an outcome no
-- longer has to create anything; only finishing the intake form does.
-- Additive only.

alter table family_intake_contacts add column last_call_outcome text;
alter table family_intake_contacts add column last_call_at timestamptz;
alter table family_intake_contacts add column last_call_next_follow_up_at timestamptz;
alter table family_intake_contacts add column last_call_notes text;

alter table family_intake_contacts add constraint family_intake_contacts_last_call_outcome_check
  check (last_call_outcome is null or last_call_outcome = any (array['reached','no_answer','call_later','busy']));
