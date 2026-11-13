# ⚠️ STOP: MANDATORY PRE-FLIGHT CHECK (READ BEFORE DOING ANYTHING) ⚠️

**DO NOT EDIT, CREATE, OR DELETE ANY FILES UPON RECEIVING A PROMPT.**
Any edit made without presenting a step-by-step plan and receiving explicit user approval first is a **CRITICAL PROTOCOL VIOLATION**.

Before touching any code:
1. **Inspect & Diagnose:** Read relevant code.
2. **Explain in Plain English:** Tell the user what is wrong or what feature will do.
3. **Ask for Approval:** End with: *"Would you like me to proceed with this plan?"*
4. **WAIT:** Do not touch any code until the user explicitly says YES or approves.

---

> **🔎 READ THIS FIRST**
> 1️⃣ Read the Table of Contents below to find what you need — don't read the whole project.
> 2️⃣ Follow Rule 1 (plan + approval) before touching anything.
> 3️⃣ Follow Rule 8 (token conservation).
>
> **Table of Contents**
> - 0. User Preferences & Environment
> - 1. Project Directory Structure (Code Map)
> - 2. Mandatory Rules for the Agent (Rules 1–8)
> - 3. Permanent Code Hygiene & Organization Rules

---

# FocusFlow Project & Agent Behavior Guide

You are working on the **FocusFlow** web application for a non-technical user. Follow these mandatory rules, user preferences, and project architectural layout:

---

## 0. User Preferences & Environment
* **Browser Requirement:** The user **EXCLUSIVELY uses Google Chrome** (on both Mac and mobile). 
  * Do NOT provide Safari-specific shortcuts or advice.
  * All browser testing, developer tools guidance (e.g. `Right-Click > Inspect > Console`), and PWA behavior must be targeted for **Google Chrome**.

---

## 1. Project Directory Structure & Strict Domain Ownership (Code Map & Table of Contents)
Every file in this project has an exclusive domain. You are **STRICTLY FORBIDDEN** from declaring functions in any file outside its designated domain:

### Core Application Files
* **`index.html`** (UI Skeleton, Layout & Modals):
  * Exclusively for HTML header, tab bar, navigation, screens, cards, modals, and buttons.
  * **Rule:** ZERO inline `<script>` blocks with logic and ZERO `<style>` tags.
  * **Component Map:**
    * Top Navigation & Sync Status Pill (`#ff-sync-pill`)
    * Screen 1: Calendar Timeline & Day Grid (`#view-timeline`)
    * Screen 2: Smart Kitchen, Recipes & Shopping (`#view-kitchen`)
    * Screen 3: Nutrition & Macro Goals (`#view-nutrition`)
    * Screen 4: Wellbeing & Apple Health (`#view-health`)
    * Screen 5: Biometrics & Medication (`#view-biometrics`)
    * Modals: Event creation, recipe inspector, pantry manager, USDA food search, barcode scanner, and calibration modal.

* **`css/styles.css`** (Design & Layout):
  * Exclusively for CSS color schemes, container constraints, animations, safe-area headers.
  * **Rule:** ZERO HTML tags (`<style>`, `</style>`) allowed.

* **`sw.js`** (Service Worker):
  * Handles offline caching for the PWA app shell and external CDN libraries. Always bump `CACHE_VERSION` upon deployment.

### Data Layer (`data/`)
* **`data/family-cookbook.js`** (Preloaded Recipes):
  * Static catalog of whole-food recipes, ingredients, and prep steps (`familyCookbookDatabase`).
* **`data/usda-foods.js`** (Whole Foods Database):
  * Global reference data for raw USDA foods and whole food macros (`commonFoodsDatabase`).

### JavaScript Modules (`js/`)
* **`js/state.js`** (Global App State & Scaffolding):
  * Global `state` object, constants, Firebase config, scaffold stages, and core time helpers.

* **`js/timeline.js`** (Calendar & Day Grid Timeline):
  * Exclusively owns: Calendar day grid, timeline view, event drag-and-drop, hour height math, event anchor types, and ADHD schedule suggestions.
  * **Forbidden:** ❌ Pantry, recipes, cooking, barcodes, macros, cardiac health.

