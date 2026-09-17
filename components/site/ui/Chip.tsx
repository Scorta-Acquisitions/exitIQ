import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { cn } from "@/lib/site/cn"

/**
 * The configurator option chip: a pill-shaped tappable cell (14px caption text, 12 × 16 padding) on the
 * current surface with a hairline border. The selected chip upgrades to a 2px accent border, drawn as
 * border + inset ring so the layout does not shift. Exposes `aria-pressed` for screen readers. Colours
 * resolve per surface, so the same chip works on light and dark tiles.
 */
interface ChipProps extends Omit<ComponentPropsWithoutRef<"button">, "className" | "children"> {
  selected: boolean
  className?: string
  children: ReactNode
}

const BASE =
  "pressable bg-surface text-fg type-caption inline-flex items-center rounded-pill border px-4 py-3 text-left disabled:cursor-default"
/** The selected-option border (2px accent, drawn as border + inset ring) for any selectable card or cell. */
export const CHIP_SELECTED = "border-accent-focus ring-accent-focus ring-1 ring-inset"
/** The idle-option border. */
export const CHIP_IDLE = "border-line hover:border-fg-3"

export function Chip({ selected, className, children, type, ...rest }: ChipProps) {
  return (
    <button
      type={type ?? "button"}
      aria-pressed={selected}
      className={cn(BASE, selected ? CHIP_SELECTED : CHIP_IDLE, className)}
      {...rest}
    >
      {children}
    </button>
  )
}
