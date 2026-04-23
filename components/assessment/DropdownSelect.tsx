// use client: controlled Radix Select with callback-driven value changes
"use client"

import {
  Content,
  Icon,
  Item,
  ItemIndicator,
  ItemText,
  Portal,
  Root,
  Trigger,
  Value,
  Viewport,
} from "@radix-ui/react-select"
import { cva } from "class-variance-authority"

const triggerVariants = cva(
  "w-full flex items-center justify-between gap-2 border-[1.5px] rounded-[10px] px-3.5 py-3 text-sm font-[inherit] cursor-pointer outline-none appearance-none transition-all duration-150",
  {
    variants: {
      variant: {
        dark: "bg-transparent border-white/15 text-white focus:border-matcha-300",
        light: "border-oat text-warm-charcoal",
      },
      hasValue: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      { variant: "light", hasValue: true, className: "bg-matcha-800 border-matcha-800 text-white font-semibold" },
      { variant: "light", hasValue: false, className: "bg-cream" },
    ],
    defaultVariants: { variant: "light", hasValue: false },
  }
)

const itemVariants = cva(
  "flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg text-sm cursor-pointer outline-none select-none transition-colors duration-100",
  {
    variants: {
      variant: {
        dark: "text-white data-[highlighted]:bg-white/10 data-[state=checked]:text-matcha-300",
        light:
          "text-near-black data-[highlighted]:bg-matcha-800/5 data-[state=checked]:text-matcha-800 data-[state=checked]:font-semibold",
      },
    },
    defaultVariants: { variant: "light" },
  }
)

const contentVariants = cva("rounded-[14px] p-1.5 shadow-lg overflow-hidden z-[200]", {
  variants: {
    variant: {
      dark: "bg-matcha-800 border border-white/18",
      light: "bg-white border border-oat",
    },
  },
  defaultVariants: { variant: "light" },
})

interface DropdownSelectProps {
  id: string
  label: string
  value: string
  options: { value: string; label: string }[]
  placeholder: string
  onChange: (value: string) => void
  dark?: boolean
}

export function DropdownSelect({ id, label, value, options, placeholder, onChange, dark }: DropdownSelectProps) {
  const variant = dark ? "dark" : "light"

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className={
            dark
              ? "text-[13px] font-semibold tracking-[0.5px] text-white/60 uppercase"
              : "text-warm-charcoal text-[13px] font-semibold tracking-[0.3px]"
          }
        >
          {label}
        </label>
      )}

      <Root value={value} onValueChange={onChange}>
        <Trigger id={id} className={triggerVariants({ variant, hasValue: !!value })}>
          <Value placeholder={<span className={dark ? "text-white/35" : "text-warm-silver"}>{placeholder}</span>} />
          <Icon
            aria-hidden="true"
            className={dark ? "shrink-0 text-[11px] text-white/50" : "text-warm-silver shrink-0 text-[11px]"}
          >
            ▼
          </Icon>
        </Trigger>

        <Portal>
          <Content
            className={contentVariants({ variant })}
            position="popper"
            side="bottom"
            sideOffset={6}
            style={{ width: "var(--radix-select-trigger-width)" }}
          >
            <Viewport style={{ maxHeight: "calc(8 * 42px)", overflowY: "auto" }}>
              {options.map((opt) => (
                <Item key={opt.value} value={opt.value} className={itemVariants({ variant })}>
                  <ItemText>{opt.label}</ItemText>
                  <ItemIndicator
                    aria-hidden="true"
                    className={dark ? "text-matcha-300 text-[13px]" : "text-matcha-800 text-[13px]"}
                  >
                    ✓
                  </ItemIndicator>
                </Item>
              ))}
            </Viewport>
          </Content>
        </Portal>
      </Root>
    </div>
  )
}
