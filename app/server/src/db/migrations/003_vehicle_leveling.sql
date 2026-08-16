-- ========================================
-- The Rides Club — Vehicle Leveling & XP System
-- ========================================

-- 1. Add XP & Level columns to vehicles
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS places_visited_count INTEGER DEFAULT 0;

-- 2. Place visits (XP earned per stop discovered during a ride)
CREATE TABLE IF NOT EXISTS vehicle_place_visits (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id  UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    place_id    UUID REFERENCES places(id) ON DELETE CASCADE,
    ride_id     UUID REFERENCES rides(id) ON DELETE CASCADE,
    xp_earned   INTEGER DEFAULT 0,
    visited_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vehicle_id, place_id)  -- each place only stamped once per vehicle
);

CREATE INDEX IF NOT EXISTS idx_veh_visits_vehicle ON vehicle_place_visits(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_veh_visits_place ON vehicle_place_visits(place_id);
CREATE INDEX IF NOT EXISTS idx_veh_visits_ride ON vehicle_place_visits(ride_id);

-- 3. Unlocked badges per vehicle
CREATE TABLE IF NOT EXISTS vehicle_badges (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id      UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    badge_id        VARCHAR(100) NOT NULL,
    badge_name      VARCHAR(200) NOT NULL,
    badge_category  VARCHAR(50) NOT NULL,
    badge_icon      VARCHAR(10) NOT NULL,
    xp_awarded      INTEGER DEFAULT 0,
    unlocked_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vehicle_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_veh_badges_vehicle ON vehicle_badges(vehicle_id);
