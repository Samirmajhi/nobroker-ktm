-- Migration: Add decision fields to visits table
-- Tenant and Owner can submit interest decision post-visit

ALTER TABLE visits
  ADD COLUMN IF NOT EXISTS tenant_decision VARCHAR(20) CHECK (tenant_decision IN ('interested','not_interested','undecided')) DEFAULT 'undecided',
  ADD COLUMN IF NOT EXISTS owner_decision VARCHAR(20) CHECK (owner_decision IN ('interested','not_interested','undecided')) DEFAULT 'undecided',
  ADD COLUMN IF NOT EXISTS tenant_decision_notes TEXT,
  ADD COLUMN IF NOT EXISTS owner_decision_notes TEXT,
  ADD COLUMN IF NOT EXISTS tenant_decision_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS owner_decision_at TIMESTAMP;


