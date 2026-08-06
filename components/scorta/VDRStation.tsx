"use client"

import { useRouter } from "next/navigation"
import React from "react"

import type { PERSONA as PersonaShape } from "@/lib/persona"

import { DocumentsStation } from "./DocumentsStation"
import { RecastStation } from "./RecastStation"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

const T = {
  approveSpinnerMs: 700,
  copyToastMs: 1500,
  shareTipMs: 2200,
  downloadTipMs: 2200,
  drawerEnterMs: 300,
}

type Persona = typeof PersonaShape

type AudienceTab = "all" | "buyer" | "lender" | "legal"

type AccessLevel = "Full Access" | "CIM Only" | "P&L Only" | "Custom"

type RequestState = "pending" | "granted" | "denied"

type PendingRequest = {
  id: string
  party: string
  initials: string
  type: "BUYER" | "LENDER"
  typeSub: string
  requestedRelative: string
  documents: string
  ndaStatus: string
  note: string
}

type PreviewKey = "cim" | "recast" | null

const PENDING: ReadonlyArray<PendingRequest> = [
  {
    id: "marcus-rivera",
    party: "Marcus Rivera",
    initials: "MR",
    type: "BUYER",
    typeSub: "SBA-Backed Operator",
    requestedRelative: "2 hours ago",
    documents: "CIM",
    ndaStatus: "Not yet signed",
    note: "Approve to send NDA for signature. CIM unlocks after NDA is returned.",
  },
  {
    id: "northeast-bank",
    party: "Northeast Community Bank",
    initials: "NB",
    type: "LENDER",
    typeSub: "SBA 7(a) Specialist",
    requestedRelative: "45 minutes ago",
    documents: "P&L Recast + CIM",
    ndaStatus: "Waived (lender)",
    note: "NDA waived for SBA lenders. Approval grants immediate access to both documents.",
  },
]

// CIM section heatmap — 12 bars, heights proportional to simulated time spent.
// Section 1 (Executive Summary) tallest, Section 6 (Deal Structure) second.
const CIM_HEATMAP: ReadonlyArray<{ n: number; title: string; height: number; time: string; emphasis?: boolean }> = [
  { n: 1, title: "Executive Summary", height: 1.0, time: "1m 42s", emphasis: true },
  { n: 2, title: "Business Overview & History", height: 0.35, time: "8s" },
  { n: 3, title: "Products & Services", height: 0.28, time: "6s" },
  { n: 4, title: "Market & Competition", height: 0.42, time: "11s" },
  { n: 5, title: "Financial Performance", height: 0.55, time: "18s" },
  { n: 6, title: "Deal Structure & Terms", height: 0.78, time: "58s", emphasis: true },
  { n: 7, title: "Operations & Staffing", height: 0.31, time: "7s" },
  { n: 8, title: "Owner-Dependency Remediation", height: 0.4, time: "10s" },
  { n: 9, title: "Customer Concentration", height: 0.36, time: "9s" },
  { n: 10, title: "Facilities & Equipment", height: 0.22, time: "5s" },
  { n: 11, title: "Growth Opportunities", height: 0.27, time: "6s" },
  { n: 12, title: "Buyer Qualification Criteria", height: 0.32, time: "8s" },
]

