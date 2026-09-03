import { UploadStation } from "@/components/scorta/UploadStation"
import { PERSONA } from "@/lib/persona"

export const metadata = { title: "Ingestion Point — Scorta" }

export default function UploadPage() {
  return <UploadStation persona={PERSONA} />
}
