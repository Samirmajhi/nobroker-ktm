-- PRODUCTION DATABASE OPTIMIZATION SCRIPT
-- Run this script to optimize your database for production scale

-- 1. CRITICAL INDEXES FOR PERFORMANCE
-- These indexes are essential for handling high user loads

-- Listings table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_location ON listings(location);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_created_at ON listings(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_property_type ON listings(property_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_bedrooms ON listings(bedrooms);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_bathrooms ON listings(bathrooms);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_is_active ON listings(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_owner_id ON listings(owner_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_price_location ON listings(price, location);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_type_price ON listings(property_type, price);

-- Users table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Visits table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_visits_user_id ON visits(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_visits_listing_id ON visits(listing_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_visits_visit_date ON visits(visit_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_visits_created_at ON visits(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_visits_user_listing ON visits(user_id, listing_id);

-- Favorites table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_listing ON favorites(user_id, listing_id);

-- Messages table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);

-- Notifications table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- Ads table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ads_is_active ON ads(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ads_target_audience ON ads USING GIN(target_audience);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ads_priority ON ads(priority DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ads_created_at ON ads(created_at);

-- Ad impressions indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ad_impressions_ad_id ON ad_impressions(ad_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ad_impressions_user_id ON ad_impressions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ad_impressions_viewed_at ON ad_impressions(viewed_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ad_impressions_user_type ON ad_impressions(user_type);

-- Ad clicks indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ad_clicks_ad_id ON ad_clicks(ad_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ad_clicks_user_id ON ad_clicks(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ad_clicks_clicked_at ON ad_clicks(clicked_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ad_clicks_user_type ON ad_clicks(user_type);

-- 2. DATABASE CONFIGURATION OPTIMIZATION
-- These settings optimize PostgreSQL for production workloads

-- Connection settings
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- Query optimization
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET max_worker_processes = 8;
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;
ALTER SYSTEM SET max_parallel_workers = 8;

-- Logging for monitoring
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- 3. PARTIAL INDEXES FOR COMMON QUERIES
-- These indexes optimize specific query patterns

-- Active listings only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_active_price 
ON listings(price) WHERE is_active = true;

-- Recent listings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_recent 
ON listings(created_at DESC) WHERE created_at > NOW() - INTERVAL '30 days';

-- Pending visits
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_visits_pending 
ON visits(visit_date) WHERE status = 'pending';

-- Unread notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_unread 
ON notifications(created_at DESC) WHERE is_read = false;

-- 4. COMPOSITE INDEXES FOR COMPLEX QUERIES
-- These indexes optimize multi-column queries

-- Property search optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_search 
ON listings(location, property_type, price, bedrooms) 
WHERE is_active = true;

-- User activity optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_visits_user_activity 
ON visits(user_id, created_at DESC, status);

-- Message conversation optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_time 
ON messages(conversation_id, created_at DESC);

-- 5. STATISTICS AND ANALYTICS
-- Update table statistics for better query planning
ANALYZE;

-- 6. VACUUM AND MAINTENANCE
-- Clean up and optimize tables
VACUUM ANALYZE;

-- 7. MONITORING QUERIES
-- Use these queries to monitor database performance

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Check slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 8. PERFORMANCE MONITORING VIEWS
-- Create views for easy monitoring

CREATE OR REPLACE VIEW db_performance_stats AS
SELECT 
    'Database Size' as metric,
    pg_size_pretty(pg_database_size(current_database())) as value
UNION ALL
SELECT 
    'Active Connections',
    count(*)::text
FROM pg_stat_activity 
WHERE state = 'active'
UNION ALL
SELECT 
    'Total Connections',
    count(*)::text
FROM pg_stat_activity;

-- 9. BACKUP AND RECOVERY PREPARATION
-- Ensure WAL archiving is configured for point-in-time recovery
-- (This requires server configuration, not SQL)

-- 10. SECURITY OPTIMIZATIONS
-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'secure_analytics_password';
GRANT CONNECT ON DATABASE no_broker_kathmandu TO analytics_user;
GRANT USAGE ON SCHEMA public TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Create application user with limited privileges
CREATE USER app_user WITH PASSWORD 'secure_app_password';
GRANT CONNECT ON DATABASE no_broker_kathmandu TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- 11. FINAL OPTIMIZATION
-- Refresh materialized views if any exist
-- (Add any materialized views here)

-- Update statistics one final time
ANALYZE;

-- Show final database status
SELECT 
    'Optimization Complete' as status,
    now() as completed_at,
    pg_size_pretty(pg_database_size(current_database())) as database_size;
