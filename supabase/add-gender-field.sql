-- Add gender field to profiles table

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other'));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS aadhaar_name TEXT;

-- Add comment
COMMENT ON COLUMN profiles.gender IS 'User gender - enhanced security for female users';
COMMENT ON COLUMN profiles.aadhaar_name IS 'Name as per Aadhaar card (for verification)';

-- Verify addition
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name IN ('gender', 'aadhaar_name');

