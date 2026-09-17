import Link from "next/link"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { cn } from "@/lib/site/cn"

/** The 44px hit area an action-row link needs; the text stays on its line box. */
export const STANDALONE_LINK = "inline-flex min-h-11 items-center"

/**
 * Inline text link in the accent colour. The colour and the hover underline come from the global
 * `.text-link` rule in styles/site.css and resolve per surface (deep green on light tiles, bright green
 * on dark ones), so the link carries no tone of its own. `standalone` is for a link that stands in an
 * action row or under a paragraph (not inside prose): it gives the link a 44px touch target.
 */
export function TextLink({
  href,
  children,
  className,
  standalone = false,
  ...rest
}: {
  href: string
  children: ReactNode
  className?: string
  standalone?: boolean
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">) {
  const classes = cn("text-link", standalone && STANDALONE_LINK, className)
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={classes} {...rest}>
      {children}
    </a>
  )
}
