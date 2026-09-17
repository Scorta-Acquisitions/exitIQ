import { act, fireEvent, render, screen, within } from "@testing-library/react"
import type { ReactElement } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AdvisorDialog } from "@/components/site/advisor/AdvisorDialog"
import { lockupMetrics } from "@/components/site/brand/BrandLockup"
import { SiteBar } from "@/components/site/layout/SiteBar"
import { SiteStateProvider } from "@/components/site/providers/SiteStateProvider"
import { CONTEXT_LOCKUP_FROM, LOCKUP_WIDTH } from "@/lib/site/bar"
import { MOBILE_NAV_LINKS, NAV_GROUPS, type RoutePath, ROUTES, SUBNAV } from "@/lib/site/routes"
import { installSceneDrivers, type SceneDrivers, setRect } from "./scene-test-utils"

// Own navigation mock (instead of ./test-utils) so a test can change the pathname between renders.
const nav = vi.hoisted(() => ({ pathname: "/" }))
vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

let drivers: SceneDrivers

function setScrollY(y: number) {
  Object.defineProperty(window, "scrollY", { configurable: true, get: () => y })
}

/** Scroll the window to `y` and run the frame the bar's listener queues. */
function scrollTo(y: number) {
  setScrollY(y)
  act(() => {
    window.dispatchEvent(new Event("scroll"))
    drivers.flushFrames()
  })
}

function renderBar(pathname = "/", ui: ReactElement = <SiteBar />) {
  nav.pathname = pathname
  window.sessionStorage.clear()
  return render(<SiteStateProvider>{ui}</SiteStateProvider>)
}

const header = () => screen.getByRole("banner")
const surface = () => screen.getByTestId("bar-surface")
const mobileMenu = () => document.getElementById("mobile-nav")
const pageNav = () => screen.queryAllByRole("navigation", { name: "Page navigation" })
const brandLink = () => screen.getByRole("link", { name: "Heirloom home" })
/** Both brand variants in DOM order: the horizontal lockup (a span holding the mark and the word) and the mark (an svg). */
const lockups = () => Array.from(brandLink().querySelectorAll<HTMLElement | SVGElement>("[data-testid='brand-lockup']"))
const classOf = (el: Element): string => (el instanceof SVGElement ? el.className.baseVal : el.className)
/** The row inside the surface: the brand, the primary navigation and the action cluster. */
const row = () => surface().children[1] as HTMLElement
const ROW_CLASS =
  "nav:grid nav:grid-cols-[minmax(0,1fr)_auto_minmax(auto,1fr)] nav:gap-6 flex h-[var(--bar-h)] items-center gap-2 px-6"

describe("the bar's brand width", () => {
  it("reads the lockup's width from the same function the brand draws with", () => {
    // The mark 27.29 + the 6px gap + the word Heirloom 102.61 (Mona Sans 450, width 90, 27.5px): 135.9 by the rule.
    expect(LOCKUP_WIDTH).toBe(lockupMetrics("horizontal", 28).width)
    expect(LOCKUP_WIDTH).toBe(135.9)
  })
})

