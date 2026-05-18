"use client"

import { useRouter } from "next/navigation"
import React from "react"

import type { PERSONA as PersonaShape } from "@/lib/persona"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

// ── Timing (same family as IngestionStation / RecastStation / BoardroomStation T = {…}) ──
const T = {
  streamStepMs: 400, // each analysis line
  streamLines: 5, // 5 lines per stream
  streamTailMs: 320, // pause after both streams complete
  fadeOutMs: 200, // intake fade-out
  surfaceRevealMs: 360, // output surface slide-in
  submitSpinnerMs: 700, // submit → analysis start
  navSpinnerMs: 520, // Open Boardroom press hold
}

type Persona = typeof PersonaShape
type Phase = "intake" | "analyzing" | "output"
type IntakeMode = "questions" | "upload"

// ── Pre-filled answers (locked persona, per spec) ───────────────────────────
type OwnerDepAnswers = {
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  q6: string
  q7: string
  q8: string
}

const OWNER_DEP_DEFAULTS: OwnerDepAnswers = {
  q1: "Catering sales would stop. All new catering inquiries and quotes come directly to me. No one else has the client relationships or knows our pricing model.",
  q2: "Catering client calls and contract negotiations, vendor price negotiations, daily bank deposits, staff scheduling decisions, health inspection responses.",
  q3: "1",
  q4: "1–2",
  q5: "None",
  q6: "There is no formal process. Staff call or text me regardless of where I am.",
  q7: "3–6 months",
  q8: "Yes, most",
}

type ConcentrationAnswers = {
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
}

const CONCENTRATION_DEFAULTS: ConcentrationAnswers = {
  q1: "10–25%",
  q2: "NJ Transit Corporate Catering — we provide lunch and event catering for their Northern NJ offices. 6-year relationship, monthly invoicing, no formal multi-year contract in place.",
  q3: "Month-to-month",
  q4: "2",
  q5: "3–6 months",
}

// ── Owner-Dependency remediation tasks (derived from Q2 answer, per spec) ───
type RemediationTask = {
  title: string
  body: string
  scoreLift: number // points added to transferability
}

const REMEDIATION_TASKS: ReadonlyArray<RemediationTask> = [
  {
    title: "Document catering sales & contract negotiation playbook",
    body: "Codify the pricing model, client intake flow, and contract terms so a successor can quote catering inquiries without owner involvement.",
    scoreLift: 8,
  },
  {
    title: "Standardize vendor price negotiation procedures",
    body: "Capture vendor list, current pricing tiers, and renegotiation cadence. Transfer authority to a named successor with documented thresholds.",
    scoreLift: 5,
  },
  {
    title: "Delegate daily bank deposit & cash handling",
    body: "Move daily deposit responsibility to a tenured manager with documented controls. Owner reviews weekly instead of executing daily.",
    scoreLift: 4,
  },
  {
    title: "Build staff scheduling SOP & decision matrix",
    body: "Replace ad-hoc scheduling with a documented matrix covering shift coverage rules, time-off requests, and seasonal staffing patterns.",
    scoreLift: 4,
  },
  {
    title: "Document health inspection response protocol",
    body: "Written protocol for NJ health department interactions — first responder, escalation path, and remediation timeline. Removes owner from the inspection-day path.",
    scoreLift: 3,
  },
]

// ── Concentration single task ──────────────────────────────────────────────
const CONCENTRATION_TASK = {
  title: "Convert NJ Transit relationship into a 3-year written contract",
  body: "Draft a multi-year extension proposal for NJ Transit Corporate Catering. Document the 6-year tenure, monthly invoicing history, and on-time delivery record for the lender package.",
  trigger: "Search Fund deal-breaker · Lender monitoring flag",
}

// ── Analysis stream lines (5 per agent, per spec) ──────────────────────────
const OWNER_DEP_STREAM: ReadonlyArray<string> = [
  "Reading operational dependency answers...",
  "Scoring task surface against replaceability model...",
  "Flagging undocumented processes...",
  "Calculating transferability score...",
  "Generating remediation playbook...",
]

const CONCENTRATION_STREAM: ReadonlyArray<string> = [
  "Reading customer concentration answers...",
  "Cross-referencing SBA concentration threshold...",
  "Flagging contract coverage gap...",
  "Assessing revenue sustainability...",
  "Generating contract extension playbook...",
]

// ─────────────────────────────────────────────────────────────────────────────
export function RiskStation({ persona }: { persona: Persona }) {
  const router = useRouter()

  const [phase, setPhase] = React.useState<Phase>("intake")
  const [intakeMode, setIntakeMode] = React.useState<IntakeMode>("questions")
  const [submitting, setSubmitting] = React.useState(false)
  const [uploadTipShown, setUploadTipShown] = React.useState(false)
  const uploadTipTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pre-filled answers (editable but ignored for analysis — happy path only)
  const [ownerDep, setOwnerDep] = React.useState<OwnerDepAnswers>(OWNER_DEP_DEFAULTS)
  const [concentration, setConcentration] =
    React.useState<ConcentrationAnswers>(CONCENTRATION_DEFAULTS)

  // Analysis stream state — both agents progress in lockstep
  const [streamIdx, setStreamIdx] = React.useState(0)

  // Output reveal state
  const [outputVisible, setOutputVisible] = React.useState(false)

  // Open Boardroom CTA
  const [boardroomPhase, setBoardroomPhase] = React.useState<"idle" | "navigating">("idle")

  // ── Submit → analysis sequence ────────────────────────────────────────────
  function onSubmit() {
    if (submitting || phase !== "intake") return
    setSubmitting(true)
    setTimeout(() => {
      setPhase("analyzing")
      setSubmitting(false)
    }, T.submitSpinnerMs)
  }

  // ── Drive the dual-stream analysis sequence ───────────────────────────────
  React.useEffect(() => {
    if (phase !== "analyzing") return
    setStreamIdx(0)
    const timers: Array<ReturnType<typeof setTimeout>> = []
    for (let i = 1; i < T.streamLines; i++) {
      timers.push(setTimeout(() => setStreamIdx(i), T.streamStepMs * i))
    }
    timers.push(
      setTimeout(() => {
        setPhase("output")
        setTimeout(() => setOutputVisible(true), 80)
      }, T.streamStepMs * T.streamLines + T.streamTailMs),
    )
    return () => timers.forEach(clearTimeout)
  }, [phase])

  function onOpenBoardroom() {
    if (boardroomPhase !== "idle") return
    setBoardroomPhase("navigating")
    setTimeout(() => router.push("/boardroom"), T.navSpinnerMs)
  }

  function onUploadClick() {
    setUploadTipShown(true)
    if (uploadTipTimer.current) clearTimeout(uploadTipTimer.current)
    uploadTipTimer.current = setTimeout(() => setUploadTipShown(false), 2200)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <ScopedStyles />
      <StationHeader phase={phase} />
      <AriaIntro persona={persona} phase={phase} />

      {phase === "intake" && (
        <IntakeSurface
          mode={intakeMode}
          onSetMode={setIntakeMode}
          ownerDep={ownerDep}
          onOwnerDep={setOwnerDep}
          concentration={concentration}
          onConcentration={setConcentration}
          submitting={submitting}
          onSubmit={onSubmit}
          uploadTipShown={uploadTipShown}
          onUploadClick={onUploadClick}
        />
      )}

      {phase === "analyzing" && <AnalysisSurface streamIdx={streamIdx} />}

      {phase === "output" && (
        <>
          <OutputSurface
            visible={outputVisible}
            persona={persona}
          />
          <BoardroomGate
            visible={outputVisible}
            phase={boardroomPhase}
            onOpen={onOpenBoardroom}
          />
        </>
      )}
    </div>
  )
}

