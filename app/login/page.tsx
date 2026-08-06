import { redirect } from "next/navigation"

import { LoginPanel } from "@/components/scorta/LoginPanel"
import { hasExitIqAccess } from "@/lib/productAccess"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Sign in — Scorta",
  description: "Sign in to your Scorta seller workspace.",
}

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Only a session with the seller product grant skips the form. A buyer session
  // sees the seller door and must sign in with seller credentials.
  if (hasExitIqAccess(user)) redirect("/dashboard")

  return <LoginPanel />
}
