import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { AdvisorDialog } from "@/components/site/advisor/AdvisorDialog"
import { CloseSection } from "@/components/site/home/CloseSection"
import { QuestionsTeaser } from "@/components/site/home/QuestionsTeaser"
import { TransactionCarries } from "@/components/site/home/TransactionCarries"
import { FounderPortrait } from "@/components/site/who-we-are/FounderPortrait"
import { HOME_TEASER } from "@/lib/site/questions/data"
import { ROUTES } from "@/lib/site/routes"
import { installSceneDrivers, pinViewport, restoreMatchMedia, type SceneDrivers, setRect } from "./scene-test-utils"
import { renderWithSite } from "./test-utils"

/** The full-bleed tile a section renders as, identified by the tone it declares. */
function tileOf(container: HTMLElement): HTMLElement {
  const tile = container.querySelector("section[data-tone]")
  expect(tile).not.toBeNull()
  return tile as HTMLElement
}

/** A controllable playback model for a scrub film: its `duration` and every `currentTime` it was asked for. */
function mediaModel(video: HTMLVideoElement, duration: number) {
  const state = { currentTime: 0, seeks: [] as number[], duration }
  Object.defineProperty(video, "duration", { configurable: true, get: () => state.duration })
  Object.defineProperty(video, "currentTime", {
    configurable: true,
    get: () => state.currentTime,
    set: (t: number) => {
      state.currentTime = t
      state.seeks.push(t)
    },
  })
  return state
}

const SEAL_LABEL = "A brass Heirloom seal presses a cream wax seal on a deep green desk."

