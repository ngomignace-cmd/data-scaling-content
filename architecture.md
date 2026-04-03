# Data Scaling Content — Architecture

## 1. Arborescence du Projet

```
data-scaling-content/
├── architecture.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── .env.local                        # Variables d'environnement (jamais commité)
├── .env.example                      # Template des variables requises
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_create_posts.sql
│   │   ├── 002_create_leads.sql
│   │   ├── 003_create_analytics.sql
│   │   ├── 004_create_settings.sql
│   │   ├── 005_create_conversations.sql
│   │   └── 006_create_content_jobs.sql
│   └── seed.sql                      # Données de test
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Layout racine (sidebar + providers)
│   │   ├── page.tsx                  # Dashboard principal (Metric Grid)
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Vue d'ensemble analytics
│   │   │
│   │   ├── videos/
│   │   │   ├── page.tsx              # Video Manager (liste + push to IG)
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Détail vidéo + insights
│   │   │
│   │   ├── leads/
│   │   │   └── page.tsx              # Kanban pipeline des leads
│   │   │
│   │   ├── content-factory/
│   │   │   └── page.tsx              # Interface de création de contenu
│   │   │
│   │   ├── insights/
│   │   │   └── page.tsx              # Graphiques de corrélation
│   │   │
│   │   ├── settings/
│   │   │   └── page.tsx              # Configuration (API keys, préférences)
│   │   │
│   │   └── api/                      # API Routes (Backend)
│   │       ├── webhooks/
│   │       │   └── instagram/
│   │       │       └── route.ts      # Réception Webhooks IG (DMs + mentions)
│   │       │
│   │       ├── instagram/
│   │       │   ├── sync/
│   │       │   │   └── route.ts      # Sync manuelle des insights
│   │       │   └── publish/
│   │       │       └── route.ts      # Push vidéo vers Instagram
│   │       │
│   │       ├── analytics/
│   │       │   ├── harvest/
│   │       │   │   └── route.ts      # Cron job : collecte toutes les 6h
│   │       │   └── patterns/
│   │       │       └── route.ts      # Analyse des patterns de performance
│   │       │
│   │       ├── content/
│   │       │   ├── transcribe/
│   │       │   │   └── route.ts      # Transcription Whisper
│   │       │   ├── extract/
│   │       │   │   └── route.ts      # Extraction Golden Moments
│   │       │   ├── render/
│   │       │   │   └── route.ts      # Montage FFmpeg / Shotstack
│   │       │   └── stories/
│   │       │       └── route.ts      # Génération séquence 3 Stories
│   │       │
│   │       ├── setter/
│   │       │   ├── process/
│   │       │   │   └── route.ts      # Traitement DM entrant par l'IA
│   │       │   └── qualify/
│   │       │       └── route.ts      # Qualification lead
│   │       │
│   │       └── leads/
│   │           ├── route.ts          # CRUD leads
│   │           └── [id]/
│   │               └── route.ts      # Détail / mise à jour lead
│   │
│   ├── lib/                          # Logique métier & services
│   │   ├── supabase/
│   │   │   ├── client.ts             # Client Supabase (browser)
│   │   │   ├── server.ts             # Client Supabase (server-side)
│   │   │   └── types.ts              # Types générés depuis le schéma DB
│   │   │
│   │   ├── instagram/
│   │   │   ├── client.ts             # Wrapper Instagram Graph API
│   │   │   ├── webhooks.ts           # Validation & parsing des webhooks
│   │   │   └── insights.ts           # Récupération des métriques
│   │   │
│   │   ├── ai/
│   │   │   ├── setter-agent.ts       # Agent Setter (LangChain + GPT-4o)
│   │   │   ├── content-analyzer.ts   # Analyse de contenu (Claude 3.5 Sonnet)
│   │   │   ├── script-generator.ts   # Génération de scripts
│   │   │   └── prompts/
│   │   │       ├── setter-system.ts  # Prompt système du Setter
│   │   │       ├── qualifier.ts      # Prompt de qualification
│   │   │       └── analyzer.ts       # Prompt d'analyse de patterns
│   │   │
│   │   ├── video/
│   │   │   ├── transcriber.ts        # Service Whisper
│   │   │   ├── ffmpeg.ts             # Commandes FFmpeg locales
│   │   │   ├── shotstack.ts          # Client API Shotstack
│   │   │   └── golden-moments.ts     # Extraction segments viraux
│   │   │
│   │   ├── crm/
│   │   │   ├── lead-manager.ts       # Gestion du cycle de vie lead
│   │   │   └── calendly.ts           # Intégration Calendly
│   │   │
│   │   └── utils/
│   │       ├── metrics.ts            # Calculs CPL, VPL, taux conversion
│   │       └── constants.ts          # Constantes globales
│   │
│   ├── components/                   # Composants React (Shadcn/UI)
│   │   ├── ui/                       # Composants Shadcn de base
│   │   │   └── ...                   # button, card, dialog, etc.
│   │   │
│   │   ├── layout/
│   │   │   ├── sidebar.tsx           # Navigation latérale
│   │   │   ├── header.tsx            # Barre supérieure
│   │   │   └── metric-card.tsx       # Carte statistique réutilisable
│   │   │
│   │   ├── dashboard/
│   │   │   ├── metric-grid.tsx       # Grille des 4 KPIs principaux
│   │   │   ├── revenue-chart.tsx     # Graphique CA dans le temps
│   │   │   └── conversion-funnel.tsx # Funnel visuel
│   │   │
│   │   ├── videos/
│   │   │   ├── video-list.tsx        # Liste des vidéos
│   │   │   ├── video-card.tsx        # Carte vidéo individuelle
│   │   │   └── publish-button.tsx    # Bouton "Push to Instagram"
│   │   │
│   │   ├── leads/
│   │   │   ├── kanban-board.tsx      # Board Kanban complet
│   │   │   ├── kanban-column.tsx     # Colonne du Kanban
│   │   │   └── lead-card.tsx         # Carte lead individuelle
│   │   │
│   │   ├── content-factory/
│   │   │   ├── upload-zone.tsx       # Zone d'upload vidéo
│   │   │   ├── transcription-view.tsx
│   │   │   └── story-sequence.tsx    # Prévisualisation 3 stories
│   │   │
│   │   └── insights/
│   │       ├── correlation-chart.tsx # Graphique corrélation format/conversion
│   │       └── pattern-card.tsx      # Carte pattern détecté
│   │
│   ├── hooks/                        # React hooks custom
│   │   ├── use-analytics.ts
│   │   ├── use-leads.ts
│   │   └── use-realtime.ts           # Supabase Realtime subscriptions
│   │
│   └── types/                        # Types TypeScript globaux
│       ├── instagram.ts
│       ├── lead.ts
│       ├── content.ts
│       └── analytics.ts
│
└── public/
    └── ...                           # Assets statiques
```

