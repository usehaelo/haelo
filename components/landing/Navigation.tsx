"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { assets } from "./assets";
import { Button, Vector } from "./Primitives";

const links = [
  ["How it works", "#how-it-works"],
  ["Features", "#features"],
  ["Security", "#security"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
];

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function dismiss(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [open]);
  return (
    <header className="landing-nav">
      <nav className="landing-nav-bar" aria-label="Main navigation">
        <Link href="/" aria-label="Haelo home">
          <Vector asset={assets.hero.logo} />
        </Link>
        <div className="landing-nav-links">
          {links.map(([text, href]) => (
            <a href={href} key={href}>
              {text}
            </a>
          ))}
        </div>
        <div className="landing-nav-actions">
          <Link href="/auth/login" className="landing-signin">
            Sign in
          </Link>
          <Button small arrow>
            Start free pilot
          </Button>
          <button
            ref={toggle}
            type="button"
            className="landing-menu-toggle"
            aria-expanded={open}
            aria-controls="landing-mobile-menu"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>
      {open && (
        <nav
          id="landing-mobile-menu"
          className="landing-mobile-menu"
          aria-label="Mobile navigation"
        >
          {links.map(([text, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {text}
            </a>
          ))}
          <Link href="/auth/login">Sign in</Link>
        </nav>
      )}
    </header>
  );
}
