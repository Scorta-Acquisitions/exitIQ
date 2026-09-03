// use client: mobile navigation toggle and the advisor CTA need browser state
"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { useAdvisor } from "@/components/site/providers/SiteStateProvider"
import { MOBILE_NAV_LINKS, NAV_GROUPS, ROUTES, SITE_NAME } from "@/lib/site/routes"

function Caret() {
  return (
    <svg aria-hidden="true" width="10" height="6" viewBox="0 0 10 6" className="text-l3 block">
      <path
        d="M1 1l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Wordmark({ tone = "light", size = 26 }: { tone?: "light" | "dark"; size?: number }) {
  return (
    <span className="inline-flex items-center gap-[9px]">
      <Image
        src="/brand/heirloom-mark.svg"
        alt=""
        width={size + 4}
        height={size + 4}
        priority
        className={tone === "light" ? "block opacity-[.88] brightness-0" : "block opacity-[.92] brightness-0 invert"}
      />
      <span
        className={`font-display ease-e1 leading-none font-medium tracking-[-.5px] italic transition-colors duration-200 ${
          tone === "light" ? "text-ink group-hover:text-filament-ink" : "text-d1 group-hover:text-filament"
        }`}
        style={{ fontSize: size }}
      >
        {SITE_NAME}
      </span>
    </span>
  )
}

export function SiteHeader() {
  const [navOpen, setNavOpen] = useState(false)
  const pathname = usePathname()
  const { openAdvisor } = useAdvisor()

  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  return (
    <header className="border-hair bg-paper/88 sticky top-0 z-50 border-b backdrop-blur-[14px]">
      <div className="mx-auto grid h-[66px] max-w-[1180px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-6">
        <Link href={ROUTES.home} className="group justify-self-start" aria-label={`${SITE_NAME} home`}>
          <Wordmark />
        </Link>

        <nav aria-label="Primary navigation" className="nav:flex hidden items-center justify-center gap-[30px]">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="nav-dd">
              <button
                type="button"
                aria-haspopup="true"
                className="hover-green text-l2 inline-flex items-center gap-[7px] py-1.5 text-[14px] whitespace-nowrap"
              >
                {group.label} <Caret />
              </button>
              <div className="nav-dd-menu">
                <div
                  className="border-hair-2 bg-card rounded-[14px] border p-2 shadow-[0_24px_60px_rgba(12,54,38,.14)]"
                  style={{ minWidth: group.minWidth }}
                >
                  {group.links.map((link) => (
                    <Link key={link.label} href={link.href} className="group block rounded-[9px] px-3 py-[9px]">
                      <span className="text-ink ease-e1 group-hover:text-filament-ink block text-[14px] font-medium transition-colors duration-200">
                        {link.label}
                      </span>
                      <span className="text-l3 mt-0.5 block font-mono text-[11px] tracking-[.5px]">{link.note}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <span aria-hidden="true" className="bg-hair-2 h-4 w-px" />
          <Link href={ROUTES.buyers} className="text-l4 text-[13.5px] whitespace-nowrap">
            For buyers{" "}
            <span aria-hidden="true" className="text-[11px]">
              ↗
            </span>
          </Link>
        </nav>

        <div className="col-start-3 flex items-center gap-3 justify-self-end sm:gap-[22px]">
          {/* Below 361px the CTA and the menu button cannot share the row; the menu carries the same CTA. */}
          <AdvisorCtaButton size="md" className="phone:inline-flex hidden h-10 gap-[9px] px-4 text-[13.5px]">
            <span className="cta:inline hidden">Talk to an M&amp;A advisor</span>
            <span className="cta:hidden">Talk to an advisor</span>
          </AdvisorCtaButton>
          <button
            type="button"
            aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={navOpen}
            aria-controls="mobile-nav"
            onClick={() => setNavOpen((o) => !o)}
            className="border-hair-2 nav:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border"
            data-testid="nav-burger"
          >
            <span aria-hidden="true" className="border-ink block h-[9px] w-4 border-y-[1.5px]" />
          </button>
        </div>
      </div>

      {navOpen ? (
        <div id="mobile-nav" className="border-hair nav:hidden flex flex-col gap-0.5 border-t px-6 pt-3 pb-5">
          {MOBILE_NAV_LINKS.map((link, i) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              onClick={() => setNavOpen(false)}
              className={`py-[11px] text-[16px] ${i < MOBILE_NAV_LINKS.length - 1 ? "border-hair border-b" : ""} ${
                link.muted ? "text-l3" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setNavOpen(false)
              openAdvisor()
            }}
            className="bg-brand text-cta mt-3 inline-flex h-[46px] items-center justify-center rounded-full text-[15px] font-medium hover:shadow-[0_10px_26px_rgba(12,54,38,.3)]"
          >
            Talk to an M&amp;A advisor
          </button>
        </div>
      ) : null}
    </header>
  )
}
