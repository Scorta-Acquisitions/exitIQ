CREATE TABLE "assessment_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"report_md" text NOT NULL,
	"teaser_json" jsonb,
	"model_used" text NOT NULL,
	"generation_ms" integer
);
--> statement-breakpoint
CREATE TABLE "assessment_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
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