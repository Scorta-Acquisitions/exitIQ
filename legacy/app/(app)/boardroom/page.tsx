import { BoardroomStation } from "@/components/scorta/BoardroomStation"
import { PERSONA } from "@/lib/persona"

export const metadata = { title: "The Boardroom — Scorta" }

export default function BoardroomPage() {
  return <BoardroomStation persona={PERSONA} />
}
