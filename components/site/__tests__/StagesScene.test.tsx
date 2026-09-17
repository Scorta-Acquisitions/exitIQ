import { act, fireEvent, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { useAdvisor } from "@/components/site/providers/SiteStateProvider"
import { StagesScene } from "@/components/site/scenes/StagesScene"
import { SALE_STAGES } from "@/lib/site/content/stages"
import {
  driveScene,
  installSceneDrivers,
  pinViewport,
  restoreMatchMedia,
  type SceneDrivers,
  stubMatchMedia,
} from "./scene-test-utils"
import { renderWithSite } from "./test-utils"

/** The travertine film runs ten seconds, so progress p shows the frame at 10p seconds. */
const FILM_S = 10

/** A controllable playback model for the film: its `duration` and every `currentTime` the scene requests. */
function mediaModel(video: HTMLVideoElement, duration: number) {
  const state = { currentTime: 0, seeks: [] as number[] }
  Object.defineProperty(video, "duration", { configurable: true, get: () => duration })
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

/** Bring the film on screen so its source attaches, then deliver its metadata. Returns the seek log. */
function readyFilm(drivers: SceneDrivers, film: HTMLVideoElement, duration = FILM_S) {
  const media = mediaModel(film, duration)
  act(() => drivers.intersect(film, true))
  fireEvent(film, new Event("loadedmetadata"))
  return media
}

function AdvisorProbe() {
  const { advisor } = useAdvisor()
  return <output data-testid="advisor-open">{String(advisor.open)}</output>
}

const nodeStates = () => SALE_STAGES.map((_, i) => screen.getByTestId(`stage-node-${i}`).getAttribute("data-state"))
const node = (i: number) => screen.getByTestId(`stage-node-${i}`)
const panel = (i: number) => screen.getByTestId(`stage-panel-${i}`)
const rail = (container: HTMLElement) => container.querySelector('[class~="transition-[width]"]') as HTMLElement
const chip = (artifact: string) => screen.getByText(artifact)
const hint = () => screen.getByText("Scroll to move through the stages.")
const film = () => screen.getByTestId("scrub-video") as HTMLVideoElement
const filmFrame = () => screen.getByTestId("stages-film")
/** The grid classes every stage panel and the film overlay share, so the film lands in the slip column. */
const PANEL_GRID = [
  "grid-cols-[repeat(auto-fit,minmax(min(100%,max(270px,44%)),1fr))]",
  "content-center-safe",
  "items-center",
  "gap-x-10",
  "gap-y-5",
]
/**
 * The "YOU RECEIVE" slip of stage `i`: the card directly around its label. The e2e suite measures one level
 * further up (the grid cell), which shares the card's box.
 */
const slip = (i: number) => within(panel(i)).getByText("YOU RECEIVE").parentElement as HTMLElement

describe("<StagesScene />", () => {
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

  it("is a full-bleed dark tile 460vh tall with no padding of its own", () => {
    renderWithSite(<StagesScene />)
    const scene = screen.getByTestId("stages-scene")
    expect(scene).toHaveAttribute("data-tone", "dark")
    expect(scene).toHaveClass("on-dark")
    expect(scene).toHaveClass("bg-tile-1")
    expect(scene).toHaveClass("h-[460vh]")
    expect(scene).not.toHaveClass("tile")
    expect(scene.className).not.toMatch(/\bp[xt]-/)
  })

  it("pins the scene root's first child under the bar with the one scene-pin utility and clips its overflow", () => {
    renderWithSite(<StagesScene />)
    const panelEl = screen.getByTestId("stages-scene").firstElementChild as HTMLElement
    expect(panelEl).toHaveClass("scene-pin")
    expect(panelEl).toHaveClass("overflow-hidden")
    expect(panelEl).not.toHaveClass("sticky")
    expect(panelEl.className).not.toMatch(/rounded|border|shadow/)
  })

  it("starts with stage 1 active and the other seven pending", () => {
    renderWithSite(<StagesScene />)
    expect(nodeStates()).toEqual([
      "active",
      "pending",
      "pending",
      "pending",
      "pending",
      "pending",
      "pending",
      "pending",
    ])
  })

  it("draws the nodes as outlined circles: active ringed in the accent, pending on the hairline", () => {
    renderWithSite(<StagesScene />)
    expect(node(0)).toHaveClass("rounded-full")
    expect(node(0)).toHaveClass("border-accent")
    expect(node(0)).toHaveClass("text-accent")
    expect(node(0)).toHaveClass("ring-accent")
    expect(node(0)).toHaveClass("ring-inset")
    expect(node(0)).not.toHaveClass("bg-accent")
    expect(node(1)).toHaveClass("border-line")
    expect(node(1)).toHaveClass("text-fg-3")
    expect(node(1)).not.toHaveClass("ring-accent")
    expect(node(1)).not.toHaveClass("border-accent")
    for (let i = 0; i < SALE_STAGES.length; i++) expect(node(i).className).not.toMatch(/shadow|glow|filament/)
  })

  it("shows stage 1 copy from SALE_STAGES before scrolling", () => {
    renderWithSite(<StagesScene />)
    const s = SALE_STAGES[0]!
    const p = panel(0)
    expect(p).toHaveAttribute("aria-hidden", "false")
    expect(within(p).getByText("STAGE 01 · GOALS")).toBeInTheDocument()
    expect(within(p).getByText("STAGE 01 · GOALS")).toHaveClass("type-caption-strong")
    expect(within(p).getByText("STAGE 01 · GOALS")).toHaveClass("text-accent")
    expect(within(p).getByText("STAGE 01 · GOALS").tagName).toBe("DIV")
    expect(within(p).getByRole("heading", { level: 3 })).toHaveTextContent(s.title)
    expect(within(p).getByRole("heading", { level: 3 })).toHaveClass("type-display-md")
    // The line of what Heirloom does is prefixed by the label, then the stage's own sentence.
    expect(within(p).getByText("HEIRLOOM ·")).toHaveClass("type-caption-strong")
    expect(within(p).getByText("HEIRLOOM ·").nextSibling?.textContent).toBe(s.heirloom)
    expect(within(p).getByText(s.heirloom)).toBeInTheDocument()
    expect(within(p).getByText(s.you)).toBeInTheDocument()
    expect(within(p).getByText(s.receive)).toBeInTheDocument()
    expect(panel(1)).toHaveAttribute("aria-hidden", "true")
  })

  it("marks the seller's part with an outlined YOU pill and prints what they receive on a plain compact card", () => {
    renderWithSite(<StagesScene />)
    const you = within(panel(0)).getByText("YOU")
    expect(you).toHaveClass("rounded-pill")
    expect(you).toHaveClass("border-line")
    expect(you).toHaveClass("type-caption-strong")
    expect(you.className).not.toMatch(/\bbg-/)
    const card = slip(0)
    // A plain card on the dark tile: the next tile shade, not an inverted white slab.
    expect(card).toHaveClass("bg-surface")
    expect(card).toHaveClass("p-4")
    expect(card).not.toHaveClass("on-light")
    expect(card).not.toHaveClass("bg-canvas")
    expect(card).not.toHaveClass("p-5")
    expect(card.className).not.toMatch(/shadow|rotate/)
    expect(card.parentElement!.className).not.toMatch(/rotate/)
    // The eyebrow sits directly in the card: no lone-child flex wrapper.
    const eyebrow = within(card).getByText("YOU RECEIVE")
    expect(eyebrow.parentElement).toBe(card)
    expect(card.firstElementChild).toBe(eyebrow)
    expect(card.children).toHaveLength(2)
    expect(eyebrow).toHaveClass("text-accent")
    expect(eyebrow).toHaveClass("type-caption-strong")
    expect(eyebrow.tagName).toBe("SPAN")
    expect(within(card).getByText(SALE_STAGES[0]!.receive)).toHaveClass("type-tagline")
    expect(within(card).getByText(SALE_STAGES[0]!.receive)).toHaveClass("mt-2")
  })

  it("centres the slip on phones and aligns it to the container's right edge from the tablet breakpoint", () => {
    renderWithSite(<StagesScene />)
    const cell = slip(0).parentElement as HTMLElement
    expect(cell).toHaveClass("w-[min(100%,340px)]")
    expect(cell).toHaveClass("justify-self-center")
    expect(cell).toHaveClass("tab:justify-self-end")
    expect(cell.parentElement).toBe(panel(0))
    // Spacer, poster still, card: on a short phone only the card shows, so the cell is as tall as the card.
    expect(cell.children).toHaveLength(3)
    expect(cell.lastElementChild).toBe(slip(0))
    expect(cell.className).not.toMatch(/(^|\s)(pt-|h-)/)
    expect(cell.className.split(" ")).toHaveLength(4)
  })

  it("holds the film's place above every card from the tablet breakpoint with a 16:9 spacer and a 16px gap, in a fixed 350px cell", () => {
    renderWithSite(<StagesScene />)
    for (let i = 0; i < SALE_STAGES.length; i++) {
      const cell = slip(i).parentElement as HTMLElement
      expect(cell).toHaveClass("tab:h-[350px]")
      // The spacer shares the film frame's geometry (16:9 of the 340px cell = 191px) instead of a hard-coded 207px.
      const spacer = cell.firstElementChild as HTMLElement
      expect(spacer.tagName).toBe("DIV")
      expect(spacer).toHaveAttribute("aria-hidden", "true")
      expect(spacer.children).toHaveLength(0)
      expect(spacer.textContent).toBe("")
      for (const cls of ["hidden", "tab:block", "aspect-video", "w-full"]) expect(spacer).toHaveClass(cls)
      expect(spacer.className.split(" ")).toHaveLength(4)
      // The card takes the 16px gap itself, so its top lands exactly where the film's frame ends.
      expect(slip(i)).toHaveClass("tab:mt-4")
      expect(slip(i)).not.toHaveClass("mt-4")
      expect(cell.className).not.toMatch(/pt-\[207px\]/)
      for (const cls of PANEL_GRID) expect(panel(i)).toHaveClass(cls)
      expect(panel(i)).toHaveClass("grid")
    }
  })

  it("shows the film's poster as a still above the card on tall phones only, between the spacer and the card", () => {
    renderWithSite(<StagesScene />)
    for (let i = 0; i < SALE_STAGES.length; i++) {
      const cell = slip(i).parentElement as HTMLElement
      const poster = cell.children[1] as HTMLElement
      expect(poster.tagName).toBe("IMG")
      expect(poster.previousElementSibling).toBe(cell.firstElementChild)
      expect(poster.nextElementSibling).toBe(slip(i))
      expect(decodeURIComponent(poster.getAttribute("src") ?? "")).toContain("/media/stages-path-poster.jpg")
      // Decorative: an empty alt keeps it out of the accessibility tree, matching the aria-hidden film.
      expect(poster).toHaveAttribute("alt", "")
      expect(poster).toHaveAttribute("width", "340")
      expect(poster).toHaveAttribute("height", "191")
      // Hidden by default; shown only when the viewport is at least 780px tall AND below the tablet breakpoint,
      // stacked so a tall desktop (where `tall:` outranks `tab:hidden`) never gets a second poster under the film.
      // Its own mb-4 gives the card the film's 16px gap and vanishes with it on short phones.
      for (const cls of [
        "hidden",
        "tall:max-tab:block",
        "mb-4",
        "aspect-video",
        "w-full",
        "rounded-lg",
        "object-cover",
      ]) {
        expect(poster).toHaveClass(cls)
      }
      expect(poster.className.split(" ")).toHaveLength(7)
      expect(poster).not.toHaveClass("tall:block")
      expect(poster).not.toHaveClass("block")
      expect(poster.className).not.toMatch(/shadow/)
    }
    // Decorative stills are not images to a screen reader: only the film frame's video is aria-hidden as well.
    expect(screen.queryAllByRole("img")).toHaveLength(0)
  })

  it("frames the travertine film once, in the slip column's cell of the same grid, hidden on phones", () => {
    renderWithSite(<StagesScene />)
    const scene = screen.getByTestId("stages-scene")
    expect(scene.querySelectorAll("video")).toHaveLength(1)
    expect(screen.getAllByTestId("stages-film")).toHaveLength(1)
    const frame = filmFrame()
    for (const cls of ["relative", "aspect-video", "overflow-hidden", "rounded-lg"]) expect(frame).toHaveClass(cls)
    expect(frame.className.split(" ")).toHaveLength(4)
    expect(frame.firstElementChild).toBe(film())
    expect(frame.children).toHaveLength(1)
    // The cell around the frame is the slip column; the frame is its only child, so the film sits where the spacers do.
    const cell = frame.parentElement as HTMLElement
    for (const cls of ["w-[min(100%,340px)]", "justify-self-center", "tab:justify-self-end", "tab:h-[350px]"]) {
      expect(cell).toHaveClass(cls)
    }
    expect(cell.className.split(" ")).toHaveLength(4)
    expect(cell.children).toHaveLength(1)
    expect(cell.firstElementChild).toBe(frame)
    // The overlay mirrors the stage grid, spans the panels container, and never takes the pointer.
    const overlay = cell.parentElement as HTMLElement
    expect(overlay).toHaveAttribute("aria-hidden", "true")
    for (const cls of [...PANEL_GRID, "hidden", "tab:grid", "absolute", "inset-0", "pointer-events-none"]) {
      expect(overlay).toHaveClass(cls)
    }
    expect(overlay).not.toHaveClass("grid")
    expect(overlay.children).toHaveLength(2)
    expect(overlay.firstElementChild!.tagName).toBe("DIV")
    expect(overlay.firstElementChild!.children).toHaveLength(0)
    expect(overlay.lastElementChild).toBe(cell)
    expect(overlay.parentElement).toBe(panel(0).parentElement)
    expect(overlay.parentElement).toHaveClass("relative")
    // No stage panel carries a film of its own.
    for (let i = 0; i < SALE_STAGES.length; i++) expect(panel(i).querySelector("video")).toBeNull()
  })

  it("renders the film muted with its poster and attaches the source only when it approaches the viewport", () => {
    renderWithSite(<StagesScene />)
    expect(film()).toHaveAttribute("poster", "/media/stages-path-poster.jpg")
    expect(film()).toHaveAttribute("aria-hidden", "true")
    expect(film()).toHaveAttribute("preload", "none")
    expect(film().muted).toBe(true)
    expect(film()).not.toHaveAttribute("src")
    for (const cls of ["absolute", "inset-0", "h-full", "w-full", "object-cover"]) expect(film()).toHaveClass(cls)
    expect(film().className.split(" ")).toHaveLength(5)
    act(() => drivers.intersect(film(), true))
    expect(film()).toHaveAttribute("src", "/media/stages-path.mp4")
  })

  it("scrubs the film with scroll: progress 0.5 of the ten-second film shows 5s and 0.99 shows 9.9s", () => {
    renderWithSite(<StagesScene />)
    const scene = screen.getByTestId("stages-scene")
    const media = readyFilm(drivers, film())
    expect(media.seeks).toEqual([])
    driveScene(drivers, scene, 0.5)
    expect(media.seeks).toEqual([5])
    expect(nodeStates()[4]).toBe("active")
    fireEvent(film(), new Event("seeked"))
    driveScene(drivers, scene, 0.99)
    expect(media.seeks).toEqual([5, 9.9])
    expect(nodeStates()[7]).toBe("active")
  })

  it("attaches no film source under reduced motion, leaving the poster, while the stages still advance", () => {
    stubMatchMedia(true)
    renderWithSite(<StagesScene />)
    const media = mediaModel(film(), FILM_S)
    expect(drivers.watchers(film())).toBe(0)
    driveScene(drivers, screen.getByTestId("stages-scene"), 0.5)
    expect(film()).not.toHaveAttribute("src")
    expect(film()).toHaveAttribute("poster", "/media/stages-path-poster.jpg")
    expect(media.seeks).toEqual([])
    expect(nodeStates()).toEqual(["done", "done", "done", "done", "active", "pending", "pending", "pending"])
  })

  it("keeps advancing the stages when the film fails to load and removes itself", () => {
    const { container } = renderWithSite(<StagesScene />)
    act(() => drivers.intersect(film(), true))
    fireEvent.error(film())
    expect(screen.queryByTestId("scrub-video")).toBeNull()
    expect(filmFrame().children).toHaveLength(0)
    driveScene(drivers, screen.getByTestId("stages-scene"), 0.5)
    expect(nodeStates()[4]).toBe("active")
    expect(rail(container).style.width).toBe("50%")
  })

  it("marks stages 1-4 done and stage 5 active at progress 0.5", () => {
    renderWithSite(<StagesScene />)
    driveScene(drivers, screen.getByTestId("stages-scene"), 0.5)
    expect(nodeStates()).toEqual(["done", "done", "done", "done", "active", "pending", "pending", "pending"])
    expect(node(0)).toHaveClass("bg-accent")
    expect(node(0)).toHaveClass("border-accent")
    expect(node(0)).not.toHaveClass("ring-accent")
    expect(within(node(0)).getByText("✓")).toHaveClass("text-tile-1")
    expect(within(node(0)).getByText("✓")).toHaveClass("opacity-100")
    expect(within(node(0)).getByText("1")).toHaveClass("opacity-0")
    expect(within(node(4)).getByText("✓")).toHaveClass("opacity-0")
    expect(within(node(4)).getByText("5")).toHaveClass("opacity-100")
  })

  it("names the active stage under its node at progress 0.5 and leaves every other label unlit", () => {
    renderWithSite(<StagesScene />)
    driveScene(drivers, screen.getByTestId("stages-scene"), 0.5)
    const label = (i: number) => within(node(i).parentElement!).getByText(SALE_STAGES[i]!.label)
    expect(label(4).textContent).toBe("Market")
    expect(label(4)).toHaveClass("text-accent", "opacity-100")
    expect(label(3).textContent).toBe("Privacy")
    expect(label(3)).toHaveClass("opacity-0")
    expect(label(5)).toHaveClass("opacity-0")
  })

  it("swaps the visible panel to stage 5 'Buyer market' at progress 0.5", () => {
    renderWithSite(<StagesScene />)
    driveScene(drivers, screen.getByTestId("stages-scene"), 0.5)
    const s = SALE_STAGES[4]!
    const p = panel(4)
    expect(p).toHaveAttribute("aria-hidden", "false")
    expect(p).toHaveClass("opacity-100")
    expect(within(p).getByText("STAGE 05 · MARKET")).toBeInTheDocument()
    expect(within(p).getByRole("heading", { level: 3 })).toHaveTextContent("Buyer market")
    expect(within(p).getByText(s.heirloom)).toBeInTheDocument()
    expect(within(p).getByText("Nothing until qualified buyers are ready.")).toBeInTheDocument()
    expect(within(p).getByText("A qualified group of buyers.")).toBeInTheDocument()
    expect(panel(0)).toHaveAttribute("aria-hidden", "true")
    expect(panel(0)).toHaveClass("opacity-0")
    expect(panel(0).style.transform).toBe("translateY(-16px)")
    expect(panel(5).style.transform).toBe("translateY(18px)")
  })

  it("heads the scene with its eyebrow and keeps the still note for reduced motion alone", () => {
    renderWithSite(<StagesScene />)
    const eyebrow = screen.getByText("The eight stages")
    expect(eyebrow).toHaveClass("type-caption-strong")
    const note = screen.getByText("The same information, shown without animation.")
    expect(note).toHaveClass("hidden", "motion-reduce:inline")
    expect(eyebrow.nextElementSibling).toBe(note)
  })

  it("shows the counter 05 / 08 at progress 0.5", () => {
    renderWithSite(<StagesScene />)
    driveScene(drivers, screen.getByTestId("stages-scene"), 0.5)
    const visible = screen.getAllByText(/^0[1-8]$/).filter((el) => el.getAttribute("aria-hidden") === "false")
    expect(visible.map((el) => el.textContent)).toEqual(["05"])
    expect(screen.getByText("/ 08")).toBeInTheDocument()
  })

  it("marks stages 1-7 done and stage 8 active at progress 0.99", () => {
    renderWithSite(<StagesScene />)
    driveScene(drivers, screen.getByTestId("stages-scene"), 0.99)
    expect(nodeStates()).toEqual(["done", "done", "done", "done", "done", "done", "done", "active"])
    expect(within(panel(7)).getByRole("heading", { level: 3 })).toHaveTextContent("Diligence, financing, and closing")
  })

  it("writes the rail width as the progress percentage", () => {
    const { container } = renderWithSite(<StagesScene />)
    const scene = screen.getByTestId("stages-scene")
    expect(rail(container)).toHaveClass("w-0")
    expect(rail(container)).toHaveClass("bg-accent")
    expect(rail(container).className).not.toMatch(/shadow|filament/)
    expect(rail(container).parentElement).toHaveClass("bg-fg/15")
    expect(rail(container).parentElement).toHaveClass("h-[2px]")
    expect(rail(container).style.width).toBe("")
    driveScene(drivers, scene, 0.5)
    // The component writes "50.00%"; the CSSOM normalises the serialised value to "50%".
    expect(rail(container).style.width).toBe("50%")
    driveScene(drivers, scene, 0.125)
    expect(rail(container).style.width).toBe("12.5%")
    driveScene(drivers, scene, 0.3333)
    expect(rail(container).style.width).toBe("33.33%")
    driveScene(drivers, scene, 1)
    expect(rail(container).style.width).toBe("100%")
  })

  it("dims every artifact chip to 50%, still legible, before the first stage completes", () => {
    renderWithSite(<StagesScene />)
    for (const s of SALE_STAGES) {
      // 22% left the undelivered labels at roughly 1.9:1 over tile-1; 50% keeps them above AA for 14px text.
      expect(chip(s.artifact)).toHaveClass("opacity-50")
      expect(chip(s.artifact)).not.toHaveClass("opacity-[.22]")
      expect(chip(s.artifact)).not.toHaveClass("opacity-100")
      expect(chip(s.artifact)).toHaveClass("rounded-pill")
      expect(chip(s.artifact)).toHaveClass("border-line")
      expect(chip(s.artifact).className).not.toMatch(/\bbg-|shadow/)
    }
  })

  it("delivers the first artifact late in stage 1, before the stage index advances", () => {
    renderWithSite(<StagesScene />)
    driveScene(drivers, screen.getByTestId("stages-scene"), 0.115)
    expect(nodeStates()[0]).toBe("active")
    expect(chip("Sale plan")).toHaveClass("opacity-100")
    expect(chip("Financials")).toHaveClass("opacity-50")
  })

  it("lights four artifact chips at progress 0.5 and all eight at 0.99", () => {
    renderWithSite(<StagesScene />)
    const scene = screen.getByTestId("stages-scene")
    driveScene(drivers, scene, 0.5)
    expect(SALE_STAGES.map((s) => chip(s.artifact).classList.contains("opacity-100"))).toEqual([
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
    ])
    driveScene(drivers, scene, 0.99)
    expect(SALE_STAGES.every((s) => chip(s.artifact).classList.contains("opacity-100"))).toBe(true)
  })

  it("hides the chip tally on phones and shows it from the tablet breakpoint", () => {
    renderWithSite(<StagesScene />)
    const tally = screen.getByText("IN YOUR HANDS").parentElement as HTMLElement
    expect(tally).toHaveClass("hidden")
    expect(tally).toHaveClass("tab:flex")
    expect(screen.getByText("IN YOUR HANDS")).toHaveClass("mr-1")
  })

  it("draws the footer's hairline and its 12px inset only from the tablet breakpoint, where the tally it belongs to shows", () => {
    renderWithSite(<StagesScene />)
    const footer = screen.getByText("IN YOUR HANDS").parentElement!.parentElement as HTMLElement
    expect(footer).toContainElement(hint())
    expect(footer).toContainElement(screen.getByRole("button", { name: "Talk to an M&A advisor" }))
    for (const cls of ["border-line", "mt-4", "tab:border-t", "tab:pt-3"]) expect(footer).toHaveClass(cls)
    expect(footer.className.split(" ")).toHaveLength(4)
    expect(footer).not.toHaveClass("border-t")
    expect(footer).not.toHaveClass("pt-3")
  })

  it("shows the scroll hint only while progress is below 0.03", () => {
    renderWithSite(<StagesScene />)
    const scene = screen.getByTestId("stages-scene")
    expect(hint()).toHaveClass("opacity-100")
    driveScene(drivers, scene, 0.029)
    expect(hint()).toHaveClass("opacity-100")
    driveScene(drivers, scene, 0.03)
    expect(hint()).toHaveClass("opacity-0")
    driveScene(drivers, scene, 0)
    expect(hint()).toHaveClass("opacity-100")
  })

  it("opens the advisor dialog from the 'Talk to an M&A advisor' trigger", () => {
    renderWithSite(
      <>
        <StagesScene />
        <AdvisorProbe />
      </>
    )
    expect(screen.getByTestId("advisor-open")).toHaveTextContent("false")
    fireEvent.click(screen.getByRole("button", { name: "Talk to an M&A advisor" }))
    expect(screen.getByTestId("advisor-open")).toHaveTextContent("true")
    expect(screen.getByTestId("open-advisor")).toHaveClass("text-link")
    expect(screen.getByTestId("open-advisor")).toHaveClass("type-caption")
    expect(screen.getByTestId("open-advisor")).toHaveClass("min-h-11")
  })
})
