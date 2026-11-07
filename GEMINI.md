# FocusFlow Project & Agent Behavior Guide

You are working on the **FocusFlow** web application for a non-technical user. Follow these mandatory rules, user preferences, and project architectural layout:

---

## 0. User Preferences & Environment
* **Browser Requirement:** The user **EXCLUSIVELY uses Google Chrome** (on both Mac and mobile). 
  * Do NOT provide Safari-specific shortcuts or advice.
  * All browser testing, developer tools guidance (e.g. `Right-Click > Inspect > Console`), and PWA behavior must be targeted for **Google Chrome**.

---

## 1. Project Directory Structure & Strict Domain Ownership
Every file in this project has an exclusive domain. You are **STRICTLY FORBIDDEN** from declaring functions in any file outside its designated domain:

* **`index.html`** (UI Skeleton & Layout):
  * Exclusively for HTML header, tab bar, navigation, screens, cards, modals, and buttons.
  * **Rule:** ZERO inline `<script>` blocks with logic and ZERO `<style>` tags.

* **`css/styles.css`** (Design & Layout):
  * Exclusively for CSS color schemes, container constraints, animations, safe-area headers.
  * **Rule:** ZERO HTML tags (`<style>`, `</style>`) allowed.

* **`js/timeline.js`** (Calendar & Day Grid Timeline):
  * Exclusively owns: Calendar day grid, timeline view, event drag-and-drop, hour height math, event anchor types, and ADHD schedule suggestions.
  * **Forbidden:** ❌ Pantry, recipes, cooking, barcodes, macros, cardiac health.

* **`js/kitchen.js`** (Kitchen, Pantry, Recipes & Shopping):
  * Exclusively owns: Smart pantry, kitchen zones, food types, weekly meal planner, grocery shopping list, recipe book, and recipe inspect modal.
  * **Forbidden:** ❌ Calendar day grid math, event dragging, biometrics, Apple Health.

* **`js/chef.js`** (Reverse Chef Wizard & Receipt Importer):
  * Exclusively owns: Reverse Chef 3-step wizard, kitchen scale mode, recipe step timers, Walmart & grocery receipt photo scanner & OCR parser.
  * **Forbidden:** ❌ Calendar timeline rendering, daily schedules, macro charts.

* **`js/nutrition.js`** (Nutrition, Macros & Whole Foods):
  * Exclusively owns: `renderNutrition()`, macro dials, macronutrient calculations & adjustments, USDA whole foods database, and barcode scanner.
  * **Forbidden:** ❌ Calendar drag-and-drop, cooking timers, Firebase cloud sync.

* **`js/health.js`** (Wellbeing Correlations & Apple Health):
  * Exclusively owns: Wellbeing correlation charts, 7-day health averages, 30-day skill growth graphs, and Apple Health sync & export modal.
  * **Forbidden:** ❌ Pantry rendering, recipes, timeline grid drawing.

* **`js/biometrics.js`** (Biometrics & Cardiac Tracking):
  * Exclusively owns: Blood pressure, resting heart rate, and medication tracking.
  * **Forbidden:** ❌ Pantry logic, recipe book filters, calendar zoom controls.

* **`js/sync.js`** (Cloud Sync & Google Calendar Sync):
  * Exclusively owns: Firebase Firestore Cloud Sync, Google sign-in, offline queue, Google Calendar 2-way sync, and PWA update toast.
  * **Forbidden:** ❌ Visual card rendering for kitchen, food, or nutrition.

* **`js/state.js`** (App State & Scaffolding):
  * Global `state` object, constants, Firebase config, scaffold stages, and core time helpers.

* **`js/audio.js`** (Audio Effects):
  * Web Audio API synthesized chimes (`playChime('bell')`) and sound toggle.

* **`js/app.js`** (App Lifecycle & Navigation):
  * Tab navigation (`switchTab`), state persistence (`saveAppState`, `loadAppState`), phone demo modal, and `window.onload` startup sequence.

* **`verify.py`** (Universal Boundary Enforcer & Test Suite):
  * Automated testing script that verifies HTML tags, local asset links, compiles all JS with macOS WebKit JavaScriptCore, validates `site/` deployment sync, and **strictly enforces module domain boundaries** in ~0.25s.

* **`tests/regressions.json`** (Known Mistakes Database):
  * Automatically loaded and tested by `verify.py` on every run. Stores all past bugs and mistakes to prevent them from ever recurring.

* **`backups/`** (Historical Backups & Archives):
  * All safety backups, archive copies, or temporary exported files MUST live here. Never leave backups in the root folder.

