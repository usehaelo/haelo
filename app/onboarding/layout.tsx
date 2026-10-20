import type { Metadata } from "next";
import localFont from "next/font/local";
import "./onboarding.css";
const jakarta = localFont({
  src: [
    { path: "../../public/fonts/jakarta-400.ttf", weight: "400" },
    { path: "../../public/fonts/jakarta-500.ttf", weight: "500" },
    { path: "../../public/fonts/jakarta-600.ttf", weight: "600" },
    { path: "../../public/fonts/jakarta-700.ttf", weight: "700" },
  ],
  variable: "--onboarding-font",
  display: "swap",
});
const satoshi = localFont({
  src: "../../public/fonts/satoshi-500.woff2",
  variable: "--onboarding-display",
  display: "swap",
});
export const metadata: Metadata = {
  title: "HAELO — Make it your own",
  robots: { index: false, follow: false },
};
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${jakarta.variable} ${satoshi.variable}`}>{children}</div>
  );
}
