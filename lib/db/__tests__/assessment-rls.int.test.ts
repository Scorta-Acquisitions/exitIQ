// @vitest-environment node
//
// Supabase PostgREST + RLS checks after 0001_drop_anon_rw_policies migration.
//
// Policy state:
//   assessment_sessions: anon INSERT ✅  |  SELECT ❌  |  UPDATE ❌
//   assessment_reports:  anon INSERT ✅  |  SELECT ❌  |  UPDATE ❌
//
// Requires:
//   RUN_DB_INTEGRATION_TESTS=1
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  (anon / publishable key)
// Optional — two real accounts for JWT-vs-anon contrast (Supabase-recommended pattern):
//   SUPABASE_RLS_TEST_USER_A_EMAIL, SUPABASE_RLS_TEST_USER_A_PASSWORD
//   SUPABASE_RLS_TEST_USER_B_EMAIL, SUPABASE_RLS_TEST_USER_B_PASSWORD
// Optional service-role smoke (never ship this key to the browser):
//   SUPABASE_SERVICE_SECRET_KEY
// Cleanup after each test (anon has no DELETE policy) — provide one of:
//   DATABASE_URL  (direct SQL delete), or
//   SUPABASE_SERVICE_SECRET_KEY  (deletes via PostgREST)

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

  // ─── RETAINED: anon INSERT ───────────────────────────────────────────────────

  it.skipIf(skipNoSupabase)("anon: INSERT session succeeds (INSERT policy retained)", async () => {
    const client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const sessionId = `vitest-anon-${randomUUID()}`

    // Do NOT chain .select() — SELECT policy was dropped; chaining would fail.
    const { error } = await client.from("assessment_sessions").insert({ session_id: sessionId })

    expect(error).toBeNull()
  })

  it.skipIf(skipNoSupabase)("anon: INSERT report succeeds and FK constraint is honored", async () => {
    const client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const sessionId = `vitest-rpt-${randomUUID()}`

    const { error: sessErr } = await client.from("assessment_sessions").insert({ session_id: sessionId })
    expect(sessErr).toBeNull()

    // FK references assessment_sessions.session_id — enforced at the DB level regardless of RLS.
    const { error: rptErr } = await client.from("assessment_reports").insert({
      session_id: sessionId,
      report_md: "# Test",
      model_used: "vitest",
    })
    expect(rptErr).toBeNull()
  })

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

  // ─── BLOCKED: anon SELECT ────────────────────────────────────────────────────

  it.skipIf(skipNoSupabase)(
    "anon: SELECT sessions returns empty set (SELECT policy dropped — default deny)",
    async () => {
      const client = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })

      // Insert a row so we know there is data — anon still can INSERT.
      const sessionId = `vitest-noread-${randomUUID()}`
      await client.from("assessment_sessions").insert({ session_id: sessionId })

      // SELECT should return empty — RLS default-deny makes all rows invisible to anon.
      const { data, error } = await client.from("assessment_sessions").select("session_id").limit(10)

      expect(error).toBeNull() // Not a pg error; Postgres silently returns 0 rows.
      expect(data ?? []).toEqual([])
    }
  )

  it.skipIf(skipNoSupabase)(
    "anon: SELECT reports returns empty set (SELECT policy dropped — default deny)",
    async () => {
      const client = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })

      const { data, error } = await client.from("assessment_reports").select("session_id").limit(10)

      expect(error).toBeNull()
      expect(data ?? []).toEqual([])
    }
  )

  it.skipIf(skipNoSupabase)(
    "anon: a second anon client cannot read rows written by a first (SELECT policy dropped)",
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

      // Reader should see nothing — SELECT policy is gone.
      const { data, error: rErr } = await reader
        .from("assessment_sessions")
        .select("session_id")
        .eq("session_id", sessionId)
        .maybeSingle()

      expect(rErr).toBeNull()
      expect(data).toBeNull()
    }
  )

  // ─── BLOCKED: anon UPDATE ────────────────────────────────────────────────────

  it.skipIf(skipNoSupabase)(
    "anon: UPDATE sessions affects 0 rows (UPDATE policy dropped — rows invisible)",
    async () => {
      const client = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })

      const sessionId = `vitest-noupdate-sess-${randomUUID()}`
      await client.from("assessment_sessions").insert({ session_id: sessionId })

      // No UPDATE policy → no rows are visible → 0 rows matched → no error from PostgREST.
      const { error: updateErr } = await client
        .from("assessment_sessions")
        .update({ score: 99 })
        .eq("session_id", sessionId)

      expect(updateErr).toBeNull()

      // Verify via service_role that the value was NOT persisted.
      if (serviceRoleConfigured()) {
        const serviceClient = createClient(url, process.env.SUPABASE_SERVICE_SECRET_KEY!, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
        const { data } = await serviceClient
          .from("assessment_sessions")
          .select("score")
          .eq("session_id", sessionId)
          .maybeSingle()
        expect(data?.score).not.toBe(99)
      }
    }
  )

  it.skipIf(skipNoSupabase)("anon: UPDATE reports affects 0 rows (no UPDATE policy — never existed)", async () => {
    const sessionId = `vitest-noupdate-rpt-${randomUUID()}`

    // Use service_role to set up the row so we know the initial value.
    // Falls back to anon INSERT when service_role is not configured.
    if (serviceRoleConfigured()) {
      const svc = createClient(url, process.env.SUPABASE_SERVICE_SECRET_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      await svc.from("assessment_sessions").insert({ session_id: sessionId })
      await svc
        .from("assessment_reports")
        .insert({ session_id: sessionId, report_md: "original", model_used: "vitest" })
    } else {
      const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
      await anon.from("assessment_sessions").insert({ session_id: sessionId })
      await anon
        .from("assessment_reports")
        .insert({ session_id: sessionId, report_md: "original", model_used: "vitest" })
    }

    const client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { error: updateErr } = await client
      .from("assessment_reports")
      .update({ report_md: "tampered" })
      .eq("session_id", sessionId)

    // RLS blocks visibility → 0 rows affected, no PostgREST error.
    expect(updateErr).toBeNull()

    // Verify via service_role that the row is unchanged.
    if (serviceRoleConfigured()) {
      const svc = createClient(url, process.env.SUPABASE_SERVICE_SECRET_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { data } = await svc
        .from("assessment_reports")
        .select("report_md")
        .eq("session_id", sessionId)
        .maybeSingle()
      expect(data?.report_md).toBe("original")
    }
  })

  // ─── service_role smoke ───────────────────────────────────────────────────────

  it.skipIf(skipNoSupabase || !serviceRoleConfigured())(
    "service_role: bypasses RLS and can read a row anon inserted",
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

  // ─── authenticated role ───────────────────────────────────────────────────────

  const skipAuthUsers = skipNoSupabase || !rlsAuthUsersConfigured()

  it.skipIf(skipAuthUsers)(
    "authenticated users A and B: SELECT assessment_sessions returns no rows (no RLS policies for authenticated role)",
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

  it.skipIf(skipAuthUsers)("authenticated user cannot INSERT into assessment_sessions", async () => {
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