---

## 2. Schéma SQL Complet (Supabase / PostgreSQL)

### Table `posts` — Contenu Instagram publié ou en attente

```sql
-- 001_create_posts.sql

CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'archived');
CREATE TYPE post_format AS ENUM ('reel', 'story', 'carousel', 'static');

CREATE TABLE posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identifiants Instagram
    ig_media_id     TEXT UNIQUE,                -- ID Instagram Graph API (null si draft)
    ig_permalink    TEXT,                        -- Lien permanent Instagram

    -- Contenu
    title           TEXT NOT NULL,
    description     TEXT,
    format          post_format NOT NULL DEFAULT 'reel',
    status          post_status NOT NULL DEFAULT 'draft',

    -- Fichiers
    video_url       TEXT,                        -- URL stockée (Supabase Storage ou externe)
    thumbnail_url   TEXT,

    -- Métadonnées de création
    script          TEXT,                        -- Script utilisé pour la vidéo
    source_video_id UUID REFERENCES posts(id),  -- Si repurposed depuis une autre vidéo
    tags            TEXT[] DEFAULT '{}',

    -- Métriques Instagram (synchronisées)
    views           INTEGER DEFAULT 0,
    reach           INTEGER DEFAULT 0,
    likes           INTEGER DEFAULT 0,
    comments        INTEGER DEFAULT 0,
    shares          INTEGER DEFAULT 0,
    saves           INTEGER DEFAULT 0,

    -- Métriques calculées
    engagement_rate DECIMAL(5,4) DEFAULT 0,     -- (likes+comments+shares+saves) / reach
    leads_generated INTEGER DEFAULT 0,          -- Nombre de leads attribués

    -- Timestamps
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_format ON posts(format);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_ig_media_id ON posts(ig_media_id) WHERE ig_media_id IS NOT NULL;

-- Auto-update du updated_at
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
```

### Table `leads` — Prospects du pipeline de vente

