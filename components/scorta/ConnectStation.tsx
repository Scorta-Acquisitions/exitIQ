"use client"

import { useRouter } from "next/navigation"
import React from "react"

import type { PERSONA as PersonaShape } from "@/lib/persona"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

// ── Timing reference (same family as AriaHero T = {…}) ──────────────────
const T = {
  syncStepMs: 400, // delay between each cycling status line
  syncTailMs: 360, // pause after "Sync complete." before result card lands
  resultRevealMs: 360,
  ingestionCtaRevealMs: 320,
  stripeRedirectMs: 1500,
  banner: { fadeMs: 320 },
}

const QB_SYNC_STEPS = [
  "Authenticating with QuickBooks...",
  "Fetching chart of accounts...",
  "Pulling 36 months of transaction history...",
  "Analyzing 1,247 transactions...",
  "Sync complete.",
] as const

const PLAID_SYNC_STEPS = [
  "Authenticating with Plaid...",
  "Refreshing 36 months of deposits...",
  "Reconciling bank receipts against ledger...",
  "Flagging non-recurring inflows...",
  "Sync complete.",
] as const

type Persona = typeof PersonaShape
type SyncPhase = "idle" | "syncing" | "synced"
type StripePhase = "idle" | "redirecting" | "awaiting"

export function ConnectStation({ persona }: { persona: Persona }) {
  const router = useRouter()

  // QuickBooks sync — primary demo interaction
  const [qbPhase, setQbPhase] = React.useState<SyncPhase>("idle")
  const [qbStepIdx, setQbStepIdx] = React.useState(0)

  // Plaid sync — secondary
  const [plaidPhase, setPlaidPhase] = React.useState<SyncPhase>("idle")
  const [plaidStepIdx, setPlaidStepIdx] = React.useState(0)

  // Stripe OAuth
  const [stripePhase, setStripePhase] = React.useState<StripePhase>("idle")

  // Drive tooltip flash
  const [driveTipShown, setDriveTipShown] = React.useState(false)
  const driveTipTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // "Run Ingestion Agent" CTA state
  const [ingestionRouting, setIngestionRouting] = React.useState(false)

  const ingestionUnlocked = qbPhase === "synced"

  // ── Sync drivers ────────────────────────────────────────────────────
  function startSync(
    setter: React.Dispatch<React.SetStateAction<SyncPhase>>,
    stepSetter: React.Dispatch<React.SetStateAction<number>>,
    steps: ReadonlyArray<string>,
    onDone?: () => void,
  ) {
    setter("syncing")
    stepSetter(0)
    const timers: Array<ReturnType<typeof setTimeout>> = []
    for (let i = 1; i < steps.length; i++) {
      timers.push(setTimeout(() => stepSetter(i), T.syncStepMs * i))
    }
    timers.push(
      setTimeout(
        () => {
          setter("synced")
          onDone?.()
        },
        T.syncStepMs * steps.length + T.syncTailMs,
      ),
    )
    return () => timers.forEach(clearTimeout)
  }

  function onQbSync() {
    if (qbPhase !== "idle") return
    startSync(setQbPhase, setQbStepIdx, QB_SYNC_STEPS)
  }

  function onPlaidSync() {
    if (plaidPhase !== "idle") return
    startSync(setPlaidPhase, setPlaidStepIdx, PLAID_SYNC_STEPS)
  }

  function onStripeConnect() {
    if (stripePhase !== "idle") return
    setStripePhase("redirecting")
    setTimeout(() => setStripePhase("awaiting"), T.stripeRedirectMs)
  }

  function onDriveClick() {
    setDriveTipShown(true)
    if (driveTipTimerRef.current) clearTimeout(driveTipTimerRef.current)
    driveTipTimerRef.current = setTimeout(() => setDriveTipShown(false), 2200)
  }

  function onRunIngestion() {
    if (ingestionRouting || !ingestionUnlocked) return
    setIngestionRouting(true)
    setTimeout(() => router.push("/ingestion"), 700)
  }

  // Counts: QB connected on arrival + Plaid connected + Stripe (awaiting counts as
  // "pending authorization" — still not a live source). Drive is pending.
  const connectedCount = 2 // QuickBooks + Plaid

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <ScopedStyles />

      <StationHeader />
      <AriaIntroBanner persona={persona} />

      <StatusStrip connectedCount={connectedCount} stripePhase={stripePhase} />

      {/* Tiles ──────────────────────────────────────────────────────── */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
        }}
      >
        {/* QuickBooks — connected, primary sync interaction */}
        <ConnectorTile
          accent="#2CA01C"
          logo={<QuickBooksLogo />}
          name="QuickBooks Online"
          sublabel="Accounting · Chart of accounts · Payroll"
          status={qbPhase === "synced" ? "synced" : "connected"}
          detail={
            qbPhase === "syncing" ? (
              <SyncStream step={QB_SYNC_STEPS[qbStepIdx] ?? ""} />
            ) : (
              <DetailLine>Last synced: today · 1,247 transactions</DetailLine>
            )
          }
          dataPoints={["3-year P&L", "Payroll", "COGS"]}
          action={
            <SyncButton
              phase={qbPhase}
              label="Sync now"
              labelDone="Synced ✓"
              onClick={onQbSync}
              primary
            />
          }
        />

        {/* Plaid — connected, secondary sync */}
        <ConnectorTile
          accent="#0A2540"
          logo={<PlaidLogo />}
          name="Plaid (Bank Feed)"
          sublabel="Deposits · Cash flow · NSF events"
          status={plaidPhase === "synced" ? "synced" : "connected"}
          detail={
            plaidPhase === "syncing" ? (
              <SyncStream step={PLAID_SYNC_STEPS[plaidStepIdx] ?? ""} />
            ) : (
              <DetailLine>Last synced: today · 36 months of deposits</DetailLine>
            )
          }
          dataPoints={["Cash flow", "Deposits", "NSFs"]}
          action={
            <SyncButton
              phase={plaidPhase}
              label="Sync now"
              labelDone="Synced ✓"
              onClick={onPlaidSync}
            />
          }
        />

        {/* Stripe — not connected, OAuth flow */}
        <ConnectorTile
          accent="#635BFF"
          logo={<StripeLogo />}
          name="Stripe"
          sublabel="Online ordering · Card revenue"
          status={stripePhase === "awaiting" ? "awaiting" : "pending"}
          detail={
            stripePhase === "awaiting" ? (
              <DetailLine tone="peach">
                Awaiting authorization — complete in Stripe dashboard
              </DetailLine>
            ) : (
              <DetailLine>Online ordering revenue · pending authorization</DetailLine>
            )
          }
          dataPoints={["Order volume", "Card receipts"]}
          action={
            <ConnectButton
              phase={stripePhase === "awaiting" ? "done" : "idle"}
              label="Connect"
              labelDone="Pending"
              onClick={onStripeConnect}
            />
          }
        />

        {/* Drive — not connected, coming-soon tooltip */}
        <ConnectorTile
          accent="#4285F4"
          logo={<DriveLogo />}
          name="Google Drive"
          sublabel="Tax returns · Lease · Vendor contracts"
          status="pending"
          detail={
            <DetailLine>Tax returns, lease docs · pending authorization</DetailLine>
          }
          dataPoints={["Tax returns", "Lease", "Permits"]}
          action={
            <ConnectButton
              phase="idle"
              label="Connect"
              labelDone="Pending"
              onClick={onDriveClick}
              comingSoonTipShown={driveTipShown}
            />
          }
        />
      </section>

      {/* Sync result card (slides in after QB completes) ────────────── */}
      <SyncResultCard visible={qbPhase === "synced"} persona={persona} />

      {/* Stripe OAuth modal ───────────────────────────────────────── */}
      {stripePhase === "redirecting" && <StripeRedirectModal />}

      {/* Run Ingestion Agent CTA banner ─────────────────────────── */}
      <IngestionBanner
        visible={ingestionUnlocked}
        connectedCount={connectedCount}
        onClick={onRunIngestion}
        routing={ingestionRouting}
      />
    </div>
  )
}

