// use client: the bar reads the scroll position for its two states, the current section and the page progress, and holds the phone menu
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type CSSProperties, type ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { AdvisorCtaButton, AdvisorTrigger } from "@/components/site/advisor/AdvisorCtaButton"
import { BrandLockup } from "@/components/site/brand/BrandLockup"
import { useAdvisor } from "@/components/site/providers/SiteStateProvider"
import { Button } from "@/components/site/ui/Button"
import { type BarState, CURRENT_SECTION_OFFSET, currentSection, nextBarState, pageProgress } from "@/lib/site/bar"
import { cn } from "@/lib/site/cn"
import {
  MOBILE_NAV_LINKS,
  NAV_GROUPS,
  type RoutePath,
  ROUTES,
  SITE_NAME,
  SUBNAV,
  type SubNav,
  type SubNavLink,
} from "@/lib/site/routes"
import { BAR_H } from "@/lib/site/scroll"

/**
 * The one sticky bar: a single 52px row (`--bar-h`) on every route in both of its states, so the page never
 * shifts and the hero starts directly under it. Everything visible is an absolutely positioned *surface*
 * inside the flow box, 52px tall in every state. Past 44px of scroll the material turns from the opaque
 * near-black to dark glass with a hairline; back at 16px it returns. That is the only thing a scroll changes.
 *
 * The row spans the viewport (2026-09-12, after Suyash asked for the brand and the pill equidistant from their
 * edges and the rest centred on the page): from the nav breakpoint it is a three-column grid inset 24px from
 * both edges (`px-6`, the tiles' own gutter), the brand at the start of the first column, the primary
 * navigation in the middle column, the action cluster at the end of the third, 24px of grid gap keeping each
 * cluster clear of the navigation. The side columns are `minmax(0,1fr)` and `minmax(auto,1fr)`: equal shares
 * while both clusters fit theirs, so the navigation's centre is the viewport's; where the action cluster is
 * wider than its share (a narrow desktop under the widest scrubber reading) its column grows to its content
 * and the navigation gives way to the left by exactly the difference, whole labels over a held centre. The
 * brand yields the other way: the lockup shows only where its column holds it, the mark stands in below.
 * Under the nav breakpoint the row is the phone's flex row: the brand, then the pill and the menu button.
 *
 * On a desktop page with page context (`SUBNAV[pathname]`) the action cluster carries, from landing, the
 * *scrubber* (the title, or title · current section, with a 2px reading rule for page progress, whose menu
 * lists the sections and, where the page's call to action is an anchor, the advisor) and the page's pill;
 * home and the 404 carry the advisor pill. Nothing about the brand changes between the states. Below 834px
 * the groups fold into a menu that overlays the page (the page's sections first, then every destination,
 * then the advisor), and the row carries at most one filled pill: the page's where it has one, the
 * advisor's once scrolled otherwise.
 */

function sectionTops(links: SubNavLink[]): Array<{ href: string; top: number }> {
  const tops: Array<{ href: string; top: number }> = []
  links.forEach((link) => {
    const el = document.getElementById(link.href.slice(1))
    if (el) tops.push({ href: link.href, top: el.getBoundingClientRect().top })
  })
  return tops
}

