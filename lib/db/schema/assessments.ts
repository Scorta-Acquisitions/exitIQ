import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

import type {
  GateAnswers,
  SegmentTag,
  Stage1Answers,
  Stage2Answers,
  Stage3Answers,
  Stage4Answers,
} from "@/lib/assessment/session"

export const assessmentSessions = pgTable("assessment_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: text("session_id").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  stage1: jsonb("stage1").$type<Stage1Answers>(),
  gate: jsonb("gate").$type<GateAnswers>(),
  stage2: jsonb("stage2").$type<Stage2Answers>(),
  stage3: jsonb("stage3").$type<Stage3Answers>(),
  stage4: jsonb("stage4").$type<Stage4Answers>(),
  // Renamed from segmentTag; DB column stays "segment_tag" — no migration needed.
  leadQuality: text("segment_tag").$type<SegmentTag>(),
  score: integer("score"),
  sbaEligible: boolean("sba_eligible"),
})

export const assessmentReports = pgTable("assessment_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: text("session_id")
    .notNull()
    .unique()
    .references(() => assessmentSessions.sessionId),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  reportMd: text("report_md").notNull(),
  teaserJson: jsonb("teaser_json"),
  modelUsed: text("model_used").notNull(),
  generationMs: integer("generation_ms"),
})

export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  role: text("role"), // 'seller' | 'buyer' | 'advisor' | 'both'
  source: text("source"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})
