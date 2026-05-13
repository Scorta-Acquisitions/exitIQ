"use client"

import React from "react"
import {
  READINESS_AXIS_DESCRIPTIONS,
  READINESS_AXIS_KEYS,
  READINESS_AXIS_LABELS,
} from "@/lib/assessment/readiness-axes"
import type { ReportData } from "@/lib/assessment/report-transform"
import { workflowTraceClient } from "@/lib/debug/workflow-trace-client"
import { RadarChart } from "./radar"

// ── Shared hooks ──────────────────────────────────────────────────────────────

function useSpringNum(target: number, k = 0.05, d = 0.84): number {
  const [v, setV] = React.useState(0)
  const ref = React.useRef({ cur: 0, vel: 0, raf: 0 })
  React.useEffect(() => {
    const tick = () => {
      const { cur, vel } = ref.current
      const nv = (vel + (target - cur) * k) * d
      const nc = cur + nv
      ref.current = { cur: nc, vel: nv, raf: 0 }
      setV(nc)
      if (Math.abs(target - nc) > 0.05) ref.current.raf = requestAnimationFrame(tick)
      else setV(target)
    }
    cancelAnimationFrame(ref.current.raf)
    ref.current.raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current.raf)
  }, [target])
  return v
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Formats a raw-dollar amount, auto-picking K vs M.
//   1_500_000 → "$1.5M"   135_000 → "$135K"   999 → "$999"
function fmtMoney(n: number): string {
  if (!Number.isFinite(n)) return "$0"
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000
    const rounded = Math.round(m * 10) / 10
    return `${sign}$${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}M`
  }
  if (abs >= 1_000) {
    return `${sign}$${Math.round(abs / 1_000)}K`
  }
  return `${sign}$${Math.round(abs).toLocaleString()}`
}

function SectionLabel({
  num,
  label,
  accent = "var(--mint)",
}: {
  num: number
  label: string
  accent?: string
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div
        style={{
          fontFamily: "'JetBrains Mono', var(--font-jetbrains-mono, monospace)",
          fontSize: 11,
          color: accent,
          fontWeight: 500,
          letterSpacing: ".5px",
        }}
      >
        §{String(num).padStart(2, "0")}
      </div>
      <div style={{ height: 1, width: 24, background: accent, opacity: 0.4 }} />
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "1.2px",
          textTransform: "uppercase",
          color: "var(--t2)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {label}
      </div>
    </div>
  )
}

function SectionLead({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        color: "var(--t3)",
        fontStyle: "italic",
        fontFamily: "Inter, sans-serif",
        maxWidth: 640,
        marginTop: -4,
        marginBottom: 14,
        lineHeight: 1.55,
      }}
    >
      {children}
    </div>
  )
}

// Hover-to-peek, click-to-pin expandable state. Pinned overrides hover.
function useExpandable() {
  const [hover, setHover] = React.useState(false)
  const [pinned, setPinned] = React.useState(false)
  const expanded = pinned || hover
  return {
    expanded,
    pinned,
    handlers: {
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      onClick: () => setPinned((p) => !p),
    },
  }
}

function ExpandHint({
  expanded,
  pinned,
  color = "var(--t3)",
}: {
  expanded: boolean
  pinned: boolean
  color?: string
}) {
  const label = pinned ? "Pinned · click to close" : expanded ? "Less" : "More"
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: ".6px",
        textTransform: "uppercase",
        color,
        fontFamily: "Inter, sans-serif",
        opacity: pinned ? 1 : 0.75,
        transition: "opacity .2s ease",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <span>{label}</span>
      <svg
        width={9}
        height={9}
        viewBox="0 0 10 10"
        fill="none"
        style={{
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform .25s ease",
        }}
      >
        <path d="M2 3.5l3 3 3-3" stroke={color} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function parseNarrativeSections(md: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const parts = ("\n" + md).split("\n## ")
  for (const part of parts.slice(1)) {
    const nl = part.indexOf("\n")
    if (nl === -1) continue
    const key = part.slice(0, nl).trim()
    const body = part.slice(nl + 1).trim()
    if (key && body) sections[key] = body
  }
  return sections
}

// Render inline markdown: **bold**, *italic*. Returns React nodes.
function renderInlineMd(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  let buf = ""
  let i = 0
  let k = 0
  const flush = () => {
    if (buf) {
      out.push(buf)
      buf = ""
    }
  }
  while (i < text.length) {
    // **bold**
    if (text[i] === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2)
      if (end !== -1) {
        flush()
        out.push(<strong key={`${keyPrefix}-b${k++}`}>{text.slice(i + 2, end)}</strong>)
        i = end + 2
        continue
      }
    }
    // *italic* (single asterisks, not adjacent to another *)
    if (text[i] === "*" && text[i + 1] !== "*" && (i === 0 || text[i - 1] !== "*")) {
      const end = text.indexOf("*", i + 1)
      if (end !== -1 && text[end + 1] !== "*" && end > i + 1) {
        flush()
        out.push(<em key={`${keyPrefix}-i${k++}`}>{text.slice(i + 1, end)}</em>)
        i = end + 1
        continue
      }
    }
    buf += text[i]
    i++
  }
  flush()
  return out
}

function NarrativeProse({ prose }: { prose?: string }) {
  const paraStyle: React.CSSProperties = {
    fontSize: 13,
    color: "var(--t2)",
    lineHeight: 1.72,
    fontFamily: "Inter, sans-serif",
    marginBottom: 10,
  }
  const hrStyle: React.CSSProperties = {
    border: 0,
    borderTop: "1px solid var(--div)",
    margin: "14px 0",
  }

  if (!prose) {
    return (
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--div)" }}>
        <p
          style={{
            fontSize: 12,
            color: "var(--t4)",
            fontStyle: "italic",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Analysis not available
        </p>
      </div>
    )
  }

  // First pass: produce a flat sequence of {paragraph text} or {hr} items.
  type Item = { kind: "p"; text: string; id: string } | { kind: "hr"; id: string }
  const items: Item[] = []
  prose
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean)
    .forEach((block, bi) => {
      const lines = block.split("\n")
      let para: string[] = []
      const flushPara = (id: string) => {
        if (para.length) {
          const text = para.join(" ").trim()
          if (text) items.push({ kind: "p", text, id })
          para = []
        }
      }
      lines.forEach((line, li) => {
        if (/^-{3,}$/.test(line.trim())) {
          flushPara(`${bi}-${li}`)
          items.push({ kind: "hr", id: `${bi}-${li}` })
        } else {
          para.push(line)
        }
      })
      flushPara(`${bi}-end`)
    })

  const lastParaIdx = (() => {
    for (let i = items.length - 1; i >= 0; i--) if (items[i]?.kind === "p") return i
    return -1
  })()

  return (
    <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--div)" }}>
      {items.map((item, i) => {
        if (item.kind === "hr") return <hr key={`hr-${item.id}`} style={hrStyle} />
        const style = i === lastParaIdx ? { ...paraStyle, marginBottom: 0 } : paraStyle
        return (
          <p key={`p-${item.id}`} style={style}>
            {renderInlineMd(item.text, `p-${item.id}`)}
          </p>
        )
      })}
    </div>
  )
}

