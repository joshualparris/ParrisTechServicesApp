Here is everything I know about Parris Tech Services based on your inputs, followed by the strategy for using GitHub Copilot simultaneously, and finally the two detailed prompts you requested.

1. What I know about Parris Tech Services
Business Identity: Parris Tech Services (Registered ABN: 19 911 769 423).

Owner/Operator: Joshua Luke Parris.

Location: Bendigo, Victoria (Based on the appointment with Kate Staley).

Core Philosophy: A "Tech Checkup" model—similar to a car service but for devices. It is proactive, educational ("teach-as-you-go"), and transparent.

Target Audience: Individuals and small businesses, often older individuals needing help with basics, or anyone needing optimization for Windows, Mac, iPhone, and Android.

Current Goals:

Move from manual processes to two distinct HTML-based web apps.

App 1 (ParrisTechServicesApp): The "Business OS"—invoicing, CRM, scheduling, templates.

App 2 (ParrisTechApp): The "Service Tool"—a dynamic, goal-oriented checklist for the actual appointment.

Immediate Context: You have a client, Kate Staley, visiting today from 4 pm–6 pm in Bendigo for a general checkup.

2. How to use GitHub Copilot simultaneously
If you are having Codex (or another primary model) generate the Core Application Logic (HTML/JS) for ParrisTechApp, you don't want Copilot to try to write the same file at the same time.

The best non-conflicting task for Copilot is "Data & Content Generation."

While Codex builds the engine (the code that makes checkboxes appear and timers run), Copilot can build the fuel (the detailed database of questions and steps).

Action Plan: While Codex is writing index.html and app.js, open a new file called checklist_rules.js or data.json and give Copilot this specific instruction:

Copilot Prompt: "I need a large JSON dataset for a tech support checklist app. Create a structured JSON array of objects. Each object should represent a task and have: id, category (Windows, Mac, iPhone, Android, Wi-Fi), goal_tag (Speed, Security, Storage, Basics), task_name, estimated_minutes, and instructions (a brief guide on how to do it).

Please generate 20 specific tasks for Windows 11 (focusing on storage sense, startup apps, updates), 20 tasks for macOS Ventura/Sonoma (focusing on login items, iCloud), and 15 tasks each for iOS and Android (focusing on privacy and battery health)."

Why this works:

It creates a massive value asset (the knowledge base) without touching the logic code.

You can simply "plug in" this file once Codex finishes the main app.

3. The Prompts
Here are the optimized prompts. You can copy and paste these directly.

Prompt 1: For the Business Management App
Copy/Paste this into your AI tool:

Plaintext

Project: ParrisTechServicesApp (MVP)
Context: I am Joshua Parris, owner of Parris Tech Services in Bendigo (ABN 19 911 769 423). I need a browser-based "Business OS" to manage my IT consulting appointments and invoicing.

Technical Constraints:
- Single HTML file (or cleanly separated index.html / style.css / script.js).
- NO backend database. Use browser LocalStorage for all data persistence.
- minimal external dependencies.

Core Features Required:
1. Dashboard:
   - Display a summary of "Today's Appointments" and "Pending Invoices".
   - A "Quick Links" section (hardcoded links to my Square site, Google Business profile, etc.).

2. Client CRM (Mini):
   - CRUD (Create, Read, Update, Delete) for Clients.
   - Fields: Name, Device Types (checkboxes: Win, Mac, iOS, Android), Notes, Contact Info.

3. Appointment Scheduler:
   - Create appointments linking a Client to a Date/Time.
   - Status tracking: "Booked", "Arrived", "Completed", "Paid".
   - **Crucial Integration:** Add a specific button on an appointment card called "Launch Session". When clicked, this should open a URL (simulated for now) to 'ParrisTechApp' passing the client's name and devices as query parameters (e.g., `parristechapp.html?client=Kate&devices=Windows,iPhone`).

4. Invoicing System:
   - Generate simple invoices based on hourly rates (default $75/hr individual, $100/hr business) or fixed "Service Checkup" fees.
   - Must include my ABN (19 911 769 423) and business details on the invoice view.
   - A "Print" button that hides the app UI and shows only the clean invoice paper for printing to PDF.

5. Design:
   - Clean, professional, "Tech Consultant" aesthetic.
   - Sidebar navigation.

Please write the complete code for this MVP.
Prompt 2: For the Individual Appointment App
Copy/Paste this into your AI tool:

Plaintext

Project: ParrisTechApp (The "Checkup" Engine)
Context: This is a standalone tool used DURING a client visit. It acts like a flight pre-check or car service checklist. It tailors the session based on what equipment the client brings.

