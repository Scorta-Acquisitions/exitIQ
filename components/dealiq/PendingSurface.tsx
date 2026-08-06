/**
 * Scaffolding for a surface whose item has not landed yet.
 *
 * Every destination in `DEALIQ_NAV` and every tab in `DEAL_TABS` resolves from
 * the moment the shell exists, so the navigation can be exercised — and reviewed
 * — before items 5-12 fill it in. Each of those items replaces one of these.
 *
 * Server component: no state, no interactivity.
 */

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

export function PendingSurface({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
  return (
    <div style={{ padding: "26px 22px 48px", fontFamily: inter }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 9.5,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "var(--t3)",
        }}
      >
        {eyebrow}
      </div>
      <h1
        style={{
          margin: "3px 0 0",
          fontFamily: garamond,
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: "-.3px",
          color: "var(--t1)",
        }}
      >
        {title}
      </h1>
      <div
        style={{
          marginTop: 18,
          padding: "18px 20px",
          borderRadius: 11,
          border: "1px dashed var(--b2)",
          background: "var(--s2)",
          maxWidth: 620,
        }}
      >
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: "var(--t2)" }}>{note}</p>
      </div>
    </div>
  )
}
