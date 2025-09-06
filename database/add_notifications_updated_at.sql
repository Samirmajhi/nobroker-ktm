-- Migration: Add updated_at column to notifications to support update operations

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;


