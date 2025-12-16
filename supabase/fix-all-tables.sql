-- Ensure ALL tables have RLS disabled for development

-- Check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Disable RLS on ALL tables (if not already done)
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS emergency_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rides DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ride_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS impact_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rewards DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reward_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS security_audit_log DISABLE ROW LEVEL SECURITY;

-- Grant ALL permissions to anon role (for development)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Verify all tables are accessible
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled",
  CASE WHEN rowsecurity THEN '❌ BLOCKED' ELSE '✅ OPEN' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
