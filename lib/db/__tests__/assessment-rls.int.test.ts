// @vitest-environment node
//
// Supabase PostgREST + RLS checks. Requires:
//   RUN_DB_INTEGRATION_TESTS=1
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  (anon / publishable key)
// Optional — two real accounts for JWT-vs-anon contrast (Supabase-recommended pattern):
//   SUPABASE_RLS_TEST_USER_A_EMAIL, SUPABASE_RLS_TEST_USER_A_PASSWORD
//   SUPABASE_RLS_TEST_USER_B_EMAIL, SUPABASE_RLS_TEST_USER_B_PASSWORD
// Optional service-role smoke (never ship this key to the browser in app code):
//   SUPABASE_SERVICE_SECRET_KEY
// Cleanup after each test (anon has no DELETE policy) — provide one of:
//   DATABASE_URL  (direct SQL delete), or
//   SUPABASE_SERVICE_SECRET_KEY  (same as smoke test; deletes via PostgREST)

import { createClient } from "@supabase/supabase-js"
import postgres from "postgres"
import { afterAll, afterEach, describe, expect, it } from "vitest"
import { randomUUID } from "node:crypto"

function supabaseIntegrationEnabled() {
  return (
    process.env.RUN_DB_INTEGRATION_TESTS === "1" &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  )
}

function rlsAuthUsersConfigured() {
  return Boolean(
    process.env.SUPABASE_RLS_TEST_USER_A_EMAIL &&
    process.env.SUPABASE_RLS_TEST_USER_A_PASSWORD &&
    process.env.SUPABASE_RLS_TEST_USER_B_EMAIL &&
    process.env.SUPABASE_RLS_TEST_USER_B_PASSWORD
  )
}

function serviceRoleConfigured() {
  return Boolean(process.env.SUPABASE_SERVICE_SECRET_KEY)
}

const skipNoSupabase = !supabaseIntegrationEnabled()

/** All integration `session_id` values use this prefix so afterEach can purge test rows. */
const VITEST_SESSION_ID_LIKE = "vitest%"

let pgCleanup: ReturnType<typeof postgres> | null = null

function getPgCleanup() {
  if (!process.env.DATABASE_URL) return null
  if (!pgCleanup) {
    pgCleanup = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 })
  }
  return pgCleanup
}

async function deleteVitestAssessmentRows() {
  const pg = getPgCleanup()
  if (pg) {
    await pg`DELETE FROM public.assessment_reports WHERE session_id LIKE ${VITEST_SESSION_ID_LIKE}`
    await pg`DELETE FROM public.assessment_sessions WHERE session_id LIKE ${VITEST_SESSION_ID_LIKE}`
    return
  }

  if (!serviceRoleConfigured() || !process.env.NEXT_PUBLIC_SUPABASE_URL) return

  const serviceClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  await serviceClient.from("assessment_reports").delete().like("session_id", VITEST_SESSION_ID_LIKE)
  await serviceClient.from("assessment_sessions").delete().like("session_id", VITEST_SESSION_ID_LIKE)
}

