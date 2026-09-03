import { screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SiteFooter } from "@/components/site/layout/SiteFooter"
import { CONTACT, FOOTER_GROUPS } from "@/lib/site/routes"
import { renderWithSite } from "./test-utils"

describe("<SiteFooter />", () => {
  it("links the wordmark home, makes the email clickable, and shows the current year", () => {
    renderWithSite(<SiteFooter />)
    expect(screen.getByRole("link", { name: "Heirloom home" })).toHaveAttribute("href", "/")
    expect(screen.getByRole("link", { name: CONTACT.hello })).toHaveAttribute("href", `mailto:${CONTACT.hello}`)
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} Heirloom`))).toBeInTheDocument()
  })

  it("renders every footer link with its route", () => {
    renderWithSite(<SiteFooter />)
    const nav = screen.getByRole("navigation", { name: "Footer" })
    for (const group of FOOTER_GROUPS) {
      for (const link of group.links) {
        expect(within(nav).getByRole("link", { name: link.label })).toHaveAttribute("href", link.href)
      }
    }
    expect(within(nav).getByRole("link", { name: "Get Heirloom Verified" })).toHaveAttribute(
      "href",
      "/buyers#buyer-register"
    )
  })
})
