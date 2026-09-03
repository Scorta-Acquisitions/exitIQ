import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { twMerge } from "tailwind-merge"

/** Centered 1180px content column used by every section. */
export function Container({ className, children, ...rest }: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={twMerge("mx-auto w-full max-w-[1180px]", className)} {...rest}>
      {children}
    </div>
  )
}

/** Small mono uppercase label that introduces a section. */
export function Eyebrow({ className, children, ...rest }: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={twMerge("eyebrow text-l3", className)} {...rest}>
      {children}
    </div>
  )
}

/** Blinking filament dot that marks a live panel. */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={twMerge(
        "bg-filament animate-blink inline-block h-[7px] w-[7px] rounded-full shadow-[0_0_10px_rgba(76,226,126,.9)] motion-reduce:animate-none",
        className
      )}
    />
  )
}

/** Progress ticks: `filled` bright, `current` half-lit, the rest dim. */
export function ProgressTicks({
  total,
  filled,
  current,
  label,
}: {
  total: number
  filled: number
  current?: number
  label?: string
}) {
  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={filled}
      className="flex gap-[5px]"
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={twMerge(
            "ease-e1 h-[2px] w-4 rounded-full transition-[background,box-shadow] duration-500",
            i < filled
              ? "bg-filament shadow-[0_0_7px_rgba(76,226,126,.55)]"
              : i === current
                ? "bg-filament/45"
                : "bg-dfull/14"
          )}
        />
      ))}
    </span>
  )
}

/** Small decorative seal dot used on paper cards inside dark panels. */
export function SealDot({ className }: { className?: string }) {
  return <span aria-hidden="true" className={twMerge("bg-seal-dot inline-block h-3 w-3 rounded-full", className)} />
}

/** Bordered key/value row used throughout record cards. */
export function KeyValueRow({
  label,
  children,
  className,
  labelClassName,
}: {
  label: ReactNode
  children: ReactNode
  className?: string
  labelClassName?: string
}) {
  return (
    <div className={twMerge("flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-[9px]", className)}>
      <span className={twMerge("text-l3 font-mono text-[12px]", labelClassName)}>{label}</span>
      {children}
    </div>
  )
}

/** Visually hidden text for assistive technology. */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>
}
