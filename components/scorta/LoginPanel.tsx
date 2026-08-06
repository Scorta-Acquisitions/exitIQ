"use client"

import { useRouter } from "next/navigation"
import React from "react"

import { hasExitIqAccess } from "@/lib/productAccess"
import { createClient } from "@/lib/supabase/client"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

export function LoginPanel() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setErrorMsg(null)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setErrorMsg("Email or password didn't match. Try again.")
      setSubmitting(false)
      return
    }
    // Valid Supabase credentials without the seller product grant (a DealIQ buyer
    // account) are not a seller sign-in. End the session — leaving it live would
    // bounce every workspace request off the guard — and report the credentials
    // as unrecognised, which on this product they are.
    if (!hasExitIqAccess(data.user)) {
      await supabase.auth.signOut()
      setErrorMsg("Email or password didn't match. Try again.")
      setSubmitting(false)
      return
    }
    router.replace("/dashboard")
    router.refresh()
  }

  return (
    <div
      data-theme="cream"
      style={{
        background: "var(--page-bg)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: inter,
      }}
    >
      {/* Ambient blobs */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "8%",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,229,211,.42) 0%, transparent 65%)",
            filter: "blur(28px)",
            animation: "orbDrift1 20s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "8%",
            right: "10%",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(184,140,210,.28) 0%, transparent 65%)",
            filter: "blur(28px)",
            animation: "orbDrift2 24s ease-in-out infinite",
          }}
        />
      </div>

      <div
        className="glass-r-strong"
        style={{
          width: "min(440px, 100%)",
          padding: "36px 36px 30px",
          position: "relative",
          zIndex: 1,
          animation: "slideUpLg .7s cubic-bezier(.34,1.1,.64,1)",
        }}
      >
        {/* Eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--mint)",
              boxShadow: "0 0 8px var(--mint)",
              animation: "liveBlink 2s ease-in-out infinite",
            }}
          />
          <div
            style={{
              fontFamily: mono,
              fontSize: 11,
              color: "var(--mint)",
              fontWeight: 500,
              letterSpacing: ".8px",
              textTransform: "uppercase",
            }}
          >
            Scorta · Boardroom Access
          </div>
        </div>

        <h1
          style={{
            fontFamily: garamond,
            fontWeight: 400,
            fontSize: 34,
            lineHeight: 1.1,
            letterSpacing: "-.5px",
            color: "var(--t1)",
            marginBottom: 8,
          }}
        >
          Authorize & continue
        </h1>
        <p
          style={{
            fontSize: 13.5,
            color: "var(--t2)",
            lineHeight: 1.6,
            marginBottom: 24,
            maxWidth: 360,
          }}
        >
          Sign in to save your Exit IQ report and unlock the Scorta Boardroom — your AI-guided workspace where the agent
          fleet preps your business for an SBA-funded exit.
        </p>

        <form onSubmit={onSubmit} noValidate>
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            placeholder="you@yourcompany.com"
            disabled={submitting}
            autoFocus
          />
          <div style={{ height: 14 }} />
          <Field
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            disabled={submitting}
          />

          {errorMsg && (
            <div
              style={{
                marginTop: 14,
                padding: "9px 12px",
                fontSize: 12,
                color: "var(--crit, #c44e2c)",
                background: "rgba(196,78,44,.08)",
                border: "1px solid rgba(196,78,44,.18)",
                borderRadius: 10,
                fontFamily: inter,
              }}
            >
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !email || !password}
            style={{
              marginTop: 22,
              width: "100%",
              height: 48,
              background: "var(--btn-bg)",
              color: "var(--btn-fg)",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "-.1px",
              borderRadius: 9999,
              border: "none",
              cursor: submitting || !email || !password ? "not-allowed" : "pointer",
              opacity: submitting || !email || !password ? 0.6 : 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontFamily: inter,
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 6px 22px rgba(12,10,9,.18)",
              transition: "transform .2s ease, box-shadow .2s ease, opacity .2s ease",
            }}
          >
            {submitting ? (
              <>
                <Spinner />
                <span>Authorizing…</span>
              </>
            ) : (
              <>
                <span>Sign in & continue to Boardroom</span>
                <span>→</span>
              </>
            )}
            {!submitting && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(105deg,transparent 35%,rgba(255,255,255,.18) 50%,transparent 65%)",
                  animation: "shimmer 3.2s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: "1px solid var(--div)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 11,
            color: "var(--t3)",
            fontFamily: inter,
          }}
        >
          <div>Free during private beta</div>
          <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: ".5px" }}>scorta.boardroom · v1.0</div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  autoFocus,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  disabled?: boolean
  autoFocus?: boolean
}) {
  const [focused, setFocused] = React.useState(false)
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "1.1px",
          textTransform: "uppercase",
          color: "var(--t2)",
          marginBottom: 7,
          fontFamily: inter,
        }}
      >
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          height: 44,
          padding: "0 14px",
          background: "var(--inp-bg)",
          border: `1px solid ${focused ? "var(--mint-edge)" : "var(--inp-border)"}`,
          borderRadius: 12,
          fontSize: 14,
          color: "var(--t1)",
          fontFamily: inter,
          outline: "none",
          transition: "border-color .2s ease, box-shadow .2s ease",
          boxShadow: focused ? "0 0 0 4px rgba(44,140,112,.10)" : "none",
        }}
      />
    </label>
  )
}

function Spinner() {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 14,
        height: 14,
        borderRadius: "50%",
        border: "2px solid rgba(245,245,245,.35)",
        borderTopColor: "var(--btn-fg)",
        animation: "spin .8s linear infinite",
      }}
    />
  )
}
