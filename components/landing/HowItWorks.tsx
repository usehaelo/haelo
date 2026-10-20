"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Mail,
  MessageSquare,
  Settings2,
  Users,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import "./workflow.css";

const steps = [
  {
    title: "An email arrives.",
    short: "Receive",
    copy: "A request, a follow-up, a decision. Your team keeps working in the inbox they already use.",
    icon: Mail,
    label: "Incoming communication",
    visual: "The important request, recognised.",
    detail: "An email from your team becomes a clear starting point.",
    foot: "Your team’s existing inbox. A more considered next step.",
  },
  {
    title: "Context makes the difference.",
    short: "Understand",
    copy: "Your Business Bible and staff directory give HAELO the background to understand the request.",
    icon: BookOpen,
    label: "Business context",
    visual: "Your business. Understood.",
    detail: "The people, knowledge, and tone behind every response.",
    foot: "A response grounded in your working context.",
  },
  {
    title: "The next move is prepared.",
    short: "Prepare",
    copy: "A concise summary and suggested response bring the decision to you, with WhatsApp in your workflow.",
    icon: MessageSquare,
    label: "Prepared for your review",
    visual: "A clear next step. Ready for you.",
    detail: "A concise summary and a thoughtful draft, together.",
    foot: "Less time composing. More room to consider.",
  },
  {
    title: "You make the call.",
    short: "Decide",
    copy: "Review the response and decide what happens next. Set your communication workflow to match how you lead.",
    icon: Check,
    label: "Executive review",
    visual: "Your judgment. Less busywork.",
    detail: "Review the context. Refine the response. Decide.",
    foot: "Intelligent assistance, with you in control.",
  },
];