export function VDRStation({ persona }: { persona: Persona }) {
  const router = useRouter()

  const [tab, setTab] = React.useState<AudienceTab>("all")
  const [accessLevel, setAccessLevel] = React.useState<AccessLevel>("Full Access")
  const [ndaRequired, setNdaRequired] = React.useState(true)
  const [shareTipShown, setShareTipShown] = React.useState(false)
  const shareTipTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [copiedShown, setCopiedShown] = React.useState(false)
  const copyTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const [requestStates, setRequestStates] = React.useState<Record<string, RequestState>>({
    "marcus-rivera": "pending",
    "northeast-bank": "pending",
  })
  const [approvingId, setApprovingId] = React.useState<string | null>(null)

  const [downloadTipFor, setDownloadTipFor] = React.useState<PreviewKey>(null)
  const downloadTipTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [managingFor, setManagingFor] = React.useState<PreviewKey>(null)

  const [drawer, setDrawer] = React.useState<PreviewKey>(null)

  // ESC closes the preview drawer
  React.useEffect(() => {
    if (!drawer) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawer(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [drawer])

  React.useEffect(() => {
    return () => {
      if (shareTipTimerRef.current) clearTimeout(shareTipTimerRef.current)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      if (downloadTipTimerRef.current) clearTimeout(downloadTipTimerRef.current)
    }
  }, [])

  const deal = {
    name: persona.identity.businessName,
    location: `${persona.identity.location} · ${persona.business.industry}`,
    listingDisplay: persona.financials.recommendedListingDisplay,
    multiple: persona.financials.appliedMultiple,
    dscr: persona.sba.dscr,
    scoreOverall: persona.scorta.overall,
    transferability: persona.scorta.transferability,
    shareLink: `scorta.io/vdr/${persona.identity.businessSlug}-7f3a`,
  }

  const todayDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  function onShareCta() {
    setShareTipShown(true)
    if (shareTipTimerRef.current) clearTimeout(shareTipTimerRef.current)
    shareTipTimerRef.current = setTimeout(() => setShareTipShown(false), T.shareTipMs)
  }

  function onCopyLink() {
    try {
      navigator.clipboard.writeText(deal.shareLink)
    } catch {
      // demo only; clipboard unavailability is acceptable
    }
    setCopiedShown(true)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCopiedShown(false), T.copyToastMs)
  }

  function onApproveRequest(id: string) {
    if (requestStates[id] !== "pending") return
    setApprovingId(id)
    setTimeout(() => {
      setRequestStates((prev) => ({ ...prev, [id]: "granted" }))
      setApprovingId(null)
    }, T.approveSpinnerMs)
  }

  function onDenyRequest(id: string) {
    if (requestStates[id] !== "pending") return
    setRequestStates((prev) => ({ ...prev, [id]: "denied" }))
  }

  function onDownload(key: NonNullable<PreviewKey>) {
    setDownloadTipFor(key)
    if (downloadTipTimerRef.current) clearTimeout(downloadTipTimerRef.current)
    downloadTipTimerRef.current = setTimeout(() => setDownloadTipFor(null), T.downloadTipMs)
  }

  function onManage(key: NonNullable<PreviewKey>) {
    setManagingFor((curr) => (curr === key ? null : key))
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <ScopedStyles />

      <StationHeader />

      {/* Panel 1 — Deal Header ─────────────────────────────────────── */}
      <DealHeaderPanel
        deal={deal}
        accessLevel={accessLevel}
        onAccessLevel={setAccessLevel}
        ndaRequired={ndaRequired}
        onNdaToggle={() => setNdaRequired((v) => !v)}
        onShareCta={onShareCta}
        shareTipShown={shareTipShown}
        onCopyLink={onCopyLink}
        copiedShown={copiedShown}
      />

      {/* Panel 2 — Document Library ────────────────────────────────── */}
      <DocumentLibraryPanel
        tab={tab}
        onTab={setTab}
        todayDate={todayDate}
        persona={persona}
        onPreview={(k) => setDrawer(k)}
        onDownload={onDownload}
        onManage={onManage}
        downloadTipFor={downloadTipFor}
        managingFor={managingFor}
        onNavigateDocuments={() => router.push("/documents")}
      />

      {/* Panel 3 — Access Log ──────────────────────────────────────── */}
      <AccessLogPanel
        requestStates={requestStates}
        approvingId={approvingId}
        onApprove={onApproveRequest}
        onDeny={onDenyRequest}
        persona={persona}
      />

      {/* Panel 4 — Engagement Analytics ────────────────────────────── */}
      <EngagementPanel requestStates={requestStates} />

      {/* Preview drawer ─────────────────────────────────────────────── */}
      <PreviewDrawer
        which={drawer}
        onClose={() => setDrawer(null)}
        persona={persona}
      />
    </div>
  )
}

// ── Station header ────────────────────────────────────────────────────
function StationHeader() {
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
          Station 07b · /vdr
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
          VDR · Case Manager Agent
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--mint, #2c8c70)",
              boxShadow: "0 0 6px var(--mint, #2c8c70)",
              animation: "vdrBlink 1.8s ease-in-out infinite",
            }}
          />
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
        Virtual Data Room
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--t2)",
          lineHeight: 1.6,
          maxWidth: 760,
          fontFamily: inter,
        }}
      >
        Your VDR is live. Two documents are published and access-controlled. One
        buyer and one lender have requested access — both are pending your
        approval. Every view, every download, and every access request is
        logged here.
      </p>
    </header>
  )
}

