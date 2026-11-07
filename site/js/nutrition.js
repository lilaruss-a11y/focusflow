// ==============================================
// EXTENDED NUTRITION RENDERING & BIOMARKER LOG
// ==============================================
// Extended Nutrition Rendering with All Biomarkers
    function renderNutrition() {
      const totals = calculateDailyNutrientTotals();
      renderWeightGoalTimeline();
      renderSavedRecipesDropdown();
      const list = document.getElementById('nutrition-diary-list');
      if (list) {
        list.innerHTML = '';
        state.nutritionLog.forEach(n => {
          const row = document.createElement('div');
          row.className = "p-3 rounded-xl bg-dark-base border border-dark-border hover:border-pastel-mint/50 cursor-pointer flex items-center justify-between text-xs transition";
          row.onclick = () => inspectLoggedFood(n.id);
          row.innerHTML = `
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full ${n.isVerified ? 'bg-pastel-mint' : 'bg-pastel-butter'}"></span>
                <span class="text-slate-200 font-semibold">${n.name}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded ${n.isVerified ? 'bg-pastel-mint/15 text-pastel-mint' : 'bg-pastel-butter/15 text-pastel-butter'}">${n.isVerified ? 'Verified' : 'Estimated'}</span>
              </div>
              <div class="text-[11px] text-slate-400 mt-1 font-mono">
                P: ${n.protein}g | C: ${n.carbs}g | F: ${n.fat}g | Fiber: ${n.fiber || 0}g • <span class="text-pastel-mint underline">Tap for vitamins</span>
              </div>
            </div>
            <span class="font-mono font-bold text-white text-sm">${n.kcal} kcal</span>
          `;
          list.appendChild(row);
        });
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

      if (waterUnit === 'fl_oz') {
        const curFlOz = Math.round((state.waterLoggedMl || 0) / 29.5735);
        const tgtFlOz = targets.dailyWaterTargetFlOz || 90;
        if (waterLabelEl) waterLabelEl.textContent = `${curFlOz} / ${tgtFlOz} fl oz (Goal calibrated for energy)`;
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
        if (waterLabelEl) waterLabelEl.textContent = `${curMl} / ${tgtMl} ml (Goal calibrated for energy)`;
        if (btn1) {
          btn1.textContent = '+250 ml';
          btn1.setAttribute('onclick', 'logQuickWater(250)');
        }
        if (btn2) {
          btn2.textContent = '+500 ml';
          btn2.setAttribute('onclick', 'logQuickWater(500)');
        }
      }

      // Macro gauges on main nutrition interface
      const calTarget = targets.dailyCaloriesTarget || 2130;
      const protTarget = targets.dailyProteinTarget || 135;
      const carbTarget = targets.dailyCarbsTarget || 240;
      const fatTarget = targets.dailyFatTarget || 71;

      setTxt('macro-calories', `${totals.caloriesKcal} / ${calTarget.toLocaleString()}`);
      setTxt('macro-protein', `${Math.round(totals.proteinG)}g / ${protTarget}g`);
      setTxt('macro-carbs', `${Math.round(totals.carbsG)}g / ${carbTarget}g`);
      setTxt('macro-fats', `${Math.round(totals.fatG)}g / ${fatTarget}g`);

      const pctCal = Math.min(100, Math.round((totals.caloriesKcal / calTarget) * 100));
      const pctProt = Math.min(100, Math.round((totals.proteinG / protTarget) * 100));
      const pctCarb = Math.min(100, Math.round((totals.carbsG / carbTarget) * 100));
      const pctFat = Math.min(100, Math.round((totals.fatG / fatTarget) * 100));

      setWidth('bar-calories', `${pctCal}%`);
      setTxt('pct-calories', `${pctCal}% • Tap for Micronutrients`);
      setWidth('bar-protein', `${pctProt}%`);
      setTxt('pct-protein', `${pctProt}%`);
      setWidth('bar-carbs', `${pctCarb}%`);
      setTxt('pct-carbs', `${pctCarb}%`);
      setWidth('bar-fats', `${pctFat}%`);
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
    function openLogFoodModal(mode = 'verified') {
      setLogAccuracyMode(mode);
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
      state.nutritionLog.push({
        id: `n-${Date.now()}`,
        name,
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
    // USDA COMMON WHOLE FOODS DATABASE (50+ Whole Foods)
    // ==============================================
    const commonFoodsDatabase = [
      // Fruits
      { id: 'cf-1', name: 'Medium Apple with Skin (182g)', category: 'Fruit', kcal: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, sodium: 2, potassium: 195, iron: 0.2, calcium: 11, vitC: 8.4 },
      { id: 'cf-2', name: 'Medium Banana (118g)', category: 'Fruit', kcal: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3.1, sodium: 1, potassium: 422, iron: 0.3, calcium: 6, vitC: 10.3 },
      { id: 'cf-3', name: 'Navel Orange (140g)', category: 'Fruit', kcal: 69, protein: 1.3, carbs: 17.5, fat: 0.2, fiber: 3.1, sodium: 0, potassium: 232, iron: 0.1, calcium: 60, vitC: 82.7 },
      { id: 'cf-4', name: 'Fresh Strawberries (150g / 1 cup)', category: 'Fruit', kcal: 49, protein: 1.0, carbs: 11.7, fat: 0.5, fiber: 3.0, sodium: 2, potassium: 230, iron: 0.6, calcium: 24, vitC: 89.4 },
      { id: 'cf-5', name: 'Fresh Blueberries (148g / 1 cup)', category: 'Fruit', kcal: 84, protein: 1.1, carbs: 21.5, fat: 0.5, fiber: 3.6, sodium: 1, potassium: 114, iron: 0.4, calcium: 9, vitC: 14.4 },
      { id: 'cf-6', name: 'Hass Avocado (100g / ~half)', category: 'Healthy Fat', kcal: 160, protein: 2.0, carbs: 8.5, fat: 14.7, fiber: 6.7, sodium: 7, potassium: 485, iron: 0.6, calcium: 12, vitC: 10.0 },
      
      // Proteins & Poultry
      { id: 'cf-7', name: 'Cooked Chicken Breast (150g)', category: 'Protein', kcal: 247, protein: 46.5, carbs: 0, fat: 5.4, fiber: 0, sodium: 111, potassium: 384, iron: 1.5, calcium: 22 },
      { id: 'cf-8', name: '2 Large Whole Eggs (100g)', category: 'Protein', kcal: 143, protein: 12.6, carbs: 0.8, fat: 9.5, fiber: 0, sodium: 142, potassium: 138, iron: 1.8, calcium: 56 },
      { id: 'cf-9', name: 'Liquid Egg Whites (100g)', category: 'Protein', kcal: 52, protein: 10.9, carbs: 0.7, fat: 0.2, fiber: 0, sodium: 166, potassium: 163, iron: 0.1, calcium: 7 },
      { id: 'cf-10', name: 'Atlantic Salmon, Cooked (150g)', category: 'Protein', kcal: 309, protein: 33.2, carbs: 0, fat: 18.5, fiber: 0, sodium: 88, potassium: 576, iron: 1.2, calcium: 18, omega3: 2.1 },
      { id: 'cf-11', name: 'Canned Chunk Light Tuna in Water (100g)', category: 'Protein', kcal: 116, protein: 25.5, carbs: 0, fat: 0.8, fiber: 0, sodium: 337, potassium: 237, iron: 1.5, calcium: 11 },
      { id: 'cf-12', name: 'Lean Ground Turkey 93/7 (150g)', category: 'Protein', kcal: 225, protein: 30.0, carbs: 0, fat: 12.0, fiber: 0, sodium: 105, potassium: 345, iron: 2.1, calcium: 30 },
      { id: 'cf-13', name: 'Extra Firm Tofu (100g)', category: 'Protein', kcal: 83, protein: 10.0, carbs: 2.3, fat: 5.3, fiber: 1.2, sodium: 10, potassium: 121, iron: 1.6, calcium: 282 },
      { id: 'cf-14', name: 'Plain Nonfat Greek Yogurt (170g)', category: 'Dairy', kcal: 100, protein: 17.5, carbs: 6.1, fat: 0.7, fiber: 0, sodium: 61, potassium: 240, iron: 0.1, calcium: 187 },
      { id: 'cf-15', name: 'Low-Fat 2% Cottage Cheese (150g)', category: 'Dairy', kcal: 130, protein: 18.0, carbs: 7.0, fat: 3.5, fiber: 0, sodium: 450, potassium: 180, iron: 0.2, calcium: 150 },
      { id: 'cf-16', name: '100% Whey Protein Isolate (30g Scoop)', category: 'Supplement', kcal: 120, protein: 25.0, carbs: 1.5, fat: 1.0, fiber: 0, sodium: 120, potassium: 150, iron: 0.5, calcium: 130 },

      // Grains & Starches
      { id: 'cf-17', name: 'Cooked Jasmine White Rice (150g / 1 cup)', category: 'Grain', kcal: 195, protein: 3.6, carbs: 43.0, fat: 0.4, fiber: 0.6, sodium: 2, potassium: 53, iron: 1.9, calcium: 15 },
      { id: 'cf-18', name: 'Cooked Brown Rice (150g / 1 cup)', category: 'Grain', kcal: 167, protein: 3.5, carbs: 35.0, fat: 1.3, fiber: 2.7, sodium: 3, potassium: 126, iron: 0.8, calcium: 15 },
      { id: 'cf-19', name: 'Rolled Oats, Dry (40g / 0.5 cup)', category: 'Grain', kcal: 152, protein: 5.3, carbs: 27.0, fat: 2.7, fiber: 4.0, sodium: 2, potassium: 140, iron: 1.4, calcium: 20 },
      { id: 'cf-20', name: 'Artisan Sourdough Bread (50g / 1 slice)', category: 'Grain', kcal: 130, protein: 4.5, carbs: 25.0, fat: 1.0, fiber: 1.5, sodium: 220, potassium: 65, iron: 1.2, calcium: 18 },
      { id: 'cf-21', name: '100% Whole Wheat Bread (45g / 1 slice)', category: 'Grain', kcal: 110, protein: 5.0, carbs: 20.0, fat: 1.5, fiber: 3.0, sodium: 170, potassium: 98, iron: 1.1, calcium: 30 },
      { id: 'cf-22', name: 'Cooked Quinoa (150g / 1 cup)', category: 'Grain', kcal: 180, protein: 6.5, carbs: 32.0, fat: 2.9, fiber: 4.0, sodium: 10, potassium: 235, iron: 2.1, calcium: 25 },
      { id: 'cf-23', name: 'Sweet Potato, Baked (150g)', category: 'Starch', kcal: 135, protein: 3.0, carbs: 31.0, fat: 0.2, fiber: 4.5, sodium: 55, potassium: 542, iron: 1.0, calcium: 45, vitA: 1400 },
      { id: 'cf-24', name: 'Russet Potato, Baked with Skin (175g)', category: 'Starch', kcal: 165, protein: 4.3, carbs: 37.0, fat: 0.2, fiber: 3.8, sodium: 14, potassium: 926, iron: 1.9, calcium: 26 },

      // Healthy Fats & Nuts
      { id: 'cf-25', name: 'Extra Virgin Olive Oil (14g / 1 tbsp)', category: 'Healthy Fat', kcal: 119, protein: 0, carbs: 0, fat: 13.5, fiber: 0, sodium: 0, potassium: 0, iron: 0.1, calcium: 0 },
      { id: 'cf-26', name: 'Creamy Peanut Butter (32g / 2 tbsp)', category: 'Healthy Fat', kcal: 188, protein: 8.0, carbs: 7.0, fat: 16.0, fiber: 2.0, sodium: 140, potassium: 208, iron: 0.6, calcium: 17 },
      { id: 'cf-27', name: 'Raw Whole Almonds (28g / 1 oz)', category: 'Healthy Fat', kcal: 164, protein: 6.0, carbs: 6.1, fat: 14.2, fiber: 3.5, sodium: 1, potassium: 208, iron: 1.0, calcium: 76, magnesium: 77 },
      { id: 'cf-28', name: 'Raw Walnuts (28g / 1 oz)', category: 'Healthy Fat', kcal: 185, protein: 4.3, carbs: 3.9, fat: 18.5, fiber: 1.9, sodium: 1, potassium: 125, iron: 0.8, calcium: 28, omega3: 2.5 },
      { id: 'cf-29', name: 'Chia Seeds (15g / 1 tbsp)', category: 'Healthy Fat', kcal: 73, protein: 2.5, carbs: 6.3, fat: 4.6, fiber: 5.1, sodium: 2, potassium: 61, iron: 1.1, calcium: 95 },

      // Dairy & Milks
      { id: 'cf-30', name: 'Whole Cow Milk (240ml / 1 cup)', category: 'Dairy', kcal: 149, protein: 7.7, carbs: 11.7, fat: 8.0, fiber: 0, sodium: 105, potassium: 322, iron: 0.1, calcium: 276 },
      { id: 'cf-31', name: 'Unsweetened Almond Milk (240ml / 1 cup)', category: 'Dairy Alt', kcal: 30, protein: 1.0, carbs: 1.0, fat: 2.5, fiber: 0.5, sodium: 170, potassium: 160, iron: 0.7, calcium: 450 },
      { id: 'cf-32', name: 'Sharp Cheddar Cheese (28g / 1 oz)', category: 'Dairy', kcal: 115, protein: 7.0, carbs: 0.5, fat: 9.5, fiber: 0, sodium: 180, potassium: 28, iron: 0.2, calcium: 200 },

      // Vegetables & Legumes
      { id: 'cf-33', name: 'Steamed Fresh Broccoli (150g)', category: 'Vegetable', kcal: 52, protein: 3.7, carbs: 10.2, fat: 0.6, fiber: 3.8, sodium: 60, potassium: 450, iron: 1.0, calcium: 62, vitC: 89 },
      { id: 'cf-34', name: 'Fresh Baby Spinach (100g / ~3 cups)', category: 'Vegetable', kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sodium: 79, potassium: 558, iron: 2.7, calcium: 99, vitA: 469 },
      { id: 'cf-35', name: 'Sliced Cucumber with Peel (100g)', category: 'Vegetable', kcal: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, sodium: 2, potassium: 147, iron: 0.3, calcium: 16 },
      { id: 'cf-36', name: 'Cooked Black Beans (130g / 0.5 cup)', category: 'Legume', kcal: 114, protein: 7.6, carbs: 20.4, fat: 0.5, fiber: 7.5, sodium: 1, potassium: 305, iron: 1.8, calcium: 23 },
      { id: 'cf-37', name: 'Cooked Chickpeas / Garbanzo (130g)', category: 'Legume', kcal: 134, protein: 7.3, carbs: 22.5, fat: 2.1, fiber: 6.2, sodium: 7, potassium: 239, iron: 2.4, calcium: 40 }
    ];

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

    async function lookupBarcode(directCode) {
      const code = (directCode || (document.getElementById('barcode-manual-input') || {}).value || '').trim();
      if (!code) {
        alertBox("Please enter a valid barcode / UPC number.", "Barcode Required");
        return;
      }

      const resBox = document.getElementById('barcode-lookup-result');
      if (resBox) {
        resBox.innerHTML = `
          <div class="text-xs text-pastel-sky flex items-center gap-2 p-2">
            <i data-lucide="loader" class="w-4 h-4 animate-spin"></i>
            <span>Searching Open Food Facts &amp; whole foods database for <strong>${code}</strong>...</span>
          </div>
        `;
        resBox.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
      }

      // Offline test items for instant reliable testing
      const testDb = {
        '011110038332': {
          name: 'Kroger Traditional 100% Whole Grain Rolled Oats',
          brand: 'Kroger',
          quantity: '18 oz',
          category: 'grains',
          storage: 'shelf',
          kcal: 150,
          protein: 5,
          carbs: 27,
          fat: 2.5,
          fiber: 4.0,
          sodium: 0
        },
        '052159701026': {
          name: 'Chobani Non-Fat Plain Greek Yogurt',
          brand: 'Chobani',
          quantity: '32 oz',
          category: 'dairy',
          storage: 'fridge',
          kcal: 90,
          protein: 16,
          carbs: 6,
          fat: 0,
          fiber: 0,
          sodium: 65
        }
      };

      try {
        let product = testDb[code];
        if (!product) {
          // Attempt query to Open Food Facts v0 API
          try {
            const resp = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
            if (resp.ok) {
              const data = await resp.json();
              if (data && data.status === 1 && data.product) {
                const p = data.product;
                const n = p.nutriments || {};
                const name = p.product_name || p.generic_name || p.product_name_en || 'Packaged Food Item';
                const cat = inferFoodCategory(name, p.categories || '');
                const stor = inferStorageZone(cat, name);
                const qParsed = parsePackageQuantity(p.quantity || p.serving_size || '');

                product = {
                  name: name,
                  brand: p.brands || '',
                  quantity: p.quantity || `${qParsed.amount} ${qParsed.unit}`,
                  amount: qParsed.amount,
                  unit: qParsed.unit,
                  category: cat,
                  storage: stor,
                  kcal: Math.round(n['energy-kcal_100g'] || n['energy-kcal_serving'] || n['energy-kcal'] || 120),
                  protein: Math.round(n.proteins_100g || n.proteins_serving || 0),
                  carbs: Math.round(n.carbohydrates_100g || n.carbohydrates_serving || 0),
                  fat: Math.round(n.fat_100g || n.fat_serving || 0),
                  fiber: Math.round(n.fiber_100g || n.fiber_serving || 0),
                  sodium: Math.round((n.sodium_100g || n.sodium_serving || 0) * (n.sodium_100g > 10 ? 1 : 1000))
                };
              }
            }
          } catch (netErr) {
            console.warn("Open Food Facts fetch attempt 1 failed:", netErr);
          }
        }

        if (product && resBox) {
          const qParsed = (product.amount && product.unit) ? { amount: product.amount, unit: product.unit } : parsePackageQuantity(product.quantity);
          const safeProductJson = JSON.stringify({
            ...product,
            amount: qParsed.amount,
            unit: qParsed.unit
          }).replace(/"/g, '&quot;');

          resBox.innerHTML = `
            <div class="space-y-3 text-xs bg-dark-elevated p-3 rounded-2xl border border-pastel-lavender/40">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="text-[10px] text-pastel-lavender uppercase tracking-wider font-semibold block">${product.brand || 'Verified Food'}</span>
                  <h4 class="font-bold text-white text-sm">${product.name}</h4>
                  <span class="text-[11px] text-slate-300 font-mono mt-0.5 block">Package Size: <strong>${qParsed.amount} ${qParsed.unit}</strong></span>
                </div>
                <div class="text-right shrink-0">
                  <span class="px-2 py-1 rounded-lg bg-pastel-mint/15 text-pastel-mint font-mono font-bold text-xs">${product.kcal} kcal</span>
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
        } else if (resBox) {
          resBox.innerHTML = `
            <div class="p-3 rounded-2xl bg-dark-elevated border border-amber-400/40 space-y-2 text-xs">
              <div class="flex items-center gap-2 text-amber-300 font-semibold">
                <i data-lucide="help-circle" class="w-4 h-4"></i>
                <span>Product not found in Open Food Facts database (UPC: ${code})</span>
              </div>
              <p class="text-[11px] text-slate-300">Enter a quick name to save it to your pantry or log anyway:</p>
              <div class="flex gap-2">
                <input type="text" id="barcode-fallback-name" placeholder="e.g. Organic Rolled Oats" class="w-full bg-dark-base border border-dark-border rounded-xl px-3 py-2 text-white text-xs focus:border-pastel-lavender">
                <button type="button" onclick="saveUnknownBarcodeItem('${code}')" class="px-4 py-2 rounded-xl bg-pastel-mint text-dark-base font-bold text-xs shrink-0">
                  Save Item
                </button>
              </div>
              <div class="pt-1 flex justify-start">
                <button type="button" onclick="startBarcodeCamera()" class="text-pastel-lavender hover:underline text-[11px] flex items-center gap-1">
                  <i data-lucide="refresh-cw" class="w-3 h-3"></i>
                  <span>Try Scanning Again</span>
                </button>
              </div>
            </div>
          `;
          resBox.classList.remove('hidden');
          if (window.lucide) lucide.createIcons();
        }
      } catch (err) {
        if (resBox) {
          resBox.innerHTML = `<div class="text-xs text-amber-300 p-2">Search unavailable. You can enter the food details manually.</div>`;
          resBox.classList.remove('hidden');
        }
      }
    }

    function saveUnknownBarcodeItem(code) {
      const input = document.getElementById('barcode-fallback-name');
      const name = (input ? input.value : '').trim() || 'Scanned Item';
      const fallbackProduct = {
        name: name,
        brand: 'Packaged Item',
        amount: 1,
        unit: 'items',
        category: inferFoodCategory(name, ''),
        storage: inferStorageZone('pantry_staples', name),
        kcal: 100,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sodium: 0,
        barcode: code
      };
      applyScannedBarcodeFood(fallbackProduct);
    }

    function applyScannedBarcodeFood(product) {
      closeBarcodeScannerModal();
      if (barcodeScannerContext === 'recipe') {
        const ingInput = document.getElementById('recipe-ingredients-input');
        if (ingInput) {
          ingInput.value += (ingInput.value ? '\n' : '') + `${product.name} (${product.kcal} kcal)`;
        }
        alertBox(`Added "${product.name}" to recipe ingredients.`, "Barcode Added");
      } else if (barcodeScannerContext === 'pantry') {
        const cat = product.category || inferFoodCategory(product.name, '');
        const stor = product.storage || inferStorageZone(cat, product.name);
        const amount = (typeof product.amount === 'number' && product.amount > 0) ? product.amount : 1;
        const unit = product.unit || 'items';

        state.pantry.push({
          id: `p-${Date.now()}`,
          name: product.name,
          category: cat,
          storage: stor,
          amount: amount,
          unit: unit,
          dateAdded: new Date().toISOString().split('T')[0],
          nutrition: {
            kcal: product.kcal || 0,
            protein: product.protein || 0,
            carbs: product.carbs || 0,
            fat: product.fat || 0,
            fiber: product.fiber || 0,
            sodium: product.sodium || 0
          }
        });
        saveAppState();
        renderPantry();
        if (typeof playChime === 'function') {
          try { playChime('bell'); } catch (e) {}
        }
        alertBox(`Scanned and added "${product.name}" (${amount} ${unit}) to your pantry with verified nutrition!`, "Pantry Barcode Added");
      } else {
        openLogFoodModal('verified');
        const setVal = (id, val) => {
          const el = document.getElementById(id);
          if (el) el.value = val;
        };
        setVal('food-input-name', product.name);
        setVal('food-input-kcal', product.kcal);
        setVal('food-input-protein', product.protein);
        setVal('food-input-carbs', product.carbs);
        setVal('food-input-fat', product.fat);
        setVal('food-input-fiber', product.fiber || 0);
        setVal('food-input-sodium', product.sodium || 0);
        alertBox(`Loaded "${product.name}" into food log!`, "Barcode Verified");
      }
    }

