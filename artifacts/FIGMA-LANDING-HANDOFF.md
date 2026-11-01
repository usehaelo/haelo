Haelo landing page implementation — November 1, 2026

Implemented the approved landing-page scope from Figma file `Wo3gtHNHFBfRpHsYhNaeFW`, page `9:4`, desktop frame `49:817` and mobile frame `53:1436`. Every desktop section was retrieved through Figma MCP before implementation. Original photography, logos, watermarks, SVG icons, and connectors are stored locally. No temporary Figma URLs are used at runtime.

The page now includes the skyline hero and phone, problem photo, day-in-the-life cards, email-to-WhatsApp workflow, feature grid, Business Bible, timer modes, security, four pricing cards, FAQ, closing CTA, and footer. Approval previews support editing, saving, approving, and replaying a sample reply; they do not call backend services. Tone and reminder controls update their sample state. Mobile navigation and FAQ controls support keyboard use.

Changed files:

| File | Change |
| --- | --- |
| `app/page.tsx` | Composes the supplied section order and loads local fonts |
| `app/landing.css` | Scoped design tokens, section styling, responsive layouts, and reduced-motion support |
| `components/landing/Navigation.tsx` | Supplied navigation appearance, existing sign-in/signup routes, mobile menu and Escape handling |
| `components/landing/HowItWorks.tsx` | Provider-to-Haelo-to-WhatsApp diagram and four setup steps |
| `components/landing/Pricing.tsx` | Four marketing cards from Figma; existing billing configuration is untouched |
| `components/landing/Sections.tsx` | Problem, security, closing CTA and footer |
| `public/fonts/README.md` | Bricolage font provenance |
| `.eslintrc.json` | Makes the existing lint script run without an interactive configuration prompt |

New reusable components:

- `components/landing/Hero.tsx`
- `components/landing/ApprovalPreview.tsx`
- `components/landing/DayWithHaelo.tsx`
- `components/landing/Features.tsx`
- `components/landing/BusinessBible.tsx`
- `components/landing/TimerModes.tsx`
- `components/landing/FAQ.tsx`
- `components/landing/Primitives.tsx`
- `components/landing/assets.ts`

New assets: `public/images/landing/*`, `public/fonts/bricolage-variable.ttf`, and `public/fonts/BRICOLAGE-LICENSE.txt`. Plus Jakarta Sans reuses the existing local font files. Asset names retain their Figma export identifiers; `assets.ts` maps them to their section and original role.

Validation:

- `npx tsc --noEmit --incremental false`: passed.
- `npm run lint`: passed with no warnings or errors.
- `HAELO_DIST_DIR=.next-landing-qa npm run build`: passed; all 15 routes generated.
- `git diff --check`: passed.
- Production Chrome checks at 320, 390, 768, 1024 and 1440px: no horizontal page overflow, broken images, or page errors.
- All 128 rendered image occurrences were checked against non-empty local files and their rendered geometry was recorded.
- FAQ, sample approval editing/saving/sending/replay, tone controls, reminder controls, anchor destinations, signup/sign-in destinations, mobile menu, Escape/focus restoration, and unique DOM IDs: passed.
- Accessibility scans at 390 and 1440px found only color-contrast violations in the reference's pale metadata, inactive labels, and footer captions. These reference colors were retained; this is not a WCAG AA pass.

Screenshots and evidence:

- [Desktop page](figma-landing-1440.png)
- [Mobile page](figma-landing-390.png)
- [Desktop hero](figma-hero-section-1440.png)
- [Mobile hero](figma-hero-section-390.png)
- [Responsive and asset geometry report](figma-landing-responsive.json)
- [Interaction and accessibility report](figma-landing-interactions.json)

Remaining differences and integration limits:

- Figma's 30-day pilot and four marketing prices are displayed as supplied. The existing three billing plan IDs, prices, trial behavior, subscription requests, and checkout implementation were preserved. Marketing CTAs route into existing signup or support; they do not select a billing plan or change trial duration.
- About, Careers, Privacy, Terms, and Data processing have no published routes in this codebase. These footer links use the application's existing WhatsApp support contact.
- Desktop details and section renders were retrieved successfully. Further detailed mobile MCP requests hit the Starter-plan call limit. Mobile styling follows the available mobile frame hierarchy and page screenshot, using the detailed desktop components; exact parity with every mobile layer could not be verified. Tablet layouts interpolate between the supplied desktop and mobile references.
- Browser blur/shadow rendering approximates Figma glass effects. The locally hosted Bricolage font uses optical size 14; its width axis was adjusted to 90 for display headings to match the reference screenshot's compact proportions.
- Pale secondary text retains the reference's contrast issues described above.

Authentication, onboarding, admin, dashboard, API clients, and billing business logic were not edited. No application dependencies were added. Browser/formatting/accessibility tools were installed only in `/tmp` for verification.

Motion update — November 1, 2026

Added `components/landing/Motion.tsx` and `components/landing/AnimatedCursor.tsx`. The landing page now has scroll entrances, subtle hero-chip motion, hover feedback, automatic demo cursors with click ripples, a cycling email/Haelo/WhatsApp workflow, an animated countdown, and interactive staff-rule previews. Cursors follow the real control geometry after resizes; their automatic clicks change the sample states. No real approvals or configuration requests are sent.

The hero, problem photo, security skyline and closing skyline use fixed photographic backgrounds. Individual day-in-the-life and feature-card photos retain their crops. Reduced-motion preferences disable automatic timelines and fixed-background scrolling. A page-level pause/resume control is available; off-screen demos and hidden-tab timelines stop. Hovering a compact demo or focusing its controls gives the user priority, and manual actions delay automatic progression.

Motion checks: `artifacts/landing-motion-qa.json`. The animated workflow still uses the original exported SVGs and centered orb; moving signals are layered over its connectors. No animation library or application dependency was added.

Hero phone update: the WhatsApp phone now shares the automatic approval/replay cursor sequence. Outgoing YES and sent-confirmation bubbles appear only after approval. The sent state condenses the original draft so its confirmation and replay control remain above the hero clipping boundary. Manual editing cancels a pending automatic reset. Hero-specific checks are recorded in `artifacts/hero-phone-qa.json`.
