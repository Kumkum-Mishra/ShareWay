-- ShareWay Production Database Schema
-- Complete schema with security policies, triggers, and indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE (Users - Drivers & Passengers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('passenger', 'driver')),
  phone TEXT,
  profile_photo_url TEXT,
  
  -- Driver specific fields
  vehicle_type TEXT,
  vehicle_model TEXT,
  vehicle_capacity INTEGER DEFAULT 4,
  vehicle_number TEXT,
  
  -- Verification
  aadhaar_number TEXT UNIQUE,
  aadhaar_verified BOOLEAN DEFAULT FALSE,
  aadhaar_match_score DECIMAL(5,2),
  aadhaar_photo_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Stats
  total_rides_offered INTEGER DEFAULT 0,
  total_rides_taken INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_co2_saved DECIMAL(10,2) DEFAULT 0,
  
  -- Rewards
  reward_points INTEGER DEFAULT 1000, -- New users get 1000 points
  wallet_balance DECIMAL(10,2) DEFAULT 0,
  
  -- Preferences (JSONB for flexible storage)
  preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Security
  is_active BOOLEAN DEFAULT TRUE,
  is_suspended BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^[0-9]{10}$'),
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT driver_has_vehicle CHECK (
    role != 'driver' OR (vehicle_type IS NOT NULL AND vehicle_capacity IS NOT NULL)
  )
);

-- Indexes for profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_aadhaar ON profiles(aadhaar_number) WHERE aadhaar_number IS NOT NULL;
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);

-- ============================================================================
-- EMERGENCY CONTACTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL CHECK (phone ~ '^[0-9]{10}$'),
  relationship TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, phone)
);

CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);

-- ============================================================================
-- RIDES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Location details
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  origin_lat DECIMAL(10,7) NOT NULL,
  origin_lng DECIMAL(10,7) NOT NULL,
  dest_lat DECIMAL(10,7) NOT NULL,
  dest_lng DECIMAL(10,7) NOT NULL,
  
  -- Trip details
  departure_time TIMESTAMPTZ NOT NULL,
  available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
  total_seats INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  
  -- Route data (stored as JSONB)
  route_data JSONB,
  
  -- Estimates
  estimated_duration INTEGER, -- in minutes
  estimated_distance DECIMAL(10,2), -- in km
  estimated_co2_saved DECIMAL(10,2) DEFAULT 0,
  actual_co2_saved DECIMAL(10,2) DEFAULT 0,
  
  -- Pricing
  price_per_seat DECIMAL(10,2) NOT NULL CHECK (price_per_seat >= 0),
  currency TEXT DEFAULT 'INR',
  
  -- Completion
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT future_departure CHECK (departure_time >= created_at),
  CONSTRAINT valid_coordinates CHECK (
    origin_lat BETWEEN -90 AND 90 AND
    origin_lng BETWEEN -180 AND 180 AND
    dest_lat BETWEEN -90 AND 90 AND
    dest_lng BETWEEN -180 AND 180
  )
);

-- Indexes for rides
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_departure_time ON rides(departure_time);
CREATE INDEX idx_rides_created_at ON rides(created_at DESC);
CREATE INDEX idx_rides_origin_coords ON rides(origin_lat, origin_lng);
CREATE INDEX idx_rides_dest_coords ON rides(dest_lat, dest_lng);

-- ============================================================================
-- RIDE PARTICIPANTS TABLE (Bookings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ride_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Pickup/Dropoff details
  pickup_location TEXT NOT NULL,
  pickup_lat DECIMAL(10,7) NOT NULL,
  pickup_lng DECIMAL(10,7) NOT NULL,
  dropoff_location TEXT NOT NULL,
  dropoff_lat DECIMAL(10,7) NOT NULL,
  dropoff_lng DECIMAL(10,7) NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'picked_up', 'completed', 'cancelled')),
  
  -- Payment
  amount_paid DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'refunded')),
  coupon_code TEXT,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Ratings & Reviews
  rating_given DECIMAL(3,2) CHECK (rating_given IS NULL OR (rating_given >= 0 AND rating_given <= 5)),
  review TEXT,
  
  -- Impact
  co2_saved DECIMAL(10,2) DEFAULT 0,
  
  -- Cancellation
  cancelled_by TEXT CHECK (cancelled_by IS NULL OR cancelled_by IN ('passenger', 'driver')),
  cancellation_reason TEXT,
  refund_status TEXT CHECK (refund_status IS NULL OR refund_status IN ('pending', 'processed', 'completed')),
  
  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(ride_id, passenger_id),
  CONSTRAINT valid_pickup_coords CHECK (
    pickup_lat BETWEEN -90 AND 90 AND pickup_lng BETWEEN -180 AND 180
  ),
  CONSTRAINT valid_dropoff_coords CHECK (
    dropoff_lat BETWEEN -90 AND 90 AND dropoff_lng BETWEEN -180 AND 180
  )
);

