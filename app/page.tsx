import LandingMotion from "@/components/landing/Motion";
import localFont from "next/font/local";
import Hero from "@/components/landing/Hero";
import DayWithHaelo from "@/components/landing/DayWithHaelo";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import BusinessBible from "@/components/landing/BusinessBible";
import TimerModes from "@/components/landing/TimerModes";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import {
  Problem,
  Security,
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
const bricolage = localFont({
  src: "../public/fonts/bricolage-variable.ttf",
  weight: "600",
  style: "normal",
  variable: "--font-bricolage",
  display: "swap",
});
export default function HomePage() {
  return (
    <div className={`landing ${jakarta.variable} ${bricolage.variable}`}>
      <LandingMotion>
        <a href="#main-content" className="landing-skip">
          Skip to content
        </a>
        <main id="main-content">
          <Hero />
          <Problem />
          <DayWithHaelo />
          <HowItWorks />
          <Features />
          <BusinessBible />
          <TimerModes />
          <Security />
          <Pricing />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />
      </LandingMotion>
    </div>
  );
}
