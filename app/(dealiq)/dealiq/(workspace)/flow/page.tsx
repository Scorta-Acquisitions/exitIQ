import { PendingSurface } from "@/components/dealiq/PendingSurface"
import { FLOW_COPY } from "@/lib/dealiq/data/copy"

export default function DealIQFlowPage() {
  return (
    <PendingSurface
      eyebrow={FLOW_COPY.eyebrow}
      title={FLOW_COPY.title}
      note="Certified Deal Flow lands with item 12: pre-market listings ranked against the mandate, each with a certification basis and a countdown before it reaches the open market."
    />
  )
}
