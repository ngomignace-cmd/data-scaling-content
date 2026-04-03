-- Vue : Pipeline complet Content → Lead → Revenue
CREATE VIEW v_content_to_revenue AS
SELECT
    p.id AS post_id,
    p.title,
    p.format::TEXT,
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

-- Fonction : Incrémenter le compteur de leads d'un post
CREATE OR REPLACE FUNCTION increment_leads_generated(post_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE posts
    SET leads_generated = leads_generated + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;
