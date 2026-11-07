# FocusFlow Project & Agent Verification Guide

You are working on the **FocusFlow** web application for a non-technical user. Follow these mandatory rules and project architectural layout:

---

## 1. Project Directory Structure
The project is modularized into dedicated feature files to prevent regressions and keep context focused:

* **`index.html`** (UI Skeleton & Layout):
  * Header, tab bar, navigation, screens, cards, modals, and inline UI triggers.
  * **Rule:** Only edit this file when changing HTML structure, adding buttons/modals, or modifying text.

* **`css/styles.css`** (Design & Layout):
  * Color schemes, container constraints, animations, safe-area headers for mobile/PWA.
  * **Rule:** All styling belongs here.

* **`js/`** (Feature Logic Modules):
  * **`state.js`**: Initial app state, Firebase config, scaffold stages, color schemes, and core helpers.
  * **`audio.js`**: Web Audio API synthesized chimes (`playChime('bell')`) and sound toggle.
  * **`sync.js`**: Firebase Firestore Cloud Sync, Google sign-in, offline queue, and password management.
  * **`timeline.js`**: Calendar day grid, timeline view, drag-and-drop events, and ADHD suggestions.
  * **`calendar-categories.js`**: Dynamic calendar categories, color palettes, and Google Calendar 2-way sync.
  * **`kitchen.js`**: Kitchen sub-tabs, pantry, weekly meal planner, shopping list, recipe book, and filters.
  * **`chef.js`**: Reverse Chef wizard (stages 1, 2, 3), step timers, and Walmart grocery importer.
  * **`nutrition.js`**: Macronutrient calculations & adjustments, USDA whole foods database, and barcode scanner.
  * **`health.js`**: Wellbeing correlations, 7-day health averages, 30-day skill graphs, and Apple Health sync.
  * **`biometrics.js`**: Cardiac & medication tracking, actual vs plan duration calculation, and event completion/skip toggles.
  * **`app.js`**: Tab navigation (`switchTab`), state persistence (`saveAppState`, `loadAppState`), phone demo modal, and `window.onload` startup sequence.

* **`site/`** (Live GitHub Pages Mirror):
  * **Rule:** Whenever making edits to `index.html`, `css/`, `js/`, or `sw.js`, **ALWAYS copy the modified files into the `site/` folder** so that the user's phone (homescreen PWA) gets the updates!

* **`sw.js`** (Service Worker):
  * Handles offline caching for the PWA app shell and external CDN libraries.

---

## 2. Mandatory Rules for the Agent

### Rule 1: No Blind Guessing (Find Root Cause First)
- Before changing any code, you must locate the exact lines causing the bug and explain the root cause in plain English.
- Double-check:
  * Are IDs and class names spelled identically in `index.html` and the corresponding `js/` module?
  * Are functions invoked by inline `onclick="..."` defined on the global scope?
  * Do event listeners target elements that actually exist on the page?

### Rule 2: Mandatory Verification
- Inspect all modified functions to verify logic flow.
- Ensure no JavaScript syntax errors (e.g. unclosed brackets or stray tags) are introduced.
- Provide the user with a simple 1-2-3 checklist to test the fix in their browser or on their phone.

### Rule 3: Auto-Sync to `site/` and Commit & Push to GitHub
- After completing a verified edit:
  1. Synchronize the modified files from the root into the `site/` folder.
  2. Commit the changes to Git with a concise, descriptive message.
  3. Push to `origin main` so the user's phone app updates immediately.

### Rule 4: Thrash Prevention (Circuit Breaker)
- If an issue is not resolved after **2 attempts**, STOP editing.
- Summarize what was tested, ask the user to check their browser's Developer Tools Console (`Right-Click > Inspect > Console`) for any red errors, and wait for feedback.
