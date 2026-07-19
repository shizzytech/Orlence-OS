-- Launch Management System v2 Migration
-- Run this AFTER the original launch_management.sql

-- 1. Add 'applications' snapshot column to founding_programs (optional, used for display)
ALTER TABLE founding_programs 
  ADD COLUMN IF NOT EXISTS applications_count integer NOT NULL DEFAULT 0;

-- 2. Extend founder_applications status to support the full funnel
-- The status column already exists; new allowed values are documented here:
-- pending → reviewing → interview_booked → approved → onboarding → active
-- rejected (from any stage)
-- These are application-level states only — no schema change needed since it's a text field.

-- 3. (Optional) Create a view that computes live funnel stats per program
-- This is the source of truth we query in the admin dashboard
CREATE OR REPLACE VIEW program_funnel_stats AS
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
LEFT JOIN founder_applications fa ON true
GROUP BY fp.id, fp.name, fp.cohort, fp.max_members, fp.accepted_members, fp.status;
