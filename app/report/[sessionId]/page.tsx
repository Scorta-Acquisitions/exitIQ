import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

import { FullReportVisual } from "@/components/exitiq/report-visual"
import { buildReportData } from "@/lib/assessment/report-transform"
import { mapStage1ForScoring } from "@/lib/assessment/transform"
import { db } from "@/lib/db"
import { assessmentReports, assessmentSessions } from "@/lib/db/schema"

export default async function ReportPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params

  const [session, report] = await Promise.all([
    db.query.assessmentSessions.findFirst({
      where: eq(assessmentSessions.sessionId, sessionId),
    }),
    db.query.assessmentReports.findFirst({
      where: eq(assessmentReports.sessionId, sessionId),
    }),
  ])

  if (!session?.gate?.firstName) {
    redirect("/")
  }

  const s1Scored = mapStage1ForScoring({
    ...session.stage1,
    years: session.stage1?.years ?? 5,
  })

  const data = buildReportData(s1Scored, session.gate.firstName, session.gate.sellingTimeline)

  return <FullReportVisual data={data} reportMd={report?.reportMd ?? undefined} />
}
