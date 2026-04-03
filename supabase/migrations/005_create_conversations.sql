CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    role            message_role NOT NULL,
    content         TEXT NOT NULL,
    ig_message_id   TEXT,
    intent_detected TEXT,
    sentiment       DECIMAL(3,2),
    action_taken    TEXT,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_lead ON conversations(lead_id, sent_at);
CREATE INDEX idx_conversations_ig_msg ON conversations(ig_message_id) WHERE ig_message_id IS NOT NULL;
