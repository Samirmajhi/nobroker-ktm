-- No-Broker Kathmandu Database Schema
-- PostgreSQL database setup for property rental platform

-- Create database (run this separately if needed)
-- CREATE DATABASE no_broker_kathmandu;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - Core user management
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('tenant', 'owner', 'staff', 'admin')),
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    profile_picture_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Listings table - Property listings
CREATE TABLE listings (
    listing_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    deposit DECIMAL(10,2) NOT NULL,
    size DECIMAL(8,2) NOT NULL, -- in sq ft
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    location VARCHAR(200) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    amenities TEXT[], -- Array of amenities
    availability_date DATE,
    safe_rent_verified BOOLEAN DEFAULT false,
    property_type VARCHAR(50) NOT NULL, -- apartment, house, room, etc.
    furnishing_status VARCHAR(20) DEFAULT 'unfurnished', -- furnished, semi-furnished, unfurnished
    parking_available BOOLEAN DEFAULT false,
    pet_friendly BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites table - User favorite listings
CREATE TABLE favorites (
    favorite_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

-- Listing views table - Track property views for analytics
CREATE TABLE IF NOT EXISTS listing_views (
    view_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_listing_views_listing_id ON listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_created_at ON listing_views(created_at);

-- Listing photos table
CREATE TABLE listing_photos (
    photo_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    photo_url VARCHAR(255) NOT NULL,
    photo_type VARCHAR(20) DEFAULT 'regular', -- regular, 360, virtual_tour
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visits table - Property visit scheduling
CREATE TABLE visits (
    visit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    rep_id UUID REFERENCES users(user_id), -- staff or owner-nominated rep
    visit_datetime TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    visit_notes TEXT,
    tenant_feedback TEXT,
    rep_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agreements table - Rental agreements
CREATE TABLE agreements (
    agreement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    signed_date DATE NOT NULL,
    rent DECIMAL(10,2) NOT NULL,
    deposit DECIMAL(10,2) NOT NULL,
    escrow_enabled BOOLEAN DEFAULT false,
    platform_fee DECIMAL(8,2) DEFAULT 250.00,
    agreement_pdf_url VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    terms_conditions TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'terminated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ratings table - User ratings and reviews
CREATE TABLE ratings (
    rating_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(listing_id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    owner_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    rating_type VARCHAR(20) NOT NULL CHECK (rating_type IN ('tenant_to_owner', 'owner_to_tenant', 'tenant_to_property')),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table - Financial transactions
CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(listing_id) ON DELETE CASCADE,
    agreement_id UUID REFERENCES agreements(agreement_id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('rent', 'deposit', 'platform_fee', 'escrow')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_date TIMESTAMP,
    escrow_release_date DATE,
    transaction_id VARCHAR(100),
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ads table - Advertisement management
CREATE TABLE ads (
    ad_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_type VARCHAR(20) NOT NULL CHECK (ad_type IN ('video', 'image', 'banner')),
    ad_content_url VARCHAR(255) NOT NULL,
    duration_sec INTEGER DEFAULT 15,
    target_audience VARCHAR(50), -- tenant, owner, all
    is_active BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table - User notifications
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT false,
    notification_type VARCHAR(50) NOT NULL, -- listing, visit, agreement, payment, etc.
    related_id UUID, -- ID of related entity (listing_id, visit_id, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recommendation history table - AI recommendations tracking
CREATE TABLE recommendation_history (
    rec_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    recommendation_score DECIMAL(3,2),
    reason TEXT,
    recommended_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Co-living units table - Shared accommodation management
CREATE TABLE coliving_units (
    coliving_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    total_rooms INTEGER NOT NULL,
    available_rooms INTEGER NOT NULL,
    rent_per_room DECIMAL(10,2) NOT NULL,
    amenities TEXT[],
    house_rules TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff assignments table - Staff management for listings
CREATE TABLE staff_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(listing_id) ON DELETE CASCADE,
    assigned_start DATE NOT NULL,
    assigned_end DATE,
    role VARCHAR(50) NOT NULL, -- property_manager, showing_agent, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table - Tenant preferences for AI recommendations
CREATE TABLE user_preferences (
    preference_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    preferred_locations TEXT[],
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    min_bedrooms INTEGER,
    max_bedrooms INTEGER,
    preferred_amenities TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KYC documents table - User verification documents
CREATE TABLE kyc_documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- id_proof, address_proof, property_proof
    document_url VARCHAR(255) NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_by UUID REFERENCES users(user_id),
    verified_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_listings_owner_id ON listings(owner_id);
CREATE INDEX idx_listings_location ON listings(location);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_bedrooms ON listings(bedrooms);
CREATE INDEX idx_listings_created_at ON listings(created_at);
CREATE INDEX idx_visits_listing_id ON visits(listing_id);
CREATE INDEX idx_visits_tenant_id ON visits(tenant_id);
CREATE INDEX idx_visits_datetime ON visits(visit_datetime);
CREATE INDEX idx_agreements_listing_id ON agreements(listing_id);
CREATE INDEX idx_agreements_tenant_id ON agreements(tenant_id);
CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_payments_owner_id ON payments(owner_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_status ON notifications(read_status);
CREATE INDEX idx_ratings_listing_id ON ratings(listing_id);
CREATE INDEX idx_ratings_tenant_id ON ratings(tenant_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agreements_updated_at BEFORE UPDATE ON agreements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coliving_units_updated_at BEFORE UPDATE ON coliving_units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO users (full_name, email, phone, password_hash, role, kyc_status) VALUES
('Admin User', 'admin@nobroker.com', '+977-1-1234567', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gSkmvG', 'admin', 'verified'),
('Test Owner', 'owner@test.com', '+977-1-1234568', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gSkmvG', 'owner', 'verified'),
('Test Tenant', 'tenant@test.com', '+977-1-1234569', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gSkmvG', 'tenant', 'verified');

-- Insert sample listing
INSERT INTO listings (owner_id, title, description, price, deposit, size, bedrooms, bathrooms, location, property_type) VALUES
((SELECT user_id FROM users WHERE email = 'owner@test.com'), 'Modern 2BHK Apartment in Thamel', 'Beautiful apartment in the heart of Thamel with modern amenities', 25000, 50000, 1200, 2, 2, 'Thamel, Kathmandu', 'apartment');

-- Insert sample ad
INSERT INTO ads (ad_type, ad_content_url, duration_sec, target_audience) VALUES
('image', 'https://example.com/sample-ad.jpg', 15, 'all');
