# Floating hero correction

The right-side workspace panel has been replaced with individual WhatsApp-inspired messages. The existing page composition, hero headline, description, CTA buttons, navigation, and other sections remain unchanged.

HAELO uses the approved Open Halo sender icon and white/blush bubbles. Executive responses use pale green. There is no app header, enclosing chat window, original email card, phone frame, sidebar, or input bar. Small timestamps and ticks support the familiar message treatment.

## Sequence and controls

Typing → HAELO summary → typing → suggested reply with compact Approve & Send / Edit actions → executive reply → sending indicator → HAELO confirmation → fade upward → next scenario.

The three scenarios cover Tayo’s campaign budget, Amaka’s supplier agreement, and Daniel’s partnership meeting. Older summaries fade and collapse as the executive responds, leaving at most three settled message bubbles. Autoplay uses controlled, cleaned-up timers and pauses off-screen or in a hidden tab. Editing pauses playback. Manual approval completes the simulated send and holds the confirmation. Reduced motion starts at the proposal with manual controls. No real email or WhatsApp requests are made.

## Files changed for this correction

- `components/landing/HeroIntelligenceDemo.tsx`
- `components/landing/demo-data.ts`
- `components/landing/hero-conversation.css` (new)
- `app/landing.css` (obsolete demo styles removed; shared avatar, status-dot, and approval-tag styles preserved)
- Updated screenshots/reports in `artifacts/`.

## Verification

TypeScript and targeted Next core-web-vitals ESLint pass. Production build passes. Browser checks cover editable drafts, approval, all three scenarios, looping, reduced motion, autoplay, pause/resume, off-screen suspension, and completion after a manual approval. No JavaScript page errors or demo API calls were observed. Tested proposal/reply/sending/confirmation stages at 1440, 820, 390, and 320px have no bubble overlap, clipping, horizontal overflow, broken images, or stage-to-stage container-height change. WCAG 2/2.1 A/AA scans report no violations in the tested proposal and confirmation states.

## Screenshots

- [Desktop hero — summary and draft](floating-hero-desktop-top.png)
- [Desktop hero — executive reply and confirmation](floating-hero-desktop-complete.png)
- [Mobile page](floating-hero-mobile.png)
- [Mobile conversation](floating-conversation-mobile.png)
- [Tablet conversation](floating-conversation-tablet.png)
- [320px conversation](floating-conversation-small-mobile.png)

Detailed checks: `floating-hero-qa.json` and `floating-motion-qa.json`.

These checks use local Chrome. Real devices and other browser engines were not tested. The existing trial-term discrepancy documented in the full redesign handoff is unchanged. Prior Lighthouse reports predate this hero correction and are not presented as fresh measurements.
