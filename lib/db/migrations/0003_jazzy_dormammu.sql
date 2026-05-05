CREATE TABLE IF NOT EXISTS "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);

ALTER TABLE "waitlist" ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY is not idempotent; use DO block so migrate is safe if already applied manually
DO $$ BEGIN
  CREATE POLICY "anon_insert_waitlist" ON "waitlist" FOR INSERT TO "anon" WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
