import { redirect } from "next/navigation"

import { AppShell } from "@/components/scorta/AppShell"
import { PERSONA } from "@/lib/persona"
import { hasExitIqAccess } from "@/lib/productAccess"
import { createClient } from "@/lib/supabase/server"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // A session is necessary but not sufficient — the shared Supabase project means a
  // buyer (DealIQ) session reaches this guard too. The seller workspace requires
  // its product grant.
  if (!hasExitIqAccess(user)) redirect("/login")

  return (
    <AppShell
      seller={{
        displayName: PERSONA.identity.displayName,
        firstName: PERSONA.identity.firstName,
        email: PERSONA.identity.email,
        avatarInitials: PERSONA.identity.avatarInitials,
        avatarColor: PERSONA.identity.avatarColor,
        avatarBg: PERSONA.identity.avatarBg,
        businessName: PERSONA.identity.businessName,
        scorePill: { value: PERSONA.exitIQ.score, label: PERSONA.exitIQ.label },
      }}
    >
      {children}
    </AppShell>
  )
}