// ── Panel 1 — Deal Header ─────────────────────────────────────────────
function DealHeaderPanel({
  deal,
  accessLevel,
  onAccessLevel,
  ndaRequired,
  onNdaToggle,
  onShareCta,
  shareTipShown,
  onCopyLink,
  copiedShown,
}: {
  deal: {
    name: string
    location: string
    listingDisplay: string
    multiple: number
    dscr: number
    scoreOverall: number
    transferability: number
    shareLink: string
  }
  accessLevel: AccessLevel
  onAccessLevel: (l: AccessLevel) => void
  ndaRequired: boolean
  onNdaToggle: () => void
  onShareCta: () => void
  shareTipShown: boolean
  onCopyLink: () => void
  copiedShown: boolean
}) {
  const accessOptions: AccessLevel[] = ["Full Access", "CIM Only", "P&L Only", "Custom"]
  return (
    <section
      style={{
        padding: "24px 28px 22px",
        background: "#ffffff",
        border: "1px solid rgba(12,10,9,.08)",
        borderRadius: 16,
        boxShadow: "0 1px 0 rgba(255,255,255,.92) inset, 0 12px 36px rgba(12,10,9,.06)",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
        gap: 28,
      }}
    >
      {/* Left — identity ───────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
          Scorta Certified · Deal Room
        </div>
        <h2
          style={{
            fontFamily: garamond,
            fontSize: 28,
            fontWeight: 400,
            color: "var(--t1)",
            letterSpacing: "-.4px",
            lineHeight: 1.1,
          }}
        >
          {deal.name}
        </h2>
        <div style={{ fontFamily: inter, fontSize: 13, color: "var(--t2)" }}>
          {deal.location}
        </div>
        <div
          style={{
            fontFamily: garamond,
            fontSize: 18,
            color: "var(--t1)",
            letterSpacing: "-.2px",
            marginTop: 2,
          }}
        >
          Listed: <strong style={{ fontWeight: 500 }}>{deal.listingDisplay}</strong> · {deal.multiple}× SDE
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginTop: 10,
          }}
        >
          <Chip tone="mint">SBA 7(a) Eligible</Chip>
          <Chip tone="mint">DSCR {deal.dscr}×</Chip>
          <Chip tone="mint">Scorta Score {deal.scoreOverall}/100 · Strong SBA Candidate</Chip>
          <Chip tone="amber">Transferability {deal.transferability}/100 · In Remediation</Chip>
        </div>
      </div>

      {/* Right — share / access controls ───────────────────────────── */}
      <div
        style={{
          padding: "18px 20px",
          background: "rgba(12,10,9,.025)",
          border: "1px solid rgba(12,10,9,.06)",
          borderRadius: 12,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 10,
            color: "var(--t3)",
            letterSpacing: ".7px",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Share VDR Access
        </div>

        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              background: "#fff",
              border: "1px solid rgba(12,10,9,.10)",
              borderRadius: 9,
              fontFamily: mono,
              fontSize: 12,
              color: "var(--t1)",
            }}
          >
            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {deal.shareLink}
            </span>
            <button
              type="button"
              onClick={onCopyLink}
              className="vdr-icon-btn"
              title="Copy link"
              aria-label="Copy link"
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: "1px solid rgba(12,10,9,.10)",
                background: "rgba(255,255,255,.8)",
                color: "var(--t2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4.5" y="4.5" width="7.5" height="7.5" rx="1.4" />
                <path d="M2.5 9.5V3.4A.9.9 0 013.4 2.5h6.1" />
              </svg>
            </button>
          </div>
          {copiedShown && (
            <span
              role="tooltip"
              style={{
                position: "absolute",
                right: 0,
                bottom: "calc(100% + 6px)",
                padding: "5px 10px",
                borderRadius: 8,
                background: "var(--mint, #2c8c70)",
                color: "#fff",
                fontSize: 11,
                fontFamily: inter,
                fontWeight: 600,
                boxShadow: "0 8px 22px rgba(44,140,112,.30)",
                animation: "vdrFadeIn .18s ease-out",
              }}
            >
              Copied ✓
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontFamily: inter, fontSize: 12.5, color: "var(--t1)", fontWeight: 500 }}>
            NDA required
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={ndaRequired}
            onClick={onNdaToggle}
            style={{
              width: 38,
              height: 22,
              padding: 2,
              borderRadius: 9999,
              background: ndaRequired ? "var(--mint, #2c8c70)" : "rgba(12,10,9,.18)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              transition: "background 180ms ease-out",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 1px 3px rgba(12,10,9,.25)",
                transform: ndaRequired ? "translateX(16px)" : "translateX(0)",
                transition: "transform 180ms ease-out",
              }}
            />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 9.5,
              color: "var(--t3)",
              letterSpacing: ".6px",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Access level
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {accessOptions.map((opt) => {
              const active = accessLevel === opt
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onAccessLevel(opt)}
                  className="vdr-pill-btn"
                  style={{
                    height: 28,
                    padding: "0 11px",
                    borderRadius: 9999,
                    fontSize: 11.5,
                    fontWeight: 600,
                    fontFamily: inter,
                    cursor: "pointer",
                    background: active ? "var(--btn-bg)" : "#fff",
                    color: active ? "var(--btn-fg)" : "var(--t1)",
                    border: active
                      ? "1px solid var(--btn-bg)"
                      : "1px solid rgba(12,10,9,.10)",
                    transition: "background 180ms ease-out, border-color 180ms ease-out",
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ position: "relative", marginTop: 4 }}>
          <button
            type="button"
            onClick={onShareCta}
            className="vdr-primary"
            style={{
              width: "100%",
              height: 40,
              padding: "0 16px",
              borderRadius: 9999,
              background: "var(--btn-bg)",
              color: "var(--btn-fg)",
              border: "none",
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: inter,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 6px 18px rgba(12,10,9,.16)",
              transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
            }}
          >
            <span>Send Access Request</span>
            <span aria-hidden style={{ transform: "translateY(-1px)" }}>→</span>
          </button>
          {shareTipShown && (
            <span
              role="tooltip"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: "calc(100% + 8px)",
                margin: "0 auto",
                padding: "8px 12px",
                borderRadius: 10,
                background: "rgba(12,10,9,.94)",
                color: "rgba(245,245,245,.95)",
                fontSize: 11.5,
                lineHeight: 1.4,
                fontFamily: inter,
                textAlign: "center",
                maxWidth: 320,
                boxShadow: "0 12px 28px rgba(12,10,9,.22)",
                animation: "vdrFadeIn .22s ease-out",
                zIndex: 20,
              }}
            >
              Generates a permissioned link — demo shows live access request flow.
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Panel 2 — Document Library ────────────────────────────────────────
function DocumentLibraryPanel({
  tab,
  onTab,
  todayDate,
  persona,
  onPreview,
  onDownload,
  onManage,
  downloadTipFor,
  managingFor,
  onNavigateDocuments,
}: {
  tab: AudienceTab
  onTab: (t: AudienceTab) => void
  todayDate: string
  persona: Persona
  onPreview: (k: NonNullable<PreviewKey>) => void
  onDownload: (k: NonNullable<PreviewKey>) => void
  onManage: (k: NonNullable<PreviewKey>) => void
  downloadTipFor: PreviewKey
  managingFor: PreviewKey
  onNavigateDocuments: () => void
}) {
  const tabs: ReadonlyArray<{ key: AudienceTab; label: string }> = [
    { key: "all", label: "All" },
    { key: "buyer", label: "Buyer-Facing" },
    { key: "lender", label: "Lender-Facing" },
    { key: "legal", label: "Legal" },
  ]

  // Document visibility filter
  const showCim = tab === "all" || tab === "buyer"
  const showRecast = tab === "all" || tab === "lender"
  const showLegalPlaceholder = tab === "legal"

  return (
    <section
      style={{
        padding: "22px 26px 22px",
        background: "rgba(255,255,255,.82)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderRadius: 16,
        boxShadow:
          "0 1px 0 rgba(255,255,255,.92) inset, 0 12px 30px rgba(12,10,9,.05)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
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
          VDR · 2 documents published · 0 pending
        </div>
        <h2
          style={{
            fontFamily: garamond,
            fontSize: 22,
            fontWeight: 400,
            color: "var(--t1)",
            letterSpacing: "-.3px",
            lineHeight: 1.15,
          }}
        >
          Published Documents
        </h2>
      </header>

      <div
        role="tablist"
        style={{
          display: "inline-flex",
          gap: 4,
          padding: 4,
          background: "rgba(12,10,9,.04)",
          border: "1px solid rgba(12,10,9,.06)",
          borderRadius: 9999,
          alignSelf: "flex-start",
        }}
      >
        {tabs.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTab(t.key)}
              style={{
                height: 30,
                padding: "0 14px",
                borderRadius: 9999,
                background: active ? "#ffffff" : "transparent",
                color: active ? "var(--t1)" : "var(--t2)",
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: inter,
                cursor: "pointer",
                boxShadow: active ? "0 1px 3px rgba(12,10,9,.10)" : "none",
                transition: "background 160ms ease-out, color 160ms ease-out",
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 14 }}>
        {showCim && (
          <DocumentCard
            audience="BUYER-FACING"
            audienceTone="mint"
            abbr="CIM"
            title="Confidential Information Memorandum"
            agentAttribution="CIM Agent + Recast Agent + Boardroom"
            version="v1.0"
            published={todayDate}
            approvedBy={persona.identity.displayName}
            accessLevel="NDA Required"
            size="12 sections · ~4,200 words"
            statusLabel="Live · 1 view"
            previewKey="cim"
            onPreview={() => onPreview("cim")}
            onDownload={() => onDownload("cim")}
            onManage={() => onManage("cim")}
            downloadTipShown={downloadTipFor === "cim"}
            managing={managingFor === "cim"}
          />
        )}
        {showRecast && (
          <DocumentCard
            audience="LENDER-FACING"
            audienceTone="sky"
            abbr="P&L"
            title="P&L Recast — Normalized Financial Summary"
            agentAttribution="Recast Agent"
            version="v1.0"
            published={todayDate}
            approvedBy={persona.identity.displayName}
            accessLevel="NDA Required"
            size="3-year P&L · add-back schedule · SDE summary"
            statusLabel="Live · 1 view"
            previewKey="recast"
            onPreview={() => onPreview("recast")}
            onDownload={() => onDownload("recast")}
            onManage={() => onManage("recast")}
            downloadTipShown={downloadTipFor === "recast"}
            managing={managingFor === "recast"}
          />
        )}
      </div>

      {showLegalPlaceholder && (
        <div
          style={{
            padding: "16px 18px",
            border: "1px dashed rgba(12,10,9,.18)",
            borderRadius: 12,
            background: "rgba(255,255,255,.55)",
            fontFamily: inter,
            fontSize: 12.5,
            color: "var(--t2)",
            lineHeight: 1.55,
          }}
        >
          NDA templates available · generated by Case Manager Agent on request.
        </div>
      )}

      <button
        type="button"
        onClick={onNavigateDocuments}
        className="vdr-on-demand"
        style={{
          padding: "14px 18px",
          border: "1px dashed rgba(12,10,9,.18)",
          borderRadius: 12,
          background: "rgba(255,255,255,.55)",
          fontFamily: inter,
          fontSize: 12.5,
          color: "var(--t2)",
          lineHeight: 1.55,
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          transition: "background 180ms ease-out, border-color 180ms ease-out",
        }}
      >
        <span>
          <strong style={{ fontWeight: 600, color: "var(--t1)" }}>
            8 additional documents ready to generate on demand
          </strong>
          {" · Request via the Document Fleet on /documents"}
        </span>
        <span aria-hidden style={{ color: "var(--t3)", flexShrink: 0 }}>→</span>
      </button>
    </section>
  )
}

function DocumentCard({
  audience,
  audienceTone,
  abbr,
  title,
  agentAttribution,
  version,
  published,
  approvedBy,
  accessLevel,
  size,
  statusLabel,
  onPreview,
  onDownload,
  onManage,
  downloadTipShown,
  managing,
}: {
  audience: string
  audienceTone: "mint" | "sky"
  abbr: string
  title: string
  agentAttribution: string
  version: string
  published: string
  approvedBy: string
  accessLevel: string
  size: string
  statusLabel: string
  previewKey: NonNullable<PreviewKey>
  onPreview: () => void
  onDownload: () => void
  onManage: () => void
  downloadTipShown: boolean
  managing: boolean
}) {
  const accent =
    audienceTone === "mint"
      ? { color: "var(--mint, #2c8c70)", soft: "rgba(44,140,112,.10)", edge: "rgba(44,140,112,.28)" }
      : { color: "var(--sky, #4a7ba8)", soft: "rgba(74,123,168,.10)", edge: "rgba(74,123,168,.30)" }

  return (
    <article
      className="vdr-doc-card"
      style={{
        position: "relative",
        padding: "18px 20px 16px",
        background: "#ffffff",
        border: "1px solid rgba(12,10,9,.10)",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(12,10,9,.05), 0 6px 16px rgba(12,10,9,.04)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "transform 220ms ease-out, box-shadow 220ms ease-out",
      }}
    >
      <header style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          aria-hidden
          style={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 10,
            background: "rgba(12,10,9,.86)",
            color: "rgba(245,245,245,.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".4px",
            boxShadow: "0 6px 14px rgba(12,10,9,.10)",
          }}
        >
          {abbr}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <span
            style={{
              alignSelf: "flex-start",
              padding: "2px 8px",
              borderRadius: 9999,
              background: accent.soft,
              border: `1px solid ${accent.edge}`,
              color: accent.color,
              fontFamily: mono,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: ".7px",
              textTransform: "uppercase",
            }}
          >
            {audience}
          </span>
          <div
            style={{
              fontFamily: garamond,
              fontSize: 19,
              fontWeight: 400,
              color: "var(--t1)",
              letterSpacing: "-.2px",
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontFamily: inter,
              fontSize: 11.5,
              color: "var(--t3)",
              lineHeight: 1.4,
            }}
          >
            <span style={{ color: accent.color, fontWeight: 600 }}>{agentAttribution}</span>
            {" · "}
            <span>{version}</span>
            {" · "}
            <span>Published {published}</span>
          </div>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          rowGap: 4,
          columnGap: 12,
          fontFamily: inter,
          fontSize: 12,
          color: "var(--t2)",
          padding: "10px 12px",
          background: "rgba(12,10,9,.025)",
          borderRadius: 8,
        }}
      >
        <span style={{ color: "var(--t3)" }}>Approved by</span>
        <span style={{ color: "var(--t1)", fontWeight: 500 }}>{approvedBy}</span>
        <span style={{ color: "var(--t3)" }}>Access</span>
        <span style={{ color: "var(--t1)", fontWeight: 500 }}>{accessLevel}</span>
        <span style={{ color: "var(--t3)" }}>Size</span>
        <span style={{ color: "var(--t1)", fontWeight: 500 }}>{size}</span>
      </div>

      <footer
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          paddingTop: 4,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontFamily: mono,
            fontSize: 10.5,
            color: "var(--mint, #2c8c70)",
            fontWeight: 600,
            letterSpacing: ".4px",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--mint, #2c8c70)",
              boxShadow: "0 0 5px var(--mint, #2c8c70)",
            }}
          />
          {statusLabel}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
          <button
            type="button"
            onClick={onPreview}
            className="vdr-card-btn vdr-card-btn-primary"
            style={{
              height: 30,
              padding: "0 12px",
              borderRadius: 9999,
              background: "var(--btn-bg)",
              color: "var(--btn-fg)",
              border: "none",
              fontSize: 11.5,
              fontWeight: 600,
              fontFamily: inter,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 10px rgba(12,10,9,.12)",
            }}
          >
            Preview
          </button>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={onDownload}
              className="vdr-card-btn"
              style={cardSecondaryStyle}
            >
              Download
            </button>
            {downloadTipShown && (
              <span
                role="tooltip"
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: "calc(100% + 8px)",
                  padding: "7px 11px",
                  borderRadius: 10,
                  background: "rgba(12,10,9,.94)",
                  color: "rgba(245,245,245,.95)",
                  fontSize: 11,
                  lineHeight: 1.4,
                  fontFamily: inter,
                  whiteSpace: "nowrap",
                  boxShadow: "0 10px 24px rgba(12,10,9,.22)",
                  animation: "vdrFadeIn .22s ease-out",
                  zIndex: 30,
                }}
              >
                PDF export available · demo shows live preview only.
              </span>
            )}
          </div>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={onManage}
              className="vdr-card-btn"
              aria-expanded={managing}
              style={cardSecondaryStyle}
            >
              Manage Access
            </button>
            {managing && (
              <div
                role="dialog"
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: "calc(100% + 8px)",
                  width: 240,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "#ffffff",
                  border: "1px solid rgba(12,10,9,.10)",
                  boxShadow: "0 14px 32px rgba(12,10,9,.14)",
                  fontFamily: inter,
                  fontSize: 12,
                  color: "var(--t2)",
                  lineHeight: 1.5,
                  animation: "vdrFadeIn .22s ease-out",
                  zIndex: 30,
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 9.5,
                    color: "var(--t3)",
                    letterSpacing: ".6px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Active access · 0
                </div>
                No parties with active access · approve a request below.
              </div>
            )}
          </div>
        </div>
      </footer>
    </article>
  )
}

