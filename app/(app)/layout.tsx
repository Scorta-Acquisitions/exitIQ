import { redirect } from "next/navigation"

import { AppShell } from "@/components/scorta/AppShell"
import { PERSONA } from "@/lib/persona"
import { createClient } from "@/lib/supabase/server"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

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
