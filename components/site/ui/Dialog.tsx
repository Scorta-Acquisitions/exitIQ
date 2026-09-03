// use client: Radix dialog primitives need browser focus management
"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { type ReactNode, useRef } from "react"
import { twMerge } from "tailwind-merge"

/**
 * Thin wrapper around Radix Dialog so pages never import Radix directly.
 * Provides the blurred green backdrop and the centered panel used by the advisor intake.
 * The dialog is opened from site state rather than a Radix trigger, so it remembers which element
 * had focus when it opened and hands focus back to it on close.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  className?: string
}) {
  // Captured in onOpenAutoFocus, before Radix moves focus into the panel, so it is the real opener.
  const opener = useRef<HTMLElement | null>(null)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-[rgba(6,18,13,.66)] backdrop-blur-[7px]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onOpenAutoFocus={() => {
            const active = document.activeElement
            opener.current = active instanceof HTMLElement && active !== document.body ? active : null
          }}
          onCloseAutoFocus={(event) => {
            const target = opener.current
            if (target && target.isConnected) {
              event.preventDefault()
              target.focus()
            }
          }}
          className={twMerge(
            "fixed top-1/2 left-1/2 z-[101] w-[min(1040px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 outline-none",
            className
          )}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export const DialogClose = DialogPrimitive.Close
