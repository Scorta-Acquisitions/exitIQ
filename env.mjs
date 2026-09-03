import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  // Allow skipping validation in CI / lint / test environments that lack real credentials.
  // Set SKIP_ENV_VALIDATION=true in CI env or when running lint without .env.local.
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  server: {
    /** When true, append structured workflow lines to `.exitiq-debug/workflow.ndjson` (local dev only; disabled on Vercel). */
    EXITIQ_WORKFLOW_LOG: z.enum(["true", "false"]).optional().transform((v) => v === "true"),
    ANALYZE: z.enum(["true", "false"]).optional().transform((v) => v === "true"),
    // Supabase — server-only
    DATABASE_URL: z.string().url(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_SECRET_KEY: z.string().min(1),
    // AI
    ANTHROPIC_API_KEY: z.string().min(1),
    // Email — optional until Resend is configured
    RESEND_API_KEY: z.string().min(1).optional(),
    // Local dev workflow tracing — writes NDJSON to .exitiq-debug/workflow.ndjson
    // Never active on Vercel (guarded by VERCEL!=1 in lib/debug/workflow-trace.ts)
    EXITIQ_WORKFLOW_LOG: z.enum(["true", "false"]).optional(),
  },
  client: {
    /** Canonical public origin of the site (used for metadataBase, sitemap, robots). Optional locally. */
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    /** Mirror `EXITIQ_WORKFLOW_LOG` for browser: enables POSTing client-side trace events to `/api/debug/workflow-trace`. */
    NEXT_PUBLIC_EXITIQ_WORKFLOW_LOG: z.enum(["true", "false"]).optional().transform((v) => v === "true"),
    // Supabase — safe for browser
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
    // Enables client→server trace event forwarding in local dev
    NEXT_PUBLIC_EXITIQ_WORKFLOW_LOG: z.enum(["true", "false"]).optional(),
  },
  runtimeEnv: {
    EXITIQ_WORKFLOW_LOG: process.env.EXITIQ_WORKFLOW_LOG,
    ANALYZE: process.env.ANALYZE,
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_SECRET_KEY: process.env.SUPABASE_SERVICE_SECRET_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_EXITIQ_WORKFLOW_LOG: process.env.NEXT_PUBLIC_EXITIQ_WORKFLOW_LOG,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EXITIQ_WORKFLOW_LOG: process.env.EXITIQ_WORKFLOW_LOG,
    NEXT_PUBLIC_EXITIQ_WORKFLOW_LOG: process.env.NEXT_PUBLIC_EXITIQ_WORKFLOW_LOG,
  },
})