// ── Station header ────────────────────────────────────────────────────
function StationHeader() {
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: "var(--t3)",
            fontWeight: 500,
            letterSpacing: ".7px",
            textTransform: "uppercase",
          }}
        >
          Station 03 · /connect
        </div>
        <div style={{ height: 1, width: 22, background: "var(--div)" }} />
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "var(--t2)",
            fontFamily: inter,
          }}
        >
          Ingestion Agent
        </div>
      </div>
      <h1
        style={{
          fontFamily: garamond,
          fontWeight: 400,
          fontSize: 38,
          lineHeight: 1.08,
          letterSpacing: "-.6px",
          color: "var(--t1)",
          marginTop: 4,
        }}
      >
        Platform Connectors
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--t2)",
          lineHeight: 1.6,
          maxWidth: 680,
          fontFamily: inter,
        }}
      >
        Authorize the sources the Ingestion Agent uses to reconstruct 36 months of books.
        No CSV exports, no manual uploads — Scorta pulls directly from the software you already run.
      </p>
    </header>
  )
}

// ── ARIA intro banner ─────────────────────────────────────────────────
function AriaIntroBanner({ persona }: { persona: Persona }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 13,
        padding: "14px 16px",
        borderRadius: 14,
        background: "rgba(255,255,255,.7)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        boxShadow: "0 1px 0 rgba(255,255,255,.92) inset",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          flexShrink: 0,
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
          boxShadow: "0 0 8px rgba(44,140,112,.45)",
          marginTop: 1,
          animation: "ariaPulseHero 3.2s ease-in-out infinite",
        }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "var(--t2)",
            fontWeight: 500,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          ARIA · Case Manager
        </div>
        <div style={{ fontSize: 13.5, color: "var(--t1)", lineHeight: 1.55, fontFamily: inter }}>
          Two of {persona.identity.businessName.split(" ")[0]}'s four sources are already authorized.
          Run the QuickBooks sync to hand the books off to the Ingestion Agent — I'll surface the
          add-back schedule and concentration flags in the next station.
        </div>
      </div>
    </div>
  )
}

