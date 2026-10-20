import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  FileText,
  Mail,
  MessageSquare,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import Logo from "@/components/ui/Logo";

export function Problem() {
  return (
    <section className="landing-section problem-section">
      <div className="landing-container problem-layout">
        <div>
          <p className="eyebrow">01 / Protect your attention</p>
          <h2>
            Your attention is too
            <br />
            valuable for <span>every email.</span>
          </h2>
        </div>
        <div className="problem-copy">
          <p>
            The requests don’t stop. The approvals add up. And the work that
            needs your judgment waits.
          </p>
          <p>
            HAELO brings the important details together, so you can spend less
            time piecing things together and more time moving things forward.
          </p>
        </div>
        <div className="attention-flow">
          <div>
            <Mail size={20} />
            <span>Requests</span>
            <Clock3 size={20} />
            <span>Follow-ups</span>
            <MessageSquare size={20} />
            <span>Approvals</span>
          </div>
          <ArrowRight className="flow-arrow" size={24} />
          <div className="focused-decision">
            <Image
              src="/images/logo/halo-icon.png"
              width={32}
              height={32}
              alt=""
            />
            <span>One clear next step.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
export function Features() {
  return (
    <section className="landing-section features-section" id="features">
      <div className="landing-container">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">03 / Thoughtfully equipped</p>
            <h2>
              Built around
              <br />
              <span>the way you work.</span>
            </h2>
          </div>
          <p>
            Your knowledge. Your people. Your judgment.
            <br />
            Brought together in one considered workflow.
          </p>
        </div>
        <div className="feature-grid">
          <article className="feature-card feature-bible">
            <div className="feature-copy">
              <BookOpen size={22} />
              <h3>It starts with understanding.</h3>
              <p>
                Your Business Bible gives HAELO the company context behind every
                conversation.
              </p>
            </div>
            <div className="bible-preview">
              <div className="mini-bar">
                <BookOpen size={16} /> Business Bible{" "}
                <span>Company knowledge</span>
              </div>
              {[
                ["Company overview", "The bigger picture"],
                ["Policies & procedures", "How your business works"],
                ["Communication guidelines", "A voice that sounds like you"],
              ].map(([title, text]) => (
                <div className="document-row" key={title}>
                  <FileText size={18} />
                  <div>
                    <strong>{title}</strong>
                    <span>{text}</span>
                  </div>
                  <Check size={14} />
                </div>
              ))}
            </div>
          </article>
          <article className="feature-card feature-drafts">
            <div className="feature-copy">
              <Mail size={22} />
              <h3>A head start on every reply.</h3>
              <p>
                Context-aware drafts turn incoming requests into responses ready
                for your review.
              </p>
            </div>
            <div className="draft-preview">
              <span className="approval-tag">Suggested response</span>
              <p>
                Hi Amaka, thanks for the update. Please send me the final
                agreement for review before we confirm.
              </p>
              <div>
                <Check size={14} /> Prepared with your business context
              </div>
            </div>
          </article>
          <article className="feature-card feature-people">
            <div className="feature-copy">
              <Users size={22} />
              <h3>Knows who’s who.</h3>
              <p>
                A staff directory that puts a name and role behind the request.
              </p>
            </div>
            <div className="people-preview">
              {[
                ["TA", "Tayo", "Marketing Lead"],
                ["AM", "Amaka", "Operations Manager"],
                ["DA", "Daniel", "Business Development"],
              ].map(([initial, name, role]) => (
                <div key={name}>
                  <span className="avatar">{initial}</span>
                  <span>
                    <strong>{name}</strong>
                    <small>{role}</small>
                  </span>
                </div>
              ))}
            </div>
          </article>
          <article className="feature-card feature-history">
            <div className="feature-copy">
              <Clock3 size={22} />
              <h3>The whole picture, in view.</h3>
              <p>
                Follow communication activity without retracing every
                conversation.
              </p>
            </div>
            <div className="activity-preview">
              {[
                ["Email received", "09:41"],
                ["Response prepared", "09:42"],
                ["Ready for review", "09:42"],
              ].map(([title, time], i) => (
                <div key={title}>
                  <span
                    className={
                      i === 2 ? "activity-point highlighted" : "activity-point"
                    }
                  />
                  <span>{title}</span>
                  <time>{time}</time>
                </div>
              ))}
            </div>
          </article>
          <article className="feature-card feature-workflow">
            <div className="feature-copy">
              <Settings2 size={22} />
              <h3>Your rhythm. Your rules.</h3>
              <p>
                Configure response timing and reminders to fit your working day.
              </p>
            </div>
            <div className="workflow-settings">
              <span>Communication workflow</span>
              <strong>
                <span className="status-dot" /> Remind and wait
              </strong>
              <span>Keep a human decision in the loop.</span>
            </div>
          </article>
        </div>
        <p className="visual-caption">
          Illustrative interfaces showing HAELO’s communication workflow.
        </p>
      </div>
    </section>
  );
}
export function ExecutiveExperience() {
  return (
    <section className="landing-section executive-section">
      <div className="landing-container executive-layout">
        <div>
          <p className="eyebrow">04 / A little more headspace</p>
          <h2>
            Stay informed.
            <br />
            <span>Stay in control.</span>
          </h2>
          <p>
            A clear summary. A considered response. An important decision that
            still belongs to you.
          </p>
          <p>
            Receive approval requests through your WhatsApp workflow, so your
            inbox doesn’t have to be your whole working day.
          </p>
          <a href="#hero-demo" className="text-link">
            Try the interactive demonstration <ArrowRight size={16} />
          </a>
        </div>
        <div className="executive-note">
          <div className="note-header">
            <Logo variant="white-on-navy" size="sm" />
            <span>DECISION BRIEF / 01</span>
          </div>
          <span className="note-label">FOR YOUR ATTENTION</span>
          <h3>The detail, distilled.</h3>
          <p>
            Marketing is ready to move forward.
            <br />
            The Q4 budget needs your approval.
          </p>
          <div className="note-rule" />
          <div className="note-row">
            <span>Context</span>
            <strong>Campaign budget request</strong>
          </div>
          <div className="note-row">
            <span>Next step</span>
            <strong>Review the proposed response</strong>
          </div>
          <div className="note-footer">
            <ShieldCheck size={17} />
            Your review. Your decision.
          </div>
        </div>
      </div>
    </section>
  );
}
export function Integrations() {
  return (
    <section className="landing-section integrations-section" id="integrations">
      <div className="landing-container">
        <div className="section-heading center-heading">
          <p className="eyebrow">05 / Right where you work</p>
          <h2>
            Works with the tools
            <br />
            <span>you already use.</span>
          </h2>
          <p>
            Your existing email. Your WhatsApp workflow.
            <br />
            Less switching, more continuity.
          </p>
        </div>
        <div className="integration-list">
          {[
            ["Gmail", "Email connection", true],
            ["Zoho Mail", "Email connection", true],
            ["WhatsApp", "Executive approval workflow", true],
            ["Outlook", "Connection not yet available", false],
          ].map(([name, copy, available]) => (
            <div
              className={`integration-item ${!available ? "integration-planned" : ""}`}
              key={String(name)}
            >
              <span className="integration-icon">
                {name === "WhatsApp" ? (
                  <MessageSquare size={24} />
                ) : (
                  <Mail size={24} />
                )}
              </span>
              <h3>{name}</h3>
              <p>{copy}</p>
              <span className="integration-status">
                {available ? "In your workflow" : "Coming soon"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function Trust() {
  return (
    <section className="landing-section trust-section" id="control">
      <div className="landing-container trust-layout">
        <div>
          <p className="eyebrow">06 / Assistance, with boundaries</p>
          <h2>
            Important decisions
            <br />
            <span>stay with you.</span>
          </h2>
          <p>
            HAELO prepares the way forward. You bring the judgment. Choose a
            review-based workflow when a response needs your attention.
          </p>
        </div>
        <div className="trust-points">
          {[
            [
              ShieldCheck,
              "You choose what happens next.",
              "Review and refine prepared responses before approving them.",
            ],
            [
              Settings2,
              "Your workflow, configured by you.",
              "Set communication timing and reminders to reflect how you operate.",
            ],
            [
              BookOpen,
              "Context you provide.",
              "Connect your email and maintain the company knowledge that informs responses.",
            ],
          ].map(([Icon, title, copy]) => {
            const ItemIcon = Icon as typeof ShieldCheck;
            return (
              <div key={String(title)}>
                <ItemIcon size={21} />
                <div>
                  <h3>{String(title)}</h3>
                  <p>{String(copy)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
export function ValueSection() {
  return (
    <section className="value-section">
      <div className="landing-container">
        <p className="eyebrow">A different kind of working day</p>
        <p className="value-statement">
          Less operational noise.
          <br />
          <span>More room for important decisions.</span>
        </p>
        <div className="value-bottom">
          <span>Intelligence.</span>
          <span>Clarity.</span>
          <span>Control.</span>
          <span>Effortlessness.</span>
        </div>
      </div>
    </section>
  );
}
export function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="landing-container">
        <Image
          src="/images/logo/logowhite.png"
          alt="HAELO"
          width={2172}
          height={724}
          sizes="150px"
          className="closing-logo"
        />
        <p className="eyebrow">Your attention, back where it belongs</p>
        <h2>
          Make room for
          <br />
          what matters.
        </h2>
        <p>
          Spend less time managing communication and more time making the
          decisions that move your business forward.
        </p>
        <div className="cta-row">
          <Link className="button button-white" href="/auth/signup">
            Start free <ArrowRight size={16} />
          </Link>
          <a
            className="button button-light-outline"
            href="https://wa.me/2347048048164"
          >
            Talk to us <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
export function Footer() {
  return (
    <footer className="landing-footer" id="contact">
      <div className="landing-container">
        <div className="footer-main">
          <div>
            <Link href="/" aria-label="HAELO home">
              <Logo size="lg" />
            </Link>
            <p>
              Be everywhere. Miss nothing.
              <br />
              Intelligent assistance for modern executives.
            </p>
          </div>
          <div>
            <h3>Product</h3>
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div>
            <h3>Your workspace</h3>
            <Link href="/auth/login">Log in</Link>
            <Link href="/auth/signup">Start free</Link>
            <a href="#control">Trust &amp; control</a>
          </div>
          <div>
            <h3>Get in touch</h3>
            <p>
              A question about HAELO?
              <br />
              Talk to our team on WhatsApp.
            </p>
            <a href="https://wa.me/2347048048164" className="text-link">
              Talk to us <ArrowRight size={14} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} HAELO. All rights reserved.</span>
          <span>Built for a more considered working day.</span>
        </div>
      </div>
    </footer>
  );
}
