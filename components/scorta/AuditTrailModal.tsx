"use client"

import Link from "next/link"
import React from "react"

import {
  AUDIT_TRAIL,
  type AuditEntry,
  RECAST_THINKING_ENTRY_ID,
  RECAST_THINKING_FLAG,
} from "@/lib/auditTrail"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

export function AuditTrailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Lock body scroll while open + ESC to close.
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Permanent audit trail"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(12,10,9,.52)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "5vh 24px",
        animation: "auditFadeIn 200ms ease-out",
      }}
    >
      <ScopedStyles />
      <section
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 760,
          maxHeight: "90vh",
          background: "#faf9f7",
          borderRadius: 20,
          boxShadow: "0 28px 70px rgba(12,10,9,.40), 0 1px 0 rgba(255,255,255,.7) inset",
          border: "1px solid rgba(12,10,9,.10)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "auditSlideUp 280ms ease-out",
        }}
      >
        <Header onClose={onClose} entryCount={AUDIT_TRAIL.length} />
        <Body />
        <Footer />
      </section>
    </div>
  )
}

function useRecastFreshlyLogged(): boolean {
  const [fresh, setFresh] = React.useState(false)
  React.useEffect(() => {
    try {
      setFresh(sessionStorage.getItem(RECAST_THINKING_FLAG) === "1")
    } catch {
      // sessionStorage may be unavailable; treat as not-fresh.
    }
  }, [])
  return fresh
}

// ── Header ────────────────────────────────────────────────────────────────
function Header({ onClose, entryCount }: { onClose: () => void; entryCount: number }) {
  return (
    <header
      style={{
        flexShrink: 0,
        padding: "20px 24px 16px",
        background: "rgba(12,10,9,.94)",
        color: "rgba(245,245,245,.96)",
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10,
            color: "var(--mint, #2c8c70)",
            fontWeight: 700,
            letterSpacing: ".8px",
            textTransform: "uppercase",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--mint, #2c8c70)",
              boxShadow: "0 0 6px var(--mint, #2c8c70)",
              animation: "auditDot 1.6s ease-in-out infinite",
            }}
          />
          Permanent audit trail · cryptographically signed
        </div>
        <h2
          style={{
            fontFamily: garamond,
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: "-.3px",
            color: "rgba(245,245,245,.96)",
            lineHeight: 1.15,
          }}
        >
          Everything the agent fleet has done on your deal.
        </h2>
        <div
          style={{
            marginTop: 7,
            fontSize: 12.5,
            color: "rgba(245,245,245,.65)",
            fontFamily: inter,
            lineHeight: 1.5,
          }}
        >
          {entryCount} actions logged · newest first · every entry attributed to a named agent
          with the inputs it consulted, what it produced, and the reasoning behind the call.
        </div>
      </div>
      <button
        type="button"
        aria-label="Close audit trail"
        onClick={onClose}
        className="audit-close"
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,.14)",
          background: "rgba(255,255,255,.06)",
          color: "rgba(245,245,245,.92)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 180ms ease-out, border-color 180ms ease-out",
        }}
      >
        <svg width={13} height={13} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 2l8 8M10 2l-8 8" />
        </svg>
      </button>
    </header>
  )
}

// ── Body ──────────────────────────────────────────────────────────────────
function Body() {
  const recastFresh = useRecastFreshlyLogged()

  // Group entries by date so the timeline reads as days, not a flat list.
  // Newest entry first — reverse the source array, then reverse each day's
  // bucket so within-day order is also newest-first.
  const grouped = React.useMemo(() => {
    const groups: Array<{ date: string; entries: Array<AuditEntry> }> = []
    for (const entry of [...AUDIT_TRAIL].reverse()) {
      const last = groups[groups.length - 1]
      if (last && last.date === entry.dateLabel) {
        last.entries.push(entry)
      } else {
        groups.push({ date: entry.dateLabel, entries: [entry] })
      }
    }
    return groups
  }, [])

  return (
    <div
      className="audit-scroll"
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        background: "#faf9f7",
        padding: "20px 24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      {grouped.map((group, gi) => (
        <DayGroup
          key={group.date}
          date={group.date}
          entries={group.entries}
          isLatestGroup={gi === 0}
          recastFresh={recastFresh}
        />
      ))}
    </div>
  )
}

