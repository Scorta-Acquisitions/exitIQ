import { type NextRequest, NextResponse } from "next/server"

import { DEALIQ_ROOT, DEALIQ_SIGNIN_PATH } from "@/lib/dealiq/navigation"
import { createMiddlewareClient } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)

  // Refresh session if expired — required for Server Component auth to stay in sync.
  // Result is intentionally unused for seller routes; session data is read in Server
  // Components via lib/supabase/server.ts when needed.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Signed-out DealIQ requests redirect here (not in the workspace layout) because
  // only the middleware knows the requested path — `?next=` is what lets a deep link
  // survive the sign-in round-trip. The layout guard remains as the backstop.
  const { pathname, search } = request.nextUrl
  const inDealIq = pathname === DEALIQ_ROOT || pathname.startsWith(`${DEALIQ_ROOT}/`)
  if (!user && inDealIq && pathname !== DEALIQ_SIGNIN_PATH) {
    const url = request.nextUrl.clone()
    url.pathname = DEALIQ_SIGNIN_PATH
    url.search = `next=${encodeURIComponent(pathname + search)}`
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image  (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - common static asset extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
}
