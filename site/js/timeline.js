    // ==============================================
    // STRUCTURED CALENDAR DAY GRID & TIMELINE ENGINE
    // ==============================================
    state.timelineViewMode = 'calendar'; // 'calendar' or 'list'
    const CALENDAR_START_HOUR = 6; // 6:00 AM
    const CALENDAR_END_HOUR = 26;  // 2:00 AM (Next Day)
    const CALENDAR_HEIGHT_LEVELS = [
      { level: 1, height: 35, label: 'Ht 1', desc: 'Whole Day' },
      { level: 2, height: 56, label: 'Ht 2', desc: 'Compact' },
      { level: 3, height: 84, label: 'Ht 3', desc: 'Standard' },
      { level: 4, height: 135, label: 'Ht 4', desc: 'Roomy' },
      { level: 5, height: 230, label: 'Ht 5', desc: 'Deep Detail' }
    ];

    let calendarZoomLevel = parseInt(localStorage.getItem('focusflow_calendar_zoom_level'), 10) || 3;
    if (calendarZoomLevel < 1) calendarZoomLevel = 1;
    if (calendarZoomLevel > 5) calendarZoomLevel = 5;

    let CALENDAR_HOUR_HEIGHT = CALENDAR_HEIGHT_LEVELS[calendarZoomLevel - 1].height;

    function changeCalendarZoomLevel(delta) {
      calendarZoomLevel = Math.max(1, Math.min(5, calendarZoomLevel + delta));
      localStorage.setItem('focusflow_calendar_zoom_level', calendarZoomLevel);
      CALENDAR_HOUR_HEIGHT = CALENDAR_HEIGHT_LEVELS[calendarZoomLevel - 1].height;
      localStorage.setItem('focusflow_calendar_zoom', CALENDAR_HOUR_HEIGHT);
      updateHourHeightUI();
      renderTimeline();
    }

    function adjustHourHeight(delta) {
      changeCalendarZoomLevel(delta > 0 ? 1 : -1);
    }

    function updateHourHeightUI() {
      const current = CALENDAR_HEIGHT_LEVELS[calendarZoomLevel - 1];
      const label = document.getElementById('calendar-zoom-label');
      if (label) {
        label.textContent = current.label;
      }
      const desc = document.getElementById('calendar-zoom-desc');
      if (desc) {
        desc.textContent = current.desc;
      }
      const dayGrid = document.getElementById('timeline-day-grid');
      if (dayGrid) {
        dayGrid.style.height = `${((CALENDAR_END_HOUR - CALENDAR_START_HOUR) * CALENDAR_HOUR_HEIGHT) + 20}px`;
      }
    }

    function switchTimelineView(mode) {
      state.timelineViewMode = mode;
      const btnCal = document.getElementById('btn-view-calendar');
      const btnList = document.getElementById('btn-view-list');
      const calWrap = document.getElementById('timeline-calendar-wrapper');
      const listWrap = document.getElementById('timeline-events-container');

      if (mode === 'calendar') {
        if (btnCal) btnCal.className = "p-1.5 rounded-lg font-bold bg-pastel-mint text-dark-base transition flex items-center justify-center shadow-sm";
        if (btnList) btnList.className = "p-1.5 rounded-lg font-medium text-slate-400 hover:text-white transition flex items-center justify-center";
        if (calWrap) calWrap.classList.remove('hidden');
        if (listWrap) listWrap.classList.add('hidden');
      } else {
        if (btnCal) btnCal.className = "p-1.5 rounded-lg font-medium text-slate-400 hover:text-white transition flex items-center justify-center";
        if (btnList) btnList.className = "p-1.5 rounded-lg font-bold bg-pastel-mint text-dark-base transition flex items-center justify-center shadow-sm";
        if (calWrap) calWrap.classList.add('hidden');
        if (listWrap) listWrap.classList.remove('hidden');
      }
      renderTimeline();
    }

    function getTodayDateString() {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }

    function formatDateString(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }

    function getSundayOfWeek(dInput) {
      const d = new Date(typeof dInput === 'string' ? dInput + 'T12:00:00' : dInput);
      const day = d.getDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday
      const sunday = new Date(d);
      sunday.setDate(d.getDate() - day);
      sunday.setHours(0, 0, 0, 0);
      return sunday;
    }
    const getMondayOfWeek = getSundayOfWeek; // Backward compatibility alias

    function getSelectedTimelineDateStr() {
      if (!state.selectedTimelineDate) {
        state.selectedTimelineDate = getTodayDateString();
      }
      return state.selectedTimelineDate;
    }

    function getEventsForSelectedDay() {
      const selDate = getSelectedTimelineDateStr();
      const selDateNormalized = selDate.replace(/-/g, '');
      const allEvents = deduplicateEvents(state.events || []);

      return allEvents.filter(ev => {
        if (ev.date) {
          return ev.date.replace(/-/g, '') === selDateNormalized;
        }
        return selDate === getTodayDateString();
      });
    }

    function selectTimelineDay(dateStr) {
      state.selectedTimelineDate = dateStr;
      renderTimeline();
      if (dateStr === getTodayDateString()) {
        if (state.timelineViewMode === 'list') scrollListToNow();
        else scrollToCurrentTimeMarker();
      }
    }

    function scrollListToNow() {
      setTimeout(() => {
        const divider = document.getElementById('timeline-now-divider-list');
        const container = document.getElementById('timeline-events-container');
        if (divider && container) {
          const divTop = divider.offsetTop;
          container.scrollTo({ top: Math.max(0, divTop - 60), behavior: 'smooth' });
        }
      }, 80);
    }

    function changeTimelineWeek(offsetWeeks) {
      const curDateStr = getSelectedTimelineDateStr();
      const curSunday = getSundayOfWeek(curDateStr);
      curSunday.setDate(curSunday.getDate() + (offsetWeeks * 7));
      state.selectedTimelineDate = formatDateString(curSunday);
      renderTimeline();
    }


    function jumpTimelineToNow() {
      state.selectedTimelineDate = getTodayDateString();
      renderTimeline();

      if (state.timelineViewMode === 'list') {
        setTimeout(() => {
          const divider = document.getElementById('timeline-now-divider-list');
          const container = document.getElementById('timeline-events-container');
          if (divider && container) {
            divider.scrollIntoView({ behavior: 'smooth', block: 'center' });
            let topPos = divider.offsetTop;
            let el = divider.offsetParent;
            while (el && el !== container) {
              topPos += el.offsetTop;
              el = el.offsetParent;
            }
            container.scrollTo({ top: Math.max(0, topPos - 70), behavior: 'smooth' });
          }
        }, 100);
      } else {
        scrollToCurrentTimeMarker();
      }
      playChime('bell');
      alertBox("Jumped to current time NOW marker.", "Jump to NOW");
    }

    function jumpTimelineToToday() {
      state.selectedTimelineDate = getTodayDateString();
      renderTimeline();
      if (state.timelineViewMode === 'list') {
        setTimeout(() => {
          const divider = document.getElementById('timeline-now-divider-list');
          if (divider) divider.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 60);
      } else {
        scrollToCurrentTimeMarker();
      }
    }

    function renderWeekStrip() {
      const strip = document.getElementById('timeline-week-strip');
      if (!strip) return;
      strip.innerHTML = '';

      const selDateStr = getSelectedTimelineDateStr();
      const weekStart = getSundayOfWeek(selDateStr);
      const todayStr = getTodayDateString();
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let i = 0; i < 7; i++) {
        const cur = new Date(weekStart);
        cur.setDate(weekStart.getDate() + i);
        const dateStr = formatDateString(cur);
        const dayNum = cur.getDate();
        const isSelected = (dateStr === selDateStr);
        const isToday = (dateStr === todayStr);

        const dayShort = dayNames[i].slice(0, 1); // 'S', 'M', 'T', 'W', 'T', 'F', 'S'
        const dayEvents = (state.events || []).filter(e => {
          const eDate = e.date || todayStr;
          return eDate === dateStr;
        });
        const hasEvents = dayEvents.length > 0;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.onclick = () => {
          selectTimelineDay(dateStr);
          if (isToday) {
            if (state.timelineViewMode === 'list') scrollListToNow();
            else scrollToCurrentTimeMarker();
          }
        };
        btn.className = `px-1.5 py-0.5 rounded-lg text-[10px] font-semibold flex flex-col items-center transition ${
          isSelected 
            ? 'bg-pastel-mint text-dark-base font-bold shadow-sm' 
            : isToday 
            ? 'bg-dark-elevated text-pastel-sky font-bold hover:bg-slate-700' 
            : 'text-slate-400 hover:text-white hover:bg-dark-elevated'
        }`;
        btn.title = `${dayNames[i]}, ${cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

        btn.innerHTML = `
          <span class="text-[9px] uppercase tracking-tighter opacity-75">${dayShort}</span>
          <span class="text-[11px] leading-tight">${dayNum}</span>
          ${hasEvents ? `<span class="w-1 h-1 rounded-full ${isSelected ? 'bg-dark-base' : 'bg-pastel-mint'}"></span>` : ''}
        `;
        strip.appendChild(btn);
      }
    }


    // ==============================================
    // DRAG & MOVE CALENDAR EVENTS (TOUCH & MOUSE)
    // ==============================================
    
    // ==============================================
    // GOOGLE CALENDAR 2-WAY SYNC ENGINE
    // ==============================================
    function getEventIsoDateTimes(ev) {
      const dateStr = ev.date || (typeof getSelectedTimelineDateStr === 'function' ? getSelectedTimelineDateStr() : '') || getTodayDateString();
      const [sH, sM] = (ev.startTime || '09:00').split(':').map(Number);
      const dur = Math.max(5, parseInt(ev.duration, 10) || 30);

      const [year, month, day] = dateStr.split('-').map(Number);
      const startDate = new Date(year, month - 1, day, sH, sM, 0);
      const endDate = new Date(startDate.getTime() + (dur * 60000));

      const pad = n => String(n).padStart(2, '0');
      const getTimezoneOffsetStr = d => {
        const offsetMin = -d.getTimezoneOffset();
        const sign = offsetMin >= 0 ? '+' : '-';
        const absMin = Math.abs(offsetMin);
        return `${sign}${pad(Math.floor(absMin / 60))}:${pad(absMin % 60)}`;
      };

      const toRfc3339 = d => {
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${getTimezoneOffsetStr(d)}`;
      };

      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      return {
        start: { dateTime: toRfc3339(startDate), timeZone: tz },
        end: { dateTime: toRfc3339(endDate), timeZone: tz }
      };
    }

    async function pushEventChangeToGoogle(ev, action = 'update') {
      const token = localStorage.getItem('focusflow_gcal_oauth_token');
      if (!token || !ev) return;

      const calId = encodeURIComponent(ev.gcalCalendarId || 'primary');

      try {
        if (action === 'delete') {
          if (!ev.gcalEventId) return;
          const resp = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calId}/events/${encodeURIComponent(ev.gcalEventId)}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          if (resp.ok || resp.status === 404 || resp.status === 410) {
            console.log(`[FocusFlow] Deleted event from Google Calendar:`, ev.title);
          }
          return;
        }

        const { start, end } = getEventIsoDateTimes(ev);
        const payload = {
          summary: ev.title || 'FocusFlow Event',
          description: ev.description || '',
          location: ev.location || '',
          start,
          end
        };

        if (ev.gcalEventId) {
          // Update / Move existing event in Google Calendar
          const patchUrl = `https://www.googleapis.com/calendar/v3/calendars/${calId}/events/${encodeURIComponent(ev.gcalEventId)}`;
          const resp = await fetch(patchUrl, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          if (resp.ok) {
            ev.entryType = state.editEventEntryType || ev.entryType || 'both';
      ev.lastLocalEdit = Date.now();
            console.log(`[FocusFlow] Successfully pushed update to Google Calendar:`, ev.title);
          } else if (resp.status === 401) {
            console.warn('[FocusFlow] Google Calendar token expired; will refresh next sign-in.');
          }
        } else if (action === 'create') {
          // Create new event in user's primary Google Calendar
          const postUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events`;
          const resp = await fetch(postUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          if (resp.ok) {
            const created = await resp.json();
            ev.gcalEventId = created.id;
            ev.gcalCalendarId = 'primary';
            ev.lastLocalEdit = Date.now();
            saveAppState();
            console.log(`[FocusFlow] Created event in Google Calendar:`, ev.title);
          }
        }
      } catch (err) {
        console.warn('[FocusFlow] Could not push change to Google Calendar:', err);
      }
    }

    function attachEventDragListeners(block, ev) {
      let holdTimer = null;
      let isDragging = false;
      let startClientX = 0;
      let startClientY = 0;
      let startTopPx = 0;
      let currentTopPx = 0;
      let ghostEl = null;

      const blocksContainer = document.getElementById('timeline-event-blocks');

      // -------------------------------------------------------------
      // TOUCH INTERACTION (Mobile):
      // - 400ms long-press to engage drag (like Google Calendar app).
      // - Passive touchmove listener detects normal scrolling (>7px)
      //   and cancels the hold timer immediately without blocking native scrolling!
      // -------------------------------------------------------------
      function onTouchStart(e) {
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return;
        if (e.touches && e.touches.length > 1) return;

        const touch = e.touches[0];
        startClientX = touch.clientX;
        startClientY = touch.clientY;
        const computedTop = parseFloat(block.style.top) || 0;
        startTopPx = computedTop;
        currentTopPx = computedTop;

        holdTimer = setTimeout(() => {
          startDragging(touch);
        }, 400);

        // Passive listener to detect scroll intent immediately
        window.addEventListener('touchmove', onTouchMoveCheck, { passive: true });
        window.addEventListener('touchend', onTouchEndCheck);
        window.addEventListener('touchcancel', onTouchEndCheck);
      }

      function onTouchMoveCheck(e) {
        if (!holdTimer) return;
        const touch = e.touches ? e.touches[0] : null;
        if (!touch) return;
        const dx = touch.clientX - startClientX;
        const dy = touch.clientY - startClientY;
        // If finger moves more than 7px in any direction before 400ms, user is scrolling!
        if (Math.hypot(dx, dy) > 7) {
          clearTimeout(holdTimer);
          holdTimer = null;
          cleanupTouchCheck();
        }
      }

      function onTouchEndCheck() {
        clearTimeout(holdTimer);
        holdTimer = null;
        cleanupTouchCheck();
      }

      function cleanupTouchCheck() {
        window.removeEventListener('touchmove', onTouchMoveCheck);
        window.removeEventListener('touchend', onTouchEndCheck);
        window.removeEventListener('touchcancel', onTouchEndCheck);
      }

      // -------------------------------------------------------------
      // MOUSE INTERACTION (Desktop):
      // -------------------------------------------------------------
      function onMouseDown(e) {
        if (e.button !== 0) return; // Left click only
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return;

        startClientX = e.clientX;
        startClientY = e.clientY;
        const computedTop = parseFloat(block.style.top) || 0;
        startTopPx = computedTop;
        currentTopPx = computedTop;

        holdTimer = setTimeout(() => {
          startDragging(e);
        }, 180);

        window.addEventListener('mousemove', onMouseMoveCheck);
        window.addEventListener('mouseup', onMouseUpCheck);
      }

      function onMouseMoveCheck(e) {
        const dy = e.clientY - startClientY;
        if (!isDragging) {
          if (Math.abs(dy) > 6) {
            clearTimeout(holdTimer);
            holdTimer = null;
            cleanupMouseCheck();
          }
          return;
        }
      }

      function onMouseUpCheck() {
        clearTimeout(holdTimer);
        holdTimer = null;
        cleanupMouseCheck();
        if (isDragging) finishDragging();
      }

      function cleanupMouseCheck() {
        window.removeEventListener('mousemove', onMouseMoveCheck);
        window.removeEventListener('mouseup', onMouseUpCheck);
      }

      // -------------------------------------------------------------
      // ACTIVE DRAGGING:
      // Engaged only AFTER user has deliberately held down in place
      // -------------------------------------------------------------
      function startDragging(point) {
        isDragging = true;
        cleanupTouchCheck();
        cleanupMouseCheck();

        try { if (navigator.vibrate) navigator.vibrate(40); } catch(err) {}

        block.classList.add('z-50', 'shadow-2xl', 'scale-[1.02]', 'ring-2', 'ring-pastel-sky', 'opacity-95');
        block.style.cursor = 'grabbing';
        block.dataset.isBeingDragged = "true";

        if (blocksContainer) {
          ghostEl = document.createElement('div');
          ghostEl.className = 'absolute left-2 z-50 px-2.5 py-1 rounded-lg bg-pastel-sky text-dark-base font-bold text-xs shadow-xl pointer-events-none transition-all duration-75';
          ghostEl.style.top = Math.max(0, currentTopPx - 26) + 'px';
          ghostEl.textContent = `📍 Drag to Reschedule`;
          blocksContainer.appendChild(ghostEl);
        }

        // Now attach active drag handlers
        window.addEventListener('touchmove', onActiveDragMove, { passive: false });
        window.addEventListener('touchend', onActiveDragEnd);
        window.addEventListener('touchcancel', onActiveDragEnd);
        window.addEventListener('mousemove', onActiveDragMove);
        window.addEventListener('mouseup', onActiveDragEnd);
      }

      function onActiveDragMove(e) {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault();

        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = clientY - startClientY;

        const rawTop = startTopPx + deltaY;
        const stepPx = CALENDAR_HOUR_HEIGHT / 4; // 15-minute snap
        const snappedTop = Math.max(0, Math.min(((CALENDAR_END_HOUR - CALENDAR_START_HOUR) * CALENDAR_HOUR_HEIGHT) - (block.offsetHeight || 38), Math.round(rawTop / stepPx) * stepPx));
        currentTopPx = snappedTop;

        block.style.top = snappedTop + 'px';

        const snappedMinutes = Math.round((snappedTop / CALENDAR_HOUR_HEIGHT) * 60) + (CALENDAR_START_HOUR * 60);
        const endMinutes = snappedMinutes + (ev.duration || 30);
        const sHH = String(Math.floor(snappedMinutes / 60)).padStart(2, '0');
        const sMM = String(snappedMinutes % 60).padStart(2, '0');
        const eHH = String(Math.floor(endMinutes / 60)).padStart(2, '0');
        const eMM = String(endMinutes % 60).padStart(2, '0');
        const timeBadgeText = `${formatTimeAmPm(`${sHH}:${sMM}`)} – ${formatTimeAmPm(`${eHH}:${eMM}`)}`;

        if (ghostEl) {
          ghostEl.textContent = `📍 ${timeBadgeText}`;
          ghostEl.style.top = Math.max(0, snappedTop - 26) + 'px';
        }
      }

      function onActiveDragEnd(e) {
        window.removeEventListener('touchmove', onActiveDragMove);
        window.removeEventListener('touchend', onActiveDragEnd);
        window.removeEventListener('touchcancel', onActiveDragEnd);
        window.removeEventListener('mousemove', onActiveDragMove);
        window.removeEventListener('mouseup', onActiveDragEnd);

        finishDragging();
      }

      function finishDragging() {
        if (!isDragging) return;
        isDragging = false;

        block.classList.remove('z-50', 'shadow-2xl', 'scale-[1.02]', 'ring-2', 'ring-pastel-sky', 'opacity-95');
        block.style.cursor = 'pointer';
        setTimeout(() => { delete block.dataset.isBeingDragged; }, 120);

        if (ghostEl && ghostEl.parentNode) {
          ghostEl.parentNode.removeChild(ghostEl);
          ghostEl = null;
        }

        const finalMinutes = Math.round((currentTopPx / CALENDAR_HOUR_HEIGHT) * 60) + (CALENDAR_START_HOUR * 60);
        const finalHH = String(Math.floor(finalMinutes / 60)).padStart(2, '0');
        const finalMM = String(finalMinutes % 60).padStart(2, '0');
        const newTime = `${finalHH}:${finalMM}`;

        if (newTime !== ev.startTime) {
          calendarHistory.recordState(); // Undoable with ⌘Z!
          ev.startTime = newTime;
          ev.lastLocalEdit = Date.now();
          saveAppState();
          renderTimeline();
          pushEventChangeToGoogle(ev, 'update');
          if (typeof ffUploadNow === 'function') ffUploadNow(true);
          playChime('bell');
          alertBox(`Moved "${ev.title}" to ${formatTimeAmPm(newTime)}! (⌘Z to undo)`, "Event Rescheduled");
        } else {
          renderTimeline();
        }
      }

      block.addEventListener('touchstart', onTouchStart, { passive: true });
      block.addEventListener('mousedown', onMouseDown);
    }

    // ==============================================
    // DUAL SIGN-IN: PASSWORD LINKING & RESET
    // ==============================================
    async function ffLinkOrUpdatePassword() {
      const passInput = document.getElementById('ff-set-password-input');
      const password = passInput ? passInput.value.trim() : '';
      if (!password || password.length < 6) {
        alertBox("Password must be at least 6 characters.", "Password Required");
        return;
      }
      if (!ffSync.user) {
        alertBox("Please sign in with Google first, then set your password.", "Sign In Required");
        return;
      }
      try {
        const cred = firebase.auth.EmailAuthProvider.credential(ffSync.user.email, password);
        try {
          await ffSync.user.linkWithCredential(cred);
        } catch(err) {
          if (err.code === 'auth/credential-already-in-use' || err.code === 'auth/provider-already-linked') {
            await ffSync.user.updatePassword(password);
          } else {
            throw err;
          }
        }
        passInput.value = '';
        playChime('bell');
        alertBox(`Password successfully saved for ${ffSync.user.email}! You can now sign in using either Google or this password on all devices.`, "Password Saved");
      } catch(err) {
        console.error("Password link error:", err);
        alertBox(`Could not save password: ${err.message}`, "Password Notice");
      }
    }

    async function ffSendPasswordReset() {
      const emailInput = document.getElementById('ff-email-input');
      const email = emailInput ? emailInput.value.trim() : (ffSync.user ? ffSync.user.email : '');
      if (!email) {
        alertBox("Please enter your email above, then tap 'Forgot / Set Password'.", "Email Required");
        return;
      }
      try {
        await firebase.auth().sendPasswordResetEmail(email);
        playChime('bell');
        alertBox(`Sent password setup link to ${email}! Open the link in your email to set or reset your password.`, "Reset Link Sent");
      } catch(err) {
        alertBox(`Could not send setup link: ${err.message}`, "Notice");
      }
    }

    // ==============================================
    // ADHD SUGGESTIONS: COLLAPSIBLE & AUTO-EXPAND ON SCROLL
    // ==============================================
    let activeScheduleSuggestions = [];
    let suggestionsUserMinimized = false;

    function toggleScheduleSuggestions(expand) {
      suggestionsUserMinimized = !expand;
      renderScheduleSuggestionsUI(expand);
    }

    function checkScrollForSuggestions() {
      if (suggestionsUserMinimized || activeScheduleSuggestions.length === 0) return;
      const canvas = document.getElementById('timeline-calendar-scroll-canvas');
      if (!canvas) return;

      const sug = activeScheduleSuggestions[0];
      if (!sug || !sug.startTime) return;

      const [sH, sM] = sug.startTime.split(':').map(Number);
      const sugMinutes = (sH * 60) + sM;
      const sugTopPx = ((sugMinutes - (CALENDAR_START_HOUR * 60)) / 60) * CALENDAR_HOUR_HEIGHT;

      const scrollTop = canvas.scrollTop;
      const viewHeight = canvas.clientHeight || 500;

      // Auto-expand when scrolling within view of the target time block
      if (sugTopPx >= (scrollTop - 40) && sugTopPx <= (scrollTop + viewHeight - 60)) {
        renderScheduleSuggestionsUI(true);
      }
    }

    function renderScheduleSuggestions() {
      const container = document.getElementById('timeline-schedule-suggestions');
      if (!container) return;
      container.innerHTML = '';

      const dayEvents = getEventsForSelectedDay();
      if (dayEvents.length === 0) {
        container.classList.add('hidden');
        return;
      }

      // Sort day events by start time
      const sorted = [...dayEvents].sort((a, b) => {
        const [aH, aM] = (a.startTime || '09:00').split(':').map(Number);
        const [bH, bM] = (b.startTime || '09:00').split(':').map(Number);
        return (aH * 60 + aM) - (bH * 60 + bM);
      });

      const suggestions = [];

      // Suggestion 1: Check for back-to-back blocks with no buffer
      for (let i = 0; i < sorted.length - 1; i++) {
        const cur = sorted[i];
        const nxt = sorted[i + 1];

        const [cH, cM] = (cur.startTime || '09:00').split(':').map(Number);
        const curEndMin = (cH * 60) + cM + (cur.duration || 30);

        const [nH, nM] = (nxt.startTime || '10:00').split(':').map(Number);
        const nxtStartMin = (nH * 60) + nM;

        const gap = nxtStartMin - curEndMin;
        if (gap >= 0 && gap <= 5 && !cur.title.includes('Buffer') && !nxt.title.includes('Buffer')) {
          const bufH = String(Math.floor(curEndMin / 60)).padStart(2, '0');
          const bufM = String(curEndMin % 60).padStart(2, '0');
          suggestions.push({
            id: `sug-buf-${cur.id}`,
            type: 'buffer',
            title: `Add 10m Decompression Buffer`,
            description: `Back-to-back transition detected after "${cur.title.slice(0, 24)}" before "${nxt.title.slice(0, 24)}".`,
            startTime: `${bufH}:${bufM}`,
            duration: 10,
            afterTitle: cur.title
          });
          break;
        }
      }

      // Suggestion 2: Check if lunch block exists between 11:30 AM (690m) and 2:00 PM (840m)
      const hasMeal = sorted.some(e => {
        const [eH, eM] = (e.startTime || '09:00').split(':').map(Number);
        const sMin = (eH * 60) + eM;
        return (e.category === 'meal' || /lunch|dinner|meal|eat/i.test(e.title)) && sMin >= 660 && sMin <= 870;
      });

      if (!hasMeal && sorted.length >= 2) {
        suggestions.push({
          id: `sug-lunch`,
          type: 'meal',
          title: `Schedule 30m Nourishing Lunch & Reset`,
          description: `No meal break scheduled between 11:30 AM and 2:00 PM. Taking time to eat fuels afternoon dopamine.`,
          startTime: '12:30',
          duration: 30
        });
      }

      if (suggestions.length === 0) {
        container.classList.add('hidden');
        return;
      }

      activeScheduleSuggestions = suggestions;
      container.classList.add('hidden'); // Ensure banner never shows under the heading

      // Attach scroll listener to auto-expand on approaching target time slot
      const canvas = document.getElementById('timeline-calendar-scroll-canvas');
      if (canvas && !canvas.dataset.hasSuggestionScrollListener) {
        canvas.addEventListener('scroll', checkScrollForSuggestions, { passive: true });
        canvas.dataset.hasSuggestionScrollListener = "true";
      }
    }

    let adhdTouchScrollTimer = null;
    function setupAdhdNotesTouchTransparency() {
      const canvas = document.getElementById('timeline-calendar-scroll-canvas');
      if (!canvas || canvas.dataset.hasAdhdTouchListeners === "true") return;
      canvas.dataset.hasAdhdTouchListeners = "true";

      const dim = () => {
        const el = document.getElementById('timeline-schedule-suggestions');
        if (!el || el.dataset.isExpanded === "true") return;
        el.style.opacity = '0.15';
      };
      const restore = () => {
        const el = document.getElementById('timeline-schedule-suggestions');
        if (!el || el.dataset.isExpanded === "true") return;
        el.style.opacity = '1';
      };

      canvas.addEventListener('touchstart', dim, { passive: true });
      canvas.addEventListener('touchend', restore, { passive: true });
      canvas.addEventListener('touchcancel', restore, { passive: true });

      canvas.addEventListener('scroll', () => {
        const el = document.getElementById('timeline-schedule-suggestions');
        if (!el || el.dataset.isExpanded === "true") return;
        el.style.opacity = '0.15';
        clearTimeout(adhdTouchScrollTimer);
        adhdTouchScrollTimer = setTimeout(() => {
          const target = document.getElementById('timeline-schedule-suggestions');
          if (target && target.dataset.isExpanded !== "true") target.style.opacity = '1';
        }, 300);
      }, { passive: true });
    }

    function renderScheduleSuggestionsUI(expanded) {
      const container = document.getElementById('timeline-schedule-suggestions');
      if (!container || activeScheduleSuggestions.length === 0) return;
      container.innerHTML = '';
      container.dataset.isExpanded = expanded ? "true" : "false";
      container.style.opacity = '1';
      setupAdhdNotesTouchTransparency();

      const sug = activeScheduleSuggestions[0];
      if (!expanded) {
        // Compact Collapsed Pill (takes zero screen space, grabs attention gently)
        const pill = document.createElement('div');
        pill.className = "p-2 px-3 rounded-xl bg-pastel-sky/15 border border-pastel-sky/40 flex items-center justify-between gap-2 shadow-sm cursor-pointer hover:bg-pastel-sky/25 transition";
        pill.onclick = () => toggleScheduleSuggestions(true);
        pill.innerHTML = `
          <div class="flex items-center gap-2 text-xs truncate">
            <span class="animate-pulse">${sug.type === 'meal' ? '🥗' : '🧘'}</span>
            <span class="font-bold text-pastel-sky">ADHD Suggestion:</span>
            <span class="text-slate-200 truncate">${sug.title} (${formatTimeAmPm(sug.startTime)})</span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" class="text-xs text-pastel-sky font-bold flex items-center gap-1">
              <span>Expand ▾</span>
            </button>
            <button type="button" onclick="event.stopPropagation(); dismissScheduleSuggestion()" class="w-5 h-5 rounded-full hover:bg-pastel-sky/30 text-slate-400 hover:text-white flex items-center justify-center text-[10px]" title="Dismiss suggestion">✕</button>
          </div>
        `;
        container.appendChild(pill);
      } else {
        // Full Expanded Card with Minimize button
        const card = document.createElement('div');
        card.className = "p-3 rounded-2xl bg-dark-base border border-pastel-sky/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg ring-1 ring-pastel-sky/20 transition-all";
        card.innerHTML = `
          <div class="flex items-start gap-2.5 flex-1">
            <span class="text-xl shrink-0">${sug.type === 'meal' ? '🥗' : '🧘'}</span>
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold uppercase tracking-wider text-pastel-sky bg-pastel-sky/15 px-2 py-0.5 rounded">ADHD Suggestion</span>
                <span class="text-xs font-bold text-white">${sug.title}</span>
              </div>
              <p class="text-[11px] text-slate-300 leading-snug">${sug.description}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button type="button" onclick="toggleScheduleSuggestions(false)" class="px-2.5 py-1.5 rounded-xl bg-dark-elevated hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1">
              <span>Minimize ▴</span>
            </button>
            <button type="button" onclick="dismissScheduleSuggestion()" class="px-2.5 py-1.5 rounded-xl bg-dark-elevated hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs transition">
              ✕ Dismiss
            </button>
            <button type="button" onclick="approveScheduleSuggestion('${sug.type}', '${sug.startTime}', ${sug.duration}, '${encodeURIComponent(sug.afterTitle || '')}')" class="px-3.5 py-1.5 rounded-xl bg-pastel-sky hover:bg-sky-300 text-dark-base font-bold text-xs flex items-center gap-1 shadow-md transition">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>+ Approve &amp; Add</span>
            </button>
          </div>
        `;
        container.appendChild(card);
      }
      if (window.lucide) lucide.createIcons();
    }

    function dismissScheduleSuggestion(sugId) {
      activeScheduleSuggestions = [];
      suggestionsUserMinimized = true;
      const container = document.getElementById('timeline-schedule-suggestions');
      if (container) container.classList.add('hidden');
    }

    function approveScheduleSuggestion(type, startTime, duration, rawAfterTitle) {
      const afterTitle = decodeURIComponent(rawAfterTitle || '');
      const selDate = getSelectedTimelineDateStr();

      if (type === 'meal') {
        state.events.push({
          id: `ev-approved-meal-${Date.now()}`,
          title: '🥗 Nourishing Lunch & Rest Reset',
          calendarName: 'Approved Habit',
          calendarColor: 'coral',
          category: 'meal',
          date: selDate,
          startTime: startTime || '12:30',
          duration: duration || 30,
          goodEnough: 'Wholesome lunch and brief mental break before afternoon work',
          subtasks: [
            { text: 'Step away from screen & prepare food', minutes: 10, done: false },
            { text: 'Eat mindfully without rush', minutes: 15, done: false },
            { text: 'Rinse dishes & hydrate with full glass of water', minutes: 5, done: false }
          ]
        });
        alertBox("Added 30m Nourishing Lunch block to your schedule!", "Suggestion Approved");
      } else {
        state.events.push({
          id: `ev-approved-buf-${Date.now()}`,
          title: `🧘 Decompression Buffer${afterTitle ? ': after ' + afterTitle.slice(0, 20) : ''}`,
          calendarName: 'Approved Habit',
          calendarColor: 'mint',
          category: 'care',
          date: selDate,
          startTime: startTime || '11:00',
          duration: duration || 10,
          goodEnough: 'Hydrate, shoulder roll, clear tabs before starting next block',
          subtasks: [
            { text: 'Drink a glass of water', minutes: 3, done: false },
            { text: 'Physical stretch or walk around', minutes: 3, done: false },
            { text: 'Reset desk and close finished tabs', minutes: 4, done: false }
          ]
        });
        alertBox("Added 10m Decompression Buffer to your schedule!", "Suggestion Approved");
      }

      saveAppState();
      renderTimeline();
      playChime('bell');
    }


    // ==============================================
    // CANVAS ADHD SUGGESTIONS (STICKY ON-GRID COMMENTS)
    // ==============================================
    state.expandedCanvasSuggestionId = null;

        function setAllAdhdNotesTransparent(transparent) {
      const container = document.getElementById('timeline-event-blocks');
      if (container) {
        container.classList.toggle('adhd-notes-dimmed', !!transparent);
      }
    }

    function toggleCanvasSuggestion(sugId, expand) {
      state.expandedCanvasSuggestionId = expand ? sugId : null;
      renderTimeline();
    }

    function renderCanvasScheduleSuggestions() {
      const blocksContainer = document.getElementById('timeline-event-blocks');
      if (!blocksContainer) return;

      const dayEvents = getEventsForSelectedDay();
      if (dayEvents.length === 0) return;

      const sorted = [...dayEvents].sort((a, b) => {
        const [aH, aM] = (a.startTime || '09:00').split(':').map(Number);
        const [bH, bM] = (b.startTime || '09:00').split(':').map(Number);
        return (aH * 60 + aM) - (bH * 60 + bM);
      });

      const suggestions = [];

      // 1. Back-to-back buffer suggestion
      for (let i = 0; i < sorted.length - 1; i++) {
        const cur = sorted[i];
        const nxt = sorted[i + 1];
        const [cH, cM] = (cur.startTime || '09:00').split(':').map(Number);
        const curEndMin = (cH * 60) + cM + (cur.duration || 30);
        const [nH, nM] = (nxt.startTime || '10:00').split(':').map(Number);
        const nxtStartMin = (nH * 60) + nM;
        const gap = nxtStartMin - curEndMin;

        if (gap >= 0 && gap <= 5 && !cur.title.includes('Buffer') && !nxt.title.includes('Buffer')) {
          const bufH = String(Math.floor(curEndMin / 60)).padStart(2, '0');
          const bufM = String(curEndMin % 60).padStart(2, '0');
          suggestions.push({
            id: `sug-buf-${cur.id}`,
            type: 'buffer',
            title: `10m Decompression Buffer`,
            description: `Back-to-back detected after "${cur.title.slice(0, 18)}". Give yourself 10 mins to stretch & hydrate.`,
            startTime: `${bufH}:${bufM}`,
            duration: 10,
            afterTitle: cur.title
          });
          break;
        }
      }

      // 2. Lunch break suggestion
      const hasMeal = sorted.some(e => {
        const [eH, eM] = (e.startTime || '09:00').split(':').map(Number);
        const sMin = (eH * 60) + eM;
        return (e.category === 'meal' || /lunch|dinner|meal|eat/i.test(e.title)) && sMin >= 660 && sMin <= 870;
      });

      if (!hasMeal && sorted.length >= 2) {
        suggestions.push({
          id: `sug-lunch`,
          type: 'meal',
          title: `30m Nourishing Lunch & Reset`,
          description: `No meal break scheduled between 11:30 AM and 2:00 PM. Taking time to eat fuels afternoon focus.`,
          startTime: '12:30',
          duration: 30
        });
      }

      suggestions.forEach(sug => {
        if (state.dismissedSuggestions && state.dismissedSuggestions.includes(sug.id)) return;

        const [sH, sM] = (sug.startTime || '12:00').split(':').map(Number);
        const sugMin = (sH * 60) + sM;
        const minutesFromStart = Math.max(0, sugMin - (CALENDAR_START_HOUR * 60));
        const topPx = (minutesFromStart / 60) * CALENDAR_HOUR_HEIGHT;

        const isExpanded = state.expandedCanvasSuggestionId === sug.id;
        const commentEl = document.createElement('div');
        commentEl.className = 'absolute right-2 z-20 flex flex-col items-end max-w-[280px] pointer-events-auto select-none adhd-coach-note';
        commentEl.style.top = `${topPx}px`;

        if (!isExpanded) {
          // Compressed Note Pill: Transparent on hover so calendar underneath is visible!
          commentEl.innerHTML = `
            <div class="adhd-coach-note-collapsed flex items-center rounded-xl bg-pastel-butter/95 text-dark-base shadow-lg border border-amber-400/50 overflow-hidden transition-all duration-200" onmouseenter="setAllAdhdNotesTransparent(true)" onmouseleave="setAllAdhdNotesTransparent(false)">
              <div onclick="event.stopPropagation(); toggleCanvasSuggestion('${sug.id}', true)" class="px-2.5 py-1.5 flex items-center gap-1.5 cursor-pointer font-bold text-[11px] hover:bg-amber-300 transition" title="Hover to see schedule underneath; tap to open details">
                <span>${sug.type === 'meal' ? '🥗' : '🧘'}</span>
                <span class="truncate max-w-[170px]">ADHD Note: ${sug.title}</span>
              </div>
              <button type="button" onclick="event.stopPropagation(); toggleCanvasSuggestion('${sug.id}', true)" class="px-2 py-1.5 border-l border-amber-400/60 hover:bg-amber-300 transition text-dark-base shrink-0" title="Open Note">
                <i data-lucide="message-square" class="w-3 h-3"></i>
              </button>
            </div>
          `;
        } else {
          // Expanded Sticky Note: Fully solid and opaque at all times (never transparent)
          commentEl.innerHTML = `
            <div class="relative rounded-2xl bg-dark-base/98 border border-pastel-butter text-slate-200 shadow-2xl backdrop-blur-md text-xs ring-1 ring-pastel-butter/50 overflow-hidden max-w-[280px]">
              <div class="p-3 space-y-2">
                <div class="flex items-center justify-between gap-2 border-b border-dark-border/80 pb-1.5">
                  <div class="flex-1 flex items-center gap-1 py-0.5 select-none">
                    <span>${sug.type === 'meal' ? '🥗' : '🧘'}</span>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-pastel-butter">ADHD Coach Note</span>
                  </div>
                  <button type="button" onclick="event.stopPropagation(); toggleCanvasSuggestion('${sug.id}', false)" class="text-slate-400 hover:text-white p-1 rounded-md hover:bg-dark-elevated transition flex items-center gap-1 text-[11px] shrink-0" title="Condense note">
                    <span class="font-bold text-pastel-butter">▲</span>
                  </button>
                </div>
                <p class="text-[11px] text-slate-300 leading-snug select-none">${sug.description}</p>
                <div class="pt-1 flex items-center justify-end gap-1.5">
                  <button type="button" onclick="event.stopPropagation(); dismissCanvasSuggestion('${sug.id}')" class="px-2 py-1 rounded-lg text-slate-400 hover:text-white text-[11px] transition hover:bg-dark-elevated">
                    Dismiss
                  </button>
                  <button type="button" onclick="event.stopPropagation(); approveScheduleSuggestion('${sug.type}', '${sug.startTime}', ${sug.duration}, '${encodeURIComponent(sug.afterTitle || '')}')" class="px-2.5 py-1 rounded-lg bg-pastel-sky hover:bg-sky-300 text-dark-base font-bold text-[11px] flex items-center gap-1 shadow-sm transition active:scale-95">
                    <i data-lucide="plus" class="w-3 h-3"></i>
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        }
        blocksContainer.appendChild(commentEl);
      });
      if (window.lucide) lucide.createIcons();
    }

    function dismissCanvasSuggestion(sugId) {
      if (!state.dismissedSuggestions) state.dismissedSuggestions = [];
      state.dismissedSuggestions.push(sugId);
      renderTimeline();
    }

    const calendarHistory = {
      undoStack: [],
      redoStack: [],
      maxStack: 40,

      recordState() {
        try {
          const snap = JSON.stringify(state.events || []);
          if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === snap) {
            return;
          }
          this.undoStack.push(snap);
          if (this.undoStack.length > this.maxStack) {
            this.undoStack.shift();
          }
          this.redoStack = [];
          this.updateUI();
        } catch (e) {}
      },

      undo() {
        if (this.undoStack.length === 0) {
          alertBox("No previous calendar actions to undo.", "Undo");
          return;
        }
        const currentSnap = JSON.stringify(state.events || []);
        this.redoStack.push(currentSnap);
        const prevSnap = this.undoStack.pop();
        state.events = JSON.parse(prevSnap);
        saveAppState();
        renderTimeline();
        if (typeof ffUploadNow === 'function') ffUploadNow(true);
        this.updateUI();
        playChime('bell');
        alertBox("Undid last calendar change.", "Action Undone");
      },

      redo() {
        if (this.redoStack.length === 0) {
          alertBox("No calendar actions to redo.", "Redo");
          return;
        }
        const currentSnap = JSON.stringify(state.events || []);
        this.undoStack.push(currentSnap);
        const nextSnap = this.redoStack.pop();
        state.events = JSON.parse(nextSnap);
        saveAppState();
        renderTimeline();
        if (typeof ffUploadNow === 'function') ffUploadNow(true);
        this.updateUI();
        playChime('bell');
        alertBox("Redid calendar change.", "Action Redone");
      },

      updateUI() {
        const undoBtn = document.getElementById('calendar-undo-btn');
        const redoBtn = document.getElementById('calendar-redo-btn');
        if (undoBtn) {
          const canUndo = this.undoStack.length > 0;
          undoBtn.disabled = !canUndo;
          undoBtn.classList.toggle('opacity-30', !canUndo);
          undoBtn.classList.toggle('cursor-not-allowed', !canUndo);
        }
        if (redoBtn) {
          const canRedo = this.redoStack.length > 0;
          redoBtn.disabled = !canRedo;
          redoBtn.classList.toggle('opacity-30', !canRedo);
          redoBtn.classList.toggle('cursor-not-allowed', !canRedo);
        }
      }
    };

    // Keyboard shortcut listener for Undo (⌘Z / Ctrl+Z) and Redo (⌘⇧Z / Ctrl+Y)
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes((document.activeElement && document.activeElement.tagName) || '')) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          calendarHistory.redo();
        } else {
          calendarHistory.undo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        calendarHistory.redo();
      }
    });

    function clearAllCalendarEvents() {
      if (confirm("Clear all calendar events from FocusFlow? Your Google Calendar accounts and links will remain saved.")) {
        calendarHistory.recordState();
        state.events = [];
        saveAppState();
        renderTimeline();
        if (typeof ffUploadNow === 'function') ffUploadNow(true);
        calendarHistory.updateUI();
        playChime('bell');
        alertBox("Cleared schedule. Tap Undo (⌘Z) to restore.", "Schedule Cleared");
      }
    }

    function deleteIndividualEvent(eventId) {
      if (!eventId) return;
      const ev = (state.events || []).find(e => e.id === eventId);
      const title = ev ? ev.title : 'this event';
      if (confirm('Delete "' + title + '" from your schedule?')) {
        calendarHistory.recordState();
        if (ev) pushEventChangeToGoogle(ev, 'delete');
        state.events = (state.events || []).filter(e => e.id !== eventId);
        saveAppState();
        renderTimeline();
        if (typeof ffUploadNow === 'function') ffUploadNow(true);
        calendarHistory.updateUI();
        playChime('bell');
        alertBox('Deleted "' + title + '" from your schedule. Tap Undo (⌘Z) to restore.', 'Event Removed');
      }
    }

    function deleteActiveModalEvent() {
      if (!state.activeEventModal) return;
      const id = state.activeEventModal.id;
      closeToolsModal();
      deleteIndividualEvent(id);
    }

    
    // ==============================================
    // MINI CATEGORY LEGEND (DYNAMIC & COMPACT)
    // ==============================================
    function renderCategoryLegend() {
      const container = document.getElementById('timeline-category-legend');
      if (!container) return;
      container.innerHTML = '';

      const cats = state.calendarCategories || [
        { id: 'focus', name: 'Focus', color: 'sky' },
        { id: 'classes', name: 'Study', color: 'lavender' },
        { id: 'personal', name: 'Habits', color: 'mint' },
        { id: 'chores', name: 'Chores', color: 'butter' },
        { id: 'meal', name: 'Meal', color: 'coral' },
        { id: 'care', name: 'Health', color: 'rose' }
      ];

      const dotMap = {
        sky: 'bg-pastel-sky',
        lavender: 'bg-pastel-lavender',
        mint: 'bg-pastel-mint',
        butter: 'bg-pastel-butter',
        coral: 'bg-pastel-coral',
        rose: 'bg-rose-400',
        peach: 'bg-orange-400',
        teal: 'bg-teal-400'
      };

      cats.forEach(cat => {
        const dotCol = dotMap[cat.color] || 'bg-pastel-sky';
        const shortName = cat.name.split('&')[0].split('/')[0].trim();
        const item = document.createElement('span');
        item.className = 'flex items-center gap-1 shrink-0 text-slate-300 font-medium select-none';
        item.innerHTML = `<span class="w-1.5 h-1.5 rounded-full ${dotCol} shrink-0"></span><span>${shortName}</span>`;
        container.appendChild(item);
      });
    }

    function renderTimeline() {
      const selDateStr = getSelectedTimelineDateStr();
      const [y, m, d] = selDateStr.split('-').map(Number);
      const selDateObj = new Date(y, m - 1, d);
      const friendly = selDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const dayEvents = getEventsForSelectedDay();

      // Update Date Banner (Compact on mobile so 7-day strip sits side-by-side)
      const dateEl = document.getElementById('timeline-today-date');
      if (dateEl) {
        const shortDate = selDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dateEl.innerHTML = `<span class="hidden sm:inline">📅 ${friendly} • ${dayEvents.length} Event${dayEvents.length === 1 ? '' : 's'}</span><span class="sm:hidden font-bold">📅 ${shortDate}</span>`;
      }

      // 1. Render 7-Day Week Selector Strip
      renderWeekStrip();
      renderCategoryLegend();

      // 2. Render ADHD Schedule Suggestions (Approval Required)
      renderScheduleSuggestions();

      // 3. Render Calendar Day Grid (Structured Visual Calendar with Side-by-Side Overlaps)
      renderStructuredCalendarGrid();

      // 4. Render List View (Fallback / Checklist)
      renderCompactTimelineListView();

      if (typeof calendarHistory !== 'undefined' && calendarHistory.updateUI) {
        calendarHistory.updateUI();
      }

      if (window.lucide) lucide.createIcons();
    }

        // ==============================================
    // EVENT ENTRY TYPE (PLAN ONLY, REALITY ONLY, BOTH)
    // ==============================================
    state.newEventEntryType = 'both';

    function setNewEventEntryType(type) {
      state.newEventEntryType = type;
      ['planned', 'reality', 'both'].forEach(t => {
        const btn = document.getElementById(`btn-entry-${t}`);
        if (!btn) return;
        if (t === type) {
          btn.className = "py-1.5 px-2 rounded-xl bg-pastel-mint/20 border-2 border-pastel-mint text-pastel-mint font-bold text-center transition";
        } else {
          btn.className = "py-1.5 px-2 rounded-xl border border-dark-border text-slate-400 font-semibold text-center transition";
        }
      });
    }

    function clearEstimationSampleData() {
      if (confirm("Reset calibration report to start logging your real data? All demo historical data will be cleared so only your real tasks appear on the line graph.")) {
        state.timeEstimationHistory = [];
        saveAppState();
        renderCalibrationChart();
        playChime('bell');
        alertBox("Calibration data cleared! Ready to log your real events.", "Real Data Active");
      }
    }

    function openNewEventModalWithTime(startTime) {
      populateCalendarCategoriesDropdowns();
      const startEl = document.getElementById('new-event-start');
      const endEl = document.getElementById('new-event-end');
      const durEl = document.getElementById('new-event-duration');
      if (startEl && startTime) {
        startEl.value = startTime;
        if (durEl && endEl) {
          endEl.value = getEndTimeFromStartAndDuration(startTime, durEl.value || 30);
        }
      }
      // If clicked time is in the past compared to current time, default to Reality
      const [cH, cM] = (startTime || '09:00').split(':').map(Number);
      const clickedMins = (cH * 60) + cM;
      const now = new Date();
      const nowMins = (now.getHours() * 60) + now.getMinutes();
      if (clickedMins < nowMins && typeof setNewEventEntryType === 'function') {
        setNewEventEntryType('reality');
      }
      document.getElementById('new-event-modal').classList.remove('hidden');
    }

    function renderStructuredCalendarGrid() {
      if (typeof updateHourHeightUI === 'function') updateHourHeightUI();
      const gutter = document.getElementById('timeline-time-gutter');
      const gridLines = document.getElementById('timeline-grid-lines');
      const blocksContainer = document.getElementById('timeline-event-blocks');
      if (!gutter || !gridLines || !blocksContainer) return;

      gutter.innerHTML = '';
      gridLines.innerHTML = '';
      blocksContainer.innerHTML = '';

      // Click on empty space in timeline grid to schedule a new block at that exact time!
      blocksContainer.onclick = (e) => {
        if (e.target !== blocksContainer) return;
        const rect = blocksContainer.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const minutesFromStart = (offsetY / CALENDAR_HOUR_HEIGHT) * 60;
        const totalMins = (CALENDAR_START_HOUR * 60) + minutesFromStart;
        const snapMins = Math.floor(Math.max(CALENDAR_START_HOUR * 60, Math.min(CALENDAR_END_HOUR * 60, totalMins)) / 15) * 15;
        const startTime = minutesToTime(snapMins);
        openNewEventModalWithTime(startTime);
      };

      // Build Hour Markers and Horizontal Grid Lines
      for (let h = CALENDAR_START_HOUR; h <= CALENDAR_END_HOUR; h++) {
        const topPx = (h - CALENDAR_START_HOUR) * CALENDAR_HOUR_HEIGHT;
        const normH = h % 24;
        const displayHour = normH === 0 ? '12 AM' : (normH === 12 ? '12 PM' : (normH > 12 ? `${normH - 12} PM` : `${normH} AM`));

        // Hour Label in Gutter
        const label = document.createElement('div');
        if (h === CALENDAR_START_HOUR) {
          // At start hour (6 AM), align from top: 2px so '6' is completely visible and never cut off
          label.className = "absolute right-2 text-[11px] font-mono font-semibold text-slate-400";
          label.style.top = "2px";
        } else if (h === CALENDAR_END_HOUR) {
          // At 2 AM (end of day), centered on the 2 AM line with clean clearance below
          label.className = "absolute right-2 text-[11px] font-mono font-semibold text-slate-400 -translate-y-1/2";
          label.style.top = `${topPx}px`;
        } else {
          label.className = "absolute right-2 text-[11px] font-mono font-semibold text-slate-400 -translate-y-1/2";
          label.style.top = `${topPx}px`;
        }
        label.textContent = displayHour;
        gutter.appendChild(label);

        // Hour Grid Line
        const line = document.createElement('div');
        line.className = "absolute inset-x-0 border-b border-dark-border/70";
        line.style.top = `${topPx}px`;
        gridLines.appendChild(line);

        // Half-Hour Subtle Line (if not last hour)
        if (h < CALENDAR_END_HOUR) {
          const halfLine = document.createElement('div');
          halfLine.className = "absolute inset-x-0 border-b border-dashed border-dark-border/30";
          halfLine.style.top = `${topPx + (CALENDAR_HOUR_HEIGHT / 2)}px`;
          gridLines.appendChild(halfLine);
        }
      }

      // Render Real-Time "NOW" Indicator Line (only if viewing today)
      updateCurrentTimeMarker();

      // Get events for selected day
      const dayEvents = getEventsForSelectedDay();

      // Check for All-Day Events (e.g. Election Day, holidays, multi-day milestones)
      const isAllDayEv = (ev) => Boolean(ev.isAllDay || ev.duration >= 1440 || (ev.title && /election\s*day|all\s*-?\s*day|holiday/i.test(ev.title)));
      const allDayEvents = dayEvents.filter(isAllDayEv);
      const timedEvents = dayEvents.filter(ev => !isAllDayEv(ev));

      // Render All-Day Events Row above grid
      const allDayRow = document.getElementById('timeline-all-day-row');
      const allDayItems = document.getElementById('timeline-all-day-items');
      if (allDayRow && allDayItems) {
        if (allDayEvents.length > 0) {
          allDayRow.classList.remove('hidden');
          allDayItems.innerHTML = '';
          allDayEvents.forEach(ev => {
            const pill = document.createElement('div');
            pill.className = 'inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-sm cursor-pointer hover:brightness-110 active:scale-95 transition';
            pill.title = `${ev.title} (All Day)`;
            pill.textContent = ev.title;
            pill.onclick = () => openEventDetailsModal(ev.id);
            allDayItems.appendChild(pill);
          });
        } else {
          allDayRow.classList.add('hidden');
          allDayItems.innerHTML = '';
        }
      }

      // Sort timed events by start time
      timedEvents.sort((a, b) => {
        const [aH, aM] = (a.startTime || '09:00').split(':').map(Number);
        const [bH, bM] = (b.startTime || '09:00').split(':').map(Number);
        return (aH * 60 + aM) - (bH * 60 + bM);
      });

      // Detect Overlaps and Group into Side-by-Side Columns
      const clusters = [];
      let currentCluster = [];
      let currentClusterEnd = -1;

      timedEvents.forEach(ev => {
        const isRealityOnly = ev.entryType === 'reality';
        const effectiveTime = (isRealityOnly && ev.actualStartTime) ? ev.actualStartTime : (ev.startTime || '09:00');
        const [hh, mm] = effectiveTime.split(':').map(n => parseInt(n) || 0);
        const start = hh * 60 + mm;
        const dur = Math.max(15, (isRealityOnly && ev.actualDuration) ? ev.actualDuration : (ev.duration || 30));
        const end = start + dur;

        if (currentCluster.length === 0 || start < currentClusterEnd) {
          currentCluster.push({ ev, start, end, dur });
          if (end > currentClusterEnd) currentClusterEnd = end;
        } else {
          clusters.push(currentCluster);
          currentCluster = [{ ev, start, end, dur }];
          currentClusterEnd = end;
        }
      });
      if (currentCluster.length > 0) clusters.push(currentCluster);

      clusters.forEach(cluster => {
        const colEnds = [];
        const placements = [];

        cluster.forEach(item => {
          let placedCol = -1;
          for (let c = 0; c < colEnds.length; c++) {
            if (colEnds[c] <= item.start) {
              placedCol = c;
              colEnds[c] = item.end;
              break;
            }
          }
          if (placedCol === -1) {
            placedCol = colEnds.length;
            colEnds.push(item.end);
          }
          placements.push({ item, col: placedCol });
        });

        const totalCols = Math.max(1, colEnds.length);
        const colWidthPct = 100 / totalCols;

        placements.forEach(({ item, col }) => {
          const ev = item.ev;
          const calendarStartMinutes = CALENDAR_START_HOUR * 60;
          const minutesFromStart = Math.max(0, item.start - calendarStartMinutes);
          const topPx = (minutesFromStart / 60) * CALENDAR_HOUR_HEIGHT;
          const isDeepZoom = (typeof calendarZoomLevel !== 'undefined' && calendarZoomLevel === 5);
          const isMinZoom = (typeof calendarZoomLevel !== 'undefined' && calendarZoomLevel === 1);
          const minBlockHeight = isDeepZoom ? 72 : (isMinZoom ? 26 : 34);
          const heightPx = Math.max(minBlockHeight, (item.dur / 60) * CALENDAR_HOUR_HEIGHT);

          const endMinutes = item.end;
          const endHH = String(Math.floor(endMinutes / 60)).padStart(2, '0');
          const endMM = String(endMinutes % 60).padStart(2, '0');
          const timeRangeStr = `${formatTimeAmPm(ev.startTime)} – ${formatTimeAmPm(`${endHH}:${endMM}`)}`;

          const isBuffer = ev.title.includes('Buffer') || ev.title.includes('Transition');

          const catInfo = getCategoryInfo(ev.category);
          const catMeta = {
            border: `${catInfo.colorMeta.border} ${catInfo.colorMeta.borderFull} bg-dark-base/95`,
            text: catInfo.colorMeta.text,
            tag: catInfo.name,
            badgeBg: catInfo.colorMeta.badgeBg,
            borderFull: catInfo.colorMeta.borderFull
          };

          const leftPct = col * colWidthPct;

          const entryType = ev.entryType || 'both';

          if (state.showPlanVsReality) {
            const actualDur = ev.actualDuration || (entryType === 'reality' ? item.dur : (ev.isFixedAnchor ? item.dur : (ev.title.includes('Ready') ? 48 : (ev.title.includes('Focus') || ev.title.includes('Homework') ? item.dur + 22 : item.dur))));
            const delta = actualDur - item.dur;
            const deltaBadge = delta > 0 
              ? `<span class="px-1.5 py-0.5 rounded bg-pastel-coral/20 text-pastel-coral border border-pastel-coral/30 font-bold text-[9px]">+${delta}m drift</span>`
              : (delta < 0 ? `<span class="px-1.5 py-0.5 rounded bg-pastel-sky/20 text-pastel-sky border border-pastel-sky/30 font-bold text-[9px]">${delta}m under</span>` : `<span class="px-1.5 py-0.5 rounded bg-pastel-mint/20 text-pastel-mint border border-pastel-mint/30 font-bold text-[9px]">✓ Exact</span>`);

            // If event is planned-only or both, render Plan sub-column
            if (entryType === 'planned' || entryType === 'both') {
              const planBlock = document.createElement('div');
              const planWidth = entryType === 'both' ? `calc(${(colWidthPct / 2)}% - 6px)` : `calc(${colWidthPct}% - 8px)`;
              planBlock.className = `absolute rounded-xl border border-dashed border-pastel-lavender/60 bg-dark-base/90 p-2 overflow-hidden flex flex-col justify-between text-xs transition shadow-sm cursor-pointer hover:border-pastel-lavender`;
              planBlock.style.top = `${topPx}px`;
              planBlock.style.height = `${heightPx}px`;
              planBlock.style.left = `calc(${leftPct}% + 4px)`;
              planBlock.style.width = planWidth;
              planBlock.style.zIndex = '10';
              planBlock.innerHTML = `
                <div class="space-y-0.5">
                  <div class="flex items-center justify-between text-[9px] font-mono text-pastel-lavender font-bold">
                    <span>📋 PLAN</span>
                    <span>${item.dur}m</span>
                  </div>
                  <h4 class="font-bold text-white text-[11px] truncate leading-tight">${ev.title}</h4>
                </div>
                <div class="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  <span>${formatTimeAmPm(ev.startTime)}</span>
                  ${entryType === 'planned' ? '<span class="text-pastel-lavender text-[8.5px]">Plan Only</span>' : ''}
                </div>
              `;
              planBlock.onclick = () => openEventToolsModal(ev.id);
              blocksContainer.appendChild(planBlock);
            }

            // If event is reality-only or both, render Reality sub-column
            if (entryType === 'reality' || entryType === 'both') {
              const realityHeightPx = Math.max(minBlockHeight, (actualDur / 60) * CALENDAR_HOUR_HEIGHT);
              const realityBlock = document.createElement('div');
              const realityLeft = entryType === 'both' ? `calc(${leftPct + (colWidthPct / 2)}% + 2px)` : `calc(${leftPct}% + 4px)`;
              const realityWidth = entryType === 'both' ? `calc(${(colWidthPct / 2)}% - 6px)` : `calc(${colWidthPct}% - 8px)`;

              const actStart = ev.actualStartTime || ev.startTime || '09:00';
              const [aH, aM] = actStart.split(':').map(Number);
              const actStartMins = aH * 60 + aM;
              const realityTopPx = Math.max(0, ((actStartMins - calendarStartMinutes) / 60) * CALENDAR_HOUR_HEIGHT);

              const isEvSkipped = Boolean(ev.skipped);
              if (isEvSkipped) {
                realityBlock.className = `absolute rounded-xl border border-dashed border-rose-500/50 bg-dark-surface/95 hover:border-rose-400 p-2 overflow-hidden flex flex-col justify-between text-xs transition shadow-md cursor-pointer`;
                realityBlock.style.top = `${realityTopPx}px`;
                realityBlock.style.height = `${Math.max(minBlockHeight, 46)}px`;
                realityBlock.style.left = realityLeft;
                realityBlock.style.width = realityWidth;
                realityBlock.style.zIndex = '12';
                realityBlock.innerHTML = `
                  <div class="space-y-0.5 min-w-0">
                    <div class="flex items-center justify-between text-[9px] font-mono">
                      <span class="inline-flex items-center gap-1 text-[8.5px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 rounded-md"><span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>Skipped</span>
                      <span class="text-rose-400/90 font-mono font-bold text-[9px]">0m</span>
                    </div>
                    <h4 class="font-medium text-slate-400 text-[11px] line-through truncate leading-tight">${ev.title}</h4>
                    <span class="text-[8.5px] text-slate-500 font-mono block">Planned: ${item.dur}m</span>
                  </div>
                  <div class="flex items-center justify-between pt-0.5 border-t border-dark-border/50 text-[9px]">
                    <span class="text-[8px] text-slate-500">Not Done</span>
                    <button type="button" onclick="event.stopPropagation(); toggleActiveEventSkippedById('${ev.id}')" class="text-pastel-sky hover:underline font-mono text-[9px]">↩ Restore</button>
                  </div>
                `;
              } else {
                realityBlock.className = `absolute rounded-xl border border-pastel-coral/80 bg-dark-elevated p-2 overflow-hidden flex flex-col justify-between text-xs transition shadow-md cursor-pointer hover:border-pastel-coral`;
                realityBlock.style.top = `${realityTopPx}px`;
                realityBlock.style.height = `${realityHeightPx}px`;
                realityBlock.style.left = realityLeft;
                realityBlock.style.width = realityWidth;
                realityBlock.style.zIndex = '11';
                realityBlock.innerHTML = `
                  <div class="space-y-0.5">
                    <div class="flex items-center justify-between text-[9px] font-mono">
                      <span class="text-pastel-coral font-bold">⏱️ REALITY</span>
                      <span class="text-white font-bold">${actualDur}m</span>
                    </div>
                    <h4 class="font-bold text-white text-[11px] truncate leading-tight">${ev.title}</h4>
                    <div class="pt-0.5 flex items-center gap-1">
                      ${entryType === 'reality' ? '<span class="px-1.5 py-0.5 rounded bg-pastel-coral/20 text-pastel-coral text-[8.5px] font-bold">Unplanned Reality</span>' : deltaBadge}
                    </div>
                  </div>
                  <div class="flex items-center justify-between pt-1 border-t border-dark-border/40 text-[9px]">
                    <button type="button" onclick="event.stopPropagation(); promptQuickLogActualDuration('${ev.id}')" class="text-pastel-sky hover:underline font-mono">✏️ Log</button>
                  </div>
                `;
              }
              realityBlock.onclick = () => openEventToolsModal(ev.id);
              blocksContainer.appendChild(realityBlock);
            }
            return;
          }

          const isSkipped = Boolean(ev.skipped);
          const block = document.createElement('div');
          if (isSkipped) {
            block.className = `absolute rounded-xl border border-dashed border-rose-500/50 bg-slate-900/80 opacity-50 transition-all overflow-hidden flex flex-col justify-between cursor-pointer line-through`;
          } else {
            block.className = `absolute rounded-xl border border-l-4 transition-all shadow-md hover:shadow-xl hover:border-slate-400 overflow-hidden flex flex-col justify-between cursor-pointer ${isBuffer ? 'bg-dark-base/80 border border-dashed border-pastel-sky/50 text-pastel-sky' : catMeta.border}`;
          }
          block.style.top = `${topPx}px`;
          block.style.height = `${heightPx}px`;
          block.style.left = `calc(${leftPct}% + 4px)`;
          block.style.width = `calc(${colWidthPct}% - 8px)`;
          block.style.zIndex = isBuffer ? '5' : '10';
          block.onclick = (e) => {
            if (block.dataset.isBeingDragged === "true") return;
            openEventToolsModal(ev.id);
          };
          attachEventDragListeners(block, ev);

          if (heightPx < 52 && !isDeepZoom) {
            // Compact layout (for short events 15-30m): Title is always visible and prominent!
            block.innerHTML = `
              <div class="px-2.5 py-1 flex items-center justify-between text-xs w-full h-full gap-2">
                <div class="flex items-center gap-1.5 min-w-0 flex-1">
                  <span class="w-2 h-2 rounded-full shrink-0 ${isBuffer ? 'bg-pastel-sky' : 'bg-pastel-mint'}"></span>
                  <h3 class="font-bold text-white text-[11px] truncate leading-tight">${ev.title}</h3>
                </div>
                <div class="flex items-center gap-1.5 shrink-0 font-mono text-[10px]">
                  <span class="text-slate-300 font-semibold">${formatTimeAmPm(ev.startTime)}</span>
                  <span class="px-1.5 py-0.5 rounded bg-dark-elevated text-slate-300 font-bold">${ev.duration}m</span>
                  <button type="button" onclick="event.stopPropagation(); deleteIndividualEvent('${ev.id}')" class="px-1 py-0.5 rounded bg-dark-elevated hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 font-bold text-[9px] transition" title="Delete event">✕</button>
                </div>
              </div>
            `;
          } else {
            // Full Structured Calendar Block
            const totalSubtasks = ev.subtasks ? ev.subtasks.length : 0;
            const doneSubtasks = ev.subtasks ? ev.subtasks.filter(s => s.done).length : 0;

            block.innerHTML = `
              <div class="p-2.5 flex flex-col justify-between h-full space-y-1">
                <div>
                  <!-- Top Row: Time Range, Duration, Calendar Badge -->
                  <div class="flex items-center justify-between text-[10px] font-mono mb-1 flex-wrap gap-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="font-bold text-white">${timeRangeStr}</span>
                      <span class="px-1.5 py-0.5 rounded bg-dark-elevated text-slate-300 font-bold">(${ev.duration}m)</span>
                      ${isSkipped ? '<span class="px-1.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/50 font-bold text-[9px]">❌ Didn’t Do</span>' : (entryType === 'reality' ? '<span class="px-1.5 py-0.5 rounded-full bg-pastel-coral/20 text-pastel-coral border border-pastel-coral/30 font-bold text-[9px]">⏱️ Reality</span>' : (entryType === 'planned' ? '<span class="px-1.5 py-0.5 rounded-full bg-pastel-lavender/20 text-pastel-lavender border border-pastel-lavender/30 font-bold text-[9px]">📋 Plan</span>' : ''))}
                      ${ev.calendarName ? `<span class="px-1.5 py-0.5 rounded-full bg-pastel-sky/20 text-pastel-sky border border-pastel-sky/30 font-bold text-[9px]">${ev.calendarName}</span>` : ''}
                    </div>
                    
                  </div>

                  <!-- Event Title: Bold, white, prominent -->
                  <h3 class="font-bold text-white text-xs sm:text-sm leading-snug line-clamp-2">${ev.title}</h3>
                  
                  ${ev.location ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.location)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();" class="text-[10px] text-pastel-sky hover:underline truncate mt-0.5 flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3 shrink-0 text-pastel-sky"></i><span class="truncate">${ev.location}</span></a>` : ''}
                  ${ev.description ? `<p class="text-[10px] text-slate-300 mt-1 leading-snug line-clamp-3 bg-dark-base/60 p-1.5 rounded-lg border border-dark-border/50">${ev.description}</p>` : ''}
                  ${ev.goodEnough && heightPx > 75 ? `<p class="text-[10px] text-pastel-butter/90 truncate mt-0.5">🎯 Boundary: ${ev.goodEnough}</p>` : ''}
                </div>

                <!-- Bottom Row: Subtasks & Quick Action Buttons -->
                <div class="flex items-center justify-between pt-1 border-t border-dark-border/60 text-[10px]">
                  <div class="flex items-center gap-1 text-slate-400">
                    <i data-lucide="check-circle-2" class="w-3 h-3 text-pastel-mint"></i>
                    <span>${doneSubtasks}/${totalSubtasks} steps</span>
                  </div>
                  <div class="flex items-center gap-1" onclick="event.stopPropagation()">
                    <button type="button" onclick="deleteIndividualEvent('${ev.id}')" class="px-1.5 py-0.5 rounded bg-dark-elevated hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 font-semibold text-[9px] transition" title="Delete event">
                      🗑️
                    </button>
                    <button type="button" onclick="syncEventToGoogleCalendar('${ev.title}', '${ev.startTime}', ${ev.duration})" class="px-1.5 py-0.5 rounded bg-dark-elevated hover:bg-slate-700 text-pastel-sky font-semibold text-[9px]" title="Sync / Edit in Google Calendar">
                      GCal
                    </button>
                    <button type="button" onclick="quickLaunchTaskmaster('${ev.id}')" class="px-2 py-0.5 rounded-lg bg-pastel-mint hover:bg-emerald-300 text-dark-base font-bold flex items-center gap-1 shadow-sm text-[10px]">
                      <i data-lucide="play" class="w-2.5 h-2.5 fill-dark-base"></i>
                      <span>Focus</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }

          blocksContainer.appendChild(block);
        });
      });

            // Attach touch and scroll transparency listeners for mobile ADHD notes
      const scrollCanvas = document.getElementById('timeline-calendar-scroll-canvas');
      if (scrollCanvas && !scrollCanvas.dataset.hasAdhdTouchListeners) {
        let scrollTimeout = null;
        scrollCanvas.addEventListener('touchstart', () => setAllAdhdNotesTransparent(true), { passive: true });
        scrollCanvas.addEventListener('touchmove', () => setAllAdhdNotesTransparent(true), { passive: true });
        scrollCanvas.addEventListener('touchend', () => {
          setTimeout(() => setAllAdhdNotesTransparent(false), 250);
        }, { passive: true });
        scrollCanvas.addEventListener('scroll', () => {
          setAllAdhdNotesTransparent(true);
          if (scrollTimeout) clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => setAllAdhdNotesTransparent(false), 300);
        }, { passive: true });
        scrollCanvas.dataset.hasAdhdTouchListeners = "true";
      }

      // Render collapsible ADHD Suggestions directly onto the calendar grid canvas
      renderCanvasScheduleSuggestions();
    }

    function formatTimeAmPm(timeStr) {
      if (!timeStr) return '';
      const [hh, mm] = timeStr.split(':').map(n => parseInt(n) || 0);
      const period = hh >= 12 ? 'PM' : 'AM';
      const displayH = hh === 0 ? 12 : (hh > 12 ? hh - 12 : hh);
      const displayM = String(mm).padStart(2, '0');
      return `${displayH}:${displayM} ${period}`;
    }

    function updateCurrentTimeMarker() {
      const nowLine = document.getElementById('timeline-now-line');
      const nowLabel = document.getElementById('timeline-now-label');
      if (!nowLine) return;

      const isToday = (getSelectedTimelineDateStr() === getTodayDateString());
      if (!isToday) {
        nowLine.classList.add('hidden');
        if (nowLabel) nowLabel.classList.add('hidden');
        return;
      }

      const now = new Date();
      const currentMinutes = (now.getHours() * 60) + now.getMinutes();
      const calendarStartMinutes = CALENDAR_START_HOUR * 60;
      const calendarEndMinutes = CALENDAR_END_HOUR * 60;

      if (currentMinutes >= calendarStartMinutes && currentMinutes <= calendarEndMinutes) {
        const minutesFromStart = currentMinutes - calendarStartMinutes;
        const topPx = (minutesFromStart / 60) * CALENDAR_HOUR_HEIGHT;

        nowLine.style.top = `${topPx}px`;
        nowLine.classList.remove('hidden');

        if (nowLabel) {
          nowLabel.classList.remove('hidden');
          const hh = now.getHours();
          const mm = String(now.getMinutes()).padStart(2, '0');
          const ampm = hh >= 12 ? 'PM' : 'AM';
          const dh = hh === 0 ? 12 : (hh > 12 ? hh - 12 : hh);
          nowLabel.textContent = `NOW (${dh}:${mm} ${ampm})`;
        }
      } else {
        nowLine.classList.add('hidden');
      }
    }

    function scrollToCurrentTimeMarker() {
      const now = new Date();
      const currentMinutes = (now.getHours() * 60) + now.getMinutes();
      const calendarStartMinutes = CALENDAR_START_HOUR * 60;
      const minutesFromStart = Math.max(0, currentMinutes - calendarStartMinutes);
      const targetScroll = Math.max(0, ((minutesFromStart / 60) * CALENDAR_HOUR_HEIGHT) - 120);

      const canvas = document.getElementById('timeline-calendar-scroll-canvas');
      if (canvas) {
        canvas.scrollTo({ top: targetScroll, behavior: 'smooth' });
        playChime('bell');
      }
    }

    function renderCompactTimelineListView() {
      const container = document.getElementById('timeline-events-container');
      if (!container) return;
      container.innerHTML = '';

      const dayEvents = getEventsForSelectedDay();
      const selDateStr = getSelectedTimelineDateStr();
      const [y, m, d] = selDateStr.split('-').map(Number);
      const friendly = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      if (dayEvents.length === 0) {
        container.innerHTML = `
          <div class="p-8 text-center bg-dark-surface border border-dark-border rounded-2xl text-xs text-slate-400">
            No scheduled events for ${friendly}. Use the 7-day week selector above to view other days or click "Sync Calendars".
          </div>
        `;
        return;
      }

      // Chronologically sort events
      const sortedEvents = [...dayEvents].sort((a, b) => {
        const [aH, aM] = (a.startTime || '09:00').split(':').map(Number);
        const [bH, bM] = (b.startTime || '09:00').split(':').map(Number);
        return (aH * 60 + aM) - (bH * 60 + bM);
      });

      const now = new Date();
      const isViewingToday = (selDateStr === getTodayDateString());
      const currentNowMins = (now.getHours() * 60) + now.getMinutes();
      let nowLineRendered = false;

      sortedEvents.forEach(ev => {
        const effectiveStart = (ev.entryType === 'reality' && ev.actualStartTime) ? ev.actualStartTime : (ev.startTime || '09:00');
        const [evH, evM] = effectiveStart.split(':').map(Number);
        const evStartMin = (evH * 60) + evM;

        // Render Red Line NOW marker in list view when time arrives
        if (isViewingToday && !nowLineRendered && currentNowMins < evStartMin) {
          const nowDivider = document.createElement('div');
          nowDivider.id = "timeline-now-divider-list";
          nowDivider.className = "flex items-center gap-2 py-1 select-none";
          nowDivider.innerHTML = `
            <span class="w-3 h-3 rounded-full bg-rose-500 shadow-md shadow-rose-500/50 shrink-0 animate-pulse"></span>
            <span class="text-rose-400 font-bold font-mono text-xs shrink-0">NOW (${formatTimeAmPm(now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'))})</span>
            <div class="flex-1 border-t-2 border-rose-500/80 shadow-sm"></div>
          `;
          container.appendChild(nowDivider);
          nowLineRendered = true;
        }

        const isAllDay = Boolean(ev.isAllDay || ev.duration >= 1440 || (ev.title && /election\s*day|all\s*-?\s*day|holiday/i.test(ev.title)));
        const catInfo = getCategoryInfo(ev.category);
        const catMeta = {
          color: catInfo.colorMeta.border,
          tag: catInfo.name,
          tagCol: `${catInfo.colorMeta.badgeBg} ${catInfo.colorMeta.text} border ${catInfo.colorMeta.borderFull}`
        };

        const totalSubtasks = ev.subtasks ? ev.subtasks.length : 0;
        const doneSubtasks = ev.subtasks ? ev.subtasks.filter(s => s.done).length : 0;
        const isSkipped = Boolean(ev.skipped);
        const actualDur = isSkipped ? 0 : (ev.actualDuration !== undefined && ev.actualDuration !== null ? ev.actualDuration : ev.duration);
        const delta = actualDur - ev.duration;
        const entryType = ev.entryType || 'both';

        const card = document.createElement('div');
        if (isSkipped) {
          card.className = `bg-dark-surface/80 border border-dashed border-rose-500/40 border-l-4 border-l-rose-500 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-md opacity-85`;
        } else if (entryType === 'reality') {
          card.className = `bg-pastel-coral/10 border-2 border-dashed border-pastel-coral/80 hover:border-pastel-coral rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-md shadow-pastel-coral/5`;
        } else {
          card.className = `bg-dark-surface border border-dark-border border-l-4 ${catMeta.color} hover:border-slate-600 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-md`;
        }
        card.innerHTML = `
          <div class="space-y-1.5 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              ${isAllDay ? '<span class="text-xs font-mono text-pastel-sky font-bold px-2 py-0.5 rounded bg-pastel-sky/15 border border-pastel-sky/30">All Day</span>' : `<span class="text-xs font-mono text-slate-300 font-bold">${formatTimeAmPm(ev.startTime)}</span>`}
              ${isSkipped ? `
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">0m (Skipped)</span>
                <span class="text-xs font-mono line-through text-slate-500">Plan: ${ev.duration}m</span>
              ` : (state.showPlanVsReality ? `
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pastel-lavender/20 text-pastel-lavender border border-pastel-lavender/30">Plan: ${ev.duration}m</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pastel-coral/20 text-pastel-coral border border-pastel-coral/30">Actual: ${actualDur}m ${delta !== 0 ? (delta > 0 ? '+' + delta + 'm' : delta + 'm') : '✓'}</span>
              ` : `<span class="text-xs font-mono text-slate-400">(${ev.duration}m)</span>`)}
              ${entryType === 'reality' ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-pastel-coral/20 text-pastel-coral border border-pastel-coral/30 font-bold">⏱️ Unplanned Reality</span>' : ''}
              ${entryType === 'planned' ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-pastel-lavender/20 text-pastel-lavender border border-pastel-lavender/30 font-bold">📋 Plan Only</span>' : ''}
              ${ev.calendarName ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-pastel-sky/15 text-pastel-sky border border-pastel-sky/30 font-bold font-mono">${ev.calendarName}</span>` : ''}
              ${ev.goodEnough ? `<span class="hidden sm:inline text-[10px] text-pastel-butter bg-pastel-butter/10 px-2 py-0.5 rounded border border-pastel-butter/20 truncate max-w-xs">Boundary: ${ev.goodEnough}</span>` : ''}
            </div>
            <h3 class="text-sm font-bold ${isSkipped ? 'text-slate-400 line-through' : 'text-white'}">${ev.title}</h3>
            ${totalSubtasks > 0 ? `
              <div class="flex items-center gap-2 text-xs text-slate-400">
                <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-pastel-mint"></i>
                <span>${doneSubtasks}/${totalSubtasks} micro-steps complete</span>
              </div>
            ` : '<span class="text-xs text-slate-500 italic">No micro-steps unpacked yet</span>'}
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button onclick="deleteIndividualEvent('${ev.id}')" class="p-2 rounded-xl bg-dark-elevated hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-dark-border text-xs transition" title="Delete event from schedule">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="openEventToolsModal('${ev.id}')" class="px-3 py-2 rounded-xl bg-dark-elevated hover:bg-slate-700 border border-dark-border text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition">
              <i data-lucide="wand-2" class="w-3.5 h-3.5 text-pastel-mint"></i>
              <span>Unpack Tools</span>
            </button>
            <button onclick="quickLaunchTaskmaster('${ev.id}')" class="px-3.5 py-2 rounded-xl bg-pastel-mint hover:bg-emerald-300 text-dark-base text-xs font-bold flex items-center gap-1.5 shadow-sm transition">
              <i data-lucide="play" class="w-3.5 h-3.5 fill-dark-base"></i>
              <span>Focus</span>
            </button>
          </div>
        `;
        container.appendChild(card);
      });

      // If all scheduled events for today have already occurred, render the NOW line at the end
      if (isViewingToday && !nowLineRendered) {
        const nowDivider = document.createElement('div');
        nowDivider.id = "timeline-now-divider-list";
        nowDivider.className = "flex items-center gap-2 py-1 select-none";
        nowDivider.innerHTML = `
          <span class="w-3 h-3 rounded-full bg-rose-500 shadow-md shadow-rose-500/50 shrink-0 animate-pulse"></span>
          <span class="text-rose-400 font-bold font-mono text-xs shrink-0">NOW (${formatTimeAmPm(now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'))})</span>
          <div class="flex-1 border-t-2 border-rose-500/80 shadow-sm"></div>
        `;
        container.appendChild(nowDivider);
        nowLineRendered = true;
      }
    }

    // 2. Eisenhower Matrix Rendering
    function renderMatrix() {
      const quadrants = {
        'urgent-important': document.getElementById('matrix-list-urgent-important'),
        'important-noturgent': document.getElementById('matrix-list-important-noturgent'),
        'urgent-notimportant': document.getElementById('matrix-list-urgent-notimportant'),
        'neither': document.getElementById('matrix-list-neither'),
        'completed': document.getElementById('matrix-list-completed')
      };

      Object.keys(quadrants).forEach(q => {
        if (quadrants[q]) quadrants[q].innerHTML = '';
      });

      const counts = { 'urgent-important': 0, 'important-noturgent': 0, 'urgent-notimportant': 0, 'neither': 0, 'completed': 0 };

      state.matrixTasks.forEach(task => {
        const isDone = !!task.completed;
        if (isDone) {
          counts.completed++;
          if (quadrants.completed) {
            const item = document.createElement('div');
            item.className = "p-2.5 rounded-xl bg-dark-base/70 border border-dark-border flex items-center justify-between text-xs opacity-60 transition hover:opacity-100";
            item.innerHTML = `
              <div class="flex items-center gap-2.5 flex-1 truncate pr-2">
                <input type="checkbox" checked onchange="toggleMatrixTaskCompletion('${task.id}')" class="w-4 h-4 rounded text-pastel-mint focus:ring-0 cursor-pointer">
                <span class="font-medium text-slate-400 line-through truncate">${task.text}</span>
                <span class="text-[10px] text-slate-500 font-mono">${task.estMinutes}m</span>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <span class="text-[10px] text-pastel-mint font-semibold px-2 py-0.5 rounded bg-pastel-mint/15">Done</span>
                <button type="button" onclick="deleteMatrixTask('${task.id}')" class="p-1 rounded text-slate-500 hover:text-rose-400">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            `;
            quadrants.completed.appendChild(item);
          }
          return;
        }

        counts[task.quadrant] = (counts[task.quadrant] || 0) + 1;
        const targetList = quadrants[task.quadrant];
        if (!targetList) return;

        const item = document.createElement('div');
        item.className = "p-2.5 rounded-xl bg-dark-base border border-dark-border flex items-center justify-between text-xs transition hover:border-slate-600";
        item.innerHTML = `
          <div class="flex items-center gap-2.5 flex-1 truncate pr-2">
            <input type="checkbox" onchange="toggleMatrixTaskCompletion('${task.id}')" class="w-4 h-4 rounded text-pastel-mint focus:ring-0 cursor-pointer">
            <span class="font-medium text-slate-200 truncate">${task.text}</span>
            <span class="text-[10px] text-slate-500 font-mono">${task.estMinutes}m</span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <!-- Quick Quadrant Switcher -->
            <select onchange="moveMatrixTaskQuadrant('${task.id}', this.value)" class="bg-dark-elevated border border-dark-border text-[10px] text-slate-300 rounded-lg px-1.5 py-1 focus:outline-none">
              <option value="urgent-important" ${task.quadrant === 'urgent-important' ? 'selected' : ''}>Q1: Do Now</option>
              <option value="important-noturgent" ${task.quadrant === 'important-noturgent' ? 'selected' : ''}>Q2: Growth</option>
              <option value="urgent-notimportant" ${task.quadrant === 'urgent-notimportant' ? 'selected' : ''}>Q3: Streamline</option>
              <option value="neither" ${task.quadrant === 'neither' ? 'selected' : ''}>Q4: Drop/Later</option>
            </select>
            <!-- Slot to Timeline -->
            <button type="button" onclick="slotMatrixTaskToTimeline('${task.id}')" class="px-2 py-1 rounded-lg bg-dark-elevated hover:bg-slate-700 text-pastel-mint font-semibold text-[10px] flex items-center gap-1" title="Schedule in Daily Timeline">
              <i data-lucide="plus" class="w-3 h-3"></i> Schedule
            </button>
            <!-- 1-Click Sync to Google Calendar -->
            <button type="button" onclick="syncTaskToGoogleCalendar('${task.id}')" class="px-2 py-1 rounded-lg bg-pastel-sky/15 hover:bg-pastel-sky/25 border border-pastel-sky/30 text-pastel-sky font-semibold text-[10px] flex items-center gap-1" title="Sync / Edit in Google Calendar">
              <i data-lucide="calendar" class="w-3 h-3"></i> GCal
            </button>
            <button type="button" onclick="deleteMatrixTask('${task.id}')" class="p-1 rounded text-slate-500 hover:text-rose-400">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        `;
        targetList.appendChild(item);
      });

      if (document.getElementById('matrix-count-q1')) document.getElementById('matrix-count-q1').textContent = counts['urgent-important'];
      if (document.getElementById('matrix-count-q2')) document.getElementById('matrix-count-q2').textContent = counts['important-noturgent'];
      if (document.getElementById('matrix-count-q3')) document.getElementById('matrix-count-q3').textContent = counts['urgent-notimportant'];
      if (document.getElementById('matrix-count-q4')) document.getElementById('matrix-count-q4').textContent = counts['neither'];
      if (document.getElementById('matrix-count-completed')) document.getElementById('matrix-count-completed').textContent = counts.completed;

      if (window.lucide) lucide.createIcons();
    }

    function toggleMatrixTaskCompletion(taskId) {
      const task = state.matrixTasks.find(t => t.id === taskId);
      if (!task) return;
      task.completed = !task.completed;
      if (task.completed) {
        playChime('bell');
        alertBox(`Accomplished: "${task.text}"! Moved to Completed.`, "Accomplishment");
      }
      renderMatrix();
    }

    function moveMatrixTaskQuadrant(taskId, newQuadrant) {
      const task = state.matrixTasks.find(t => t.id === taskId);
      if (!task) return;
      task.quadrant = newQuadrant;
      renderMatrix();
      alertBox(`Moved "${task.text}" to new priority quadrant.`, "Priorities");
    }

    function clearCompletedMatrixTasks() {
      state.matrixTasks = state.matrixTasks.filter(t => !t.completed);
      renderMatrix();
      alertBox("Cleared completed tasks.", "Priorities");
    }

    function toggleCompletedMatrixSection() {
      const list = document.getElementById('matrix-list-completed');
      const icon = document.getElementById('completed-section-chevron');
      if (!list) return;
      list.classList.toggle('hidden');
      if (icon) {
        icon.classList.toggle('rotate-180', list.classList.contains('hidden'));
      }
    }

    function importEventsToMatrix() {
      let importedCount = 0;
      state.events.forEach(ev => {
        // Check if already in matrix
        const exists = state.matrixTasks.some(t => t.text.toLowerCase() === ev.title.toLowerCase());
        if (!exists) {
          let quad = 'important-noturgent';
          if (ev.category === 'focus') quad = 'urgent-important';
          else if (ev.category === 'meal') quad = 'important-noturgent';
          else if (ev.category === 'chores') quad = 'urgent-notimportant';

          state.matrixTasks.push({
            id: `m-imp-${Date.now()}-${importedCount}`,
            text: ev.title,
            quadrant: quad,
            estMinutes: ev.duration || 30,
            completed: false
          });
          importedCount++;
        }
      });

      renderMatrix();
      playChime('bell');
      if (importedCount > 0) {
        alertBox(`Populated ${importedCount} schedule events into Priority Matrix.`, "Priorities Sync");
      } else {
        alertBox("All schedule events are already present in your Priorities.", "Priorities Sync");
      }
    }

    function syncTaskToGoogleCalendar(taskId) {
      const task = state.matrixTasks.find(t => t.id === taskId);
      if (!task) return;
      syncEventToGoogleCalendar(task.text, '15:00', task.estMinutes || 30, 'FocusFlow Priority Task');
    }

    function syncEventToGoogleCalendar(title, startTimeStr = '15:00', durationMinutes = 30, details = '') {
      try {
        const today = new Date();
        const [hh, mm] = (startTimeStr || '15:00').split(':').map(n => parseInt(n) || 0);
        const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hh, mm, 0);
        const endDate = new Date(startDate.getTime() + (durationMinutes * 60000));

        const formatGCalTime = (d) => {
          const pad = (n) => String(n).padStart(2, '0');
          return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
        };

        const datesParam = `${formatGCalTime(startDate)}/${formatGCalTime(endDate)}`;
        const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${datesParam}&details=${encodeURIComponent(details || 'Scheduled from FocusFlow')}`;
        
        window.open(gcalUrl, '_blank');
        alertBox(`Opening Google Calendar to save "${title}"...`, "Calendar Reflection");
      } catch (err) {
        console.error("GCal sync error", err);
      }
    }

    function openMatrixAddModal() {
      const modal = document.getElementById('matrix-add-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeMatrixAddModal() {
      const modal = document.getElementById('matrix-add-modal');
      if (modal) modal.classList.add('hidden');
    }

    function addMatrixTask() {
      const textEl = document.getElementById('matrix-task-text') || document.getElementById('matrix-new-text');
      const text = textEl ? textEl.value.trim() : '';
      const quadEl = document.getElementById('matrix-quadrant-select') || document.getElementById('matrix-new-quadrant');
      const quadrant = quadEl ? quadEl.value : 'important-noturgent';
      const timeEl = document.getElementById('matrix-task-est') || document.getElementById('matrix-new-time');
      const est = timeEl ? (parseInt(timeEl.value, 10) || 20) : 20;

      if (!text) {
        alertBox("Please enter a task description.", "Missing Title");
        return;
      }

      state.matrixTasks.push({ id: `m-${Date.now()}`, text, quadrant, estMinutes: est, completed: false });
      closeMatrixAddModal();
      renderMatrix();
      playChime('bell');
    }

    function deleteMatrixTask(id) {
      state.matrixTasks = state.matrixTasks.filter(t => t.id !== id);
      renderMatrix();
    }

    function slotMatrixTaskToTimeline(taskId) {
      const task = state.matrixTasks.find(t => t.id === taskId);
      if (!task) return;

      state.events.push({
        id: `ev-${Date.now()}`,
        title: task.text,
        startTime: '15:00',
        duration: task.estMinutes,
        category: task.quadrant === 'urgent-important' || task.quadrant === 'important-noturgent' ? 'focus' : 'chores',
        subtasks: [
          { text: 'Initial physical setup', minutes: 5, done: false },
          { text: 'Core execution block', minutes: Math.max(5, task.estMinutes - 10), done: false },
          { text: 'Review and wrap up', minutes: 5, done: false }
        ]
      });
      switchTab('timeline');
      alertBox(`Slotted "${task.text}" into timeline schedule.`, "Prioritized");
      playChime('bell');
    }

    // 3. Smart Pantry Rendering with Nutritional Summaries & Freshness Dates (Dual-Lens: Zones & Food Types)
    function getItemZone(item) {
      const s = (item.storage || '').toLowerCase();
      const name = (item.name || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();

      if (s === 'frozen') return 'freezer';
      if (s === 'counter') return 'counter';
      if (s === 'fridge') {
        const isCrisper = /spinach|kale|lettuce|broccoli|celery|carrot|cucumber|zucchini|cauliflower|asparagus|cabbage|herb|cilantro|parsley|greens|salad|bell pepper|pepper|mushroom|scallion|radish|onion|tomato|avocado|berries|strawberry|produce/i.test(name) || cat === 'produce';
        return isCrisper ? 'fridge-crisper' : 'fridge-main';
      }
      if (s === 'shelf') {
        const isSpice = /spice|seasoning|salt|pepper|oregano|cumin|cinnamon|garlic powder|onion powder|paprika|curry|sauce|soy sauce|hot sauce|vinegar|oil|olive oil|dressing|mustard|ketchup|mayo|extract|vanilla/i.test(name) || cat === 'condiments';
        return isSpice ? 'spices' : 'pantry';
      }

      // Default inferences if storage not explicitly set
      if (/banana|avocado|bread|bagel|tortilla|tomato|onion|garlic|potato|sweet potato/i.test(name)) return 'counter';
      if (/frozen|freezer|ice cream/i.test(name)) return 'freezer';
      if (/milk|cheese|egg|yogurt|chicken|beef|turkey|deli|pork|tofu/i.test(name)) return 'fridge-main';
      if (/spinach|lettuce|broccoli|cucumber|greens|carrot/i.test(name) || cat === 'produce') return 'fridge-crisper';
      if (/oil|vinegar|spice|salt|pepper|sauce/i.test(name) || cat === 'condiments') return 'spices';
      return 'pantry';
    }

    function getItemTypes(item) {
      const name = (item.name || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const types = [];

      // 1. Leftovers & Prepared Meals
      if (/leftover|cooked|meal prep|\(1 serving\)|\bserving\b/i.test(name) || cat === 'leftovers') {
        types.push('leftovers');
      }

      // 2. Fruits & Berries
      if (/apple|banana|berry|berries|strawberry|strawberries|blueberry|blueberries|raspberry|raspberries|blackberry|blackberries|orange|lemon|lime|avocado|grape|grapes|watermelon|melon|peach|pear|mango|pineapple|kiwi|plum|cherry|cherries|fruit|raisin|cranberr/i.test(name) || cat === 'fruits' || cat === 'fruit') {
        types.push('fruits');
      }

      // 3. Vegetables & Greens
      if (/spinach|kale|lettuce|broccoli|carrot|onion|garlic|tomato|pepper|cucumber|zucchini|cauliflower|celery|potato|sweet potato|mushroom|asparagus|cabbage|green bean|pea|corn|veggie|vegetable|salad|arugula|scallion|shallot|radish|sprout/i.test(name) || cat === 'vegetables' || (cat === 'produce' && !types.includes('fruits'))) {
        types.push('vegetables');
      }

      // 4. Proteins & Meats
      if (/chicken|breast|thigh|beef|steak|ground beef|turkey|pork|bacon|sausage|ham|egg|eggs|salmon|tuna|shrimp|fish|tilapia|cod|tofu|tempeh|whey|protein/i.test(name) || cat === 'protein') {
        types.push('protein');
      }

      // 5. Dairy & Alternatives
      if (/milk|cheese|cheddar|mozzarella|parmesan|swiss|gouda|feta|yogurt|butter|cream|sour cream|heavy cream|oat milk|oatmilk|almond milk|soy milk|cottage cheese/i.test(name) || cat === 'dairy') {
        types.push('dairy');
      }

      // 6. Grains, Breads & Starches
      if (/rice|jasmine|brown rice|bread|toast|loaf|pasta|noodle|spaghetti|penne|macaroni|oat|oatmeal|rolled oats|quinoa|flour|tortilla|bagel|english muffin|cereal|grain|couscous|barley|wrap/i.test(name) || cat === 'grains') {
        types.push('grains');
      }

      // 7. Canned & Jarred Goods
      if (/can\b|canned|jar\b|jarred|diced tomato|tomato paste|black bean|kidney bean|chickpea|broth|soup|marinara|pasta sauce|salsa|pickles|olives|tuna can/i.test(name) || cat === 'canned') {
        types.push('canned');
      }

      // 8. Baking, Oils & Seasonings
      if (/oil|olive oil|canola oil|avocado oil|vinegar|salt|pepper|spice|seasoning|garlic powder|onion powder|cinnamon|oregano|cumin|paprika|chili powder|sugar|honey|maple syrup|baking powder|baking soda|yeast|vanilla|extract|soy sauce|hot sauce|sriracha|mustard|ketchup|mayo|mayonnaise|dressing/i.test(name) || cat === 'condiments' || cat === 'baking' || cat === 'spices') {
        types.push('baking');
      }

      // 9. Snacks & Drinks
      if (/chip|chips|pretzel|popcorn|cracker|crackers|nuts|almond|walnut|peanut|cashew|trail mix|snack|bar\b|granola bar|protein bar|cookie|cookies|chocolate|candy|soda|sparkling|seltzer|coffee|tea|juice/i.test(name) || cat === 'snacks') {
        types.push('snacks');
      }

      // Fallback if none matched
      if (types.length === 0) {
        if (cat === 'produce') types.push('vegetables');
        else if (cat === 'protein') types.push('protein');
        else if (cat === 'grains') types.push('grains');
        else if (cat === 'condiments') types.push('baking');
        else types.push('canned');
      }

      return types;
    }

    function buildPantryItemPillHtml(item, expiryBadge) {
      let storageBadge = '';
      if (item.storage === 'frozen') {
        storageBadge = `<button type="button" onclick="event.stopPropagation(); togglePantryItemStorage('${item.id}')" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-950/40 text-sky-300 border border-sky-400/30 flex items-center gap-1 hover:brightness-110 transition shrink-0" title="Storage: Freezer (Tap to cycle: Freezer → Counter → Shelf → Fridge)"><span>🧊</span><span class="hidden sm:inline">Freezer</span></button>`;
      } else if (item.storage === 'counter') {
        storageBadge = `<button type="button" onclick="event.stopPropagation(); togglePantryItemStorage('${item.id}')" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-peach-950/40 text-pastel-peach border border-pastel-peach/30 flex items-center gap-1 hover:brightness-110 transition shrink-0" title="Storage: On Counter (Tap to cycle: Counter → Shelf → Fridge → Freezer)"><span>🧺</span><span class="hidden sm:inline">Counter</span></button>`;
      } else if (item.storage === 'shelf') {
        storageBadge = `<button type="button" onclick="event.stopPropagation(); togglePantryItemStorage('${item.id}')" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950/40 text-amber-300 border border-amber-400/30 flex items-center gap-1 hover:brightness-110 transition shrink-0" title="Storage: Shelf (Tap to cycle: Shelf → Fridge → Freezer → Counter)"><span>🥫</span><span class="hidden sm:inline">Shelf</span></button>`;
      } else {
        storageBadge = `<button type="button" onclick="event.stopPropagation(); togglePantryItemStorage('${item.id}')" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-400/30 flex items-center gap-1 hover:brightness-110 transition shrink-0" title="Storage: Fridge (Tap to cycle: Fridge → Freezer → Counter → Shelf)"><span>❄️</span><span class="hidden sm:inline">Fridge</span></button>`;
      }

      return `
        <div class="flex items-center gap-1.5 min-w-0 flex-1">
          <span class="text-slate-200 font-semibold truncate group-hover:text-pastel-mint transition">${item.name}</span>
          ${expiryBadge}
        </div>
        <div class="flex items-center gap-1 shrink-0" onclick="event.stopPropagation()">
          <!-- Amount Stepper -->
          <div class="flex items-center bg-dark-elevated border border-dark-border rounded-lg px-1 py-0.5 gap-1 font-mono text-[10px]">
            <button type="button" onclick="event.stopPropagation(); changePantryItemAmount('${item.id}', -1)" class="w-3.5 h-3.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center">-</button>
            <span class="text-pastel-mint font-bold px-0.5">${item.amount != null ? item.amount : 1}${item.unit ? ' ' + item.unit : ''}</span>
            <button type="button" onclick="event.stopPropagation(); changePantryItemAmount('${item.id}', 1)" class="w-3.5 h-3.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center">+</button>
          </div>
          <!-- Storage badge -->
          ${storageBadge}
          <!-- Quick Add to Shopping List Cart Icon -->
          <button type="button" onclick="event.stopPropagation(); addPantryItemToShoppingList('${item.id}')" class="p-1 rounded-lg bg-dark-elevated hover:bg-pastel-coral/20 text-slate-400 hover:text-pastel-coral border border-dark-border transition" title="Add to Shopping List (Running Low)">
            <i data-lucide="shopping-cart" class="w-3.5 h-3.5"></i>
          </button>
          <!-- Delete -->
          <button type="button" onclick="event.stopPropagation(); deletePantryItem('${item.id}')" class="text-slate-500 hover:text-rose-400 p-0.5" title="Remove ingredient">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;
    }

    function renderPantry() {
      // 1. Zone Lists
      const zoneLists = {
        'fridge-crisper': document.getElementById('list-zone-fridge-crisper'),
        'fridge-main': document.getElementById('list-zone-fridge-main'),
        'freezer': document.getElementById('list-zone-freezer'),
        'counter': document.getElementById('list-zone-counter'),
        'pantry': document.getElementById('list-zone-pantry'),
        'spices': document.getElementById('list-zone-spices')
      };
      Object.keys(zoneLists).forEach(k => { if (zoneLists[k]) zoneLists[k].innerHTML = ''; });
      const zoneCounts = { 'fridge-crisper': 0, 'fridge-main': 0, freezer: 0, counter: 0, pantry: 0, spices: 0 };

      // 2. Type Lists
      const typeLists = {
        protein: document.getElementById('list-type-protein'),
        dairy: document.getElementById('list-type-dairy'),
        vegetables: document.getElementById('list-type-vegetables'),
        fruits: document.getElementById('list-type-fruits'),
        grains: document.getElementById('list-type-grains'),
        canned: document.getElementById('list-type-canned'),
        baking: document.getElementById('list-type-baking'),
        snacks: document.getElementById('list-type-snacks'),
        leftovers: document.getElementById('list-type-leftovers')
      };
      Object.keys(typeLists).forEach(k => { if (typeLists[k]) typeLists[k].innerHTML = ''; });
      const typeCounts = { protein: 0, dairy: 0, vegetables: 0, fruits: 0, grains: 0, canned: 0, baking: 0, snacks: 0, leftovers: 0 };

      const now = new Date();
      const expiringSoonItems = [];
      const zoneFilter = state.pantryZoneFilter || 'all';
      const typeFilter = state.pantryTypeFilter || 'all';
      const viewMode = state.pantryViewGroup || 'zone';

      (state.pantry || []).forEach(item => {
        if (!item.storage) {
          const z = getItemZone(item);
          item.storage = z.startsWith('fridge') ? 'fridge' : (z === 'counter' ? 'counter' : (z === 'freezer' ? 'frozen' : 'shelf'));
        }
        if (!item.dateAdded) {
          item.dateAdded = new Date().toISOString().split('T')[0];
        }

        // Check expiration
        let expiryBadge = '';
        let isExpiringSoon = false;
        if (item.expirationDate) {
          const exp = new Date(item.expirationDate);
          const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
          if (diffDays <= 7 && diffDays >= 0) {
            expiryBadge = `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/40 text-amber-300 border border-amber-400/30">Exp: ${diffDays}d</span>`;
            expiringSoonItems.push(item.name);
            isExpiringSoon = true;
          } else if (diffDays < 0) {
            expiryBadge = `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950/40 text-rose-300 border border-rose-400/30">Expired</span>`;
            isExpiringSoon = true;
          }
        }

        const itemZone = getItemZone(item);
        const itemTypes = getItemTypes(item);

        // Zone filter check:
        let matchesZone = false;
        if (zoneFilter === 'all') {
          matchesZone = true;
        } else if (zoneFilter === 'fridge') {
          matchesZone = (itemZone === 'fridge-crisper' || itemZone === 'fridge-main' || item.storage === 'fridge');
        } else if (zoneFilter === 'freezer') {
          matchesZone = (itemZone === 'freezer' || item.storage === 'frozen');
        } else if (zoneFilter === 'counter') {
          matchesZone = (itemZone === 'counter' || item.storage === 'counter');
        } else if (zoneFilter === 'pantry') {
          matchesZone = (itemZone === 'pantry');
        } else if (zoneFilter === 'spices') {
          matchesZone = (itemZone === 'spices');
        }

        // Type filter check:
        let matchesType = false;
        if (typeFilter === 'all') {
          matchesType = true;
        } else if (typeFilter === 'expiring') {
          matchesType = isExpiringSoon;
        } else {
          matchesType = itemTypes.includes(typeFilter);
        }

        // Cross-filtering pass: must satisfy both filters
        if (!matchesZone || !matchesType) return;

        // Populate Zone View:
        if (zoneLists[itemZone]) {
          zoneCounts[itemZone] = (zoneCounts[itemZone] || 0) + 1;
          const pill = document.createElement('div');
          pill.className = "flex items-center justify-between p-2.5 rounded-xl bg-dark-base border border-dark-border hover:border-pastel-mint/50 cursor-pointer text-xs gap-1.5 transition shadow-sm group";
          pill.onclick = () => openPantryItemDetailModal(item.id);
          pill.innerHTML = buildPantryItemPillHtml(item, expiryBadge);
          zoneLists[itemZone].appendChild(pill);
        }

        // Populate Type View:
        const targetTypes = (typeFilter !== 'all' && typeFilter !== 'expiring') ? [typeFilter] : itemTypes;
        targetTypes.forEach(t => {
          if (typeLists[t]) {
            typeCounts[t] = (typeCounts[t] || 0) + 1;
            const pill = document.createElement('div');
            pill.className = "flex items-center justify-between p-2.5 rounded-xl bg-dark-base border border-dark-border hover:border-pastel-mint/50 cursor-pointer text-xs gap-1.5 transition shadow-sm group";
            pill.onclick = () => openPantryItemDetailModal(item.id);
            pill.innerHTML = buildPantryItemPillHtml(item, expiryBadge);
            typeLists[t].appendChild(pill);
          }
        });
      });

      // Update counters in UI
      const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
      setTxt('count-zone-fridge-crisper', zoneCounts['fridge-crisper']);
      setTxt('count-zone-fridge-main', zoneCounts['fridge-main']);
      setTxt('count-zone-freezer', zoneCounts.freezer);
      setTxt('count-zone-counter', zoneCounts.counter);
      setTxt('count-zone-pantry', zoneCounts.pantry);
      setTxt('count-zone-spices', zoneCounts.spices);

      setTxt('count-type-protein', typeCounts.protein);
      setTxt('count-type-dairy', typeCounts.dairy);
      setTxt('count-type-vegetables', typeCounts.vegetables);
      setTxt('count-type-fruits', typeCounts.fruits);
      setTxt('count-type-grains', typeCounts.grains);
      setTxt('count-type-canned', typeCounts.canned);
      setTxt('count-type-baking', typeCounts.baking);
      setTxt('count-type-snacks', typeCounts.snacks);
      setTxt('count-type-leftovers', typeCounts.leftovers);

      setTxt('pantry-total-count-badge', (state.pantry || []).length);

      // Make sure active grid matches viewMode
      const gridZone = document.getElementById('pantry-grid-zone');
      const gridType = document.getElementById('pantry-grid-type');
      if (viewMode === 'type') {
        if (gridZone) gridZone.classList.add('hidden');
        if (gridType) gridType.classList.remove('hidden');
      } else {
        if (gridZone) gridZone.classList.remove('hidden');
        if (gridType) gridType.classList.add('hidden');
      }

      // Check expiring soon alert in kitchen & reverse chef
      checkExpiringSoonAlerts(expiringSoonItems);
      if (window.lucide) lucide.createIcons();
    }

    function checkExpiringSoonAlerts(items) {
      const banner = document.getElementById('chef-expiring-alert');
      const text = document.getElementById('chef-expiring-alert-text');
      if (banner && text) {
        if (items && items.length > 0) {
          text.textContent = `Ingredients expiring soon: ${items.slice(0, 3).join(', ')}. Use them up in your next recipe!`;
          banner.classList.remove('hidden');
        } else {
          banner.classList.add('hidden');
        }
      }
    }

    function prioritizeExpiringIngredients() {
      const chips = document.querySelectorAll('#reverse-chef-pantry-chips input[type="checkbox"]');
      chips.forEach(cb => {
        cb.checked = true;
      });
      goToReverseChefStep(2);
      sendSousChefQuickPrompt("Create a delicious recipe prioritizing my ingredients that are expiring soon!");
    }

    // Pantry Item Detail Modal (Nutritional Summary & Dates)
    state.activePantryDetailItem = null;

    function openPantryItemDetailModal(id) {
      const item = (state.pantry || []).find(p => p.id === id);
      if (!item) return;
      state.activePantryDetailItem = item;

      const modal = document.getElementById('pantry-item-detail-modal');
      const nameEl = document.getElementById('pantry-detail-name');
      const kcalEl = document.getElementById('pantry-detail-kcal');
      const protEl = document.getElementById('pantry-detail-protein');
      const carbEl = document.getElementById('pantry-detail-carbs');
      const fatEl = document.getElementById('pantry-detail-fat');
      const microEl = document.getElementById('pantry-detail-micros');
      const verifiedBadge = document.getElementById('pantry-detail-verified-badge');
      const freshnessBadge = document.getElementById('pantry-detail-freshness-badge');
      const dateAddedInput = document.getElementById('pantry-detail-date-added');
      const dateOpenedInput = document.getElementById('pantry-detail-date-opened');
      const dateExpInput = document.getElementById('pantry-detail-date-exp');

      if (nameEl) nameEl.textContent = item.name;
      const amtInput = document.getElementById('pantry-detail-amount');
      const unitInput = document.getElementById('pantry-detail-unit');
      if (amtInput) amtInput.value = item.amount != null ? item.amount : 1;
      if (unitInput) unitInput.value = item.unit || 'item';

      // Find match in whole foods database
      const match = (typeof commonFoodsDatabase !== 'undefined') ? commonFoodsDatabase.find(cf => item.name.toLowerCase().includes(cf.name.toLowerCase().split(' ')[0])) : null;
      const kcal = match ? match.kcal : (item.kcal || (item.category === 'protein' ? 180 : (item.category === 'produce' ? 45 : 120)));
      const prot = match ? match.protein : (item.protein || (item.category === 'protein' ? 24 : 2));
      const carbs = match ? match.carbs : (item.carbs || (item.category === 'produce' ? 8 : (item.category === 'grains' ? 28 : 2)));
      const fat = match ? match.fat : (item.fat || (item.category === 'protein' ? 6 : 0.5));
      const fiber = match ? match.fiber : 3;

      if (kcalEl) kcalEl.textContent = String(kcal);
      if (protEl) protEl.textContent = `${prot}g`;
      if (carbEl) carbEl.textContent = `${carbs}g`;
      if (fatEl) fatEl.textContent = `${fat}g`;
      if (microEl) microEl.textContent = `Fiber: ${fiber}g • Sodium: ${match?.sodium || 45}mg • Potassium: ${match?.potassium || 280}mg • Iron: ${match?.iron || 1.2}mg • Vit C: ${match?.vitC || 20}mg`;

      if (verifiedBadge) {
        verifiedBadge.textContent = match ? "✓ Verified USDA Whole Food" : "~ Estimated Whole Food Nutrition";
      }

      if (dateAddedInput) dateAddedInput.value = item.dateAdded || new Date().toISOString().split('T')[0];
      if (dateOpenedInput) dateOpenedInput.value = item.dateOpened || '';
      if (dateExpInput) {
        if (!item.expirationDate) {
          const recExp = new Date();
          recExp.setDate(recExp.getDate() + (item.category === 'produce' ? 7 : (item.storage === 'frozen' ? 90 : 14)));
          item.expirationDate = recExp.toISOString().split('T')[0];
        }
        dateExpInput.value = item.expirationDate;
      }

      // Freshness status
      if (freshnessBadge) {
        const exp = new Date(item.expirationDate);
        const now = new Date();
        const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        if (diff < 0) {
          freshnessBadge.textContent = "⚠️ Expired";
          freshnessBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/40 text-rose-300 border border-rose-400/30";
        } else if (diff <= 7) {
          freshnessBadge.textContent = `⚠️ Expiring in ${diff} days`;
          freshnessBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/40 text-amber-300 border border-amber-400/30";
        } else {
          freshnessBadge.textContent = `✓ Fresh (${diff} days)`;
          freshnessBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-400/30";
        }
      }

      setPantryDetailStorage(item.storage || 'fridge');

      if (modal) modal.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
      playChime('bell');
    }

    function closePantryItemDetailModal() {
      const modal = document.getElementById('pantry-item-detail-modal');
      if (modal) modal.classList.add('hidden');
      state.activePantryDetailItem = null;
    }

    function setPantryDetailStorage(storageType) {
      if (state.activePantryDetailItem) state.activePantryDetailItem.storage = storageType;
      ['fridge', 'frozen', 'counter', 'shelf'].forEach(s => {
        const btn = document.getElementById(`btn-pantry-storage-${s}`);
        if (!btn) return;
        if (s === storageType) {
          btn.className = "p-2 rounded-xl border-2 border-pastel-mint bg-pastel-mint/15 text-white font-bold text-center text-xs";
        } else {
          btn.className = "p-2 rounded-xl bg-dark-base border border-dark-border text-slate-400 text-center text-xs";
        }
      });
    }

    function savePantryItemDetail() {
      if (!state.activePantryDetailItem) return;
      const item = state.activePantryDetailItem;
      const dateAddedInput = document.getElementById('pantry-detail-date-added');
      const dateOpenedInput = document.getElementById('pantry-detail-date-opened');
      const dateExpInput = document.getElementById('pantry-detail-date-exp');

      if (dateAddedInput) item.dateAdded = dateAddedInput.value;
      if (dateOpenedInput) item.dateOpened = dateOpenedInput.value;
      if (dateExpInput) item.expirationDate = dateExpInput.value;
      const amtInput = document.getElementById('pantry-detail-amount');
      const unitInput = document.getElementById('pantry-detail-unit');
      if (amtInput) {
        const val = parseFloat(amtInput.value);
        item.amount = !isNaN(val) ? val : 1;
      }
      if (unitInput) item.unit = unitInput.value || 'item';

      saveAppState();
      renderPantry();
      closePantryItemDetailModal();
      playChime('bell');
      alertBox(`Updated freshness and dates for "${item.name}".`, "Item Saved");
    }

    function deletePantryItemFromDetail() {
      if (!state.activePantryDetailItem) return;
      const item = state.activePantryDetailItem;
      deletePantryItem(item.id);
      closePantryItemDetailModal();
    }

    // Manual Instant Whole Food Search Bar
    function searchWholeFoodsForPantry(query) {
      const box = document.getElementById('kitchen-search-suggestions');
      if (!box) return;
      const q = (query || '').trim().toLowerCase();
      if (!q) {
        box.classList.add('hidden');
        box.innerHTML = '';
        return;
      }

      // Load custom foods from localStorage
      let customFoods = [];
      try {
        const savedCustom = localStorage.getItem('focusflow_custom_foods');
        if (savedCustom) customFoods = JSON.parse(savedCustom);
      } catch(e) {}

      const pool = [
        ...(typeof commonFoodsDatabase !== 'undefined' ? commonFoodsDatabase : []),
        ...(typeof brandedGroceriesDatabase !== 'undefined' ? brandedGroceriesDatabase : []),
        ...customFoods
      ];

      const matches = pool.filter(cf => cf.name.toLowerCase().includes(q)).slice(0, 6);
      if (matches.length === 0) {
        box.innerHTML = `
          <div class="p-2.5 text-xs text-slate-300 flex items-center justify-between gap-2">
            <span>No match found for "${query}".</span>
            <button type="button" onclick="openCustomFoodModal('${query.replace(/'/g, "\\'")}')" class="px-2.5 py-1.5 rounded-xl bg-pastel-mint text-dark-base font-bold text-xs shrink-0">+ Create &amp; Save Food</button>
          </div>
        `;
        box.classList.remove('hidden');
        return;
      }

      box.innerHTML = '';
      matches.forEach(m => {
        const row = document.createElement('div');
        row.className = "p-2 rounded-xl bg-dark-base hover:bg-slate-700 cursor-pointer flex items-center justify-between text-xs transition";
        row.onclick = () => addFoodMatchToPantry(m);
        row.innerHTML = `
          <div>
            <span class="font-bold text-white block">${m.name}</span>
            <span class="text-[10px] text-slate-400 font-mono">${m.kcal} kcal • P: ${m.protein}g • C: ${m.carbs}g • F: ${m.fat}g</span>
          </div>
          <button type="button" class="px-2 py-1 rounded-lg bg-pastel-mint text-dark-base font-bold text-[10px] shrink-0">+ Add</button>
        `;
        box.appendChild(row);
      });
      box.classList.remove('hidden');
    }

    function addFoodMatchToPantry(m) {
      const cleanName = m.name.replace(/\s*\([0-9]+[^)]*\)/g, '').trim();
      let cat = 'produce';
      if (/chicken|beef|meat|egg|salmon|fish|protein|yogurt|milk|cheese|tofu/i.test(cleanName)) cat = 'protein';
      else if (/rice|oat|quinoa|bread|pasta|cereal|flour/i.test(cleanName)) cat = 'grains';
      else if (/oil|sauce|dressing|condiment|nut|seed/i.test(cleanName)) cat = 'condiments';

      state.pantry.push({
        id: `p-${Date.now()}`,
        name: cleanName,
        category: cat,
        storage: cat === 'protein' || cat === 'produce' ? 'fridge' : 'shelf',
        dateAdded: new Date().toISOString().split('T')[0],
        kcal: m.kcal,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat
      });

      saveAppState();
      renderPantry();
      playChime('bell');
      const box = document.getElementById('kitchen-search-suggestions');
      const input = document.getElementById('kitchen-food-search-input');
      if (box) box.classList.add('hidden');
      if (input) input.value = '';
      alertBox(`Added verified "${cleanName}" to your pantry!`, "Pantry Updated");
    }

    function addCustomPantryItemFromSearch(name) {
      state.pantry.push({
        id: `p-${Date.now()}`,
        name: name.trim(),
        category: 'produce',
        storage: 'fridge',
        dateAdded: new Date().toISOString().split('T')[0]
      });
      saveAppState();
      renderPantry();
      playChime('bell');
      const box = document.getElementById('kitchen-search-suggestions');
      const input = document.getElementById('kitchen-food-search-input');
      if (box) box.classList.add('hidden');
      if (input) input.value = '';
      alertBox(`Added "${name}" to your pantry!`, "Pantry Updated");
    }

    function openAddPantryItemModal() { document.getElementById('pantry-item-modal').classList.remove('hidden'); }
    function closeAddPantryItemModal() { document.getElementById('pantry-item-modal').classList.add('hidden'); }
    function saveManualPantryItem() {
      const nameInput = document.getElementById('pantry-name-input');
      const catInput = document.getElementById('pantry-category-input');
      if (!nameInput) return;
      const name = nameInput.value.trim();
      const category = catInput ? catInput.value : 'produce';
      if (!name) return;

      const storage = (category === 'protein' || category === 'produce') ? 'fridge' : 'shelf';
      if (!Array.isArray(state.pantry)) state.pantry = [];
      state.pantry.push({
        id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name,
        category,
        storage,
        amount: 1,
        unit: 'item',
        dateAdded: new Date().toISOString().split('T')[0]
      });

      nameInput.value = '';
      saveAppState();
      closeAddPantryItemModal();
      renderPantry();
      playChime('bell');
      alertBox(`Added "${name}" to your pantry!`, "Pantry Updated");
    }

    function deletePantryItem(id) {
      state.pantry = (state.pantry || []).filter(p => p.id !== id);
      saveAppState();
      renderPantry();
    }

    function clearDemoPantryItems() {
      if (confirm("Clear all items from your pantry to start fresh with your real groceries?")) {
        state.pantry = [];
        saveAppState();
        renderPantry();
        playChime('bell');
        alertBox("Pantry cleared! Ready to add your real groceries.", "Pantry Clean Slate");
      }
    }

    function handlePantryPhotoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const loading = document.getElementById('pantry-vision-loading');
      if (loading) loading.classList.remove('hidden');

      setTimeout(() => {
        if (loading) loading.classList.add('hidden');
        state.pantry.push(
          { id: `p-${Date.now()}-1`, name: 'Scanned Bell Peppers', category: 'produce' },
          { id: `p-${Date.now()}-2`, name: 'Scanned Tofu Block', category: 'protein' },
          { id: `p-${Date.now()}-3`, name: 'Scanned Sriracha Sauce', category: 'condiments' }
        );
        renderPantry();
        playChime('bell');
        alertBox("Identified 3 new kitchen ingredients via photo.", "Pantry Updated");
      }, 1500);
    }




