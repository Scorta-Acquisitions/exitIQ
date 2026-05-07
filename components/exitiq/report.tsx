// use client: animates skeleton states and renders streaming markdown
"use client"

import React from "react"
import { ScanLine } from "./ui"

// ── Inline markdown: **bold** and *italic* ────────────────────────────────────
function inlineMd(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ color: "var(--t1)", fontWeight: 600 }}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return (
        <em key={i} style={{ color: "var(--t4)", fontStyle: "italic" }}>
          {part.slice(1, -1)}
        </em>
      )
    }
    return part
  })
}

// ── Block markdown renderer ───────────────────────────────────────────────────
// Handles the exact structure emitted by buildReportPrompt:
//   # H1, ## H2, - bullet, 1. numbered, ---, *footer*, **bold** inline
function renderMarkdown(md: string): React.ReactNode {
  const lines = md.split("\n")
  const nodes: React.ReactNode[] = []
  let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null
  let key = 0
  const k = () => String(key++)

  const flushList = () => {
    if (!listBuffer) return
    const { type, items } = listBuffer
    const isOl = type === "ol"
    nodes.push(
      isOl ? (
        <ol
          key={k()}
          style={{
            margin: "4px 0 12px 0",
            paddingLeft: 22,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {items.map((item, j) => (
            <li
              key={j}
              style={{
                fontSize: 13.5,
                color: "var(--t3)",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.7,
              }}
            >
              {inlineMd(item)}
            </li>
          ))}
        </ol>
      ) : (
        <ul
          key={k()}
          style={{
            margin: "4px 0 12px 0",
            paddingLeft: 18,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {items.map((item, j) => (
            <li
              key={j}
              style={{
                fontSize: 13.5,
                color: "var(--t3)",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.65,
              }}
            >
              {inlineMd(item)}
            </li>
          ))}
        </ul>
      )
    )
    listBuffer = null
  }

  for (const line of lines) {
    if (line.startsWith("# ")) {
      flushList()
      nodes.push(
        <h1
          key={k()}
          style={{
            fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
            fontSize: "clamp(22px, 2.6vw, 30px)",
            fontWeight: 300,
            color: "var(--t1)",
            letterSpacing: "-0.4px",
            lineHeight: 1.2,
            margin: "0 0 4px",
          }}
        >
          {line.slice(2)}
        </h1>
      )
    } else if (line.startsWith("## ")) {
      flushList()
      nodes.push(
        <h2
          key={k()}
          style={{
            fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
            fontSize: 18,
            fontWeight: 300,
            color: "var(--t1)",
            letterSpacing: "-0.15px",
            lineHeight: 1.3,
            margin: "22px 0 8px",
            paddingBottom: 8,
            borderBottom: "1px solid var(--b3)",
          }}
        >
          {line.slice(3)}
        </h2>
      )
    } else if (line === "---") {
      flushList()
      nodes.push(<div key={k()} style={{ height: 1, background: "var(--b3)", margin: "20px 0 12px" }} />)
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      if (!listBuffer || listBuffer.type !== "ul") {
        flushList()
        listBuffer = { type: "ul", items: [] }
      }
      listBuffer.items.push(line.slice(2))
    } else if (/^\d+\. /.test(line)) {
      if (!listBuffer || listBuffer.type !== "ol") {
        flushList()
        listBuffer = { type: "ol", items: [] }
      }
      listBuffer.items.push(line.replace(/^\d+\. /, ""))
    } else if (line.trim() === "") {
      flushList()
    } else {
      flushList()
      nodes.push(
        <p
          key={k()}
          style={{
            fontSize: 13.5,
            color: "var(--t3)",
            lineHeight: 1.72,
            fontFamily: "Inter, sans-serif",
            margin: "0 0 8px",
          }}
        >
          {inlineMd(line)}
        </p>
      )
    }
  }

  flushList()
  return <>{nodes}</>
}

// ── ReportGeneratingCard ──────────────────────────────────────────────────────
export function ReportGeneratingCard() {
  const skeletonSections = [
    "Executive Summary",
    "Valuation Analysis",
    "SBA Eligibility",
    "Deal Structure Recommendation",
    "Next Steps",
  ]

  return (
    <div
      className="glass-panel"
      style={{
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        animation: "slideUp .7s cubic-bezier(.34,1.1,.64,1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <ScanLine speed={3} />

      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 10px rgba(16,185,129,.9)",
              animation: "liveBlink 2s infinite",
            }}
          />
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".96px",
              textTransform: "uppercase",
              color: "rgba(16,185,129,.8)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Generating Full Report
          </div>
        </div>
        <h2
          style={{
            fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
            fontSize: 24,
            fontWeight: 300,
            color: "var(--t1)",
            letterSpacing: "-.3px",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          Running your full AI analysis…
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--t3)",
            marginTop: 8,
            lineHeight: 1.65,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Our senior advisor AI is reviewing your profile across valuation methodology, SBA eligibility, deal structure,
          transferability, and buyer risk. Typically takes 20–40 seconds.
        </p>
      </div>

      {/* Skeleton sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {skeletonSections.map((label, i) => (
          <div
            key={i}
            style={{
              borderRadius: 10,
              background: "var(--s2)",
              border: "1px solid var(--b3)",
              padding: "14px 16px",
              animation: `slideUp .5s ${i * 70}ms cubic-bezier(.34,1.2,.64,1) both`,
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: ".8px",
                textTransform: "uppercase",
                color: "var(--t5)",
                fontFamily: "Inter, sans-serif",
                marginBottom: 10,
              }}
            >
              {label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {[95, 80, 55].map((w, j) => (
                <div
                  key={j}
                  style={{
                    height: 10,
                    borderRadius: 5,
                    width: `${w}%`,
                    background: "var(--b3)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(90deg,transparent 0%,rgba(167,229,211,.15) 50%,transparent 100%)",
                      animation: "shimmer 2s ease-in-out infinite",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── FullReportCard ────────────────────────────────────────────────────────────
export function FullReportCard({ reportMd, firstName }: { reportMd: string; firstName?: string }) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        animation: "slideUp .7s cubic-bezier(.34,1.1,.64,1)",
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
          paddingBottom: 14,
          borderBottom: "1px solid var(--b3)",
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#10b981",
            boxShadow: "0 0 10px rgba(16,185,129,.9)",
            animation: "liveBlink 2s infinite",
          }}
        />
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".96px",
            textTransform: "uppercase",
            color: "rgba(16,185,129,.8)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Full Exit IQ Report{firstName ? ` — ${firstName}` : ""}
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontSize: 10,
            color: "var(--t5)",
            fontFamily: "Inter, sans-serif",
            background: "var(--s2)",
            border: "1px solid var(--b3)",
            borderRadius: 9999,
            padding: "2px 8px",
          }}
        >
          AI · Sonnet
        </div>
      </div>

      {/* Rendered report */}
      <div style={{ display: "flex", flexDirection: "column" }}>{renderMarkdown(reportMd)}</div>

      {/* Legal footer */}
      <div
        style={{
          marginTop: 20,
          padding: "14px 16px",
          background: "var(--s2)",
          border: "1px solid var(--b3)",
          borderRadius: 10,
          fontSize: 11,
          color: "var(--t5)",
          fontFamily: "Inter, sans-serif",
          lineHeight: 1.55,
        }}
      >
        For informational purposes only. Not financial or legal advice. Figures are estimates based on market benchmarks
        and the information you provided.
      </div>
    </div>
  )
}
