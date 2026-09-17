import { formatMillions } from "@/lib/site/format"
import { type Offer, type OfferId, OFFERS, type Priority } from "./data"

/** Risk-adjusted value of an offer for one seller priority. Higher is better. */
export function offerScore(o: Offer, p: Priority): number {
  const risk = o.cash + o.note * 0.88 + o.earn * 0.45 + o.roll * 0.65
  if (p === "cash") return o.cash + 0.2 * (o.note + o.earn + o.roll)
  if (p === "certainty") return risk * Math.pow(o.cert, 1.5)
  if (p === "upside") return risk + 1.2 * o.roll + 0.6 * o.earn
  return risk * 0.5 + (o.staff / 100) * 3
}

export interface OfferRanking {
  bestId: OfferId
  highestHeadlineId: OfferId
}

/**
 * The letters in the order a priority ranks them, strongest fit first; equal scores keep the letters' own
 * order, so the ranking is stable. `rankOrder(p)[0]` is always `rankOffers(p).bestId`.
 */
export function rankOrder(p: Priority, offers: Offer[] = OFFERS): OfferId[] {
  return offers
    .map((o, i) => ({ id: o.id, i, score: offerScore(o, p) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((entry) => entry.id)
}

/** Each letter's place in the ranking for a priority, 1 = strongest fit; equal scores keep the letters' order. */
export function rankFor(p: Priority): Record<OfferId, number> {
  const ranks = {} as Record<OfferId, number>
  rankOrder(p).forEach((id, place) => {
    ranks[id] = place + 1
  })
  return ranks
}

export function rankOffers(p: Priority, offers: Offer[] = OFFERS): OfferRanking {
  const first = offers[0]
  if (!first) throw new Error("rankOffers requires at least one offer")
  const best = offers.reduce((a, b) => (offerScore(b, p) > offerScore(a, p) ? b : a), first)
  const head = offers.reduce((a, b) => (b.head > a.head ? b : a), first)
  return { bestId: best.id, highestHeadlineId: head.id }
}

export type CertaintyLabel = "High" | "Moderate" | "Lower"

export function certaintyLabel(cert: number): CertaintyLabel {
  return cert >= 0.88 ? "High" : cert >= 0.7 ? "Moderate" : "Lower"
}

export function paidLater(o: Offer): string {
  return o.note + o.earn > 0 ? formatMillions(o.note + o.earn) : "None"
}

export function retained(o: Offer): string {
  return o.roll ? formatMillions(o.roll) : "None"
}

/** A letter's closing-risk line: the certainty band and how long the buyer asks to hold exclusivity. */
export function closingRisk(o: Offer): string {
  return `${certaintyLabel(o.cert)} · ${o.excl} exclusivity`
}

export function findOffer(id: OfferId | null): Offer | null {
  return OFFERS.find((o) => o.id === id) ?? null
}
