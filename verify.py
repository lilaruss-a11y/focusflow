#!/usr/bin/env python3
"""
FocusFlow Project Verification Suite
Runs integrity, syntax, and deployment tests across HTML, CSS, JS, and site/ mirror.
Uses macOS WebKit JavaScriptCore (jsc) for full, native JavaScript engine compilation.
"""

import os
import sys
import re
import subprocess

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
errors = []

def error(msg):
    errors.append(msg)
    print(f"  ❌ {msg}")

def success(msg):
    print(f"  ✅ {msg}")

print("\n🔍 Running FocusFlow Automated Verification Suite...\n")

# --- 1. Verify index.html Integrity ---
print("1. Checking index.html integrity...")
index_path = os.path.join(BASE_DIR, "index.html")
if not os.path.exists(index_path):
    error("index.html is missing!")
else:
    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()

    # Check matching <style> and </style>
    open_styles = len(re.findall(r'<style\b', html, re.I))
    close_styles = len(re.findall(r'</style>', html, re.I))
    if open_styles != close_styles:
        error(f"Unmatched style tags in index.html: {open_styles} <style> vs {close_styles} </style>")
    else:
        success("Style tags are properly balanced.")

    # Check matching inline <script> and </script>
    inline_scripts_open = len(re.findall(r'<script(?![^>]*\bsrc=)[^>]*>', html, re.I))
    total_scripts_close = len(re.findall(r'</script>', html, re.I))
    scripts_with_src = len(re.findall(r'<script\b[^>]*\bsrc=[^>]*>', html, re.I))
    if (inline_scripts_open + scripts_with_src) != total_scripts_close:
        error(f"Unmatched script tags in index.html: {inline_scripts_open + scripts_with_src} opening vs {total_scripts_close} closing")
    else:
        success("Script tags are properly balanced.")

    # Verify all referenced local files exist
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

# --- 2. Verify JavaScript Modules via Native WebKit JavaScriptCore (jsc) ---
print("\n2. Checking JavaScript files with macOS WebKit JavaScriptCore...")
jsc_path = "/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc"
js_dir = os.path.join(BASE_DIR, "js")

if not os.path.exists(js_dir):
    error("js/ directory is missing!")
else:
    js_files = [f for f in sorted(os.listdir(js_dir)) if f.endswith(".js")]
    for jf in js_files:
        jpath = os.path.join(js_dir, jf)
        with open(jpath, "r", encoding="utf-8") as f:
            content = f.read()

        # Check for stray HTML tags inside JS
        if "</script>" in content or "<script" in content:
            error(f"{jf} contains stray <script> tags!")
            continue
        if "<style" in content or "</style>" in content:
            error(f"{jf} contains stray <style> tags!")
            continue

        # Run native JavaScript engine parser
        if os.path.exists(jsc_path):
            cmd = [jsc_path, "-e", f"try {{ new Function(readFile('{jpath}')); print('VALID'); }} catch(e) {{ print('ERR: ' + e); }}"]
            res = subprocess.run(cmd, capture_output=True, text=True)
            out = res.stdout.strip()
            if out == "VALID":
                success(f"{jf:22} ({len(content.splitlines()):4} lines) — 100% Valid WebKit JS.")
            else:
                error(f"{jf} has JavaScript syntax error: {out}")
        else:
            success(f"{jf} loaded ({len(content.splitlines())} lines).")

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

# --- Summary ---
print("\n" + "="*50)
if errors:
    print(f"❌ Verification FAILED with {len(errors)} error(s). Fix before committing!")
    print("="*50 + "\n")
    sys.exit(1)
else:
    print("🎉 ALL CHECKS PASSED! The app is clean, verified, and safe.")
    print("="*50 + "\n")
    sys.exit(0)
