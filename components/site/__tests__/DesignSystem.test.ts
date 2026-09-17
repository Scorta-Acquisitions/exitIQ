import { describe, expect, it } from "vitest"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

/**
 * Source-level guard for the design system. Every component and page under the Heirloom site must
 * build its look from tokens and the type ladder in styles/site.css. These scans fail the build when a
 * file reaches past them: a raw colour, a shadow other than the product shadow, a gradient, an
 * arbitrary radius or font size, weight 500, a monospace face, or one of the retired token names.
 */

const ROOTS = ["app", "components/site"]

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      if (entry === "__tests__" || entry === "api") continue
      walk(path, out)
    } else if (/\.tsx?$/.test(entry)) {
      out.push(path)
    }
  }
  return out
}

const files = ROOTS.flatMap((r) => walk(r))
const sources = new Map(files.map((f) => [f, readFileSync(f, "utf8")]))

/**
 * The exitIQ console and card, restored from the first build (e35fbbe) at the user's request on 2026-09-11.
 * They keep the first build's own tokens, IBM Plex Mono labels, chrome and canvas field, so the ladder and
 * token rules below do not apply to them; every one of them opens with the marker comment, and no other file
 * may. See the "legacy exitIQ console" block in styles/site.css.
 */
const LEGACY_MARKER =
  "// legacy exitIQ console: restored 2026-09-11 from the first build (e35fbbe) at the user's request"
const LEGACY_CONSOLE = new Set(
  [
    "components/site/hero/HeroConsole.tsx",
    "components/site/hero/HeroGraph.tsx",
    "components/site/exitiq/ExitIqRun.tsx",
    "components/site/exitiq/ExitIqQuestion.tsx",
    "components/site/exitiq/ConsoleChrome.tsx",
    "components/site/exitiq/useConsoleField.ts",
  ].map((p) => join(...p.split("/")))
)

/**
 * Lines of the scanned sources matching `pattern`, formatted for a readable failure message. The legacy
 * console is exempt. `scan` takes the sources so the rules can be run against a fixture as a positive
 * control (the test below), which is the only way to prove a guard can still fail.
 */
function scan(
  entries: Map<string, string>,
  pattern: RegExp,
  allow?: (line: string, file: string) => boolean
): string[] {
  const hits: string[] = []
  entries.forEach((src, file) => {
    if (LEGACY_CONSOLE.has(file)) return
    src.split("\n").forEach((line: string, i: number) => {
      if (pattern.test(line) && !(allow && allow(line, file))) hits.push(`${file}:${i + 1}  ${line.trim()}`)
    })
  })
  return hits
}

function offenders(pattern: RegExp, allow?: (line: string, file: string) => boolean): string[] {
  return scan(sources, pattern, allow)
}

/** A line whose first thing is a comment marker says nothing about the rendered look. */
const isComment = (line: string) => /^\s*(\/\/|\*|\/\*)/.test(line)

