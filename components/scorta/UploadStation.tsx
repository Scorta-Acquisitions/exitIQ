"use client"

import Link from "next/link"
import React from "react"

import type { PERSONA as PersonaShape } from "@/lib/persona"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

type Persona = typeof PersonaShape

type Modality = "files" | "voice" | "photos" | "notes"

type QueuedItem = {
  id: string
  modality: Modality
  title: string
  meta: string
  status: "ingesting" | "classified" | "approved"
  agent: string
  impact: string
}

const SEED_QUEUE: ReadonlyArray<QueuedItem> = [
  {
    id: "q_lease",
    modality: "files",
    title: "Lease_Palace_Kitchen_2023.pdf",
    meta: "Property lease · 14 pages · 1.8 MB",
    status: "classified",
    agent: "Ingestion Agent",
    impact: "+1 Documentation Quality",
  },
  {
    id: "q_voice_sops",
    modality: "voice",
    title: "Morning prep walkthrough.m4a",
    meta: "Voice memo · 4:12 · transcribed",
    status: "ingesting",
    agent: "Owner-Dependency Agent",
    impact: "+3 Transferability (projected)",
  },
  {
    id: "q_njt_letter",
    modality: "photos",
    title: "NJ Transit renewal letter (photo)",
    meta: "Scan · 1 page · OCR complete",
    status: "approved",
    agent: "Concentration Agent",
    impact: "Concentration risk re-confirmed",
  },
]

const TILE_CONFIG: ReadonlyArray<{
  id: Modality
  label: string
  blurb: string
  example: string
  badge: string
  icon: React.ReactNode
  accent: string
}> = [
  {
    id: "files",
    label: "Files",
    blurb: "PDFs, spreadsheets, contracts, leases.",
    example: "Drop or browse · up to 50 MB each",
    badge: "Most common",
    icon: <FileIcon />,
    accent: "rgba(74,123,168,.10)",
  },
  {
    id: "voice",
    label: "Voice memo",
    blurb: "Walk CASE through how the business runs.",
    example: "Tap to record · auto-transcribed",
    badge: "+Transferability",
    icon: <MicIcon />,
    accent: "rgba(44,140,112,.10)",
  },
  {
    id: "photos",
    label: "Photo or scan",
    blurb: "Snap a doc, the floor, equipment, signage.",
    example: "Camera or library · OCR included",
    badge: "Fast",
    icon: <CameraIcon />,
    accent: "rgba(184,106,62,.10)",
  },
  {
    id: "notes",
    label: "Written note",
    blurb: "Type context, corrections, or backstory.",
    example: "Plain text · CASE cleans up structure",
    badge: "No upload",
    icon: <NoteIcon />,
    accent: "rgba(107,93,176,.10)",
  },
]

const CASE_OBSERVATIONS: ReadonlyArray<string> = [
  "Owner-dependency is your single largest score gap — voice memos walking through daily tasks unlock the most points.",
  "Renewal letters from NJ Transit Corporate Catering would let the Concentration Agent close the open question.",
  "Anything that documents how the kitchen runs without you on-site moves Transferability fast.",
]

const SCORE_DELTAS: ReadonlyArray<{ label: string; from: number; to: number; tone: "mint" | "lav" | "peach" }> = [
  { label: "Transferability", from: 38, to: 54, tone: "mint" },
  { label: "Documentation Quality", from: 65, to: 71, tone: "lav" },
  { label: "Financial Health", from: 68, to: 70, tone: "peach" },
]

