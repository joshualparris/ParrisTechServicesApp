# ParrisTechServicesApp

Local-first Business OS + Checkup Engine — lightweight static web app.

## Quick start (local)
From the project root run one of the following to serve files over HTTP (recommended):

PowerShell / CMD:
```bash
# Python (Windows / cross-platform)
python -m http.server 8000
# or Node (npx http-server)
npx http-server . -p 8080
```

Then open in your browser:
- http://localhost:8000/Parris%20Tech%20Services/index.html
- http://localhost:8000/ParrisTechApp/index.html

Important: Do NOT open via `file://` URLs. Use the HTTP server so ES modules, fetch, and deep-links work and the app can open `ParrisTechApp` without encountering `ERR_FILE_NOT_FOUND`.

## Run the CI check locally
This repo includes a minimal `package.json` and a lightweight `scripts/check.js` used by the GitHub Actions workflow.

Install Node deps (optional) and run the check script:
```bash
npm ci
npm run check
```

The check script validates presence of key files and parses `modules/checklist_data.json`.

## Troubleshooting
- ERR_FILE_NOT_FOUND when launching sessions: ensure both apps are served by the same local server (see Quick start). Deep-links rely on relative HTTP URLs.
- If imports fail (CSV/JSON), use the Settings > Export JSON to inspect/repair your data.
- Encrypted backups: exported `.enc` files require the same passphrase to import.

## Developer notes
- App code lives in:
  - `Parris Tech Services/` — Business OS UI and main app bundle (`app.bundle.js`).
  - `ParrisTechApp/` — lightweight session/checklist engine.
  - `modules/` — shared modules (checklist data, state, utils).
- Local persistence: `localStorage` (no backend).
- To test deep-link flows: start the server, open `Parris Tech Services/index.html`, then click "Launch Session" — it will open `ParrisTechApp` with URL params.

## Kate Staley handouts
One-page checklists for Kate are in `Parris Tech Services/checklists/`.

## Next steps / TODOs
See the project TODO tracker (maintained in the repo via the task system). High-priority items: accessibility sweep, CI script, automated tests, payment provider integration.

## Stripe Checkout (local/dev example)
The repo includes a minimal example server to create Stripe Checkout sessions for invoices. This is an optional, local developer example — real payment integration requires a Stripe account and secret key.

To run the example server:

```bash
# from the repo root
cd serverless
npm install express stripe cors
# set your Stripe test secret key in env:
set STRIPE_SECRET_KEY=sk_test_...
node stripe-checkout-server.js
```

To use from the app (client-side): call the endpoint `POST /create-checkout-session` with JSON `{ amount: 12345, currency: 'aud', invoiceId: 'INV-123' }` — the endpoint returns `{ url }` which you can open to start Checkout.

Security: Do NOT commit or expose your Stripe secret key. This server is an example for local testing and should be deployed with proper secrets management for production.

---
If you'd like, I can also add a dev `launch` script or a small `Makefile`/PowerShell script to start the server and open the browser automatically.