// ── Station header ──────────────────────────────────────────────────────────
function StationHeader({ phase }: { phase: Phase }) {
  const live = phase === "analyzing"
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: "var(--t3)",
            fontWeight: 500,
            letterSpacing: ".7px",
            textTransform: "uppercase",
          }}
        >
          Station 06 · /risk
        </div>
        <div style={{ height: 1, width: 22, background: "var(--div)" }} />
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "var(--t2)",
            fontFamily: inter,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Owner-Dependency · Concentration Agents
          {live && (
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--mint, #2c8c70)",
                boxShadow: "0 0 6px var(--mint, #2c8c70)",
                animation: "riskBlink 1.1s ease-in-out infinite",
              }}
            />
          )}
        </div>
      </div>
      <h1
        style={{
          fontFamily: garamond,
          fontWeight: 400,
          fontSize: 38,
          lineHeight: 1.08,
          letterSpacing: "-.6px",
          color: "var(--t1)",
          marginTop: 4,
        }}
      >
        Risk Analysis
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--t2)",
          lineHeight: 1.6,
          maxWidth: 720,
          fontFamily: inter,
        }}
      >
        Two specialized agents will read your answers, score the business against SBA and
        buyer-thesis thresholds, and produce a remediation plan. Their output becomes the
        Boardroom&apos;s view of how transferable Palace Kitchen is today — and what it would
        take to close the gap.
      </p>
    </header>
  )
}

// ── ARIA intro banner ──────────────────────────────────────────────────────
function AriaIntro({ persona, phase }: { persona: Persona; phase: Phase }) {
  const businessFirst = persona.identity.businessName.split(" ")[0]
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 13,
        padding: "14px 16px",
        borderRadius: 14,
        background: "rgba(255,255,255,.7)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        boxShadow: "0 1px 0 rgba(255,255,255,.92) inset",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          flexShrink: 0,
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
          boxShadow: "0 0 8px rgba(44,140,112,.45)",
          marginTop: 1,
          animation: "riskAriaPulse 3.2s ease-in-out infinite",
        }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "var(--t2)",
            fontWeight: 500,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          ARIA · Case Manager
        </div>
        <div style={{ fontSize: 13.5, color: "var(--t1)", lineHeight: 1.55, fontFamily: inter }}>
          {phase === "intake" && (
            <>
              To assess how transferable {businessFirst} is to a new owner, I need to understand
              how the business actually runs day to day. Answer the questions below — or upload a
              one-pager if you&apos;ve already prepared one. The Owner-Dependency Agent will score
              your business and generate a remediation plan from your answers.
            </>
          )}
          {phase === "analyzing" && (
            <>
              The Owner-Dependency Agent and Concentration Agent are reading your answers in
              parallel. I&apos;ll surface a scored profile and remediation plan the moment both
              finish.
            </>
          )}
          {phase === "output" && (
            <>
              Analysis complete. Review the transferability profile and remediation plan below.
              When you&apos;re ready, hand off to the Boardroom — three buyer agents will weigh in
              before any work orders dispatch.
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Intake surface ─────────────────────────────────────────────────────────
function IntakeSurface({
  mode,
  onSetMode,
  ownerDep,
  onOwnerDep,
  concentration,
  onConcentration,
  submitting,
  onSubmit,
  uploadTipShown,
  onUploadClick,
}: {
  mode: IntakeMode
  onSetMode: (m: IntakeMode) => void
  ownerDep: OwnerDepAnswers
  onOwnerDep: React.Dispatch<React.SetStateAction<OwnerDepAnswers>>
  concentration: ConcentrationAnswers
  onConcentration: React.Dispatch<React.SetStateAction<ConcentrationAnswers>>
  submitting: boolean
  onSubmit: () => void
  uploadTipShown: boolean
  onUploadClick: () => void
}) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 22,
        animation: "riskFadeIn .32s ease-out",
      }}
    >
      <IntakeToggle mode={mode} onSet={onSetMode} />

      {mode === "questions" ? (
        <>
          <OwnerDepIntake answers={ownerDep} onChange={onOwnerDep} />
          <ConcentrationIntake answers={concentration} onChange={onConcentration} />
          <SubmitBar submitting={submitting} onSubmit={onSubmit} />
        </>
      ) : (
        <UploadDropzone shown={uploadTipShown} onClick={onUploadClick} />
      )}
    </section>
  )
}

