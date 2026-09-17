import { extendTailwindMerge } from "tailwind-merge"

/**
 * Class merger for the site. `tailwind-merge` knows Tailwind's own utilities conflict with each other
 * but not the site's `type-*` ladder, so `twMerge("type-body-strong", "type-tagline")` would keep both
 * and leave the result to stylesheet order. This instance registers the ladder as one class group, so
 * the last type style wins, the way `text-*` sizes already do.
 *
 * The same held for two of the five radii: `pill` and `xs` are not names Tailwind ships, so
 * `twMerge("rounded-md", "rounded-pill")` kept both and left the corner to stylesheet order — which is how
 * a `variant="pearl"` button asked for the pill capsule still carried `rounded-md`. Both names join the
 * radius scale here, so the last radius wins like `rounded-sm` and `rounded-lg` already did.
 */
export const TYPE_STYLES = [
  "type-hero",
  "type-display-lg",
  "type-display-md",
  "type-lead",
  "type-lead-airy",
  "type-tagline",
  "type-body-strong",
  "type-body",
  "type-dense-link",
  "type-caption",
  "type-caption-strong",
  "type-fine-print",
  "type-micro-legal",
  "type-nav-link",
  "type-brand",
] as const

/** The two radii in `styles/site.css` that are not Tailwind's own names, and so are invisible to the merge. */
export const EXTRA_RADII = ["pill", "xs"] as const

export const cn = extendTailwindMerge<"type">({
  extend: {
    classGroups: {
      type: [...TYPE_STYLES],
    },
    theme: {
      radius: [...EXTRA_RADII],
    },
  },
})
