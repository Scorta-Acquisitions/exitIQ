/**
 * Post-sign-in redirect resolution.
 *
 * The guard forwards the originally requested URL as `?next=` so a deep link
 * survives the sign-in round-trip. That param is attacker-controlled — an
 * unvalidated redirect target is a real open redirect — so nothing may pass it
 * to `redirect()` or `router.replace()` without going through this function.
 */

import { DEALIQ_ROOT } from "./navigation"

/**
 * Returns `raw` only when it is a same-origin path inside the DealIQ URL
 * space; anything else falls back to the pipeline. Rejects protocol-relative
 * URLs (`//host`), absolute URLs, backslash tricks, dot-segment traversal, and
 * encoded variants of each.
 */
export function safeDealIqPath(raw: string | null | undefined): string {
  if (!raw) return DEALIQ_ROOT

  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    return DEALIQ_ROOT
  }

  // Both the raw value and its decoded form must be clean — `%2f%2fevil.com`
  // only reveals itself after decoding.
  for (const value of [raw, decoded]) {
    if (!value.startsWith("/") || value.startsWith("//")) return DEALIQ_ROOT
    if (value.includes("\\") || value.includes(":") || value.includes("..")) return DEALIQ_ROOT
  }

  const inDealIqSpace = raw === DEALIQ_ROOT || raw.startsWith(`${DEALIQ_ROOT}/`) || raw.startsWith(`${DEALIQ_ROOT}?`)
  return inDealIqSpace ? raw : DEALIQ_ROOT
}
