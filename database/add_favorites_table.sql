-- Add missing favorites table
-- Run this script to fix the "relation 'favorites' does not exist" error

-- Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS favorites (
    favorite_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);

-- Add comment
COMMENT ON TABLE favorites IS 'User favorite listings for quick access';
