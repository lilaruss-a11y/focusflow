    // ==============================================
    // DYNAMIC CALENDAR CATEGORIES & COLOR PALETTE ENGINE
    // ==============================================
    const CATEGORY_COLOR_PALETTE = {
      sky: {
        name: 'Sky Blue',
        bg: 'bg-sky-400',
        border: 'border-l-sky-400',
        borderFull: 'border-sky-500/40',
        badgeBg: 'bg-sky-500/15',
        text: 'text-sky-300',
        hex: '#38bdf8'
      },
      mint: {
        name: 'Mint Green',
        bg: 'bg-emerald-400',
        border: 'border-l-emerald-400',
        borderFull: 'border-emerald-500/40',
        badgeBg: 'bg-emerald-500/15',
        text: 'text-emerald-300',
        hex: '#34d399'
      },
      lavender: {
        name: 'Lavender Purple',
        bg: 'bg-purple-400',
        border: 'border-l-purple-400',
        borderFull: 'border-purple-500/40',
        badgeBg: 'bg-purple-500/15',
        text: 'text-purple-300',
        hex: '#c084fc'
      },
      coral: {
        name: 'Coral Peach',
        bg: 'bg-rose-400',
        border: 'border-l-rose-400',
        borderFull: 'border-rose-500/40',
        badgeBg: 'bg-rose-500/15',
        text: 'text-rose-300',
        hex: '#fb7185'
      },
      butter: {
        name: 'Butter Yellow',
        bg: 'bg-amber-400',
        border: 'border-l-amber-400',
        borderFull: 'border-amber-500/40',
        badgeBg: 'bg-amber-500/15',
        text: 'text-amber-300',
        hex: '#fbbf24'
      },
      rose: {
        name: 'Rose Pink',
        bg: 'bg-pink-400',
        border: 'border-l-pink-400',
        borderFull: 'border-pink-500/40',
        badgeBg: 'bg-pink-500/15',
        text: 'text-pink-300',
        hex: '#f472b6'
      },
      teal: {
        name: 'Teal',
        bg: 'bg-teal-400',
        border: 'border-l-teal-400',
        borderFull: 'border-teal-500/40',
        badgeBg: 'bg-teal-500/15',
        text: 'text-teal-300',
        hex: '#2dd4bf'
      },
      indigo: {
        name: 'Indigo',
        bg: 'bg-indigo-400',
        border: 'border-l-indigo-400',
        borderFull: 'border-indigo-500/40',
        badgeBg: 'bg-indigo-500/15',
        text: 'text-indigo-300',
        hex: '#818cf8'
      },
      amber: {
        name: 'Warm Orange',
        bg: 'bg-orange-400',
        border: 'border-l-orange-400',
        borderFull: 'border-orange-500/40',
        badgeBg: 'bg-orange-500/15',
        text: 'text-orange-300',
        hex: '#fb923c'
      }
    };

    // Load or initialize categories
    try {
      const savedCats = localStorage.getItem('focusflow_calendar_categories');
      if (savedCats) state.calendarCategories = JSON.parse(savedCats);
    } catch(e) {}

    if (!state.calendarCategories || state.calendarCategories.length === 0) {
      state.calendarCategories = [
        { id: 'focus', name: 'Deep Focus & Work', color: 'sky' },
        { id: 'classes', name: 'Classes & Study', color: 'lavender' },
        { id: 'personal', name: 'Personal & Habits', color: 'mint' },
        { id: 'chores', name: 'Chores & Admin', color: 'butter' },
        { id: 'meal', name: 'Meal & Kitchen', color: 'coral' },
        { id: 'care', name: 'Self-Care & Health', color: 'rose' }
      ];
    }

    function getCategoryInfo(categoryKey) {
      const cats = state.calendarCategories || [];
      const key = (categoryKey || '').toLowerCase();
      let found = cats.find(c => c.id.toLowerCase() === key || c.name.toLowerCase() === key);
      if (!found) {
        found = {
          id: categoryKey || 'general',
          name: categoryKey ? (categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)) : 'General',
          color: 'sky'
        };
      }
      const colorMeta = CATEGORY_COLOR_PALETTE[found.color] || CATEGORY_COLOR_PALETTE.sky;
      return {
        id: found.id,
        name: found.name,
        colorKey: found.color,
        colorMeta: colorMeta
      };
    }

    function populateCalendarCategoriesDropdowns(selectedId = null) {
      const dropdowns = ['new-cal-category', 'new-event-category'];
      dropdowns.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const currentVal = selectedId || el.value || 'focus';
        el.innerHTML = '';
        state.calendarCategories.forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat.id;
          const colorMeta = CATEGORY_COLOR_PALETTE[cat.color] || CATEGORY_COLOR_PALETTE.sky;
          opt.textContent = `${cat.name} (${colorMeta.name})`;
          if (cat.id === currentVal) opt.selected = true;
          el.appendChild(opt);
        });
      });
      onCalendarCategorySelected();
    }

    function onCalendarCategorySelected() {
      const catInput = document.getElementById('new-cal-category');
      if (!catInput) return;
      const catId = catInput.value;
      const catInfo = getCategoryInfo(catId);

      const badge = document.getElementById('cal-category-color-badge');
      const nameEl = document.getElementById('cal-category-color-name');
      const dot = document.getElementById('cal-category-color-dot');
      if (nameEl) nameEl.textContent = `${catInfo.colorMeta.name} • ${catInfo.name}`;
      if (dot) dot.className = `w-2.5 h-2.5 rounded-full ${catInfo.colorMeta.bg} shrink-0`;
      if (badge) {
        badge.className = `flex items-center gap-2 px-2.5 py-1 rounded-xl border text-[11px] font-semibold ${catInfo.colorMeta.badgeBg} ${catInfo.colorMeta.text} ${catInfo.colorMeta.borderFull}`;
      }
    }

    function saveNewCalendarCategory() {
      const nameInput = document.getElementById('custom-cat-name');
      const colorInput = document.getElementById('custom-cat-color');
      const name = nameInput ? nameInput.value.trim() : '';
      const color = colorInput ? colorInput.value : 'sky';

      if (!name) {
        alertBox("Please enter a name for your new category (e.g. Fitness, Client Work, Clubs).", "Missing Category Name");
        return;
      }

      const catId = 'cat-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (!state.calendarCategories) state.calendarCategories = [];

      const existing = state.calendarCategories.find(c => c.id === catId);
      if (existing) {
        existing.name = name;
        existing.color = color;
      } else {
        state.calendarCategories.push({ id: catId, name, color });
      }

      localStorage.setItem('focusflow_calendar_categories', JSON.stringify(state.calendarCategories));
      populateCalendarCategoriesDropdowns(catId);
      toggleNewCategoryCreator(false);
      if (nameInput) nameInput.value = '';

      const colorMeta = CATEGORY_COLOR_PALETTE[color] || CATEGORY_COLOR_PALETTE.sky;
      playChime('bell');
      alertBox(`Created category "${name}" in ${colorMeta.name}! Calendars and events in this category will automatically be colored ${colorMeta.name}.`, "Category Created");
    }

    function toggleNewCategoryCreator(show) {
      const box = document.getElementById('new-category-creator-box');
      if (box) {
        if (show) {
          box.classList.remove('hidden');
          const input = document.getElementById('custom-cat-name');
          if (input) input.focus();
        } else {
          box.classList.add('hidden');
        }
      }
      if (window.lucide) lucide.createIcons();
    }

    // ==============================================
    // MULTIPLE GOOGLE CALENDARS ENGINE
    // ==============================================
    if (!state.connectedCalendars) {
      try {
        const savedConnected = localStorage.getItem('focusflow_connected_calendars');
        if (savedConnected) {
          state.connectedCalendars = JSON.parse(savedConnected);
        }
      } catch(e) {}
    }
    if (!state.connectedCalendars) {
      state.connectedCalendars = [
        { id: 'cal-1', name: 'Work / Focus', url: 'https://calendar.google.com/calendar/ical/sample-work/basic.ics', category: 'focus', color: 'sky', active: true },
        { id: 'cal-2', name: 'Personal & Habits', url: 'https://calendar.google.com/calendar/ical/sample-personal/basic.ics', category: 'care', color: 'mint', active: true },
        { id: 'cal-3', name: 'School & Classes', url: 'https://calendar.google.com/calendar/ical/sample-school/basic.ics', category: 'focus', color: 'lavender', active: true }
      ];
    }

    function copyGCalSettingsLink() {
      const url = "https://calendar.google.com/calendar/u/0/r/settings";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          showCopySuccess();
        }).catch(() => fallbackCopy(url));
      } else {
        fallbackCopy(url);
      }
    }

    function fallbackCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showCopySuccess();
    }

    function showCopySuccess() {
      const btnText = document.getElementById('copy-gcal-link-btn-text');
      if (btnText) {
        btnText.textContent = "✓ Copied! Paste in Chrome's Address Bar";
        setTimeout(() => {
          btnText.textContent = "1. Copy Desktop Settings Link";
        }, 4000);
      }
      playChime('bell');
      alertBox("Link copied! Open a new tab in Chrome on your phone, paste into the top address bar, and tap Go. This prevents your phone from launching the app!", "Desktop Link Copied");
    }

    function renderConnectedCalendars() {
      const list = document.getElementById('connected-calendars-list');
      const countEl = document.getElementById('connected-cal-count');
      if (!list) return;

      const cals = state.connectedCalendars || [];
      if (countEl) countEl.textContent = cals.length;
      list.innerHTML = '';

      if (cals.length === 0) {
        list.innerHTML = '<div class="p-3 rounded-xl bg-dark-base border border-dashed border-dark-border text-slate-500 text-center text-[11px]">No calendars connected yet. Add your first calendar below!</div>';
        return;
      }

      cals.forEach(cal => {
        const catInfo = getCategoryInfo(cal.category);
        const item = document.createElement('div');
        item.className = "p-2.5 rounded-xl bg-dark-base border border-dark-border flex items-center justify-between text-xs transition hover:border-slate-600";
        item.innerHTML = `
          <div class="flex items-center gap-2.5 truncate pr-2">
            <span class="w-3 h-3 rounded-full ${catInfo.colorMeta.bg} shrink-0 shadow-sm"></span>
            <div class="truncate">
              <div class="flex items-center gap-1.5 truncate">
                <span class="font-bold text-slate-200 truncate">${cal.name}</span>
                <span class="text-[9px] font-semibold px-2 py-0.2 rounded-full ${catInfo.colorMeta.badgeBg} ${catInfo.colorMeta.text} border ${catInfo.colorMeta.borderFull} shrink-0">${catInfo.name}</span>
              </div>
              <span class="text-[10px] text-slate-400 font-mono">${cal.url.slice(0, 36)}...</span>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <label class="flex items-center cursor-pointer" title="Toggle Sync on/off">
              <input type="checkbox" ${cal.active ? 'checked' : ''} onchange="toggleCalendarActive('${cal.id}')" class="w-4 h-4 rounded text-pastel-sky focus:ring-0">
            </label>
            <button type="button" onclick="deleteConnectedCalendar('${cal.id}')" class="p-1 text-slate-500 hover:text-rose-400">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        `;
        list.appendChild(item);
      });

      if (window.lucide) lucide.createIcons();
    }

    function addNewConnectedCalendar() {
      const nameInput = document.getElementById('new-cal-name');
      const urlInput = document.getElementById('new-cal-url');
      const catInput = document.getElementById('new-cal-category');

      const name = nameInput ? nameInput.value.trim() : '';
      const url = urlInput ? urlInput.value.trim() : '';
      const catId = catInput ? catInput.value : 'focus';

      if (!name) {
        alertBox("Please give this calendar a name (e.g. Work, Classes, Personal).", "Missing Name");
        return;
      }
      if (!url) {
        alertBox("Please paste the secret iCal link for this calendar.", "Missing URL");
        return;
      }

      // Friendly format warning for Google Calendar links
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes('/embed') || lowerUrl.includes('/settings') || (!lowerUrl.includes('.ics') && lowerUrl.includes('google.com'))) {
        alertBox(
          "⚠️ Notice: That link may not be Google Calendar's Secret iCal link.\n\nIn Google Calendar Settings under 'Integrate calendar', look for 'Secret address in iCal format' (which ends with .ics).\n\nFocusFlow will still save this, but if sync fails, verify your link ends with .ics or use the 'Import .ics File' option!",
          "Check Link Format"
        );
      }

      const catInfo = getCategoryInfo(catId);

      if (!state.connectedCalendars) state.connectedCalendars = [];
      const newCal = {
        id: `cal-${Date.now()}`,
        name,
        url,
        category: catId,
        color: catInfo.colorKey,
        active: true
      };
      state.connectedCalendars.push(newCal);
      localStorage.setItem('focusflow_connected_calendars', JSON.stringify(state.connectedCalendars));

      if (nameInput) nameInput.value = '';
      if (urlInput) urlInput.value = '';

      renderConnectedCalendars();
      playChime('bell');
      alertBox(`Added calendar "${name}"! Click "Sync All Calendars" to merge events.`, "Calendar Added");
    }

    function toggleCalendarActive(calId) {
      const cal = state.connectedCalendars.find(c => c.id === calId);
      if (!cal) return;
      cal.active = !cal.active;
      localStorage.setItem('focusflow_connected_calendars', JSON.stringify(state.connectedCalendars));
      renderConnectedCalendars();
    }

    function deleteConnectedCalendar(calId) {
      state.connectedCalendars = state.connectedCalendars.filter(c => c.id !== calId);
      localStorage.setItem('focusflow_connected_calendars', JSON.stringify(state.connectedCalendars));
      renderConnectedCalendars();
    }

    function loadSampleMultipleCalendars() {
      state.connectedCalendars = [
        { id: `cal-work`, name: 'Work & Deliverables', url: 'https://calendar.google.com/calendar/ical/work/basic.ics', category: 'focus', color: 'sky', active: true },
        { id: `cal-school`, name: 'Classes & Study', url: 'https://calendar.google.com/calendar/ical/classes/basic.ics', category: 'focus', color: 'lavender', active: true },
        { id: `cal-personal`, name: 'Personal & Health', url: 'https://calendar.google.com/calendar/ical/personal/basic.ics', category: 'care', color: 'mint', active: true },
        { id: `cal-chores`, name: 'Household & Errands', url: 'https://calendar.google.com/calendar/ical/chores/basic.ics', category: 'chores', color: 'butter', active: true }
      ];
      localStorage.setItem('focusflow_connected_calendars', JSON.stringify(state.connectedCalendars));
      renderConnectedCalendars();
      playChime('bell');
      alertBox("Loaded 4 sample Google Calendars (Work, School, Personal, Chores)!", "Calendars Ready");
    }

    // Real-Time Google Calendar iCal Parser (RFC 5545 & Multi-Day Week Support)
    function parseICalEvents(icsText, calName, calCategory, calColor) {
      const events = [];
      if (!icsText || typeof icsText !== 'string') return events;

      // 1. Unfold multi-line iCal lines (RFC 5545 fold starts with space or tab)
      const unfolded = icsText.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
      const veventBlocks = unfolded.split(/BEGIN:VEVENT/i).slice(1);

      // 2. Generate date index for a 4-week window around today (-7 days to +21 days)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const windowDays = [];
      const dayCodes = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

      for (let offset = -7; offset <= 21; offset++) {
        const d = new Date(today);
        d.setDate(today.getDate() + offset);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        windowDays.push({
          dateObj: d,
          dateStr: `${y}-${m}-${day}`,
          dateNumStr: `${y}${m}${day}`,
          dayCode: dayCodes[d.getDay()],
          dayIndex: d.getDay()
        });
      }

      veventBlocks.forEach((block, idx) => {
        const rawContent = block.split(/END:VEVENT/i)[0] || '';
        
        const getField = (pattern) => {
          const m = rawContent.match(pattern);
          if (!m) return '';
          return m[1].replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/g, '\n').replace(/\\\\/g, '\\').trim();
        };

        const summary = getField(/^SUMMARY(?:;[^:]*)?:(.*)$/m) || `${calName} Event`;
        const dtstartRaw = getField(/^DTSTART(?:;[^:]*)?:([0-9TZ]+)/m);
        const dtendRaw = getField(/^DTEND(?:;[^:]*)?:([0-9TZ]+)/m);
        const durationRaw = getField(/^DURATION(?:;[^:]*)?:(.*)$/m);
        const rruleRaw = getField(/^RRULE(?:;[^:]*)?:(.*)$/m);
        const desc = getField(/^DESCRIPTION(?:;[^:]*)?:(.*)$/m);
        const location = getField(/^LOCATION(?:;[^:]*)?:(.*)$/m);

        if (!dtstartRaw) return;

        let startHH = 9;
        let startMM = 0;
        let durationMins = 60;
        let originalDateNumStr = dtstartRaw.slice(0, 8);
        const isUtc = dtstartRaw.endsWith('Z');

        if (dtstartRaw.includes('T')) {
          const timePart = dtstartRaw.split('T')[1] || '';
          const rawH = parseInt(timePart.slice(0, 2), 10) || 0;
          const rawM = parseInt(timePart.slice(2, 4), 10) || 0;

          if (isUtc) {
            const utcDate = new Date(Date.UTC(
              parseInt(originalDateNumStr.slice(0, 4), 10),
              parseInt(originalDateNumStr.slice(4, 6), 10) - 1,
              parseInt(originalDateNumStr.slice(6, 8), 10),
              rawH,
              rawM
            ));
            startHH = utcDate.getHours();
            startMM = utcDate.getMinutes();
            const uy = utcDate.getFullYear();
            const um = String(utcDate.getMonth() + 1).padStart(2, '0');
            const ud = String(utcDate.getDate()).padStart(2, '0');
            originalDateNumStr = `${uy}${um}${ud}`;
          } else {
            startHH = rawH;
            startMM = rawM;
          }

          if (dtendRaw && dtendRaw.includes('T')) {
            const endTimePart = dtendRaw.split('T')[1] || '';
            let endH = parseInt(endTimePart.slice(0, 2), 10) || (startHH + 1);
            let endM = parseInt(endTimePart.slice(2, 4), 10) || startMM;
            if (dtendRaw.endsWith('Z')) {
              const endDateNumStr = dtendRaw.slice(0, 8);
              const utcEndDate = new Date(Date.UTC(
                parseInt(endDateNumStr.slice(0, 4), 10),
                parseInt(endDateNumStr.slice(4, 6), 10) - 1,
                parseInt(endDateNumStr.slice(6, 8), 10),
                endH,
                endM
              ));
              endH = utcEndDate.getHours();
              endM = utcEndDate.getMinutes();
            }
            const diff = (endH * 60 + endM) - (startHH * 60 + startMM);
            if (diff > 0 && diff <= 720) durationMins = diff;
          } else if (durationRaw) {
            const m = durationRaw.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
            if (m) {
              const h = parseInt(m[1] || '0', 10);
              const min = parseInt(m[2] || '0', 10);
              durationMins = (h * 60) + min || 60;
            }
          }
        } else {
          // All-day event: default 9:00 AM, 60 mins
          startHH = 9;
          startMM = 0;
          durationMins = 60;
        }

        const timeFormatted = `${String(startHH).padStart(2, '0')}:${String(startMM).padStart(2, '0')}`;

        // Match event against the dates in our active window
        windowDays.forEach(wDay => {
          let occursOnThisDay = false;

          if (rruleRaw) {
            let untilNumStr = null;
            const untilMatch = rruleRaw.match(/UNTIL=([0-9]{8})/);
            if (untilMatch) untilNumStr = untilMatch[1];

            if (wDay.dateNumStr >= originalDateNumStr && (!untilNumStr || wDay.dateNumStr <= untilNumStr)) {
              if (rruleRaw.includes('FREQ=DAILY')) {
                occursOnThisDay = true;
              } else if (rruleRaw.includes('FREQ=WEEKLY')) {
                const byDayMatch = rruleRaw.match(/BYDAY=([A-Z,]+)/);
                if (byDayMatch) {
                  const days = byDayMatch[1].split(',');
                  if (days.includes(wDay.dayCode)) occursOnThisDay = true;
                } else {
                  const origDate = new Date(
                    parseInt(originalDateNumStr.slice(0, 4), 10),
                    parseInt(originalDateNumStr.slice(4, 6), 10) - 1,
                    parseInt(originalDateNumStr.slice(6, 8), 10)
                  );
                  if (origDate.getDay() === wDay.dayIndex) occursOnThisDay = true;
                }
              } else if (wDay.dateNumStr === originalDateNumStr) {
                occursOnThisDay = true;
              }
            }
          } else {
            // One-off event
            if (wDay.dateNumStr === originalDateNumStr) {
              occursOnThisDay = true;
            }
          }

          if (occursOnThisDay) {
            events.push({
              id: `ev-ical-${calName.replace(/[^a-zA-Z0-9]/g, '')}-${idx}-${wDay.dateStr}`,
              title: summary,
              calendarName: calName,
              calendarColor: calColor,
              category: calCategory || 'focus',
              date: wDay.dateStr,
              dayOfWeek: wDay.dayCode,
              startTime: timeFormatted,
              duration: durationMins,
              location: location,
              description: desc,
              goodEnough: `Focus on top 1-2 objectives for "${summary}"; wrap up smoothly without perfectionism spiral`,
              subtasks: [
                { text: `Review materials & set up for: ${summary}`, minutes: Math.min(10, Math.max(3, Math.round(durationMins * 0.15))), done: false },
                { text: `Core engagement & execution`, minutes: Math.max(15, Math.round(durationMins * 0.7)), done: false },
                { text: `Wrap up, save notes & plan next step`, minutes: Math.min(10, Math.max(3, Math.round(durationMins * 0.15))), done: false }
              ]
            });
          }
        });
      });

      return events;
    }

    // ==============================================
    // DIRECT GOOGLE CALENDAR CONNECTION (OFFICIAL API)
    // ==============================================

    function updateGoogleCalendarDirectUI() {
      const token = localStorage.getItem('focusflow_gcal_oauth_token');
      const email = localStorage.getItem('focusflow_gcal_user_email');
      const lastSync = Number(localStorage.getItem('focusflow_gcal_last_sync_time')) || 0;
      const statusBox = document.getElementById('gcal-direct-status-box');
      const connectBtn = document.getElementById('btn-connect-gcal-direct');
      const syncBtn = document.getElementById('btn-sync-gcal-now');
      const disconnectBtn = document.getElementById('btn-disconnect-gcal');

      if (email || token) {
        let syncSubtitle = 'Live 2-Way Sync Active';
        if (lastSync) {
          const diffMins = Math.round((Date.now() - lastSync) / 60000);
          if (diffMins < 1) syncSubtitle = 'Synced just now';
          else if (diffMins < 60) syncSubtitle = `Synced ${diffMins}m ago`;
          else syncSubtitle = 'Schedule Loaded • Tap to Sync';
        }

        if (statusBox) {
          statusBox.innerHTML = `
            <div class="flex items-center justify-between gap-2">
              <span class="text-pastel-mint font-semibold flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-pastel-mint animate-pulse"></span>
                Connected: ${email || 'Google Account'}
              </span>
              <span class="text-[10px] text-slate-400">${syncSubtitle}</span>
            </div>
          `;
        }
        if (connectBtn) connectBtn.classList.add('hidden');
        if (syncBtn) {
          syncBtn.classList.remove('hidden');
          syncBtn.disabled = false;
          syncBtn.innerHTML = `<span>🔄 Sync Live Events Now</span>`;
        }
        if (disconnectBtn) disconnectBtn.classList.remove('hidden');
      } else {
        const isIp = /^[0-9.]+$/.test(window.location.hostname);
        const ipNotice = isIp ? `
          <div class="mt-2 text-[10px] text-pastel-sky/90 bg-pastel-sky/10 border border-pastel-sky/20 rounded-lg p-2 flex items-start gap-1.5 leading-relaxed">
            <span>💡</span>
            <div><strong>Testing on Phone IP (${window.location.hostname}):</strong> Google Sign-In requires this IP added in Firebase Console (Authentication → Settings → Authorized domains), or test directly on your live site: <a href="https://lilaruss-a11y.github.io/focusflow/" target="_blank" class="underline font-bold text-white">lilaruss-a11y.github.io</a></div>
          </div>
        ` : '';
        if (statusBox) {
          statusBox.innerHTML = `
            <span class="text-slate-400">Not connected yet. Connect your Google account once to automatically sync live changes.</span>
            ${ipNotice}
          `;
        }
        if (connectBtn) {
          connectBtn.classList.remove('hidden');
          const btnText = document.getElementById('btn-connect-gcal-text');
          if (btnText) btnText.textContent = 'Connect with Google Calendar';
        }
        if (syncBtn) syncBtn.classList.add('hidden');
        if (disconnectBtn) disconnectBtn.classList.add('hidden');
      }
    }

    async function connectGoogleCalendarDirect() {
      try {
        const btnText = document.getElementById('btn-connect-gcal-text');
        if (btnText) btnText.textContent = 'Opening Google sign-in...';

        if (!ffSync.auth) await ffLoadFirebaseSdk();
        if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/calendar.events');
        provider.addScope('https://www.googleapis.com/auth/calendar');

        const result = await firebase.auth().signInWithPopup(provider);
        const credential = result.credential;
        const token = credential ? credential.accessToken : null;

        if (result && result.user) {
          ffSync.user = result.user;
          try {
            if (!ffSync.db && firebase.firestore) ffSync.db = firebase.firestore();
            if (typeof ffSubscribe === 'function') ffSubscribe();
          } catch(e) {}
        }

        if (token) {
          window._gcalSessionExpired = false;
          localStorage.setItem('focusflow_gcal_oauth_token', token);
          localStorage.setItem('focusflow_gcal_user_email', (result.user && result.user.email) || '');
          localStorage.setItem('focusflow_gcal_token_obtained_at', String(Date.now()));
          localStorage.setItem('focusflow_gcal_last_sync_time', String(Date.now()));
          playChime('bell');
          updateGoogleCalendarDirectUI();
          alertBox("Connected to your Google Calendar! Fetching your live schedule now...", "Google Connected");
          await syncGoogleCalendarDirectNow(false);
        } else {
          alertBox("Signed in, but Google did not return a calendar access token. Please tap Connect again and ensure calendar permissions are checked.", "Permission Needed");
        }
      } catch (err) {
        console.error("Google Calendar connection error:", err);
        const code = (err && err.code) || '';
        if (code === 'auth/unauthorized-domain') {
          const currentHost = window.location.hostname;
          alertBox(
            `⚠️ Domain Authorization Required:

Your phone is connecting via "${currentHost}". Google OAuth requires this domain in your Firebase Authorized list.

To authorize (10 seconds):
1. Open Firebase Console (https://console.firebase.google.com)
2. Project: focusflow-40398 → Authentication → Settings → Authorized domains
3. Click "Add domain" and enter: ${currentHost}

OR use your live site on your phone:
https://lilaruss-a11y.github.io/focusflow/`,
            "Domain Authorization Needed"
          );
        } else if (code === 'auth/popup-closed-by-user') {
          alertBox("Google sign-in was cancelled.", "Cancelled");
        } else if (code === 'auth/popup-blocked') {
          alertBox("Pop-up blocked by your browser. Please tap 'Allow Pop-ups' in your browser address bar to connect.", "Pop-up Blocked");
        } else {
          alertBox(`Could not connect: ${err.message}`, "Connection Notice");
        }
      } finally {
        resetViewportZoom();
        updateGoogleCalendarDirectUI();
      }
    }

    function disconnectGoogleCalendarDirect() {
      if (confirm("Disconnect Google Calendar direct sync? Your current events will remain on your device until cleared.")) {
        window._gcalSessionExpired = false;
        localStorage.removeItem('focusflow_gcal_oauth_token');
        localStorage.removeItem('focusflow_gcal_user_email');
        localStorage.removeItem('focusflow_gcal_token_obtained_at');
        localStorage.removeItem('focusflow_gcal_last_sync_time');
        updateGoogleCalendarDirectUI();
        playChime('bell');
        alertBox("Disconnected Google Calendar direct sync.", "Disconnected");
      }
    }

    async function syncGoogleCalendarDirectNow(isManual = false) {
      let token = localStorage.getItem('focusflow_gcal_oauth_token');
      const tokenObtainedAt = Number(localStorage.getItem('focusflow_gcal_token_obtained_at')) || 0;
      const isStale = tokenObtainedAt && (Date.now() - tokenObtainedAt > 50 * 60 * 1000);

      if (!token || window._gcalSessionExpired || isStale) {
        if (isManual) {
          connectGoogleCalendarDirect();
        } else {
          console.log('[FocusFlow] Google Calendar schedule loaded from cache; token will refresh on user sync.');
        }
        return;
      }

      const syncBtn = document.getElementById('btn-sync-gcal-now');
      if (syncBtn && isManual) {
        syncBtn.disabled = true;
        syncBtn.innerHTML = `<span class="animate-spin inline-block mr-1">⏳</span> Syncing live events...`;
      }

      try {
        // 1. Fetch user's calendars list (discovers Work, School, Personal, etc.)
        let calendarsToSync = [{ id: 'primary', summary: 'Personal' }];
        try {
          const calListResp = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (calListResp.status === 401) {
            window._gcalSessionExpired = true;
            updateGoogleCalendarDirectUI();
            if (isManual) {
              connectGoogleCalendarDirect();
            } else {
              console.log('[FocusFlow] Google Calendar session expired; cached schedule preserved.');
            }
            return;
          }
          if (calListResp.ok) {
            const calListData = await calListResp.json();
            if (calListData.items && calListData.items.length > 0) {
              calendarsToSync = calListData.items.filter(c => c.selected !== false);
            }
          }
        } catch (e) {
          console.warn("Could not fetch calendarList, falling back to primary:", e);
        }

        // 2. Fetch events across a 4-week window (-7 days to +21 days)
        const now = new Date();
        const timeMin = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
        const timeMax = new Date(now.getTime() + 21 * 24 * 3600 * 1000).toISOString();

        const fetchedEvents = [];
        const colors = ['sky', 'lavender', 'mint', 'coral', 'butter', 'teal', 'rose'];

        for (let i = 0; i < calendarsToSync.length; i++) {
          const cal = calendarsToSync[i];
          const calColor = colors[i % colors.length];

          try {
            const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&maxResults=250`;
            const resp = await fetch(eventsUrl, {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (resp.status === 403) {
              const errData = await resp.json().catch(() => ({}));
              const errMsg = (errData.error && errData.error.message) || '';
              if (errMsg.includes('has not been used') || errMsg.includes('disabled')) {
                if (isManual) {
                  alertBox(
                    `⚠️ The Google Calendar API is not turned on yet in your Google Cloud project.

Please visit this link to turn it on (takes 1 click):
https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview?project=focusflow-40398

Once enabled, tap 'Sync Live Events Now'!`,
                    "Enable Google Calendar API"
                  );
                }
                return;
              }
            }

            if (resp.ok) {
              const data = await resp.json();
              const items = data.items || [];

              items.forEach((item, itemIdx) => {
                if (!item.summary) return;

                let startHH = 9;
                let startMM = 0;
                let durationMins = 60;
                let eventDateStr = '';
                let isAllDayEvent = false;

                if (item.start && item.start.dateTime) {
                  const startDate = new Date(item.start.dateTime);
                  startHH = startDate.getHours();
                  startMM = startDate.getMinutes();
                  const sy = startDate.getFullYear();
                  const sm = String(startDate.getMonth() + 1).padStart(2, '0');
                  const sd = String(startDate.getDate()).padStart(2, '0');
                  eventDateStr = `${sy}-${sm}-${sd}`;

                  if (item.end && item.end.dateTime) {
                    const endDate = new Date(item.end.dateTime);
                    const diffMins = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
                    if (diffMins > 0) durationMins = diffMins;
                  }
                } else if (item.start && item.start.date) {
                  eventDateStr = item.start.date;
                  startHH = 0;
                  startMM = 0;
                  durationMins = 1440;
                  isAllDayEvent = true;
                }

                if (!eventDateStr) return;

                const timeFormatted = `${String(startHH).padStart(2, '0')}:${String(startMM).padStart(2, '0')}`;

                fetchedEvents.push({
                  id: `ev-gapi-${item.id}-${eventDateStr}`,
                  gcalEventId: item.id,
                  gcalCalendarId: cal.id || 'primary',
                  title: item.summary,
                  calendarName: cal.summary || 'Google Calendar',
                  calendarColor: calColor,
                  category: 'focus',
                  date: eventDateStr,
                  isAllDay: isAllDayEvent,
                  startTime: isAllDayEvent ? '00:00' : timeFormatted,
                  duration: durationMins,
                  location: item.location || '',
                  description: item.description || '',
                  goodEnough: `Focus on top 1-2 objectives for "${item.summary}"; wrap up smoothly without perfectionism spiral`,
                  subtasks: [
                    { text: `Review materials & set up for: ${item.summary}`, minutes: Math.min(10, Math.max(3, Math.round(durationMins * 0.15))), done: false },
                    { text: `Core engagement & execution`, minutes: Math.max(15, Math.round(durationMins * 0.7)), done: false },
                    { text: `Wrap up, save notes & plan next step`, minutes: Math.min(10, Math.max(3, Math.round(durationMins * 0.15))), done: false }
                  ]
                });
              });
            }
          } catch (err) {
            console.warn(`Error fetching events for ${cal.summary}:`, err);
          }
        }

        if (fetchedEvents.length > 0) {
          const nowMs = Date.now();
          const currentEvents = state.events || [];

          // Deduplicate manual events against fetched Google events by ID, or title + date + start time
          const manualEvents = currentEvents.filter(e => {
            if (e.id.startsWith('ev-gapi-') || e.id.startsWith('ev-ical-') || e.id.startsWith('ev-buf-') || e.id === 'ev-meal-choreo' || isDummyOrUnwantedEvent(e)) {
              return false;
            }
            // Check if this manual event already corresponds to a fetched Google event
            const isDup = fetchedEvents.some(f => {
              if (e.gcalEventId && f.gcalEventId && e.gcalEventId === f.gcalEventId) return true;
              if (e.title && f.title && e.title.trim().toLowerCase() === f.title.trim().toLowerCase() && e.date === f.date) {
                const [eH, eM] = (e.startTime || '00:00').split(':').map(Number);
                const [fH, fM] = (f.startTime || '00:00').split(':').map(Number);
                if (Math.abs((eH * 60 + eM) - (fH * 60 + fM)) <= 15) return true;
              }
              return false;
            });
            return !isDup;
          });

          // Merge fetched Google events while PRESERVING local user edits made in FocusFlow
          const mergedGcalEvents = fetchedEvents.map(fetched => {
            const existing = currentEvents.find(e => 
              (e.gcalEventId && e.gcalEventId === fetched.gcalEventId) ||
              e.id === fetched.id
            );

            if (existing) {
              // If the user modified this event locally in the last 5 minutes, keep the local version
              const wasRecentlyEditedLocally = existing.lastLocalEdit && (nowMs - existing.lastLocalEdit < 300000);
              if (wasRecentlyEditedLocally) {
                // Ensure gcal metadata is present
                existing.gcalEventId = fetched.gcalEventId;
                existing.gcalCalendarId = fetched.gcalCalendarId;
                return existing;
              }

              // Otherwise update from Google, but preserve any custom subtasks or boundary rules
              if (existing.subtasks && existing.subtasks.some(s => s.done)) {
                fetched.subtasks = existing.subtasks;
              }
              if (existing.goodEnough && !existing.goodEnough.includes('perfectionism spiral')) {
                fetched.goodEnough = existing.goodEnough;
              }
            }
            return fetched;
          });

          // Check if events actually changed before re-rendering
          const oldJson = JSON.stringify(currentEvents.map(e => ({ id: e.id, time: e.startTime, dur: e.duration, title: e.title })));
          const newEvents = [...manualEvents, ...mergedGcalEvents];
          newEvents.sort((a, b) => {
            const [aH, aM] = (a.startTime || '00:00').split(':').map(Number);
            const [bH, bM] = (b.startTime || '00:00').split(':').map(Number);
            return (aH * 60 + aM) - (bH * 60 + bM);
          });
          const newJson = JSON.stringify(newEvents.map(e => ({ id: e.id, time: e.startTime, dur: e.duration, title: e.title })));

          if (oldJson !== newJson) {
            calendarHistory.recordState();
            state.events = newEvents;
            saveAppState();
            renderTimeline();
          }

          localStorage.setItem('focusflow_gcal_last_sync_time', String(Date.now()));

          if (isManual) {
            closeGCalSyncModal();
            playChime('bell');
            alertBox(`Synced ${fetchedEvents.length} live events directly from your Google Calendars across all days of the week!`, "Google Calendar Synced");
          }
        } else if (isManual) {
          alertBox("Connected successfully to Google, but found 0 events scheduled in the upcoming weeks.", "No Events Found");
        }
      } catch (err) {
        console.error("Direct sync error:", err);
        if (isManual) alertBox(`Direct sync error: ${err.message}`, "Sync Error");
      } finally {
        if (syncBtn) {
          syncBtn.disabled = false;
          syncBtn.innerHTML = `<i data-lucide="refresh-cw" class="w-4 h-4"></i><span>Sync Live Events Now</span>`;
          if (window.lucide) lucide.createIcons();
        }
        updateGoogleCalendarDirectUI();
      }
    }

    function togglePasteIcalBox() {
      const box = document.getElementById('paste-ical-text-box');
      if (box) box.classList.toggle('hidden');
    }

    function importRawIcalText() {
      const textarea = document.getElementById('paste-ical-raw-input');
      const text = textarea ? textarea.value.trim() : '';
      if (!text || !text.includes('BEGIN:VCALENDAR')) {
        alertBox("Please paste text that includes 'BEGIN:VCALENDAR'.", "Invalid iCal Text");
        return;
      }
      const parsed = parseICalEvents(text, 'Pasted Calendar', 'focus', 'sky');
      if (parsed.length > 0) {
        const manualEvents = (state.events || []).filter(ev => 
          !ev.id.startsWith('ev-ical-') && 
          !ev.id.startsWith('ev-buf-') && 
          ev.id !== 'ev-meal-choreo' &&
          !ev.title.includes('Focus & Task Execution')
        );
        state.events = [...manualEvents, ...parsed];
        saveAppState();
        closeGCalSyncModal();
        renderTimeline();
        playChime('bell');
        alertBox(`Successfully imported ${parsed.length} events across all days of the week!`, "Calendar Imported");
      } else {
        alertBox("Could not find standard events in that text. Please verify it contains standard VEVENT items.", "Import Notice");
      }
    }

    function fetchWithTimeout(url, timeoutMs = 12000) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      return fetch(url, { signal: controller.signal, cache: 'no-store' })
        .finally(() => clearTimeout(id));
    }

    async function fetchCalendarIcsText(targetUrl) {
      if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) || targetUrl.includes('sample-')) {
        return null;
      }

      const cleanUrl = targetUrl.trim();

      const proxyAttempts = [
        // 1. Corsproxy.io
        async () => {
          const resp = await fetchWithTimeout(`https://corsproxy.io/?${encodeURIComponent(cleanUrl)}`, 12000);
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const text = await resp.text();
          if (text && text.includes('BEGIN:VCALENDAR')) return text;
          throw new Error('Not valid iCal text');
        },
        // 2. AllOrigins raw
        async () => {
          const resp = await fetchWithTimeout(`https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`, 12000);
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const text = await resp.text();
          if (text && text.includes('BEGIN:VCALENDAR')) return text;
          throw new Error('Not valid iCal text');
        },
        // 3. AllOrigins JSON get
        async () => {
          const resp = await fetchWithTimeout(`https://api.allorigins.win/get?url=${encodeURIComponent(cleanUrl)}`, 12000);
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const data = await resp.json();
          if (data && data.contents && data.contents.includes('BEGIN:VCALENDAR')) return data.contents;
          throw new Error('Not valid iCal text in contents');
        },
        // 4. Codetabs proxy
        async () => {
          const resp = await fetchWithTimeout(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(cleanUrl)}`, 12000);
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const text = await resp.text();
          if (text && text.includes('BEGIN:VCALENDAR')) return text;
          throw new Error('Not valid iCal text');
        }
      ];

      try {
        const text = await Promise.any(proxyAttempts.map(fn => fn()));
        return text;
      } catch (aggregateError) {
        console.warn('All proxies timed out or failed for URL:', cleanUrl);
        return null;
      }
    }

    async function syncAllConnectedCalendars() {
      const activeCals = (state.connectedCalendars || []).filter(c => c.active);
      if (activeCals.length === 0) {
        alertBox("Please enable or add at least one calendar to sync.", "No Active Calendars");
        return;
      }

      const syncBtn = document.getElementById('sync-all-cals-btn');
      if (syncBtn) {
        syncBtn.disabled = true;
        syncBtn.innerHTML = `<span class="animate-spin inline-block mr-1.5">⏳</span> Syncing ${activeCals.length} calendar${activeCals.length === 1 ? '' : 's'}...`;
      }

      let successfulCalendars = 0;
      let failedCalendars = [];
      const mergedEvents = [];

      // Fetch all active calendars in parallel with concurrent proxy racing!
      const fetchResults = await Promise.all(activeCals.map(async (cal) => {
        const targetUrl = (cal.url || '').trim().replace(/^webcal:\/\//i, 'https://');
        const icsText = await fetchCalendarIcsText(targetUrl);
        return { cal, icsText };
      }));

      fetchResults.forEach(({ cal, icsText }) => {
        if (icsText) {
          const parsed = parseICalEvents(icsText, cal.name, cal.category, cal.color);
          if (parsed.length > 0) {
            parsed.forEach(ev => mergedEvents.push(ev));
          }
          successfulCalendars++;
        } else {
          failedCalendars.push(cal.name);
        }
      });

      if (syncBtn) {
        syncBtn.disabled = false;
        syncBtn.innerHTML = `<i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i><span>Sync All Calendars</span>`;
        if (window.lucide) lucide.createIcons();
      }

      if (successfulCalendars === 0 && failedCalendars.length > 0) {
        alertBox(
          `Could not connect to: "${failedCalendars.join(', ')}" through the web proxy.\n\n⚡ Quick fix: Open that secret link in your phone or computer browser to immediately download "basic.ics", then tap "Import .ics File" in FocusFlow for an instant 0-second sync!`,
          "Sync Timed Out"
        );
        return;
      }

      // Preserve real manual events that aren't auto-synced or old dummy events
      const manualEvents = (state.events || []).filter(e => 
        !e.id.startsWith('ev-ical-') && 
        !e.id.startsWith('ev-buf-') && 
        e.id !== 'ev-meal-choreo' &&
        !e.title.includes('Focus & Task Execution') && !isDummyOrUnwantedEvent(e)
      );

      state.events = [...manualEvents, ...mergedEvents];

      // Sort chronologically
      state.events.sort((a, b) => {
        const [aH, aM] = (a.startTime || '00:00').split(':').map(Number);
        const [bH, bM] = (b.startTime || '00:00').split(':').map(Number);
        return (aH * 60 + aM) - (bH * 60 + bM);
      });

      saveAppState();
      closeGCalSyncModal();
      renderTimeline();
      playChime('bell');

      let msg = `Synced ${mergedEvents.length} real events across all days of the week!`;
      if (failedCalendars.length > 0) {
        msg += ` (${failedCalendars.join(', ')} timed out)`;
      }
      alertBox(msg, "Calendars Synced");
    }

    // ==============================================
    // GCAL SYNC MODAL & ICS FILE/FEED HANDLERS
    // ==============================================
    function openGCalSyncModal() {
      if (typeof populateCalendarCategoriesDropdowns === 'function') {
        populateCalendarCategoriesDropdowns();
      }
      if (typeof renderConnectedCalendars === 'function') {
        renderConnectedCalendars();
      }
      if (typeof updateGoogleCalendarDirectUI === 'function') {
        updateGoogleCalendarDirectUI();
      }
      const modal = document.getElementById('gcal-sync-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeGCalSyncModal() {
      const modal = document.getElementById('gcal-sync-modal');
      if (modal) modal.classList.add('hidden');
    }

    function parseICS(icsText) {
      const lines = icsText.split(/\r\n|\r|\n/);
      const events = [];
      let currentEvent = null;

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line.startsWith('BEGIN:VEVENT')) {
          currentEvent = {};
        } else if (line.startsWith('END:VEVENT')) {
          if (currentEvent && currentEvent.title) {
            events.push(currentEvent);
          }
          currentEvent = null;
        } else if (currentEvent) {
          if (line.startsWith('SUMMARY:')) {
            currentEvent.title = line.substring(8);
          } else if (line.startsWith('DTSTART')) {
            const val = line.split(':')[1] || '';
            if (val.includes('T')) {
              const timePart = val.split('T')[1];
              currentEvent.startTime = `${timePart.substring(0, 2)}:${timePart.substring(2, 4)}`;
            } else {
              currentEvent.startTime = '09:00';
            }
          } else if (line.startsWith('DURATION:')) {
            const dur = line.substring(9);
            const mins = dur.match(/(\d+)M/);
            const hrs = dur.match(/(\d+)H/);
            let total = 0;
            if (hrs) total += parseInt(hrs[1], 10) * 60;
            if (mins) total += parseInt(mins[1], 10);
            currentEvent.duration = total || 45;
          }
        }
      }
      return events;
    }

    function handleIcsFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const text = e.target.result;
        const calName = file.name.replace(/\.ics$/i, '') || 'Imported Calendar';
        const parsed = typeof parseICalEvents === 'function' ? parseICalEvents(text, calName, 'focus', 'sky') : [];
        if (parsed.length > 0) {
          const manualEvents = (state.events || []).filter(ev => 
            !ev.id.startsWith('ev-ical-') && 
            !ev.id.startsWith('ev-buf-') && 
            ev.id !== 'ev-meal-choreo' &&
            !ev.title.includes('Focus & Task Execution')
          );
          state.events = [...manualEvents, ...parsed];
          saveAppState();
          closeGCalSyncModal();
          renderTimeline();
          if (typeof ffUploadNow === 'function') {
            ffUploadNow(true).catch(() => {});
          }
          playChime('bell');
          alertBox(`Successfully imported ${parsed.length} events from "${file.name}" across all days of the week!`, "Calendar Imported");
        } else {
          alertBox("Could not find standard events in that file. Please verify it is a valid .ics calendar export.", "Import Notice");
        }
      };
      reader.readAsText(file);
    }

    function saveAndSyncIcalUrl() {
      const inputEl = document.getElementById('gcal-feed-url-input') || document.getElementById('gcal-ical-url-input');
      const url = inputEl ? inputEl.value.trim() : '';
      if (url) {
        localStorage.setItem('focusflow_gcal_ical_url', url);
        if (!state.connectedCalendars) state.connectedCalendars = [];
        const exists = state.connectedCalendars.some(c => c.url === url);
        if (!exists) {
          state.connectedCalendars.push({
            id: `cal-${Date.now()}`,
            name: 'Google Calendar',
            url: url,
            category: 'focus',
            color: 'sky',
            active: true
          });
          localStorage.setItem('focusflow_connected_calendars', JSON.stringify(state.connectedCalendars));
          if (typeof renderConnectedCalendars === 'function') renderConnectedCalendars();
        }
      }
      if (typeof syncAllConnectedCalendars === 'function') syncAllConnectedCalendars();
    }

  

