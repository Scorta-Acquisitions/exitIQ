"use client"

/**
 * The dashboard's "start a new deal" surface — the two ways a deal enters DealIQ.
 *
 * Rendered two ways by the pipeline board: `variant="full"` is the greeting when
 * the pipeline is empty (the whole dashboard is this choice), `variant="compact"`
 * is the strip above the board once deals exist. Both offer the same two paths:
 * import a deal you already have (→ the Deal Inbox at `/dealiq/screen`) or
 * search the verified seller network (→ Certified Deal Flow at `/dealiq/flow`).
 *
 * All copy comes from `NEW_DEAL_COPY`; nothing here is content. Presentation
 * matches the board — inline styles over the shared CSS-var tokens.
 */

import Link from "next/link"
import React from "react"

import { NEW_DEAL_COPY } from "@/lib/dealiq/data/copy"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

type NewDealPath = {
  href: string
  title: string
  body: string
  cta: string
  icon: React.ReactNode
}

function newDealPaths(): ReadonlyArray<NewDealPath> {
  return [
    {
      href: "/dealiq/screen",
      title: NEW_DEAL_COPY.paths.import.title,
      body: NEW_DEAL_COPY.paths.import.body,
      cta: NEW_DEAL_COPY.paths.import.cta,
      icon: <ImportIcon />,
    },
    {
      href: "/dealiq/flow",
      title: NEW_DEAL_COPY.paths.network.title,
      body: NEW_DEAL_COPY.paths.network.body,
      cta: NEW_DEAL_COPY.paths.network.cta,
      icon: <NetworkIcon />,
    },
  ]
}

export function NewDealSection({ variant }: { variant: "full" | "compact" }) {
  if (variant === "compact") {
    return (
      <section aria-label={NEW_DEAL_COPY.stripTitle} style={{ fontFamily: inter }}>
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 2,
              minWidth: 128,
              padding: "0 4px",
            }}
          >
            <span
              style={{
                fontFamily: mono,
                fontSize: 9,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--t3)",
              }}
            >
              {NEW_DEAL_COPY.eyebrow}
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--t1)" }}>{NEW_DEAL_COPY.stripTitle}</span>
          </div>
          {newDealPaths().map((path) => (
            <PathCard key={path.href} path={path} compact />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section
      aria-label={NEW_DEAL_COPY.emptyTitle}
      style={{
        fontFamily: inter,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontFamily: mono,
          fontSize: 9.5,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "var(--t3)",
        }}
      >
        {NEW_DEAL_COPY.eyebrow}
      </span>
      <h1
        style={{
          margin: "6px 0 0",
          fontFamily: garamond,
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: "-.3px",
          color: "var(--t1)",
        }}
      >
        {NEW_DEAL_COPY.emptyTitle}
      </h1>
      <p style={{ margin: "10px 0 24px", fontSize: 13, color: "var(--t2)", maxWidth: 460, lineHeight: 1.55 }}>
        {NEW_DEAL_COPY.emptyBody}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 14,
          width: "100%",
          maxWidth: 640,
          textAlign: "left",
        }}
      >
        {newDealPaths().map((path) => (
          <PathCard key={path.href} path={path} />
        ))}
      </div>
    </section>
  )
}

function PathCard({ path, compact }: { path: NewDealPath; compact?: boolean }) {
  return (
    <Link
      href={path.href}
      className="dq-card dq-focus"
      style={{
        flex: compact ? 1 : undefined,
        minWidth: compact ? 220 : undefined,
        display: "flex",
        alignItems: compact ? "center" : "flex-start",
        flexDirection: compact ? "row" : "column",
        gap: compact ? 11 : 12,
        padding: compact ? "11px 14px" : "18px 18px 16px",
        borderRadius: compact ? 12 : 14,
        border: "1px solid var(--glass-border)",
        background: "var(--glass-bg)",
        boxShadow: compact ? "0 1px 3px rgba(20,15,8,.05)" : "var(--glass-shadow)",
        textDecoration: "none",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: compact ? 30 : 36,
          height: compact ? 30 : 36,
          borderRadius: 10,
          color: "var(--dq-accent)",
          background: "var(--dq-accent-soft)",
          border: "1px solid var(--dq-accent-edge)",
          flexShrink: 0,
        }}
      >
        {path.icon}
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: compact ? 1 : 5, minWidth: 0 }}>
        <span style={{ fontSize: compact ? 12.5 : 14, fontWeight: 600, color: "var(--t1)", lineHeight: 1.3 }}>
          {path.title}
        </span>
        {compact ? null : <span style={{ fontSize: 11.5, color: "var(--t2)", lineHeight: 1.5 }}>{path.body}</span>}
        <span
          style={{
            marginTop: compact ? 0 : 6,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontFamily: mono,
            fontSize: compact ? 10 : 10.5,
            letterSpacing: ".04em",
            color: "var(--dq-accent)",
          }}
        >
          {path.cta}
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M3 8h9.5M9 4.5 12.5 8 9 11.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
    </Link>
  )
}

function ImportIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5v8m0 0L4.8 6.3M8 9.5l3.2-3.2M2.5 11v1.8c0 .9.8 1.7 1.7 1.7h7.6c.9 0 1.7-.8 1.7-1.7V11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NetworkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="m10.4 10.4 3.1 3.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 4.9v4.2M4.9 7h4.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity=".55" />
    </svg>
  )
}
