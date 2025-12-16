-- Disable Row Level Security temporarily for development
-- This allows the app to read/write without authentication

-- Disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE rides DISABLE ROW LEVEL SECURITY;
ALTER TABLE ride_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE impact_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE rewards DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE reward_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_log DISABLE ROW LEVEL SECURITY;

-- Verification
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

