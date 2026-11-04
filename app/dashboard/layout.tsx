import type { Metadata } from "next";
import localFont from "next/font/local";
import WorkspaceShell from "@/components/dashboard/WorkspaceShell";
import { setupDisplay } from "@/components/setup/fonts";

import "./dashboard.css";
import "./workspace.css";
export const metadata: Metadata = { title: "HAELO — Your workspace" };
const jakarta = localFont({
  src: [
    {
      path: "../../public/fonts/jakarta-400.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/jakarta-500.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/jakarta-600.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/jakarta-700.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--dashboard-font",
  display: "swap",
});
const satoshi = localFont({
  src: [
    {
      path: "../../public/fonts/satoshi-500.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--dashboard-display",
  display: "swap",
});
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${jakarta.variable} ${satoshi.variable} ${setupDisplay.variable}`}
    >
      <WorkspaceShell>{children}</WorkspaceShell>
    </div>
  );
}
