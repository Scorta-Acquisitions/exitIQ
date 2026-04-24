CREATE TABLE "assessment_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"report_md" text NOT NULL,
	"teaser_json" jsonb,
	"model_used" text NOT NULL,
	"generation_ms" integer
);
--> statement-breakpoint
CREATE TABLE "assessment_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"stage1" jsonb,
	"gate" jsonb,
	"stage2" jsonb,
	"stage3" jsonb,
	"stage4" jsonb,
	"segment_tag" text,
	"score" integer,
	"sba_eligible" boolean,
	CONSTRAINT "assessment_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
ALTER TABLE "assessment_reports" ADD CONSTRAINT "assessment_reports_session_id_assessment_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."assessment_sessions"("session_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "assessment_reports_session_id_idx" ON "assessment_reports" USING btree ("session_id");
--> statement-breakpoint
-- RLS: Phase 1 (public no-auth tool)
-- Policies use USING (true) / WITH CHECK (true) for anon role.
-- Phase 2 will add user_id FK and tighten these to per-user policies.
ALTER TABLE "assessment_sessions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "assessment_reports" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "anon_insert_sessions" ON "assessment_sessions" FOR INSERT TO anon WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY "anon_select_sessions" ON "assessment_sessions" FOR SELECT TO anon USING (true);
--> statement-breakpoint
CREATE POLICY "anon_update_sessions" ON "assessment_sessions" FOR UPDATE TO anon USING (true) WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY "anon_insert_reports" ON "assessment_reports" FOR INSERT TO anon WITH CHECK (true);
--> statement-breakpoint
CREATE POLICY "anon_select_reports" ON "assessment_reports" FOR SELECT TO anon USING (true);
