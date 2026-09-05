import { AmbientVideo } from "@/components/site/ui/AmbientVideo"
import { TextLink } from "@/components/site/ui/TextLink"
import { ROUTES } from "@/lib/site/routes"

export function TransactionCarries() {
  return (
    <section className="bg-paper px-3 py-[clamp(18px,2.5vw,32px)]">
      <div className="border-dfull/8 bg-ground text-d1 relative mx-auto flex min-h-[320px] max-w-[1156px] items-end overflow-hidden rounded-[26px] border">
        <AmbientVideo
          src="/media/archive-hall.mp4"
          ariaLabel="Private business records prepared for a confidential ownership transfer."
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,26,19,.1)_0%,rgba(8,26,19,.82)_82%)]"
        />
        <div className="relative max-w-[720px] px-[clamp(20px,4vw,48px)] py-[clamp(28px,5vw,56px)]">
          <div className="text-signal mb-3.5 font-mono text-[11.5px] tracking-[1.2px] uppercase">Beyond the price</div>
          <h2 className="font-display text-d1 mb-3 text-[clamp(28px,3.8vw,44px)] leading-[1.06] font-normal tracking-[-.9px]">
            Employees, customers, and the company name change hands too.
          </h2>
          <p className="text-d2 mb-[18px] text-[15px] leading-[1.62]">
            We weigh them in buyer selection and negotiation, alongside price.
          </p>
          <TextLink href={ROUTES.why} tone="dark" className="text-[14px]">
            Why Heirloom exists
          </TextLink>
        </div>
      </div>
    </section>
  )
}