describe("<SiteBar />", () => {
  beforeEach(() => {
    drivers = installSceneDrivers()
    setScrollY(0)
  })
  afterEach(() => {
    drivers.restore()
    document.documentElement.style.overflow = ""
    nav.pathname = "/"
  })

  describe("the one sticky bar", () => {
    it("carries no room under its flow box on any route, in either state: the page starts under the 52px bar and there is no second row", () => {
      for (const path of [...Object.values(ROUTES), "/nothing-here"]) {
        const { unmount } = renderBar(path)
        const el = header()
        expect(el.className, path).toBe("group on-dark sticky top-0 z-50 h-[var(--bar-h)]")
        expect(el, path).toHaveAttribute("data-context", SUBNAV[path as RoutePath] ? "page" : "site")
        expect(screen.queryByTestId("bar-ribbon"), path).toBeNull()
        // The surface holds the hairline and the one 52px row, nothing under it.
        expect(surface().children, path).toHaveLength(2)
        expect(row().className, path).toBe(ROW_CLASS)
        scrollTo(2000)
        expect(el.className, path).toBe("group on-dark sticky top-0 z-50 h-[var(--bar-h)]")
        expect(surface().children, path).toHaveLength(2)
        expect(screen.queryByTestId("bar-ribbon"), path).toBeNull()
        unmount()
      }
    })

    it("puts the skip link first, pointing at #main, visually hidden until it takes focus under the bar", () => {
      renderBar()
      const skip = header().firstElementChild as HTMLAnchorElement
      expect(skip.tagName).toBe("A")
      expect(skip).toHaveAttribute("href", "#main")
      expect(skip).toHaveTextContent("Skip to content")
      expect(skip).toHaveClass("sr-only", "focus:not-sr-only", "focus:absolute", "focus:top-full", "focus:h-11")
      expect(skip.className).not.toMatch(/bg-primary/)
      expect(header().children[1]).toBe(surface())
    })

    it("paints the surface opaque at landing and as dark glass with a hairline once scrolled, changing only colour", () => {
      renderBar()
      expect(surface()).toHaveClass("absolute", "inset-x-0", "top-0", "bg-surface-black", "transition-colors")
      expect(surface()).not.toHaveClass("glass-dark")
      const hairline = surface().firstElementChild as HTMLElement
      expect(hairline).toHaveAttribute("aria-hidden", "true")
      expect(hairline).toHaveClass("bg-line", "h-px", "absolute", "bottom-0", "opacity-0")
      expect(surface().className).not.toMatch(/duration-(?!300)/)
      scrollTo(60)
      expect(surface()).toHaveClass("glass-dark")
      expect(surface()).not.toHaveClass("bg-surface-black")
      expect(hairline).toHaveClass("opacity-100")
      expect(surface().className).not.toMatch(/border-b|h-\[/)
    })

    it("flips to scrolled at 44px and not at 43, and back to landing at 16 and not at 17", () => {
      renderBar()
      scrollTo(43)
      expect(header()).toHaveAttribute("data-state", "landing")
      scrollTo(44)
      expect(header()).toHaveAttribute("data-state", "scrolled")
      scrollTo(30)
      expect(header()).toHaveAttribute("data-state", "scrolled")
      scrollTo(17)
      expect(header()).toHaveAttribute("data-state", "scrolled")
      scrollTo(16)
      expect(header()).toHaveAttribute("data-state", "landing")
      scrollTo(30)
      expect(header()).toHaveAttribute("data-state", "landing")
    })

    it("coalesces scroll events into one frame and stops listening when unmounted", () => {
      const { unmount } = renderBar()
      const before = drivers.raf.mock.calls.length
      setScrollY(100)
      window.dispatchEvent(new Event("scroll"))
      window.dispatchEvent(new Event("scroll"))
      window.dispatchEvent(new Event("resize"))
      expect(drivers.raf.mock.calls.length).toBe(before + 1)
      expect(drivers.pendingFrames()).toBe(1)
      act(() => drivers.flushFrames())
      expect(header()).toHaveAttribute("data-state", "scrolled")
      unmount()
      const after = drivers.raf.mock.calls.length
      window.dispatchEvent(new Event("scroll"))
      expect(drivers.raf.mock.calls.length).toBe(after)
    })

    it("cancels a queued frame when it unmounts mid-scroll", () => {
      const { unmount } = renderBar()
      window.dispatchEvent(new Event("scroll"))
      expect(drivers.pendingFrames()).toBe(1)
      unmount()
      expect(drivers.caf).toHaveBeenCalledTimes(1)
      expect(drivers.pendingFrames()).toBe(0)
    })
  })

  describe("the brand", () => {
    it("links home carrying both brand variants at a 28px mark, each forming once", () => {
      renderBar()
      const link = brandLink()
      expect(link).toHaveAttribute("href", "/")
      // The word twice in the link: the sr-only name for readers first, then the drawn word, aria-hidden, in the lockup.
      const [srName, drawn] = within(link).getAllByText("Heirloom")
      expect(srName).toHaveClass("sr-only")
      expect(drawn).toHaveAttribute("data-testid", "brand-wordmark")
      const [horizontal, mark] = lockups()
      expect(lockups()).toHaveLength(2)
      expect(horizontal).toHaveAttribute("data-variant", "horizontal")
      expect(mark).toHaveAttribute("data-variant", "mark")
      // Both variants are drawn at the bar's 28px mark, so nothing changes width when one yields to the other.
      expect(horizontal!.querySelector("svg")).toHaveAttribute("height", "28")
      expect(mark).toHaveAttribute("height", "28")
      // The mark-in reveal runs once per page load, on the bar's lockup alone.
      for (const variant of lockups()) expect(variant.querySelectorAll(".animate-mark-in")).toHaveLength(1)
      expect(link.querySelectorAll("img")).toHaveLength(0)
    })

    it("hides the lockup exactly where its column cannot hold it and shows the mark there, all by context and width classes", () => {
      renderBar()
      const [horizontal, mark] = lockups()
      // Desktop: on a page with context the lockup from 970px (the widest cluster, 370.31, takes its column first;
      // `max-[970px]` is `width < 970px`). Home and the 404 hold the 135.9px lockup from 734.75px, under the nav
      // breakpoint, so no desktop rule reads `context=site`: the lockup shows at every desktop width there.
      expect(horizontal).toHaveClass(`nav:max-[${CONTEXT_LOCKUP_FROM}px]:group-data-[context=page]:hidden`)
      expect(mark).toHaveClass(`nav:max-[${CONTEXT_LOCKUP_FROM}px]:group-data-[context=page]:block`)
      // Phones: the mark whenever the row carries a pill (any context page, home once scrolled); with no pill the
      // lockup fits from 236px, under the narrowest phone, so neither variant carries a bare width rule.
      expect(classOf(horizontal!)).toBe(
        "inline-flex shrink-0 items-center text-heirloom max-nav:group-data-[context=page]:hidden max-nav:group-data-[state=scrolled]:hidden nav:max-[970px]:group-data-[context=page]:hidden"
      )
      // (`cn` resolves the svg's own `block` against the resting `hidden`.)
      expect(classOf(mark!)).toBe(
        "shrink-0 text-heirloom hidden max-nav:group-data-[context=page]:block max-nav:group-data-[state=scrolled]:block nav:max-[970px]:group-data-[context=page]:block"
      )
    })

    it("draws the lockup at 28px in both states: no landing scale, no transition, and the link at the start of the first column", () => {
      renderBar()
      const [horizontal, mark] = lockups()
      for (const variant of [horizontal!, mark!]) {
        expect(classOf(variant)).not.toMatch(/scale-|origin-|transition|duration-|ease-/)
      }
      expect(horizontal!.querySelector("svg")).toHaveAttribute("height", "28")
      expect(mark).toHaveAttribute("height", "28")
      const link = brandLink()
      // Nothing on the link is bound to state, context or width: the grid's own 24px gap is the whole spacing.
      expect(Array.from(link.classList).filter((c) => /mr-|ml-|gap-|group-data|scale/.test(c))).toEqual([])
      expect(link.className).toBe("inline-flex shrink-0 items-center justify-self-start")
      renderBar("/fees")
      expect(screen.getAllByRole("link", { name: "Heirloom home" })[1]!.className).toBe(
        "inline-flex shrink-0 items-center justify-self-start"
      )
    })
  })

  describe("the row", () => {
    it("places the brand at the start of the first column, the primary navigation centred in the second and the action cluster at the end of the third", () => {
      renderBar()
      expect(row().children).toHaveLength(3)
      const [brand, primary, cluster] = Array.from(row().children) as [HTMLElement, HTMLElement, HTMLElement]
      expect(brand).toBe(brandLink())
      expect(brand).toHaveClass("justify-self-start")
      expect(primary).toBe(screen.getByRole("navigation", { name: "Primary navigation" }))
      expect(primary).toHaveClass("justify-self-center", "gap-7")
      expect(cluster).toHaveClass("justify-self-end", "ml-auto", "flex", "items-center", "gap-2")
      expect(cluster.className).not.toMatch(/min-w-0|max-w-/)
      // Home: the cluster is the advisor pill and the menu button (the phone pill joins once scrolled).
      expect(Array.from(cluster.children).map((c) => c.getAttribute("data-testid"))).toEqual([
        "open-advisor",
        "nav-burger",
      ])
      scrollTo(100)
      expect(Array.from(cluster.children).map((c) => c.getAttribute("data-testid"))).toEqual([
        "open-advisor",
        "open-advisor",
        "nav-burger",
      ])
    })

    it("on a page with context the cluster holds the desktop scrubber and pill, capped at the row's budget so the label truncates before anything overflows, then the phone pill and the menu button", () => {
      renderBar("/why")
      const cluster = row().children[2] as HTMLElement
      const [desktop, phonePill, burger] = Array.from(cluster.children) as [HTMLElement, HTMLElement, HTMLElement]
      expect(cluster.children).toHaveLength(3)
      expect(desktop).toHaveClass("hidden", "nav:flex", "min-w-0", "items-center", "gap-5")
      expect(desktop).toHaveClass("max-w-[calc(100vw-490.95px)]")
      expect(Array.from(desktop.children).map((c) => c.tagName)).toEqual(["NAV", "BUTTON"])
      expect(desktop.firstElementChild).toHaveAttribute("aria-label", "Page navigation")
      expect(desktop.firstElementChild).toHaveClass("min-w-0")
      expect(screen.getByTestId("bar-scrubber")).toHaveClass("min-w-0", "max-w-full")
      expect(screen.getByTestId("bar-scrubber").firstElementChild).toHaveClass("truncate")
      expect(phonePill).toHaveAttribute("data-testid", "bar-cta")
      expect(phonePill).toHaveClass("nav:hidden")
      expect(burger).toHaveAttribute("data-testid", "nav-burger")
    })

    it("hangs the scrubber's menu from the trigger's end, on the row's right side, and the groups' menus from their triggers' start", () => {
      renderBar("/fees")
      const scrubberMenu = screen.getByTestId("bar-scrubber").nextElementSibling as HTMLElement
      expect(scrubberMenu).toHaveClass("nav-dd-menu", "left-auto", "-right-4")
      const primary = screen.getByRole("navigation", { name: "Primary navigation" })
      for (const trigger of within(primary).getAllByRole("button")) {
        const menu = trigger.nextElementSibling as HTMLElement
        expect(Array.from(menu.classList)).toEqual(["nav-dd-menu"])
      }
    })
  })

  describe("the global row", () => {
    it("renders the three navigation groups and the buyers link in 12px nav type with 44px hit heights", () => {
      renderBar()
      const primary = screen.getByRole("navigation", { name: "Primary navigation" })
      expect(primary).toHaveClass("hidden", "nav:flex")
      expect(primary).toHaveTextContent("For owners")
      expect(primary).toHaveTextContent("The process")
      expect(primary).toHaveTextContent("The firm")
      const buyers = screen.getByRole("link", { name: /For buyers/ })
      expect(buyers).toHaveAttribute("href", "/buyers")
      expect(buyers).toHaveClass("type-nav-link", "h-11")
      for (const trigger of within(primary).getAllByRole("button")) {
        expect(trigger).toHaveClass("type-nav-link", "h-11")
        expect(trigger).toHaveAttribute("aria-haspopup", "true")
      }
      expect(screen.getByRole("link", { name: /^Sell my business/ })).toHaveAttribute("href", "/how-it-works")
    })

    it("renders every primary nav link with its exact href and note as a staggered row under a captioned card", () => {
      renderBar()
      const primary = screen.getByRole("navigation", { name: "Primary navigation" })
      for (const group of NAV_GROUPS) {
        const trigger = within(primary).getByRole("button", { name: group.label })
        const card = trigger.nextElementSibling!.firstElementChild as HTMLElement
        expect(trigger.nextElementSibling).toHaveClass("nav-dd-menu")
        expect(card.style.minWidth, group.label).toBe(`${group.minWidth}px`)
        expect(card).toHaveClass("rounded-lg", "border", "border-line", "bg-surface", "p-2")
        expect(card.className).not.toMatch(/shadow/)
        const caption = card.firstElementChild as HTMLElement
        expect(caption).toHaveTextContent(group.label)
        expect(caption).toHaveClass("type-fine-print", "text-fg-3", "border-b", "border-line-soft")
        group.links.forEach((link, i) => {
          const anchor = within(card).getByText(link.label).closest("a")!
          expect(anchor, link.label).toHaveAttribute("href", link.href)
          expect(anchor).toHaveClass("nav-dd-row", "rounded-sm", "hover:bg-line-soft")
          expect(anchor.style.getPropertyValue("--i")).toBe(String(i))
          expect(within(anchor).getByText(link.label)).toHaveClass("type-caption-strong")
          expect(within(anchor).getByText(link.note)).toHaveClass("type-fine-print")
        })
        expect(card.querySelectorAll("a")).toHaveLength(group.links.length)
      }
      expect(within(primary).getAllByRole("button")).toHaveLength(NAV_GROUPS.length)
      expect(within(primary).getAllByRole("link")).toHaveLength(NAV_GROUPS.flatMap((g) => g.links).length + 1)
    })

    it("home: the advisor pill is the one filled control, desktop only, and there is no page navigation or page pill", () => {
      renderBar()
      const cta = screen.getByTestId("open-advisor")
      expect(cta.tagName).toBe("BUTTON")
      expect(cta).toHaveTextContent("Talk to an M&A advisor")
      expect(cta).toHaveClass("bg-primary", "rounded-pill", "type-nav-link", "hidden", "nav:inline-flex", "h-[26px]")
      expect(pageNav()).toHaveLength(0)
      expect(screen.queryByTestId("bar-cta")).toBeNull()
      expect(screen.queryByTestId("bar-scrubber")).toBeNull()
      expect(header().querySelectorAll(".bg-primary")).toHaveLength(1)
    })

    it("home on a phone: no pill at landing; once scrolled the advisor pill joins the row as a 34px pill in a 44px hit box", () => {
      renderBar(
        "/",
        <>
          <SiteBar />
          <AdvisorDialog />
        </>
      )
      expect(screen.getAllByTestId("open-advisor")).toHaveLength(1)
      scrollTo(44)
      const pills = screen.getAllByTestId("open-advisor")
      expect(pills).toHaveLength(2)
      const phone = pills[1]!
      expect(phone.tagName).toBe("BUTTON")
      expect(phone).toHaveClass("pressable", "nav:hidden", "inline-flex", "h-11", "items-center")
      const visual = phone.firstElementChild as HTMLElement
      expect(visual).toHaveClass("bg-primary", "text-on-primary", "rounded-pill", "type-nav-link", "h-[34px]", "px-3.5")
      expect(visual).toHaveTextContent("Talk to an M&A advisor")
      fireEvent.click(phone)
      expect(screen.getByRole("dialog", { name: "Talk to an M&A advisor" })).toBeInTheDocument()
      scrollTo(0)
      expect(screen.getAllByTestId("open-advisor")).toHaveLength(1)
    })

    it("labels the menu button for its state, points it at the menu, hides it from the nav breakpoint, and crosses its two lines into an X while open", () => {
      renderBar()
      expect(header()).toHaveAttribute("data-menu", "closed")
      const burger = screen.getByTestId("nav-burger")
      expect(burger).toHaveAttribute("aria-label", "Open navigation menu")
      expect(burger).toHaveAttribute("aria-expanded", "false")
      expect(burger).toHaveAttribute("aria-controls", "mobile-nav")
      expect(burger).toHaveClass("h-11", "w-11", "nav:hidden")
      // The glyph: an 18×7 box holding two 1px lines, one at its top edge and one at its bottom, hidden from readers.
      const glyph = burger.firstElementChild as HTMLElement
      expect(burger.children).toHaveLength(1)
      expect(glyph).toHaveAttribute("aria-hidden", "true")
      expect(Array.from(glyph.classList)).toEqual(["relative", "block", "h-[7px]", "w-[18px]"])
      expect(glyph.className).not.toMatch(/border|rotate/)
      const [top, bottom] = Array.from(glyph.children) as HTMLElement[]
      expect(glyph.children).toHaveLength(2)
      for (const line of [top!, bottom!]) {
        expect(line.tagName).toBe("SPAN")
        expect(line).toHaveClass(
          "bg-on-dark",
          "absolute",
          "inset-x-0",
          "h-px",
          "transition-transform",
          "duration-200",
          "ease-e1",
          "motion-reduce:transition-none"
        )
        expect(line.className).not.toMatch(/rotate|translate/)
      }
      expect(top).toHaveClass("top-0")
      expect(bottom).toHaveClass("bottom-0")
      expect(mobileMenu()).toBeNull()
      fireEvent.click(burger)
      expect(burger).toHaveAttribute("aria-label", "Close navigation menu")
      expect(burger).toHaveAttribute("aria-expanded", "true")
      // Open: each line travels 3px to the box's centre and turns 45° its own way, so the two cross as an X.
      expect(top).toHaveClass("top-0", "translate-y-[3px]", "rotate-45")
      expect(bottom).toHaveClass("bottom-0", "-translate-y-[3px]", "-rotate-45")
      expect(top).not.toHaveClass("-rotate-45")
      expect(bottom).not.toHaveClass("rotate-45")
      expect(header()).toHaveAttribute("data-menu", "open")
      expect(mobileMenu()).not.toBeNull()
      fireEvent.click(burger)
      expect(mobileMenu()).toBeNull()
      expect(header()).toHaveAttribute("data-menu", "closed")
      expect(top!.className).not.toMatch(/rotate|translate/)
      expect(bottom!.className).not.toMatch(/rotate|translate/)
    })
  })

  describe("page context on desktop", () => {
    /** The desktop cluster: the scrubber's navigation and the pill beside it, `hidden nav:flex`. */
    const cluster = () => screen.getByTestId("bar-scrubber").closest("nav")!.parentElement as HTMLElement
    const card = () => screen.getByTestId("bar-scrubber").nextElementSibling!.firstElementChild as HTMLElement

    it("carries the scrubber and the anchor pill from landing: the one Page navigation, the title as the trigger, the sections and the advisor entry in its card", () => {
      renderBar("/fees")
      expect(header()).toHaveAttribute("data-state", "landing")
      const scrubber = screen.getByTestId("bar-scrubber")
      expect(pageNav()).toHaveLength(1)
      expect(pageNav()[0]).toContainElement(scrubber)
      expect(pageNav()[0]).toHaveClass("nav-dd")
      expect(scrubber.tagName).toBe("BUTTON")
      expect(scrubber).toHaveAttribute("aria-haspopup", "true")
      expect(scrubber).toHaveTextContent("Fees")
      expect(scrubber).not.toHaveTextContent("·")
      expect(scrubber).toHaveClass("type-nav-link", "h-11")
      expect(cluster()).toHaveClass("hidden", "nav:flex", "min-w-0", "max-w-[calc(100vw-490.95px)]")
      // Nothing arrives or leaves with the state: the cluster is plain flow, no stage-in and no exit classes.
      expect(cluster().className).not.toMatch(/animate-|opacity-|translate|transition|duration-/)
      const cta = within(cluster()).getByTestId("bar-cta")
      expect(cta.tagName).toBe("A")
      expect(cta).toHaveAttribute("href", "#fees-calc")
      expect(cta).toHaveTextContent("Calculate my fee")
      expect(cta).toHaveClass("bg-primary", "rounded-pill", "type-nav-link", "h-[26px]")
      // The scrubber's card: the title as caption, the sections, a hairline, then the advisor entry.
      expect(scrubber.nextElementSibling).toHaveClass("nav-dd-menu")
      expect(card().style.minWidth).toBe("240px")
      expect(card().firstElementChild).toHaveTextContent("Fees")
      const sections = within(card()).getAllByRole("link")
      expect(sections.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
        ["Calculator", "#fees-calc"],
        ["Other costs", "#other-costs"],
        ["Questions", "#fee-questions"],
      ])
      sections.forEach((a, i) => {
        expect(a).toHaveClass("nav-dd-row", "type-caption-strong", "text-fg-2")
        expect(a).not.toHaveAttribute("aria-current")
        expect(a.style.getPropertyValue("--i")).toBe(String(i))
      })
      const entry = within(card()).getByTestId("open-advisor")
      expect(entry.tagName).toBe("BUTTON")
      expect(entry).toHaveTextContent("Talk to an advisor")
      expect(entry).toHaveClass("nav-dd-row", "border-t", "border-line-soft", "text-accent")
      expect(entry.style.getPropertyValue("--i")).toBe("3")
      expect(screen.getAllByTestId("open-advisor")).toEqual([entry])
      expect(screen.queryByText("Talk to an M&A advisor")).toBeNull()
      expect(screen.queryByTestId("bar-ribbon")).toBeNull()
      // Two filled pills in the markup, one per width: the desktop cluster's and the phone row's (`nav:hidden`).
      const filled = Array.from(surface().querySelectorAll(".bg-primary"))
      expect(filled).toHaveLength(2)
      expect(filled.filter((el) => cluster().contains(el))).toHaveLength(1)
      expect(filled.filter((el) => el.parentElement!.className.includes("nav:hidden"))).toHaveLength(1)
    })

    it("keeps the same scrubber and pill across the flip and back: nothing mounts or leaves, only the material changes", () => {
      renderBar("/fees")
      const scrubber = screen.getByTestId("bar-scrubber")
      const cta = within(cluster()).getByTestId("bar-cta")
      const rowEl = row()
      scrollTo(44)
      expect(header()).toHaveAttribute("data-state", "scrolled")
      expect(surface()).toHaveClass("glass-dark")
      expect(screen.getByTestId("bar-scrubber")).toBe(scrubber)
      expect(within(cluster()).getByTestId("bar-cta")).toBe(cta)
      expect(pageNav()).toHaveLength(1)
      expect(surface().children).toHaveLength(2)
      expect(row()).toBe(rowEl)
      scrollTo(16)
      expect(header()).toHaveAttribute("data-state", "landing")
      expect(surface()).toHaveClass("bg-surface-black")
      expect(screen.getByTestId("bar-scrubber")).toBe(scrubber)
      expect(within(cluster()).getByTestId("bar-cta")).toBe(cta)
      expect(surface().children).toHaveLength(2)
    })

    it("where the page's action is the advisor, the pill beside the scrubber opens the dialog and the card lists the sections alone", () => {
      renderBar(
        "/why",
        <>
          <SiteBar />
          <AdvisorDialog />
        </>
      )
      const scrubber = screen.getByTestId("bar-scrubber")
      expect(scrubber).toHaveTextContent("Why Heirloom")
      expect(
        within(card())
          .getAllByRole("link")
          .map((a) => a.textContent)
      ).toEqual(["How businesses sell today", "What we do now", "What we are building"])
      expect(within(card()).queryByRole("button")).toBeNull()
      expect(screen.queryByTestId("open-advisor")).toBeNull()
      const cta = within(cluster()).getByTestId("bar-cta")
      expect(cta.tagName).toBe("BUTTON")
      expect(cta).toHaveTextContent("Talk to an advisor")
      expect(cta).toHaveClass("bg-primary", "rounded-pill", "type-nav-link", "h-[26px]")
      // The scrubber's trigger and the pill are the cluster's only buttons: no second advisor control.
      expect(within(cluster()).getAllByRole("button")).toEqual([scrubber, cta])
      expect(screen.queryByRole("dialog")).toBeNull()
      fireEvent.click(cta)
      expect(screen.getByRole("dialog", { name: "Talk to an M&A advisor" })).toBeInTheDocument()
    })

    it("a page without sections shows the title and the pill, and its card carries the advisor entry alone", () => {
      renderBar("/questions")
      expect(screen.getByTestId("bar-scrubber")).toHaveTextContent("Questions")
      expect(within(card()).queryByRole("list")).toBeNull()
      expect(within(card()).queryAllByRole("link")).toEqual([])
      const entry = within(card()).getByTestId("open-advisor")
      expect(entry).toHaveTextContent("Talk to an advisor")
      expect(entry.style.getPropertyValue("--i")).toBe("0")
      const cta = within(cluster()).getByTestId("bar-cta")
      expect(cta).toHaveAttribute("href", "#q-ask")
      expect(cta).toHaveTextContent("Ask a question")
    })

    it("reads the current section from the sections' tops, lights it in the card and the trigger, and writes page progress to the reading rule", () => {
      Object.defineProperty(window, "innerHeight", { configurable: true, writable: true, value: 1000 })
      Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 3000 })
      const targets = SUBNAV["/fees"]!.links.map((l) => {
        const el = document.createElement("section")
        el.id = l.href.slice(1)
        document.body.appendChild(el)
        return el
      })
      const place = (tops: number[]) => tops.forEach((top, i) => setRect(targets[i]!, { top, height: 400 }))
      try {
        setScrollY(500)
        place([60, 500, 900])
        renderBar("/fees")
        // Opened scrolled: the scrubber reads the title and the current section, and its rule is a quarter of the way.
        const scrubber = screen.getByTestId("bar-scrubber")
        expect(scrubber).toHaveTextContent("Fees · Calculator")
        // The reading rule: a 2px hairline track the label's width under the text, the accent fill inside it.
        const track = screen.getByTestId("bar-track")
        const fill = screen.getByTestId("bar-progress")
        expect(track).toHaveAttribute("aria-hidden", "true")
        expect(Array.from(track.classList)).toEqual(["bg-line", "absolute", "inset-x-0", "bottom-3", "h-0.5"])
        expect(track.parentElement).toBe(scrubber)
        expect(Array.from(track.children)).toEqual([fill])
        expect(Array.from(fill.classList)).toEqual(["bg-accent", "absolute", "inset-y-0", "left-0", "w-0"])
        expect(fill.style.width).toBe("25%")
        const current = () =>
          within(card())
            .getAllByRole("link")
            .filter((a) => a.getAttribute("aria-current") === "true")
            .map((a) => a.textContent)
        expect(current()).toEqual(["Calculator"])
        expect(within(card()).getByRole("link", { name: "Calculator" })).toHaveClass("text-fg")
        expect(within(card()).getByRole("link", { name: "Other costs" })).toHaveClass("text-fg-2")

        place([-400, 70, 500])
        scrollTo(1000)
        expect(scrubber).toHaveTextContent("Fees · Other costs")
        expect(current()).toEqual(["Other costs"])
        expect(screen.getByTestId("bar-progress").style.width).toBe("50%")

        place([-900, -500, 76])
        scrollTo(1500)
        expect(scrubber).toHaveTextContent("Fees · Questions")
        expect(current()).toEqual(["Questions"])
        expect(screen.getByTestId("bar-progress").style.width).toBe("75%")

        place([77, 500, 900])
        scrollTo(2600)
        expect(scrubber).toHaveTextContent("Fees")
        expect(scrubber).not.toHaveTextContent("·")
        expect(current()).toEqual([])
        expect(screen.getByTestId("bar-progress").style.width).toBe("100%")

        // Back at the top the same scrubber reads the section that sits under the bar there, and the rule is empty.
        place([60, 500, 900])
        scrollTo(0)
        expect(header()).toHaveAttribute("data-state", "landing")
        expect(screen.getByTestId("bar-scrubber")).toBe(scrubber)
        expect(scrubber).toHaveTextContent("Fees · Calculator")
        expect(current()).toEqual(["Calculator"])
        expect(within(card()).getByRole("link", { name: "Other costs" })).not.toHaveAttribute("aria-current")
        expect(screen.getByTestId("bar-progress").style.width).toBe("0%")
      } finally {
        targets.forEach((t) => t.remove())
      }
    })

    it("gives the reading rule its first width on mount, before any scroll", () => {
      Object.defineProperty(window, "innerHeight", { configurable: true, writable: true, value: 1000 })
      Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 3000 })
      setScrollY(1000)
      renderBar("/why")
      expect(screen.getByTestId("bar-progress").style.width).toBe("50%")
      expect(header()).toHaveAttribute("data-state", "scrolled")
    })

    it("skips a section whose target is not on the page and reads the ones that are", () => {
      // /fees names three sections; the page mounts two of them, without #fees-calc.
      const targets = ["other-costs", "fee-questions"].map((id, i) => {
        const el = document.createElement("section")
        el.id = id
        document.body.appendChild(el)
        setRect(el, { top: i === 0 ? 60 : 900, height: 400 })
        return el
      })
      try {
        setScrollY(500)
        renderBar("/fees")
        expect(screen.getByTestId("bar-scrubber")).toHaveTextContent("Fees · Other costs")
        const current = within(card())
          .getAllByRole("link")
          .filter((a) => a.getAttribute("aria-current") === "true")
          .map((a) => a.textContent)
        expect(current).toEqual(["Other costs"])
      } finally {
        targets.forEach((t) => t.remove())
      }
    })
  })

  describe("page context on phones", () => {
    it("carries the page's anchor pill in both states as a 34px pill in a 44px hit box, and the advisor lives in the menu", () => {
      renderBar("/buyers")
      const pill = () => screen.getAllByTestId("bar-cta").find((el) => el.className.includes("nav:hidden"))!
      expect(pill().tagName).toBe("A")
      expect(pill()).toHaveAttribute("href", "#buyer-register")
      expect(pill()).toHaveClass("pressable", "nav:hidden", "inline-flex", "h-11", "shrink-0")
      const visual = pill().firstElementChild as HTMLElement
      expect(visual).toHaveClass("bg-primary", "text-on-primary", "rounded-pill", "type-nav-link", "h-[34px]")
      expect(visual).toHaveTextContent("Get Heirloom Verified")
      scrollTo(300)
      expect(pill()).toHaveAttribute("href", "#buyer-register")
      expect(screen.getAllByTestId("bar-cta").filter((el) => el.className.includes("nav:hidden"))).toHaveLength(1)
    })

    it("where the page's action is the advisor, the phone pill is a button that opens the dialog", () => {
      renderBar(
        "/confidentiality",
        <>
          <SiteBar />
          <AdvisorDialog />
        </>
      )
      const pill = screen.getAllByTestId("bar-cta").find((el) => el.className.includes("nav:hidden"))!
      expect(pill.tagName).toBe("BUTTON")
      expect(pill.firstElementChild).toHaveTextContent("Talk to an advisor")
      fireEvent.click(pill)
      expect(screen.getByRole("dialog", { name: "Talk to an M&A advisor" })).toBeInTheDocument()
    })

    it("every page with context gets its pill with the exact label and target", () => {
      for (const [path, entry] of Object.entries(SUBNAV)) {
        const { unmount } = renderBar(path)
        const pill = screen.getAllByTestId("bar-cta").find((el) => el.className.includes("nav:hidden"))!
        expect(pill, path).toHaveTextContent(entry!.cta.label)
        if (entry!.cta.href) expect(pill, path).toHaveAttribute("href", entry!.cta.href)
        else expect(pill.tagName, path).toBe("BUTTON")
        unmount()
      }
    })
  })

  describe("the phone menu", () => {
    it("overlays the page under the bar as one opaque surface to the viewport's bottom, scrolling inside, and locks the page's scrolling while open", () => {
      renderBar()
      fireEvent.click(screen.getByTestId("nav-burger"))
      const menu = mobileMenu()!
      expect(menu).toHaveClass(
        "absolute",
        "top-full",
        "inset-x-0",
        "bg-surface-black",
        "overflow-y-auto",
        "min-h-[calc(100dvh-var(--bar-h))]",
        "max-h-[calc(100dvh-var(--bar-h))]",
        "nav:hidden"
      )
      // Opaque, never the bar row's glass: the page cannot show through it and no page pill doubles the menu's.
      expect(menu.className).not.toMatch(/glass|backdrop|opacity/)
      expect(document.documentElement.style.overflow).toBe("hidden")
      fireEvent.click(screen.getByTestId("nav-burger"))
      expect(document.documentElement.style.overflow).toBe("")
    })

    it("restores the page's own overflow value rather than clearing it", () => {
      document.documentElement.style.overflow = "auto"
      renderBar()
      fireEvent.click(screen.getByTestId("nav-burger"))
      expect(document.documentElement.style.overflow).toBe("hidden")
      fireEvent.click(screen.getByTestId("nav-burger"))
      expect(document.documentElement.style.overflow).toBe("auto")
    })

    it("lists every destination once in order with its href as muted tagline rows, then the filled advisor pill on home at landing", () => {
      renderBar()
      fireEvent.click(screen.getByTestId("nav-burger"))
      const links = within(mobileMenu()!).getAllByRole("link")
      expect(links.map((l) => l.textContent)).toEqual(MOBILE_NAV_LINKS.map((l) => l.label))
      expect(links.map((l) => l.getAttribute("href"))).toEqual(MOBILE_NAV_LINKS.map((l) => l.href))
      expect(links.map((l) => l.textContent)).toEqual([
        "Sell my business",
        "Review my offer",
        "Check sale readiness",
        "Fees",
        "Confidentiality",
        "Who we are",
        "Questions",
        "Why Heirloom",
        "For buyers",
      ])
      // One voice for the whole list, the second tone (fg-3 measured 3.4:1 on the old glass; on the opaque surface
      // fg-2 is the muted tone under the page's own sections).
      for (const link of links) {
        expect(link, link.textContent ?? "").toHaveClass("type-tagline", "text-fg-2", "min-h-11")
        expect(
          Array.from(link.classList).filter((c) => /^text-fg/.test(c)),
          link.textContent ?? ""
        ).toEqual(["text-fg-2"])
        expect(Array.from(link.classList).filter((c) => /^type-/.test(c))).toEqual(["type-tagline"])
      }
      expect(links.at(-1)).toHaveAttribute("href", "/buyers")
      const advisor = within(mobileMenu()!).getByTestId("open-advisor")
      expect(advisor).toHaveTextContent("Talk to an M&A advisor")
      expect(advisor).toHaveClass("bg-primary", "rounded-pill", "type-body")
      expect(within(mobileMenu()!).queryByText("On this page")).toBeNull()
    })

    it("once home has scrolled (the row carries the advisor pill) the menu's advisor entry is outlined instead", () => {
      renderBar()
      scrollTo(100)
      fireEvent.click(screen.getByTestId("nav-burger"))
      const advisor = within(mobileMenu()!).getByTestId("open-advisor")
      expect(advisor).toHaveClass("border-accent", "text-accent", "rounded-pill")
      expect(advisor).not.toHaveClass("bg-primary")
      expect(header().querySelectorAll(".bg-primary.h-\\[34px\\]")).toHaveLength(1)
    })

    it("on a page with context it lists the page's sections first under the title caption, then the destinations, then the outlined advisor", () => {
      renderBar("/fees")
      fireEvent.click(screen.getByTestId("nav-burger"))
      const menu = mobileMenu()!
      const caption = menu.firstElementChild as HTMLElement
      expect(caption).toHaveTextContent("Fees")
      expect(caption).toHaveClass("type-fine-print", "text-fg-2")
      expect(caption).not.toHaveClass("text-fg-3")
      const links = within(menu).getAllByRole("link")
      expect(links.map((l) => l.textContent)).toEqual([
        "Calculator",
        "Other costs",
        "Questions",
        ...MOBILE_NAV_LINKS.map((l) => l.label),
      ])
      expect(links.slice(0, 3).map((l) => l.getAttribute("href"))).toEqual([
        "#fees-calc",
        "#other-costs",
        "#fee-questions",
      ])
      // The page's sections lead in the display voice at full tone; the destinations under them in the muted tone.
      for (const a of links.slice(0, 3)) {
        expect(a).toHaveClass("type-tagline", "text-fg", "min-h-11")
        expect(Array.from(a.classList).filter((c) => /^text-fg|^type-/.test(c))).toEqual(["type-tagline", "text-fg"])
      }
      for (const a of links.slice(3)) {
        expect(a).toHaveClass("type-tagline", "text-fg-2", "min-h-11")
        expect(a).not.toHaveClass("text-fg")
      }
      expect(links[0]!.closest("ul")).toHaveClass("border-b", "border-line")
      expect(within(menu).getByTestId("open-advisor")).toHaveClass("border-accent")
      expect(within(menu).getByTestId("open-advisor")).not.toHaveClass("bg-primary")
      // The row's own pill stays: one filled pill in the bar.
      expect(header().querySelectorAll(".bg-primary.h-\\[34px\\]")).toHaveLength(1)
    })

    it("skips the page section when the page has no sections", () => {
      renderBar("/questions")
      fireEvent.click(screen.getByTestId("nav-burger"))
      const menu = mobileMenu()!
      expect(within(menu).getAllByRole("link")).toHaveLength(MOBILE_NAV_LINKS.length)
      expect(menu.firstElementChild!.tagName).toBe("UL")
      expect(within(menu).queryByText("Questions", { selector: "span" })).toBeNull()
    })

    it("closes when a destination or a page section is chosen", () => {
      // jsdom cannot navigate; cancel the anchor's default action while still letting React's onClick run.
      const stopNavigation = (e: Event) => e.preventDefault()
      document.addEventListener("click", stopNavigation)
      try {
        renderBar("/fees")
        fireEvent.click(screen.getByTestId("nav-burger"))
        fireEvent.click(within(mobileMenu()!).getByRole("link", { name: "Other costs" }))
        expect(mobileMenu()).toBeNull()
        expect(screen.getByTestId("nav-burger")).toHaveAttribute("aria-expanded", "false")
        fireEvent.click(screen.getByTestId("nav-burger"))
        fireEvent.click(within(mobileMenu()!).getByRole("link", { name: "Fees" }))
        expect(mobileMenu()).toBeNull()
        expect(document.documentElement.style.overflow).toBe("")
      } finally {
        document.removeEventListener("click", stopNavigation)
      }
    })

    it("opens the advisor dialog from its pill and closes", () => {
      renderBar(
        "/",
        <>
          <SiteBar />
          <AdvisorDialog />
        </>
      )
      expect(screen.queryByRole("dialog")).toBeNull()
      fireEvent.click(screen.getByTestId("nav-burger"))
      fireEvent.click(within(mobileMenu()!).getByTestId("open-advisor"))
      expect(screen.getByRole("dialog", { name: "Talk to an M&A advisor" })).toBeInTheDocument()
      expect(
        within(screen.getByTestId("advisor-dialog")).getByText("Where should the conversation start?")
      ).toBeInTheDocument()
      expect(mobileMenu()).toBeNull()
      expect(document.documentElement.style.overflow).toBe("")
    })

    it("Escape closes it and returns focus to the menu button; other keys do nothing", () => {
      renderBar()
      const burger = screen.getByTestId("nav-burger")
      fireEvent.click(burger)
      within(mobileMenu()!).getByRole("link", { name: "Fees" }).focus()
      fireEvent.keyDown(document, { key: "Enter" })
      expect(mobileMenu()).not.toBeNull()
      fireEvent.keyDown(document, { key: "Escape" })
      expect(mobileMenu()).toBeNull()
      expect(document.activeElement).toBe(burger)
      expect(burger).toHaveAttribute("aria-expanded", "false")
      fireEvent.keyDown(document, { key: "Escape" })
      expect(mobileMenu()).toBeNull()
    })

    it("closes when the pathname changes and restores the page's scrolling", () => {
      const { rerender } = renderBar()
      fireEvent.click(screen.getByTestId("nav-burger"))
      expect(mobileMenu()).not.toBeNull()
      expect(document.documentElement.style.overflow).toBe("hidden")
      nav.pathname = "/fees"
      rerender(
        <SiteStateProvider>
          <SiteBar />
        </SiteStateProvider>
      )
      expect(mobileMenu()).toBeNull()
      expect(screen.getByTestId("nav-burger")).toHaveAttribute("aria-expanded", "false")
      expect(document.documentElement.style.overflow).toBe("")
      expect(header()).toHaveAttribute("data-context", "page")
    })

    it("stays open on a re-render with the same pathname", () => {
      const { rerender } = renderBar()
      fireEvent.click(screen.getByTestId("nav-burger"))
      rerender(
        <SiteStateProvider>
          <SiteBar />
        </SiteStateProvider>
      )
      expect(mobileMenu()).not.toBeNull()
    })
  })
})

