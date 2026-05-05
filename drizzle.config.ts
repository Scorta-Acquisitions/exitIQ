import "./drizzle-env"

/**
 * Database workflow:
 *   pnpm db:generate   — generate a migration file after editing schema
 *   pnpm db:migrate    — apply pending migrations to the target database
 *   pnpm db:push       — push schema directly (dev only, skips migration files)
 *   pnpm db:studio     — open Drizzle Studio GUI
 *
 * Use SESSION pooler URL (port 5432) in DATABASE_URL when running migrations locally.
 * Use TRANSACTION pooler URL (port 6543) in DATABASE_URL for the deployed app.
 */
import { defineConfig } from "drizzle-kit"

import { env } from "./env.mjs"

export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
