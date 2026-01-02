I'll create a short, copy-pasteable safe-cleanup checklist for Windows and Mac, and track progress in the TODO list.


Windows — Safe Cleanup Checklist

Pre-checks (5 min): Confirm backup exists, create a System Restore point, ask permission before removals.
Check Startup Apps (5–10 min): Open Task Manager → Startup; disable nonessential apps (note what you change).
Uninstall Unused Programs (10–15 min): Settings → Apps → Uninstall large/unused apps; keep list of removed apps.
Run Disk Cleanup / Storage Sense (10 min): Start → Disk Cleanup or Settings → Storage → Run cleanup; remove temporary files.
Remove Browser Extensions (5–10 min): In primary browser, review extensions; disable/remove unknown/unused.
Scan for Malware (15–30 min): Run Windows Defender full scan (or Malwarebytes if installed).
Update Windows & Drivers (10–30 min, may run in background): Settings → Update & Security; start update; update graphics/network drivers if needed.
Check Disk Health (5–10 min): Run chkdsk or open PowerShell Get-PhysicalDisk / run manufacturer tool for SSD health.
Clear Downloads & Large Files (10–15 min): Sort Downloads by size/date; move/delete after confirmation.
Manage OneDrive / Cloud Sync (5–10 min): Pause/adjust sync; check for duplicate sync folders.
Adjust Visual Effects (5 min): System → Advanced → Performance Settings → Adjust for best performance or custom.
Temporary Profile / Cache Cleanup (5–10 min): Clear browser caches, temp folders, and thumbnail cache.
Reboot & Verify (5 min): Restart, confirm boot time improved and apps open correctly.
Client Advice (2–3 bullets): Recommend password manager, set up basic backup, schedule follow-up.
macOS — Safe Cleanup Checklist

Pre-checks (5 min): Confirm Time Machine or other backup exists; get user consent.
Check Login Items (5–10 min): System Settings → General → Login Items; remove nonessential items.
Free Up Storage (10–15 min): Apple menu → About This Mac → Storage → Manage; enable recommendations (Store in iCloud, Optimize Storage).
Uninstall Unused Apps (10 min): Move to Trash or use AppCleaner; note removed apps.
Manage iCloud Drive & Photos (10–15 min): Review iCloud storage, optimize Photos settings, offload large libraries if requested.
Browser Cleanup (5–10 min): Remove extensions, clear caches in Safari/Chrome.
Run Malware Scan (10–20 min): Use Malwarebytes for Mac or built-in checks.
Update macOS & Apps (10–30 min): System Settings → Software Update; update App Store apps.
Check Disk/First Aid (10–15 min): Boot to Recovery or use Disk Utility → First Aid on internal drive.
Review Background Processes (5–10 min): Activity Monitor → CPU/Memory; identify runaway apps.
Manage Time Machine Snapshots (5–10 min): Delete local snapshots if disk space tight.
PRAM/NVRAM & SMC Tips (if needed): Note restart procedures for persistent hardware issues.
Reboot & Verify (5 min): Restart and confirm normal behavior.
Client Advice (2–3 bullets): Recommend regular Time Machine backups, password manager, and Apple ID 2FA.
Would you like this formatted as a printable one-page handout (PDF-ready) or as a plain-text checklist for your notes? I'll mark the TODOs complete once you confirm the format.