function IntakeToggle({ mode, onSet }: { mode: IntakeMode; onSet: (m: IntakeMode) => void }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignSelf: "flex-start",
        padding: 4,
        background: "rgba(12,10,9,.04)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderRadius: 9999,
        gap: 2,
      }}
    >
      {(["questions", "upload"] as const).map((key) => {
        const active = mode === key
        const label = key === "questions" ? "Answer Questions" : "Upload One-Pager"
        return (
          <button
            key={key}
            onClick={() => onSet(key)}
            style={{
              all: "unset",
              padding: "8px 16px",
              borderRadius: 9999,
              fontFamily: inter,
              fontSize: 12.5,
              fontWeight: 600,
              color: active ? "var(--t1)" : "var(--t3)",
              background: active ? "rgba(255,255,255,.95)" : "transparent",
              boxShadow: active ? "0 2px 8px rgba(12,10,9,.08)" : "none",
              cursor: "pointer",
              transition: "background 180ms ease-out, color 180ms ease-out",
              letterSpacing: "-.1px",
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function UploadDropzone({ shown, onClick }: { shown: boolean; onClick: () => void }) {
  return (
    <div style={{ position: "relative", animation: "riskFadeIn .28s ease-out" }}>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onClick()
          }
        }}
        style={{
          padding: "60px 32px",
          borderRadius: 18,
          background: "rgba(255,255,255,.7)",
          border: "2px dashed var(--glass-edge, rgba(12,10,9,.12))",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        <div
          aria-hidden
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(44,140,112,.10)",
            border: "1px solid var(--mint-edge, rgba(44,140,112,.26))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--mint, #2c8c70)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontFamily: garamond,
              fontSize: 22,
              fontWeight: 500,
              color: "var(--t1)",
              letterSpacing: "-.3px",
            }}
          >
            Drop a one-pager here, or click to browse
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--t2)",
              fontFamily: inter,
              lineHeight: 1.55,
              maxWidth: 520,
            }}
          >
            Upload a one-pager describing your operations, staff structure, and key customer
            relationships. The Ingestion Agent will extract the structured fields and run the same
            analysis.
          </div>
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: "var(--t3)",
            letterSpacing: ".4px",
          }}
        >
          PDF · DOCX · up to 25MB
        </div>
      </div>
      {shown && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translate(-50%, 10px)",
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(12,10,9,.94)",
            color: "rgba(245,245,245,.95)",
            fontSize: 11.5,
            lineHeight: 1.45,
            fontFamily: inter,
            whiteSpace: "nowrap",
            boxShadow: "0 12px 30px rgba(12,10,9,.22)",
            animation: "riskLineIn .22s ease-out",
            zIndex: 30,
          }}
        >
          Document ingestion available — demo uses Q&amp;A mode for this walkthrough.
        </div>
      )}
    </div>
  )
}

// ── Owner-Dependency intake ────────────────────────────────────────────────
function OwnerDepIntake({
  answers,
  onChange,
}: {
  answers: OwnerDepAnswers
  onChange: React.Dispatch<React.SetStateAction<OwnerDepAnswers>>
}) {
  function set<K extends keyof OwnerDepAnswers>(key: K, value: OwnerDepAnswers[K]) {
    onChange((prev) => ({ ...prev, [key]: value }))
  }
  return (
    <IntakeBlock
      sectionLabel="Owner-Dependency Assessment"
      agentLabel="Owner-Dependency Agent · intake"
      subhead="These answers determine how transferable your business is to a new owner and where the agent will focus remediation."
      accent="var(--mint, #2c8c70)"
      accentSoft="rgba(44,140,112,.10)"
    >
      <QField
        label="If you were unavailable for 30 days, what would break first?"
        index={1}
      >
        <TextArea value={answers.q1} rows={3} onChange={(v) => set("q1", v)} />
      </QField>

      <QField
        label="Which of your operational tasks requires your personal involvement to complete?"
        index={2}
      >
        <TextArea value={answers.q2} rows={3} onChange={(v) => set("q2", v)} />
      </QField>

      <QField
        label="How many employees have been with you for 3 or more years?"
        index={3}
      >
        <NumberInput value={answers.q3} onChange={(v) => set("q3", v)} />
      </QField>

      <QField
        label="How many of your staff could open and run the kitchen for a full day without you present?"
        index={4}
      >
        <SelectInput
          value={answers.q4}
          onChange={(v) => set("q4", v)}
          options={["None", "1–2", "3–5", "Most of them"]}
        />
      </QField>

      <QField
        label="Do you have written procedures for any of your core operations?"
        index={5}
      >
        <SelectInput
          value={answers.q5}
          onChange={(v) => set("q5", v)}
          options={["None", "A few informal notes", "Some written SOPs", "Comprehensive SOPs"]}
        />
      </QField>

      <QField
        label="Who handles customer complaints when you are not available?"
        index={6}
      >
        <TextArea value={answers.q6} rows={2} onChange={(v) => set("q6", v)} />
      </QField>

      <QField
        label="How long would it take a new owner to learn everything they need to run the business independently?"
        index={7}
      >
        <SelectInput
          value={answers.q7}
          onChange={(v) => set("q7", v)}
          options={["< 30 days", "1–3 months", "3–6 months", "6+ months"]}
        />
      </QField>

      <QField
        label="Are any of your key vendor relationships or contracts in your name personally rather than the business name?"
        index={8}
      >
        <SelectInput
          value={answers.q8}
          onChange={(v) => set("q8", v)}
          options={["Yes, most", "Some", "No, all in business name"]}
        />
      </QField>
    </IntakeBlock>
  )
}

