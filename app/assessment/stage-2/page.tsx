"use client"

import { StageQuestionApp } from "@/components/assessment/StageQuestionApp"
import { STAGE2_QUESTIONS } from "@/lib/assessment/questions"

export default function Stage2Page() {
  return (
    <StageQuestionApp
      stageNum={2}
      questions={STAGE2_QUESTIONS}
      sessionKey="stage2"
      nextRoute="/assessment/stage-3"
      prevRoute="/"
    />
  )
}
