const MONO = "var(--font-space-mono, 'Space Mono'), monospace"

function ValuationVisual() {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #dad4c8",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "rgba(0,0,0,0.06) 0 2px 8px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "#9f9b93",
          marginBottom: "16px",
        }}
      >
        Exit IQ — Valuation Range
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "20px" }}>
        <div style={{ fontSize: "36px", fontWeight: 700, fontFamily: MONO, letterSpacing: "-1.5px" }}>$847K</div>
        <div style={{ fontSize: "16px", color: "#9f9b93" }}>— $1.1M</div>
      </div>
      {[
        { label: "Revenue multiple", val: "3.8×", color: "#02492a" },
        { label: "SDE multiple", val: "4.1×", color: "#078a52" },
        { label: "Market comp", val: "Strong", color: "#84e7a5" },
      ].map((r, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "9px 0",
            borderBottom: i < 2 ? "1px solid #eee9df" : "none",
          }}
        >
          <span style={{ fontSize: "13px", color: "#55534e" }}>{r.label}</span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: r.color }}>{r.val}</span>
        </div>
      ))}
      <div
        style={{
          marginTop: "16px",
          background: "#e8f5ee",
          borderRadius: "10px",
          padding: "12px 14px",
          display: "flex",
          gap: "8px",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            background: "#02492a",
            borderRadius: "50%",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "9px",
            color: "#fff",
            marginTop: "1px",
          }}
        >
          ✦
        </div>
        <div style={{ fontSize: "12px", lineHeight: 1.55, color: "#02492a" }}>
          Strong fundamentals. Recurring revenue reduces risk. Fair multiple for the sector.
        </div>
      </div>
    </div>
  )
}

function RiskVisual() {
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: "16px", padding: "24px" }}>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "#84e7a5",
          marginBottom: "16px",
        }}
      >
        AI Risk Analysis
      </div>
      {[
        { flag: "Low owner dependency", type: "pass" },
        { flag: "Strong recurring revenue (60%)", type: "pass" },
        { flag: "Equipment condition unverified", type: "warn" },
        { flag: "Lease terms – 3 yrs remaining", type: "warn" },
        { flag: "Clean tax history (3 yrs)", type: "pass" },
      ].map((f, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            padding: "8px 0",
            borderBottom: i < 4 ? "1px solid #1a1a1a" : "none",
          }}
        >
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              flexShrink: 0,
              background: f.type === "pass" ? "#02492a" : "#9d6a09",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "9px",
              color: "#fff",
            }}
          >
            {f.type === "pass" ? "✓" : "!"}
          </div>
          <span style={{ fontSize: "13px", color: f.type === "pass" ? "#9f9b93" : "#fbbd41" }}>{f.flag}</span>
        </div>
      ))}
    </div>
  )
}

function MarketplaceVisual() {
  const deals = [
    {
      name: "Riverside HVAC Co.",
      loc: "Austin, TX",
      price: "$850K",
      rev: "$890K rev",
      tag: "Active",
      tagBg: "#e8f5ee",
      tagText: "#078a52",
    },
    {
      name: "Blue Plate Catering",
      loc: "Nashville, TN",
      price: "$420K",
      rev: "$580K rev",
      tag: "Active",
      tagBg: "#e8f5ee",
      tagText: "#078a52",
    },
    {
      name: "Summit Physical Therapy",
      loc: "Denver, CO",
      price: "$1.2M",
      rev: "$1.4M rev",
      tag: "LOI Received",
      tagBg: "#fff8e8",
      tagText: "#d08a11",
    },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {deals.map((d, i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            border: "1px solid #dad4c8",
            borderRadius: "12px",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            boxShadow: "rgba(0,0,0,0.04) 0 1px 2px",
            transition: "all 150ms",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#02492a"
            e.currentTarget.style.transform = "translateX(3px)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#dad4c8"
            e.currentTarget.style.transform = ""
          }}
        >
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "2px" }}>{d.name}</div>
            <div style={{ fontSize: "12px", color: "#9f9b93" }}>
              {d.loc} · {d.rev}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, fontFamily: MONO }}>{d.price}</div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "1584px",
                background: d.tagBg,
                color: d.tagText,
              }}
            >
              {d.tag}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

const FEATURES = [
  {
    eyebrow: "AI Valuation",
    title: "Know what your business is actually worth.",
    body: "Our model analyzes revenue, SDE, industry multiples, and comparable sales to give you a real valuation range — not a broker's inflated pitch number designed to win your listing.",
    stat: "$0",
    statLabel: "Valuation cost",
    dark: false,
    Visual: ValuationVisual,
  },
  {
    eyebrow: "AI Due Diligence",
    title: "Every deal, fully analyzed before you sign.",
    body: "Scorta's AI reads financials, flags risks, identifies growth opportunities, and generates a due diligence report — automatically. Buyers get clarity. Sellers get credibility.",
    stat: "48h",
    statLabel: "Avg. DD time",
    dark: true,
    Visual: RiskVisual,
  },
  {
    eyebrow: "Marketplace",
    title: "Deals that brokers would never show you.",
    body: "Browse AI-verified listings with real financials, seller interviews, and transparent multiples. No gatekeeping, no exclusive networks, no 10% fee buried in the price.",
    stat: "200+",
    statLabel: "Active listings",
    dark: false,
    Visual: MarketplaceVisual,
  },
]

export function Features() {
  return (
    <section style={{ padding: "96px 32px", background: "#faf9f7" }}>
      <div
        style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "80px" }}
      >
        {FEATURES.map((f, i) => {
          const { Visual } = f
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "64px",
                alignItems: "center",
                background: f.dark ? "#02492a" : "transparent",
                borderRadius: f.dark ? "32px" : "0",
                padding: f.dark ? "48px" : "0",
              }}
            >
              <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: f.dark ? "#84e7a5" : "#9f9b93",
                    marginBottom: "12px",
                  }}
                >
                  {f.eyebrow}
                </div>
                <h2
                  style={{
                    fontSize: "36px",
                    fontWeight: 700,
                    letterSpacing: "-1px",
                    lineHeight: 1.1,
                    marginBottom: "16px",
                    color: f.dark ? "#fff" : "#000",
                  }}
                >
                  {f.title}
                </h2>
                <p
                  style={{
                    fontSize: "16px",
                    lineHeight: 1.65,
                    color: f.dark ? "rgba(255,255,255,0.65)" : "#55534e",
                    marginBottom: "28px",
                  }}
                >
                  {f.body}
                </p>
                <div>
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: 700,
                      fontFamily: MONO,
                      letterSpacing: "-1.5px",
                      color: f.dark ? "#84e7a5" : "#000",
                    }}
                  >
                    {f.stat}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: f.dark ? "rgba(255,255,255,0.5)" : "#9f9b93",
                      marginTop: "2px",
                    }}
                  >
                    {f.statLabel}
                  </div>
                </div>
              </div>
              <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
                <Visual />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
