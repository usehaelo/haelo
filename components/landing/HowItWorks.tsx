"use client";
import { useEffect, useRef, useState } from "react";
import { useDemoTimeline } from "./Motion";
import ApprovalPreview from "./ApprovalPreview";
import { assets } from "./assets";
import { Heading, Vector } from "./Primitives";

const steps = [
  [
    "An email arrives",
    "A staff member emails you from your company domain. External emails are ignored.",
  ],
  [
    "Haelo reads & drafts",
    "It checks the sender, their role and your Business Bible, then drafts the reply.",
  ],
  [
    "You get a WhatsApp",
    "Sender, a three-line summary and the suggested reply — in under 60 seconds.",
  ],
  [
    "YES, NO — or nothing",
    "YES sends it. NO lets you give an instruction. Silence lets your timer send it.",
  ],
];
export default function HowItWorks() {
  const root = useRef<HTMLElement>(null);
  const { step, running, interact } = useDemoTimeline(root, 4, 2200);
  const [phase, setPhase] = useState(0);
  useEffect(() => setPhase(step), [step]);
  return (
    <section
      ref={root}
      data-flow-phase={phase}
      data-demo-running={running}
      className="landing-section workflow-section"
      id="how-it-works"
      aria-labelledby="workflow-heading"
    >
      <div className="landing-container">
        <Heading
          eyebrow="How it works"
          id="workflow-heading"
          description="Haelo connects to your company email once. After that, everything happens in a WhatsApp chat you already check fifty times a day."
        >
          From inbox to answered <em>in under a minute.</em>
        </Heading>
        <div className="workflow-panel">
          <div className="workflow-diagram">
            <div className="workflow-connectors" aria-hidden="true">
              <Vector
                asset={assets.workflow.vector}
                className="workflow-line-one"
              />
              <Vector
                asset={assets.workflow.vector1}
                className="workflow-line-two"
              />
              <Vector
                asset={assets.workflow.vector2}
                className="workflow-line-three"
              />
              <Vector
                asset={assets.workflow.vector3}
                className="workflow-line-out"
              />
            </div>
            <div className="workflow-providers">
              {[
                ["Gmail", "stephen@spotliteafrica.com"],
                ["Outlook", "Microsoft 365"],
                ["Zoho Mail", "Business mail"],
              ].map(([name, subtitle]) => (
                <div className="workflow-provider" key={name}>
                  <span>
                    <Vector asset={assets.workflow.iconMail1} />
                  </span>
                  <div>
                    <strong>{name}</strong>
                    <small>{subtitle}</small>
                  </div>
                </div>
              ))}
            </div>
            <div className="workflow-hub">
              <div className="workflow-orb">
                <Vector asset={assets.workflow.ellipse} />
                <Vector asset={assets.workflow.ellipse1} />
                <Vector
                  asset={assets.workflow.ellipse2}
                  className="workflow-orb-core"
                />
                <Vector asset={assets.workflow.toneGlossTypeMark} width={40} />
              </div>
              <p>
                {
                  [
                    "A new internal email arrives",
                    "Haelo reads, checks your Business Bible, drafts",
                    "A summary and reply arrive on WhatsApp",
                    "Approved. Your team has the answer.",
                  ][phase]
                }
              </p>
            </div>
            <div className="workflow-whatsapp">
              <span className="workflow-whatsapp-label">
                <Vector asset={assets.workflow.iconMessageCircle} />
                On your WhatsApp
              </span>
              <ApprovalPreview demoPhase={phase} />
            </div>
          </div>
          <ol className="workflow-steps">
            {steps.map(([title, description], index) => (
              <li key={title} data-active={phase === index}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>
                  <button
                    type="button"
                    aria-pressed={phase === index}
                    onClick={() => {
                      interact();
                      setPhase(index);
                    }}
                  >
                    {title}
                  </button>
                </h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
