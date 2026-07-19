-- Migration: Fix program_funnel_stats view (Security Definer & Cross Join)

-- 1. Add program_id to founder_applications so applications can be tied to specific programs
ALTER TABLE founder_applications
ADD COLUMN IF NOT EXISTS program_id uuid REFERENCES founding_programs(id);

-- 2. Migrate existing applications to the default 'Founding 50' program 
-- (Assuming all existing applications belong to the first/default cohort)
UPDATE founder_applications
SET program_id = (SELECT id FROM founding_programs ORDER BY created_at ASC LIMIT 1)
WHERE program_id IS NULL;

-- 3. Recreate the program_funnel_stats view
-- Fix A: Add "with (security_invoker = on)" so the view respects RLS
-- Fix B: Change "ON true" to "ON fa.program_id = fp.id" so counts are accurate per program
DROP VIEW IF EXISTS program_funnel_stats;

CREATE OR REPLACE VIEW program_funnel_stats
WITH (security_invoker = on)
AS
SELECT
  fp.id AS program_id,
  fp.name,
  fp.cohort,
  fp.max_members,
  fp.accepted_members,
  fp.status AS program_status,
  COUNT(fa.id) FILTER (WHERE fa.status = 'pending')            AS pending_count,
  COUNT(fa.id) FILTER (WHERE fa.status = 'reviewing')          AS reviewing_count,
  COUNT(fa.id) FILTER (WHERE fa.status = 'interview_booked')   AS interview_booked_count,
  COUNT(fa.id) FILTER (WHERE fa.status = 'approved')           AS approved_count,
  COUNT(fa.id) FILTER (WHERE fa.status = 'onboarding')         AS onboarding_count,
  COUNT(fa.id) FILTER (WHERE fa.status = 'active')             AS active_count,
  COUNT(fa.id) FILTER (WHERE fa.status = 'rejected')           AS rejected_count,
  COUNT(fa.id)                                                  AS total_applications
FROM founding_programs fp
LEFT JOIN founder_applications fa ON fa.program_id = fp.id
GROUP BY fp.id, fp.name, fp.cohort, fp.max_members, fp.accepted_members, fp.status;