* **`js/calendar-categories.js`** (Calendar Categories & Google/iCal Sync):
  * Exclusively owns: Calendar categories dropdowns, direct Google Calendar OAuth sync, iCal subscription feeds, and category color tags.
  * **Forbidden:** ❌ Kitchen, recipes, macro calculations.

* **`js/kitchen.js`** (Smart Pantry, Kitchen & Meal Planning):
  * Exclusively owns: Smart pantry, kitchen zones, food types, weekly meal planner, recipe book, and recipe inspect modal.
  * **Forbidden:** ❌ Calendar day grid math, event dragging, biometrics, Apple Health.

* **`js/shopping.js`** (Grocery Shopping List & Receipt Scanner):
  * Exclusively owns: Grocery shopping list, item checking, store categories, and adding items imported from receipts (the receipt photo scanner & OCR parser itself lives in `js/chef.js`).
  * **Forbidden:** ❌ Calendar day grid math, timeline views, cardiac health.

* **`js/chef.js`** (Reverse Chef Wizard & Kitchen Scale):
  * Exclusively owns: Reverse Chef 3-step wizard, kitchen scale mode, recipe step timers, Walmart & grocery receipt photo scanner & OCR parser (sole owner of receipt scanning).
  * **Forbidden:** ❌ Calendar timeline rendering, daily schedules, macro charts.

* **`js/nutrition.js`** (Nutrition, Macros & Whole Foods):
  * Exclusively owns: `renderNutrition()`, macro dials, macronutrient calculations & adjustments, centralized food & recipe master reference (`getUnifiedFoodOrMeal`, `buildRecipeUnifiedNutrition`), USDA specific-food matcher & approval workflow (`findClosestUsdaFood`, `requestUsdaFoodSupplementation`), green shield / yellow tilde verification icons, and barcode scanner.
  * **Forbidden:** ❌ Calendar drag-and-drop, cooking timers, Firebase cloud sync.

* **`js/health.js`** (Wellbeing Correlations & Apple Health):
  * Exclusively owns: Wellbeing correlation charts, 7-day health averages, 30-day skill growth graphs, and Apple Health sync & export modal.
  * **Forbidden:** ❌ Pantry rendering, recipes, timeline grid drawing.

* **`js/biometrics.js`** (Biometrics & Cardiac Tracking):
  * Exclusively owns: Blood pressure, resting heart rate, and medication tracking.
  * **Forbidden:** ❌ Pantry logic, recipe book filters, calendar zoom controls.

* **`js/sync.js`** (Cloud Sync & Google Sign-In):
  * Exclusively owns: Firebase Firestore Cloud Sync, Google sign-in, offline queue, and PWA update toast.
  * **Forbidden:** ❌ Visual card rendering for kitchen, food, or nutrition.

* **`js/audio.js`** (Audio Effects):
  * Web Audio API synthesized chimes (`playChime('bell')`) and sound toggle.

* **`js/app.js`** (App Lifecycle & Navigation):
  * Tab navigation (`switchTab`), state persistence (`saveAppState`, `loadAppState`), phone demo modal, and `window.onload` startup sequence.

### Assets & Icons (`assets/`)
* **`assets/icons/`** (PWA Icons & Favicon):
  * Canonical location for `apple-touch-icon.png`, `apple-touch-icon-precomposed.png`, `favicon.ico`, `favicon-64.png`, and the PWA icons `icon-192.png` & `icon-512.png`. Loose duplicates in root are forbidden.

### Scripts & Docs
* **`scripts/poll_deploy.sh`** (Deployment Poller):
  * Polls the GitHub Actions API every 10s until the latest Pages deployment reports `completed` + `success` (used for the Rule 3 deployment gate).
* **`README.md`** (Project Overview):
  * Human-facing project description. Agent rules live in `AGENTS.md` / `GEMINI.md` (keep these two files identical).

### Testing & Verification (`tests/` & `verify.py`)
* **`verify.py`** (Universal Boundary Enforcer & Test Suite):
  * Automated testing script that verifies HTML tags, local asset links, compiles all JS with macOS WebKit JavaScriptCore, validates `site/` deployment sync, and **strictly enforces module domain boundaries** in ~0.25s.

