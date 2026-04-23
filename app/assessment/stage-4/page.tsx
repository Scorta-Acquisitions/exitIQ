"use client"

import { StageQuestionApp } from "@/components/assessment/StageQuestionApp"
import { STAGE4_QUESTIONS } from "@/lib/assessment/questions"

export default function Stage4Page() {
  return (
    <StageQuestionApp
      stageNum={4}
      questions={STAGE4_QUESTIONS}
      sessionKey="stage4"
      nextRoute="/assessment/generating"
      prevRoute="/assessment/stage-3"
    />
  )
}
