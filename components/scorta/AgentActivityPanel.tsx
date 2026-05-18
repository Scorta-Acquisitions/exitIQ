"use client"

import { usePathname } from "next/navigation"
import React from "react"

import {
  AGENT_DEFS,
  type AgentDef,
  type AgentKey,
  type AgentStatus,
  getAgentState,
  getAriaTask,
} from "@/lib/agentActivity"

import { useAgentFleet } from "./AgentFleetContext"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

const EXPANDED_WIDTH = 296
const COLLAPSED_WIDTH = 44

// Leave clearance for the 64px sticky TopBar (zIndex 50) so the toggle and
// header don't sit underneath it.
const TOPBAR_CLEARANCE = 84

const ROTATE_MS = 6000
const PROGRESS_TICK_MS = 3600
const PROGRESS_CEILING = 85

export function AgentActivityPanel() {
  const rawPath = usePathname() ?? "/dashboard"
  const route = normalizeRoute(rawPath)
  const { dispatched } = useAgentFleet()

  // Default collapsed pre-dispatch; expanded after dispatch. The user can
  // override either way at any time via the toggle button.
  const [collapsed, setCollapsed] = React.useState(true)
  const userTouched = React.useRef(false)

  React.useEffect(() => {
    if (userTouched.current) return
    setCollapsed(!dispatched)
  }, [dispatched])

  function toggle() {
    userTouched.current = true
    setCollapsed((c) => !c)
  }

  const activeCount = dispatched
    ? AGENT_DEFS.filter((d) => getAgentState(d.key, route, true).status === "running").length + 1
    : 1

  const showOnlyAria = !dispatched

  return (
    <>
      <ScopedStyles />
      <aside
        aria-label="Agent activity"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
          background: "rgba(255,255,255,.55)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          color: "var(--t1)",
          borderLeft: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
          boxShadow: "-12px 0 36px rgba(12,10,9,.06)",
          transition: "width 220ms ease-out",
          display: "flex",
          flexDirection: "column",
          zIndex: 40,
          // overflow stays visible so the toggle button — positioned at
          // left: -14 — can poke out past the panel's left edge. Inner
          // content is bound by its own padding + flex layout, so removing
          // the clip doesn't leak panel contents.
          overflow: "visible",
        }}
      >
        {/* Collapse handle — sits below the TopBar so it never gets covered */}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand agent activity panel" : "Collapse agent activity panel"}
          aria-expanded={!collapsed}
          className="aap-toggle"
          style={{
            position: "absolute",
            top: TOPBAR_CLEARANCE - 14,
            left: -14,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(255,255,255,.92)",
            color: "var(--t1)",
            border: "1px solid var(--glass-edge, rgba(0,0,0,.10))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 2,
            boxShadow: "0 6px 14px rgba(12,10,9,.10)",
            transition: "transform 180ms ease-out, background 180ms ease-out, box-shadow 180ms ease-out",
          }}
        >
          <svg
            width={11}
            height={11}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 200ms ease-out",
            }}
          >
            <path d="M4 2l4 4-4 4" />
          </svg>
        </button>

        {collapsed ? (
          <CollapsedRail activeCount={activeCount} dispatched={dispatched} onExpand={toggle} />
        ) : (
          <ExpandedBody route={route} dispatched={dispatched} showOnlyAria={showOnlyAria} />
        )}
      </aside>
    </>
  )
}

// Strip /report/[id] etc. down to the top-level route segment we know about.
function normalizeRoute(p: string): string {
  if (!p.startsWith("/")) return "/" + p
  const seg = p.split("/")[1] ?? ""
  return "/" + seg
}

