"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
const links = [
  ["How it works", "#how-it-works"],
  ["Features", "#features"],
  ["Pricing", "#pricing"],
];
export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 16);
    handle();
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open]);
  return (
    <header className={`landing-nav ${scrolled || open ? "nav-solid" : ""}`}>
      <nav className="landing-container nav-inner" aria-label="Main navigation">
        <Link href="/" aria-label="HAELO home">
          <Logo />
        </Link>
        <div className="desktop-links">
          {links.map(([name, href]) => (
            <a href={href} key={href}>
              {name}
            </a>
          ))}
        </div>
        <div className="nav-actions">
          <Link className="login-link" href="/auth/login">
            Log in
          </Link>
          <Link className="button button-small" href="/auth/signup">
            Start free <ArrowRight size={14} />
          </Link>
          <button
            className="menu-toggle"
            ref={toggle}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-controls="mobile-navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>
      {open && (
        <nav
          id="mobile-navigation"
          className="mobile-navigation"
          aria-label="Mobile navigation"
        >
          {links.map(([name, href]) => (
            <a href={href} key={href} onClick={() => setOpen(false)}>
              {name}
            </a>
          ))}
          <Link href="/auth/login">Log in</Link>
        </nav>
      )}
    </header>
  );
}
