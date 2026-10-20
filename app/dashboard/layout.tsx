import type { Metadata } from "next";
import localFont from "next/font/local";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import "./dashboard.css";
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
    <div className={`dashboard-shell ${jakarta.variable} ${satoshi.variable}`}>
      <a className="dashboard-skip" href="#dashboard-content">
        Skip to workspace
      </a>
      <DashboardSidebar />
      <div className="dashboard-content" id="dashboard-content">
        {children}
      </div>
    </div>
  );
}
