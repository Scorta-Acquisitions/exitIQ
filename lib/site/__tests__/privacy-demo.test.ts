import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import {
  ACCESS_LOG,
  HOME_FIELD_OPEN_AT,
  HOME_RECORD_FIELD_COUNT,
  MAX_PERMISSION_LEVEL,
  RECORD_FIELDS,
  STAND_IN_ORDER,
  STAND_INS,
} from "@/lib/site/confidentiality/data"
import {
  buyerRow,
  HOME_MAX_LEVEL,
  levelLine,
  levelLineFor,
  levelName,
  logLine,
  NARROW_PHONE,
  previewFor,
  PRIVACY_CLOSING_LINE,
  PRIVACY_SCRIPT,
  PRIVACY_SECTION_ID,
  PRIVACY_SUBJECT,
  PRIVACY_WORDS,
  privacyFieldCount,
  privacyLogLimit,
  privacyTitleLines,
  RECORD_VALUE_LINES,
  recordAt,
  shortLevelLine,
  viewerAt,
  viewerOrg,
  visibleCount,
} from "@/lib/site/confidentiality/demo"
import { overLongDemoWords } from "@/lib/site/demo/chrome"
import { ROUTES } from "@/lib/site/routes"
import { TAB_BREAKPOINT } from "@/lib/site/scroll"

const BEAT_IDS = ["rules", "overview", "nda", "qualified", "selected", "expired"]

describe("the privacy demo's script", () => {
  it("plays six beats 1.8 seconds apart and stills on the last one", () => {
    expect(PRIVACY_SCRIPT.prefix).toBe("priv")
    expect(PRIVACY_SCRIPT.beats.map((b) => b.id)).toEqual(BEAT_IDS)
    expect(PRIVACY_SCRIPT.beats.map((b) => b.at)).toEqual([0, 1800, 3600, 5400, 7200, 9000])
    expect(PRIVACY_SCRIPT.still).toBe("expired")
  })

  it("names the demo and speaks each beat in the live region", () => {
    expect(PRIVACY_SCRIPT.label).toBe("Who sees what, a worked example that plays itself")
    expect(PRIVACY_SCRIPT.beats.map((b) => b.say)).toEqual([
      "Before outreach: nothing public, and an excluded competitor is never contacted",
      "Level 1: an anonymous overview, two of seven fields",
      "Level 2: the company name, after an NDA",
      "Level 3: contracts and a role-level list, after qualification",
      "Level 4: the finalist the owner selected sees the names",
      "Every view is recorded, and access expires",
    ])
  })

  it("sets the section's words inside the caps, with the one link to the six levels", () => {
    expect(PRIVACY_WORDS.heading).toBe("Who sees what")
    expect(PRIVACY_WORDS.sentence).toBe(
      "Buyers start with an anonymous overview. They learn your name after signing an NDA and see detailed records only after we qualify them."
    )
    expect(overLongDemoWords(PRIVACY_WORDS)).toEqual([])
    expect(PRIVACY_WORDS.link).toEqual({ href: ROUTES.confidentiality, label: "The six levels" })
    expect(PRIVACY_SECTION_ID).toBe("who-sees-what")
    expect(PRIVACY_SUBJECT).toBe("Company record")
  })
})

