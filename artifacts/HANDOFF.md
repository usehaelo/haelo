# HAELO landing-page redesign handoff

Implemented locally on 20 October 2026. Source was updated from usehaelo/haelo main before this work. No deployment or push was performed.

## Audit and design decisions

The previous landing page mixed purple marketing, green/navy shared UI, a text-only wordmark, and hand-drawn replacement symbols. A single large client page contained unsupported testimonials, unverified speed claims, static pricing, and placeholder footer links. Outlook and Google Drive were marketed without corresponding working connection paths in the inspected code.

The redesign uses an editorial warm-white layout, Bordeaux accents, restrained borders and shadows, product demonstrations, and selective dark sections. The page includes navigation, hero, attention/problem, four-step workflow, capabilities, executive experience, integrations, control, pricing, product-value alternative to testimonials, final conversion, and footer.

The latest hero brief takes precedence for the hero: its existing headline, description, CTA labels, and assurance copy remain. The new workflow sits to the right on desktop and below the copy on mobile. The hero uses floating WhatsApp-inspired messages, following the latest correction brief.

## Hero behavior (updated floating-message treatment)

`typing-summary → summary → typing-response → proposal → reply → sending → confirmed → exit`

The hero now contains independent WhatsApp-inspired bubbles floating directly over the existing background. There is no enclosing window, app header, original email card, phone frame, sidebar, or message input bar. HAELO messages use white/blush; the executive reply uses pale green. The approved Open Halo icon identifies HAELO. Compact message-level quick replies provide approval and inline simulated editing.

The reducer cycles through Tayo, Amaka, and Daniel. The older summary fades upward and collapses as the executive replies, leaving at most three settled bubbles. Typing dots precede summaries, proposals, and confirmation. Autoplay pauses off-screen, in a hidden tab, while editing, and when paused. Manual approval completes the simulated sending state and then holds the confirmation for review. Reduced motion opens at the proposal and uses manual controls without autoplay. No real WhatsApp or email APIs are used.

The existing hero layout, headline, description, CTA labels, navigation, and remaining page sections are unchanged by this correction. `hero-conversation.css` owns the new presentation; the old workspace/demo styles were removed from `app/landing.css`, preserving the shared avatar and status-dot styles used elsewhere.

## Tokens and typography

Tokens live in `app/landing.css` and are scoped under `.landing` to protect authenticated screens.

- Primary: Bordeaux 900 `#5E1A26`; dark: Bordeaux 950 `#430E16`.
- Supporting Bordeaux palette: 50 `#FDF4F3`, 100 `#FCE8E7`, 200 `#F8D3D3`, 300 `#F2B0AF`, 400 `#EA8283`, 500 `#DD565B`, 600 `#C93542`, 700 `#A92736`, 800 `#8D2433`.
- Paper `#FCFAF9`, ink `#2C2023`, secondary text `#75676A`, border `#E9DFE0`.
- Satoshi for editorial headings; Plus Jakarta Sans for body, controls, and hero interface. Both are locally hosted through `next/font/local`, with swap loading, fallbacks, source notes, and license files in `public/fonts/`.
- Content width up to 1248px; responsive gutters, 7–13px component radii, controlled surface shadows, and visible keyboard focus.
- Approved assets: `public/images/logo/logo.png`, `logowhite.png`, and `halo-icon.png`. The existing assets are used without redrawing or distortion, including light/dark wordmarks and favicon.

## Modified and added source files

- `app/page.tsx`: server-composed landing page and preserved hero copy.
- `app/landing.css`: scoped design tokens, responsive layouts, component styling, motion, and reduced-motion rules.
- `components/landing/Navigation.tsx`: sticky navigation, login/signup routes, mobile menu, Escape dismissal.
- `components/landing/HeroIntelligenceDemo.tsx`: controlled floating conversation, simulated editing and approval.
- `components/landing/hero-conversation.css`: individual bubble styling, quick replies, motion, and responsive composition.
- `components/landing/demo-data.ts`: scenario data, states, labels, and timing.
- `components/landing/HowItWorks.tsx`: scroll-aware desktop sequence and stacked mobile steps.
- `components/landing/Pricing.tsx`: accessible team-size estimator using shared existing plan data.
- `components/landing/Sections.tsx`: product, integrations, trust, conversion, and footer sections.
- `lib/pricing.ts`: extracted existing plan configuration, shared with dashboard billing; amounts and thresholds are unchanged.
- `app/dashboard/billing/page.tsx`: imports the extracted plan configuration; checkout/subscription behavior is unchanged.
- `components/ui/Logo.tsx`: approved image assets with compatible existing props.
- `components/dashboard/Sidebar.tsx`, `app/onboarding/page.tsx`, `app/admin/page.tsx`, `components/ui/WhatsAppMessage.tsx`: replace the old logo substitutes only.
- `app/layout.tsx`: approved halo favicon; metadata preserved.
- `public/fonts/*`: local font files, source notes, and licenses.
- `next.config.js`: optional `HAELO_DIST_DIR` for isolated checks while an existing dev server is running; default remains `.next`.
- `.gitignore`: excludes isolated build output.

