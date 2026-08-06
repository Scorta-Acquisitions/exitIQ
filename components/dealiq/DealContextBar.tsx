"use client"

/**
 * The deal context bar — mounts only inside a deal, and is the reason DealIQ can
 * be a triage tool rather than a browser.
 *
 * A searcher's job is to move between deals quickly, so the bar carries a
 * prev/next stepper bound to the pipeline's canonical order (`orderedDeals`), the
 * position within it, and `[` / `]` shortcuts. "Deal 4 of 12" here and the fourth
 * card on the board are the same deal by construction — both read one ordering
 * function.
 *
 * Tabs are plain links to `?tab=`, so every tab is deep-linkable and the browser's
 * back button works. The active tab is resolved on the server from `searchParams`
 * rather than with `useSearchParams`, which keeps this component out of a Suspense
 * boundary.
 */

import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"

import { formatCompactCurrency, formatScore, verdictAccentVar } from "@/lib/dealiq/format"
import { DEAL_TABS, DEALIQ_ROOT, dealPath } from "@/lib/dealiq/navigation"
import { adjacentDeals, dealPosition } from "@/lib/dealiq/pipeline"
import type { DealTabKey, PipelineDeal } from "@/lib/dealiq/types"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

export const DQ_CONTEXT_BAR_HEIGHT = 84

export function DealContextBar({
  deal,
  deals,
  activeTab,
}: {
  deal: PipelineDeal
  deals: ReadonlyArray<PipelineDeal>
  activeTab: DealTabKey
}) {
  const router = useRouter()
  const { prev, next } = React.useMemo(() => adjacentDeals(deals, deal.id), [deals, deal.id])
  const position = React.useMemo(() => dealPosition(deals, deal.id), [deals, deal.id])

  // `[` / `]` step through the pipeline without leaving the keyboard. Ignored
  // while the buyer is typing, so the Inbox textarea and any future filter input
  // keep their brackets.
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return
      if (event.key === "[" && prev) router.push(dealPath(prev.id, activeTab))
      if (event.key === "]" && next) router.push(dealPath(next.id, activeTab))
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [prev, next, activeTab, router])

  return (
    <div
      style={{
        position: "sticky",
        top: 56,
        zIndex: 30,
        borderBottom: "1px solid var(--div)",
        background: "rgba(255,255,255,.66)",
        backdropFilter: "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",
        fontFamily: inter,
      }}
    >
      {/* Identity row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 22px 0" }}>
        <Stepper
          direction="prev"
          target={prev}
          activeTab={activeTab}
          label={prev ? `Previous deal — ${prev.name}` : "No previous deal"}
        />

        <div style={{ minWidth: 0, display: "flex", alignItems: "baseline", gap: 10, flex: 1 }}>
          <h1
            title={deal.name}
            style={{
              margin: 0,
              fontFamily: garamond,
              fontSize: 19,
              fontWeight: 500,
              letterSpacing: "-.2px",
              color: "var(--t1)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "38ch",
            }}
          >
            {deal.name}
          </h1>
          <span style={{ fontFamily: mono, fontSize: 11.5, color: "var(--t2)", whiteSpace: "nowrap" }}>
            {formatCompactCurrency(deal.ask)} ask
          </span>
          <span aria-hidden style={{ color: "var(--t4)" }}>
            ·
          </span>
          {deal.score === null || deal.verdict === null ? (
            <span style={{ fontFamily: mono, fontSize: 11.5, color: "var(--t3)", whiteSpace: "nowrap" }}>
              Not yet screened
            </span>
          ) : (
            <>
              <span style={{ fontFamily: mono, fontSize: 11.5, color: "var(--t2)", whiteSpace: "nowrap" }}>
                Score {formatScore(deal.score)}
              </span>
              <VerdictChip verdict={deal.verdict} />
            </>
          )}
        </div>

        <span style={{ fontFamily: mono, fontSize: 10.5, color: "var(--t3)", whiteSpace: "nowrap" }}>
          {position === null ? "Not in pipeline" : `${position} of ${deals.length}`}
        </span>

        <Stepper
          direction="next"
          target={next}
          activeTab={activeTab}
          label={next ? `Next deal — ${next.name}` : "No next deal"}
        />

        <Link
          href={DEALIQ_ROOT}
          aria-label="Close deal and return to the pipeline"
          className="dq-step dq-focus"
          style={{
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 7,
            color: "var(--t3)",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden>
            <path
              d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      </div>

      {/* Tabs */}
      <nav aria-label="Deal workspace" style={{ display: "flex", gap: 2, padding: "8px 22px 0" }}>
        {DEAL_TABS.map((tab) => {
          const active = tab.key === activeTab
          return (
            <Link
              key={tab.key}
              href={dealPath(deal.id, tab.key)}
              aria-current={active ? "page" : undefined}
              className="dq-tab dq-focus"
              style={{
                padding: "7px 12px 9px",
                fontSize: 12.5,
                fontWeight: active ? 600 : 500,
                letterSpacing: "-.01em",
                color: active ? "var(--t1)" : "var(--t2)",
                textDecoration: "none",
                borderBottom: `2px solid ${active ? "var(--dq-accent)" : "transparent"}`,
                marginBottom: -1,
              }}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

function Stepper({
  direction,
  target,
  activeTab,
  label,
}: {
  direction: "prev" | "next"
  target: PipelineDeal | null
  activeTab: DealTabKey
  label: string
}) {
  const glyph = direction === "prev" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"
  const shortcut = direction === "prev" ? "[" : "]"
  const base: React.CSSProperties = {
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    flexShrink: 0,
    color: "var(--t3)",
  }

  if (!target) {
    return (
      <button
        type="button"
        disabled
        aria-label={label}
        style={{ ...base, border: "none", background: "transparent", opacity: 0.32 }}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden>
          <path
            d={glyph}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>
    )
  }

  return (
    <Link
      href={dealPath(target.id, activeTab)}
      aria-label={label}
      title={`${label}  ${shortcut}`}
      className="dq-step dq-focus"
      style={{ ...base, textDecoration: "none" }}
    >
      <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden>
        <path
          d={glyph}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </Link>
  )
}

export function VerdictChip({ verdict, size = "sm" }: { verdict: "PASS" | "DIG" | "PURSUE"; size?: "sm" | "lg" }) {
  const accent = verdictAccentVar(verdict)
  return (
    <span
      style={{
        fontFamily: mono,
        fontSize: size === "lg" ? 11.5 : 9.5,
        letterSpacing: ".08em",
        fontWeight: 500,
        color: accent,
        background: "color-mix(in srgb, currentColor 10%, transparent)",
        border: "1px solid color-mix(in srgb, currentColor 30%, transparent)",
        borderRadius: 5,
        padding: size === "lg" ? "4px 9px" : "2.5px 6px",
        whiteSpace: "nowrap",
      }}
    >
      {verdict}
    </span>
  )
}
