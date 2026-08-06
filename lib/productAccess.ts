/**
 * Product-level access control for the seller workspace.
 *
 * exitIQ and DealIQ share one Supabase project, so a bare `getUser()` check
 * passes any session — a buyer session would walk into the seller workspace.
 * Access requires an explicit product grant in the user's `app_metadata`
 * (server-controlled; a user cannot edit it), set at provisioning time:
 *
 *   raw_app_meta_data.products = ["exitiq"]
 *
 * `lib/dealiq/access.ts` is the buy-side mirror of this module. They are kept
 * as two small copies rather than one shared module because `lib/dealiq/`
 * imports nothing from outside `lib/dealiq/` (DealIQ standing decision 1) —
 * change one, check the other.
 */

export const EXITIQ_PRODUCT = "exitiq"

export interface ProductScopedUser {
  app_metadata?: Record<string, unknown> | null
}

/** True only when the user's app_metadata explicitly grants the seller product. */
export function hasExitIqAccess(user: ProductScopedUser | null | undefined): boolean {
  const products = user?.app_metadata?.["products"]
  return Array.isArray(products) && products.includes(EXITIQ_PRODUCT)
}
