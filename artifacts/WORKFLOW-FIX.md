# Workflow preview correction

The “How it works” preview now uses deep HAELO Bordeaux (`#430E16`), the approved light logo, readable text, real illustrative workflow details, and direct step controls.

## Flicker fix

The old IntersectionObserver compared only the subset of rows in each callback. Adjacent rows could repeatedly trade selection, while `key={active}` remounted the preview and replayed its entrance animation. The replacement evaluates all four rows together, at most once per animation frame. A 24px boundary buffer prevents jitter. Direct selection is preserved until a meaningful scroll movement.

The preview surface and its four panels remain mounted. Panels share a grid cell so the tallest panel reserves the same space for every step. Inactive panels are hidden from view, focus, and assistive technology. The surface has no entrance animation on step changes.

## Usability

- Click a left-hand step, a numbered step control, or previous/next arrows.
- Mobile shows the same complete preview instead of hiding it.
- Selecting a descriptive step on mobile brings the preview into view and focuses it; reduced-motion preferences disable smooth scrolling.
- Business context shows the Business Bible, staff directory, and communication tone. Other steps show the incoming request, suggested draft, and executive review.
- All examples remain illustrative; no new backend or approval API calls were introduced.

## Files

- `components/landing/HowItWorks.tsx`
- `components/landing/workflow.css`

## Verification

Production build, TypeScript, targeted ESLint, and `git diff --check` pass. Chrome checks show a persistent preview with identical heights across all four steps at 1440, 820, 390, and 320px, no horizontal overflow, and no JavaScript page errors. Downward scrolling selects 1→2→3→4, and upward scrolling selects 4→3→2→1 without reversals. Mobile selection and preview reveal pass. WCAG 2/2.1 A/AA scans report no violations in the tested section.

[Desktop screenshot](workflow-desktop.png) · [Mobile screenshot](workflow-mobile.png) · [Tablet](workflow-tablet.png) · [320px mobile](workflow-small-mobile.png)

Detailed results: `workflow-qa.json`. Tests used local Chrome; Safari, Firefox, and physical devices were not tested.
