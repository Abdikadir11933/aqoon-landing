-- Add diagnostic gate tracking to family_leads, intake contacts, and funnel events
-- Enables operators to see what diagnostic path user took without re-asking
-- Also tracks diagnostic selections in anonymous funnel analytics

ALTER TABLE family_leads
ADD COLUMN work_diagnostic text,
ADD COLUMN school_diagnostic text;

ALTER TABLE family_intake_contacts
ADD COLUMN work_diagnostic text,
ADD COLUMN school_diagnostic text;

ALTER TABLE family_funnel_events
ADD COLUMN work_diagnostic text,
ADD COLUMN school_diagnostic text;

-- Indexes for operator-specific queries
CREATE INDEX idx_family_leads_work_diag ON family_leads(work_diagnostic) WHERE work_diagnostic IS NOT NULL;
CREATE INDEX idx_family_leads_school_diag ON family_leads(school_diagnostic) WHERE school_diagnostic IS NOT NULL;

-- Analytics tracking indexes
CREATE INDEX idx_funnel_work_diag ON family_funnel_events(work_diagnostic) WHERE work_diagnostic IS NOT NULL;
CREATE INDEX idx_funnel_school_diag ON family_funnel_events(school_diagnostic) WHERE school_diagnostic IS NOT NULL;
