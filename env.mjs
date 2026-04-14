import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  // Allow skipping validation in CI / lint / test environments that lack real credentials.
  // Set SKIP_ENV_VALIDATION=true in CI env or when running lint without .env.local.
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  server: {
    ANALYZE: z.enum(["true", "false"]).optional().transform((v) => v === "true"),
    // Supabase — server-only
    DATABASE_URL: z.string().url(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_SECRET_KEY: z.string().min(1),
    // AI
    ANTHROPIC_API_KEY: z.string().min(1),
  },
  client: {
    // Supabase — safe for browser
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_SECRET_KEY: process.env.SUPABASE_SERVICE_SECRET_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  },
})
