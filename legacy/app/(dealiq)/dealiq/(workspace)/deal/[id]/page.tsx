import { notFound } from "next/navigation"

import { DealWorkspace } from "@/components/dealiq/DealWorkspace"
import { DiligencePanel } from "@/components/dealiq/DiligencePanel"
import { LOIPanel } from "@/components/dealiq/LOIPanel"
import { ReturnsPanel } from "@/components/dealiq/ReturnsPanel"
import { ReverseRecastPanel } from "@/components/dealiq/ReverseRecastPanel"
import { ScreenScorePanel } from "@/components/dealiq/ScreenScorePanel"
import { analyzeDeal, type DealAnalysis } from "@/lib/dealiq/analyze"
import { BUYER } from "@/lib/dealiq/data/buyer"
import { DILIGENCE_COPY } from "@/lib/dealiq/data/copy"
import { DEAL_SEEDS } from "@/lib/dealiq/data/deal"
import { DILIGENCE_BANK } from "@/lib/dealiq/data/diligence"
import { diligencePackMarkdown, firedRules, rankQuestions } from "@/lib/dealiq/diligence"
import { buildLoi } from "@/lib/dealiq/loi"
import { resolveDealTab } from "@/lib/dealiq/navigation"
import type { DealSeed, DealTabKey } from "@/lib/dealiq/types"

/**
 * The deal workspace. Server component by design: `?tab=` is read from
 * `searchParams` rather than `useSearchParams`, which keeps the whole surface out
 * of a Suspense boundary and makes every tab a real, deep-linkable URL.
 *
 * Every deal in the seed set carries a complete seed, so every tab renders the
 * full engine-driven surface for every deal — the analysis is computed once per
 * request and every panel reads the same result, which is what keeps the five
 * tabs' figures in agreement by construction.
 */

const SEEDS_BY_ID: ReadonlyMap<string, DealSeed> = new Map(DEAL_SEEDS.map((seed) => [seed.card.id, seed]))

export default async function DealPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const query = await searchParams

  const seed = SEEDS_BY_ID.get(id)
  if (!seed) notFound()

  const rawTab = query.tab
  const activeTab = resolveDealTab(Array.isArray(rawTab) ? rawTab[0] : rawTab)
  const analysis = analyzeDeal(seed)

  return (
    <DealWorkspace dealId={id} activeTab={activeTab}>
      <DealTabPanel seed={seed} analysis={analysis} activeTab={activeTab} />
    </DealWorkspace>
  )
}

function DealTabPanel({
  seed,
  analysis,
  activeTab,
}: {
  seed: DealSeed
  analysis: DealAnalysis
  activeTab: DealTabKey
}) {
  const { card } = seed

  switch (activeTab) {
    case "score":
      return <ScreenScorePanel result={analysis.score} dealId={card.id} />

    case "recast":
      return (
        <ReverseRecastPanel recast={analysis.recast} dealId={card.id} ask={card.ask} compMultiple={seed.compMultiple} />
      )

    case "returns":
      return (
        <ReturnsPanel
          ask={card.ask}
          fairValue={analysis.recast.fairValue}
          defensibleSde={analysis.recast.defensibleSde}
          terms={analysis.terms}
          uncoveredOccupancy={analysis.uncoveredOccupancy}
        />
      )

    case "diligence": {
      // Ranked server-side off the same analysis the other tabs read; the pack
      // markdown is pre-built from that ranked list so the clipboard payload can
      // never diverge from what is on screen.
      const ranked = rankQuestions(DILIGENCE_BANK, firedRules(analysis.recast))
      const packMarkdown = diligencePackMarkdown(ranked, `${card.name} — ${DILIGENCE_COPY.eyebrow}`)
      return (
        <DiligencePanel ranked={ranked} flags={analysis.recast.flags} dealId={card.id} packMarkdown={packMarkdown} />
      )
    }

    case "loi": {
      // The draft derives from the same analysis as every other tab — `buildLoi`
      // reprices the stack at the offer, so the terms shown are the ones that
      // finance the price being offered, not the ask.
      const draft = buildLoi({
        dealId: card.id,
        dealName: card.name,
        ask: card.ask,
        buyerName: BUYER.name,
        firmName: BUYER.firmName,
        recast: analysis.recast,
        financing: analysis.terms,
      })
      return <LOIPanel draft={draft} />
    }
  }
}
