import { PendingSurface } from "@/components/dealiq/PendingSurface"
import { INBOX_COPY } from "@/lib/dealiq/data/copy"

export default function DealIQScreenPage() {
  return (
    <PendingSurface
      eyebrow={INBOX_COPY.eyebrow}
      title={INBOX_COPY.title}
      note="The Deal Inbox lands with item 5: paste a listing, watch the Ingestion Agent work through a scripted log, and get a structured deal card in a few seconds."
    />
  )
}
