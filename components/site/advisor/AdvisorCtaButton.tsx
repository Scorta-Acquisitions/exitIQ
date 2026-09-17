// use client: opens the advisor intake dialog held in site state
"use client"

import type { ReactNode } from "react"
import { useAdvisor } from "@/components/site/providers/SiteStateProvider"
import { Button, type ButtonProps } from "@/components/site/ui/Button"

type Props = Omit<Extract<ButtonProps, { href?: undefined }>, "onClick" | "children"> & {
  children?: ReactNode
}

/** "Talk to an M&A advisor" — the primary call to action, rendered anywhere on the site. */
export function AdvisorCtaButton({ children = "Talk to an M&A advisor", ...rest }: Props) {
  const { openAdvisor } = useAdvisor()
  return (
    <Button onClick={() => openAdvisor()} data-testid="open-advisor" {...rest}>
      {children}
    </Button>
  )
}

/** Unstyled trigger for bespoke layouts (cards, footers) that still open the dialog. */
export function AdvisorTrigger({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & Omit<React.ComponentPropsWithoutRef<"button">, "onClick">) {
  const { openAdvisor } = useAdvisor()
  return (
    <button type="button" onClick={() => openAdvisor()} className={className} data-testid="open-advisor" {...rest}>
      {children}
    </button>
  )
}
