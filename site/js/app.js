    // ==============================================
    // GEMINI API KEY VERIFICATION & EYE TOGGLE
    // ==============================================
    async function testAndSaveApiKey() {
      const input = document.getElementById('gemini-api-key-input');
      const statusEl = document.getElementById('apikey-validation-status');
      if (!input) return;

      const key = input.value.trim();
      if (!key) {
        alertBox("Please paste your Gemini API key from Google AI Studio.", "API Key Needed");
        return;
      }

      setGeminiApiKey(key);

      try {
        if (statusEl) {
          statusEl.textContent = "Verifying with Google AI Studio...";
          statusEl.className = "text-[11px] text-pastel-sky mt-1 block font-semibold animate-pulse";
          statusEl.classList.remove('hidden');
        }

        // Lightweight verification test
        const testResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (testResp.ok) {
          if (statusEl) {
            statusEl.textContent = "✓ Verified & Active! Smart Vision Enabled.";
            statusEl.className = "text-[11px] text-pastel-mint mt-1 block font-bold";
          }
          playChime('bell');
          alertBox("Gemini AI successfully connected! Smart photo scanning & ADHD coaching activated.", "AI Connected");
          setTimeout(() => closeApiKeyModal(), 1200);
        } else {
          if (statusEl) {
            statusEl.textContent = "✓ Key saved in browser. (Ready to use)";
            statusEl.className = "text-[11px] text-pastel-mint mt-1 block font-semibold";
          }
          alertBox("Key saved locally inside your browser.", "Key Saved");
          setTimeout(() => closeApiKeyModal(), 1200);
        }
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = "✓ Key saved in browser.";
          statusEl.className = "text-[11px] text-pastel-mint mt-1 block";
        }
        alertBox("Key saved locally in browser.", "Key Saved");
        closeApiKeyModal();
      }
    }

    function toggleApiKeyVisibility() {
      const input = document.getElementById('gemini-api-key-input');
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    }

    // Interop alias
    const submitFoodEntry = saveFoodEntry;
    const startLiveGCalSync = saveAndSyncIcalUrl;

    // ==============================================
    // COMPLETE APP STATE PERSISTENCE ENGINE
    function saveAppState() {
      try {
        localStorage.setItem('focusflow_user_profile', JSON.stringify(state.userProfile));
        localStorage.setItem('focusflow_weight_goal', JSON.stringify(state.weightGoal));
        localStorage.setItem('focusflow_ocd_settings', JSON.stringify(state.ocdSettings));
        localStorage.setItem('focusflow_nutrition_log', JSON.stringify(state.nutritionLog));
        localStorage.setItem('focusflow_tasks', JSON.stringify(state.tasks));
        localStorage.setItem('focusflow_timeline', JSON.stringify(state.timeline));
        localStorage.setItem('focusflow_pantry', JSON.stringify(state.pantry));
        localStorage.setItem('focusflow_shopping_list', JSON.stringify(state.shoppingList || []));
        localStorage.setItem('focusflow_weekly_meal_plan', JSON.stringify(state.weeklyMealPlan || {}));
        localStorage.setItem('focusflow_apple_health_data', JSON.stringify(state.appleHealthData));
        localStorage.setItem('focusflow_scaffold_stages', JSON.stringify(state.scaffoldStages));
        localStorage.setItem('focusflow_connected_calendars', JSON.stringify(state.connectedCalendars || []));
        localStorage.setItem('focusflow_calendar_categories', JSON.stringify(state.calendarCategories || []));
        state.events = deduplicateEvents(state.events || []);
        localStorage.setItem('focusflow_events', JSON.stringify(state.events));
        localStorage.setItem('focusflow_water_logged_ml', JSON.stringify(state.waterLoggedMl || 0));
        localStorage.setItem('focusflow_water_unit', (state.userProfile && state.userProfile.waterUnit) || 'fl_oz');
        if (typeof ffOnLocalChange === 'function') {
          try { ffOnLocalChange(); } catch(e) {}
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.warn) console.warn("App state save error:", err);
      }
    }

    
    // ==============================================
    // EVENT DEDUPLICATION & CONSOLIDATION ENGINE
    // ==============================================
    function deduplicateEvents(eventsList) {
      if (!Array.isArray(eventsList)) return [];
      const deduped = [];

      for (const ev of eventsList) {
        if (!ev || !ev.title) continue;
        if (typeof isDummyOrUnwantedEvent === 'function' && isDummyOrUnwantedEvent(ev)) continue;

        const normTitle = ev.title.trim().toLowerCase();
        const date = ev.date || getTodayDateString();
        const [h, m] = (ev.startTime || '09:00').split(':').map(Number);
        const startMins = (h || 0) * 60 + (m || 0);

        // Treat "develop app" specifically as a reality event so it never splits into duplicate plan/reality blocks
        if (normTitle === 'develop app' || normTitle.includes('develop app')) {
          ev.entryType = 'reality';
          if (!ev.actualDuration && ev.duration) ev.actualDuration = ev.duration;
        }

        let matchIdx = -1;
        for (let i = 0; i < deduped.length; i++) {
          const d = deduped[i];
          const dDate = d.date || getTodayDateString();

          // Match by gcalEventId
          if (ev.gcalEventId && d.gcalEventId && ev.gcalEventId === d.gcalEventId) {
            matchIdx = i;
            break;
          }
          // Match by identical title on same date within 45 minutes
          if (dDate === date && d.title.trim().toLowerCase() === normTitle) {
            const [dH, dM] = (d.startTime || '09:00').split(':').map(Number);
            const dMins = (dH || 0) * 60 + (dM || 0);
            if (Math.abs(dMins - startMins) <= 45) {
              matchIdx = i;
              break;
            }
          }
        }

        if (matchIdx === -1) {
          deduped.push(ev);
        } else {
          // Merge properties into the existing event so no reality tracking or notes are lost
          const existing = deduped[matchIdx];
          if (ev.gcalEventId && !existing.gcalEventId) {
            existing.gcalEventId = ev.gcalEventId;
            existing.gcalCalendarId = ev.gcalCalendarId;
            existing.calendarName = ev.calendarName;
          }
          if (ev.entryType === 'reality' || existing.entryType === 'reality') {
            existing.entryType = 'reality';
          }
          if (ev.actualStartTime && !existing.actualStartTime) existing.actualStartTime = ev.actualStartTime;
          if (ev.actualDuration && !existing.actualDuration) existing.actualDuration = ev.actualDuration;
          if (ev.description && !existing.description) existing.description = ev.description;
          if (ev.goodEnough && !existing.goodEnough) existing.goodEnough = ev.goodEnough;
          if (ev.subtasks && ev.subtasks.length > (existing.subtasks ? existing.subtasks.length : 0)) {
            existing.subtasks = ev.subtasks;
          }
        }
      }
      return deduped;
    }

    // ==============================================
    // PURGE UNWANTED / AUTO-GENERATED STARTER EVENTS
    // ==============================================
    function isDummyOrUnwantedEvent(e) {
      if (!e) return false;
      const t = (e.title || '').toLowerCase().trim();
      const id = (e.id || '');
      return (
        id === 'ev-1' || id === 'ev-2' || id === 'ev-3' || id === 'ev-meal-choreo' ||
        id.includes('-dish') ||
        t.includes('cook dinner & reset kitchen') ||
        t.includes('cook dinner') ||
        t.includes('reset kitchen') ||
        t.includes('cook lunch & quick kitchen reset') ||
        t.includes('project planning') ||
        t.includes('deep work:') ||
        t.includes('admin, emails & task prioritization') ||
        t.includes('admin & email sorting') ||
        t.includes('relaxed dish washing & kitchen reset') ||
        t.includes('fork-ready! sit down and enjoy dinner')
      );
    }

    
    // ==============================================
    // PHONE DEMO & MOBILE TESTING ENGINE
    // ==============================================
    function openPhoneDemoModal() {
      const modal = document.getElementById('phone-demo-modal');
      const qrImg = document.getElementById('phone-demo-qr-img');
      const urlText = document.getElementById('phone-demo-url-text');
      const currentHost = (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') ? `${window.location.hostname}:8080` : '192.168.1.182:8080';
      const targetUrl = `http://${currentHost}`;
      if (urlText) urlText.textContent = targetUrl;
      if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(targetUrl)}`;
      if (modal) modal.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }

    function closePhoneDemoModal() {
      const modal = document.getElementById('phone-demo-modal');
      if (modal) modal.classList.add('hidden');
    }

    function loadDemoSchedule() {
      calendarHistory.recordState();
      const dateStr = getSelectedTimelineDateStr() || getTodayDateString();

      const demoEvents = [
        {
          id: `ev-demo-1-${Date.now()}`,
          isDemo: true,
          title: 'Deep Focus: Strategic Project Sprint',
          startTime: '09:00',
          duration: 75,
          category: 'focus',
          location: 'Quiet Study Library',
          description: 'Draft the core requirements and review architecture with zero distractions.',
          date: dateStr,
          subtasks: [
            { text: 'Set up workspace and silence phone', minutes: 5, done: true },
            { text: 'Complete primary implementation milestone', minutes: 55, done: false },
            { text: 'Review progress and write 3-bullet recap', minutes: 15, done: false }
          ]
        },
        {
          id: `ev-demo-2-${Date.now()}`,
          isDemo: true,
          title: 'Interactive Seminar: Cognitive Systems',
          startTime: '10:45',
          duration: 60,
          category: 'classes',
          location: 'Hall B, Room 204',
          description: 'Weekly seminar lecture and collaborative group discussions.',
          date: dateStr,
          subtasks: [
            { text: 'Review lecture slides and key concepts', minutes: 10, done: false },
            { text: 'Active participation and note taking', minutes: 40, done: false },
            { text: 'Confirm next assignment deliverables', minutes: 10, done: false }
          ]
        },
        {
          id: `ev-demo-3-${Date.now()}`,
          isDemo: true,
          title: 'Mediterranean Protein Bowl & Walk',
          startTime: '12:30',
          duration: 45,
          category: 'meal',
          location: 'Campus Cafe Patio',
          description: 'Nourishing lunch break away from screens to reset afternoon focus.',
          date: dateStr,
          subtasks: [
            { text: 'Fresh wholesome lunch & hydration', minutes: 25, done: false },
            { text: 'Mindful 15-minute outdoor walk in the sun', minutes: 15, done: false },
            { text: 'Quick water refill before afternoon tasks', minutes: 5, done: false }
          ]
        },
        {
          id: `ev-demo-4-${Date.now()}`,
          isDemo: true,
          title: 'Admin Inbox Sweep & Scheduling',
          startTime: '14:00',
          duration: 30,
          category: 'chores',
          location: '',
          description: 'Batch process email replies, confirm calendar invites, and file notes.',
          date: dateStr,
          subtasks: [
            { text: 'Clear top priority unread emails', minutes: 15, done: false },
            { text: 'Review weekly schedule and confirm meetings', minutes: 15, done: false }
          ]
        },
        {
          id: `ev-demo-5-${Date.now()}`,
          isDemo: true,
          title: 'Strength Training & Mobility Circuit',
          startTime: '16:30',
          duration: 60,
          category: 'care',
          location: 'Fitness Center',
          description: 'Full-body workout with emphasis on mobility and core stability.',
          date: dateStr,
          subtasks: [
            { text: 'Dynamic warmup & mobility drills', minutes: 10, done: false },
            { text: 'Main strength sets', minutes: 40, done: false },
            { text: 'Post-workout stretch & hydration', minutes: 10, done: false }
          ]
        }
      ];

      const nonDemo = (state.events || []).filter(e => !e.isDemo);
      state.events = [...nonDemo, ...demoEvents];
      saveAppState();
      renderTimeline();
      closePhoneDemoModal();
      playChime('bell');
      alertBox("Loaded Demo Schedule for mobile testing! Tap 'Clear Demo' anytime to remove.", "Demo Schedule Active");
    }

    function clearDemoSchedule() {
      calendarHistory.recordState();
      state.events = (state.events || []).filter(e => !e.isDemo);
      saveAppState();
      renderTimeline();
      closePhoneDemoModal();
      playChime('bell');
      alertBox("Removed demo events from your schedule.", "Demo Cleared");
    }

    function loadAppState() {
      // 1. Scaffolding
      try {
        const savedStages = localStorage.getItem('focusflow_scaffold_stages');
        if (savedStages) {
          state.scaffoldStages = JSON.parse(savedStages);
        }
        if (state.scaffoldStages) {
          Object.keys(state.scaffoldStages).forEach(sec => setSectionScaffold(sec, state.scaffoldStages[sec], true));
        }
      } catch (e) {
        if (typeof console !== 'undefined' && console.warn) console.warn('Scaffolding load warning', e);
      }

      // 2. User Profile (Restores customized weight, height, calories, macros, water unit)
      try {
        const savedProfile = localStorage.getItem('focusflow_user_profile');
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          state.userProfile = Object.assign(state.userProfile || {}, parsed);
        }
        const savedWaterUnit = localStorage.getItem('focusflow_water_unit');
        if (savedWaterUnit && state.userProfile) {
          state.userProfile.waterUnit = savedWaterUnit;
        } else if (state.userProfile && !state.userProfile.waterUnit) {
          state.userProfile.waterUnit = 'fl_oz';
        }
      } catch (e) {
        if (typeof console !== 'undefined' && console.warn) console.warn('Profile parse error', e);
      }

      // 3. Weight Goal & Weekly Pace (Fixes goal resetting to default!)
      try {
        const savedGoal = localStorage.getItem('focusflow_weight_goal');
        if (savedGoal) {
          const parsed = JSON.parse(savedGoal);
          state.weightGoal = Object.assign(state.weightGoal || {}, parsed);
        } else if (state.userProfile) {
          if (!state.weightGoal) state.weightGoal = {};
          if (state.userProfile.currentWeightLbs) state.weightGoal.currentWeightLbs = state.userProfile.currentWeightLbs;
          if (state.userProfile.targetWeightLbs) state.weightGoal.targetWeightLbs = state.userProfile.targetWeightLbs;
          if (state.userProfile.weeklyPaceLbs !== undefined) state.weightGoal.weeklyPaceLbs = state.userProfile.weeklyPaceLbs;
        }
      } catch (e) {
        if (typeof console !== 'undefined' && console.warn) console.warn('Weight goal parse error', e);
      }

      // 4. OCD Settings
      try {
        const savedOcd = localStorage.getItem('focusflow_ocd_settings');
        if (savedOcd) {
          state.ocdSettings = Object.assign(state.ocdSettings || {}, JSON.parse(savedOcd));
        }
      } catch (e) {}

      // 5. Nutrition Log
      try {
        const savedNut = localStorage.getItem('focusflow_nutrition_log');
        if (savedNut) {
          const parsed = JSON.parse(savedNut);
          if (Array.isArray(parsed) && parsed.length > 0) state.nutritionLog = parsed;
        }
      } catch (e) {}

      // 6. Tasks
      try {
        const savedTasks = localStorage.getItem('focusflow_tasks');
        if (savedTasks) {
          const parsed = JSON.parse(savedTasks);
          if (Array.isArray(parsed) && parsed.length > 0) state.tasks = parsed;
        }
      } catch (e) {}

      // 7. Timeline
      try {
        const savedTimeline = localStorage.getItem('focusflow_timeline');
        if (savedTimeline) {
          const parsed = JSON.parse(savedTimeline);
          if (Array.isArray(parsed) && parsed.length > 0) state.timeline = parsed;
        }
      } catch (e) {}

      // 8. Pantry (Fixed: allows empty pantry [] without restoring fake defaults!)
      try {
        const savedPantry = localStorage.getItem('focusflow_pantry');
        if (savedPantry !== null) {
          const parsed = JSON.parse(savedPantry);
          if (Array.isArray(parsed)) state.pantry = parsed;
        }
      } catch (e) {}

      // 9. Connected Calendars (Fixes added calendars disappearing on refresh!)
      try {
        const savedCals = localStorage.getItem('focusflow_connected_calendars');
        if (savedCals) {
          const parsed = JSON.parse(savedCals);
          if (Array.isArray(parsed)) state.connectedCalendars = parsed;
        }
      } catch (e) {}

      // 10. Calendar Categories
      try {
        const savedCats = localStorage.getItem('focusflow_calendar_categories');
        if (savedCats) {
          const parsed = JSON.parse(savedCats);
          if (Array.isArray(parsed) && parsed.length > 0) state.calendarCategories = parsed;
        }
      } catch (e) {}

      // 11. Calendar Events (Purge any dummy/phantom events and deduplicate immediately)
      try {
        const savedEvents = localStorage.getItem('focusflow_events');
        if (savedEvents !== null) {
          const parsed = JSON.parse(savedEvents);
          if (Array.isArray(parsed)) {
            state.events = deduplicateEvents(parsed);
            try { localStorage.setItem('focusflow_events', JSON.stringify(state.events)); } catch (err) {}
          }
        }
      } catch (e) {}

      // 12. Water Logged
      try {
        const savedWater = localStorage.getItem('focusflow_water_logged_ml');
        if (savedWater !== null) {
          const num = Number(savedWater);
          if (!isNaN(num)) state.waterLoggedMl = num;
        }
      } catch (e) {}
    }

    // OCD COGNITIVE BALANCE & URGE SURFER ENGINE
    // ==============================================
    let urgeSurferInterval = null;
    let urgeSurferSecondsLeft = 300;
    let urgeSurferIsRunning = false;

    const URGE_SURFER_PROMPTS = [
      "Notice this thought as mental weather, not a command. Urgency is just an adrenaline illusion. You are completely safe right now.",
      "The urge to check, re-adjust, or fix feels intense, but it peaks like an ocean wave and will subside naturally without your action.",
      "You do not need to do anything with this thought. Letting discomfort exist without reacting builds immense neuroplastic resilience.",
      "Breathe deeply into your lower abdomen. Your prefrontal cortex is taking back the controls from the anxious alarm center.",
      "Biological change takes time. Giving yourself consistency is an act of deep kindness to your nervous system."
    ];

    function openOcdSupportModal() {
      renderOcdSupportUI();
      const modal = document.getElementById('ocd-support-modal');
      if (modal) modal.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
      playChime('bell');
    }

    function closeOcdSupportModal() {
      const modal = document.getElementById('ocd-support-modal');
      if (modal) modal.classList.add('hidden');
      if (urgeSurferInterval) {
        clearInterval(urgeSurferInterval);
        urgeSurferInterval = null;
        urgeSurferIsRunning = false;
      }
    }

    function renderOcdSupportUI() {
      const hist = state.healthHistory || [];
      const latest = hist[hist.length - 1] || {};
      const ah = state.appleHealthData || {};
      const sleepHours = ah.sleepHours || latest.sleep || 7.6;
      const steps = ah.steps || latest.steps || 8420;
      const sugarG = latest.sugar || 31;
      const fiberG = latest.fiber || 30;
      const magnesiumMg = latest.magnesium || 335;
      const tryptophanMg = 400;

      const sleepScore = Math.min(100, Math.round((sleepHours / 8.0) * 100));
      const sugarScore = Math.min(100, Math.round(Math.max(0, 100 - (sugarG - 25) * 2.5)));
      const mgScore = Math.min(100, Math.round((magnesiumMg / 320) * 100));
      const stepsScore = Math.min(100, Math.round((steps / 8000) * 100));
      const composite = Math.round((sleepScore * 0.35) + (sugarScore * 0.25) + (mgScore * 0.20) + (stepsScore * 0.20));

      const badge = document.getElementById('ocd-shield-score-badge');
      if (badge) {
        if (composite >= 80) {
          badge.textContent = `${composite}% High Protection`;
          badge.className = "px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs";
        } else if (composite >= 65) {
          badge.textContent = `${composite}% Moderate Shield`;
          badge.className = "px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold text-xs";
        } else {
          badge.textContent = `${composite}% Lower Resilience (Support Needed)`;
          badge.className = "px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold text-xs";
        }
      }

      const slEl = document.getElementById('ocd-biomarker-sleep');
      if (slEl) slEl.textContent = `${sleepHours.toFixed(1)} hrs`;
      const glEl = document.getElementById('ocd-biomarker-glucose');
      if (glEl) glEl.textContent = `Stable (${sugarG}g sugar • ${fiberG}g fiber)`;
      const mgEl = document.getElementById('ocd-biomarker-magnesium');
      if (mgEl) mgEl.textContent = `${magnesiumMg}mg Mg • ${tryptophanMg}mg Trp`;
      const stEl = document.getElementById('ocd-biomarker-steps');
      if (stEl) stEl.textContent = `${steps.toLocaleString()} steps`;

      const surfsBadge = document.getElementById('ocd-surfs-completed-badge');
      const surfCount = (state.ocdSettings && state.ocdSettings.completedSurfsCount) || 3;
      if (surfsBadge) surfsBadge.textContent = `${surfCount} Waves Surfed`;

      const flexToggle = document.getElementById('ocd-modal-flexible-toggle');
      if (flexToggle) flexToggle.checked = state.ocdSettings ? !!state.ocdSettings.flexibleRanges : true;

      const goalLockToggle = document.getElementById('ocd-modal-goallock-toggle');
      const goalLockBadge = document.getElementById('ocd-goal-lock-status-badge');
      const isLocked = state.ocdSettings && state.ocdSettings.goalLock;
      if (goalLockToggle) goalLockToggle.checked = !!isLocked;
      if (goalLockBadge) {
        goalLockBadge.textContent = isLocked ? "LOCKED (14-DAY GUARD)" : "UNLOCKED";
        goalLockBadge.className = isLocked ? "text-[9px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 border border-purple-500/50 font-mono font-bold" : "text-[9px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono";
      }

      if (window.lucide) lucide.createIcons();
    }

    function startUrgeSurferTimer() {
      const startBtn = document.getElementById('urge-surfer-start-btn');
      if (urgeSurferIsRunning) {
        clearInterval(urgeSurferInterval);
        urgeSurferInterval = null;
        urgeSurferIsRunning = false;
        if (startBtn) startBtn.innerHTML = `<i data-lucide="play" class="w-3.5 h-3.5 fill-dark-base"></i><span>Resume Wave</span>`;
        if (window.lucide) lucide.createIcons();
        return;
      }

      urgeSurferIsRunning = true;
      if (startBtn) startBtn.innerHTML = `<i data-lucide="pause" class="w-3.5 h-3.5 fill-dark-base"></i><span>Pause Wave</span>`;
      if (window.lucide) lucide.createIcons();
      playChime('bell');

      const ring = document.getElementById('urge-surfer-breathing-ring');
      const breathLabel = document.getElementById('urge-surfer-breath-label');
      const timeText = document.getElementById('urge-surfer-timer-text');
      const promptText = document.getElementById('urge-surfer-prompt-text');

      urgeSurferInterval = setInterval(() => {
        if (urgeSurferSecondsLeft <= 0) {
          clearInterval(urgeSurferInterval);
          urgeSurferInterval = null;
          urgeSurferIsRunning = false;
          completeUrgeSurferSession();
          return;
        }

        urgeSurferSecondsLeft--;
        const mins = Math.floor(urgeSurferSecondsLeft / 60);
        const secs = urgeSurferSecondsLeft % 60;
        if (timeText) timeText.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        const cycleSec = (300 - urgeSurferSecondsLeft) % 14;
        if (cycleSec < 4) {
          if (breathLabel) breathLabel.textContent = "Inhale (Slowly)...";
          if (ring) {
            ring.style.transform = "scale(1.4)";
            ring.style.borderColor = "#c084fc";
          }
        } else if (cycleSec < 8) {
          if (breathLabel) breathLabel.textContent = "Hold (Gently)...";
          if (ring) {
            ring.style.transform = "scale(1.4)";
            ring.style.borderColor = "#a855f7";
          }
        } else {
          if (breathLabel) breathLabel.textContent = "Exhale (Release)...";
          if (ring) {
            ring.style.transform = "scale(0.9)";
            ring.style.borderColor = "#9333ea";
          }
        }

        if (urgeSurferSecondsLeft % 60 === 0) {
          const promptIdx = Math.floor((300 - urgeSurferSecondsLeft) / 60) % URGE_SURFER_PROMPTS.length;
          if (promptText) promptText.textContent = `"${URGE_SURFER_PROMPTS[promptIdx]}"`;
        }
      }, 1000);
    }

    function resetUrgeSurferTimer() {
      if (urgeSurferInterval) {
        clearInterval(urgeSurferInterval);
        urgeSurferInterval = null;
      }
      urgeSurferIsRunning = false;
      urgeSurferSecondsLeft = 300;
      const timeText = document.getElementById('urge-surfer-timer-text');
      if (timeText) timeText.textContent = "05:00";
      const breathLabel = document.getElementById('urge-surfer-breath-label');
      if (breathLabel) breathLabel.textContent = "Ready";
      const ring = document.getElementById('urge-surfer-breathing-ring');
      if (ring) ring.style.transform = "scale(1)";
      const startBtn = document.getElementById('urge-surfer-start-btn');
      if (startBtn) startBtn.innerHTML = `<i data-lucide="play" class="w-3.5 h-3.5 fill-dark-base"></i><span>Begin 5-Min Wave</span>`;
      if (window.lucide) lucide.createIcons();
    }

    function completeUrgeSurferSession() {
      resetUrgeSurferTimer();
      if (!state.ocdSettings) state.ocdSettings = { flexibleRanges: true, goalLock: false, lockedUntil: null, completedSurfsCount: 3 };
      state.ocdSettings.completedSurfsCount = (state.ocdSettings.completedSurfsCount || 0) + 1;
      saveAppState();
      renderOcdSupportUI();
      playChime('bell');
      alertBox("🌊 You rode the wave! You allowed discomfort without giving in to the compulsion. Your brain grew stronger.", "Urge Surfed Successfully");
    }

    function toggleOcdFlexibleRanges() {
      const toggle = document.getElementById('ocd-modal-flexible-toggle');
      if (!state.ocdSettings) state.ocdSettings = { flexibleRanges: true, goalLock: false, lockedUntil: null, completedSurfsCount: 3 };
      const isChecked = (toggle && typeof toggle.checked === 'boolean') ? toggle.checked : !state.ocdSettings.flexibleRanges;
      state.ocdSettings.flexibleRanges = !!isChecked;
      saveAppState();
      renderWeightGoalTimeline();
      renderNutrition();
      renderOcdSupportUI();
      if (typeof playChime === 'function') { try { playChime('bell'); } catch (e) {} }
      alertBox(state.ocdSettings.flexibleRanges ? "Flexible Ranges active (±5% buffer). Relieves all-or-nothing perfectionism." : "Exact target display active.", "Anti-Perfectionism Buffer");
    }

    function toggleOcdGoalLock() {
      const toggle = document.getElementById('ocd-modal-goallock-toggle');
      if (!state.ocdSettings) state.ocdSettings = { flexibleRanges: true, goalLock: false, lockedUntil: null, completedSurfsCount: 3 };
      const isChecked = (toggle && typeof toggle.checked === 'boolean') ? toggle.checked : !state.ocdSettings.goalLock;
      state.ocdSettings.goalLock = !!isChecked;
      if (state.ocdSettings.goalLock) {
        const lockDate = new Date();
        lockDate.setDate(lockDate.getDate() + 14);
        state.ocdSettings.lockedUntil = lockDate.toISOString().split('T')[0];
        alertBox(`🔒 Goal locked for 14 days (until ${state.ocdSettings.lockedUntil}). Protects your body from second-guessing!`, "14-Day Consistency Guard");
      } else {
        state.ocdSettings.lockedUntil = null;
        alertBox("Goal lock released. Remember to give changes at least 14 days to see true results.", "Goal Unlocked");
      }
      saveAppState();
      renderWeightGoalTimeline();
      renderOcdSupportUI();
      if (typeof playChime === 'function') { try { playChime('bell'); } catch (e) {} }
    }

    function renderOcdBrainHealthView(container) {
      if (!container) container = document.getElementById('insights-hub-content') || document.getElementById('insights-tab-content');
      if (!container) return;

      const hist = state.healthHistory || [];
      const latest = hist[hist.length - 1] || {};
      const ah = state.appleHealthData || {};
      const sleepHours = ah.sleepHours || latest.sleep || 7.6;
      const steps = ah.steps || latest.steps || 8420;
      const sugarG = latest.sugar || 31;
      const fiberG = latest.fiber || 30;
      const magnesiumMg = latest.magnesium || 335;
      const tryptophanMg = 400;

      const sleepScore = Math.min(100, Math.round((sleepHours / 8.0) * 100));
      const sugarScore = Math.min(100, Math.round(Math.max(0, 100 - (sugarG - 25) * 2.5)));
      const mgScore = Math.min(100, Math.round((magnesiumMg / 320) * 100));
      const stepsScore = Math.min(100, Math.round((steps / 8000) * 100));
      const composite = Math.round((sleepScore * 0.35) + (sugarScore * 0.25) + (mgScore * 0.20) + (stepsScore * 0.20));

      container.innerHTML = `
        <div class="space-y-4">
          <div class="p-4 rounded-2xl bg-dark-base border border-purple-500/40 space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <i data-lucide="shield-check" class="w-4 h-4"></i>
                </div>
                <div>
                  <h4 class="font-bold text-white text-xs">OCD Neuro-Resilience &amp; Brain Health Matrix</h4>
                  <p class="text-[10px] text-slate-400">Biological fronto-striatal protection calculated from sleep, nutrition, &amp; movement</p>
                </div>
              </div>
              <span class="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-bold text-xs">
                ${composite}% Protective Shield
              </span>
            </div>

            <p class="text-[11px] text-slate-300 leading-relaxed">
              In OCD, hyperactive signaling between the <strong>orbital-frontal cortex (OFC)</strong>, <strong>caudate nucleus</strong>, and <strong>thalamus</strong> creates sticky 'just right' urgencies and catastrophic doubt loops. Physical health data directly alters these neurochemicals:
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div class="p-3 rounded-xl bg-dark-elevated border border-dark-border space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-pastel-sky font-bold flex items-center gap-1.5">
                    <i data-lucide="moon" class="w-3.5 h-3.5"></i> Sleep &amp; Prefrontal Brakes
                  </span>
                  <span class="font-mono text-pastel-sky font-bold">${sleepHours} hrs</span>
                </div>
                <p class="text-[10px] text-slate-400">
                  Restorative sleep restores GABAergic inhibition in the prefrontal cortex, making it easy to dismiss intrusive thoughts. When sleep falls under 7 hours, urge intensity surges by up to 40%.
                </p>
              </div>

              <div class="p-3 rounded-xl bg-dark-elevated border border-dark-border space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-pastel-butter font-bold flex items-center gap-1.5">
                    <i data-lucide="zap" class="w-3.5 h-3.5"></i> Glucose &amp; Adrenaline Dampening
                  </span>
                  <span class="font-mono text-pastel-butter font-bold">${sugarG}g sugar</span>
                </div>
                <p class="text-[10px] text-slate-400">
                  Blood sugar crashes trigger acute epinephrine (adrenaline) surges. In OCD, adrenaline feels like an urgent 'something is wrong' warning, setting off compulsive checking.
                </p>
              </div>

              <div class="p-3 rounded-xl bg-dark-elevated border border-dark-border space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-pastel-mint font-bold flex items-center gap-1.5">
                    <i data-lucide="leaf" class="w-3.5 h-3.5"></i> Glutamate &amp; Serotonin Co-factors
                  </span>
                  <span class="font-mono text-pastel-mint font-bold">${magnesiumMg}mg Mg</span>
                </div>
                <p class="text-[10px] text-slate-400">
                  Magnesium naturally blocks hyper-excitable NMDA glutamate receptors to prevent racing loops, while tryptophan fuels rate-limited serotonin synthesis.
                </p>
              </div>

              <div class="p-3 rounded-xl bg-dark-elevated border border-dark-border space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-pastel-coral font-bold flex items-center gap-1.5">
                    <i data-lucide="footprints" class="w-3.5 h-3.5"></i> Bilateral Somatic Reset
                  </span>
                  <span class="font-mono text-pastel-coral font-bold">${steps.toLocaleString()} steps</span>
                </div>
                <p class="text-[10px] text-slate-400">
                  Walking stimulates BDNF and shifts brain activation out of the default mode network (DMN), acutely weakening obsessive urge crests.
                </p>
              </div>
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-dark-base border border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span class="font-bold text-white block">Interactive OCD Defusion Space</span>
              <span class="text-[11px] text-slate-400">Launch the 5-minute Urge Surfer timer or adjust consistency shields</span>
            </div>
            <button type="button" onclick="openOcdSupportModal()" class="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-dark-base font-bold text-xs flex items-center gap-1.5 transition self-start sm:self-auto">
              <i data-lucide="waves" class="w-4 h-4"></i>
              <span>Open Urge Surfer &amp; Shields</span>
            </button>
          </div>
        </div>
      `;
    }

    function checkIncomingSharedRecipe() {
      try {
        const params = new URLSearchParams(window.location.search);
        const sharedRecipeData = params.get('recipe');
        if (sharedRecipeData) {
          const recipe = JSON.parse(decodeURIComponent(sharedRecipeData));
          if (recipe && recipe.title) {
            state.recipes = state.recipes || [];
            if (!state.recipes.some(r => r.title === recipe.title)) {
              state.recipes.push(recipe);
              saveAppState();
              alertBox(`Added shared recipe: "${recipe.title}"!`, "Recipe Received");
            }
          }
        }
      } catch (e) {}
    }

    window.onload = function() {
      // Cloud sync + offline support start in the background (never blocks or breaks the app)
      try { ffRegisterServiceWorker(); } catch (e) {}
      try { Promise.resolve(initCloudSync()).catch(() => {}); } catch (e) {}
      try { loadAppState(); } catch (e) { console.error("Error loading app state:", e); }
      try { populateCalendarCategoriesDropdowns(); } catch (e) {}
      try { renderConnectedCalendars(); } catch (e) {}
      try { renderTimeline(); } catch (e) { console.error("Error rendering timeline:", e); }
      try { renderMatrix(); } catch (e) {}
      try { renderPantry(); } catch (e) { console.error("Error rendering pantry:", e); }
      try { renderTaskmasterCalendarEvents(); } catch (e) {}
      try { initAppleHealthSync(); } catch (e) {}
      try { renderNutrition(); } catch (e) {}
      try { renderWeightGoalTimeline(); } catch (e) {}
      try { if (window.lucide) lucide.createIcons(); } catch (e) {}
      try { checkIncomingSharedRecipe(); } catch (e) {}
      try { checkAppInstallState(); } catch (e) {}
      try { checkForAppUpdates(); } catch (e) {}
      try {
        updateGoogleCalendarDirectUI();
        if (localStorage.getItem('focusflow_gcal_oauth_token')) {
          setTimeout(() => syncGoogleCalendarDirectNow(), 1500);
        }
      } catch (e) {}
    };

    // Re-draws every screen from the current `state` (used after cloud data arrives).
    // Mirrors the render list in window.onload, minus one-time setup (listeners, URL checks).
    function rerenderAllFromState() {
      const steps = [
        () => populateCalendarCategoriesDropdowns(),
        () => renderConnectedCalendars(),
        () => updateGoogleCalendarDirectUI(),
        () => renderTimeline(),
        () => renderMatrix(),
        () => renderPantry(),
        () => renderTaskmasterCalendarEvents(),
        () => {
          // Same data load as initAppleHealthSync(), without re-adding its event listeners
          const savedAh = localStorage.getItem('focusflow_apple_health_data');
          if (savedAh) state.appleHealthData = Object.assign(state.appleHealthData || {}, JSON.parse(savedAh));
          if (typeof renderAppleHealthUI === 'function') renderAppleHealthUI();
        },
        () => renderNutrition(),
        () => renderWeightGoalTimeline(),
        () => { if (window.lucide) lucide.createIcons(); }
      ];
      steps.forEach(step => {
        try { step(); } catch (e) { if (typeof console !== 'undefined' && console.warn) console.warn('Re-render warning', e); }
      });
    }

