// ==============================================
    // TAB 7: HEALTH & BIOMETRICS (CARDIAC & MEDICATION)
    // ==============================================
    function initHealthData() {
      if (!state.healthData) {
        const saved = localStorage.getItem('focusflow_health_data');
        if (saved) {
          try { state.healthData = JSON.parse(saved); } catch(e) {}
        }
        if (!state.healthData) {
          state.healthData = {
            medications: [
              { id: 'm-1', name: 'Adderall XR', dose: '20mg', time: '08:00', type: 'XR', durationHours: 8, date: getTodayDateString() }
            ],
            heartRateReadings: [
              { id: 'hr-1', time: '10:45', bpm: 108, activityTitle: 'Chemistry Lecture', isSedentary: true, notes: 'Classroom lecture, felt rapid pulse', date: getTodayDateString() },
              { id: 'hr-2', time: '09:15', bpm: 74, activityTitle: 'Morning Routine & Breakfast', isSedentary: false, notes: 'Walking / prep', date: getTodayDateString() }
            ],
            symptoms: [
              { id: 's-1', name: 'Restlessness / Hyperactivity', severity: 'Moderate', time: '11:15', notes: 'Leg tapping during chemistry lecture', date: getTodayDateString() }
            ],
            alertDismissed: false
          };
        }
      }
    }

    function saveHealthData() {
      if (state.healthData) {
        localStorage.setItem('focusflow_health_data', JSON.stringify(state.healthData));
      }
    }

    function renderHealthTabUI() {
      initHealthData();
      const hd = state.healthData;
      const todayStr = getTodayDateString();

      // Filter today's readings and medications
      const todayMeds = (hd.medications || []).filter(m => (m.date || todayStr) === todayStr);
      const activeMed = todayMeds.length > 0 ? todayMeds[todayMeds.length - 1] : (hd.medications && hd.medications[0]);

      const hrReadings = hd.heartRateReadings || [];
      const latestHr = hrReadings.length > 0 ? hrReadings[0] : null;

      // Current HR Stat
      const currentHrEl = document.getElementById('health-stat-current-hr');
      const hrContextEl = document.getElementById('health-stat-hr-context');
      if (currentHrEl) currentHrEl.textContent = latestHr ? latestHr.bpm : '78';
      if (hrContextEl) {
        if (latestHr && latestHr.bpm > 100 && latestHr.isSedentary) {
          hrContextEl.textContent = '⚠️ Elevated while seated';
          hrContextEl.className = 'text-[10px] text-amber-400 font-bold block';
        } else if (latestHr && latestHr.bpm > 100) {
          hrContextEl.textContent = '⚡ Elevated (Active)';
          hrContextEl.className = 'text-[10px] text-pastel-sky block';
        } else {
          hrContextEl.textContent = '✓ Normal resting range';
          hrContextEl.className = 'text-[10px] text-emerald-400 block';
        }
      }

      // Active Medication Stat
      const activeMedEl = document.getElementById('health-stat-active-med');
      const medDoseTimeEl = document.getElementById('health-stat-med-dose-time');
      const medTypeBadge = document.getElementById('health-med-release-type');

      if (activeMed) {
        if (activeMedEl) activeMedEl.textContent = `${activeMed.name} ${activeMed.dose}`;
        if (medTypeBadge) medTypeBadge.textContent = `${activeMed.type || 'XR'} Formulation`;

        // Calculate time elapsed since dose
        const now = new Date();
        const [dH, dM] = (activeMed.time || '08:00').split(':').map(Number);
        const doseTotalMin = dH * 60 + dM;
        const nowTotalMin = now.getHours() * 60 + now.getMinutes();
        const diffMin = nowTotalMin - doseTotalMin;

        if (medDoseTimeEl) {
          if (diffMin >= 0) {
            const hAgo = Math.floor(diffMin / 60);
            const mAgo = diffMin % 60;
            medDoseTimeEl.textContent = `Dose: ${formatTimeAmPm(activeMed.time)} (${hAgo > 0 ? hAgo + 'h ' : ''}${mAgo}m ago)`;
          } else {
            medDoseTimeEl.textContent = `Scheduled: ${formatTimeAmPm(activeMed.time)}`;
          }
        }

        // Forecaster Progress Bar & Wear-off Time
        const durHours = parseFloat(activeMed.durationHours) || (activeMed.type === 'IR' ? 4 : 8);
        const totalDurMins = Math.round(durHours * 60);
        const wearOffMin = doseTotalMin + totalDurMins;
        const wearOffHH = String(Math.floor((wearOffMin % 1440) / 60)).padStart(2, '0');
        const wearOffMM = String((wearOffMin % 1440) % 60).padStart(2, '0');
        const wearOffTimeStr = `${wearOffHH}:${wearOffMM}`;

        const wearoffTimeEl = document.getElementById('health-stat-wearoff-time');
        const wearoffCountEl = document.getElementById('health-stat-wearoff-countdown');
        if (wearoffTimeEl) wearoffTimeEl.textContent = `~${formatTimeAmPm(wearOffTimeStr)}`;

        const remainingMin = wearOffMin - nowTotalMin;
        if (wearoffCountEl) {
          if (remainingMin > 0) {
            const rH = Math.floor(remainingMin / 60);
            const rM = remainingMin % 60;
            wearoffCountEl.textContent = `In approx ${rH > 0 ? rH + 'h ' : ''}${rM}m`;
            wearoffCountEl.className = 'text-[9.5px] text-amber-400 font-mono block';
          } else {
            wearoffCountEl.textContent = `Worn off (${Math.abs(Math.floor(remainingMin/60))}h ago)`;
            wearoffCountEl.className = 'text-[9.5px] text-slate-400 font-mono block';
          }
        }

        const pctElapsed = Math.min(100, Math.max(0, Math.round((diffMin / totalDurMins) * 100)));
        const progFill = document.getElementById('health-med-progress-fill');
        const progLabel = document.getElementById('health-med-progress-label');
        const timeLeftEl = document.getElementById('health-med-time-left');

        if (progFill) progFill.style.width = `${pctElapsed}%`;
        if (progLabel) progLabel.textContent = pctElapsed >= 100 ? 'Post-Therapeutic / Transition Phase' : `Active Therapeutic Phase (${pctElapsed}% Elapsed)`;
        if (timeLeftEl) timeLeftEl.textContent = remainingMin > 0 ? `~${Math.floor(remainingMin/60)}h ${remainingMin%60}m remaining` : 'Tapered / Baseline';
      }

      // Current Activity context from today's calendar events
      const now = new Date();
      const curMins = now.getHours() * 60 + now.getMinutes();
      const todayEvents = getEventsForSelectedDay();
      const curEvent = todayEvents.find(e => {
        const [eH, eM] = (e.startTime || '09:00').split(':').map(Number);
        const s = eH * 60 + eM;
        const end = s + (e.duration || 30);
        return curMins >= s && curMins < end;
      });

      const actEl = document.getElementById('health-stat-current-activity');
      const actDurEl = document.getElementById('health-stat-activity-duration');
      if (actEl) actEl.textContent = curEvent ? curEvent.title : (latestHr ? latestHr.activityTitle : 'Open Focus / Desk');
      if (actDurEl && curEvent) {
        actDurEl.textContent = `${formatTimeAmPm(curEvent.startTime)} – ${formatTimeAmPm(getEndTimeFromStartAndDuration(curEvent.startTime, curEvent.duration))}`;
      }

      // Check Sedentary Tachycardia Alert
      const alertCard = document.getElementById('health-sedentary-tachycardia-alert');
      const alertDesc = document.getElementById('health-tachycardia-alert-desc');
      const spikeReading = hrReadings.find(r => r.isSedentary && r.bpm >= 100);

      if (alertCard) {
        if (spikeReading && !hd.alertDismissed) {
          alertCard.classList.remove('hidden');
          if (alertDesc) {
            alertDesc.innerHTML = `Heart rate reached <strong>${spikeReading.bpm} BPM</strong> while seated in <em>${spikeReading.activityTitle}</em> (${formatTimeAmPm(spikeReading.time)}). While resting norm is 60–75 BPM, ADHD stimulant medication elevates adrenergic cardiac output even during motionless tasks.`;
          }
        } else {
          alertCard.classList.add('hidden');
        }
      }

      // Render Heart Rate Activity Correlation Stream
      const streamEl = document.getElementById('health-activity-hr-stream');
      if (streamEl) {
        streamEl.innerHTML = '';
        if (hrReadings.length === 0) {
          streamEl.innerHTML = '<div class="p-3 text-center text-xs text-slate-500">No heart rate readings logged yet today. Tap "+ Log Reading" above.</div>';
        } else {
          hrReadings.forEach(r => {
            const isSpike = r.isSedentary && r.bpm >= 100;
            const item = document.createElement('div');
            item.className = `p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
              isSpike 
                ? 'bg-rose-950/20 border-rose-500/50' 
                : (r.isSedentary ? 'bg-dark-base border-dark-border' : 'bg-dark-base border-sky-500/30')
            }`;
            item.innerHTML = `
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-8 h-8 rounded-xl ${isSpike ? 'bg-rose-500/20 text-rose-400' : (r.isSedentary ? 'bg-dark-elevated text-slate-400' : 'bg-pastel-sky/20 text-pastel-sky')} flex items-center justify-center font-bold text-xs shrink-0">
                  ${r.bpm}
                </div>
                <div class="truncate">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="font-bold text-white truncate">${r.activityTitle || 'Activity'}</span>
                    <span class="text-[9.5px] px-1.5 py-0.5 rounded ${r.isSedentary ? 'bg-dark-elevated text-slate-300' : 'bg-pastel-sky/15 text-pastel-sky'} font-mono">${r.isSedentary ? '🧘 Inactive' : '🏃 Active'}</span>
                    ${isSpike ? '<span class="text-[9.5px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold font-mono">⚠️ Spike</span>' : ''}
                  </div>
                  <span class="text-[10px] text-slate-400 font-mono">${formatTimeAmPm(r.time)}${r.notes ? ' • ' + r.notes : ''}</span>
                </div>
              </div>
              <button type="button" onclick="deleteHealthReading('${r.id}')" class="p-1 rounded text-slate-500 hover:text-rose-400 text-xs shrink-0" title="Delete reading">✕</button>
            `;
            streamEl.appendChild(item);
          });
        }
      }

      // Render Symptoms History List
      const symptomsListEl = document.getElementById('health-symptoms-list');
      const symptomsCountEl = document.getElementById('health-symptoms-count');
      const symptoms = hd.symptoms || [];

      if (symptomsCountEl) symptomsCountEl.textContent = `${symptoms.length} logged today`;
      if (symptomsListEl) {
        symptomsListEl.innerHTML = '';
        if (symptoms.length === 0) {
          symptomsListEl.innerHTML = '<div class="p-3 text-center text-xs text-slate-500">No transition symptoms logged. Tap any button above if experiencing wear-off effects.</div>';
        } else {
          symptoms.forEach(s => {
            const row = document.createElement('div');
            row.className = "p-2 rounded-xl bg-dark-base border border-dark-border flex items-center justify-between text-xs";
            row.innerHTML = `
              <div class="flex items-center gap-2">
                <span class="text-pastel-butter">⚡</span>
                <div>
                  <span class="font-bold text-white">${s.name}</span>
                  <span class="text-[10px] text-slate-400 font-mono ml-1.5">(${formatTimeAmPm(s.time)})</span>
                  ${s.severity ? `<span class="text-[9.5px] px-1.5 py-0.2 rounded ml-1 font-mono ${s.severity === 'Severe' ? 'bg-rose-500/20 text-rose-300' : 'bg-pastel-butter/20 text-pastel-butter'}">${s.severity}</span>` : ''}
                </div>
              </div>
              <button type="button" onclick="deleteHealthSymptom('${s.id}')" class="text-slate-500 hover:text-rose-400 text-xs p-1">✕</button>
            `;
            symptomsListEl.appendChild(row);
          });
        }
      }

      if (window.lucide) lucide.createIcons();
    }

    function dismissHealthAlert() {
      if (state.healthData) state.healthData.alertDismissed = true;
      const el = document.getElementById('health-sedentary-tachycardia-alert');
      if (el) el.classList.add('hidden');
    }

    function openLogMedicationModal() {
      const now = new Date();
      const curH = String(now.getHours()).padStart(2, '0');
      const curM = String(now.getMinutes()).padStart(2, '0');
      const timeIn = document.getElementById('health-input-med-time');
      if (timeIn && !timeIn.value) timeIn.value = `${curH}:${curM}`;
      const modal = document.getElementById('log-medication-modal');
      if (modal) modal.classList.remove('hidden');
    }
    function closeLogMedicationModal() {
      const modal = document.getElementById('log-medication-modal');
      if (modal) modal.classList.add('hidden');
    }
    function updateMedDurationDefault() {
      const type = document.getElementById('health-input-med-type').value;
      const durInput = document.getElementById('health-input-med-duration');
      if (durInput) durInput.value = type === 'IR' ? '4' : '8';
    }
    function saveMedicationDose() {
      const name = document.getElementById('health-input-med-name').value;
      const dose = document.getElementById('health-input-med-dose').value.trim() || '20mg';
      const time = document.getElementById('health-input-med-time').value || '08:00';
      const type = document.getElementById('health-input-med-type').value || 'XR';
      const durationHours = parseFloat(document.getElementById('health-input-med-duration').value) || 8;

      initHealthData();
      state.healthData.medications.push({
        id: `med-${Date.now()}`,
        name,
        dose,
        time,
        type,
        durationHours,
        date: getTodayDateString()
      });
      saveHealthData();
      closeLogMedicationModal();
      renderHealthTabUI();
      playChime('bell');
      alertBox(`Logged dose: ${name} ${dose} at ${formatTimeAmPm(time)}. Wear-off forecaster calibrated!`, "Medication Dose Saved");
    }

    function openLogHeartRateModal() {
      const now = new Date();
      const curH = String(now.getHours()).padStart(2, '0');
      const curM = String(now.getMinutes()).padStart(2, '0');
      const timeIn = document.getElementById('health-input-hr-time');
      if (timeIn) timeIn.value = `${curH}:${curM}`;

      // Suggest current calendar event
      const curMins = now.getHours() * 60 + now.getMinutes();
      const todayEvents = getEventsForSelectedDay();
      const curEvent = todayEvents.find(e => {
        const [eH, eM] = (e.startTime || '09:00').split(':').map(Number);
        const s = eH * 60 + eM;
        const end = s + (e.duration || 30);
        return curMins >= s && curMins < end;
      });
      const actIn = document.getElementById('health-input-hr-activity');
      if (actIn) actIn.value = curEvent ? curEvent.title : 'Chemistry Lecture / Sitting';

      const modal = document.getElementById('log-heart-rate-modal');
      if (modal) modal.classList.remove('hidden');
    }
    function closeLogHeartRateModal() {
      const modal = document.getElementById('log-heart-rate-modal');
      if (modal) modal.classList.add('hidden');
    }
    function saveHeartRateReading() {
      const bpm = parseInt(document.getElementById('health-input-hr-bpm').value, 10);
      if (isNaN(bpm) || bpm < 30 || bpm > 250) {
        alertBox("Please enter a valid heart rate (BPM).", "Invalid Heart Rate");
        return;
      }
      const time = document.getElementById('health-input-hr-time').value || '10:00';
      const activityTitle = document.getElementById('health-input-hr-activity').value.trim() || 'Classroom / Seated';
      const isSedentary = document.getElementById('health-hr-sedentary-yes').checked;
      const notes = document.getElementById('health-input-hr-notes').value.trim();

      initHealthData();
      state.healthData.heartRateReadings.unshift({
        id: `hr-${Date.now()}`,
        time,
        bpm,
        activityTitle,
        isSedentary,
        notes,
        date: getTodayDateString()
      });
      state.healthData.alertDismissed = false; // re-evaluate alert
      saveHealthData();
      closeLogHeartRateModal();
      renderHealthTabUI();
      playChime('bell');
      if (isSedentary && bpm >= 100) {
        alertBox(`Logged ${bpm} BPM while seated in ${activityTitle}. Elevated sedentary heart rate detected!`, "Sedentary Spike Alert");
      } else {
        alertBox(`Logged ${bpm} BPM for ${activityTitle}.`, "Heart Rate Saved");
      }
    }
    function deleteHealthReading(id) {
      if (state.healthData && state.healthData.heartRateReadings) {
        state.healthData.heartRateReadings = state.healthData.heartRateReadings.filter(r => r.id !== id);
        saveHealthData();
        renderHealthTabUI();
      }
    }

    function openLogSymptomModal() {
      const now = new Date();
      const curH = String(now.getHours()).padStart(2, '0');
      const curM = String(now.getMinutes()).padStart(2, '0');
      const timeIn = document.getElementById('health-input-symptom-time');
      if (timeIn) timeIn.value = `${curH}:${curM}`;
      const modal = document.getElementById('log-symptom-modal');
      if (modal) modal.classList.remove('hidden');
    }
    function closeLogSymptomModal() {
      const modal = document.getElementById('log-symptom-modal');
      if (modal) modal.classList.add('hidden');
    }
    function quickLogHealthSymptom(name) {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      initHealthData();
      state.healthData.symptoms.unshift({
        id: `sym-${Date.now()}`,
        name,
        severity: 'Moderate',
        time,
        notes: '',
        date: getTodayDateString()
      });
      saveHealthData();
      renderHealthTabUI();
      playChime('bell');
      alertBox(`Logged symptom: ${name} at ${formatTimeAmPm(time)}.`, "Symptom Recorded");
    }
    function saveCustomSymptom() {
      const name = document.getElementById('health-input-symptom-name').value;
      const severity = document.getElementById('health-input-symptom-severity').value;
      const time = document.getElementById('health-input-symptom-time').value || '12:00';
      const notes = document.getElementById('health-input-symptom-notes').value.trim();

      initHealthData();
      state.healthData.symptoms.unshift({
        id: `sym-${Date.now()}`,
        name,
        severity,
        time,
        notes,
        date: getTodayDateString()
      });
      saveHealthData();
      closeLogSymptomModal();
      renderHealthTabUI();
      playChime('bell');
      alertBox(`Logged ${severity} symptom: ${name}.`, "Symptom Saved");
    }
    function deleteHealthSymptom(id) {
      if (state.healthData && state.healthData.symptoms) {
        state.healthData.symptoms = state.healthData.symptoms.filter(s => s.id !== id);
        saveHealthData();
        renderHealthTabUI();
      }
    }


    function resetElasticityPatterns() {
      state.timeEstimationHistory = [];
      saveAppState();
      renderCalibrationChart();
      const listEl = document.getElementById('elasticity-insights-list');
      if (listEl) {
        listEl.innerHTML = `
          <div class="p-2.5 rounded-xl bg-dark-elevated border border-pastel-mint/30 flex items-start gap-2">
            <span class="text-pastel-mint font-bold shrink-0">🌱 Clean Baseline:</span>
            <span>All demo records cleared! As you log reality times for your events, FocusFlow will automatically calculate real elasticity drift and boundary recommendations.</span>
          </div>
        `;
      }
      playChime('bell');
      alertBox("Elasticity patterns and demo history have been reset. Calibration will now reflect your real event completions!", "Patterns Reset");
    }


    // Expanded Database of Common Whole Foods & Major Brand Groceries (Walmart, Kroger, Kirkland, etc.)
    const brandedGroceriesDatabase = [
      { name: 'Great Value Boneless Skinless Chicken Breast', kcal: 120, protein: 26, carbs: 0, fat: 1.5, fiber: 0, sodium: 70, potassium: 330, iron: 0.9, calcium: 15, brand: 'Great Value' },
      { name: 'Great Value Whole Vitamin D Milk', kcal: 150, protein: 8, carbs: 12, fat: 8, fiber: 0, sodium: 120, potassium: 350, iron: 0, calcium: 300, brand: 'Great Value' },
      { name: 'Great Value Organic Baby Spinach', kcal: 20, protein: 2, carbs: 3, fat: 0, fiber: 2, sodium: 65, potassium: 470, iron: 2.7, calcium: 99, brand: 'Great Value' },
      { name: 'Great Value Black Beans (Can)', kcal: 110, protein: 7, carbs: 20, fat: 0.5, fiber: 6, sodium: 130, potassium: 360, iron: 1.8, calcium: 40, brand: 'Great Value' },
      { name: 'Great Value Long Grain Jasmine Rice', kcal: 160, protein: 3, carbs: 36, fat: 0, fiber: 1, sodium: 0, potassium: 55, iron: 1.4, calcium: 0, brand: 'Great Value' },
      { name: 'Kirkland Signature Organic Pasture Raised Eggs', kcal: 70, protein: 6, carbs: 0, fat: 5, fiber: 0, sodium: 70, potassium: 70, iron: 0.9, calcium: 28, brand: 'Kirkland' },
      { name: 'Chobani Non-Fat Plain Greek Yogurt', kcal: 90, protein: 16, carbs: 6, fat: 0, fiber: 0, sodium: 65, potassium: 250, iron: 0, calcium: 190, brand: 'Chobani' },
      { name: 'Tyson Grilled & Ready Chicken Breast Strips', kcal: 110, protein: 21, carbs: 0, fat: 2.5, fiber: 0, sodium: 480, potassium: 310, iron: 0.7, calcium: 10, brand: 'Tyson' },
      { name: 'Barilla Whole Grain Penne Pasta', kcal: 200, protein: 8, carbs: 39, fat: 1.5, fiber: 6, sodium: 0, potassium: 220, iron: 2.5, calcium: 20, brand: 'Barilla' },
      { name: 'Quaker Old Fashioned Rolled Oats', kcal: 150, protein: 5, carbs: 27, fat: 2.5, fiber: 4, sodium: 0, potassium: 150, iron: 1.8, calcium: 20, brand: 'Quaker' },
      { name: 'Fairlife 2% Ultra-Filtered Milk', kcal: 120, protein: 13, carbs: 6, fat: 4.5, fiber: 0, sodium: 120, potassium: 400, iron: 0, calcium: 380, brand: 'Fairlife' },
      { name: 'Dave\'s Killer Bread 21 Whole Grains', kcal: 110, protein: 5, carbs: 22, fat: 1.5, fiber: 5, sodium: 170, potassium: 120, iron: 1.1, calcium: 40, brand: 'Dave\'s Killer Bread' }
    ];


    function openCustomFoodModal(query) {
      const nameIn = document.getElementById('custom-food-input-name');
      if (nameIn && query) nameIn.value = query;
      const modal = document.getElementById('custom-food-modal');
      if (modal) modal.classList.remove('hidden');
    }
    function closeCustomFoodModal() {
      const modal = document.getElementById('custom-food-modal');
      if (modal) modal.classList.add('hidden');
    }
    function saveCustomFoodToDatabase() {
      const name = (document.getElementById('custom-food-input-name').value || '').trim();
      if (!name) {
        alertBox("Please enter a food name.", "Missing Name");
        return;
      }
      const category = document.getElementById('custom-food-input-cat').value || 'produce';
      const storage = document.getElementById('custom-food-input-storage').value || 'fridge';
      const kcal = parseInt(document.getElementById('custom-food-input-kcal').value, 10) || 100;
      const protein = parseFloat(document.getElementById('custom-food-input-protein').value) || 0;
      const carbs = parseFloat(document.getElementById('custom-food-input-carbs').value) || 0;
      const fat = parseFloat(document.getElementById('custom-food-input-fat').value) || 0;

      const newFood = {
        name,
        category,
        storage,
        kcal,
        protein,
        carbs,
        fat,
        brand: 'Custom / My Pantry'
      };

      // Save to localStorage
      let customFoods = [];
      try {
        const savedCustom = localStorage.getItem('focusflow_custom_foods');
        if (savedCustom) customFoods = JSON.parse(savedCustom);
      } catch(e) {}
      customFoods.push(newFood);
      localStorage.setItem('focusflow_custom_foods', JSON.stringify(customFoods));

      // Add to state.pantry
      state.pantry.push({
        id: `p-${Date.now()}`,
        name,
        category,
        storage,
        amount: 1,
        unit: 'item',
        dateAdded: new Date().toISOString().split('T')[0],
        kcal,
        protein,
        carbs,
        fat
      });

      saveAppState();
      renderPantry();
      closeCustomFoodModal();

      const searchInput = document.getElementById('kitchen-food-search-input');
      const searchBox = document.getElementById('kitchen-search-suggestions');
      if (searchInput) searchInput.value = '';
      if (searchBox) { searchBox.innerHTML = ''; searchBox.classList.add('hidden'); }

      playChime('bell');
      alertBox(`Saved "${name}" to custom database and added to pantry!`, "Food Created");
    }
