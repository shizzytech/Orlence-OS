-- Launch Management System Migration

-- 1. Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default platform settings
INSERT INTO platform_settings (setting_key, setting_value, description)
VALUES 
  ('waitlist_enabled', 'true', 'Whether the public waitlist is currently accepting emails'),
  ('invite_only', 'true', 'Whether users can sign up without an invitation'),
  ('beta_open', 'false', 'Whether the public beta is open'),
  ('accepting_applications', 'true', 'Whether the global application form is visible')
ON CONFLICT (setting_key) DO NOTHING;

-- 2. Create founding_programs table
CREATE TABLE IF NOT EXISTS founding_programs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  cohort text NOT NULL,
  max_members integer NOT NULL DEFAULT 50,
  accepted_members integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'accepting', -- draft, accepting, closed, active
  founder_pricing text,
  auto_close boolean DEFAULT true,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert the default Founding 50 program
INSERT INTO founding_programs (name, cohort, max_members, status, founder_pricing, auto_close)
VALUES (
  'Founding 50',
  '2026 Cohort',
  50,
  'accepting',
  '₦10,000',
  true
) ON CONFLICT DO NOTHING;

-- Policies for platform_settings
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for platform settings" 
  ON platform_settings FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Admin update access for platform settings" 
  ON platform_settings FOR ALL 
  TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Policies for founding_programs
ALTER TABLE founding_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for founding programs" 
  ON founding_programs FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Admin access for founding programs" 
  ON founding_programs FOR ALL 
  TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));