// ── Concentration intake ───────────────────────────────────────────────────
function ConcentrationIntake({
  answers,
  onChange,
}: {
  answers: ConcentrationAnswers
  onChange: React.Dispatch<React.SetStateAction<ConcentrationAnswers>>
}) {
  function set<K extends keyof ConcentrationAnswers>(key: K, value: ConcentrationAnswers[K]) {
    onChange((prev) => ({ ...prev, [key]: value }))
  }
  return (
    <IntakeBlock
      sectionLabel="Customer Concentration Assessment"
      agentLabel="Concentration Agent · intake"
      subhead="These answers determine your revenue concentration risk and contract coverage."
      accent="var(--sky, #4a7ba8)"
      accentSoft="rgba(74,123,168,.10)"
    >
      <QField
        label="What percentage of your annual revenue comes from your single largest customer?"
        index={1}
      >
        <SelectInput
          value={answers.q1}
          onChange={(v) => set("q1", v)}
          options={["< 10%", "10–25%", "25–50%", "> 50%"]}
        />
      </QField>

      <QField
        label="Who is your largest customer and what is the nature of the relationship?"
        index={2}
      >
        <TextArea value={answers.q2} rows={2} onChange={(v) => set("q2", v)} />
      </QField>

      <QField
        label="Do you have a signed contract with your top customer?"
        index={3}
      >
        <SelectInput
          value={answers.q3}
          onChange={(v) => set("q3", v)}
          options={["Yes, multi-year", "Yes, annual", "Month-to-month", "No contract"]}
        />
      </QField>

      <QField
        label="How many customers account for more than 5% of your annual revenue?"
        index={4}
      >
        <NumberInput value={answers.q4} onChange={(v) => set("q4", v)} />
      </QField>

      <QField
        label="If your largest customer ended the relationship tomorrow, how long could the business sustain current operations?"
        index={5}
      >
        <SelectInput
          value={answers.q5}
          onChange={(v) => set("q5", v)}
          options={["< 1 month", "1–3 months", "3–6 months", "6+ months"]}
        />
      </QField>
    </IntakeBlock>
  )
}

function IntakeBlock({
  sectionLabel,
  agentLabel,
  subhead,
  accent,
  accentSoft,
  children,
}: {
  sectionLabel: string
  agentLabel: string
  subhead: string
  accent: string
  accentSoft: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        padding: "24px 26px 22px",
        background: "rgba(255,255,255,.82)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderRadius: 18,
        borderTop: `3px solid ${accent}`,
        boxShadow:
          "0 1px 0 rgba(255,255,255,.92) inset, 0 -1px 0 rgba(0,0,0,.04) inset, 0 12px 36px rgba(12,10,9,.06)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            padding: "3px 9px",
            borderRadius: 9999,
            background: accentSoft,
            fontFamily: mono,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            color: accent,
          }}
        >
          {agentLabel}
        </div>
        <h2
          style={{
            fontFamily: garamond,
            fontSize: 26,
            fontWeight: 400,
            color: "var(--t1)",
            letterSpacing: "-.4px",
            lineHeight: 1.15,
            marginTop: 2,
          }}
        >
          {sectionLabel}
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--t3)",
            fontFamily: inter,
            lineHeight: 1.55,
            maxWidth: 680,
          }}
        >
          {subhead}
        </p>
      </header>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
    </section>
  )
}

function QField({
  label,
  index,
  children,
}: {
  label: string
  index: number
  children: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label
        style={{
          display: "flex",
          gap: 10,
          alignItems: "baseline",
          fontFamily: inter,
          fontSize: 13.5,
          color: "var(--t1)",
          lineHeight: 1.5,
          fontWeight: 500,
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "var(--t3)",
            fontWeight: 600,
            letterSpacing: ".5px",
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          Q{index}
        </span>
        <span>{label}</span>
      </label>
      {children}
    </div>
  )
}

function TextArea({
  value,
  rows,
  onChange,
}: {
  value: string
  rows: number
  onChange: (v: string) => void
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid var(--glass-edge, rgba(12,10,9,.10))",
        background: "rgba(255,255,255,.7)",
        fontFamily: inter,
        fontSize: 13,
        lineHeight: 1.55,
        color: "var(--t1)",
        resize: "vertical",
        outline: "none",
        boxShadow: "0 1px 0 rgba(255,255,255,.92) inset",
      }}
      className="risk-input"
    />
  )
}

function NumberInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: 120,
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid var(--glass-edge, rgba(12,10,9,.10))",
        background: "rgba(255,255,255,.7)",
        fontFamily: inter,
        fontSize: 13,
        color: "var(--t1)",
        outline: "none",
        boxShadow: "0 1px 0 rgba(255,255,255,.92) inset",
      }}
      className="risk-input"
    />
  )
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: ReadonlyArray<string>
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "fit-content",
        minWidth: 200,
        padding: "10px 36px 10px 12px",
        borderRadius: 10,
        border: "1px solid var(--glass-edge, rgba(12,10,9,.10))",
        background:
          "rgba(255,255,255,.7) url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236f6963' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\") no-repeat right 12px center",
        fontFamily: inter,
        fontSize: 13,
        color: "var(--t1)",
        outline: "none",
        appearance: "none",
        WebkitAppearance: "none",
        cursor: "pointer",
        boxShadow: "0 1px 0 rgba(255,255,255,.92) inset",
      }}
      className="risk-input"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}

