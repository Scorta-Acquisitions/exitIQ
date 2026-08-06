"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import React from "react"

import { getCaseTask } from "@/lib/agentActivity"
import {
  FALLBACK_RESPONSE,
  getProactiveMessage,
  getQuickChips,
  matchQAEntry,
  OPENING_MESSAGE,
  typingDelayFor,
} from "@/lib/caseChat"
import { streamCaseAnswer } from "@/lib/caseChatClient"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

const T = {
  panelEnterMs: 300,
  openingTypingMs: 600,
  readinessUserDelayMs: 500,
  readinessTypingMs: 1100,
}

const READINESS_USER_PROMPT = "Am I ready to sell?"

const READINESS_RESPONSE = `Based on my read of your deal file — no, not yet.

Your Scorta Score is 71/100, but Transferability is 38/100 and Owner-Dependency is also at 38. That tells me the deal is well-priced but not buyer-ready. Zero documented SOPs, one tenured staff member out of eleven, a business that still runs through you. Any buyer or SBA lender would see the same gap I do.

Before I push the CIM out, I want to properly calibrate your readiness — and right now I don't have enough on the business itself. Head to /upload next. Twenty minutes on your top vendor relationships, the client onboarding flow, and your day-to-day role gives me what I need. After that, /risk lets the Owner-Dependency Agent finish the 5 SOP templates that close the $450K transferability gap.

You're closer than you think — but right now we'd leave money on the table.`

type Role = "case" | "user"

type Message = {
  id: string
  role: Role
  text: string
  ts: number
}