ParrisTechServicesApp — Upgrade TODO
- [done] Add Contact/About page with email (parristechservices@gmail.com), phone (0457633371), ABN link (https://abr.business.gov.au/ABN/View?id=19911769423), Facebook (https://www.facebook.com/parristechservices/), LinkedIn (https://au.linkedin.com/in/joshua-parris-b31444260), and both websites (https://parristechservices.wixsite.com/parris-tech-services, https://parristechservices.square.site/) plus Calendly CTA (https://calendly.com/parristechservices1/computer-consultation).
- [done] Seed Quick Links panel with Wix site, Square site, About page, Calendly links (including January 2026 link), Facebook, LinkedIn, ABN lookup; show recognizable badges/icons.
- [done] Dashboard: add “Book via Calendly” action, highlight today’s arrivals, unpaid invoices, and quick template shortcuts.
- Clients: support tags (business/individual, device types), consent flag, last-contact timestamp, duplicate-merge helper, CSV import. ✅ added type/devices/consent/last-contact fields, CSV import, duplicate merge, free-form tags.
- Appointments: add follow-up reminders, recurring flag, device checklists per device type, arrival deep-link into ParrisTechApp with client/appointment query params, .ics export. ✅ follow-up/recurring/checklist + deep-link + enriched .ics; device-type presets now auto-suggest from client devices.
- [done] Invoices: add due date, tax toggle with ABN display, payment reference, receipt option, pricing presets (call-out, block rates); improve print view with logo/branding and PDF-friendly layout.
- Templates/Assets: include booking confirmation, follow-up SMS/email, what-to-expect, privacy/consent; support variables like {{name}}, {{datetime}}, {{location}}, {{summary}}, {{next_steps}}; add quick copy/send (mailto/tel/sms) actions and preview. ✅ seeded samples, variable insertion, copy/email/SMS actions, preview.
- Settings: richer seed data sets (individual vs business), defaults for duration/pricing model/invoice footer/brand colors, logo upload. ✅ brand colors/logo inputs + seed selector; basic seed presets wired.
- Data: versioned export/import with validation and migration guardrails; optional encrypted backup (passphrase) before import. ✅ version field + encrypted export; import validation added.
- UX polish: inline validation, toast notifications, keyboard shortcuts, sticky form actions, improved mobile layout. ✅ inline validation + toasts; save shortcut + nav shortcuts; sticky headers; mobile padding tweaks.
- Integrations: mailto/tel and Calendly deep links everywhere relevant; add .ics download for appointments (no backend). ✅ deep links + .ics; call/email chips added.
- ParrisTechApp tie-in: when “Client arrived” clicked, open ParrisTechApp with context and allow importing checklist summary back into notes. ✅ deep-link + session summary paste and URL ingest.
- Help/Services: add “How we work” and services list from flyer; FAQs and changelog modal for new features. ✅ Help view + changelog + cleanup checklists.

Next improvements
- Add weekly/monthly analytics dashboard (appointments completed, revenue by status, average duration, top clients). ✅ metrics card added (basic); add date filters/top clients later.
- Calendar sync: generate a static .ics feed for all upcoming appointments and per-client downloads. ✅ full feed download added; per-client optional.
- Notifications: optional follow-up reminders via mailto/SMS template buttons for appointments with follow-up dates. ✅ reminder buttons added.
- Auto-save drafts: persist in-progress forms (clients/appointments/invoices/templates) every few seconds to avoid loss. ✅ autosave drafts for forms.
- Accessibility: improve keyboard focus order, add ARIA labels, ensure contrast meets WCAG AA. (partial: more labels added; focus audit pending)
- Mobile polish: single-column cards, bottom nav shortcuts, and larger touch targets on small screens. ✅ bottom nav + larger touch targets added.
- Pricing presets: quick buttons for common invoice presets (call-out, first-visit discount, business/individual rates). ✅ preset buttons added.
- Reporting: printable daily worksheet (today’s appointments + checklists) and monthly invoice summary export (CSV). ✅ daily worksheet + monthly CSV export.
- Onboarding tips: lightweight tooltip walkthrough for first launch highlighting nav, quick links, and export/import. ✅ onboarding modal with dismiss.
- Settings hardening: import validator with detailed errors and a “dry run” mode before applying data. ✅ validator + dry-run input.

Finance/reconciliation backlog
- Reconcile view: filters (client/status/date/due), bulk mark paid, add payment method/notes, record payment dialog.
- Reporting: CSV export of invoices (paid/unpaid), monthly revenue summary, aging report, per-client totals.
- Presets: quick buttons for common charges (call-out, standard block, concession/individual/business rates).
- Audit trail: payment history per invoice (dates/amounts/methods).
- Search/filters: by client, status, due date, reference, amount range within invoices.
- Finance dashboard widgets: MTD revenue, overdue count/total, next 7 days due, paid/unpaid charts.
- Settings: default invoice footer/payment instructions, default tax rate, optional payment links.