```sql
-- 002_create_leads.sql

CREATE TYPE lead_status AS ENUM ('new', 'qualifying', 'qualified', 'booked', 'show', 'no_show', 'closed_won', 'closed_lost');

CREATE TABLE leads (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identité
    ig_username         TEXT NOT NULL,
    ig_user_id          TEXT,
    full_name           TEXT,
    email               TEXT,
    phone               TEXT,

    -- Attribution
    source_post_id      UUID REFERENCES posts(id),  -- Le Reel/Story qui a amené le lead
    source_dm_text      TEXT,                        -- Premier message reçu

    -- Qualification (rempli par l'IA Setter)
    status              lead_status NOT NULL DEFAULT 'new',
    qualification_score INTEGER CHECK (qualification_score BETWEEN 0 AND 100),
    budget_range        TEXT,                        -- Ex: "1000-3000€"
    need_summary        TEXT,                        -- Résumé du besoin
    urgency             TEXT,                        -- Ex: "immediate", "1_month", "3_months"

    -- Rendez-vous
    calendly_event_id   TEXT,
    call_scheduled_at   TIMESTAMPTZ,
    call_completed_at   TIMESTAMPTZ,

    -- Conversion
    conversion_value    DECIMAL(10,2) DEFAULT 0,     -- Montant de la vente
    closed_at           TIMESTAMPTZ,

    -- Notes
    notes               TEXT,
    ai_conversation_summary TEXT,                    -- Résumé de la conversation IA

    -- Timestamps
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
```

### Table `analytics` — Snapshots de métriques agrégées

```sql
-- 003_create_analytics.sql

CREATE TYPE analytics_period AS ENUM ('6h', 'daily', 'weekly', 'monthly');

CREATE TABLE analytics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Période
    period          analytics_period NOT NULL DEFAULT 'daily',
    period_start    TIMESTAMPTZ NOT NULL,
    period_end      TIMESTAMPTZ NOT NULL,

    -- Métriques de contenu agrégées
    total_views     INTEGER DEFAULT 0,
    total_reach     INTEGER DEFAULT 0,
    total_engagement INTEGER DEFAULT 0,
    avg_engagement_rate DECIMAL(5,4) DEFAULT 0,
    top_post_id     UUID REFERENCES posts(id),

    -- Métriques de conversion
    new_leads       INTEGER DEFAULT 0,
    leads_qualified INTEGER DEFAULT 0,
    calls_booked    INTEGER DEFAULT 0,
    calls_completed INTEGER DEFAULT 0,
    deals_closed    INTEGER DEFAULT 0,

    -- Métriques financières
    total_revenue   DECIMAL(12,2) DEFAULT 0,
    cpl             DECIMAL(10,2) DEFAULT 0,      -- Coût par Lead (organique = temps investi)
    vpl             DECIMAL(10,2) DEFAULT 0,      -- Valeur par Lead
    closing_rate    DECIMAL(5,4) DEFAULT 0,       -- deals_closed / calls_completed

    -- Patterns détectés par l'IA
    patterns        JSONB DEFAULT '[]',
    -- Ex: [{"type": "format_impact", "insight": "Reels < 15s → +40% leads", "confidence": 0.85}]

    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_period ON analytics(period, period_start DESC);
CREATE UNIQUE INDEX idx_analytics_unique_period ON analytics(period, period_start);
```

### Table `settings` — Configuration utilisateur et API

```sql
-- 004_create_settings.sql

CREATE TABLE settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    key             TEXT UNIQUE NOT NULL,
    value           JSONB NOT NULL,
    description     TEXT,

    -- Ex:
    -- key: 'instagram_config'
    -- value: {"access_token": "...", "ig_user_id": "...", "webhook_verify_token": "..."}
    --
    -- key: 'setter_config'
    -- value: {"model": "gpt-4o", "max_messages_per_lead": 10, "auto_qualify": true}
    --
    -- key: 'calendly_config'
    -- value: {"api_key": "...", "event_type_url": "..."}
    --
    -- key: 'content_config'
    -- value: {"default_format": "reel", "subtitle_style": "dynamic", "music_enabled": true}
    --
    -- key: 'cpl_hourly_rate'
    -- value: {"rate": 50} -- Pour calculer le CPL organique basé sur le temps investi

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Table `conversations` — Historique DMs avec l'IA Setter

```sql
-- 005_create_conversations.sql

CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

    -- Message
    role            message_role NOT NULL,
    content         TEXT NOT NULL,
    ig_message_id   TEXT,                        -- ID du message Instagram

    -- Métadonnées IA
    intent_detected TEXT,                        -- Ex: "price_question", "booking_intent", "objection"
    sentiment       DECIMAL(3,2),                -- -1.00 à 1.00
    action_taken    TEXT,                        -- Ex: "sent_calendly_link", "asked_budget"

    -- Timestamps
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_lead ON conversations(lead_id, sent_at);
CREATE INDEX idx_conversations_ig_msg ON conversations(ig_message_id) WHERE ig_message_id IS NOT NULL;
```

### Table `content_jobs` — File d'attente du Content Factory

```sql
-- 006_create_content_jobs.sql

CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE job_type AS ENUM ('transcription', 'golden_moments', 'render_reel', 'render_stories');

CREATE TABLE content_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Référence
    source_post_id  UUID REFERENCES posts(id),

    -- Job
    type            job_type NOT NULL,
    status          job_status NOT NULL DEFAULT 'pending',
    priority        INTEGER DEFAULT 0,           -- Plus haut = plus prioritaire

    -- Input/Output
    input_data      JSONB NOT NULL,
    -- Ex transcription:    {"video_url": "...", "language": "fr"}
    -- Ex golden_moments:   {"transcript": "...", "min_score": 0.7}
    -- Ex render_reel:      {"segments": [...], "subtitle_style": "dynamic"}
    -- Ex render_stories:   {"script": "...", "sequence": ["hook", "value", "cta"]}

    output_data     JSONB,
    -- Ex transcription:    {"text": "...", "segments": [...]}
    -- Ex golden_moments:   {"moments": [{"start": 12.5, "end": 27.3, "score": 0.92}]}
    -- Ex render:           {"video_url": "...", "duration": 14.5}

    -- Suivi
    error_message   TEXT,
    attempts        INTEGER DEFAULT 0,
    max_attempts    INTEGER DEFAULT 3,

    -- Rendu cloud
    shotstack_render_id TEXT,                    -- ID de rendu Shotstack si applicable

    -- Timestamps
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
```

---

## 3. Relations entre les tables

```
posts ──1:N──> leads           (source_post_id)
posts ──1:N──> content_jobs    (source_post_id)
posts ──1:1──> posts           (source_video_id, auto-référence pour repurposing)
posts ──1:1──> analytics       (top_post_id)
leads ──1:N──> conversations   (lead_id)
```

### Vue SQL utile : Pipeline complet Content → Lead → Closing

```sql
CREATE VIEW v_content_to_revenue AS
SELECT
    p.id AS post_id,
    p.title,
    p.format,
    p.views,
    p.reach,
    p.engagement_rate,
    COUNT(l.id) AS total_leads,
    COUNT(l.id) FILTER (WHERE l.status = 'booked') AS booked,
    COUNT(l.id) FILTER (WHERE l.status IN ('show', 'closed_won', 'closed_lost')) AS shows,
    COUNT(l.id) FILTER (WHERE l.status = 'closed_won') AS closed,
    COALESCE(SUM(l.conversion_value) FILTER (WHERE l.status = 'closed_won'), 0) AS revenue,
    CASE
        WHEN p.reach > 0 THEN ROUND(COUNT(l.id)::DECIMAL / p.reach * 100, 4)
        ELSE 0
    END AS lead_rate_pct
FROM posts p
LEFT JOIN leads l ON l.source_post_id = p.id
WHERE p.status = 'published'
GROUP BY p.id
ORDER BY revenue DESC;
```

---

## 4. Variables d'environnement requises (.env.example)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Instagram Graph API
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=
INSTAGRAM_BUSINESS_ACCOUNT_ID=

# OpenAI (Whisper + GPT-4o Setter)
OPENAI_API_KEY=

# Anthropic (Claude 3.5 Sonnet - Analyse)
ANTHROPIC_API_KEY=

# Shotstack (Rendu vidéo cloud)
SHOTSTACK_API_KEY=
SHOTSTACK_ENV=stage

# Calendly
CALENDLY_API_KEY=
CALENDLY_EVENT_TYPE_URL=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=                          # Secret pour sécuriser les endpoints cron
```

---

## 5. Flux de données principaux

### Flux 1 : Instagram → Analytics (toutes les 6h)
```
CRON → /api/analytics/harvest → Instagram Graph API → posts (update metrics) → analytics (snapshot)
```

### Flux 2 : DM → Lead → CRM
```
Instagram Webhook → /api/webhooks/instagram → conversations (save) → AI Setter (qualify) → leads (create/update) → Calendly (book)
```

### Flux 3 : Vidéo longue → Contenu court
```
Upload → /api/content/transcribe → content_jobs (transcription) → /api/content/extract (golden moments) → /api/content/render (FFmpeg/Shotstack) → posts (draft)
```
