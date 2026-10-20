// Shared published plan configuration. Keep checkout behavior in the billing page.
export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  minUsers: number;
  maxUsers: number;
  price: number;
  priceLabel: string;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "individual",
    name: "Individual",
    description: "Everything you need to manage your inbox on your own.",
    minUsers: 1,
    maxUsers: 1,
    price: 15000,
    priceLabel: "1 person",
  },
  {
    id: "team",
    name: "Team",
    description: "For small teams working together from one shared workspace.",
    minUsers: 2,
    maxUsers: 5,
    price: 60000,
    priceLabel: "2–5 people",
  },
  {
    id: "business",
    name: "Business",
    description: "For growing teams that need more people and collaboration.",
    minUsers: 6,
    maxUsers: 15,
    price: 195000,
    priceLabel: "6–15 people",
  },
];
