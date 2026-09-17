import Image from "next/image"

/** The founder photograph: an 18px-radius frame with the product shadow, the one shadow the system allows. */
export function FounderPortrait() {
  return (
    <div className="bg-surface-2 shadow-product relative aspect-[4/5] w-full overflow-hidden rounded-lg">
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
