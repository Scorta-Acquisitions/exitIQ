import { fireEvent, render, screen, within } from "@testing-library/react"
import type { ReactElement } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { AdvisorDialog } from "@/components/site/advisor/AdvisorDialog"
import { SiteHeader } from "@/components/site/layout/SiteHeader"
import { SiteStateProvider } from "@/components/site/providers/SiteStateProvider"
import { MOBILE_NAV_LINKS, NAV_GROUPS } from "@/lib/site/routes"

// Own navigation mock (instead of ./test-utils) so a test can change the pathname between renders.
const nav = vi.hoisted(() => ({ pathname: "/" }))
vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

function renderHeader(ui: ReactElement = <SiteHeader />) {
  window.sessionStorage.clear()
  return render(<SiteStateProvider>{ui}</SiteStateProvider>)
}

const mobileMenu = () => document.getElementById("mobile-nav")

describe("<SiteHeader />", () => {
  afterEach(() => {
    nav.pathname = "/"
  })

  it("renders the three navigation groups and the buyer link", () => {
    renderHeader()
    const nav = screen.getByRole("navigation", { name: "Primary navigation" })
    expect(nav).toHaveTextContent("For owners")
    expect(nav).toHaveTextContent("The process")
    expect(nav).toHaveTextContent("The firm")
    expect(screen.getByRole("link", { name: /For buyers/ })).toHaveAttribute("href", "/buyers")
    expect(screen.getByRole("link", { name: /^Sell my business/ })).toHaveAttribute("href", "/how-it-works")
  })

  it("toggles the mobile menu", () => {
    renderHeader()
    const burger = screen.getByTestId("nav-burger")
    expect(burger).toHaveAttribute("aria-expanded", "false")
    fireEvent.click(burger)
    expect(burger).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("link", { name: "Check if my business is ready" })).toHaveAttribute("href", "/score")
    fireEvent.click(burger)
    expect(screen.queryByRole("link", { name: "Check if my business is ready" })).toBeNull()
  })

  it("links the wordmark to the home page", () => {
    renderHeader()
    expect(screen.getByRole("link", { name: "Heirloom home" })).toHaveAttribute("href", "/")
  })

  it("renders every primary nav link with its exact href and note under a popup button", () => {
    renderHeader()
    const primary = screen.getByRole("navigation", { name: "Primary navigation" })
    for (const group of NAV_GROUPS) {
      const trigger = within(primary).getByRole("button", { name: group.label })
      expect(trigger).toHaveAttribute("aria-haspopup", "true")
      for (const link of group.links) {
        const anchor = within(primary).getByText(link.label).closest("a")
        expect(anchor, link.label).not.toBeNull()
        expect(anchor, link.label).toHaveAttribute("href", link.href)
        expect(within(anchor!).getByText(link.note)).toBeInTheDocument()
      }
    }
    expect(within(primary).getAllByRole("button")).toHaveLength(NAV_GROUPS.length)
    expect(within(primary).getAllByRole("link")).toHaveLength(NAV_GROUPS.flatMap((g) => g.links).length + 1)
  })

  it("sizes each dropdown to its configured minimum width", () => {
    renderHeader()
    const primary = screen.getByRole("navigation", { name: "Primary navigation" })
    for (const group of NAV_GROUPS) {
      const firstLink = group.links[0]!
      const menu = within(primary).getByText(firstLink.label).closest("a")!.parentElement as HTMLElement
      expect(menu.style.minWidth, group.label).toBe(`${group.minWidth}px`)
    }
  })

  it("shows the advisor call to action in the header bar", () => {
    renderHeader()
    const cta = screen.getByTestId("open-advisor")
    expect(cta.tagName).toBe("BUTTON")
    expect(cta).toHaveTextContent("Talk to an M&A advisor")
  })

  it("labels the menu button for its current state and points it at the menu region", () => {
    renderHeader()
    const burger = screen.getByTestId("nav-burger")
    expect(burger).toHaveAttribute("aria-label", "Open navigation menu")
    expect(burger).toHaveAttribute("aria-controls", "mobile-nav")
    expect(mobileMenu()).toBeNull()
    fireEvent.click(burger)
    expect(burger).toHaveAttribute("aria-label", "Close navigation menu")
    expect(mobileMenu()).not.toBeNull()
  })

  it("renders the mobile links in order with their hrefs and mutes only the buyers entry", () => {
    renderHeader()
    fireEvent.click(screen.getByTestId("nav-burger"))
    const links = within(mobileMenu()!).getAllByRole("link")
    expect(links.map((l) => l.textContent)).toEqual(MOBILE_NAV_LINKS.map((l) => l.label))
    expect(links.map((l) => l.getAttribute("href"))).toEqual(MOBILE_NAV_LINKS.map((l) => l.href))
    expect(links.map((l) => l.textContent)).toEqual([
      "Sell my business",
      "Review my offer",
      "Check if my business is ready",
      "Fees",
      "Confidentiality",
      "Who we are",
      "Questions",
      "Why Heirloom",
      "For buyers",
    ])
    for (const link of links) {
      const muted = link.textContent === "For buyers"
      expect(link.className.includes("text-l3"), link.textContent ?? "").toBe(muted)
    }
    expect(links.at(-1)).toHaveAttribute("href", "/buyers")
  })

  it("closes the mobile menu when one of its links is clicked", () => {
    // jsdom cannot navigate; cancel the anchor's default action while still letting React's onClick run.
    const stopNavigation = (e: Event) => e.preventDefault()
    document.addEventListener("click", stopNavigation)
    try {
      renderHeader()
      fireEvent.click(screen.getByTestId("nav-burger"))
      fireEvent.click(within(mobileMenu()!).getByRole("link", { name: "Fees" }))
      expect(mobileMenu()).toBeNull()
      expect(screen.getByTestId("nav-burger")).toHaveAttribute("aria-expanded", "false")
    } finally {
      document.removeEventListener("click", stopNavigation)
    }
  })

  it("opens the advisor dialog from the mobile menu and closes the menu", () => {
    renderHeader(
      <>
        <SiteHeader />
        <AdvisorDialog />
      </>
    )
    expect(screen.queryByRole("dialog")).toBeNull()
    fireEvent.click(screen.getByTestId("nav-burger"))
    fireEvent.click(within(mobileMenu()!).getByRole("button", { name: "Talk to an M&A advisor" }))
    expect(screen.getByRole("dialog", { name: "Talk to an M&A advisor" })).toBeInTheDocument()
    expect(
      within(screen.getByTestId("advisor-dialog")).getByText("Where should the conversation start?")
    ).toBeInTheDocument()
    expect(mobileMenu()).toBeNull()
  })

  it("closes the mobile menu when the pathname changes", () => {
    const { rerender } = renderHeader()
    fireEvent.click(screen.getByTestId("nav-burger"))
    expect(mobileMenu()).not.toBeNull()
    nav.pathname = "/fees"
    rerender(
      <SiteStateProvider>
        <SiteHeader />
      </SiteStateProvider>
    )
    expect(mobileMenu()).toBeNull()
    expect(screen.getByTestId("nav-burger")).toHaveAttribute("aria-expanded", "false")
  })

  it("keeps the mobile menu open on a re-render with the same pathname", () => {
    const { rerender } = renderHeader()
    fireEvent.click(screen.getByTestId("nav-burger"))
    rerender(
      <SiteStateProvider>
        <SiteHeader />
      </SiteStateProvider>
    )
    expect(mobileMenu()).not.toBeNull()
  })
})
