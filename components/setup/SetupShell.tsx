import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

export const setupImages = {
  skyline: "/images/landing/51-1597-0a181.png",
  boardroom: "/images/landing/50-977-f6f1b.png",
  company: "/images/landing/67-1881-13107.png",
  executive: "/images/landing/72-1884-fc755.png",
  commute: "/images/landing/50-977-06b98.png",
  airport: "/images/landing/50-977-ecc62.png",
  site: "/images/landing/50-977-787bc.png",
  clouds: "/images/landing/49-818-73f81.png",
};
export const SUPPORT = "https://wa.me/2347048048164";

export function SetupStages({
  active,
  complete = false,
}: {
  active: number;
  complete?: boolean;
}) {
  return (
    <ol className="setup-stages" aria-label="Setup progress">
      {["Account", "You & company", "Connect", "Teach Haelo"].map(
        (label, index) => (
          <li
            key={label}
            aria-current={!complete && index === active ? "step" : undefined}
            className={
              complete || index < active
                ? "stage-done"
                : index === active
                  ? "stage-active"
                  : ""
            }
          >
            {(complete || index < active) && <Check size={12} />}
            {label}
          </li>
        ),
      )}
    </ol>
  );
}

export default function SetupShell({
  children,
  image = setupImages.skyline,
  badge,
  title,
  description,
  headerAction,
  login = false,
  className = "",
}: {
  children: ReactNode;
  image?: string;
  badge: string;
  title: string;
  description: string;
  headerAction?: ReactNode;
  login?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`setup-experience${login ? " setup-login" : ""} ${className}`}
    >
      <a className="setup-skip" href="#setup-form">
        Skip to form
      </a>
      <div className="setup-left">
        <header className="setup-header">
          <Link href="/" aria-label="Haelo home">
            <Image
              src="/images/landing/51-1628-49f59.svg"
              width={108}
              height={40}
              alt="Haelo"
              priority
            />
          </Link>
          {headerAction}
        </header>
        <main id="setup-form" className="setup-form-area">
          {children}
        </main>
        <footer className="setup-footer">
          {login && (
            <span>
              © 2026 Haelo · <a href={SUPPORT}>Privacy</a> ·{" "}
              <a href={SUPPORT}>Terms</a>
            </span>
          )}
          <a href={SUPPORT}>Need help? Talk to Haelo</a>
        </footer>
      </div>
      <aside className="setup-photo-panel" aria-label="Haelo at work">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 800px) 100vw, 56vw"
          priority
          className="setup-photo"
        />
        <div className="setup-photo-shade" />
        <span className="setup-photo-badge">
          <i />
          {badge}
        </span>
        <div className="setup-photo-copy">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </aside>
    </div>
  );
}
