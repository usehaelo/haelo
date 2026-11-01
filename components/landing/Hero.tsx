import Navigation from "./Navigation";
import ApprovalPreview from "./ApprovalPreview";
import { Button, Photo, ProofChip, Vector } from "./Primitives";
import { assets } from "./assets";

function Phone() {
  return (
    <div
      className="hero-phone"
      aria-label="Sample Haelo conversation on WhatsApp"
    >
      <span className="phone-hardware phone-action" />
      <span className="phone-hardware phone-volume" />
      <span className="phone-hardware phone-power" />
      <div className="phone-bezel">
        <div className="phone-screen">
          <div className="phone-status">
            <strong>9:41</strong>
            <span>
              <Vector asset={assets.hero.frame} />
              <Vector asset={assets.hero.frame1} />
              <i />
            </span>
          </div>
          <div className="phone-chat-header">
            <span className="phone-back">
              <Vector asset={assets.hero.frame2} />
              12
            </span>
            <span className="phone-avatar">
              <Vector asset={assets.hero.logo1} />
            </span>
            <div>
              <strong>Haelo</strong>
              <small>Your AI Chief of Staff</small>
            </div>
            <Vector asset={assets.hero.frame3} />
            <Vector asset={assets.hero.frame4} />
          </div>
          <div className="phone-conversation">
            <span className="phone-today">Today</span>
            <ApprovalPreview phone autoPlay />
          </div>
          <div className="phone-composer" aria-hidden="true">
            <Vector asset={assets.hero.frame5} />
            <span>Message</span>
            <Vector asset={assets.hero.frame6} />
            <Vector asset={assets.hero.frame7} />
          </div>
          <span className="phone-home" />
        </div>
      </div>
      <span className="phone-island">
        <Vector asset={assets.hero.camera} />
      </span>
    </div>
  );
}

function InboxCountdown() {
  return (
    <div className="inbox-countdown">
      <div className="inbox-header">
        <span className="inbox-icon">
          <Vector asset={assets.hero.iconInbox} />
        </span>
        <span>Inbox · internal emails</span>
        <span className="inbox-live">Live</span>
      </div>
      <div className="inbox-count">
        <div>
          <strong>50</strong>
          <span>unread at 8:00</span>
        </div>
        <Vector asset={assets.hero.iconArrowRight} />
        <div>
          <strong>0</strong>
          <span>waiting on you</span>
        </div>
      </div>
      <ul>
        {[
          ["Tosin · Rice order for Friday", "Approved"],
          ["Kemi · Leave, 12–16 Nov", "Approved"],
          ["Chidi · Saturday shift swap", "Auto-sent"],
        ].map(([title, status]) => (
          <li key={title}>
            <span className="inbox-tick">
              <Vector asset={assets.hero.iconCheck} />
            </span>
            <span>{title}</span>
            <small>{status}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <Photo fixed src={assets.hero.hero.src} priority sizes="100vw" />
      <div className="hero-top-wash" />
      <Navigation />
      <div className="hero-copy landing-container">
        <span className="landing-eyebrow">
          Your AI Chief of Staff — on WhatsApp
        </span>
        <h1 id="hero-heading">
          Your inbox, handled.
          <br />
          <em>While you lead.</em>
        </h1>
        <p>
          Haelo reads every internal email, summarises it in three lines and
          drafts the reply in your voice — then sends it to your WhatsApp.
          Approve with one word, wherever you are.
        </p>
        <div className="landing-cta-row">
          <Button arrow>Start your 30-day pilot</Button>
          <Button href="#how-it-works" variant="secondary">
            <Vector asset={assets.hero.leadingIcon} />
            See how it works
          </Button>
        </div>
      </div>
      <div className="hero-product landing-container">
        <InboxCountdown />
        <Phone />
        <div className="hero-proof">
          <ProofChip
            icon={assets.hero.icon}
            title="3 drafts approved"
            description="While you were in a meeting"
          />
          <ProofChip
            icon={assets.hero.iconTimer}
            title="Auto-sends in 10:00"
            description="Unless you say otherwise"
          />
          <ProofChip
            icon={assets.hero.icon1}
            title="Tosin has your reply"
            description="Approved on WhatsApp · 9:43"
          />
        </div>
      </div>
      <div className="hero-bottom-fade" />
    </section>
  );
}