// ── Status strip ──────────────────────────────────────────────────────
function StatusStrip({
  connectedCount,
  stripePhase,
}: {
  connectedCount: number
  stripePhase: StripePhase
}) {
  return (
    <section
      style={{
        padding: "13px 18px",
        borderRadius: 14,
        background: "rgba(255,255,255,.6)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.06))",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          fontFamily: inter,
        }}
      >
        <span
          style={{
            fontFamily: garamond,
            fontSize: 22,
            fontWeight: 400,
            color: "var(--t1)",
            letterSpacing: "-.3px",
            lineHeight: 1,
          }}
        >
          {connectedCount}
        </span>
        <span style={{ fontSize: 12.5, color: "var(--t3)" }}>of 4 sources connected</span>
      </div>
      <div style={{ height: 16, width: 1, background: "var(--div)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <SourcePill label="QuickBooks" tone="live" />
        <SourcePill label="Plaid" tone="live" />
        <SourcePill label="Stripe" tone={stripePhase === "awaiting" ? "awaiting" : "pending"} />
        <SourcePill label="Drive" tone="pending" />
      </div>
    </section>
  )
}

function SourcePill({
  label,
  tone,
}: {
  label: string
  tone: "live" | "pending" | "awaiting"
}) {
  const palette =
    tone === "live"
      ? {
          color: "var(--mint, #2c8c70)",
          bg: "var(--mint-soft, rgba(44,140,112,.10))",
          edge: "var(--mint-edge, rgba(44,140,112,.28))",
          dot: true,
        }
      : tone === "awaiting"
      ? {
          color: "var(--peach, #b86a3e)",
          bg: "var(--peach-soft, rgba(184,106,62,.10))",
          edge: "var(--peach-edge, rgba(184,106,62,.28))",
          dot: false,
        }
      : {
          color: "var(--t3)",
          bg: "rgba(12,10,9,.04)",
          edge: "var(--glass-edge, rgba(0,0,0,.08))",
          dot: false,
        }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "4px 11px",
        borderRadius: 9999,
        fontSize: 11.5,
        fontWeight: 600,
        fontFamily: inter,
        letterSpacing: ".1px",
        color: palette.color,
        background: palette.bg,
        border: `1px solid ${palette.edge}`,
      }}
    >
      {palette.dot && (
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: palette.color,
            boxShadow: `0 0 6px ${palette.color}`,
            animation: "liveBlinkHero 1.8s ease-in-out infinite",
          }}
        />
      )}
      {label}
    </span>
  )
}

