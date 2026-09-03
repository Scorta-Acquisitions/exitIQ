import { fieldTone, RECORD_FIELDS } from "@/lib/site/confidentiality/data"

/** The Project Ridgeline company record as one buyer sees it at a given disclosure level. */
export function CompanyRecord({
  level,
  fieldCount = RECORD_FIELDS.length,
  title = "Company record",
  size = "md",
}: {
  level: number
  fieldCount?: number
  title?: string
  size?: "sm" | "md"
}) {
  const fields = RECORD_FIELDS.slice(0, fieldCount)
  return (
    <div
      className={
        size === "sm"
          ? "border-dhair-2 rounded-[14px] border bg-[rgba(3,12,8,.55)]"
          : "border-dhair-2 bg-dfull/[2.5%] overflow-hidden rounded-xl border"
      }
      data-testid="company-record"
    >
      <div
        className={`border-dhair-2 flex items-center justify-between border-b ${size === "sm" ? "px-4 py-2.5" : "px-4 py-[11px]"}`}
      >
        <span
          className={`text-d4 font-mono tracking-[1px] uppercase ${size === "sm" ? "text-[11px]" : "text-[11.5px]"}`}
        >
          {title}
        </span>
      </div>
      <div className={size === "sm" ? "px-4 pt-1 pb-3" : "px-4 pt-1.5 pb-3.5"}>
        {fields.map((f) => {
          const value = f.v[level] ?? f.v[0]
          const tone = fieldTone(value)
          return (
            <div
              key={f.l}
              className={`border-dfull/5 flex flex-wrap gap-x-3.5 border-b ${size === "sm" ? "gap-y-0.5 py-2" : "gap-y-1 py-2.5"}`}
            >
              <span
                className={`text-d4 flex-[0_1_150px] font-mono leading-[1.5] ${size === "sm" ? "text-[11.5px]" : "text-[11px]"}`}
              >
                {f.l}
              </span>
              <span
                className={`ease-e1 flex-[2_1_190px] font-sans transition-colors duration-300 ${
                  size === "sm" ? "text-[13px] leading-[1.45]" : "text-[14px] leading-[1.5]"
                } ${tone === "hidden" ? "text-dfull/30" : tone === "masked" ? "text-dfull/38" : "text-d1"}`}
              >
                {value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
