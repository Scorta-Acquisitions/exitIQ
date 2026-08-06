import { redirect } from "next/navigation"

import { BuyerSignIn } from "@/components/dealiq/BuyerSignIn"
import { DealIQScopedStyles } from "@/components/dealiq/DealIQShell"
import { DEALIQ_ROOT } from "@/lib/dealiq/navigation"
import { createClient } from "@/lib/supabase/server"

/**
 * Public — this route sits outside the `(workspace)` group precisely so the guard
 * does not redirect it to itself. An already-signed-in visit skips the form, so a
 * presenter who signed in before the demo never sees this page.
 */
export default async function BuyerSignInPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect(DEALIQ_ROOT)

  return (
    <>
      <DealIQScopedStyles />
      <BuyerSignIn />
    </>
  )
}
