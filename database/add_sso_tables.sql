-- SSO Integration Tables
-- Add SSO support to No-Broker Kathmandu

-- SSO Accounts table - Store linked SSO accounts
CREATE TABLE sso_accounts (
    sso_account_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('google', 'facebook', 'microsoft')),
    provider_id VARCHAR(100) NOT NULL,
    provider_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_id)
);

-- Indexes for performance
CREATE INDEX idx_sso_accounts_user_id ON sso_accounts(user_id);
CREATE INDEX idx_sso_accounts_provider ON sso_accounts(provider);

-- Update users table to allow empty password_hash for SSO users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Add SSO provider info to users table
ALTER TABLE users ADD COLUMN sso_providers TEXT[] DEFAULT '{}';

-- Create function to update SSO providers array
CREATE OR REPLACE FUNCTION update_user_sso_providers()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the user's sso_providers array when SSO account is added/removed
    UPDATE users 
    SET sso_providers = (
        SELECT ARRAY_AGG(provider) 
        FROM sso_accounts 
        WHERE user_id = NEW.user_id
    )
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update sso_providers
CREATE TRIGGER trigger_update_sso_providers
    AFTER INSERT OR DELETE ON sso_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_sso_providers();

-- Add comments for documentation
COMMENT ON TABLE sso_accounts IS 'Stores linked SSO accounts for users';
COMMENT ON COLUMN sso_accounts.provider IS 'SSO provider: google, facebook, microsoft';
COMMENT ON COLUMN sso_accounts.provider_id IS 'Unique ID from the SSO provider';
COMMENT ON COLUMN sso_accounts.provider_data IS 'Additional data from SSO provider (profile info, etc.)';
COMMENT ON COLUMN users.sso_providers IS 'Array of SSO providers linked to this user account';

