-- ========================================
-- The Rides Club — Route Leaderboards
-- ========================================

-- 1. Route Segments (unique corridor identified by start + end proximity)
CREATE TABLE IF NOT EXISTS route_segments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(300) NOT NULL,
    start_name      VARCHAR(200),
    end_name        VARCHAR(200),
    start_point     GEOGRAPHY(POINT, 4326) NOT NULL,
    end_point       GEOGRAPHY(POINT, 4326) NOT NULL,
    distance_km     NUMERIC(10, 2) DEFAULT 0,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    total_attempts  INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seg_start ON route_segments USING GIST(start_point);
CREATE INDEX IF NOT EXISTS idx_seg_end   ON route_segments USING GIST(end_point);

-- 2. Segment Leaderboard — one row per rider per segment (personal best only)
CREATE TABLE IF NOT EXISTS segment_leaderboard (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id       UUID REFERENCES route_segments(id) ON DELETE CASCADE NOT NULL,
    ride_id          UUID REFERENCES rides(id) ON DELETE CASCADE NOT NULL,
    user_id          UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    vehicle_id       UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    duration_seconds INTEGER NOT NULL,
    distance_km      NUMERIC(10, 2),
    avg_speed_kmh    NUMERIC(8, 2),
    max_speed_kmh    NUMERIC(8, 2),
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    -- Only keep each rider's personal best per segment
    UNIQUE(segment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_lb_segment  ON segment_leaderboard(segment_id);
CREATE INDEX IF NOT EXISTS idx_lb_user     ON segment_leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_lb_duration ON segment_leaderboard(segment_id, duration_seconds ASC);