export function UploadStation({ persona }: { persona: Persona }) {
  const [selected, setSelected] = React.useState<Modality | null>(null)
  const [queue, setQueue] = React.useState<ReadonlyArray<QueuedItem>>(SEED_QUEUE)
  const [draftNote, setDraftNote] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [dragOver, setDragOver] = React.useState(false)

  function addItem(item: Omit<QueuedItem, "id" | "status">) {
    const id = `q_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e4).toString(36)}`
    const fresh: QueuedItem = { ...item, id, status: "ingesting" }
    setQueue((cur) => [fresh, ...cur])
    // Mock progression to classified
    setTimeout(() => {
      setQueue((cur) =>
        cur.map((q) => (q.id === id ? { ...q, status: "classified" as const } : q)),
      )
    }, 2200)
  }

  function onFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    addItem({
      modality: "files",
      title: file.name,
      meta: `${Math.max(1, Math.round(file.size / 1024))} KB · queued`,
      agent: "Ingestion Agent",
      impact: "+1 to +3 Documentation Quality (projected)",
    })
  }

  function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    addItem({
      modality: "files",
      title: file.name,
      meta: `${Math.max(1, Math.round(file.size / 1024))} KB · queued`,
      agent: "Ingestion Agent",
      impact: "+1 to +3 Documentation Quality (projected)",
    })
    e.target.value = ""
  }

  function onNoteSubmit() {
    const text = draftNote.trim()
    if (!text || submitting) return
    setSubmitting(true)
    setTimeout(() => {
      addItem({
        modality: "notes",
        title: text.length > 56 ? `${text.slice(0, 56)}…` : text,
        meta: `Note · ${text.length} chars · routed by CASE`,
        agent: "Case Manager Agent",
        impact: "Context added to deal file",
      })
      setDraftNote("")
      setSubmitting(false)
    }, 700)
  }

  function onMockRecord() {
    addItem({
      modality: "voice",
      title: "New voice memo (00:00:42)",
      meta: "Voice memo · transcribing",
      agent: "Owner-Dependency Agent",
      impact: "+2 to +4 Transferability (projected)",
    })
  }

  function onMockCamera() {
    addItem({
      modality: "photos",
      title: "Capture · IMG_4827.jpg",
      meta: "Photo · 2.4 MB · OCR queued",
      agent: "Ingestion Agent",
      impact: "+1 Documentation Quality (projected)",
    })
  }

  function onApproveAll() {
    setQueue((cur) =>
      cur.map((q) => (q.status === "classified" ? { ...q, status: "approved" as const } : q)),
    )
  }

  const ingestingCount = queue.filter((q) => q.status === "ingesting").length
  const reviewableCount = queue.filter((q) => q.status === "classified").length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <ScopedStyles />

      <StationHeader />
      <CaseIntro persona={persona} />

      <div style={{ display: "grid", gridTemplateColumns: "1.45fr .85fr", gap: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <ModalityGrid
            selected={selected}
            onSelect={(m) => setSelected((cur) => (cur === m ? null : m))}
          />

          <ActiveSurface
            modality={selected}
            dragOver={dragOver}
            setDragOver={setDragOver}
            onFileDrop={onFileDrop}
            onFilePick={onFilePick}
            draftNote={draftNote}
            setDraftNote={setDraftNote}
            onNoteSubmit={onNoteSubmit}
            submitting={submitting}
            onMockRecord={onMockRecord}
            onMockCamera={onMockCamera}
          />

          <Queue
            queue={queue}
            ingestingCount={ingestingCount}
            reviewableCount={reviewableCount}
            onApproveAll={onApproveAll}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <CaseObservations />
          <ScoreImpact />
        </div>
      </div>
    </div>
  )
}

