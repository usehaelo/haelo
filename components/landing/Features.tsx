"use client";
import { useEffect, useRef, useState } from "react";
import AnimatedCursor from "./AnimatedCursor";
import { useDemoTimeline } from "./Motion";
import ApprovalPreview from "./ApprovalPreview";
import { assets } from "./assets";
import { Heading, Photo, Vector } from "./Primitives";
const tones = {
  Junior:
    "Thanks, Tosin. Approved — please log the order and send the receipt to accounts.",
  Manager: "Approved. Log it and send the receipt to accounts.",
  Director:
    "Approved. Please proceed with the order and arrange for the receipt to be sent to accounts.",
};
export default function Features() {
  const voice = useRef<HTMLDivElement>(null);
  const { step, running, interact } = useDemoTimeline(voice, 6);
  const [tone, setTone] = useState<keyof typeof tones>("Manager");
  const names = Object.keys(tones) as (keyof typeof tones)[];
  useEffect(() => {
    if (step % 2 === 1)
      setTone(
        (Object.keys(tones) as (keyof typeof tones)[])[Math.floor(step / 2)],
      );
  }, [step]);
  return (
    <section
      className="landing-section features-section"
      id="features"
      aria-labelledby="features-heading"
    >
      <Vector
        asset={assets.features.watermarkHaeloMark}
        className="features-watermark"
      />
      <div className="landing-container">
        <Heading
          eyebrow="Features"
          id="features-heading"
          description="Built around one promise: no internal email goes unanswered, and no decision waits on your inbox."
        >
          Everything a chief of staff does.
          <br />
          <em>None of the overhead.</em>
        </Heading>
        <div className="feature-grid">
          <article className="feature-approve">
            <Photo
              src={assets.features.tileApprovePhoto.src}
              alt="Executive approving a request from her phone"
            />
            <div className="feature-approval">
              <ApprovalPreview compact autoPlay />
            </div>
            <div className="feature-copy">
              <h3>Approve with one word.</h3>
              <p>
                YES sends it. NO lets you say “tell him to wait till Monday”,
                and Haelo rewrites it properly.
              </p>
            </div>
          </article>
          <article className="feature-tile feature-summary">
            <div className="feature-panel">
              <div className="summary-stage">
                <span className="original-email">
                  <Vector asset={assets.features.iconMail} />
                  Original email · 412 words
                </span>
                <span className="summary-connector">
                  <Vector asset={assets.features.line} />
                </span>
                <div className="summary-card">
                  <strong>
                    <Vector asset={assets.features.iconSparkles} />
                    HAELO SUMMARY
                  </strong>
                  <dl>
                    {[
                      ["From", "Tosin Adeyemi · Ops Manager"],
                      ["Needs", "OK to reorder 50kg of rice"],
                      ["By", "Friday, before service"],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
            <div className="feature-copy">
              <h3>Every email, in three lines.</h3>
              <p>
                Who sent it, their role, and exactly what they need from you.
              </p>
            </div>
          </article>
          <article className="feature-tile feature-voice">
            <div className="feature-panel">
              <div
                className="voice-stage"
                ref={voice}
                data-demo-running={running}
              >
                <div className="tone-tabs" aria-label="Preview reply tone">
                  {names.map((name) => (
                    <button
                      type="button"
                      key={name}
                      aria-pressed={tone === name}
                      onClick={() => {
                        interact();
                        setTone(name);
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <div
                  className="tone-draft"
                  aria-live={running ? "off" : "polite"}
                >
                  “{tones[tone]}”
                </div>
                <AnimatedCursor
                  scope={voice}
                  target={`.tone-tabs button:nth-child(${Math.floor(step / 2) + 1})`}
                  clicking={step % 2 === 1}
                  running={running}
                />
              </div>
            </div>
            <div className="feature-copy">
              <h3>Drafts in your voice.</h3>
              <p>
                Warm with juniors, brief with managers, formal with directors.
              </p>
            </div>
          </article>
          <article className="feature-speed">
            <div>
              <span>under</span>
              <strong>60s</strong>
              <p>
                From a new email to a summary and a ready draft on your
                WhatsApp.
              </p>
            </div>
            <div className="feature-included">
              <span>ALSO INCLUDED</span>
              <ul>
                {[
                  [
                    assets.features.iconUserPlus,
                    "Asks before replying to new senders",
                  ],
                  [assets.features.iconUsers, "Update your team by chat"],
                  [assets.features.iconHistory, "History on request, any day"],
                  [assets.features.iconMail1, "Gmail, Outlook & Zoho"],
                ].map(([icon, text]) => (
                  <li key={text as string}>
                    <span>
                      <Vector
                        asset={icon as typeof assets.features.iconUserPlus}
                      />
                    </span>
                    {text as string}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
