import Image from "next/image"

export function FounderPortrait({ radius = 18 }: { radius?: number }) {
  return (
    <div className="bg-paper-2 relative aspect-[4/5] w-full overflow-hidden" style={{ borderRadius: radius }}>
      <Image
        src="/suyash-portrait.jpg"
        alt="Suyash Agrawal, founder and CEO of Heirloom"
        fill
        sizes="(max-width: 720px) 100vw, 400px"
        className="object-cover"
      />
    </div>
  )
}