// ── Station header ────────────────────────────────────────────────────────
function StationHeader() {
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
          Ingestion Point · open intake
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
          Hand CASE anything he hasn&apos;t seen yet.
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
          Files, voice memos, photos, written notes — drop them in any modality. The Ingestion
          Agent classifies, the right specialist agent picks them up, and your Scorta Score
          recalculates only after you approve.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="upload-back-link"
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

// ── CASE intro ────────────────────────────────────────────────────────────
function CaseIntro({ persona }: { persona: Persona }) {
  return (
    <section
      style={{
        padding: "18px 22px",
        borderRadius: 16,
        background: "rgba(255,255,255,.78)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
          boxShadow: "0 0 14px rgba(44,140,112,.55)",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10,
            color: "var(--mint, #2c8c70)",
            letterSpacing: ".7px",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          CASE · Case Manager
        </div>
        <div
          style={{
            fontFamily: garamond,
            fontSize: 18,
            color: "var(--t1)",
            lineHeight: 1.35,
            letterSpacing: "-.1px",
          }}
        >
          You don&apos;t have to format anything, {persona.identity.firstName}. Just send it.
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 12.5,
            color: "var(--t2)",
            lineHeight: 1.5,
            fontFamily: inter,
            maxWidth: 620,
          }}
        >
          The Ingestion Agent tags every artifact, routes it to the right specialist on the fleet,
          and tells you exactly which score component moved. Nothing publishes to your file until
          you approve.
        </div>
      </div>
    </section>
  )
}

// ── Modality grid ─────────────────────────────────────────────────────────
function ModalityGrid({
  selected,
  onSelect,
}: {
  selected: Modality | null
  onSelect: (m: Modality) => void
}) {
  return (
    <section>
      <SectionEyebrow text="Choose a modality" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        {TILE_CONFIG.map((t) => {
          const active = selected === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className="upload-tile"
              style={{
                textAlign: "left",
                padding: "16px 14px 14px",
                borderRadius: 14,
                background: active ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.7)",
                border: active
                  ? "1px solid rgba(44,140,112,.45)"
                  : "1px solid var(--glass-edge, rgba(0,0,0,.06))",
                boxShadow: active ? "0 8px 22px rgba(12,10,9,.10)" : "0 1px 0 rgba(255,255,255,.6) inset",
                cursor: "pointer",
                transition: "transform 180ms ease-out, border-color 180ms ease-out, box-shadow 180ms ease-out",
                fontFamily: inter,
                color: "var(--t1)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: t.accent,
                  color: "var(--t1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                {t.icon}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t.label}</div>
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 9,
                    fontWeight: 700,
                    color: "var(--t3)",
                    letterSpacing: ".4px",
                    textTransform: "uppercase",
                  }}
                >
                  {t.badge}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.45 }}>{t.blurb}</div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: "var(--t3)",
                  fontFamily: mono,
                  letterSpacing: ".3px",
                }}
              >
                {t.example}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

// ── Active surface — switches based on selected modality ──────────────────
function ActiveSurface({
  modality,
  dragOver,
  setDragOver,
  onFileDrop,
  onFilePick,
  draftNote,
  setDraftNote,
  onNoteSubmit,
  submitting,
  onMockRecord,
  onMockCamera,
}: {
  modality: Modality | null
  dragOver: boolean
  setDragOver: (v: boolean) => void
  onFileDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onFilePick: (e: React.ChangeEvent<HTMLInputElement>) => void
  draftNote: string
  setDraftNote: (v: string) => void
  onNoteSubmit: () => void
  submitting: boolean
  onMockRecord: () => void
  onMockCamera: () => void
}) {
  const active = modality ?? "files"

  return (
    <section
      style={{
        padding: "22px 22px 20px",
        borderRadius: 16,
        background: "rgba(255,255,255,.78)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
      }}
    >
      <SectionEyebrow text={`Active intake · ${TILE_CONFIG.find((t) => t.id === active)?.label}`} />

      {active === "files" && (
        <FileSurface
          dragOver={dragOver}
          setDragOver={setDragOver}
          onDrop={onFileDrop}
          onPick={onFilePick}
        />
      )}
      {active === "voice" && <VoiceSurface onMockRecord={onMockRecord} />}
      {active === "photos" && <PhotosSurface onMockCamera={onMockCamera} />}
      {active === "notes" && (
        <NotesSurface
          value={draftNote}
          onChange={setDraftNote}
          onSubmit={onNoteSubmit}
          submitting={submitting}
        />
      )}
    </section>
  )
}

function FileSurface({
  dragOver,
  setDragOver,
  onDrop,
  onPick,
}: {
  dragOver: boolean
  setDragOver: (v: boolean) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      style={{
        marginTop: 14,
        padding: "28px 20px",
        borderRadius: 14,
        border: `1.5px dashed ${dragOver ? "rgba(44,140,112,.55)" : "rgba(0,0,0,.16)"}`,
        background: dragOver ? "rgba(44,140,112,.06)" : "rgba(255,255,255,.55)",
        textAlign: "center",
        transition: "background 180ms ease-out, border-color 180ms ease-out",
      }}
    >
      <div
        style={{
          fontFamily: garamond,
          fontSize: 19,
          color: "var(--t1)",
          letterSpacing: "-.2px",
          marginBottom: 6,
        }}
      >
        Drag in any file, or browse from your machine.
      </div>
      <div style={{ fontSize: 12.5, color: "var(--t2)", lineHeight: 1.5, fontFamily: inter, marginBottom: 14 }}>
        PDF, DOCX, XLSX, CSV, JPG, PNG, MP3, MP4 — up to 50 MB each. CASE classifies on arrival.
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="upload-cta-pill"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 18px",
          borderRadius: 9999,
          background: "var(--btn-bg)",
          color: "var(--btn-fg)",
          fontFamily: inter,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "-.05px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 6px 18px rgba(12,10,9,.16)",
          transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
        }}
      >
        <UploadIcon />
        <span>Browse files</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        onChange={onPick}
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
      />
    </div>
  )
}