// ── Connector tile ────────────────────────────────────────────────────
function ConnectorTile({
  accent,
  logo,
  name,
  sublabel,
  status,
  detail,
  dataPoints,
  action,
}: {
  accent: string
  logo: React.ReactNode
  name: string
  sublabel: string
  status: "connected" | "synced" | "pending" | "awaiting"
  detail: React.ReactNode
  dataPoints: string[]
  action: React.ReactNode
}) {
  return (
    <article
      className="scorta-connector"
      style={{
        position: "relative",
        padding: "20px 22px 18px",
        background: "rgba(255,255,255,.78)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderRadius: 18,
        boxShadow: "0 1px 0 rgba(255,255,255,.92) inset, 0 -1px 0 rgba(0,0,0,.04) inset, 0 8px 24px rgba(12,10,9,.04)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "transform 180ms ease-out, border-color 180ms ease-out, box-shadow 180ms ease-out",
        overflow: "hidden",
      }}
    >
      {/* accent rail */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: accent,
          opacity: 0.85,
        }}
      />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 11,
            background: `${accent}14`,
            border: `1px solid ${accent}28`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: accent,
          }}
        >
          {logo}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--t1)",
              fontFamily: inter,
              lineHeight: 1.2,
              letterSpacing: "-.1px",
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--t3)",
              marginTop: 3,
              fontFamily: inter,
            }}
          >
            {sublabel}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Detail */}
      <div style={{ minHeight: 22 }}>{detail}</div>

      {/* Data-points chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {dataPoints.map((d) => (
          <span
            key={d}
            style={{
              padding: "2px 9px",
              borderRadius: 9999,
              fontSize: 10.5,
              fontWeight: 500,
              color: "var(--t2)",
              background: "rgba(12,10,9,.04)",
              border: "1px solid var(--glass-edge, rgba(0,0,0,.06))",
              fontFamily: inter,
              letterSpacing: ".1px",
            }}
          >
            {d}
          </span>
        ))}
      </div>

      {/* Action */}
      <div style={{ marginTop: 2, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        {action}
      </div>
    </article>
  )
}

function StatusBadge({ status }: { status: "connected" | "synced" | "pending" | "awaiting" }) {
  if (status === "connected" || status === "synced") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 9px",
          borderRadius: 9999,
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: ".5px",
          textTransform: "uppercase",
          color: "var(--mint, #2c8c70)",
          background: "var(--mint-soft, rgba(44,140,112,.10))",
          border: "1px solid var(--mint-edge, rgba(44,140,112,.28))",
          fontFamily: inter,
          flexShrink: 0,
        }}
      >
        <svg width={10} height={10} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 5.2L4.2 7.4 8 3.2" />
        </svg>
        {status === "synced" ? "Synced" : "Connected"}
      </span>
    )
  }
  if (status === "awaiting") {
    return (
      <span
        style={{
          padding: "3px 9px",
          borderRadius: 9999,
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: ".5px",
          textTransform: "uppercase",
          color: "var(--peach, #b86a3e)",
          background: "var(--peach-soft, rgba(184,106,62,.10))",
          border: "1px solid var(--peach-edge, rgba(184,106,62,.28))",
          fontFamily: inter,
          flexShrink: 0,
        }}
      >
        Awaiting
      </span>
    )
  }
  return (
    <span
      style={{
        padding: "3px 9px",
        borderRadius: 9999,
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: ".5px",
        textTransform: "uppercase",
        color: "var(--t3)",
        background: "rgba(12,10,9,.04)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.08))",
        fontFamily: inter,
        flexShrink: 0,
      }}
    >
      Pending
    </span>
  )
}

// ── Detail line + sync stream ─────────────────────────────────────────
function DetailLine({
  children,
  tone,
}: {
  children: React.ReactNode
  tone?: "peach"
}) {
  return (
    <div
      style={{
        fontSize: 12.5,
        color: tone === "peach" ? "var(--peach, #b86a3e)" : "var(--t2)",
        lineHeight: 1.5,
        fontFamily: inter,
      }}
    >
      {children}
    </div>
  )
}

function SyncStream({ step }: { step: string }) {
  return (
    <div
      key={step}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12.5,
        color: "var(--t1)",
        fontFamily: mono,
        letterSpacing: ".1px",
        lineHeight: 1.5,
        animation: "syncLineIn .28s ease-out",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "var(--mint, #2c8c70)",
          animation: "liveBlinkHero 1.1s ease-in-out infinite",
          flexShrink: 0,
        }}
      />
      {step}
    </div>
  )
}

