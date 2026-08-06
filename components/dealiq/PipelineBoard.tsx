"use client"

/**
 * The pipeline board — DealIQ's home surface.
 *
 * Board-first and dense on purpose. The seller workspace tells one deal's story
 * in glass cards; a searcher needs to see twelve at once and find the two worth
 * opening, so this is a four-column board with a derived funnel above it and no
 * per-section chrome. The motion layer — count-ups, bar fills, staggered card
 * entrances — is presentation only and respects `prefers-reduced-motion`.
 *
 * Every number is computed: the funnel counts, the shares behind the bars, the
 * hero stats and the card order all come from `lib/dealiq/` reading the deal
 * list and the buyer seed. Nothing on this screen was typed by hand.
 */

import Link from "next/link"
import React from "react"

import { VerdictChip } from "@/components/dealiq/DealContextBar"
import { useDealIQSession } from "@/components/dealiq/DealIQSessionContext"
import { NewDealSection } from "@/components/dealiq/NewDealSection"
import { usePipelineDeals } from "@/components/dealiq/usePipelineDeals"
import { BUYER } from "@/lib/dealiq/data/buyer"
import { PIPELINE_COPY } from "@/lib/dealiq/data/copy"
import { formatCompactCurrency, formatDayCount, formatScore, verdictAccentVar } from "@/lib/dealiq/format"
import { dealPath, PIPELINE_STAGES } from "@/lib/dealiq/navigation"
import { dealsInStage, funnel, orderedDeals } from "@/lib/dealiq/pipeline"
import type { PipelineDeal } from "@/lib/dealiq/types"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

// ── Motion helpers ───────────────────────────────────────────────────────────

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Animates toward `target` from wherever the previous animation left off, so a
 * derived value that changes mid-session (a screened deal landing) rolls from
 * its current reading instead of re-counting from zero.
 */
function useCountUp(target: number, ms = 850): number {
  const [value, setValue] = React.useState(0)
  const fromRef = React.useRef(0)

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fromRef.current = target
      setValue(target)
      return
    }
    const from = fromRef.current
    let raf = 0
    let start: number | undefined
    const step = (ts: number) => {
      if (start === undefined) start = ts
      const t = Math.min(1, (ts - start) / ms)
      const next = from + (target - from) * easeOutCubic(t)
      fromRef.current = next
      setValue(next)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])

  return value
}

/** True once, after mount — drives CSS width/opacity transitions from their zero state. */
function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  return mounted
}

// ── Board ────────────────────────────────────────────────────────────────────

