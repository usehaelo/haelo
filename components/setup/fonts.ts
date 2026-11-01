import localFont from "next/font/local";
export const setupJakarta = localFont({
  src: [
    { path: "../../public/fonts/jakarta-400.ttf", weight: "400" },
    { path: "../../public/fonts/jakarta-500.ttf", weight: "500" },
    { path: "../../public/fonts/jakarta-600.ttf", weight: "600" },
    { path: "../../public/fonts/jakarta-700.ttf", weight: "700" },
  ],
  variable: "--setup-body",
  display: "swap",
});
export const setupDisplay = localFont({
  src: "../../public/fonts/bricolage-variable.ttf",
  weight: "600",
  variable: "--setup-display",
  display: "swap",
});
