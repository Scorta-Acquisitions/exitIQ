import { PendingSurface } from "@/components/dealiq/PendingSurface"
import { VERIFY_COPY } from "@/lib/dealiq/data/copy"

export default function DealIQVerifyPage() {
  return (
    <PendingSurface
      eyebrow={VERIFY_COPY.eyebrow}
      title={VERIFY_COPY.title}
      note="Capital Verification lands with item 11: a proof-of-funds document read entirely in the browser — never uploaded — that earns the Capital-Verified badge and unlocks certified deal flow."
    />
  )
}
