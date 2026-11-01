import { assets } from "./assets";
import { Heading, ProofChip, Vector } from "./Primitives";
const checks = [
  "Who reports to whom, and what every department does",
  "What you approve, delegate or escalate",
  "How you speak to juniors, managers and directors",
  "A ready-made template, so set-up takes an afternoon",
];
const sections = [
  "Company overview",
  "Org structure · 6 departments",
  "Staff directory · 14 people",
  "Standard operating procedures",
  "Decision rules · 12",
  "Communication preferences",
];
export default function BusinessBible() {
  return (
    <section
      className="landing-section bible-section"
      id="business-bible"
      aria-labelledby="bible-heading"
    >
      <div className="landing-container bible-layout">
        <div>
          <Heading
            eyebrow="The Business Bible"
            align="left"
            id="bible-heading"
            description="Upload a PDF or Word file in the WhatsApp chat. Haelo reads it once and grounds every reply in how your company actually works."
          >
            It learns your business
            <br />
            <em>from one document.</em>
          </Heading>
          <ul className="bible-checks">
            {checks.map((text) => (
              <li key={text}>
                <span>
                  <Vector asset={assets.bible.iconCheck} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="bible-visual">
          <div className="bible-paper" />
          <div className="bible-document">
            <div className="bible-file">
              <span>
                <Vector asset={assets.bible.iconFileText} />
              </span>
              <div>
                <strong>Business Bible.pdf</strong>
                <small>Spotlite Africa · 18 pages</small>
              </div>
            </div>
            <ul>
              {sections.map((text) => (
                <li key={text}>
                  <span>
                    <Vector asset={assets.bible.iconCheck1} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <ProofChip
            className="bible-identified"
            icon={assets.bible.icon}
            title="14 staff identified"
            description="Is that correct? Reply YES"
          />
          <ProofChip
            className="bible-read"
            icon={assets.bible.iconSparkles}
            title="Read in 40 seconds"
          />
        </div>
      </div>
    </section>
  );
}