* **`tests/regressions.json`** (Known Mistakes Database):
  * Automatically loaded and tested by `verify.py` on every run. Stores all past bugs and mistakes to prevent them from ever recurring.

### Deployment & Safety
* **`site/`** (Live GitHub Pages Mirror):
  * **Rule:** Whenever making edits to `index.html`, `css/`, `js/`, `data/`, or `sw.js`, **ALWAYS copy the modified files into the `site/` folder** so that the user's phone (homescreen PWA) gets the updates!

* **`backups/`** (Historical Backups & Archives):
  * All safety backups, archive copies, or temporary exported files MUST live here. Never leave backups in the root folder.

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
3. **Mandatory End-to-End Feature & Button Verification:**
   Whenever adding or modifying ANY button, modal, or clickable feature:
   - **Trace the full click path & visual layering:** 
     1. Element in HTML (`onclick="myFunction()"`) must match a real declared function in JavaScript.
     2. Function must actively perform its intended action (e.g., removing `hidden` from `#my-modal`, switching tabs, or modifying app state).
     3. Target modal/view IDs must exist in `index.html`.
     4. **Layer Stacking Verification:** If a modal or sub-screen is opened from within another modal (e.g. Receipt Parser -> Nutrition Editor / Barcode Scanner), verify the child modal has an elevated `z-index` (e.g., `z-[125]` vs `z-[100]`) so it is never trapped or occluded underneath.
   - **Dead Button Prevention:** `verify.py` automatically scans all 400+ `onclick` handlers in `index.html` to guarantee 100% of button calls resolve to real functions. Never leave dummy or disconnected handlers.
   - **Verify Desired Effect:** Did the edit specifically produce the user's requested behavior without collateral side-effects?
4. **Provide a Testing Checklist:**
   Give the user a simple, 1-2-3 checklist of what to tap in Google Chrome on their computer or phone to verify the change.

### Rule 3: Auto-Sync, Version Bump & GitHub Pages Deployment Verification
After your tests pass:
1. **Synchronize & Version Bump:**
   - Synchronize all modified files from root into the `site/` folder.
   - Whenever CSS, JS, HTML, or assets are modified, ALWAYS bump `CACHE_VERSION` in `sw.js` and `site/sw.js`, and increment the cache-buster query on stylesheets (e.g. `css/styles.css?v=XX`) in `index.html` and `site/index.html`.
2. **Commit & Push:**
   - Commit the changes to Git with a concise, descriptive message.
   - Push to `origin main`.
3. **MANDATORY Deployment Gate (Never Claim "Live" Before Verifying GitHub Pages):**
   - You are **STRICTLY FORBIDDEN** from telling the user that changes are live or ready to test immediately after pushing.
   - You MUST poll GitHub's deployment status via the API:
     ```bash
     curl -s "https://api.github.com/repos/lilaruss-a11y/focusflow/actions/runs?per_page=1" | grep -E '"status"|"conclusion"'
     ```
   - Or simply run `zsh scripts/poll_deploy.sh`, which repeats this check until the deployment succeeds.
   - Only after the build reports `"status": "completed"` and `"conclusion": "success"` may you conclude your turn and invite the user to refresh their app.

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

### Rule 7: Mandatory Code Map & Table of Contents Maintenance
- Whenever you add, rename, delete, or split any files, modals, or architectural subsystems in FocusFlow, you MUST update Section 1 (Code Map & Table of Contents) in both `AGENTS.md` and `GEMINI.md` within the same commit.
- Never leave new files, modules, or major components undocumented. Neglecting to update the Code Map is a strict protocol violation.

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

---
### Rule 8 – Token & Step Conservation
1. **Code‑Map First:** Always consult the Table of Contents in `GEMINI.md` to locate the exact file before any search.
2. **Targeted Line Reads:** Use `grep -n` to find line numbers, then read only the 30‑60 lines surrounding the target.
3. **Batch Execution After Approval:** After you approve, combine file copies, version bump, `python3 verify.py`, and `git commit && git push` into a single command to minimise tool calls.
4. **Prompt Compaction Before Model Switches:** Run the `/compact` slash command before changing AI models to keep context size minimal.
---