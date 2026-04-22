"use client"

interface GridChipsProps {
  label: string
  options: { value: string; label: string; sub?: string }[]
  value: string
  onSelect: (value: string) => void
  columns?: number
}

export function GridChips({ label, options, value, onSelect, columns = 2 }: GridChipsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#55534e" }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "7px" }}>
        {options.map((opt) => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              style={{
                background: selected ? "#02492a" : "#faf9f7",
                border: `1.5px solid ${selected ? "#02492a" : "#dad4c8"}`,
                borderRadius: "10px",
                padding: opt.sub ? "10px 10px" : "10px 10px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 130ms ease",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                if (!selected) {
                  e.currentTarget.style.borderColor = "#02492a"
                  e.currentTarget.style.background = "#f0faf5"
                }
              }}
              onMouseLeave={(e) => {
                if (!selected) {
                  e.currentTarget.style.borderColor = "#dad4c8"
                  e.currentTarget.style.background = "#faf9f7"
                }
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 600, color: selected ? "#fff" : "#1a1917" }}>
                {opt.label}
              </div>
              {opt.sub && (
                <div style={{ fontSize: "10px", color: selected ? "rgba(255,255,255,0.7)" : "#9f9b93", marginTop: "2px" }}>
                  {opt.sub}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