describe("the record's levels", () => {
  it("counts the open rows of the seven-field record at every level", () => {
    expect([0, 1, 2, 3, 4, 5].map(visibleCount)).toEqual([0, 2, 4, 5, 6, 7])
    expect(visibleCount(6)).toBe(0)
    expect(visibleCount(-1)).toBe(0)
    expect(HOME_FIELD_OPEN_AT).toHaveLength(HOME_RECORD_FIELD_COUNT)
  })

  it("names the public level and the five disclosure stages", () => {
    expect([0, 1, 2, 3, 4, 5].map(levelName)).toEqual([
      "Nothing public",
      "Anonymous overview",
      "NDA signed",
      "Buyer qualified",
      "Final diligence",
      "Closing parties only",
    ])
  })

  it("writes the line under the record from the level and the count", () => {
    expect([0, 1, 2, 3, 4].map(levelLine)).toEqual([
      "Level 0 · Nothing public · Visible 0 of 7",
      "Level 1 · Anonymous overview · Visible 2 of 7",
      "Level 2 · NDA signed · Visible 4 of 7",
      "Level 3 · Buyer qualified · Visible 5 of 7",
      "Level 4 · Final diligence · Visible 6 of 7",
    ])
  })

  it("ends the buyer list one level below the closing parties", () => {
    expect(HOME_MAX_LEVEL).toBe(4)
    expect(MAX_PERMISSION_LEVEL).toBe(5)
    expect(PRIVACY_CLOSING_LINE).toBe("L5 · Closing parties only · closing documents move outside the buyer log")
  })

  it("shows seven rows from the tablet breakpoint, four on a phone and the name alone at 320", () => {
    expect(privacyFieldCount(TAB_BREAKPOINT)).toBe(7)
    expect(privacyFieldCount(TAB_BREAKPOINT - 1)).toBe(4)
    expect(privacyFieldCount(390)).toBe(4)
    expect(privacyFieldCount(NARROW_PHONE)).toBe(4)
    expect(privacyFieldCount(NARROW_PHONE - 1)).toBe(1)
    expect(privacyFieldCount(320)).toBe(1)
    expect(privacyLogLimit(TAB_BREAKPOINT)).toBe(3)
    expect(privacyLogLimit(TAB_BREAKPOINT - 1)).toBe(1)
  })

  it("holds every value to two lines and the title to one, so a changing level never moves the card", () => {
    expect(RECORD_VALUE_LINES).toBe(2)
    expect(privacyTitleLines(TAB_BREAKPOINT)).toBe(1)
    expect(privacyTitleLines(390)).toBe(1)
    expect(privacyTitleLines(NARROW_PHONE)).toBe(1)
    expect(privacyTitleLines(NARROW_PHONE - 1)).toBe(2)
    expect(privacyTitleLines(320)).toBe(2)
  })

  it("writes the phone's one-line reading of the level line", () => {
    expect([0, 1, 2, 3, 4].map(shortLevelLine)).toEqual([
      "L0 · Nothing public · 0 of 7",
      "L1 · Anonymous overview · 2 of 7",
      "L2 · NDA signed · 4 of 7",
      "L3 · Buyer qualified · 5 of 7",
      "L4 · Final diligence · 6 of 7",
    ])
    expect(levelLineFor(4, TAB_BREAKPOINT)).toBe("Level 4 · Final diligence · Visible 6 of 7")
    expect(levelLineFor(4, TAB_BREAKPOINT - 1)).toBe("L4 · Final diligence · 6 of 7")
    for (const level of [0, 1, 2, 3, 4]) expect(shortLevelLine(level).length).toBeLessThan(levelLine(level).length)
  })
})

describe("the access log", () => {
  it("reads a buyer's view as the person, the organisation, the act and the time", () => {
    expect(logLine(0)).toBe("M. Alden · Cadence Facility Partners · Viewed 2025 payroll register · Thursday, 2:06 PM")
    expect(logLine(2)).toBe("J. Ferro · Bellhaven Search · Viewed customer section for 11 minutes · Wednesday, 9:14 PM")
    expect(logLine(4)).toBe("K. Ortiz · Meridian Trades Group · Signed NDA · Wednesday, 9:03 AM")
  })

  it("keeps the person and the act alone for a phone's one line", () => {
    expect(logLine(0, true)).toBe("M. Alden · Viewed 2025 payroll register")
    expect(logLine(4, true)).toBe("K. Ortiz · Signed NDA")
    expect(logLine(5, true)).toBe("Heirloom · Revoked Northgate HVAC access")
    expect(logLine(3, true)).toBe("Heirloom · R. Sandoval access expired after 30 days")
    expect(logLine(99, true)).toBe("")
  })

  it("reads Heirloom's own actions as the act and its reason, with no organisation and no time", () => {
    expect(logLine(5)).toBe("Heirloom · Revoked Northgate HVAC access · Matched an owner exclusion")
    expect(logLine(3)).toBe("Heirloom · R. Sandoval access expired after 30 days")
    expect(logLine(99)).toBe("")
  })

  it("gives each of the four buyers the log entry that names it", () => {
    expect(STAND_IN_ORDER).toEqual(["competitor", "strategic", "individual", "pe"])
    for (const key of STAND_IN_ORDER) {
      const si = STAND_INS[key]
      const entry = ACCESS_LOG[si.logIndex]!
      expect(`${entry.org} ${entry.act}`).toContain(si.org)
    }
  })
})

