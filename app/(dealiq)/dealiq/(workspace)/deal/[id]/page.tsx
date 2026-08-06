import { notFound } from "next/navigation"

import { DealWorkspace } from "@/components/dealiq/DealWorkspace"
import { PendingSurface } from "@/components/dealiq/PendingSurface"
import { ReverseRecastPanel } from "@/components/dealiq/ReverseRecastPanel"
import { ScoreSummary, ScreenScorePanel } from "@/components/dealiq/ScreenScorePanel"
import { analyzeDeal } from "@/lib/dealiq/analyze"
import { RECAST_COPY } from "@/lib/dealiq/data/copy"
import { FOCUS_DEAL } from "@/lib/dealiq/data/deal"
import { PIPELINE_DEALS } from "@/lib/dealiq/data/pipeline"
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

const TAB_NOTES: Record<Exclude<DealTabKey, "score" | "recast">, { eyebrow: string; note: string }> = {
  returns: {
    eyebrow: "Returns Model",
    note: "The Returns Model lands with item 8: the capital stack, DSCR against its floor, cash-on-cash, payback, and a sensitivity slider that recomputes every metric live across four scenarios.",
  },
  diligence: {
    eyebrow: "Diligence Pack",
    note: "The Diligence Pack lands with item 9: roughly twenty-five questions ranked by which kill the deal fastest, with the ones the recast findings promoted floated to the top.",
  },
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
