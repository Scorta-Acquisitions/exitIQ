import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { demoStagger, METER_FILL, METER_TRACK, REKEY, ROW_IN, STAGE_IN } from "@/components/site/demo/classes"
import { DemoFrame } from "@/components/site/demo/DemoFrame"
import { DEMO_REKEY_MS } from "@/lib/site/demo/clock"

const LEDGER_FILM = {
  src: "/media/ledger-glass.mp4",
  poster: "/media/ledger-glass-poster.jpg",
  opacityClass: "opacity-35",
}

function renderFrame(props: Partial<React.ComponentProps<typeof DemoFrame>> = {}) {
  return render(
    <DemoFrame subject="Adjusted earnings" testid="fin" {...props}>
      <p data-testid="screen-body">the four lines</p>
    </DemoFrame>
  )
}

describe("DemoFrame", () => {
  it("heads the screen with the company and its subject, and labels the figures a worked example", () => {
    renderFrame()
    expect(screen.getByText("Project Ridgeline · Adjusted earnings")).toHaveClass("type-caption-strong", "text-fg")
    const label = screen.getByText("Worked example")
    expect(label).toHaveClass("type-fine-print", "text-fg-3")
    expect(label.parentElement).toHaveClass("border-line-soft", "border-b")
  })

  it("is a dark card with no shadow", () => {
    renderFrame()
    const frame = screen.getByTestId("fin")
    expect(frame).toHaveClass("on-dark", "bg-tile-1", "relative", "overflow-hidden", "rounded-lg", "border")
    expect(frame.className).not.toMatch(/shadow/)
  })

  it("renders the screen's own content directly under the header", () => {
    renderFrame()
    const header = screen.getByText("Worked example").parentElement!
    expect(header.nextElementSibling).toBe(screen.getByTestId("screen-body"))
    expect(screen.getByTestId("screen-body")).toHaveTextContent("the four lines")
  })

  it("puts the film behind the screen at its own opacity, decorative, and only from the tablet breakpoint", () => {
    renderFrame({ film: LEDGER_FILM })
    const layer = screen.getByTestId("fin-film")
    expect(layer).toHaveClass("hidden", "tab:block", "absolute", "inset-0", "pointer-events-none")
    expect(layer).toHaveAttribute("aria-hidden", "true")
    const video = screen.getByTestId("ambient-video")
    expect(video).toHaveAttribute("poster", "/media/ledger-glass-poster.jpg")
    expect(video).toHaveClass("opacity-35", "object-cover", "absolute")
    // The source attaches only as the film nears the viewport, so nothing downloads on a page nobody scrolls.
    expect(video).not.toHaveAttribute("src")
  })

  it("shows no film at all when the section gives it none", () => {
    renderFrame()
    expect(screen.queryByTestId("fin-film")).toBeNull()
    expect(screen.queryByTestId("ambient-video")).toBeNull()
  })
})

describe("the shared demo classes", () => {
  it("arrives rows and panels once, and never under reduced motion", () => {
    expect(ROW_IN).toBe("animate-row-in motion-reduce:animate-none")
    expect(STAGE_IN).toBe("animate-stage-in motion-reduce:animate-none")
  })

  it("draws every meter on one 3px track in the accent", () => {
    expect(METER_TRACK).toContain("h-[3px]")
    expect(METER_FILL).toContain("bg-accent")
    expect(METER_FILL).toContain("transition-[width,opacity]")
    expect(METER_FILL).toContain("motion-reduce:transition-none")
  })

  it("cross-fades a replayed value over the clock's re-key time", () => {
    expect(REKEY).toBe(`transition-opacity duration-${DEMO_REKEY_MS} ease-e1 motion-reduce:transition-none`)
  })

  it("staggers the rows 60ms apart on the first play and never again on a replay", () => {
    expect(demoStagger(0, 0)).toBe(0)
    expect(demoStagger(0, 1)).toBe(60)
    expect(demoStagger(0, 3)).toBe(180)
    expect(demoStagger(0, 2, 40)).toBe(80)
    expect(demoStagger(1, 3)).toBe(0)
    expect(demoStagger(2, 1)).toBe(0)
  })
})