describe("recordAt", () => {
  it("opens nothing before outreach and shows the excluded competitor as never contacted", () => {
    const view = recordAt("rules")
    expect(view.level).toBe(0)
    expect(view.viewer).toBe("none")
    expect(view.title).toBe("Company record")
    expect(view.levelLine).toBe("Level 0 · Nothing public · Visible 0 of 7")
    expect(view.visible).toBe(0)
    expect(RECORD_FIELDS[0]!.v[view.level]).toBe("No sale record")
    expect(view.rows.map((r) => r.caption)).toEqual([
      "Matched an owner exclusion · never contacted",
      "Not yet contacted",
      "Not yet contacted",
      "Not yet contacted",
    ])
    expect(view.rows.map((r) => r.state)).toEqual(["stopped", "waiting", "waiting", "waiting"])
    expect(view.log).toEqual([5])
    expect(view.banded).toBeNull()
  })

  it("gives the overview to any buyer the rules allow, and names no organisation", () => {
    const view = recordAt("overview")
    expect(view.level).toBe(1)
    expect(view.viewer).toBe("matching")
    expect(view.title).toBe("Viewing as a buyer who matches your rules")
    expect(view.visible).toBe(2)
    expect(RECORD_FIELDS[1]!.v[view.level]).toBe("Southeastern United States")
    expect(RECORD_FIELDS[2]!.v[view.level]).toBe("$3M to $5M")
    expect(view.rows.slice(1).map((r) => r.caption)).toEqual([
      "Anonymous overview · L1",
      "Anonymous overview · L1",
      "Anonymous overview · L1",
    ])
    expect(view.rows[0]!.caption).toBe("Matched an owner exclusion · never contacted")
    expect(view.log).toEqual([5])
  })

  it("releases the name at the NDA, and the strategic buyer goes no further", () => {
    const view = recordAt("nda")
    expect(view.level).toBe(2)
    expect(view.viewer).toBe("strategic")
    expect(view.title).toBe("Viewing as Meridian Trades Group")
    expect(view.levelLine).toBe("Level 2 · NDA signed · Visible 4 of 7")
    expect(RECORD_FIELDS[0]!.v[view.level]).toBe("Ridgeline Mechanical Services, Inc.")
    expect(RECORD_FIELDS[1]!.v[view.level]).toBe("Upstate South Carolina")
    expect(view.rows.map((r) => r.level)).toEqual([0, 2, 2, 2])
    expect(view.log).toEqual([4, 5])
    expect(recordAt("selected").rows[1]!.caption).toBe("NDA signed · L2")
  })

  it("opens the contracts and the role-level list to the qualified buyer", () => {
    const view = recordAt("qualified")
    expect(view.level).toBe(3)
    expect(view.viewer).toBe("individual")
    expect(view.title).toBe("Viewing as Bellhaven Search")
    expect(view.visible).toBe(5)
    expect(RECORD_FIELDS[4]!.v[view.level]).toBe("Regional grocery group, contracted through 2029")
    expect(RECORD_FIELDS[5]!.v[view.level]).toBe("Role-level employee list, no names")
    expect(view.rows[2]!.caption).toBe("Buyer qualified · L3")
    expect(view.log).toEqual([2, 4, 5])
  })

  it("names the customer and the payroll only for the finalist the owner selected", () => {
    const view = recordAt("selected")
    expect(view.level).toBe(4)
    expect(view.viewer).toBe("pe")
    expect(view.title).toBe("Viewing as Cadence Facility Partners")
    expect(view.levelLine).toBe("Level 4 · Final diligence · Visible 6 of 7")
    expect(RECORD_FIELDS[1]!.v[view.level]).toBe("Greenville, South Carolina, two facilities")
    expect(RECORD_FIELDS[4]!.v[view.level]).toBe("Carolina Foods Group, 14%, contract attached")
    expect(RECORD_FIELDS[5]!.v[view.level]).toBe("Full payroll register with names restricted until required")
    expect(view.rows.map((r) => r.caption)).toEqual([
      "Matched an owner exclusion · never contacted",
      "NDA signed · L2",
      "Buyer qualified · L3",
      "Final diligence · L4",
    ])
    expect(view.log).toEqual([0, 2, 4, 5])
  })

  it("holds the level on the last beat and adds the expiry to the log", () => {
    const before = recordAt("selected")
    const view = recordAt("expired")
    expect(view.level).toBe(before.level)
    expect(view.title).toBe(before.title)
    expect(view.rows).toEqual(before.rows)
    expect(view.log).toEqual([3, 0, 2, 4, 5])
    expect(logLine(view.log[0]!)).toBe("Heirloom · R. Sandoval access expired after 30 days")
  })

  it("falls back to the first beat for a beat the script does not have", () => {
    const view = recordAt("nonsense")
    expect(view.beat).toBe("rules")
    expect(view.level).toBe(0)
  })
})