const cardSecondaryStyle: React.CSSProperties = {
  height: 30,
  padding: "0 12px",
  borderRadius: 9999,
  background: "#ffffff",
  color: "var(--t1)",
  border: "1px solid rgba(12,10,9,.10)",
  fontSize: 11.5,
  fontWeight: 600,
  fontFamily: inter,
  cursor: "pointer",
}

// ── Panel 3 — Access Log ──────────────────────────────────────────────
function AccessLogPanel({
  requestStates,
  approvingId,
  onApprove,
  onDeny,
  persona,
}: {
  requestStates: Record<string, RequestState>
  approvingId: string | null
  onApprove: (id: string) => void
  onDeny: (id: string) => void
  persona: Persona
}) {
  return (
    <section
      style={{
        padding: "22px 26px 22px",
        background: "rgba(255,255,255,.82)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderRadius: 16,
        boxShadow:
          "0 1px 0 rgba(255,255,255,.92) inset, 0 12px 30px rgba(12,10,9,.05)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
          Access Log · Live
        </div>
        <h2
          style={{
            fontFamily: garamond,
            fontSize: 22,
            fontWeight: 400,
            color: "var(--t1)",
            letterSpacing: "-.3px",
            lineHeight: 1.15,
          }}
        >
          All access requests and document views are logged in real time.
        </h2>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PENDING.map((req) => (
          <PendingRequestRow
            key={req.id}
            req={req}
            state={requestStates[req.id] ?? "pending"}
            approving={approvingId === req.id}
            onApprove={() => onApprove(req.id)}
            onDeny={() => onDeny(req.id)}
          />
        ))}
      </div>

      <div
        style={{
          height: 1,
          background: "rgba(12,10,9,.06)",
          margin: "4px 0 0",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <ActivityRow
          initials={persona.identity.avatarInitials}
          name={persona.identity.displayName}
          partyType="SELLER"
          action='Published "CIM" to VDR'
          timestamp="Today · 10:52 AM"
        />
        <ActivityRow
          initials={persona.identity.avatarInitials}
          name={persona.identity.displayName}
          partyType="SELLER"
          action='Published "P&L Recast" to VDR'
          timestamp="Today · 10:41 AM"
        />
        <ActivityRow
          initials={persona.identity.avatarInitials}
          name={persona.identity.displayName}
          partyType="SELLER"
          action="Approved recast financials"
          timestamp="Today · 10:38 AM"
        />
      </div>
    </section>
  )
}

function PendingRequestRow({
  req,
  state,
  approving,
  onApprove,
  onDeny,
}: {
  req: PendingRequest
  state: RequestState
  approving: boolean
  onApprove: () => void
  onDeny: () => void
}) {
  const typeAccent =
    req.type === "BUYER"
      ? { color: "var(--mint, #2c8c70)", soft: "rgba(44,140,112,.10)", edge: "rgba(44,140,112,.26)" }
      : { color: "var(--sky, #4a7ba8)", soft: "rgba(74,123,168,.10)", edge: "rgba(74,123,168,.28)" }

  if (state === "granted") {
    return (
      <ActivityRow
        initials={req.initials}
        name={req.party}
        partyType={`${req.type} · ${req.typeSub.toUpperCase()}`}
        action={`Granted access to ${req.documents} · NDA ${req.ndaStatus}`}
        timestamp={`Approved · ${req.requestedRelative}`}
        mint
      />
    )
  }
  if (state === "denied") {
    return (
      <ActivityRow
        initials={req.initials}
        name={req.party}
        partyType={`${req.type} · ${req.typeSub.toUpperCase()}`}
        action={`Access denied · ${req.documents}`}
        timestamp={`Denied · ${req.requestedRelative}`}
        muted
      />
    )
  }

  return (
    <div
      style={{
        padding: "16px 18px",
        background: "rgba(214,158,46,.07)",
        border: "1px solid rgba(214,158,46,.28)",
        borderRadius: 12,
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        animation: "vdrFadeIn .22s ease-out",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: typeAccent.soft,
          border: `1px solid ${typeAccent.edge}`,
          color: typeAccent.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: inter,
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {req.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div
            style={{
              fontFamily: garamond,
              fontSize: 17,
              fontWeight: 500,
              color: "var(--t1)",
              letterSpacing: "-.2px",
            }}
          >
            {req.party}
          </div>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 9999,
              background: typeAccent.soft,
              border: `1px solid ${typeAccent.edge}`,
              color: typeAccent.color,
              fontFamily: mono,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: ".6px",
              textTransform: "uppercase",
            }}
          >
            {req.type} · {req.typeSub}
          </span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 9999,
              background: "rgba(214,158,46,.15)",
              border: "1px solid rgba(214,158,46,.30)",
              color: "#a36a08",
              fontFamily: mono,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: ".6px",
              textTransform: "uppercase",
            }}
          >
            Pending approval
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            rowGap: 2,
            columnGap: 14,
            fontFamily: inter,
            fontSize: 12,
            color: "var(--t2)",
          }}
        >
          <span style={{ color: "var(--t3)" }}>Requested</span>
          <span>Today · {req.requestedRelative}</span>
          <span style={{ color: "var(--t3)" }}>Documents</span>
          <span style={{ color: "var(--t1)", fontWeight: 500 }}>{req.documents}</span>
          <span style={{ color: "var(--t3)" }}>NDA</span>
          <span>{req.ndaStatus}</span>
        </div>
        <div
          style={{
            fontFamily: inter,
            fontSize: 11.5,
            color: "var(--t3)",
            lineHeight: 1.45,
            fontStyle: "italic",
            marginTop: 2,
          }}
        >
          {req.note}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          onClick={onDeny}
          disabled={approving}
          className="vdr-card-btn"
          style={{
            ...cardSecondaryStyle,
            height: 36,
            padding: "0 16px",
            color: "var(--t2)",
          }}
        >
          Deny
        </button>
        <button
          type="button"
          onClick={onApprove}
          disabled={approving}
          className="vdr-primary"
          style={{
            height: 36,
            padding: "0 18px",
            borderRadius: 9999,
            background: "var(--btn-bg)",
            color: "var(--btn-fg)",
            border: "none",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: inter,
            cursor: approving ? "default" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 12px rgba(12,10,9,.14)",
            minWidth: 170,
            justifyContent: "center",
            transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
          }}
        >
          {approving ? <Spinner light /> : null}
          <span>{approving ? "Granting access…" : "Approve Access"}</span>
          {!approving && <span aria-hidden style={{ transform: "translateY(-1px)" }}>→</span>}
        </button>
      </div>
    </div>
  )
}