function VoiceSurface({ onMockRecord }: { onMockRecord: () => void }) {
  const [recording, setRecording] = React.useState(false)
  const [elapsed, setElapsed] = React.useState(0)
  React.useEffect(() => {
    if (!recording) return
    const id = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [recording])

  function toggle() {
    if (!recording) {
      setRecording(true)
      setElapsed(0)
      return
    }
    setRecording(false)
    onMockRecord()
    setElapsed(0)
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0")
  const ss = String(elapsed % 60).padStart(2, "0")

  return (
    <div
      style={{
        marginTop: 14,
        padding: "26px 22px",
        borderRadius: 14,
        background: "rgba(44,140,112,.05)",
        border: "1px solid rgba(44,140,112,.18)",
        display: "flex",
        alignItems: "center",
        gap: 18,
      }}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={recording ? "Stop recording" : "Start voice memo"}
        className="upload-mic-btn"
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: "none",
          background: recording ? "rgba(196,78,44,.95)" : "var(--mint, #2c8c70)",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: recording
            ? "0 0 0 6px rgba(196,78,44,.22), 0 6px 18px rgba(196,78,44,.30)"
            : "0 6px 18px rgba(44,140,112,.30)",
          transition: "background 180ms ease-out, box-shadow 180ms ease-out",
          flexShrink: 0,
          animation: recording ? "uploadMicPulse 1.4s ease-in-out infinite" : "none",
        }}
      >
        {recording ? <SquareIcon /> : <MicIcon large />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: garamond,
            fontSize: 19,
            color: "var(--t1)",
            letterSpacing: "-.2px",
          }}
        >
          {recording ? `Recording · ${mm}:${ss}` : "Talk CASE through it."}
        </div>
        <div
          style={{
            marginTop: 5,
            fontSize: 12.5,
            color: "var(--t2)",
            lineHeight: 1.5,
            fontFamily: inter,
            maxWidth: 480,
          }}
        >
          Walk through how the morning prep runs, who covers when you&apos;re out, how customer
          orders come in. The Owner-Dependency Agent transcribes and scores transferability gains
          per task.
        </div>
      </div>
    </div>
  )
}