-- Indexes for ride_participants
CREATE INDEX idx_ride_participants_ride_id ON ride_participants(ride_id);
CREATE INDEX idx_ride_participants_passenger_id ON ride_participants(passenger_id);
CREATE INDEX idx_ride_participants_status ON ride_participants(status);
CREATE INDEX idx_ride_participants_joined_at ON ride_participants(joined_at DESC);

-- ============================================================================
-- IMPACT METRICS TABLE (Daily aggregates)
-- ============================================================================
CREATE TABLE IF NOT EXISTS impact_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  
  -- Aggregated stats
  total_rides INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  total_co2_saved DECIMAL(10,2) DEFAULT 0,
  total_distance_shared DECIMAL(10,2) DEFAULT 0,
  average_occupancy DECIMAL(5,2) DEFAULT 0,
  fuel_saved_liters DECIMAL(10,2) DEFAULT 0,
  cost_saved DECIMAL(10,2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_impact_metrics_date ON impact_metrics(date DESC);

-- ============================================================================
-- REWARDS TABLE (Transaction log)
-- ============================================================================
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ride_completed', 'milestone', 'bonus', 'redemption', 'signup_bonus')),
  
  -- Optional metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rewards_user_id ON rewards(user_id);
CREATE INDEX idx_rewards_created_at ON rewards(created_at DESC);
CREATE INDEX idx_rewards_type ON rewards(type);

-- ============================================================================
-- COUPONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_ride')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  min_ride_value DECIMAL(10,2),
  
  -- Status
  is_used BOOLEAN DEFAULT FALSE,
  is_expired BOOLEAN DEFAULT FALSE,
  
  -- Usage
  used_at TIMESTAMPTZ,
  used_in_ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  
  -- Expiry
  expires_at TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT future_expiry CHECK (expires_at > created_at)
);

CREATE INDEX idx_coupons_user_id ON coupons(user_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_used ON coupons(is_used) WHERE is_used = FALSE;

-- ============================================================================
-- REWARD TRANSACTIONS TABLE (Detailed transaction log)
-- ============================================================================
CREATE TABLE IF NOT EXISTS reward_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'cashback', 'refund')),
  points INTEGER DEFAULT 0,
  cashback DECIMAL(10,2) DEFAULT 0,
  description TEXT NOT NULL,
  
  -- References
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reward_transactions_user_id ON reward_transactions(user_id);
CREATE INDEX idx_reward_transactions_type ON reward_transactions(type);
CREATE INDEX idx_reward_transactions_created_at ON reward_transactions(created_at DESC);

-- ============================================================================
-- SECURITY AUDIT LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  status TEXT CHECK (status IN ('success', 'failure', 'blocked')),
  details JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_created_at ON security_audit_log(created_at DESC);
CREATE INDEX idx_security_audit_log_action ON security_audit_log(action);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_impact_metrics_updated_at BEFORE UPDATE ON impact_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update ride available_seats when participant is added/removed
CREATE OR REPLACE FUNCTION update_ride_available_seats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE rides SET available_seats = available_seats - 1 WHERE id = NEW.ride_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
      UPDATE rides SET available_seats = available_seats - 1 WHERE id = NEW.ride_id;
    ELSIF OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
      UPDATE rides SET available_seats = available_seats + 1 WHERE id = NEW.ride_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    UPDATE rides SET available_seats = available_seats + 1 WHERE id = OLD.ride_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER manage_ride_seats
  AFTER INSERT OR UPDATE OR DELETE ON ride_participants
  FOR EACH ROW EXECUTE FUNCTION update_ride_available_seats();

-- Award signup bonus to new users
CREATE OR REPLACE FUNCTION award_signup_bonus()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO rewards (user_id, points, reason, type)
  VALUES (NEW.id, 1000, 'Welcome to ShareWay! Enjoy your signup bonus', 'signup_bonus');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER give_signup_bonus
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION award_signup_bonus();

