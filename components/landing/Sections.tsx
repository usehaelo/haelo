import Link from "next/link";
import { assets } from "./assets";
import { Button, CONTACT_URL, Heading, Photo, Vector } from "./Primitives";

export { default as Problem } from "./Problem";

const securityItems = [
  {
    icon: assets.security.iconLock,
    title: "OAuth only",
    text: "Connected through Google, Microsoft or Zoho sign-in. Haelo never sees or stores your password.",
  },
  {
    icon: assets.security.iconShieldCheck,
    title: "Internal emails only",
    text: "A hard-coded domain filter. Client, vendor and partner emails are never touched.",
  },
  {
    icon: assets.security.iconSparkles,
    title: "Encrypted end to end",
    text: "Business Bible and messages encrypted at rest and in transit.",
  },
  {
    icon: assets.security.iconHistory,
    title: "30-day retention",
    text: "Email content is deleted after 30 days. Only the response log is kept.",
  },
  {
    icon: assets.security.iconRefreshCw,
    title: "Revoke in one tap",
    text: "Disconnect your email from the dashboard any time — access ends instantly.",
  },
  {
    icon: assets.security.iconBuilding2,
    title: "Isolated per company",
    text: "Your knowledge base is never shared with, or used for, any other account.",
  },
];
export function Security() {
  return (
    <section
      className="landing-section security-section"
      id="security"
      aria-labelledby="security-heading"
    >
      <Photo fixed src={assets.security.security.src} sizes="100vw" />
      <div className="security-shade" />
      <div className="landing-container">
        <Heading
          eyebrow="Security & control"
          id="security-heading"
          description="You're handing over your inbox. We take that seriously — and you stay in control of every email, always."
        >
          Built for <em>the trust it takes.</em>
        </Heading>
        <div className="security-grid">
          {securityItems.map((item) => (
            <article key={item.title}>
              <span>
                <Vector asset={item.icon} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
export function FinalCTA() {
  return (
    <section
      className="landing-section final-cta-section"
      aria-labelledby="final-heading"
    >
      <div className="landing-container final-cta-panel">
        <Photo
          fixed
          src={assets.cta.skylinePanel.src}
          sizes="(max-width: 767px) 100vw, 1200px"
        />
        <div className="final-cta-shade" />
        <Vector asset={assets.cta.tonePearlTypeMark} width={60} />
        <h2 id="final-heading">
          Your team never waits.
          <br />
          <em>You never fall behind.</em>
        </h2>
        <p>
          Start a 30-day pilot. We’ll set Haelo up with your Business Bible and
          have your first approvals on WhatsApp the same day.
        </p>
        <div className="landing-cta-row">
          <Button variant="inverse" arrow>
            Start your 30-day pilot
          </Button>
          <Button variant="glass" href={CONTACT_URL}>
            Book a demo
          </Button>
        </div>
      </div>
    </section>
  );
}

// Unpublished company/legal pages use the existing support contact, avoiding dead routes.
const footerGroups = [
  {
    title: "PRODUCT",
    links: [
      ["How it works", "#how-it-works"],
      ["Features", "#features"],
      ["Security", "#security"],
      ["Pricing", "#pricing"],
    ],
  },
  {
    title: "COMPANY",
    links: [
      ["About", CONTACT_URL],
      ["Careers", CONTACT_URL],
      ["Contact", CONTACT_URL],
      ["Book a demo", CONTACT_URL],
    ],
  },
  {
    title: "LEGAL",
    links: [
      ["Privacy", CONTACT_URL],
      ["Terms", CONTACT_URL],
      ["Data processing", CONTACT_URL],
    ],
  },
];
export function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" aria-label="Haelo home">
              <Vector asset={assets.footer.toneOxbloodTypeFull} width={108} />
            </Link>
            <p>
              Your AI Chief of Staff. Every internal email read, summarised and
              answered — on WhatsApp.
            </p>
            <Button small arrow>
              Start free pilot
            </Button>
          </div>
          <div className="footer-links">
            {footerGroups.map((group) => (
              <nav key={group.title} aria-label={group.title.toLowerCase()}>
                <h3>{group.title}</h3>
                {group.links.map(([label, href]) => (
                  <Link href={href} key={label}>
                    {label}
                  </Link>
                ))}
              </nav>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Haelo. All rights reserved.</p>
          <p>Made in Nigeria for Africa’s busiest executives</p>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          <Vector asset={assets.footer.toneOxbloodTypeFull} width={1200} />
        </div>
      </div>
    </footer>
  );
}
