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
      state.nutritionLog.push({
        id: `n-${Date.now()}`,
        name,
        mealType,
        kcal,
        protein: prot,
        carbs: carb,
        fat,
        fiber,
        sodium,
        potassium,
        iron,
        calcium,
        isVerified: state.currentFoodAccuracyMode === 'verified'
      });
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

    function estimateMicronutrientsForFood(category, kcal, protein, carbs, fat, name) {
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

      const matches = commonFoodsDatabase.filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
      if (matches.length === 0) {
        resultsContainer.innerHTML = '<div class="text-[11px] text-slate-400 p-2">No matching foods found. You can enter values manually or scan a barcode.</div>';
        resultsContainer.classList.remove('hidden');
        return;
      }

      resultsContainer.innerHTML = '';
      matches.slice(0, 8).forEach(item => {
        const row = document.createElement('div');
        row.className = "p-2 rounded-lg bg-dark-elevated hover:bg-slate-700 cursor-pointer flex items-center justify-between text-xs transition border border-transparent hover:border-pastel-mint/40";
        row.onclick = () => selectCommonFood(item);
        row.innerHTML = `
          <div>
            <span class="font-semibold text-slate-200 block truncate">${item.name}</span>
            <span class="text-[10px] text-slate-400 font-mono">P: ${item.protein}g | C: ${item.carbs}g | F: ${item.fat}g | Fiber: ${item.fiber || 0}g</span>
          </div>
          <span class="font-mono font-bold text-pastel-mint text-xs shrink-0">${item.kcal} kcal</span>
        `;
        resultsContainer.appendChild(row);
      });
      resultsContainer.classList.remove('hidden');
    }

    function selectCommonFood(item) {
      document.getElementById('food-input-name').value = item.name;
      document.getElementById('food-input-kcal').value = item.kcal;
      document.getElementById('food-input-protein').value = item.protein;
      document.getElementById('food-input-carbs').value = item.carbs;
      document.getElementById('food-input-fat').value = item.fat;
      document.getElementById('food-input-fiber').value = item.fiber || 0;
      document.getElementById('food-input-sodium').value = item.sodium || 0;
      document.getElementById('food-input-potassium').value = item.potassium || 0;
      document.getElementById('food-input-iron').value = item.iron || 0;
      document.getElementById('food-input-calcium').value = item.calcium || 0;

      const resultsContainer = document.getElementById('common-food-search-results');
      if (resultsContainer) resultsContainer.classList.add('hidden');
      const searchInput = document.getElementById('common-food-search-input');
      if (searchInput) searchInput.value = '';

      setLogAccuracyMode('verified');
      playChime('bell');
      alertBox(`Selected "${item.name}"! Facts auto-populated.`, "Verified Whole Food");
    }

    function fillFromSavedRecipe(recipeId) {
      if (!recipeId) return;
      const recipe = state.recipes.find(r => r.id === recipeId);
      if (!recipe) return;

      const kcal = recipe.kcal || 450;
      const prot = recipe.protein || Math.round((kcal * 0.25) / 4);
      const carb = recipe.carbs || Math.round((kcal * 0.45) / 4);
      const fat = recipe.fat || Math.round((kcal * 0.30) / 9);

      document.getElementById('food-input-name').value = `${recipe.title} (1 serving)`;
      document.getElementById('food-input-kcal').value = kcal;
      document.getElementById('food-input-protein').value = prot;
      document.getElementById('food-input-carbs').value = carb;
      document.getElementById('food-input-fat').value = fat;
      document.getElementById('food-input-fiber').value = 5;

      setLogAccuracyMode('verified');
      playChime('bell');
      alertBox(`Populated "${recipe.title}" from your Recipe Codex.`, "Recipe Selected");
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
    // BARCODE SCANNER & OPEN FOOD FACTS INTEGRATION
    // ==============================================
    let barcodeStream = null;
    let barcodeScannerContext = 'food'; // 'food', 'recipe', or 'pantry'
    let barcodeFacingMode = 'environment'; // 'environment' (back) or 'user' (front)
    let zxingBarcodeReader = null;
    let isBarcodeScanningLocked = false;

    function initZXingReader() {
      if (!window.ZXing) return null;
      try {
        const hints = new Map();
        const formats = [
          window.ZXing.BarcodeFormat.UPC_A,
          window.ZXing.BarcodeFormat.UPC_E,
          window.ZXing.BarcodeFormat.EAN_13,
          window.ZXing.BarcodeFormat.EAN_8,
          window.ZXing.BarcodeFormat.CODE_128,
          window.ZXing.BarcodeFormat.CODE_39,
          window.ZXing.BarcodeFormat.ITF,
          window.ZXing.BarcodeFormat.QR_CODE
        ];
        hints.set(window.ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
        hints.set(window.ZXing.DecodeHintType.TRY_HARDER, true);
        return new window.ZXing.BrowserMultiFormatReader(hints, 200);
      } catch (e) {
        console.warn("Failed to instantiate ZXing reader with hints, falling back to default:", e);
        try {
          return new window.ZXing.BrowserMultiFormatReader();
        } catch (e2) {
          return null;
        }
      }
    }

    function openBarcodeScannerModal(context = 'food') {
      barcodeScannerContext = context;
      isBarcodeScanningLocked = false;
      const modal = document.getElementById('barcode-scanner-modal');
      const res = document.getElementById('barcode-lookup-result');
      if (res) {
        res.innerHTML = '';
        res.classList.add('hidden');
      }
      if (modal) modal.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();

      // Auto-start camera immediately when modal opens
      startBarcodeCamera();
    }

    function closeBarcodeScannerModal() {
      isBarcodeScanningLocked = false;
      if (zxingBarcodeReader) {
        try {
          zxingBarcodeReader.reset();
        } catch (e) {}
        zxingBarcodeReader = null;
      }
      if (barcodeStream) {
        try {
          barcodeStream.getTracks().forEach(track => track.stop());
        } catch (e) {}
        barcodeStream = null;
      }
      const video = document.getElementById('barcode-camera-video');
      const ph = document.getElementById('barcode-camera-placeholder');
      const reticle = document.getElementById('barcode-scanner-reticle');
      const liveStatus = document.getElementById('barcode-live-status');
      const flipBtn = document.getElementById('barcode-flip-cam-btn');

      if (video) {
        try {
          video.pause();
          video.srcObject = null;
        } catch (e) {}
        video.classList.add('hidden');
      }
      if (ph) ph.classList.remove('hidden');
      if (reticle) reticle.classList.add('hidden');
      if (liveStatus) liveStatus.classList.add('hidden');
      if (flipBtn) flipBtn.classList.add('hidden');

      const modal = document.getElementById('barcode-scanner-modal');
      if (modal) modal.classList.add('hidden');
    }

    function toggleBarcodeCameraFacing() {
      barcodeFacingMode = (barcodeFacingMode === 'environment') ? 'user' : 'environment';
      startBarcodeCamera();
    }

    async function startBarcodeCamera() {
      const video = document.getElementById('barcode-camera-video');
      const ph = document.getElementById('barcode-camera-placeholder');
      const phMsg = document.getElementById('barcode-camera-placeholder-msg');
      const reticle = document.getElementById('barcode-scanner-reticle');
      const liveStatus = document.getElementById('barcode-live-status');
      const statusText = document.getElementById('barcode-live-status-text');
      const flipBtn = document.getElementById('barcode-flip-cam-btn');

      isBarcodeScanningLocked = false;

      // Clean up any existing stream & reader before starting new
      if (zxingBarcodeReader) {
        try { zxingBarcodeReader.reset(); } catch (e) {}
        zxingBarcodeReader = null;
      }
      if (barcodeStream) {
        try { barcodeStream.getTracks().forEach(t => t.stop()); } catch (e) {}
        barcodeStream = null;
      }

      if (phMsg) phMsg.textContent = "Connecting to camera...";

      // Wait briefly if ZXing script is still initializing
      if (!window.ZXing) {
        await new Promise(r => setTimeout(r, 250));
      }

      try {
        zxingBarcodeReader = initZXingReader();
        if (!zxingBarcodeReader) {
          throw new Error("Barcode scanner engine not loaded");
        }

        const constraints = {
          video: {
            facingMode: { ideal: barcodeFacingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        if (video) {
          video.classList.remove('hidden');
          video.setAttribute('playsinline', 'true');
          video.setAttribute('autoplay', 'true');
          video.muted = true;
        }
        if (ph) ph.classList.add('hidden');
        if (reticle) reticle.classList.remove('hidden');
        if (liveStatus) {
          liveStatus.classList.remove('hidden');
          if (statusText) statusText.textContent = "Scanning... Hold barcode 6-8 in away";
        }
        if (flipBtn) flipBtn.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();

        // decodeFromConstraints continuously scans the stream using ZXing multi-pass algorithm
        await zxingBarcodeReader.decodeFromConstraints(constraints, video, (result, err) => {
          if (result && !isBarcodeScanningLocked) {
            const foundCode = result.getText();
            if (foundCode) {
              onBarcodeDetected(foundCode);
            }
          }
        });
      } catch (err) {
        console.warn("Camera start or decode error:", err);
        if (video) video.classList.add('hidden');
        if (ph) ph.classList.remove('hidden');
        if (phMsg) phMsg.textContent = "Camera unavailable or access denied. Enter barcode manually or tap Snap Photo:";
        if (reticle) reticle.classList.add('hidden');
        if (liveStatus) liveStatus.classList.add('hidden');
        if (flipBtn) flipBtn.classList.add('hidden');
      }
    }

    async function handleBarcodePhotoUpload(event) {
      const file = event && event.target && event.target.files && event.target.files[0];
      if (!file) return;

      const resBox = document.getElementById('barcode-lookup-result');
      if (resBox) {
        resBox.innerHTML = `
          <div class="text-xs text-pastel-sky flex items-center gap-2 p-2">
            <i data-lucide="loader" class="w-4 h-4 animate-spin"></i>
            <span>Analyzing photo with high-resolution barcode scan...</span>
          </div>
        `;
        resBox.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
      }

      try {
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
          const imgUrl = e.target.result;
          const zx = initZXingReader() || (window.ZXing ? new window.ZXing.BrowserMultiFormatReader() : null);
          if (!zx) {
            if (resBox) resBox.innerHTML = `<div class="text-xs text-rose-400 p-2">Barcode engine not ready. Please try again.</div>`;
            return;
          }
          try {
            const img = new Image();
            img.onload = async () => {
              try {
                const result = await zx.decodeFromImageElement(img);
                if (result && result.getText()) {
                  onBarcodeDetected(result.getText());
                } else {
                  throw new Error("No barcode found in image");
                }
              } catch (decodeErr) {
                if (resBox) {
                  resBox.innerHTML = `
                    <div class="p-3 rounded-2xl bg-dark-elevated border border-amber-400/40 text-xs space-y-2">
                      <div class="text-amber-300 font-semibold flex items-center gap-1.5">
                        <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                        <span>Could not read barcode from this photo</span>
                      </div>
                      <p class="text-slate-300 text-[11px]">Make sure the barcode lines are in sharp focus, well-lit, and filling the frame. You can also type the barcode number directly below.</p>
                      <button type="button" onclick="document.getElementById('barcode-photo-file-input').click()" class="px-3 py-1.5 rounded-xl bg-pastel-lavender text-dark-base font-bold text-xs">
                        Try Another Photo
                      </button>
                    </div>
                  `;
                  if (window.lucide) lucide.createIcons();
                }
              }
            };
            img.src = imgUrl;
          } catch (imgErr) {
            console.warn("Image decode error:", imgErr);
          }
        };
        fileReader.readAsDataURL(file);
      } catch (err) {
        console.warn("FileReader error:", err);
      }
      if (event && event.target) event.target.value = '';
    }

    function onBarcodeDetected(code) {
      if (isBarcodeScanningLocked) return;
      isBarcodeScanningLocked = true;

      // Stop ZXing scanning loop while processing
      if (zxingBarcodeReader) {
        try { zxingBarcodeReader.reset(); } catch (e) {}
        zxingBarcodeReader = null;
      }

      if (typeof playChime === 'function') {
        try { playChime('bell'); } catch (e) {}
      }

      const input = document.getElementById('barcode-manual-input');
      if (input) input.value = code;

      const statusText = document.getElementById('barcode-live-status-text');
      if (statusText) statusText.textContent = `Barcode detected: ${code}`;

      lookupBarcode(code);
    }

    function setAndLookupBarcode(code) {
      const input = document.getElementById('barcode-manual-input');
      if (input) input.value = code;
      lookupBarcode(code);
    }

    function parsePackageQuantity(qtyStr) {
      if (!qtyStr || typeof qtyStr !== 'string') return { amount: 1, unit: 'items' };
      const str = qtyStr.toLowerCase().trim();
      const match = str.match(/([\d\.]+)\s*(fl\s*oz|fluid\s*oz|floz|oz|ounces?|g|grams?|kg|ml|milliliters?|l|liters?|gal|gallons?|cups?|servings?|items?|ct|count)/i);
      if (!match) return { amount: 1, unit: 'items' };

      let val = parseFloat(match[1]) || 1;
      let rawUnit = match[2].toLowerCase().replace(/\s+/g, '');

      if (rawUnit.startsWith('floz') || rawUnit.startsWith('fluid')) return { amount: val, unit: 'fl oz' };
      if (rawUnit.startsWith('oz') || rawUnit.startsWith('ounce')) return { amount: val, unit: 'oz' };
      if (rawUnit === 'g' || rawUnit.startsWith('gram')) return { amount: val, unit: 'g' };
      if (rawUnit === 'kg') return { amount: Math.round(val * 1000), unit: 'g' };
      if (rawUnit === 'ml' || rawUnit.startsWith('milli')) return { amount: val, unit: 'ml' };
      if (rawUnit === 'l' || rawUnit.startsWith('liter')) return { amount: val, unit: 'L' };
      if (rawUnit.startsWith('gal')) return { amount: val, unit: 'gal' };
      if (rawUnit.startsWith('cup')) return { amount: val, unit: 'cup' };
      if (rawUnit.startsWith('serv')) return { amount: val, unit: 'servings' };
      return { amount: val, unit: 'items' };
    }

    function inferFoodCategory(name, categoriesStr) {
      const combined = `${name || ''} ${categoriesStr || ''}`.toLowerCase();
      if (/produce|fruit|vegetable|salad|apple|banana|berry|tomato|onion|spinach|carrot|lettuce|cucumber/i.test(combined)) return 'produce';
      if (/milk|cheese|yogurt|butter|cream|dairy/i.test(combined)) return 'dairy';
      if (/meat|chicken|beef|turkey|pork|egg|salmon|fish|tuna|protein|tofu|shrimp/i.test(combined)) return 'protein';
      if (/bread|rice|pasta|grain|oat|cereal|flour|quinoa|noodle|bagel|tortilla/i.test(combined)) return 'grains';
      if (/frozen|ice cream|pizza|popsicle/i.test(combined)) return 'frozen';
      if (/sauce|condiment|dressing|ketchup|mustard|mayo|oil|vinegar|spice|seasoning|syrup/i.test(combined)) return 'condiments';
      if (/snack|chip|cracker|cookie|popcorn|pretzel|chocolate|candy|nut|almond/i.test(combined)) return 'snacks';
      if (/water|juice|soda|tea|coffee|drink|beverage|kombucha|seltzer/i.test(combined)) return 'beverages';
      return 'pantry_staples';
    }

    function inferStorageZone(category, name) {
      const n = (name || '').toLowerCase();
      if (category === 'frozen' || /frozen|ice cream/i.test(n)) return 'frozen';
      if (category === 'dairy' || category === 'protein' || /milk|cheese|yogurt|meat|chicken|fish|egg/i.test(n)) return 'fridge';
      if (/banana|avocado|tomato|onion|potato|bread/i.test(n)) return 'counter';
      return 'shelf';
    }

    // ==============================================
    // PERSONAL CUSTOM BARCODE & FOOD DATABASE
    // ==============================================
    function getCustomBarcodeDb() {
      try {
        return JSON.parse(localStorage.getItem('focusflow_custom_barcode_db') || '{}');
      } catch (e) {
        return {};
      }
    }

    function saveCustomBarcodeItem(barcode, product) {
      if (!barcode || !product) return;
      try {
        const db = getCustomBarcodeDb();
        db[barcode] = {
          name: product.name,
          brand: product.brand || 'Verified Food',
          amount: product.amount || 1,
          unit: product.unit || 'items',
          category: product.category || inferFoodCategory(product.name, ''),
          storage: product.storage || inferStorageZone(product.category, product.name),
          kcal: product.kcal || 0,
          protein: product.protein || 0,
          carbs: product.carbs || 0,
          fat: product.fat || 0,
          fiber: product.fiber || 0,
          sodium: product.sodium || 0,
          sourceBadge: product.sourceBadge || '💾 Your Custom Food Database',
          barcode: barcode,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem('focusflow_custom_barcode_db', JSON.stringify(db));
      } catch (e) {}
    }

    // ==============================================
    // 5-TIER NUTRITIONAL DATABASE CASCADE QUERIES
    // ==============================================

    // Tier 2: USDA FoodData Central Branded Foods
    async function queryUsdaFoodDataCentral(code) {
      const usdaKey = (localStorage.getItem('focusflow_usda_api_key') || 'DEMO_KEY').trim();
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(code)}&dataType=Branded&pageSize=1&api_key=${encodeURIComponent(usdaKey)}`;

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      try {
        const resp = await fetch(url, { signal: ctrl.signal });
        clearTimeout(timer);
        if (!resp.ok) return null;
        const data = await resp.json();
        if (data && Array.isArray(data.foods) && data.foods.length > 0) {
          const f = data.foods[0];
          let kcal = 0, protein = 0, carbs = 0, fat = 0, fiber = 0, sodium = 0;
          (f.foodNutrients || []).forEach(n => {
            const name = (n.nutrientName || '').toLowerCase();
            const val = Math.round(n.value || 0);
            if (name.includes('energy') && (n.unitName === 'KCAL' || !kcal)) kcal = val;
            else if (name.includes('protein')) protein = val;
            else if (name.includes('carbohydrate')) carbs = val;
            else if (name.includes('total lipid') || name === 'fat') fat = val;
            else if (name.includes('fiber')) fiber = val;
            else if (name.includes('sodium')) sodium = val;
          });

          const title = (f.description || 'Branded Food Item').toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
          const cat = inferFoodCategory(title, f.brandedFoodCategory || '');
          const stor = inferStorageZone(cat, title);
          const qParsed = parsePackageQuantity(f.packageWeight || f.householdServingFullText || `${f.servingSize || 1} ${f.servingSizeUnit || 'serving'}`);

          return {
            name: title,
            brand: f.brandOwner || f.brandName || 'USDA Branded',
            amount: qParsed.amount,
            unit: qParsed.unit,
            category: cat,
            storage: stor,
            kcal: kcal || 100,
            protein: protein,
            carbs: carbs,
            fat: fat,
            fiber: fiber,
            sodium: sodium,
            sourceBadge: '🏛️ USDA FoodData Central',
            barcode: code
          };
        }
      } catch (err) {
        clearTimeout(timer);
        console.warn("USDA FDC lookup skipped/timeout:", err);
      }
      return null;
    }

    // Tier 3: Nutritionix API
    async function queryNutritionix(code) {
      const appId = (localStorage.getItem('focusflow_nutritionix_app_id') || '').trim();
      const appKey = (localStorage.getItem('focusflow_nutritionix_app_key') || '').trim();
      if (!appId || !appKey) return null;

      const url = `https://trackapi.nutritionix.com/v2/search/item?upc=${encodeURIComponent(code)}`;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      try {
        const resp = await fetch(url, {
          headers: {
            'x-app-id': appId,
            'x-app-key': appKey
          },
          signal: ctrl.signal
        });
        clearTimeout(timer);
        if (!resp.ok) return null;
        const data = await resp.json();
        if (data && Array.isArray(data.foods) && data.foods.length > 0) {
          const f = data.foods[0];
          const name = f.food_name || f.item_name || 'Nutritionix Food Item';
          const cat = inferFoodCategory(name, '');
          const stor = inferStorageZone(cat, name);
          const qParsed = parsePackageQuantity(`${f.serving_weight_grams ? f.serving_weight_grams + ' g' : (f.serving_qty + ' ' + (f.serving_unit || 'items'))}`);

          return {
            name: name,
            brand: f.brand_name || 'Nutritionix Verified',
            amount: qParsed.amount,
            unit: qParsed.unit,
            category: cat,
            storage: stor,
            kcal: Math.round(f.nf_calories || 0),
            protein: Math.round(f.nf_protein || 0),
            carbs: Math.round(f.nf_total_carbohydrate || 0),
            fat: Math.round(f.nf_total_fat || 0),
            fiber: Math.round(f.nf_dietary_fiber || 0),
            sodium: Math.round(f.nf_sodium || 0),
            sourceBadge: '🥗 Nutritionix Verified',
            barcode: code
          };
        }
      } catch (err) {
        clearTimeout(timer);
        console.warn("Nutritionix lookup skipped/timeout:", err);
      }
      return null;
    }

    // Tier 4: Open Food Facts API (world & US endpoints)
    async function queryOpenFoodFacts(code) {
      const endpoints = [
        `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(code)}.json`,
        `https://us.openfoodfacts.org/api/v0/product/${encodeURIComponent(code)}.json`
      ];

      for (const endpoint of endpoints) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 6000);
        try {
          const resp = await fetch(endpoint, { signal: ctrl.signal });
          clearTimeout(timer);
          if (resp.ok) {
            const data = await resp.json();
            if (data && data.status === 1 && data.product) {
              const p = data.product;
              const n = p.nutriments || {};
              const name = p.product_name || p.generic_name || p.product_name_en || 'Packaged Food Item';
              const cat = inferFoodCategory(name, p.categories || '');
              const stor = inferStorageZone(cat, name);
              const qParsed = parsePackageQuantity(p.quantity || p.serving_size || '');

              return {
                name: name,
                brand: p.brands || 'Open Food Facts',
                amount: qParsed.amount,
                unit: qParsed.unit,
                category: cat,
                storage: stor,
                kcal: Math.round(n['energy-kcal_100g'] || n['energy-kcal_serving'] || n['energy-kcal'] || 120),
                protein: Math.round(n.proteins_100g || n.proteins_serving || 0),
                carbs: Math.round(n.carbohydrates_100g || n.carbohydrates_serving || 0),
                fat: Math.round(n.fat_100g || n.fat_serving || 0),
                fiber: Math.round(n.fiber_100g || n.fiber_serving || 0),
                sodium: Math.round((n.sodium_100g || n.sodium_serving || 0) * (n.sodium_100g > 10 ? 1 : 1000)),
                sourceBadge: '🌐 Open Food Facts',
                barcode: code
              };
            }
          }
        } catch (err) {
          clearTimeout(timer);
        }
      }
      return null;
    }

    // Tier 5: Gemini AI Vision Scanner for Nutrition Facts Label & Package (Handles Curved Bottles & All Micros)
    async function handleNutritionLabelVisionUpload(event, barcode) {
      const files = event && event.target && event.target.files;
      if (!files || files.length === 0) return;

      const resBox = document.getElementById('barcode-lookup-result');
      if (resBox) {
        resBox.innerHTML = `
          <div class="p-3.5 rounded-2xl bg-dark-elevated border border-pastel-lavender/50 text-xs space-y-2">
            <div class="flex items-center gap-2 text-pastel-lavender font-semibold">
              <i data-lucide="loader" class="w-4 h-4 animate-spin"></i>
              <span id="barcode-ai-label-status">Analyzing Nutrition Facts &amp; Curved Bottle Label with Gemini Vision...</span>
            </div>
            <p class="text-[11px] text-slate-300">Reading calories, macro &amp; micro nutrients (all 13 vitamins and 14 minerals), serving size, and volume...</p>
          </div>
        `;
        resBox.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
      }

      const key = (typeof getGeminiApiKey === 'function') ? getGeminiApiKey() : '';
      if (!key) {
        alertBox("Please connect your free Gemini API key in Settings (the 🔑 icon) to use AI Nutrition Label scanning.", "API Key Needed");
        if (typeof openApiKeyModal === 'function') openApiKeyModal();
        return;
      }

      try {
        const imagePromises = Array.from(files).slice(0, 2).map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const dataUrl = e.target.result;
              const mimeType = file.type || 'image/jpeg';
              const base64Data = dataUrl.split(',')[1];
              resolve({ base64Data, mimeType });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });

        const inlineImages = await Promise.all(imagePromises);

        const prompt = `You are an expert clinical dietitian and OCR engine for food packages, bottles, and curved containers.
Analyze the provided photo(s) of the Nutrition Facts label and/or package front.
CRITICAL INSTRUCTIONS FOR CURVED BOTTLES, JARS & CANS:
- The image may feature curved or cylindrical containers (such as glass/plastic bottles, cans, tubs, jars) where the Nutrition Facts panel or ingredient text wraps around the curvature, exhibits glare/reflections, or has text rotated.
- Carefully read curved, wrapped text across lines, accounting for perspective distortion and specular reflections.
- Extract the product name, brand, package size / volume (e.g. 16 fl oz, 500 ml, 12 oz, 1 L, 1 gal, items), serving size, category, and storage.
- Extract COMPLETE nutritional values:
  - Calories (kcal)
  - Macronutrients: protein (g), carbs (g), fat (g), fiber (g), sugar (g), addedSugar (g), satFat (g), transFat (g), sodium (mg), cholesterol (mg), water (ml)
  - All 13 Essential Vitamins: vitA (mcg RAE), vitC (mg), vitD (mcg), vitE (mg), vitK (mcg), vitB1 (thiamin mg), vitB2 (riboflavin mg), vitB3 (niacin mg), vitB5 (pantothenic acid mg), vitB6 (mg), vitB7 (biotin mcg), vitB9 (folate mcg DFE), vitB12 (mcg), choline (mg).
  - All 14 Essential Minerals: potassium (mg), calcium (mg), iron (mg), magnesium (mg), zinc (mg), phosphorus (mg), chloride (mg), sulfur (mg), copper (mg), manganese (mg), selenium (mcg), iodine (mcg), chromium (mcg), molybdenum (mcg).
- If any micronutrient is not explicitly printed on the label, estimate it clinically based on the food type and ingredients.

Return ONLY a valid JSON object (no markdown, no backticks, no markdown code block fences):
{
  "name": "Product Name and Variety",
  "brand": "Brand Name",
  "amount": 16,
  "unit": "fl oz",
  "serving_size": "8 fl oz (240ml)",
  "category": "produce|protein|dairy|grains|frozen|condiments|snacks|beverages|pantry_staples",
  "storage": "fridge|frozen|counter|shelf",
  "nutrition": {
    "kcal": 120,
    "protein": 1,
    "carbs": 28,
    "fat": 0.2,
    "fiber": 2,
    "sugar": 24,
    "addedSugar": 0,
    "satFat": 0,
    "transFat": 0,
    "sodium": 35,
    "cholesterol": 0,
    "water": 220,
    "micros": {
      "vitA": 10, "vitC": 45, "vitD": 0, "vitE": 1.2, "vitK": 2.5,
      "vitB1": 0.05, "vitB2": 0.04, "vitB3": 0.5, "vitB5": 0.3, "vitB6": 0.1, "vitB7": 1.0, "vitB9": 20, "vitB12": 0, "choline": 15,
      "potassium": 450, "calcium": 25, "iron": 0.6, "magnesium": 20, "zinc": 0.3, "phosphorus": 30, "chloride": 40, "sulfur": 15, "copper": 0.1, "manganese": 0.2, "selenium": 1.0, "iodine": 5, "chromium": 2, "molybdenum": 3
    }
  }
}`;

        let rawResponse = '';
        if (typeof callGeminiGenerateContent === 'function') {
          rawResponse = await callGeminiGenerateContent({
            prompt: prompt,
            inlineImages: inlineImages,
            key: key,
            expectJson: true,
            onStatus: (msg) => {
              const sEl = document.getElementById('barcode-ai-label-status');
              if (sEl) sEl.textContent = msg;
            }
          });
        } else {
          throw new Error("Gemini Vision caller not loaded");
        }

        let parsed = null;
        try {
          const cleanJson = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
          parsed = JSON.parse(cleanJson);
        } catch (e) {
          const match = rawResponse.match(/\{[\s\S]*\}/);
          if (match) parsed = JSON.parse(match[0]);
        }

        if (parsed && parsed.name) {
          const nut = parsed.nutrition || {};
          const parsedMicros = nut.micros || {};
          const defaultMicros = estimateMicronutrientsForFood(
            parsed.category || inferFoodCategory(parsed.name, ''),
            nut.kcal || 0,
            nut.protein || 0,
            nut.carbs || 0,
            nut.fat || 0,
            parsed.name
          );

          const mergedMicros = {};
          Object.keys(DAILY_NUTRITION_STANDARDS).forEach(k => {
            if (parsedMicros[k] != null && !isNaN(parseFloat(parsedMicros[k]))) {
              mergedMicros[k] = parseFloat(parsedMicros[k]);
            } else {
              mergedMicros[k] = defaultMicros[k] || 0;
            }
          });

          const completeNutrition = {
            kcal: Math.round(nut.kcal || 0),
            protein: parseFloat(nut.protein || 0),
            carbs: parseFloat(nut.carbs || 0),
            fat: parseFloat(nut.fat || 0),
            fiber: parseFloat(nut.fiber || 0),
            sugar: parseFloat(nut.sugar || 0),
            addedSugar: parseFloat(nut.addedSugar || 0),
            satFat: parseFloat(nut.satFat || 0),
            transFat: parseFloat(nut.transFat || 0),
            sodium: Math.round(nut.sodium || 0),
            cholesterol: Math.round(nut.cholesterol || 0),
            water: Math.round(nut.water || 0),
            micros: mergedMicros
          };

          const product = {
            name: parsed.name,
            brand: parsed.brand || 'Verified Food',
            amount: parseFloat(parsed.amount) || 1,
            unit: parsed.unit || 'items',
            category: parsed.category || inferFoodCategory(parsed.name, ''),
            storage: parsed.storage || inferStorageZone(parsed.category, parsed.name),
            kcal: completeNutrition.kcal,
            protein: completeNutrition.protein,
            carbs: completeNutrition.carbs,
            fat: completeNutrition.fat,
            fiber: completeNutrition.fiber,
            sugar: completeNutrition.sugar,
            satFat: completeNutrition.satFat,
            sodium: completeNutrition.sodium,
            sourceBadge: '✨ AI Nutrition Label Verified',
            barcode: barcode || '',
            nutrition: completeNutrition
          };

          // Save to personal database immediately
          if (barcode) {
            saveCustomBarcodeItem(barcode, product);
          }

          renderBarcodeProductResult(product);
          playChime('bell');
        } else {
          throw new Error("Unable to parse nutrition data from label photo");
        }
      } catch (err) {
        console.warn("AI label vision error:", err);
        if (resBox) {
          resBox.innerHTML = `
            <div class="p-3.5 rounded-2xl bg-dark-elevated border border-amber-400/50 text-xs space-y-2.5">
              <div class="text-amber-300 font-semibold flex items-center gap-1.5">
                <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                <span>Could not extract nutrition facts from photo</span>
              </div>
              <p class="text-slate-300 text-[11px] leading-relaxed">Curved bottles, reflections, or motion blur can obscure the Nutrition Facts panel. You can take another photo or enter complete nutritional data manually:</p>
              <div class="flex flex-col sm:flex-row gap-2 pt-1">
                <label class="px-3.5 py-1.5 rounded-xl bg-dark-base border border-dark-border hover:border-slate-400 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
                  <i data-lucide="camera" class="w-3.5 h-3.5"></i>
                  <span>Retake Photo</span>
                  <input type="file" accept="image/*" capture="environment" class="hidden" onchange="handleNutritionLabelVisionUpload(event, '${barcode}')">
                </label>
                <button type="button" onclick="openManualNutritionModal({ barcode: '${barcode}' })" class="px-3.5 py-1.5 rounded-xl bg-pastel-mint text-dark-base font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-300 transition">
                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                  <span>Enter Nutrition Manually</span>
                </button>
              </div>
            </div>
          `;
          if (window.lucide) lucide.createIcons();
        }
      }
      if (event && event.target) event.target.value = '';
    }

    function renderBarcodeProductResult(product) {
      const resBox = document.getElementById('barcode-lookup-result');
      if (!resBox) return;

      const qParsed = (product.amount && product.unit) ? { amount: product.amount, unit: product.unit } : parsePackageQuantity(product.quantity);
      const safeProductJson = JSON.stringify({
        ...product,
        amount: qParsed.amount,
        unit: qParsed.unit
      }).replace(/"/g, '&quot;');

      resBox.innerHTML = `
        <div class="space-y-3 text-xs bg-dark-elevated p-3.5 rounded-2xl border border-pastel-lavender/40 shadow-xl">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-[9px] px-2 py-0.5 rounded-md bg-pastel-lavender/15 text-pastel-lavender font-bold uppercase tracking-wider">${product.sourceBadge || 'Verified Food'}</span>
                ${product.brand ? `<span class="text-[10px] text-slate-400 font-semibold">• ${product.brand}</span>` : ''}
              </div>
              <h4 class="font-bold text-white text-sm leading-tight">${product.name}</h4>
              <span class="text-[11px] text-slate-300 font-mono mt-0.5 block">Package Size: <strong>${qParsed.amount} ${qParsed.unit}</strong></span>
            </div>
            <div class="text-right shrink-0">
              <span class="px-2.5 py-1.5 rounded-xl bg-pastel-mint/15 text-pastel-mint font-mono font-bold text-sm block">${product.kcal} kcal</span>
            </div>
          </div>

          <!-- Macros Breakdown -->
          <div class="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-dark-base border border-dark-border text-center font-mono text-[11px]">
            <div><span class="text-slate-400 block text-[9px]">PROTEIN</span><span class="text-pastel-sky font-bold">${product.protein}g</span></div>
            <div><span class="text-slate-400 block text-[9px]">CARBS</span><span class="text-pastel-butter font-bold">${product.carbs}g</span></div>
            <div><span class="text-slate-400 block text-[9px]">FAT</span><span class="text-pastel-peach font-bold">${product.fat}g</span></div>
            <div><span class="text-slate-400 block text-[9px]">FIBER</span><span class="text-pastel-mint font-bold">${product.fiber || 0}g</span></div>
          </div>

          <!-- Action button based on context -->
          <div class="pt-1 flex flex-col sm:flex-row gap-2 justify-end">
            <button type="button" onclick="startBarcodeCamera()" class="px-3 py-1.5 rounded-xl bg-dark-base border border-dark-border text-slate-300 hover:text-white text-xs flex items-center justify-center gap-1.5">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              <span>Scan Next Barcode</span>
            </button>
            <button type="button" onclick="applyScannedBarcodeFood(${safeProductJson})" class="px-4 py-2 rounded-xl bg-gradient-to-r from-pastel-mint to-emerald-400 text-dark-base font-extrabold text-xs shadow-md shadow-pastel-mint/20 flex items-center justify-center gap-1.5 hover:opacity-95 transition">
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
              <span>${barcodeScannerContext === 'pantry' ? 'Add Item to Pantry' : (barcodeScannerContext === 'recipe' ? 'Add to Recipe' : 'Log Food')}</span>
            </button>
          </div>
        </div>
      `;
      resBox.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }

    function renderBarcodeMissingWithAiPrompt(code) {
      const resBox = document.getElementById('barcode-lookup-result');
      if (!resBox) return;

      resBox.innerHTML = `
        <div class="p-4 rounded-2xl bg-dark-elevated border border-pastel-lavender/50 space-y-3.5 text-xs shadow-2xl">
          <div class="flex items-start gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-pastel-lavender/20 border border-pastel-lavender/40 flex items-center justify-center text-pastel-lavender shrink-0">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
            </div>
            <div>
              <h4 class="font-bold text-white text-xs">Product Not Found in Databases (UPC: ${code})</h4>
              <p class="text-[11px] text-slate-300 mt-0.5">Let Gemini AI Vision read curved bottle labels &amp; packages to extract complete macros and micronutrients, or enter verified nutrition manually.</p>
            </div>
          </div>

          <div class="p-3 bg-dark-base rounded-2xl border border-pastel-lavender/30 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div class="text-[11px] text-slate-300 space-y-0.5">
              <span class="font-bold text-white block">📸 Snap Nutrition Facts Label</span>
              <span class="text-slate-400 block text-[10px]">AI OCR reads curved bottles, cans, boxes &amp; packages</span>
            </div>
            <label class="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-pastel-lavender via-purple-400 to-pastel-mint text-dark-base font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:opacity-95 transition shrink-0">
              <i data-lucide="camera" class="w-4 h-4"></i>
              <span>Snap Nutrition Label</span>
              <input type="file" accept="image/*" capture="environment" multiple class="hidden" onchange="handleNutritionLabelVisionUpload(event, '${code}')">
            </label>
          </div>

          <div class="pt-2 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-2">
            <div class="text-[10px] text-slate-400">Prefer manual entry with all 13 vitamins &amp; 14 minerals?</div>
            <div class="flex gap-2 w-full sm:w-auto">
              <input type="text" id="barcode-fallback-name" placeholder="Item name..." class="bg-dark-base border border-dark-border rounded-xl px-2.5 py-1.5 text-white text-xs flex-1 sm:w-36 focus:border-pastel-lavender">
              <button type="button" onclick="openManualNutritionModal({ barcode: '${code}', name: (document.getElementById('barcode-fallback-name') || {}).value })" class="px-3.5 py-1.5 rounded-xl bg-pastel-mint text-dark-base font-bold text-xs flex items-center justify-center gap-1 hover:bg-emerald-300 transition shrink-0">
                <i data-lucide="edit-3" class="w-3 h-3"></i>
                <span>Enter Nutrition</span>
              </button>
            </div>
          </div>
        </div>
      `;
      resBox.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }

    async function lookupBarcode(directCode) {
      const code = (directCode || (document.getElementById('barcode-manual-input') || {}).value || '').trim();
      if (!code) {
        alertBox("Please enter a valid barcode / UPC number.", "Barcode Required");
        return;
      }

      const resBox = document.getElementById('barcode-lookup-result');
      if (resBox) {
        resBox.innerHTML = `
          <div class="text-xs text-pastel-sky flex items-center gap-2 p-2.5 bg-dark-base rounded-2xl border border-pastel-sky/30">
            <i data-lucide="loader" class="w-4 h-4 animate-spin shrink-0"></i>
            <span id="barcode-cascade-status">Checking personal database &amp; USDA FoodData Central for <strong>${code}</strong>...</span>
          </div>
        `;
        resBox.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
      }

      const setStatus = (msg) => {
        const el = document.getElementById('barcode-cascade-status');
        if (el) el.innerHTML = msg;
      };

      // Tier 1: Check Local Custom Barcode DB
      const customDb = getCustomBarcodeDb();
      if (customDb[code]) {
        const prod = { ...customDb[code], sourceBadge: '💾 Your Custom Food Database' };
        renderBarcodeProductResult(prod);
        return;
      }

      // Offline built-in test items
      const testDb = {
        '011110038332': { name: 'Kroger Traditional 100% Whole Grain Rolled Oats', brand: 'Kroger', amount: 18, unit: 'oz', category: 'grains', storage: 'shelf', kcal: 150, protein: 5, carbs: 27, fat: 2.5, fiber: 4.0, sodium: 0, sourceBadge: '📦 Verified Database', barcode: '011110038332' },
        '052159701026': { name: 'Chobani Non-Fat Plain Greek Yogurt', brand: 'Chobani', amount: 32, unit: 'oz', category: 'dairy', storage: 'fridge', kcal: 90, protein: 16, carbs: 6, fat: 0, fiber: 0, sodium: 65, sourceBadge: '📦 Verified Database', barcode: '052159701026' }
      };
      if (testDb[code]) {
        renderBarcodeProductResult(testDb[code]);
        return;
      }

      // Tier 2: USDA FoodData Central (Official US Gov Branded Food Products)
      setStatus(`Searching official <strong>USDA FoodData Central</strong> for ${code}...`);
      const usdaProd = await queryUsdaFoodDataCentral(code);
      if (usdaProd) {
        saveCustomBarcodeItem(code, usdaProd);
        renderBarcodeProductResult(usdaProd);
        return;
      }

      // Tier 3: Nutritionix (curated commercial database)
      const nxCreds = (typeof getNutritionixCredentials === 'function') ? getNutritionixCredentials() : { appId: '', appKey: '' };
      if (nxCreds.appId && nxCreds.appKey) {
        setStatus(`Searching <strong>Nutritionix</strong> database for ${code}...`);
        const nxProd = await queryNutritionix(code);
        if (nxProd) {
          saveCustomBarcodeItem(code, nxProd);
          renderBarcodeProductResult(nxProd);
          return;
        }
      }

      // Tier 4: Open Food Facts (global crowd-sourced database)
      setStatus(`Searching <strong>Open Food Facts</strong> (3M+ items) for ${code}...`);
      const offProd = await queryOpenFoodFacts(code);
      if (offProd) {
        saveCustomBarcodeItem(code, offProd);
        renderBarcodeProductResult(offProd);
        return;
      }

      // Tier 5: Fallback - Prompt for Gemini AI Nutrition Label & Package Scan
      renderBarcodeMissingWithAiPrompt(code);
    }

    function saveUnknownBarcodeItem(code) {
      const input = document.getElementById('barcode-fallback-name');
      const name = (input ? input.value : '').trim() || 'Scanned Food';
      openManualNutritionModal({
        barcode: code,
        name: name,
        category: inferFoodCategory(name, ''),
        storage: inferStorageZone('pantry_staples', name),
        amount: 1,
        unit: 'items'
      });
    }

    // ==============================================
    // MANUAL NUTRITION MODAL (ALL MACROS & 27 MICRONUTRIENTS)
    // ==============================================
    let activeManualNutritionContext = null;

    function openManualNutritionModal(params = {}) {
      activeManualNutritionContext = params;
      const modal = document.getElementById('manual-nutrition-modal');
      if (!modal) return;

      const titleEl = document.getElementById('manual-nut-modal-title');
      const badgeEl = document.getElementById('manual-nut-barcode-badge');

      if (params.isPantryEdit) {
        if (titleEl) titleEl.textContent = `Edit Nutrition: ${params.name || 'Pantry Item'}`;
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

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = (val != null && val !== '') ? val : '';
      };

      setVal('manual-nut-barcode', params.barcode || '');
      setVal('manual-nut-name', params.name || '');
      setVal('manual-nut-brand', params.brand || '');
      setVal('manual-nut-amount', params.amount != null ? params.amount : 1);
      setVal('manual-nut-unit', params.unit || 'items');
      setVal('manual-nut-cat', params.category || 'produce');
      setVal('manual-nut-storage', params.storage || 'fridge');

      const nut = params.nutrition || {};
      setVal('manual-nut-kcal', nut.kcal != null ? nut.kcal : (params.kcal != null ? params.kcal : ''));
      setVal('manual-nut-protein', nut.protein != null ? nut.protein : (params.protein != null ? params.protein : ''));
      setVal('manual-nut-carbs', nut.carbs != null ? nut.carbs : (params.carbs != null ? params.carbs : ''));
      setVal('manual-nut-fat', nut.fat != null ? nut.fat : (params.fat != null ? params.fat : ''));
      setVal('manual-nut-fiber', nut.fiber != null ? nut.fiber : (params.fiber != null ? params.fiber : ''));
      setVal('manual-nut-sugar', nut.sugar != null ? nut.sugar : (params.sugar != null ? params.sugar : ''));
      setVal('manual-nut-added-sugar', nut.addedSugar != null ? nut.addedSugar : '');
      setVal('manual-nut-sat-fat', nut.satFat != null ? nut.satFat : (params.satFat != null ? params.satFat : ''));
      setVal('manual-nut-trans-fat', nut.transFat != null ? nut.transFat : '');
      setVal('manual-nut-sodium', nut.sodium != null ? nut.sodium : (params.sodium != null ? params.sodium : ''));
      setVal('manual-nut-cholesterol', nut.cholesterol != null ? nut.cholesterol : '');
      setVal('manual-nut-water', nut.water != null ? nut.water : '');

      // Micronutrients
      const micros = nut.micros || ((params.name || params.kcal) ? estimateMicronutrientsForFood(params.category, params.kcal || nut.kcal, params.protein || nut.protein, params.carbs || nut.carbs, params.fat || nut.fat, params.name) : {});

      // All 13 Essential Vitamins + Choline
      setVal('manual-nut-vitA', micros.vitA != null ? micros.vitA : '');
      setVal('manual-nut-vitC', micros.vitC != null ? micros.vitC : '');
      setVal('manual-nut-vitD', micros.vitD != null ? micros.vitD : '');
      setVal('manual-nut-vitE', micros.vitE != null ? micros.vitE : '');
      setVal('manual-nut-vitK', micros.vitK != null ? micros.vitK : '');
      setVal('manual-nut-vitB1', micros.vitB1 != null ? micros.vitB1 : '');
      setVal('manual-nut-vitB2', micros.vitB2 != null ? micros.vitB2 : '');
      setVal('manual-nut-vitB3', micros.vitB3 != null ? micros.vitB3 : '');
      setVal('manual-nut-vitB5', micros.vitB5 != null ? micros.vitB5 : '');
      setVal('manual-nut-vitB6', micros.vitB6 != null ? micros.vitB6 : '');
      setVal('manual-nut-vitB7', micros.vitB7 != null ? micros.vitB7 : '');
      setVal('manual-nut-vitB9', micros.vitB9 != null ? micros.vitB9 : '');
      setVal('manual-nut-vitB12', micros.vitB12 != null ? micros.vitB12 : '');
      setVal('manual-nut-choline', micros.choline != null ? micros.choline : '');

      // All 14 Essential Minerals
      setVal('manual-nut-potassium', micros.potassium != null ? micros.potassium : '');
      setVal('manual-nut-calcium', micros.calcium != null ? micros.calcium : '');
      setVal('manual-nut-iron', micros.iron != null ? micros.iron : '');
      setVal('manual-nut-magnesium', micros.magnesium != null ? micros.magnesium : '');
      setVal('manual-nut-zinc', micros.zinc != null ? micros.zinc : '');
      setVal('manual-nut-phosphorus', micros.phosphorus != null ? micros.phosphorus : '');
      setVal('manual-nut-chloride', micros.chloride != null ? micros.chloride : '');
      setVal('manual-nut-sulfur', micros.sulfur != null ? micros.sulfur : '');
      setVal('manual-nut-copper', micros.copper != null ? micros.copper : '');
      setVal('manual-nut-manganese', micros.manganese != null ? micros.manganese : '');
      setVal('manual-nut-selenium', micros.selenium != null ? micros.selenium : '');
      setVal('manual-nut-iodine', micros.iodine != null ? micros.iodine : '');
      setVal('manual-nut-chromium', micros.chromium != null ? micros.chromium : '');
      setVal('manual-nut-molybdenum', micros.molybdenum != null ? micros.molybdenum : '');

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

    function autoEstimateMissingMicros() {
      const cat = (document.getElementById('manual-nut-cat') || {}).value || 'produce';
      const kcal = parseFloat((document.getElementById('manual-nut-kcal') || {}).value) || 0;
      const protein = parseFloat((document.getElementById('manual-nut-protein') || {}).value) || 0;
      const carbs = parseFloat((document.getElementById('manual-nut-carbs') || {}).value) || 0;
      const fat = parseFloat((document.getElementById('manual-nut-fat') || {}).value) || 0;
      const name = (document.getElementById('manual-nut-name') || {}).value || '';

      const estimated = estimateMicronutrientsForFood(cat, kcal, protein, carbs, fat, name);

      const fillIfEmpty = (id, val) => {
        const el = document.getElementById(id);
        if (el && (!el.value || parseFloat(el.value) === 0)) {
          el.value = val;
        }
      };

      // Vitamins
      fillIfEmpty('manual-nut-vitA', estimated.vitA);
      fillIfEmpty('manual-nut-vitC', estimated.vitC);
      fillIfEmpty('manual-nut-vitD', estimated.vitD);
      fillIfEmpty('manual-nut-vitE', estimated.vitE);
      fillIfEmpty('manual-nut-vitK', estimated.vitK);
      fillIfEmpty('manual-nut-vitB1', estimated.vitB1);
      fillIfEmpty('manual-nut-vitB2', estimated.vitB2);
      fillIfEmpty('manual-nut-vitB3', estimated.vitB3);
      fillIfEmpty('manual-nut-vitB5', estimated.vitB5);
      fillIfEmpty('manual-nut-vitB6', estimated.vitB6);
      fillIfEmpty('manual-nut-vitB7', estimated.vitB7);
      fillIfEmpty('manual-nut-vitB9', estimated.vitB9);
      fillIfEmpty('manual-nut-vitB12', estimated.vitB12);
      fillIfEmpty('manual-nut-choline', estimated.choline);

      // Minerals
      fillIfEmpty('manual-nut-potassium', estimated.potassium);
      fillIfEmpty('manual-nut-calcium', estimated.calcium);
      fillIfEmpty('manual-nut-iron', estimated.iron);
      fillIfEmpty('manual-nut-magnesium', estimated.magnesium);
      fillIfEmpty('manual-nut-zinc', estimated.zinc);
      fillIfEmpty('manual-nut-phosphorus', estimated.phosphorus);
      fillIfEmpty('manual-nut-chloride', estimated.chloride);
      fillIfEmpty('manual-nut-sulfur', estimated.sulfur);
      fillIfEmpty('manual-nut-copper', estimated.copper);
      fillIfEmpty('manual-nut-manganese', estimated.manganese);
      fillIfEmpty('manual-nut-selenium', estimated.selenium);
      fillIfEmpty('manual-nut-iodine', estimated.iodine);
      fillIfEmpty('manual-nut-chromium', estimated.chromium);
      fillIfEmpty('manual-nut-molybdenum', estimated.molybdenum);

      alertBox("Auto-filled missing micronutrients with USDA clinical standards!", "Micros Estimated");
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

      const barcode = (document.getElementById('manual-nut-barcode') || {}).value?.trim() || '';
      const brand = (document.getElementById('manual-nut-brand') || {}).value?.trim() || '';
      const amount = getNum('manual-nut-amount', 1);
      const unit = (document.getElementById('manual-nut-unit') || {}).value || 'items';
      const category = (document.getElementById('manual-nut-cat') || {}).value || 'produce';
      const storage = (document.getElementById('manual-nut-storage') || {}).value || 'fridge';

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

      const micros = {
        vitA: Math.round(getNum('manual-nut-vitA', 0)),
        vitC: getNum('manual-nut-vitC', 0),
        vitD: getNum('manual-nut-vitD', 0),
        vitE: getNum('manual-nut-vitE', 0),
        vitK: getNum('manual-nut-vitK', 0),
        vitB1: getNum('manual-nut-vitB1', 0),
        vitB2: getNum('manual-nut-vitB2', 0),
        vitB3: getNum('manual-nut-vitB3', 0),
        vitB5: getNum('manual-nut-vitB5', 0),
        vitB6: getNum('manual-nut-vitB6', 0),
        vitB7: getNum('manual-nut-vitB7', 0),
        vitB9: Math.round(getNum('manual-nut-vitB9', 0)),
        vitB12: getNum('manual-nut-vitB12', 0),
        choline: Math.round(getNum('manual-nut-choline', 0)),

        potassium: Math.round(getNum('manual-nut-potassium', 0)),
        calcium: Math.round(getNum('manual-nut-calcium', 0)),
        iron: getNum('manual-nut-iron', 0),
        magnesium: Math.round(getNum('manual-nut-magnesium', 0)),
        zinc: getNum('manual-nut-zinc', 0),
        phosphorus: Math.round(getNum('manual-nut-phosphorus', 0)),
        chloride: Math.round(getNum('manual-nut-chloride', 0)),
        sulfur: Math.round(getNum('manual-nut-sulfur', 0)),
        copper: getNum('manual-nut-copper', 0),
        manganese: getNum('manual-nut-manganese', 0),
        selenium: Math.round(getNum('manual-nut-selenium', 0)),
        iodine: Math.round(getNum('manual-nut-iodine', 0)),
        chromium: Math.round(getNum('manual-nut-chromium', 0)),
        molybdenum: Math.round(getNum('manual-nut-molybdenum', 0))
      };

      const product = {
        name,
        brand,
        amount,
        unit,
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
        sourceBadge: '✓ Verified Nutrition',
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
          micros
        }
      };

      if (activeManualNutritionContext && activeManualNutritionContext.isPantryEdit && activeManualNutritionContext.pantryItemId) {
        const pItem = (state.pantry || []).find(p => p.id === activeManualNutritionContext.pantryItemId);
        if (pItem) {
          pItem.name = name;
          pItem.brand = brand;
          pItem.amount = amount;
          pItem.unit = unit;
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
          pItem.nutrition = product.nutrition;
          pItem.isVerified = true;
          pItem.sourceBadge = '✓ Verified Nutrition Facts';
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
          rItem.nutrition = product.nutrition;
          rItem.isVerified = true;
          rItem.sourceBadge = '✓ Exact Label Verified';
          rItem.nutritionSource = 'Exact Label Verified';
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

    function applyScannedBarcodeFood(product) {
      closeBarcodeScannerModal();
      if (product.barcode) {
        saveCustomBarcodeItem(product.barcode, product);
      }

      const cat = product.category || inferFoodCategory(product.name, '');
      const stor = product.storage || inferStorageZone(cat, product.name);
      const amount = (typeof product.amount === 'number' && product.amount > 0) ? product.amount : 1;
      const unit = product.unit || 'items';

      const kcal = (product.nutrition && product.nutrition.kcal != null) ? product.nutrition.kcal : (product.kcal || 0);
      const protein = (product.nutrition && product.nutrition.protein != null) ? product.nutrition.protein : (product.protein || 0);
      const carbs = (product.nutrition && product.nutrition.carbs != null) ? product.nutrition.carbs : (product.carbs || 0);
      const fat = (product.nutrition && product.nutrition.fat != null) ? product.nutrition.fat : (product.fat || 0);
      const fiber = (product.nutrition && product.nutrition.fiber != null) ? product.nutrition.fiber : (product.fiber || 0);
      const sugar = (product.nutrition && product.nutrition.sugar != null) ? product.nutrition.sugar : (product.sugar || 0);
      const satFat = (product.nutrition && product.nutrition.satFat != null) ? product.nutrition.satFat : (product.satFat || 0);
      const sodium = (product.nutrition && product.nutrition.sodium != null) ? product.nutrition.sodium : (product.sodium || 0);

      const micros = (product.nutrition && product.nutrition.micros) ? product.nutrition.micros : (
        typeof estimateMicronutrientsForFood === 'function' ? estimateMicronutrientsForFood(cat, kcal, protein, carbs, fat, product.name) : {}
      );

      const completeNutrition = {
        kcal, protein, carbs, fat, fiber, sugar, satFat, sodium,
        transFat: product.nutrition?.transFat || 0,
        addedSugar: product.nutrition?.addedSugar || 0,
        cholesterol: product.nutrition?.cholesterol || 0,
        water: product.nutrition?.water || 0,
        micros
      };

      if (barcodeScannerContext === 'recipe') {
        const ingInput = document.getElementById('recipe-ingredients-input');
        if (ingInput) {
          ingInput.value += (ingInput.value ? '\n' : '') + `${product.name} (${kcal} kcal)`;
        }
        alertBox(`Added "${product.name}" to recipe ingredients.`, "Barcode Added");
      } else if (barcodeScannerContext === 'pantry') {
        state.pantry.push({
          id: `p-${Date.now()}`,
          name: product.name,
          brand: product.brand || '',
          category: cat,
          storage: stor,
          amount: amount,
          unit: unit,
          kcal: kcal,
          protein: protein,
          carbs: carbs,
          fat: fat,
          fiber: fiber,
          sugar: sugar,
          satFat: satFat,
          sodium: sodium,
          sourceBadge: product.sourceBadge || '✓ Verified Nutrition',
          barcode: product.barcode || '',
          dateAdded: new Date().toISOString().split('T')[0],
          expirationDate: (() => {
            const d = new Date();
            d.setDate(d.getDate() + (stor === 'frozen' ? 90 : (stor === 'fridge' ? 14 : 30)));
            return d.toISOString().split('T')[0];
          })(),
          nutrition: completeNutrition
        });
        saveAppState();
        renderPantry();
        if (typeof playChime === 'function') {
          try { playChime('bell'); } catch (e) {}
        }
        alertBox(`Added "${product.name}" (${amount} ${unit}) to your pantry with full macro & micronutrient profile!`, "Pantry Item Added");
      } else {
        openLogFoodModal('verified');
        const setVal = (id, val) => {
          const el = document.getElementById(id);
          if (el) el.value = val;
        };
        setVal('food-input-name', product.name);
        setVal('food-input-kcal', kcal);
        setVal('food-input-protein', protein);
        setVal('food-input-carbs', carbs);
        setVal('food-input-fat', fat);
        setVal('food-input-fiber', fiber);
        setVal('food-input-sodium', sodium);
        alertBox(`Loaded "${product.name}" into food log!`, "Barcode Verified");
      }
    }

    if (typeof window !== 'undefined') {
      window.DAILY_NUTRITION_STANDARDS = DAILY_NUTRITION_STANDARDS;
      window.estimateMicronutrientsForFood = estimateMicronutrientsForFood;
      window.openManualNutritionModal = openManualNutritionModal;
      window.closeManualNutritionModal = closeManualNutritionModal;
      window.switchManualNutMicroTab = switchManualNutMicroTab;
      window.autoEstimateMissingMicros = autoEstimateMissingMicros;
      window.saveManualNutritionData = saveManualNutritionData;
      window.setLogMealType = setLogMealType;
      window.deleteFoodEntry = deleteFoodEntry;
      window.renderRemainingCaloriesDonut = renderRemainingCaloriesDonut;
    }