export function PipelineBoard() {
  const { deals, screenedId, hydrated } = usePipelineDeals()
  const { capitalVerified } = useDealIQSession()
  const steps = React.useMemo(() => funnel(deals), [deals])
  const ordered = React.useMemo(() => orderedDeals(deals), [deals])
  const mounted = useMounted()

  const dealCount = useCountUp(deals.length)
  const committed = useCountUp(BUYER.committedCapital)
  const verified = BUYER.capitalVerified || (hydrated && capitalVerified)

  if (deals.length === 0) {
    return <EmptyPipeline />
  }

  return (
    <div style={{ fontFamily: inter, position: "relative" }}>
      <AmbientBackdrop />

      <div className="dq-screen" style={{ position: "relative", zIndex: 1, maxWidth: 1340 }}>
        {/* ── Hero — headline, live funnel, buyer stats ─────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 22,
            marginBottom: 26,
            flexWrap: "wrap",
          }}
        >
          <div className="dq-rise" style={{ animationDelay: "0ms", minWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span
                aria-hidden
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
                  fontSize: 9.5,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--t3)",
                }}
              >
                {PIPELINE_COPY.eyebrow}
              </span>
            </div>
            <div
              style={{
                fontFamily: garamond,
                fontSize: 30,
                fontWeight: 500,
                letterSpacing: "-.4px",
                color: "var(--t1)",
                marginTop: 4,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {Math.round(dealCount)} deals in flight
            </div>
          </div>

          {/* Funnel — counts derived from the deal list, never stored */}
          <div
            className="dq-rise"
            style={{
              display: "flex",
              gap: 18,
              flex: 1,
              minWidth: 320,
              alignItems: "flex-end",
              padding: "14px 18px",
              borderRadius: 14,
              border: "1px solid var(--glass-border)",
              background: "var(--glass-bg)",
              boxShadow: "var(--glass-shadow)",
              animationDelay: "70ms",
            }}
          >
            {steps.map((step) => (
              <div key={step.key} style={{ flex: 1, minWidth: 72 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 17,
                      color: "var(--t1)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {step.count}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--t2)" }}>{step.label}</span>
                </div>
                <div
                  style={{ height: 4, borderRadius: 2, background: "var(--s1)", marginTop: 7, overflow: "hidden" }}
                  aria-hidden
                >
                  <div
                    className="dq-bar-fill"
                    style={{
                      height: "100%",
                      width: mounted ? `${Math.round(step.share * 100)}%` : "0%",
                      background: "linear-gradient(90deg, var(--dq-accent), var(--dq-agent, var(--dq-accent)))",
                      opacity: 0.65,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Buyer stats — read from the seed, verified state matches the shell badge */}
          <div className="dq-rise" style={{ display: "flex", gap: 10, animationDelay: "140ms" }}>
            <StatTile
              label="Committed"
              value={formatCompactCurrency(Math.round(committed))}
              sub={BUYER.verificationMethod === "proof_of_funds" ? "Proof of funds" : "Verified capital"}
            />
            <StatTile label="Pool rank" value={`${BUYER.poolRank} / ${BUYER.poolSize}`} sub="Certified buyer pool" />
            {verified ? (
              <StatTile
                label="Status"
                value="Verified"
                sub="Capital-verified"
                accent
                icon={
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path
                      d="M8 1.5 2.4 3.9v4.2c0 3.3 2.3 5.6 5.6 6.4 3.3-.8 5.6-3.1 5.6-6.4V3.9L8 1.5Z"
                      fill="currentColor"
                      opacity=".16"
                    />
                    <path
                      d="M5.6 8.2 7.2 9.8l3.2-3.4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
            ) : null}
          </div>
        </div>

        {/* ── New deal — the two ways a deal enters the pipeline ────────── */}
        <div className="dq-rise" style={{ marginBottom: 24, animationDelay: "150ms" }}>
          <NewDealSection variant="compact" />
        </div>

        {/* ── Board ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 14,
            alignItems: "start",
          }}
        >
          {PIPELINE_STAGES.map((stage, stageIndex) => {
            // Filtering the *ordered* list keeps each column in canonical order, so
            // the stepper's "4 of 12" walks the board exactly as it reads.
            const inStage = dealsInStage(ordered, stage.key)
            return (
              <section
                key={stage.key}
                aria-label={stage.label}
                className="dq-rise"
                style={{ minWidth: 0, animationDelay: `${180 + stageIndex * 60}ms` }}
              >
                <header style={{ padding: "0 2px 9px", borderBottom: "1px solid var(--div)", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h2 style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: "var(--t1)" }}>{stage.label}</h2>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 10,
                        lineHeight: 1,
                        padding: "3px 7px",
                        borderRadius: 999,
                        color: inStage.length > 0 ? "var(--dq-accent)" : "var(--t3)",
                        background: inStage.length > 0 ? "var(--dq-accent-soft)" : "var(--s2)",
                        border: `1px solid ${inStage.length > 0 ? "var(--dq-accent-edge)" : "var(--b3)"}`,
                      }}
                    >
                      {inStage.length}
                    </span>
                  </div>
                  <p style={{ margin: "5px 0 0", fontSize: 10.5, color: "var(--t3)", lineHeight: 1.35 }}>
                    {stage.meaning}
                  </p>
                </header>

                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {inStage.map((deal, dealIndex) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      isNew={hydrated && deal.id === screenedId}
                      delayMs={220 + stageIndex * 60 + Math.min(dealIndex, 5) * 55}
                    />
                  ))}
                  {inStage.length === 0 ? (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: "var(--t4)",
                        padding: "14px 10px",
                        borderRadius: 10,
                        border: "1px dashed var(--b3)",
                        textAlign: "center",
                      }}
                    >
                      Nothing here.
                    </p>
                  ) : null}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Pieces ───────────────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string
  value: string
  sub: string
  accent?: boolean
  icon?: React.ReactNode
}) {
  return (
    <div
      className="dq-stat"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 3,
        padding: "12px 15px",
        borderRadius: 14,
        border: `1px solid ${accent ? "var(--dq-accent-edge)" : "var(--glass-border)"}`,
        background: accent ? "var(--dq-accent-soft)" : "var(--glass-bg)",
        boxShadow: "var(--glass-shadow)",
        minWidth: 118,
      }}
    >
      <span
        style={{
          fontFamily: mono,
          fontSize: 9,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: accent ? "var(--dq-accent)" : "var(--t3)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontFamily: mono,
          fontSize: 15,
          color: accent ? "var(--dq-accent)" : "var(--t1)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {icon}
        {value}
      </span>
      <span style={{ fontSize: 10, color: "var(--t3)" }}>{sub}</span>
    </div>
  )
}

function DealCard({ deal, isNew, delayMs }: { deal: PipelineDeal; isNew: boolean; delayMs: number }) {
  // Built as an array rather than a template literal: prettier-plugin-tailwindcss
  // rewrites class strings inside template literals and eats the separator.
  const className = ["dq-card", "dq-focus", isNew ? "dq-enter" : "dq-rise"].filter(Boolean).join(" ")
  const scoreColor = deal.verdict === null ? "var(--t1)" : verdictAccentVar(deal.verdict)
  return (
    <Link
      href={dealPath(deal.id)}
      className={className}
      style={{
        display: "block",
        textDecoration: "none",
        padding: "12px 13px 12px",
        borderRadius: 12,
        border: `1px solid ${isNew ? "var(--dq-accent-edge)" : "var(--glass-border)"}`,
        background: isNew ? "var(--dq-accent-soft)" : "var(--glass-bg)",
        boxShadow: "0 1px 3px rgba(20,15,8,.05)",
        position: "relative",
        overflow: "hidden",
        animationDelay: isNew ? undefined : `${delayMs}ms`,
      }}
    >
      {/* Verdict accent rail — colour comes only from verdictAccentVar */}
      {deal.verdict !== null ? (
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: 2.5,
            background: verdictAccentVar(deal.verdict),
            opacity: 0.65,
          }}
        />
      ) : null}

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <span
          title={deal.name}
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--t1)",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {deal.name}
        </span>
        {isNew ? (
          <span
            style={{
              fontFamily: mono,
              fontSize: 8.5,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--dq-accent)",
              flexShrink: 0,
              marginTop: 1,
              animation: "liveBlink 1.8s ease-in-out infinite",
            }}
          >
            {PIPELINE_COPY.justScreenedBadge}
          </span>
        ) : null}
      </div>

      <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 3 }}>
        {deal.industry} · {deal.geography}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <span style={{ fontFamily: mono, fontSize: 11.5, color: "var(--t1)" }}>{formatCompactCurrency(deal.ask)}</span>
        <span style={{ fontFamily: mono, fontSize: 10.5, color: "var(--t3)" }}>
          {formatCompactCurrency(deal.claimedSde)} SDE
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginTop: 9,
          paddingTop: 8,
          borderTop: "1px solid var(--div)",
        }}
      >
        {deal.score === null || deal.verdict === null ? (
          <span style={{ fontFamily: mono, fontSize: 10, color: "var(--t4)" }}>Unscored</span>
        ) : (
          <>
            <span style={{ fontFamily: mono, fontSize: 13, color: scoreColor }}>{formatScore(deal.score)}</span>
            <VerdictChip verdict={deal.verdict} />
          </>
        )}
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: mono, fontSize: 9.5, color: "var(--t4)" }}>{formatDayCount(deal.daysInStage)}</span>
      </div>

      <p style={{ margin: "7px 0 0", fontSize: 10.5, color: "var(--t2)", lineHeight: 1.42 }}>{deal.lastAgentAction}</p>

      {deal.killReason ? (
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 10.5,
            lineHeight: 1.42,
            color: "var(--crit)",
            borderLeft: "2px solid var(--crit-edge)",
            paddingLeft: 7,
          }}
        >
          {deal.killReason}
        </p>
      ) : null}
    </Link>
  )
}

function AmbientBackdrop() {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div
        style={{
          position: "absolute",
          top: "-6%",
          right: "10%",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(74,123,168,.13) 0%, transparent 65%)",
          filter: "blur(34px)",
          animation: "orbDrift1 26s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-8%",
          left: "4%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(107,93,176,.10) 0%, transparent 65%)",
          filter: "blur(34px)",
          animation: "orbDrift2 30s ease-in-out infinite",
        }}
      />
    </div>
  )
}

function EmptyPipeline() {
  return (
    <div
      style={{
        padding: "72px 22px 96px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: inter,
        position: "relative",
      }}
    >
      <AmbientBackdrop />
      <div
        className="dq-rise"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 720,
          padding: "40px 36px 36px",
          borderRadius: 18,
          border: "1px solid var(--glass-border)",
          background: "var(--glass-bg)",
          boxShadow: "var(--glass-shadow)",
        }}
      >
        <NewDealSection variant="full" />
      </div>
    </div>
  )
}