// ── Submit bar ─────────────────────────────────────────────────────────────
function SubmitBar({ submitting, onSubmit }: { submitting: boolean; onSubmit: () => void }) {
  return (
    <section
      style={{
        padding: "22px 26px",
        background: "linear-gradient(180deg, rgba(44,140,112,.10) 0%, rgba(44,140,112,.04) 100%)",
        border: "1px solid var(--mint-edge, rgba(44,140,112,.28))",
        borderRadius: 16,
        boxShadow: "0 1px 0 rgba(255,255,255,.6) inset, 0 8px 24px rgba(44,140,112,.10)",
        display: "flex",
        alignItems: "center",
        gap: 18,
        flexWrap: "wrap",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
          boxShadow: "0 0 10px rgba(44,140,112,.55)",
          animation: "riskAriaPulse 3.2s ease-in-out infinite",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 280 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "var(--mint, #2c8c70)",
            fontWeight: 600,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Ready when you are
        </div>
        <div
          style={{
            fontSize: 14,
            color: "var(--t1)",
            lineHeight: 1.45,
            fontFamily: inter,
          }}
        >
          The Owner-Dependency Agent and Concentration Agent will analyze your answers and
          generate your risk profile and remediation plan.
        </div>
      </div>
      <button
        onClick={onSubmit}
        disabled={submitting}
        className="risk-primary"
        style={{
          height: 44,
          padding: "0 22px",
          borderRadius: 9999,
          background: "var(--btn-bg)",
          color: "var(--btn-fg)",
          border: "none",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: inter,
          letterSpacing: "-.1px",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          cursor: submitting ? "default" : "pointer",
          boxShadow: "0 6px 22px rgba(12,10,9,.18)",
          transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
          minWidth: 280,
          justifyContent: "center",
        }}
      >
        {submitting && <Spinner light />}
        <span>{submitting ? "Analyzing your answers..." : "Confirm Answers & Run Analysis"}</span>
        {!submitting && <span style={{ transform: "translateY(-1px)" }}>→</span>}
      </button>
    </section>
  )
}

// ── Analysis surface (dual-stream terminal card) ────────────────────────────
function AnalysisSurface({ streamIdx }: { streamIdx: number }) {
  return (
    <section
      style={{
        padding: "22px 24px 24px",
        background: "rgba(12,10,9,.92)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 18,
        boxShadow: "0 18px 44px rgba(12,10,9,.18)",
        animation: "riskFadeIn .3s ease-out",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          paddingBottom: 14,
          borderBottom: "1px solid rgba(255,255,255,.07)",
          marginBottom: 16,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--mint, #2c8c70)",
            boxShadow: "0 0 8px var(--mint, #2c8c70)",
            animation: "riskBlink 1.1s ease-in-out infinite",
          }}
        />
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "rgba(167,229,211,.95)",
            fontWeight: 600,
            letterSpacing: ".7px",
            textTransform: "uppercase",
          }}
        >
          Risk Analysis · Agents Running In Parallel
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: "rgba(245,245,245,.55)",
            letterSpacing: ".4px",
          }}
        >
          palace-kitchen · live
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
        }}
      >
        <StreamColumn
          eyebrow="Owner-Dependency Agent"
          accent="var(--mint, #2c8c70)"
          lines={OWNER_DEP_STREAM}
          streamIdx={streamIdx}
        />
        <StreamColumn
          eyebrow="Concentration Agent"
          accent="var(--sky, #4a7ba8)"
          lines={CONCENTRATION_STREAM}
          streamIdx={streamIdx}
        />
      </div>

      <div
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,.07)",
          fontFamily: mono,
          fontSize: 11.5,
          color: "rgba(167,229,211,.85)",
          letterSpacing: ".3px",
          textAlign: "center",
          opacity: streamIdx >= T.streamLines - 1 ? 1 : 0.55,
          transition: "opacity 240ms ease-out",
        }}
      >
        {streamIdx >= T.streamLines - 1
          ? "Analysis complete. Generating risk profile..."
          : `Streaming agent reasoning · ${streamIdx + 1} / ${T.streamLines}`}
      </div>
    </section>
  )
}

