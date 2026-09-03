import { describe, expect, it } from "vitest"
import {
  BUYER_QUESTIONS,
  BUYER_TYPES,
  type BuyerRegistration,
  buyerRegistrationBody,
  DEFAULT_PASSPORT_TIER,
  EMPTY_BUYER_REGISTRATION,
  isMutedPassportValue,
  PASSPORT_BENEFITS,
  PASSPORT_HOW,
  PASSPORT_ROWS,
  PASSPORT_TIER_DESCRIPTIONS,
  PASSPORT_TIERS,
  passportProgress,
  passportShareText,
  type PassportTierIndex,
} from "@/lib/site/buyers/passport"

const TIERS: PassportTierIndex[] = [0, 1, 2, 3]
const MUTED = ["Not available", "Not shown", "Not checked", "Not applicable"]

describe("passport tiers", () => {
  it("names the four tiers in ascending order and defaults to Heirloom Verified", () => {
    expect([...PASSPORT_TIERS]).toEqual(["Network Member", "Identity Verified", "Heirloom Verified", "Deal Qualified"])
    expect(DEFAULT_PASSPORT_TIER).toBe(2)
    expect(PASSPORT_TIERS[DEFAULT_PASSPORT_TIER]).toBe("Heirloom Verified")
  })

  it("describes what was checked and what access each tier grants", () => {
    expect(PASSPORT_TIER_DESCRIPTIONS).toHaveLength(4)
    for (const d of PASSPORT_TIER_DESCRIPTIONS) {
      expect(d.startsWith("Checked: ")).toBe(true)
      expect(d).toContain(" Access: ")
    }
    expect(PASSPORT_TIER_DESCRIPTIONS[0]).toContain("Nothing verified yet.")
  })
})

describe("PASSPORT_ROWS", () => {
  it("has ten rows with unique labels and a non-empty value for each of the four tiers", () => {
    expect(PASSPORT_ROWS).toHaveLength(10)
    const labels = PASSPORT_ROWS.map((r) => r.l)
    expect(new Set(labels).size).toBe(10)
    for (const row of PASSPORT_ROWS) {
      expect(row.v).toHaveLength(4)
      for (const tier of TIERS) {
        expect(typeof row.v[tier], `${row.l} @ ${tier}`).toBe("string")
        expect(row.v[tier].trim().length, `${row.l} @ ${tier}`).toBeGreaterThan(0)
      }
    }
  })

  it("only mutes values at the Network Member and Identity Verified tiers (never a verified value)", () => {
    for (const row of PASSPORT_ROWS) {
      expect(isMutedPassportValue(row.v[2]), `${row.l} @ Heirloom Verified`).toBe(false)
      expect(isMutedPassportValue(row.v[3]), `${row.l} @ Deal Qualified`).toBe(false)
    }
    const mutedAtNetwork = PASSPORT_ROWS.filter((r) => isMutedPassportValue(r.v[0])).map((r) => r.l)
    expect(mutedAtNetwork).toEqual([
      "Identity and entity status",
      "Capacity range status",
      "Lender or SBA preparation",
      "Plans for employees, company name, and locations",
      "Verification date",
      "Expiration date",
    ])
    const mutedAtIdentity = PASSPORT_ROWS.filter((r) => isMutedPassportValue(r.v[1])).map((r) => r.l)
    expect(mutedAtIdentity).toEqual(["Lender or SBA preparation", "Plans for employees, company name, and locations"])
  })

  it("shows the capacity as a range at Heirloom Verified, never a balance", () => {
    const capacity = PASSPORT_ROWS.find((r) => r.l === "Capacity range status")!
    expect(capacity.v).toEqual([
      "Not shown",
      "Capacity not reviewed",
      "Verified capacity range: $3M to $6M",
      "Confirmed for this transaction size",
    ])
  })
})

