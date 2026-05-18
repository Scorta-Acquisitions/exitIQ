import Link from "next/link"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

export function LockedStation({
  station,
  agent,
  title,
  blurb,
  prereq,
}: {
  station: string
  agent: string
  title: string
  blurb: string
  prereq: string
}) {
  return (
    <div
      style={{
        padding: "44px 44px 40px",
        position: "relative",
        background: "rgba(255,255,255,.78)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderRadius: 22,
        boxShadow: "0 1px 0 rgba(255,255,255,.92) inset, 0 -1px 0 rgba(0,0,0,.05) inset, 0 12px 36px rgba(12,10,9,.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: "var(--t3)",
            fontWeight: 500,
            letterSpacing: ".7px",
            textTransform: "uppercase",
          }}
        >
          {station}
        </div>
        <div style={{ height: 1, width: 22, background: "var(--div)" }} />
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "var(--t2)",
            fontFamily: inter,
          }}
        >
          {agent}
        </div>
      </div>

      <h1
        style={{
          fontFamily: garamond,
          fontWeight: 400,
          fontSize: 38,
          lineHeight: 1.08,
          letterSpacing: "-.5px",
          color: "var(--t1)",
          marginBottom: 14,
          maxWidth: 720,
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--t2)",
          lineHeight: 1.65,
          maxWidth: 640,
          marginBottom: 26,
          fontFamily: inter,
        }}
      >
        {blurb}
      </p>

      {/* ARIA unlock message — replaces the prior "Coming Soon" treatment. */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "14px 16px",
          borderRadius: 14,
          background: "rgba(255,255,255,.7)",
          border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
          maxWidth: 560,
        }}
      >
        <div
          aria-hidden
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            flexShrink: 0,
            background:
              "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
            boxShadow: "0 0 8px rgba(44,140,112,.45)",
            marginTop: 1,
          }}
        />
        <div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 10.5,
              color: "var(--t2)",
              fontWeight: 500,
              letterSpacing: ".7px",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            ARIA · Case Manager
          </div>
          <div style={{ fontSize: 13, color: "var(--t1)", lineHeight: 1.55 }}>
            I'll unlock this workspace once {prereq}. Head back to the Seller Home to keep moving.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 26 }}>
        <Link
          href="/dashboard"
          className="scorta-back"
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--t2)",
            textDecoration: "none",
            transition: "color 180ms ease-out",
          }}
        >
          ← Back to Seller Home
        </Link>
        <style>{`.scorta-back:hover { color: var(--t1); }`}</style>
      </div>
    </div>
  )
}
