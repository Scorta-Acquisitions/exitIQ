"use client"

interface SliderInputProps {
  label: string
  value: number
  min: number
  max: number
  displayValue: string
  onChange: (value: number) => void
}

export function SliderInput({ label, value, min, max, displayValue, onChange }: SliderInputProps) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={{ fontSize: "13px", fontWeight: 600, color: "#55534e" }}>{label}</label>
        <span style={{
          background: "#02492a",
          color: "#84e7a5",
          borderRadius: "1584px",
          padding: "3px 12px",
          fontSize: "13px",
          fontWeight: 700,
          fontFamily: "var(--font-space-mono, monospace)",
        }}>{displayValue}</span>
      </div>

      <div style={{ position: "relative", height: "28px", display: "flex", alignItems: "center" }}>
        {/* Track background */}
        <div style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: "4px",
          background: "#eee9df",
          borderRadius: "2px",
          overflow: "hidden",
        }}>
          <div style={{
            width: `${pct}%`,
            height: "100%",
            background: "#02492a",
            transition: "width 100ms ease",
          }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            width: "100%",
            opacity: 0,
            cursor: "pointer",
            height: "28px",
            zIndex: 1,
          }}
        />
        {/* Thumb visual */}
        <div style={{
          position: "absolute",
          left: `calc(${pct}% - 10px)`,
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "#02492a",
          border: "3px solid #fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          pointerEvents: "none",
          transition: "left 100ms ease",
          zIndex: 2,
        }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9f9b93" }}>
        <span>{min} yr</span>
        <span>{max}+ yr</span>
      </div>
    </div>
  )
}