// ── §01 Hero Scorecard ────────────────────────────────────────────────────────

// Convert subscores into a 7-axis radar (0–1) keyed by READINESS_AXIS_KEYS.
// The readiness path already emits 7 keys; the legacy 5-dim path is projected.
function buildHeroRadarScores(subscores: ReportData["score"]["subscores"]): number[] {
  const byKey = new Map(subscores.map((s) => [s.key, s.value]))
  if (subscores.length === READINESS_AXIS_KEYS.length) {
    return READINESS_AXIS_KEYS.map((k) => (byKey.get(k) ?? 0) / 100)
  }
  // 5-dim fallback → 7-axis projection
  const f = (byKey.get("financial") ?? 0) / 100
  const o = (byKey.get("operational") ?? 0) / 100
  const mk = (byKey.get("market") ?? 0) / 100
  const ba = (byKey.get("buyerAccess") ?? 0) / 100
  return [f, o, f, mk, ba, o, mk]
}

function HeroScorecard({ data, prose }: { data: ReportData; prose?: string }) {
  const { score, meta, valuation } = data
  const disp = useSpringNum(score.composite, 0.045, 0.84)
  const r = 100
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - disp / 100)

  const radarScores = React.useMemo(() => buildHeroRadarScores(score.subscores), [score.subscores])
  const [hoverAxis, setHoverAxis] = React.useState<number | null>(null)
  const [pinnedAxis, setPinnedAxis] = React.useState<number | null>(null)
  const activeAxis = pinnedAxis ?? hoverAxis
  const activeKey = activeAxis !== null ? READINESS_AXIS_KEYS[activeAxis] : null
  const activeLabel = activeKey ? READINESS_AXIS_LABELS[activeKey] ?? activeKey : null
  const activeDesc = activeKey ? READINESS_AXIS_DESCRIPTIONS[activeKey] : null
  const activeScore =
    activeAxis !== null ? Math.round((radarScores[activeAxis] ?? 0) * 100) : null

  return (
    <section style={{ marginBottom: 20 }}>
      <div
        className="glass-r-strong"
        style={{ padding: "36px 40px", position: "relative", overflow: "hidden", animation: "slideUpLg .8s cubic-bezier(.34,1.1,.64,1)" }}
      >
        {/* Scan line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 1,
            background: "linear-gradient(90deg,transparent,var(--mint-edge),transparent)",
            animation: "scanDown 6s linear infinite",
            pointerEvents: "none",
          }}
        />

        {/* Top row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--mint)",
                  boxShadow: "0 0 8px var(--mint)",
                  animation: "liveBlink 2s ease-in-out infinite",
                }}
              />
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "1.1px",
                  textTransform: "uppercase",
                  color: "var(--mint)",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                ExitIQ Report · {meta.name}
              </div>
            </div>
            <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "Inter, sans-serif" }}>
              {meta.generated} · {meta.revenue} revenue · {meta.sde} SDE · {meta.yearsInBusiness} years in business
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print"
            style={{
              height: 34,
              padding: "0 14px",
              borderRadius: 9999,
              background: "var(--s1)",
              border: "1px solid var(--b2)",
              color: "var(--t2)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
              <path d="M3 4V2h6v2M3 8H2v3h8V8H9M3 4h6v4H3z" stroke="currentColor" strokeWidth={1.1} fill="none" />
            </svg>
            Print / PDF
          </button>
        </div>

        {/* Main 3-col layout */}
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 40, alignItems: "center" }}>
          {/* Gauge */}
          <div style={{ position: "relative", width: 228, height: 228 }}>
            <svg width={228} height={228} viewBox="0 0 228 228">
              <defs>
                <linearGradient id="gaugeG" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--crit)" />
                  <stop offset="50%" stopColor="var(--peach)" />
                  <stop offset="100%" stopColor="var(--mint)" />
                </linearGradient>
              </defs>
              <circle cx={114} cy={114} r={r} fill="none" stroke="var(--s1)" strokeWidth={13} />
              <circle
                cx={114}
                cy={114}
                r={r}
                fill="none"
                stroke="url(#gaugeG)"
                strokeWidth={13}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                transform="rotate(-90 114 114)"
                style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,.10))", transition: "stroke-dashoffset .05s linear" }}
              />
              {[...Array(11)].map((_, i) => {
                const a = -Math.PI / 2 + Math.PI * 2 * (i / 10)
                const x1 = 114 + (r + 10) * Math.cos(a)
                const y1 = 114 + (r + 10) * Math.sin(a)
                const x2 = 114 + (r + 16) * Math.cos(a)
                const y2 = 114 + (r + 16) * Math.sin(a)
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--t5)" strokeWidth={1} />
              })}
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                  fontSize: 84,
                  fontWeight: 300,
                  color: "var(--t1)",
                  letterSpacing: "-3px",
                  lineHeight: 0.9,
                }}
              >
                {Math.round(disp)}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "1.4px",
                  textTransform: "uppercase",
                  color: "var(--t3)",
                  marginTop: 4,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                out of 100
              </div>
            </div>
          </div>

          {/* Headline */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 12px",
                background: "var(--peach-soft)",
                border: "1px solid var(--peach-edge)",
                borderRadius: 9999,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                  fontSize: 20,
                  fontWeight: 400,
                  color: "var(--peach)",
                  lineHeight: 1,
                  letterSpacing: "-.5px",
                }}
              >
                {score.grade}
              </div>
              <div style={{ width: 1, height: 13, background: "var(--peach-edge)" }} />
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--peach)", letterSpacing: ".4px", fontFamily: "Inter, sans-serif" }}>
                {score.gradeLabel}
              </div>
            </div>
            <h1
              style={{
                fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                fontSize: "clamp(22px, 2.4vw, 32px)",
                fontWeight: 300,
                color: "var(--t1)",
                lineHeight: 1.14,
                letterSpacing: "-.7px",
                margin: 0,
              }}
            >
              {score.headline}
            </h1>
            {data.detractors[0] && (
              <div
                style={{
                  marginTop: 16,
                  padding: "12px 16px",
                  background: "var(--mint-soft)",
                  borderLeft: "2px solid var(--mint)",
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "var(--mint)",
                    marginBottom: 4,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  The single highest-leverage move
                </div>
                <div style={{ fontSize: 13, color: "var(--t1)", lineHeight: 1.55, fontFamily: "Inter, sans-serif" }}>
                  {data.detractors[0].fix} This one deliverable could shift your enterprise value by{" "}
                  <strong>{fmtMoney(data.transferability.dollarImpact * 1000)}</strong>.
                </div>
              </div>
            )}
          </div>

          {/* Radar */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              paddingLeft: 24,
              borderLeft: "1px solid var(--div)",
            }}
          >
            <RadarChart
              scores={radarScores}
              size={210}
              axisLabelFontSize={8}
              activeAxis={activeAxis}
              onAxisHover={(i) => setHoverAxis(i)}
              onAxisClick={(i) =>
                setPinnedAxis((cur) => (cur === i ? null : i))
              }
              centerContent={
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                      fontSize: 36,
                      fontWeight: 300,
                      color: "var(--t1)",
                      letterSpacing: "-1px",
                      lineHeight: 1,
                    }}
                  >
                    {Math.round(disp)}
                  </div>
                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      letterSpacing: "1.1px",
                      textTransform: "uppercase",
                      color: "var(--t3)",
                      marginTop: 2,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Exit Readiness
                  </div>
                </div>
              }
            />
            <div
              style={{
                fontSize: 10,
                color: "var(--t4)",
                fontFamily: "Inter, sans-serif",
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              Hover an axis · click to pin
            </div>
          </div>
        </div>

        {/* Stat strip — 3 stats in a row, where the subscore bars used to live */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid var(--div)",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 28,
          }}
        >
          <StatItem
            label="Valuation midpoint"
            big={fmtMoney(valuation.mid)}
            sub={`${fmtMoney(valuation.lo)} – ${fmtMoney(valuation.hi)}`}
            accent="var(--t1)"
          />
          <StatItem
            label="Timeline runway"
            big={meta.timeline}
            sub="Seller window"
            accent="var(--lav)"
          />
          <StatItem
            label="Buyer pool"
            big={data.sba.eligible ? "SBA-qualified" : "Conventional"}
            sub={data.sba.buyerPool}
            accent="var(--sky)"
          />
        </div>

        {/* Axis explanation — appears when an axis is hovered or pinned */}
        {activeLabel && activeDesc !== null && (
          <div
            style={{
              marginTop: 18,
              padding: "13px 16px",
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-edge)",
              borderRadius: 12,
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              animation: "fadeIn .25s ease",
            }}
          >
            <div style={{ flexShrink: 0, minWidth: 140 }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "1.1px",
                  textTransform: "uppercase",
                  color: "var(--mint)",
                  fontFamily: "Inter, sans-serif",
                  marginBottom: 3,
                }}
              >
                About this axis
              </div>
              <div
                style={{
                  fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                  fontSize: 17,
                  fontWeight: 400,
                  color: "var(--t1)",
                  letterSpacing: "-.2px",
                  lineHeight: 1.2,
                }}
              >
                {activeLabel}
                {activeScore !== null && (
                  <>
                    {" · "}
                    <span style={{ color: "var(--mint)", fontWeight: 500 }}>{activeScore}/100</span>
                  </>
                )}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                fontSize: 12,
                color: "var(--t2)",
                lineHeight: 1.65,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {activeDesc}
            </div>
            {pinnedAxis !== null && (
              <button
                onClick={() => setPinnedAxis(null)}
                className="no-print"
                style={{
                  flexShrink: 0,
                  background: "transparent",
                  border: "none",
                  color: "var(--t3)",
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "Inter, sans-serif",
                  padding: "2px 6px",
                  borderRadius: 6,
                }}
                aria-label="Unpin axis"
              >
                ✕
              </button>
            )}
          </div>
        )}

        <NarrativeProse prose={prose} />
      </div>
    </section>
  )
}