/* The rules, as named patterns, so the positive control runs exactly what the repo scan runs. */
const RAW_HEX = /#[0-9a-fA-F]{3,8}\b(?![\w-])/
const RGBA = /rgba?\(/
const SHADOW = /shadow-\[|shadow-(xs|sm|md|lg|xl|2xl|inner)\b|text-shadow|ring-\d+\b(?!\s+ring-inset)|drop-shadow/
const ARBITRARY_RADIUS = /rounded-\[|rounded-(xl|2xl|3xl|4xl)\b|rounded-(t|b|l|r|tl|tr|bl|br|s|e|ss|se|es|ee)-\[/

/** An `href="#section"` fragment is a link target, not a colour, so only the rest of the line is judged. */
const withoutHrefs = (line: string) => line.replace(/href=\{?\s*[`"'][^`"']*[`"']\s*\}?/g, "href=")
const HEX_ALLOW = (line: string) => isComment(line) || !RAW_HEX.test(withoutHrefs(line))

/**
 * The positive control: a file the guard has never seen, written to break every rule the scans cover.
 * Without it a broken pattern would read as a clean repo, which is how the ring clause and the `href=`
 * exemption hid two holes (a `ring-2` at the end of a class string, and any hex on a line with a link).
 */
const FIXTURE_FILE = join("app", "fixture.tsx")
const FIXTURE = new Map([
  [
    FIXTURE_FILE,
    [
      '<span className="text-[#0f7a45]">green</span>',
      '<div style={{ background: "rgba(14, 36, 27, 0.4)" }} />',
      '<div className="rounded-[18px] p-4" />',
      '<div className="border-line ring-2" />',
      '<a href="#fees-calc" className="text-[#ffffff]">Fees</a>',
      '<span className="ring-accent ring-1 ring-inset" />',
      "// #0f7a45 is the accent, noted in a comment",
    ].join("\n"),
  ],
])

describe("design-system source guard: the control", () => {
  it("catches a raw hex, including one beside a link, and lets a commented one through", () => {
    expect(scan(FIXTURE, RAW_HEX, HEX_ALLOW)).toEqual([
      'app/fixture.tsx:1  <span className="text-[#0f7a45]">green</span>',
      'app/fixture.tsx:5  <a href="#fees-calc" className="text-[#ffffff]">Fees</a>',
    ])
  })

  it("catches an rgba() colour", () => {
    expect(scan(FIXTURE, RGBA, isComment)).toEqual([
      'app/fixture.tsx:2  <div style={{ background: "rgba(14, 36, 27, 0.4)" }} />',
    ])
  })

  it("catches an arbitrary radius", () => {
    expect(scan(FIXTURE, ARBITRARY_RADIUS)).toEqual(['app/fixture.tsx:3  <div className="rounded-[18px] p-4" />'])
  })

  it("catches a ring at the end of a class string, and keeps the inset ring the chips use", () => {
    expect(scan(FIXTURE, SHADOW)).toEqual(['app/fixture.tsx:4  <div className="border-line ring-2" />'])
  })
})

describe("design-system source guard", () => {
  it("scans the deployed site", () => {
    expect(files.length).toBeGreaterThan(40)
    expect(files).toContain(join("app", "page.tsx"))
    expect(files).toContain(join("components/site", "ui", "Button.tsx"))
  })

  it("uses no raw colours: every colour is a token", () => {
    expect(offenders(RAW_HEX, HEX_ALLOW)).toEqual([])
    expect(offenders(RGBA, isComment)).toEqual([])
  })

  it("casts no shadow except the product shadow on imagery, and never a glow", () => {
    expect(offenders(SHADOW)).toEqual([])
  })

  it("paints no gradients", () => {
    expect(offenders(/gradient/, isComment)).toEqual([])
  })

  it("uses only the five radii", () => {
    expect(offenders(ARBITRARY_RADIUS)).toEqual([])
  })

  it("sets type only through the ladder: no arbitrary font sizes, tracking, weight 500, or monospace", () => {
    expect(offenders(/\btext-\[\d|\btext-\[clamp|\btracking-\[|\bfont-medium\b|\bfont-mono\b|\bfont-serif\b/)).toEqual(
      []
    )
    expect(offenders(/\bfont-(thin|extralight|normal|bold|extrabold|black)\b/)).toEqual([])
  })

  it("sets no uppercase through CSS", () => {
    expect(offenders(/\buppercase\b/)).toEqual([])
  })

  it("references none of the retired tokens or utilities", () => {
    // The retired `animate-row` feed loop is gone; the one-shot `animate-row-in` arrival is a sanctioned utility.
    const retired =
      /\b(text|bg|border|ring|from|to|via|fill|stroke)-(d[1-4]|dfull|dhair(-2)?|l[2-4]|ink-2|paper(-\w+)?|ground(-\w+)?|brand|seal-hi|seal-ring|node|filament(-ink)?|signal|cta|parchment|gold|hair(-2)?|card|slip-\w+|error-2)\b/
    expect(offenders(retired)).toEqual([])
    expect(
      offenders(
        /\b(aurora|panel-\w+|bg-scene-\w+|bg-slip(-2)?|bg-card-warm|bg-seal-dot|mask-\w+|hover-green(-dark)?|text-glow-\w+|animate-(blink|feed|fill)|animate-row(?!-in\b))\b/
      )
    ).toEqual([])
    // The retired `eyebrow` utility as a class (data keys named eyebrow are fine).
    expect(offenders(/className=[^>]*["'`\s]eyebrow["'`\s]/)).toEqual([])
    expect(offenders(/["'`\s](sm|md|lg|xl|2xl):[a-z[]/)).toEqual([])
  })

  it("exempts exactly the restored exitIQ console files, each opening with the legacy marker", () => {
    const marked = files.filter((f) => sources.get(f)!.startsWith(LEGACY_MARKER))
    expect(new Set(marked)).toEqual(LEGACY_CONSOLE)
    LEGACY_CONSOLE.forEach((file) => expect(files, file).toContain(file))
    // The exemption is for the console's own look only: nothing there reaches into the environment or the network.
    LEGACY_CONSOLE.forEach((file) => expect(sources.get(file)).not.toMatch(/process\.env|fetch\(|next\/font/))
  })

  it("justifies every client component in one line above the directive", () => {
    const missing: string[] = []
    sources.forEach((src, file) => {
      if (!/^"use client"/m.test(src)) return
      if (!/^\/\/ use client: .+\n"use client"/m.test(src)) missing.push(file)
    })
    expect(missing).toEqual([])
  })
})