function ActivityRow({
  initials,
  name,
  partyType,
  action,
  timestamp,
  mint,
  muted,
}: {
  initials: string
  name: string
  partyType: string
  action: string
  timestamp: string
  mint?: boolean
  muted?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 6px",
        borderRadius: 8,
        opacity: muted ? 0.55 : 1,
        animation: "vdrFadeIn .22s ease-out",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: mint ? "rgba(44,140,112,.16)" : "rgba(12,10,9,.06)",
          color: mint ? "var(--mint, #2c8c70)" : "var(--t1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: inter,
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          flexWrap: "wrap",
          flex: 1,
          minWidth: 0,
        }}
      >
        <span style={{ fontFamily: inter, fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>
          {name}
        </span>
        <span
          style={{
            fontFamily: mono,
            fontSize: 9.5,
            color: "var(--t3)",
            letterSpacing: ".6px",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {partyType}
        </span>
        <span style={{ fontFamily: inter, fontSize: 12.5, color: "var(--t2)" }}>
          {action}
        </span>
      </div>
      <div
        style={{
          fontFamily: mono,
          fontSize: 11,
          color: "var(--t3)",
          letterSpacing: ".3px",
          flexShrink: 0,
        }}
      >
        {timestamp}
      </div>
    </div>
  )
}

// ── Panel 4 — Engagement Analytics ────────────────────────────────────
function EngagementPanel({
  requestStates,
}: {
  requestStates: Record<string, RequestState>
}) {
  const ndaGranted = requestStates["marcus-rivera"] === "granted"
  const lenderGranted = requestStates["northeast-bank"] === "granted"

  return (
    <section
      style={{
        padding: "22px 26px 22px",
        background: "rgba(255,255,255,.82)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderRadius: 16,
        boxShadow:
          "0 1px 0 rgba(255,255,255,.92) inset, 0 12px 30px rgba(12,10,9,.05)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
          Document Engagement · Real Time
        </div>
        <h2
          style={{
            fontFamily: garamond,
            fontSize: 22,
            fontWeight: 400,
            color: "var(--t1)",
            letterSpacing: "-.3px",
            lineHeight: 1.15,
          }}
        >
          Buyer and lender engagement with your documents.
        </h2>
        <div
          style={{
            fontFamily: inter,
            fontSize: 12,
            color: "var(--t3)",
            lineHeight: 1.5,
          }}
        >
          Based on 1 buyer view and 1 lender view since publication.
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 14 }}>
        <CimEngagementCard ndaSignedCount={ndaGranted ? 1 : 0} />
        <RecastEngagementCard lenderGranted={lenderGranted} />
      </div>
    </section>
  )
}

function CimEngagementCard({ ndaSignedCount }: { ndaSignedCount: number }) {
  const ndaPending = 1 - ndaSignedCount
  return (
    <article
      style={{
        padding: "18px 20px 16px",
        background: "#ffffff",
        border: "1px solid rgba(12,10,9,.10)",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(12,10,9,.05), 0 6px 16px rgba(12,10,9,.04)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            alignSelf: "flex-start",
            padding: "2px 8px",
            borderRadius: 9999,
            background: "rgba(44,140,112,.10)",
            border: "1px solid rgba(44,140,112,.28)",
            color: "var(--mint, #2c8c70)",
            fontFamily: mono,
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: ".7px",
            textTransform: "uppercase",
          }}
        >
          CIM · Buyer-Facing
        </span>
        <div
          style={{
            fontFamily: garamond,
            fontSize: 18,
            fontWeight: 400,
            color: "var(--t1)",
            letterSpacing: "-.2px",
          }}
        >
          Confidential Information Memorandum
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0,1fr))",
          gap: 10,
          paddingBottom: 8,
          borderBottom: "1px dashed rgba(12,10,9,.08)",
        }}
      >
        <Stat label="Views" value="1" />
        <Stat label="Avg time" value="4m 12s" />
        <Stat label="Downloads" value="0" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 9.5,
            color: "var(--t3)",
            letterSpacing: ".7px",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Time per section · 12 sections
        </div>
        <Heatmap />
        <div style={{ fontFamily: inter, fontSize: 11.5, color: "var(--t2)" }}>
          Most-read: <strong style={{ color: "var(--t1)", fontWeight: 600 }}>Executive Summary</strong> · 1m 42s
        </div>
      </div>

      <div
        style={{
          padding: "10px 12px",
          background: "rgba(44,140,112,.08)",
          border: "1px solid rgba(44,140,112,.22)",
          borderRadius: 10,
          fontFamily: inter,
          fontSize: 12,
          color: "var(--t1)",
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: "var(--mint, #2c8c70)", fontWeight: 600 }}>Insight ·</strong>{" "}
        Buyer spent the most time on Deal Structure — SBA financing terms are
        the primary interest.
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 4,
          fontFamily: mono,
          fontSize: 10.5,
          color: "var(--t3)",
          letterSpacing: ".4px",
        }}
      >
        <span>NDA · {ndaPending} pending · {ndaSignedCount} signed</span>
      </div>
    </article>
  )
}

