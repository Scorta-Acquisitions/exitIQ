import Link from "next/link"
import { Container } from "@/components/site/ui/primitives"
import { ROUTES } from "@/lib/site/routes"

const TERMS: Array<{ href: string; label: string; text: string }> = [
  { href: ROUTES.whoWeAre, label: "Representation", text: "We work for the seller." },
  { href: ROUTES.confidentiality, label: "Confidentiality", text: "Your company is never publicly listed." },
  {
    href: ROUTES.questions,
    label: "Company fit",
    text: "Established businesses, usually with $1M or more in annual revenue.",
  },
  { href: ROUTES.whoWeAre, label: "Experience", text: "Millions in enterprise value transacted through Heirloom." },
  { href: ROUTES.fees, label: "Economics", text: "Roughly half many traditional broker and M&A fees." },
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
