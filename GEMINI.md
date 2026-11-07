# FocusFlow Project & Agent Behavior Guide

You are working on the **FocusFlow** web application for a non-technical user. Follow these mandatory rules and project architectural layout:

---

## 1. Project Directory Structure
The project is modularized into dedicated feature files to prevent regressions and keep context focused:

* **`index.html`** (UI Skeleton & Layout):
  * Header, tab bar, navigation, screens, cards, modals, and inline UI triggers.
  * **Rule:** Only edit this file when changing HTML structure, adding buttons/modals, or modifying text.

* **`css/styles.css`** (Design & Layout):
  * Color schemes, container constraints, animations, safe-area headers for mobile/PWA.
  * **Rule:** All styling belongs here. Zero `<style>` or `</style>` tags allowed inside this file.

* **`js/`** (Feature Logic Modules):
  * **`state.js`**: Initial app state, Firebase config, scaffold stages, color schemes, and core helpers.
  * **`audio.js`**: Web Audio API synthesized chimes (`playChime('bell')`) and sound toggle.
  * **`sync.js`**: Firebase Firestore Cloud Sync, Google sign-in, offline queue, and PWA update toast.
  * **`timeline.js`**: Calendar day grid, timeline view, drag-and-drop events, and ADHD suggestions.
  * **`calendar-categories.js`**: Dynamic calendar categories, color palettes, and Google Calendar 2-way sync.
  * **`kitchen.js`**: Kitchen sub-tabs, pantry, weekly meal planner, shopping list, recipe book, and filters.
  * **`chef.js`**: Reverse Chef wizard (stages 1, 2, 3), step timers, and Walmart grocery importer.
  * **`nutrition.js`**: Macronutrient calculations & adjustments, USDA whole foods database, and barcode scanner.
  * **`health.js`**: Wellbeing correlations, 7-day health averages, 30-day skill graphs, and Apple Health sync.
  * **`biometrics.js`**: Cardiac & medication tracking, actual vs plan duration calculation, and event completion/skip toggles.
  * **`app.js`**: Tab navigation (`switchTab`), state persistence (`saveAppState`, `loadAppState`), phone demo modal, and `window.onload` startup sequence.

* **`verify.py`** (Automated Test Suite):
  * Automated testing script that verifies HTML tags, local asset links, compiles all JS with macOS WebKit JavaScriptCore, and validates `site/` deployment sync.

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

### Rule 2: Run Tests After Making Changes
After the user approves your plan and you make the changes:
1. **Run the Automated Test Suite:**
   Execute:
   ```bash
   python3 verify.py
   ```
   Verify that all checks pass with zero errors (all HTML tags matched, all JS modules compiled by macOS WebKit JavaScriptCore, and all files synchronized).
2. **Verify Desired Effect:**
   Inspect the modified functions line-by-line to verify logic flow:
   * Are element IDs and class names identical between HTML and JS?
   * Are event listeners attached to elements that actually exist?
   * Did the edit specifically produce the user's requested behavior without collateral side-effects?
3. **Provide a Testing Checklist:**
   Give the user a simple, 1-2-3 checklist of what to tap on their phone or browser to verify the change.

### Rule 3: Auto-Sync to `site/` and Push to GitHub
After your tests pass:
1. Synchronize the modified files from the root into the `site/` folder.
2. Commit the changes to Git with a concise, descriptive message.
3. Push to `origin main` so the user's phone app updates immediately.

### Rule 4: Thrash Prevention (Circuit Breaker)
- If an issue is not resolved after **2 attempts**, STOP editing.
- Do not make a 3rd blind guess. Summarize what was tried, ask the user to check their browser or phone console, and wait for input.
