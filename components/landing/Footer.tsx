"use client"

const FOOTER_COLS = [
  { head: "Product", links: ["Exit IQ", "Marketplace", "AI Due Diligence", "Deal Documents", "Pricing"] },
  { head: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
  { head: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
]

interface FooterProps {
  onStart: () => void
}

export function Footer({ onStart }: FooterProps) {
  return (
    <footer style={{ background: "#faf9f7", padding: "48px 32px 40px", borderTop: "1px solid #dad4c8" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* CTA strip */}
        <div
          style={{
            background: "#000",
            borderRadius: "40px",
            padding: "48px 56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "32px",
            marginBottom: "56px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-1px", color: "#fff", marginBottom: "8px" }}
            >
              Ready to know your number?
            </div>
            <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
              Free Exit IQ analysis. No broker calls. No commitment.
            </div>
          </div>
          <button
            onClick={onStart}
            style={{
              background: "#84e7a5",
              color: "#000",
              border: "none",
              borderRadius: "1584px",
              padding: "14px 28px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 150ms",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "rotateZ(-4deg) translateY(-2px)"
              e.currentTarget.style.boxShadow = "rgb(255,255,255) -5px 5px"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = ""
              e.currentTarget.style.boxShadow = ""
            }}
          >
            Get your Exit IQ score →
          </button>
        </div>

        {/* Footer links */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "32px", marginBottom: "40px" }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  background: "#02492a",
                  borderRadius: "7px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L13 5.5V10.5L8 14L3 10.5V5.5L8 2Z" fill="#84e7a5" />
                </svg>
              </div>
              <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.3px" }}>Scorta</span>
            </div>
            <p style={{ fontSize: "13px", lineHeight: 1.6, color: "#9f9b93" }}>
              AI-native deal platform for Main Street businesses.
            </p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.head}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "#000",
                  marginBottom: "14px",
                }}
              >
                {col.head}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                {col.links.map((l) => (
                  <a
                    key={l}
                    href="#"
                    style={{ fontSize: "13px", color: "#9f9b93", transition: "color 150ms" }}
                    onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "#000")}
                    onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "#9f9b93")}
                  >
                    {l}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: "1px solid #dad4c8",
            paddingTop: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "12px", color: "#9f9b93" }}>© 2026 Scorta, Inc. All rights reserved.</span>
          <span style={{ fontSize: "12px", color: "#9f9b93" }}>AI-guided deals for Main Street businesses.</span>
        </div>
      </div>
    </footer>
  )
}
