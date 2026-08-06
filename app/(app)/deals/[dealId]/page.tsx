import { redirect } from "next/navigation"

import { DealSnapshotStation } from "@/components/scorta/DealSnapshotStation"
import { getDealSnapshot, isLiveDeal } from "@/lib/operatorDeals"

export const metadata = { title: "Deal Snapshot — Scorta" }

export default async function DealSnapshotPage({ params }: { params: Promise<{ dealId: string }> }) {
  const { dealId } = await params

  if (isLiveDeal(dealId)) {
    redirect("/dashboard")
  }

  const deal = getDealSnapshot(dealId)
  if (!deal) {
    redirect("/deals")
  }

  return <DealSnapshotStation deal={deal} />
}