describe("<CloseSection />", () => {
  const CARDS: Array<[string, string, string]> = [
    ["Review my offer", "Offer in hand", ROUTES.offerReview],
    ["Check sale readiness", "Still deciding", ROUTES.score],
    ["See how it works", "The process", ROUTES.howItWorks],
  ]

  it("renders three route cards on a light tile", () => {
    const { container } = renderWithSite(<CloseSection />)
    expect(screen.getAllByRole("link")).toHaveLength(3)
    expect(tileOf(container)).toHaveAttribute("data-tone", "light")
  })

  it.each(CARDS)("routes the %s card (%s) to %s", (title, eyebrow, href) => {
    renderWithSite(<CloseSection />)
    const link = screen.getByText(title).closest("a")
    expect(link).toHaveAttribute("href", href)
    expect(within(link as HTMLElement).getByText(eyebrow)).toBeInTheDocument()
    // Each route is itself the hairline card (no wrapper) and takes the accent on hover.
    expect(link).toHaveClass("hover:text-accent", "bg-surface", "border-line", "rounded-lg", "border", "p-6")
    expect(link?.parentElement).toHaveClass("grid")
  })

  it("opens the advisor dialog from the first card", () => {
    renderWithSite(
      <>
        <CloseSection />
        <AdvisorDialog />
      </>
    )
    expect(screen.queryByTestId("advisor-dialog")).toBeNull()
    const trigger = screen.getByRole("button", { name: /Talk to an M&A advisor/ })
    expect(trigger).toHaveAttribute("data-testid", "open-advisor")
    expect(trigger).toHaveClass("hover:text-accent", "bg-surface", "border-line", "rounded-lg", "border", "p-6")
    expect(trigger.parentElement).toHaveClass("grid")
    fireEvent.click(trigger)
    expect(screen.getByTestId("advisor-dialog")).toBeInTheDocument()
  })

  it("headlines the section with the next-step heading and no footnote below the cards", () => {
    const { container } = renderWithSite(<CloseSection />)
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Choose a next step.")
    expect(container.querySelectorAll("section > div > p")).toHaveLength(0)
  })

  it("sets the seal film and the headline side by side above the cards, 400px columns that stack on phones", () => {
    renderWithSite(<CloseSection />)
    const figure = screen.getByTestId("seal-film")
    const heading = screen.getByRole("heading", { level: 2 })
    const pair = figure.parentElement as HTMLElement
    expect(pair).toHaveClass("grid", "items-center", "gap-x-12", "gap-y-10")
    expect(pair.className).toContain("grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))]")
    expect(Array.from(pair.children)).toEqual([figure, heading])
    expect(heading).toHaveClass("type-display-lg", "text-fg", "max-w-[692px]")
    const cards = pair.nextElementSibling as HTMLElement
    expect(cards).toHaveClass("mt-10", "grid")
    expect(cards.children).toHaveLength(4)
    expect(cards).toContainElement(screen.getByTestId("open-advisor"))
  })

  describe("seal film", () => {
    let drivers: SceneDrivers
    beforeEach(() => {
      drivers = installSceneDrivers()
      pinViewport(1000)
    })
    afterEach(() => {
      drivers.restore()
      pinViewport(768)
      restoreMatchMedia()
    })

    /** Mount the close, give the film a 10-second duration, and hand back the frame and the video. */
    function mount(duration = 10) {
      renderWithSite(<CloseSection />)
      const figure = screen.getByTestId("seal-film")
      const video = screen.getByTestId("scrub-video") as HTMLVideoElement
      const media = mediaModel(video, duration)
      return { figure, video, media }
    }

    /** Scroll the frame so its top sits at `top` in a 1000px viewport, then run one scene frame. */
    function scrollFrameTo(figure: HTMLElement, top: number, height = 500) {
      setRect(figure, { top, height })
      act(() => {
        drivers.intersect(figure, true)
        drivers.flushFrames()
      })
    }

    it("frames the film as a 16:9 figure on the deep green with the product shadow and the 18px radius", () => {
      const { figure, video } = mount()
      expect(figure.tagName).toBe("FIGURE")
      expect(figure).toHaveClass(
        "relative",
        "m-0",
        "aspect-video",
        "w-full",
        "overflow-hidden",
        "rounded-lg",
        "shadow-product",
        "bg-tile-1"
      )
      expect(figure.className).not.toMatch(/border|gradient/)
      expect(figure.children).toHaveLength(1)
      expect(figure.firstElementChild).toBe(video)
      expect(video).toHaveClass("absolute", "inset-0", "h-full", "w-full", "object-cover")
    })

    it("describes the film for assistive technology and shows the poster until the source is attached", () => {
      const { video } = mount()
      expect(screen.getByRole("img", { name: SEAL_LABEL })).toBe(video)
      expect(video).toHaveAttribute("poster", "/media/seal-press-poster.jpg")
      expect(video).toHaveAttribute("preload", "none")
      expect(video.muted).toBe(true)
      expect(video).not.toHaveAttribute("src")
      act(() => drivers.intersect(video, true))
      expect(video).toHaveAttribute("src", "/media/seal-press.mp4")
    })

    it("scrubs the film by how far the frame has risen into the viewport, seeking nothing before it appears", () => {
      const { figure, video, media } = mount(10)
      act(() => drivers.intersect(video, true))
      fireEvent(video, new Event("loadedmetadata"))
      // Top at the bottom edge of the viewport: progress 0, and the film already sits on frame 0.
      scrollFrameTo(figure, 1000)
      expect(media.seeks).toEqual([])
      // 500px frame with its top at 575: (1000 - 575) / (500 + 350) = 0.5 → second 5 of a 10s film.
      scrollFrameTo(figure, 575)
      expect(media.seeks).toEqual([5])
      fireEvent(video, new Event("seeked"))
      // Bottom at 65% of the viewport: (1000 - 150) / 850 = 1 → the last frame.
      scrollFrameTo(figure, 150)
      expect(media.seeks).toEqual([5, 10])
      fireEvent(video, new Event("seeked"))
      // Risen further still: progress stays clamped at 1, so no further seek is issued.
      scrollFrameTo(figure, -200)
      expect(media.seeks).toEqual([5, 10])
    })

    it("drops the film and keeps the frame when the source fails to load", () => {
      const { figure, video } = mount()
      act(() => drivers.intersect(video, true))
      fireEvent.error(video)
      expect(screen.queryByTestId("scrub-video")).toBeNull()
      expect(figure).toBeInTheDocument()
      expect(figure).toHaveClass("bg-tile-1", "aspect-video")
      expect(screen.getAllByRole("link")).toHaveLength(3)
    })
  })

  it("sets each card on the card-grid recipe: tagline title over a body-size line", () => {
    renderWithSite(<CloseSection />)
    const bodies = [
      "Ask whether Heirloom fits your business and timing.",
      "A free read of the cash, terms, and missing items.",
      "Seven questions, then findings and a 90-day plan.",
      "The eight stages from preparation to closing.",
    ]
    for (const body of bodies) {
      const line = screen.getByText(body)
      expect(line).toHaveClass("type-body", "text-fg-2", "mt-2", "block")
      expect(line).not.toHaveClass("type-caption")
      expect(line.previousElementSibling).toHaveClass("type-tagline")
    }
  })
})

