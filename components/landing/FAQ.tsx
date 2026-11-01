"use client";
import { useState } from "react";
import { assets } from "./assets";
import { Button, CONTACT_URL, Heading, Vector } from "./Primitives";
const questions = [
  [
    "Does Haelo ever reply to clients or vendors?",
    "Never. Haelo only processes emails from your registered company domain. Client, partner and vendor emails are ignored completely — it’s a hard rule, not a setting.",
  ],
  [
    "Will emails go out without me seeing them?",
    "Only if you choose Auto-send.",
  ],
  ["Do I need to install anything?", "No."],
  ["What is the Business Bible?", "A document describing your company."],
  ["What happens when someone new emails me?", "Haelo asks first."],
  ["Can my staff tell Haelo is involved?", "Replies come from your address."],
];
export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section
      className="landing-section faq-section"
      id="faq"
      aria-labelledby="faq-heading"
    >
      <div className="landing-container faq-layout">
        <div className="faq-intro">
          <Heading
            eyebrow="FAQ"
            align="left"
            id="faq-heading"
            description="Can't find what you need? We'll walk you through Haelo on a 20-minute call."
          >
            Questions
            <br />
            executives <em>ask us.</em>
          </Heading>
          <Button href={CONTACT_URL} variant="secondary" small>
            Book a demo
            <Vector asset={assets.faq.trailingIcon} />
          </Button>
        </div>
        <div className="faq-questions">
          {questions.map(([question, answer], index) => (
            <div className="faq-item" key={question}>
              <h3>
                <button
                  type="button"
                  aria-expanded={open === index}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                  onClick={() => setOpen(open === index ? null : index)}
                >
                  {question}
                  <span>
                    <Vector
                      asset={
                        open === index ? assets.faq.iconX : assets.faq.iconPlus
                      }
                    />
                  </span>
                </button>
              </h3>
              <div
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
                hidden={open !== index}
              >
                <p>{answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