-- Update driver rating when ride is completed and rated
CREATE OR REPLACE FUNCTION update_driver_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rating_given IS NOT NULL AND OLD.rating_given IS NULL THEN
    UPDATE profiles SET 
      rating = (
        SELECT AVG(rating_given)
        FROM ride_participants rp
        INNER JOIN rides r ON rp.ride_id = r.id
        WHERE r.driver_id = (SELECT driver_id FROM rides WHERE id = NEW.ride_id)
        AND rp.rating_given IS NOT NULL
      )
    WHERE id = (SELECT driver_id FROM rides WHERE id = NEW.ride_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review
  AFTER UPDATE ON ride_participants
  FOR EACH ROW EXECUTE FUNCTION update_driver_rating();

-- Decrease driver rating on cancellation
CREATE OR REPLACE FUNCTION penalize_driver_cancellation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND NEW.cancelled_by = 'driver' THEN
    UPDATE profiles 
    SET rating = GREATEST(rating - 0.25, 0)
    WHERE id = NEW.driver_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER penalize_cancellation
  AFTER UPDATE ON rides
  FOR EACH ROW EXECUTE FUNCTION penalize_driver_cancellation();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Anyone can view public profile info" ON profiles
  FOR SELECT USING (true); -- Public read for matching

-- Emergency Contacts: Users can manage their own
CREATE POLICY "Users can manage own emergency contacts" ON emergency_contacts
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Rides: Drivers can manage their rides, everyone can view active rides
CREATE POLICY "Drivers can create rides" ON rides
  FOR INSERT WITH CHECK (auth.uid()::text = driver_id::text);

CREATE POLICY "Drivers can update own rides" ON rides
  FOR UPDATE USING (auth.uid()::text = driver_id::text);

CREATE POLICY "Anyone can view active/pending rides" ON rides
  FOR SELECT USING (status IN ('pending', 'active') OR auth.uid()::text = driver_id::text);

-- Ride Participants: Passengers can manage their own bookings
CREATE POLICY "Passengers can create bookings" ON ride_participants
  FOR INSERT WITH CHECK (auth.uid()::text = passenger_id::text);

CREATE POLICY "Passengers and drivers can view bookings" ON ride_participants
  FOR SELECT USING (
    auth.uid()::text = passenger_id::text OR
    auth.uid()::text IN (SELECT driver_id::text FROM rides WHERE id = ride_id)
  );

CREATE POLICY "Passengers can cancel own bookings" ON ride_participants
  FOR UPDATE USING (auth.uid()::text = passenger_id::text);

-- Impact Metrics: Everyone can read
CREATE POLICY "Anyone can view impact metrics" ON impact_metrics
  FOR SELECT USING (true);

-- Rewards: Users can view their own rewards
CREATE POLICY "Users can view own rewards" ON rewards
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Coupons: Users can view and use their own coupons
CREATE POLICY "Users can manage own coupons" ON coupons
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Reward Transactions: Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON reward_transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Security Audit Log: Users can view their own logs
CREATE POLICY "Users can view own audit logs" ON security_audit_log
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
  total_rides BIGINT,
  completed_rides BIGINT,
  cancelled_rides BIGINT,
  total_co2_saved DECIMAL,
  total_distance DECIMAL,
  current_rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_rides,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_rides,
    COUNT(*) FILTER (WHERE status = 'cancelled')::BIGINT as cancelled_rides,
    COALESCE(SUM(actual_co2_saved), 0) as total_co2_saved,
    COALESCE(SUM(estimated_distance), 0) as total_distance,
    (SELECT rating FROM profiles WHERE id = user_uuid) as current_rating
  FROM rides
  WHERE driver_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate daily impact metrics
CREATE OR REPLACE FUNCTION calculate_daily_impact(target_date DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO impact_metrics (
    date,
    total_rides,
    total_participants,
    total_co2_saved,
    total_distance_shared,
    average_occupancy,
    fuel_saved_liters,
    cost_saved
  )
  SELECT
    target_date,
    COUNT(DISTINCT r.id) as total_rides,
    COUNT(rp.id) as total_participants,
    COALESCE(SUM(rp.co2_saved), 0) as total_co2_saved,
    COALESCE(SUM(r.estimated_distance), 0) as total_distance_shared,
    CASE WHEN COUNT(DISTINCT r.id) > 0 
      THEN COUNT(rp.id)::DECIMAL / COUNT(DISTINCT r.id) 
      ELSE 0 
    END as average_occupancy,
    COALESCE(SUM(rp.co2_saved) / 2.31, 0) as fuel_saved_liters,
    COALESCE(SUM(rp.amount_paid) * 0.7, 0) as cost_saved
  FROM rides r
  LEFT JOIN ride_participants rp ON r.id = rp.ride_id AND rp.status = 'completed'
  WHERE DATE(r.completed_at) = target_date
  ON CONFLICT (date) DO UPDATE SET
    total_rides = EXCLUDED.total_rides,
    total_participants = EXCLUDED.total_participants,
    total_co2_saved = EXCLUDED.total_co2_saved,
    total_distance_shared = EXCLUDED.total_distance_shared,
    average_occupancy = EXCLUDED.average_occupancy,
    fuel_saved_liters = EXCLUDED.fuel_saved_liters,
    cost_saved = EXCLUDED.cost_saved,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INITIAL DATA & INDEXES
-- ============================================================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rides_location_search ON rides 
  USING gist (box(point(origin_lng, origin_lat), point(dest_lng, dest_lat)));

COMMENT ON TABLE profiles IS 'User profiles for both passengers and drivers';
COMMENT ON TABLE rides IS 'Carpooling rides offered by drivers';
COMMENT ON TABLE ride_participants IS 'Passengers who have joined rides';
COMMENT ON TABLE impact_metrics IS 'Daily aggregated environmental impact statistics';
COMMENT ON TABLE rewards IS 'User reward points transaction log';
COMMENT ON TABLE coupons IS 'Discount coupons earned through rewards';
COMMENT ON TABLE reward_transactions IS 'Detailed reward transaction history';
COMMENT ON TABLE security_audit_log IS 'Security and access audit trail';