// ── Buttons ───────────────────────────────────────────────────────────
function SyncButton({
  phase,
  label,
  labelDone,
  onClick,
  primary,
}: {
  phase: SyncPhase
  label: string
  labelDone: string
  onClick: () => void
  primary?: boolean
}) {
  const syncing = phase === "syncing"
  const synced = phase === "synced"
  return (
    <button
      onClick={onClick}
      disabled={phase !== "idle"}
      className="scorta-syncbtn"
      style={{
        height: 38,
        padding: "0 16px",
        borderRadius: 9999,
        fontSize: 12.5,
        fontWeight: 600,
        fontFamily: inter,
        letterSpacing: "-.05px",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: phase === "idle" ? "pointer" : "default",
        background: synced
          ? "rgba(44,140,112,.14)"
          : primary
          ? "var(--btn-bg)"
          : "rgba(255,255,255,.85)",
        color: synced ? "var(--mint, #2c8c70)" : primary ? "var(--btn-fg)" : "var(--t1)",
        border: synced
          ? "1px solid var(--mint-edge, rgba(44,140,112,.32))"
          : primary
          ? "none"
          : "1px solid var(--glass-edge, rgba(0,0,0,.10))",
        boxShadow: primary && !synced ? "0 4px 14px rgba(12,10,9,.16)" : "none",
        transition: "transform 180ms ease-out, box-shadow 180ms ease-out, background 180ms ease-out, color 180ms ease-out, border-color 180ms ease-out",
      }}
    >
      {syncing && <Spinner light={primary} />}
      {synced && (
        <svg width={11} height={11} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6.4L4.6 9 10 3.4" />
        </svg>
      )}
      <span>{syncing ? "Syncing…" : synced ? labelDone : label}</span>
    </button>
  )
}

function ConnectButton({
  phase,
  label,
  labelDone,
  onClick,
  comingSoonTipShown,
}: {
  phase: "idle" | "done"
  label: string
  labelDone: string
  onClick: () => void
  comingSoonTipShown?: boolean
}) {
  const done = phase === "done"
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={onClick}
        disabled={done}
        className="scorta-syncbtn"
        style={{
          height: 38,
          padding: "0 16px",
          borderRadius: 9999,
          fontSize: 12.5,
          fontWeight: 600,
          fontFamily: inter,
          letterSpacing: "-.05px",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          cursor: done ? "default" : "pointer",
          background: done ? "rgba(184,106,62,.10)" : "rgba(255,255,255,.85)",
          color: done ? "var(--peach, #b86a3e)" : "var(--t1)",
          border: `1px solid ${done ? "var(--peach-edge, rgba(184,106,62,.28))" : "var(--glass-edge, rgba(0,0,0,.10))"}`,
          transition: "transform 180ms ease-out, background 180ms ease-out, color 180ms ease-out, border-color 180ms ease-out",
        }}
      >
        <span>{done ? labelDone : label}</span>
        {!done && <span style={{ transform: "translateY(-1px)", fontSize: 12 }}>→</span>}
      </button>

      {comingSoonTipShown && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            right: 0,
            bottom: "calc(100% + 8px)",
            padding: "8px 11px",
            borderRadius: 10,
            background: "rgba(12,10,9,.92)",
            color: "rgba(245,245,245,.95)",
            fontSize: 11.5,
            lineHeight: 1.4,
            fontFamily: inter,
            whiteSpace: "nowrap",
            boxShadow: "0 10px 30px rgba(0,0,0,.18)",
            animation: "syncLineIn .22s ease-out",
            zIndex: 30,
          }}
        >
          Document ingestion via Drive coming soon.
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: "100%",
              right: 18,
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid rgba(12,10,9,.92)",
            }}
          />
        </span>
      )}
    </div>
  )
}

function Spinner({ light }: { light?: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        border: `2px solid ${light ? "rgba(245,245,245,.32)" : "rgba(12,10,9,.18)"}`,
        borderTopColor: light ? "var(--btn-fg)" : "var(--t1)",
        animation: "spin .8s linear infinite",
      }}
    />
  )
}

