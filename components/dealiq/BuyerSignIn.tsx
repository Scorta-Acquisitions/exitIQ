"use client"

/**
 * DealIQ's own front door.
 *
 * Written fresh against the same Supabase browser client `LoginPanel` uses —
 * borrowing its auth call and error handling, not its layout or copy. A buyer
 * must never see a seller-branded sign-in, and must never land on `/dashboard`.
 *
 * `destination` arrives pre-validated by `safeDealIqPath` on the server page —
 * this component never reads `?next=` itself.
 */

import { useRouter } from "next/navigation"
import React from "react"

import { SIGNIN_COPY } from "@/lib/dealiq/data/copy"
import { DEALIQ_ROOT } from "@/lib/dealiq/navigation"
import { createClient } from "@/lib/supabase/client"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

type Phase = "idle" | "submitting"

export function BuyerSignIn({ destination = DEALIQ_ROOT }: { destination?: string }) {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [phase, setPhase] = React.useState<Phase>("idle")
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (phase === "submitting") return
    setPhase("submitting")
    setError(null)

    try {
      const { error: authError } = await createClient().auth.signInWithPassword({ email, password })
      if (authError) {
        setError(SIGNIN_COPY.invalidCredentials)
        setPhase("idle")
        return
      }
    } catch {
      // Network or client failure — never leave the button spinning.
      setError(SIGNIN_COPY.networkError)
      setPhase("idle")
      return
    }

    router.replace(destination)
    router.refresh()
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: inter,
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
          <span
            aria-hidden
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "var(--dq-accent)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: garamond,
              fontSize: 17,
              fontWeight: 500,
            }}
          >
            D
          </span>
          <span style={{ fontFamily: garamond, fontSize: 22, fontWeight: 500, letterSpacing: "-.3px" }}>
            {SIGNIN_COPY.wordmark}
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--dq-accent)",
              background: "var(--dq-accent-soft)",
              border: "1px solid var(--dq-accent-edge)",
              borderRadius: 5,
              padding: "2px 5px",
            }}
          >
            {SIGNIN_COPY.mark}
          </span>
        </div>

        <p style={{ margin: "0 0 24px", fontSize: 13.5, lineHeight: 1.6, color: "var(--t2)" }}>
          {SIGNIN_COPY.positioning}
        </p>

        <form
          onSubmit={onSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: 20,
            borderRadius: 13,
            border: "1px solid var(--b3)",
            background: "var(--glass-bg)",
            boxShadow: "var(--glass-shadow)",
          }}
        >
          <Field
            id="dq-email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="username"
            disabled={phase === "submitting"}
          />
          <Field
            id="dq-password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            disabled={phase === "submitting"}
          />

          {error ? (
            <p
              role="alert"
              style={{
                margin: 0,
                fontSize: 12,
                lineHeight: 1.45,
                color: "var(--crit)",
                background: "var(--crit-soft)",
                border: "1px solid var(--crit-edge)",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={phase === "submitting"}
            className="dq-primary dq-focus"
            style={{
              marginTop: 2,
              padding: "10px 14px",
              borderRadius: 9,
              border: "none",
              background: "var(--dq-accent)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: inter,
              cursor: phase === "submitting" ? "default" : "pointer",
              opacity: phase === "submitting" ? 0.72 : 1,
            }}
          >
            {phase === "submitting" ? SIGNIN_COPY.submitting : SIGNIN_COPY.submit}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  disabled,
}: {
  id: string
  label: string
  type: "email" | "password"
  value: string
  onChange: (next: string) => void
  autoComplete: string
  disabled: boolean
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label htmlFor={id} style={{ fontSize: 11.5, fontWeight: 500, color: "var(--t2)" }}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        required
        autoComplete={autoComplete}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="dq-focus"
        style={{
          padding: "9px 11px",
          borderRadius: 8,
          border: "1px solid var(--inp-border)",
          background: "var(--inp-bg)",
          color: "var(--t1)",
          fontSize: 13,
          fontFamily: inter,
        }}
      />
    </div>
  )
}
