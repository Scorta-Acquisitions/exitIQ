import type { Metadata } from "next"

/**
 * DealIQ-wide chrome. Theme, accent aliases, metadata — and deliberately **no
 * auth guard**, because `/dealiq/signin` lives under this layout and a guard here
 * would redirect the sign-in page to itself. The guard sits one level down, on
 * the `(workspace)` group (Execution Plan §2).
 *
 * The `--dq-*` aliases are set once, here, and every DealIQ component references
 * only the aliases. That is what makes the buy-side accent a one-line change and
 * what keeps `--mint` — the sell side's signature — out of this application by
 * construction.
 */

export const metadata: Metadata = {
  title: "DealIQ — buy-side deal screening",
  description:
    "Screen any listing in seconds, challenge the seller's add-backs line by line, and model SBA returns before you spend a week on a deal.",
}

const dealIqTheme = {
  "--dq-accent": "var(--sky)",
  "--dq-accent-soft": "var(--sky-soft)",
  "--dq-accent-edge": "var(--sky-edge)",
  "--dq-agent": "var(--lav)",
  "--dq-agent-soft": "var(--lav-soft)",
  "--dq-agent-edge": "var(--lav-edge)",
  minHeight: "100vh",
  background: "var(--page-bg)",
  color: "var(--t1)",
} as React.CSSProperties

export default function DealIQLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="cream" style={dealIqTheme}>
      {children}
    </div>
  )
}
