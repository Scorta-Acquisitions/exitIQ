import type { Metadata } from "next"
import { AskForm } from "@/components/site/questions/AskForm"
import { QuestionsAccordion } from "@/components/site/questions/QuestionsAccordion"
import { Button } from "@/components/site/ui/Button"
import { Container, Tile } from "@/components/site/ui/primitives"
import { QUESTION_CATEGORY_LINKS } from "@/lib/site/questions/data"
import { PAGE_META } from "@/lib/site/routes"

export const metadata: Metadata = { title: PAGE_META.questions.title, description: PAGE_META.questions.description }

export default function QuestionsPage() {
  return (
    <>
      <Tile tone="light">
        <Container className="text-center">
          <h1 className="type-hero text-fg">Questions owners ask.</h1>
          {/* One nav: the six compact category pills (44px targets) on their row, the page's primary on its own row beneath. */}
          <nav aria-label="Question categories" className="mt-8">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {QUESTION_CATEGORY_LINKS.map((l) => (
                <Button key={l.href} variant="secondary" size="compact" href={l.href}>
                  {l.label}
                </Button>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Button href="#q-ask">Ask a question</Button>
            </div>
          </nav>
        </Container>
      </Tile>

      <Tile tone="parchment">
        <Container>
          <QuestionsAccordion />
        </Container>
      </Tile>

      <Tile tone="light">
        <Container size="text">
          <AskForm />
        </Container>
      </Tile>
    </>
  )
}
