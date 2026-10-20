export const demoEmails = [
  {
    name: "Tayo",
    summary:
      "Good morning. You’ve received an email from Tayo in Marketing.\n\nHe’s requesting approval for the Q4 campaign budget so the team can proceed.",
    introduction: "I’ve prepared this response:",
    response:
      "Hi Tayo, thanks for putting this together. The budget is approved. Please proceed and keep me updated on the campaign performance.",
    question: "Would you like me to send it?",
    reply: "Yes, send it.",
    confirmation: "Done. Your response has been sent to Tayo.",
    time: "9:41",
  },
  {
    name: "Amaka",
    summary:
      "You have a new email from Amaka in Operations.\n\nShe’s asking whether to proceed with the revised supplier agreement.",
    introduction: "I suggest replying:",
    response:
      "Hi Amaka, please share the final agreement for my review before we confirm.",
    question: "Should I send this?",
    reply: "Yes, please.",
    confirmation: "Done. Your response has been sent.",
    time: "9:43",
  },
  {
    name: "Daniel",
    summary:
      "Daniel in Business Development has emailed you.\n\nYour prospective partner is available Thursday at 2 PM. Should he confirm the meeting?",
    introduction: "Here’s a response for your review:",
    response:
      "Hi Daniel, Thursday at 2 PM works. Please confirm the meeting and share the agenda.",
    question: "Would you like me to send it?",
    reply: "Yes, thank you.",
    confirmation: "Done. Your response has been sent to Daniel.",
    time: "9:45",
  },
];
export const demoStages = [
  "typing-summary",
  "summary",
  "typing-response",
  "proposal",
  "reply",
  "sending",
  "confirmed",
  "exit",
] as const;
export type DemoStage = (typeof demoStages)[number];
export const stageDurations: Record<DemoStage, number> = {
  "typing-summary": 800,
  summary: 3400,
  "typing-response": 1000,
  proposal: 6000,
  reply: 1000,
  sending: 1200,
  confirmed: 3200,
  exit: 800,
};
