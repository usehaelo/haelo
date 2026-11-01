"use client";
import { useEffect, useRef, useState } from "react";
import AnimatedCursor from "./AnimatedCursor";
import { useDemoTimeline } from "./Motion";
import { assets } from "./assets";
import { Heading, Vector } from "./Primitives";
export default function TimerModes() {
  const root = useRef<HTMLElement>(null);
  const hybrid = useRef<HTMLDivElement>(null);
  const reminder = useRef<HTMLDivElement>(null);
  const { step, running, interact } = useDemoTimeline(root, 12, 1100);
  const [interval, setInterval] = useState(10);
  const [rules, setRules] = useState([
    "Auto-send",
    "Auto-send",
    "Wait for YES",
  ]);
  const target = Math.floor(step / 2) % 3;
  useEffect(() => {
    if (step % 2 === 1) {
      setInterval([5, 10, 15][Math.floor(step / 2) % 3]);
      const index = Math.floor(step / 2) % 3;
      setRules((current) =>
        current.map((rule, i) =>
          i === index
            ? rule === "Auto-send"
              ? "Wait for YES"
              : "Auto-send"
            : rule,
        ),
      );
    }
  }, [step]);
  return (
    <section
      ref={root}
      data-demo-running={running}
      data-demo-phase={step}
      className="landing-section timer-section"
      id="timer-rules"
      aria-labelledby="timer-heading"
    >
      <Vector
        asset={assets.timer.watermarkHaeloMark}
        className="timer-watermark"
      />
      <div className="landing-container">
        <Heading
          eyebrow="Timer rules"
          id="timer-heading"
          description="Choose once during set-up. Change it any time by messaging Haelo."
        >
          You decide what happens <em>when you’re busy.</em>
        </Heading>
        <div className="timer-grid">
          <article className="timer-card">
            <div className="timer-panel">
              <div className="timer-stage auto-stage">
                <div className="timer-clock">
                  <Vector asset={assets.timer.ellipse} />
                  <Vector asset={assets.timer.ellipse1} />
                  <strong>0:0{3 - (step % 4)}</strong>
                </div>
                <div className="timer-sent" data-sent={step % 4 === 3}>
                  <span>
                    <Vector asset={assets.timer.iconCheck} />
                  </span>
                  <div>
                    <strong>
                      {step % 4 === 3
                        ? "Sent to Tosin"
                        : "Reply ready for Tosin"}
                    </strong>
                    <small>
                      {step % 4 === 3
                        ? "Timer ran out · no backlog"
                        : "Your timer handles the rest"}
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div className="timer-copy">
              <h3>Auto-send</h3>
              <p>
                When the timer runs out, Haelo sends the drafted reply. Zero
                backlog.
              </p>
            </div>
          </article>
          <article className="timer-card">
            <div className="timer-panel">
              <div className="timer-stage hybrid-stage" ref={hybrid}>
                <span className="timer-recommended">Recommended</span>
                <dl className="timer-rules">
                  {["Junior staff", "Managers", "HR & Finance"].map(
                    (label, index) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd
                          className={
                            rules[index] === "Wait for YES" ? "wait-rule" : ""
                          }
                        >
                          <button
                            type="button"
                            aria-label={`Toggle demo rule for ${label}`}
                            onClick={() => {
                              interact();
                              setRules((current) =>
                                current.map((rule, i) =>
                                  i === index
                                    ? rule === "Auto-send"
                                      ? "Wait for YES"
                                      : "Auto-send"
                                    : rule,
                                ),
                              );
                            }}
                          >
                            {rules[index]}
                          </button>
                        </dd>
                      </div>
                    ),
                  )}
                </dl>
                <AnimatedCursor
                  scope={hybrid}
                  timer
                  name="Johnson"
                  target={`.timer-rules > div:nth-child(${target + 1}) button`}
                  clicking={step % 2 === 1}
                  running={running}
                />
              </div>
            </div>
            <div className="timer-copy">
              <h3>Hybrid rules</h3>
              <p>
                Auto-send for junior staff. Remind &amp; wait for seniors, HR
                and Finance.
              </p>
            </div>
          </article>
          <article className="timer-card">
            <div className="timer-panel">
              <div className="timer-stage remind-stage" ref={reminder}>
                <div className="timer-earlier">Reminder · 2 drafts waiting</div>
                <div className="timer-reminder">
                  <span>
                    <Vector asset={assets.timer.iconBell} />
                  </span>
                  <div>
                    <strong>3 drafts still need you</strong>
                    <small>Nothing sends without your YES</small>
                  </div>
                </div>
                <div
                  className="timer-interval"
                  aria-label="Preview reminder interval"
                >
                  {[5, 10, 15].map((minutes) => (
                    <button
                      type="button"
                      key={minutes}
                      onClick={() => {
                        interact();
                        setInterval(minutes);
                      }}
                      aria-pressed={interval === minutes}
                    >
                      {minutes} min
                    </button>
                  ))}
                </div>
                <AnimatedCursor
                  scope={reminder}
                  timer
                  name="Vivan"
                  target={`.timer-interval button:nth-child(${target + 1})`}
                  clicking={step % 2 === 1}
                  running={running}
                />
              </div>
            </div>
            <div className="timer-copy">
              <h3>Remind &amp; wait</h3>
              <p>
                Haelo nudges you every 5, 10 or 15 minutes and never sends
                without your YES.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
