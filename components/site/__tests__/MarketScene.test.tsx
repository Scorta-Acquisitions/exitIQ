import { render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { MarketScene } from "@/components/site/scenes/MarketScene"
import { marketFrame, marketSlipIds } from "@/lib/site/scroll"
import { driveScene, installSceneDrivers, pinViewport, type SceneDrivers } from "./scene-test-utils"

const SLIP_IDS = marketSlipIds(18)
const STAGE_W = 1000
const STAGE_H = 700

function setup() {
  const utils = render(<MarketScene />)
  const scene = screen.getByTestId("market-scene")
  const panel = scene.firstElementChild as HTMLElement
  const veil = panel.firstElementChild as HTMLElement
  const letter = screen.getByText("BY MAIL · TO THE OWNER").parentElement as HTMLElement
  const stage = letter.parentElement as HTMLElement
  Object.defineProperty(stage, "offsetWidth", { configurable: true, value: STAGE_W })
  Object.defineProperty(stage, "offsetHeight", { configurable: true, value: STAGE_H })
  return { ...utils, scene, panel, veil, letter, stage }
}

const activeFlags = () => [0, 1, 2, 3].map((i) => screen.getByTestId(`market-step-${i}`).getAttribute("data-active"))

describe("<MarketScene />", () => {
  let drivers: SceneDrivers
  beforeEach(() => {
    drivers = installSceneDrivers()
    pinViewport(1000)
  })
  afterEach(() => {
    drivers.restore()
    pinViewport(768)
  })

  it("keeps the panel pinned with the sticky and top-[78px] classes on the scene root's direct child", () => {
    const { panel } = setup()
    expect(panel).toHaveClass("sticky")
    expect(panel).toHaveClass("top-[78px]")
  })

  it("marks no step active before the first frame has been measured", () => {
    setup()
    expect(activeFlags()).toEqual(["false", "false", "false", "false"])
  })

  it("activates step 01 'Inbound offer' for progress below 0.22", () => {
    const { scene } = setup()
    driveScene(drivers, scene, 0.1)
    expect(activeFlags()).toEqual(["true", "false", "false", "false"])
    expect(screen.getByTestId("market-step-0")).toHaveTextContent("01Inbound offer")
  })

  it("flips to step 02 exactly at progress 0.22", () => {
    const { scene } = setup()
    driveScene(drivers, scene, 0.219)
    expect(activeFlags()).toEqual(["true", "false", "false", "false"])
    driveScene(drivers, scene, 0.22)
    expect(activeFlags()).toEqual(["false", "true", "false", "false"])
    expect(screen.getByTestId("market-step-1")).toHaveTextContent("Buyer research")
  })

  it("flips to step 03 at progress 0.48 and step 04 at 0.74", () => {
    const { scene } = setup()
    driveScene(drivers, scene, 0.48)
    expect(activeFlags()).toEqual(["false", "false", "true", "false"])
    driveScene(drivers, scene, 0.74)
    expect(activeFlags()).toEqual(["false", "false", "false", "true"])
    expect(screen.getByTestId("market-step-3")).toHaveTextContent("Offer comparison")
  })

  it("keeps step 04 active at the very end of the scene", () => {
    const { scene } = setup()
    driveScene(drivers, scene, 1)
    expect(activeFlags()).toEqual(["false", "false", "false", "true"])
  })

  it("links the last step to the full sale process page", () => {
    setup()
    const step = screen.getByTestId("market-step-3")
    expect(within(step).getByRole("link", { name: "See how it works →" })).toHaveAttribute("href", "/how-it-works")
  })

  it("renders eighteen teaser slips, one per buyer id", () => {
    setup()
    expect(screen.getAllByText("PROJECT RIDGELINE")).toHaveLength(18)
    expect(SLIP_IDS).toHaveLength(18)
    for (const id of SLIP_IDS) {
      expect(screen.getByText(id)).toBeInTheDocument()
      expect(screen.getByText(`${id} ✓`)).toBeInTheDocument()
    }
  })

  it("writes the veil opacity from veilOpacity(p)", () => {
    const { scene, veil } = setup()
    expect(veil).toHaveClass("opacity-0")
    driveScene(drivers, scene, 0.5)
    expect(veil.style.opacity).toBe("0.11")
    driveScene(drivers, scene, 1)
    expect(veil.style.opacity).toBe("0.22")
  })

  it("shows the inbound letter at progress 0.1 with the transform computed from the stage size", () => {
    const { scene, letter } = setup()
    driveScene(drivers, scene, 0.1)
    expect(letter.style.opacity).toBe("0.875")
    expect(letter.style.transform).toBe(marketFrame(0.1, STAGE_W, STAGE_H, 18, 4).letter.transform)
  })

  it("hides the letter and keeps slips invisible before the scene starts", () => {
    const { scene, letter } = setup()
    driveScene(drivers, scene, 0)
    expect(letter.style.opacity).toBe("0")
    const slipOpacities = screen.getAllByText("PROJECT RIDGELINE").map((el) => {
      const slip = el.parentElement!.parentElement!.parentElement as HTMLElement
      return slip.style.opacity
    })
    expect(slipOpacities).toEqual(Array<string>(18).fill("0"))
  })

  it("flips only every fourth slip to its NDA face at progress 0.72", () => {
    const { scene } = setup()
    driveScene(drivers, scene, 0.72)
    const expected = marketFrame(0.72, STAGE_W, STAGE_H, 18, 4).slips.map((s) => String(s.ndaOpacity))
    const ndaOpacities = screen.getAllByText("NDA SIGNED").map((el) => (el.parentElement as HTMLElement).style.opacity)
    expect(ndaOpacities).toEqual(expected)
    expect(ndaOpacities).toEqual(SLIP_IDS.map((_, i) => (i % 4 === 0 ? "1" : "0")))
  })

  it("drops non-surviving slips to zero opacity at progress 0.72 while survivors stay visible", () => {
    const { scene } = setup()
    driveScene(drivers, scene, 0.72)
    const opacities = screen.getAllByText("PROJECT RIDGELINE").map((el) => {
      const slip = el.parentElement!.parentElement!.parentElement as HTMLElement
      return Number(slip.style.opacity)
    })
    opacities.forEach((o, i) => {
      if (i % 4 === 0) expect(o).toBeGreaterThan(0.5)
      else expect(o).toBe(0)
    })
  })

  it("renders the four letters of intent with their exact tags, amounts, buyers, and badges", () => {
    setup()
    const cards = [
      ["LETTER OF INTENT · A", "$4.30M", "REGIONAL ACQUIRER", null],
      ["LETTER OF INTENT · B", "$4.55M", "INDIVIDUAL BUYER", null],
      ["LETTER OF INTENT · C", "$4.05M", "INVESTMENT GROUP · COMMITTED FINANCING", "MOST CERTAIN"],
      ["LETTER OF INTENT · D", "$4.65M", "STRATEGIC ACQUIRER", "HIGHEST HEADLINE"],
    ] as const
    expect(screen.getAllByText(/^LETTER OF INTENT · [A-D]$/)).toHaveLength(4)
    for (const [tag, amount, who, badge] of cards) {
      const card = screen.getByText(tag).parentElement!.parentElement as HTMLElement
      expect(within(card).getByText(amount)).toBeInTheDocument()
      expect(within(card).getByText(who)).toBeInTheDocument()
      if (badge) expect(within(card).getByText(badge)).toBeInTheDocument()
      else expect(within(card).queryByText(/MOST CERTAIN|HIGHEST HEADLINE/)).toBeNull()
    }
  })

  it("lands all four letters of intent at the end with the committed offer stacked on top", () => {
    const { scene } = setup()
    driveScene(drivers, scene, 1)
    const cards = ["A", "B", "C", "D"].map(
      (k) => screen.getByText(`LETTER OF INTENT · ${k}`).parentElement!.parentElement as HTMLElement
    )
    expect(cards.map((c) => c.style.opacity)).toEqual(["1", "1", "1", "1"])
    expect(cards.map((c) => c.style.zIndex)).toEqual(["1", "2", "5", "2"])
    expect(cards[2]).toHaveClass("border-filament-ink")
  })

  it("keeps the letters of intent hidden at progress 0.5", () => {
    const { scene } = setup()
    driveScene(drivers, scene, 0.5)
    const cards = ["A", "B", "C", "D"].map(
      (k) => screen.getByText(`LETTER OF INTENT · ${k}`).parentElement!.parentElement as HTMLElement
    )
    expect(cards.map((c) => c.style.opacity)).toEqual(["0", "0", "0", "0"])
  })
})
