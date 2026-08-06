"use client"

/**
 * DealIQ's own front door — a split portal: credentials on the left, a live
 * product vignette on the right (score dial sweep + the Ingestion Agent's log
 * replayed as a ticker). The vignette is decorative and engine-shaped: every
 * line comes from `data/copy.ts`, no real deal figures appear pre-auth.
 *
 * Written fresh against the same Supabase browser client `LoginPanel` uses —
 * borrowing its auth call, ambient-orb treatment and shimmer button, not its
 * layout or copy. A buyer must never see a seller-branded sign-in, and must
 * never land on `/dashboard`.
 *
 * `destination` arrives pre-validated by `safeDealIqPath` on the server page —
 * this component never reads `?next=` itself.
 */

import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"

import { ScoreDial } from "@/components/shared/ScoreDial"
import { hasDealIqAccess } from "@/lib/dealiq/access"
import { INGESTION_LOG, SIGNIN_COPY } from "@/lib/dealiq/data/copy"
import { DEALIQ_ROOT } from "@/lib/dealiq/navigation"
import type { LogLine } from "@/lib/dealiq/types"
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
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError(SIGNIN_COPY.invalidCredentials)
        setPhase("idle")
        return
      }
      // Valid Supabase credentials without the DealIQ product grant (a seller
      // account) are not a buyer sign-in. End the session — leaving it live
      // would bounce every workspace request off the guard — and report the
      // credentials as unrecognised, which on this product they are.
      if (!hasDealIqAccess(data.user)) {
        await supabase.auth.signOut()
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
        padding: "48px 24px",
        fontFamily: inter,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <AmbientOrbs />

      <div className="dq-auth-grid" style={{ position: "relative", zIndex: 1 }}>
        {/* ── Credentials column ─────────────────────────────────────────── */}
        <div style={{ width: "100%", maxWidth: 420, justifySelf: "center" }}>
          <div className="dq-rise" style={{ animationDelay: "0ms", marginBottom: 22 }}>
            <BackLink />
          </div>

          <div className="dq-rise" style={{ animationDelay: "0ms" }}>
            <Wordmark />
          </div>

          <h1
            className="dq-rise"
            style={{
              margin: "22px 0 8px",
              fontFamily: garamond,
              fontWeight: 400,
              fontSize: 33,
              lineHeight: 1.12,
              letterSpacing: "-.5px",
              color: "var(--t1)",
              animationDelay: "60ms",
            }}
          >
            {SIGNIN_COPY.headline}
          </h1>
          <p
            className="dq-rise"
            style={{
              margin: "0 0 26px",
              fontSize: 13.5,
              lineHeight: 1.6,
              color: "var(--t2)",
              animationDelay: "120ms",
            }}
          >
            {SIGNIN_COPY.positioning}
          </p>

          <form
            onSubmit={onSubmit}
            className="dq-rise"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              padding: "24px 24px 22px",
              borderRadius: 16,
              border: "1px solid var(--glass-border)",
              background: "var(--glass-bg-strong, var(--glass-bg))",
              boxShadow: "var(--glass-shadow-strong, var(--glass-shadow))",
              backdropFilter: "blur(18px) saturate(150%)",
              WebkitBackdropFilter: "blur(18px) saturate(150%)",
              animationDelay: "180ms",
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
                className="dq-tick"
                style={{
                  margin: 0,
                  fontSize: 12,
                  lineHeight: 1.45,
                  color: "var(--crit)",
                  background: "var(--crit-soft)",
                  border: "1px solid var(--crit-edge)",
                  borderRadius: 9,
                  padding: "9px 11px",
                }}
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={phase === "submitting"}
              className="dq-cta dq-focus"
              style={{
                marginTop: 4,
                height: 46,
                borderRadius: 12,
                border: "none",
                background: "var(--dq-accent)",
                color: "#fff",
                fontSize: 13.5,
                fontWeight: 600,
                letterSpacing: "-.01em",
                fontFamily: inter,
                cursor: phase === "submitting" ? "default" : "pointer",
                opacity: phase === "submitting" ? 0.78 : 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {phase === "submitting" ? (
                <>
                  <Spinner />
                  <span>{SIGNIN_COPY.submitting}</span>
                </>
              ) : (
                <>
                  <span>{SIGNIN_COPY.submit}</span>
                  <span aria-hidden>→</span>
                </>
              )}
              {phase === "idle" ? (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(105deg,transparent 35%,rgba(255,255,255,.16) 50%,transparent 65%)",
                    animation: "shimmer 3.4s ease-in-out infinite",
                    pointerEvents: "none",
                  }}
                />
              ) : null}
            </button>
          </form>

          <div
            className="dq-rise"
            style={{
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 11,
              color: "var(--t3)",
              animationDelay: "240ms",
            }}
          >
            <span>{SIGNIN_COPY.betaTag}</span>
            <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: ".5px" }}>{SIGNIN_COPY.versionTag}</span>
          </div>
        </div>

        {/* ── Product vignette — desktop only ────────────────────────────── */}
        <Vignette />
      </div>
    </div>
  )
}

