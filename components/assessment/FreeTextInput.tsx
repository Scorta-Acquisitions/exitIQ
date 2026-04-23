"use client"

interface FreeTextInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  rows?: number
  isPrice?: boolean
}

export function FreeTextInput({ placeholder, value, onChange, rows = 4, isPrice }: FreeTextInputProps) {
  if (isPrice) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "E.g., $1,200,000 — or type 'I have no idea'"}
        className="scorta-input"
        style={{ fontSize: "18px", fontWeight: 600 }}
      />
    )
  }

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="scorta-input"
      style={{ resize: "vertical", lineHeight: 1.6, minHeight: "110px" }}
    />
  )
}
