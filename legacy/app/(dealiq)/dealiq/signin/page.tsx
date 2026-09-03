import { redirect } from "next/navigation"

import { BuyerSignIn } from "@/components/dealiq/BuyerSignIn"
import { DealIQScopedStyles } from "@/components/dealiq/DealIQShell"
import { hasDealIqAccess } from "@/lib/dealiq/access"
import { safeDealIqPath } from "@/lib/dealiq/nextPath"
import { createClient } from "@/lib/supabase/server"

/**
 * Public — this route sits outside the `(workspace)` group precisely so the guard
 * does not redirect it to itself. An already-signed-in visit skips the form, so a
 * presenter who signed in before the demo never sees this page.
 *
 * `?next=` carries the deep link the guard intercepted. It is attacker-controlled
 * and must only be consumed through `safeDealIqPath`.
 */
export default async function BuyerSignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const destination = safeDealIqPath(typeof params.next === "string" ? params.next : null)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Only a session with the DealIQ product grant skips the form. A seller session
  // sees the buyer door and must sign in with buyer credentials.
  if (hasDealIqAccess(user)) redirect(destination)

  return (
    <>
      <DealIQScopedStyles />
      <BuyerSignIn destination={destination} />
    </>
  )
}
