import Link from "next/link"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { BrandLockup } from "@/components/site/brand/BrandLockup"
import { FOOTER_GROUPS, ROUTES, SITE_NAME } from "@/lib/site/routes"

/**
 * Parchment footer: the one deliberately dense area of the site. Link columns run in the relaxed
 * 17px / 2.41 dense-link style under 14px column headings; the legal row is 12px fine print. A top
 * hairline separates it from a page whose last tile is also parchment.
 */
export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="on-light bg-canvas-parchment text-ink-muted-80 border-line border-t px-6 py-16">
      <div className="mx-auto max-w-[980px]">
        <div className="border-line flex flex-wrap items-start justify-between gap-x-10 gap-y-6 border-b pb-8">
          <div className="max-w-[540px]">
            <Link href={ROUTES.home} aria-label={`${SITE_NAME} home`} className="text-heirloom inline-flex">
              <span className="sr-only">{SITE_NAME}</span>
              <BrandLockup markHeight={24} />
            </Link>
            <p className="type-caption text-ink-muted-80 mt-3">
              Heirloom is a sell-side M&amp;A firm for owners of established private businesses. We run the sale from
              preparation through closing.
            </p>
          </div>
          <AdvisorCtaButton />
        </div>
        <nav
          aria-label="Footer"
          className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-x-6 gap-y-6 py-8"
        >
          {FOOTER_GROUPS.map((group) => (
            <div key={group.label}>
              <span className="type-caption-strong text-ink block pb-2">{group.label}</span>
              <ul className="m-0 list-none p-0">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="type-dense-link text-ink-muted-80 hover:text-ink block transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-line type-fine-print text-ink-muted-48 flex flex-col gap-2.5 border-t pt-6 leading-[1.5]">
          <span>
            Heirloom works for sellers only. We do not buy the businesses we represent, and buyers pay us no fee on
            them.
          </span>
          <span>
            © {year} Heirloom. All rights reserved. Heirloom provides M&amp;A advisory services in the United States.
            Figures are in US dollars. Nothing on this site is legal, tax, investment, lending, or accounting advice.
            Worked examples, including Project Ridgeline, use fictional companies, people, buyers, and figures and do
            not describe a Heirloom client or transaction.
          </span>
        </div>
      </div>
    </footer>
  )
}