// ── Collapsed slim bar ──────────────────────────────────────────────────────
function CollapsedRail({
  activeCount,
  dispatched,
  onExpand,
}: {
  activeCount: number
  dispatched: boolean
  onExpand: () => void
}) {
  return (
    <button
      type="button"
      onClick={onExpand}
      aria-label="Expand agent activity"
      className="aap-rail"
      style={{
        all: "unset",
        height: "100%",
        width: "100%",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${TOPBAR_CLEARANCE + 12}px 0 22px`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--mint, #2c8c70)",
            boxShadow: "0 0 8px rgba(44,140,112,.45)",
            animation: "aapPulse 1.6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            fontFamily: mono,
            fontSize: 9,
            letterSpacing: "1.8px",
            color: "var(--t2)",
            textTransform: "uppercase",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
          }}
        >
          Agents
        </div>
      </div>
      <div
        style={{
          fontFamily: mono,
          fontSize: 9,
          letterSpacing: "1.2px",
          color: "var(--mint, #2c8c70)",
          textTransform: "uppercase",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          paddingBottom: 8,
        }}
      >
        {dispatched ? `${activeCount} active` : "Standing by"}
      </div>
    </button>
  )
}

// ── Expanded body ───────────────────────────────────────────────────────────
function ExpandedBody({
  route,
  dispatched,
  showOnlyAria,
}: {
  route: string
  dispatched: boolean
  showOnlyAria: boolean
}) {
  const allComplete = React.useMemo(
    () =>
      dispatched &&
      AGENT_DEFS.every((d) => getAgentState(d.key, route, true).status === "complete"),
    [route, dispatched]
  )
  const runningCount = React.useMemo(
    () =>
      dispatched
        ? AGENT_DEFS.filter((d) => getAgentState(d.key, route, true).status === "running").length
        : 0,
    [route, dispatched]
  )

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        padding: `${TOPBAR_CLEARANCE}px 18px 18px 22px`,
      }}
    >
      <Header allComplete={allComplete} runningCount={runningCount} dispatched={dispatched} />

      <AriaRow route={route} />

      <div
        style={{
          height: 1,
          background: "var(--div, rgba(12,10,9,.08))",
          margin: "12px -18px 14px -22px",
        }}
      />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          paddingRight: 4,
          marginRight: -4,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
        className="aap-scroll"
      >
        {showOnlyAria ? (
          <FleetStandbyHint />
        ) : (
          AGENT_DEFS.map((def, i) => (
            <AgentRow key={def.key} def={def} route={route} order={i} />
          ))
        )}
      </div>
    </div>
  )
}

function Header({
  allComplete,
  runningCount,
  dispatched,
}: {
  allComplete: boolean
  runningCount: number
  dispatched: boolean
}) {
  const [flash, setFlash] = React.useState(false)
  const prevComplete = React.useRef(false)
  React.useEffect(() => {
    if (allComplete && !prevComplete.current) {
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 700)
      return () => clearTimeout(t)
    }
    prevComplete.current = allComplete
  }, [allComplete])

  const statusLine = !dispatched
    ? { dot: "muted" as const, text: "Fleet standing by" }
    : allComplete
    ? { dot: "complete" as const, text: "Fleet idle · all tasks complete" }
    : { dot: "running" as const, text: `Fleet active · ${runningCount} agent${runningCount === 1 ? "" : "s"} running` }

  return (
    <header
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingRight: 30,
        position: "relative",
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "1.4px",
          textTransform: "uppercase",
          color: "var(--t3)",
        }}
      >
        Agent Activity
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: inter,
          fontSize: 11.5,
          color: "var(--t1)",
          background: flash ? "rgba(44,140,112,.12)" : "transparent",
          borderRadius: 8,
          padding: flash ? "4px 8px" : "0",
          margin: flash ? "-4px -8px" : "0",
          transition: "background 600ms ease-out, padding 240ms ease-out, margin 240ms ease-out",
        }}
      >
        <StatusDot kind={statusLine.dot} />
        <span style={{ lineHeight: 1.3 }}>{statusLine.text}</span>
      </div>
    </header>
  )
}

function StatusDot({ kind }: { kind: "running" | "complete" | "muted" }) {
  if (kind === "complete") {
    return (
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--mint, #2c8c70)",
          boxShadow: "0 0 6px rgba(44,140,112,.35)",
          flexShrink: 0,
        }}
      />
    )
  }
  if (kind === "muted") {
    return (
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "rgba(12,10,9,.08)",
          border: "1px solid var(--glass-edge, rgba(0,0,0,.18))",
          flexShrink: 0,
        }}
      />
    )
  }
  return (
    <span
      aria-hidden
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "var(--mint, #2c8c70)",
        boxShadow: "0 0 8px rgba(44,140,112,.45)",
        animation: "aapPulse 1.6s ease-in-out infinite",
        flexShrink: 0,
      }}
    />
  )
}

// ── ARIA row ───────────────────────────────────────────────────────────────
function AriaRow({ route }: { route: string }) {
  const task = getAriaTask(route)
  return (
    <div
      style={{
        display: "flex",
        gap: 11,
        alignItems: "flex-start",
        marginTop: 14,
      }}
    >
      <div
        aria-hidden
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
          boxShadow: "0 0 10px rgba(44,140,112,.55)",
          animation: "aapAria 3.2s ease-in-out infinite",
          flexShrink: 0,
          marginTop: 2,
        }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontFamily: garamond,
              fontSize: 14,
              fontWeight: 500,
              color: "var(--t1)",
              letterSpacing: "-.2px",
              lineHeight: 1.1,
            }}
          >
            ARIA
          </div>
          <span
            style={{
              fontFamily: mono,
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: ".6px",
              textTransform: "uppercase",
              color: "var(--mint, #2c8c70)",
            }}
          >
            Case Manager
          </span>
        </div>
        <div
          key={task}
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "var(--t2)",
            lineHeight: 1.45,
            marginTop: 4,
            animation: "aapLineIn .28s ease-out",
          }}
        >
          {task}
        </div>
      </div>
    </div>
  )
}

function FleetStandbyHint() {
  return (
    <div
      style={{
        padding: "14px 14px",
        borderRadius: 10,
        background: "rgba(255,255,255,.55)",
        border: "1px dashed var(--glass-edge, rgba(0,0,0,.14))",
        fontSize: 11.5,
        lineHeight: 1.5,
        color: "var(--t2)",
        fontFamily: inter,
      }}
    >
      No agents dispatched yet. ARIA will spin up the fleet once you approve the
      Boardroom&apos;s work orders.
    </div>
  )
}

// ── Agent row ──────────────────────────────────────────────────────────────
function AgentRow({ def, route, order }: { def: AgentDef; route: string; order: number }) {
  const state = getAgentState(def.key, route, true)
  const { status, task: explicitTask, amber } = state

  // Rotating task line — only when no explicit override is set.
  const lines = status === "waiting" ? def.waitingLines : def.runningLines
  const [lineIdx, setLineIdx] = React.useState(0)
  React.useEffect(() => {
    if (explicitTask !== null) return
    if (status !== "running" && status !== "waiting") return
    if (lines.length <= 1) return
    const id = setInterval(() => {
      setLineIdx((i) => (i + 1) % lines.length)
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [explicitTask, status, lines.length])

  React.useEffect(() => {
    setLineIdx(0)
  }, [status])

  const displayTask = explicitTask ?? lines[lineIdx] ?? def.initialTask

  // Cosmetic progress bar. Running agents creep to 85%; complete fills to 100%.
  const [progress, setProgress] = React.useState(() =>
    status === "complete" ? 100 : status === "running" ? 16 + order * 8 : 6
  )
  React.useEffect(() => {
    if (status === "complete") {
      setProgress(100)
      return
    }
    if (status === "reviewing") {
      setProgress((p) => Math.max(p, 92))
      return
    }
    if (status === "waiting") {
      return
    }
    // running
    const id = setInterval(() => {
      setProgress((p) => (p >= PROGRESS_CEILING ? PROGRESS_CEILING : p + 1))
    }, PROGRESS_TICK_MS)
    return () => clearInterval(id)
  }, [status])

  const completed = status === "complete"

  return (
    <article
      style={{
        position: "relative",
        padding: "12px 12px 12px 14px",
        borderRadius: 12,
        background: amber ? "rgba(184,106,62,.08)" : "rgba(255,255,255,.65)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderLeft: amber
          ? "2px solid var(--peach, #b86a3e)"
          : "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        opacity: completed ? 0.75 : 1,
        transition: "opacity 240ms ease-out, background 240ms ease-out",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: "0 1px 0 rgba(255,255,255,.6) inset",
      }}
    >
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div
          style={{
            fontFamily: garamond,
            fontSize: 13.5,
            fontWeight: 500,
            color: "var(--t1)",
            letterSpacing: "-.2px",
            lineHeight: 1.15,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {def.name}
        </div>
        <StatusChip status={status} />
      </header>
      <div
        key={displayTask}
        style={{
          fontFamily: mono,
          fontSize: 10.5,
          color: "var(--t2)",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: 30,
          animation: "aapLineIn .28s ease-out",
        }}
      >
        {displayTask}
      </div>
      <ProgressBar progress={progress} status={status} />
    </article>
  )
}

function ProgressBar({ progress, status }: { progress: number; status: AgentStatus }) {
  if (status === "waiting") {
    return (
      <div
        style={{
          height: 2,
          borderRadius: 9999,
          background: "rgba(12,10,9,.08)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(170,200,232,.6) 50%, transparent 100%)",
            animation: "aapWaiting 2.4s ease-in-out infinite",
          }}
        />
      </div>
    )
  }
  const fill =
    status === "complete"
      ? "var(--mint, #2c8c70)"
      : status === "reviewing"
      ? "var(--peach, #b86a3e)"
      : "var(--mint, #2c8c70)"
  return (
    <div
      style={{
        height: 2,
        borderRadius: 9999,
        background: "rgba(245,245,245,.08)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: fill,
          boxShadow: status === "complete" ? "none" : `0 0 4px ${fill}55`,
          transition: "width 500ms ease-out, background 240ms ease-out",
        }}
      />
    </div>
  )
}

function StatusChip({ status }: { status: AgentStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 7px",
        borderRadius: 9999,
        fontFamily: inter,
        fontSize: 8.5,
        fontWeight: 700,
        letterSpacing: ".7px",
        textTransform: "uppercase",
        color: meta.color,
        background: meta.bg,
        border: `1px solid ${meta.edge}`,
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: meta.dot,
          boxShadow: meta.glow ? `0 0 5px ${meta.dot}66` : "none",
          animation: meta.pulse ? "aapPulse 1.6s ease-in-out infinite" : undefined,
        }}
      />
      {meta.label}
    </span>
  )
}

const STATUS_META: Record<
  AgentStatus,
  {
    label: string
    color: string
    bg: string
    edge: string
    dot: string
    glow: boolean
    pulse: boolean
  }
> = {
  running: {
    label: "Running",
    color: "var(--mint, #2c8c70)",
    bg: "rgba(44,140,112,.10)",
    edge: "rgba(44,140,112,.28)",
    dot: "var(--mint, #2c8c70)",
    glow: true,
    pulse: true,
  },
  waiting: {
    label: "Waiting",
    color: "var(--sky, #4a7ba8)",
    bg: "rgba(74,123,168,.10)",
    edge: "rgba(74,123,168,.26)",
    dot: "var(--sky, #4a7ba8)",
    glow: false,
    pulse: false,
  },
  reviewing: {
    label: "Reviewing",
    color: "var(--peach, #b86a3e)",
    bg: "rgba(184,106,62,.10)",
    edge: "rgba(184,106,62,.30)",
    dot: "var(--peach, #b86a3e)",
    glow: true,
    pulse: true,
  },
  complete: {
    label: "Complete",
    color: "var(--mint, #2c8c70)",
    bg: "rgba(44,140,112,.08)",
    edge: "rgba(44,140,112,.26)",
    dot: "var(--mint, #2c8c70)",
    glow: false,
    pulse: false,
  },
}

// ── Scoped styles ──────────────────────────────────────────────────────────
function ScopedStyles() {
  return (
    <style>{`
      @keyframes aapAria {
        0%, 100% { transform: scale(1);    opacity: 1;  }
        50%      { transform: scale(1.12); opacity: .9; }
      }
      @keyframes aapPulse {
        0%, 100% { opacity: 1;  }
        50%      { opacity: .35; }
      }
      @keyframes aapLineIn {
        from { opacity: 0; transform: translateY(3px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes aapWaiting {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .aap-toggle:hover {
        transform: translateY(-1px);
        background: rgba(255,255,255,1);
        box-shadow: 0 8px 18px rgba(12,10,9,.14);
      }
      .aap-rail:hover {
        background: rgba(12,10,9,.025);
      }
      .aap-scroll::-webkit-scrollbar { width: 4px; }
      .aap-scroll::-webkit-scrollbar-thumb {
        background: rgba(12,10,9,.16);
        border-radius: 9999px;
      }
      .aap-scroll::-webkit-scrollbar-track { background: transparent; }
    `}</style>
  )
}

// Suppress unused import warning when StatusChip type narrowing changes.
export type { AgentKey }