function StreamColumn({
  eyebrow,
  accent,
  lines,
  streamIdx,
}: {
  eyebrow: string
  accent: string
  lines: ReadonlyArray<string>
  streamIdx: number
}) {
  const visible = lines.slice(0, Math.min(streamIdx + 1, lines.length))
  return (
    <div
      style={{
        padding: "14px 16px 16px",
        background: "rgba(255,255,255,.04)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,.06)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: 220,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: mono,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: ".7px",
          textTransform: "uppercase",
          color: accent,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 6px ${accent}`,
            animation: "riskBlink 1.1s ease-in-out infinite",
          }}
        />
        {eyebrow}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {visible.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: mono,
              fontSize: 12,
              color: i === visible.length - 1 ? "rgba(245,245,245,.92)" : "rgba(245,245,245,.55)",
              lineHeight: 1.55,
              letterSpacing: ".15px",
              animation: "riskLineIn .28s ease-out",
            }}
          >
            {line}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
        {lines.map((_, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              flex: 1,
              height: 3,
              borderRadius: 9999,
              background: i <= streamIdx ? accent : "rgba(255,255,255,.10)",
              transition: "background 240ms ease-out",
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Output surface ─────────────────────────────────────────────────────────
function OutputSurface({ visible, persona }: { visible: boolean; persona: Persona }) {
  return (
    <section
      aria-hidden={!visible}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity ${T.surfaceRevealMs}ms ease-out, transform ${T.surfaceRevealMs}ms ease-out`,
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      <OwnerDepOutput persona={persona} />
      <ConcentrationOutput persona={persona} />
    </section>
  )
}

// ── Section 1 — Owner-Dependency output (visually dominant) ────────────────
function OwnerDepOutput({ persona }: { persona: Persona }) {
  const score = persona.risk.ownerDependencyScore
  const target = persona.risk.targetTransferability
  const totalLift = REMEDIATION_TASKS.reduce((acc, t) => acc + t.scoreLift, 0)
  return (
    <section
      style={{
        padding: "28px 30px 26px",
        background: "rgba(255,255,255,.82)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderTop: "3px solid var(--mint, #2c8c70)",
        borderRadius: 18,
        boxShadow:
          "0 1px 0 rgba(255,255,255,.92) inset, 0 -1px 0 rgba(0,0,0,.04) inset, 0 16px 40px rgba(12,10,9,.06)",
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "var(--mint, #2c8c70)",
            fontWeight: 600,
            letterSpacing: ".7px",
            textTransform: "uppercase",
          }}
        >
          Owner-Dependency Agent · Output
        </div>
        <h2
          style={{
            fontFamily: garamond,
            fontSize: 30,
            fontWeight: 400,
            color: "var(--t1)",
            letterSpacing: "-.5px",
            lineHeight: 1.1,
          }}
        >
          Transferability profile & remediation plan
        </h2>
        <p style={{ fontSize: 13.5, color: "var(--t2)", fontFamily: inter, lineHeight: 1.55, maxWidth: 760 }}>
          Your answers indicate high owner-dependency. You identified 5 tasks that require your
          personal involvement, have 0 documented SOPs, and most vendor contracts are in your name
          personally. The plan below closes the gap from {score} / 100 to {target} / 100 — adding
          approximately {persona.risk.fixValueUnlockDisplay} in deal value.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 320px) minmax(0, 1fr)", gap: 22 }}>
        <TransferabilityDonut score={score} target={target} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ProjectedOutcomeCard persona={persona} totalLift={totalLift} />
          <SignalRow
            items={[
              { label: "Staff with 3+ yr tenure", value: `${persona.risk.staffTenuredCount} of ${persona.risk.staffTotal}` },
              { label: "Documented SOPs", value: `${persona.risk.sopsDocumented}` },
              { label: "Key-person risk", value: persona.risk.keyPersonRiskLevel },
            ]}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <SectionLabel>Remediation plan — 5 tasks · Owner-Dependency Agent</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {REMEDIATION_TASKS.map((task, i) => (
            <TaskRow key={i} idx={i + 1} task={task} />
          ))}
        </div>
        <ReviewApproveStrip
          label="Review & Approve Remediation Plan"
          hint="Plan locks into the Boardroom work order once the Owner-Dependency Agent's output is approved downstream."
        />
      </div>
    </section>
  )
}

function TransferabilityDonut({ score, target }: { score: number; target: number }) {
  const radius = 78
  const circumference = 2 * Math.PI * radius
  const scoreOffset = circumference - (score / 100) * circumference
  const targetOffset = circumference - (target / 100) * circumference
  return (
    <div
      style={{
        padding: "20px 18px 18px",
        background: "rgba(44,140,112,.05)",
        border: "1px solid var(--mint-edge, rgba(44,140,112,.20))",
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{ position: "relative", width: 200, height: 200 }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="rgba(12,10,9,.08)"
            strokeWidth="14"
            fill="none"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="var(--mint, #2c8c70)"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={targetOffset}
            transform="rotate(-90 100 100)"
            opacity="0.28"
            style={{ transition: "stroke-dashoffset 800ms ease-out" }}
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="var(--peach, #b86a3e)"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={scoreOffset}
            transform="rotate(-90 100 100)"
            style={{ animation: "riskDonutDraw 900ms ease-out" }}
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
            gap: 2,
          }}
        >
          <div
            style={{
              fontFamily: garamond,
              fontSize: 56,
              fontWeight: 400,
              color: "var(--peach, #b86a3e)",
              letterSpacing: "-1.5px",
              lineHeight: 1,
            }}
          >
            {score}
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".7px",
              textTransform: "uppercase",
              color: "var(--t3)",
            }}
          >
            / 100 Transferability
          </div>
        </div>
      </div>
      <div
        style={{
          width: "100%",
          paddingTop: 12,
          borderTop: "1px dashed var(--mint-edge, rgba(44,140,112,.28))",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <DonutLegendRow
          dotColor="var(--peach, #b86a3e)"
          label="Today"
          value={`${score} / 100`}
        />
        <DonutLegendRow
          dotColor="var(--mint, #2c8c70)"
          dotOpacity={0.5}
          label="Target (post-remediation)"
          value={`${target} / 100`}
        />
      </div>
    </div>
  )
}

function DonutLegendRow({
  dotColor,
  dotOpacity,
  label,
  value,
}: {
  dotColor: string
  dotOpacity?: number
  label: string
  value: string
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        fontFamily: inter,
        fontSize: 12,
        color: "var(--t2)",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span
          aria-hidden
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: dotColor,
            opacity: dotOpacity ?? 1,
          }}
        />
        {label}
      </span>
      <span style={{ fontFamily: mono, fontSize: 11.5, color: "var(--t1)", fontWeight: 600 }}>
        {value}
      </span>
    </div>
  )
}

function ProjectedOutcomeCard({
  persona,
  totalLift,
}: {
  persona: Persona
  totalLift: number
}) {
  return (
    <div
      style={{
        padding: "18px 20px",
        background: "linear-gradient(180deg, rgba(44,140,112,.10) 0%, rgba(44,140,112,.04) 100%)",
        border: "1px solid var(--mint-edge, rgba(44,140,112,.28))",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: ".7px",
          textTransform: "uppercase",
          color: "var(--mint, #2c8c70)",
        }}
      >
        Projected outcome · 5 tasks completed
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        <OutcomeMetric
          eyebrow="Transferability"
          value={`${persona.risk.ownerDependencyScore} → ${persona.risk.targetTransferability}`}
          sub={`+${totalLift} points`}
        />
        <OutcomeMetric
          eyebrow="Deal value unlock"
          value={persona.risk.fixValueUnlockDisplay}
          sub="lender + buyer pool"
          accent
        />
        <OutcomeMetric
          eyebrow="Effort"
          value="~6 weeks"
          sub="agent-assisted SOP gen"
        />
      </div>
    </div>
  )
}

function OutcomeMetric({
  eyebrow,
  value,
  sub,
  accent,
}: {
  eyebrow: string
  value: string
  sub: string
  accent?: boolean
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          fontFamily: inter,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: ".9px",
          textTransform: "uppercase",
          color: "var(--t3)",
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontFamily: garamond,
          fontSize: accent ? 26 : 22,
          fontWeight: 500,
          color: accent ? "var(--mint, #2c8c70)" : "var(--t1)",
          letterSpacing: "-.3px",
          lineHeight: 1.05,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: inter,
          fontSize: 11.5,
          color: "var(--t3)",
          lineHeight: 1.4,
        }}
      >
        {sub}
      </div>
    </div>
  )
}

function SignalRow({ items }: { items: ReadonlyArray<{ label: string; value: string }> }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        gap: 1,
        background: "var(--glass-edge, rgba(0,0,0,.07))",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {items.map((it) => (
        <div
          key={it.label}
          style={{
            padding: "12px 14px",
            background: "rgba(255,255,255,.7)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              fontFamily: inter,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".9px",
              textTransform: "uppercase",
              color: "var(--t3)",
            }}
          >
            {it.label}
          </div>
          <div
            style={{
              fontFamily: garamond,
              fontSize: 19,
              fontWeight: 500,
              color: "var(--t1)",
              letterSpacing: "-.2px",
              lineHeight: 1.1,
            }}
          >
            {it.value}
          </div>
        </div>
      ))}
    </div>
  )
}