describe("previewFor", () => {
  it("shows the competitor nothing, with its own revocation at the top of the log", () => {
    const view = previewFor("competitor", recordAt("expired"))
    expect(view.level).toBe(0)
    expect(view.viewer).toBe("competitor")
    expect(view.title).toBe("Viewing as Northgate HVAC")
    expect(view.visible).toBe(0)
    expect(view.levelLine).toBe("Level 0 · Nothing public · Visible 0 of 7")
    expect(view.log[0]).toBe(5)
    expect(view.banded).toBe(5)
    expect(RECORD_FIELDS[0]!.v[view.level]).toBe("No sale record")
  })

  it("defaults to the still, and keeps the beat's rows and the rest of its log", () => {
    expect(previewFor("competitor")).toEqual(previewFor("competitor", recordAt("expired")))
    const view = previewFor("individual", recordAt("nda"))
    expect(view.level).toBe(3)
    expect(view.title).toBe("Viewing as Bellhaven Search")
    expect(view.rows).toEqual(recordAt("nda").rows)
    expect(view.log).toEqual([2, 4, 5])
    expect(view.banded).toBe(2)
  })

  it("stops every buyer at the level it reached, and never at the closing parties", () => {
    const levels = STAND_IN_ORDER.map((key) => previewFor(key).level)
    expect(levels).toEqual([0, 2, 3, 4])
    for (const level of levels) expect(level).toBeLessThanOrEqual(HOME_MAX_LEVEL)
    expect(previewFor("pe").title).toBe("Viewing as Cadence Facility Partners")
  })
})

describe("the viewer and the buyer rows", () => {
  it("reads the viewer off the levels the four organisations reached", () => {
    expect([0, 1, 2, 3, 4].map(viewerAt)).toEqual(["none", "matching", "strategic", "individual", "pe"])
    expect(viewerOrg("none")).toBe("")
    expect(viewerOrg("matching")).toBe("a buyer who matches your rules")
    expect(viewerOrg("pe")).toBe("Cadence Facility Partners")
  })

  it("never lets a buyer's row run past the level that buyer reached", () => {
    expect(buyerRow("strategic", 4)).toEqual({
      key: "strategic",
      org: "Meridian Trades Group",
      level: 2,
      caption: "NDA signed · L2",
      state: "open",
      logIndex: 4,
    })
    expect(buyerRow("competitor", 4).state).toBe("stopped")
    expect(buyerRow("pe", 1).caption).toBe("Anonymous overview · L1")
  })
})

describe("the section's figures live in the data", () => {
  const PATHS = [
    "components/site/scenes/PrivacyScene.tsx",
    "components/site/scenes/privacy/BuyerList.tsx",
    "components/site/scenes/privacy/AccessLogLines.tsx",
  ]

  it("types no organisation, record value, log line or level word into a component", () => {
    const files = PATHS.map((path) => readFileSync(join(process.cwd(), path), "utf8"))
    const strings = [
      ...STAND_IN_ORDER.map((key) => STAND_INS[key].org),
      // Single-word values ("Hidden") are ordinary English; the record's own sentences are what must not be typed.
      ...RECORD_FIELDS.flatMap((f) => f.v).filter((v) => v.includes(" ")),
      ...ACCESS_LOG.map((e) => e.act),
      "Visible",
      "Level 0",
      "Not yet contacted",
      "never contacted",
    ]
    for (const file of files) for (const value of strings) expect(file).not.toContain(value)
  })
})
