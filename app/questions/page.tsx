import type { Metadata } from "next"
import { AskForm } from "@/components/site/questions/AskForm"
import { QuestionsAccordion } from "@/components/site/questions/QuestionsAccordion"
import { Container } from "@/components/site/ui/primitives"
import { QUESTION_CATEGORY_LINKS } from "@/lib/site/questions/data"
import { PAGE_META } from "@/lib/site/routes"

export const metadata: Metadata = { title: PAGE_META.questions.title, description: PAGE_META.questions.description }

export default function QuestionsPage() {
  return (
    <>
      <section className="bg-paper px-6 pt-[clamp(48px,6vw,80px)] pb-[clamp(32px,4vw,48px)]">
        <Container>
          <div className="max-w-[760px]">
            <h1 className="font-display mb-5 text-[clamp(34px,5.4vw,62px)] leading-[1.05] font-normal tracking-[-1.3px]">
              Questions owners ask.
            </h1>
            <nav aria-label="Question categories" className="mt-6 flex flex-wrap gap-2">
              {QUESTION_CATEGORY_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="border-hair-2 bg-card text-l2 rounded-full border px-3.5 py-2 font-mono text-[11.5px] tracking-[.6px] uppercase"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#q-ask"
                className="border-brand bg-brand text-cta hover:text-cta rounded-full border px-3.5 py-2 font-mono text-[11.5px] tracking-[.6px] uppercase hover:shadow-[0_10px_26px_rgba(12,54,38,.3)]"
              >
                Ask a question
              </a>
            </nav>
          </div>
        </Container>
      </section>
      <section className="bg-paper px-6 pb-[clamp(56px,7vw,84px)]">
        <Container className="max-w-[880px]">
          <QuestionsAccordion />
          <AskForm />
        </Container>
      </section>
    </>
  )
}
