import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import localFont from "next/font/local";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Mail,
  Users,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import "./auth.css";

export const metadata: Metadata = {
  title: "HAELO — Your workspace",
  robots: { index: false, follow: false },
};
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
  variable: "--auth-jakarta",
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
  variable: "--auth-satoshi",
  display: "swap",
});
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`auth-shell ${jakarta.variable} ${satoshi.variable}`}>
      <a className="auth-skip-link" href="#auth-form">
        Skip to form
      </a>
      <aside className="brand-panel" aria-label="About HAELO">
        <Link className="brand-link" href="/" aria-label="HAELO home">
          <Logo variant="white-on-navy" size="lg" />
        </Link>
        <div className="brand-content">
          <p className="auth-brand-eyebrow">
            <span /> INTELLIGENT ASSISTANCE. A LITTLE AHEAD.
          </p>
          <p className="brand-title">
            Be everywhere.
            <br />
            <span>Miss nothing.</span>
          </p>
          <p className="brand-description">
            Less time managing communication.
            <br />
            More room for the decisions that matter.
          </p>
          <div className="auth-context-preview">
            <div className="auth-context-header">
              <span>
                <Image
                  src="/images/logo/halo-icon.png"
                  alt=""
                  width={23}
                  height={23}
                />{" "}
                Prepared for your review
              </span>
              <span>WORKFLOW PREVIEW</span>
            </div>
            <p className="auth-context-title">The detail, distilled.</p>
            <p className="auth-context-copy">
              Tayo in Marketing is requesting approval for the Q4 campaign
              budget.
            </p>
            <div className="auth-context-sources">
              <span>
                <BookOpen size={13} />
                Business context
              </span>
              <span>
                <Users size={13} />
                Your people
              </span>
            </div>
            <div className="auth-context-result">
              <Check size={15} />
              <span>A thoughtful response. Ready for your decision.</span>
            </div>
          </div>
          <div className="auth-flow">
            <span>
              <Mail size={14} /> Email arrives
            </span>
            <ArrowRight size={13} />
            <span>Context applied</span>
            <ArrowRight size={13} />
            <span>Your decision</span>
          </div>
        </div>
        <div className="brand-footer">
          <span>Prepared by HAELO. Decided by you.</span>
          <span>usehaelo.com</span>
        </div>
      </aside>
      <main className="form-panel" id="auth-form">
        <div className="auth-form-top">
          <Link href="/" className="auth-back-home">
            <ArrowLeft size={14} /> Back to home
          </Link>
          <Link href="/" className="auth-mobile-brand" aria-label="HAELO home">
            <Logo size="sm" />
          </Link>
        </div>
        <div className="form-inner">{children}</div>
        <footer className="auth-form-footer">
          © {new Date().getFullYear()} HAELO. A more considered working day.
        </footer>
      </main>
    </div>
  );
}