// ── Vignette ─────────────────────────────────────────────────────────────────

function Vignette() {
  const v = SIGNIN_COPY.vignette
  return (
    <aside
      aria-hidden
      className="dq-auth-vignette dq-rise"
      style={{
        flexDirection: "column",
        gap: 18,
        padding: "26px 26px 24px",
        borderRadius: 18,
        border: "1px solid var(--glass-border)",
        background: "var(--glass-bg)",
        boxShadow: "var(--glass-shadow)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        animationDelay: "140ms",
        maxWidth: 470,
        width: "100%",
        justifySelf: "center",
      }}
    >
      {/* Eyebrow */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--dq-accent)",
            boxShadow: "0 0 7px var(--dq-accent)",
            animation: "liveBlink 2s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "var(--dq-accent)",
          }}
        >
          {v.eyebrow}
        </span>
      </div>

      {/* Dial + verdict */}
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <ScoreDial
          value={v.score}
          size={124}
          strokeWidth={9}
          accentColor="var(--dq-accent)"
          label={`${v.scoreCaption} ${v.score} of 100`}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span
            style={{
              fontFamily: mono,
              fontSize: 9.5,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--t3)",
            }}
          >
            {v.scoreCaption}
          </span>
          <span
            style={{
              alignSelf: "flex-start",
              fontFamily: mono,
              fontSize: 10.5,
              letterSpacing: ".04em",
              color: "var(--dq-accent)",
              background: "var(--dq-accent-soft)",
              border: "1px solid var(--dq-accent-edge)",
              borderRadius: 999,
              padding: "4px 10px",
            }}
          >
            {v.verdictLabel}
          </span>
        </div>
      </div>

      <LogTicker />

      <div style={{ height: 1, background: "var(--div)" }} />

      {/* Features */}
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {v.features.map((feature, index) => (
          <div
            key={feature.title}
            className="dq-rise"
            style={{ display: "flex", gap: 11, animationDelay: `${260 + index * 90}ms` }}
          >
            <span
              style={{
                flexShrink: 0,
                width: 24,
                height: 24,
                borderRadius: 7,
                background: "var(--dq-accent-soft)",
                border: "1px solid var(--dq-accent-edge)",
                color: "var(--dq-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 1,
              }}
            >
              <FeatureIcon index={index} />
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--t1)" }}>
                {feature.title}
              </span>
              <span style={{ display: "block", fontSize: 11.5, lineHeight: 1.5, color: "var(--t2)", marginTop: 2 }}>
                {feature.body}
              </span>
            </span>
          </div>
        ))}
      </div>
    </aside>
  )
}

/**
 * The Ingestion Agent's log, replayed as an ambient ticker — the same script the
 * Deal Inbox streams post-auth, so the door previews the product truthfully.
 * Figure-free by construction (standing decision 8).
 */
const TICKER_WINDOW = 5
const TICKER_STEP_MS = 1500

