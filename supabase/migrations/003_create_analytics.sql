CREATE TYPE analytics_period AS ENUM ('6h', 'daily', 'weekly', 'monthly');

CREATE TABLE analytics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period          analytics_period NOT NULL DEFAULT 'daily',
    period_start    TIMESTAMPTZ NOT NULL,
    period_end      TIMESTAMPTZ NOT NULL,
    total_views     INTEGER DEFAULT 0,
    total_reach     INTEGER DEFAULT 0,
    total_engagement INTEGER DEFAULT 0,
    avg_engagement_rate DECIMAL(5,4) DEFAULT 0,
    top_post_id     UUID REFERENCES posts(id),
    new_leads       INTEGER DEFAULT 0,
    leads_qualified INTEGER DEFAULT 0,
    calls_booked    INTEGER DEFAULT 0,
    calls_completed INTEGER DEFAULT 0,
    deals_closed    INTEGER DEFAULT 0,
    total_revenue   DECIMAL(12,2) DEFAULT 0,
    cpl             DECIMAL(10,2) DEFAULT 0,
    vpl             DECIMAL(10,2) DEFAULT 0,
    closing_rate    DECIMAL(5,4) DEFAULT 0,
    patterns        JSONB DEFAULT '[]',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_period ON analytics(period, period_start DESC);
CREATE UNIQUE INDEX idx_analytics_unique_period ON analytics(period, period_start);
