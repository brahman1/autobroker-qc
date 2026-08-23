-- ============================================================
-- AutoBroker QC — Schéma PostgreSQL (Production)
-- En local, la base est gérée en mémoire par le backend
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE user_role AS ENUM ('CLIENT', 'ADMIN', 'BROKER');
CREATE TYPE kyc_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE saaq_status AS ENUM ('CLEAN', 'VGA', 'SCRAP');
CREATE TYPE auction_status AS ENUM ('SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED');
CREATE TYPE bid_status AS ENUM ('WINNING', 'OUTBID', 'WON', 'LOST', 'ERROR');
CREATE TYPE deposit_status AS ENUM ('PENDING', 'HOLD', 'CAPTURED', 'RELEASED', 'FAILED');
CREATE TYPE fuel_type AS ENUM ('ESSENCE', 'DIESEL', 'HYBRIDE', 'ELECTRIQUE', 'AUTRE');
CREATE TYPE vehicle_condition AS ENUM ('RUNS_AND_DRIVES', 'STARTS_BUT_DAMAGED', 'STATIONARY', 'ENHANCED_VEHICLE');

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'CLIENT',
    kyc_status kyc_status NOT NULL DEFAULT 'PENDING',
    stripe_customer_id VARCHAR(255),
    auth_id VARCHAR(255), -- Auth0 external ID (prod)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe ON users(stripe_customer_id);

-- Table: vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vin VARCHAR(17) UNIQUE NOT NULL,
    copart_lot_id VARCHAR(50),
    year SMALLINT NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    trim VARCHAR(100),
    color VARCHAR(50),
    mileage INTEGER,
    fuel_type fuel_type NOT NULL DEFAULT 'ESSENCE',
    condition vehicle_condition NOT NULL,
    saaq_status saaq_status NOT NULL DEFAULT 'CLEAN',
    damage_description TEXT,
    primary_damage VARCHAR(255),
    secondary_damage VARCHAR(255),
    images TEXT[] DEFAULT '{}',
    location VARCHAR(255) NOT NULL DEFAULT 'Montréal, QC',
    estimated_retail_value DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_vehicles_saaq ON vehicles(saaq_status);
CREATE INDEX idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX idx_vehicles_year ON vehicles(year);

-- Table: auctions
CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    status auction_status NOT NULL DEFAULT 'SCHEDULED',
    starting_bid DECIMAL(10, 2) NOT NULL,
    current_bid DECIMAL(10, 2) NOT NULL,
    current_winner_id UUID REFERENCES users(id),
    reserve_price DECIMAL(10, 2),
    scheduled_start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_end_at TIMESTAMP WITH TIME ZONE,
    bid_count INTEGER NOT NULL DEFAULT 0,
    brokerage_fee DECIMAL(5, 2) NOT NULL DEFAULT 15.00, -- % de frais de courtage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_vehicle ON auctions(vehicle_id);

-- Table: bids (SERIALIZABLE isolation pour éviter les race conditions)
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    max_bid_amount DECIMAL(10, 2) NOT NULL,
    actual_bid_amount DECIMAL(10, 2) NOT NULL,
    status bid_status NOT NULL DEFAULT 'WINNING',
    copart_bid_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_bids_auction ON bids(auction_id);
CREATE INDEX idx_bids_user ON bids(user_id);
-- Index partiel pour trouver rapidement l'offre gagnante actuelle
CREATE INDEX idx_bids_winning ON bids(auction_id) WHERE status = 'WINNING';

-- Table: deposits (cautions/dépôts de garantie)
CREATE TABLE deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    auction_id UUID REFERENCES auctions(id),
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    amount INTEGER NOT NULL, -- En cents (60000 = 600$)
    currency VARCHAR(3) NOT NULL DEFAULT 'cad',
    status deposit_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_deposits_user ON deposits(user_id);
CREATE INDEX idx_deposits_status ON deposits(user_id, status);

-- Table: audit_log (immutable — jamais effacé)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);

-- Trigger: updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON auctions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deposits_updated_at BEFORE UPDATE ON deposits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vue: enchères actives avec infos véhicule
CREATE VIEW active_auctions AS
SELECT 
    a.*,
    v.vin, v.year, v.make, v.model, v.color,
    v.saaq_status, v.images, v.location,
    v.estimated_retail_value,
    u.first_name as winner_first_name,
    u.last_name as winner_last_name
FROM auctions a
JOIN vehicles v ON a.vehicle_id = v.id
LEFT JOIN users u ON a.current_winner_id = u.id
WHERE a.status IN ('LIVE', 'SCHEDULED');

COMMENT ON TABLE users IS 'Utilisateurs de la plateforme AutoBroker QC';
COMMENT ON TABLE vehicles IS 'Inventaire des véhicules disponibles aux enchères';
COMMENT ON TABLE auctions IS 'Enchères actives et historique';
COMMENT ON TABLE bids IS 'Historique des offres — isolation SERIALIZABLE obligatoire';
COMMENT ON TABLE deposits IS 'Dépôts de caution Stripe (Hold/Capture/Release)';
COMMENT ON TABLE audit_log IS 'Journal immuable de toutes les actions financières';