function TaskRow({ idx, task }: { idx: number; task: RemediationTask }) {
  const [hover, setHover] = React.useState(false)
  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "14px 16px",
        background: "rgba(255,255,255,.7)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderRadius: 12,
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        transform: hover ? "translateY(-1px)" : "translateY(0)",
        boxShadow: hover ? "0 8px 18px rgba(12,10,9,.07)" : "none",
        transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: "rgba(44,140,112,.10)",
          border: "1px solid var(--mint-edge, rgba(44,140,112,.28))",
          color: "var(--mint, #2c8c70)",
          fontFamily: mono,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: ".3px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {idx}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          style={{
            fontFamily: inter,
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--t1)",
            letterSpacing: "-.1px",
            lineHeight: 1.35,
          }}
        >
          {task.title}
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: "var(--t2)",
            fontFamily: inter,
            lineHeight: 1.55,
          }}
        >
          {task.body}
        </div>
      </div>
      <div
        style={{
          fontFamily: mono,
          fontSize: 11,
          color: "var(--mint, #2c8c70)",
          letterSpacing: ".3px",
          fontWeight: 600,
          padding: "5px 9px",
          background: "rgba(44,140,112,.08)",
          border: "1px solid var(--mint-edge, rgba(44,140,112,.22))",
          borderRadius: 9999,
          whiteSpace: "nowrap",
          flexShrink: 0,
          alignSelf: "center",
        }}
      >
        +{task.scoreLift} pts
      </div>
    </article>
  )
}

// ── Section 2 — Concentration output (smaller, less visually dominant) ─────
function ConcentrationOutput({ persona }: { persona: Persona }) {
  const share = persona.risk.topCustomerShare
  return (
    <section
      style={{
        padding: "24px 28px 22px",
        background: "rgba(255,255,255,.82)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderTop: "3px solid var(--sky, #4a7ba8)",
        borderRadius: 18,
        boxShadow:
          "0 1px 0 rgba(255,255,255,.92) inset, 0 -1px 0 rgba(0,0,0,.04) inset, 0 12px 32px rgba(12,10,9,.05)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "var(--sky, #4a7ba8)",
            fontWeight: 600,
            letterSpacing: ".7px",
            textTransform: "uppercase",
          }}
        >
          Concentration Agent · Output
        </div>
        <h2
          style={{
            fontFamily: garamond,
            fontSize: 24,
            fontWeight: 400,
            color: "var(--t1)",
            letterSpacing: "-.4px",
            lineHeight: 1.15,
          }}
        >
          Revenue concentration & contract coverage
        </h2>
        <p style={{ fontSize: 13, color: "var(--t2)", fontFamily: inter, lineHeight: 1.55, maxWidth: 760 }}>
          {persona.risk.topAccountName} accounts for {share}% of revenue on a month-to-month
          arrangement. The absence of a multi-year contract is a Search Fund deal-breaker and a
          lender monitoring flag.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 220px) minmax(0, 1fr)",
          gap: 22,
          alignItems: "stretch",
        }}
      >
        <ConcentrationDonut share={share} />

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SignalRow
            items={[
              { label: "Top account", value: persona.risk.topAccountName },
              { label: "Tenure", value: `${persona.risk.topAccountTenureYears} years` },
              {
                label: "Contract status",
                value: "Month-to-month",
              },
            ]}
          />
          <div
            style={{
              padding: "12px 14px",
              background: "rgba(74,123,168,.06)",
              border: "1px solid rgba(74,123,168,.20)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: inter,
              fontSize: 12.5,
              color: "var(--t1)",
              lineHeight: 1.5,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--sky, #4a7ba8)",
                flexShrink: 0,
              }}
            />
            <span>
              <strong style={{ fontWeight: 600 }}>{persona.risk.concentrationRiskLabel}.</strong>{" "}
              {persona.risk.concentrationLevel === "MODERATE" ? "Concentration is" : "Concentration is"}{" "}
              below the SBA flag threshold but the lack of a written contract is the risk —
              not the share.
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <SectionLabel>Concentration playbook — 1 task · Concentration Agent</SectionLabel>
        <article
          style={{
            padding: "16px 18px",
            background: "rgba(255,255,255,.7)",
            border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
            borderRadius: 12,
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "rgba(74,123,168,.10)",
              border: "1px solid rgba(74,123,168,.28)",
              color: "var(--sky, #4a7ba8)",
              fontFamily: mono,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            1
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                fontFamily: inter,
                fontSize: 13.5,
                fontWeight: 600,
                color: "var(--t1)",
                letterSpacing: "-.1px",
                lineHeight: 1.35,
              }}
            >
              {CONCENTRATION_TASK.title}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--t2)",
                fontFamily: inter,
                lineHeight: 1.55,
              }}
            >
              {CONCENTRATION_TASK.body}
            </div>
            <div
              style={{
                marginTop: 4,
                fontFamily: mono,
                fontSize: 10.5,
                color: "var(--sky, #4a7ba8)",
                letterSpacing: ".3px",
                fontWeight: 600,
              }}
            >
              → Triggered by: {CONCENTRATION_TASK.trigger}
            </div>
          </div>
        </article>
        <ReviewApproveStrip
          label="Review & Approve Concentration Playbook"
          hint="Approving the playbook authorizes the Concentration Agent to draft the NJ Transit extension proposal for review."
          tone="sky"
        />
      </div>
    </section>
  )
}

