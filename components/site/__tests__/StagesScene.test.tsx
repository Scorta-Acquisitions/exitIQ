import { fireEvent, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { useAdvisor } from "@/components/site/providers/SiteStateProvider"
import { StagesScene } from "@/components/site/scenes/StagesScene"
import { SALE_STAGES } from "@/lib/site/content/stages"
import { driveScene, installSceneDrivers, pinViewport, type SceneDrivers } from "./scene-test-utils"
import { renderWithSite } from "./test-utils"

function AdvisorProbe() {
  const { advisor } = useAdvisor()
  return <output data-testid="advisor-open">{String(advisor.open)}</output>
}

const nodeStates = () => SALE_STAGES.map((_, i) => screen.getByTestId(`stage-node-${i}`).getAttribute("data-state"))
const panel = (i: number) => screen.getByTestId(`stage-panel-${i}`)
const rail = (container: HTMLElement) => container.querySelector('[class~="transition-[width]"]') as HTMLElement
const chip = (artifact: string) => screen.getByText(artifact)
const hint = () => screen.getByText("Move through the stages to see what Heirloom handles and when you are needed.")

describe("<StagesScene />", () => {
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
    renderWithSite(<StagesScene />)
    const panelEl = screen.getByTestId("stages-scene").firstElementChild as HTMLElement
    expect(panelEl).toHaveClass("sticky")
    expect(panelEl).toHaveClass("top-[78px]")
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

  it("shows stage 1 copy from SALE_STAGES before scrolling", () => {
    renderWithSite(<StagesScene />)
    const s = SALE_STAGES[0]!
    const p = panel(0)
    expect(p).toHaveAttribute("aria-hidden", "false")
    expect(within(p).getByText("STAGE 01 · GOALS")).toBeInTheDocument()
    expect(within(p).getByRole("heading", { level: 3 })).toHaveTextContent(s.title)
    expect(within(p).getByText(s.heirloom)).toBeInTheDocument()
    expect(within(p).getByText(s.you)).toBeInTheDocument()
    expect(within(p).getByText(s.receive)).toBeInTheDocument()
    expect(panel(1)).toHaveAttribute("aria-hidden", "true")
  })

  it("marks stages 1-4 done and stage 5 active at progress 0.5", () => {
    renderWithSite(<StagesScene />)
    driveScene(drivers, screen.getByTestId("stages-scene"), 0.5)
    expect(nodeStates()).toEqual(["done", "done", "done", "done", "active", "pending", "pending", "pending"])
  })

  it("swaps the visible panel to stage 5 'Build the buyer market' at progress 0.5", () => {
    renderWithSite(<StagesScene />)
    driveScene(drivers, screen.getByTestId("stages-scene"), 0.5)
    const s = SALE_STAGES[4]!
    const p = panel(4)
    expect(p).toHaveAttribute("aria-hidden", "false")
    expect(p).toHaveClass("opacity-100")
    expect(within(p).getByText("STAGE 05 · MARKET")).toBeInTheDocument()
    expect(within(p).getByRole("heading", { level: 3 })).toHaveTextContent("Build the buyer market")
    expect(within(p).getByText(s.heirloom)).toBeInTheDocument()
    expect(within(p).getByText("Nothing until serious buyers are ready.")).toBeInTheDocument()
    expect(within(p).getByText("A qualified group of prospective buyers.")).toBeInTheDocument()
    expect(panel(0)).toHaveAttribute("aria-hidden", "true")
    expect(panel(0)).toHaveClass("opacity-0")
    expect(panel(0).style.transform).toBe("translateY(-16px)")
    expect(panel(5).style.transform).toBe("translateY(18px)")
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
    expect(within(panel(7)).getByRole("heading", { level: 3 })).toHaveTextContent(
      "Complete diligence, financing, and closing"
    )
  })

  it("writes the rail width as the progress percentage", () => {
    const { container } = renderWithSite(<StagesScene />)
    const scene = screen.getByTestId("stages-scene")
    expect(rail(container)).toHaveClass("w-0")
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

  it("dims every artifact chip before the first stage completes", () => {
    renderWithSite(<StagesScene />)
    for (const s of SALE_STAGES) {
      expect(chip(s.artifact)).toHaveClass("opacity-[.22]")
      expect(chip(s.artifact)).not.toHaveClass("opacity-100")
    }
  })

  it("delivers the first artifact late in stage 1, before the stage index advances", () => {
    renderWithSite(<StagesScene />)
    driveScene(drivers, screen.getByTestId("stages-scene"), 0.115)
    expect(nodeStates()[0]).toBe("active")
    expect(chip("Sale plan")).toHaveClass("opacity-100")
    expect(chip("Financials")).toHaveClass("opacity-[.22]")
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

  it("opens the advisor dialog from 'Discuss my sale'", () => {
    renderWithSite(
      <>
        <StagesScene />
        <AdvisorProbe />
      </>
    )
    expect(screen.getByTestId("advisor-open")).toHaveTextContent("false")
    fireEvent.click(screen.getByRole("button", { name: "Discuss my sale →" }))
    expect(screen.getByTestId("advisor-open")).toHaveTextContent("true")
    expect(screen.getByTestId("open-advisor")).toHaveClass("hover-green-dark")
  })
})
