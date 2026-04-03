CREATE TABLE settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key             TEXT UNIQUE NOT NULL,
    value           JSONB NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Valeurs par défaut
INSERT INTO settings (key, value, description) VALUES
    ('instagram_config', '{"access_token": "", "ig_user_id": "", "webhook_verify_token": ""}', 'Configuration Instagram Graph API'),
    ('setter_config', '{"model": "gpt-4o", "max_messages_per_lead": 10, "auto_qualify": true}', 'Configuration du Setter IA'),
    ('calendly_config', '{"api_key": "", "event_type_url": ""}', 'Configuration Calendly'),
    ('content_config', '{"default_format": "reel", "subtitle_style": "dynamic", "music_enabled": true}', 'Configuration Content Factory'),
    ('cpl_hourly_rate', '{"rate": 50}', 'Taux horaire pour le calcul du CPL organique');
