# FocusFlow Project & Agent Verification Guide

You are working on the **FocusFlow** web application for a non-technical user. Follow these mandatory rules and project architectural layout:

---

## 1. Project Directory Map
The project is modularized into dedicated files to prevent regressions:

* **`index.html`** (UI Skeleton & Layout):
  * Header, tab bar, navigation, screens, cards, modals, and inline UI triggers.
  * **Rule:** Only edit this file when changing HTML structure, adding buttons/modals, or modifying text.

* **`css/styles.css`** (Design & Layout):
  * Color schemes, container constraints, animations, safe-area headers for mobile/PWA.
  * **Rule:** All styling belongs here.

* **`js/audio.js`** (Audio Effects):
  * Web Audio API synthesized chimes (`playChime('bell')`, `playChime('alert')`) and sound toggle.

* **`js/app.js`** (Core Logic & Controllers):
  * Landmark Map inside `js/app.js`:
    1. **Lines 1 – 300**: Firebase config, global `state` object, scaffold stages, OCD settings.
    2. **Lines 300 – 2,800**: Calendar day grid, timeline view, drag-and-drop events, calendar sync.
    3. **Lines 2,800 – 4,900**: Kitchen sub-tabs, pantry, recipe book, meal planner, grocery shopping list.
    4. **Lines 4,900 – 7,600**: Nutrition engine, USDA whole foods database, barcode scanner, macro adjustments.
    5. **Lines 7,600 – 9,500**: Wellbeing correlations, 7-day health averages, Apple Health sync.
    6. **Lines 9,500 – 9,550**: App lifecycle & startup (`window.onload`), screen re-rendering.
    7. **Lines 9,550 – 10,650**: Firebase Firestore Cloud Sync & offline data persistence.
    8. **Lines 10,650 – 11,800**: Reverse Chef wizard, recipe timers, Walmart grocery importer.
    9. **Lines 11,800 – 12,900**: Multi-calendar engine, Google Calendar 2-way sync, color palettes.
    10. **Lines 12,900 – 13,570**: Biometrics, cardiac & medication trackers, event completion/skip toggles.

* **`sw.js`** (Service Worker):
  * Handles offline caching for the PWA app shell and external CDN libraries.

---

## 2. Mandatory Rules for the Agent

### Rule 1: No Blind Guessing (Find Root Cause First)
- Before changing any code, you must locate the exact lines causing the bug and explain the root cause in plain English.
- Double-check:
  * Are IDs and class names spelled identically in `index.html` and `js/app.js`?
  * Are functions invoked by inline `onclick="..."` defined on the global scope?
  * Do event listeners target elements that actually exist?

### Rule 2: Mandatory Verification
- Inspect all modified functions to verify logic flow.
- Ensure no JavaScript syntax errors (e.g. unclosed brackets or stray tags) are introduced.
- Provide the user with a simple 1-2-3 checklist to test the fix in their browser.

### Rule 3: Thrash Prevention (Circuit Breaker)
- If an issue is not resolved after **2 attempts**, STOP editing.
- Summarize what was tested, ask the user to check their browser's Developer Tools Console (`Right-Click > Inspect > Console`) for any red errors, and wait for feedback.
