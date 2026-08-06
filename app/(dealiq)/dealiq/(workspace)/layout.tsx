import { redirect } from "next/navigation"

import { DealIQSessionProvider } from "@/components/dealiq/DealIQSessionContext"
import { DealIQShell } from "@/components/dealiq/DealIQShell"
import { DEALIQ_SIGNIN_PATH } from "@/lib/dealiq/navigation"
import { createClient } from "@/lib/supabase/server"

/**
 * The guard. Everything under `(workspace)` requires a session; `/dealiq/signin`
 * sits outside this group precisely so it can be reached without one.
 *
 * The redirect target is DealIQ's own door — never `/login`. A buyer must not be
 * handed a seller-branded sign-in.
 *
 * Deep-link preservation (`?next=`) lands with item 4, together with
 * `safeDealIqPath`, which is what makes an unvalidated redirect param safe.
 */
export default async function DealIQWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(DEALIQ_SIGNIN_PATH)

  return (
    <DealIQSessionProvider>
      <DealIQShell>{children}</DealIQShell>
    </DealIQSessionProvider>
  )
}
