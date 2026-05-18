import { redirect } from "next/navigation"

import { LoginPanel } from "@/components/scorta/LoginPanel"
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

  if (user) redirect("/dashboard")

  return <LoginPanel />
}
