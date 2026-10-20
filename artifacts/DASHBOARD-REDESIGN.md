# HAELO dashboard redesign

The dashboard now has distinct layouts for each task, alongside the Bordeaux brand identity. The full dashboard follows the landing/authentication Bordeaux identity. Scope includes Overview, Business Bible, Staff Directory, Activity Log, Settings, Billing, desktop navigation, the mobile drawer, and staff/invitation dialogs.

## Layout and interaction update

- Overview: workspace brief, attention links, integrated performance strip, searchable conversation list, working All/Needs review/Completed filters, and a selected conversation inspector with incoming and suggested/sent messages. Pending totals explicitly refer to the latest conversations, not the entire workspace.
- Business Bible: vertical knowledge categories, central document workspace, and desktop reference rail; categories become horizontally scrollable on mobile.
- Staff: people/context summary, working department filters, desktop directory, and individual people cards with actions on mobile.
- Activity: desktop performance rail alongside the searchable log; department options are derived from loaded records. Smaller screens use a stacked layout.
- Settings: dedicated Connections, Response workflow, Notifications, and admin Team access views. Existing controls stay mounted so switching categories preserves in-progress fields. Billing team links open the Team access category directly.
- Billing: plan comparison above invoice history and a separate account/benefits column; mobile sections stack in document order.

## Experience

- Deep Bordeaux `#430E16` sidebar and selected dark panels; primary actions `#5E1A26`; warm white `#FCFAF9`; blush accents; consistent borders and readable muted text.
- Approved white HAELO logo on the sidebar; Satoshi headings and Plus Jakarta Sans UI text, locally hosted.
- Persistent workspace navigation, current-page breadcrumb, account settings shortcut, help, sign-out, and subscription information returned by the existing API. No fabricated fallback seat count or “active inbox” claim.
- Native mobile navigation dialog with Escape, focus trapping, backdrop dismissal, focus return, and scroll locking.
- Clear overview cards, real metric requests, readable activity summaries, helpful loading/empty states, and a Bordeaux workspace card linking to connection settings. Hardcoded Gmail/WhatsApp/timer status text has been removed.
- Staff search/table/CSV export, keyboard-accessible staff and invitation dialogs, labeled switches and inputs, readable file/template surfaces, and responsive settings/provider controls.
- Billing uses the available width and presents the same shared plan amounts in a three-column desktop layout, stacked on smaller screens. Current-plan colors and contrast are consistent.

Green is retained for semantic success/connected/paid status, and amber/red for warnings and errors. It is not used as the primary brand color.

## Source files

- `app/dashboard/layout.tsx`: shared branded shell and local typography.
- `app/dashboard/dashboard.css`: scoped design system, navigation, responsive layouts, surfaces, focus and reduced-motion rules.
- `components/dashboard/Sidebar.tsx`: shared navigation, account/subscription data, breadcrumb, mobile drawer.
- `components/dashboard/theme.ts`: centralized tokens shared by the existing page components.
- `components/dashboard/Modal.tsx`: reusable native dialog with focus/scroll management.
- `app/dashboard/overview/page.tsx`
- `app/dashboard/activity/page.tsx`
- `app/dashboard/staff/page.tsx`
- `app/dashboard/business-bible/page.tsx`
- `app/dashboard/settings/page.tsx`
- `app/dashboard/billing/page.tsx`

Existing backend API modules and shared plan prices remain unchanged. Activity department filtering now reads the department returned with the staff record. Billing’s team summary now accepts the account adapter’s array output as well as the existing object shape. The initial invoice loader is captured once; pagination still explicitly requests subsequent pages.

The staff Import CSV button had an empty handler and was removed. CSV export and the working Business Bible upload path are preserved. The individual invoice-download control had no implementation and is marked unavailable rather than presented as working.

## Validation

- Production build and TypeScript pass.
- Targeted Next core-web-vitals ESLint passes without warnings or errors.
- `git diff --check` passes.
- Browser layouts checked at 1440, 820, 390, and 320px for all six pages: no horizontal page overflow or broken images in the tested states.
- WCAG 2/2.1 A/AA scans of desktop/mobile pages and staff/invitation dialogs: no violations in tested states.
- No JavaScript page errors during the checks.
- Mobile drawer open/close, Escape, navigation dismissal, activity search, department filtering, and expanded communication details pass.
- Mocked action checks pass: staff search/creation, modal Escape, CSV export, invitations, notification saves, timer saves, template downloads, and Business Bible CSV uploads.

All workspace data and API responses used for screenshots/tests are mocked. No real staff, accounts, invitations, uploads, payments, WhatsApp messages, or email were changed or sent.

## Review screenshots

| Page | Desktop | Mobile |
| --- | --- | --- |
| Overview | [View](dashboard-overview-desktop.png) | [View](dashboard-overview-mobile.png) |
| Business Bible | [View](dashboard-business-bible-desktop.png) | [View](dashboard-business-bible-mobile.png) |
| Staff Directory | [View](dashboard-staff-desktop.png) | [View](dashboard-staff-mobile.png) |
| Activity Log | [View](dashboard-activity-desktop.png) | [View](dashboard-activity-mobile.png) |
| Settings | [View](dashboard-settings-desktop.png) | [View](dashboard-settings-mobile.png) |
| Billing | [View](dashboard-billing-desktop.png) | [View](dashboard-billing-mobile.png) |

[Mobile navigation](dashboard-navigation-mobile.png) · [Add staff dialog](dashboard-add-staff.png) · [Invitation dialog](dashboard-invite.png)

Detailed reports: `dashboard-qa.json`, `dashboard-actions-qa.json`, and `dashboard-final-qa.json`. New layout interactions are recorded in `dashboard-layout-interactions.json`: overview filtering/search/selection, staff department filters, settings categories and direct Team access links.

## Limits

These checks use local Chrome with fixtures, not the production workspace or real backend. Existing API-base configuration must be available for live data. Other browsers and physical devices were not tested. No production deployment or Git push was performed.

Existing billing payment URLs, cancellation/invoice-export backend gaps, provider integration availability, and local-only staff edit/delete persistence were not replaced with new backend functionality. Existing pricing and trial terms were preserved and still require business verification before publishing. No security or compliance certifications are implied by the new design.
