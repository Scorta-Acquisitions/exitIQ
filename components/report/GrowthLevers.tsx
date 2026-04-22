"use client"

interface GrowthLeversProps {
  growthText: string
}

const DEFAULT_LEVERS = [
  "Add capacity in your highest-margin service line",
  "Implement a referral program to lower customer acquisition costs",
  "Introduce recurring service contracts to build predictable revenue",
  "Expand geographic reach within a 60-mile radius",
]

export function GrowthLevers({ growthText }: GrowthLeversProps) {
  const hasText = growthText.trim().length > 0

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Owner's words */}
      {hasText && (
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          padding: "18px",
          position: "relative",
        }}>
          <div style={{
            fontSize: "32px", color: "rgba(132,231,165,0.3)", lineHeight: 1,
            fontFamily: "Georgia, serif", position: "absolute", top: "10px", left: "16px",
          }}>&ldquo;</div>
          <p style={{
            fontSize: "15px", color: "rgba(255,255,255,0.8)", lineHeight: 1.65,
            margin: 0, paddingLeft: "24px", paddingTop: "8px", fontStyle: "italic",
          }}>
            {growthText}
          </p>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "10px", paddingLeft: "24px" }}>
            — Your words to the next owner
          </div>
        </div>
      )}

      {/* Expansion bullets */}
      <div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px" }}>
          {hasText ? "AI-Identified Opportunities" : "Common Growth Levers for This Profile"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {DEFAULT_LEVERS.map((lever, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "flex-start", gap: "10px",
                padding: "12px 14px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{
                width: "20px", height: "20px", borderRadius: "50%",
                background: "rgba(132,231,165,0.1)", border: "1px solid rgba(132,231,165,0.2)",
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px", fontWeight: 700, color: "#84e7a5",
              }}>{i + 1}</div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5, margin: 0 }}>
                {lever}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
