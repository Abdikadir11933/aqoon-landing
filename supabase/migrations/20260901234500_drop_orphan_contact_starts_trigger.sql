-- family_contact_starts was removed after incomplete intake ownership moved to
-- family_intake_contacts. Its trigger helper had no remaining dependencies but
-- still appeared as an avoidable mutable-search-path security warning.

drop function if exists public.set_updated_at_family_contact_starts();

