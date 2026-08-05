/**
 * Client-side helper for CASE's live Q&A path — used when a question falls
 * through the hand-written QA_MAP fast path (lib/caseChat.ts). Streams the
 * Case Manager Agent's answer from /api/case/chat token-by-token so callers
 * can render it as it arrives.
 */

export type StreamCaseAnswerArgs = {
  message: string
  route: string
  onDelta: (accumulatedText: string) => void
  signal?: AbortSignal
}

export async function streamCaseAnswer({ message, route, onDelta, signal }: StreamCaseAnswerArgs): Promise<string> {
  const res = await fetch("/api/case/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, route }),
    signal,
  })

  if (!res.ok || !res.body) {
    throw new Error(`case chat request failed: ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let accumulated = ""

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    accumulated += decoder.decode(value, { stream: true })
    onDelta(accumulated)
  }

  return accumulated
}