describe("the desktop dropdowns after a route change", () => {
  /** The bar plus one focusable control outside it, so the effect's two branches can be told apart. */
  const inner = (
    <>
      <SiteBar />
      <button type="button" data-testid="outside">
        Outside the bar
      </button>
    </>
  )
  const wrapped = <SiteStateProvider>{inner}</SiteStateProvider>

  it("blurs a dropdown link that kept the focus through the navigation, so `:focus-within` stops holding its menu open", () => {
    const { rerender } = renderBar("/", inner)
    const link = screen.getByRole("link", { name: /^How it works/ })
    expect(link.closest(".nav-dd")).not.toBeNull()
    act(() => link.focus())
    expect(document.activeElement).toBe(link)
    nav.pathname = "/how-it-works"
    rerender(wrapped)
    expect(document.activeElement).not.toBe(link)
    expect(document.activeElement).toBe(document.body)
    expect(header()).toHaveAttribute("data-context", "page")
  })

  it("leaves the focus alone when it is outside the bar's dropdowns", () => {
    const { rerender } = renderBar("/", inner)
    const outside = screen.getByTestId("outside")
    act(() => outside.focus())
    nav.pathname = "/fees"
    rerender(wrapped)
    expect(document.activeElement).toBe(outside)
    // The brand link is in the bar but in no dropdown: it keeps the focus too.
    act(() => brandLink().focus())
    nav.pathname = "/why"
    rerender(wrapped)
    expect(document.activeElement).toBe(brandLink())
  })

  it("keeps a focused dropdown link on a re-render with the same pathname", () => {
    const { rerender } = renderBar("/", inner)
    const link = screen.getByRole("link", { name: /^Fees/ })
    act(() => link.focus())
    rerender(wrapped)
    expect(document.activeElement).toBe(link)
  })
})