function StatItem({ label, big, sub, accent }: { label: string; big: string; sub: string; accent: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "1.1px",
          textTransform: "uppercase",
          color: "var(--t3)",
          marginBottom: 3,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
          fontSize: 20,
          fontWeight: 300,
          color: accent,
          letterSpacing: "-.3px",
          lineHeight: 1.1,
        }}
      >
        {big}
      </div>
      <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2, fontFamily: "Inter, sans-serif" }}>{sub}</div>
    </div>
  )
}

// ── §02 Valuation Analysis ────────────────────────────────────────────────────

function MethodBar({ m, maxK, delay }: { m: ReportData["valuation"]["methods"][number]; maxK: number; delay: number }) {
  const { expanded, pinned, handlers } = useExpandable()
  const loPct = (m.lo / maxK) * 100
  const hiPct = (m.hi / maxK) * 100
  return (
    <div
      {...handlers}
      style={{
        padding: "13px 15px",
        background: expanded ? "var(--glass-bg-strong)" : "var(--glass-bg)",
        border: `1px solid ${pinned ? "var(--mint-edge)" : "var(--glass-edge)"}`,
        borderRadius: 13,
        animation: `slideUp .6s ${delay}ms cubic-bezier(.34,1.2,.64,1) both`,
        transition: "all .25s ease",
        transform: expanded ? "translateY(-2px)" : "none",
        boxShadow: expanded ? "0 10px 24px rgba(0,0,0,.07)" : "none",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <div
            style={{
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontSize: 17,
              fontWeight: 300,
              color: "var(--t1)",
            }}
          >
            {m.name}
          </div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: ".8px",
              textTransform: "uppercase",
              color: m.primary ? "var(--mint)" : "var(--t3)",
              padding: "2px 6px",
              background: m.primary ? "var(--mint-soft)" : "var(--s1)",
              borderRadius: 9999,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {m.weight}
          </div>
        </div>
        <div
          style={{
            fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
            fontSize: 17,
            fontWeight: 300,
            color: "var(--t1)",
          }}
        >
          {m.lo === m.hi ? fmtMoney(m.lo) : `${fmtMoney(m.lo)} – ${fmtMoney(m.hi)}`}
        </div>
      </div>
      <div style={{ position: "relative", height: 7, marginBottom: 8 }}>
        <div style={{ position: "absolute", inset: 0, background: "var(--s1)", borderRadius: 9999 }} />
        <div
          style={{
            position: "absolute",
            left: `${loPct}%`,
            width: `${Math.max(hiPct - loPct, 0.8)}%`,
            top: 0,
            bottom: 0,
            background: m.primary ? "linear-gradient(90deg, var(--mint), #5cb89a)" : "var(--t3)",
            borderRadius: 9999,
            transformOrigin: "left",
            animation: `barFill .9s ${delay + 200}ms cubic-bezier(.34,1.1,.64,1) both`,
            boxShadow: m.primary ? "0 0 8px var(--mint-edge)" : "none",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 11,
          color: "var(--t3)",
          lineHeight: 1.55,
          maxHeight: expanded ? 80 : 0,
          overflow: "hidden",
          opacity: expanded ? 1 : 0,
          transition: "max-height .3s ease, opacity .2s ease",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {m.note}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: expanded ? 6 : 0, transition: "margin .2s ease" }}>
        <ExpandHint expanded={expanded} pinned={pinned} color={m.primary ? "var(--mint)" : "var(--t3)"} />
      </div>
    </div>
  )
}

function ValuationSection({ data, prose }: { data: ReportData; prose?: string }) {
  const { valuation } = data
  const maxK = Math.max(...valuation.methods.map((m) => m.hi), valuation.hi) * 1.15

  return (
    <section style={{ marginBottom: 20 }}>
      <div className="glass-r-strong" style={{ padding: "30px 36px", animation: "slideUpLg .8s .1s cubic-bezier(.34,1.1,.64,1) both" }}>
        <SectionLabel num={2} label="Valuation Analysis" />
        <SectionLead>Three valuation lenses, blended into one defensible listing range buyers and lenders will recognize.</SectionLead>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 32, alignItems: "flex-start" }}>
          <div>
            <h2
              style={{
                fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                fontSize: 26,
                fontWeight: 300,
                color: "var(--t1)",
                letterSpacing: "-.5px",
                lineHeight: 1.15,
                marginBottom: 16,
              }}
            >
              Three methods. One blended range.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {valuation.methods.map((m, i) => (
                <MethodBar key={m.name} m={m} maxK={maxK} delay={i * 120} />
              ))}
            </div>
          </div>

          {/* Blended range card */}
          <div className="glass-r" style={{ padding: "22px 24px", position: "relative", overflow: "hidden" }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                color: "var(--mint)",
                marginBottom: 10,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Recommended Listing Range
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 6 }}>
              <span
                style={{
                  fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                  fontSize: 40,
                  fontWeight: 300,
                  color: "var(--t1)",
                  letterSpacing: "-1.5px",
                  lineHeight: 1,
                }}
              >
                {fmtMoney(valuation.lo)}
              </span>
              <span style={{ fontSize: 16, color: "var(--t3)" }}>–</span>
              <span
                style={{
                  fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                  fontSize: 40,
                  fontWeight: 300,
                  color: "var(--t1)",
                  letterSpacing: "-1.5px",
                  lineHeight: 1,
                }}
              >
                {fmtMoney(valuation.hi)}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 16, fontFamily: "Inter, sans-serif" }}>
              Midpoint <span style={{ color: "var(--mint)", fontWeight: 600 }}>{fmtMoney(valuation.mid)}</span>
            </div>
            <div style={{ height: 1, background: "var(--div)", margin: "0 0 14px" }} />
            <div
              style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.65, marginBottom: 10, fontFamily: "Inter, sans-serif" }}
            >
              The spread is driven by three variables you can move:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                { v: "Owner dependency", drag: "Compresses to low ×" },
                { v: "Documentation completeness", drag: "Discounts multiple" },
                { v: "Lease position", drag: "Hard haircut at table" },
              ].map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 11,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <span style={{ color: "var(--t2)" }}>{r.v}</span>
                  <span style={{ color: "var(--peach)", fontWeight: 500 }}>{r.drag}</span>
                </div>
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                top: -24,
                right: -24,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "radial-gradient(circle, var(--mint-soft) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
        <NarrativeProse prose={prose} />
      </div>
    </section>
  )
}

