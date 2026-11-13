// ==============================================
// BODY PROFILE, TDEE, MACRO TARGETS & WEIGHT TIMELINE (js/body-profile.js)
// ==============================================

    function selectWaterUnitSetting(unit) {
      if (!state.userProfile) state.userProfile = {};
      state.userProfile.waterUnit = unit;
      const btnFloz = document.getElementById('water-unit-btn-floz');
      const btnMl = document.getElementById('water-unit-btn-ml');
      const chkFloz = document.getElementById('water-unit-check-floz');
      const chkMl = document.getElementById('water-unit-check-ml');
      const badge = document.getElementById('profile-water-unit-badge');

      if (unit === 'ml') {
        if (btnMl) btnMl.className = "p-2.5 rounded-xl border-2 border-pastel-sky bg-pastel-sky/15 text-left transition flex items-center justify-between";
        if (btnFloz) btnFloz.className = "p-2.5 rounded-xl border border-dark-border bg-dark-elevated text-left transition flex items-center justify-between hover:border-slate-500";
        if (chkMl) chkMl.classList.remove('hidden');
        if (chkFloz) chkFloz.classList.add('hidden');
        if (badge) badge.textContent = "Active: Milliliters (ml)";
      } else {
        if (btnFloz) btnFloz.className = "p-2.5 rounded-xl border-2 border-pastel-sky bg-pastel-sky/15 text-left transition flex items-center justify-between";
        if (btnMl) btnMl.className = "p-2.5 rounded-xl border border-dark-border bg-dark-elevated text-left transition flex items-center justify-between hover:border-slate-500";
        if (chkFloz) chkFloz.classList.remove('hidden');
        if (chkMl) chkMl.classList.add('hidden');
        if (badge) badge.textContent = "Default: Fluid Ounces (fl oz)";
      }
    }

    function selectFrameSize(size) {
      state.userProfile.frameSize = size;
      ['small', 'medium', 'large'].forEach(s => {
        const btn = document.getElementById(`frame-btn-${s}`);
        if (!btn) return;
        if (s === size) {
          btn.className = "p-2.5 rounded-xl border-2 border-pastel-lavender bg-pastel-lavender/10 text-center transition";
        } else {
          btn.className = "p-2.5 rounded-xl border border-dark-border bg-dark-base text-center transition";
        }
      });
      recalculateHealthTargets();
    }

    




    // ========================================================
    // MACRONUTRIENT ADJUSTMENT CONTROLLER & TWO-WAY SYNC
    // ========================================================
    let modalMacroState = null;

    function initModalMacroState() {
      const p = state.userProfile || {};
      const targetKcal = p.dailyCaloriesTarget || 2130;
      const protPct = (p.macroPercentages && p.macroPercentages.protein !== undefined) ? p.macroPercentages.protein : 25;
      const carbsPct = (p.macroPercentages && p.macroPercentages.carbs !== undefined) ? p.macroPercentages.carbs : 45;
      const fatPct = (p.macroPercentages && p.macroPercentages.fat !== undefined) ? p.macroPercentages.fat : 30;

      modalMacroState = {
        isManualOverride: p.macroIsManualOverride || false,
        preset: p.macroDistributionPreset || 'balanced',
        proteinPct: protPct,
        carbsPct: carbsPct,
        fatPct: fatPct,
        proteinG: p.dailyProteinTarget || Math.round((targetKcal * (protPct / 100)) / 4),
        carbsG: p.dailyCarbsTarget || Math.round((targetKcal * (carbsPct / 100)) / 4),
        fatG: p.dailyFatTarget || Math.round((targetKcal * (fatPct / 100)) / 9),
        fiberG: p.dailyFiberTarget || Math.round((targetKcal / 1000) * 14)
      };
      syncMacroPresetButtons(modalMacroState.preset);
    }

    function getCalculatedTargetKcal() {
      const frame = (state.userProfile && state.userProfile.frameSize) || 'large';
      const height = parseFloat(document.getElementById('profile-height') ? document.getElementById('profile-height').value : (state.userProfile && state.userProfile.heightInches)) || 67;
      const current = parseFloat(document.getElementById('profile-current-weight') ? document.getElementById('profile-current-weight').value : (state.userProfile && state.userProfile.currentWeightLbs)) || 175;
      const targetWeight = parseFloat(document.getElementById('profile-target-weight') ? document.getElementById('profile-target-weight').value : (state.userProfile && state.userProfile.targetWeightLbs)) || 165;
      const activityEl = document.getElementById('profile-activity');
      const activity = activityEl ? activityEl.value : ((state.userProfile && state.userProfile.activityLevel) || 'light');
      const pace = state.weightGoal && state.weightGoal.weeklyPaceLbs !== undefined ? state.weightGoal.weeklyPaceLbs : 0.25;

      const frameMultiplier = frame === 'large' ? 1.12 : (frame === 'medium' ? 1.0 : 0.92);
      const currentWeightKg = current * 0.453592;
      const heightCm = height * 2.54;
      const baseBmrCurrent = (10 * currentWeightKg) + (6.25 * heightCm) - (5 * 30) - 161;
      const calibratedBmrCurrent = baseBmrCurrent * frameMultiplier;
      const actMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, high: 1.725 };
      const baselineTdee = Math.round(calibratedBmrCurrent * (actMultipliers[activity] || 1.375));

      let calAdjustment = 0;
      if (current > targetWeight && pace > 0) {
        calAdjustment = -Math.round(pace * 500);
      } else if (current < targetWeight && pace > 0) {
        calAdjustment = Math.round(pace * 400);
      }
      return Math.max(1400, baselineTdee + calAdjustment);
    }

    function syncModalMacroInputs() {
      if (!modalMacroState) return;
      const protPctEl = document.getElementById('macro-input-prot-pct');
      const protGEl = document.getElementById('macro-input-prot-g');
      const protKcalEl = document.getElementById('macro-calc-prot-kcal');

      const carbPctEl = document.getElementById('macro-input-carb-pct');
      const carbGEl = document.getElementById('macro-input-carb-g');
      const carbKcalEl = document.getElementById('macro-calc-carb-kcal');

      const fatPctEl = document.getElementById('macro-input-fat-pct');
      const fatGEl = document.getElementById('macro-input-fat-g');
      const fatKcalEl = document.getElementById('macro-calc-fat-kcal');

      const fiberGEl = document.getElementById('macro-input-fiber-g');

      if (protPctEl && document.activeElement !== protPctEl) protPctEl.value = modalMacroState.proteinPct;
      if (protGEl && document.activeElement !== protGEl) protGEl.value = modalMacroState.proteinG;
      if (protKcalEl) protKcalEl.textContent = `${modalMacroState.proteinG * 4} kcal (4 kcal/g)`;

      if (carbPctEl && document.activeElement !== carbPctEl) carbPctEl.value = modalMacroState.carbsPct;
      if (carbGEl && document.activeElement !== carbGEl) carbGEl.value = modalMacroState.carbsG;
      if (carbKcalEl) carbKcalEl.textContent = `${modalMacroState.carbsG * 4} kcal (4 kcal/g)`;

      if (fatPctEl && document.activeElement !== fatPctEl) fatPctEl.value = modalMacroState.fatPct;
      if (fatGEl && document.activeElement !== fatGEl) fatGEl.value = modalMacroState.fatG;
      if (fatKcalEl) fatKcalEl.textContent = `${modalMacroState.fatG * 9} kcal (9 kcal/g)`;

      if (fiberGEl && document.activeElement !== fiberGEl) fiberGEl.value = modalMacroState.fiberG;

      // Update total percentage badge and auto-normalize button
      const totalPct = Math.round(modalMacroState.proteinPct + modalMacroState.carbsPct + modalMacroState.fatPct);
      const badge = document.getElementById('macro-total-pct-badge');
      const normBtn = document.getElementById('btn-normalize-macros');

      if (badge) {
        if (totalPct === 100) {
          badge.textContent = "100% Total (Balanced)";
          badge.className = "text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold whitespace-nowrap";
          if (normBtn) normBtn.classList.add('hidden');
        } else {
          badge.textContent = `${totalPct}% Total (${totalPct > 100 ? '+' + (totalPct - 100) : (totalPct - 100)}%)`;
          badge.className = "text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold whitespace-nowrap";
          if (normBtn) normBtn.classList.remove('hidden');
        }
      }
    }

    function onMacroPercentInput(macroKey, val) {
      if (!modalMacroState) initModalMacroState();
      const num = Math.max(0, Math.min(100, parseFloat(val) || 0));
      if (macroKey === 'protein') modalMacroState.proteinPct = num;
      if (macroKey === 'carbs') modalMacroState.carbsPct = num;
      if (macroKey === 'fat') modalMacroState.fatPct = num;

      modalMacroState.isManualOverride = false;
      modalMacroState.preset = 'custom';
      syncMacroPresetButtons('custom');

      const targetKcal = getCalculatedTargetKcal();
      if (macroKey === 'protein') modalMacroState.proteinG = Math.round((targetKcal * (modalMacroState.proteinPct / 100)) / 4);
      if (macroKey === 'carbs') modalMacroState.carbsG = Math.round((targetKcal * (modalMacroState.carbsPct / 100)) / 4);
      if (macroKey === 'fat') modalMacroState.fatG = Math.round((targetKcal * (modalMacroState.fatPct / 100)) / 9);

      syncModalMacroInputs();
    }

    function onMacroGramInput(macroKey, val) {
      if (!modalMacroState) initModalMacroState();
      const grams = Math.max(0, parseFloat(val) || 0);
      if (macroKey === 'protein') modalMacroState.proteinG = grams;
      if (macroKey === 'carbs') modalMacroState.carbsG = grams;
      if (macroKey === 'fat') modalMacroState.fatG = grams;

      modalMacroState.isManualOverride = true;
      modalMacroState.preset = 'custom';
      syncMacroPresetButtons('custom');

      const pKcal = modalMacroState.proteinG * 4;
      const cKcal = modalMacroState.carbsG * 4;
      const fKcal = modalMacroState.fatG * 9;
      const totalFromMacros = pKcal + cKcal + fKcal;

      if (totalFromMacros > 0) {
        modalMacroState.proteinPct = Math.round((pKcal / totalFromMacros) * 100);
        modalMacroState.carbsPct = Math.round((cKcal / totalFromMacros) * 100);
        modalMacroState.fatPct = Math.max(0, 100 - modalMacroState.proteinPct - modalMacroState.carbsPct);
      }

      syncModalMacroInputs();
    }

    function onMacroFiberInput(val) {
      if (!modalMacroState) initModalMacroState();
      modalMacroState.fiberG = Math.max(0, parseFloat(val) || 0);
    }

    function applyMacroPreset(presetKey) {
      if (!modalMacroState) initModalMacroState();
      modalMacroState.preset = presetKey;
      modalMacroState.isManualOverride = false;

      if (presetKey === 'balanced') {
        modalMacroState.proteinPct = 25;
        modalMacroState.carbsPct = 45;
        modalMacroState.fatPct = 30;
      } else if (presetKey === 'high_protein') {
        modalMacroState.proteinPct = 35;
        modalMacroState.carbsPct = 40;
        modalMacroState.fatPct = 25;
      } else if (presetKey === 'low_carb') {
        modalMacroState.proteinPct = 30;
        modalMacroState.carbsPct = 20;
        modalMacroState.fatPct = 50;
      } else if (presetKey === 'endurance') {
        modalMacroState.proteinPct = 20;
        modalMacroState.carbsPct = 55;
        modalMacroState.fatPct = 25;
      }

      syncMacroPresetButtons(presetKey);
      const targetKcal = getCalculatedTargetKcal();
      modalMacroState.proteinG = Math.round((targetKcal * (modalMacroState.proteinPct / 100)) / 4);
      modalMacroState.carbsG = Math.round((targetKcal * (modalMacroState.carbsPct / 100)) / 4);
      modalMacroState.fatG = Math.round((targetKcal * (modalMacroState.fatPct / 100)) / 9);
      modalMacroState.fiberG = Math.round((targetKcal / 1000) * 14);

      syncModalMacroInputs();
      playChime('pop');
    }

    function normalizeMacroPercentages() {
      if (!modalMacroState) return;
      const sum = modalMacroState.proteinPct + modalMacroState.carbsPct + modalMacroState.fatPct;
      if (sum <= 0) return;
      modalMacroState.proteinPct = Math.round((modalMacroState.proteinPct / sum) * 100);
      modalMacroState.carbsPct = Math.round((modalMacroState.carbsPct / sum) * 100);
      modalMacroState.fatPct = Math.max(0, 100 - modalMacroState.proteinPct - modalMacroState.carbsPct);

      const targetKcal = getCalculatedTargetKcal();
      modalMacroState.proteinG = Math.round((targetKcal * (modalMacroState.proteinPct / 100)) / 4);
      modalMacroState.carbsG = Math.round((targetKcal * (modalMacroState.carbsPct / 100)) / 4);
      modalMacroState.fatG = Math.round((targetKcal * (modalMacroState.fatPct / 100)) / 9);

      syncModalMacroInputs();
      playChime('bell');
    }

    function syncMacroPresetButtons(activeKey) {
      ['balanced', 'high_protein', 'low_carb', 'endurance'].forEach(k => {
        const btn = document.getElementById(`macro-preset-${k}`);
        if (!btn) return;
        if (k === activeKey) {
          btn.className = "px-2.5 py-1 rounded-lg border-2 border-pastel-mint bg-pastel-mint/15 text-pastel-mint font-bold transition shadow-sm";
        } else {
          btn.className = "px-2.5 py-1 rounded-lg border border-dark-border bg-dark-elevated text-slate-300 hover:border-slate-500 font-semibold transition";
        }
      });
    }
    
    function openBodyProfileModal() {
      const modal = document.getElementById('body-profile-modal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.scrollTop = 0;
      }
      if (state.userProfile) {
        if (state.userProfile.heightInches && document.getElementById('profile-height')) {
          document.getElementById('profile-height').value = state.userProfile.heightInches;
        }
        if (state.userProfile.currentWeightLbs && document.getElementById('profile-current-weight')) {
          document.getElementById('profile-current-weight').value = state.userProfile.currentWeightLbs;
        }
        if (state.userProfile.targetWeightLbs && document.getElementById('profile-target-weight')) {
          document.getElementById('profile-target-weight').value = state.userProfile.targetWeightLbs;
        }
        if (state.userProfile.activityLevel && document.getElementById('profile-activity')) {
          document.getElementById('profile-activity').value = state.userProfile.activityLevel;
        }
        if (state.userProfile.frameSize) {
          selectFrameSize(state.userProfile.frameSize);
        }
        selectWaterUnitSetting(state.userProfile.waterUnit || 'fl_oz');
      } else {
        selectWaterUnitSetting('fl_oz');
      }

      const pace = (state.weightGoal && state.weightGoal.weeklyPaceLbs !== undefined) 
        ? state.weightGoal.weeklyPaceLbs 
        : (state.userProfile && state.userProfile.weeklyPaceLbs !== undefined ? state.userProfile.weeklyPaceLbs : 0.5);
      syncPaceUI(pace);

      // Sync OCD checkboxes
      const lockCb = document.getElementById('profile-goal-lock-checkbox');
      if (lockCb) lockCb.checked = !!(state.ocdSettings && state.ocdSettings.goalLock);
      const flexCb = document.getElementById('profile-flexible-ranges-checkbox');
      if (flexCb) flexCb.checked = state.ocdSettings ? !!state.ocdSettings.flexibleRanges : true;

      initModalMacroState();
      recalculateHealthTargets();
      if (window.lucide) lucide.createIcons();
      playChime('bell');

      if (state.ocdSettings && state.ocdSettings.goalLock && state.ocdSettings.lockedUntil) {
        const today = new Date().toISOString().split('T')[0];
        if (today <= state.ocdSettings.lockedUntil) {
          alertBox(`Goal consistency lock is active until ${state.ocdSettings.lockedUntil}. Pausing to reflect prevents compulsive second-guessing. You can ride the urge or uncheck the lock below.`, "14-Day Consistency Guard");
        }
      }
    }

    function closeBodyProfileModal() {
      const modal = document.getElementById('body-profile-modal');
      if (modal) modal.classList.add('hidden');
    }
    
    
    // Color-Coded BMI Continuum Engine
    function updateBmiScaleUI(currentBmi, targetBmi, currentWeight, targetWeight, height, frame) {
      const curB = parseFloat(currentBmi) || 27.4;
      const tgtB = parseFloat(targetBmi) || 25.8;
      const curW = parseFloat(currentWeight) || 175;
      const tgtW = parseFloat(targetWeight) || 165;
      const ht = parseFloat(height) || 67;
      const fr = frame || 'large';

      // BMI Scale mapping: 15.0 to 35.0 (span = 20.0)
      const minBmi = 15.0;
      const maxBmi = 35.0;
      const curPct = Math.max(12, Math.min(88, ((curB - minBmi) / (maxBmi - minBmi)) * 100));
      const tgtPct = Math.max(12, Math.min(88, ((tgtB - minBmi) / (maxBmi - minBmi)) * 100));

      // Categorize Target BMI
      let category = 'healthy';
      let catLabel = 'Healthy Optimal Zone';
      let pillClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      let targetBadgeClass = 'bg-emerald-400 text-dark-base border-emerald-300';
      let targetArrowClass = 'bg-emerald-400 border-emerald-300';
      let adviceIcon = 'check-circle-2';
      let adviceIconColor = 'text-emerald-400';
      let adviceHtml = '';

      // Threshold weights for this user's height
      const underWeightLimitLbs = Math.round((18.5 * ht * ht) / 703);
      const healthyUpperLimitLbs = Math.round((24.9 * ht * ht) / 703);
      const obeseLimitLbs = Math.round((30.0 * ht * ht) / 703);

      if (tgtB < 18.5) {
        category = 'underweight';
        catLabel = 'Underweight Zone (< 18.5)';
        pillClass = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
        targetBadgeClass = 'bg-sky-400 text-dark-base border-sky-300';
        targetArrowClass = 'bg-sky-400 border-sky-300';
        adviceIcon = 'alert-triangle';
        adviceIconColor = 'text-sky-400';
        const diffLbs = underWeightLimitLbs - tgtW;
        adviceHtml = `
          <div class="font-bold text-sky-300 flex items-center gap-1.5">
            <span>Target is in the Underweight Zone (&lt; 18.5 BMI)</span>
          </div>
          <p class="text-slate-300 text-[11px] leading-relaxed">
            Your target of <strong>${tgtW} lbs</strong> is <strong>${(18.5 - tgtB).toFixed(1)} BMI points (${diffLbs > 0 ? diffLbs : 1} lbs)</strong> below the clinical healthy threshold.
            Aiming for at least <strong>${underWeightLimitLbs} lbs</strong> (BMI 18.5) protects essential bone mineral density, vital organ insulation, and healthy hormonal balance.
          </p>
        `;
      } else if (tgtB < 25.0) {
        category = 'healthy';
        catLabel = 'Healthy Optimal Zone (18.5 – 24.9)';
        pillClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
        targetBadgeClass = 'bg-emerald-400 text-dark-base border-emerald-300';
        targetArrowClass = 'bg-emerald-400 border-emerald-300';
        adviceIcon = 'check-circle-2';
        adviceIconColor = 'text-pastel-mint';
        const aboveUnder = (tgtB - 18.5).toFixed(1);
        const belowOver = (25.0 - tgtB).toFixed(1);
        adviceHtml = `
          <div class="font-bold text-pastel-mint flex items-center gap-1.5">
            <span>Target is in the Healthy Optimal Zone (18.5 – 24.9 BMI)</span>
          </div>
          <p class="text-slate-300 text-[11px] leading-relaxed">
            Your target of <strong>${tgtW} lbs</strong> lands right in the sweet spot! You are <strong>${aboveUnder} BMI points above underweight</strong> and <strong>${belowOver} BMI points below overweight</strong>.
            This range provides sustained metabolic energy, cardiovascular resilience, and joint comfort without restrictive exhaustion.
          </p>
        `;
      } else if (tgtB < 30.0) {
        category = 'overweight';
        catLabel = 'Overweight Zone (25.0 – 29.9)';
        pillClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
        targetBadgeClass = 'bg-amber-400 text-dark-base border-amber-300';
        targetArrowClass = 'bg-amber-400 border-amber-300';
        adviceIcon = 'info';
        adviceIconColor = 'text-amber-400';
        const diffLbs = tgtW - healthyUpperLimitLbs;
        const frameNote = fr === 'large'
          ? `Because you have a <strong>broad skeletal frame</strong>, a portion of this weight represents naturally higher bone density and lean muscle mass.`
          : `For standard frames, easing toward <strong>${healthyUpperLimitLbs} lbs</strong> (BMI 24.9) reduces joint pressure and fatigue.`;
        adviceHtml = `
          <div class="font-bold text-amber-300 flex items-center gap-1.5">
            <span>Target is in the Overweight Zone (25.0 – 29.9 BMI)</span>
          </div>
          <p class="text-slate-300 text-[11px] leading-relaxed">
            Your target of <strong>${tgtW} lbs</strong> is <strong>${(tgtB - 25.0).toFixed(1)} BMI points (${diffLbs > 0 ? diffLbs : 1} lbs)</strong> into the overweight zone.
            ${frameNote} You choose the pace and target that feels best for your body!
          </p>
        `;
      } else {
        category = 'obese';
        catLabel = 'Obese Zone (≥ 30.0)';
        pillClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
        targetBadgeClass = 'bg-rose-400 text-dark-base border-rose-300';
        targetArrowClass = 'bg-rose-400 border-rose-300';
        adviceIcon = 'alert-circle';
        adviceIconColor = 'text-rose-400';
        const steppingStoneLbs = Math.round((28.0 * ht * ht) / 703);
        adviceHtml = `
          <div class="font-bold text-rose-300 flex items-center gap-1.5">
            <span>Target is in the Higher Weight Zone (≥ 30.0 BMI)</span>
          </div>
          <p class="text-slate-300 text-[11px] leading-relaxed">
            Your target of <strong>${tgtW} lbs</strong> falls in the higher BMI range. Consider an initial milestone around <strong>${steppingStoneLbs} lbs</strong> (BMI 28.0) to jumpstart your daily focus, stamina, and metabolic health.
          </p>
        `;
      }

      // Update Modal Elements
      const mTargetMarker = document.getElementById('modal-bmi-target-marker');
      if (mTargetMarker) mTargetMarker.style.left = `${tgtPct}%`;

      const mTargetVal = document.getElementById('modal-marker-target-val');
      if (mTargetVal) mTargetVal.textContent = tgtB.toFixed(1);

      const mTargetBadge = document.getElementById('modal-marker-target-badge');
      if (mTargetBadge) {
        mTargetBadge.className = `text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${targetBadgeClass} whitespace-nowrap shadow-md flex items-center gap-1`;
      }

      const mTargetArrow = document.getElementById('modal-marker-target-arrow');
      if (mTargetArrow) {
        mTargetArrow.className = `w-2 h-2 ${targetArrowClass} rotate-45 -mt-1 border-r border-b`;
      }

      const mCurMarker = document.getElementById('modal-bmi-current-marker');
      if (mCurMarker) mCurMarker.style.left = `${curPct}%`;

      const mCurVal = document.getElementById('modal-marker-current-val');
      if (mCurVal) mCurVal.textContent = curB.toFixed(1);

      const mStatusPill = document.getElementById('modal-bmi-status-pill');
      if (mStatusPill) {
        mStatusPill.className = `text-[10px] px-2.5 py-0.5 rounded-full font-bold border transition-colors duration-300 ${pillClass}`;
        mStatusPill.textContent = `Target BMI ${tgtB.toFixed(1)} • ${catLabel}`;
      }

      const mAdviceText = document.getElementById('modal-bmi-advice-text');
      if (mAdviceText) mAdviceText.innerHTML = adviceHtml;

      const mAdviceIcon = document.getElementById('modal-bmi-advice-icon');
      if (mAdviceIcon) {
        mAdviceIcon.setAttribute('data-lucide', adviceIcon);
        mAdviceIcon.className = `w-4 h-4 shrink-0 mt-0.5 ${adviceIconColor}`;
      }

      // Update Nutrition Dashboard Card Elements
      const cTargetMarker = document.getElementById('card-bmi-target-marker');
      if (cTargetMarker) cTargetMarker.style.left = `${tgtPct}%`;

      const cTargetVal = document.getElementById('card-marker-target-val');
      if (cTargetVal) cTargetVal.textContent = tgtB.toFixed(1);

      const cTargetBadge = document.getElementById('card-marker-target-badge');
      if (cTargetBadge) {
        cTargetBadge.className = `text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${targetBadgeClass} whitespace-nowrap shadow-sm flex items-center gap-0.5`;
      }

      const cTargetArrow = document.getElementById('card-marker-target-arrow');
      if (cTargetArrow) {
        cTargetArrow.className = `w-1.5 h-1.5 ${targetArrowClass} rotate-45 -mt-0.5 border-r border-b`;
      }

      const cCurMarker = document.getElementById('card-bmi-current-marker');
      if (cCurMarker) cCurMarker.style.left = `${curPct}%`;

      const cCurVal = document.getElementById('card-marker-current-val');
      if (cCurVal) cCurVal.textContent = curB.toFixed(1);

      const cStatusPill = document.getElementById('weight-card-bmi-status-pill');
      if (cStatusPill) {
        cStatusPill.className = `text-[10px] px-2 py-0.5 rounded-full font-bold border transition-colors duration-300 ${pillClass}`;
        cStatusPill.textContent = `Target BMI ${tgtB.toFixed(1)} • ${catLabel}`;
      }

      if (window.lucide) lucide.createIcons();
    }

    function recalculateHealthTargets() {
      if (!state.userProfile) state.userProfile = {};
      if (!state.weightGoal) {
        state.weightGoal = {
          currentWeightLbs: 175,
          targetWeightLbs: 165,
          suggestedWeightLbs: 155,
          weeklyPaceLbs: 1.0,
          startDate: '2026-11-01',
          targetDate: '2027-02-15'
        };
      }

      const frame = state.userProfile.frameSize || 'large';
      const height = parseFloat(document.getElementById('profile-height') ? document.getElementById('profile-height').value : state.userProfile.heightInches) || 67;
      const current = parseFloat(document.getElementById('profile-current-weight') ? document.getElementById('profile-current-weight').value : state.userProfile.currentWeightLbs) || 175;
      const targetWeight = parseFloat(document.getElementById('profile-target-weight') ? document.getElementById('profile-target-weight').value : state.userProfile.targetWeightLbs) || 165;
      const activityEl = document.getElementById('profile-activity');
      const activity = activityEl ? activityEl.value : (state.userProfile.activityLevel || 'light');

      // Update feet/inches display
      const ft = Math.floor(height / 12);
      const inc = Math.round(height % 12);
      const ftLabel = document.getElementById('profile-height-ft-label');
      if (ftLabel) ftLabel.textContent = `${ft} ft ${inc} in`;

      // BMI Calculations
      const currentBmi = ((current / (height * height)) * 703).toFixed(1);
      const targetBmi = ((targetWeight / (height * height)) * 703).toFixed(1);
      
      const curBmiLabel = document.getElementById('profile-current-bmi-label');
      if (curBmiLabel) curBmiLabel.textContent = `Current BMI: ${currentBmi}`;

      const tgtBmiLabel = document.getElementById('profile-target-bmi-label');
      if (tgtBmiLabel) tgtBmiLabel.textContent = `Target BMI: ${targetBmi}`;

      updateBmiScaleUI(currentBmi, targetBmi, current, targetWeight, height, frame);

      // Suggested Healthy Target Weight & BMI based on Frame Size
      // Healthy CDC BMI bounds: 18.5 - 24.9
      // Broad/Large frame target BMI: 23.5 - 24.9 (midpoint ~24.2, ~155 lbs at 5'7" for skeletal density & lean mass)
      // Medium frame: 21.5 - 23.5 (midpoint ~22.5)
      // Small frame: 19.5 - 21.5 (midpoint ~20.5)
      let suggestedBmiMid = 22.5;
      let minSuggestedLbs = Math.round((21.5 * height * height) / 703);
      let maxSuggestedLbs = Math.round((23.5 * height * height) / 703);

      if (frame === 'large') {
        suggestedBmiMid = 24.2;
        minSuggestedLbs = Math.round((23.5 * height * height) / 703);
        maxSuggestedLbs = Math.round((24.9 * height * height) / 703);
      } else if (frame === 'small') {
        suggestedBmiMid = 20.5;
        minSuggestedLbs = Math.round((19.5 * height * height) / 703);
        maxSuggestedLbs = Math.round((21.5 * height * height) / 703);
      }
      const suggestedTarget = Math.round((minSuggestedLbs + maxSuggestedLbs) / 2);
      state.weightGoal.suggestedWeightLbs = suggestedTarget;

      const sugRangeEl = document.getElementById('suggested-weight-range');
      if (sugRangeEl) sugRangeEl.textContent = `${minSuggestedLbs} – ${maxSuggestedLbs} lbs (BMI ~${suggestedBmiMid})`;

      const sugExpEl = document.getElementById('suggested-weight-explanation');
      if (sugExpEl) {
        sugExpEl.textContent = `Based on your ${ft}'${inc}" height and ${frame} skeletal frame, a sustainable target that supports bone density and lean muscle is approximately ${suggestedTarget} lbs. You choose what feels best for you!`;
      }

      // Synchronize button text to match the calculated target exactly
      const sugBtnEl = document.getElementById('btn-use-suggested-text');
      if (sugBtnEl) {
        sugBtnEl.textContent = `Use Suggested Target (${suggestedTarget} lbs)`;
      }

      // Timeline Calculations
      const deltaLbs = Math.abs(current - targetWeight);
      const deltaEl = document.getElementById('timeline-delta-lbs');
      if (deltaEl) {
        if (deltaLbs === 0) {
          deltaEl.textContent = "Goal reached (Maintain)";
        } else {
          deltaEl.textContent = `${deltaLbs.toFixed(1)} lbs to go`;
        }
      }

      const pace = state.weightGoal.weeklyPaceLbs !== undefined ? state.weightGoal.weeklyPaceLbs : 0.25;
      
      const slider = document.getElementById('pace-fine-slider');
      if (slider && pace > 0) slider.value = pace;
      const sliderValLabel = document.getElementById('pace-slider-val-label');
      if (sliderValLabel) {
        sliderValLabel.textContent = pace === 0 ? "0.0 lb / wk (Maintain)" : `${pace.toFixed(2)} lb / wk`;
      }

      const deficitPreviewEl = document.getElementById('pace-deficit-preview');
      const transitionTitleEl = document.getElementById('transition-card-title');
      const transitionBodyEl = document.getElementById('transition-card-body');
      const transitionCard = document.getElementById('seamless-transition-card');

      const summaryWeeksEl = document.getElementById('timeline-weeks-summary');
      const dateInput = document.getElementById('profile-target-date');

      if (pace === 0 || deltaLbs === 0) {
        if (summaryWeeksEl) {
          summaryWeeksEl.textContent = "Lifelong Maintenance (0 lb/wk • Steady Hold)";
        }
        if (deficitPreviewEl) {
          deficitPreviewEl.textContent = "Maintenance: 100% TDEE (0 kcal deficit)";
        }
        if (transitionTitleEl) {
          transitionTitleEl.textContent = "Steady Maintenance Mode Active";
        }
        if (transitionBodyEl) {
          transitionBodyEl.innerHTML = "Your daily calories are calibrated 100% to your maintenance energy requirements (TDEE). There is <strong>zero deficit</strong>, keeping your metabolism completely settled, energy high, and weight perfectly stable.";
        }
        if (transitionCard) {
          transitionCard.className = "p-3 rounded-xl bg-pastel-lavender/10 border border-pastel-lavender/30 text-[11px] leading-relaxed text-slate-300 space-y-1";
        }
      } else {
        const weeksNeeded = Math.ceil(deltaLbs / pace);
        const projDate = new Date();
        projDate.setDate(projDate.getDate() + (weeksNeeded * 7));
        const dateStr = projDate.toISOString().split('T')[0];
        const friendlyDate = projDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        state.weightGoal.targetDate = dateStr;

        if (dateInput && !dateInput.value) {
          dateInput.value = dateStr;
        }

        if (summaryWeeksEl) {
          summaryWeeksEl.textContent = `${weeksNeeded} weeks (~${friendlyDate})`;
        }

        const dailyDeficit = Math.round(pace * 500);

        if (current >= targetWeight) {
          if (deficitPreviewEl) {
            deficitPreviewEl.textContent = `~${dailyDeficit} kcal/day micro-shift (${(pace * 4).toFixed(1)} lb/mo)`;
          }

          if (pace <= 0.25) {
            if (transitionTitleEl) transitionTitleEl.textContent = "⭐️ Seamless Maintenance Glide (Ultra-Sustainable)";
            if (transitionBodyEl) {
              transitionBodyEl.innerHTML = `At <strong>${pace.toFixed(2)} lb/week (~${(pace * 4).toFixed(1)} lb/month)</strong>, your daily deficit is only <strong>~${dailyDeficit} kcal</strong> (the equivalent of one small apple or snack). Your body never senses diet restriction, lean muscle is 100% preserved, and your daily eating pattern is <strong>95% identical to permanent maintenance</strong>. When you hit your goal weight, you simply add back ~${dailyDeficit} kcal without any metabolic shock or rebound hunger!`;
            }
            if (transitionCard) {
              transitionCard.className = "p-3 rounded-xl bg-pastel-mint/10 border border-pastel-mint/30 text-[11px] leading-relaxed text-slate-300 space-y-1";
            }
          } else if (pace <= 0.50) {
            if (transitionTitleEl) transitionTitleEl.textContent = "🌿 Gentle & Steady Pacing";
            if (transitionBodyEl) {
              transitionBodyEl.innerHTML = `At <strong>${pace.toFixed(2)} lb/week (~${(pace * 4).toFixed(1)} lb/month)</strong>, your daily deficit is <strong>~${dailyDeficit} kcal</strong>. This is very sustainable, preserves focus, and leaves an easy bridge to maintenance upon goal arrival.`;
            }
            if (transitionCard) {
              transitionCard.className = "p-3 rounded-xl bg-pastel-sky/10 border border-pastel-sky/30 text-[11px] leading-relaxed text-slate-300 space-y-1";
            }
          } else if (pace <= 0.75) {
            if (transitionTitleEl) transitionTitleEl.textContent = "⚖️ Steady Moderate Pace";
            if (transitionBodyEl) {
              transitionBodyEl.innerHTML = `At <strong>${pace.toFixed(2)} lb/week</strong>, daily deficit is <strong>~${dailyDeficit} kcal</strong>. Solid momentum with manageable meal planning adjustments.`;
            }
            if (transitionCard) {
              transitionCard.className = "p-3 rounded-xl bg-pastel-butter/10 border border-pastel-butter/30 text-[11px] leading-relaxed text-slate-300 space-y-1";
            }
          } else {
            if (transitionTitleEl) transitionTitleEl.textContent = "⚡️ Standard Active Deficit";
            if (transitionBodyEl) {
              transitionBodyEl.innerHTML = `At <strong>${pace.toFixed(2)} lb/week</strong>, daily deficit is <strong>~${dailyDeficit} kcal</strong>. When you reach your target, a gradual 2–3 week step-up into maintenance is recommended to prevent water retention rebound.`;
            }
            if (transitionCard) {
              transitionCard.className = "p-3 rounded-xl bg-pastel-peach/10 border border-pastel-peach/30 text-[11px] leading-relaxed text-slate-300 space-y-1";
            }
          }
        } else {
          // Muscle / Lean mass building surplus
          const surplus = Math.round(pace * 400);
          if (deficitPreviewEl) deficitPreviewEl.textContent = `+${surplus} kcal/day clean lean-mass surplus`;
          if (transitionTitleEl) transitionTitleEl.textContent = "💪 Clean Lean-Mass Nourishment";
          if (transitionBodyEl) {
            transitionBodyEl.innerHTML = `Gradually building lean tissue at <strong>${pace.toFixed(2)} lb/week</strong> with a gentle +${surplus} kcal surplus supports bone density and strength without excess fat storage.`;
          }
        }
      }

      // Baseline Energy Targets (Mifflin-St Jeor formula)
      const frameMultiplier = frame === 'large' ? 1.12 : (frame === 'medium' ? 1.0 : 0.92);
      const currentWeightKg = current * 0.453592;
      const heightCm = height * 2.54;
      const baseBmrCurrent = (10 * currentWeightKg) + (6.25 * heightCm) - (5 * 30) - 161;
      const calibratedBmrCurrent = baseBmrCurrent * frameMultiplier;

      const actMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, high: 1.725 };
      const baselineTdee = Math.round(calibratedBmrCurrent * (actMultipliers[activity] || 1.375));

      // Deficit/surplus based on rate
      let calAdjustment = 0;
      let dailyDeficit = 0;
      if (current > targetWeight && pace > 0) {
        dailyDeficit = Math.round(pace * 500); // 500 kcal deficit = 1 lb/wk
        calAdjustment = -dailyDeficit;
      } else if (current < targetWeight && pace > 0) {
        calAdjustment = Math.round(pace * 400); // lean mass surplus
      }

      const targetKcal = Math.max(1400, baselineTdee + calAdjustment);

      // Display Baseline Maintenance Before Goal
      const baseTdeeEl = document.getElementById('calc-baseline-tdee');
      if (baseTdeeEl) baseTdeeEl.textContent = `${baselineTdee.toLocaleString()} kcal`;

      // Display Energy Deficit Goal
      const energyDeficitEl = document.getElementById('calc-energy-deficit');
      const deficitSubEl = document.getElementById('calc-deficit-subtext');
      const deficitStatusEl = document.getElementById('calc-deficit-status');
      if (energyDeficitEl) {
        if (pace === 0 || deltaLbs === 0) {
          energyDeficitEl.textContent = "0 kcal (Hold)";
          energyDeficitEl.className = "text-pastel-lavender font-bold text-xs sm:text-sm block truncate";
          if (deficitSubEl) deficitSubEl.textContent = "Steady Maintenance";
          if (deficitStatusEl) deficitStatusEl.textContent = "Zero Deficit";
        } else if (current >= targetWeight) {
          energyDeficitEl.textContent = `-${dailyDeficit} kcal`;
          energyDeficitEl.className = "text-pastel-mint font-bold text-xs sm:text-sm block truncate";
          if (deficitSubEl) deficitSubEl.textContent = `${pace.toFixed(2)} lb/wk pace`;
          if (deficitStatusEl) deficitStatusEl.textContent = pace <= 0.25 ? "Micro-shift" : (pace <= 0.5 ? "Gentle pace" : "Active deficit");
        } else {
          energyDeficitEl.textContent = `+${Math.abs(calAdjustment)} kcal`;
          energyDeficitEl.className = "text-pastel-sky font-bold text-xs sm:text-sm block truncate";
          if (deficitSubEl) deficitSubEl.textContent = `${pace.toFixed(2)} lb/wk gain`;
          if (deficitStatusEl) deficitStatusEl.textContent = "Lean surplus";
        }
      }

      const calPrev = document.getElementById('calc-calories-preview');
      if (calPrev) calPrev.textContent = `${targetKcal.toLocaleString()} kcal`;

      const frameStat = document.getElementById('calc-frame-status');
      if (frameStat) frameStat.textContent = frame === 'large' ? 'Broad Frame +12%' : (frame === 'small' ? 'Small Frame -8%' : 'Standard Frame');

      // Macronutrient Calculation & Synchronization
      if (!modalMacroState) {
        initModalMacroState();
      }

      // If user is not manually overriding weights, compute grams from percentages and targetKcal
      if (!modalMacroState.isManualOverride) {
        modalMacroState.proteinG = Math.round((targetKcal * (modalMacroState.proteinPct / 100)) / 4);
        modalMacroState.carbsG = Math.round((targetKcal * (modalMacroState.carbsPct / 100)) / 4);
        modalMacroState.fatG = Math.round((targetKcal * (modalMacroState.fatPct / 100)) / 9);
        modalMacroState.fiberG = Math.round((targetKcal / 1000) * 14);
      }

      syncModalMacroInputs();

      return {
        baselineTdee,
        dailyDeficit,
        targetKcal,
        targetProtein: modalMacroState.proteinG,
        targetCarbs: modalMacroState.carbsG,
        targetFat: modalMacroState.fatG,
        targetFiber: modalMacroState.fiberG,
        targetBmi,
        targetWeight,
        height,
        current,
        activity,
        frame
      };
    }

    function selectWeeklyPace(pace) {
      const p = parseFloat(pace);
      if (!state.weightGoal) state.weightGoal = {};
      state.weightGoal.weeklyPaceLbs = p;

      syncPaceUI(p);
      recalculateHealthTargets();
    }

    function onPaceSliderInput(val) {
      const pace = parseFloat(val);
      if (!state.weightGoal) state.weightGoal = {};
      state.weightGoal.weeklyPaceLbs = pace;

      const label = document.getElementById('pace-slider-val-label');
      if (label) label.textContent = `${pace.toFixed(2)} lb / wk`;

      syncPaceUI(pace);
      recalculateHealthTargets();
    }

    function syncPaceUI(pace) {
      const p = parseFloat(pace);
      const presets = [
        { key: '025', val: 0.25 },
        { key: '05', val: 0.5 },
        { key: '075', val: 0.75 },
        { key: '10', val: 1.0 }
      ];

      presets.forEach(item => {
        const btn = document.getElementById(`pace-btn-${item.key}`);
        if (btn) {
          if (Math.abs(item.val - p) < 0.02) {
            btn.className = "p-2.5 rounded-xl border-2 border-pastel-mint bg-pastel-mint/15 text-left transition flex flex-col justify-between shadow-sm";
            const titleSpan = btn.querySelector('span:first-child');
            if (titleSpan) titleSpan.className = "font-bold text-pastel-mint text-xs";
          } else {
            btn.className = "p-2.5 rounded-xl border border-dark-border bg-dark-elevated text-left transition flex flex-col justify-between hover:border-slate-500";
            const titleSpan = btn.querySelector('span:first-child');
            if (titleSpan) titleSpan.className = "font-bold text-white text-xs";
          }
        }
      });

      const mBtn = document.getElementById('pace-btn-maintain');
      if (mBtn) {
        if (p === 0) {
          mBtn.className = "px-2 py-0.5 rounded-lg border-2 border-pastel-lavender bg-pastel-lavender text-dark-base text-[10px] font-bold transition shadow-sm";
        } else {
          mBtn.className = "px-2 py-0.5 rounded-lg border border-pastel-lavender/40 text-pastel-lavender hover:bg-pastel-lavender/10 text-[10px] font-bold transition";
        }
      }

      const slider = document.getElementById('pace-fine-slider');
      if (slider && p > 0) slider.value = p;

      const label = document.getElementById('pace-slider-val-label');
      if (label) label.textContent = p === 0 ? "0.0 lb / wk (Maintain)" : `${p.toFixed(2)} lb / wk`;
    }

    function applySuggestedWeightGoal() {
      const sug = state.weightGoal && state.weightGoal.suggestedWeightLbs !== undefined ? state.weightGoal.suggestedWeightLbs : 155;
      const targetInput = document.getElementById('profile-target-weight');
      if (targetInput) targetInput.value = sug;
      recalculateHealthTargets();
      playChime('bell');
      alertBox(`Target weight updated to recommended ${sug} lbs.`, "Target Advisor");
    }

    function onTargetDateChanged() {
      const dateInput = document.getElementById('profile-target-date');
      if (!dateInput || !dateInput.value) return;

      const chosenDate = new Date(dateInput.value + 'T00:00:00');
      const today = new Date();
      const diffTime = chosenDate - today;
      const diffDays = Math.max(7, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const diffWeeks = diffDays / 7;

      const current = parseFloat(document.getElementById('profile-current-weight').value) || 175;
      const target = parseFloat(document.getElementById('profile-target-weight').value) || 165;
      const delta = Math.abs(current - target);

      const calculatedPace = (delta / diffWeeks).toFixed(2);
      state.weightGoal.weeklyPaceLbs = parseFloat(calculatedPace);
      state.weightGoal.targetDate = dateInput.value;

      const summaryWeeksEl = document.getElementById('timeline-weeks-summary');
      if (summaryWeeksEl) {
        const friendly = chosenDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        summaryWeeksEl.textContent = `${Math.ceil(diffWeeks)} wks (${calculatedPace} lb/wk) • ${friendly}`;
      }

      recalculateHealthTargets();
    }

    function applyBodyProfileGoals() {
      const { baselineTdee, dailyDeficit, targetKcal, targetWeight, height, current, activity, frame, targetBmi } = recalculateHealthTargets();

      const paceEl = document.getElementById('pace-fine-slider');
      const pace = (state.weightGoal && state.weightGoal.weeklyPaceLbs !== undefined) 
        ? state.weightGoal.weeklyPaceLbs 
        : (paceEl ? parseFloat(paceEl.value) : 0.5);

      state.userProfile.heightInches = height;
      state.userProfile.currentWeightLbs = current;
      state.userProfile.targetWeightLbs = targetWeight;
      state.userProfile.activityLevel = activity;
      state.userProfile.frameSize = frame;
      state.userProfile.weeklyPaceLbs = pace;
      state.userProfile.baselineMaintenanceKcal = baselineTdee;
      state.userProfile.dailyEnergyDeficitKcal = dailyDeficit;
      state.userProfile.dailyCaloriesTarget = targetKcal;

      if (modalMacroState) {
        state.userProfile.dailyProteinTarget = modalMacroState.proteinG;
        state.userProfile.dailyCarbsTarget = modalMacroState.carbsG;
        state.userProfile.dailyFatTarget = modalMacroState.fatG;
        state.userProfile.dailyFiberTarget = modalMacroState.fiberG;
        state.userProfile.macroPercentages = {
          protein: modalMacroState.proteinPct,
          carbs: modalMacroState.carbsPct,
          fat: modalMacroState.fatPct
        };
        state.userProfile.macroDistributionPreset = modalMacroState.preset;
        state.userProfile.macroIsManualOverride = modalMacroState.isManualOverride;
      }

      if (!state.weightGoal) state.weightGoal = {};
      state.weightGoal.currentWeightLbs = current;
      state.weightGoal.targetWeightLbs = targetWeight;
      state.weightGoal.weeklyPaceLbs = pace;
      state.weightGoal.targetBmi = targetBmi;

      const dateInput = document.getElementById('profile-target-date');
      if (dateInput && dateInput.value) {
        state.weightGoal.targetDate = dateInput.value;
      }

      // OCD Consistency & Range Settings
      const lockCb = document.getElementById('profile-goal-lock-checkbox');
      const flexCb = document.getElementById('profile-flexible-ranges-checkbox');
      if (!state.ocdSettings) state.ocdSettings = { flexibleRanges: true, goalLock: false, lockedUntil: null, completedSurfsCount: 3 };
      
      if (lockCb) {
        state.ocdSettings.goalLock = lockCb.checked;
        if (lockCb.checked) {
          const lockDate = new Date();
          lockDate.setDate(lockDate.getDate() + 14);
          state.ocdSettings.lockedUntil = lockDate.toISOString().split('T')[0];
        } else {
          state.ocdSettings.lockedUntil = null;
        }
      }
      if (flexCb) {
        state.ocdSettings.flexibleRanges = flexCb.checked;
      }

      // Fully persist app state to localStorage
      saveAppState();
      
      closeBodyProfileModal();
      renderWeightGoalTimeline();
      renderNutrition();
      playChime('bell');

      const lockNotice = (state.ocdSettings && state.ocdSettings.goalLock) ? " 🔒 Goal locked for 14-day consistency." : "";
      alertBox(`Target saved permanently! Baseline: ${baselineTdee} kcal • Deficit: ${dailyDeficit > 0 ? '-' + dailyDeficit : '0'} kcal • Goal: ${targetKcal} kcal (${state.userProfile.dailyProteinTarget}g P / ${state.userProfile.dailyCarbsTarget}g C / ${state.userProfile.dailyFatTarget}g F).${lockNotice}`, "Nutrition Profile Saved");
    }

    function renderWeightGoalTimeline() {
      const g = state.weightGoal || { currentWeightLbs: 175, targetWeightLbs: 165, weeklyPaceLbs: 0.5, targetDate: '2027-02-15' };
      const cur = state.userProfile ? (state.userProfile.currentWeightLbs || g.currentWeightLbs) : g.currentWeightLbs;
      const tgt = state.userProfile ? (state.userProfile.targetWeightLbs || g.targetWeightLbs) : g.targetWeightLbs;
      const ht = state.userProfile ? (state.userProfile.heightInches || 67) : 67;

      const targetBmi = ((tgt / (ht * ht)) * 703).toFixed(1);
      const currentBmi = ((cur / (ht * ht)) * 703).toFixed(1);
      const delta = Math.abs(cur - tgt).toFixed(1);
      const frame = state.userProfile ? (state.userProfile.frameSize || 'large') : 'large';
      updateBmiScaleUI(currentBmi, targetBmi, cur, tgt, ht, frame);

      const paceVal = g.weeklyPaceLbs !== undefined ? g.weeklyPaceLbs : 0.5;
      const paceBadge = document.getElementById('weight-card-pace-badge');
      if (paceBadge) {
        if (paceVal === 0) {
          paceBadge.textContent = 'Maintain (0 lb/wk)';
          paceBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-pastel-lavender/20 text-pastel-lavender border border-pastel-lavender/30 font-semibold font-mono';
        } else if (paceVal <= 0.25) {
          paceBadge.textContent = `${paceVal} lb/wk (Micro)`;
          paceBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-pastel-mint/20 text-pastel-mint border border-pastel-mint/30 font-semibold font-mono';
        } else {
          paceBadge.textContent = `${paceVal} lb/wk`;
          paceBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-pastel-mint/20 text-pastel-mint border border-pastel-mint/30 font-semibold font-mono';
        }
      }

      const bmiBadge = document.getElementById('weight-card-bmi-badge');
      if (bmiBadge) bmiBadge.textContent = `Target BMI ${targetBmi}`;

      const sumLabel = document.getElementById('weight-card-summary');
      if (sumLabel) sumLabel.textContent = `Current: ${cur} lbs ➔ Goal: ${tgt} lbs (${delta} lbs to go)`;

      const curLabel = document.getElementById('weight-card-current-label');
      if (curLabel) curLabel.textContent = `Start: ${cur} lbs`;

      const tgtLabel = document.getElementById('weight-card-target-label');
      if (tgtLabel) tgtLabel.textContent = `Target: ${tgt} lbs`;

      const dateLabel = document.getElementById('weight-card-target-date-label');
      if (dateLabel) {
        if (paceVal === 0 || delta === 0) {
          dateLabel.textContent = 'Mode: Lifelong Maintenance & Balance';
        } else if (g.targetDate) {
          const d = new Date(g.targetDate + 'T00:00:00');
          const friendly = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const weeks = Math.max(1, Math.ceil(delta / paceVal));
          dateLabel.textContent = `Projected: ${friendly} (${weeks} wks)`;
        }
      }

      const bar = document.getElementById('weight-card-progress-bar');
      if (bar) {
        // Calculate progress percentage
        const start = g.startWeight || (tgt < cur ? cur + 5 : cur - 5);
        const totalJourney = Math.abs(start - tgt);
        const accomplished = Math.abs(start - cur);
        const pct = totalJourney > 0 ? Math.min(100, Math.max(5, Math.round((accomplished / totalJourney) * 100))) : 25;
        bar.style.width = `${pct}%`;
      }

      // Update Lock & Range badges on Daily Energy Target Card
      const lockBadge = document.getElementById('weight-card-lock-badge');
      const rangeBadge = document.getElementById('weight-card-range-badge');
      const isLocked = state.ocdSettings && state.ocdSettings.goalLock;
      const isFlex = state.ocdSettings && state.ocdSettings.flexibleRanges;

      if (lockBadge) {
        if (isLocked) {
          lockBadge.classList.remove('hidden');
          lockBadge.classList.add('inline-flex');
        } else {
          lockBadge.classList.add('hidden');
          lockBadge.classList.remove('inline-flex');
        }
      }

      if (rangeBadge) {
        if (isFlex) {
          rangeBadge.classList.remove('hidden');
          rangeBadge.classList.add('inline-flex');
        } else {
          rangeBadge.classList.add('hidden');
          rangeBadge.classList.remove('inline-flex');
        }
      }

      // Update Energy Targets strip on the Weight Goal Card
      const prof = state.userProfile || {};
      const baseEl = document.getElementById('weight-card-baseline-kcal');
      const defEl = document.getElementById('weight-card-deficit-kcal');
      const defSub = document.getElementById('weight-card-deficit-sub');
      const tgtCalEl = document.getElementById('weight-card-target-kcal');
      const macroSplitEl = document.getElementById('weight-card-macros-split');

      const baselineKcal = prof.baselineMaintenanceKcal || 2380;
      const targetCalories = prof.dailyCaloriesTarget || 2130;
      const deficitKcal = baselineKcal - targetCalories;

      if (baseEl) baseEl.textContent = `${baselineKcal.toLocaleString()} kcal`;
      if (defEl) {
        if (paceVal === 0 || delta == 0 || deficitKcal === 0) {
          defEl.textContent = "0 kcal (Hold)";
          defEl.className = "text-pastel-lavender font-bold text-xs sm:text-sm my-0.5 truncate";
          if (defSub) defSub.textContent = "Maintenance";
        } else if (cur >= tgt) {
          defEl.textContent = `-${Math.abs(deficitKcal)} kcal`;
          defEl.className = "text-pastel-mint font-bold text-xs sm:text-sm my-0.5 truncate";
          if (defSub) defSub.textContent = `Pace: ${paceVal.toFixed(2)} lb/wk`;
        } else {
          defEl.textContent = `+${Math.abs(deficitKcal)} kcal`;
          defEl.className = "text-pastel-sky font-bold text-xs sm:text-sm my-0.5 truncate";
          if (defSub) defSub.textContent = `Surplus: ${paceVal.toFixed(2)} lb/wk`;
        }
      }

      if (tgtCalEl) {
        if (isFlex) {
          const minCal = Math.round(targetCalories * 0.95);
          const maxCal = Math.round(targetCalories * 1.05);
          tgtCalEl.textContent = `${minCal.toLocaleString()} – ${maxCal.toLocaleString()} kcal`;
        } else {
          tgtCalEl.textContent = `${targetCalories.toLocaleString()} kcal`;
        }
      }

      if (macroSplitEl) {
        const pG = prof.dailyProteinTarget || 135;
        const cG = prof.dailyCarbsTarget || 240;
        const fG = prof.dailyFatTarget || 71;
        if (isFlex) {
          macroSplitEl.textContent = `${pG - 10}–${pG + 10}g P • ${cG - 15}–${cG + 15}g C • ${fG - 5}–${fG + 5}g F`;
        } else {
          macroSplitEl.textContent = `${pG}g P • ${cG}g C • ${fG}g F`;
        }
      }
    }


if (typeof window !== 'undefined') {
  window.selectWaterUnitSetting = selectWaterUnitSetting;
  window.selectFrameSize = selectFrameSize;
  window.initModalMacroState = initModalMacroState;
  window.getCalculatedTargetKcal = getCalculatedTargetKcal;
  window.syncModalMacroInputs = syncModalMacroInputs;
  window.onMacroPercentInput = onMacroPercentInput;
  window.onMacroGramInput = onMacroGramInput;
  window.onMacroFiberInput = onMacroFiberInput;
  window.applyMacroPreset = applyMacroPreset;
  window.normalizeMacroPercentages = normalizeMacroPercentages;
  window.syncMacroPresetButtons = syncMacroPresetButtons;
  window.openBodyProfileModal = openBodyProfileModal;
  window.closeBodyProfileModal = closeBodyProfileModal;
  window.updateBmiScaleUI = updateBmiScaleUI;
  window.recalculateHealthTargets = recalculateHealthTargets;
  window.selectWeeklyPace = selectWeeklyPace;
  window.onPaceSliderInput = onPaceSliderInput;
  window.syncPaceUI = syncPaceUI;
  window.applySuggestedWeightGoal = applySuggestedWeightGoal;
  window.onTargetDateChanged = onTargetDateChanged;
  window.applyBodyProfileGoals = applyBodyProfileGoals;
  window.renderWeightGoalTimeline = renderWeightGoalTimeline;
}