function DayGroup({
  date,
  entries,
  isLatestGroup,
  recastFresh,
}: {
  date: string
  entries: ReadonlyArray<AuditEntry>
  isLatestGroup: boolean
  recastFresh: boolean
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "sticky",
          top: -20,
          zIndex: 1,
          padding: "8px 0",
          background:
            "linear-gradient(180deg, #faf9f7 75%, rgba(250,249,247,0) 100%)",
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "var(--t3, rgba(12,10,9,.42))",
            fontWeight: 700,
            letterSpacing: ".9px",
            textTransform: "uppercase",
          }}
        >
          {date}
        </div>
        <div style={{ flex: 1, height: 1, background: "var(--div, rgba(12,10,9,.07))" }} />
        <div
          style={{
            fontFamily: mono,
            fontSize: 10,
            color: "var(--t3, rgba(12,10,9,.42))",
            letterSpacing: ".5px",
          }}
        >
          {entries.length} {entries.length === 1 ? "action" : "actions"}
        </div>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.map((entry, ei) => {
          const isFreshRecast =
            recastFresh && entry.id === RECAST_THINKING_ENTRY_ID
          const defaultExpanded = isFreshRecast || (isLatestGroup && ei === 0)
          return (
            <li key={entry.id}>
              <EntryCard
                entry={entry}
                defaultExpanded={defaultExpanded}
                freshlyLogged={isFreshRecast}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function EntryCard({
  entry,
  defaultExpanded,
  freshlyLogged,
}: {
  entry: AuditEntry
  defaultExpanded: boolean
  freshlyLogged: boolean
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  const accent = accentColor(entry.agentAccent)
  const severityTone = entry.severity === "flag"
    ? { color: "var(--crit, #c44e2c)", label: "Flag" }
    : entry.severity === "review"
      ? { color: "var(--peach, #b86a3e)", label: "Needs review" }
      : null

  return (
    <article
      style={{
        padding: "13px 14px 13px 16px",
        borderRadius: 12,
        background: "#ffffff",
        border: `1px solid ${freshlyLogged ? "var(--mint-edge, rgba(44,140,112,.32))" : "var(--glass-edge, rgba(0,0,0,.07))"}`,
        boxShadow: freshlyLogged
          ? "0 8px 24px rgba(44,140,112,.14), 0 1px 0 rgba(255,255,255,.6) inset"
          : "0 4px 14px rgba(20,15,8,.04)",
        display: "flex",
        gap: 12,
      }}
    >
      <div
        aria-hidden
        style={{
          flexShrink: 0,
          width: 3,
          alignSelf: "stretch",
          borderRadius: 2,
          background: accent,
        }}
      />
      <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "inline-flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: accent,
                fontWeight: 700,
                letterSpacing: ".6px",
                textTransform: "uppercase",
              }}
            >
              {entry.agent}
            </span>
            {freshlyLogged && (
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 9,
                  color: "var(--mint, #2c8c70)",
                  fontWeight: 700,
                  letterSpacing: ".7px",
                  textTransform: "uppercase",
                  padding: "1px 7px",
                  borderRadius: 9999,
                  background: "rgba(44,140,112,.12)",
                  border: "1px solid var(--mint-edge, rgba(44,140,112,.32))",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
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
                    animation: "auditDot 1.6s ease-in-out infinite",
                  }}
                />
                Just logged
              </span>
            )}
            {severityTone && (
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 9,
                  color: severityTone.color,
                  fontWeight: 700,
                  letterSpacing: ".7px",
                  textTransform: "uppercase",
                  padding: "1px 6px",
                  borderRadius: 9999,
                  background: `color-mix(in srgb, ${severityTone.color} 10%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${severityTone.color} 28%, transparent)`,
                }}
              >
                {severityTone.label}
              </span>
            )}
          </div>
          <span
            style={{
              fontFamily: mono,
              fontSize: 10,
              color: "var(--t3, rgba(12,10,9,.42))",
              letterSpacing: ".4px",
            }}
          >
            {entry.timeLabel}
          </span>
        </header>

        <div
          style={{
            fontFamily: garamond,
            fontSize: 17,
            color: "var(--t1, rgba(12,10,9,.95))",
            letterSpacing: ".05px",
            lineHeight: 1.25,
          }}
        >
          {entry.action}
        </div>

        <div
          style={{
            fontFamily: inter,
            fontSize: 12.5,
            color: "var(--t2, rgba(12,10,9,.62))",
            lineHeight: 1.55,
          }}
        >
          {entry.detail}
        </div>

        {entry.inputs && entry.inputs.length > 0 && (
          <div
            style={{
              padding: "9px 11px",
              borderRadius: 8,
              background: "rgba(12,10,9,.025)",
              border: "1px solid rgba(12,10,9,.05)",
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            <div
              style={{
                fontFamily: mono,
                fontSize: 9.5,
                color: "var(--t3, rgba(12,10,9,.42))",
                fontWeight: 600,
                letterSpacing: ".7px",
                textTransform: "uppercase",
              }}
            >
              Evidence consulted
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 3 }}>
              {entry.inputs.map((input, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: mono,
                    fontSize: 11,
                    color: "var(--t1, rgba(12,10,9,.95))",
                    lineHeight: 1.45,
                    paddingLeft: 12,
                    position: "relative",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 7,
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: accent,
                    }}
                  />
                  {input}
                </li>
              ))}
            </ul>
          </div>
        )}

        {entry.output && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 7,
              fontFamily: mono,
              fontSize: 11,
              color: accent,
              lineHeight: 1.45,
            }}
          >
            <span aria-hidden style={{ flexShrink: 0, marginTop: 2 }}>
              <svg width={11} height={11} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6.4L4.6 9 10 3.4" />
              </svg>
            </span>
            <span>{entry.output}</span>
          </div>
        )}

        {entry.thinking && expanded && (
          <div
            style={{
              padding: "11px 13px 12px",
              borderRadius: 10,
              background: "rgba(12,10,9,.035)",
              border: "1px solid rgba(12,10,9,.06)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              animation: "auditExpand 240ms ease-out",
            }}
          >
            <div
              style={{
                fontFamily: mono,
                fontSize: 9.5,
                color: accent,
                fontWeight: 700,
                letterSpacing: ".7px",
                textTransform: "uppercase",
              }}
            >
              Agent reasoning
            </div>
            <div
              style={{
                fontFamily: garamond,
                fontSize: 14.5,
                color: "var(--t1, rgba(12,10,9,.95))",
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                letterSpacing: ".05px",
              }}
            >
              {entry.thinking.reasoning}
            </div>
            {entry.thinking.metadata && entry.thinking.metadata.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(120px, auto) 1fr",
                  gap: "5px 14px",
                  paddingTop: 8,
                  borderTop: "1px dashed rgba(12,10,9,.10)",
                }}
              >
                {entry.thinking.metadata.map((m, mi) => (
                  <React.Fragment key={mi}>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 10,
                        color: "var(--t3, rgba(12,10,9,.42))",
                        letterSpacing: ".5px",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      {m.label}
                    </span>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        color: "var(--t1, rgba(12,10,9,.95))",
                        wordBreak: "break-word",
                      }}
                    >
                      {m.value}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          {entry.thinking && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="audit-more-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                borderRadius: 9999,
                border: `1px solid ${expanded ? accent : "var(--glass-edge, rgba(0,0,0,.10))"}`,
                background: expanded
                  ? `color-mix(in srgb, ${accent} 8%, white)`
                  : "rgba(255,255,255,.7)",
                color: expanded ? accent : "var(--t1, rgba(12,10,9,.95))",
                fontFamily: inter,
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 180ms ease-out, border-color 180ms ease-out, color 180ms ease-out",
              }}
            >
              {expanded ? "Less" : "More"}
              <svg
                width={9}
                height={9}
                viewBox="0 0 10 10"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 200ms ease-out",
                }}
                aria-hidden
              >
                <path d="M2.5 3.5L5 6.2 7.5 3.5" />
              </svg>
            </button>
          )}
          {entry.href && (
            <Link
              href={entry.href}
              style={{
                fontFamily: inter,
                fontSize: 11.5,
                fontWeight: 600,
                color: "var(--t1, rgba(12,10,9,.95))",
                textDecoration: "none",
                borderBottom: "1px solid var(--glass-edge, rgba(0,0,0,.18))",
              }}
            >
              Open station →
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

function accentColor(accent: AuditEntry["agentAccent"]): string {
  switch (accent) {
    case "mint":
      return "var(--mint, #2c8c70)"
    case "peach":
      return "var(--peach, #b86a3e)"
    case "sky":
      return "var(--sky, #4a7ba8)"
    case "lav":
      return "var(--lav, #6b5db0)"
    default:
      return "var(--t2, rgba(12,10,9,.62))"
  }
}

// ── Footer ────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      style={{
        flexShrink: 0,
        padding: "12px 24px",
        borderTop: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        background: "rgba(255,255,255,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 10.5,
          color: "var(--t3, rgba(12,10,9,.42))",
          letterSpacing: ".4px",
          lineHeight: 1.4,
        }}
      >
        Audit log immutable · signed at write · retained for deal lifetime + 7 years
      </div>
      <div
        style={{
          fontFamily: mono,
          fontSize: 10.5,
          color: "var(--t3, rgba(12,10,9,.42))",
          letterSpacing: ".4px",
        }}
      >
        ESC to close
      </div>
    </footer>
  )
}

// ── Scoped styles ─────────────────────────────────────────────────────────
function ScopedStyles() {
  return (
    <style>{`
      @keyframes auditFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes auditSlideUp {
        from { opacity: 0; transform: translateY(14px) scale(.98); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes auditDot {
        0%, 100% { opacity: 1; }
        50%      { opacity: .35; }
      }
      @keyframes auditExpand {
        from { opacity: 0; transform: translateY(-4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .audit-close:hover {
        background: rgba(255,255,255,.12);
        border-color: rgba(255,255,255,.22);
      }
      .audit-more-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(20,15,8,.08);
      }
      .audit-scroll::-webkit-scrollbar { width: 6px; }
      .audit-scroll::-webkit-scrollbar-track { background: transparent; }
      .audit-scroll::-webkit-scrollbar-thumb {
        background: rgba(12,10,9,.18);
        border-radius: 9999px;
      }
    `}</style>
  )
}