function ConcentrationDonut({ share }: { share: number }) {
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (share / 100) * circumference
  return (
    <div
      style={{
        padding: "18px 16px",
        background: "rgba(74,123,168,.04)",
        border: "1px solid rgba(74,123,168,.18)",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div style={{ position: "relative", width: 156, height: 156 }}>
        <svg width="156" height="156" viewBox="0 0 156 156">
          <circle
            cx="78"
            cy="78"
            r={radius}
            stroke="rgba(12,10,9,.07)"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="78"
            cy="78"
            r={radius}
            stroke="var(--sky, #4a7ba8)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 78 78)"
            style={{ animation: "riskDonutDraw 900ms ease-out" }}
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
            gap: 2,
          }}
        >
          <div
            style={{
              fontFamily: garamond,
              fontSize: 42,
              fontWeight: 400,
              color: "var(--sky, #4a7ba8)",
              letterSpacing: "-.8px",
              lineHeight: 1,
            }}
          >
            {share}%
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 9.5,
              fontWeight: 600,
              letterSpacing: ".7px",
              textTransform: "uppercase",
              color: "var(--t3)",
            }}
          >
            Top customer
          </div>
        </div>
      </div>
      <div
        style={{
          fontFamily: inter,
          fontSize: 11,
          color: "var(--t3)",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        Concentration target: keep below 25%
      </div>
    </div>
  )
}

// ── Review & Approve strip (shared) ────────────────────────────────────────
function ReviewApproveStrip({
  label,
  hint,
  tone = "mint",
}: {
  label: string
  hint: string
  tone?: "mint" | "sky"
}) {
  const accent = tone === "mint" ? "var(--mint, #2c8c70)" : "var(--sky, #4a7ba8)"
  const accentSoft = tone === "mint" ? "rgba(44,140,112,.08)" : "rgba(74,123,168,.08)"
  const accentEdge = tone === "mint" ? "rgba(44,140,112,.26)" : "rgba(74,123,168,.26)"
  return (
    <div
      style={{
        marginTop: 4,
        padding: "12px 14px",
        background: accentSoft,
        border: `1px dashed ${accentEdge}`,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 10.5,
          color: accent,
          fontWeight: 600,
          letterSpacing: ".7px",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        ◇ Approval surface
      </div>
      <div
        style={{
          fontFamily: inter,
          fontSize: 12.5,
          color: "var(--t1)",
          fontWeight: 600,
          letterSpacing: "-.1px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: inter,
          fontSize: 12,
          color: "var(--t3)",
          lineHeight: 1.45,
          flex: 1,
          minWidth: 200,
        }}
      >
        {hint}
      </div>
    </div>
  )
}

// ── Open Boardroom handoff ─────────────────────────────────────────────────
function BoardroomGate({
  visible,
  phase,
  onOpen,
}: {
  visible: boolean
  phase: "idle" | "navigating"
  onOpen: () => void
}) {
  return (
    <section
      aria-hidden={!visible}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity ${T.surfaceRevealMs}ms ease-out, transform ${T.surfaceRevealMs}ms ease-out`,
        padding: "22px 26px",
        borderRadius: 18,
        background: "rgba(12,10,9,.92)",
        color: "rgba(245,245,245,.95)",
        border: "1px solid rgba(255,255,255,.06)",
        boxShadow: "0 18px 44px rgba(12,10,9,.22)",
        display: "flex",
        alignItems: "center",
        gap: 18,
        flexWrap: "wrap",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
          boxShadow: "0 0 10px rgba(44,140,112,.55)",
          animation: "riskAriaPulse 3.2s ease-in-out infinite",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 280, fontFamily: inter }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "rgba(167,229,211,.95)",
            fontWeight: 600,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Risk profile complete · ARIA · Case Manager
        </div>
        <div style={{ fontSize: 14.5, color: "rgba(245,245,245,.97)", lineHeight: 1.45, fontWeight: 600 }}>
          The Boardroom is ready to review.
        </div>
        <div style={{ fontSize: 12.5, color: "rgba(245,245,245,.6)", lineHeight: 1.55, marginTop: 4 }}>
          Three buyer agents — SBA-Backed Operator, Search Fund, and Micro-PE — will weigh the
          transferability profile against their thesis and produce work orders for the agent fleet.
        </div>
      </div>
      <button
        onClick={onOpen}
        disabled={phase !== "idle"}
        className="risk-primary"
        style={{
          height: 44,
          padding: "0 22px",
          borderRadius: 9999,
          background: "var(--mint, #2c8c70)",
          color: "#fff",
          border: "none",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: inter,
          letterSpacing: "-.1px",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          cursor: phase === "idle" ? "pointer" : "default",
          boxShadow: "0 6px 22px rgba(12,10,9,.28)",
          minWidth: 220,
          justifyContent: "center",
          transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
        }}
      >
        {phase === "navigating" && <Spinner light />}
        <span>{phase === "navigating" ? "Opening Boardroom..." : "Open Boardroom"}</span>
        {phase === "idle" && <span style={{ transform: "translateY(-1px)" }}>→</span>}
      </button>
    </section>
  )
}

// ── Shared primitives ──────────────────────────────────────────────────────
function Spinner({ light }: { light?: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        border: `2px solid ${light ? "rgba(245,245,245,.32)" : "rgba(12,10,9,.18)"}`,
        borderTopColor: light ? "var(--btn-fg, #fff)" : "var(--t1)",
        animation: "riskSpin .8s linear infinite",
        flexShrink: 0,
      }}
    />
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: inter,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "1.1px",
        textTransform: "uppercase",
        color: "var(--t3)",
      }}
    >
      {children}
    </div>
  )
}

// ── Scoped styles ──────────────────────────────────────────────────────────
function ScopedStyles() {
  return (
    <style>{`
      @keyframes riskAriaPulse {
        0%, 100% { transform: scale(1);    opacity: 1;  }
        50%      { transform: scale(1.10); opacity: .9; }
      }
      @keyframes riskBlink {
        0%, 100% { opacity: 1;  }
        50%      { opacity: .3; }
      }
      @keyframes riskLineIn {
        from { opacity: 0; transform: translateY(3px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes riskFadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes riskSpin {
        to { transform: rotate(360deg); }
      }
      @keyframes riskDonutDraw {
        from { stroke-dashoffset: 999; }
      }
      .risk-input:focus {
        border-color: var(--mint, #2c8c70) !important;
        box-shadow: 0 0 0 3px rgba(44,140,112,.16), 0 1px 0 rgba(255,255,255,.92) inset !important;
      }
      .risk-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 28px rgba(12,10,9,.24);
      }
    `}</style>
  )
}