// ── Sync result card ─────────────────────────────────────────────────
function SyncResultCard({ visible, persona }: { visible: boolean; persona: Persona }) {
  return (
    <section
      aria-hidden={!visible}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity ${T.resultRevealMs}ms ease-out, transform ${T.resultRevealMs}ms ease-out`,
        pointerEvents: visible ? "auto" : "none",
        padding: "22px 24px 20px",
        background: "rgba(255,255,255,.82)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderRadius: 18,
        boxShadow: "0 1px 0 rgba(255,255,255,.92) inset, 0 -1px 0 rgba(0,0,0,.04) inset, 0 12px 36px rgba(12,10,9,.06)",
        display: visible ? "block" : "none",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          aria-hidden
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "var(--mint, #2c8c70)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 8px rgba(44,140,112,.45)",
            flexShrink: 0,
          }}
        >
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6.4L4.6 9 10 3.4" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 10.5,
              color: "var(--t2)",
              fontWeight: 500,
              letterSpacing: ".7px",
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Ingestion Agent · sync complete
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--t1)", fontFamily: inter }}>
            QuickBooks ledger handed off — ready for classification.
          </div>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
        }}
      >
        <ResultStat label="Transactions" value="1,247" sub="across 36 months" />
        <ResultStat label="Revenue confirmed" value={persona.financials.revenueDisplay} sub="3-year ledger total" />
        <ResultStat label="Data sources" value="3" sub="P&L · Payroll · COGS" />
        <ResultStat label="Status" value="Ready" sub="Handing off to Ingestion" tone="mint" />
      </div>
    </section>
  )
}

function ResultStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub: string
  tone?: "mint"
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        background: "rgba(255,255,255,.7)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.06))",
        borderRadius: 12,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "var(--t3)",
          fontFamily: inter,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: garamond,
          fontSize: 22,
          fontWeight: 400,
          color: tone === "mint" ? "var(--mint, #2c8c70)" : "var(--t1)",
          lineHeight: 1.1,
          letterSpacing: "-.3px",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4, fontFamily: inter }}>{sub}</div>
    </div>
  )
}

// ── Stripe redirect modal ────────────────────────────────────────────
function StripeRedirectModal() {
  return (
    <div
      role="dialog"
      aria-modal
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(12,10,9,.35)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "syncLineIn .22s ease-out",
      }}
    >
      <div
        style={{
          minWidth: 320,
          maxWidth: 400,
          padding: "26px 26px 24px",
          background: "var(--page-bg)",
          border: "1px solid var(--glass-edge, rgba(0,0,0,.08))",
          borderRadius: 18,
          boxShadow: "0 24px 60px rgba(12,10,9,.22)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "#635BFF14",
            border: "1px solid #635BFF40",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#635BFF",
            marginBottom: 14,
          }}
        >
          <StripeLogo />
        </div>
        <div
          style={{
            fontFamily: garamond,
            fontSize: 20,
            color: "var(--t1)",
            letterSpacing: "-.3px",
            marginBottom: 6,
          }}
        >
          Redirecting to Stripe…
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: "var(--t3)",
            lineHeight: 1.55,
            fontFamily: inter,
            marginBottom: 16,
          }}
        >
          Authorize the Ingestion Agent to read your online ordering revenue.
        </div>
        <div
          aria-hidden
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: "2px solid rgba(99,91,255,.18)",
            borderTopColor: "#635BFF",
            animation: "spin .8s linear infinite",
          }}
        />
      </div>
    </div>
  )
}

// ── Run Ingestion Agent banner ────────────────────────────────────────
function IngestionBanner({
  visible,
  connectedCount,
  onClick,
  routing,
}: {
  visible: boolean
  connectedCount: number
  onClick: () => void
  routing: boolean
}) {
  return (
    <section
      aria-hidden={!visible}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: `opacity ${T.ingestionCtaRevealMs}ms ease-out, transform ${T.ingestionCtaRevealMs}ms ease-out`,
        pointerEvents: visible ? "auto" : "none",
        display: visible ? "flex" : "none",
        alignItems: "center",
        gap: 18,
        padding: "16px 22px",
        borderRadius: 16,
        background:
          "linear-gradient(180deg, rgba(44,140,112,.08) 0%, rgba(44,140,112,.04) 100%)",
        border: "1px solid var(--mint-edge, rgba(44,140,112,.28))",
        boxShadow: "0 1px 0 rgba(255,255,255,.6) inset, 0 8px 24px rgba(44,140,112,.10)",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
          boxShadow: "0 0 10px rgba(44,140,112,.55)",
          animation: "ariaPulseHero 3.2s ease-in-out infinite",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0, fontFamily: inter }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "var(--mint, #2c8c70)",
            fontWeight: 600,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            marginBottom: 3,
          }}
        >
          ARIA · ready to advance
        </div>
        <div style={{ fontSize: 13.5, color: "var(--t1)", lineHeight: 1.5 }}>
          {connectedCount} of 4 sources connected — Ingestion Agent is ready to classify 36 months of activity.
        </div>
      </div>
      <button
        onClick={onClick}
        disabled={routing}
        className="aria-cta"
        style={{
          height: 44,
          padding: "0 20px",
          borderRadius: 9999,
          background: "var(--btn-bg)",
          color: "var(--btn-fg)",
          border: "none",
          fontSize: 13.5,
          fontWeight: 600,
          fontFamily: inter,
          letterSpacing: "-.1px",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          cursor: routing ? "default" : "pointer",
          boxShadow: "0 6px 22px rgba(12,10,9,.18)",
          transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
          flexShrink: 0,
        }}
      >
        {routing && <Spinner light />}
        <span>{routing ? "Opening Data Processing…" : "Run Ingestion Agent"}</span>
        {!routing && <span style={{ transform: "translateY(-1px)" }}>→</span>}
      </button>
    </section>
  )
}

// ── Brand-mark logos (stylized monograms) ────────────────────────────
function QuickBooksLogo() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity={0.18} />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontFamily={inter}
        fontWeight={700}
        fontSize="10"
        fill="currentColor"
        letterSpacing="-.4"
      >
        qb
      </text>
    </svg>
  )
}

function PlaidLogo() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity={0.16} />
      <circle cx="8" cy="8" r="1.6" fill="currentColor" />
      <circle cx="16" cy="8" r="1.6" fill="currentColor" />
      <circle cx="12" cy="13" r="1.6" fill="currentColor" />
      <circle cx="8" cy="16" r="1.6" fill="currentColor" />
      <circle cx="16" cy="16" r="1.6" fill="currentColor" />
    </svg>
  )
}

function StripeLogo() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor" opacity={0.16} />
      <path
        d="M11.3 9.4c0-.55.45-.8 1.2-.8 1.07 0 2.43.32 3.5.9V6.6c-1.17-.46-2.32-.65-3.5-.65-2.86 0-4.77 1.49-4.77 3.98 0 3.88 5.34 3.26 5.34 4.94 0 .65-.57.86-1.36.86-1.17 0-2.66-.48-3.84-1.13v2.94c1.31.56 2.63.81 3.84.81 2.93 0 4.95-1.45 4.95-3.96 0-4.18-5.36-3.44-5.36-5z"
        fill="currentColor"
      />
    </svg>
  )
}

function DriveLogo() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8.5 4h7l5.5 9.5-3.5 6h-11L3 13.5 8.5 4z" fill="currentColor" opacity={0.18} />
      <path d="M8.5 4L3 13.5h5.5L14 4H8.5z" fill="#FFC107" opacity={0.75} />
      <path d="M15.5 4L21 13.5h-5.5L10 4h5.5z" fill="#4285F4" opacity={0.75} />
      <path d="M3 13.5L6.5 19.5h11L21 13.5H3z" fill="#34A853" opacity={0.75} />
    </svg>
  )
}

// ── Scoped styles ─────────────────────────────────────────────────────
function ScopedStyles() {
  return (
    <style>{`
      @keyframes ariaPulseHero {
        0%, 100% { transform: scale(1);    opacity: 1;  }
        50%      { transform: scale(1.10); opacity: .9; }
      }
      @keyframes liveBlinkHero {
        0%, 100% { opacity: 1;  }
        50%      { opacity: .35; }
      }
      @keyframes syncLineIn {
        from { opacity: 0; transform: translateY(3px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .scorta-connector:hover {
        transform: translateY(-1px);
        border-color: rgba(0,0,0,.10);
        box-shadow: 0 1px 0 rgba(255,255,255,.92) inset, 0 -1px 0 rgba(0,0,0,.04) inset, 0 14px 32px rgba(12,10,9,.07);
      }
      .scorta-syncbtn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(12,10,9,.14);
      }
      .aria-cta:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 28px rgba(12,10,9,.22);
      }
    `}</style>
  )
}
