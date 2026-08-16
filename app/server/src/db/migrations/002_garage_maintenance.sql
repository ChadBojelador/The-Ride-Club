-- ========================================
-- The Rides Club — Garage & Vehicle Maintenance Schema
-- ========================================

-- 1. Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    make            VARCHAR(100) NOT NULL,
    model           VARCHAR(100) NOT NULL,
    year            INTEGER,
    type            VARCHAR(50) DEFAULT 'motorcycle',
    displacement_cc INTEGER,
    license_plate   VARCHAR(50),
    odometer_km     DECIMAL(10,2) DEFAULT 0,
    photo_url       TEXT,
    is_primary      BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_user ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_primary ON vehicles(user_id, is_primary);

-- 2. Maintenance Schedules / Intervals
CREATE TABLE IF NOT EXISTS maintenance_schedules (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id        UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    service_type      VARCHAR(50) NOT NULL,
    interval_km       INTEGER DEFAULT 3000,
    interval_months   INTEGER DEFAULT 6,
    last_service_km   DECIMAL(10,2) DEFAULT 0,
    last_service_date DATE DEFAULT CURRENT_DATE,
    is_active         BOOLEAN DEFAULT true,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vehicle_id, service_type)
);

CREATE INDEX IF NOT EXISTS idx_maint_schedules_veh ON maintenance_schedules(vehicle_id);

-- 3. Maintenance Logs / History
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id        UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
    service_type      VARCHAR(50) NOT NULL,
    title             VARCHAR(200) NOT NULL,
    notes             TEXT,
    cost              DECIMAL(10,2) DEFAULT 0,
    odometer_km       DECIMAL(10,2) NOT NULL,
    service_date      DATE DEFAULT CURRENT_DATE,
    performed_by      VARCHAR(100) DEFAULT 'DIY',
    receipt_url       TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maint_logs_veh ON maintenance_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maint_logs_user ON maintenance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_maint_logs_date ON maintenance_logs(service_date DESC);

-- 4. Link rides to specific vehicles
ALTER TABLE rides ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_rides_vehicle ON rides(vehicle_id);