function RecastEngagementCard({ lenderGranted }: { lenderGranted: boolean }) {
  return (
    <article
      style={{
        padding: "18px 20px 16px",
        background: "#ffffff",
        border: "1px solid rgba(12,10,9,.10)",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(12,10,9,.05), 0 6px 16px rgba(12,10,9,.04)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            alignSelf: "flex-start",
            padding: "2px 8px",
            borderRadius: 9999,
            background: "rgba(74,123,168,.10)",
            border: "1px solid rgba(74,123,168,.30)",
            color: "var(--sky, #4a7ba8)",
            fontFamily: mono,
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: ".7px",
            textTransform: "uppercase",
          }}
        >
          P&L Recast · Lender-Facing
        </span>
        <div
          style={{
            fontFamily: garamond,
            fontSize: 18,
            fontWeight: 400,
            color: "var(--t1)",
            letterSpacing: "-.2px",
          }}
        >
          Normalized Financial Summary
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0,1fr))",
          gap: 10,
          paddingBottom: 8,
          borderBottom: "1px dashed rgba(12,10,9,.08)",
        }}
      >
        <Stat label="Views" value="1" />
        <Stat label="Avg time" value="2m 38s" />
        <Stat label="Downloads" value="0" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 9.5,
            color: "var(--t3)",
            letterSpacing: ".7px",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Most-viewed section
        </div>
        <div
          style={{
            padding: "10px 12px",
            background: "rgba(74,123,168,.06)",
            border: "1px solid rgba(74,123,168,.20)",
            borderRadius: 8,
            fontFamily: inter,
            fontSize: 13,
            color: "var(--t1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontWeight: 500 }}>Add-Back Schedule</span>
          <span style={{ fontFamily: mono, fontSize: 11, color: "var(--sky, #4a7ba8)", fontWeight: 600 }}>
            1m 18s
          </span>
        </div>
      </div>

      <div
        style={{
          padding: "10px 12px",
          background: "rgba(74,123,168,.08)",
          border: "1px solid rgba(74,123,168,.22)",
          borderRadius: 10,
          fontFamily: inter,
          fontSize: 12,
          color: "var(--t1)",
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: "var(--sky, #4a7ba8)", fontWeight: 600 }}>Insight ·</strong>{" "}
        Lender reviewed add-back schedule — DSCR and add-back defensibility
        are the focus.
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 4,
          fontFamily: mono,
          fontSize: 10.5,
          color: "var(--t3)",
          letterSpacing: ".4px",
        }}
      >
        <span>NDA · Not required {lenderGranted ? "· access granted" : "· access pending"}</span>
      </div>
    </article>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 9.5,
          color: "var(--t3)",
          letterSpacing: ".6px",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: garamond,
          fontSize: 20,
          fontWeight: 400,
          color: "var(--t1)",
          letterSpacing: "-.2px",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  )
}

