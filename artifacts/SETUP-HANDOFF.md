# Signup, login and onboarding implementation

Implemented from the 13 screenshots supplied on November 1, 2026. Existing Haelo images and local Bricolage Grotesque / Plus Jakarta Sans fonts are reused. Browser/Figma chrome in the screenshots is excluded.

## Files changed for this task

- `app/auth/layout.tsx` — shared fonts and setup styles.
- `app/auth/login/page.tsx` — split layout, provider presentation, email then password sign-in.
- `app/auth/signup/page.tsx` — account form, required company name, password visibility, terms checkbox, six-digit email verification and error retry.
- `app/onboarding/layout.tsx` — shared fonts and setup styles.
- `app/onboarding/page.tsx` — about you, company, pilot preference, work email, WhatsApp verification, Business Bible upload, processing, review, timer settings and completion summary.
- `components/setup/SetupShell.tsx` — responsive form/photo layout, branding, stage progress and support footer.
- `components/setup/Controls.tsx` — labelled fields, actions, verification input and provider presentation.
- `components/setup/fonts.ts` — existing local fonts.
- `components/setup/setup.css` — scoped styling, desktop/tablet/mobile layouts and reduced motion support.
- `components/setup/bible-documents.ts` — preserved CSV category definitions and downloadable templates.

API helpers, dashboard routes, landing page components and billing logic were not changed by this task. Earlier landing-page edits remain in the working tree.

## Behavior and remaining differences

- Account creation and email verification use the existing registration/check-email/verify endpoints. The existing registration API requires company name, so signup includes this extra field alongside full name. Existing password validation is retained.
- Email/password login remains functional. “Continue with email” reveals the password field. Provider account signup/login buttons are marked unavailable because there are no OAuth account authentication endpoints in the existing client.
- Four stage pills and photo panels follow the supplied layouts. Photos are hidden on narrower screens to prioritize the form. Two reference photos (man writing and woman on a terrace) are unavailable locally; existing boardroom/company photos are reused instead. Some available source images have limited resolution.
- About-you job title, signoff and selected writing style are saved through the existing tone endpoint. The edited display name is retained in the browser draft; no profile-update endpoint is available.
- Company domain is saved through the existing API. Industry and staff-size preferences are stored in an account-scoped browser draft.
- The pilot screen reflects the design’s plan choices and prices as browser-local interests. It explicitly directs users to confirm actual pricing and pilot terms in Billing before subscribing. No trial or paid subscription is activated: the existing billing integration has different plans and no pilot-start API.
- Google and Zoho inbox connection use real provider authorization and require server confirmation. Microsoft is marked unavailable. Popup failures and incomplete authorization are handled without reporting a false connection.
- WhatsApp number addition, code resend and verification use the existing API. Nigerian numbers are normalized to the established `234…` format. Both numeric and alphanumeric verification codes are accepted, preserving the existing API flow. Verified status on reload is read from the server’s `phoneVerified` field.
- The existing upload integration accepts categorized CSV files (required overview, directory and org chart; optional policies and communication style). These uploads and their downloadable templates remain available. Single PDF/Word imports from the design require backend support and are explicitly marked unavailable.
- Reading status and staff review show API data, without fabricated progress, staff, departments or rules. Staff editing continues through the existing dashboard. The review page includes a retry for directory loading errors.
- Timer mode, wait duration and reminder interval save through the existing endpoint. The completion screen reports verified setup state; it does not claim that a test WhatsApp message was sent, because no test-send endpoint is available.
- Save and finish later preserves non-secret fields in an account-scoped browser draft and opens the dashboard. Passwords and verification codes are not included in this draft.

## Validation

- TypeScript: `npx tsc --noEmit --incremental false` passed.
- Lint: `npm run lint` passed with no warnings/errors.
- Production build: `HAELO_DIST_DIR=.next-landing-qa npm run build` passed (all 15 routes generated).
- Chrome: complete signup → incorrect-code retry → verified signup → onboarding → provider confirmation → WhatsApp verification → categorized multipart CSV upload → staff review → timer save → completion; email/password login also checked.
- Confirmed multipart upload category names, normalized WhatsApp number and timer API payload.
- 50 layout checks: all 10 onboarding states at 320, 390, 768, 1024 and 1440 pixels; no horizontal overflow.
- Signup/login WCAG 2 A/AA axe scans: no violations after adjusting secondary text contrast.
- Reports: `setup-qa.json`, `setup-responsive-qa.json`, `setup-accessibility-qa.json`.
- Reference comparison captures: `setup-*.png` in this directory. Captures use mocked API fixtures where account data is needed.

Browser API responses were mocked. No real account, provider authorization, WhatsApp message, document import, trial or subscription was created by validation. Live service end-to-end behavior remains unverified. Dashboard redesign requires its own visual reference; this implementation covers the supplied auth/onboarding screenshots.
