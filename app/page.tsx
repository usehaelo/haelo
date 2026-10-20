import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import localFont from "next/font/local";
import Navigation from "@/components/landing/Navigation";
import HeroIntelligenceDemo from "@/components/landing/HeroIntelligenceDemo";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import {
  Problem,
  Features,
  ExecutiveExperience,
  Integrations,
  Trust,
  ValueSection,
  FinalCTA,
  Footer,
} from "@/components/landing/Sections";
import "./landing.css";
const jakarta = localFont({
  src: [
    { path: "../public/fonts/jakarta-400.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/jakarta-500.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/jakarta-600.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/jakarta-700.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-jakarta",
  display: "swap",
});
const satoshi = localFont({
  src: [
    {
      path: "../public/fonts/satoshi-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/satoshi-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});
export default function HomePage() {
  return (
    <div className={`landing ${jakarta.variable} ${satoshi.variable}`}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navigation />
      <main id="main-content">
        <section className="hero-section">
          <div className="landing-container hero-layout">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="eyebrow-line" /> INTELLIGENT ASSISTANCE FOR
                MODERN EXECUTIVES
              </p>
              <h1>
                Your inbox is full.
                <br />
                <span>Your mind doesn’t have to be.</span>
              </h1>
              <p className="hero-description">
                Haelo understands the emails that matter, remembers your
                business context, and turns conversations into decisions you can
                approve.
              </p>
              <div className="cta-row">
                <Link href="/auth/signup" className="button">
                  Start 7-day free trial <ArrowRight size={16} />
                </Link>
                <a href="#how-it-works" className="button button-outline">
                  See how Haelo works <ArrowDown size={15} />
                </a>
              </div>
              <div className="hero-assurance">
                <span>7 days free</span>
                <i />
                <span>No credit card</span>
                <i />
                <span>Cancel anytime</span>
              </div>
            </div>
            <div id="hero-demo">
              <HeroIntelligenceDemo />
            </div>
          </div>
          <div className="landing-container hero-baseline">
            <span>BE EVERYWHERE. MISS NOTHING.</span>
            <span>Less noise. More room to lead.</span>
            <a href="#how-it-works" aria-label="Explore how HAELO works">
              <ArrowDown size={16} />
            </a>
          </div>
        </section>
        <Problem />
        <HowItWorks />
        <Features />
        <ExecutiveExperience />
        <Integrations />
        <Trust />
        <Pricing />
        <ValueSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
