"use client"

/**
 * Deal Inbox — the opening move of the demo. Paste a listing, watch the
 * Ingestion Agent's scripted log run as the latency mask, get a structured deal
 * card when *both* the log completes and the response resolves (Execution Plan
 * §2 fallback contract). The card is never blocked on the model: the route
 * returns the placeholder card with HTTP 200 on any model failure.
 */

import Link from "next/link"
import React from "react"

import { useDealIQSession } from "@/components/dealiq/DealIQSessionContext"
import { SurfaceCard } from "@/components/dealiq/Surface"
import { FOCUS_DEAL_ID } from "@/components/dealiq/usePipelineDeals"
import { StreamingLog } from "@/components/shared/StreamingLog"
import { INBOX_COPY, INGESTION_LOG, LOG_STEP_MS, SAMPLE_LISTING_TEXT } from "@/lib/dealiq/data/copy"
import { formatCompactCurrency, formatCount, formatLatency } from "@/lib/dealiq/format"
import { DEALIQ_ROOT, dealPath } from "@/lib/dealiq/navigation"
import type { ScreenRequest, ScreenResponse } from "@/lib/dealiq/types"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

const MAX_LISTING_CHARS = 20_000
/** Pause after the last log line before the card reveals. */
const LOG_TAIL_MS = 360

type Phase = "idle" | "running" | "done"

function looksLikeUrl(value: string): boolean {
  const trimmed = value.trim()
  return !trimmed.includes("\n") && /^(https?:\/\/|www\.)/i.test(trimmed)
}

