/**
 * Product-level access control.
 *
 * exitIQ and DealIQ share one Supabase project, so any signed-in session passes
 * a bare `getUser()` check — a seller session would walk straight into the buyer
 * workspace. Access to DealIQ therefore requires an explicit product grant in
 * the user's `app_metadata` (server-controlled; a user cannot edit it), set when
 * the buyer account is provisioned:
 *
 *   raw_app_meta_data.products = ["dealiq"]
 *
 * Typed structurally rather than against `@supabase/supabase-js`'s `User` so
 * this module keeps the lib-boundary rule: `lib/dealiq/` imports nothing from
 * outside `lib/dealiq/`.
 */

export const DEALIQ_PRODUCT = "dealiq"

export interface ProductScopedUser {
  app_metadata?: Record<string, unknown> | null
}

/** True only when the user's app_metadata explicitly grants DealIQ. */
export function hasDealIqAccess(user: ProductScopedUser | null | undefined): boolean {
  const products = user?.app_metadata?.["products"]
  return Array.isArray(products) && products.includes(DEALIQ_PRODUCT)
}