describe("assessment RLS (Supabase clients)", () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""

  afterEach(async () => {
    if (skipNoSupabase) return
    await deleteVitestAssessmentRows()
  })

  afterAll(async () => {
    if (pgCleanup) {
      await pgCleanup.end({ timeout: 5 })
      pgCleanup = null
    }
  })

  it.skipIf(skipNoSupabase)("anon: insert session, insert report (FK), select, update session", async () => {
    const client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const sessionId = `vitest-anon-${randomUUID()}`

    const { error: insertSessionErr, data: insertedSession } = await client
      .from("assessment_sessions")
      .insert({ session_id: sessionId, stage1: { industry: "other" } })
      .select("session_id")
      .single()

    expect(insertSessionErr).toBeNull()
    expect(insertedSession?.session_id).toBe(sessionId)

    const { error: insertReportErr } = await client.from("assessment_reports").insert({
      session_id: sessionId,
      report_md: "# Test",
      model_used: "vitest",
    })

    expect(insertReportErr).toBeNull()

    const { data: sessions, error: selectSessionErr } = await client
      .from("assessment_sessions")
      .select("session_id")
      .eq("session_id", sessionId)

    expect(selectSessionErr).toBeNull()
    expect(sessions?.length).toBeGreaterThanOrEqual(1)

    const { error: updateErr } = await client
      .from("assessment_sessions")
      .update({ score: 42 })
      .eq("session_id", sessionId)

    expect(updateErr).toBeNull()

    const { data: afterUpdate } = await client
      .from("assessment_sessions")
      .select("score")
      .eq("session_id", sessionId)
      .single()

    expect(afterUpdate?.score).toBe(42)
  })

  it.skipIf(skipNoSupabase)(
    "anon: second client can read rows created by first (Phase 1 permissive anon policies)",
    async () => {
      const writer = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const reader = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })

      const sessionId = `vitest-shared-${randomUUID()}`
      const { error: wErr } = await writer.from("assessment_sessions").insert({ session_id: sessionId })
      expect(wErr).toBeNull()

      const { data, error: rErr } = await reader
        .from("assessment_sessions")
        .select("session_id")
        .eq("session_id", sessionId)
        .maybeSingle()

      expect(rErr).toBeNull()
      expect(data?.session_id).toBe(sessionId)
    }
  )

  it.skipIf(skipNoSupabase)("anon: duplicate session_id is rejected (unique constraint)", async () => {
    const client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const sessionId = `vitest-dup-${randomUUID()}`
    const { error: firstErr } = await client.from("assessment_sessions").insert({ session_id: sessionId })
    expect(firstErr).toBeNull()

    const { error: dupErr } = await client.from("assessment_sessions").insert({ session_id: sessionId })

    expect(dupErr).not.toBeNull()
    expect(dupErr?.code).toBe("23505")
  })

  it.skipIf(skipNoSupabase || !serviceRoleConfigured())(
    "service_role: can read a row after anon inserts it (RLS bypass smoke)",
    async () => {
      const anonClient = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const serviceClient = createClient(url, process.env.SUPABASE_SERVICE_SECRET_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
      })

      const sessionId = `vitest-service-${randomUUID()}`
      const { error: insErr } = await anonClient.from("assessment_sessions").insert({ session_id: sessionId })
      expect(insErr).toBeNull()

      const { data, error } = await serviceClient
        .from("assessment_sessions")
        .select("session_id")
        .eq("session_id", sessionId)
        .maybeSingle()

      expect(error).toBeNull()
      expect(data?.session_id).toBe(sessionId)
    }
  )

  it.skipIf(skipNoSupabase)("anon: cannot update assessment_reports (no update policy in Phase 1)", async () => {
    const client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const sessionId = `vitest-noupdate-report-${randomUUID()}`
    await client.from("assessment_sessions").insert({ session_id: sessionId })
    await client.from("assessment_reports").insert({
      session_id: sessionId,
      report_md: "a",
      model_used: "vitest",
    })

    const { error } = await client.from("assessment_reports").update({ report_md: "b" }).eq("session_id", sessionId)

    const { data } = await client.from("assessment_reports").select("report_md").eq("session_id", sessionId).single()

    // PostgREST may return error (e.g. 42501) or a successful 0-row update when RLS blocks — assert row unchanged.
    const updateBlocked = error !== null || data?.report_md === "a"
    expect(updateBlocked).toBe(true)
  })

  const skipAuthUsers = skipNoSupabase || !rlsAuthUsersConfigured()

  it.skipIf(skipAuthUsers)(
    "authenticated users A and B: select assessment_sessions returns no rows (no RLS policies for authenticated role)",
    async () => {
      const userA = {
        email: process.env.SUPABASE_RLS_TEST_USER_A_EMAIL!,
        password: process.env.SUPABASE_RLS_TEST_USER_A_PASSWORD!,
      }
      const userB = {
        email: process.env.SUPABASE_RLS_TEST_USER_B_EMAIL!,
        password: process.env.SUPABASE_RLS_TEST_USER_B_PASSWORD!,
      }

      async function signedInClient(creds: { email: string; password: string }) {
        const client = createClient(url, anonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
        const { error } = await client.auth.signInWithPassword({
          email: creds.email,
          password: creds.password,
        })
        expect(error).toBeNull()
        return client
      }

      const clientA = await signedInClient(userA)
      const clientB = await signedInClient(userB)

      const { data: rowsA, error: errA } = await clientA.from("assessment_sessions").select("id").limit(5)

      expect(errA).toBeNull()
      expect(rowsA ?? []).toEqual([])

      const { data: rowsB, error: errB } = await clientB.from("assessment_sessions").select("id").limit(5)

      expect(errB).toBeNull()
      expect(rowsB ?? []).toEqual([])
    }
  )

  it.skipIf(skipAuthUsers)("authenticated user cannot insert into assessment_sessions", async () => {
    const client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { error: signErr } = await client.auth.signInWithPassword({
      email: process.env.SUPABASE_RLS_TEST_USER_A_EMAIL!,
      password: process.env.SUPABASE_RLS_TEST_USER_A_PASSWORD!,
    })
    expect(signErr).toBeNull()

    const sessionId = `vitest-auth-blocked-${randomUUID()}`

    const { error } = await client.from("assessment_sessions").insert({ session_id: sessionId })

    expect(error).not.toBeNull()
  })
})
