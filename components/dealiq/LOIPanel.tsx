"use client"

/**
 * LOI Drafter — screen → offer inside one product (Execution Plan item 10).
 *
 * Term-sheet layout: serif section headings, mono figures, every row expandable
 * to the rationale that produced it. The draft is deterministic — `buildLoi`
 * derived every term from the recast and the repriced capital stack — and the
 * surface's job is to make that traceability legible. Non-binding labelling is
 * not optional (§7): the badge and disclaimer render unconditionally.
 *
 * "Send" is an in-app state change and a toast (§7: no outbound anything): the
 * gate writes the session flag that moves the pipeline card to the LOI stage.
 */

import React from "react"

import { useDealIQSession } from "@/components/dealiq/DealIQSessionContext"
import { SurfaceCard } from "@/components/dealiq/Surface"
import { LOI_COPY } from "@/lib/dealiq/data/copy"
import { formatCurrency } from "@/lib/dealiq/format"
import { SECTION_LABEL } from "@/lib/dealiq/loi"
import type { ApprovePhase, LoiDraft, LoiSectionKey } from "@/lib/dealiq/types"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

const SECTION_ORDER: ReadonlyArray<LoiSectionKey> = ["price", "structure", "conditions", "process"]

/** The scripted ~700ms send, per the plan's step 3. */
const SEND_SPINNER_MS = 700
const TOAST_MS = 3200

export function LOIPanel({ draft }: { draft: LoiDraft }) {
  const { setLoiSent, loiSentDealId, hydrated } = useDealIQSession()

  const [phase, setPhase] = React.useState<ApprovePhase>("idle")
  const [signedAt, setSignedAt] = React.useState<{ date: string; time: string } | null>(null)
  const [toast, setToast] = React.useState(false)
  const timersRef = React.useRef<Array<ReturnType<typeof setTimeout>>>([])

  React.useEffect(() => () => timersRef.current.forEach(clearTimeout), [])

  // An LOI sent earlier in the session stays sent across navigation — the gate
  // renders in its signed state rather than inviting a second send.
  const alreadySent = hydrated && loiSentDealId === draft.dealId && phase === "idle"

  function onSend() {
    if (phase !== "idle") return
    setPhase("approving")
    const now = new Date()
    const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    timersRef.current.push(
      setTimeout(() => {
        setPhase("approved")
        setSignedAt({ date, time })
        setLoiSent(draft.dealId)
        setToast(true)
        timersRef.current.push(setTimeout(() => setToast(false), TOAST_MS))
      }, SEND_SPINNER_MS)
    )
  }

  return (
    <div className="dq-screen" style={{ maxWidth: 760 }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 9.5,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "var(--t3)",
        }}
      >
        {LOI_COPY.eyebrow}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h1
          style={{
            margin: "3px 0 0",
            fontFamily: garamond,
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: "-.3px",
            color: "var(--t1)",
          }}
        >
          {LOI_COPY.title}
        </h1>
        <span
          style={{
            fontFamily: mono,
            fontSize: 9.5,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            color: "var(--gold)",
            border: "1px solid var(--gold)",
            borderRadius: 6,
            padding: "3px 7px",
          }}
        >
          {LOI_COPY.badge}
        </span>
      </div>

      {/* Letter head — who is offering what to whom */}
      <div style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.6, color: "var(--t2)", maxWidth: 620 }}>
        <span style={{ fontWeight: 600, color: "var(--t1)" }}>{draft.buyerName}</span> · {draft.firmName} →{" "}
        {draft.dealName}
      </div>

      <WhyThisPrice draft={draft} />

      {SECTION_ORDER.map((section) => {
        const rows = draft.terms.filter((term) => term.section === section)
        if (rows.length === 0) return null
        return (
          <section key={section} style={{ marginTop: 24 }}>
            <h2
              style={{
                margin: 0,
                fontFamily: garamond,
                fontSize: 18,
                fontWeight: 500,
                letterSpacing: "-.2px",
                color: "var(--t1)",
                paddingBottom: 6,
                borderBottom: "1px solid var(--div)",
              }}
            >
              {SECTION_LABEL[section]}
            </h2>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {rows.map((term) => (
                <details key={term.id} className="dq-loi-row" style={{ borderBottom: "1px solid var(--div)" }}>
                  <summary
                    className="dq-focus"
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 12,
                      padding: "10px 2px",
                      cursor: "pointer",
                      listStyle: "none",
                    }}
                  >
                    <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "var(--t1)" }}>{term.label}</span>
                    <span
                      style={{
                        flexShrink: 0,
                        fontFamily: mono,
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: "var(--t1)",
                        textAlign: "right",
                      }}
                    >
                      {term.value}
                    </span>
                  </summary>
                  <p
                    style={{
                      margin: "0 0 10px",
                      padding: "8px 10px",
                      fontSize: 11.5,
                      lineHeight: 1.55,
                      color: "var(--t2)",
                      background: "var(--s2)",
                      borderRadius: 8,
                    }}
                  >
                    {term.rationale}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )
      })}

      {/* Non-binding disclaimer — renders unconditionally */}
      <p
        style={{
          margin: "22px 0 0",
          padding: "12px 14px",
          fontSize: 11.5,
          lineHeight: 1.5,
          color: "var(--t3)",
          border: "1px dashed var(--b2)",
          borderRadius: 9,
          background: "var(--s2)",
        }}
      >
        {LOI_COPY.disclaimer}
      </p>

      {/* Send gate */}
      <SurfaceCard style={{ marginTop: 26, display: "flex", justifyContent: "flex-end", padding: "14px 18px" }}>
        {phase === "approved" && signedAt ? (
          <div
            className="dq-enter"
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid var(--dq-accent-edge)",
              background: "var(--dq-accent-soft)",
              fontSize: 12.5,
              color: "var(--t1)",
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--dq-accent)" }}>{LOI_COPY.sent}</span>
            <span style={{ fontFamily: mono, fontSize: 10.5, color: "var(--t3)", marginLeft: 10 }}>
              {draft.buyerName} · {signedAt.date} · {signedAt.time}
            </span>
          </div>
        ) : alreadySent ? (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid var(--dq-accent-edge)",
              background: "var(--dq-accent-soft)",
              fontSize: 12.5,
              color: "var(--t1)",
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--dq-accent)" }}>{LOI_COPY.sent}</span>
            <span style={{ fontFamily: mono, fontSize: 10.5, color: "var(--t3)", marginLeft: 10 }}>
              {draft.buyerName} · earlier this session
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSend}
            disabled={phase !== "idle"}
            className="dq-primary dq-focus"
            style={{
              padding: "11px 18px",
              borderRadius: 9,
              border: "none",
              background: "var(--dq-accent)",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: inter,
              cursor: phase === "idle" ? "pointer" : "default",
              opacity: phase === "idle" ? 1 : 0.72,
            }}
          >
            {phase === "approving" ? LOI_COPY.sending : LOI_COPY.sendGate}
          </button>
        )}
      </SurfaceCard>

      {toast ? (
        <div
          role="status"
          className="dq-enter"
          style={{
            position: "fixed",
            bottom: 22,
            right: 22,
            zIndex: 60,
            padding: "11px 16px",
            borderRadius: 10,
            border: "1px solid var(--dq-accent-edge)",
            background: "var(--dd-bg)",
            boxShadow: "0 14px 40px rgba(20,15,8,.14)",
            fontSize: 12.5,
            color: "var(--t1)",
          }}
        >
          <span style={{ color: "var(--dq-accent)", fontWeight: 600 }}>{LOI_COPY.sent}</span>
        </div>
      ) : null}
    </div>
  )
}

