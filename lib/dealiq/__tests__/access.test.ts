import { describe, expect, it } from "vitest"

import { DEALIQ_PRODUCT, hasDealIqAccess } from "@/lib/dealiq/access"

describe("hasDealIqAccess", () => {
  it("grants a user whose products include the dealiq marker", () => {
    expect(hasDealIqAccess({ app_metadata: { products: [DEALIQ_PRODUCT] } })).toBe(true)
  })

  it("grants when dealiq is one of several products", () => {
    expect(hasDealIqAccess({ app_metadata: { products: ["exitiq", DEALIQ_PRODUCT] } })).toBe(true)
  })

  it("rejects a signed-in user with no product grant (the seller-session case)", () => {
    expect(hasDealIqAccess({ app_metadata: {} })).toBe(false)
  })

  it("rejects other products alone", () => {
    expect(hasDealIqAccess({ app_metadata: { products: ["exitiq"] } })).toBe(false)
  })

  it("rejects null, undefined, and missing metadata", () => {
    expect(hasDealIqAccess(null)).toBe(false)
    expect(hasDealIqAccess(undefined)).toBe(false)
    expect(hasDealIqAccess({})).toBe(false)
    expect(hasDealIqAccess({ app_metadata: null })).toBe(false)
  })

  it("rejects malformed products values instead of throwing", () => {
    expect(hasDealIqAccess({ app_metadata: { products: "dealiq" } })).toBe(false)
    expect(hasDealIqAccess({ app_metadata: { products: 1 } })).toBe(false)
    expect(hasDealIqAccess({ app_metadata: { products: { dealiq: true } } })).toBe(false)
  })
})
