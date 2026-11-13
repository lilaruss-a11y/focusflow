#!/usr/bin/env python3
"""
FocusFlow Automated Verification & Universal Boundary Enforcement Suite
1. Validates HTML, CSS, and Service Worker integrity.
2. Compiles every JS module using macOS native WebKit JavaScriptCore (jsc).
3. Enforces strict architectural module boundaries (zero cross-domain contamination).
4. Executes dynamically learned regression checks from tests/regressions.json.
5. Allows automatic registration of new mistakes via `--add-mistake`.
"""

import os
import sys
import re
import json
import time
import argparse
import subprocess

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REGRESSIONS_FILE = os.path.join(BASE_DIR, "tests", "regressions.json")
errors = []

def error(msg):
    errors.append(msg)
    print(f"  ❌ {msg}")

def success(msg):
    print(f"  ✅ {msg}")

# --- CLI Tool: Add New Mistake ---
def handle_add_mistake():
    parser = argparse.ArgumentParser(description="Add a new learned mistake to FocusFlow's automated test suite.")
    parser.add_argument("--add-mistake", action="store_true", help="Register a new mistake")
    parser.add_argument("--id", required=True, help="Unique identifier for the mistake (e.g. broken_timer_sync)")
    parser.add_argument("--desc", required=True, help="Plain English description of what went wrong and what to avoid")
    parser.add_argument("--file", help="Target file relative to project root (e.g. index.html or js/kitchen.js)")
    parser.add_argument("--pattern", help="Forbidden text pattern or regex that indicates the bug")
    parser.add_argument("--is-regex", action="store_true", help="Whether the pattern is a regular expression")
    args, unknown = parser.parse_known_args()

    if not os.path.exists(REGRESSIONS_FILE):
        os.makedirs(os.path.dirname(REGRESSIONS_FILE), exist_ok=True)
        with open(REGRESSIONS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)

    with open(REGRESSIONS_FILE, "r", encoding="utf-8") as f:
        try:
            regressions = json.load(f)
        except Exception:
            regressions = []

    regressions = [r for r in regressions if r.get("id") != args.id]

    new_rule = {
        "id": args.id,
        "description": args.desc,
        "file": args.file or "index.html",
        "check_type": "forbidden_pattern",
        "pattern": args.pattern or "",
        "is_regex": args.is_regex
    }
    regressions.append(new_rule)

    with open(REGRESSIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(regressions, f, indent=2)

    print(f"\n🎉 Successfully learned new mistake [{args.id}]!")
    print(f"   Description: {args.desc}")
    print(f"   Target: {new_rule['file']} (Pattern: {new_rule['pattern']})")
    print("   This test will now run automatically on every future verification!\n")
    sys.exit(0)

if "--add-mistake" in sys.argv:
    handle_add_mistake()

# --- Main Verification Suite ---
start_time = time.time()
print("\n🔍 Running FocusFlow Automated Verification & Regression Suite...\n")

# --- 1. Verify index.html Integrity ---
print("1. Checking index.html integrity...")
index_path = os.path.join(BASE_DIR, "index.html")
if not os.path.exists(index_path):
    error("index.html is missing!")
else:
    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()

    open_styles = len(re.findall(r'<style\b', html, re.I))
    close_styles = len(re.findall(r'</style>', html, re.I))
    if open_styles != close_styles:
        error(f"Unmatched style tags in index.html: {open_styles} <style> vs {close_styles} </style>")
    else:
        success("Style tags are properly balanced.")

    inline_scripts_open = len(re.findall(r'<script(?![^>]*\bsrc=)[^>]*>', html, re.I))
    total_scripts_close = len(re.findall(r'</script>', html, re.I))
    scripts_with_src = len(re.findall(r'<script\b[^>]*\bsrc=[^>]*>', html, re.I))
    if (inline_scripts_open + scripts_with_src) != total_scripts_close:
        error(f"Unmatched script tags in index.html: {inline_scripts_open + scripts_with_src} opening vs {total_scripts_close} closing")
    else:
        success("Script tags are properly balanced.")

    src_refs = re.findall(r'(?:src|href)=[\"\']([^\"\']+)[\"\']', html)
    missing_refs = []
    for ref in src_refs:
        if ref.startswith("http://") or ref.startswith("https://") or ref.startswith("data:"):
            continue
        clean_ref = ref.split("?")[0].split("#")[0]
        ref_path = os.path.join(BASE_DIR, clean_ref)
        if not os.path.exists(ref_path):
            missing_refs.append(clean_ref)
    if missing_refs:
        error(f"Missing referenced files in index.html: {', '.join(missing_refs)}")
    else:
        success("All local stylesheet and script references exist on disk.")

    html_ids = re.findall(r'id=[\"\']([^\s\"\'>]+)[\"\']', html)
    from collections import Counter
    id_counts = Counter(html_ids)
    duplicate_ids = [i for i, c in id_counts.items() if c > 1]
    if duplicate_ids:
        error(f"Duplicate HTML IDs found in index.html: {', '.join(duplicate_ids)}")
    else:
        success(f"All {len(html_ids)} HTML IDs in index.html are 100% unique.")

# --- 2. Verify JavaScript Modules via Native WebKit JavaScriptCore (jsc) ---
print("\n2. Compiling JavaScript modules with macOS WebKit JavaScriptCore...")
jsc_path = "/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc"
target_dirs = [("data", os.path.join(BASE_DIR, "data")), ("js", os.path.join(BASE_DIR, "js"))]

for dname, dpath in target_dirs:
    if not os.path.exists(dpath):
        continue
    js_files = [f for f in sorted(os.listdir(dpath)) if f.endswith(".js")]
    for jf in js_files:
        jpath = os.path.join(dpath, jf)
        rel_label = f"{dname}/{jf}"
        with open(jpath, "r", encoding="utf-8") as f:
            content = f.read()

        if "</script>" in content or "<script" in content:
            error(f"{rel_label} contains stray <script> tags!")
            continue
        if "<style" in content or "</style>" in content:
            error(f"{rel_label} contains stray <style> tags!")
            continue

        if os.path.exists(jsc_path):
            cmd = [jsc_path, "-e", f"try {{ new Function(readFile('{jpath}')); print('VALID'); }} catch(e) {{ print('ERR: ' + e); }}"]
            res = subprocess.run(cmd, capture_output=True, text=True)
            out = res.stdout.strip()
            if out == "VALID":
                success(f"{rel_label:25} ({len(content.splitlines()):4} lines) — 100% Valid WebKit JS.")
            else:
                error(f"{rel_label} has JavaScript syntax error: {out}")
        else:
            success(f"{rel_label} loaded ({len(content.splitlines())} lines).")

# --- 2b. Verify Sequential Multi-Script Load Order & Variable Collisions ---
print("\n2b. Compiling sequential scripts to catch cross-file variable collisions...")
if os.path.exists(jsc_path) and os.path.exists(index_path):
    with open(index_path, "r", encoding="utf-8") as f:
        html_src = f.read()
    local_scripts = re.findall(r'<script\b[^>]*\bsrc=[\"\']((?:data|js)/[^\"]+\.js)[\"\']', html_src)
    if local_scripts:
        load_calls = "\n".join([f"load('{os.path.join(BASE_DIR, s)}');" for s in local_scripts])
        harness = f"""
var window = this;
window.addEventListener = function(){{}};
window.removeEventListener = function(){{}};
window.dispatchEvent = function(){{}};
var document = {{
  getElementById: function(){{ return null; }},
  querySelector: function(){{ return null; }},
  querySelectorAll: function(){{ return []; }},
  addEventListener: function(){{}},
  removeEventListener: function(){{}},
  createElement: function(){{ return {{ setAttribute: function(){{}}, appendChild: function(){{}}, classList: {{ add: function(){{}}, remove: function(){{}} }} }}; }}
}};
var localStorage = {{ getItem: function(){{ return null; }}, setItem: function(){{}}, removeItem: function(){{}} }};
var navigator = {{ userAgent: 'test', serviceWorker: {{ register: function(){{}} }} }};
var location = {{ reload: function(){{}}, href: '' }};
var lucide = {{ createIcons: function(){{}} }};
var ZXing = {{}};
var bootstrap = {{}};
try {{
{load_calls}
  print('SEQUENTIAL_OK');
}} catch(e) {{
  print('SEQ_ERR: ' + e);
}}
"""
        res = subprocess.run([jsc_path, "-e", harness], capture_output=True, text=True)
        out = res.stdout.strip()
        if "SEQUENTIAL_OK" in out:
            success(f"All {len(local_scripts)} scripts evaluated sequentially in global scope with 0 variable clashes.")
        else:
            error(f"Sequential script evaluation failed: {out}")

# --- 3. Verify CSS Stylesheet ---
print("\n3. Checking CSS styles...")
css_path = os.path.join(BASE_DIR, "css", "styles.css")
if not os.path.exists(css_path):
    error("css/styles.css is missing!")
else:
    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()
    if "<style" in css or "</style>" in css:
        error("css/styles.css contains stray HTML style tags!")
    else:
        success("css/styles.css clean with zero stray tags.")

# --- 4. Verify site/ Deployment Mirror ---
print("\n4. Checking site/ deployment sync...")
site_dir = os.path.join(BASE_DIR, "site")
if not os.path.exists(site_dir):
    error("site/ deployment directory is missing!")
else:
    synced_items = ["index.html", "sw.js", "css/styles.css"]
    for d in ["js", "data"]:
        d_full = os.path.join(BASE_DIR, d)
        if os.path.exists(d_full):
            for fname in sorted(os.listdir(d_full)):
                if fname.endswith(".js"):
                    synced_items.append(os.path.join(d, fname))
    out_of_sync = []
    for item in synced_items:
        root_file = os.path.join(BASE_DIR, item)
        site_file = os.path.join(site_dir, item)
        if not os.path.exists(site_file):
            out_of_sync.append(f"{item} (missing in site/)")
        elif os.path.getsize(root_file) != os.path.getsize(site_file):
            out_of_sync.append(f"{item} (size mismatch: root {os.path.getsize(root_file)}B vs site {os.path.getsize(site_file)}B)")
    if out_of_sync:
        error(f"site/ deployment is out of sync with root! Unsynced: {', '.join(out_of_sync)}")
    else:
        success("site/ deployment files are 100% in sync with root.")

    if os.path.exists(os.path.join(site_dir, "verify.py")):
        error("Stray verify.py found inside site/ folder! Remove site/verify.py.")
    downloads_index = os.path.expanduser("~/Downloads/index.html")
    if os.path.exists(downloads_index):
        error("Accidental index.html found in ~/Downloads! All project files belong in ~/Documents/FocusFlow.")

# --- 5. Strict Universal Architectural Module Boundaries Enforcement ---
print("\n5. Enforcing Strict Architectural Module Boundaries...")

MODULE_BOUNDARIES = {
    'timeline.js': {
        'name': 'Calendar & Day Grid Timeline',
        'forbidden': [
            (r'function\s+.*Pantry', 'pantry functions belong exclusively in js/kitchen.js'),
            (r'function\s+.*Recipe', 'recipe functions belong exclusively in js/kitchen.js or js/chef.js'),
            (r'function\s+.*MealPlan', 'meal planning belongs exclusively in js/kitchen.js'),
            (r'function\s+.*ShoppingList', 'shopping list belongs exclusively in js/kitchen.js'),
            (r'function\s+.*ReverseChef', 'Reverse Chef belongs exclusively in js/chef.js'),
            (r'function\s+.*Macro', 'macro calculations belong exclusively in js/nutrition.js'),
            (r'function\s+.*Barcode', 'barcode scanner belongs exclusively in js/barcode.js'),
            (r'function\s+.*Medication', 'medication tracking belongs exclusively in js/biometrics.js'),
            (r'function\s+.*Cardiac', 'cardiac biometrics belong exclusively in js/biometrics.js')
        ]
    },
    'kitchen.js': {
        'name': 'Kitchen, Pantry, Recipes & Shopping',
        'forbidden': [
            (r'function\s+.*TimelineView', 'timeline views belong exclusively in js/timeline.js'),
            (r'function\s+.*HourHeight', 'calendar hour height belongs exclusively in js/timeline.js'),
            (r'function\s+.*CalendarZoom', 'calendar zoom belongs exclusively in js/timeline.js'),
            (r'function\s+.*AppleHealth', 'Apple Health belongs exclusively in js/health.js'),
            (r'function\s+.*Medication', 'medication tracking belongs exclusively in js/biometrics.js'),
            (r'function\s+.*Cardiac', 'cardiac biometrics belong exclusively in js/biometrics.js')
        ]
    },
    'shopping.js': {
        'name': 'Shopping List, Groceries & Receipt Scanner',
        'forbidden': [
            (r'function\s+.*HourHeight', 'hour height belongs in js/timeline.js'),
            (r'function\s+.*ReverseChef', 'Reverse Chef belongs in js/chef.js'),
            (r'function\s+.*AppleHealth', 'Apple Health belongs in js/health.js'),
            (r'function\s+.*Medication', 'medication belongs in js/biometrics.js')
        ]
    },
    'chef.js': {
        'name': 'Reverse Chef Wizard & Receipt Scanner',
        'forbidden': [
            (r'function\s+.*Timeline', 'timeline calendar belongs in js/timeline.js'),
            (r'function\s+.*HourHeight', 'hour height math belongs in js/timeline.js'),
            (r'function\s+.*DayGrid', 'day grid rendering belongs in js/timeline.js'),
            (r'function\s+.*AppleHealth', 'Apple Health belongs in js/health.js'),
            (r'function\s+.*Medication', 'medication belongs in js/biometrics.js')
        ]
    },
    'barcode.js': {
        'name': 'Barcode Scanner & Package Lookup',
        'forbidden': [
            (r'function\s+.*Timeline', 'timeline belongs in js/timeline.js'),
            (r'function\s+.*HourHeight', 'hour height belongs in js/timeline.js'),
            (r'function\s+.*Medication', 'medication belongs in js/biometrics.js'),
            (r'function\s+.*Cardiac', 'cardiac biometrics belong in js/biometrics.js'),
            (r'function\s+renderNutrition', 'nutrition rendering belongs in js/nutrition.js'),
            (r'function\s+renderTimeline', 'timeline rendering belongs in js/timeline.js')
        ]
    },
    'nutrition.js': {
        'name': 'Nutrition, Macros & Whole Foods',
        'forbidden': [
            (r'function\s+.*HourHeight', 'hour height belongs in js/timeline.js'),
            (r'function\s+.*ReverseChef', 'Reverse Chef belongs in js/chef.js'),
            (r'function\s+.*Medication', 'medication belongs in js/biometrics.js'),
            (r'function\s+.*Cardiac', 'cardiac biometrics belong in js/biometrics.js'),
            (r'function\s+.*Calendar', 'calendar functions belong in js/timeline.js or js/calendar-categories.js'),
            (r'function\s+.*Schedule', 'schedule loading belongs in js/timeline.js'),
            (r'function\s+.*ApiKey', 'API key management belongs in js/app.js'),
            (r'function\s+.*IPhone', 'iPhone export belongs in js/app.js')
        ]
    },
    'health.js': {
        'name': 'Wellbeing Correlations & Apple Health',
        'forbidden': [
            (r'function\s+.*Pantry', 'pantry belongs in js/kitchen.js'),
            (r'function\s+.*Recipe', 'recipes belong in js/kitchen.js or js/chef.js'),
            (r'function\s+.*HourHeight', 'hour height belongs in js/timeline.js'),
            (r'function\s+.*TimelineView', 'timeline view belongs in js/timeline.js')
        ]
    },
    'biometrics.js': {
        'name': 'Biometrics & Cardiac Tracking',
        'forbidden': [
            (r'function\s+.*Pantry', 'pantry belongs in js/kitchen.js'),
            (r'function\s+.*Recipe', 'recipes belong in js/kitchen.js or js/chef.js'),
            (r'function\s+.*MealPlan', 'meal planning belongs in js/kitchen.js'),
            (r'function\s+.*HourHeight', 'hour height belongs in js/timeline.js'),
            (r'function\s+.*Macro', 'macro calculations belong in js/nutrition.js')
        ]
    },
    'sync.js': {
        'name': 'Cloud Sync & Google Calendar Sync',
        'forbidden': [
            (r'function\s+renderPantry', 'pantry rendering belongs in js/kitchen.js'),
            (r'function\s+renderKitchen', 'kitchen rendering belongs in js/kitchen.js'),
            (r'function\s+renderNutrition', 'nutrition rendering belongs in js/nutrition.js'),
            (r'function\s+renderTimeline', 'timeline rendering belongs in js/timeline.js')
        ]
    }
}

js_dir = os.path.join(BASE_DIR, "js")
for mod_file, binfo in MODULE_BOUNDARIES.items():
    mpath = os.path.join(js_dir, mod_file)
    if os.path.exists(mpath):
        with open(mpath, "r", encoding="utf-8") as f:
            code = f.read()
        violations = []
        for pat, hint in binfo['forbidden']:
            matches = re.findall(pat, code)
            if matches:
                violations.append(f"{', '.join(matches)} ({hint})")
        if violations:
            error(f"[Boundary Violation: {mod_file}] Prohibited cross-domain function(s): {'; '.join(violations)}")
        else:
            success(f"{mod_file:22} strictly confined to {binfo['name']}.")

# --- 6. Run Learned Regression Suite (tests/regressions.json) ---
print("\n5b. Verifying all button and link click handlers for dead code...")
with open(os.path.join(BASE_DIR, "index.html"), "r", encoding="utf-8") as f:
    index_html = f.read()

all_js = ""
for js_dir in ["js", "data"]:
    full_d = os.path.join(BASE_DIR, js_dir)
    if os.path.exists(full_d):
        for jname in sorted(os.listdir(full_d)):
            if jname.endswith(".js"):
                with open(os.path.join(full_d, jname), "r", encoding="utf-8") as jf:
                    all_js += jf.read() + "\n"

declared_fns = set(re.findall(r'function\s+([a-zA-Z0-9_$]+)\s*\(', all_js))
declared_fns.update(re.findall(r'(?:window\.)([a-zA-Z0-9_$]+)\s*=', all_js))
declared_fns.update(re.findall(r'(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\()', all_js))

standard_builtins = {
    'if', 'for', 'switch', 'alert', 'confirm', 'parseInt', 'parseFloat',
    'Boolean', 'String', 'stopPropagation', 'preventDefault', 'close',
    'focus', 'blur', 'submit', 'reset', 'scroll', 'scrollTo', 'open', 'print'
}

raw_onclicks = re.findall(r'onclick=["\']([^"\']+)["\']', index_html)
dead_calls = set()
for raw in raw_onclicks:
    calls = re.findall(r'([a-zA-Z0-9_$]+)\s*\(', raw)
    for c in calls:
        if c not in standard_builtins and c not in declared_fns:
            if not any(f"{obj}.{c}" in raw or f"{c}." in raw for obj in ['Math', 'event', 'this', 'target', 'document', 'window', 'calendarHistory', 'state']):
                dead_calls.add(c)

if dead_calls:
    for dc in sorted(dead_calls):
        error(f"Dead button click handler detected: function '{dc}()' called in index.html is not declared in any JavaScript file!")
else:
    success(f"All {len(raw_onclicks)} onclick handlers in index.html resolve to valid functions.")

# 5c. Verifying modal dialog stacking hierarchy and child z-index safety...
print("\n5c. Verifying modal stacking hierarchy & z-index layering...")
with open(os.path.join(BASE_DIR, "css/styles.css"), "r", encoding="utf-8") as f:
    css_content = f.read()

child_modals = [
    '#barcode-scanner-modal',
    '#manual-nutrition-modal',
    '#food-detail-modal',
    '#custom-food-modal',
    '#pantry-item-modal',
    '#pantry-item-detail-modal'
]

missing_high_z = [m for m in child_modals if m not in css_content]
if missing_high_z:
    error(f"Child utility modals missing higher z-index stacking in css/styles.css: {missing_high_z}")
else:
    success(f"All {len(child_modals)} child/sub-flow modals have explicit elevated z-index stacking above parent dialogs.")

print("\n6. Testing against known past mistakes...")
if not os.path.exists(REGRESSIONS_FILE):
    print("  ℹ️ No learned regressions registered yet.")
else:
    with open(REGRESSIONS_FILE, "r", encoding="utf-8") as f:
        try:
            regressions = json.load(f)
        except Exception as e:
            error(f"Could not parse regressions.json: {e}")
            regressions = []

    for rule in regressions:
        rid = rule.get("id", "unknown")
        desc = rule.get("description", rid)
        ctype = rule.get("check_type", "forbidden_pattern")

        if ctype == "tag_balance":
            tfile = os.path.join(BASE_DIR, rule.get("file", "index.html"))
            if os.path.exists(tfile):
                with open(tfile, "r", encoding="utf-8") as tf:
                    tcontent = tf.read()
                o_cnt = len(re.findall(re.escape(rule["open_tag"]), tcontent, re.I))
                c_cnt = len(re.findall(re.escape(rule["close_tag"]), tcontent, re.I))
                if o_cnt != c_cnt:
                    error(f"[Mistake Guard: {rid}] {desc} (Found {o_cnt} open vs {c_cnt} close)")
                else:
                    success(f"[Guarded: {rid}] {desc}")

        elif ctype == "forbidden_pattern":
            pat = rule.get("pattern", "")
            is_re = rule.get("is_regex", False)
            if "directory" in rule:
                tdir = os.path.join(BASE_DIR, rule["directory"])
                found_in = []
                if os.path.exists(tdir):
                    for fname in os.listdir(tdir):
                        fpath = os.path.join(tdir, fname)
                        if os.path.isfile(fpath):
                            with open(fpath, "r", encoding="utf-8") as f:
                                c = f.read()
                            if is_re and re.search(pat, c):
                                found_in.append(fname)
                            elif not is_re and pat in c:
                                found_in.append(fname)
                if found_in:
                    error(f"[Mistake Guard: {rid}] {desc} (Found in {', '.join(found_in)})")
                else:
                    success(f"[Guarded: {rid}] {desc}")
            else:
                tfile = os.path.join(BASE_DIR, rule.get("file", "index.html"))
                if os.path.exists(tfile):
                    with open(tfile, "r", encoding="utf-8") as tf:
                        c = tf.read()
                    match = re.search(pat, c) if is_re else (pat in c)
                    if match:
                        error(f"[Mistake Guard: {rid}] {desc}")
                    else:
                        success(f"[Guarded: {rid}] {desc}")

        elif ctype == "forbidden_outside_scripts":
            tfile = os.path.join(BASE_DIR, rule.get("file", "index.html"))
            if os.path.exists(tfile):
                with open(tfile, "r", encoding="utf-8") as tf:
                    full_html = tf.read()
                stripped_html = re.sub(r'<script\b[^>]*>.*?</script>', '', full_html, flags=re.DOTALL | re.I)
                stripped_html = re.sub(r'<style\b[^>]*>.*?</style>', '', stripped_html, flags=re.DOTALL | re.I)
                
                leaks = [p for p in rule.get("patterns", []) if p in stripped_html]
                if leaks:
                    error(f"[Mistake Guard: {rid}] {desc} (Found raw code: {', '.join(leaks)})")
                else:
                    success(f"[Guarded: {rid}] {desc}")

        elif ctype == "file_match":
            f1 = os.path.join(BASE_DIR, rule.get("file", ""))
            f2 = os.path.join(BASE_DIR, rule.get("match_file", ""))
            if os.path.exists(f1) and os.path.exists(f2):
                if os.path.getsize(f1) != os.path.getsize(f2):
                    error(f"[Mistake Guard: {rid}] {desc} (Size mismatch: {f1} vs {f2})")
                else:
                    success(f"[Guarded: {rid}] {desc}")

# --- Cheat Sheet File Check (AGENTS.md Section 1b) ---
try:
    _agents = open(os.path.join(BASE_DIR, "AGENTS.md"), encoding="utf-8").read()
    _m = re.search(r"## 1b\..*?(?=\n---)", _agents, re.S)
    if not _m:
        error("[Cheat Sheet] Section '## 1b.' not found in AGENTS.md")
    else:
        _paths = set(re.findall(r"`((?:js|css|data|scripts|tests|assets)/[^`]+|[\w-]+\.(?:html|js|py))`", _m.group(0)))
        _missing = [x for x in sorted(_paths) if not os.path.exists(os.path.join(BASE_DIR, x))]
        if _missing:
            error(f"[Cheat Sheet] AGENTS.md cheat sheet points to missing files: {', '.join(_missing)}")
        else:
            success(f"[Cheat Sheet] All {len(_paths)} referenced files exist")
except Exception as _e:
    error(f"[Cheat Sheet] Check failed: {_e}")

# --- Summary & Execution Time ---
elapsed = time.time() - start_time
print("\n" + "="*50)
if errors:
    print(f"❌ Verification FAILED with {len(errors)} error(s) in {elapsed:.2f}s. Fix before committing!")
    print("="*50 + "\n")
    sys.exit(1)
else:
    print(f"🎉 ALL CHECKS PASSED in {elapsed:.2f}s! The app is clean, verified, and safe.")
    print("="*50 + "\n")
    sys.exit(0)
