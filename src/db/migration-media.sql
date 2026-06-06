-- Migration: Create property_media table for images and videos
-- Run: psql "$DATABASE_URL" < src/db/migration-media.sql

CREATE TABLE IF NOT EXISTS property_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by property
CREATE INDEX IF NOT EXISTS idx_property_media_property_id
  ON property_media (property_id);

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_property_media_sort
  ON property_media (property_id, sort_order);
