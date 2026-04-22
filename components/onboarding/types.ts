export type QuestionType = "cards" | "chips" | "contact"

export interface OptionValue {
  value: string
  label: string
  sub?: string
}

export interface Question {
  id: string
  headline: string
  sub?: string
  type: QuestionType
  options?: OptionValue[]
  multi?: boolean
  skip?: OptionValue | null
}

export interface ContactValue {
  name?: string
  email?: string
  biz?: string
}

export type AnswerValue = OptionValue | OptionValue[] | ContactValue | null

export interface Answers {
  role?: OptionValue
  industry?: OptionValue
  revenue?: OptionValue
  years?: OptionValue
  timeline?: OptionValue
  concerns?: OptionValue[]
  contact?: ContactValue
  [key: string]: AnswerValue | undefined
}

export type Phase = "questions" | "processing" | "results"

export interface ScoreLabel {
  label: string
  color: string
  desc: string
}
