import { describe, expect, it } from "vitest"

import { EXITIQ_PRODUCT, hasExitIqAccess } from "@/lib/productAccess"

describe("hasExitIqAccess", () => {
  it("grants a user whose products include the exitiq marker", () => {
    expect(hasExitIqAccess({ app_metadata: { products: [EXITIQ_PRODUCT] } })).toBe(true)
  })

  it("grants when exitiq is one of several products", () => {
    expect(hasExitIqAccess({ app_metadata: { products: ["dealiq", EXITIQ_PRODUCT] } })).toBe(true)
  })

  it("rejects a signed-in user with no product grant (the buyer-session case)", () => {
    expect(hasExitIqAccess({ app_metadata: {} })).toBe(false)
    expect(hasExitIqAccess({ app_metadata: { products: ["dealiq"] } })).toBe(false)
  })

  it("rejects null, undefined, and missing metadata", () => {
    expect(hasExitIqAccess(null)).toBe(false)
    expect(hasExitIqAccess(undefined)).toBe(false)
    expect(hasExitIqAccess({})).toBe(false)
    expect(hasExitIqAccess({ app_metadata: null })).toBe(false)
  })

  it("rejects malformed products values instead of throwing", () => {
    expect(hasExitIqAccess({ app_metadata: { products: "exitiq" } })).toBe(false)
    expect(hasExitIqAccess({ app_metadata: { products: 1 } })).toBe(false)
    expect(hasExitIqAccess({ app_metadata: { products: { exitiq: true } } })).toBe(false)
  })
})
