"use client"

/**
 * The Case Manager — DealIQ's floating agent, bottom right.
 *
 * The buy-side sibling of the sell side's CASE strip, rebuilt for a triage tool:
 * not a conversation, a briefing. One next step per deal, computed by
 * `lib/dealiq/caseManager.ts` from the same derived deal list the board renders,
 * ordered closest-to-money first, each step deep-linking to the tab where the
 * work happens. Session state flows through `usePipelineDeals`, so sending an
 * LOI or screening a deal updates the briefing without a refresh.
 *
 * All chrome copy lives in `CASE_MANAGER_COPY`; step prose is engine output.
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

import { VerdictChip } from "@/components/dealiq/DealContextBar"
import { usePipelineDeals } from "@/components/dealiq/usePipelineDeals"
import { caseBriefing, type CaseUrgency } from "@/lib/dealiq/caseManager"
import { CASE_MANAGER_COPY } from "@/lib/dealiq/data/copy"
import { formatDayCount } from "@/lib/dealiq/format"
import { dealPath, pipelineStageLabel } from "@/lib/dealiq/navigation"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

const URGENCY_VAR: Record<CaseUrgency, string> = {
  act: "var(--dq-accent)",
  waiting: "var(--gold)",
  watch: "var(--t4)",
}

export function DealIQCaseManager() {
  const { deals } = usePipelineDeals()
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement | null>(null)

  const briefing = React.useMemo(() => caseBriefing(deals), [deals])
  const actCount = briefing.filter((item) => item.step.urgency === "act").length

  React.useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  // A deep link taken from the panel should close it — a soft nav leaves it open otherwise.
  React.useEffect(() => setOpen(false), [pathname])

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 10,
        fontFamily: inter,
      }}
    >
      <style>{`
        @keyframes dqCasePulse {
          0%, 100% { transform: scale(1);    opacity: 1;  }
          50%      { transform: scale(1.10); opacity: .9; }
        }
        @keyframes dqCaseBlink {
          0%, 100% { opacity: 1;  }
          50%      { opacity: .3; }
        }
        .dq-cm-row { transition: background .13s ease, border-color .13s ease; }
        .dq-cm-row:hover { background: var(--dq-accent-soft); border-color: var(--dq-accent-edge); }
        .dq-cm-launcher { transition: transform 180ms ease-out, box-shadow 180ms ease-out; }
        .dq-cm-launcher:hover { transform: translateY(-1px); box-shadow: 0 18px 36px rgba(12,10,9,.36); }
        @media (prefers-reduced-motion: reduce) {
          .dq-cm-launcher:hover { transform: none; }
        }
      `}</style>

      {open ? (
        <section
          aria-label={`${CASE_MANAGER_COPY.name} — ${CASE_MANAGER_COPY.panelTitle}`}
          className="dq-menu-pop"
          style={{
            width: 354,
            maxWidth: "calc(100vw - 40px)",
            maxHeight: "min(480px, calc(100vh - 120px))",
            display: "flex",
            flexDirection: "column",
            borderRadius: 14,
            border: "1px solid var(--b3)",
            background: "var(--dd-bg)",
            boxShadow: "0 18px 48px rgba(20,15,8,.18)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <header
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 15px 12px",
              background: "rgba(12,10,9,.94)",
            }}
          >
            <Orb size={20} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontFamily: garamond,
                    fontSize: 15,
                    fontWeight: 500,
                    color: "rgba(245,245,245,.95)",
                    letterSpacing: "-.2px",
                    lineHeight: 1,
                  }}
                >
                  {CASE_MANAGER_COPY.name}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontFamily: mono,
                    fontSize: 9.5,
                    color: "var(--mint, #2c8c70)",
                    letterSpacing: ".5px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "var(--mint, #2c8c70)",
                      boxShadow: "0 0 5px var(--mint, #2c8c70)",
                      animation: "dqCaseBlink 1.8s ease-in-out infinite",
                    }}
                  />
                  Active · {CASE_MANAGER_COPY.role}
                </span>
              </div>
            </div>
          </header>

          {/* Briefing */}
          <div style={{ overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {briefing.length === 0 ? (
              <p style={{ margin: 0, padding: "18px 12px", fontSize: 12, color: "var(--t3)", textAlign: "center" }}>
                {CASE_MANAGER_COPY.emptyState}
              </p>
            ) : (
              briefing.map(({ deal, step }) => (
                <Link
                  key={deal.id}
                  href={dealPath(deal.id, step.tab)}
                  className="dq-cm-row dq-focus"
                  style={{
                    display: "block",
                    padding: "10px 11px",
                    borderRadius: 10,
                    border: "1px solid var(--b3)",
                    background: "var(--s1)",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                    <span
                      aria-hidden
                      title={CASE_MANAGER_COPY.urgencyLabels[step.urgency]}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: URGENCY_VAR[step.urgency],
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--t1)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      {deal.name}
                    </span>
                    {deal.verdict !== null ? <VerdictChip verdict={deal.verdict} /> : null}
                  </span>

                  <span
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 6,
                      marginTop: 6,
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--dq-accent)" }}>{step.headline}</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontFamily: mono, fontSize: 9, color: "var(--t4)", whiteSpace: "nowrap" }}>
                      {pipelineStageLabel(deal.stage)} · {formatDayCount(deal.daysInStage)}
                    </span>
                  </span>

                  <span
                    style={{ display: "block", fontSize: 10.5, color: "var(--t2)", lineHeight: 1.45, marginTop: 3 }}
                  >
                    {step.detail}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>
      ) : null}

      {/* Toggle */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? CASE_MANAGER_COPY.closeAria : CASE_MANAGER_COPY.openAria}
        className="dq-cm-launcher dq-focus"
        style={{
          position: "relative",
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: "none",
          background: "rgba(12,10,9,.92)",
          boxShadow: "0 12px 30px rgba(12,10,9,.30)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Orb size={26} />
        {actCount > 0 ? (
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              minWidth: 18,
              height: 18,
              padding: "0 5px",
              borderRadius: 9999,
              background: "#d44a3a",
              color: "#fff",
              fontFamily: inter,
              fontSize: 10.5,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(212,74,58,.45)",
              border: "2px solid rgba(12,10,9,.92)",
            }}
          >
            {actCount}
          </span>
        ) : null}
      </button>
    </div>
  )
}

/** The Case Manager's icon — a pulsing gradient orb, identical to the sell-side CASE launcher. */
function Orb({ size }: { size: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
        boxShadow: "0 0 10px rgba(44,140,112,.65)",
        animation: "dqCasePulse 3.2s ease-in-out infinite",
        flexShrink: 0,
      }}
    />
  )
}