function LogTicker() {
  const [tick, setTick] = React.useState(0)

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(() => setTick((t) => t + 1), TICKER_STEP_MS)
    return () => window.clearInterval(id)
  }, [])

  const lines: Array<{ line: LogLine; key: number }> = []
  for (let i = 0; i < TICKER_WINDOW; i += 1) {
    const line = INGESTION_LOG[(tick + i) % INGESTION_LOG.length]
    if (line) lines.push({ line, key: tick + i })
  }

  return (
    <div
      style={{
        borderRadius: 11,
        border: "1px solid var(--b3)",
        background: "var(--s2)",
        padding: "11px 13px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        overflow: "hidden",
      }}
    >
      {lines.map(({ line, key }, index) => {
        const color = line.flag === "red" ? "var(--crit)" : line.flag === "amber" ? "var(--gold)" : undefined
        return (
          <div
            key={key}
            className={index === TICKER_WINDOW - 1 ? "dq-tick" : undefined}
            style={{
              display: "flex",
              gap: 9,
              fontFamily: mono,
              fontSize: 10,
              lineHeight: 1.45,
              color: color ?? (line.accent ? "var(--dq-accent)" : "var(--t3)"),
              opacity: 0.45 + (index / (TICKER_WINDOW - 1)) * 0.55,
            }}
          >
            <span style={{ flexShrink: 0, color: "var(--t4)" }}>{line.ts}</span>
            <span
              style={{
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {line.text}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Pieces ───────────────────────────────────────────────────────────────────

function FeatureIcon({ index }: { index: number }) {
  const common = {
    width: 12,
    height: 12,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  if (index === 0) {
    // Bolt — speed
    return (
      <svg {...common}>
        <path d="M8.8 1.8 3.4 9h3.4l-.9 5.2L11.4 7H7.9l.9-5.2Z" />
      </svg>
    )
  }
  if (index === 1) {
    // Ledger lines — the recast
    return (
      <svg {...common}>
        <path d="M2.5 4h11M2.5 8h7M2.5 12h9" />
        <path d="M12.2 7.2 13.8 8.8M13.8 7.2 12.2 8.8" />
      </svg>
    )
  }
  // Trend — returns
  return (
    <svg {...common}>
      <path d="M2 12.5 6.2 8l2.6 2.4 5-5.6" />
      <path d="M10.6 4.8h3.2V8" />
    </svg>
  )
}

function BackLink() {
  const [hovered, setHovered] = React.useState(false)
  return (
    <Link
      href="/"
      className="dq-focus"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: inter,
        fontSize: 12.5,
        fontWeight: 500,
        color: hovered ? "var(--t1)" : "var(--t3)",
        textDecoration: "none",
        borderRadius: 6,
        transition: "color .16s ease",
      }}
    >
      <span aria-hidden>←</span>
      <span>Back to Scorta</span>
    </Link>
  )
}

function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
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
          boxShadow: "0 4px 14px var(--dq-accent-edge)",
        }}
      >
        D
      </span>
      <span style={{ fontFamily: garamond, fontSize: 22, fontWeight: 500, letterSpacing: "-.3px", color: "var(--t1)" }}>
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
  )
}

function AmbientOrbs() {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "6%",
          width: 460,
          height: 460,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(74,123,168,.26) 0%, transparent 65%)",
          filter: "blur(30px)",
          animation: "orbDrift1 22s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "6%",
          right: "8%",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(107,93,176,.20) 0%, transparent 65%)",
          filter: "blur(30px)",
          animation: "orbDrift2 26s ease-in-out infinite",
        }}
      />
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
  const [focused, setFocused] = React.useState(false)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "var(--t2)",
        }}
      >
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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: 44,
          padding: "0 13px",
          borderRadius: 11,
          border: `1px solid ${focused ? "var(--dq-accent)" : "var(--inp-border)"}`,
          background: "var(--inp-bg)",
          color: "var(--t1)",
          fontSize: 13.5,
          fontFamily: inter,
          outline: "none",
          transition: "border-color .18s ease, box-shadow .18s ease",
          boxShadow: focused ? "0 0 0 4px var(--dq-accent-soft)" : "none",
        }}
      />
    </div>
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
        border: "2px solid rgba(255,255,255,.35)",
        borderTopColor: "#fff",
        animation: "spin .8s linear infinite",
      }}
    />
  )
}
