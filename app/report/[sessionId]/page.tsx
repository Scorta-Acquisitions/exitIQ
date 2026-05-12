import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

import { FullReportVisual } from "@/components/exitiq/report-visual"
import { buildReportData } from "@/lib/assessment/report-transform"
import { mapStage1ForScoring } from "@/lib/assessment/transform"
import { appendWorkflowTrace, compactStagesForTrace } from "@/lib/debug/workflow-trace"
import { db } from "@/lib/db"
import { assessmentReports, assessmentSessions } from "@/lib/db/schema"

export default async function ReportPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params

  appendWorkflowTrace({
    phase: "page.report.request_start",
    surface: "server",
    sessionId,
    origin: "app/report/[sessionId]/page",
  })

  const [session, report] = await Promise.all([
    db.query.assessmentSessions.findFirst({
      where: eq(assessmentSessions.sessionId, sessionId),
    }),
    db.query.assessmentReports.findFirst({
      where: eq(assessmentReports.sessionId, sessionId),
    }),
  ])

  appendWorkflowTrace({
    phase: "page.report.db_fetch_done",
    surface: "server",
    sessionId,
    origin: "app/report/[sessionId]/page",
    detail: {
      sessionFound: !!session,
      hasGateFirstName: !!session?.gate?.firstName,
      reportFound: !!report,
      reportMdChars: report?.reportMd?.length ?? 0,
      ...compactStagesForTrace(
        session?.stage2 as unknown as Record<string, unknown> | undefined,
        session?.stage3 as unknown as Record<string, unknown> | undefined,
        session?.stage4 as unknown as Record<string, unknown> | undefined
      ),
    },
  })

  if (!session?.gate?.firstName) {
    appendWorkflowTrace({
      phase: "page.report.redirect_missing_gate",
      surface: "server",
      sessionId,
      origin: "app/report/[sessionId]/page",
    })
    redirect("/")
  }

  const yearsDefaulted = session.stage1?.years == null
  const s1Raw = { ...session.stage1, years: session.stage1?.years ?? 5 }
  const s1Scored = mapStage1ForScoring(s1Raw)

  appendWorkflowTrace({
    phase: "page.report.stage1_scored",
    surface: "server",
    sessionId,
    origin: "app/report/[sessionId]/page",
    detail: {
      raw: {
        industry: s1Raw.industry,
        revenue: s1Raw.revenue,
        sde: s1Raw.sde,
        employees: s1Raw.employees,
        facilityType: s1Raw.facilityType,
        docReadiness: s1Raw.docReadiness,
        years: s1Raw.years,
      },
      scored: {
        industry: s1Scored.industry,
        revenue: s1Scored.revenue,
        sde: s1Scored.sde,
        employees: s1Scored.employees,
        facilityType: s1Scored.facilityType,
        docReadiness: s1Scored.docReadiness,
        years: s1Scored.years,
      },
      yearsDefaulted,
    },
  })

  const data = buildReportData(
    s1Scored,
    session.gate.firstName,
    session.gate.sellingTimeline,
    session.stage2 ?? undefined,
    session.stage3 ?? undefined,
    session.stage4 ?? undefined,
    { sessionId, origin: "page.report" },
    session.gate.exitReadiness ?? undefined
  )

  appendWorkflowTrace({
    phase: "page.report.rendering_full_report_visual",
    surface: "server",
    sessionId,
    origin: "app/report/[sessionId]/page",
    detail: {
      reportMdPassedToClientChars: report?.reportMd?.length ?? 0,
      reportMdIsEmpty: !report?.reportMd || report.reportMd.length === 0,
      visualComposite: data.score.composite,
      grade: data.score.grade,
      valuationK: { lo: data.valuation.lo, mid: data.valuation.mid, hi: data.valuation.hi },
      sbaEligible: data.sba.eligible,
    },
  })

  return <FullReportVisual data={data} reportMd={report?.reportMd ?? undefined} sessionId={sessionId} />
}