* **`site/`** (Live GitHub Pages Mirror):
  * **Rule:** Whenever making edits to `index.html`, `css/`, `js/`, or `sw.js`, **ALWAYS copy the modified files into the `site/` folder** so that the user's phone (homescreen PWA) gets the updates!

* **`sw.js`** (Service Worker):
  * Handles offline caching for the PWA app shell and external CDN libraries.

---

## 2. Mandatory Rules for the Agent

### Rule 1: MANDATORY Plan & Approval Gate (Look Before You Leap)
**You are STRICTLY FORBIDDEN from editing or creating files upon receiving a user prompt without prior approval.**
Before changing ANY code:
1. **Inspect & Diagnose:** Read the relevant file(s) and locate the exact functions/lines involved.
2. **Formulate a Plan:** Determine the root cause and the exact step-by-step changes needed.
3. **Explain to the User in Plain English:** Explain what is causing the issue or how the feature will work without technical jargon.
4. **ASK FOR APPROVAL:** End your response by asking the user:
   > *"Would you like me to proceed with this plan?"*
   **WAIT** for the user's explicit approval before touching any files.

### Rule 2: Run Tests After Making Changes & Register Fixed Bugs
After the user approves your plan and you make the changes:
1. **Run the Automated Test Suite:**
   Execute:
   ```bash
   python3 verify.py
   ```
   Verify that all checks pass with zero errors in ~0.25s, including domain boundary checks.
2. **Automatically Register Fixed Bugs / Mistakes:**
   Whenever you fix a bug, you MUST register it into the regression database so it is tested forever:
   ```bash
   python3 verify.py --add-mistake --id "short_id" --desc "Plain English description of what to avoid" --file "filename" --pattern "forbidden_string"
   ```
3. **Verify Desired Effect:**
   Inspect the modified functions line-by-line to verify logic flow:
   * Are element IDs and class names identical between HTML and JS?
   * Are event listeners attached to elements that actually exist?
   * Did the edit specifically produce the user's requested behavior without collateral side-effects?
4. **Provide a Testing Checklist:**
   Give the user a simple, 1-2-3 checklist of what to tap in Google Chrome on their computer or phone to verify the change.

### Rule 3: Auto-Sync to `site/` and Push to GitHub
After your tests pass:
1. Synchronize the modified files from the root into the `site/` folder.
2. Commit the changes to Git with a concise, descriptive message.
3. Push to `origin main` so the user's Chrome app updates immediately.

### Rule 4: Thrash Prevention (Circuit Breaker)
- If an issue is not resolved after **2 attempts**, STOP editing.
- Do not make a 3rd blind guess. Summarize what was tried, ask the user to check their Chrome Developer Tools Console (`Right-Click > Inspect > Console`), and wait for input.

### Rule 5: Failed Hypotheses Tracking (Never Retry Failed Solutions)
- When diagnosing a problem or proposing a second attempt, you MUST explicitly state:
  1. What previous approaches were already tried and why they failed.
  2. Why your new proposed solution is architecturally different from those failed approaches.
- You are **STRICTLY FORBIDDEN** from re-attempting or proposing minor variations of a solution that already failed.

### Rule 6: Clean Revert Before New Attempts (Never Stack Broken Edits)
- If an attempt fails automated tests or does not resolve the issue, you MUST immediately revert the modified files back to the last clean git commit (`git checkout HEAD -- <file>`) before attempting anything else.
- NEVER stack speculative edits on top of previously broken code. Every new attempt must start from a clean, working baseline.

---

## 3. Permanent Code Hygiene & Organization Rules
To ensure the project never degenerates into a monolithic mess again, you MUST obey these structural rules:

1. **Never Re-Monolith `index.html`:**
   * DO NOT insert `<script>` blocks with logic or `<style>` blocks with CSS directly into `index.html`.
   * HTML is strictly for layout, buttons, and screens.
   * Logic belongs in the appropriate file inside `js/`, and styles belong in `css/styles.css`.
2. **Keep the Root Folder 100% Clean:**
   * DO NOT save backup files (e.g. `*.bak*`, `index-copy.html`, `test.js`, `.zip` files) in the root directory.
   * If a backup is needed, save it inside the **`backups/`** directory.
   * Clean up all temporary or scratch files before concluding your turn.
3. **Respect Module Domain Boundaries:**
   * Every function MUST be defined in its designated domain file as listed in Section 1.
   * Cross-domain function declarations will cause `verify.py` to fail and block your commit.
4. **Keep `verify.py` Green:**
   * Any change you make must keep `python3 verify.py` passing with 0 errors.
