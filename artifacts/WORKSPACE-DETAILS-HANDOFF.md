# Workspace screens — Activity, Staff, Business Bible, Settings

Implemented from the 17 supplied screenshots, excluding Figma/browser chrome. Reuses the existing logo, fonts, icons, API helpers and workspace shell. No new dependencies or API routes.

## Files changed for this request

- `app/dashboard/activity/page.tsx` — searchable, sortable activity table; outcome filters, date menu/custom dates, pagination, CSV export, entry timeline drawer.
- `app/dashboard/staff/page.tsx` — staff directory, search/level filters, unknown-sender dialog, validated add-staff form, detail drawer and removal confirmation.
- `app/dashboard/business-bible/page.tsx` — document overview, learned categories, directory alerts, CSV import, template downloads, upload/review dialog and decision-rule drawer.
- `app/dashboard/settings/page.tsx` — timer/replies, email accounts, WhatsApp, tone, notifications, plan/billing panes; explicit Save/Discard, connection and verification dialogs.
- `components/dashboard/WorkspaceUI.tsx` — reusable native dialogs/drawers, fields, choices, switches, segmented controls, safe CSV export.
- `components/dashboard/TeamAccess.tsx` — existing organization invitation/resend/revoke workflows, separate from the staff directory; owner revocation remains disabled.
- `components/dashboard/WorkspaceShell.tsx` — route-specific report/template/import actions.
- `app/dashboard/workspace.css` — shared styling and responsive layouts.

## Connected behavior

Activity/history and directory reads, add staff, category-based CSV imports, timer configuration, notification flags, tone instructions, company domain, supported email OAuth/disconnection, WhatsApp code request/verification, subscription/history reads, organization invitations/resend/revoke. Existing billing route remains linked. Forms display service errors and report success only after API confirmation. No real account writes were performed during validation.

## Differences requiring backend work

The repository's APIs do not provide staff-level updates/removal, sender ignore policies, PDF/Word parsing/version comparison, decision-rule persistence, quiet hours, custom per-level policies, CC filtering or WhatsApp test sending. Those controls are disabled in live mode or available in explicitly labelled sample previews. Sample document comparisons are illustrative and do not claim to analyze uploaded files. Actual document/invoice downloads are enabled only when a service supplies a download URL. Missing timestamps, document content and billing details are not fabricated.

Activity filtering/counts apply to loaded records; additional server history can be loaded. Staff filters/counts apply to the current server page. Preview preferences are cleared when returning to live Settings.

## Validation

- `npm run lint` — passed, no warnings/errors.
- `npx tsc --noEmit --incremental false` — passed.
- `HAELO_DIST_DIR=.next-dashboard-qa npm run build` — passed, all 16 routes generated.
- Headless Google Chrome, mocked API fixtures: 33 screenshots across desktop and 320/390/768/1024 px widths, no document overflow or browser exceptions. Activity search/range/detail, native Escape dismissal, staff required-field validation and confirmed creation, CSV upload, sample comparison, explicit timer saving.
- Additional mocked interaction checks: notification/tone Save, Discard, inbox disconnection, normalized WhatsApp code request, organization invitation, sample-only staff edits/removal and rule saving. No preview write requests.
- Reviewed desktop activity table, Bible overview, staff drawer, timer settings and mobile Settings/Bible screenshots against references. Fixed a hidden table label escaping the mobile scroll container.

Evidence: `workspace-details-qa.json`, `workspace-interactions-qa.json`, and `workspace-*.png` in this directory. Browser scripts ran from `/tmp/haelo-browser-qa`; no testing packages were added to the project.
