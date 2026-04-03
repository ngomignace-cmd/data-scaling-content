CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'archived');
CREATE TYPE post_format AS ENUM ('reel', 'story', 'carousel', 'static');

CREATE TABLE posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ig_media_id     TEXT UNIQUE,
    ig_permalink    TEXT,
    title           TEXT NOT NULL,
    description     TEXT,
    format          post_format NOT NULL DEFAULT 'reel',
    status          post_status NOT NULL DEFAULT 'draft',
    video_url       TEXT,
    thumbnail_url   TEXT,
    script          TEXT,
    source_video_id UUID REFERENCES posts(id),
    tags            TEXT[] DEFAULT '{}',
    views           INTEGER DEFAULT 0,
    reach           INTEGER DEFAULT 0,
    likes           INTEGER DEFAULT 0,
    comments        INTEGER DEFAULT 0,
    shares          INTEGER DEFAULT 0,
    saves           INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_format ON posts(format);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_ig_media_id ON posts(ig_media_id) WHERE ig_media_id IS NOT NULL;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