export function DealInbox({ initialText }: { initialText?: string }) {
  const { setScreened } = useDealIQSession()

  const [value, setValue] = React.useState(initialText ?? "")
  const [phase, setPhase] = React.useState<Phase>("idle")
  const [error, setError] = React.useState<string | null>(null)
  const [guidance, setGuidance] = React.useState<string | null>(null)
  const [visibleCount, setVisibleCount] = React.useState(0)
  const [logDone, setLogDone] = React.useState(false)
  const [result, setResult] = React.useState<ScreenResponse | null>(null)

  const timersRef = React.useRef<Array<ReturnType<typeof setTimeout>>>([])
  const abortRef = React.useRef<AbortController | null>(null)

  // Warm the function so the first real screen doesn't pay the cold start.
  React.useEffect(() => {
    fetch("/api/dealiq/screen").catch(() => {})
  }, [])

  // Abort the in-flight request and clear timers on unmount.
  React.useEffect(() => {
    return () => {
      abortRef.current?.abort()
      timersRef.current.forEach(clearTimeout)
    }
  }, [])

  // The reveal contract: the card lands only when the log has finished AND the
  // response has resolved.
  React.useEffect(() => {
    if (phase !== "running" || !logDone || !result) return
    if (result.needsText) {
      setGuidance(result.guidance ?? INBOX_COPY.urlGuidance)
      setPhase("idle")
      return
    }
    setScreened({ card: result.deal, screenedAtIso: new Date().toISOString(), provenance: result.provenance })
    setPhase("done")
  }, [phase, logDone, result, setScreened])

  function startLog() {
    setVisibleCount(1)
    setLogDone(false)
    const timers: Array<ReturnType<typeof setTimeout>> = []
    for (let i = 2; i <= INGESTION_LOG.length; i++) {
      timers.push(setTimeout(() => setVisibleCount(i), LOG_STEP_MS * (i - 1)))
    }
    timers.push(setTimeout(() => setLogDone(true), LOG_STEP_MS * INGESTION_LOG.length + LOG_TAIL_MS))
    timersRef.current = timers
  }

  function stopLog() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (phase === "running") return

    const trimmed = value.trim()
    if (!trimmed) {
      setError(INBOX_COPY.emptyError)
      return
    }
    if (trimmed.length > MAX_LISTING_CHARS) {
      setError(INBOX_COPY.oversizeError)
      return
    }

    setError(null)
    setGuidance(null)
    setResult(null)
    setPhase("running")
    startLog()

    const request: ScreenRequest = { source: looksLikeUrl(trimmed) ? "url" : "text", value: trimmed }
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch("/api/dealiq/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`screen_http_${res.status}`)
      setResult((await res.json()) as ScreenResponse)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      stopLog()
      setPhase("idle")
      setError(INBOX_COPY.networkError)
    }
  }

  function onScreenAnother() {
    setPhase("idle")
    setResult(null)
    setValue("")
    setVisibleCount(0)
    setLogDone(false)
  }

  const running = phase === "running"
  const card = phase === "done" && result ? result.deal : null

  return (
    <div className="dq-screen" style={{ maxWidth: 760 }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 9.5,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "var(--t3)",
        }}
      >
        {INBOX_COPY.eyebrow}
      </div>
      <h1
        style={{
          margin: "3px 0 0",
          fontFamily: garamond,
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: "-.3px",
          color: "var(--t1)",
        }}
      >
        {INBOX_COPY.title}
      </h1>
      <p style={{ margin: "6px 0 20px", fontSize: 13, lineHeight: 1.55, color: "var(--t2)" }}>{INBOX_COPY.subtitle}</p>

      {!card && (
        <SurfaceCard>
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label
              htmlFor="dq-listing"
              style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
            >
              {INBOX_COPY.title}
            </label>
            <textarea
              id="dq-listing"
              value={value}
              maxLength={MAX_LISTING_CHARS}
              disabled={running}
              onChange={(event) => setValue(event.target.value)}
              placeholder={INBOX_COPY.placeholder}
              rows={9}
              className="dq-focus"
              style={{
                resize: "vertical",
                padding: "12px 14px",
                borderRadius: 11,
                border: "1px solid var(--inp-border)",
                background: "var(--inp-bg)",
                color: "var(--t1)",
                fontSize: 12.5,
                lineHeight: 1.6,
                fontFamily: mono,
              }}
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
            {guidance ? (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: "var(--t2)",
                  background: "var(--s2)",
                  border: "1px dashed var(--b2)",
                  borderRadius: 8,
                  padding: "8px 10px",
                }}
              >
                {guidance}
              </p>
            ) : null}

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                type="submit"
                disabled={running}
                className="dq-primary dq-focus"
                style={{
                  padding: "9px 16px",
                  borderRadius: 9,
                  border: "none",
                  background: "var(--dq-accent)",
                  color: "#fff",
                  fontSize: 12.5,
                  fontWeight: 600,
                  fontFamily: inter,
                  cursor: running ? "default" : "pointer",
                  opacity: running ? 0.72 : 1,
                }}
              >
                {running ? INBOX_COPY.submitting : INBOX_COPY.submit}
              </button>
              <button
                type="button"
                disabled={running}
                onClick={() => setValue(SAMPLE_LISTING_TEXT)}
                className="dq-focus"
                style={{
                  padding: "8px 12px",
                  borderRadius: 9,
                  border: "1px solid var(--dq-accent-edge)",
                  background: "var(--dq-accent-soft)",
                  color: "var(--dq-accent)",
                  fontSize: 11.5,
                  fontWeight: 500,
                  fontFamily: inter,
                  cursor: running ? "default" : "pointer",
                }}
              >
                {INBOX_COPY.sampleChip}
              </button>
            </div>
          </form>
        </SurfaceCard>
      )}

      {(running || card) && (
        <div style={{ marginTop: 18 }}>
          <StreamingLog
            lines={INGESTION_LOG.slice(0, running ? visibleCount : INGESTION_LOG.length)}
            totalCount={INGESTION_LOG.length}
            complete={!running}
            title="ingestion-agent · dealiq · live"
            accentColor="var(--dq-accent)"
            height={260}
          />
        </div>
      )}

      {card && result && <DealCardResult result={result} onScreenAnother={onScreenAnother} />}
    </div>
  )
}

