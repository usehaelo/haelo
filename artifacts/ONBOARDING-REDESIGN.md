# HAELO onboarding redesign

The six-step setup now uses the same approved logos, locally hosted typography and deep Bordeaux identity as the landing, authentication and dashboard experiences.

## Experience

- Desktop: persistent setup journey, focused form workspace, contextual guidance and an explicit dashboard link.
- Mobile: compact branded header, six-segment progress indicator, stacked forms and step-specific guidance. Form inputs use a 16px font on smaller screens.
- Completed desktop steps are revisitable. Moving backwards preserves values, selected files and preferences during the current page session. Refresh persistence is not introduced.
- Business Bible: required categories, keyboard-accessible CSV drop zone, staged-file status, downloadable templates inside an expandable guide, and optional document help. File status says “Ready to upload” until submission succeeds.
- Tone: concise selection cards and an example response that updates with the chosen style; custom instructions remain available.
- Completion: approved HAELO icon, saved-setup checklist and an explicit dashboard action instead of a timed redirect.
- Labelled fields, selectable option state, visible focus indicators, announced error messages and reduced-motion support.

## Connection and validation fixes

Email setup now verifies the provider through the existing providers endpoint before showing “connected.” Opening the authorisation popup alone no longer counts as success. The user completes authorisation and selects Check connection; incomplete authorisation can be retried. Outlook is marked Coming soon because the existing API adapter supports Gmail and Zoho.

Company domains reject spaces, protocols and malformed names; saved domains are trimmed and lowercased. Nigerian phone numbers have a leading local zero removed before the existing +234 API payload. OTP paste and retry behavior remain available. CSV uploads retain the existing overview/directory/chart/sop/comms multipart field names. Tone and timer payloads retain the existing API contracts.

No API modules, dashboard source, plan prices or backend services were changed for this onboarding task. The preview environment still needs the existing API-base configuration to use a live backend.

## Verification

- Production build, TypeScript, targeted Next core-web-vitals ESLint and diff whitespace checks pass.
- 28 layout checks: seven screens at 1440, 820, 390 and 320px. No horizontal page overflow or broken images in tested states.
- 14 WCAG 2/2.1 A/AA automated scans: desktop and mobile for each screen, no detected violations. These scans are not a full accessibility certification.
- No JavaScript page errors during the walkthrough.
- Mocked behavior checks: provider confirmation and incomplete-authorisation retry; unsupported provider; domain validation and failed-save retry; phone normalization; OTP paste and failed-verification retry; required documents; CSV rejection and template download; multipart upload; live tone preview; custom tone save; timer save; backwards navigation retaining fields; explicit dashboard entry.

All browser API requests were mocked. No real email account was connected, WhatsApp code sent, document uploaded or workspace record changed. Physical devices and other browser engines were not tested. No production deployment or Git push was performed.

## Review

Preview: http://localhost:3103/onboarding

| Screen | Desktop | Mobile |
| --- | --- | --- |
| Email | [View](onboarding-email-desktop.png) | [View](onboarding-email-mobile.png) |
| Domain | [View](onboarding-domain-desktop.png) | [View](onboarding-domain-mobile.png) |
| WhatsApp | [View](onboarding-whatsapp-desktop.png) | [View](onboarding-whatsapp-mobile.png) |
| Business Bible | [View](onboarding-bible-desktop.png) | [View](onboarding-bible-mobile.png) |
| Tone | [View](onboarding-tone-desktop.png) | [View](onboarding-tone-mobile.png) |
| Timer | [View](onboarding-timer-desktop.png) | [View](onboarding-timer-mobile.png) |
| Ready | [View](onboarding-ready-desktop.png) | [View](onboarding-ready-mobile.png) |

Detailed report: [onboarding-qa.json](onboarding-qa.json).
