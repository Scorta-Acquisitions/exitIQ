import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DemoSection } from "@/components/site/demo/DemoSection"
import type { DemoWords } from "@/lib/site/demo/chrome"

/** The words of the three home demos, each a few words beside its screen. */
const WORDS: Record<string, DemoWords & { link: { href: string; label: string } }> = {
  financial: {
    heading: "Financial preparation",
    sentence:
      "Before any buyer sees the business, we reconcile the books, tax returns, and payroll. Buyers, lenders, and diligence all get the same figures.",
    link: { href: "/how-it-works#financial-preparation", label: "How the reconciliation works" },
  },
  privacy: {
    heading: "Who sees what",
    sentence:
      "Buyers start with an anonymous overview. They learn your name after signing an NDA and see detailed records only after we qualify them.",
    link: { href: "/confidentiality", label: "The six levels" },
  },
  decisions: {
    heading: "You make four decisions. We run the rest.",
    sentence:
      "Eight stages take a company from preparation to closing. Heirloom carries all eight, and brings you the four decisions only an owner can make.",
    link: { href: "/how-it-works#stages", label: "The eight stages" },
  },
}

function renderSection(key: keyof typeof WORDS = "financial") {
  const w = WORDS[key]!
  return render(
    <DemoSection
      id={`${key}-demo-section`}
      tone="light"
      heading={w.heading}
      sentence={w.sentence}
      link={w.link}
      testid={`${key}-section`}
    >
      <div data-testid="screen">the software</div>
    </DemoSection>
  )
}

describe("DemoSection", () => {
  it("is one anchored tile carrying the section's id, tone and testid", () => {
    renderSection("financial")
    const tile = screen.getByTestId("financial-section")
    expect(tile.tagName).toBe("SECTION")
    expect(tile).toHaveAttribute("id", "financial-demo-section")
    expect(tile).toHaveClass("anchor-target", "on-light", "bg-canvas", "tile")
    expect(tile).toHaveAttribute("data-tone", "light")
  })

  it("reads the heading as the section's one h2, then the sentence, with no eyebrow above it", () => {
    renderSection("financial")
    const heading = screen.getByRole("heading", { level: 2 })
    expect(heading).toHaveTextContent("Financial preparation")
    expect(heading).toHaveClass("type-display-lg", "text-fg")
    expect(heading).not.toHaveClass("mt-3")
    expect(heading.parentElement!.firstElementChild).toBe(heading)
    expect(document.querySelectorAll(".type-caption-strong")).toHaveLength(0)
    expect(
      screen.getByText(
        "Before any buyer sees the business, we reconcile the books, tax returns, and payroll. Buyers, lenders, and diligence all get the same figures."
      )
    ).toHaveClass("type-body", "text-fg-2")
  })

  it("carries one link, with the 44px hit area a standalone link gets", () => {
    renderSection("decisions")
    const links = screen.getAllByRole("link")
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveTextContent("The eight stages")
    expect(links[0]).toHaveAttribute("href", "/how-it-works#stages")
    expect(links[0]).toHaveClass("text-link", "min-h-11")
  })

  it("holds no call to action of its own: the demo is the argument", () => {
    renderSection("financial")
    expect(screen.queryAllByRole("button")).toHaveLength(0)
    expect(screen.queryByText(/advisor/i)).toBeNull()
  })

  it("puts the words in the first column and the screen in the second, stacking under the tablet breakpoint", () => {
    const { container } = renderSection("financial")
    const grid = container.querySelector(".tab\\:grid")
    expect(grid).not.toBeNull()
    expect(grid).toHaveClass("tab:grid-cols-[300px_minmax(0,1fr)]", "tab:gap-12", "max-w-[980px]")
    const columns = Array.from(grid!.children)
    expect(columns).toHaveLength(2)
    expect(within(columns[0] as HTMLElement).getByRole("heading", { level: 2 })).toBeInTheDocument()
    expect(columns[1]).toHaveClass("mt-8", "tab:mt-0")
    expect(within(columns[1] as HTMLElement).getByTestId("screen")).toHaveTextContent("the software")
  })
})
