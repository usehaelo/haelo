import { assets } from "./assets";
import { Button, CONTACT_URL, Heading, Vector } from "./Primitives";

// The Figma marketing offer is intentionally separate from the existing billing plan IDs.
// These CTAs start signup/contact; they never select a subscription or initiate checkout.
const plans = [
  {
    name: "Starter",
    price: "₦150k",
    description: "For a single executive getting started with Haelo.",
    features: [
      "Up to 3 email accounts",
      "Business Bible up to 20 pages",
      "WhatsApp notifications",
      "Email history dashboard",
      "Standard 10-minute timer",
    ],
  },
  {
    name: "Professional",
    price: "₦300k",
    description:
      "For the executive who wants rules by staff level and a monthly report.",
    features: [
      "All email providers",
      "Unlimited Business Bible",
      "Custom timer per staff level",
      "Priority support",
      "Monthly performance report",
    ],
  },
  {
    name: "Executive",
    price: "₦500k",
    description:
      "For leadership teams of up to three executives in one company.",
    features: [
      "Up to 3 executives",
      "Everything in Professional",
      "Dedicated onboarding session",
      "Slack integration (coming)",
      "Monthly strategy review call",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organisations with 5+ executives and bespoke needs.",
    features: [
      "5+ executives",
      "Custom integrations",
      "SLA guarantees",
      "Dedicated account manager",
      "Bespoke knowledge base",
    ],
  },
];
export default function Pricing() {
  return (
    <section
      className="landing-section pricing-section"
      id="pricing"
      aria-labelledby="pricing-heading"
    >
      <Vector
        asset={assets.pricing.watermarkHaeloMark}
        className="pricing-watermark"
      />
      <div className="landing-container">
        <Heading
          eyebrow="Pricing"
          id="pricing-heading"
          description="One subscription per executive. Your first 30 days are free while we tune Haelo to your business."
        >
          Priced for the value <em>of your time.</em>
        </Heading>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`pricing-card${plan.name === "Professional" ? " pricing-featured" : ""}`}
            >
              <h3>{plan.name}</h3>
              <p className="plan-price">
                <strong>{plan.price}</strong>
                {plan.name !== "Enterprise" && <span>/month</span>}
              </p>
              <p className="plan-description">{plan.description}</p>
              <Button
                small
                variant={plan.name === "Professional" ? "primary" : "secondary"}
                href={plan.name === "Enterprise" ? CONTACT_URL : "/auth/signup"}
              >
                {plan.name === "Enterprise"
                  ? "Talk to sales"
                  : "Start 30-day pilot"}
              </Button>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Vector asset={assets.pricing.iconCheck} />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
