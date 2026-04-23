"use client"

import { StageQuestionApp } from "@/components/assessment/StageQuestionApp"
import { STAGE3_QUESTIONS } from "@/lib/assessment/questions"

export default function Stage3Page() {
  return (
    <StageQuestionApp
      stageNum={3}
      questions={STAGE3_QUESTIONS}
      sessionKey="stage3"
      nextRoute="/assessment/stage-4"
      prevRoute="/assessment/stage-2"
    />
  )
}
