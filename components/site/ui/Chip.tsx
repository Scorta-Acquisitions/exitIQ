import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { twMerge } from "tailwind-merge"

/** Selectable answer pill. Exposes `aria-pressed` so screen readers hear the selection. */

const chipVariants = cva(
  "inline-flex items-center rounded-full border font-medium transition-all duration-200 ease-e2 disabled:cursor-default",
  {
    variants: {
      tone: {
        dark: "",
        light: "",
        "light-mono": "font-mono font-normal",
      },
      size: {
        md: "px-[15px] py-[10px] text-[13.5px]",
        lg: "px-4 py-[11px] text-[14px]",
        sm: "px-[13px] py-2 text-[11.5px]",
      },
      selected: { true: "", false: "" },
    },
    compoundVariants: [
      { tone: "dark", selected: true, class: "border-filament/55 bg-filament/12 text-filament" },
      { tone: "dark", selected: false, class: "border-dfull/14 bg-dfull/[5.5%] text-dfull/86 hover:border-dfull/30" },
      { tone: "light", selected: true, class: "border-filament-ink/55 bg-filament/14 text-filament-ink" },
      { tone: "light", selected: false, class: "border-hair-2 bg-transparent text-l2 hover:bg-paper-2" },
      { tone: "light-mono", selected: true, class: "border-filament-ink/55 bg-filament/14 text-filament-ink" },
      { tone: "light-mono", selected: false, class: "border-hair-2 bg-transparent text-l2 hover:bg-paper-2" },
    ],
    defaultVariants: { tone: "dark", size: "md", selected: false },
  }
)

export interface ChipProps
  extends
    Omit<ComponentPropsWithoutRef<"button">, "className" | "children">,
    Omit<VariantProps<typeof chipVariants>, "selected"> {
  selected: boolean
  className?: string
  children: ReactNode
}

export function Chip({ selected, tone, size, className, children, type, ...rest }: ChipProps) {
  return (
    <button
      type={type ?? "button"}
      aria-pressed={selected}
      className={twMerge(chipVariants({ tone, size, selected }), className)}
      {...rest}
    >
      {children}
    </button>
  )
}
