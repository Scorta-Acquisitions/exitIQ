import { act, createEvent, fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { usePreviewHandlers } from "@/components/site/demo/usePreviewHandlers"

/**
 * Two cells on one screen, asking the way `LetterRow` does: the cell's own id as the value, and `active`
 * true while its own preview is the one showing. One hook serves both cells, as it does in a demo.
 */
function Cells({ shown, onPreview }: { shown: string; onPreview: (value: string | null) => void }) {
  const previewProps = usePreviewHandlers(onPreview)
  return (
    <>
      {["A", "B"].map((id) => (
        <button key={id} type="button" data-testid={id} {...previewProps(id, shown === id)}>
          {id}
        </button>
      ))}
    </>
  )
}

/** The other caller's literal call: `SellerWorkload` asks with the object its screen reads. */
function Word({ onPreview }: { onPreview: (value: { priority: string } | null) => void }) {
  const previewProps = usePreviewHandlers(onPreview)
  return (
    <button type="button" data-testid="word" {...previewProps({ priority: "cash" }, false)}>
      Cash at close
    </button>
  )
}

/**
 * A pointer arriving at or leaving a cell. jsdom has no `PointerEvent`, so the pointer's type is set on the
 * event the way a browser reports it; React reads `onPointerEnter` / `onPointerLeave` off the over and out
 * events, so both are dispatched, as Testing Library's own `fireEvent.pointerEnter` does.
 */
function pointer(id: string, direction: "in" | "out", pointerType: string) {
  const el = screen.getByTestId(id)
  const names =
    direction === "in" ? (["pointerEnter", "pointerOver"] as const) : (["pointerLeave", "pointerOut"] as const)
  for (const name of names) {
    const event = createEvent[name](el)
    Object.defineProperty(event, "pointerType", { value: pointerType })
    fireEvent(el, event)
  }
}

describe("usePreviewHandlers", () => {
  it("previews the cell a mouse rests on and releases it when the mouse leaves", () => {
    const onPreview = vi.fn()
    render(<Cells shown="" onPreview={onPreview} />)
    pointer("A", "in", "mouse")
    expect(onPreview.mock.calls).toEqual([["A"]])
    pointer("A", "out", "mouse")
    expect(onPreview.mock.calls).toEqual([["A"], [null]])
  })

  it("leaves a press alone while a mouse is resting, so a click never closes what hover opened", () => {
    const onPreview = vi.fn()
    render(<Cells shown="" onPreview={onPreview} />)
    pointer("A", "in", "mouse")
    fireEvent.click(screen.getByTestId("A"))
    expect(onPreview.mock.calls).toEqual([["A"]])
  })

  it("previews on the press for a finger, which cannot rest, and releases on the second press", () => {
    const onPreview = vi.fn()
    const { rerender } = render(<Cells shown="" onPreview={onPreview} />)
    pointer("A", "in", "touch")
    expect(onPreview).not.toHaveBeenCalled()
    fireEvent.click(screen.getByTestId("A"))
    expect(onPreview.mock.calls).toEqual([["A"]])
    rerender(<Cells shown="A" onPreview={onPreview} />)
    pointer("A", "in", "touch")
    fireEvent.click(screen.getByTestId("A"))
    expect(onPreview.mock.calls).toEqual([["A"], [null]])
  })

  it("ignores a pen on entry and on the way out, as it ignores a finger", () => {
    const onPreview = vi.fn()
    render(<Cells shown="" onPreview={onPreview} />)
    pointer("A", "in", "pen")
    pointer("A", "out", "pen")
    expect(onPreview).not.toHaveBeenCalled()
  })

  it("assumes a resting pointer where the browser names none, which is the desktop case", () => {
    const onPreview = vi.fn()
    render(<Cells shown="" onPreview={onPreview} />)
    fireEvent.pointerEnter(screen.getByTestId("A"))
    expect(onPreview.mock.calls).toEqual([["A"]])
  })

  it("previews on focus and releases on blur, the one way in without a pointer", () => {
    const onPreview = vi.fn()
    render(<Cells shown="" onPreview={onPreview} />)
    const cell = screen.getByTestId("B")
    act(() => cell.focus())
    expect(onPreview.mock.calls).toEqual([["B"]])
    act(() => cell.blur())
    expect(onPreview.mock.calls).toEqual([["B"], [null]])
  })

  it("assumes the keyboard when the browser cannot be asked whether the focus ring is showing", () => {
    const onPreview = vi.fn()
    const matches = vi.spyOn(Element.prototype, "matches").mockImplementation(() => {
      throw new Error(":focus-visible is not a known selector")
    })
    try {
      render(<Cells shown="" onPreview={onPreview} />)
      act(() => screen.getByTestId("B").focus())
      expect(onPreview.mock.calls).toEqual([["B"]])
    } finally {
      matches.mockRestore()
    }
  })

  it("previews nothing when the browser says the focus ring is not showing", () => {
    const onPreview = vi.fn()
    const matches = vi.spyOn(Element.prototype, "matches").mockReturnValue(false)
    try {
      render(<Cells shown="" onPreview={onPreview} />)
      act(() => screen.getByTestId("B").focus())
      expect(onPreview).not.toHaveBeenCalled()
      // Blur still releases, so a preview a pointer opened cannot be left behind by a mouse-driven focus.
      act(() => screen.getByTestId("B").blur())
      expect(onPreview.mock.calls).toEqual([[null]])
    } finally {
      matches.mockRestore()
    }
  })

  it("reads the pointer, not the cell: a finger that follows a mouse still presses to preview", () => {
    const onPreview = vi.fn()
    render(<Cells shown="" onPreview={onPreview} />)
    pointer("A", "in", "mouse")
    pointer("A", "out", "mouse")
    pointer("B", "in", "touch")
    expect(onPreview.mock.calls).toEqual([["A"], [null]])
    fireEvent.click(screen.getByTestId("B"))
    expect(onPreview.mock.calls).toEqual([["A"], [null], ["B"]])
  })

  it("hands back the value it was given, whatever shape the screen reads", () => {
    const onPreview = vi.fn()
    render(<Word onPreview={onPreview} />)
    pointer("word", "in", "mouse")
    expect(onPreview.mock.calls).toEqual([[{ priority: "cash" }]])
  })
})
