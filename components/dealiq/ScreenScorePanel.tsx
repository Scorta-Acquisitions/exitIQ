/**
 * Screen Score — the 90-second kill decision. A dial, six sub-score rows
 * rendered off the engine's returned array (adding a seventh sub-score requires
 * no JSX edit), the verdict, the conditions it rests on, and a methodology
 * drawer that renders the engine's own constants.
 *
 * Server component: everything here is derived from a `ScreenScoreResult`
 * computed on the server. Only the dial (animation) is a client component.
 */

import Link from "next/link"

import { SurfaceCard } from "@/components/dealiq/Surface"
import { ScoreDial } from "@/components/shared/ScoreDial"
import { SCORE_COPY } from "@/lib/dealiq/data/copy"
import { bandAccentVar, formatPercent, formatScore, verdictAccentVar } from "@/lib/dealiq/format"
import { dealPath } from "@/lib/dealiq/navigation"
import { SUB_SCORE_LABEL, VERDICT_BANDS, WEIGHTS } from "@/lib/dealiq/screenScore"
import type { ScreenScoreResult, SubScoreKey, Verdict } from "@/lib/dealiq/types"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

export function ScreenScorePanel({
  result,
  dealId,
  /** Cross-product comparison — hidden until the content pass supplies the two scores. */
  crossProduct,
}: {
  result: ScreenScoreResult
  dealId: string
  crossProduct?: { buyScore: number; sellScore: number }
}) {
  const accent = verdictAccentVar(result.verdict)

  return (
    <div className="dq-screen" style={{ maxWidth: 880 }}>
      <Header />

      <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap", marginTop: 18 }}>
        {/* Dial + verdict */}
        <SurfaceCard
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            padding: "24px 30px 22px",
            alignSelf: "stretch",
            justifyContent: "center",
          }}
        >
          <ScoreDial
            value={result.composite}
            accentColor={accent}
            label={`Screen score ${formatScore(result.composite)} of 100 — verdict ${result.verdict}`}
          />
          <VerdictBadge verdict={result.verdict} />
        </SurfaceCard>

        {/* Sub-score rows — rendered off the engine's array, never enumerated by hand */}
        <div style={{ flex: 1, minWidth: 320, display: "flex", flexDirection: "column", gap: 12 }}>
          {result.subScores.map((sub) => (
            <div key={sub.key}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--t1)", flex: 1 }}>{sub.label}</span>
                <span style={{ fontFamily: mono, fontSize: 9.5, color: "var(--t3)" }}>
                  {formatPercent(sub.weight)} weight
                </span>
                <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 600, color: bandAccentVar(sub.band) }}>
                  {formatScore(sub.score)}
                </span>
              </div>
              <div
                aria-hidden
                style={{ marginTop: 4, height: 5, borderRadius: 3, background: "var(--s2)", overflow: "hidden" }}
              >
                <div
                  style={{
                    width: `${Math.max(0, Math.min(100, sub.score))}%`,
                    height: "100%",
                    borderRadius: 3,
                    background: bandAccentVar(sub.band),
                  }}
                />
              </div>
              <div style={{ marginTop: 3, fontSize: 11, lineHeight: 1.45, color: "var(--t2)" }}>{sub.basis}</div>
            </div>
          ))}
        </div>
      </div>

      {result.conditions.length > 0 && (
        <SurfaceCard tone="soft" style={{ marginTop: 28 }}>
          <SectionLabel>{SCORE_COPY.conditionsTitle}</SectionLabel>
          <ul
            style={{
              margin: "8px 0 0",
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {result.conditions.map((condition) => (
              <li key={condition.id} style={{ display: "flex", gap: 8, fontSize: 12.5, lineHeight: 1.5 }}>
                <span aria-hidden style={{ color: accent, flexShrink: 0 }}>
                  →
                </span>
                <span style={{ color: "var(--t2)" }}>
                  {condition.text}{" "}
                  <Link
                    href={dealPath(dealId, condition.tab)}
                    className="dq-focus"
                    style={{ color: "var(--dq-accent)", fontWeight: 500, textDecoration: "none" }}
                  >
                    See the proof →
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      )}

      {crossProduct ? <CrossProductStrip buyScore={crossProduct.buyScore} sellScore={crossProduct.sellScore} /> : null}

      <MethodologyDrawer />
    </div>
  )
}

/**
 * Compact state for deals without a full engine analysis — seeded board deals
 * visited via the stepper, and deals not yet screened at all.
 */
export function ScoreSummary({ score, verdict }: { score: number | null; verdict: Verdict | null }) {
  return (
    <div className="dq-screen" style={{ maxWidth: 880 }}>
      <Header />
      {score != null && verdict != null ? (
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 18 }}>
          <ScoreDial
            value={score}
            size={120}
            accentColor={verdictAccentVar(verdict)}
            label={`Screen score ${formatScore(score)} of 100 — verdict ${verdict}`}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
            <VerdictBadge verdict={verdict} />
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: "var(--t2)", maxWidth: 420 }}>
              {SCORE_COPY.summaryOnlyNote}
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            marginTop: 18,
            padding: "18px 20px",
            borderRadius: 11,
            border: "1px dashed var(--b2)",
            background: "var(--s2)",
            maxWidth: 620,
          }}
        >
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: "var(--t2)" }}>
            {SCORE_COPY.notScreenedNote}
          </p>
        </div>
      )}
    </div>
  )
}