describe("Escape on a desktop dropdown", () => {
  /** The group a trigger belongs to: the element the CSS opens the card on (`.nav-dd:hover|:focus-within`). */
  const group = (el: Element) => el.closest<HTMLElement>(".nav-dd")!
  const trigger = (label: string) => screen.getByRole("button", { name: new RegExp(`^${label}`) })

  it("marks the focused group closed and keeps the focus on its trigger, so the keyboard can shut the card the CSS opens", () => {
    renderBar("/")
    const button = trigger(NAV_GROUPS[0]!.label)
    act(() => button.focus())
    // Nothing is dismissed while the group simply has the focus: that is the state the CSS opens on.
    expect(group(button)).not.toHaveAttribute("data-closed")
    fireEvent.keyDown(button, { key: "Escape" })
    expect(group(button)).toHaveAttribute("data-closed", "true")
    // The visitor keeps their place: the trigger still holds the focus, and no other group was touched.
    expect(document.activeElement).toBe(button)
    expect(group(trigger(NAV_GROUPS[1]!.label))).not.toHaveAttribute("data-closed")
  })

  it("pulls the focus out of the card back onto the trigger when Escape comes from a link inside it", () => {
    renderBar("/")
    const link = screen.getByRole("link", { name: /^How it works/ })
    // "How it works" is the second group's first row; Escape inside the card returns to that group's trigger.
    expect(NAV_GROUPS[1]!.links[0]!.label).toBe("How it works")
    act(() => link.focus())
    fireEvent.keyDown(link, { key: "Escape" })
    expect(document.activeElement).toBe(trigger(NAV_GROUPS[1]!.label))
    expect(group(link)).toHaveAttribute("data-closed", "true")
  })

  it("clears the mark when the focus leaves the group, when the pointer enters it, and when the trigger is pressed again", () => {
    renderBar("/")
    const button = trigger(NAV_GROUPS[0]!.label)
    const outside = trigger(NAV_GROUPS[1]!.label)
    const dismiss = () => {
      act(() => button.focus())
      fireEvent.keyDown(button, { key: "Escape" })
      expect(group(button)).toHaveAttribute("data-closed", "true")
    }
    // Tabbing out of the group: so Shift+Tab back in opens it again through `:focus-within`.
    dismiss()
    fireEvent.focusOut(button, { relatedTarget: outside })
    expect(group(button)).not.toHaveAttribute("data-closed")
    // The pointer arriving over the group: so the hover state is never held shut.
    dismiss()
    fireEvent.pointerOver(button)
    expect(group(button)).not.toHaveAttribute("data-closed")
    // The trigger pressed again: Enter, Space and ArrowDown each reopen the card.
    for (const key of ["Enter", " ", "ArrowDown"]) {
      dismiss()
      fireEvent.keyDown(button, { key })
      expect(group(button)).not.toHaveAttribute("data-closed")
    }
  })

  it("keeps the mark while the focus moves inside the same group, and never marks anything outside a dropdown", () => {
    renderBar("/")
    const button = trigger(NAV_GROUPS[1]!.label)
    const link = screen.getByRole("link", { name: /^How it works/ })
    expect(group(link)).toBe(group(button))
    act(() => button.focus())
    fireEvent.keyDown(button, { key: "Escape" })
    // The focus moving from the trigger to one of the card's own rows is not the group losing it.
    fireEvent.focusOut(button, { relatedTarget: link })
    expect(group(button)).toHaveAttribute("data-closed", "true")
    // Moving the focus right out of the bar's group clears it again (jsdom's focus fires the same focusout).
    act(() => brandLink().focus())
    expect(group(button)).not.toHaveAttribute("data-closed")
    // The brand link sits in the bar but in no dropdown: Escape there marks nothing at all and moves no focus.
    fireEvent.keyDown(brandLink(), { key: "Escape" })
    expect(document.querySelectorAll("[data-closed]")).toHaveLength(0)
    expect(document.activeElement).toBe(brandLink())
  })

  it("dismisses the page scrubber's own card the same way on a context page", () => {
    renderBar("/how-it-works")
    const scrubber = screen.getByTestId("bar-scrubber")
    expect(group(scrubber).tagName).toBe("NAV")
    act(() => scrubber.focus())
    fireEvent.keyDown(scrubber, { key: "Escape" })
    expect(group(scrubber)).toHaveAttribute("data-closed", "true")
    expect(document.activeElement).toBe(scrubber)
  })
})
