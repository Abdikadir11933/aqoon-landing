-- Add 'busy' as a valid call outcome alongside the existing reached/no_answer/call_later.
-- Additive only: widens both CHECK constraints, no data migration needed since no row
-- can currently hold 'busy' (it was previously rejected).

alter table family_call_log drop constraint family_call_log_outcome_check;
alter table family_call_log add constraint family_call_log_outcome_check
  check (outcome = any (array['reached','no_answer','call_later','busy']));

alter table family_leads drop constraint family_leads_last_call_outcome_check;
alter table family_leads add constraint family_leads_last_call_outcome_check
  check (last_call_outcome is null or last_call_outcome = any (array['reached','no_answer','call_later','busy']));
