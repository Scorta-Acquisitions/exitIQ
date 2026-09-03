import Link from "next/link"
import { AdvisorCtaButton } from "@/components/site/advisor/AdvisorCtaButton"
import { Wordmark } from "@/components/site/layout/SiteHeader"
import { CONTACT, FOOTER_GROUPS, ROUTES, SITE_NAME } from "@/lib/site/routes"

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="panel-foot text-d2 relative overflow-hidden px-6 pt-[34px] pb-6">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4 pb-[22px]">
          <div className="flex min-w-0 flex-wrap items-center gap-x-[18px] gap-y-3">
            <Link href={ROUTES.home} aria-label={`${SITE_NAME} home`} className="group inline-flex">
              <Wordmark tone="dark" size={24} />
            </Link>
            <p className="text-d3 max-w-[540px] text-[12.5px] leading-[1.55]">
              Heirloom is a sell-side M&amp;A firm for owners of established private businesses. We prepare the company,
              create buyer competition, negotiate the transaction, and carry the sale through closing.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2.5">
            <AdvisorCtaButton variant="cta" size="sm" />
            <a href={`mailto:${CONTACT.hello}`} className="text-filament inline-block py-2 font-mono text-[12px]">
              {CONTACT.hello}
            </a>
          </div>
        </div>
        <nav aria-label="Footer" className="border-dhair-2 flex flex-wrap gap-x-11 gap-y-1 border-y py-2.5">
          {FOOTER_GROUPS.map((group) => (
            <span key={group.label} className="inline-flex flex-wrap items-baseline gap-x-3.5">
              <span className="text-d4 font-mono text-[10.5px] tracking-[1px] uppercase">{group.label}</span>
              {group.links.map((link) => (
                <Link key={link.label} href={link.href} className="text-d2 inline-block py-1.5 text-[13px]">
                  {link.label}
                </Link>
              ))}
            </span>
          ))}
        </nav>
        <div className="text-d4 flex flex-col gap-1 pt-3.5 font-mono text-[10.5px] leading-[1.65]">
          <span>
            We represent sellers. We do not buy businesses for our own account or take a buyer success fee on a company
            we represent.
          </span>
          <span>
            © {year} Heirloom. All rights reserved. Heirloom provides M&amp;A advisory services in the United States.
            All figures are in US dollars. Information on this site is general and is not legal, tax, investment,
            lending, or accounting advice. Worked examples on this site, including Project Ridgeline, use fictional
            companies, people, buyers, and figures and do not describe a Heirloom client or transaction.
          </span>
        </div>
      </div>
    </footer>
  )
}
