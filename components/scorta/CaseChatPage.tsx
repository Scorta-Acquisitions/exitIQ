"use client"

import Link from "next/link"
import React from "react"

import { matchResponse, OPENING_MESSAGE, typingDelayFor } from "@/lib/caseChat"
import type { PERSONA as PersonaShape } from "@/lib/persona"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

type Persona = typeof PersonaShape

type Role = "case" | "user"

type Message = {
  id: string
  role: Role
  text: string
  ts: number
}

const T = {
  openingTypingMs: 700,
}

const STARTER_PROMPTS: ReadonlyArray<{ label: string; question: string; group: string }> = [
  { group: "Deal status", label: "Where does my deal stand today?", question: "Where does my deal stand right now?" },
  { group: "Deal status", label: "What's my Scorta Score and why?", question: "What's my Scorta Score?" },
  { group: "Score & risk", label: "Why is Transferability so low?", question: "Why is Transferability low?" },
  { group: "Score & risk", label: "How do I close the owner-dependency gap?", question: "How do I fix owner dependency?" },
  { group: "Money", label: "What's my deal worth?", question: "What's my deal worth?" },
  { group: "Money", label: "How was my SDE calculated?", question: "How is my SDE calculated?" },
  { group: "Path forward", label: "What should I do first?", question: "What should I do first?" },
  { group: "Path forward", label: "When does outreach launch?", question: "When does outreach launch?" },
]

