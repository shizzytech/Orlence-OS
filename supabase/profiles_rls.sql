-- Add RLS policies for the profiles table so users can read and update their own profiles

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" 
  ON profiles FOR SELECT 
  TO authenticated 
  USING (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  TO authenticated 
  USING (id = auth.uid());
