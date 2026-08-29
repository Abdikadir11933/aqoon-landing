-- Add programs diagnostic tracking to family_leads, intake contacts, and funnel events
-- Enables operators to see what programs/support type user requested without re-asking
-- Also tracks diagnostic selections in anonymous funnel analytics

ALTER TABLE family_leads
ADD COLUMN programs_diagnostic text;

ALTER TABLE family_intake_contacts
ADD COLUMN programs_diagnostic text;

ALTER TABLE family_funnel_events
ADD COLUMN programs_diagnostic text;

-- Indexes for operator-specific queries
CREATE INDEX idx_family_leads_programs_diag ON family_leads(programs_diagnostic) WHERE programs_diagnostic IS NOT NULL;

-- Analytics tracking index
CREATE INDEX idx_funnel_programs_diag ON family_funnel_events(programs_diagnostic) WHERE programs_diagnostic IS NOT NULL;