function Caret() {
  return (
    <svg aria-hidden="true" width="8" height="5" viewBox="0 0 10 6" className="block opacity-70">
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

/* ------------------------------------------------------------------------------------------------
 * The brand: both variants rendered, the context and the width decide which one shows; the state never does
 * on a desktop, so the groups never move at a flip.
 *
 * Desktop (≥ 834), the grid: the lockup (135.9px at a 28px mark, `lockupMetrics`: the mark 27.29, a 6px gap and
 * the word Heirloom 102.61 in Mona Sans 450 at width 90, 27.5px) shows where the first column holds it. On home and
 * the 404 both clusters fit their equal shares, so the column is (viewport − 48 of insets − 48 of grid gap − the
 * 366.95px navigation) / 2, which reaches 135.9 at a 734.8px viewport (`HOME_LOCKUP_FROM`), under the 834px nav
 * breakpoint: home and the 404 carry the lockup at every desktop width and no rule is needed for them. On a page
 * with context the action cluster can be wider than its share and take the first column's room, so the rule counts
 * the widest cluster on the site (`WIDEST_CLUSTER`, /why reading "Why Heirloom · How businesses sell today" beside
 * its advisor pill, measured over every page and section): the first column holds the lockup once viewport − 96 −
 * 366.95 − WIDEST_CLUSTER ≥ 135.9, which is `CONTEXT_LOCKUP_FROM` (970; `max-[970px]` is `width < 970px`); a static
 * rule, so the brand never swaps as the reading changes. Under 862px even the mark, the navigation and that widest
 * cluster cannot all stand whole (28 + 24 + 366.95 + 24 + 370.31 + 48 = 861.26), so the desktop cluster is capped at
 * the row's remaining budget, `100vw − CLUSTER_RESERVE`, and its min-w-0 chain truncates the scrubber's label by the
 * shortfall (27.3px at 834 in that one reading) with the mark and the navigation still whole and 24px apart.
 * Phones (< 834): the lockup whenever the row carries no pill (home and the 404 at landing); it fits beside the
 * menu button from 236px (`PHONE_LOCKUP_FROM`, the measured 235.9 rounded up), under the narrowest phone, so no
 * width rule is needed; the mark
 * whenever a pill is in the row.
 * The widths every threshold above is derived from are `lib/site/bar.ts`'s seven constants.
 * ---------------------------------------------------------------------------------------------- */
const LOCKUP_CLASS = cn(
  "text-heirloom",
  "max-nav:group-data-[context=page]:hidden max-nav:group-data-[state=scrolled]:hidden",
  "nav:max-[970px]:group-data-[context=page]:hidden"
)
const MARK_CLASS = cn(
  "text-heirloom hidden",
  "max-nav:group-data-[context=page]:block max-nav:group-data-[state=scrolled]:block",
  "nav:max-[970px]:group-data-[context=page]:block"
)

/** The menu button's glyph: two 1px lines 7px apart that meet at the centre and cross as an X while the menu is open. */
const BURGER_LINE =
  "bg-on-dark ease-e1 absolute inset-x-0 h-px transition-transform duration-200 motion-reduce:transition-none"

/** The phone row's pill: a 34px visual pill inside a 44px hit box, so the bar reads as a bar with a button. */
const PHONE_PILL_HIT = "pressable nav:hidden inline-flex h-11 shrink-0 items-center"
const PHONE_PILL =
  "bg-primary text-on-primary rounded-pill type-nav-link inline-flex h-[34px] items-center px-3.5 whitespace-nowrap"

/** A dropdown card row (the groups' links, the scrubber's sections): `--i` staggers its arrival by 40ms a row. */
const ROW_CLASS = "nav-dd-row hover:bg-line-soft block rounded-sm px-3 py-2.5"
const rowStyle = (i: number) => ({ "--i": i }) as CSSProperties

/** A dropdown card under its trigger; `align="end"` hangs it from the trigger's end, for the row's right side. */
function DropdownCard({
  label,
  minWidth,
  align = "start",
  children,
}: {
  label: string
  minWidth: number
  align?: "start" | "end"
  children: ReactNode
}) {
  return (
    <div className={cn("nav-dd-menu", align === "end" && "-right-4 left-auto")}>
      <div className="bg-surface border-line rounded-lg border p-2" style={{ minWidth }}>
        <span className="type-fine-print text-fg-3 border-line-soft mb-1 block border-b px-3 pt-1.5 pb-2.5">
          {label}
        </span>
        {children}
      </div>
    </div>
  )
}

export function SiteBar() {
  const pathname = usePathname()
  const { openAdvisor } = useAdvisor()
  const subnav: SubNav | undefined = SUBNAV[pathname as RoutePath]
  const context = subnav ? "page" : "site"

  const [state, setState] = useState<BarState>("landing")
  const [current, setCurrent] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const stateRef = useRef<BarState>("landing")
  const currentRef = useRef<string | null>(null)
  const headerRef = useRef<HTMLElement>(null)
  const frame = useRef(0)
  const ruleRef = useRef<HTMLSpanElement>(null)
  const burgerRef = useRef<HTMLButtonElement>(null)

  /** One read per frame: the state, the current section, and the reading rule (written to the DOM, never state). */
  const measure = useCallback(() => {
    frame.current = 0
    const y = window.scrollY
    const next = nextBarState(stateRef.current, y)
    if (next !== stateRef.current) {
      stateRef.current = next
      setState(next)
    }
    if (!subnav) return
    const section = currentSection(sectionTops(subnav.links), BAR_H + CURRENT_SECTION_OFFSET)
    if (section !== currentRef.current) {
      currentRef.current = section
      setCurrent(section)
    }
    if (ruleRef.current) {
      const p = pageProgress(y, document.documentElement.scrollHeight, window.innerHeight)
      ruleRef.current.style.width = `${Math.round(p * 1000) / 10}%`
    }
  }, [subnav])

  useEffect(() => {
    const schedule = () => {
      if (!frame.current) frame.current = window.requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      if (frame.current) window.cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [measure])

  // A route change closes the menu (its effect below restores the page's scrolling).
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // A dropdown link keeps the focus through Next's client-side navigation, and `.nav-dd:focus-within`
  // (styles/site.css) then holds its menu open over the new page until the visitor clicks somewhere else —
  // measured on the served build: after clicking "How it works" in The process and moving the pointer to the
  // page's centre, the group read `:hover` false but `:focus-within` true, its menu visible at opacity 1. So a
  // route change blurs the active element when it sits inside one of the bar's dropdowns, and nothing else:
  // the focus anywhere on the page, the skip link and the tab order are untouched, and Tab into a trigger
  // still opens its menu through the same `:focus-within` rule.
  useEffect(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement && headerRef.current?.contains(active) && active.closest(".nav-dd")) {
      active.blur()
    }
  }, [pathname])

  // Escape closes a dropdown the keyboard opened. The card is CSS-driven (`.nav-dd:hover`, `.nav-dd:focus-within`
  // in styles/site.css), so with the trigger focused there was nothing Escape could do: measured on the served
  // build, the group stayed visible at opacity 1 with focus-within true at 1440×900 and 1280×720, and only
  // tabbing out of the group hid it. The key now marks the group `data-closed`, which the last rule in that block
  // overrides the open states with, and pulls the focus back to the trigger when it was inside the card, so the
  // visitor keeps their place in the tab order. The mark is cleared the moment the group stops being dismissed:
  // when the focus leaves it (so Shift+Tab back in reopens it), when the pointer enters it, and when the trigger
  // is pressed again with Enter, Space or ArrowDown. Nothing outside the bar's own dropdowns is touched, and the
  // phone overlay keeps its own Escape handler below.
  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const groupOf = (node: unknown) => (node instanceof Element ? node.closest<HTMLElement>(".nav-dd") : null)
    const onKeyDown = (event: KeyboardEvent) => {
      const group = groupOf(document.activeElement)
      if (!group) return
      if (event.key === "Escape") {
        group.dataset.closed = "true"
        const trigger = group.querySelector("button")
        if (trigger && trigger !== document.activeElement) trigger.focus()
        return
      }
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") delete group.dataset.closed
    }
    const onFocusOut = (event: FocusEvent) => {
      const group = groupOf(event.target)
      if (group && !group.contains(event.relatedTarget instanceof Node ? event.relatedTarget : null)) {
        delete group.dataset.closed
      }
    }
    const onPointerOver = (event: Event) => {
      const group = groupOf(event.target)
      if (group) delete group.dataset.closed
    }
    header.addEventListener("keydown", onKeyDown)
    header.addEventListener("focusout", onFocusOut)
    header.addEventListener("pointerover", onPointerOver)
    return () => {
      header.removeEventListener("keydown", onKeyDown)
      header.removeEventListener("focusout", onFocusOut)
      header.removeEventListener("pointerover", onPointerOver)
    }
  }, [])

  // While the menu is open the page behind it holds still (scrollY kept), and Escape closes it back onto the button.
  useEffect(() => {
    if (!menuOpen) return
    const html = document.documentElement
    const previousOverflow = html.style.overflow
    html.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setMenuOpen(false)
      burgerRef.current?.focus()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      html.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKey)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)
  const advisorFromMenu = () => {
    setMenuOpen(false)
    openAdvisor()
  }

  /** Whether the phone row carries a pill: the page's on a page with context, the advisor's once home has scrolled. */
  const phoneRowHasPill = Boolean(subnav) || state === "scrolled"
  const links = subnav?.links ?? []
  const currentLabel = links.find((l) => l.href === current)?.label ?? null
  const ctaHref = subnav?.cta.href

  const sectionLinks = (className: (isCurrent: boolean) => string, onClick?: () => void, staggered = false) =>
    links.map((link, i) => (
      <li key={link.href}>
        <a
          href={link.href}
          onClick={onClick}
          aria-current={current === link.href ? "true" : undefined}
          className={className(current === link.href)}
          style={staggered ? rowStyle(i) : undefined}
        >
          {link.label}
        </a>
      </li>
    ))

  return (
    <header
      ref={headerRef}
      role="banner"
      className="group on-dark sticky top-0 z-50 h-[var(--bar-h)]"
      data-state={state}
      data-context={context}
      data-menu={menuOpen ? "open" : "closed"}
    >
      <a
        href="#main"
        className="bg-surface text-fg border-line type-caption-strong sr-only rounded-sm border whitespace-nowrap focus:not-sr-only focus:absolute focus:top-full focus:left-6 focus:z-60 focus:mt-3 focus:inline-flex focus:h-11 focus:items-center focus:px-4"
      >
        Skip to content
      </a>

      <div
        data-testid="bar-surface"
        className={cn(
          "absolute inset-x-0 top-0 transition-colors duration-300",
          state === "landing" ? "bg-surface-black" : "glass-dark"
        )}
      >
        {/* The scrolled hairline: its own element so the surface keeps its exact height in both states. */}
        <span
          aria-hidden="true"
          className={cn(
            "bg-line pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-300",
            state === "landing" ? "opacity-0" : "opacity-100"
          )}
        />

        <div className="nav:grid nav:grid-cols-[minmax(0,1fr)_auto_minmax(auto,1fr)] nav:gap-6 flex h-[var(--bar-h)] items-center gap-2 px-6">
          <Link
            href={ROUTES.home}
            className="inline-flex shrink-0 items-center justify-self-start"
            aria-label={`${SITE_NAME} home`}
          >
            <span className="sr-only">{SITE_NAME}</span>
            <BrandLockup reveal markHeight={28} className={LOCKUP_CLASS} />
            <BrandLockup reveal variant="mark" markHeight={28} className={MARK_CLASS} />
          </Link>

          <nav aria-label="Primary navigation" className="nav:flex hidden items-center gap-7 justify-self-center">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="nav-dd">
                <button
                  type="button"
                  aria-haspopup="true"
                  className="type-nav-link text-on-dark/80 hover:text-on-dark inline-flex h-11 items-center gap-1.5 whitespace-nowrap transition-colors duration-200"
                >
                  {group.label} <Caret />
                </button>
                <DropdownCard label={group.label} minWidth={group.minWidth}>
                  {group.links.map((link, i) => (
                    <Link key={link.label} href={link.href} className={ROW_CLASS} style={rowStyle(i)}>
                      <span className="type-caption-strong text-fg block">{link.label}</span>
                      <span className="type-fine-print text-fg-3 mt-1 block">{link.note}</span>
                    </Link>
                  ))}
                </DropdownCard>
              </div>
            ))}
            <Link
              href={ROUTES.buyers}
              className="type-nav-link text-on-dark/80 hover:text-on-dark inline-flex h-11 items-center whitespace-nowrap transition-colors duration-200"
            >
              For buyers <span aria-hidden="true">↗</span>
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2 justify-self-end">
            {!subnav ? (
              <AdvisorCtaButton size="nav" className="nav:inline-flex hidden">
                Talk to an M&amp;A advisor
              </AdvisorCtaButton>
            ) : (
              <div className="nav:flex hidden max-w-[calc(100vw-490.95px)] min-w-0 items-center gap-5">
                <nav aria-label="Page navigation" className="nav-dd min-w-0">
                  <button
                    type="button"
                    aria-haspopup="true"
                    data-testid="bar-scrubber"
                    className="type-nav-link text-on-dark relative flex h-11 max-w-full min-w-0 items-center whitespace-nowrap"
                  >
                    <span className="truncate">
                      {currentLabel ? `${subnav.title} · ${currentLabel}` : subnav.title}
                    </span>
                    {/* The reading rule: a hairline track the label's width, the accent fill inside it at page progress. */}
                    <span
                      aria-hidden="true"
                      data-testid="bar-track"
                      className="bg-line absolute inset-x-0 bottom-3 h-0.5"
                    >
                      <span
                        ref={ruleRef}
                        data-testid="bar-progress"
                        className="bg-accent absolute inset-y-0 left-0 w-0"
                      />
                    </span>
                  </button>
                  <DropdownCard label={subnav.title} minWidth={240} align="end">
                    {links.length > 0 ? (
                      <ul className="m-0 list-none p-0">
                        {sectionLinks(
                          (isCurrent) =>
                            cn(ROW_CLASS, "type-caption-strong", isCurrent ? "text-fg" : "text-fg-2 hover:text-fg"),
                          undefined,
                          true
                        )}
                      </ul>
                    ) : null}
                    {ctaHref ? (
                      <AdvisorTrigger
                        className={cn(
                          ROW_CLASS,
                          "type-caption-strong text-accent border-line-soft mt-1 w-full border-t pt-3"
                        )}
                        style={rowStyle(links.length)}
                      >
                        Talk to an advisor
                      </AdvisorTrigger>
                    ) : null}
                  </DropdownCard>
                </nav>
                {ctaHref ? (
                  <Button href={ctaHref} size="nav" data-testid="bar-cta">
                    {subnav.cta.label}
                  </Button>
                ) : (
                  <AdvisorCtaButton size="nav" data-testid="bar-cta">
                    {subnav.cta.label}
                  </AdvisorCtaButton>
                )}
              </div>
            )}

            {subnav ? (
              ctaHref ? (
                <a href={ctaHref} className={PHONE_PILL_HIT} data-testid="bar-cta">
                  <span className={PHONE_PILL}>{subnav.cta.label}</span>
                </a>
              ) : (
                <AdvisorTrigger className={PHONE_PILL_HIT} data-testid="bar-cta">
                  <span className={PHONE_PILL}>{subnav.cta.label}</span>
                </AdvisorTrigger>
              )
            ) : state === "scrolled" ? (
              <AdvisorTrigger className={PHONE_PILL_HIT}>
                <span className={PHONE_PILL}>Talk to an M&amp;A advisor</span>
              </AdvisorTrigger>
            ) : null}

            <button
              ref={burgerRef}
              type="button"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((o) => !o)}
              className="nav:hidden -mr-3 inline-flex h-11 w-11 shrink-0 items-center justify-center"
              data-testid="nav-burger"
            >
              <span aria-hidden="true" className="relative block h-[7px] w-[18px]">
                <span className={cn(BURGER_LINE, "top-0", menuOpen && "translate-y-[3px] rotate-45")} />
                <span className={cn(BURGER_LINE, "bottom-0", menuOpen && "-translate-y-[3px] -rotate-45")} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {menuOpen ? (
        // One opaque surface under the bar to the bottom of the viewport (taller content scrolls inside it), so the
        // page never shows through it and no page control doubles the menu's own; the bar row keeps its material.
        <div
          id="mobile-nav"
          className="bg-surface-black nav:hidden border-line absolute inset-x-0 top-full flex max-h-[calc(100dvh-var(--bar-h))] min-h-[calc(100dvh-var(--bar-h))] flex-col overflow-y-auto border-t px-6 pt-2 pb-6"
        >
          {/* The page's own sections first, in the display voice, over the muted list of every destination. */}
          {subnav && links.length > 0 ? (
            <>
              <span className="type-fine-print text-fg-2 block pt-3 pb-1">{subnav.title}</span>
              <ul className="border-line m-0 list-none border-b p-0 pb-2">
                {sectionLinks(() => "type-tagline text-fg flex min-h-11 items-center", closeMenu)}
              </ul>
            </>
          ) : null}
          <ul className="m-0 list-none p-0">
            {MOBILE_NAV_LINKS.map((link, i) => (
              <li key={`${link.href}-${link.label}`}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className={cn(
                    "type-tagline text-fg-2 flex min-h-11 items-center py-2",
                    i < MOBILE_NAV_LINKS.length - 1 && "border-line-soft border-b"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button
            variant={phoneRowHasPill ? "secondary" : "primary"}
            onClick={advisorFromMenu}
            className="mt-4 self-start"
            data-testid="open-advisor"
          >
            Talk to an M&amp;A advisor
          </Button>
        </div>
      ) : null}
    </header>
  )
}
