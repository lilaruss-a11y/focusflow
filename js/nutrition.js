// ==============================================
// EXTENDED NUTRITION RENDERING & BIOMARKER LOG
// ==============================================

    function getNutrientProgressColor(current, target, isUpperLimit = false) {
      if (!target || target <= 0) return { barClass: 'bg-slate-500', textClass: 'text-slate-300', status: 'neutral' };
      const pct = (current / target) * 100;
      if (isUpperLimit) {
        if (pct > 100) return { barClass: 'bg-rose-500', textClass: 'text-rose-400', status: 'over' };
        if (pct >= 80) return { barClass: 'bg-amber-400', textClass: 'text-amber-300', status: 'close' };
        return { barClass: 'bg-emerald-400', textClass: 'text-emerald-300', status: 'optimal' };
      } else {
        if (pct > 115) return { barClass: 'bg-rose-500', textClass: 'text-rose-400', status: 'too_much' };
        if (pct >= 90) return { barClass: 'bg-emerald-400', textClass: 'text-emerald-300', status: 'correct' };
        return { barClass: 'bg-slate-500', textClass: 'text-slate-400', status: 'need_more' };
      }
    }

    function renderCronometerMacroDonut(kcal, pG, cG, fG, targetKcal) {
      const container = document.getElementById('cronometer-macro-donut-container');
      if (!container) return;

      const pKcal = pG * 4;
      const cKcal = cG * 4;
      const fKcal = fG * 9;
      const macroSum = pKcal + cKcal + fKcal;

      const pPct = macroSum > 0 ? Math.round((pKcal / macroSum) * 100) : 0;
      const cPct = macroSum > 0 ? Math.round((cKcal / macroSum) * 100) : 0;
      const fPct = macroSum > 0 ? Math.max(0, 100 - pPct - cPct) : 0;

      const r = 38;
      const circ = 2 * Math.PI * r; // ~238.76
      const pDash = (pPct / 100) * circ;
      const cDash = (cPct / 100) * circ;
      const fDash = (fPct / 100) * circ;

      const pOffset = 0;
      const cOffset = -pDash;
      const fOffset = -(pDash + cDash);

      const targetVal = targetKcal || 2130;
      const pctOfTarget = Math.round((kcal / targetVal) * 100);
      const colorCal = getNutrientProgressColor(kcal, targetVal, false);

      // Protein = Pastel Coral (#fca5a5), Carbs = Pastel Mint (#6ee7b7), Fat = Pastel Butter (#fde047)
      container.innerHTML = `
        <svg class="w-20 h-20 sm:w-28 sm:h-28 transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="${r}" fill="none" stroke="#1e293b" stroke-width="9" />
          ${macroSum > 0 ? `
            <circle cx="50" cy="50" r="${r}" fill="none" stroke="#fca5a5" stroke-width="9" stroke-dasharray="${pDash} ${circ - pDash}" stroke-dashoffset="${pOffset}" />
            <circle cx="50" cy="50" r="${r}" fill="none" stroke="#6ee7b7" stroke-width="9" stroke-dasharray="${cDash} ${circ - cDash}" stroke-dashoffset="${cOffset}" />
            <circle cx="50" cy="50" r="${r}" fill="none" stroke="#fde047" stroke-width="9" stroke-dasharray="${fDash} ${circ - fDash}" stroke-dashoffset="${fOffset}" />
          ` : ''}
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span class="text-xs sm:text-base font-black text-white font-mono leading-none">${kcal.toLocaleString()}</span>
          <span class="text-[8px] sm:text-[9px] text-slate-400 font-mono mt-0.5">kcal total</span>
          <span class="text-[8px] sm:text-[9px] font-bold ${colorCal.textClass} font-mono">${pctOfTarget}%</span>
        </div>
      `;

      const pLbl = document.getElementById('donut-p-label');
      if (pLbl) pLbl.textContent = `${Math.round(pG)}g`;
      const cLbl = document.getElementById('donut-c-label');
      if (cLbl) cLbl.textContent = `${Math.round(cG)}g`;
      const fLbl = document.getElementById('donut-f-label');
      if (fLbl) fLbl.textContent = `${Math.round(fG)}g`;

      const targetLabel = document.getElementById('donut-target-kcal-label');
      if (targetLabel) targetLabel.textContent = `${targetVal.toLocaleString()} kcal`;
      const netStatus = document.getElementById('donut-net-status');
      if (netStatus) {
        if (pctOfTarget >= 90 && pctOfTarget <= 115) {
          netStatus.textContent = `✓ Goal met (${pctOfTarget}%)`;
          netStatus.className = "text-[10px] font-mono text-emerald-400 font-bold truncate";
        } else if (pctOfTarget > 115) {
          netStatus.textContent = `⚠️ Over target (${pctOfTarget}%)`;
          netStatus.className = "text-[10px] font-mono text-rose-400 font-bold truncate";
        } else {
          netStatus.textContent = `${pctOfTarget}% of ${targetVal} kcal`;
          netStatus.className = "text-[10px] font-mono text-slate-400 truncate";
        }
      }
    }

    function renderWaterIntakeDonut(currentMl, targetMl, unit = 'fl_oz') {
      const container = document.getElementById('water-donut-container');
      if (!container) return;

      const tgt = targetMl || 2700;
      const pct = Math.min(100, Math.round((currentMl / tgt) * 100));
      const r = 38;
      const circ = 2 * Math.PI * r;
      const dash = (pct / 100) * circ;

      // Water = Pastel Sky (#7dd3fc)
      const color = '#7dd3fc';
      const curOz = Math.round((currentMl || 0) / 29.5735);

      container.innerHTML = `
        <svg class="w-20 h-20 sm:w-28 sm:h-28 transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="${r}" fill="none" stroke="#1e293b" stroke-width="9" />
          <circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="9" stroke-dasharray="${dash} ${circ - dash}" stroke-dashoffset="0" stroke-linecap="round" />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span class="text-xs sm:text-base font-black text-white font-mono leading-none">${pct}%</span>
          <span class="text-[8px] sm:text-[9px] text-pastel-sky font-semibold mt-0.5">${unit === 'fl_oz' ? `${curOz} oz` : `${Math.round(currentMl)} ml`}</span>
        </div>
      `;
    }

    function renderRemainingCaloriesDonut(consumedKcal, targetKcal) {
      const container = document.getElementById('remaining-calories-donut-container');
      if (!container) return;

      const targetVal = targetKcal || 2130;
      const consumed = Math.max(0, consumedKcal || 0);
      const remaining = targetVal - consumed;
      const isOver = remaining < 0;
      const overKcal = Math.abs(remaining);

      const r = 38;
      const circ = 2 * Math.PI * r; // ~238.76
      const pct = Math.min(100, Math.round((consumed / targetVal) * 100));
      const dash = (pct / 100) * circ;
      // Energy = Pastel Lavender (#c4b5fd), switches to Pastel Coral (#fca5a5) when over budget
      const color = isOver ? '#fca5a5' : '#c4b5fd';

      container.innerHTML = `
        <svg class="w-20 h-20 sm:w-28 sm:h-28 transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="${r}" fill="none" stroke="#1e293b" stroke-width="9" />
          <circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="9" stroke-dasharray="${dash} ${circ - dash}" stroke-dashoffset="0" stroke-linecap="round" />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span class="text-xs sm:text-base font-black ${isOver ? 'text-pastel-coral' : 'text-white'} font-mono leading-none">${isOver ? `+${overKcal}` : remaining.toLocaleString()}</span>
          <span class="text-[8px] sm:text-[9px] ${isOver ? 'text-pastel-coral/80' : 'text-slate-400'} font-semibold mt-0.5">${isOver ? 'kcal over' : 'kcal left'}</span>
          <span class="text-[8px] sm:text-[9px] ${isOver ? 'text-pastel-coral font-bold' : 'text-pastel-lavender'} font-mono">${pct}%</span>
        </div>
      `;

      const statusLbl = document.getElementById('remaining-cal-status-label');
      if (statusLbl) statusLbl.textContent = `Goal: ${targetVal.toLocaleString()}`;
      const budgetLbl = document.getElementById('remaining-cal-budget-label');
      if (budgetLbl) {
        if (isOver) {
          budgetLbl.textContent = `${overKcal} kcal over`;
          budgetLbl.className = "hidden sm:block text-[10px] text-rose-400 font-bold truncate";
        } else if (remaining === 0) {
          budgetLbl.textContent = "Goal reached!";
          budgetLbl.className = "hidden sm:block text-[10px] text-emerald-400 font-bold truncate";
        } else {
          budgetLbl.textContent = `${remaining.toLocaleString()} kcal left`;
          budgetLbl.className = "hidden sm:block text-[10px] text-pastel-lavender truncate";
        }
      }
    }

    function inferMealCategory(item) {
      if (item && item.mealType && ['breakfast', 'lunch', 'dinner', 'snack'].includes(item.mealType)) {
        return item.mealType;
      }
      let hour = 12;
      if (item && item.id && typeof item.id === 'string' && item.id.startsWith('n-')) {
        const ts = parseInt(item.id.replace('n-', ''), 10);
        if (!isNaN(ts) && ts > 1600000000000) {
          hour = new Date(ts).getHours();
        }
      } else if (item && item.time && typeof item.time === 'string') {
        const parts = item.time.split(':');
        if (parts.length >= 1) hour = parseInt(parts[0], 10);
      }
      if (hour >= 4 && hour < 11) return 'breakfast';
      if (hour >= 11 && hour < 16) return 'lunch';
      if (hour >= 16 && hour < 21) return 'dinner';
      return 'snack';
    }

    function deleteFoodEntry(foodId, event) {
      if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
      state.nutritionLog = (state.nutritionLog || []).filter(n => n.id !== foodId);
      if (typeof saveAppState === 'function') saveAppState();
      renderNutrition();
    }

