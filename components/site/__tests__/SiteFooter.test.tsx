import { screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { SiteFooter } from "@/components/site/layout/SiteFooter"
import { CONTACT, FOOTER_GROUPS } from "@/lib/site/routes"
import { renderWithSite } from "./test-utils"

describe("<SiteFooter />", () => {
  afterEach(() => vi.useRealTimers())

  it("is the parchment tile with 64px of padding, on the light token context, and carries no shadow", () => {
    renderWithSite(<SiteFooter />)
    const footer = screen.getByRole("contentinfo")
    // `on-light` re-points the contextual tokens, which is what colours the footer's primary pill.
    expect(footer).toHaveClass("on-light", "bg-canvas-parchment", "py-16", "border-t", "border-line")
    // The product shadow is reserved for imagery; the design-system guard permits it, so the tile pins its absence.
    expect(footer.className).not.toMatch(/shadow/)
  })

  it("links the horizontal lockup home in ink at a 24px mark, drawn once and never animated, and keeps the email out", () => {
    renderWithSite(<SiteFooter />)
    const home = screen.getByRole("link", { name: "Heirloom home" })
    expect(home).toHaveAttribute("href", "/")
    expect(home).toHaveClass("text-heirloom")
    // The word appears twice in the link: once for readers (sr-only) and once drawn, aria-hidden, in the lockup.
    const [srName, drawn] = within(home).getAllByText("Heirloom")
    expect(srName).toHaveClass("sr-only")
    expect(drawn).toHaveAttribute("data-testid", "brand-wordmark")
    const lockup = within(home).getByTestId("brand-lockup")
    expect(lockup).toHaveAttribute("data-variant", "horizontal")
    // markHeight 24: the mark's own svg and the word's 23.57px are the footer's size, not the bar's 28.
    expect(lockup.querySelector("svg")).toHaveAttribute("height", "24")
    expect(drawn!.getAttribute("style")).toBe("font-size: 23.57px;")
    // The mark-in reveal runs on the bar's lockup alone.
    expect(lockup.outerHTML).not.toContain("animate-")
    expect(home.querySelectorAll("img")).toHaveLength(0)
    expect(screen.queryByRole("link", { name: /@/ })).toBeNull()
    expect(screen.queryByText(CONTACT.hello)).toBeNull()
  })

  it("prints the copyright line for the year on the clock", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2031-04-02T12:00:00Z"))
    renderWithSite(<SiteFooter />)
    expect(screen.getByText(/^© 2031 Heirloom\. All rights reserved\./)).toHaveTextContent(
      "Heirloom provides M&A advisory services in the United States."
    )
  })

  it("renders every footer link with its route in the dense-link style under a caption heading", () => {
    renderWithSite(<SiteFooter />)
    const nav = screen.getByRole("navigation", { name: "Footer" })
    for (const group of FOOTER_GROUPS) {
      expect(within(nav).getByText(group.label)).toHaveClass("type-caption-strong")
      for (const link of group.links) {
        const a = within(nav).getByRole("link", { name: link.label })
        expect(a).toHaveAttribute("href", link.href)
        expect(a).toHaveClass("type-dense-link")
      }
    }
    expect(within(nav).getAllByRole("list")).toHaveLength(FOOTER_GROUPS.length)
    expect(within(nav).getByRole("link", { name: "Get Heirloom Verified" })).toHaveAttribute(
      "href",
      "/buyers#buyer-register"
    )
  })

  it("carries the advisor call to action as the primary pill and the legal row as fine print", () => {
    renderWithSite(<SiteFooter />)
    const cta = screen.getByTestId("open-advisor")
    expect(cta).toHaveTextContent("Talk to an M&A advisor")
    expect(cta).toHaveClass("bg-primary", "rounded-pill", "type-body")
    const legal = screen.getByText(/Heirloom works for sellers only\./).parentElement
    expect(legal).toHaveClass("type-fine-print", "text-ink-muted-48")
    expect(legal).toHaveTextContent("Worked examples, including Project Ridgeline, use fictional companies")
  })
})
