# Signup and login redesign

Both authentication pages now share the landing page’s deep Bordeaux visual direction, approved HAELO logos, locally hosted Satoshi/Plus Jakarta Sans, warm-white form surfaces, blush guidance panels, consistent inputs, and clear focus states. The brand panel uses `#430E16`, with a restrained `#5E1A26` illustrative context card. The branding is static and does not flicker or cycle while entering a form.

Desktop uses a generous split layout. Tablet/mobile use a compact brand introduction above the forms; inputs use 16px text on small screens to avoid focus zoom. All signup stages and email verification use the same component styling. Error, loading, disabled, password-strength, visibility-toggle, and success states remain available.

## Files

- `app/auth/layout.tsx`: shared branded layout and local fonts.
- `app/auth/auth.css`: scoped tokens, layout, form styles, responsive rules, reduced motion, focus states.
- `app/auth/login/page.tsx`: retains existing login logic and form; removes old inline styling and the inactive Google button; links sign-in help to the existing support WhatsApp contact.
- `app/auth/signup/page.tsx`: retains existing signup/verification logic; removes old inline styling, labels the verification-code field, marks the current signup step, and changes the unverified “30 DAYS FREE” badge to “START FREE”. Backend trial logic is unchanged.

## Preserved functionality

No API modules or endpoint contracts changed. Login still stores the returned token and user type and redirects to `/dashboard`. Signup still validates work email, collects company details, evaluates password strength, registers, stores the registration token, verifies the code, clears the temporary registration token, stores the login token, and redirects to `/onboarding`. Back navigation, Enter submission, error recovery, and password visibility are preserved.

The previous Google button had no handler or OAuth flow; it has been removed rather than presented as working authentication. No Google authentication or password-reset backend was introduced. The former password-reset route does not exist, so “Need help signing in?” uses the project’s existing support contact.

## Verification

Production build, TypeScript, targeted Next core-web-vitals ESLint, and `git diff --check` pass. Chrome checks use mocked API responses and do not create real accounts or send verification emails. Checks cover login failure/success, password visibility, all signup steps, back/Enter navigation, registration failure/success, verification failure/success, request payloads, token storage/cleanup, and redirects. Screenshots and overflow checks cover 1440, 820, 390, and 320px. Accessibility scans cover login/signup desktop/mobile and desktop verification.

Reports: `auth-qa.json`. Backend availability, real credentials, real email delivery, and non-Chrome browsers are not exercised. Existing `/terms` and `/privacy` links remain; those policy routes are absent from this checkout and need published policy content separately.

## Review

[Login desktop](auth-login-desktop.png) · [Login mobile](auth-login-mobile.png)

[Signup desktop](auth-signup-desktop.png) · [Signup mobile](auth-signup-mobile.png)

[Email verification](auth-verification-desktop.png)
