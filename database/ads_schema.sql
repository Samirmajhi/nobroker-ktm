-- Ads table for managing advertisements
CREATE TABLE IF NOT EXISTS ads (
    ad_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    click_url VARCHAR(500),
    duration INTEGER DEFAULT 15, -- in seconds
    is_active BOOLEAN DEFAULT true,
    target_audience JSONB DEFAULT '["all"]', -- ["tenant", "owner", "all"]
    priority INTEGER DEFAULT 1,
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ad impressions tracking
CREATE TABLE IF NOT EXISTS ad_impressions (
    impression_id SERIAL PRIMARY KEY,
    ad_id INTEGER REFERENCES ads(ad_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    user_type VARCHAR(20) NOT NULL, -- tenant, owner, staff, admin
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    clicked_at TIMESTAMP,
    session_id VARCHAR(255)
);

-- Ad clicks tracking
CREATE TABLE IF NOT EXISTS ad_clicks (
    click_id SERIAL PRIMARY KEY,
    ad_id INTEGER REFERENCES ads(ad_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    user_type VARCHAR(20) NOT NULL,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(255),
    referrer_url VARCHAR(500)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ads_active ON ads(is_active);
CREATE INDEX IF NOT EXISTS idx_ads_target_audience ON ads USING GIN(target_audience);
CREATE INDEX IF NOT EXISTS idx_ads_priority ON ads(priority DESC);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad_id ON ad_impressions(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_user_id ON ad_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_viewed_at ON ad_impressions(viewed_at);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id ON ad_clicks(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_user_id ON ad_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_clicked_at ON ad_clicks(clicked_at);

-- Insert some sample ads
INSERT INTO ads (title, description, image_url, click_url, duration, target_audience, priority, is_active) VALUES
('Find Your Dream Home', 'Discover amazing properties with our premium search features. Get instant notifications for new listings that match your preferences.', null, 'https://example.com/tenant-premium', 15, '["tenant"]', 5, true),
('List Your Property Today', 'Reach thousands of potential tenants. Our premium listing features help you find the right match faster.', null, 'https://example.com/owner-premium', 15, '["owner"]', 5, true),
('Premium Property Management', 'Take your property management to the next level with our advanced tools and analytics.', null, 'https://example.com/premium-features', 20, '["all"]', 3, true),
('Real Estate Investment Tips', 'Learn how to maximize your real estate investments with our expert insights and market analysis.', null, 'https://example.com/investment-tips', 25, '["owner"]', 2, true),
('Home Buying Guide', 'Everything you need to know about buying your first home. Expert tips and step-by-step guidance.', null, 'https://example.com/buying-guide', 30, '["tenant"]', 2, true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
