import { describe, expect, it } from "vitest"

import {
  bandAccentVar,
  daysBetween,
  formatCompactCurrency,
  formatCount,
  formatCurrency,
  formatDate,
  formatDayCount,
  formatDscr,
  formatFileSize,
  formatLatency,
  formatMultiple,
  formatMultipleBand,
  formatPercent,
  formatScore,
  formatSignedCurrency,
  formatSignedPercent,
  formatYears,
  verdictAccentVar,
} from "@/lib/dealiq/format"

describe("formatCurrency", () => {
  it("renders whole dollars with separators and no cents", () => {
    expect(formatCurrency(1_900_000)).toBe("$1,900,000")
    expect(formatCurrency(0)).toBe("$0")
  })

  it("renders an em dash rather than NaN or Infinity", () => {
    expect(formatCurrency(Number.NaN)).toBe("—")
    expect(formatCurrency(Number.POSITIVE_INFINITY)).toBe("—")
  })
})

describe("formatCompactCurrency", () => {
  it("uses one decimal in the millions and none in the thousands", () => {
    expect(formatCompactCurrency(1_900_000)).toBe("$1.9M")
    expect(formatCompactCurrency(725_000)).toBe("$725K")
    expect(formatCompactCurrency(840)).toBe("$840")
  })

  it("drops the decimal above 100 million so the chip cannot grow", () => {
    expect(formatCompactCurrency(150_000_000)).toBe("$150M")
  })

  it("carries the sign outside the currency symbol", () => {
    expect(formatCompactCurrency(-1_250_000)).toBe("-$1.3M")
  })
})

describe("formatSignedCurrency", () => {
  it("uses a true minus sign, not a hyphen", () => {
    expect(formatSignedCurrency(-310_000)).toBe("−$310,000")
    expect(formatSignedCurrency(310_000)).toBe("+$310,000")
  })

  it("renders zero unsigned", () => {
    expect(formatSignedCurrency(0)).toBe("$0")
  })
})

describe("multiples", () => {
  it("formats a multiple to one decimal and DSCR to two", () => {
    expect(formatMultiple(2.4)).toBe("2.4×")
    expect(formatDscr(1.239)).toBe("1.24×")
  })

  it("formats a comp band", () => {
    expect(formatMultipleBand(2, 3)).toBe("2.0×–3.0×")
  })

  it("guards non-finite input on every multiple formatter", () => {
    expect(formatMultiple(Number.POSITIVE_INFINITY)).toBe("—")
    expect(formatDscr(Number.NaN)).toBe("—")
    expect(formatMultipleBand(Number.NaN, 3)).toBe("—")
  })
})

describe("percentages", () => {
  it("treats input as a 0-1 decimal share", () => {
    expect(formatPercent(0.34)).toBe("34%")
    expect(formatPercent(0.125, 1)).toBe("12.5%")
  })

  it("signs a trend without signing zero", () => {
    expect(formatSignedPercent(0.06)).toBe("+6%")
    expect(formatSignedPercent(-0.03)).toBe("−3%")
    expect(formatSignedPercent(0)).toBe("0%")
  })
})

describe("scores, counts and durations", () => {
  it("rounds a score to an integer", () => {
    expect(formatScore(57.6)).toBe("58")
  })

  it("renders a null payback as an em dash rather than a number", () => {
    expect(formatYears(4.24)).toBe("4.2 yrs")
    expect(formatYears(null)).toBe("—")
  })

  it("separates thousands in a count", () => {
    expect(formatCount(1247)).toBe("1,247")
  })

  it("switches latency units at one second", () => {
    expect(formatLatency(1800)).toBe("1.8s")
    expect(formatLatency(840)).toBe("840ms")
    expect(formatLatency(-1)).toBe("—")
  })
})

describe("dates", () => {
  it("formats an ISO date in UTC so the day never shifts by timezone", () => {
    expect(formatDate("2026-07-14")).toBe("Jul 14, 2026")
  })

  it("returns an em dash for an unparseable date", () => {
    expect(formatDate("not-a-date")).toBe("—")
  })

  it("counts whole days between two ISO dates", () => {
    expect(daysBetween("2026-08-01", "2026-08-19")).toBe(18)
    expect(daysBetween("2026-08-19", "2026-08-01")).toBe(-18)
    expect(daysBetween("2026-08-01", "bad")).toBe(0)
  })

  it("pluralises a day count and names today", () => {
    expect(formatDayCount(0)).toBe("today")
    expect(formatDayCount(1)).toBe("1 day")
    expect(formatDayCount(18)).toBe("18 days")
  })
})

describe("formatFileSize", () => {
  it("scales through B, KB, and MB", () => {
    expect(formatFileSize(312)).toBe("312 B")
    expect(formatFileSize(86_016)).toBe("84 KB")
    expect(formatFileSize(1_258_291)).toBe("1.2 MB")
  })

  it("renders an em dash for negative or non-finite sizes", () => {
    expect(formatFileSize(-1)).toBe("—")
    expect(formatFileSize(Number.NaN)).toBe("—")
    expect(formatFileSize(Number.POSITIVE_INFINITY)).toBe("—")
  })
})

describe("token mapping", () => {
  it("maps every verdict to a distinct CSS variable and never to mint", () => {
    const vars = [verdictAccentVar("PURSUE"), verdictAccentVar("DIG"), verdictAccentVar("PASS")]
    expect(new Set(vars).size).toBe(3)
    expect(vars.some((v) => v.includes("mint"))).toBe(false)
  })

  it("maps every band to a distinct CSS variable", () => {
    const vars = [bandAccentVar("strong"), bandAccentVar("mixed"), bandAccentVar("weak")]
    expect(new Set(vars).size).toBe(3)
  })
})