function Heatmap() {
  const [hover, setHover] = React.useState<number | null>(null)
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        gap: 4,
        height: 64,
        padding: "0 2px",
      }}
    >
      {CIM_HEATMAP.map((bar) => {
        const isHover = hover === bar.n
        return (
          <div
            key={bar.n}
            onMouseEnter={() => setHover(bar.n)}
            onMouseLeave={() => setHover(null)}
            style={{
              position: "relative",
              flex: 1,
              minWidth: 0,
              height: `${Math.max(8, bar.height * 100)}%`,
              borderRadius: 3,
              background: bar.emphasis
                ? "var(--mint, #2c8c70)"
                : "rgba(44,140,112,.30)",
              transition: "transform 160ms ease-out, opacity 160ms ease-out",
              transform: isHover ? "translateY(-2px)" : "translateY(0)",
              opacity: isHover ? 1 : 0.92,
              cursor: "default",
            }}
          >
            {isHover && (
              <span
                role="tooltip"
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 6px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "5px 9px",
                  borderRadius: 8,
                  background: "rgba(12,10,9,.94)",
                  color: "rgba(245,245,245,.95)",
                  fontSize: 10.5,
                  lineHeight: 1.3,
                  fontFamily: inter,
                  whiteSpace: "nowrap",
                  boxShadow: "0 8px 18px rgba(12,10,9,.22)",
                  zIndex: 30,
                }}
              >
                {bar.title} · {bar.time} avg
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Preview drawer ────────────────────────────────────────────────────
function PreviewDrawer({
  which,
  onClose,
  persona,
}: {
  which: PreviewKey
  onClose: () => void
  persona: Persona
}) {
  const open = which !== null
  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(12,10,9,.40)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: `opacity ${T.drawerEnterMs}ms ease-out`,
          zIndex: 100,
        }}
      />
      <aside
        aria-hidden={!open}
        role="dialog"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 560,
          maxWidth: "92vw",
          background: "var(--page-bg, #f5f4ef)",
          boxShadow: "-24px 0 64px rgba(12,10,9,.30)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: `transform ${T.drawerEnterMs}ms ease-out`,
          zIndex: 101,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            flexShrink: 0,
            padding: "16px 20px",
            background: "rgba(255,255,255,.86)",
            borderBottom: "1px solid var(--div)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            backdropFilter: "blur(16px) saturate(160%)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
            <div
              style={{
                fontFamily: mono,
                fontSize: 9.5,
                color: "var(--t3)",
                letterSpacing: ".7px",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Read-only · VDR
            </div>
            <div
              style={{
                fontFamily: garamond,
                fontSize: 19,
                fontWeight: 500,
                color: "var(--t1)",
                letterSpacing: "-.2px",
                lineHeight: 1.1,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {which === "cim"
                ? "Confidential Information Memorandum"
                : "P&L Recast — Normalized Financial Summary"}
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: ".4px",
                  color: "var(--t3)",
                  padding: "2px 6px",
                  borderRadius: 6,
                  background: "rgba(12,10,9,.05)",
                  border: "1px solid rgba(12,10,9,.08)",
                }}
              >
                v1.0
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="vdr-icon-btn"
            aria-label="Close preview"
            title="Close preview"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid rgba(12,10,9,.10)",
              background: "rgba(255,255,255,.85)",
              color: "var(--t2)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3l8 8M11 3l-8 8" />
            </svg>
          </button>
        </header>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "20px 22px 44px",
          }}
        >
          {which === "cim" ? (
            <DocumentsStation persona={persona} readOnly />
          ) : which === "recast" ? (
            <RecastStation persona={persona} readOnly />
          ) : null}
        </div>
      </aside>
    </>
  )
}

// ── Chip primitives ───────────────────────────────────────────────────
function Chip({
  tone,
  children,
}: {
  tone: "mint" | "amber"
  children: React.ReactNode
}) {
  const palette =
    tone === "mint"
      ? { color: "var(--mint, #2c8c70)", bg: "rgba(44,140,112,.10)", edge: "rgba(44,140,112,.28)" }
      : { color: "#a36a08", bg: "rgba(214,158,46,.12)", edge: "rgba(214,158,46,.32)" }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 9999,
        background: palette.bg,
        border: `1px solid ${palette.edge}`,
        color: palette.color,
        fontFamily: inter,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".05px",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: palette.color,
        }}
      />
      {children}
    </span>
  )
}

