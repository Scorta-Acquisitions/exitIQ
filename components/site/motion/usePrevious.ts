import { useEffect, useRef } from "react"

/**
 * The value `value` had at the last committed render, kept in a ref that is updated after each render.
 * A render can compare itself with the one before it — which ticks are newly lit, which stages just came
 * on — and stagger only what changed. On the first render there is nothing before it, so `value` itself
 * comes back and the comparison finds no change: nothing staggers on mount.
 */
export function usePrevious<T>(value: T): T {
  const ref = useRef(value)
  const previous = ref.current
  useEffect(() => {
    ref.current = value
  }, [value])
  return previous
}