// ── §03 SBA ───────────────────────────────────────────────────────────────────

function SBAStatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="glass-r" style={{ padding: "13px 15px" }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "1.1px",
          textTransform: "uppercase",
          color: "var(--t3)",
          marginBottom: 5,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
          fontSize: 22,
          fontWeight: 300,
          color: accent,
          letterSpacing: "-.4px",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4, fontFamily: "Inter, sans-serif" }}>{sub}</div>
    </div>
  )
}

function SBASection({ data, prose }: { data: ReportData; prose?: string }) {
  const { sba } = data
  if (!sba.eligible) return null

  return (
    <section style={{ marginBottom: 20 }}>
      <div
        className="glass-r-strong"
        style={{ padding: "30px 36px", position: "relative", overflow: "hidden", animation: "slideUpLg .8s .15s cubic-bezier(.34,1.1,.64,1) both" }}
      >
        <SectionLabel num={3} label="SBA 7(a) Eligibility" />
        <SectionLead>Whether a financing-eligible buyer can write the equity check needed to close this deal.</SectionLead>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 36, alignItems: "center" }}>
          {/* Approval stamp */}
          <div style={{ position: "relative", width: 180, height: 180, flexShrink: 0 }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "3px double var(--mint)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "rotate(-8deg)",
                boxShadow: "0 0 0 4px var(--page-bg), 0 0 0 5px var(--mint-soft), 0 0 20px var(--mint-soft)",
                animation: "glow 3s ease-in-out infinite",
              }}
            >
              <div style={{ textAlign: "center", transform: "rotate(8deg)" }}>
                <div
                  style={{
                    fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                    fontSize: 38,
                    fontWeight: 400,
                    color: "var(--mint)",
                    letterSpacing: "-.5px",
                    lineHeight: 0.95,
                  }}
                >
                  SBA
                </div>
                <div
                  style={{
                    fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                    fontSize: 32,
                    fontWeight: 300,
                    fontStyle: "italic",
                    color: "var(--mint)",
                    letterSpacing: "-.5px",
                    lineHeight: 1,
                    marginTop: -2,
                  }}
                >
                  Eligible
                </div>
                <div
                  style={{
                    marginTop: 5,
                    paddingTop: 5,
                    borderTop: "1px solid var(--mint-edge)",
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: "1.4px",
                    textTransform: "uppercase",
                    color: "var(--mint)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  7(a) · Bankable
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div>
            <h2
              style={{
                fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                fontSize: 26,
                fontWeight: 300,
                color: "var(--t1)",
                letterSpacing: "-.5px",
                lineHeight: 1.18,
                marginBottom: 12,
              }}
            >
              A qualified buyer can close this with{" "}
              <span style={{ color: "var(--mint)" }}>{fmtMoney(sba.downPayment)}</span> down.
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--t3)",
                lineHeight: 1.65,
                marginBottom: 16,
                maxWidth: 560,
                fontFamily: "Inter, sans-serif",
              }}
            >
              SBA 7(a) eligibility opens your buyer pool to individual operators who can't write a large equity check.
              With a {sba.dscr}× DSCR, this passes lender underwriting today.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <SBAStatCard
                label="Down payment"
                value={fmtMoney(sba.downPayment)}
                sub={`${Math.round((sba.downPayment / sba.loan) * 100)}% of loan`}
                accent="var(--mint)"
              />
              <SBAStatCard
                label="Monthly payment"
                value={`${fmtMoney(sba.monthlyPayment)}/mo`}
                sub={`${sba.term}yr · ${sba.apr}% APR`}
                accent="var(--t1)"
              />
              <SBAStatCard
                label="DSCR"
                value={`${sba.dscr}×`}
                sub={`Floor ${sba.dscrFloor}× — well above`}
                accent="var(--mint)"
              />
              <SBAStatCard label="Loan amount" value={fmtMoney(sba.loan)} sub="Underwritable today" accent="var(--t1)" />
            </div>
          </div>
        </div>
        <NarrativeProse prose={prose} />
        <div
          style={{
            position: "absolute",
            bottom: -50,
            left: -50,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--mint-soft) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      </div>
    </section>
  )
}

// ── §04 Transferability ───────────────────────────────────────────────────────

