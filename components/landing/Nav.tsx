// use client: onStartWidget scroll callback + mouse-event hover handlers on CTA button
"use client"

interface NavProps {
  onStartWidget: () => void
}

export function Nav({ onStartWidget }: NavProps) {
  return (
    <nav
      aria-label="Main navigation"
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
      <div className="flex items-center gap-2.5">
        <div className="bg-matcha-800 flex h-8 w-8 items-center justify-center rounded-lg" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L13 5.5V10.5L8 14L3 10.5V5.5L8 2Z" fill="#84e7a5" />
          </svg>
        </div>
        <span className="text-near-black text-[17px] font-bold tracking-[-0.5px]">Scorta</span>
      </div>

      {/* Links */}
      <div className="flex items-center gap-8">
        {["For Sellers", "For Buyers", "How It Works", "Pricing"].map((l) => (
          <a
            key={l}
            href="#"
            className="text-warm-charcoal hover:text-near-black text-sm font-medium transition-colors duration-150"
          >
            {l}
          </a>
        ))}
      </div>

      {/* CTA */}
      <div className="flex items-center gap-2.5">
        <a href="#" className="text-warm-charcoal px-3.5 py-2 text-sm font-medium">
          Sign in
        </a>
        <button
          onClick={onStartWidget}
          aria-label="Get started with Exit IQ"
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
