import { notFound } from "next/navigation"

import { DealWorkspace } from "@/components/dealiq/DealWorkspace"
import { PendingSurface } from "@/components/dealiq/PendingSurface"
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

const TAB_NOTES: Record<DealTabKey, { eyebrow: string; note: string }> = {
  score: {
    eyebrow: "Case Manager · buy-side",
    note: "The Screen Score lands with item 6: an animated dial, six weighted sub-scores each showing the basis that produced it, and a PASS / DIG / PURSUE verdict with the conditions it rests on.",
  },
  recast: {
    eyebrow: "Recast Agent · buy-side",
    note: "The Reverse Recast lands with item 7: the seller's add-back schedule taken apart line by line, with the defensible SDE, the adjustment total, and the negotiation delta — plus a streamed challenge memo that never blocks the table.",
  },
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
  const note = TAB_NOTES[activeTab]

  return (
    <DealWorkspace dealId={id} activeTab={activeTab}>
      <PendingSurface eyebrow={note.eyebrow} title={tabMeta?.label ?? "Deal"} note={note.note} />
    </DealWorkspace>
  )
}
