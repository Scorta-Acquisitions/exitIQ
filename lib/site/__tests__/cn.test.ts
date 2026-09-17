import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { cn, EXTRA_RADII, TYPE_STYLES } from "@/lib/site/cn"

describe("cn", () => {
  it("lets the last type style win instead of keeping both", () => {
    expect(cn("type-body-strong", "type-tagline")).toBe("type-tagline")
    expect(cn("type-caption text-fg-3", "type-caption-strong")).toBe("text-fg-3 type-caption-strong")
  })

  it("lets the last radius win, including the two names Tailwind does not ship", () => {
    // The pearl button's `rounded-md` against the capsule the hero's third pill asks for.
    expect(cn("bg-surface-pearl rounded-md border-[3px]", "rounded-pill")).toBe(
      "bg-surface-pearl border-[3px] rounded-pill"
    )
    expect(cn("rounded-pill", "rounded-xs")).toBe("rounded-xs")
    expect(cn("rounded-xs", "rounded-lg")).toBe("rounded-lg")
    // A radius on another side is still its own class group.
    expect(cn("rounded-pill", "rounded-t-sm")).toBe("rounded-pill rounded-t-sm")
  })

  it("lists every radius styles/site.css declares beyond Tailwind's own names", () => {
    const css = readFileSync("styles/site.css", "utf8")
    const declared = Array.from(css.matchAll(/--radius-([a-z0-9]+):/g)).map((m) => m[1]!)
    expect(declared.sort()).toEqual(["lg", "md", "pill", "sm", "xs"])
    // sm · md · lg are Tailwind's own; pill and xs are not, so they are the two the merge must be told about.
    expect([...EXTRA_RADII].sort()).toEqual(declared.filter((r) => !["sm", "md", "lg"].includes(r)).sort())
  })

  it("lists every type utility declared in styles/site.css, and nothing else", () => {
    const css = readFileSync("styles/site.css", "utf8")
    const declared = Array.from(css.matchAll(/@utility (type-[a-z-]+) \{/g)).map((m) => m[1])
    expect([...TYPE_STYLES].sort()).toEqual(declared.sort())
  })
})