function Spinner({ light }: { light?: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        border: `2px solid ${light ? "rgba(245,245,245,.32)" : "rgba(12,10,9,.18)"}`,
        borderTopColor: light ? "var(--btn-fg)" : "var(--t1)",
        animation: "vdrSpin .8s linear infinite",
      }}
    />
  )
}

// ── Scoped styles ─────────────────────────────────────────────────────
function ScopedStyles() {
  return (
    <style>{`
      @keyframes vdrBlink {
        0%, 100% { opacity: 1;  }
        50%      { opacity: .3; }
      }
      @keyframes vdrFadeIn {
        from { opacity: 0; transform: translateY(3px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes vdrSpin {
        to { transform: rotate(360deg); }
      }
      .vdr-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 26px rgba(12,10,9,.22);
      }
      .vdr-card-btn:hover:not(:disabled) {
        background: rgba(12,10,9,.04);
      }
      .vdr-card-btn-primary:hover:not(:disabled) {
        background: var(--btn-bg);
        filter: brightness(.96);
      }
      .vdr-doc-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 1px 3px rgba(12,10,9,.06), 0 14px 30px rgba(12,10,9,.08);
      }
      .vdr-icon-btn:hover {
        background: rgba(12,10,9,.04);
        color: var(--t1);
      }
      .vdr-pill-btn:hover {
        border-color: rgba(12,10,9,.20);
      }
      .vdr-on-demand:hover {
        background: rgba(12,10,9,.025);
        border-color: rgba(12,10,9,.24);
      }
    `}</style>
  )
}
