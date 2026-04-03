CREATE TYPE lead_status AS ENUM ('new', 'qualifying', 'qualified', 'booked', 'show', 'no_show', 'closed_won', 'closed_lost');

CREATE TABLE leads (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ig_username         TEXT NOT NULL,
    ig_user_id          TEXT,
    full_name           TEXT,
    email               TEXT,
    phone               TEXT,
    source_post_id      UUID REFERENCES posts(id),
    source_dm_text      TEXT,
    status              lead_status NOT NULL DEFAULT 'new',
    qualification_score INTEGER CHECK (qualification_score BETWEEN 0 AND 100),
    budget_range        TEXT,
    need_summary        TEXT,
    urgency             TEXT,
    calendly_event_id   TEXT,
    call_scheduled_at   TIMESTAMPTZ,
    call_completed_at   TIMESTAMPTZ,
    conversion_value    DECIMAL(10,2) DEFAULT 0,
    closed_at           TIMESTAMPTZ,
    notes               TEXT,
    ai_conversation_summary TEXT,
    first_contact_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source_post ON leads(source_post_id);
CREATE INDEX idx_leads_ig_username ON leads(ig_username);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

CREATE TRIGGER leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
