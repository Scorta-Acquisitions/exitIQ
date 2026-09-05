import Link from "next/link"
import { Container } from "@/components/site/ui/primitives"
import { ROUTES } from "@/lib/site/routes"

const TERMS: Array<{ href: string; label: string; text: string }> = [
  { href: ROUTES.whoWeAre, label: "Representation", text: "Sellers only." },
  { href: ROUTES.confidentiality, label: "Listing", text: "Never public." },
  { href: ROUTES.questions, label: "Company fit", text: "Usually $1M or more in annual revenue." },
  {
    href: ROUTES.whoWeAre,
    label: "Experience",
    text: "Millions in enterprise value transacted through Heirloom.",
  },
  { href: ROUTES.howItWorks, label: "Timing", text: "40% faster than a traditional sale." },
]

export function TermsStrip() {
  return (
    <section className="border-hair bg-paper border-b px-6 pt-[18px] pb-5">
      <Container className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-7 gap-y-[18px]">
        {TERMS.map((t) => (
          <Link key={t.label} href={t.href} className="group block">
            <span className="text-l4 mb-[5px] block font-mono text-[11px] tracking-[1px] uppercase">{t.label}</span>
            <span className="font-display block text-[17.5px] leading-[1.2]">{t.text}</span>
          </Link>
        ))}
      </Container>
    </section>
  )
}