function TransferabilitySection({ data, prose }: { data: ReportData; prose?: string }) {
  const { transferability: t } = data
  const { expanded: hover, pinned, handlers } = useExpandable()
  const shown = hover ? t.target : t.current
  const curV = useSpringNum(shown, 0.07, 0.82)
  const r = 60
  const circ = 2 * Math.PI * r
  const color = curV < 45 ? "var(--crit)" : curV < 65 ? "var(--peach)" : "var(--mint)"

  return (
    <section style={{ marginBottom: 20 }}>
      <div
        {...handlers}
        className="glass-r-strong"
        style={{
          padding: "30px 36px",
          animation: "slideUpLg .8s .2s cubic-bezier(.34,1.1,.64,1) both",
          cursor: "pointer",
          border: pinned ? "1px solid var(--peach-edge)" : undefined,
        }}
      >
        <SectionLabel num={4} label="Transferability Score" accent="var(--peach)" />
        <SectionLead>How easily this business runs without you — the variable buyers discount most aggressively.</SectionLead>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 36, alignItems: "center" }}>
          {/* Gauge + toggle */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", width: 148, height: 148 }}>
              <svg width={148} height={148} viewBox="0 0 148 148">
                <circle cx={74} cy={74} r={r} fill="none" stroke="var(--s1)" strokeWidth={9} />
                <circle
                  cx={74}
                  cy={74}
                  r={r}
                  fill="none"
                  stroke={color}
                  strokeWidth={9}
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={circ * (1 - curV / 100)}
                  transform="rotate(-90 74 74)"
                  style={{
                    transition: "stroke-dashoffset .8s cubic-bezier(.34,1.1,.64,1), stroke .4s ease",
                    filter: `drop-shadow(0 0 6px ${color})`,
                  }}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                    fontSize: 42,
                    fontWeight: 300,
                    color: "var(--t1)",
                    letterSpacing: "-1.5px",
                    lineHeight: 0.9,
                  }}
                >
                  {Math.round(curV)}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                    color: "var(--t3)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  / 100
                </div>
              </div>
            </div>
            {/* Toggle — passive indicator; hover/click target is section-wide */}
            <div
              style={{
                display: "flex",
                background: "var(--s1)",
                borderRadius: 9999,
                padding: 3,
                position: "relative",
                border: "1px solid var(--b2)",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  bottom: 3,
                  width: "calc(50% - 3px)",
                  left: hover ? "50%" : 3,
                  background: "var(--btn-bg)",
                  borderRadius: 9999,
                  transition: "left .35s cubic-bezier(.34,1.1,.64,1)",
                }}
              />
              {["Today", "If you fix it"].map((label, i) => (
                <div
                  key={label}
                  style={{
                    position: "relative",
                    padding: "6px 14px",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: ".4px",
                    color: (i === 0 ? !hover : hover) ? "var(--btn-fg)" : "var(--t3)",
                    transition: "color .25s",
                    fontFamily: "Inter, sans-serif",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: "var(--t4)", textAlign: "center", fontFamily: "Inter, sans-serif" }}>
              {pinned ? "Pinned · click anywhere to release" : "Hover or click to compare — current vs. fixed"}
            </div>
          </div>

          {/* Narrative */}
          <div>
            <h2
              style={{
                fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                fontSize: 24,
                fontWeight: 300,
                color: "var(--t1)",
                letterSpacing: "-.5px",
                lineHeight: 1.18,
                marginBottom: 12,
              }}
            >
              {hover ? (
                <>
                  Above the <span style={{ color: "var(--mint)" }}>60-point threshold</span> — buyer offers shift toward
                  the midpoint and above.
                </>
              ) : (
                <>
                  Your <span style={{ color: "var(--peach)" }}>primary drag</span> on the composite score.
                </>
              )}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--t3)",
                lineHeight: 1.65,
                marginBottom: 16,
                maxWidth: 520,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {hover
                ? `At 60+, buyers stop pricing in transition risk and start paying at or above the multiple midpoint. The move from the low end to the midpoint is a +${fmtMoney(t.dollarImpact * 1000)} swing in enterprise value.`
                : "Owner dependency, undocumented SOPs, and untested staff retention compound. To a buyer's underwriting model, \"not specified\" is treated the same as \"not present.\""}
            </p>
            <div
              style={{
                padding: "12px 16px",
                background: hover ? "var(--mint-soft)" : "var(--peach-soft)",
                borderLeft: `2px solid ${hover ? "var(--mint)" : "var(--peach)"}`,
                borderRadius: 8,
                transition: "all .35s ease",
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: hover ? "var(--mint)" : "var(--peach)",
                  marginBottom: 4,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {hover ? "The fix that gets you there" : "The deliverable that moves the number"}
              </div>
              <div style={{ fontSize: 13, color: "var(--t1)", lineHeight: 1.55, fontFamily: "Inter, sans-serif" }}>
                {t.fix}
              </div>
            </div>
          </div>
        </div>
        <NarrativeProse prose={prose} />
      </div>
    </section>
  )
}

// ── §05/06 Drivers & Detractors ───────────────────────────────────────────────

function DriverCard({ d, delay }: { d: ReportData["drivers"][number]; delay: number }) {
  const { expanded, pinned, handlers } = useExpandable()
  return (
    <div
      {...handlers}
      style={{
        background: expanded ? "var(--mint-soft)" : "var(--glass-bg)",
        border: `1px solid ${expanded ? "var(--mint-edge)" : "var(--glass-edge)"}`,
        borderRadius: 12,
        padding: "13px 15px",
        animation: `slideUp .55s ${delay}ms cubic-bezier(.34,1.2,.64,1) both`,
        transition: "all .25s ease",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: expanded ? 8 : 4,
          transition: "margin .25s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "var(--mint)",
              color: "white",
              fontSize: 10,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {d.rank}
          </div>
          <div
            style={{
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontSize: 16,
              fontWeight: 400,
              color: "var(--t1)",
              letterSpacing: "-.2px",
            }}
          >
            {d.title}
          </div>
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--mint)",
            fontFamily: "'JetBrains Mono', var(--font-jetbrains-mono, monospace)",
            flexShrink: 0,
            marginLeft: 8,
          }}
        >
          {d.impact}
        </div>
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--t3)",
          lineHeight: 1.6,
          maxHeight: expanded ? 160 : 0,
          overflow: "hidden",
          opacity: expanded ? 1 : 0,
          transition: "max-height .35s ease, opacity .25s ease",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {d.detail}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: expanded ? 6 : 0, transition: "margin .2s ease" }}>
        <ExpandHint expanded={expanded} pinned={pinned} color="var(--mint)" />
      </div>
    </div>
  )
}

function DetractorCard({ d, delay }: { d: ReportData["detractors"][number]; delay: number }) {
  const { expanded, pinned, handlers } = useExpandable()
  return (
    <div
      {...handlers}
      style={{
        background: expanded ? "var(--peach-soft)" : "var(--glass-bg)",
        border: `1px solid ${expanded ? "var(--peach-edge)" : "var(--glass-edge)"}`,
        borderRadius: 12,
        padding: "13px 15px",
        animation: `slideUp .55s ${delay}ms cubic-bezier(.34,1.2,.64,1) both`,
        transition: "all .25s ease",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: expanded ? 8 : 4,
          transition: "margin .25s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "var(--peach)",
              color: "white",
              fontSize: 10,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {d.rank}
          </div>
          <div
            style={{
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontSize: 16,
              fontWeight: 400,
              color: "var(--t1)",
              letterSpacing: "-.2px",
            }}
          >
            {d.title}
          </div>
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--peach)",
            fontFamily: "'JetBrains Mono', var(--font-jetbrains-mono, monospace)",
            flexShrink: 0,
            marginLeft: 8,
          }}
        >
          {d.impact}
        </div>
      </div>
      <div
        style={{
          maxHeight: expanded ? 220 : 0,
          overflow: "hidden",
          opacity: expanded ? 1 : 0,
          transition: "max-height .35s ease, opacity .25s ease",
        }}
      >
        <div
          style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.6, marginBottom: 8, fontFamily: "Inter, sans-serif" }}
        >
          {d.detail}
        </div>
        <div
          style={{
            padding: "8px 11px",
            background: "rgba(255,255,255,.5)",
            borderRadius: 8,
            fontSize: 11,
            color: "var(--t2)",
            lineHeight: 1.5,
            fontFamily: "Inter, sans-serif",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--peach)" }}>Fix: </span>
          {d.fix}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: expanded ? 6 : 0, transition: "margin .2s ease" }}>
        <ExpandHint expanded={expanded} pinned={pinned} color="var(--peach)" />
      </div>
    </div>
  )
}

