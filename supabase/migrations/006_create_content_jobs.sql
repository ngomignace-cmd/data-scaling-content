CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE job_type AS ENUM ('transcription', 'golden_moments', 'render_reel', 'render_stories');

CREATE TABLE content_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_post_id  UUID REFERENCES posts(id),
    type            job_type NOT NULL,
    status          job_status NOT NULL DEFAULT 'pending',
    priority        INTEGER DEFAULT 0,
    input_data      JSONB NOT NULL,
    output_data     JSONB,
    error_message   TEXT,
    attempts        INTEGER DEFAULT 0,
    max_attempts    INTEGER DEFAULT 3,
    shotstack_render_id TEXT,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_jobs_status ON content_jobs(status, priority DESC);
CREATE INDEX idx_content_jobs_source ON content_jobs(source_post_id);

CREATE TRIGGER content_jobs_updated_at
    BEFORE UPDATE ON content_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