## Preserved functionality

Authentication/signup routes, backend API modules, metadata, billing checkout code, subscription requests, and dashboard functionality remain intact. Dashboard layout was not redesigned. The only billing refactor extracts the same plan data for reuse. Landing links point to existing routes, actual section IDs, or the support WhatsApp number already used by onboarding. Outlook is marked coming soon; unsupported Google Drive claims are removed. No invented testimonials, customers, certifications, performance claims, or security guarantees remain on the landing page.

## Validation

- Production build: `HAELO_DIST_DIR=.next-landing-qa npm run build` passed for all 15 generated routes.
- TypeScript: `npx tsc --noEmit --incremental false` passed.
- ESLint: checked the landing components, page, shared Logo, and pricing configuration using the repository's Next core-web-vitals configuration; passed.
- `git diff --check` passed.
- Chrome checks: reduced-motion manual sequence, all three scenarios and loop, edit/save, approval, delivery, replay, autoplay, pause/resume, off-screen suspension, mobile menu/Escape, and pricing boundaries passed.
- No JavaScript page errors, broken internal anchors, broken images, or API requests during the demo.
- Pricing boundaries: 1 person ₦15,000; 2 and 5 people ₦60,000; 6 and 15 people ₦195,000 per month.
- Responsive checks: no horizontal overflow or navigation overflow at 320, 360, 390, 600, 601, 640, 768, 800, 801, 820, 1024, 1280, 1440, and 1920px.
- The longest simulated response and approval controls fit the panel at the captured desktop, tablet, mobile, and small-mobile sizes.
- Axe WCAG 2/2.1 A/AA scans: no violations in the tested drafting and analysis states.

Local mobile Lighthouse scores from the earlier full-page redesign, before the floating-message correction: Performance 93, Accessibility 100, Best Practices 100, SEO 100. LCP 3.2 s, CLS 0, total blocking time 20 ms. These are prior-version local simulated lab results, not a fresh measurement of the corrected hero or production field measurements.

## Latest hero correction screenshots and reports

- [Desktop hero](floating-hero-desktop-top.png) · [Desktop with executive reply](floating-hero-desktop-complete.png)
- [Mobile page](floating-hero-mobile.png) · [Mobile conversation](floating-conversation-mobile.png)
- [Desktop conversation](floating-conversation-desktop.png) · [Tablet](floating-conversation-tablet.png) · [320px mobile](floating-conversation-small-mobile.png)
- `floating-hero-qa.json`: editing, approval, three scenarios, reduced motion, and responsive/a11y results.
- `floating-motion-qa.json`: autoplay, pause/resume, off-screen suspension, and manual completion results.

## Earlier full-page redesign screenshots and reports

- [Desktop page](landing-desktop.png) · [Desktop hero](landing-desktop-hero.png)
- [Mobile page](landing-mobile.png) · [Mobile hero](landing-mobile-hero.png) · [Mobile demo](landing-mobile-demo.png)
- [Tablet](landing-tablet.png) · [320px mobile](landing-small-mobile.png)
- [Features](landing-features-desktop.png) · [Executive experience](landing-executive-desktop.png) · [Pricing](landing-pricing-desktop.png)
- [Lighthouse report](lighthouse-mobile.report.html)
- Machine-readable reports: `landing-qa.json`, `landing-motion-qa.json`, `landing-breakpoints.json`, `lighthouse-mobile.report.json`.

Standalone section/demo screenshots hide the fixed navigation only during capture to avoid screenshot clipping; full-page screenshots include the actual navigation.

## Remaining limitations

- Existing trial copy conflicts: landing/dashboard state 7 days, while signup displays 30 days. The latest brief explicitly preserves existing hero copy; production trial duration, no-card requirement, cancellation terms, and charged prices could not be verified against backend configuration. Published frontend plan values and billing behavior were preserved. Confirm these business terms before publishing.
- Billing already contains placeholder Paystack URLs and prototype subscription-selection comments. Those existing behaviors were not changed by this visual redesign.
- Legal policy pages are absent from this checkout. The landing footer omits their broken/placeholder links rather than inventing policies. Existing authentication-page legal links are outside this landing redesign.
- Live authenticated email-provider connections, real subscriptions/payments, and production email delivery were not exercised. No credentials were used and no real messages were sent.
- Browser rendering was tested in local Chrome. Safari/Firefox, real devices, production hosting, and production Core Web Vitals remain unmeasured. LCP still has room for improvement under simulated mobile throttling.
