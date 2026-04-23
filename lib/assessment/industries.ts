export interface Industry {
  value: string
  label: string
  sdeMultiple: [number, number]
  revenueMultiple: [number, number]
  marketScore: number // 0-100 base for market positioning
}

export const INDUSTRIES: Industry[] = [
  {
    value: "saas_tech",
    label: "Technology / SaaS",
    sdeMultiple: [3.0, 6.0],
    revenueMultiple: [1.0, 3.0],
    marketScore: 90,
  },
  {
    value: "it_services",
    label: "IT Services / MSP",
    sdeMultiple: [2.5, 4.0],
    revenueMultiple: [0.8, 1.5],
    marketScore: 78,
  },
  {
    value: "healthcare_medical",
    label: "Healthcare – Medical",
    sdeMultiple: [3.0, 5.0],
    revenueMultiple: [0.8, 1.8],
    marketScore: 83,
  },
  {
    value: "healthcare_dental",
    label: "Healthcare – Dental",
    sdeMultiple: [3.0, 5.5],
    revenueMultiple: [0.8, 2.0],
    marketScore: 85,
  },
  {
    value: "healthcare_mental",
    label: "Healthcare – Mental Health",
    sdeMultiple: [2.5, 4.5],
    revenueMultiple: [0.7, 1.5],
    marketScore: 80,
  },
  {
    value: "physical_therapy",
    label: "Physical Therapy & Rehab",
    sdeMultiple: [2.5, 4.0],
    revenueMultiple: [0.6, 1.2],
    marketScore: 76,
  },
  {
    value: "home_services",
    label: "Home Services (HVAC, Plumbing, Electrical)",
    sdeMultiple: [2.5, 4.0],
    revenueMultiple: [0.5, 1.0],
    marketScore: 72,
  },
  {
    value: "childcare",
    label: "Childcare & Education",
    sdeMultiple: [2.5, 4.0],
    revenueMultiple: [0.6, 1.2],
    marketScore: 70,
  },
  {
    value: "pet_services",
    label: "Pet Services (Grooming, Boarding, Vet)",
    sdeMultiple: [2.5, 4.0],
    revenueMultiple: [0.6, 1.2],
    marketScore: 70,
  },
  { value: "ecommerce", label: "E-commerce", sdeMultiple: [2.0, 4.0], revenueMultiple: [0.5, 1.5], marketScore: 68 },
  {
    value: "marketing_agency",
    label: "Marketing & Creative Agency",
    sdeMultiple: [2.0, 3.5],
    revenueMultiple: [0.5, 1.0],
    marketScore: 65,
  },
  {
    value: "accounting",
    label: "Accounting & Tax Services",
    sdeMultiple: [2.0, 4.0],
    revenueMultiple: [0.8, 1.5],
    marketScore: 70,
  },
  {
    value: "staffing",
    label: "Staffing & HR Services",
    sdeMultiple: [2.0, 3.5],
    revenueMultiple: [0.3, 0.8],
    marketScore: 65,
  },
  {
    value: "fitness",
    label: "Fitness & Wellness (Gym, Studio)",
    sdeMultiple: [2.0, 3.5],
    revenueMultiple: [0.5, 1.2],
    marketScore: 65,
  },
  {
    value: "automotive",
    label: "Automotive (Repair, Car Wash, Detailing)",
    sdeMultiple: [2.0, 3.5],
    revenueMultiple: [0.5, 1.0],
    marketScore: 65,
  },
  {
    value: "manufacturing_light",
    label: "Manufacturing – Light Industrial",
    sdeMultiple: [2.5, 4.5],
    revenueMultiple: [0.4, 0.9],
    marketScore: 65,
  },
  {
    value: "manufacturing_food",
    label: "Manufacturing – Food Production",
    sdeMultiple: [2.0, 3.5],
    revenueMultiple: [0.3, 0.7],
    marketScore: 60,
  },
  {
    value: "construction",
    label: "Construction & Contracting",
    sdeMultiple: [2.0, 3.5],
    revenueMultiple: [0.3, 0.7],
    marketScore: 62,
  },
  {
    value: "transportation",
    label: "Transportation & Logistics",
    sdeMultiple: [2.0, 3.5],
    revenueMultiple: [0.3, 0.7],
    marketScore: 60,
  },
  {
    value: "real_estate_svcs",
    label: "Real Estate Services (Property Mgmt, Title)",
    sdeMultiple: [2.0, 4.0],
    revenueMultiple: [0.6, 1.2],
    marketScore: 60,
  },
  {
    value: "beauty",
    label: "Beauty & Personal Care (Salon, Spa, Barber)",
    sdeMultiple: [1.5, 3.0],
    revenueMultiple: [0.4, 0.8],
    marketScore: 55,
  },
  { value: "retail", label: "Retail – General", sdeMultiple: [1.5, 3.0], revenueMultiple: [0.3, 0.7], marketScore: 55 },
  {
    value: "food_bev",
    label: "Food & Beverage (Restaurant, Café, Bar)",
    sdeMultiple: [1.5, 3.0],
    revenueMultiple: [0.3, 0.6],
    marketScore: 52,
  },
  { value: "legal", label: "Legal Services", sdeMultiple: [1.5, 3.0], revenueMultiple: [0.5, 1.0], marketScore: 62 },
  {
    value: "other",
    label: "Other / Not Listed",
    sdeMultiple: [2.0, 3.5],
    revenueMultiple: [0.4, 0.9],
    marketScore: 58,
  },
]

export function findIndustry(value: string): Industry {
  return INDUSTRIES.find((i) => i.value === value) ?? INDUSTRIES[INDUSTRIES.length - 1]!
}

export const INDUSTRY_OPTIONS = INDUSTRIES.map(({ value, label }) => ({ value, label }))
