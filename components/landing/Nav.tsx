"use client"

interface NavProps {
  onStartWidget: () => void
}

export function Nav({ onStartWidget }: NavProps) {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 32px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(250,249,247,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #dad4c8",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            background: "#02492a",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L13 5.5V10.5L8 14L3 10.5V5.5L8 2Z" fill="#84e7a5" />
          </svg>
        </div>
        <span style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.5px", color: "#000" }}>Scorta</span>
      </div>

      {/* Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        {["For Sellers", "For Buyers", "How It Works", "Pricing"].map((l) => (
          <a
            key={l}
            href="#"
            style={{ fontSize: "14px", fontWeight: 500, color: "#55534e", transition: "color 150ms" }}
            onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "#000")}
            onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "#55534e")}
          >
            {l}
          </a>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <a href="#" style={{ fontSize: "14px", fontWeight: 500, color: "#55534e", padding: "8px 14px" }}>
          Sign in
        </a>
        <button
          onClick={onStartWidget}
          style={{
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "1584px",
            padding: "9px 20px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 150ms ease",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.transform = "rotateZ(-4deg) translateY(-2px)"
            el.style.boxShadow = "rgb(0,0,0) -5px 5px"
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.transform = ""
            el.style.boxShadow = ""
          }}
        >
          Get started
        </button>
      </div>
    </nav>
  )
}