describe("isMutedPassportValue", () => {
  it.each(MUTED)("mutes the declared token %j", (token) => {
    expect(isMutedPassportValue(token)).toBe(true)
  })

  it("does not mute shown values, empty strings, or differently cased tokens", () => {
    expect(isMutedPassportValue("Shown")).toBe(false)
    expect(isMutedPassportValue("")).toBe(false)
    expect(isMutedPassportValue("not available")).toBe(false)
    expect(isMutedPassportValue("Not available ")).toBe(false)
    expect(isMutedPassportValue("Capacity not reviewed")).toBe(false)
  })

  it("mutes exactly four distinct tokens across the passport rows", () => {
    const mutedTokens = new Set(PASSPORT_ROWS.flatMap((r) => r.v).filter(isMutedPassportValue))
    expect(Array.from(mutedTokens).sort()).toEqual([...MUTED].sort())
  })
})

describe("passportProgress", () => {
  it("maps the tier index to a CSS width in thirds", () => {
    expect(passportProgress(0)).toBe("0%")
    expect(passportProgress(1)).toBe("33.33333333333333%")
    expect(passportProgress(2)).toBe("66.66666666666666%")
    expect(passportProgress(3)).toBe("100%")
  })

  it("grows strictly with the tier", () => {
    const widths = TIERS.map((t) => parseFloat(passportProgress(t)))
    for (let i = 1; i < widths.length; i++) expect(widths[i]!).toBeGreaterThan(widths[i - 1]!)
  })
})

describe("passportShareText", () => {
  it.each([
    [0, "Buyer Passport · Network Member · verification details available on request via buyers@heirloom.com"],
    [1, "Buyer Passport · Identity Verified · verification details available on request via buyers@heirloom.com"],
    [2, "Buyer Passport · Heirloom Verified · verification details available on request via buyers@heirloom.com"],
    [3, "Buyer Passport · Deal Qualified · verification details available on request via buyers@heirloom.com"],
  ] as Array<[PassportTierIndex, string]>)("writes the share line for tier %i", (tier, expected) => {
    expect(passportShareText(tier)).toBe(expected)
  })

  it("never includes a balance, score, or the buyer's own contact details", () => {
    for (const tier of TIERS) {
      const text = passportShareText(tier)
      expect(text).not.toMatch(/\$/)
      expect(text).not.toMatch(/score/i)
    }
  })
})

describe("passport copy lists", () => {
  it("lists seven 'how it works' rules with unique labels and five benefits with unique titles", () => {
    expect(PASSPORT_HOW).toHaveLength(7)
    expect(new Set(PASSPORT_HOW.map((h) => h.label)).size).toBe(7)
    expect(PASSPORT_BENEFITS).toHaveLength(5)
    expect(new Set(PASSPORT_BENEFITS.map((b) => b.title)).size).toBe(5)
    for (const item of [...PASSPORT_HOW, ...PASSPORT_BENEFITS]) expect(item.body.endsWith(".")).toBe(true)
  })

  it("asks buyers four questions, each phrased as a question", () => {
    expect(BUYER_QUESTIONS).toHaveLength(4)
    for (const q of BUYER_QUESTIONS) expect(q.endsWith("?")).toBe(true)
    expect(new Set(BUYER_QUESTIONS).size).toBe(4)
  })

  it("offers five distinct buyer types and defaults the registration to the first one", () => {
    expect(BUYER_TYPES).toEqual([
      "Individual buyer or searcher",
      "Independent sponsor",
      "Family office",
      "Private equity firm",
      "Strategic acquirer",
    ])
    expect(EMPTY_BUYER_REGISTRATION.buyerType).toBe("Individual buyer or searcher")
    for (const [key, value] of Object.entries(EMPTY_BUYER_REGISTRATION)) {
      if (key !== "buyerType") expect(value, key).toBe("")
    }
  })
})

