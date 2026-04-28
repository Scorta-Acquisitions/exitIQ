-- Security: route all DB access through Next.js API routes (service key, server-side).
-- The publishable (anon) key must never read or mutate rows directly.
-- Removes: anon SELECT/UPDATE on sessions, anon SELECT on reports.
-- Retains:  anon INSERT on sessions and reports so the API can still create rows
--           (those INSERT policies will be tightened further in a follow-up migration).
DROP POLICY IF EXISTS "anon_select_sessions" ON "assessment_sessions";
--> statement-breakpoint
DROP POLICY IF EXISTS "anon_update_sessions" ON "assessment_sessions";
--> statement-breakpoint
DROP POLICY IF EXISTS "anon_select_reports" ON "assessment_reports";
