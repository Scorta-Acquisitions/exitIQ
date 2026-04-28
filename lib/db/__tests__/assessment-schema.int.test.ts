// @vitest-environment node
//
// Integration checks against a real Postgres (e.g. Supabase session pooler on 5432).
//   RUN_DB_INTEGRATION_TESTS=1 — required to un-skip this file
//   DATABASE_URL — connection string
// Optional destructive replay of `0000_colossal_gravity.sql` from disk (drops public.assessment_*):
//   DB_INTEGRATION_RESET_SCHEMA=1

import postgres from "postgres"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

function integrationEnabled() {
  return process.env.RUN_DB_INTEGRATION_TESTS === "1" && Boolean(process.env.DATABASE_URL)
}

const migrationPath = join(process.cwd(), "lib/db/migrations/0000_colossal_gravity.sql")

describe.skipIf(!integrationEnabled())("assessment schema (live DATABASE_URL)", () => {
  const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 })

  afterAll(async () => {
    await sql.end({ timeout: 5 })
  })

  beforeAll(async () => {
    if (process.env.DB_INTEGRATION_RESET_SCHEMA !== "1") return

    const migrationSql = readFileSync(migrationPath, "utf8")
    const statements = migrationSql
      .split(/--> statement-breakpoint\n/g)
      .map((s) => s.trim())
      .filter(Boolean)

    await sql.unsafe(`
      DROP TABLE IF EXISTS public.assessment_reports CASCADE;
      DROP TABLE IF EXISTS public.assessment_sessions CASCADE;
    `)

    for (const stmt of statements) {
      await sql.unsafe(stmt)
    }
  })

  it("has assessment_sessions and assessment_reports in pg_tables", async () => {
    const rows = await sql<{ tablename: string }[]>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN ('assessment_sessions', 'assessment_reports')
      ORDER BY tablename
    `
    expect(rows.map((r) => r.tablename)).toEqual(["assessment_reports", "assessment_sessions"])
  })

  it("has FK from assessment_reports to assessment_sessions on session_id", async () => {
    const rows = await sql<{ conname: string }[]>`
      SELECT c.conname
      FROM pg_constraint c
      JOIN pg_class rel ON rel.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = rel.relnamespace
      WHERE n.nspname = 'public'
        AND rel.relname = 'assessment_reports'
        AND c.contype = 'f'
    `
    expect(rows.some((r) => r.conname === "assessment_reports_session_id_assessment_sessions_session_id_fk")).toBe(true)
  })

  it("has btree index assessment_reports_session_id_idx", async () => {
    const rows = await sql<{ indexname: string }[]>`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'assessment_reports'
        AND indexname = 'assessment_reports_session_id_idx'
    `
    expect(rows).toHaveLength(1)
  })

  it("has RLS enabled and expected anon policies registered", async () => {
    const rls = await sql<{ relname: string; relrowsecurity: boolean }[]>`
      SELECT c.relname, c.relrowsecurity
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND c.relname IN ('assessment_sessions', 'assessment_reports')
      ORDER BY c.relname
    `
    for (const row of rls) {
      expect(row.relrowsecurity).toBe(true)
    }

    const policies = await sql<{ tablename: string; policyname: string; roles: string[]; cmd: string }[]>`
      SELECT tablename, policyname, roles, cmd
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename IN ('assessment_sessions', 'assessment_reports')
      ORDER BY tablename, policyname
    `

    const names = policies.map((p) => `${p.tablename}:${p.policyname}`)
    expect(names).toContain("assessment_sessions:anon_insert_sessions")
    expect(names).toContain("assessment_sessions:anon_select_sessions")
    expect(names).toContain("assessment_sessions:anon_update_sessions")
    expect(names).toContain("assessment_reports:anon_insert_reports")
    expect(names).toContain("assessment_reports:anon_select_reports")

    for (const p of policies) {
      expect(p.roles).toContain("anon")
    }
  })
})
