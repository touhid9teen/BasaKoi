-- Migration: Add new status values for admin management
-- Run: psql "$DATABASE_URL" < src/db/migration-add-status.sql

-- First, drop the existing CHECK constraint on status
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;

-- Add updated CHECK constraint with new status values
ALTER TABLE properties ADD CONSTRAINT properties_status_check
  CHECK (status IN ('available', 'rented_out', 'confirmed', 'paid'));

-- Update the TypeScript-like type definition comment (informational only)
COMMENT ON COLUMN properties.status IS 'Status: available, rented_out, confirmed, or paid';
