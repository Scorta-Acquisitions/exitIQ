import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const migration0000Path = join(process.cwd(), "lib/db/migrations/0000_colossal_gravity.sql")
const migration0001Path = join(process.cwd(), "lib/db/migrations/0001_drop_anon_rw_policies.sql")

describe("0000_colossal_gravity migration SQL", () => {
  const sql = readFileSync(migration0000Path, "utf8")

  it("defines both assessment tables", () => {
    expect(sql).toContain('CREATE TABLE "assessment_sessions"')
    expect(sql).toContain('CREATE TABLE "assessment_reports"')
  })

  it("defines session_id uniqueness on assessment_sessions", () => {
    expect(sql).toContain("assessment_sessions_session_id_unique")
    expect(sql).toContain('UNIQUE("session_id")')
  })

  it("defines FK from assessment_reports.session_id to assessment_sessions.session_id", () => {
    expect(sql).toContain("assessment_reports_session_id_assessment_sessions_session_id_fk")
    expect(sql).toMatch(
      /FOREIGN KEY\s*\(\s*"session_id"\s*\)\s*REFERENCES\s*"public"\."assessment_sessions"\s*\(\s*"session_id"\s*\)/i
    )
  })

  it("defines btree index on assessment_reports.session_id", () => {
    expect(sql).toContain("assessment_reports_session_id_idx")
    expect(sql).toMatch(/CREATE INDEX[\s\S]*ON\s+"assessment_reports"[\s\S]*\(\s*"session_id"\s*\)/i)
  })

  it("enables RLS on both tables", () => {
    expect(sql).toContain('ALTER TABLE "assessment_sessions" ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain('ALTER TABLE "assessment_reports" ENABLE ROW LEVEL SECURITY')
  })

  it("defines Phase 1 anon policies (names + commands)", () => {
    expect(sql).toContain('CREATE POLICY "anon_insert_sessions"')
    expect(sql).toContain('CREATE POLICY "anon_select_sessions"')
    expect(sql).toContain('CREATE POLICY "anon_update_sessions"')
    expect(sql).toContain('CREATE POLICY "anon_insert_reports"')
    expect(sql).toContain('CREATE POLICY "anon_select_reports"')
    expect(sql).toMatch(/anon_insert_sessions[\s\S]*FOR INSERT TO anon/i)
    expect(sql).toMatch(/anon_select_sessions[\s\S]*FOR SELECT TO anon/i)
    expect(sql).toMatch(/anon_update_sessions[\s\S]*FOR UPDATE TO anon/i)
    expect(sql).toMatch(/anon_insert_reports[\s\S]*FOR INSERT TO anon/i)
    expect(sql).toMatch(/anon_select_reports[\s\S]*FOR SELECT TO anon/i)
  })
})

describe("0001_drop_anon_rw_policies migration SQL", () => {
  const sql = readFileSync(migration0001Path, "utf8")

  it("drops anon SELECT on sessions", () => {
    expect(sql).toMatch(/DROP POLICY IF EXISTS\s+"anon_select_sessions"\s+ON\s+"assessment_sessions"/i)
  })

  it("drops anon UPDATE on sessions", () => {
    expect(sql).toMatch(/DROP POLICY IF EXISTS\s+"anon_update_sessions"\s+ON\s+"assessment_sessions"/i)
  })

  it("drops anon SELECT on reports", () => {
    expect(sql).toMatch(/DROP POLICY IF EXISTS\s+"anon_select_reports"\s+ON\s+"assessment_reports"/i)
  })

  it("does NOT drop INSERT policies (retained for API writes)", () => {
    expect(sql).not.toContain('"anon_insert_sessions"')
    expect(sql).not.toContain('"anon_insert_reports"')
  })
})
