import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { STANDALONE_LINK } from "@/components/site/ui/TextLink"
import { cn } from "@/lib/site/cn"

/**
 * A button that reads as an inline text link: accent colour, underline on hover, 14px caption type.
 * For tertiary actions beside a primary button ("Start over", "Change my last answer", "Reset").
 * Text links do not scale on press, so this carries no `pressable`; every one of them is an action-row
 * control, so each carries the 44px touch target `STANDALONE_LINK` gives.
 */
export function TextButton({
  className,
  children,
  type,
  ...rest
}: Omit<ComponentPropsWithoutRef<"button">, "className" | "children"> & {
  className?: string
  children: ReactNode
}) {
  return (
    <button type={type ?? "button"} className={cn("text-link type-caption", STANDALONE_LINK, className)} {...rest}>
      {children}
    </button>
  )
}