function DriversDetractorsSection({ data, driversP, detractorsP }: { data: ReportData; driversP?: string; detractorsP?: string }) {
  return (
    <section style={{ marginBottom: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div
          className="glass-r-strong"
          style={{ padding: "26px 28px", animation: "slideUpLg .8s .22s cubic-bezier(.34,1.1,.64,1) both", overflow: "hidden" }}
        >
          <SectionLabel num={5} label="Value Drivers" />
          <SectionLead>Strengths a sophisticated buyer will pay up for — make sure they're documented.</SectionLead>
          <h3
            style={{
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontSize: 22,
              fontWeight: 300,
              color: "var(--t1)",
              letterSpacing: "-.4px",
              marginBottom: 16,
            }}
          >
            What's working in your favor.
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {data.drivers.map((d, i) => (
              <DriverCard key={i} d={d} delay={i * 70} />
            ))}
          </div>
          <NarrativeProse prose={driversP} />
        </div>
        <div
          className="glass-r-strong"
          style={{ padding: "26px 28px", animation: "slideUpLg .8s .26s cubic-bezier(.34,1.1,.64,1) both", overflow: "hidden" }}
        >
          <SectionLabel num={6} label="Value Detractors" accent="var(--peach)" />
          <SectionLead>Discounts buyers will insist on at the table — and what to fix before listing.</SectionLead>
          <h3
            style={{
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontSize: 22,
              fontWeight: 300,
              color: "var(--t1)",
              letterSpacing: "-.4px",
              marginBottom: 16,
            }}
          >
            What's costing you money today.
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {data.detractors.map((d, i) => (
              <DetractorCard key={i} d={d} delay={i * 70} />
            ))}
          </div>
          <NarrativeProse prose={detractorsP} />
        </div>
      </div>
    </section>
  )
}

// ── §07 Deal Structure ────────────────────────────────────────────────────────

function DealStructureSection({ data, prose }: { data: ReportData; prose?: string }) {
  const { dealStructure } = data
  return (
    <section style={{ marginBottom: 20 }}>
      <div className="glass-r-strong" style={{ padding: "26px 32px", animation: "slideUpLg .8s .3s cubic-bezier(.34,1.1,.64,1) both" }}>
        <SectionLabel num={7} label="Recommended Deal Structure" accent="var(--lav)" />
        <SectionLead>How this deal should be priced and financed to attract the strongest buyer pool.</SectionLead>
        <h3
          style={{
            fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
            fontSize: 23,
            fontWeight: 300,
            color: "var(--t1)",
            letterSpacing: "-.5px",
            marginBottom: 16,
            maxWidth: 640,
          }}
        >
          A two-layer structure to maximize price <em style={{ color: "var(--lav)" }}>and</em> the number of qualified
          buyers at the table.
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
          {[
            { layer: "Primary", color: "var(--lav)", name: dealStructure.primary.name, detail: dealStructure.primary.detail },
            { layer: "Secondary", color: "var(--sky)", name: dealStructure.secondary.name, detail: dealStructure.secondary.detail },
          ].map((l) => (
            <div
              key={l.layer}
              className="glass-r"
              style={{ padding: "16px 18px", borderLeft: `3px solid ${l.color}` }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  color: l.color,
                  marginBottom: 5,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {l.layer}
              </div>
              <div
                style={{
                  fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                  fontSize: 17,
                  fontWeight: 400,
                  color: "var(--t1)",
                  letterSpacing: "-.3px",
                  marginBottom: 7,
                  lineHeight: 1.25,
                }}
              >
                {l.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.65, fontFamily: "Inter, sans-serif" }}>{l.detail}</div>
            </div>
          ))}
        </div>
        <NarrativeProse prose={prose} />
      </div>
    </section>
  )
}

// ── §08 Growth Levers ─────────────────────────────────────────────────────────

function GrowthSection({ data, prose }: { data: ReportData; prose?: string }) {
  const { growth } = data
  return (
    <section style={{ marginBottom: 20 }}>
      <div className="glass-r-strong" style={{ padding: "26px 32px", animation: "slideUpLg .8s .34s cubic-bezier(.34,1.1,.64,1) both" }}>
        <SectionLabel num={8} label="Growth Levers" accent="var(--sky)" />
        <SectionLead>Upside levers worth documenting for the buyer's underwriting model.</SectionLead>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 28, alignItems: "flex-start" }}>
          <div>
            <h3
              style={{
                fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                fontSize: 22,
                fontWeight: 300,
                color: "var(--t1)",
                letterSpacing: "-.4px",
                lineHeight: 1.2,
                marginBottom: 12,
              }}
            >
              Three angles a buyer can see — but you haven't shown them yet.
            </h3>
            <p style={{ fontSize: 13, color: "var(--t3)", lineHeight: 1.65, fontFamily: "Inter, sans-serif" }}>
              {growth.framed}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {growth.levers.map((l, i) => (
              <div
                key={i}
                className="glass-r"
                style={{
                  padding: "13px 15px",
                  display: "flex",
                  gap: 13,
                  alignItems: "flex-start",
                  animation: `slideUp .5s ${i * 80}ms cubic-bezier(.34,1.2,.64,1) both`,
                }}
              >
                <div
                  style={{
                    fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                    fontSize: 26,
                    fontWeight: 300,
                    color: "var(--sky)",
                    letterSpacing: "-.5px",
                    lineHeight: 1,
                    flexShrink: 0,
                    fontStyle: "italic",
                  }}
                >
                  0{i + 1}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                      fontSize: 17,
                      fontWeight: 400,
                      color: "var(--t1)",
                      letterSpacing: "-.2px",
                      marginBottom: 3,
                    }}
                  >
                    {l.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.55, fontFamily: "Inter, sans-serif" }}>
                    {l.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <NarrativeProse prose={prose} />
      </div>
    </section>
  )
}

// ── §09 Next Steps ────────────────────────────────────────────────────────────

function NextStepCard({ s, delay }: { s: ReportData["nextSteps"][number]; delay: number }) {
  const [hover, setHover] = React.useState(false)
  const isCritical = s.priority === "Critical"
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="glass-r"
      style={{
        padding: "20px 20px 18px",
        position: "relative",
        animation: `slideUp .65s ${delay}ms cubic-bezier(.34,1.2,.64,1) both`,
        transition: "all .25s ease",
        transform: hover ? "translateY(-3px)" : "none",
        boxShadow: hover ? "0 14px 28px rgba(0,0,0,.07)" : undefined,
        borderTop: `3px solid ${isCritical ? "var(--crit)" : "var(--mint)"}`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 14,
          fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
          fontSize: 80,
          fontWeight: 300,
          color: isCritical ? "rgba(196,78,44,.07)" : "rgba(44,140,112,.09)",
          letterSpacing: "-3px",
          lineHeight: 0.85,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        0{s.rank}
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: isCritical ? "var(--crit)" : "var(--mint)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {s.priority}
          </div>
          <div style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--t4)" }} />
          <div
            style={{
              fontSize: 10,
              color: "var(--t3)",
              fontFamily: "'JetBrains Mono', var(--font-jetbrains-mono, monospace)",
            }}
          >
            {s.when}
          </div>
        </div>
        <div
          style={{
            fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
            fontSize: 18,
            fontWeight: 400,
            color: "var(--t1)",
            letterSpacing: "-.3px",
            lineHeight: 1.25,
            marginBottom: 9,
            minHeight: 64,
          }}
        >
          {s.title}
        </div>
        <div
          style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.6, marginBottom: 12, fontFamily: "Inter, sans-serif" }}
        >
          {s.detail}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            paddingTop: 9,
            borderTop: "1px solid var(--div)",
          }}
        >
          <svg width={11} height={11} viewBox="0 0 11 11" fill="none">
            <path
              d="M2 5.5l2.5 2.5L9 3.5"
              stroke={isCritical ? "var(--crit)" : "var(--mint)"}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: isCritical ? "var(--crit)" : "var(--mint)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {s.impact}
          </div>
        </div>
      </div>
    </div>
  )
}

