-- Ensure listing_photos table exists
CREATE TABLE IF NOT EXISTS listing_photos (
    photo_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    photo_url VARCHAR(255) NOT NULL,
    photo_type VARCHAR(20) DEFAULT 'regular',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_listing_photos_listing_id ON listing_photos(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_photos_is_primary ON listing_photos(is_primary);
