-- Matches Supabase migration `fix_assessment_anon_policies_and_session_idx` (repair for DBs
-- missing anon INSERT RLS policies and/or `assessment_reports_session_id_idx` after 0004).
-- Idempotent: safe if policies/index already exist (e.g. applied earlier via dashboard/MCP).

CREATE INDEX IF NOT EXISTS "assessment_reports_session_id_idx" ON "assessment_reports" USING btree ("session_id");
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assessment_sessions' AND policyname = 'anon_insert_sessions'
  ) THEN
    CREATE POLICY "anon_insert_sessions" ON "assessment_sessions" FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assessment_reports' AND policyname = 'anon_insert_reports'
  ) THEN
    CREATE POLICY "anon_insert_reports" ON "assessment_reports" FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;