// Extended Nutrition Rendering with All Biomarkers
    function renderNutrition() {
      const totals = calculateDailyNutrientTotals();
      if (typeof renderWeightGoalTimeline === 'function') renderWeightGoalTimeline();
      renderSavedRecipesDropdown();
      const list = document.getElementById('nutrition-diary-list');
      if (list) {
        list.innerHTML = '';

        const mealCats = [
          { key: 'breakfast', label: 'Breakfast', icon: '🌅', color: 'text-pastel-butter' },
          { key: 'lunch', label: 'Lunch', icon: '☀️', color: 'text-pastel-sky' },
          { key: 'dinner', label: 'Dinner', icon: '🌙', color: 'text-pastel-coral' },
          { key: 'snack', label: 'Snacks & Extras', icon: '🍎', color: 'text-pastel-mint' }
        ];

        const grouped = { breakfast: [], lunch: [], dinner: [], snack: [] };
        (state.nutritionLog || []).forEach(item => {
          let cat = item.mealType;
          if (!cat || !grouped[cat]) {
            cat = inferMealCategory(item);
          }
          grouped[cat].push(item);
        });

        mealCats.forEach(cat => {
          const items = grouped[cat.key] || [];
          const subtotalKcal = items.reduce((sum, x) => sum + (parseInt(x.kcal, 10) || 0), 0);

          const catCard = document.createElement('div');
          catCard.className = "p-3 rounded-2xl bg-dark-base border border-dark-border space-y-2";

          let itemsHtml = '';
          if (items.length === 0) {
            itemsHtml = `
              <div class="py-1 px-1 flex items-center justify-between text-[11px] text-slate-500 italic">
                <span>No ${cat.label.toLowerCase()} logged yet</span>
                <button type="button" onclick="openLogFoodModal('verified', '${cat.key}')" class="text-pastel-mint hover:underline font-normal not-italic text-[10px]">+ Quick log</button>
              </div>
            `;
          } else {
            items.forEach(n => {
              itemsHtml += `
                <div class="p-2.5 rounded-xl bg-dark-surface border border-dark-border hover:border-pastel-mint/50 cursor-pointer flex items-center justify-between text-xs transition group" onclick="inspectLoggedFood('${n.id}')">
                  <div class="flex-1 min-w-0 pr-2">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="w-2 h-2 rounded-full ${n.isVerified ? 'bg-pastel-mint' : 'bg-pastel-butter'} shrink-0"></span>
                      <span class="text-slate-200 font-semibold truncate">${n.name}</span>
                      <span class="text-[9.5px] px-1.5 py-0.2 rounded font-mono ${n.isVerified ? 'bg-pastel-mint/15 text-pastel-mint' : 'bg-pastel-butter/15 text-pastel-butter'}">${n.isVerified ? '✓ Verified' : '~ Estimated'}</span>
                    </div>
                    <div class="text-[10.5px] text-slate-400 mt-0.5 font-mono truncate">
                      <span class="text-pastel-coral font-semibold">P: ${n.protein || 0}g</span> | <span class="text-pastel-mint font-semibold">C: ${n.carbs || 0}g</span> | <span class="text-pastel-butter font-semibold">F: ${n.fat || 0}g</span> ${n.fiber ? `| Fib: ${n.fiber}g` : ''} • <span class="text-pastel-mint underline">Micronutrients</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="font-mono font-bold text-white text-xs">${n.kcal} kcal</span>
                    <button type="button" onclick="deleteFoodEntry('${n.id}', event)" class="text-slate-500 hover:text-rose-400 p-1 rounded transition opacity-60 group-hover:opacity-100" title="Delete entry">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </div>
              `;
            });
          }

          catCard.innerHTML = `
            <div class="flex items-center justify-between border-b border-dark-border/60 pb-2">
              <div class="flex items-center gap-1.5">
                <span class="text-base">${cat.icon}</span>
                <span class="text-xs font-bold text-slate-200">${cat.label}</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-dark-elevated text-slate-400 font-mono">${items.length}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold text-white">${subtotalKcal} kcal</span>
                <button type="button" onclick="openLogFoodModal('verified', '${cat.key}')" class="px-2 py-0.5 rounded-lg bg-dark-elevated hover:bg-slate-700 text-pastel-mint border border-dark-border text-[11px] font-bold transition flex items-center gap-1 active:scale-95" title="Log food to ${cat.label}">
                  <i data-lucide="plus" class="w-3 h-3"></i>
                  <span class="hidden sm:inline">Add</span>
                </button>
              </div>
            </div>
            <div class="space-y-1.5">
              ${itemsHtml}
            </div>
          `;
          list.appendChild(catCard);
        });
        if (window.lucide) lucide.createIcons();
      }

      const countEl = document.getElementById('nutrition-log-count');
      if (countEl) countEl.textContent = `${state.nutritionLog.length} items`;

      const targets = state.userProfile || {};
      const setTxt = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.textContent = txt;
      };
      const setWidth = (id, w) => {
        const el = document.getElementById(id);
        if (el) el.style.width = w;
      };

      // Hydration label and buttons: fl oz default with ml option
      const waterUnit = targets.waterUnit || 'fl_oz';
      const waterLabelEl = document.getElementById('water-intake-label');
      const btn1 = document.getElementById('water-quick-btn-1');
      const btn2 = document.getElementById('water-quick-btn-2');

      let targetWaterMl = 2700;
      if (waterUnit === 'fl_oz') {
        const curFlOz = Math.round((state.waterLoggedMl || 0) / 29.5735);
        const tgtFlOz = targets.dailyWaterTargetFlOz || 90;
        targetWaterMl = tgtFlOz * 29.5735;
        const waterPct = Math.round((curFlOz / tgtFlOz) * 100);
        if (waterLabelEl) waterLabelEl.textContent = `${curFlOz} / ${tgtFlOz} fl oz (${waterPct}%)`;
        if (btn1) {
          btn1.textContent = '+8 fl oz';
          btn1.setAttribute('onclick', 'logQuickWater(8)');
        }
        if (btn2) {
          btn2.textContent = '+16 fl oz';
          btn2.setAttribute('onclick', 'logQuickWater(16)');
        }
      } else {
        const curMl = Math.round(state.waterLoggedMl || 0);
        const tgtMl = targets.dailyWaterTargetMl || 2700;
        targetWaterMl = tgtMl;
        const waterPct = Math.round((curMl / tgtMl) * 100);
        if (waterLabelEl) waterLabelEl.textContent = `${curMl} / ${tgtMl} ml (${waterPct}%)`;
        if (btn1) {
          btn1.textContent = '+250 ml';
          btn1.setAttribute('onclick', 'logQuickWater(250)');
        }
        if (btn2) {
          btn2.textContent = '+500 ml';
          btn2.setAttribute('onclick', 'logQuickWater(500)');
        }
      }

      // Render Water Donut Chart
      renderWaterIntakeDonut(state.waterLoggedMl || 0, targetWaterMl, waterUnit);

      // Macro targets & calculations
      const calTarget = targets.dailyCaloriesTarget || 2130;
      const protTarget = targets.dailyProteinTarget || 135;
      const carbTarget = targets.dailyCarbsTarget || 240;
      const fatTarget = targets.dailyFatTarget || 71;

      // Render 3 Inline Donut Charts (Macros, Hydration, Energy Remaining)
      renderCronometerMacroDonut(totals.caloriesKcal, totals.proteinG, totals.carbsG, totals.fatG, calTarget);
      renderRemainingCaloriesDonut(totals.caloriesKcal, calTarget);

      // Color-coding evaluations (green = correct/optimal, red = too much, neutral/slate = need more)
      const colCal = getNutrientProgressColor(totals.caloriesKcal, calTarget, false);
      const colProt = getNutrientProgressColor(totals.proteinG, protTarget, false);
      const colCarb = getNutrientProgressColor(totals.carbsG, carbTarget, false);
      const colFat = getNutrientProgressColor(totals.fatG, fatTarget, false);

      const setBarColorAndWidth = (id, pct, col) => {
        const el = document.getElementById(id);
        if (el) {
          el.style.width = `${Math.min(100, pct)}%`;
          el.className = `h-full rounded-full transition-all duration-500 ${col.barClass}`;
        }
      };

      setTxt('macro-calories', `${totals.caloriesKcal} / ${calTarget.toLocaleString()}`);
      setTxt('macro-protein', `${Math.round(totals.proteinG)}g / ${protTarget}g`);
      setTxt('macro-carbs', `${Math.round(totals.carbsG)}g / ${carbTarget}g`);
      setTxt('macro-fats', `${Math.round(totals.fatG)}g / ${fatTarget}g`);

      const pctCal = Math.round((totals.caloriesKcal / calTarget) * 100);
      const pctProt = Math.round((totals.proteinG / protTarget) * 100);
      const pctCarb = Math.round((totals.carbsG / carbTarget) * 100);
      const pctFat = Math.round((totals.fatG / fatTarget) * 100);

      setBarColorAndWidth('bar-calories', pctCal, colCal);
      setTxt('pct-calories', `${pctCal}% • ${colCal.status === 'correct' ? 'Optimal ✓' : (colCal.status === 'too_much' ? 'Exceeded ⚠️' : 'Need more')}`);
      setBarColorAndWidth('bar-protein', pctProt, colProt);
      setTxt('pct-protein', `${pctProt}%`);
      setBarColorAndWidth('bar-carbs', pctCarb, colCarb);
      setTxt('pct-carbs', `${pctCarb}%`);
      setBarColorAndWidth('bar-fats', pctFat, colFat);
      setTxt('pct-fats', `${pctFat}%`);

      // Donut Legend Progress Bars
      setBarColorAndWidth('donut-protein-bar', pctProt, colProt);
      setTxt('donut-protein-stat', `${Math.round(totals.proteinG)}g / ${protTarget}g (${pctProt}%)`);
      setBarColorAndWidth('donut-carbs-bar', pctCarb, colCarb);
      setTxt('donut-carbs-stat', `${Math.round(totals.carbsG)}g / ${carbTarget}g (${pctCarb}%)`);
      setBarColorAndWidth('donut-fat-bar', pctFat, colFat);
      setTxt('donut-fat-stat', `${Math.round(totals.fatG)}g / ${fatTarget}g (${pctFat}%)`);
      setTxt('pct-fats', `${pctFat}%`);

      // View A: Full Day Summary Headline Card inside modal
      setTxt('full-summary-cal-display', `${totals.caloriesKcal.toLocaleString()} / ${calTarget.toLocaleString()} kcal`);
      setTxt('full-summary-cal-pct', `${pctCal}% of Target`);
      const deficitKcal = targets.dailyEnergyDeficitKcal || 0;
      if (deficitKcal > 0) {
        setTxt('full-summary-deficit-status', `Deficit: -${deficitKcal} kcal/day (${targets.weeklyPaceLbs || 0.5} lbs/wk pace)`);
      } else {
        setTxt('full-summary-deficit-status', `Maintenance Energy Goal`);
      }
      setWidth('full-summary-cal-bar', `${pctCal}%`);
      setTxt('full-summary-protein', `${Math.round(totals.proteinG)}g / ${protTarget}g`);
      setTxt('full-summary-carbs', `${Math.round(totals.carbsG)}g / ${carbTarget}g`);
      setTxt('full-summary-fats', `${Math.round(totals.fatG)}g / ${fatTarget}g`);

      // Micronutrient & Biochemical cards inside modal
      setTxt('stat-fiber', `${totals.fiberG.toFixed(1)}g / ${targets.dailyFiberTarget || 30}g`);
      setTxt('stat-sugar', `${totals.sugarG.toFixed(1)}g / <50g`);
      setTxt('stat-starch', `${totals.carbsG - totals.fiberG - totals.sugarG > 0 ? (totals.carbsG - totals.fiberG - totals.sugarG).toFixed(1) : 0}g`);
      setTxt('stat-netcarbs', `${Math.max(0, totals.carbsG - totals.fiberG).toFixed(1)}g / ${carbTarget}g`);

      setTxt('stat-satfat', `${totals.saturatedFatG.toFixed(1)}g / <20g`);
      setTxt('stat-mufa', `${totals.monounsaturatedFatG.toFixed(1)}g`);
      setTxt('stat-pufa', `${totals.polyunsaturatedFatG.toFixed(1)}g`);
      setTxt('stat-omega3', `${totals.omega3G.toFixed(1)}g / 1.6g`);
      setTxt('stat-cholesterol', `${Math.round(totals.cholesterolMg)}mg / <300mg`);

      setTxt('stat-vitA', `${Math.round(totals.vitaminAmcg)} / 700 mcg`);
      setTxt('stat-vitC', `${Math.round(totals.vitaminCmg)} / 75 mg`);
      setTxt('stat-vitD', `${Math.round(totals.vitaminD_IU)} / 600 IU`);
      setTxt('stat-vitE', `${totals.vitaminEmg.toFixed(1)} / 15 mg`);
      setTxt('stat-vitK', `${Math.round(totals.vitaminKmcg)} / 90 mcg`);

      setTxt('stat-calcium', `${Math.round(totals.calciumMg)} / ${targets.dailyCalciumTarget || 1000} mg`);
      setTxt('stat-iron', `${totals.ironMg.toFixed(1)} / ${targets.dailyIronTarget || 18} mg`);
      setTxt('stat-magnesium', `${Math.round(totals.magnesiumMg)} / 320 mg`);
      setTxt('stat-potassium', `${Math.round(totals.potassiumMg)} / ${targets.dailyPotassiumTarget || 2600} mg`);
      setTxt('stat-sodium', `${Math.round(totals.sodiumMg)} / ${targets.dailySodiumTarget || 2300} mg`);
      setTxt('stat-zinc', `${totals.zincMg.toFixed(1)} / 8 mg`);

      setTxt('stat-tyrosine', `${Math.round(totals.tyrosineMg)} mg`);
      setTxt('stat-tryptophan', `${Math.round(totals.tryptophanMg)} mg`);
      setTxt('stat-leucine', `${Math.round(totals.proteinG * 80)} mg`);
      setTxt('stat-lysine', `${Math.round(totals.proteinG * 65)} mg`);
      setTxt('stat-choline', `${Math.round(totals.proteinG * 2.8)} / 425 mg`);
    }

    function closeNutrientBreakdownModal() {
      const modal = document.getElementById('nutrient-breakdown-modal');
      if (modal) modal.classList.add('hidden');
    }

    // Modal: Full Day Calorie Breakdown or Single Nutrient Drilldown
    function openNutrientBreakdownModal(nutrientKey = 'calories') {
      const modal = document.getElementById('nutrient-breakdown-modal');
      if (!modal) return;

      const fullSummaryView = document.getElementById('drilldown-full-summary-view');
      const singleView = document.getElementById('drilldown-single-view');
      const backBtn = document.getElementById('drilldown-back-btn');
      const titleEl = document.getElementById('drilldown-title');

      renderNutrition(); // Fresh totals

      if (nutrientKey === 'calories') {
        // VIEW A: Full Day Calorie & Micronutrient Summary
        if (fullSummaryView) fullSummaryView.classList.remove('hidden');
        if (singleView) singleView.classList.add('hidden');
        if (backBtn) backBtn.classList.add('hidden');
        if (titleEl) titleEl.textContent = "Full Day Calorie & Nutrient Summary";

        const calListEl = document.getElementById('drilldown-calorie-contributors-list');
        if (calListEl) {
          calListEl.innerHTML = '';
          const totals = calculateDailyNutrientTotals();
          const foodsSorted = [...state.nutritionLog].sort((a, b) => (b.kcal || 0) - (a.kcal || 0));
          if (foodsSorted.length === 0) {
            calListEl.innerHTML = `
              <div class="text-[11px] text-slate-400 italic p-3 bg-dark-base rounded-xl border border-dark-border">
                No foods logged today yet. Tap "Log Food" on the Nutrition tab to add breakfast, lunch, or dinner.
              </div>
            `;
          } else {
            foodsSorted.forEach(f => {
              const fKcal = f.kcal || 0;
              const calPct = totals.caloriesKcal > 0 ? Math.round((fKcal / totals.caloriesKcal) * 100) : 0;
              const row = document.createElement('div');
              row.className = "p-2.5 rounded-xl bg-dark-base border border-dark-border flex items-center justify-between text-xs";
              row.innerHTML = `
                <div class="flex items-center gap-2 truncate pr-2">
                  <span class="w-1.5 h-1.5 rounded-full ${f.isVerified ? 'bg-pastel-mint' : 'bg-pastel-butter'} shrink-0"></span>
                  <span class="text-white font-semibold truncate">${f.name}</span>
                  <span class="text-[9px] px-1.5 py-0.2 rounded bg-dark-elevated text-slate-400 font-mono shrink-0">${f.protein}g P | ${f.carbs}g C | ${f.fat}g F</span>
                </div>
                <div class="text-right shrink-0">
                  <span class="font-mono font-bold text-pastel-mint">${fKcal} kcal</span>
                  <span class="text-[10px] text-slate-400 font-mono ml-1">(${calPct}%)</span>
                </div>
              `;
              calListEl.appendChild(row);
            });
          }
        }

        modal.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
        return;
      }

      // VIEW B: Single Nutrient Drilldown View
      if (fullSummaryView) fullSummaryView.classList.add('hidden');
      if (singleView) singleView.classList.remove('hidden');
      if (backBtn) backBtn.classList.remove('hidden');

      const summaryEl = document.getElementById('drilldown-summary');
      const pctEl = document.getElementById('drilldown-pct');
      const barEl = document.getElementById('drilldown-progress-bar');
      const listEl = document.getElementById('drilldown-contributors-list');
      const tipEl = document.getElementById('drilldown-health-tip');

      const waterUnit = (state.userProfile && state.userProfile.waterUnit) || 'fl_oz';
      const waterTarget = waterUnit === 'fl_oz'
        ? ((state.userProfile && state.userProfile.dailyWaterTargetFlOz) || 90)
        : ((state.userProfile && state.userProfile.dailyWaterTargetMl) || 2700);

      const meta = {
        protein: { name: 'Total Protein', unit: 'g', target: state.userProfile.dailyProteinTarget, barColor: 'bg-pastel-peach', tip: 'Essential for neurotransmitter synthesis (dopamine, norepinephrine, serotonin).' },
        carbs: { name: 'Carbohydrates', unit: 'g', target: state.userProfile.dailyCarbsTarget, barColor: 'bg-pastel-butter', tip: 'Complex carbs provide steady cerebral glucose without insulin spikes.' },
        netcarbs: { name: 'Net Carbs', unit: 'g', target: state.userProfile.dailyCarbsTarget, barColor: 'bg-pastel-butter', tip: 'Total carbohydrates minus dietary fiber.' },
        fat: { name: 'Healthy Lipids & Fats', unit: 'g', target: state.userProfile.dailyFatTarget, barColor: 'bg-pastel-sky', tip: 'Supports brain cellular membranes, myelin sheaths, and hormone balance.' },
        water: { name: 'Water & Fluid Hydration', unit: waterUnit === 'fl_oz' ? 'fl oz' : 'ml', target: waterTarget, barColor: 'bg-pastel-sky', tip: 'Hydration directly improves executive working memory and prevents afternoon fatigue.' },
        fiber: { name: 'Dietary Fiber', unit: 'g', target: state.userProfile.dailyFiberTarget || 28, barColor: 'bg-pastel-mint', tip: 'Microbiome diversity fuels short-chain fatty acids that regulate brain inflammation.' },
        sugar: { name: 'Sugars', unit: 'g', target: 50, barColor: 'bg-pastel-butter', tip: 'Maintain within moderate bounds to prevent dopamine dysregulation crashes.' },
        starch: { name: 'Complex Starch', unit: 'g', target: 150, barColor: 'bg-pastel-butter', tip: 'Slow-digesting polysaccharides that fuel physical stamina.' },
        saturated: { name: 'Saturated Fat', unit: 'g', target: 20, barColor: 'bg-slate-400', tip: 'Upper boundary: maintain under 20g/day for cardiovascular and lipid health.' },
        monounsaturated: { name: 'Monounsaturated Fats (MUFA)', unit: 'g', target: 35, barColor: 'bg-pastel-sky', tip: 'Cardioprotective oleic acids found in olive oil and avocados.' },
        polyunsaturated: { name: 'Polyunsaturated Fats (PUFA)', unit: 'g', target: 20, barColor: 'bg-pastel-sky', tip: 'Essential fatty acids including linoleic acid.' },
        omega3: { name: 'Omega-3 (EPA/DHA)', unit: 'g', target: 1.6, barColor: 'bg-pastel-sky', tip: 'Crucial for ADHD neuro-protection and brain signal transmission.' },
        cholesterol: { name: 'Dietary Cholesterol', unit: 'mg', target: 300, barColor: 'bg-slate-400', tip: 'Precursor to neurosteroids, sex hormones, and bile salts.' },
        calcium: { name: 'Calcium', unit: 'mg', target: state.userProfile.dailyCalciumTarget || 1000, barColor: 'bg-pastel-lavender', tip: 'Regulates neuronal signal transduction and skeletal strength.' },
        iron: { name: 'Iron (Bioavailable)', unit: 'mg', target: state.userProfile.dailyIronTarget || 18, barColor: 'bg-pastel-sky', tip: 'Critical rate-limiting co-factor for tyrosine hydroxylase (dopamine synthesis).' },
        magnesium: { name: 'Magnesium', unit: 'mg', target: 320, barColor: 'bg-pastel-mint', tip: 'Calms NMDA glutamate receptors, easing ADHD hyper-reactivity and anxiety.' },
        potassium: { name: 'Potassium', unit: 'mg', target: state.userProfile.dailyPotassiumTarget || 2600, barColor: 'bg-pastel-sky', tip: 'Electrolyte regulating fluid balance, cellular hydration, and blood pressure.' },
        sodium: { name: 'Sodium', unit: 'mg', target: state.userProfile.dailySodiumTarget || 2300, barColor: 'bg-slate-400', tip: 'Upper limit: 2,300mg. Essential for cellular fluid balance without hypertension.' },
        zinc: { name: 'Zinc', unit: 'mg', target: 8, barColor: 'bg-pastel-lavender', tip: 'Modulates dopamine transporter kinetics and immune defense.' },
        vitaminA: { name: 'Vitamin A', unit: 'mcg', target: 700, barColor: 'bg-pastel-peach', tip: 'Retinol and beta-carotene for vision, skin health, and mucosal immunity.' },
        vitaminC: { name: 'Vitamin C', unit: 'mg', target: 75, barColor: 'bg-pastel-butter', tip: 'Antioxidant cofactor in dopamine-to-norepinephrine conversion.' },
        vitaminD: { name: 'Vitamin D3', unit: 'IU', target: 600, barColor: 'bg-pastel-butter', tip: 'Neuro-steroid vitamin regulating dopamine release and seasonal mood.' },
        vitaminE: { name: 'Vitamin E', unit: 'mg', target: 15, barColor: 'bg-pastel-peach', tip: 'Lipid-soluble antioxidant protecting brain cell membranes.' },
        vitaminK: { name: 'Vitamin K', unit: 'mcg', target: 90, barColor: 'bg-pastel-mint', tip: 'Coagulation co-factor and vascular calcium chaperone.' },
        tyrosine: { name: 'L-Tyrosine', unit: 'mg', target: 2000, barColor: 'bg-pastel-mint', tip: 'Direct amino acid precursor to dopamine, boosting executive initiation.' },
        tryptophan: { name: 'L-Tryptophan', unit: 'mg', target: 400, barColor: 'bg-pastel-lavender', tip: 'Precursor to serotonin and evening melatonin for restorative sleep.' },
        leucine: { name: 'L-Leucine (mTOR)', unit: 'mg', target: 2500, barColor: 'bg-pastel-peach', tip: 'Branched-chain amino acid triggering muscle protein synthesis.' },
        lysine: { name: 'L-Lysine', unit: 'mg', target: 2100, barColor: 'bg-pastel-coral', tip: 'Collagen integrity, antiviral immune modulation, and anxiety reduction.' },
        choline: { name: 'Choline', unit: 'mg', target: 425, barColor: 'bg-pastel-sky', tip: 'Precursor to acetylcholine, vital for attention, memory, and focus.' }
      };

      const info = meta[nutrientKey] || { name: nutrientKey, unit: '', target: 100, barColor: 'bg-pastel-mint', tip: 'Essential dietary nutrient.' };
      if (titleEl) titleEl.textContent = info.name;

      const ingredientNutrientMap = {
        'lemon': { vitaminC: 6.2, potassium: 45, bioTip: 'Synergistic citrus acids triple iron absorption.' },
        'blueberries': { vitaminC: 7.2, fiber: 2.0, potassium: 57, bioTip: 'Anthocyanins cross the blood-brain barrier.' },
        'broccoli': { vitaminC: 89, fiber: 3.8, calcium: 62, iron: 1.0, vitaminK: 90, bioTip: 'Contains sulforaphane, an anti-inflammatory neuroprotector.' },
        'salmon': { protein: 34, omega3: 2.1, vitaminD: 570, potassium: 576, bioTip: 'Bioavailable marine EPA & DHA for brain cell membrane fluidity.' },
        'spinach': { iron: 2.7, vitaminA: 469, calcium: 99, magnesium: 79, vitaminK: 145, bioTip: 'Rich in active methylfolate for dopamine neurotransmitter recycling.' },
        'lentils': { iron: 6.6, fiber: 7.8, protein: 18, potassium: 365, zinc: 2.5, bioTip: 'Slow-burning prebiotic starches stabilize focus.' },
        'eggs': { protein: 12.6, choline: 147, vitaminD: 44, iron: 1.8, leucine: 1100, bioTip: 'Gold standard for choline, vital for memory encoding.' },
        'yogurt': { protein: 18, calcium: 187, potassium: 240, tryptophan: 240, bioTip: 'Live cultures support gut-microbiome serotonin production.' },
        'oats': { fiber: 4.0, iron: 1.4, magnesium: 55, zinc: 1.2, protein: 5.3, bioTip: 'Beta-glucan fibers prevent post-meal dopamine drop.' },
        'avocado': { fat: 14.7, monounsaturated: 10, potassium: 485, fiber: 6.7, vitaminE: 2.1, bioTip: 'Oleic fats facilitate fat-soluble nutrient absorption.' },
        'chickpeas': { iron: 2.4, protein: 7.3, fiber: 6.2, potassium: 239, bioTip: 'Plant iron and steady low-glycemic carbohydrates.' },
        'rice': { carbs: 43, starch: 40, protein: 3.6, iron: 1.9, bioTip: 'Clean hypoallergenic carbohydrate fuel for cerebral glucose.' }
      };

      let calculatedTotal = 0;
      const ingredientContributors = [];

      state.nutritionLog.forEach(food => {
        let directVal = food[nutrientKey] || 0;
        
        const matchDb = commonFoodsDatabase.find(cf => cf.name.toLowerCase() === food.name.toLowerCase());
        if (matchDb && matchDb[nutrientKey] !== undefined) {
          directVal = matchDb[nutrientKey];
        }

        const matchRecipe = state.recipes.find(r => r.id === food.recipeId || r.title.toLowerCase() === food.name.toLowerCase().replace(' (1 serving)', ''));
        if (matchRecipe && matchRecipe.ingredients && matchRecipe.ingredients.length > 0) {
          let foundIngredientInRecipe = false;
          matchRecipe.ingredients.forEach(ing => {
            const ingLower = ing.toLowerCase();
            Object.keys(ingredientNutrientMap).forEach(key => {
              if (ingLower.includes(key) && ingredientNutrientMap[key][nutrientKey] !== undefined) {
                const ingVal = ingredientNutrientMap[key][nutrientKey];
                ingredientContributors.push({
                  ingredientName: ing,
                  foodParent: matchRecipe.title,
                  val: ingVal,
                  bioTip: ingredientNutrientMap[key].bioTip || 'Bioactive nutrient source.',
                  isVerified: true
                });
                calculatedTotal += ingVal;
                foundIngredientInRecipe = true;
              }
            });
          });

          if (!foundIngredientInRecipe && directVal > 0) {
            ingredientContributors.push({
              ingredientName: food.name,
              foodParent: 'Recipe Ingredients',
              val: directVal,
              bioTip: 'Whole recipe contribution.',
              isVerified: true
            });
            calculatedTotal += directVal;
          }
        } else {
          if (directVal > 0) {
            calculatedTotal += directVal;
            let tip = 'Natural whole food nutrient source.';
            Object.keys(ingredientNutrientMap).forEach(k => {
              if (food.name.toLowerCase().includes(k) && ingredientNutrientMap[k].bioTip) {
                tip = ingredientNutrientMap[k].bioTip;
              }
            });

            ingredientContributors.push({
              ingredientName: food.name,
              foodParent: 'Logged Food',
              val: directVal,
              bioTip: tip,
              isVerified: food.isVerified
            });
          }
        }
      });

      let current = 0;
      if (nutrientKey === 'water') {
        current = waterUnit === 'fl_oz'
          ? Math.round((state.waterLoggedMl || 0) / 29.5735)
          : Math.round(state.waterLoggedMl || 0);
        
        if (current > 0) {
          ingredientContributors.unshift({
            ingredientName: 'Direct Water Intake',
            foodParent: 'Hydration Log',
            val: current,
            bioTip: 'Optimal cellular hydration, neurotransmitter flow, and mitochondrial energy.',
            isVerified: true
          });
        }
      } else {
        current = calculatedTotal > 0 ? calculatedTotal : (calculateDailyNutrientTotals()[nutrientKey] || 0);
      }

      const target = info.target || 1;
      const pct = Math.round((current / target) * 100);

      if (summaryEl) summaryEl.textContent = `${current.toLocaleString()} / ${target.toLocaleString()} ${info.unit}`;

      let rdaBadge = '';
      if (['saturated', 'sugar', 'sodium', 'cholesterol'].includes(nutrientKey)) {
        if (current > target) {
          rdaBadge = `<span class="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-[10px]">🔴 Upper Limit Exceeded (${pct}%)</span>`;
        } else {
          rdaBadge = `<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">🟢 Safe Bounds (${pct}% of Limit)</span>`;
        }
      } else {
        if (pct >= 70 && pct <= 130) {
          rdaBadge = `<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">🟢 Optimal DRI (${pct}% RDA)</span>`;
        } else if (pct < 70) {
          rdaBadge = `<span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[10px]">🟡 Building (${pct}% of RDA)</span>`;
        } else {
          rdaBadge = `<span class="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold text-[10px]">🔵 Healthy Surplus (${pct}% RDA)</span>`;
        }
      }

      if (pctEl) pctEl.innerHTML = `${pct}% ${rdaBadge}`;
      if (barEl) {
        barEl.className = `${info.barColor} h-full rounded-full transition-all duration-500`;
        barEl.style.width = `${Math.min(100, pct)}%`;
      }
      if (tipEl) tipEl.textContent = info.tip;

      if (listEl) {
        listEl.innerHTML = '';
        ingredientContributors.sort((a, b) => b.val - a.val);

        if (ingredientContributors.length === 0) {
          listEl.innerHTML = `
            <div class="text-[11px] text-slate-400 italic p-3 bg-dark-base rounded-xl border border-dark-border space-y-1">
              <span>No specific ingredients logged containing this nutrient today yet.</span>
              <p class="text-[10px] text-slate-500">Tip: Tap "Log Food" and search for whole food staples or recipes to populate your micronutrient radar!</p>
            </div>
          `;
        } else {
          ingredientContributors.forEach(c => {
            const contribPct = current > 0 ? Math.round((c.val / current) * 100) : 0;
            const item = document.createElement('div');
            item.className = "p-2.5 rounded-xl bg-dark-base border border-dark-border space-y-1.5 transition hover:border-pastel-mint/40";
            item.innerHTML = `
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2 truncate pr-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-pastel-mint shrink-0"></span>
                  <span class="text-white font-semibold truncate">${c.ingredientName}</span>
                  <span class="text-[9px] px-1.5 py-0.2 rounded bg-dark-elevated text-slate-400 font-mono shrink-0">${c.foodParent}</span>
                </div>
                <div class="text-right shrink-0">
                  <span class="font-mono font-bold text-pastel-mint">${c.val} ${info.unit}</span>
                  <span class="text-[10px] text-slate-400 font-mono ml-1">(${contribPct}%)</span>
                </div>
              </div>
              <div class="w-full bg-dark-elevated h-1 rounded-full overflow-hidden">
                <div class="bg-pastel-mint h-full rounded-full" style="width: ${Math.min(100, contribPct)}%"></div>
              </div>
              <p class="text-[10px] text-slate-400 leading-tight italic">${c.bioTip}</p>
            `;
            listEl.appendChild(item);
          });
        }
      }

      modal.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }

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

    function toggleInlineBiochemicalPanels() {
      const panel = document.getElementById('detailed-biochemical-panels');
      const textEl = document.getElementById('toggle-bio-panels-text');
      const chevron = document.getElementById('toggle-bio-panels-chevron');
      if (!panel) return;

      panel.classList.toggle('hidden');
      const isHidden = panel.classList.contains('hidden');
      if (textEl) textEl.textContent = isHidden ? "Expand Inline Tables" : "Collapse Inline Tables";
      if (chevron) chevron.classList.toggle('rotate-180', !isHidden);
      if (window.lucide) lucide.createIcons();
    }

    // Modal: Food Logging Functions
    function openLogFoodModal(mode = 'verified', defaultMealType = null) {
      setLogAccuracyMode(mode);

      // Default meal category selection
      let meal = defaultMealType;
      if (!meal) {
        const hour = new Date().getHours();
        if (hour >= 4 && hour < 11) meal = 'breakfast';
        else if (hour >= 11 && hour < 16) meal = 'lunch';
        else if (hour >= 16 && hour < 21) meal = 'dinner';
        else meal = 'snack';
      }
      setLogMealType(meal);

      document.getElementById('food-input-name').value = '';
      document.getElementById('food-input-kcal').value = '';
      document.getElementById('food-input-protein').value = '';
      document.getElementById('food-input-carbs').value = '';
      document.getElementById('food-input-fat').value = '';
      document.getElementById('food-input-fiber').value = '';
      document.getElementById('food-input-sodium').value = '';
      document.getElementById('food-input-potassium').value = '';
      document.getElementById('food-input-iron').value = '';
      document.getElementById('food-input-calcium').value = '';
      document.getElementById('food-log-modal').classList.remove('hidden');
    }

    function setLogMealType(mealType) {
      const validMeal = ['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType) ? mealType : 'snack';
      state.currentFoodMealType = validMeal;
      const input = document.getElementById('food-input-meal-type');
      if (input) input.value = validMeal;

      const types = ['breakfast', 'lunch', 'dinner', 'snack'];
      types.forEach(t => {
        const btn = document.getElementById(`meal-type-btn-${t}`);
        if (btn) {
          if (t === validMeal) {
            btn.className = "py-1.5 px-1 sm:px-2 rounded-xl font-bold bg-pastel-mint text-dark-base transition flex items-center justify-center gap-1 shadow-sm";
          } else {
            btn.className = "py-1.5 px-1 sm:px-2 rounded-xl font-bold bg-dark-base border border-dark-border text-slate-400 hover:text-white transition flex items-center justify-center gap-1";
          }
        }
      });
    }

    function closeLogFoodModal() {
      document.getElementById('food-log-modal').classList.add('hidden');
    }

    function setLogAccuracyMode(mode) {
      state.currentFoodAccuracyMode = mode;
      const vBtn = document.getElementById('mode-btn-verified');
      const eBtn = document.getElementById('mode-btn-estimated');
      const quickPicks = document.getElementById('verified-quick-picks');

      if (mode === 'verified') {
        vBtn.className = "py-2 rounded-xl font-bold bg-pastel-mint text-dark-base";
        eBtn.className = "py-2 rounded-xl font-bold bg-dark-base border border-dark-border text-slate-400";
        quickPicks.classList.remove('hidden');
      } else {
        vBtn.className = "py-2 rounded-xl font-bold bg-dark-base border border-dark-border text-slate-400";
        eBtn.className = "py-2 rounded-xl font-bold bg-pastel-butter text-dark-base";
        quickPicks.classList.add('hidden');
      }
    }

    function fillVerifiedPreset(name, kcal, prot, carb, fat, fiber = 0, sodium = 0, potassium = 0, iron = 0, calcium = 0) {
      document.getElementById('food-input-name').value = name;
      document.getElementById('food-input-kcal').value = kcal;
      document.getElementById('food-input-protein').value = prot;
      document.getElementById('food-input-carbs').value = carb;
      document.getElementById('food-input-fat').value = fat;
      document.getElementById('food-input-fiber').value = fiber;
      document.getElementById('food-input-sodium').value = sodium;
      document.getElementById('food-input-potassium').value = potassium;
      document.getElementById('food-input-iron').value = iron;
      document.getElementById('food-input-calcium').value = calcium;
      const matched = (typeof getUnifiedFoodOrMeal === 'function') ? getUnifiedFoodOrMeal(name.split('(')[0].trim())[0] : null;
      window.selectedLogFoodReference = matched || null;
    }

    function saveFoodEntry() {
      const name = document.getElementById('food-input-name').value.trim();
      const kcal = parseInt(document.getElementById('food-input-kcal').value, 10) || 0;
      const prot = parseFloat(document.getElementById('food-input-protein').value) || 0;
      const carb = parseFloat(document.getElementById('food-input-carbs').value) || 0;
      const fat = parseFloat(document.getElementById('food-input-fat').value) || 0;
      const fiber = parseFloat(document.getElementById('food-input-fiber').value) || 0;
      const sodium = parseInt(document.getElementById('food-input-sodium').value, 10) || 0;
      const potassium = parseInt(document.getElementById('food-input-potassium').value, 10) || 0;
      const iron = parseFloat(document.getElementById('food-input-iron').value) || 0;
      const calcium = parseInt(document.getElementById('food-input-calcium').value, 10) || 0;

      if (!name) return;
      const mealType = document.getElementById('food-input-meal-type')?.value || state.currentFoodMealType || 'snack';
      const ref = window.selectedLogFoodReference || ((typeof getUnifiedFoodOrMeal === 'function') ? getUnifiedFoodOrMeal(name.replace(/\s*\(1 serving\)/i, '').trim())[0] : null);
      const isVerified = state.currentFoodAccuracyMode === 'verified';
      const serving = ref?.serving || '1 serving';
      const servingGrams = ref?.servingGrams || 100;
      const micros = ref?.micros || ref?.nutrition?.micros || estimateMicronutrientsForFood(ref?.category || 'produce', kcal, prot, carb, fat, name, servingGrams);
      if (potassium) micros.potassium = potassium;
      if (iron) micros.iron = iron;
      if (calcium) micros.calcium = calcium;

      const verifiedNutrients = ref?.verifiedNutrients || (isVerified ? { kcal: true, protein: true, carbs: true, fat: true, fiber: true, sodium: true } : {});

      state.nutritionLog.push({
        id: `n-${Date.now()}`,
        name,
        recipeId: ref?.recipeId || null,
        pantryItemId: ref?.pantryItemId || null,
        mealType,
        serving,
        servingGrams,
        kcal,
        protein: prot,
        carbs: carb,
        fat,
        fiber,
        sugar: ref?.sugar || ref?.nutrition?.sugar || 0,
        satFat: ref?.satFat || ref?.nutrition?.satFat || 0,
        sodium,
        potassium: micros.potassium || potassium,
        iron: micros.iron || iron,
        calcium: micros.calcium || calcium,
        water: ref?.water || ref?.nutrition?.water || 0,
        micros,
        verifiedNutrients,
        nutrition: {
          kcal,
          protein: prot,
          carbs: carb,
          fat,
          fiber,
          sugar: ref?.sugar || ref?.nutrition?.sugar || 0,
          satFat: ref?.satFat || ref?.nutrition?.satFat || 0,
          sodium,
          water: ref?.water || ref?.nutrition?.water || 0,
          serving,
          servingGrams,
          micros,
          verifiedNutrients
        },
        isVerified
      });
      window.selectedLogFoodReference = null;
      closeLogFoodModal();
      if (typeof saveAppState === 'function') saveAppState();
      renderNutrition();
      playChime('bell');
    }

    function handleNutritionLabelScan(event) {
      const file = event.target.files[0];
      if (!file) return;

      alertBox("Scanning Nutrition Facts label via Gemini Vision...", "Label Scanner");
      setTimeout(() => {
        openLogFoodModal('verified');
        document.getElementById('food-input-name').value = "Scanned Food Item (1 Serving)";
        document.getElementById('food-input-kcal').value = 180;
        document.getElementById('food-input-protein').value = 15;
        document.getElementById('food-input-carbs').value = 18;
        document.getElementById('food-input-fat').value = 6;
        document.getElementById('food-input-fiber').value = 4;
        document.getElementById('food-input-sodium').value = 190;
        document.getElementById('food-input-potassium').value = 240;
        document.getElementById('food-input-iron').value = 1.8;
        document.getElementById('food-input-calcium').value = 120;
        playChime('bell');
      }, 1200);
    }

    // ==============================================
    // ESSENTIAL HUMAN SURVIVAL NUTRITION STANDARDS (FDA / NIH / IOM)
    // All 13 Essential Vitamins & All 14 Essential Minerals
    // ==============================================
    const DAILY_NUTRITION_STANDARDS = {
      // 13 Essential Vitamins + Essential Choline
      vitA: { name: 'Vitamin A', unit: 'mcg', dv: 900, type: 'vitamin', color: 'text-amber-300', barColor: 'bg-amber-400' },
      vitC: { name: 'Vitamin C', unit: 'mg', dv: 90, type: 'vitamin', color: 'text-pastel-butter', barColor: 'bg-amber-300' },
      vitD: { name: 'Vitamin D', unit: 'mcg', dv: 20, type: 'vitamin', color: 'text-yellow-300', barColor: 'bg-yellow-400' },
      vitE: { name: 'Vitamin E', unit: 'mg', dv: 15, type: 'vitamin', color: 'text-pastel-mint', barColor: 'bg-emerald-400' },
      vitK: { name: 'Vitamin K', unit: 'mcg', dv: 120, type: 'vitamin', color: 'text-emerald-300', barColor: 'bg-emerald-500' },
      vitB1: { name: 'Thiamin (B1)', unit: 'mg', dv: 1.2, type: 'vitamin', color: 'text-pastel-sky', barColor: 'bg-sky-400' },
      vitB2: { name: 'Riboflavin (B2)', unit: 'mg', dv: 1.3, type: 'vitamin', color: 'text-pastel-sky', barColor: 'bg-sky-400' },
      vitB3: { name: 'Niacin (B3)', unit: 'mg', dv: 16, type: 'vitamin', color: 'text-pastel-sky', barColor: 'bg-sky-400' },
      vitB5: { name: 'Pantothenic Acid (B5)', unit: 'mg', dv: 5, type: 'vitamin', color: 'text-pastel-sky', barColor: 'bg-sky-400' },
      vitB6: { name: 'Vitamin B6', unit: 'mg', dv: 1.7, type: 'vitamin', color: 'text-pastel-sky', barColor: 'bg-sky-400' },
      vitB7: { name: 'Biotin (B7)', unit: 'mcg', dv: 30, type: 'vitamin', color: 'text-pastel-lavender', barColor: 'bg-purple-400' },
      vitB9: { name: 'Folate (B9)', unit: 'mcg', dv: 400, type: 'vitamin', color: 'text-pastel-mint', barColor: 'bg-teal-400' },
      vitB12: { name: 'Vitamin B12', unit: 'mcg', dv: 2.4, type: 'vitamin', color: 'text-rose-300', barColor: 'bg-rose-400' },
      choline: { name: 'Choline', unit: 'mg', dv: 550, type: 'vitamin', color: 'text-pastel-peach', barColor: 'bg-orange-400' },

      // 14 Essential Minerals & Electrolytes
      potassium: { name: 'Potassium', unit: 'mg', dv: 3400, type: 'mineral', color: 'text-pastel-sky', barColor: 'bg-cyan-400' },
      calcium: { name: 'Calcium', unit: 'mg', dv: 1000, type: 'mineral', color: 'text-slate-100', barColor: 'bg-slate-300' },
      iron: { name: 'Iron', unit: 'mg', dv: 18, type: 'mineral', color: 'text-rose-400', barColor: 'bg-rose-500' },
      magnesium: { name: 'Magnesium', unit: 'mg', dv: 420, type: 'mineral', color: 'text-pastel-mint', barColor: 'bg-emerald-400' },
      zinc: { name: 'Zinc', unit: 'mg', dv: 11, type: 'mineral', color: 'text-pastel-lavender', barColor: 'bg-indigo-400' },
      phosphorus: { name: 'Phosphorus', unit: 'mg', dv: 1250, type: 'mineral', color: 'text-amber-200', barColor: 'bg-amber-400' },
      chloride: { name: 'Chloride', unit: 'mg', dv: 2300, type: 'mineral', color: 'text-sky-300', barColor: 'bg-blue-400' },
      sulfur: { name: 'Sulfur', unit: 'mg', dv: 800, type: 'mineral', color: 'text-yellow-200', barColor: 'bg-yellow-500' },
      copper: { name: 'Copper', unit: 'mg', dv: 0.9, type: 'mineral', color: 'text-orange-300', barColor: 'bg-amber-600' },
      manganese: { name: 'Manganese', unit: 'mg', dv: 2.3, type: 'mineral', color: 'text-purple-300', barColor: 'bg-purple-500' },
      selenium: { name: 'Selenium', unit: 'mcg', dv: 55, type: 'mineral', color: 'text-pink-300', barColor: 'bg-pink-400' },
      iodine: { name: 'Iodine', unit: 'mcg', dv: 150, type: 'mineral', color: 'text-indigo-300', barColor: 'bg-indigo-500' },
      chromium: { name: 'Chromium', unit: 'mcg', dv: 35, type: 'mineral', color: 'text-blue-300', barColor: 'bg-blue-500' },
      molybdenum: { name: 'Molybdenum', unit: 'mcg', dv: 45, type: 'mineral', color: 'text-teal-300', barColor: 'bg-teal-500' }
    };

    // ==============================================
    // CENTRAL UNIFIED FOOD & RECIPE MASTER CATALOG
    // Single source of truth across Kitchen, Recipes, and Nutrition
    // ==============================================
    function estimateRecipeServingGrams(recipeTitle = '', ingredients = []) {
      const titleLower = (recipeTitle || '').toLowerCase();
      if (titleLower.includes('german pancake')) {
        return { serving: '1 slice (1/5 pan)', servingGrams: 215 };
      }
      if (titleLower.includes('smoothie')) {
        return { serving: '1 glass (12 fl oz)', servingGrams: 355 };
      }
      if (titleLower.includes('soup') || titleLower.includes('stew') || titleLower.includes('chili')) {
        return { serving: '1 bowl (1.5 cups)', servingGrams: 360 };
      }
      if (titleLower.includes('salad') || titleLower.includes('bowl')) {
        return { serving: '1 bowl (2 cups)', servingGrams: 310 };
      }
      if (titleLower.includes('sandwich') || titleLower.includes('wrap')) {
        return { serving: '1 sandwich', servingGrams: 245 };
      }
      const ingCount = Array.isArray(ingredients) ? ingredients.length : 4;
      const estGrams = Math.min(420, Math.max(180, ingCount * 45));
      return { serving: '1 serving (1 cup)', servingGrams: estGrams };
    }

    function buildRecipeUnifiedNutrition(r) {
      const kcal = r.kcal || 380;
      const protein = r.protein != null ? r.protein : Math.round((kcal * 0.22) / 4);
      const carbs = r.carbs != null ? r.carbs : Math.round((kcal * 0.45) / 4);
      const fat = r.fat != null ? r.fat : Math.round((kcal * 0.33) / 9);
      const fiber = r.fiber != null ? r.fiber : 3.5;
      const sugar = r.sugar != null ? r.sugar : 6.0;
      const satFat = r.satFat != null ? r.satFat : Math.round(fat * 0.3 * 10) / 10;
      const sodium = r.sodium != null ? r.sodium : 340;
      const water = r.water != null ? r.water : 140;
      const { serving, servingGrams } = estimateRecipeServingGrams(r.title || r.name || '', r.ingredients || []);

      if (r.nutrition && r.nutrition.micros) {
        return {
          serving: r.serving || r.nutrition.serving || serving,
          servingGrams: r.servingGrams || r.nutrition.servingGrams || servingGrams,
          nutrition: {
            ...r.nutrition,
            serving: r.serving || r.nutrition.serving || serving,
            servingGrams: r.servingGrams || r.nutrition.servingGrams || servingGrams
          }
        };
      }

      const micros = estimateMicronutrientsForFood(r.familyCategory || r.format || 'meal', kcal, protein, carbs, fat, r.title || r.name || '');
      return {
        serving: r.serving || serving,
        servingGrams: r.servingGrams || servingGrams,
        nutrition: {
          kcal,
          protein,
          carbs,
          fat,
          fiber,
          sugar,
          addedSugar: 0,
          satFat,
          transFat: 0,
          sodium,
          cholesterol: (r.title || '').toLowerCase().includes('german pancake') ? 185 : 45,
          water,
          serving: r.serving || serving,
          servingGrams: r.servingGrams || servingGrams,
          micros,
          verifiedNutrients: r.verifiedNutrients || {}
        }
      };
    }

    function getUnifiedFoodOrMeal(query = '') {
      const q = (query || '').toLowerCase().trim();
      const results = [];
      const seenKeys = new Set();

      const addResult = (entry) => {
        const key = `${(entry.name || '').toLowerCase()}|${entry.type || 'food'}`;
        if (seenKeys.has(key)) return;
        seenKeys.add(key);
        results.push(entry);
      };

      // 1. Check Active Pantry & Leftovers (so leftovers like German Pancakes in fridge share the exact reference)
      if (window.state && Array.isArray(window.state.pantry)) {
        for (const p of window.state.pantry) {
          const nameLower = (p.name || '').toLowerCase();
          if (!q || nameLower.includes(q)) {
            const nut = p.nutrition || {};
            const serving = p.serving || nut.serving || (p.unit && p.unit !== 'g' ? `1 ${p.unit}` : '1 serving');
            const servingGrams = p.servingGrams || nut.servingGrams || (p.unit === 'g' ? (parseFloat(p.amount) || 100) : 100);
            addResult({
              id: p.id,
              pantryItemId: p.id,
              name: p.name,
              brand: p.brand || '',
              type: p.category === 'leftovers' ? 'leftover' : 'pantry_item',
              source: 'Kitchen Pantry',
              serving,
              servingGrams,
              category: p.category || 'produce',
              storage: p.storage || 'fridge',
              kcal: nut.kcal != null ? nut.kcal : (p.kcal || 120),
              protein: nut.protein != null ? nut.protein : (p.protein || 4),
              carbs: nut.carbs != null ? nut.carbs : (p.carbs || 15),
              fat: nut.fat != null ? nut.fat : (p.fat || 3),
              fiber: nut.fiber != null ? nut.fiber : (p.fiber || 2),
              sugar: nut.sugar != null ? nut.sugar : (p.sugar || 2),
              satFat: nut.satFat != null ? nut.satFat : (p.satFat || 0.5),
              sodium: nut.sodium != null ? nut.sodium : (p.sodium || 45),
              water: nut.water || 0,
              micros: nut.micros || {},
              verifiedNutrients: p.verifiedNutrients || nut.verifiedNutrients || {},
              nutrition: {
                kcal: nut.kcal != null ? nut.kcal : (p.kcal || 120),
                protein: nut.protein != null ? nut.protein : (p.protein || 4),
                carbs: nut.carbs != null ? nut.carbs : (p.carbs || 15),
                fat: nut.fat != null ? nut.fat : (p.fat || 3),
                fiber: nut.fiber != null ? nut.fiber : (p.fiber || 2),
                sugar: nut.sugar != null ? nut.sugar : (p.sugar || 2),
                satFat: nut.satFat != null ? nut.satFat : (p.satFat || 0.5),
                sodium: nut.sodium != null ? nut.sodium : (p.sodium || 45),
                water: nut.water || 0,
                serving,
                servingGrams,
                micros: nut.micros || {},
                verifiedNutrients: p.verifiedNutrients || nut.verifiedNutrients || {}
              },
              isVerified: Boolean(p.isVerified)
            });
          }
        }
      }

      // 2. Check Custom & Family Recipes in state.recipes & familyCookbookDatabase (e.g. German Pancakes)
      const allRecipesPool = [
        ...((window.state && Array.isArray(window.state.recipes)) ? window.state.recipes : []),
        ...((typeof familyCookbookDatabase !== 'undefined' && Array.isArray(familyCookbookDatabase)) ? familyCookbookDatabase : []),
        ...((typeof FAMILY_RECIPES !== 'undefined' && Array.isArray(FAMILY_RECIPES)) ? FAMILY_RECIPES : [])
      ];
      for (const r of allRecipesPool) {
        const titleLower = (r.title || '').toLowerCase();
        if (!q || titleLower.includes(q)) {
          const built = buildRecipeUnifiedNutrition(r);
          addResult({
            id: r.id,
            recipeId: r.id,
            name: r.title,
            type: 'recipe',
            source: r.origin === 'family' ? 'Heirloom Cookbook' : 'Recipe Codex',
            serving: built.serving,
            servingGrams: built.servingGrams,
            category: 'leftovers',
            storage: 'fridge',
            kcal: built.nutrition.kcal,
            protein: built.nutrition.protein,
            carbs: built.nutrition.carbs,
            fat: built.nutrition.fat,
            fiber: built.nutrition.fiber,
            sugar: built.nutrition.sugar,
            satFat: built.nutrition.satFat,
            sodium: built.nutrition.sodium,
            water: built.nutrition.water,
            micros: built.nutrition.micros,
            verifiedNutrients: built.nutrition.verifiedNutrients || {},
            nutrition: built.nutrition,
            ingredients: r.ingredients || [],
            instructions: r.instructions || '',
            cookTime: r.cookTime || 25,
            servings: r.servings || '4-6',
            isVerified: Boolean(r.isVerified)
          });
        }
      }

      // 3. Check USDA Foundation Whole Foods (e.g. Apple, Banana, Salmon)
      if (typeof commonFoodsDatabase !== 'undefined' && Array.isArray(commonFoodsDatabase)) {
        for (const cf of commonFoodsDatabase) {
          const nameLower = (cf.name || '').toLowerCase();
          if (!q || nameLower.includes(q) || (cf.category && cf.category.toLowerCase().includes(q))) {
            const verifiedMap = {
              kcal: true, protein: true, carbs: true, fat: true, fiber: true,
              sugar: true, satFat: true, sodium: true, water: true
            };
            if (cf.micros) {
              Object.keys(cf.micros).forEach(mk => { verifiedMap[mk] = true; });
            }
            const serving = cf.serving || '1 serving';
            const servingGrams = cf.servingGrams || 100;
            addResult({
              id: cf.id,
              name: cf.name,
              type: 'whole_food',
              source: 'USDA Foundation',
              serving,
              servingGrams,
              category: cf.category || 'produce',
              storage: cf.storage || 'fridge',
              kcal: cf.kcal,
              protein: cf.protein,
              carbs: cf.carbs,
              fat: cf.fat,
              fiber: cf.fiber || 0,
              sugar: cf.sugar || 0,
              satFat: cf.satFat || 0,
              sodium: cf.sodium || 0,
              water: cf.water || 0,
              potassium: cf.potassium || cf.micros?.potassium || 0,
              calcium: cf.calcium || cf.micros?.calcium || 0,
              iron: cf.iron || cf.micros?.iron || 0,
              micros: cf.micros || {},
              verifiedNutrients: verifiedMap,
              nutrition: {
                kcal: cf.kcal,
                protein: cf.protein,
                carbs: cf.carbs,
                fat: cf.fat,
                fiber: cf.fiber || 0,
                sugar: cf.sugar || 0,
                satFat: cf.satFat || 0,
                sodium: cf.sodium || 0,
                water: cf.water || 0,
                serving,
                servingGrams,
                micros: cf.micros || {},
                verifiedNutrients: verifiedMap
              },
              isVerified: true
            });
          }
        }
      }

      // 4. Check Custom Barcode & Verified Scanned Database
      const customDb = (typeof getCustomBarcodeDb === 'function') ? getCustomBarcodeDb() : {};
      Object.keys(customDb).forEach(code => {
        const item = customDb[code];
        if (item && item.name && (!q || item.name.toLowerCase().includes(q))) {
          const serving = item.serving || item.nutrition?.serving || '1 serving';
          const servingGrams = item.servingGrams || item.nutrition?.servingGrams || 100;
          addResult({
            id: `barcode-${code}`,
            name: item.name,
            brand: item.brand,
            type: 'packaged_food',
            source: 'Verified Barcode Catalog',
            barcode: code,
            serving,
            servingGrams,
            category: item.category || 'pantry_staples',
            storage: item.storage || 'shelf',
            kcal: item.kcal,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            fiber: item.fiber || 0,
            sugar: item.sugar || 0,
            satFat: item.satFat || 0,
            sodium: item.sodium || 0,
            micros: item.nutrition?.micros || {},
            verifiedNutrients: item.verifiedNutrients || item.nutrition?.verifiedNutrients || {},
            nutrition: item.nutrition || {
              kcal: item.kcal,
              protein: item.protein,
              carbs: item.carbs,
              fat: item.fat,
              fiber: item.fiber || 0,
              sugar: item.sugar || 0,
              satFat: item.satFat || 0,
              sodium: item.sodium || 0,
              serving,
              servingGrams,
              micros: {}
            },
            isVerified: true
          });
        }
      });

      return results;
    }

    // Shield checkmark icon generator for verified nutrients
    function renderVerifiedShieldIcon(titleText = '100% Verified by Nutrition Facts Label') {
      return `<span class="inline-flex items-center text-emerald-400 align-middle mx-0.5 shrink-0" title="${titleText}"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="rgba(16,185,129,0.18)" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg></span>`;
    }

    function renderEstimatedTildeIcon(titleText = 'Estimated based on USDA reference food') {
      return `<span class="inline-flex items-center justify-center px-1 rounded bg-amber-400/15 text-amber-300 font-bold font-mono text-[11px] leading-none align-middle mx-0.5 shrink-0" title="${titleText}">~</span>`;
    }

    function renderNutrientVerificationBadge(isVerified = false, titleText = '') {
      return isVerified ? renderVerifiedShieldIcon(titleText) : renderEstimatedTildeIcon(titleText);
    }

    // Specific-Food USDA Matcher (matches exact food like "Apple" -> USDA "Medium Apple", never generic fruit unless no match)
    function findClosestUsdaFood(name = '', category = '') {
      if (typeof commonFoodsDatabase === 'undefined' || !Array.isArray(commonFoodsDatabase) || commonFoodsDatabase.length === 0) {
        return null;
      }
      const clean = (name || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
      const tokens = clean.split(/\s+/).filter(t => t.length >= 2 && !['organic', 'fresh', 'raw', 'cooked', 'large', 'medium', 'small', 'whole', 'sliced', 'diced', 'cup', 'oz', 'grams', 'serving', 'leftover'].includes(t));

      let bestMatch = null;
      let bestScore = 0;

      for (const food of commonFoodsDatabase) {
        const fName = (food.name || '').toLowerCase();
        const fId = (food.id || '').replace('cf-', '').toLowerCase();
        let score = 0;

        if (clean && (fName === clean || fId === clean)) {
          score += 100;
        }
        if (clean && (fName.includes(clean) || clean.includes(fId))) {
          score += 55;
        }
        for (const tok of tokens) {
          const singular = tok.endsWith('es') ? tok.slice(0, -2) : (tok.endsWith('s') ? tok.slice(0, -1) : tok);
          if (fId === tok || fId === singular) score += 50;
          if (new RegExp(`\\b${singular}`, 'i').test(fName)) score += 35;
          else if (fName.includes(singular)) score += 15;
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = food;
        }
      }

      if (bestMatch && bestScore >= 15) {
        return bestMatch;
      }

      // Secondary fallback by category so user always sees which USDA food reference is proposed
      const catLower = (category || '').toLowerCase();
      if (catLower.includes('fruit')) return commonFoodsDatabase.find(f => f.id === 'cf-apple') || commonFoodsDatabase[0];
      if (catLower.includes('produce') || catLower.includes('veg')) return commonFoodsDatabase.find(f => f.id === 'cf-broccoli') || commonFoodsDatabase[0];
      if (catLower.includes('dairy')) return commonFoodsDatabase.find(f => f.id === 'cf-milk-whole') || commonFoodsDatabase[0];
      if (catLower.includes('protein') || catLower.includes('meat')) return commonFoodsDatabase.find(f => f.id === 'cf-chicken-breast') || commonFoodsDatabase[0];
      if (catLower.includes('grain')) return commonFoodsDatabase.find(f => f.id === 'cf-oats') || commonFoodsDatabase[0];
      return commonFoodsDatabase[0];
    }

    function estimateMicronutrientsForFood(category, kcal, protein, carbs, fat, name, servingGramsOverride = null) {
      // 1. Prioritize specific USDA food match first (e.g. Apple uses USDA Apple, not generic fruit)
      const matchedFood = findClosestUsdaFood(name, category);
      if (matchedFood && matchedFood.micros) {
        const targetKcal = parseFloat(kcal) || 0;
        const targetGrams = parseFloat(servingGramsOverride) || 0;
        let ratio = 1.0;
        if (targetGrams > 0 && matchedFood.servingGrams > 0) {
          ratio = targetGrams / matchedFood.servingGrams;
        } else if (targetKcal > 0 && matchedFood.kcal > 0) {
          ratio = targetKcal / matchedFood.kcal;
        }
        ratio = Math.min(Math.max(ratio, 0.15), 4.0);

        const scaledMicros = {};
        Object.keys(DAILY_NUTRITION_STANDARDS).forEach(k => {
          const baseVal = parseFloat(matchedFood.micros[k]) || 0;
          const rawScaled = baseVal * ratio;
          scaledMicros[k] = rawScaled >= 10 ? Math.round(rawScaled) : parseFloat(rawScaled.toFixed(2));
        });
        return scaledMicros;
      }

      const cat = (category || '').toLowerCase();
      const nm = (name || '').toLowerCase();
      const c = Math.max(parseFloat(kcal) || 0, 10);
      const scale = Math.min(Math.max(c / 150, 0.3), 3.0);

      // Defaults
      let vitA = Math.round(15 * scale);
      let vitC = 1.0 * scale;
      let vitD = 0;
      let vitE = 0.5 * scale;
      let vitK = 2.0 * scale;
      let vitB1 = 0.04 * scale;
      let vitB2 = 0.05 * scale;
      let vitB3 = 0.8 * scale;
      let vitB5 = 0.3 * scale;
      let vitB6 = 0.1 * scale;
      let vitB7 = 1.2 * scale;
      let vitB9 = 15 * scale;
      let vitB12 = 0;
      let choline = 12 * scale;

      let potassium = Math.round(120 * scale);
      let calcium = Math.round(25 * scale);
      let iron = 0.5 * scale;
      let magnesium = Math.round(18 * scale);
      let zinc = 0.4 * scale;
      let phosphorus = Math.round(45 * scale);
      let chloride = Math.round(60 * scale);
      let sulfur = Math.round(35 * scale);
      let copper = 0.06 * scale;
      let manganese = 0.15 * scale;
      let selenium = 2.0 * scale;
      let iodine = 3.0 * scale;
      let chromium = 1.5 * scale;
      let molybdenum = 2.0 * scale;

      // Category / Ingredient Adjustments
      if (cat.includes('produce') || cat.includes('fruit') || cat.includes('veg') || nm.includes('broccoli') || nm.includes('spinach') || nm.includes('salad') || nm.includes('apple') || nm.includes('berry') || nm.includes('orange')) {
        vitC = Math.round(35 * scale);
        vitA = Math.round(180 * scale);
        vitK = Math.round(45 * scale);
        vitB9 = Math.round(55 * scale);
        potassium = Math.round(280 * scale);
        calcium = Math.round(40 * scale);
        iron = 0.8 * scale;
        magnesium = Math.round(25 * scale);
        manganese = 0.3 * scale;
        if (nm.includes('broccoli') || nm.includes('kale') || nm.includes('spinach')) {
          vitK = Math.round(110 * scale);
          vitC = Math.round(85 * scale);
          calcium = Math.round(65 * scale);
          vitA = Math.round(450 * scale);
        }
      } else if (cat.includes('protein') || cat.includes('meat') || cat.includes('poultry') || nm.includes('chicken') || nm.includes('beef') || nm.includes('turkey') || nm.includes('pork')) {
        vitB12 = 0.9 * scale;
        vitB3 = 8.5 * scale;
        vitB6 = 0.6 * scale;
        choline = Math.round(75 * scale);
        zinc = 2.4 * scale;
        iron = 1.4 * scale;
        phosphorus = Math.round(195 * scale);
        selenium = Math.round(24 * scale);
        potassium = Math.round(290 * scale);
        sulfur = Math.round(210 * scale);
      } else if (nm.includes('egg')) {
        choline = Math.round(280 * scale);
        vitB12 = 1.1 * scale;
        vitD = 2.0 * scale;
        vitA = Math.round(160 * scale);
        iron = 1.8 * scale;
        selenium = Math.round(30 * scale);
        zinc = 1.3 * scale;
        sulfur = Math.round(180 * scale);
      } else if (cat.includes('dairy') || nm.includes('yogurt') || nm.includes('milk') || nm.includes('cheese')) {
        calcium = Math.round(220 * scale);
        vitD = 1.5 * scale;
        vitB12 = 0.8 * scale;
        vitB2 = 0.35 * scale;
        phosphorus = Math.round(180 * scale);
        potassium = Math.round(210 * scale);
        iodine = Math.round(35 * scale);
      } else if (cat.includes('grain') || nm.includes('oat') || nm.includes('rice') || nm.includes('bread') || nm.includes('quinoa')) {
        vitB1 = 0.25 * scale;
        vitB2 = 0.15 * scale;
        vitB3 = 2.5 * scale;
        vitB9 = Math.round(60 * scale);
        iron = 1.6 * scale;
        magnesium = Math.round(55 * scale);
        zinc = 1.1 * scale;
        phosphorus = Math.round(120 * scale);
        manganese = 1.2 * scale;
        selenium = Math.round(12 * scale);
      } else if (cat.includes('beverage') || cat.includes('drink') || nm.includes('juice')) {
        potassium = Math.round(180 * scale);
        chloride = Math.round(50 * scale);
        if (nm.includes('juice') || nm.includes('citrus')) {
          vitC = Math.round(60 * scale);
          potassium = Math.round(320 * scale);
        }
      }

      return {
        vitA: Math.round(vitA),
        vitC: parseFloat(vitC.toFixed(1)),
        vitD: parseFloat(vitD.toFixed(1)),
        vitE: parseFloat(vitE.toFixed(1)),
        vitK: parseFloat(vitK.toFixed(1)),
        vitB1: parseFloat(vitB1.toFixed(2)),
        vitB2: parseFloat(vitB2.toFixed(2)),
        vitB3: parseFloat(vitB3.toFixed(1)),
        vitB5: parseFloat(vitB5.toFixed(1)),
        vitB6: parseFloat(vitB6.toFixed(2)),
        vitB7: parseFloat(vitB7.toFixed(1)),
        vitB9: Math.round(vitB9),
        vitB12: parseFloat(vitB12.toFixed(2)),
        choline: Math.round(choline),

        potassium: Math.round(potassium),
        calcium: Math.round(calcium),
        iron: parseFloat(iron.toFixed(1)),
        magnesium: Math.round(magnesium),
        zinc: parseFloat(zinc.toFixed(1)),
        phosphorus: Math.round(phosphorus),
        chloride: Math.round(chloride),
        sulfur: Math.round(sulfur),
        copper: parseFloat(copper.toFixed(2)),
        manganese: parseFloat(manganese.toFixed(2)),
        selenium: Math.round(selenium),
        iodine: Math.round(iodine),
        chromium: Math.round(chromium),
        molybdenum: Math.round(molybdenum)
      };
    }

    if (typeof window !== 'undefined') {
      window.DAILY_NUTRITION_STANDARDS = DAILY_NUTRITION_STANDARDS;
      window.getUnifiedFoodOrMeal = getUnifiedFoodOrMeal;
      window.estimateMicronutrientsForFood = estimateMicronutrientsForFood;
    }

    // ==============================================
    // USDA COMMON WHOLE FOODS DATABASE (Loaded globally from data/usda-foods.js)
    // ==============================================

    function onSearchCommonFoods(query) {
      const resultsContainer = document.getElementById('common-food-search-results');
      if (!resultsContainer) return;

      const q = (query || '').trim().toLowerCase();
      if (!q || q.length < 2) {
        resultsContainer.innerHTML = '';
        resultsContainer.classList.add('hidden');
        return;
      }

      const matches = getUnifiedFoodOrMeal(q);
      if (matches.length === 0) {
        resultsContainer.innerHTML = '<div class="text-[11px] text-slate-400 p-2">No matching foods or recipes found. You can enter values manually or scan a barcode.</div>';
        resultsContainer.classList.remove('hidden');
        return;
      }

      resultsContainer.innerHTML = '';
      matches.slice(0, 10).forEach(item => {
        const row = document.createElement('div');
        row.className = "p-2 rounded-lg bg-dark-elevated hover:bg-slate-700 cursor-pointer flex items-center justify-between text-xs transition border border-transparent hover:border-pastel-mint/40 gap-2";
        row.onclick = () => selectCommonFood(item);
        const badgeIcon = item.isVerified ? renderVerifiedShieldIcon('Verified Food') : renderEstimatedTildeIcon('Estimated Food');
        const srvText = `1 serving = ${item.serving || '1 serving'} (${item.servingGrams || 100} g)`;
        row.innerHTML = `
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1 flex-wrap">
              <span class="font-semibold text-slate-200 truncate">${item.name}</span>
              ${badgeIcon}
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-dark-base text-slate-400 font-mono">${item.source || 'Catalog'}</span>
            </div>
            <span class="text-[10px] text-pastel-sky font-mono block">${srvText}</span>
            <span class="text-[10px] font-mono"><span class="text-pastel-coral font-bold">P: ${item.protein}g</span> | <span class="text-pastel-mint font-bold">C: ${item.carbs}g</span> | <span class="text-pastel-butter font-bold">F: ${item.fat}g</span> | Fib: ${item.fiber || 0}g</span>
          </div>
          <span class="font-mono font-bold text-pastel-lavender text-xs shrink-0">${item.kcal} kcal</span>
        `;
        resultsContainer.appendChild(row);
      });
      resultsContainer.classList.remove('hidden');
    }

    function selectCommonFood(item) {
      window.selectedLogFoodReference = item;
      document.getElementById('food-input-name').value = item.name;
      document.getElementById('food-input-kcal').value = item.kcal;
      document.getElementById('food-input-protein').value = item.protein;
      document.getElementById('food-input-carbs').value = item.carbs;
      document.getElementById('food-input-fat').value = item.fat;
      document.getElementById('food-input-fiber').value = item.fiber || 0;
      document.getElementById('food-input-sodium').value = item.sodium || 0;
      document.getElementById('food-input-potassium').value = item.potassium || item.micros?.potassium || 0;
      document.getElementById('food-input-iron').value = item.iron || item.micros?.iron || 0;
      document.getElementById('food-input-calcium').value = item.calcium || item.micros?.calcium || 0;

      const resultsContainer = document.getElementById('common-food-search-results');
      if (resultsContainer) resultsContainer.classList.add('hidden');
      const searchInput = document.getElementById('common-food-search-input');
      if (searchInput) searchInput.value = '';

      setLogAccuracyMode(item.isVerified ? 'verified' : 'estimated');
      playChime('bell');
      alertBox(`Selected "${item.name}" — 1 serving = ${item.serving || '1 serving'} (${item.servingGrams || 100} g)!`, item.source || "Food Selected");
    }

    function fillFromSavedRecipe(recipeId) {
      if (!recipeId) return;
      const recipe = state.recipes.find(r => r.id === recipeId);
      if (!recipe) return;

      const built = buildRecipeUnifiedNutrition(recipe);
      const nut = built.nutrition;
      window.selectedLogFoodReference = {
        ...recipe,
        recipeId: recipe.id,
        name: recipe.title,
        serving: built.serving,
        servingGrams: built.servingGrams,
        kcal: nut.kcal,
        protein: nut.protein,
        carbs: nut.carbs,
        fat: nut.fat,
        fiber: nut.fiber,
        sugar: nut.sugar,
        satFat: nut.satFat,
        sodium: nut.sodium,
        water: nut.water,
        micros: nut.micros,
        verifiedNutrients: nut.verifiedNutrients,
        nutrition: nut,
        isVerified: Boolean(recipe.isVerified)
      };

      document.getElementById('food-input-name').value = `${recipe.title} (1 serving = ${built.serving}, ${built.servingGrams} g)`;
      document.getElementById('food-input-kcal').value = nut.kcal;
      document.getElementById('food-input-protein').value = nut.protein;
      document.getElementById('food-input-carbs').value = nut.carbs;
      document.getElementById('food-input-fat').value = nut.fat;
      document.getElementById('food-input-fiber').value = nut.fiber || 0;
      document.getElementById('food-input-sodium').value = nut.sodium || 0;
      document.getElementById('food-input-potassium').value = nut.micros?.potassium || 0;
      document.getElementById('food-input-iron').value = nut.micros?.iron || 0;
      document.getElementById('food-input-calcium').value = nut.micros?.calcium || 0;

      setLogAccuracyMode(recipe.isVerified ? 'verified' : 'estimated');
      playChime('bell');
      alertBox(`Populated "${recipe.title}" — 1 serving = ${built.serving} (${built.servingGrams} g).`, "Recipe Selected");
    }

    function renderSavedRecipesDropdown() {
      const select = document.getElementById('quick-recipe-log-select');
      if (!select) return;
      select.innerHTML = '<option value="">-- Choose a Recipe --</option>';
      state.recipes.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = `${r.title} (${r.kcal || 450} kcal)`;
        select.appendChild(opt);
      });
    }

    // ==============================================
    // ==============================================
    // MANUAL NUTRITION MODAL (ALL MACROS & 27 MICRONUTRIENTS)
    // ==============================================
    let activeManualNutritionContext = null;
    window.activeManualVerifiedMap = {};
    window.pendingUsdaSupplementFood = null;

    const MANUAL_NUTRITION_FIELD_MAP = [
      { id: 'manual-nut-kcal', key: 'kcal', targetKey: 'dailyCaloriesTarget', defaultTarget: 2130, isUpper: false },
      { id: 'manual-nut-protein', key: 'protein', targetKey: 'dailyProteinTarget', defaultTarget: 135, isUpper: false },
      { id: 'manual-nut-carbs', key: 'carbs', targetKey: 'dailyCarbsTarget', defaultTarget: 240, isUpper: false },
      { id: 'manual-nut-fat', key: 'fat', targetKey: 'dailyFatTarget', defaultTarget: 71, isUpper: false },
      { id: 'manual-nut-fiber', key: 'fiber', targetKey: 'dailyFiberTarget', defaultTarget: 30, isUpper: false },
      { id: 'manual-nut-sugar', key: 'sugar', defaultTarget: 50, isUpper: true },
      { id: 'manual-nut-added-sugar', key: 'addedSugar', defaultTarget: 25, isUpper: true },
      { id: 'manual-nut-sat-fat', key: 'satFat', defaultTarget: 20, isUpper: true },
      { id: 'manual-nut-trans-fat', key: 'transFat', defaultTarget: 2, isUpper: true },
      { id: 'manual-nut-sodium', key: 'sodium', targetKey: 'dailySodiumTarget', defaultTarget: 2300, isUpper: true },
      { id: 'manual-nut-cholesterol', key: 'cholesterol', defaultTarget: 300, isUpper: true },
      { id: 'manual-nut-water', key: 'water', defaultTarget: 2700, isUpper: false },
      { id: 'manual-nut-vitA', key: 'vitA', isMicro: true },
      { id: 'manual-nut-vitC', key: 'vitC', isMicro: true },
      { id: 'manual-nut-vitD', key: 'vitD', isMicro: true },
      { id: 'manual-nut-vitE', key: 'vitE', isMicro: true },
      { id: 'manual-nut-vitK', key: 'vitK', isMicro: true },
      { id: 'manual-nut-vitB1', key: 'vitB1', isMicro: true },
      { id: 'manual-nut-vitB2', key: 'vitB2', isMicro: true },
      { id: 'manual-nut-vitB3', key: 'vitB3', isMicro: true },
      { id: 'manual-nut-vitB5', key: 'vitB5', isMicro: true },
      { id: 'manual-nut-vitB6', key: 'vitB6', isMicro: true },
      { id: 'manual-nut-vitB7', key: 'vitB7', isMicro: true },
      { id: 'manual-nut-vitB9', key: 'vitB9', isMicro: true },
      { id: 'manual-nut-vitB12', key: 'vitB12', isMicro: true },
      { id: 'manual-nut-choline', key: 'choline', isMicro: true },
      { id: 'manual-nut-potassium', key: 'potassium', isMicro: true },
      { id: 'manual-nut-calcium', key: 'calcium', isMicro: true },
      { id: 'manual-nut-iron', key: 'iron', isMicro: true },
      { id: 'manual-nut-magnesium', key: 'magnesium', isMicro: true },
      { id: 'manual-nut-zinc', key: 'zinc', isMicro: true },
      { id: 'manual-nut-phosphorus', key: 'phosphorus', isMicro: true },
      { id: 'manual-nut-chloride', key: 'chloride', isMicro: true },
      { id: 'manual-nut-sulfur', key: 'sulfur', isMicro: true },
      { id: 'manual-nut-copper', key: 'copper', isMicro: true },
      { id: 'manual-nut-manganese', key: 'manganese', isMicro: true },
      { id: 'manual-nut-selenium', key: 'selenium', isMicro: true },
      { id: 'manual-nut-iodine', key: 'iodine', isMicro: true },
      { id: 'manual-nut-chromium', key: 'chromium', isMicro: true },
      { id: 'manual-nut-molybdenum', key: 'molybdenum', isMicro: true }
    ];

    function toggleManualNutrientVerified(key) {
      if (!window.activeManualVerifiedMap) window.activeManualVerifiedMap = {};
      const fieldDef = MANUAL_NUTRITION_FIELD_MAP.find(f => f.key === key);
      const inputEl = fieldDef ? document.getElementById(fieldDef.id) : null;
      const hasVal = inputEl && inputEl.value !== '' && inputEl.value != null;
      if (!hasVal && !window.activeManualVerifiedMap[key]) {
        // Confirming 0 on an empty field sets it to verified 0
        if (inputEl) inputEl.value = '0';
        window.activeManualVerifiedMap[key] = true;
      } else {
        window.activeManualVerifiedMap[key] = !window.activeManualVerifiedMap[key];
      }
      syncManualNutritionInteractiveBadges();
    }

    function syncManualNutritionInteractiveBadges() {
      const profile = (typeof state !== 'undefined' && state.userProfile) ? state.userProfile : {};
      MANUAL_NUTRITION_FIELD_MAP.forEach(field => {
        const inputEl = document.getElementById(field.id);
        if (!inputEl) return;
        const wrapper = inputEl.parentElement;
        if (!wrapper) return;

        // Bind input listener once so typing marks the nutrient as verified or clears verification if emptied
        if (!inputEl.dataset.boundVerifyListener) {
          inputEl.dataset.boundVerifyListener = '1';
          inputEl.addEventListener('input', () => {
            if (!window.activeManualVerifiedMap) window.activeManualVerifiedMap = {};
            if (inputEl.value !== '' && inputEl.value != null) {
              window.activeManualVerifiedMap[field.key] = true;
            } else {
              delete window.activeManualVerifiedMap[field.key];
            }
            syncManualNutritionInteractiveBadges();
          });
        }

        const rawStr = (inputEl.value ?? '').toString().trim();
        const hasVal = rawStr !== '';
        const numVal = hasVal ? parseFloat(rawStr) : NaN;
        const isVerified = Boolean(window.activeManualVerifiedMap && window.activeManualVerifiedMap[field.key]) && hasVal;

        let target = field.defaultTarget || 100;
        let isUpper = Boolean(field.isUpper);
        if (field.isMicro && DAILY_NUTRITION_STANDARDS[field.key]) {
          target = DAILY_NUTRITION_STANDARDS[field.key].dv || 100;
          isUpper = Boolean(DAILY_NUTRITION_STANDARDS[field.key].isUpperLimit);
        } else if (field.targetKey && profile[field.targetKey]) {
          target = profile[field.targetKey];
        }

        let badgeContainer = wrapper.querySelector('.manual-nut-live-meta');
        if (!badgeContainer) {
          badgeContainer = document.createElement('div');
          badgeContainer.className = 'manual-nut-live-meta flex items-center justify-between gap-1 mt-1 text-[9.5px] font-mono';
          wrapper.appendChild(badgeContainer);
        }

        if (!hasVal || isNaN(numVal)) {
          inputEl.placeholder = '—';
          badgeContainer.innerHTML = `
            <button type="button" onclick="toggleManualNutrientVerified('${field.key}')" class="inline-flex items-center gap-1 text-slate-500 hover:text-slate-300 transition" title="No data entered yet (click to confirm as 0)">
              <span>— Unentered</span>
            </button>
            <span class="text-slate-600">—</span>
          `;
        } else {
          const col = getNutrientProgressColor(numVal, target, isUpper);
          const pct = target > 0 ? Math.round((numVal / target) * 100) : 0;
          const badgeHtml = isVerified
            ? `${renderVerifiedShieldIcon('Verified by Nutrition Label (click to toggle)')} <span class="text-emerald-400 font-bold">Verified</span>`
            : `${renderEstimatedTildeIcon('Estimated value (click to mark verified)')} <span class="text-amber-300 font-bold">Estimated</span>`;
          badgeContainer.innerHTML = `
            <button type="button" onclick="toggleManualNutrientVerified('${field.key}')" class="inline-flex items-center gap-0.5 hover:opacity-80 transition">
              ${badgeHtml}
            </button>
            <span class="${col.textClass} font-bold" title="${pct}% of daily target (${target})">${pct}% DV</span>
          `;
        }
      });
    }

    function openManualNutritionModal(params = {}) {
      activeManualNutritionContext = params;
      const modal = document.getElementById('manual-nutrition-modal');
      if (!modal) return;

      const titleEl = document.getElementById('manual-nut-modal-title');
      const badgeEl = document.getElementById('manual-nut-barcode-badge');

      if (params.isPantryEdit) {
        if (titleEl) titleEl.textContent = `Edit Nutrition: ${params.name || 'Pantry Item'}`;
        if (badgeEl) badgeEl.classList.add('hidden');
      } else if (params.isFoodLogEdit) {
        if (titleEl) titleEl.textContent = `Edit Logged Food: ${params.name || 'Food Entry'}`;
        if (badgeEl) badgeEl.classList.add('hidden');
      } else if (params.isRecipeEdit) {
        if (titleEl) titleEl.textContent = `Edit Recipe Nutrition: ${params.name || 'Recipe'}`;
        if (badgeEl) badgeEl.classList.add('hidden');
      } else if (params.barcode) {
        if (titleEl) titleEl.textContent = "Nutrition Facts & Micronutrients";
        if (badgeEl) {
          badgeEl.textContent = `UPC: ${params.barcode}`;
          badgeEl.classList.remove('hidden');
        }
      } else {
        if (titleEl) titleEl.textContent = "Nutrition Facts & Micronutrients";
        if (badgeEl) badgeEl.classList.add('hidden');
      }

      const confirmCard = document.getElementById('usda-supplement-confirm-card');
      if (confirmCard) confirmCard.classList.add('hidden');
      const undoBtn = document.getElementById('btn-undo-auto-estimate-micros');
      if (undoBtn) undoBtn.classList.add('hidden');

      const nut = params.nutrition || {};
      const matchedUsda = findClosestUsdaFood(params.name || '', params.category || '');
      const sourcePill = document.getElementById('usda-source-attribution-pill');
      const sourceText = document.getElementById('usda-source-attribution-text');
      const savedUsdaSource = params.usdaSupplementSource || nut.usdaSupplementSource || '';
      if (sourcePill && sourceText) {
        if (savedUsdaSource) {
          sourceText.textContent = `Nutrient information supplemented by USDA "${savedUsdaSource}"`;
          sourcePill.classList.remove('hidden');
        } else {
          sourcePill.classList.add('hidden');
        }
      }

      // Initialize per-nutrient verification map
      const incomingVerified = params.verifiedNutrients || nut.verifiedNutrients || {};
      window.activeManualVerifiedMap = { ...incomingVerified };
      if (params.isVerified && Object.keys(window.activeManualVerifiedMap).length === 0) {
        ['kcal', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'satFat', 'sodium'].forEach(k => {
          const v = nut[k] != null ? nut[k] : params[k];
          if (v != null && v !== '') window.activeManualVerifiedMap[k] = true;
        });
      }

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = (val != null && val !== '') ? val : '';
      };

      // Differentiate confirmed 0 vs unentered empty nutrient values
      const setNutrientVal = (id, key, val) => {
        const el = document.getElementById(id);
        if (!el) return;
        const isConfirmed = Boolean(window.activeManualVerifiedMap[key]);
        if (val === null || val === undefined || val === '') {
          el.value = '';
          return;
        }
        const num = parseFloat(val);
        if (!isNaN(num) && num === 0 && !isConfirmed) {
          el.value = '';
        } else {
          el.value = val;
        }
      };

      setVal('manual-nut-barcode', params.barcode || '');
      setVal('manual-nut-name', params.name || '');
      setVal('manual-nut-brand', params.brand || '');
      setVal('manual-nut-amount', params.amount != null ? params.amount : 1);
      setVal('manual-nut-unit', params.unit || 'items');
      setVal('manual-nut-cat', params.category || 'produce');
      setVal('manual-nut-storage', params.storage || 'fridge');

      const servingDesc = params.serving || nut.serving || matchedUsda?.serving || '1 serving';
      const servingGrams = params.servingGrams || nut.servingGrams || matchedUsda?.servingGrams || 100;
      const servingsPerContainer = params.servingsPerContainer || nut.servingsPerContainer || 1;
      setVal('manual-nut-serving-desc', servingDesc);
      setVal('manual-nut-serving-grams', servingGrams);
      setVal('manual-nut-servings-per-container', servingsPerContainer);

      setNutrientVal('manual-nut-kcal', 'kcal', nut.kcal != null ? nut.kcal : params.kcal);
      setNutrientVal('manual-nut-protein', 'protein', nut.protein != null ? nut.protein : params.protein);
      setNutrientVal('manual-nut-carbs', 'carbs', nut.carbs != null ? nut.carbs : params.carbs);
      setNutrientVal('manual-nut-fat', 'fat', nut.fat != null ? nut.fat : params.fat);
      setNutrientVal('manual-nut-fiber', 'fiber', nut.fiber != null ? nut.fiber : params.fiber);
      setNutrientVal('manual-nut-sugar', 'sugar', nut.sugar != null ? nut.sugar : params.sugar);
      setNutrientVal('manual-nut-added-sugar', 'addedSugar', nut.addedSugar != null ? nut.addedSugar : params.addedSugar);
      setNutrientVal('manual-nut-sat-fat', 'satFat', nut.satFat != null ? nut.satFat : params.satFat);
      setNutrientVal('manual-nut-trans-fat', 'transFat', nut.transFat != null ? nut.transFat : params.transFat);
      setNutrientVal('manual-nut-sodium', 'sodium', nut.sodium != null ? nut.sodium : params.sodium);
      setNutrientVal('manual-nut-cholesterol', 'cholesterol', nut.cholesterol != null ? nut.cholesterol : params.cholesterol);
      setNutrientVal('manual-nut-water', 'water', nut.water != null ? nut.water : params.water);

      // Micronutrients: only populate explicitly saved/provided values (do NOT auto-estimate without user approval!)
      const micros = nut.micros || params.micros || {};

      // All 13 Essential Vitamins + Choline
      setNutrientVal('manual-nut-vitA', 'vitA', micros.vitA);
      setNutrientVal('manual-nut-vitC', 'vitC', micros.vitC);
      setNutrientVal('manual-nut-vitD', 'vitD', micros.vitD);
      setNutrientVal('manual-nut-vitE', 'vitE', micros.vitE);
      setNutrientVal('manual-nut-vitK', 'vitK', micros.vitK);
      setNutrientVal('manual-nut-vitB1', 'vitB1', micros.vitB1);
      setNutrientVal('manual-nut-vitB2', 'vitB2', micros.vitB2);
      setNutrientVal('manual-nut-vitB3', 'vitB3', micros.vitB3);
      setNutrientVal('manual-nut-vitB5', 'vitB5', micros.vitB5);
      setNutrientVal('manual-nut-vitB6', 'vitB6', micros.vitB6);
      setNutrientVal('manual-nut-vitB7', 'vitB7', micros.vitB7);
      setNutrientVal('manual-nut-vitB9', 'vitB9', micros.vitB9);
      setNutrientVal('manual-nut-vitB12', 'vitB12', micros.vitB12);
      setNutrientVal('manual-nut-choline', 'choline', micros.choline);

      // All 14 Essential Minerals
      setNutrientVal('manual-nut-potassium', 'potassium', micros.potassium);
      setNutrientVal('manual-nut-calcium', 'calcium', micros.calcium);
      setNutrientVal('manual-nut-iron', 'iron', micros.iron);
      setNutrientVal('manual-nut-magnesium', 'magnesium', micros.magnesium);
      setNutrientVal('manual-nut-zinc', 'zinc', micros.zinc);
      setNutrientVal('manual-nut-phosphorus', 'phosphorus', micros.phosphorus);
      setNutrientVal('manual-nut-chloride', 'chloride', micros.chloride);
      setNutrientVal('manual-nut-sulfur', 'sulfur', micros.sulfur);
      setNutrientVal('manual-nut-copper', 'copper', micros.copper);
      setNutrientVal('manual-nut-manganese', 'manganese', micros.manganese);
      setNutrientVal('manual-nut-selenium', 'selenium', micros.selenium);
      setNutrientVal('manual-nut-iodine', 'iodine', micros.iodine);
      setNutrientVal('manual-nut-chromium', 'chromium', micros.chromium);
      setNutrientVal('manual-nut-molybdenum', 'molybdenum', micros.molybdenum);

      syncManualNutritionInteractiveBadges();
      switchManualNutMicroTab('vitamins');
      modal.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }

    function closeManualNutritionModal() {
      const modal = document.getElementById('manual-nutrition-modal');
      if (modal) modal.classList.add('hidden');
      activeManualNutritionContext = null;
    }

    function onManualNutritionCategoryChange(cat) {
      const storEl = document.getElementById('manual-nut-storage');
      if (storEl) {
        storEl.value = inferStorageZone(cat, '');
      }
    }

    function switchManualNutMicroTab(tab) {
      const vSec = document.getElementById('manual-section-vitamins');
      const mSec = document.getElementById('manual-section-minerals');
      const vBtn = document.getElementById('manual-tab-btn-vitamins');
      const mBtn = document.getElementById('manual-tab-btn-minerals');

      if (tab === 'minerals') {
        if (mSec) mSec.classList.remove('hidden');
        if (vSec) vSec.classList.add('hidden');
        if (mBtn) mBtn.className = "px-2.5 py-1 rounded-lg bg-pastel-mint text-dark-base font-bold transition";
        if (vBtn) vBtn.className = "px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition";
      } else {
        if (vSec) vSec.classList.remove('hidden');
        if (mSec) mSec.classList.add('hidden');
        if (vBtn) vBtn.className = "px-2.5 py-1 rounded-lg bg-pastel-sky text-dark-base font-bold transition";
        if (mBtn) mBtn.className = "px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition";
      }
    }

    window.preEstimateMicrosSnapshot = null;

    const ALL_MICRONUTRIENT_INPUT_IDS = [
      'manual-nut-vitA', 'manual-nut-vitC', 'manual-nut-vitD', 'manual-nut-vitE', 'manual-nut-vitK',
      'manual-nut-vitB1', 'manual-nut-vitB2', 'manual-nut-vitB3', 'manual-nut-vitB5', 'manual-nut-vitB6',
      'manual-nut-vitB7', 'manual-nut-vitB9', 'manual-nut-vitB12', 'manual-nut-choline',
      'manual-nut-potassium', 'manual-nut-calcium', 'manual-nut-iron', 'manual-nut-magnesium',
      'manual-nut-zinc', 'manual-nut-phosphorus', 'manual-nut-chloride', 'manual-nut-sulfur',
      'manual-nut-copper', 'manual-nut-manganese', 'manual-nut-selenium', 'manual-nut-iodine',
      'manual-nut-chromium', 'manual-nut-molybdenum'
    ];

    function requestUsdaFoodSupplementation() {
      const cat = (document.getElementById('manual-nut-cat') || {}).value || 'produce';
      const name = (document.getElementById('manual-nut-name') || {}).value || '';
      const matched = findClosestUsdaFood(name, cat);
      if (!matched) {
        alertBox("Could not locate a matching USDA reference food.", "USDA Match");
        return;
      }
      window.pendingUsdaSupplementFood = matched;
      const titleEl = document.getElementById('usda-supplement-prompt-title');
      if (titleEl) {
        titleEl.textContent = `Supplement nutrients with info from USDA "${matched.name}"?`;
      }
      const cardEl = document.getElementById('usda-supplement-confirm-card');
      if (cardEl) {
        cardEl.classList.remove('hidden');
      }
      if (window.lucide) lucide.createIcons();
    }

    function cancelUsdaSupplementation() {
      window.pendingUsdaSupplementFood = null;
      const cardEl = document.getElementById('usda-supplement-confirm-card');
      if (cardEl) cardEl.classList.add('hidden');
    }

    function confirmUsdaSupplementation() {
      const matched = window.pendingUsdaSupplementFood;
      const cardEl = document.getElementById('usda-supplement-confirm-card');
      if (cardEl) cardEl.classList.add('hidden');
      autoEstimateMissingMicros(matched);
    }

    function autoEstimateMissingMicros(preMatchedFood = null) {
      const cat = (document.getElementById('manual-nut-cat') || {}).value || 'produce';
      const kcal = parseFloat((document.getElementById('manual-nut-kcal') || {}).value) || 0;
      const protein = parseFloat((document.getElementById('manual-nut-protein') || {}).value) || 0;
      const carbs = parseFloat((document.getElementById('manual-nut-carbs') || {}).value) || 0;
      const fat = parseFloat((document.getElementById('manual-nut-fat') || {}).value) || 0;
      const name = (document.getElementById('manual-nut-name') || {}).value || '';

      const matchedFood = preMatchedFood || findClosestUsdaFood(name, cat);

      // Save full snapshot of all macro & micro inputs, serving size, and verification map before supplementing
      const allFieldIds = MANUAL_NUTRITION_FIELD_MAP.map(f => f.id).concat(['manual-nut-serving-desc', 'manual-nut-serving-grams']);
      window.preEstimateMicrosSnapshot = {
        values: {},
        verifiedMap: { ...(window.activeManualVerifiedMap || {}) },
        usdaSupplementSource: (activeManualNutritionContext && activeManualNutritionContext.usdaSupplementSource) || ''
      };
      allFieldIds.forEach(id => {
        const el = document.getElementById(id);
        window.preEstimateMicrosSnapshot.values[id] = el ? el.value : '';
      });

      const srvDescEl = document.getElementById('manual-nut-serving-desc');
      const srvGramsEl = document.getElementById('manual-nut-serving-grams');
      if (matchedFood) {
        if (srvDescEl && (!srvDescEl.value || srvDescEl.value === '1 serving')) {
          srvDescEl.value = matchedFood.serving || '1 serving';
        }
        if (srvGramsEl && (!srvGramsEl.value || parseFloat(srvGramsEl.value) === 100)) {
          srvGramsEl.value = matchedFood.servingGrams || 100;
        }
      }

      const targetGrams = parseFloat(srvGramsEl ? srvGramsEl.value : 0) || matchedFood?.servingGrams || 100;
      let scaleRatio = 1.0;
      if (matchedFood && matchedFood.servingGrams > 0 && targetGrams > 0) {
        scaleRatio = targetGrams / matchedFood.servingGrams;
      } else if (matchedFood && matchedFood.kcal > 0 && kcal > 0) {
        scaleRatio = kcal / matchedFood.kcal;
      }
      scaleRatio = Math.min(Math.max(scaleRatio, 0.15), 4.0);

      // Supplement unverified/empty macros from matched USDA food
      const fillNutrientIfUnverified = (id, key, val) => {
        if (val == null || isNaN(val)) return;
        const el = document.getElementById(id);
        if (!el) return;
        const isCurrentlyVerified = Boolean(window.activeManualVerifiedMap && window.activeManualVerifiedMap[key]) && el.value !== '';
        if (!isCurrentlyVerified) {
          el.value = val >= 10 ? Math.round(val) : parseFloat(Number(val).toFixed(2));
          if (window.activeManualVerifiedMap) delete window.activeManualVerifiedMap[key];
        }
      };

      if (matchedFood) {
        fillNutrientIfUnverified('manual-nut-kcal', 'kcal', matchedFood.kcal * scaleRatio);
        fillNutrientIfUnverified('manual-nut-protein', 'protein', (matchedFood.protein || 0) * scaleRatio);
        fillNutrientIfUnverified('manual-nut-carbs', 'carbs', (matchedFood.carbs || 0) * scaleRatio);
        fillNutrientIfUnverified('manual-nut-fat', 'fat', (matchedFood.fat || 0) * scaleRatio);
        fillNutrientIfUnverified('manual-nut-fiber', 'fiber', (matchedFood.fiber || 0) * scaleRatio);
        fillNutrientIfUnverified('manual-nut-sugar', 'sugar', (matchedFood.sugar || 0) * scaleRatio);
        fillNutrientIfUnverified('manual-nut-sat-fat', 'satFat', (matchedFood.satFat || 0) * scaleRatio);
        fillNutrientIfUnverified('manual-nut-sodium', 'sodium', (matchedFood.sodium || 0) * scaleRatio);
        fillNutrientIfUnverified('manual-nut-water', 'water', (matchedFood.water || 0) * scaleRatio);
      }

      const estimated = estimateMicronutrientsForFood(cat, kcal || matchedFood?.kcal, protein || matchedFood?.protein, carbs || matchedFood?.carbs, fat || matchedFood?.fat, matchedFood?.name || name, targetGrams);

      // Vitamins
      fillNutrientIfUnverified('manual-nut-vitA', 'vitA', estimated.vitA);
      fillNutrientIfUnverified('manual-nut-vitC', 'vitC', estimated.vitC);
      fillNutrientIfUnverified('manual-nut-vitD', 'vitD', estimated.vitD);
      fillNutrientIfUnverified('manual-nut-vitE', 'vitE', estimated.vitE);
      fillNutrientIfUnverified('manual-nut-vitK', 'vitK', estimated.vitK);
      fillNutrientIfUnverified('manual-nut-vitB1', 'vitB1', estimated.vitB1);
      fillNutrientIfUnverified('manual-nut-vitB2', 'vitB2', estimated.vitB2);
      fillNutrientIfUnverified('manual-nut-vitB3', 'vitB3', estimated.vitB3);
      fillNutrientIfUnverified('manual-nut-vitB5', 'vitB5', estimated.vitB5);
      fillNutrientIfUnverified('manual-nut-vitB6', 'vitB6', estimated.vitB6);
      fillNutrientIfUnverified('manual-nut-vitB7', 'vitB7', estimated.vitB7);
      fillNutrientIfUnverified('manual-nut-vitB9', 'vitB9', estimated.vitB9);
      fillNutrientIfUnverified('manual-nut-vitB12', 'vitB12', estimated.vitB12);
      fillNutrientIfUnverified('manual-nut-choline', 'choline', estimated.choline);

      // Minerals
      fillNutrientIfUnverified('manual-nut-potassium', 'potassium', estimated.potassium);
      fillNutrientIfUnverified('manual-nut-calcium', 'calcium', estimated.calcium);
      fillNutrientIfUnverified('manual-nut-iron', 'iron', estimated.iron);
      fillNutrientIfUnverified('manual-nut-magnesium', 'magnesium', estimated.magnesium);
      fillNutrientIfUnverified('manual-nut-zinc', 'zinc', estimated.zinc);
      fillNutrientIfUnverified('manual-nut-phosphorus', 'phosphorus', estimated.phosphorus);
      fillNutrientIfUnverified('manual-nut-chloride', 'chloride', estimated.chloride);
      fillNutrientIfUnverified('manual-nut-sulfur', 'sulfur', estimated.sulfur);
      fillNutrientIfUnverified('manual-nut-copper', 'copper', estimated.copper);
      fillNutrientIfUnverified('manual-nut-manganese', 'manganese', estimated.manganese);
      fillNutrientIfUnverified('manual-nut-selenium', 'selenium', estimated.selenium);
      fillNutrientIfUnverified('manual-nut-iodine', 'iodine', estimated.iodine);
      fillNutrientIfUnverified('manual-nut-chromium', 'chromium', estimated.chromium);
      fillNutrientIfUnverified('manual-nut-molybdenum', 'molybdenum', estimated.molybdenum);

      const undoBtn = document.getElementById('btn-undo-auto-estimate-micros');
      if (undoBtn) undoBtn.classList.remove('hidden');

      const sourceName = matchedFood ? matchedFood.name : (name || 'USDA Reference');
      if (activeManualNutritionContext) {
        activeManualNutritionContext.usdaSupplementSource = sourceName;
      }
      const sourcePill = document.getElementById('usda-source-attribution-pill');
      const sourceText = document.getElementById('usda-source-attribution-text');
      if (sourcePill && sourceText) {
        sourceText.textContent = `Nutrient information supplemented by USDA "${sourceName}"`;
        sourcePill.classList.remove('hidden');
      }

      syncManualNutritionInteractiveBadges();
      if (typeof playChime === 'function') playChime('pop');
    }

    function undoAutoEstimateMicros() {
      if (!window.preEstimateMicrosSnapshot) return;
      const snap = window.preEstimateMicrosSnapshot;
      if (snap.values) {
        Object.keys(snap.values).forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = snap.values[id] ?? '';
        });
      }
      window.activeManualVerifiedMap = { ...(snap.verifiedMap || {}) };
      if (activeManualNutritionContext) {
        activeManualNutritionContext.usdaSupplementSource = snap.usdaSupplementSource || '';
      }

      window.preEstimateMicrosSnapshot = null;
      const undoBtn = document.getElementById('btn-undo-auto-estimate-micros');
      if (undoBtn) undoBtn.classList.add('hidden');
      const sourcePill = document.getElementById('usda-source-attribution-pill');
      if (sourcePill && !(activeManualNutritionContext && activeManualNutritionContext.usdaSupplementSource)) {
        sourcePill.classList.add('hidden');
      }

      syncManualNutritionInteractiveBadges();
      if (typeof playChime === 'function') playChime('pop');
      alertBox("Restored original nutrient amounts.", "Undo Complete");
    }

    function saveManualNutritionData() {
      const name = (document.getElementById('manual-nut-name') || {}).value?.trim();
      if (!name) {
        alertBox("Please enter an item or ingredient name.", "Name Required");
        return;
      }

      const getNum = (id, fallback = 0) => {
        const el = document.getElementById(id);
        const v = el ? parseFloat(el.value) : NaN;
        return isNaN(v) ? fallback : v;
      };
      const getNullableNum = (id, roundInt = false) => {
        const el = document.getElementById(id);
        if (!el || el.value === '' || el.value == null) return null;
        const v = parseFloat(el.value);
        if (isNaN(v)) return null;
        return roundInt ? Math.round(v) : v;
      };

      const barcode = (document.getElementById('manual-nut-barcode') || {}).value?.trim() || '';
      const brand = (document.getElementById('manual-nut-brand') || {}).value?.trim() || '';
      const amount = getNum('manual-nut-amount', 1);
      const unit = (document.getElementById('manual-nut-unit') || {}).value || 'items';
      const category = (document.getElementById('manual-nut-cat') || {}).value || 'produce';
      const storage = (document.getElementById('manual-nut-storage') || {}).value || 'fridge';

      const serving = (document.getElementById('manual-nut-serving-desc') || {}).value?.trim() || '1 serving';
      const servingGrams = getNum('manual-nut-serving-grams', 100);
      const servingsPerContainer = getNum('manual-nut-servings-per-container', 1);

      const kcal = Math.round(getNum('manual-nut-kcal', 0));
      const protein = getNum('manual-nut-protein', 0);
      const carbs = getNum('manual-nut-carbs', 0);
      const fat = getNum('manual-nut-fat', 0);
      const fiber = getNum('manual-nut-fiber', 0);
      const sugar = getNum('manual-nut-sugar', 0);
      const addedSugar = getNum('manual-nut-added-sugar', 0);
      const satFat = getNum('manual-nut-sat-fat', 0);
      const transFat = getNum('manual-nut-trans-fat', 0);
      const sodium = Math.round(getNum('manual-nut-sodium', 0));
      const cholesterol = Math.round(getNum('manual-nut-cholesterol', 0));
      const water = Math.round(getNum('manual-nut-water', 0));

      const rawMicros = {
        vitA: getNullableNum('manual-nut-vitA', true),
        vitC: getNullableNum('manual-nut-vitC'),
        vitD: getNullableNum('manual-nut-vitD'),
        vitE: getNullableNum('manual-nut-vitE'),
        vitK: getNullableNum('manual-nut-vitK'),
        vitB1: getNullableNum('manual-nut-vitB1'),
        vitB2: getNullableNum('manual-nut-vitB2'),
        vitB3: getNullableNum('manual-nut-vitB3'),
        vitB5: getNullableNum('manual-nut-vitB5'),
        vitB6: getNullableNum('manual-nut-vitB6'),
        vitB7: getNullableNum('manual-nut-vitB7'),
        vitB9: getNullableNum('manual-nut-vitB9', true),
        vitB12: getNullableNum('manual-nut-vitB12'),
        choline: getNullableNum('manual-nut-choline', true),

        potassium: getNullableNum('manual-nut-potassium', true),
        calcium: getNullableNum('manual-nut-calcium', true),
        iron: getNullableNum('manual-nut-iron'),
        magnesium: getNullableNum('manual-nut-magnesium', true),
        zinc: getNullableNum('manual-nut-zinc'),
        phosphorus: getNullableNum('manual-nut-phosphorus', true),
        chloride: getNullableNum('manual-nut-chloride', true),
        sulfur: getNullableNum('manual-nut-sulfur', true),
        copper: getNullableNum('manual-nut-copper'),
        manganese: getNullableNum('manual-nut-manganese'),
        selenium: getNullableNum('manual-nut-selenium', true),
        iodine: getNullableNum('manual-nut-iodine', true),
        chromium: getNullableNum('manual-nut-chromium', true),
        molybdenum: getNullableNum('manual-nut-molybdenum', true)
      };

      const micros = {};
      Object.keys(rawMicros).forEach(k => {
        if (rawMicros[k] !== null) {
          micros[k] = rawMicros[k];
        }
      });

      const verifiedNutrients = {};
      MANUAL_NUTRITION_FIELD_MAP.forEach(f => {
        const el = document.getElementById(f.id);
        const hasVal = el && el.value !== '' && el.value != null;
        if (hasVal && window.activeManualVerifiedMap && window.activeManualVerifiedMap[f.key]) {
          verifiedNutrients[f.key] = true;
        }
      });

      const usdaSupplementSource = (activeManualNutritionContext && activeManualNutritionContext.usdaSupplementSource) || '';
      const hasAnyVerified = Object.keys(verifiedNutrients).length > 0;

      const product = {
        name,
        brand,
        amount,
        unit,
        serving,
        servingGrams,
        servingsPerContainer,
        category,
        storage,
        barcode,
        kcal,
        protein,
        carbs,
        fat,
        fiber,
        sugar,
        addedSugar,
        satFat,
        transFat,
        sodium,
        cholesterol,
        water,
        verifiedNutrients,
        usdaSupplementSource,
        sourceBadge: hasAnyVerified ? '✓ Verified Nutrition' : '~ USDA Estimated',
        nutrition: {
          kcal,
          protein,
          carbs,
          fat,
          fiber,
          sugar,
          addedSugar,
          satFat,
          transFat,
          sodium,
          cholesterol,
          water,
          serving,
          servingGrams,
          servingsPerContainer,
          verifiedNutrients,
          usdaSupplementSource,
          micros
        }
      };

      if (activeManualNutritionContext && activeManualNutritionContext.isFoodLogEdit && activeManualNutritionContext.foodLogId) {
        const logEntry = (state.nutritionLog || []).find(n => n.id === activeManualNutritionContext.foodLogId);
        if (logEntry) {
          logEntry.name = name;
          logEntry.serving = serving;
          logEntry.servingGrams = servingGrams;
          logEntry.kcal = kcal;
          logEntry.protein = protein;
          logEntry.carbs = carbs;
          logEntry.fat = fat;
          logEntry.fiber = fiber;
          logEntry.sugar = sugar;
          logEntry.satFat = satFat;
          logEntry.sodium = sodium;
          logEntry.water = water;
          logEntry.potassium = micros.potassium || 0;
          logEntry.iron = micros.iron || 0;
          logEntry.calcium = micros.calcium || 0;
          logEntry.micros = micros;
          logEntry.verifiedNutrients = verifiedNutrients;
          logEntry.usdaSupplementSource = usdaSupplementSource;
          logEntry.nutrition = product.nutrition;
          logEntry.isVerified = hasAnyVerified;

          saveAppState();
          renderNutrition();
          if (typeof inspectLoggedFood === 'function') {
            inspectLoggedFood(logEntry.id);
          }
          closeManualNutritionModal();
          alertBox(`Updated nutritional profile for "${name}"!`, "Nutrition Saved");
          return;
        }
      }

      if (activeManualNutritionContext && activeManualNutritionContext.isPantryEdit && activeManualNutritionContext.pantryItemId) {
        const pItem = (state.pantry || []).find(p => p.id === activeManualNutritionContext.pantryItemId);
        if (pItem) {
          pItem.name = name;
          pItem.brand = brand;
          pItem.amount = amount;
          pItem.unit = unit;
          pItem.serving = serving;
          pItem.servingGrams = servingGrams;
          pItem.servingsPerContainer = servingsPerContainer;
          pItem.category = category;
          pItem.storage = storage;
          pItem.kcal = kcal;
          pItem.protein = protein;
          pItem.carbs = carbs;
          pItem.fat = fat;
          pItem.fiber = fiber;
          pItem.sugar = sugar;
          pItem.satFat = satFat;
          pItem.sodium = sodium;
          pItem.water = water;
          pItem.verifiedNutrients = verifiedNutrients;
          pItem.usdaSupplementSource = usdaSupplementSource;
          pItem.nutrition = product.nutrition;
          pItem.isVerified = hasAnyVerified;
          pItem.sourceBadge = hasAnyVerified ? '✓ Verified Nutrition Facts' : '~ USDA Supplemented';
          if (barcode) pItem.barcode = barcode;

          saveAppState();
          renderPantry();
          if (typeof openPantryItemDetailModal === 'function') {
            openPantryItemDetailModal(pItem.id);
          }
          closeManualNutritionModal();
          alertBox(`Updated nutritional profile for "${name}" with complete macro and micronutrients!`, "Nutrition Saved");
          return;
        }
      }

      if (activeManualNutritionContext && activeManualNutritionContext.isReceiptPairing) {
        const rawCode = activeManualNutritionContext.receiptRawCode || name;
        if (typeof saveReceiptNutritionCatalogEntry === 'function') {
          saveReceiptNutritionCatalogEntry(rawCode, product);
        }
        if (state.incomingGroceriesApprovalList && state.incomingGroceriesApprovalList[activeManualNutritionContext.receiptIndex]) {
          const rItem = state.incomingGroceriesApprovalList[activeManualNutritionContext.receiptIndex];
          rItem.name = name;
          rItem.serving = serving;
          rItem.servingGrams = servingGrams;
          rItem.verifiedNutrients = verifiedNutrients;
          rItem.usdaSupplementSource = usdaSupplementSource;
          rItem.nutrition = product.nutrition;
          rItem.isVerified = hasAnyVerified;
          rItem.sourceBadge = hasAnyVerified ? '✓ Exact Label Verified' : '~ USDA Supplemented';
          rItem.nutritionSource = hasAnyVerified ? 'Exact Label Verified' : 'USDA Supplemented';
          if (barcode) rItem.barcode = barcode;
          if (typeof renderIncomingGroceriesApprovalList === 'function') {
            renderIncomingGroceriesApprovalList(state.incomingGroceriesApprovalList);
          }
        }
        closeManualNutritionModal();
        alertBox(`Paired "${name}" to receipt store code! FocusFlow will now auto-fill exact label nutrition whenever this item appears on future receipts.`, "Receipt Code Paired ✓");
        return;
      }

      if (barcode) {
        saveCustomBarcodeItem(barcode, product);
      }

      closeManualNutritionModal();
      applyScannedBarcodeFood(product);
    }

    if (typeof window !== 'undefined') {
      window.DAILY_NUTRITION_STANDARDS = DAILY_NUTRITION_STANDARDS;
      window.getUnifiedFoodOrMeal = getUnifiedFoodOrMeal;
      window.buildRecipeUnifiedNutrition = buildRecipeUnifiedNutrition;
      window.estimateRecipeServingGrams = estimateRecipeServingGrams;
      window.renderVerifiedShieldIcon = renderVerifiedShieldIcon;
      window.renderEstimatedTildeIcon = renderEstimatedTildeIcon;
      window.renderNutrientVerificationBadge = renderNutrientVerificationBadge;
      window.estimateMicronutrientsForFood = estimateMicronutrientsForFood;
      window.inspectScannedProductFullDetails = inspectScannedProductFullDetails;
      window.openManualNutritionFromScanner = openManualNutritionFromScanner;
      window.openManualNutritionModal = openManualNutritionModal;
      window.closeManualNutritionModal = closeManualNutritionModal;
      window.switchManualNutMicroTab = switchManualNutMicroTab;
      window.autoEstimateMissingMicros = autoEstimateMissingMicros;
      window.undoAutoEstimateMicros = undoAutoEstimateMicros;
      window.requestUsdaFoodSupplementation = requestUsdaFoodSupplementation;
      window.confirmUsdaSupplementation = confirmUsdaSupplementation;
      window.cancelUsdaSupplementation = cancelUsdaSupplementation;
      window.toggleManualNutrientVerified = toggleManualNutrientVerified;
      window.syncManualNutritionInteractiveBadges = syncManualNutritionInteractiveBadges;
      window.findClosestUsdaFood = findClosestUsdaFood;
      window.saveManualNutritionData = saveManualNutritionData;
      window.setLogMealType = setLogMealType;
      window.deleteFoodEntry = deleteFoodEntry;
      window.renderRemainingCaloriesDonut = renderRemainingCaloriesDonut;
      window.triggerBarcodeScannerFromManualModal = triggerBarcodeScannerFromManualModal;
    }