function nextId() {
  return `m_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
}

export function CaseChatPage({ persona }: { persona: Persona }) {
  const [messages, setMessages] = React.useState<Array<Message>>([])
  const [typing, setTyping] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const threadRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null)
  const typingTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const openingFiredRef = React.useRef(false)

  // Fire CASE's opening once on mount
  React.useEffect(() => {
    if (openingFiredRef.current) return
    openingFiredRef.current = true
    setTyping(true)
    const id = setTimeout(() => {
      setTyping(false)
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "case", text: OPENING_MESSAGE, ts: Date.now() },
      ])
    }, T.openingTypingMs)
    return () => clearTimeout(id)
  }, [])

  // Auto-scroll on every new message / typing toggle
  React.useEffect(() => {
    const el = threadRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, typing])

  // Focus the composer once on mount
  React.useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 240)
    return () => clearTimeout(t)
  }, [])

  React.useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }
  }, [])

  function sendQuestion(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const response = matchResponse(trimmed)
    const delay = typingDelayFor(response)

    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", text: trimmed, ts: Date.now() },
    ])
    setInputValue("")
    setTyping(true)
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      setTyping(false)
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "case", text: response, ts: Date.now() },
      ])
    }, delay)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendQuestion(inputValue)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendQuestion(inputValue)
    }
  }

  const showStarters = messages.length <= 1

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <ScopedStyles />
      <PageHeader />

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr .85fr", gap: 22, alignItems: "stretch" }}>
        <ChatColumn
          threadRef={threadRef}
          messages={messages}
          typing={typing}
          showStarters={showStarters}
          onStarter={(q) => sendQuestion(q)}
          inputRef={inputRef}
          inputValue={inputValue}
          onChange={setInputValue}
          onSubmit={onSubmit}
          onKeyDown={onKeyDown}
          disabled={typing}
        />
        <ContextColumn persona={persona} />
      </div>
    </div>
  )
}

// ── Page header ───────────────────────────────────────────────────────────
function PageHeader() {
  return (
    <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "var(--t3)",
            fontFamily: inter,
            marginBottom: 6,
          }}
        >
          CASE · Case Manager · always on
        </div>
        <h1
          style={{
            fontFamily: garamond,
            fontSize: 32,
            fontWeight: 400,
            letterSpacing: "-.5px",
            color: "var(--t1)",
            lineHeight: 1.1,
          }}
        >
          Talk to CASE.
        </h1>
        <p
          style={{
            marginTop: 10,
            fontSize: 14,
            color: "var(--t2)",
            lineHeight: 1.55,
            maxWidth: 640,
            fontFamily: inter,
          }}
        >
          Ask anything about your deal, your score, the remediation plan, lenders, or where the
          agent fleet is in the cycle. CASE has the full deal file open in front of her.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="case-back-link"
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--t1)",
          textDecoration: "none",
          padding: "7px 12px",
          borderRadius: 9999,
          border: "1px solid var(--glass-edge, rgba(0,0,0,.10))",
          background: "rgba(255,255,255,.7)",
          transition: "background 180ms ease-out, border-color 180ms ease-out, transform 180ms ease-out",
          whiteSpace: "nowrap",
          fontFamily: inter,
        }}
      >
        ← Back to Seller Home
      </Link>
    </header>
  )
}

// ── Chat column ───────────────────────────────────────────────────────────
function ChatColumn({
  threadRef,
  messages,
  typing,
  showStarters,
  onStarter,
  inputRef,
  inputValue,
  onChange,
  onSubmit,
  onKeyDown,
  disabled,
}: {
  threadRef: React.RefObject<HTMLDivElement | null>
  messages: ReadonlyArray<Message>
  typing: boolean
  showStarters: boolean
  onStarter: (q: string) => void
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  inputValue: string
  onChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  disabled: boolean
}) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: 640,
        height: "calc(100vh - 220px)",
        background: "rgba(255,255,255,.78)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderRadius: 18,
        overflow: "hidden",
      }}
    >
      <ChatHeader />

      <div
        ref={threadRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "22px 28px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          background: "rgba(250,249,247,.5)",
        }}
      >
        {messages.map((m) =>
          m.role === "case" ? (
            <CaseBubble key={m.id} text={m.text} />
          ) : (
            <UserBubble key={m.id} text={m.text} />
          ),
        )}
        {typing && <TypingIndicator />}

        {showStarters && !typing && (
          <StarterGrid onPick={onStarter} />
        )}
      </div>

      <Composer
        inputRef={inputRef}
        inputValue={inputValue}
        onChange={onChange}
        onSubmit={onSubmit}
        onKeyDown={onKeyDown}
        disabled={disabled}
      />
    </section>
  )
}

function ChatHeader() {
  return (
    <header
      style={{
        flexShrink: 0,
        padding: "16px 22px",
        background: "rgba(12,10,9,.95)",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
          boxShadow: "0 0 10px rgba(44,140,112,.55)",
          animation: "casePagePulse 3.2s ease-in-out infinite",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontFamily: garamond,
              fontSize: 17,
              fontWeight: 500,
              color: "rgba(245,245,245,.96)",
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
              gap: 6,
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
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--mint, #2c8c70)",
                boxShadow: "0 0 6px var(--mint, #2c8c70)",
                animation: "casePageBlink 1.8s ease-in-out infinite",
              }}
            />
            Active · coordinating fleet
          </span>
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "rgba(245,245,245,.55)",
            letterSpacing: ".4px",
            marginTop: 4,
          }}
        >
          Case Manager · Palace Kitchen &amp; Catering · full deal file open
        </div>
      </div>
    </header>
  )
}

function CaseBubble({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        maxWidth: 760,
        alignSelf: "flex-start",
        animation: "casePageFadeIn .28s ease-out",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
          boxShadow: "0 0 8px rgba(44,140,112,.45)",
          flexShrink: 0,
          marginTop: 2,
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 9.5,
            color: "var(--mint, #2c8c70)",
            letterSpacing: ".7px",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          CASE · Case Manager
        </div>
        <div
          style={{
            fontFamily: garamond,
            fontSize: 16,
            lineHeight: 1.55,
            color: "#1a1612",
            whiteSpace: "pre-wrap",
            letterSpacing: ".05px",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  )
}

function UserBubble({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        alignItems: "flex-end",
        animation: "casePageFadeIn .22s ease-out",
      }}
    >
      <div
        style={{
          maxWidth: 620,
          padding: "12px 16px",
          borderRadius: 14,
          background: "rgba(12,10,9,.06)",
          border: "1px solid rgba(12,10,9,.08)",
          fontFamily: inter,
          fontSize: 14,
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
          width: 28,
          height: 28,
          flexShrink: 0,
          borderRadius: "50%",
          background: "#E1F5EE",
          color: "#1D9E75",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: inter,
          fontSize: 11,
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
        gap: 12,
        alignItems: "flex-start",
        alignSelf: "flex-start",
        animation: "casePageFadeIn .22s ease-out",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
          boxShadow: "0 0 8px rgba(44,140,112,.45)",
          flexShrink: 0,
          marginTop: 2,
        }}
      />
      <div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 9.5,
            color: "var(--mint, #2c8c70)",
            letterSpacing: ".7px",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          CASE · Case Manager
        </div>
        <div style={{ display: "inline-flex", gap: 6, paddingTop: 4 }}>
          <Dot delay={0} />
          <Dot delay={140} />
          <Dot delay={280} />
        </div>
      </div>
    </div>
  )
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "rgba(44,140,112,.55)",
        animation: "casePageDot 1.05s ease-in-out infinite",
        animationDelay: `${delay}ms`,
      }}
    />
  )
}

// ── Starter grid (only visible before user has chatted) ───────────────────
function StarterGrid({ onPick }: { onPick: (q: string) => void }) {
  const grouped = STARTER_PROMPTS.reduce<Record<string, Array<typeof STARTER_PROMPTS[number]>>>(
    (acc, p) => {
      const list = acc[p.group] ?? []
      list.push(p)
      acc[p.group] = list
      return acc
    },
    {},
  )

  return (
    <div
      style={{
        marginTop: 6,
        padding: "16px 18px",
        borderRadius: 14,
        background: "rgba(255,255,255,.8)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        animation: "casePageFadeIn .32s ease-out",
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "var(--t3)",
          fontFamily: inter,
          marginBottom: 10,
        }}
      >
        Try starting with…
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: "var(--t3)",
                letterSpacing: ".5px",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              {group}
            </div>
            {items.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onPick(p.question)}
                className="case-starter-btn"
                style={{
                  textAlign: "left",
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--glass-edge, rgba(0,0,0,.08))",
                  background: "rgba(255,255,255,.7)",
                  color: "var(--t1)",
                  fontFamily: inter,
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background 180ms ease-out, border-color 180ms ease-out, transform 180ms ease-out",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Composer ──────────────────────────────────────────────────────────────
function Composer({
  inputRef,
  inputValue,
  onChange,
  onSubmit,
  onKeyDown,
  disabled,
}: {
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  inputValue: string
  onChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  disabled: boolean
}) {
  return (
    <form
      onSubmit={onSubmit}
      style={{
        flexShrink: 0,
        padding: "14px 18px 16px",
        borderTop: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        background: "rgba(12,10,9,.94)",
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          background: "rgba(255,255,255,.07)",
          border: "1px solid rgba(255,255,255,.10)",
          borderRadius: 14,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask CASE anything — Enter to send, Shift+Enter for a new line."
          rows={1}
          disabled={disabled}
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "rgba(245,245,245,.96)",
            fontFamily: garamond,
            fontSize: 15.5,
            lineHeight: 1.5,
            resize: "none",
            maxHeight: 120,
          }}
        />
      </div>
      <button
        type="submit"
        disabled={disabled || !inputValue.trim()}
        aria-label="Send"
        title="Send"
        className="case-send-btn"
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          border: "none",
          background: "var(--mint, #2c8c70)",
          color: "#fff",
          cursor: disabled || !inputValue.trim() ? "default" : "pointer",
          opacity: disabled || !inputValue.trim() ? 0.45 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "transform 160ms ease-out, opacity 160ms ease-out, box-shadow 160ms ease-out",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7h8m-3-3l3 3-3 3" />
        </svg>
      </button>
    </form>
  )
}

// ── Right rail: deal context ──────────────────────────────────────────────
function ContextColumn({ persona }: { persona: Persona }) {
  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <DealSnapshot persona={persona} />
      <AgentFleetCard />
      <DeepLinks />
    </aside>
  )
}

function DealSnapshot({ persona }: { persona: Persona }) {
  const rows: ReadonlyArray<{ label: string; value: string; sub?: string; tone?: "mint" | "peach" }> = [
    { label: "Recommended listing", value: persona.financials.recommendedListingDisplay, sub: `${persona.financials.appliedMultiple}× SDE` },
    { label: "Normalized SDE", value: persona.financials.sdeMidpointDisplay, sub: `Year 3 ${persona.financials.normalizedSDEYear3Display}` },
    { label: "Scorta Score", value: `${persona.scorta.overall}/100`, sub: persona.scorta.label, tone: "mint" },
    { label: "Transferability", value: `${persona.scorta.transferability}/100`, sub: `Owner-dependency ${persona.risk.ownerDependencyScore}/100`, tone: "peach" },
    { label: "SBA 7(a)", value: persona.sba.eligible ? "Eligible" : "Not eligible", sub: `DSCR ${persona.sba.dscr}×` },
  ]
  return (
    <section
      style={{
        padding: "20px 20px 16px",
        borderRadius: 16,
        background: "rgba(255,255,255,.78)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
      }}
    >
      <SectionEyebrow text="Deal snapshot" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
        {rows.map((r) => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: inter, letterSpacing: ".2px" }}>{r.label}</div>
              {r.sub && (
                <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2, fontFamily: inter }}>{r.sub}</div>
              )}
            </div>
            <div
              style={{
                fontFamily: garamond,
                fontSize: 19,
                color:
                  r.tone === "mint"
                    ? "var(--mint, #2c8c70)"
                    : r.tone === "peach"
                      ? "var(--peach, #b86a3e)"
                      : "var(--t1)",
                letterSpacing: "-.2px",
                whiteSpace: "nowrap",
              }}
            >
              {r.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function AgentFleetCard() {
  const fleet: ReadonlyArray<{ name: string; status: string }> = [
    { name: "Ingestion Agent", status: "Idle · books reconciled" },
    { name: "Recast Agent", status: "Idle · add-backs posted" },
    { name: "Owner-Dependency Agent", status: "Active · 5 SOPs pending" },
    { name: "Concentration Agent", status: "Active · NJ Transit confirm" },
    { name: "CIM Agent", status: "Active · drafting" },
    { name: "Lender Ops Agent", status: "Holding · pending your approval" },
  ]
  return (
    <section
      style={{
        padding: "20px 20px 16px",
        borderRadius: 16,
        background: "rgba(255,255,255,.78)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
      }}
    >
      <SectionEyebrow text="Agent fleet" />
      <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
        {fleet.map((f) => (
          <li
            key={f.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12,
              fontFamily: inter,
              color: "var(--t1)",
              lineHeight: 1.4,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: f.status.startsWith("Active")
                  ? "var(--mint, #2c8c70)"
                  : f.status.startsWith("Holding")
                    ? "var(--peach, #b86a3e)"
                    : "rgba(0,0,0,.18)",
                boxShadow: f.status.startsWith("Active") ? "0 0 6px var(--mint, #2c8c70)" : "none",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{f.name}</div>
              <div style={{ fontSize: 10.5, color: "var(--t3)", fontFamily: mono, letterSpacing: ".3px" }}>
                {f.status}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function DeepLinks() {
  const links: ReadonlyArray<{ href: string; label: string }> = [
    { href: "/upload", label: "Add business context" },
    { href: "/risk", label: "Open risk analysis" },
    { href: "/score", label: "Score breakdown" },
    { href: "/vdr", label: "Virtual Data Room" },
  ]
  return (
    <section
      style={{
        padding: "20px 20px 16px",
        borderRadius: 16,
        background: "rgba(255,255,255,.78)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
      }}
    >
      <SectionEyebrow text="Jump to" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="case-jump-link"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--t1)",
              textDecoration: "none",
              padding: "7px 11px",
              borderRadius: 9999,
              border: "1px solid var(--glass-edge, rgba(0,0,0,.10))",
              background: "rgba(255,255,255,.7)",
              transition: "background 180ms ease-out, border-color 180ms ease-out, transform 180ms ease-out",
              fontFamily: inter,
            }}
          >
            {l.label} →
          </Link>
        ))}
      </div>
    </section>
  )
}

function SectionEyebrow({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: "1px",
        textTransform: "uppercase",
        color: "var(--t3)",
        fontFamily: inter,
      }}
    >
      {text}
    </div>
  )
}

// ── Scoped styles ─────────────────────────────────────────────────────────
function ScopedStyles() {
  return (
    <style>{`
      @keyframes casePagePulse {
        0%, 100% { transform: scale(1);    opacity: 1;  }
        50%      { transform: scale(1.10); opacity: .9; }
      }
      @keyframes casePageBlink {
        0%, 100% { opacity: 1;  }
        50%      { opacity: .3; }
      }
      @keyframes casePageFadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes casePageDot {
        0%, 80%, 100% { transform: translateY(0);    opacity: .35; }
        40%           { transform: translateY(-3px); opacity: 1;   }
      }
      .case-back-link:hover {
        background: #fff;
        border-color: rgba(0,0,0,.18);
        transform: translateY(-1px);
      }
      .case-starter-btn:hover {
        background: #fff;
        border-color: rgba(0,0,0,.16);
        transform: translateY(-1px);
      }
      .case-jump-link:hover {
        background: #fff;
        border-color: rgba(0,0,0,.18);
        transform: translateY(-1px);
      }
      .case-send-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(44,140,112,.34);
      }
    `}</style>
  )
}
