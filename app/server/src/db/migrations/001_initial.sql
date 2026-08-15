-- ========================================
-- The Rides Club — Initial Database Schema
-- Requires PostgreSQL with PostGIS extension
-- ========================================

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- Users
-- ========================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE,
    display_name    VARCHAR(100) NOT NULL,
    avatar_url      TEXT,
    bio             TEXT,
    bike_name       VARCHAR(100),
    bike_model      VARCHAR(100),
    bike_year       INTEGER,
    bike_photo_url  TEXT,
    is_public       BOOLEAN DEFAULT true,
    auth_provider   VARCHAR(20) NOT NULL,
    auth_provider_id VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(auth_provider, auth_provider_id)
);

-- ========================================
-- Rides
-- ========================================
CREATE TABLE rides (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200),
    description     TEXT,
    route           GEOMETRY(LineString, 4326),
    start_point     GEOMETRY(Point, 4326),
    end_point       GEOMETRY(Point, 4326),
    start_name      VARCHAR(200),
    end_name        VARCHAR(200),
    distance_km     DECIMAL(10,2),
    duration_seconds INTEGER,
    elevation_gain  DECIMAL(10,2),
    max_speed_kmh   DECIMAL(6,2),
    avg_speed_kmh   DECIMAL(6,2),
    visibility      VARCHAR(20) DEFAULT 'private',
    tracking_mode   VARCHAR(20) DEFAULT 'gps',
    status          VARCHAR(20) DEFAULT 'recording',
    started_at      TIMESTAMPTZ,
    finished_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rides_user ON rides(user_id);
CREATE INDEX idx_rides_route ON rides USING GIST(route);
CREATE INDEX idx_rides_visibility ON rides(visibility);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_created ON rides(created_at DESC);

-- ========================================
-- Ride Points (GPS breadcrumbs)
-- ========================================
CREATE TABLE ride_points (
    id          BIGSERIAL PRIMARY KEY,
    ride_id     UUID REFERENCES rides(id) ON DELETE CASCADE,
    location    GEOMETRY(Point, 4326) NOT NULL,
    elevation   DECIMAL(10,2),
    speed_kmh   DECIMAL(6,2),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ride_points_ride ON ride_points(ride_id);
CREATE INDEX idx_ride_points_time ON ride_points(recorded_at);

-- ========================================
-- Places
-- ========================================
CREATE TABLE places (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    category        VARCHAR(50) NOT NULL,
    custom_category VARCHAR(100),
    location        GEOMETRY(Point, 4326) NOT NULL,
    address         TEXT,
    rating          DECIMAL(2,1),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_places_location ON places USING GIST(location);
CREATE INDEX idx_places_category ON places(category);

-- ========================================
-- Photos
-- ========================================
CREATE TABLE photos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    ride_id         UUID REFERENCES rides(id) ON DELETE SET NULL,
    place_id        UUID REFERENCES places(id) ON DELETE SET NULL,
    url             TEXT NOT NULL,
    thumbnail_url   TEXT,
    location        GEOMETRY(Point, 4326),
    caption         TEXT,
    is_proof        BOOLEAN DEFAULT false,
    taken_at        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photos_ride ON photos(ride_id);
CREATE INDEX idx_photos_place ON photos(place_id);
CREATE INDEX idx_photos_user ON photos(user_id);

-- ========================================
-- Clubs
-- ========================================
CREATE TABLE clubs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    avatar_url  TEXT,
    cover_url   TEXT,
    created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    is_public   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Club Members
-- ========================================
CREATE TABLE club_members (
    club_id     UUID REFERENCES clubs(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    role        VARCHAR(20) DEFAULT 'member',
    joined_at   TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (club_id, user_id)
);

CREATE INDEX idx_club_members_user ON club_members(user_id);

-- ========================================
-- Club Invites
-- ========================================
CREATE TABLE club_invites (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id      UUID REFERENCES clubs(id) ON DELETE CASCADE,
    invited_by   UUID REFERENCES users(id) ON DELETE CASCADE,
    invited_user UUID REFERENCES users(id) ON DELETE CASCADE,
    status       VARCHAR(20) DEFAULT 'pending',
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_club_invites_user ON club_invites(invited_user);
CREATE INDEX idx_club_invites_status ON club_invites(status);

-- ========================================
-- Refresh Tokens (for JWT auth)
-- ========================================
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