function DealCardResult({ result, onScreenAnother }: { result: ScreenResponse; onScreenAnother: () => void }) {
  const { deal } = result
  const isFixtureDeal = deal.id === FOCUS_DEAL_ID
  const provenanceLabel = result.provenance === "live" ? `haiku · ${formatLatency(result.latencyMs)}` : "cached"

  const facts: Array<{ label: string; value: string }> = [
    { label: "Asking", value: formatCompactCurrency(deal.ask) },
    { label: "Claimed SDE", value: formatCompactCurrency(deal.claimedSde) },
  ]
  if (deal.revenue != null) facts.push({ label: "Revenue", value: formatCompactCurrency(deal.revenue) })
  if (deal.employees != null) facts.push({ label: "Employees", value: formatCount(deal.employees) })
  if (deal.yearsOperating != null) facts.push({ label: "Years operating", value: formatCount(deal.yearsOperating) })

  return (
    <section
      className="dq-card dq-enter"
      style={{
        marginTop: 16,
        padding: 20,
        borderRadius: 13,
        border: "1px solid var(--b3)",
        background: "var(--glass-bg)",
        boxShadow: "var(--glass-shadow)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            title={deal.name}
            style={{
              margin: 0,
              fontFamily: garamond,
              fontSize: 21,
              fontWeight: 500,
              letterSpacing: "-.3px",
              color: "var(--t1)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {deal.name}
          </h2>
          <div style={{ marginTop: 2, fontSize: 12, color: "var(--t2)" }}>
            {deal.industry} · {deal.geography}
          </div>
        </div>
        <span
          style={{
            flexShrink: 0,
            fontFamily: mono,
            fontSize: 9.5,
            letterSpacing: ".06em",
            color: "var(--t3)",
            border: "1px solid var(--b2)",
            borderRadius: 6,
            padding: "3px 7px",
          }}
        >
          {provenanceLabel}
        </span>
      </div>

      <dl
        style={{
          margin: "16px 0 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 12,
        }}
      >
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt
              style={{
                fontFamily: mono,
                fontSize: 9,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--t3)",
              }}
            >
              {fact.label}
            </dt>
            <dd style={{ margin: "2px 0 0", fontFamily: mono, fontSize: 15, fontWeight: 600, color: "var(--t1)" }}>
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>

      {deal.highlights.length > 0 && <CardList heading="Listing highlights" items={deal.highlights} tone="var(--t2)" />}
      {deal.concerns.length > 0 && <CardList heading="Surfaced concerns" items={deal.concerns} tone="var(--crit)" />}

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 18 }}>
        <Link
          href={isFixtureDeal ? dealPath(deal.id) : DEALIQ_ROOT}
          className="dq-primary dq-focus"
          style={{
            padding: "9px 16px",
            borderRadius: 9,
            background: "var(--dq-accent)",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 600,
            fontFamily: inter,
            textDecoration: "none",
          }}
        >
          {isFixtureDeal ? "Open the deal workspace →" : "View it on the pipeline →"}
        </Link>
        <button
          type="button"
          onClick={onScreenAnother}
          className="dq-focus"
          style={{
            padding: "8px 12px",
            borderRadius: 9,
            border: "1px solid var(--b2)",
            background: "transparent",
            color: "var(--t2)",
            fontSize: 11.5,
            fontWeight: 500,
            fontFamily: inter,
            cursor: "pointer",
          }}
        >
          Screen another
        </button>
      </div>
    </section>
  )
}

function CardList({ heading, items, tone }: { heading: string; items: ReadonlyArray<string>; tone: string }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 9,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--t3)",
        }}
      >
        {heading}
      </div>
      <ul
        style={{ margin: "6px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}
      >
        {items.map((item) => (
          <li key={item} style={{ display: "flex", gap: 8, fontSize: 12, lineHeight: 1.5, color: "var(--t2)" }}>
            <span aria-hidden style={{ color: tone, flexShrink: 0 }}>
              ·
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
