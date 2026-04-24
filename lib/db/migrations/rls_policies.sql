-- RLS policies for Phase 1 (public no-auth tool)
-- Run this after applying the main migration (0000_colossal_gravity.sql)
--
-- Phase 1: No user authentication — all sessions are anonymous.
-- We enable RLS and grant insert+select to the anon role on all rows.
-- Phase 2 will add a user_id FK and tighten these policies to per-user access.

-- assessment_sessions
ALTER TABLE "assessment_sessions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_sessions"
  ON "assessment_sessions"
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_select_sessions"
  ON "assessment_sessions"
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "anon_update_sessions"
  ON "assessment_sessions"
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- assessment_reports
ALTER TABLE "assessment_reports" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_reports"
  ON "assessment_reports"
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_select_reports"
  ON "assessment_reports"
  FOR SELECT
  TO anon
  USING (true);
