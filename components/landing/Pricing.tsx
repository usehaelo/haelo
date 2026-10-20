"use client";
import Link from "next/link";
import { useState } from "react";
import { PRICING_PLANS as plans } from "@/lib/pricing";
import { ArrowRight, Check, Minus, Plus } from "lucide-react";

export default function Pricing() {
  const [people, setPeople] = useState(3);
  const plan = plans.find((p) => people >= p.minUsers && people <= p.maxUsers)!;
  return (
    <section className="landing-section pricing-section" id="pricing">
      <div className="landing-container">
        <div className="section-heading">
          <p className="eyebrow">07 / Room for your team</p>
          <h2>
            A clearer inbox.
            <br />
            <span>A clear monthly price.</span>
          </h2>
          <p>
            Choose the space your team needs. Start with a 7-day free trial.
          </p>
        </div>
        <div className="pricing-layout">
          <div className="pricing-detail">
            <h3>
              Built for the people
              <br />
              moving your business forward.
            </h3>
            <p>
              One workspace, with the context and communication tools to keep
              everyone moving.
            </p>
            <ul>
              {[
                "Context-aware email drafting",
                "WhatsApp approval workflow",
                "Business Bible and staff directory",
                "Communication activity history",
                "Configurable response workflows",
              ].map((item) => (
                <li key={item}>
                  <Check size={17} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="pricing-tiers">
              {plans.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setPeople(p.minUsers)}
                  aria-pressed={p.name === plan.name}
                >
                  <strong>{p.name}</strong>
                  <span>{p.priceLabel}</span>
                  <span>₦{p.price.toLocaleString("en-NG")}/mo</span>
                </button>
              ))}
            </div>
          </div>
          <div className="price-calculator">
            <div className="price-card-top">
              <span>YOUR WORKSPACE</span>
              <span className="approval-tag">{plan.name}</span>
            </div>
            <label htmlFor="team-size">How many people are on your team?</label>
            <div className="team-counter">
              <button
                aria-label="Remove one person"
                onClick={() => setPeople(Math.max(1, people - 1))}
                disabled={people === 1}
              >
                <Minus size={18} />
              </button>
              <output htmlFor="team-size">
                {people.toString().padStart(2, "0")}
              </output>
              <button
                aria-label="Add one person"
                onClick={() => setPeople(Math.min(15, people + 1))}
                disabled={people === 15}
              >
                <Plus size={18} />
              </button>
            </div>
            <input
              id="team-size"
              aria-label="Team size"
              type="range"
              min="1"
              max="15"
              value={people}
              onChange={(e) => setPeople(Number(e.target.value))}
            />
            <div className="range-labels">
              <span>1 person</span>
              <span>15 people</span>
            </div>
            <div className="price-total">
              <span>Estimated monthly cost</span>
              <p>
                ₦{plan.price.toLocaleString("en-NG")}
                <small> / month</small>
              </p>
              <span>
                {plan.priceLabel} included in the {plan.name.toLowerCase()} plan
              </span>
            </div>
            <Link href="/auth/signup" className="button">
              Start free <ArrowRight size={16} />
            </Link>
            <p className="price-note">
              7-day free trial · Confirm subscription terms at signup.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
