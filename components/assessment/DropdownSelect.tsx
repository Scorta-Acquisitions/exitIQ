"use client"

import * as Select from "@radix-ui/react-select"

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
  if (dark) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {label && (
          <label
            htmlFor={id}
            style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: "0.5px", textTransform: "uppercase" }}
          >
            {label}
          </label>
        )}
        <Select.Root value={value} onValueChange={onChange}>
          <Select.Trigger
            id={id}
            className="scorta-input scorta-select-trigger"
            style={{ appearance: "none", WebkitAppearance: "none", paddingRight: "48px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <Select.Value placeholder={<span style={{ color: "rgba(255,255,255,0.35)" }}>{placeholder}</span>} />
            <Select.Icon className="scorta-select-icon" style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", flexShrink: 0 }}>
              ▼
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              className="scorta-select-content"
              position="popper"
              side="bottom"
              sideOffset={6}
              style={{
                width: "var(--radix-select-trigger-width)",
                background: "#02492a",
                border: "1.5px solid rgba(255,255,255,0.18)",
                borderRadius: "14px",
                padding: "6px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                zIndex: 200,
                overflow: "hidden",
              }}
            >
              <Select.Viewport style={{ maxHeight: "calc(8 * 42px)", overflowY: "auto" }}>
                {options.map((opt) => (
                  <Select.Item
                    key={opt.value}
                    value={opt.value}
                    className="scorta-select-item scorta-select-item--dark"
                  >
                    <Select.ItemText>{opt.label}</Select.ItemText>
                    <Select.ItemIndicator style={{ marginLeft: "auto", color: "#84e7a5", fontSize: "13px" }}>
                      ✓
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: "13px", fontWeight: 600, color: "#55534e", letterSpacing: "0.3px" }}>
          {label}
        </label>
      )}
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger
          id={id}
          className="scorta-select-trigger"
          style={{
            width: "100%",
            appearance: "none",
            WebkitAppearance: "none",
            background: value ? "#02492a" : "#faf9f7",
            border: `1.5px solid ${value ? "#02492a" : "#dad4c8"}`,
            borderRadius: "10px",
            padding: "12px 40px 12px 14px",
            fontSize: "14px",
            fontWeight: value ? 600 : 400,
            color: value ? "#fff" : "#55534e",
            outline: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 150ms ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: "left",
          }}
        >
          <Select.Value placeholder={<span style={{ color: "#9f9b93" }}>{placeholder}</span>} />
          <Select.Icon style={{ color: value ? "rgba(255,255,255,0.7)" : "#9f9b93", fontSize: "11px", flexShrink: 0 }}>
            ▼
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className="scorta-select-content"
            position="popper"
            side="bottom"
            sideOffset={6}
            style={{
              width: "var(--radix-select-trigger-width)",
              background: "#fff",
              border: "1.5px solid #dad4c8",
              borderRadius: "14px",
              padding: "6px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
              zIndex: 200,
              overflow: "hidden",
            }}
          >
            <Select.Viewport style={{ maxHeight: "calc(8 * 42px)", overflowY: "auto" }}>
              {options.map((opt) => (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  className="scorta-select-item scorta-select-item--light"
                >
                  <Select.ItemText>{opt.label}</Select.ItemText>
                  <Select.ItemIndicator style={{ marginLeft: "auto", color: "#02492a", fontSize: "13px" }}>
                    ✓
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}
