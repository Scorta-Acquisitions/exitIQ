import { Suspense } from "react"
import { OnboardingApp } from "@/components/onboarding/OnboardingApp"

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingApp />
    </Suspense>
  )
}