function StepExample({ index }: { index: number }) {
  if (index === 0)
    return (
      <div className="workflow-example">
        <div className="workflow-example-label">
          <Mail size={14} /> From your inbox <span>Illustrative request</span>
        </div>
        <strong>Q4 campaign budget approval</strong>
        <p>“The campaign budget is ready. Can we proceed?”</p>
        <div className="workflow-person">
          <span>TA</span>
          <div>
            <strong>Tayo</strong>
            <small>Marketing Lead</small>
          </div>
        </div>
      </div>
    );
  if (index === 1)
    return (
      <div className="workflow-context-list">
        {[
          [BookOpen, "Business Bible", "Your company knowledge"],
          [Users, "Staff directory", "Tayo · Marketing Lead"],
          [Settings2, "Your tone", "Your communication guidelines"],
        ].map(([Icon, title, copy]) => {
          const ItemIcon = Icon as typeof BookOpen;
          return (
            <div key={String(title)}>
              <ItemIcon size={17} />
              <span>
                <strong>{String(title)}</strong>
                <small>{String(copy)}</small>
              </span>
              <Check size={14} />
            </div>
          );
        })}
      </div>
    );
  if (index === 2)
    return (
      <div className="workflow-example">
        <div className="workflow-example-label">
          <MessageSquare size={14} /> Suggested response{" "}
          <span>For your review</span>
        </div>
        <p className="workflow-draft">
          “Hi Tayo, thanks for putting this together. The budget is approved.
          Please proceed and keep me updated on the campaign performance.”
        </p>
        <div className="workflow-review-label">
          <span /> Prepared by HAELO. Awaiting your decision.
        </div>
      </div>
    );
  return (
    <div className="workflow-example workflow-decision">
      <div className="workflow-example-label">
        <Check size={14} /> The final decision is yours
      </div>
      <strong>Review. Refine. Decide.</strong>
      <p>
        A prepared response gives you a head start. Your review determines what
        happens next.
      </p>
      <a href="#hero-demo">
        Try the approval demonstration <ArrowRight size={14} />
      </a>
    </div>
  );
}

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const preview = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const manualPosition = useRef<number | null>(null);
  const choose = (index: number, revealOnMobile = false) => {
    manualPosition.current = window.scrollY;
    activeRef.current = index;
    setActive(index);
    if (revealOnMobile && window.matchMedia("(max-width: 600px)").matches) {
      preview.current?.focus({ preventScroll: true });
      preview.current?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    }
  };
  useEffect(() => {
    let frame = 0;
    const desktop = window.matchMedia("(min-width: 601px)");
    const update = () => {
      frame = 0;
      if (!desktop.matches) return;
      if (manualPosition.current !== null) {
        if (Math.abs(window.scrollY - manualPosition.current) < 40) return;
        manualPosition.current = null;
      }
      const anchor = Math.max(180, window.innerHeight * 0.42);
      const rects = rows.current.map((row) => row?.getBoundingClientRect());
      if (
        !rects[0] ||
        !rects[3] ||
        rects[0].top > window.innerHeight ||
        rects[3].bottom < 100
      )
        return;
      // Evaluate the entire sequence, with a 24px buffer around boundaries.
      // A stable decision band prevents adjacent steps trading focus while scrolling.
      let next = activeRef.current;
      while (
        next < steps.length - 1 &&
        anchor > (rects[next]!.bottom + rects[next + 1]!.top) / 2 + 24
      )
        next++;
      while (
        next > 0 &&
        anchor < (rects[next - 1]!.bottom + rects[next]!.top) / 2 - 24
      )
        next--;
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
      }
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return (
    <section id="how-it-works" className="landing-section workflow-section">
      <div className="landing-container">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">02 / A quieter way to work</p>
            <h2>
              Your communication,
              <br />
              <span>intelligently handled.</span>
            </h2>
          </div>
          <p>
            From the first request to your final decision.
            <br />
            Four thoughtful steps. One simpler working day.
          </p>
        </div>
        <div className="workflow-layout">
          <div className="workflow-steps" aria-label="How HAELO works">
            {steps.map((step, i) => (
              <button
                ref={(el) => {
                  rows.current[i] = el;
                }}
                data-step={i}
                key={step.title}
                className={`workflow-step ${i === active ? "active" : ""}`}
                onClick={() => choose(i, true)}
                aria-pressed={i === active}
                aria-controls="workflow-preview"
              >
                <span className="step-number">0{i + 1}</span>
                <span>
                  <strong>{step.title}</strong>
                  <span>{step.copy}</span>
                </span>
                <ArrowRight size={18} />
              </button>
            ))}
          </div>
          <div className="workflow-visual">
            <div
              className="workflow-preview"
              id="workflow-preview"
              ref={preview}
              tabIndex={-1}
              role="region"
              aria-label="Workflow preview"
            >
              <header className="workflow-preview-header">
                <Logo variant="white-on-navy" size="sm" />
                <span>THE HAELO WORKFLOW</span>
              </header>
              <div className="workflow-panels">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div
                      className="workflow-panel"
                      key={step.short}
                      hidden={active !== i}
                      data-panel={i}
                    >
                      <div className="workflow-phase">
                        <span>
                          <Icon size={15} />
                          {step.label}
                        </span>
                        <span>
                          0{i + 1} <span>/ 04</span>
                        </span>
                      </div>
                      <h3>{step.visual}</h3>
                      <p className="workflow-panel-description">
                        {step.detail}
                      </p>
                      <StepExample index={i} />
                      <div className="workflow-panel-note">
                        <Check size={14} />
                        {step.foot}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="workflow-preview-controls">
                <div
                  className="workflow-progress"
                  role="group"
                  aria-label="Choose a workflow step"
                >
                  {steps.map((step, i) => (
                    <button
                      key={step.short}
                      onClick={() => choose(i)}
                      aria-label={`Show step ${i + 1}: ${step.short}`}
                      aria-pressed={active === i}
                    >
                      <span>0{i + 1}</span>
                      <span>{step.short}</span>
                    </button>
                  ))}
                </div>
                <div className="workflow-arrows">
                  <button
                    onClick={() => choose(active - 1)}
                    disabled={active === 0}
                    aria-label="Previous workflow step"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    onClick={() => choose(active + 1)}
                    disabled={active === steps.length - 1}
                    aria-label="Next workflow step"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
            <p className="visual-caption">
              Explore each step. You’re always in control.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
