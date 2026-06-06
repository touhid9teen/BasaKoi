-- BasaKoi Database Schema
-- Requires PostGIS extension enabled on your Neon database

-- Enable PostGIS (run once)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Properties table with spatial support
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  accommodation_type TEXT CHECK (accommodation_type IN ('full_flat', 'sublet_room')),
  rent_amount NUMERIC(10, 2) NOT NULL,
  service_charge NUMERIC(10, 2) DEFAULT 0,
  available_from TEXT,
  tenant_type TEXT CHECK (tenant_type IN ('family', 'bachelor_male', 'bachelor_female', 'any')),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(Point, 4326) NOT NULL,
  address TEXT,
  bachelor_allowed BOOLEAN DEFAULT false,
  gas_type TEXT CHECK (gas_type IN ('natural', 'cylinder', 'none')),
  lift_available BOOLEAN DEFAULT false,
  bedrooms INTEGER DEFAULT 1,
  bathroom INTEGER DEFAULT 1,
  description TEXT,
  phone TEXT,
  special_instructions TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'rented_out')),
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for fast bounding box queries
CREATE INDEX IF NOT EXISTS idx_properties_geom
  ON properties
  USING GIST (geom);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_properties_status
  ON properties (status);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_properties_user_id
  ON properties (user_id);

-- Function to update geom when lat/lng changes
CREATE OR REPLACE FUNCTION update_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set geom on insert/update
DROP TRIGGER IF EXISTS trg_update_geom ON properties;
CREATE TRIGGER trg_update_geom
  BEFORE INSERT OR UPDATE OF lat, lng
  ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_geom();
