import { type FocusEvent, type PointerEvent, useRef } from "react"

/**
 * How a demo's previews tell one pointer from another. A mouse previews by resting on a row or a word and
 * gives it up by leaving; a finger has nothing to rest, so a tap toggles the preview instead — and because a
 * tap also sends `pointerenter` and focus, both of those ignore it and leave the press to do the work.
 */

/**
 * Whether this pointer event came from a device that can rest on something. A touch or a pen cannot: those
 * previews are made by the press. Every browser names the pointer; where one is not named (a synthetic event
 * in a test) the resting pointer is assumed, which is the desktop case.
 */
function fromMouse(event: PointerEvent<HTMLElement>): boolean {
  return event.pointerType !== "touch" && event.pointerType !== "pen"
}

/**
 * Whether focus arrived from the keyboard, the one way in without a pointer. `:focus-visible` is the browser's
 * own answer; where it cannot be asked (jsdom), the keyboard is assumed, which is the accessible default.
 */
function fromKeyboard(event: FocusEvent<HTMLElement>): boolean {
  try {
    return event.currentTarget.matches(":focus-visible")
  } catch {
    return true
  }
}

/** The five handlers a previewing cell carries. Typed for `HTMLElement`, so any element takes them. */
export interface PreviewHandlers {
  onPointerEnter: (event: PointerEvent<HTMLElement>) => void
  onPointerLeave: (event: PointerEvent<HTMLElement>) => void
  onFocus: (event: FocusEvent<HTMLElement>) => void
  onBlur: () => void
  onClick: () => void
}

/**
 * The preview contract every demo cell shares, as handler props: resting on a cell previews what it holds,
 * leaving releases it, focus previews and blur releases, and a press — the only way a finger has — toggles it.
 *
 * One call per screen, because the ref that tells a resting pointer from a tap belongs to the pointer, not to
 * the cell: `previewProps(value, active)` then answers for a cell holding `value`, `active` while its own
 * preview is the one showing, so its press releases instead of asking for it again.
 */
export function usePreviewHandlers<T>(
  onPreview: (value: T | null) => void
): (value: T, active: boolean) => PreviewHandlers {
  // Whether the pointer resting on a cell is one that can rest: a tap must press, not hover and un-hover.
  const resting = useRef(false)
  return (value, active) => ({
    onPointerEnter: (event) => {
      resting.current = fromMouse(event)
      if (resting.current) onPreview(value)
    },
    onPointerLeave: (event) => {
      if (fromMouse(event)) onPreview(null)
      resting.current = false
    },
    onFocus: (event) => {
      if (fromKeyboard(event)) onPreview(value)
    },
    onBlur: () => onPreview(null),
    onClick: () => {
      if (!resting.current) onPreview(active ? null : value)
    },
  })
}
