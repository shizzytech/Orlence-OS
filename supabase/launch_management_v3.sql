-- Migration: Add dynamic pricing plans and benefits to founding_programs

-- Add new JSONB columns for flexible data
ALTER TABLE founding_programs
ADD COLUMN pricing_plans jsonb DEFAULT '[]'::jsonb,
ADD COLUMN benefits jsonb DEFAULT '[]'::jsonb;

-- Optional: Migrate existing basic pricing into the new JSON array format
-- This ensures existing data isn't lost but mapped to the first tier of the new structure
UPDATE founding_programs
SET pricing_plans = jsonb_build_array(
  jsonb_build_object(
    'name', 'Starter Plan',
    'price', COALESCE(founder_pricing, '₦7,500/month')
  ),
  jsonb_build_object(
    'name', 'Growth Plan',
    'price', '₦15,000/month'
  ),
  jsonb_build_object(
    'name', 'Scale Plan',
    'price', '₦30,000/month'
  )
)
WHERE pricing_plans = '[]'::jsonb;

-- Optional: Add some default benefits for existing programs
UPDATE founding_programs
SET benefits = '["Lifetime pricing lock", "Priority support", "Early AI access", "Direct roadmap influence", "Founder badge"]'::jsonb
WHERE benefits = '[]'::jsonb;
