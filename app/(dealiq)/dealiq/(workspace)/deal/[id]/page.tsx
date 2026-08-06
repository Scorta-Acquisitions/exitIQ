import { notFound } from "next/navigation"

import { DealWorkspace } from "@/components/dealiq/DealWorkspace"
import { DiligencePanel } from "@/components/dealiq/DiligencePanel"
import { PendingSurface } from "@/components/dealiq/PendingSurface"
import { ReturnsPanel } from "@/components/dealiq/ReturnsPanel"
import { ReverseRecastPanel } from "@/components/dealiq/ReverseRecastPanel"
import { ScoreSummary, ScreenScorePanel } from "@/components/dealiq/ScreenScorePanel"
import { analyzeDeal } from "@/lib/dealiq/analyze"
import { DILIGENCE_COPY, RECAST_COPY, RETURNS_COPY } from "@/lib/dealiq/data/copy"
import { FOCUS_DEAL } from "@/lib/dealiq/data/deal"
import { DILIGENCE_BANK } from "@/lib/dealiq/data/diligence"
import { PIPELINE_DEALS } from "@/lib/dealiq/data/pipeline"
import { diligencePackMarkdown, firedRules, rankQuestions } from "@/lib/dealiq/diligence"
import { DEAL_TABS, resolveDealTab } from "@/lib/dealiq/navigation"
import type { DealTabKey } from "@/lib/dealiq/types"

/**
 * The deal workspace. Server component by design: `?tab=` is read from
 * `searchParams` rather than `useSearchParams`, which keeps the whole surface out
 * of a Suspense boundary and makes every tab a real, deep-linkable URL.
 *
 * The focus deal is a valid target even before it has been screened — it is in
 * the fixture set, just not on the board yet — so a partner sent a deep link
 * during the demo lands on the deal rather than a 404.
 */

const VALID_DEAL_IDS: ReadonlySet<string> = new Set([...PIPELINE_DEALS.map((deal) => deal.id), FOCUS_DEAL.card.id])

const TAB_NOTES: Record<
  Exclude<DealTabKey, "score" | "recast" | "returns" | "diligence">,
  { eyebrow: string; note: string }
> = {
  loi: {
    eyebrow: "LOI Drafter",
    note: "The LOI Drafter lands with item 10: a non-binding term sheet derived from the returns model and the recast, with a negotiation rationale attached to every term.",
  },
}

export default async function DealPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const query = await searchParams

  if (!VALID_DEAL_IDS.has(id)) notFound()

  const rawTab = query.tab
  const activeTab = resolveDealTab(Array.isArray(rawTab) ? rawTab[0] : rawTab)
  const tabMeta = DEAL_TABS.find((tab) => tab.key === activeTab)

  return (
    <DealWorkspace dealId={id} activeTab={activeTab}>
      {activeTab === "score" ? (
        <ScoreTab dealId={id} />
      ) : activeTab === "recast" ? (
        <RecastTab dealId={id} />
      ) : activeTab === "returns" ? (
        <ReturnsTab dealId={id} />
      ) : activeTab === "diligence" ? (
        <DiligenceTab dealId={id} />
      ) : (
        <PendingSurface
          eyebrow={TAB_NOTES[activeTab].eyebrow}
          title={tabMeta?.label ?? "Deal"}
          note={TAB_NOTES[activeTab].note}
        />
      )}
    </DealWorkspace>
  )
}

/**
 * Only the focus deal has a seed, so only it gets the full engine-driven panel.
 * Seeded board deals visited via the stepper render their recorded score; a deal
 * with no score yet renders the not-screened state.
 */
function ScoreTab({ dealId }: { dealId: string }) {
  if (dealId === FOCUS_DEAL.card.id) {
    const analysis = analyzeDeal(FOCUS_DEAL)
    return <ScreenScorePanel result={analysis.score} dealId={dealId} />
  }
  const deal = PIPELINE_DEALS.find((candidate) => candidate.id === dealId)
  return <ScoreSummary score={deal?.score ?? null} verdict={deal?.verdict ?? null} />
}

/** Same split as the score tab: full challenge table for the focus deal only. */
function RecastTab({ dealId }: { dealId: string }) {
  if (dealId === FOCUS_DEAL.card.id) {
    const analysis = analyzeDeal(FOCUS_DEAL)
    return (
      <ReverseRecastPanel
        recast={analysis.recast}
        dealId={dealId}
        ask={FOCUS_DEAL.card.ask}
        compMultiple={FOCUS_DEAL.compMultiple}
      />
    )
  }
  return <PendingSurface eyebrow={RECAST_COPY.eyebrow} title={RECAST_COPY.title} note={RECAST_COPY.notAvailableNote} />
}

/**
 * Same split again. The ranking runs server-side off the same analysis the other
 * tabs read, and the markdown for "Copy pack" is pre-built from that ranked
 * list so the clipboard payload can never diverge from what is on screen.
 */
function DiligenceTab({ dealId }: { dealId: string }) {
  if (dealId === FOCUS_DEAL.card.id) {
    const analysis = analyzeDeal(FOCUS_DEAL)
    const ranked = rankQuestions(DILIGENCE_BANK, firedRules(analysis.recast))
    const packMarkdown = diligencePackMarkdown(ranked, `${FOCUS_DEAL.card.name} — ${DILIGENCE_COPY.eyebrow}`)
    return <DiligencePanel ranked={ranked} flags={analysis.recast.flags} dealId={dealId} packMarkdown={packMarkdown} />
  }
  return (
    <PendingSurface
      eyebrow={DILIGENCE_COPY.eyebrow}
      title={DILIGENCE_COPY.title}
      note={DILIGENCE_COPY.notAvailableNote}
    />
  )
}

/** Same split again: the live model for the focus deal, an honest note for the rest. */
function ReturnsTab({ dealId }: { dealId: string }) {
  if (dealId === FOCUS_DEAL.card.id) {
    const analysis = analyzeDeal(FOCUS_DEAL)
    return (
      <ReturnsPanel
        ask={FOCUS_DEAL.card.ask}
        fairValue={analysis.recast.fairValue}
        defensibleSde={analysis.recast.defensibleSde}
        terms={analysis.terms}
        uncoveredOccupancy={analysis.uncoveredOccupancy}
      />
    )
  }
  return (
    <PendingSurface eyebrow={RETURNS_COPY.eyebrow} title={RETURNS_COPY.title} note={RETURNS_COPY.notAvailableNote} />
  )
}
