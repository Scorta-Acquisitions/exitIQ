import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Button } from "@/components/site/ui/Button"
import { Disclosure } from "@/components/site/ui/Disclosure"
import { TextLink } from "@/components/site/ui/TextLink"

/**
 * Hover colour is one global rule (`a:hover` in styles/site.css, checked in lib/site/__tests__/site-css.test.ts).
 * Links therefore carry no per-element hover class; only non-link text opts in with `hover-green`.
 */
describe("hover colour", () => {
  it("links carry no hover classes of their own", () => {
    render(
      <>
        <TextLink href="/fees">Light</TextLink>
        <TextLink href="https://example.com" tone="dark">
          Dark
        </TextLink>
      </>
    )
    for (const name of ["Light", "Dark"]) {
      expect(screen.getByRole("link", { name }).className).not.toMatch(/hover|glow/)
    }
  })

  it("buttons opt in with hover-green on paper and hover-green-dark on green surfaces", () => {
    render(
      <>
        <Button href="/fees">Brand</Button>
        <Button variant="cta" onClick={vi.fn()}>
          Cream
        </Button>
        <Button variant="outline" onClick={vi.fn()}>
          Outline
        </Button>
        <Button variant="outline-plain" onClick={vi.fn()}>
          Plain
        </Button>
        <Button variant="outline-dark" onClick={vi.fn()}>
          Outline dark
        </Button>
        <Button variant="pill-dark" onClick={vi.fn()}>
          Pill dark
        </Button>
        <Button variant="pill-light" onClick={vi.fn()}>
          Pill light
        </Button>
      </>
    )
    expect(screen.getByRole("link", { name: "Brand" })).toHaveClass("hover-green-dark")
    expect(screen.getByRole("button", { name: "Outline dark" })).toHaveClass("hover-green-dark")
    expect(screen.getByRole("button", { name: "Pill dark" })).toHaveClass("hover-green-dark")
    for (const name of ["Cream", "Outline", "Plain", "Pill light"]) {
      const el = screen.getByRole("button", { name })
      expect(el).toHaveClass("hover-green")
      expect(el).not.toHaveClass("hover-green-dark")
    }
    for (const el of screen.getAllByRole("button")) expect(el.className).not.toMatch(/glow|text-shadow/)
  })

  it("accordion rows recolour as a whole so the question text inherits the hover colour", () => {
    render(
      <Disclosure question="Why?" open={false} onToggle={vi.fn()} questionClassName="text-[17px]">
        Because.
      </Disclosure>
    )
    const row = screen.getByRole("button", { name: /Why\?/ })
    expect(row).toHaveClass("hover-green")
    expect(screen.getByText("Why?").className).not.toMatch(/\btext-(ink|l\d|d\d)\b|glow/)
  })
})