describe("<FounderPortrait />", () => {
  it("serves the portrait at the column's own width: the full viewport on phones, 400px above 720", () => {
    render(<FounderPortrait />)
    expect(screen.getByRole("img", { name: "Suyash Agrawal, founder and CEO of Heirloom" })).toHaveAttribute(
      "sizes",
      "(max-width: 720px) 100vw, 400px"
    )
  })

  it("frames the photograph with the 18px radius and the product shadow, never an inline radius", () => {
    const { container } = render(<FounderPortrait />)
    const frame = container.firstElementChild as HTMLElement
    expect(frame).toHaveClass("rounded-lg", "overflow-hidden", "shadow-product", "bg-surface-2")
    expect(frame.style.borderRadius).toBe("")
  })
})

describe("<TransactionCarries />", () => {
  it("links Why Heirloom exists to /why as a 44px standalone text link that inherits the dark tile's accent", () => {
    render(<TransactionCarries />)
    const link = screen.getByRole("link", { name: "Why Heirloom exists" })
    expect(link).toHaveAttribute("href", ROUTES.why)
    expect(Array.from(link.classList)).toEqual(["text-link", "inline-flex", "min-h-11", "items-center"])
    expect(link).not.toHaveClass("text-ink")
    expect(link.parentElement).toHaveClass("mt-3", "-mb-3")
  })

  it("puts the 24px gutter on the tile so the copy locks to the same 980 edge as the tiles around it", () => {
    const { container } = render(<TransactionCarries />)
    const tile = tileOf(container)
    expect(tile).toHaveClass("px-6")
    const column = screen.getByRole("heading", { level: 2 }).closest(".max-w-\\[980px\\]") as HTMLElement
    expect(column).toHaveClass("mx-auto", "tile", "relative")
    expect(column).not.toHaveClass("px-6")
  })

  it("describes the ambient video for assistive technology", () => {
    render(<TransactionCarries />)
    expect(
      screen.getByRole("img", { name: "Private business records prepared for a confidential ownership transfer." })
    ).toBe(screen.getByTestId("ambient-video"))
  })

  it("holds the film's own first frame as the poster, which is what a reduced-motion visitor sees", () => {
    render(<TransactionCarries />)
    const video = screen.getByTestId("ambient-video")
    expect(video).not.toHaveAttribute("src")
    expect(video).toHaveAttribute("poster", "/media/archive-hall-poster.jpg")
  })

  it("sets the video at half opacity on the darkest tile with no veil or gradient over it", () => {
    const { container } = render(<TransactionCarries />)
    const tile = tileOf(container)
    expect(tile).toHaveAttribute("data-tone", "dark-3")
    expect(tile).toHaveClass("min-h-[420px]")
    const video = screen.getByTestId("ambient-video")
    expect(video).toHaveClass("opacity-30", "object-cover")
    expect(video.parentElement).toBe(tile)
    expect(tile.querySelector("[class*='gradient']")).toBeNull()
    expect(tile.querySelectorAll(":scope > [aria-hidden='true']")).toHaveLength(0)
  })

  it("headlines what changes hands", () => {
    render(<TransactionCarries />)
    expect(
      screen.getByRole("heading", { level: 2, name: "Employees, customers, and the company name change hands too." })
    ).toBeInTheDocument()
  })

  it("sets the caption in full-strength ink so it clears the film's frosted-window region", () => {
    render(<TransactionCarries />)
    const caption = screen.getByText("We weigh them in buyer selection and negotiation, alongside price.")
    expect(caption.tagName).toBe("P")
    // fg-2 over the half-opacity film measured about 3.1:1; full fg is what keeps the line legible.
    expect(caption).toHaveClass("type-body", "text-fg", "mt-4")
    expect(caption).not.toHaveClass("text-fg-2")
    expect(caption.previousElementSibling).toBe(screen.getByRole("heading", { level: 2 }))
  })
})

