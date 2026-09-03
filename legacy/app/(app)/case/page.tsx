import { CaseChatPage } from "@/components/scorta/CaseChatPage"
import { PERSONA } from "@/lib/persona"

export const metadata = { title: "Talk to CASE — Scorta" }

export default function CasePage() {
  return <CaseChatPage persona={PERSONA} />
}
