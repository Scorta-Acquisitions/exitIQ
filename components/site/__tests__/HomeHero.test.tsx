import { act, fireEvent, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { HERO_FILM_LEAN_PX, HERO_FILM_POSTER, HERO_FILM_SRC } from "@/components/site/hero/HeroFilm"
import { HomeHero } from "@/components/site/hero/HomeHero"
import { STANDALONE_LINK } from "@/components/site/ui/TextLink"
import { CONTACT } from "@/lib/site/routes"
import { installSceneDrivers, restoreMatchMedia, type SceneDrivers, setRect } from "./scene-test-utils"
import { renderWithSite } from "./test-utils"

/** Class tokens on `el`, so assertions read the class that is the behaviour rather than a substring. */
const classes = (el: Element) => Array.from(el.classList)
const realGetContext = HTMLCanvasElement.prototype.getContext

/** Dispatch a pointer event on `el` (jsdom has no PointerEvent, so a MouseEvent carries the pointer type). */
function pointer(el: Element, type: "pointermove" | "pointerleave", x = 0, y = 0, pointerType = "mouse") {
  const event = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true })
  Object.defineProperty(event, "pointerType", { value: pointerType })
  act(() => {
    el.dispatchEvent(event)
  })
}

describe("<HomeHero />", () => {
  let drivers: SceneDrivers | undefined
  let now = 10_000

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    // jsdom has no WebGL: the console's instrument field mounts its canvas and stays inert.
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as unknown as typeof realGetContext
    now = 10_000
  })
  afterEach(() => {
    drivers?.restore()
    drivers = undefined
    vi.restoreAllMocks()
    vi.useRealTimers()
    HTMLCanvasElement.prototype.getContext = realGetContext
    restoreMatchMedia()
  })

  /** Install the observer and frame drivers plus a controllable clock for the pointer motion. */
  function motion() {
    drivers = installSceneDrivers()
    vi.spyOn(performance, "now").mockImplementation(() => now)
    return drivers
  }

  it("opens the page as one light tile at a 64px top plus the air (16px plus the air in the short composition, 80px below), running at least 80px past the first fold, with the film as its only backdrop", () => {
    const { container } = renderWithSite(<HomeHero />)
    const tile = container.firstElementChild!
    expect(tile.tagName).toBe("SECTION")
    expect(tile).toHaveAttribute("data-tone", "light")
    expect(classes(tile)).toEqual(expect.arrayContaining(["on-light", "bg-canvas", "tile", "px-6", "overflow-hidden"]))
    // The hero alone overrides the tile's 80px top: 64px plus the air (the first build's 80 once the air reaches its
    // 16px cap), or 16px plus the air on a short desktop viewport; the bottom keeps the tile's 80.
    expect(classes(tile).filter((c) => /\bpt-|\bpy-|\bpb-/.test(c))).toEqual([
      "short:nav:pt-[calc(16px+var(--hero-air))]",
      "pt-[calc(64px+var(--hero-air))]",
    ])
    // The air is the tile's variable: composition A's (nothing under 900px of viewport) and, on a short desktop
    // viewport, B's (nothing under 720). Every gap above the console reads it; the utilities live in styles/site.css.
    expect(classes(tile).filter((c) => /^(short:nav:)?hero-air/.test(c))).toEqual([
      "hero-air",
      "short:nav:hero-air-short",
    ])
    // The tile's minimum height is the first viewport under the 52px bar plus the 80px tile rhythm, so the film always
    // reaches 80px below the fold; content stays top-aligned (no centring class), so the fold arithmetic never moves.
    expect(classes(tile)).toContain("min-h-[calc(100svh-var(--bar-h)+var(--spacing-section))]")
    expect(classes(tile).filter((c) => /^(flex|grid|items-|justify-|content-|place-)/.test(c))).toEqual([])
    // The only image is the badge's logo (the restored console paints its field on a canvas); no veil, no gradient
    // in the DOM outside the console, which carries the first build's own look.
    expect(
      Array.from(container.querySelectorAll("img")).map((img) => decodeURIComponent(img.getAttribute("src") ?? ""))
    ).toEqual([expect.stringContaining("/brand/yc-logo.svg")])
    // That minimum height is the one viewport-relative or min-height class outside the console: no veil, no vh clamp
    // on the copy, nothing else sized from the viewport.
    const outsideConsole = Array.from(
      container.querySelectorAll("[class*='gradient'], [class*='min-h-[calc'], [class*='saturate'], [class*='vh']")
    ).filter((el) => !screen.getByTestId("hero-console").contains(el))
    expect(outsideConsole).toEqual([tile])
    expect(classes(tile).filter((c) => /gradient|min-h-\[calc|saturate|vh/.test(c))).toEqual([
      "min-h-[calc(100svh-var(--bar-h)+var(--spacing-section))]",
    ])
    // The absolutely positioned hidden layers are exactly the film's layer, the film, and the console's canvas field.
    expect(Array.from(container.querySelectorAll("[aria-hidden='true'].absolute"))).toEqual([
      screen.getByTestId("hero-film-layer"),
      screen.getByTestId("ambient-video"),
      screen.getByTestId("hero-console").querySelector("canvas"),
    ])
  })

  it("lays the glass film behind the tile at 60% in an oversized inert layer, with its poster, and lifts the copy above it", () => {
    const { container } = renderWithSite(<HomeHero />)
    const tile = container.firstElementChild!
    const layer = screen.getByTestId("hero-film-layer")
    expect(tile.firstElementChild).toBe(layer)
    expect(layer).toHaveAttribute("aria-hidden", "true")
    // 12px of overhang on every side covers the 8px lean, so the tile's edge never shows through.
    // 12px of overhang a side for the lean, 96px below so the tile's clip drops the film's last rows and frame edge.
    expect(classes(layer)).toEqual([
      "pointer-events-none",
      "absolute",
      "-inset-x-3",
      "-top-3",
      "-bottom-24",
      "will-change-transform",
    ])
    expect(HERO_FILM_LEAN_PX).toBeLessThan(12)
    const film = screen.getByTestId("ambient-video") as HTMLVideoElement
    expect(layer.children).toHaveLength(1)
    expect(layer.firstElementChild).toBe(film)
    expect(film).toHaveAttribute("aria-hidden", "true")
    expect(HERO_FILM_POSTER).toBe("/media/hero-ambient-poster.jpg")
    expect(HERO_FILM_SRC).toBe("/media/hero-ambient.mp4")
    expect(film).toHaveAttribute("poster", "/media/hero-ambient-poster.jpg")
    // The source attaches only once the film approaches the viewport.
    expect(film).not.toHaveAttribute("src")
    expect(film.muted).toBe(true)
    // The film covers the tile from its centre at every width: no breakpoint crop.
    expect(classes(film)).toEqual([
      "pointer-events-none",
      "absolute",
      "inset-0",
      "h-full",
      "w-full",
      "object-cover",
      "opacity-60",
    ])
    // Both content columns are positioned so they paint above the film, in DOM order: the copy in the 980 content
    // lock, then the badge row and console in the console's own lock.
    const [, copy, console] = Array.from(tile.children)
    expect(copy).toContainElement(screen.getByRole("heading", { level: 1 }))
    expect(classes(copy!)).toEqual(["mx-auto", "w-full", "max-w-[980px]", "relative", "text-center"])
    expect(console).toContainElement(screen.getByTestId("hero-console"))
    // The first build's 1132px lock (1180 less gutters) replaces the default 980 for the badge row and console; it
    // follows the CTA row at 28px plus the air, 18px plus the air in the short composition.
    expect(classes(console!)).toEqual([
      "mx-auto",
      "w-full",
      "short:nav:mt-[calc(18px+var(--hero-air))]",
      "max-nav:mt-[calc(20px+var(--hero-air))]",
      "relative",
      "mt-[calc(28px+var(--hero-air))]",
      "max-w-[1132px]",
    ])
    expect(Array.from(console!.children).map((el) => el.getAttribute("data-testid") ?? el.tagName)).toEqual([
      "hero-badge-row",
      "hero-console",
    ])
    expect(tile.children).toHaveLength(3)
  })

  it("attaches the hero's own film once the tile approaches the viewport", () => {
    const d = motion()
    renderWithSite(<HomeHero />)
    const film = screen.getByTestId("ambient-video") as HTMLVideoElement
    vi.spyOn(film, "play").mockResolvedValue()
    act(() => d.intersect(film, true))
    expect(film.getAttribute("src")).toBe("/media/hero-ambient.mp4")
  })

  it("leans the film up to 8px toward the pointer anywhere over the tile, writing the transform to its layer only", () => {
    const d = motion()
    const { container } = renderWithSite(<HomeHero />)
    const tile = container.firstElementChild as HTMLElement
    const layer = screen.getByTestId("hero-film-layer")
    const film = screen.getByTestId("ambient-video")
    setRect(tile, { top: 0, height: 800, width: 1200 })
    // The pointer over the copy column, at the tile's bottom-right corner: the film eases toward +8/+8.
    pointer(screen.getByRole("heading", { level: 1 }), "pointermove", 1200, 800)
    act(() => d.flushFrames())
    expect(layer.style.transform).toBe("translate3d(0.96px, 0.96px, 0)")
    now += 5000
    act(() => d.flushFrames())
    expect(layer.style.transform).toBe("translate3d(8.00px, 8.00px, 0)")
    expect(film.style.transform).toBe("")
    expect(tile.style.transform).toBe("")
    // Leaving the tile eases the film home and clears the transform once it arrives.
    pointer(tile, "pointerleave")
    act(() => d.flushFrames())
    expect(layer.style.transform).toBe("translate3d(7.04px, 7.04px, 0)")
    now += 5000
    act(() => d.flushFrames())
    expect(layer.style.transform).toBe("")
  })

  it("removes a failing film and leaves the tile as plain canvas with its columns in place", () => {
    const { container } = renderWithSite(<HomeHero />)
    const tile = container.firstElementChild!
    fireEvent.error(screen.getByTestId("ambient-video"))
    expect(container.querySelector("video")).toBeNull()
    const layer = screen.getByTestId("hero-film-layer")
    expect(layer.children).toHaveLength(0)
    expect(tile.firstElementChild).toBe(layer)
    expect(tile.children).toHaveLength(3)
    expect(tile.children[1]).toContainElement(screen.getByRole("heading", { level: 1 }))
    expect(tile.children[2]).toContainElement(screen.getByTestId("hero-console"))
  })

  it("leads with the one-colour headline, set monochrome in the hero size", () => {
    renderWithSite(<HomeHero />)
    const h1 = screen.getByRole("heading", { level: 1 })
    expect(h1).toHaveTextContent("Sell your business privately, with qualified buyers competing.")
    // The hero rung, stepping to display-lg (40/1.1, 88px for two lines) on a short desktop viewport; 24px plus the
    // air under the eyebrow (the first build's 16 plus the line of air added on 2026-09-16), flush with the top of
    // the column once the eyebrow leaves.
    expect(classes(h1)).toEqual([
      "type-hero",
      "text-fg",
      "short:nav:type-display-lg",
      "short:nav:mt-0",
      "max-nav:mt-[calc(16px+var(--hero-air))]",
      "mt-[calc(24px+var(--hero-air))]",
    ])
    // Plain text, not the site's <em> emphasis (the serif italic in the accent): Suyash asked for the second half
    // to read as one colour with no italic, so it is a plain <span> the global `em` rule never reaches.
    const secondHalf = within(h1).getByText("with qualified buyers competing.")
    expect(secondHalf.tagName).toBe("SPAN")
    expect(secondHalf.getAttribute("class")).toBeNull()
  })

  it("states the positioning line as an eyebrow and the promise as the airy lead paragraph", () => {
    renderWithSite(<HomeHero />)
    const eyebrow = screen.getByText("Technology-enabled sell-side M&A for established business owners")
    // One tone up from the usual eyebrow, for contrast over the film; the short composition drops it.
    expect(classes(eyebrow)).toEqual(["type-caption-strong", "text-fg-2", "short:nav:hidden"])
    expect(eyebrow.compareDocumentPosition(screen.getByRole("heading", { level: 1 }))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    const promise = screen.getByText(
      "We prepare the company, bring qualified buyers into a private process, and manage the transaction through closing. You choose the offer."
    )
    expect(promise.tagName).toBe("P")
    // 24/1.5 in an 800px column holds two lines, 28px plus the air under the headline; the short composition sets
    // the 21px tagline rung, two lines at 692, 14px plus the air under the headline.
    expect(classes(promise)).toEqual([
      "type-lead-airy",
      "text-fg-2",
      "short:nav:type-tagline",
      "short:nav:mt-[calc(14px+var(--hero-air))]",
      "max-nav:mt-[calc(20px+var(--hero-air))]",
      "mx-auto",
      "mt-[calc(28px+var(--hero-air))]",
      "max-w-[800px]",
    ])
  })

  it("centres the eyebrow and headline in the 692px reading column inside the centred 980 copy lock", () => {
    renderWithSite(<HomeHero />)
    const column = screen.getByRole("heading", { level: 1 }).parentElement!
    expect(classes(column)).toEqual(["mx-auto", "max-w-[692px]"])
    expect(Array.from(column.children)).toEqual([
      screen.getByText("Technology-enabled sell-side M&A for established business owners"),
      screen.getByRole("heading", { level: 1 }),
    ])
    expect(classes(column.parentElement!)).toEqual(expect.arrayContaining(["max-w-[980px]", "text-center", "mx-auto"]))
  })

  it("renders the Y Combinator badge as a neutral outlined 44px pill on canvas to CONTACT.ycombinator in a new tab with noopener", () => {
    renderWithSite(<HomeHero />)
    const badge = screen.getByRole("link", { name: "BACKED BY Y COMBINATOR" })
    expect(badge.tagName).toBe("A")
    expect(badge).toHaveAttribute("href", CONTACT.ycombinator)
    expect(badge).toHaveAttribute("href", "https://www.ycombinator.com/")
    expect(badge).toHaveAttribute("target", "_blank")
    expect(badge).toHaveAttribute("rel", "noopener")
    expect(classes(badge)).toEqual(
      expect.arrayContaining([
        "type-caption-strong",
        "text-fg-3",
        "border",
        "border-line",
        "rounded-pill",
        "inline-flex",
        "items-center",
        "gap-2",
        "px-4",
        "py-3",
        "hover:text-accent",
        "bg-canvas",
      ])
    )
    // A canvas fill (the muted caption and the hairline need a known surface over the film); never the accent,
    // never the old pearl panel.
    expect(classes(badge).filter((c) => /^bg-(?!canvas$)|^border-\[|^rounded-md$|^pressable$/.test(c))).toEqual([])
    const logo = within(badge).getByRole("presentation")
    expect(logo.tagName).toBe("IMG")
    expect(logo).toHaveAttribute("alt", "")
    expect(logo).toHaveAttribute("width", "16")
    expect(classes(logo)).toEqual(expect.arrayContaining(["rounded-xs"]))
  })

  it("sets the badge alone and centred in the row above the console at every width, never inside the CTA row", () => {
    renderWithSite(<HomeHero />)
    const badge = screen.getByRole("link", { name: "BACKED BY Y COMBINATOR" })
    const badgeRow = screen.getByTestId("hero-badge-row")
    expect(badge.parentElement).toBe(badgeRow)
    // One member at every width since the buyers link joined the CTA row (2026-09-16): a centred flex
    // row, no grid, no second column. The row's bottom margin is the gap to the console: 24px plus the air, 22px
    // plus the air in the short composition; no top margin, the lock carries the gap from the CTA row.
    expect(Array.from(badgeRow.children)).toEqual([badge])
    expect(classes(badgeRow)).toEqual([
      "short:nav:mb-[calc(22px+var(--hero-air))]",
      "mb-[calc(24px+var(--hero-air))]",
      "flex",
      "items-center",
      "justify-center",
    ])
    // First in the console's lock, directly above the console.
    expect(badgeRow.previousElementSibling).toBeNull()
    expect(badgeRow.nextElementSibling).toBe(screen.getByTestId("hero-console"))
    expect(badgeRow.parentElement).toBe(screen.getByTestId("hero-console").parentElement)
    expect(screen.getByTestId("hero-cta-row")).not.toContainElement(badge)
  })

  it("holds exactly the two pills and the buyers text link in the CTA row in order, 40px plus the air under the lead (22px plus the air in the short composition)", () => {
    renderWithSite(<HomeHero />)
    const row = screen.getByTestId("hero-cta-row")
    expect(Array.from(row.children)).toEqual([
      screen.getByTestId("open-advisor"),
      screen.getByRole("link", { name: "See how it works" }),
      screen.getByTestId("hero-buyers-plate"),
    ])
    expect(Array.from(row.children).map((el) => el.textContent)).toEqual([
      "Talk to an M&A advisor",
      "See how it works",
      "Buyers: Get Heirloom Verified",
    ])
    // The advisor entry is a button (the dialog opens in place); the other two are links.
    expect(screen.getByTestId("open-advisor").tagName).toBe("BUTTON")
    // Wrapping and centred, so a phone takes the buyers link onto its own centred line under the two pills.
    expect(classes(row)).toEqual([
      "short:nav:mt-[calc(22px+var(--hero-air))]",
      "max-nav:mt-[calc(32px+var(--hero-air))]",
      "mt-[calc(40px+var(--hero-air))]",
      "flex",
      "flex-wrap",
      "items-center",
      "justify-center",
      "gap-3",
    ])
    // The row closes the copy lock: the badge row has moved to the console's lock.
    expect(row.nextElementSibling).toBeNull()
  })

  it("reads the copy lock in one order: the eyebrow and headline column, the lead, then the action row", () => {
    renderWithSite(<HomeHero />)
    const column = screen.getByRole("heading", { level: 1 }).parentElement!
    expect(Array.from(column.parentElement!.children)).toEqual([
      column,
      screen.getByText(/We prepare the company/),
      screen.getByTestId("hero-cta-row"),
    ])
  })

  it("holds the phone rhythm on exactly four elements, and never on the tile, the badge row or the buyers link", () => {
    renderWithSite(<HomeHero />)
    const maxNav = (el: Element) => classes(el).filter((c) => c.startsWith("max-nav:"))
    const tile = screen.getByTestId("hero-console").parentElement!.parentElement!
    // The line of air Suyash asked for is the desktop rhythm. Under the nav breakpoint — where composition B never
    // applies, the headline wraps to three lines and each of the three actions takes its own — the four gaps go
    // back to the values they had, which is what puts the buyers entry back inside a 320×640 fold (measured on the
    // served build at 633.95 of 640 since it became a text link on 2026-09-17, against 636.94 as a pill).
    // Exactly four carriers: the tile's own top, the badge row's gap to the console and the action row keep one
    // value at every width. Each gap's value is pinned on its own element above.
    expect(Array.from(tile.querySelectorAll("[class*='max-nav:']"))).toEqual([
      screen.getByRole("heading", { level: 1 }),
      screen.getByText(/We prepare the company/),
      screen.getByTestId("hero-cta-row"),
      screen.getByTestId("hero-console").parentElement!,
    ])
    expect(maxNav(tile)).toEqual([])
    expect(maxNav(screen.getByTestId("hero-badge-row"))).toEqual([])
    expect(maxNav(screen.getByTestId("hero-buyers-plate"))).toEqual([])
  })

  it("keeps the short composition to seven elements, none of them the buyers link or the badge, and reads no nav breakpoint outside the console", () => {
    renderWithSite(<HomeHero />)
    const shortClasses = (el: Element) => classes(el).filter((c) => c.startsWith("short:"))
    const buyers = screen.getByTestId("hero-buyers-plate")
    // The buyers link and the badge follow neither the height nor the width: one link, one badge, at every viewport.
    expect(shortClasses(buyers)).toEqual([])
    expect(shortClasses(screen.getByRole("link", { name: "BACKED BY Y COMBINATOR" }))).toEqual([])
    // Nothing else in the tile carries a short rule: seven elements, no more.
    expect(document.querySelectorAll("[class*='short:']")).toHaveLength(7)
    // Nothing outside the console reads the `nav` breakpoint any more (only `max-nav:`, the phone rhythm above):
    // the hero's arrangement is the same at every width since the buyers link joined the CTA row.
    const navClasses = (el: Element) => classes(el).filter((c) => c.startsWith("nav:"))
    expect(
      Array.from(document.querySelectorAll("[class*='nav:']")).filter(
        (el) => !screen.getByTestId("hero-console").contains(el) && navClasses(el).length > 0
      )
    ).toEqual([])
  })

  it("pairs the primary with a secondary ghost pill 'See how it works' linking to /how-it-works", () => {
    renderWithSite(<HomeHero />)
    const link = screen.getByRole("link", { name: "See how it works" })
    expect(link).toHaveAttribute("href", "/how-it-works")
    expect(classes(link)).toEqual(expect.arrayContaining(["border-accent", "text-accent", "rounded-pill", "border"]))
    expect(classes(link)).not.toContain("bg-primary")
    // Outlined as every secondary is, but resting on canvas here: the accent alone measured under 4.5:1 over the film.
    expect(classes(link)).toContain("bg-canvas")
    expect(classes(link)).not.toContain("bg-transparent")
    // Hover goes to the second surface, never the variant's 10% tint that would let the film back through.
    expect(classes(link)).toContain("hover:bg-surface-2")
    expect(classes(link)).not.toContain("hover:bg-accent/10")
    expect(link.parentElement).toBe(screen.getByTestId("open-advisor").parentElement)
    expect(classes(link.parentElement!)).toEqual(expect.arrayContaining(["justify-center", "gap-3"]))
  })

  it("links buyers to the Buyer Passport page as the CTA row's one tertiary text link, carrying no pill of its own, never twice on the page", () => {
    renderWithSite(<HomeHero />)
    const links = screen.getAllByRole("link", { name: "Buyers: Get Heirloom Verified" })
    expect(links).toHaveLength(1)
    const buyers = screen.getByTestId("hero-buyers-plate")
    expect(buyers).toBe(links[0])
    expect(buyers.tagName).toBe("A")
    expect(buyers).toHaveAttribute("href", "/buyers")
    // A `TextLink standalone` and nothing more: the accent colour and the hover underline come from the global
    // `.text-link` rule in styles/site.css, which sets colour and a transition and no type rung, so the link keeps
    // the body's 17px; `STANDALONE_LINK` is the 44px touch target an action-row link needs.
    expect(STANDALONE_LINK).toBe("inline-flex min-h-11 items-center")
    expect(classes(buyers)).toEqual(["text-link", "inline-flex", "min-h-11", "items-center"])
    // Demoted on 2026-09-17 at Suyash's request: none of the pearl pill's surface, border, box or capsule is left,
    // and it carries no button grammar at all, so the two pills beside it are the row's primary and secondary and
    // this is the tertiary.
    for (const gone of [
      "bg-surface-pearl",
      "text-ink-muted-80",
      "border-divider-soft",
      "border-[3px]",
      "rounded-pill",
      "rounded-md",
      "px-[19px]",
      "py-2",
      "type-body",
      "type-caption",
      "pressable",
    ]) {
      expect(classes(buyers), gone).not.toContain(gone)
    }
    // Third in the row, after the two owner pills; nothing under the console any more.
    expect(buyers.parentElement).toBe(screen.getByTestId("hero-cta-row"))
    expect(buyers.previousElementSibling).toBe(screen.getByRole("link", { name: "See how it works" }))
    expect(buyers.nextElementSibling).toBeNull()
    expect(screen.getByTestId("hero-console").nextElementSibling).toBeNull()
  })

  it("casts the console's own shadow (the first build's) and no shadow anywhere else in the tile", () => {
    const { container } = renderWithSite(<HomeHero />)
    const console = screen.getByTestId("hero-console")
    const shadowed = Array.from(container.querySelectorAll("[class*='shadow']")).filter(
      (el) => !console.contains(el) || el === console
    )
    expect(shadowed).toEqual([console])
  })
})