function PhotosSurface({ onMockCamera }: { onMockCamera: () => void }) {
  return (
    <div
      style={{
        marginTop: 14,
        padding: "26px 22px",
        borderRadius: 14,
        background: "rgba(184,106,62,.05)",
        border: "1px solid rgba(184,106,62,.18)",
        display: "flex",
        alignItems: "center",
        gap: 18,
      }}
    >
      <div
        aria-hidden
        style={{
          width: 60,
          height: 60,
          borderRadius: 14,
          background: "rgba(184,106,62,.15)",
          color: "var(--peach, #b86a3e)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <CameraIcon large />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: garamond, fontSize: 19, color: "var(--t1)", letterSpacing: "-.2px" }}>
          Snap a doc, the floor, equipment, signage.
        </div>
        <div
          style={{
            marginTop: 5,
            fontSize: 12.5,
            color: "var(--t2)",
            lineHeight: 1.5,
            fontFamily: inter,
            maxWidth: 480,
          }}
        >
          Photos and scans land here. CASE runs OCR, tags the artifact, and stages it for the right
          specialist. Useful for permits, vendor invoices, the lease, or anything taped to the
          office wall.
        </div>
      </div>
      <button
        type="button"
        onClick={onMockCamera}
        className="upload-cta-pill"
        style={{
          alignSelf: "center",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          borderRadius: 9999,
          background: "var(--btn-bg)",
          color: "var(--btn-fg)",
          fontFamily: inter,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "-.05px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 6px 18px rgba(12,10,9,.16)",
          transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
        }}
      >
        <CameraIcon />
        <span>Open camera</span>
      </button>
    </div>
  )
}

function NotesSurface({
  value,
  onChange,
  onSubmit,
  submitting,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  submitting: boolean
}) {
  return (
    <div style={{ marginTop: 14 }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type anything CASE should know. Backstory on a contract, why a number looks high in a given month, the names of the staff who actually run the kitchen — he'll structure it."
        rows={6}
        style={{
          width: "100%",
          padding: "14px 16px",
          borderRadius: 14,
          background: "rgba(255,255,255,.7)",
          border: "1px solid var(--glass-edge, rgba(0,0,0,.10))",
          fontFamily: garamond,
          fontSize: 15,
          color: "var(--t1)",
          lineHeight: 1.5,
          resize: "vertical",
          outline: "none",
          transition: "border-color 180ms ease-out, background 180ms ease-out",
          boxSizing: "border-box",
        }}
      />
      <div
        style={{
          marginTop: 12,
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
            color: "var(--t3)",
            letterSpacing: ".4px",
          }}
        >
          {value.length} characters · CASE structures and routes
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || !value.trim()}
          className="upload-cta-pill"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 9999,
            background: "var(--btn-bg)",
            color: "var(--btn-fg)",
            fontFamily: inter,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "-.05px",
            border: "none",
            cursor: submitting || !value.trim() ? "default" : "pointer",
            opacity: submitting || !value.trim() ? 0.5 : 1,
            boxShadow: "0 6px 18px rgba(12,10,9,.16)",
            transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
          }}
        >
          {submitting && <Spinner />}
          <span>{submitting ? "Sending to CASE…" : "Send to CASE"}</span>
        </button>
      </div>
    </div>
  )
}

// ── Queue ─────────────────────────────────────────────────────────────────
function Queue({
  queue,
  ingestingCount,
  reviewableCount,
  onApproveAll,
}: {
  queue: ReadonlyArray<QueuedItem>
  ingestingCount: number
  reviewableCount: number
  onApproveAll: () => void
}) {
  return (
    <section
      style={{
        padding: "22px 22px 20px",
        borderRadius: 16,
        background: "rgba(255,255,255,.78)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <SectionEyebrow text="Intake queue" />
          <div
            style={{
              fontFamily: inter,
              fontSize: 12,
              color: "var(--t3)",
              marginTop: 4,
            }}
          >
            {ingestingCount > 0 && (
              <span style={{ color: "var(--mint, #2c8c70)", fontWeight: 600 }}>
                {ingestingCount} ingesting
              </span>
            )}
            {ingestingCount > 0 && reviewableCount > 0 && <span> · </span>}
            {reviewableCount > 0 && (
              <span style={{ color: "var(--lav, #6b5db0)", fontWeight: 600 }}>
                {reviewableCount} ready for approval
              </span>
            )}
            {ingestingCount === 0 && reviewableCount === 0 && (
              <span>Everything is approved and merged into your deal file.</span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onApproveAll}
          disabled={reviewableCount === 0}
          className="upload-approve-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            borderRadius: 9999,
            background: reviewableCount === 0 ? "rgba(0,0,0,.04)" : "rgba(44,140,112,.16)",
            color: reviewableCount === 0 ? "var(--t3)" : "var(--mint, #2c8c70)",
            border: `1px solid ${reviewableCount === 0 ? "rgba(0,0,0,.06)" : "rgba(44,140,112,.32)"}`,
            cursor: reviewableCount === 0 ? "default" : "pointer",
            fontFamily: inter,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "-.05px",
            transition: "background 180ms ease-out, color 180ms ease-out",
            whiteSpace: "nowrap",
          }}
        >
          <CheckIcon /> Review &amp; approve {reviewableCount > 0 ? `(${reviewableCount})` : "all"}
        </button>
      </header>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {queue.map((q) => (
          <QueueRow key={q.id} item={q} />
        ))}
      </ul>
    </section>
  )
}

function QueueRow({ item }: { item: QueuedItem }) {
  const icon = TILE_CONFIG.find((t) => t.id === item.modality)?.icon
  return (
    <li
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "12px 14px",
        borderRadius: 12,
        background: "rgba(255,255,255,.66)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.06))",
        animation: "uploadQueueIn .28s ease-out",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          background: "rgba(12,10,9,.05)",
          color: "var(--t1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: inter,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--t1)",
            }}
          >
            {item.title}
          </span>
          <StatusBadge status={item.status} />
        </div>
        <div
          style={{
            marginTop: 3,
            fontSize: 11.5,
            color: "var(--t3)",
            fontFamily: inter,
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span>{item.meta}</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--t4)" }} />
          <span style={{ fontFamily: mono, letterSpacing: ".3px" }}>{item.agent}</span>
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 11.5,
            color: "var(--mint, #2c8c70)",
            fontFamily: inter,
            fontWeight: 600,
            letterSpacing: "-.05px",
          }}
        >
          {item.impact}
        </div>
      </div>
    </li>
  )
}

