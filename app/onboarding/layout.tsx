import type { Metadata } from "next";
import { setupJakarta, setupDisplay } from "@/components/setup/fonts";
import "@/components/setup/setup.css";
export const metadata: Metadata = {
  title: "Haelo — Set up your workspace",
  robots: { index: false, follow: false },
};
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${setupJakarta.variable} ${setupDisplay.variable}`}>
      {children}
    </div>
  );
}