function NextStepsSection({ data, prose }: { data: ReportData; prose?: string }) {
  return (
    <section style={{ marginBottom: 20 }}>
      <div className="glass-r-strong" style={{ padding: "30px 36px", animation: "slideUpLg .8s .38s cubic-bezier(.34,1.1,.64,1) both" }}>
        <SectionLabel num={9} label="Next Steps" />
        <SectionLead>What to do this quarter to land the upper end of the range.</SectionLead>
        <h3
          style={{
            fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
            fontSize: 26,
            fontWeight: 300,
            color: "var(--t1)",
            letterSpacing: "-.5px",
            lineHeight: 1.15,
            marginBottom: 5,
          }}
        >
          Three actions. Execute in this order.
        </h3>
        <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 20, fontFamily: "Inter, sans-serif" }}>
          The clock starts now, not six months from now.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 13 }}>
          {data.nextSteps.map((s, i) => (
            <NextStepCard key={i} s={s} delay={i * 90} />
          ))}
        </div>
        <NarrativeProse prose={prose} />
      </div>
    </section>
  )
}

// ── §10 Boardroom CTA ─────────────────────────────────────────────────────────

function BoardroomPreview({ data }: { data: ReportData }) {
  const steps = data.nextSteps.slice(0, 3)
  const pcts = [0, 0, 0]
  return (
    <div style={{ position: "relative", height: 280 }}>
      <div
        className="glass-r"
        style={{ position: "absolute", top: 0, right: 0, width: "92%", height: "100%", borderRadius: 18, transform: "rotate(2deg)", background: "rgba(255,255,255,.5)" }}
      />
      <div
        className="glass-r-strong"
        style={{ position: "absolute", top: 8, right: 12, width: "92%", height: "100%", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 11 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "1.1px",
                textTransform: "uppercase",
                color: "var(--lav)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Boardroom
            </div>
            <div
              style={{
                fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                fontSize: 16,
                fontWeight: 400,
                color: "var(--t1)",
                letterSpacing: "-.2px",
              }}
            >
              Your exit roadmap
            </div>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {["var(--crit)", "var(--peach)", "var(--mint)"].map((c, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.85 }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                padding: "7px 11px",
                background: "rgba(255,255,255,.55)",
                borderRadius: 9,
                border: "1px solid var(--b3)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--t1)",
                    fontFamily: "Inter, sans-serif",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "70%",
                  }}
                >
                  {step.title.length > 40 ? step.title.slice(0, 40) + "…" : step.title}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: step.priority === "Critical" ? "var(--crit)" : "var(--mint)",
                    letterSpacing: ".4px",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Not started
                </div>
              </div>
              <div style={{ height: 3, background: "var(--s1)", borderRadius: 9999, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${pcts[i]}%`,
                    height: "100%",
                    background: step.priority === "Critical" ? "var(--crit)" : "var(--mint)",
                    borderRadius: 9999,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: "auto",
            paddingTop: 9,
            borderTop: "1px solid var(--div)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 10,
            fontFamily: "Inter, sans-serif",
          }}
        >
          <span style={{ color: "var(--t3)" }}>Composite score</span>
          <span style={{ fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)", fontSize: 15, color: "var(--t1)" }}>
            {data.score.composite} →{" "}
            <span style={{ color: "var(--mint)" }}>
              {Math.min(data.score.composite + 18, 90)}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

function BoardroomCTACard({ data }: { data: ReportData }) {
  return (
    <section style={{ marginBottom: 20 }}>
      <div
        className="glass-r-strong"
        style={{
          padding: "36px 40px",
          position: "relative",
          overflow: "hidden",
          animation: "slideUpLg .8s .42s cubic-bezier(.34,1.1,.64,1) both",
          background: "linear-gradient(135deg, rgba(255,255,255,.82), rgba(230,224,212,.62))",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -70,
            right: -70,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(184,140,210,.28) 0%, transparent 65%)",
            filter: "blur(18px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -50,
            left: -30,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(120,180,210,.24) 0%, transparent 65%)",
            filter: "blur(16px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 32,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "5px 13px",
                background: "var(--lav-soft)",
                border: "1px solid var(--lav-edge)",
                borderRadius: 9999,
                marginBottom: 14,
              }}
            >
              <div
                style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--lav)", boxShadow: "0 0 6px var(--lav)" }}
              />
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "1.1px",
                  textTransform: "uppercase",
                  color: "var(--lav)",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Next: Scorta Boardroom
              </div>
            </div>
            <h2
              style={{
                fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                fontSize: 34,
                fontWeight: 300,
                color: "var(--t1)",
                letterSpacing: "-.8px",
                lineHeight: 1.1,
                marginBottom: 12,
              }}
            >
              Save this report. Start preparing for your exit.
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--t2)",
                lineHeight: 1.65,
                marginBottom: 20,
                maxWidth: 500,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Authorize with Scorta to save and download this report as a PDF, then continue into{" "}
              <strong style={{ color: "var(--lav)" }}>Boardroom</strong> — your AI-guided workspace for executing the 3
              next steps, organizing financials, and modeling buyer scenarios.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22 }}>
              {[
                "Download this report as a polished PDF",
                "Track the 3 next steps with milestones + reminders",
                "Re-run your valuation as you make improvements",
                "Connect financial docs for live SDE normalization",
              ].map((l, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    fontSize: 13,
                    color: "var(--t2)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <svg width={13} height={13} viewBox="0 0 13 13" fill="none">
                    <circle cx={6.5} cy={6.5} r={6} fill="var(--lav-soft)" />
                    <path d="M4 6.5l2 2 3.5-3.5" stroke="var(--lav)" strokeWidth={1.3} fill="none" strokeLinecap="round" />
                  </svg>
                  {l}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={() => alert("Boardroom coming soon — this will link to your Scorta account.")}
                className="no-print"
                style={{
                  height: 48,
                  padding: "0 24px",
                  background: "var(--btn-bg)",
                  color: "var(--btn-fg)",
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "-.1px",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  fontFamily: "Inter, sans-serif",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 6px 22px rgba(12,10,9,.18)",
                  transition: "transform .2s ease, box-shadow .2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)"
                  e.currentTarget.style.boxShadow = "0 10px 28px rgba(12,10,9,.22)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none"
                  e.currentTarget.style.boxShadow = "0 6px 22px rgba(12,10,9,.18)"
                }}
              >
                Authorize & continue to Boardroom
                <span>→</span>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(105deg,transparent 35%,rgba(255,255,255,.18) 50%,transparent 65%)",
                    animation: "shimmer 3.2s ease-in-out infinite",
                    pointerEvents: "none",
                  }}
                />
              </button>
              <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "Inter, sans-serif" }}>
                Free during private beta
              </div>
            </div>
          </div>
          <BoardroomPreview data={data} />
        </div>
      </div>
    </section>
  )
}

// ── Sticky CTA ────────────────────────────────────────────────────────────────

function StickyCTA() {
  const [visible, setVisible] = React.useState(false)
  const sentinelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const obs = new IntersectionObserver(([entry]) => { if (entry) setVisible(!entry.isIntersecting) }, { threshold: 0 })
    obs.observe(sentinel)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinelRef} style={{ height: 1 }} />
      <div
        className="no-print"
        style={{
          position: "fixed",
          bottom: visible ? 18 : -100,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 90,
          transition: "bottom .45s cubic-bezier(.34,1.1,.64,1)",
          width: "min(680px, calc(100% - 40px))",
        }}
      >
        <div
          className="glass-r-strong"
          style={{
            padding: "11px 13px 11px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            borderRadius: 9999,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--mint)",
                boxShadow: "0 0 8px var(--mint)",
                animation: "liveBlink 2s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--t1)",
                  fontFamily: "Inter, sans-serif",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Save this report & continue to Boardroom
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--t3)",
                  fontFamily: "Inter, sans-serif",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Track your 3 next steps · re-run valuation as you improve
              </div>
            </div>
          </div>
          <button
            onClick={() => alert("Boardroom coming soon.")}
            style={{
              height: 36,
              padding: "0 16px",
              background: "var(--btn-bg)",
              color: "var(--btn-fg)",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 9999,
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontFamily: "Inter, sans-serif",
              flexShrink: 0,
            }}
          >
            Authorize <span>→</span>
          </button>
        </div>
      </div>
    </>
  )
}

// ── Top bar ───────────────────────────────────────────────────────────────────

function ReportTopBar({ name: _name, generated }: { name: string; generated: string }) {
  return (
    <nav
      className="no-print"
      style={{
        position: "sticky",
        top: 14,
        zIndex: 80,
        margin: "14px 24px 0",
      }}
    >
      <div
        className="glass-r-strong"
        style={{
          padding: "0 20px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 9999,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontSize: 19,
              fontWeight: 400,
              color: "var(--t1)",
              letterSpacing: "-.3px",
            }}
          >
            Scorta
          </div>
          <div style={{ width: 1, height: 13, background: "var(--b2)" }} />
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--mint)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            ExitIQ Report
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--t3)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--mint)",
                animation: "liveBlink 2s ease-in-out infinite",
              }}
            />
            Live · {generated}
          </div>
        </div>
      </div>
    </nav>
  )
}

// ── Root FullReportVisual ─────────────────────────────────────────────────────

export function FullReportVisual({
  data,
  reportMd,
  sessionId,
}: {
  data: ReportData
  reportMd?: string
  sessionId?: string
}) {
  const prose = React.useMemo(() => parseNarrativeSections(reportMd ?? ""), [reportMd])

  // Fires once on mount — confirms the report page reached the client with data
  React.useEffect(() => {
    workflowTraceClient({
      phase: "client.report_page_mounted",
      sessionId,
      origin: "FullReportVisual",
      detail: {
        hasReportMd: !!reportMd && reportMd.length > 0,
        reportMdChars: (reportMd ?? "").length,
        visualComposite: data.score.composite,
        grade: data.score.grade,
        industry: data.meta.industry,
        valuationK: { lo: data.valuation.lo, mid: data.valuation.mid, hi: data.valuation.hi },
        sbaEligible: data.sba.eligible,
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]) // mount only

  // Fires when narrative parsing completes — confirms LLM sections mapped to visual cards
  React.useEffect(() => {
    const keys = Object.keys(prose)
    const CANONICAL = [
      "Executive Summary", "Valuation Analysis", "SBA 7(a) Eligibility",
      "Transferability Score", "Value Drivers", "Value Detractors",
      "Recommended Deal Structure", "Growth Levers", "Next Steps",
    ]
    workflowTraceClient({
      phase: "client.full_report_visual_parsed_narrative",
      sessionId,
      origin: "FullReportVisual",
      detail: {
        reportMdChars: (reportMd ?? "").length,
        isEmpty: (reportMd ?? "").length === 0,
        parsedSectionCount: keys.length,
        expectedSections: 9,
        sectionCountOk: keys.length === 9,
        parsedSectionTitles: keys,
        missingSections: CANONICAL.filter((s) => !keys.includes(s)),
        extraSections: keys.filter((s) => !CANONICAL.includes(s)),
        // Per-section: present = has prose, absent = will show "Analysis not available"
        sectionProseStatus: Object.fromEntries(
          CANONICAL.map((s) => [s, (prose[s]?.length ?? 0) > 0 ? "present" : "absent"])
        ),
        charsPerSection: Object.fromEntries(keys.map((k) => [k, prose[k]?.length ?? 0])),
        visualComposite: data.score.composite,
      },
    })
  }, [reportMd, prose, sessionId, data.score.composite])
  return (
    <div data-theme="cream" style={{ background: "var(--page-bg)", minHeight: "100vh" }}>
      <ReportTopBar name={data.meta.name} generated={data.meta.generated} />

      <main style={{ padding: "20px 24px 100px", maxWidth: 1280, margin: "0 auto" }}>
        <HeroScorecard data={data} prose={prose["Executive Summary"]} />
        <ValuationSection data={data} prose={prose["Valuation Analysis"]} />
        {data.sba.eligible && <SBASection data={data} prose={prose["SBA 7(a) Eligibility"]} />}
        <TransferabilitySection data={data} prose={prose["Transferability Score"]} />
        <DriversDetractorsSection data={data} driversP={prose["Value Drivers"]} detractorsP={prose["Value Detractors"]} />
        <DealStructureSection data={data} prose={prose["Recommended Deal Structure"]} />
        <GrowthSection data={data} prose={prose["Growth Levers"]} />
        <NextStepsSection data={data} prose={prose["Next Steps"]} />
        <BoardroomCTACard data={data} />

        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid var(--div)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 11,
            color: "var(--t3)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <div>Scorta · ExitIQ Report · For informational purposes only. Not financial or legal advice.</div>
          <div
            style={{ fontFamily: "'JetBrains Mono', var(--font-jetbrains-mono, monospace)", fontSize: 10 }}
          >
            scorta.exitiq · v1.0
          </div>
        </div>
      </main>

      <StickyCTA />
    </div>
  )
}