function StatusBadge({ status }: { status: QueuedItem["status"] }) {
  if (status === "approved") {
    return (
      <span
        style={{
          padding: "1px 8px",
          borderRadius: 9999,
          background: "rgba(44,140,112,.12)",
          color: "var(--mint, #2c8c70)",
          fontFamily: mono,
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: ".5px",
          textTransform: "uppercase",
        }}
      >
        Approved
      </span>
    )
  }
  if (status === "classified") {
    return (
      <span
        style={{
          padding: "1px 8px",
          borderRadius: 9999,
          background: "rgba(107,93,176,.14)",
          color: "var(--lav, #6b5db0)",
          fontFamily: mono,
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: ".5px",
          textTransform: "uppercase",
        }}
      >
        Awaiting your approval
      </span>
    )
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "1px 8px",
        borderRadius: 9999,
        background: "rgba(74,123,168,.14)",
        color: "var(--sky, #4a7ba8)",
        fontFamily: mono,
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: ".5px",
        textTransform: "uppercase",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--sky, #4a7ba8)",
          animation: "uploadDot 1.2s ease-in-out infinite",
        }}
      />
      Ingesting
    </span>
  )
}

// ── CASE observations side card ───────────────────────────────────────────
function CaseObservations() {
  return (
    <section
      style={{
        padding: "20px 20px 18px",
        borderRadius: 16,
        background: "rgba(255,255,255,.78)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
      }}
    >
      <SectionEyebrow text="What CASE wants most" />
      <ul
        style={{
          listStyle: "none",
          margin: "10px 0 0",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 11,
        }}
      >
        {CASE_OBSERVATIONS.map((obs, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              fontSize: 12.5,
              color: "var(--t1)",
              lineHeight: 1.5,
              fontFamily: inter,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                marginTop: 7,
                borderRadius: "50%",
                background: "var(--mint, #2c8c70)",
                flexShrink: 0,
              }}
            />
            <span>{obs}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ScoreImpact() {
  return (
    <section
      style={{
        padding: "20px 20px 18px",
        borderRadius: 16,
        background: "rgba(255,255,255,.78)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
      }}
    >
      <SectionEyebrow text="Projected score impact" />
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {SCORE_DELTAS.map((d) => (
          <DeltaRow key={d.label} {...d} />
        ))}
      </div>
      <div
        style={{
          marginTop: 16,
          padding: "10px 12px",
          borderRadius: 10,
          background: "rgba(44,140,112,.07)",
          border: "1px solid rgba(44,140,112,.18)",
          fontSize: 11.5,
          color: "var(--t2)",
          lineHeight: 1.5,
          fontFamily: inter,
        }}
      >
        Projection updates after the Case Manager Agent re-scores. Approve queued items to commit
        the change to your Scorta Score.
      </div>
    </section>
  )
}

function DeltaRow({ label, from, to, tone }: { label: string; from: number; to: number; tone: "mint" | "lav" | "peach" }) {
  const palette = {
    mint: { fg: "var(--mint, #2c8c70)", bg: "rgba(44,140,112,.18)" },
    lav: { fg: "var(--lav, #6b5db0)", bg: "rgba(107,93,176,.18)" },
    peach: { fg: "var(--peach, #b86a3e)", bg: "rgba(184,106,62,.18)" },
  }[tone]
  const delta = to - from
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 8,
          fontFamily: inter,
          fontSize: 12,
          color: "var(--t2)",
          marginBottom: 4,
        }}
      >
        <span style={{ fontWeight: 600, color: "var(--t1)" }}>{label}</span>
        <span style={{ fontFamily: mono, fontSize: 11, color: palette.fg, fontWeight: 700 }}>
          {from} → {to} (+{delta})
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: 6,
          borderRadius: 9999,
          background: "rgba(0,0,0,.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${from}%`,
            background: "rgba(0,0,0,.18)",
            borderRadius: 9999,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${from}%`,
            width: `${delta}%`,
            background: palette.fg,
            borderRadius: 9999,
            boxShadow: `0 0 8px ${palette.bg}`,
            animation: "uploadDeltaGrow .8s ease-out",
          }}
        />
      </div>
    </div>
  )
}

// ── Bits ──────────────────────────────────────────────────────────────────
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
        marginBottom: 10,
      }}
    >
      {text}
    </div>
  )
}

function Spinner() {
  return (
    <span
      aria-hidden
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        border: "2px solid rgba(245,245,245,.35)",
        borderTopColor: "var(--btn-fg)",
        animation: "spin .8s linear infinite",
      }}
    />
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────
function FileIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 2.5h5l3 3V13a.5.5 0 0 1-.5.5h-7A.5.5 0 0 1 4 13z" />
      <path d="M9 2.5V5.5h3" />
    </svg>
  )
}

function MicIcon({ large = false }: { large?: boolean }) {
  const s = large ? 22 : 16
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="6" y="2" width="4" height="7.5" rx="2" />
      <path d="M3.5 8.5a4.5 4.5 0 0 0 9 0" />
      <path d="M8 13v1.5" />
    </svg>
  )
}

function CameraIcon({ large = false }: { large?: boolean }) {
  const s = large ? 22 : 16
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 5.5h2l1-1.4h5l1 1.4h2A.5.5 0 0 1 14 6v6.5a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 2 12.5V6a.5.5 0 0 1 .5-.5z" />
      <circle cx="8" cy="9" r="2.4" />
    </svg>
  )
}

function NoteIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 2.5h7l2.5 2.5v8a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 3 13V3a.5.5 0 0 1 .5-.5z" />
      <path d="M5.5 6.5h5M5.5 8.5h5M5.5 10.5h3" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 10V3" />
      <path d="M4 5.6L7 2.6l3 3" />
      <path d="M2.4 9.4v1.4A1.2 1.2 0 0 0 3.6 12h6.8a1.2 1.2 0 0 0 1.2-1.2V9.4" />
    </svg>
  )
}

function SquareIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="currentColor" aria-hidden>
      <rect x="5" y="5" width="8" height="8" rx="1.4" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 6.4L4.6 9 10 3.4" />
    </svg>
  )
}

// ── Scoped styles ─────────────────────────────────────────────────────────
function ScopedStyles() {
  return (
    <style>{`
      .upload-tile:hover {
        transform: translateY(-1px);
        border-color: rgba(0,0,0,.12);
        box-shadow: 0 8px 22px rgba(12,10,9,.08);
      }
      .upload-cta-pill:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 26px rgba(12,10,9,.22);
      }
      .upload-back-link:hover {
        background: #fff;
        border-color: rgba(0,0,0,.18);
        transform: translateY(-1px);
      }
      .upload-approve-btn:hover:not(:disabled) {
        background: rgba(44,140,112,.22);
      }
      @keyframes uploadDot {
        0%, 100% { transform: scale(1);   opacity: 1;  }
        50%      { transform: scale(1.4); opacity: .55; }
      }
      @keyframes uploadQueueIn {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes uploadDeltaGrow {
        from { transform: scaleX(0); transform-origin: left; }
        to   { transform: scaleX(1); transform-origin: left; }
      }
      @keyframes uploadMicPulse {
        0%, 100% { box-shadow: 0 0 0 6px rgba(196,78,44,.22), 0 6px 18px rgba(196,78,44,.30); }
        50%      { box-shadow: 0 0 0 11px rgba(196,78,44,.10), 0 6px 18px rgba(196,78,44,.30); }
      }
    `}</style>
  )
}