describe("buyerRegistrationBody", () => {
  const full: BuyerRegistration = {
    name: "Ada Buyer",
    firm: "Northwind Capital, Principal",
    buyerType: "Family office",
    targetSize: "$2M to $8M",
    geography: "Southeast",
    industries: "HVAC and plumbing",
    financing: "Cash plus SBA 7(a)",
    evidence: "Bank letter dated March 2026",
    priorAcquisitions: "Two, both in field services",
    plans: "Keep every employee and the name",
    email: "ada@northwind.example",
  }

  it("writes every field in the documented order when all are filled", () => {
    expect(buyerRegistrationBody(full)).toBe(
      "I would like to create a Buyer Passport.\n\n" +
        "Name: Ada Buyer\n" +
        "Firm: Northwind Capital, Principal\n" +
        "Email: ada@northwind.example\n" +
        "Acquisition focus: HVAC and plumbing\n" +
        "Target size: $2M to $8M\n" +
        "What kind of buyer are you?: Family office\n" +
        "Geography: Southeast\n" +
        "Financing plan: Cash plus SBA 7(a)\n" +
        "Current evidence of funds or lender support: Bank letter dated March 2026\n" +
        "Prior acquisitions: Two, both in field services\n" +
        "Plans for employees, the company name, and locations: Keep every employee and the name\n\n" +
        "Please send the verification steps."
    )
  })

  it("labels a missing firm as an independent buyer", () => {
    expect(buyerRegistrationBody({ ...full, firm: "" })).toContain("\nFirm: Independent buyer\n")
  })

  it("keeps the required lines even when they are blank, so the advisor sees what is missing", () => {
    const body = buyerRegistrationBody({ ...EMPTY_BUYER_REGISTRATION, buyerType: "" })
    expect(body).toBe(
      "I would like to create a Buyer Passport.\n\n" +
        "Name: \n" +
        "Firm: Independent buyer\n" +
        "Email: \n" +
        "Acquisition focus: \n" +
        "Target size: \n\n" +
        "Please send the verification steps."
    )
  })

  it("adds only the buyer-type extra when the form is submitted with its defaults", () => {
    const body = buyerRegistrationBody({ ...EMPTY_BUYER_REGISTRATION, name: "A", email: "a@b.co" })
    expect(body).toContain("Target size: \nWhat kind of buyer are you?: Individual buyer or searcher\n\nPlease send")
    for (const label of [
      "Geography:",
      "Financing plan:",
      "Current evidence of funds or lender support:",
      "Prior acquisitions:",
      "Plans for employees, the company name, and locations:",
    ]) {
      expect(body).not.toContain(label)
    }
  })

  it.each([
    ["geography", "Geography: Southeast"],
    ["financing", "Financing plan: Cash plus SBA 7(a)"],
    ["evidence", "Current evidence of funds or lender support: Bank letter dated March 2026"],
    ["priorAcquisitions", "Prior acquisitions: Two, both in field services"],
    ["plans", "Plans for employees, the company name, and locations: Keep every employee and the name"],
  ] as Array<[keyof BuyerRegistration, string]>)("drops the %s line when that field is empty", (key, line) => {
    expect(buyerRegistrationBody(full)).toContain(line)
    expect(buyerRegistrationBody({ ...full, [key]: "" })).not.toContain(line)
  })

  it("keeps the extras in their fixed order regardless of which are present", () => {
    const body = buyerRegistrationBody({ ...full, geography: "", evidence: "" })
    const idx = (s: string) => body.indexOf(s)
    expect(idx("What kind of buyer are you?:")).toBeGreaterThan(-1)
    expect(idx("Financing plan:")).toBeGreaterThan(idx("What kind of buyer are you?:"))
    expect(idx("Prior acquisitions:")).toBeGreaterThan(idx("Financing plan:"))
    expect(idx("Plans for employees")).toBeGreaterThan(idx("Prior acquisitions:"))
    expect(idx("Geography:")).toBe(-1)
    expect(idx("Current evidence")).toBe(-1)
  })
})
