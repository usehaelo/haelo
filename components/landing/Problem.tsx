"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCheck,
  Clock3,
  Mail,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { assets } from "./assets";
import { Photo } from "./Primitives";
import { useDemoTimeline } from "./Motion";
const phases = ["The waiting", "The clarity", "The freedom"];
export default function Problem() {
  const ref = useRef<HTMLElement>(null);
  const timeline = useDemoTimeline(ref, 3, 4200);
  const [manual, setManual] = useState<number | null>(null);
  const phase = manual ?? timeline.step;
  function choose(index: number) {
    timeline.interact();
    setManual(index);
  }
  return (
    <section
      ref={ref}
      className="lux-problem"
      aria-labelledby="problem-heading"
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty(
          "--lux-x",
          `${((event.clientX - rect.left) / rect.width) * 100}%`,
        );
        event.currentTarget.style.setProperty(
          "--lux-y",
          `${((event.clientY - rect.top) / rect.height) * 100}%`,
        );
      }}
    >
      <div className="landing-container lux-stage" data-phase={phase}>
        <Photo
          fixed
          src={assets.problem.glassStage.src}
          alt="Executive staying connected while her team works"
          sizes="100vw"
          className="lux-photo"
        />
        <div className="lux-shade" />
        <div className="lux-spotlight" />
        <header className="lux-header">
          <span>
            <i />
            THE ART OF LEADING WELL
          </span>
          <span className="lux-edition">01 / THE DAILY BOTTLENECK</span>
        </header>
        <div className="lux-editorial">
          <span className="lux-overline">
            Your attention is your greatest asset.
          </span>
          <h2 id="problem-heading">
            A full inbox.
            <br />
            An <em>uninterrupted</em>
            <br />
            life.
          </h2>
          <p>
            Fifty internal emails a day. Decisions, approvals and quick yeses.
            Your team needs an answer.
            <br />
            You deserve the room to lead.
          </p>
          <Link href="#how-it-works">
            Meet your new way of working <ArrowRight size={18} />
          </Link>
        </div>
        <div className="lux-story">
          <div className="lux-story-label">
            <span>
              <span className={phase === 2 ? "lux-live done" : "lux-live"} />
              {phase === 0 ? "THE OLD WAY" : "WITH HAELO"}
            </span>
            <span>AN EVERYDAY MOMENT</span>
          </div>
          <div className="lux-story-card" key={phase}>
            <header>
              <span className="lux-avatar">TA</span>
              <div>
                <strong>Tosin Adeyemi</strong>
                <small>Operations Manager</small>
              </div>
              {phase === 2 ? <CheckCheck size={18} /> : <Mail size={18} />}
            </header>
            <p className="lux-subject">Rice order for Friday.</p>
            <p className="lux-email">
              “Can we reorder 50kg of rice before Friday’s service?”
            </p>
            {phase === 0 ? (
              <div className="lux-message lux-message-wait">
                <Clock3 size={18} />
                <div>
                  <strong>Still waiting on your inbox.</strong>
                  <small>Another decision on hold. Another day gone.</small>
                </div>
              </div>
            ) : phase === 1 ? (
              <div className="lux-message lux-message-draft">
                <div className="lux-draft-label">
                  <Sparkles size={14} />
                  HAELO’S SUGGESTED REPLY
                </div>
                <p>
                  Approved. Log the order and send the receipt to accounts
                  today.
                </p>
                <button onClick={() => choose(2)}>
                  YES — send it <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="lux-message lux-message-done">
                <span>
                  <Check size={22} />
                </span>
                <strong>Consider it handled.</strong>
                <p>
                  Your reply, in your voice.
                  <br />
                  Your day, entirely yours.
                </p>
                <small>
                  Approved on WhatsApp <CheckCheck size={13} />
                </small>
              </div>
            )}
            <footer>
              <span>
                {phase === 0
                  ? "Waiting 2 days"
                  : phase === 1
                    ? "Ready for your YES"
                    : "Answered in 2 minutes"}
              </span>
              <button
                onClick={() => choose(phase === 0 ? 1 : phase === 1 ? 2 : 0)}
                aria-label={
                  phase === 2
                    ? "Replay the email story"
                    : phase === 0
                      ? "See the Haelo difference"
                      : "Approve the sample reply"
                }
              >
                {phase === 2 ? (
                  <RotateCcw size={15} />
                ) : (
                  <ArrowRight size={17} />
                )}
              </button>
            </footer>
          </div>
          <div
            className="lux-story-controls"
            role="group"
            aria-label="Email story"
          >
            {phases.map((label, index) => (
              <button
                key={label}
                aria-pressed={phase === index}
                onClick={() => choose(index)}
              >
                <span>0{index + 1}</span>
                {label}
                <i />
              </button>
            ))}
          </div>
          <div className="lux-story-caption">
            <span>Illustrative response journey</span>
            <button
              aria-label="Play email story automatically"
              onClick={() => {
                setManual(null);
                timeline.resume();
              }}
            >
              <Play size={11} />
              {manual === null ? "Auto story" : "Play story"}
            </button>
          </div>
        </div>
        <footer className="lux-bottom">
          <div>
            <span>LESS WAITING.</span>
            <strong>More possibility.</strong>
          </div>
          <div>
            <span>WITHOUT HAELO</span>
            <strong>
              2 days <ArrowRight size={24} />
            </strong>
          </div>
          <div>
            <span>WITH HAELO</span>
            <strong className="lux-time">2 minutes</strong>
          </div>
          <Link href="#how-it-works" aria-label="Explore how Haelo works">
            <ArrowDown size={22} />
          </Link>
        </footer>
      </div>
    </section>
  );
}