describe("<QuestionsTeaser />", () => {
  it("renders the five teaser questions collapsed on a parchment tile", () => {
    const { container } = render(<QuestionsTeaser />)
    expect(tileOf(container)).toHaveAttribute("data-tone", "parchment")
    expect(HOME_TEASER).toHaveLength(5)
    const buttons = screen.getAllByRole("button")
    expect(buttons.map((b) => b.textContent)).toEqual(HOME_TEASER.map((qa) => `${qa.q}+`))
    for (const b of buttons) {
      expect(b).toHaveAttribute("aria-expanded", "false")
      // Disclosure's own body-strong question, as on the questions page.
      expect(b.firstElementChild).toHaveClass("type-body-strong")
      expect(b.firstElementChild).not.toHaveClass("type-tagline")
    }
    for (const qa of HOME_TEASER) expect(screen.getByText(qa.a)).not.toBeVisible()
  })

  it("stacks the five rows in one reading column under a top hairline, never a two-column grid", () => {
    render(<QuestionsTeaser />)
    const list = screen.getAllByRole("button")[0]!.parentElement!.parentElement!
    expect(list).toHaveClass("border-t", "border-line", "mt-8", "max-w-[692px]")
    expect(list).not.toHaveClass("grid")
    expect(list.children).toHaveLength(HOME_TEASER.length)
  })

  it("expands one answer and shows its text", () => {
    render(<QuestionsTeaser />)
    const first = HOME_TEASER[0]!
    fireEvent.click(screen.getByRole("button", { name: first.q }))
    expect(screen.getByRole("button", { name: first.q })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText(first.a)).toBeVisible()
    expect(screen.getByText(first.a)).toHaveClass("type-body", "text-fg-2")
  })

  it("keeps only one answer open at a time", () => {
    render(<QuestionsTeaser />)
    const [first, second] = [HOME_TEASER[0]!, HOME_TEASER[1]!]
    fireEvent.click(screen.getByRole("button", { name: first.q }))
    fireEvent.click(screen.getByRole("button", { name: second.q }))
    expect(screen.getByRole("button", { name: first.q })).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByRole("button", { name: second.q })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText(first.a)).not.toBeVisible()
    expect(screen.getByText(second.a)).toBeVisible()
  })

  it("collapses an open answer when its question is clicked again", () => {
    render(<QuestionsTeaser />)
    const first = HOME_TEASER[0]!
    const button = screen.getByRole("button", { name: first.q })
    fireEvent.click(button)
    fireEvent.click(button)
    expect(button).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByText(first.a)).not.toBeVisible()
  })

  it("links See all questions to /questions as a 44px standalone link", () => {
    render(<QuestionsTeaser />)
    const link = screen.getByRole("link", { name: "See all questions" })
    expect(link).toHaveAttribute("href", ROUTES.questions)
    expect(Array.from(link.classList)).toEqual(["text-link", "inline-flex", "min-h-11", "items-center"])
    expect(link.parentElement).toHaveClass("mt-3", "-mb-3")
  })
})
