import { DocumentsStation } from "@/components/scorta/DocumentsStation"
import { PERSONA } from "@/lib/persona"

export const metadata = { title: "CIM & Docs — Scorta" }

export default function DocumentsPage() {
  return <DocumentsStation persona={PERSONA} />
}
