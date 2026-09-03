import { SellerHome } from "@/components/scorta/SellerHome"
import { PERSONA } from "@/lib/persona"

export const metadata = {
  title: "Seller Home — Scorta Boardroom",
}

export default function DashboardPage() {
  return <SellerHome persona={PERSONA} />
}
