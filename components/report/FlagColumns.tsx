"use client"

interface FlagColumnsProps {
  flags: {
    green: string[]
    yellow: string[]
    red: string[]
  }
}

const COLUMNS = [
  { key: "green" as const, label: "Strengths", icon: "✓", color: "#84e7a5", bg: "rgba(132,231,165,0.08)", border: "rgba(132,231,165,0.2)" },
  { key: "yellow" as const, label: "Watch Items", icon: "!", color: "#fbbd41", bg: "rgba(251,189,65,0.08)", border: "rgba(251,189,65,0.25)" },
  { key: "red" as const, label: "Deal Risks", icon: "✕", color: "#ff6b6b", bg: "rgba(255,107,107,0.08)", border: "rgba(255,107,107,0.25)" },
]

export function FlagColumns({ flags }: FlagColumnsProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
      {COLUMNS.map((col) => {
        const items = flags[col.key]
        if (items.length === 0) return null
        return (
          <div
            key={col.key}
            style={{
              background: col.bg,
              border: `1.5px solid ${col.border}`,
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%",
                background: col.bg,
                border: `1.5px solid ${col.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 700, color: col.color, flexShrink: 0,
              }}>{col.icon}</div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: col.color }}>
                {col.label} ({items.length})
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", gap: "8px", alignItems: "flex-start",
                    paddingBottom: i < items.length - 1 ? "10px" : 0,
                    borderBottom: i < items.length - 1 ? `1px solid ${col.border}` : "none",
                  }}
                >
                  <div style={{
                    width: "5px", height: "5px", borderRadius: "50%",
                    background: col.color, flexShrink: 0, marginTop: "6px",
                  }} />
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.55, margin: 0 }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