/** The callout: ask vs offer vs gap, with the price term's own rationale beneath. */
function WhyThisPrice({ draft }: { draft: LoiDraft }) {
  const priceTerm = draft.terms.find((term) => term.id === "price")
  const figures: Array<{ label: string; value: string; tone: string }> = [
    { label: LOI_COPY.calloutAsk, value: formatCurrency(draft.price + draft.discountToAsk), tone: "var(--t2)" },
    { label: LOI_COPY.calloutOffer, value: formatCurrency(draft.price), tone: "var(--dq-accent)" },
    { label: LOI_COPY.calloutGap, value: formatCurrency(draft.discountToAsk), tone: "var(--gold)" },
  ]
  return (
    <aside
      aria-label={LOI_COPY.whyThisPrice}
      style={{
        marginTop: 18,
        padding: "14px 16px",
        borderRadius: 11,
        border: "1px solid var(--dq-accent-edge)",
        background: "var(--dq-accent-soft)",
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 9,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--dq-accent)",
        }}
      >
        {LOI_COPY.whyThisPrice}
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 22, flexWrap: "wrap" }}>
        {figures.map((figure) => (
          <div key={figure.label}>
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: ".06em", color: "var(--t3)" }}>
              {figure.label}
            </div>
            <div style={{ marginTop: 2, fontFamily: mono, fontSize: 15, fontWeight: 600, color: figure.tone }}>
              {figure.value}
            </div>
          </div>
        ))}
      </div>
      {priceTerm ? (
        <p style={{ margin: "10px 0 0", fontSize: 11.5, lineHeight: 1.55, color: "var(--t2)" }}>
          {priceTerm.rationale}
        </p>
      ) : null}
    </aside>
  )
}
