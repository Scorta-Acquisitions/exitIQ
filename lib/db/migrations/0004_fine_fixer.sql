DROP INDEX "assessment_reports_session_id_idx";--> statement-breakpoint
ALTER TABLE "assessment_reports" ADD CONSTRAINT "assessment_reports_session_id_unique" UNIQUE("session_id");