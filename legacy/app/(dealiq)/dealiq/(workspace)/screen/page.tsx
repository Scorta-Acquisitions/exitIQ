import { DealInbox } from "@/components/dealiq/DealInbox"
import { buildCertifiedListingText } from "@/lib/dealiq/data/copy"
import { CERTIFIED_LISTINGS } from "@/lib/dealiq/data/flow"

/**
 * `?listing=` comes from a Certified Deal Flow card's CTA (item 12) and
 * prefills the Inbox with that listing's text — closing the loop back to the
 * screen. Read server-side from `searchParams` per standing decision 21.
 * An unknown id simply renders the empty Inbox.
 */
export default async function DealIQScreenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const query = await searchParams
  const rawListing = query.listing
  const listingId = Array.isArray(rawListing) ? rawListing[0] : rawListing
  const listing = listingId ? CERTIFIED_LISTINGS.find((candidate) => candidate.id === listingId) : undefined

  return <DealInbox initialText={listing ? buildCertifiedListingText(listing) : undefined} />
}