Technical Constraints:
- Browser-based HTML/CSS/JS.
- LocalStorage to save the current session state (so I don't lose data if I refresh).

Core Workflow Logic:

1. The "Intake" Screen (The Setup):
   - Button: "Start New Session".
   - Input: Client Name.
   - **The Matrix Selector:** A set of toggles/checkboxes for:
     - Devices Present: [ ] Windows PC  [ ] Mac  [ ] iPhone  [ ] Android  [ ] Tablet
     - Client Goals: [ ] Speed Up  [ ] Clean Storage  [ ] Security Check  [ ] Learn/Education  [ ] General Checkup
   - Button: "Generate Checklist".

2. The "Dynamic Checklist" (The Engine):
   - Based on the inputs above, the app must render a list of tasks.
   - Logic Examples:
     - If "Windows" + "Speed Up" is selected -> Add tasks: "Check Startup Apps", "Run Disk Cleanup", "Check Windows Updates".
     - If "iPhone" + "Storage" is selected -> Add tasks: "Offload Unused Apps", "Check iCloud Photo Sync".
     - If "Education" is selected -> Add task: "Teach: How to identify a phishing email".
   - *Note: Please include a 'rules' object in the JS code that I can easily expand later with more tasks.*

3. The Session View (Active Mode):
   - A list of the generated tasks with checkboxes.
   - A simple countdown timer (Default 1 hour, adjustable) to keep me on track.
   - A "Notes" field next to each task to record what was done (e.g., "Removed McAfee, installed Defender").

4. The "Handover" Report:
   - A "Finish Session" button.
   - Generates a friendly summary for the client: "What we did today", "Advice for the future".
   - Print button to save this summary as a PDF to email them later.

Please write the complete code for this MVP, focusing heavily on the JavaScript logic that filters the tasks based on the initial selection.
Quick Plan for Kate Staley (Today 4-6 PM)
Since you might not have the apps fully coded and tested by 4 PM, here is a manual "Run Sheet" you can use for Kate's session based on your "Tech Checkup" philosophy:

Kate Staley - Parris Tech Checkup (2 Hours)

0:00 - 0:15 | Intake & Discovery

Connect devices to Wi-Fi.

Question: "If you could wave a magic wand and fix one thing about this computer/phone today, what would it be?" (Focus on this first).

Permission: Confirm backups exist before deleting anything.

0:15 - 0:45 | The "Quick Wins" (Performance)

Windows/Mac: Check Startup apps (Task Manager/Login Items) - usually the #1 cause of slowness.

Updates: Start long OS updates now so they run while you talk.

Browser: Install uBlock Origin (or similar) to stop ads/pop-ups (high value for user experience).

0:45 - 1:15 | Security & Storage

Storage: Run TreeSize (Windows) or OmniDiskSweeper (Mac) to find large files instantly.

Security: Check if 2FA is on for her email. This is the highest value security step you can teach her.

1:15 - 1:45 | Education (The "Teach-as-you-go" block)

Pick 2 topics based on her questions (e.g., "How do I organize my photos?" or "How do I know if an email is a scam?").

1:45 - 2:00 | Wrap up

Write down the summary notes.

Payment.

Schedule next checkup (6 or 12 months).

Would you like me to generate a specific checklist of "safe cleanup tasks" for Windows vs Mac that you can copy-paste into a document for today's session?

---

Files added in this workspace to support the checklist app:

- modules/checklist_data.json — a JSON dataset of tasks (Windows, Mac, iPhone, Android).
- modules/checklist_rules.js — a JS module exporting a `rules` map, `loadChecklistData()` and `generateChecklist(devices, goals, data)` helpers.

Quick usage (frontend):

1. Load the data and generate tasks:

```js
import { loadChecklistData, generateChecklist } from './modules/checklist_rules.js';
const data = await loadChecklistData();
const tasks = generateChecklist(['Windows','iPhone'], ['Speed','Storage'], data);
```

2. Render `tasks` in your session view and save notes/state to LocalStorage.

I can wire these into `ParrisTechApp` next if you want.

New files added for the session app and printable handout:

- `ParrisTechApp/index.html` — intake, checklist generator, timer, notes, handover.
- `ParrisTechApp/styles.css` — minimal styles for the app UI.
- `ParrisTechApp/app.js` — session logic; uses `modules/checklist_rules.js` and `modules/checklist_data.json`.
- `Parris Tech Services/checklists/kate_checklists.html` — printable one-page handout (open in browser and Print → Save as PDF).

To run locally, open `ParrisTechApp/index.html` in your browser (double-click or serve with a simple static server). The app stores session state in LocalStorage under `parris_current_session`.