function nextId() {
  return `m_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
}

export function CASEChat({ currentRoute }: { currentRoute: string }) {
  const searchParams = useSearchParams()
  const fromSell = searchParams?.get("from") === "sell"

  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<Array<Message>>([])
  const [typing, setTyping] = React.useState(false)
  const [unread, setUnread] = React.useState(0)
  const [inputValue, setInputValue] = React.useState("")
  const [peek, setPeek] = React.useState(false)
  const [readinessQueued, setReadinessQueued] = React.useState(false)
  const [readinessCtaVisible, setReadinessCtaVisible] = React.useState(false)

  const firedProactiveRef = React.useRef<Set<string>>(new Set())
  const openingFiredRef = React.useRef(false)
  const peekFiredRef = React.useRef(false)
  const readinessFiredRef = React.useRef(false)
  const openRef = React.useRef(open)
  const threadRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const typingTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const peekTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const readinessTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const liveAbortRef = React.useRef<AbortController | null>(null)

  // Keep a ref so async timers can read the current open state without
  // re-firing on every render.
  React.useEffect(() => {
    openRef.current = open
  }, [open])

  const chips = getQuickChips(currentRoute)
  const taskLine = getCaseTask(currentRoute)

  // ── Opening message — fires the first time the panel opens ──────────
  React.useEffect(() => {
    if (!open || openingFiredRef.current) return
    openingFiredRef.current = true
    setTyping(true)
    typingTimerRef.current = setTimeout(() => {
      setTyping(false)
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "case", text: OPENING_MESSAGE, ts: Date.now() },
      ])
    }, T.openingTypingMs)
  }, [open])

  // ── Route-aware proactive messages ──────────────────────────────────
  React.useEffect(() => {
    if (!currentRoute) return
    if (firedProactiveRef.current.has(currentRoute)) return
    const msg = getProactiveMessage(currentRoute)
    if (!msg) return
    firedProactiveRef.current.add(currentRoute)

    // Wait briefly so the proactive doesn't race the opening message on first
    // load. If the panel was never opened, this just queues silently and the
    // unread badge surfaces.
    const delay = openingFiredRef.current ? 400 : 1500
    const timer = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "case", text: msg, ts: Date.now() },
      ])
      if (!openRef.current) {
        setUnread((u) => u + 1)
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [currentRoute])

  // Auto-scroll the thread when a message lands or typing toggles.
  React.useEffect(() => {
    const el = threadRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, typing])

  // Opening the panel clears the unread badge and dismisses the peek.
  React.useEffect(() => {
    if (open) {
      setUnread(0)
      setPeek(false)
    }
  }, [open])

  // Sell-intent peek bubble — fires when the seller arrives at /documents
  // from the home page "Ready to Sell?" CTA. Single-fire per session.
  React.useEffect(() => {
    if (peekFiredRef.current) return
    if (currentRoute !== "/documents" || !fromSell) return
    peekFiredRef.current = true
    const timer = setTimeout(() => {
      if (!openRef.current) setPeek(true)
    }, 600)
    return () => clearTimeout(timer)
  }, [currentRoute, fromSell])

  React.useEffect(() => {
    return () => {
      if (peekTimerRef.current) clearTimeout(peekTimerRef.current)
      if (readinessTimerRef.current) clearTimeout(readinessTimerRef.current)
      liveAbortRef.current?.abort()
    }
  }, [])

  // Sell-intent readiness sequence — fires once after the bubble is clicked
  // and the opening message has landed. Posts a user question, then CASE's
  // readiness analysis pointing the seller to /upload as the next stage.
  React.useEffect(() => {
    if (!open || !readinessQueued || readinessFiredRef.current) return
    if (messages.length < 1) return
    readinessFiredRef.current = true
    readinessTimerRef.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "user", text: READINESS_USER_PROMPT, ts: Date.now() },
      ])
      setTyping(true)
      readinessTimerRef.current = setTimeout(() => {
        setTyping(false)
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: "case", text: READINESS_RESPONSE, ts: Date.now() },
        ])
        setReadinessCtaVisible(true)
      }, T.readinessTypingMs)
    }, T.readinessUserDelayMs)
  }, [open, readinessQueued, messages.length])

  // Focus the input on open.
  React.useEffect(() => {
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), T.panelEnterMs)
    return () => clearTimeout(t)
  }, [open])

  React.useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }
  }, [])

  async function sendQuestion(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return

    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", text: trimmed, ts: Date.now() },
    ])
    setInputValue("")

    // Fast path — the hand-written QA_MAP resolves instantly with no network call.
    const cached = matchQAEntry(trimmed)
    if (cached) {
      const delay = typingDelayFor(cached)
      setTyping(true)
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => {
        setTyping(false)
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: "case", text: cached, ts: Date.now() },
        ])
      }, delay)
      return
    }

    // Live path — anything the fast-path cache misses goes to the Case Manager Agent.
    liveAbortRef.current?.abort()
    const controller = new AbortController()
    liveAbortRef.current = controller
    setTyping(true)
    const liveId = nextId()
    let started = false

    try {
      await streamCaseAnswer({
        message: trimmed,
        route: currentRoute,
        signal: controller.signal,
        onDelta: (accumulated) => {
          setMessages((prev) => {
            if (!started) {
              started = true
              setTyping(false)
              return [...prev, { id: liveId, role: "case", text: accumulated, ts: Date.now() }]
            }
            return prev.map((m) => (m.id === liveId ? { ...m, text: accumulated } : m))
          })
        },
      })
    } catch {
      if (controller.signal.aborted) return
      setTyping(false)
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "case", text: FALLBACK_RESPONSE, ts: Date.now() },
      ])
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendQuestion(inputValue)
  }

  return (
    <>
      <ScopedStyles />

      {/* Panel ──────────────────────────────────────────────────────── */}
      <aside
        aria-hidden={!open}
        role="dialog"
        aria-label="CASE chat"
        style={{
          position: "fixed",
          bottom: 86,
          right: 24,
          width: 380,
          maxWidth: "calc(100vw - 48px)",
          height: 560,
          maxHeight: "calc(100vh - 110px)",
          background: "#faf9f7",
          borderRadius: 16,
          boxShadow: "0 24px 60px rgba(12,10,9,.30), 0 1px 0 rgba(255,255,255,.7) inset",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateY(0)" : "translateY(12px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: `transform ${T.panelEnterMs}ms ease-out, opacity ${T.panelEnterMs}ms ease-out`,
          zIndex: 9999,
        }}
      >
        <Header taskLine={taskLine} onMinimize={() => setOpen(false)} />

        <MessageThread
          ref={threadRef}
          messages={messages}
          typing={typing}
          showReadinessCta={readinessCtaVisible}
        />

        <Composer
          chips={chips}
          inputValue={inputValue}
          inputRef={inputRef}
          onChange={setInputValue}
          onSubmit={onSubmit}
          onChip={sendQuestion}
          disabled={typing}
        />
      </aside>

      {/* Peek bubble — surfaces above the launcher without opening the panel */}
      {peek && !open && (
        <div
          role="status"
          aria-live="polite"
          className="case-peek"
          style={{
            position: "fixed",
            bottom: 86,
            right: 24,
            maxWidth: 280,
            background: "#faf9f7",
            color: "var(--t1)",
            borderRadius: 14,
            padding: "12px 38px 12px 14px",
            boxShadow: "0 18px 38px rgba(12,10,9,.22), 0 1px 0 rgba(255,255,255,.7) inset",
            border: "1px solid rgba(12,10,9,.08)",
            zIndex: 9999,
            cursor: "pointer",
          }}
          onClick={() => {
            setPeek(false)
            setReadinessQueued(true)
            setOpen(true)
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 9.5,
              color: "var(--mint, #2c8c70)",
              fontWeight: 700,
              letterSpacing: ".7px",
              textTransform: "uppercase",
              marginBottom: 5,
            }}
          >
            CASE · Case Manager
          </div>
          <div
            style={{
              fontFamily: garamond,
              fontSize: 14.5,
              lineHeight: 1.45,
              color: "var(--t1)",
              letterSpacing: ".05px",
            }}
          >
            <strong>Important!</strong> Are you sure you&apos;re ready to sell?
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={(e) => {
              e.stopPropagation()
              setPeek(false)
            }}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              color: "var(--t3)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 160ms ease-out, color 160ms ease-out",
            }}
            className="case-peek-close"
          >
            <svg width={10} height={10} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
              <path d="M2 2l6 6M8 2l-6 6" />
            </svg>
          </button>
          <span
            aria-hidden
            style={{
              position: "absolute",
              bottom: -7,
              right: 22,
              width: 0,
              height: 0,
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderTop: "7px solid #faf9f7",
              filter: "drop-shadow(0 1px 0 rgba(12,10,9,.08))",
            }}
          />
        </div>
      )}

      {/* Collapsed launcher button ──────────────────────────────────── */}
      <button
        type="button"
        aria-label={open ? "Close CASE chat" : "Open CASE chat"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="case-launcher"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
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
          zIndex: 9999,
          transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
            boxShadow: "0 0 10px rgba(44,140,112,.65)",
            animation: "caseChatPulse 3.2s ease-in-out infinite",
          }}
        />
        {unread > 0 && (
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
            {unread}
          </span>
        )}
      </button>
    </>
  )
}

// ── Header ────────────────────────────────────────────────────────────
function Header({
  taskLine,
  onMinimize,
}: {
  taskLine: string
  onMinimize: () => void
}) {
  return (
    <header
      style={{
        flexShrink: 0,
        padding: "14px 16px",
        background: "rgba(12,10,9,.94)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
          boxShadow: "0 0 8px rgba(44,140,112,.55)",
          animation: "caseChatPulse 3.2s ease-in-out infinite",
          flexShrink: 0,
        }}
      />
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
            CASE
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
                animation: "caseChatBlink 1.8s ease-in-out infinite",
              }}
            />
            Active · {taskLine}
          </span>
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10,
            color: "rgba(245,245,245,.55)",
            letterSpacing: ".4px",
            marginTop: 3,
          }}
        >
          Case Manager · Fieldstone Digital Marketing
        </div>
      </div>
      <button
        type="button"
        onClick={onMinimize}
        aria-label="Minimize CASE chat"
        title="Minimize"
        className="case-chat-icon-btn"
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,.10)",
          background: "rgba(255,255,255,.04)",
          color: "rgba(245,245,245,.78)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 160ms ease-out",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>
    </header>
  )
}

// ── Message thread ────────────────────────────────────────────────────
const MessageThread = React.forwardRef<
  HTMLDivElement,
  { messages: Array<Message>; typing: boolean; showReadinessCta: boolean }
>(function MessageThread({ messages, typing, showReadinessCta }, ref) {
  return (
    <div
      ref={ref}
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: "18px 18px 14px",
        background: "#faf9f7",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {messages.map((m) =>
        m.role === "case" ? (
          <CaseMessage key={m.id} text={m.text} />
        ) : (
          <UserMessage key={m.id} text={m.text} />
        ),
      )}
      {typing && <TypingIndicator />}
      {showReadinessCta && !typing && <ReadinessCta />}
    </div>
  )
})

// ── Readiness CTA — surfaces under CASE's readiness analysis ──────────
function ReadinessCta() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 7,
        alignSelf: "stretch",
        animation: "caseChatFadeIn .26s ease-out",
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 9.5,
          color: "var(--mint, #2c8c70)",
          letterSpacing: ".7px",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        Next step · recommended
      </div>
      <Link
        href="/upload"
        className="case-readiness-cta"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 14px",
          borderRadius: 12,
          background: "var(--mint, #2c8c70)",
          color: "#fff",
          textDecoration: "none",
          boxShadow: "0 8px 22px rgba(44,140,112,.30)",
          transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
          alignSelf: "flex-start",
          maxWidth: "100%",
        }}
      >
        <svg
          width={14}
          height={14}
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M7 10V3" />
          <path d="M4 5.6L7 2.6l3 3" />
          <path d="M2.4 9.4v1.4A1.2 1.2 0 0 0 3.6 12h6.8a1.2 1.2 0 0 0 1.2-1.2V9.4" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
          <span
            style={{
              fontFamily: inter,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "-.05px",
              lineHeight: 1.2,
            }}
          >
            Add Business Context
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: 10,
              color: "rgba(255,255,255,.78)",
              letterSpacing: ".4px",
            }}
          >
            /upload · ~20 min · unlocks readiness calibration
          </span>
        </div>
        <span style={{ marginLeft: 4, transform: "translateY(-1px)", fontSize: 15 }}>→</span>
      </Link>
    </div>
  )
}

function CaseMessage({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        alignSelf: "stretch",
        animation: "caseChatFadeIn .26s ease-out",
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 9.5,
          color: "var(--mint, #2c8c70)",
          letterSpacing: ".7px",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        CASE · Case Manager
      </div>
      <div
        style={{
          fontFamily: garamond,
          fontSize: 14.5,
          lineHeight: 1.55,
          color: "#1a1612",
          whiteSpace: "pre-wrap",
          letterSpacing: ".05px",
        }}
      >
        {text}
      </div>
    </div>
  )
}

function UserMessage({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-end",
        gap: 8,
        alignSelf: "stretch",
        animation: "caseChatFadeIn .22s ease-out",
      }}
    >
      <div
        style={{
          maxWidth: "82%",
          padding: "9px 13px",
          borderRadius: 12,
          background: "rgba(12,10,9,.06)",
          border: "1px solid rgba(12,10,9,.08)",
          fontFamily: inter,
          fontSize: 13.5,
          lineHeight: 1.5,
          color: "var(--t1)",
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </div>
      <div
        aria-hidden
        style={{
          width: 24,
          height: 24,
          flexShrink: 0,
          borderRadius: "50%",
          background: "#E1F5EE",
          color: "#1D9E75",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: inter,
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        CP
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        alignSelf: "stretch",
        animation: "caseChatFadeIn .22s ease-out",
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 9.5,
          color: "var(--mint, #2c8c70)",
          letterSpacing: ".7px",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        CASE · Case Manager
      </div>
      <div style={{ display: "inline-flex", gap: 5, paddingTop: 4 }}>
        <Dot delay={0} />
        <Dot delay={140} />
        <Dot delay={280} />
      </div>
    </div>
  )
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "rgba(44,140,112,.55)",
        animation: "caseChatDot 1.05s ease-in-out infinite",
        animationDelay: `${delay}ms`,
      }}
    />
  )
}

// ── Composer ──────────────────────────────────────────────────────────
function Composer({
  chips,
  inputValue,
  inputRef,
  onChange,
  onSubmit,
  onChip,
  disabled,
}: {
  chips: ReadonlyArray<string>
  inputValue: string
  inputRef: React.RefObject<HTMLInputElement | null>
  onChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  onChip: (text: string) => void
  disabled: boolean
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        background: "rgba(12,10,9,.94)",
        padding: "12px 14px 14px",
        borderTop: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 10,
        }}
      >
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            disabled={disabled}
            onClick={() => onChip(chip)}
            className="case-chat-chip"
            style={{
              height: 26,
              padding: "0 11px",
              borderRadius: 9999,
              background: "rgba(44,140,112,.14)",
              border: "1px solid rgba(44,140,112,.36)",
              color: "rgba(167,229,211,.95)",
              fontFamily: mono,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: ".15px",
              cursor: disabled ? "default" : "pointer",
              opacity: disabled ? 0.55 : 1,
              transition: "background 160ms ease-out, border-color 160ms ease-out",
              whiteSpace: "nowrap",
            }}
          >
            {chip}
          </button>
        ))}
      </div>
      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,.06)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 9999,
          padding: "4px 4px 4px 14px",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask CASE about your deal..."
          disabled={disabled}
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "rgba(245,245,245,.95)",
            fontFamily: garamond,
            fontSize: 14,
            padding: "6px 0",
          }}
        />
        <button
          type="submit"
          disabled={disabled || !inputValue.trim()}
          aria-label="Send"
          title="Send"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "none",
            background: "var(--mint, #2c8c70)",
            color: "#fff",
            cursor: disabled || !inputValue.trim() ? "default" : "pointer",
            opacity: disabled || !inputValue.trim() ? 0.4 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "transform 160ms ease-out, opacity 160ms ease-out",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h8m-3-3l3 3-3 3" />
          </svg>
        </button>
      </form>
    </div>
  )
}

// ── Scoped styles ─────────────────────────────────────────────────────
function ScopedStyles() {
  return (
    <style>{`
      @keyframes caseChatPulse {
        0%, 100% { transform: scale(1);    opacity: 1;  }
        50%      { transform: scale(1.10); opacity: .9; }
      }
      @keyframes caseChatBlink {
        0%, 100% { opacity: 1;  }
        50%      { opacity: .3; }
      }
      @keyframes caseChatFadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes caseChatDot {
        0%, 80%, 100% { transform: translateY(0);    opacity: .35; }
        40%           { transform: translateY(-3px); opacity: 1;   }
      }
      .case-launcher:hover {
        transform: translateY(-1px);
        box-shadow: 0 18px 36px rgba(12,10,9,.36);
      }
      @keyframes casePeekIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .case-peek {
        animation: casePeekIn 280ms ease-out;
      }
      .case-peek:hover {
        transform: translateY(-1px);
        box-shadow: 0 22px 44px rgba(12,10,9,.26);
        transition: transform 180ms ease-out, box-shadow 180ms ease-out;
      }
      .case-peek-close:hover {
        background: rgba(12,10,9,.06);
        color: var(--t1);
      }
      .case-readiness-cta:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 28px rgba(44,140,112,.42);
      }
      .case-chat-chip:hover:not(:disabled) {
        background: rgba(44,140,112,.22);
        border-color: rgba(44,140,112,.52);
      }
      .case-chat-icon-btn:hover {
        background: rgba(255,255,255,.08);
      }
    `}</style>
  )
}