function Header() {
  return (
    <>
      <div
        style={{
          fontFamily: mono,
          fontSize: 9.5,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "var(--t3)",
        }}
      >
        {SCORE_COPY.eyebrow}
      </div>
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
        {SCORE_COPY.title}
      </h1>
    </>
  )
}

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const accent = verdictAccentVar(verdict)
  return (
    <span
      style={{
        fontFamily: mono,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: ".12em",
        color: accent,
        border: `1px solid ${accent}`,
        borderRadius: 7,
        padding: "5px 12px",
      }}
    >
      {verdict}
    </span>
  )
}

function CrossProductStrip({ buyScore, sellScore }: { buyScore: number; sellScore: number }) {
  return (
    <section
      style={{
        marginTop: 26,
        padding: "14px 18px",
        borderRadius: 11,
        border: "1px solid var(--dq-agent-edge)",
        background: "var(--dq-agent-soft)",
      }}
    >
      <SectionLabel>{SCORE_COPY.crossProductLead}</SectionLabel>
      <div style={{ display: "flex", gap: 24, marginTop: 8, fontFamily: mono, fontSize: 14, fontWeight: 600 }}>
        <span style={{ color: "var(--dq-accent)" }}>Buy-side {formatScore(buyScore)}</span>
        <span style={{ color: "var(--t2)" }}>Sell-side {formatScore(sellScore)}</span>
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 11.5, lineHeight: 1.5, color: "var(--t2)" }}>
        {SCORE_COPY.crossProductBody}
      </p>
    </section>
  )
}

function MethodologyDrawer() {
  return (
    <details style={{ marginTop: 26 }}>
      <summary
        className="dq-focus"
        style={{
          cursor: "pointer",
          fontFamily: mono,
          fontSize: 10.5,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--t3)",
        }}
      >
        {SCORE_COPY.methodologyTitle}
      </summary>
      <div
        style={{
          marginTop: 10,
          padding: "14px 16px",
          borderRadius: 11,
          border: "1px solid var(--b3)",
          background: "var(--s2)",
          maxWidth: 560,
        }}
      >
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--t2)" }}>{SCORE_COPY.methodologyLead}</p>
        <ul
          style={{
            margin: "10px 0 0",
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {(Object.keys(WEIGHTS) as SubScoreKey[]).map((key) => (
            <li
              key={key}
              style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--t2)" }}
            >
              <span>{SUB_SCORE_LABEL[key]}</span>
              <span style={{ fontFamily: mono }}>{formatPercent(WEIGHTS[key])}</span>
            </li>
          ))}
        </ul>
        <p style={{ margin: "10px 0 0", fontFamily: mono, fontSize: 10.5, color: "var(--t3)" }}>
          PURSUE ≥ {VERDICT_BANDS.PURSUE} · DIG ≥ {VERDICT_BANDS.DIG} · below is PASS
        </p>
        <p style={{ margin: "8px 0 0", fontSize: 11.5, fontStyle: "italic", color: "var(--t2)" }}>
          {SCORE_COPY.noModelLine}
        </p>
      </div>
    </details>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: 10.5,
        letterSpacing: ".08em",
        textTransform: "uppercase",
        color: "var(--t3)",
      }}
    >
      {children}
    </div>
  )
}
