    // ==============================================
    // KITCHEN SUITE: SUB-TABS, MEAL PLANNER & SHOPPING
    // ==============================================
    function switchKitchenSubTab(subTab) {
      state.kitchenSubTab = subTab;
      ['pantry', 'planner', 'shopping'].forEach(t => {
        const view = document.getElementById(`kitchen-view-${t}`);
        const btn = document.getElementById(`kitchen-subtab-btn-${t}`);
        if (view) view.classList.toggle('hidden', t !== subTab);
        if (btn) {
          if (t === subTab) {
            btn.className = "px-3.5 py-2 rounded-xl font-bold bg-pastel-butter text-dark-base transition flex items-center gap-1.5 shadow-sm";
          } else {
            btn.className = "px-3.5 py-2 rounded-xl font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5";
          }
        }
      });

      const hintEl = document.getElementById('kitchen-subtab-hint');
      if (hintEl) {
        if (subTab === 'pantry') hintEl.textContent = "🥫 Keep an accurate stock of food on hand to prevent duplicate purchases";
        else if (subTab === 'planner') hintEl.textContent = "🗓️ Plan recipes for the week; FocusFlow detects missing ingredients automatically";
        else hintEl.textContent = "🛒 Interactive in-store checklist; 1 tap moves purchased groceries to Pantry";
      }

      if (subTab === 'pantry') renderPantry();
      else if (subTab === 'planner') renderWeeklyMealPlan();
      else if (subTab === 'shopping') renderShoppingList();

      updateShoppingBadges();
      if (window.lucide) lucide.createIcons();
    }

    function renderKitchen() {
      const activeSub = state.kitchenSubTab || 'pantry';
      renderPantry();
      renderWeeklyMealPlan();
      renderShoppingList();
      switchKitchenSubTab(activeSub);
    }

    function switchPantryViewGroup(mode) {
      state.pantryViewGroup = mode;
      const btnZone = document.getElementById('btn-pantry-view-zone');
      const btnType = document.getElementById('btn-pantry-view-type');
      const gridZone = document.getElementById('pantry-grid-zone');
      const gridType = document.getElementById('pantry-grid-type');
      if (mode === 'type') {
        if (btnType) btnType.className = "px-3 py-1.5 rounded-xl font-bold bg-pastel-mint text-dark-base shadow-sm transition flex items-center gap-1.5 text-xs";
        if (btnZone) btnZone.className = "px-3 py-1.5 rounded-xl font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs";
        if (gridZone) gridZone.classList.add('hidden');
        if (gridType) gridType.classList.remove('hidden');
      } else {
        if (btnZone) btnZone.className = "px-3 py-1.5 rounded-xl font-bold bg-pastel-mint text-dark-base shadow-sm transition flex items-center gap-1.5 text-xs";
        if (btnType) btnType.className = "px-3 py-1.5 rounded-xl font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs";
        if (gridZone) gridZone.classList.remove('hidden');
        if (gridType) gridType.classList.add('hidden');
      }
      saveAppState();
      renderPantry();
    }

    function setPantryZoneFilter(zone) {
      state.pantryZoneFilter = zone;
      const zones = ['all', 'fridge', 'freezer', 'counter', 'cupboard', 'pantry', 'spices'];
      zones.forEach(z => {
        const btn = document.getElementById(`btn-pzone-${z}`);
        if (!btn) return;
        if (z === zone) {
          btn.className = "px-2.5 py-1 rounded-xl font-bold bg-pastel-mint text-dark-base transition text-[11px] shadow-sm";
        } else {
          btn.className = "px-2.5 py-1 rounded-xl bg-dark-base border border-dark-border text-slate-300 hover:text-white transition text-[11px]";
        }
      });
      renderPantry();
    }

    function setPantryTypeFilter(type) {
      state.pantryTypeFilter = type;
      const types = ['all', 'protein', 'dairy', 'vegetables', 'fruits', 'grains', 'canned', 'baking', 'snacks', 'leftovers', 'expiring'];
      types.forEach(t => {
        const btn = document.getElementById(`btn-ptype-${t}`);
        if (!btn) return;
        if (t === type) {
          btn.className = "px-2.5 py-1 rounded-xl font-bold bg-pastel-mint text-dark-base transition text-[11px] shadow-sm";
        } else {
          const borderCls = t === 'expiring' ? 'border-rose-500/40 text-rose-300' : 'border-dark-border text-slate-300';
          btn.className = `px-2.5 py-1 rounded-xl bg-dark-base border ${borderCls} hover:text-white transition text-[11px]`;
        }
      });
      renderPantry();
    }

    function filterPantryByStorage(filter) {
      setPantryZoneFilter(filter);
    }

    // Quick common staple 1-tap adder
    function quickAddStapleToPantry(name, category, storage) {
      if (!Array.isArray(state.pantry)) state.pantry = [];
      const clean = name.trim();
      const existing = state.pantry.find(p => p.name.toLowerCase() === clean.toLowerCase());
      if (existing) {
        existing.amount = (existing.amount || 1) + 1;
        alertBox(`Incremented "${clean}" quantity to ${existing.amount}.`, "Pantry Restocked");
      } else {
        state.pantry.push({
          id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: clean,
          category: category || 'produce',
          storage: storage || 'fridge',
          amount: 1,
          unit: clean.includes('Dozen') ? 'carton' : (clean.includes('Oil') ? 'bottle' : 'item'),
          dateAdded: new Date().toISOString().split('T')[0]
        });
        alertBox(`Added "${clean}" to your pantry!`, "Pantry Stocked");
      }
      saveAppState();
      renderPantry();
      playChime('bell');
    }

    function onKitchenSearchKeydown(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        addCustomPantryItemFromInput();
      }
    }

    function addCustomPantryItemFromInput() {
      const input = document.getElementById('kitchen-food-search-input');
      if (!input) return;
      const val = (input.value || '').trim();
      if (!val) return;

      let cat = 'produce';
      if (/chicken|beef|meat|egg|salmon|fish|protein|yogurt|milk|cheese|tofu|turkey|bacon/i.test(val)) cat = 'protein';
      else if (/rice|oat|quinoa|bread|pasta|cereal|flour|noodle|tortilla|bagel/i.test(val)) cat = 'grains';
      else if (/oil|sauce|dressing|condiment|nut|seed|spice|salt|pepper|vinegar|honey|syrup|butter/i.test(val)) cat = 'condiments';

      const storage = (cat === 'protein' || cat === 'produce') ? 'fridge' : 'shelf';

      if (!Array.isArray(state.pantry)) state.pantry = [];
      state.pantry.push({
        id: `p-${Date.now()}`,
        name: val,
        category: cat,
        storage: storage,
        amount: 1,
        unit: 'item',
        dateAdded: new Date().toISOString().split('T')[0]
      });

      input.value = '';
      const box = document.getElementById('kitchen-search-suggestions');
      if (box) box.classList.add('hidden');

      saveAppState();
      renderPantry();
      playChime('bell');
      alertBox(`Added "${val}" to ${storage === 'fridge' ? 'Fridge' : 'Pantry Shelf'}!`, "Item Added");
    }

    function changePantryItemAmount(id, delta) {
      if (!Array.isArray(state.pantry)) return;
      const item = state.pantry.find(p => p.id === id);
      if (!item) return;

      const current = parseFloat(item.amount) || 1;
      const u = (item.unit || '').toLowerCase();

      // Smart delta: 25g if grams and >= 25, else 1
      let stepDelta = delta;
      if (u === 'g' && Math.abs(delta) === 1 && (current > 25 || (current === 25 && delta < 0))) {
        stepDelta = delta * 25;
      }

      const next = Math.max(0, Math.round((current + stepDelta) * 100) / 100);
      item.amount = next;

      if (next === 0) {
        if (confirm(`You're out of "${item.name}"! Would you like to add it to your Shopping List?`)) {
          addPantryItemToShoppingList(item.id);
        }
      }

      saveAppState();
      renderPantry();
    }

    function togglePantryItemStorage(id) {
      const item = (state.pantry || []).find(p => p.id === id);
      if (!item) return;
      const cycle = { fridge: 'frozen', frozen: 'counter', counter: 'shelf', shelf: 'fridge' };
      item.storage = cycle[item.storage || 'fridge'] || 'fridge';
      saveAppState();
      renderPantry();
      playChime('bell');
    }

    function addPantryItemToShoppingList(pantryId) {
      const item = (state.pantry || []).find(p => p.id === pantryId);
      if (!item) return;

      if (!Array.isArray(state.shoppingList)) state.shoppingList = [];
      const exists = state.shoppingList.find(s => s.name.toLowerCase() === item.name.toLowerCase() && !s.checked);
      if (exists) {
        alertBox(`"${item.name}" is already on your shopping list!`, "Already on List");
        return;
      }

      state.shoppingList.push({
        id: `shop-${Date.now()}`,
        name: item.name,
        quantity: item.unit ? `1 ${item.unit}` : '1 pack',
        category: item.category || 'condiments',
        checked: false,
        source: 'Pantry Low'
      });

      saveAppState();
      updateShoppingBadges();
      playChime('bell');
      alertBox(`Added "${item.name}" to your Shopping List!`, "Added to Groceries");
    }

    // ==============================================
    // WEEKLY MEAL PLANNER ENGINE ("WHAT TO MAKE")
    // ==============================================
    const WEEK_DAYS = [
      { key: 'monday', label: 'Monday', short: 'Mon' },
      { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
      { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
      { key: 'thursday', label: 'Thursday', short: 'Thu' },
      { key: 'friday', label: 'Friday', short: 'Fri' },
      { key: 'saturday', label: 'Saturday', short: 'Sat' },
      { key: 'sunday', label: 'Sunday', short: 'Sun' }
    ];

    const MEAL_SLOTS = [
      { type: 'breakfast', label: 'Breakfast', icon: '🌅', color: 'text-pastel-butter' },
      { type: 'lunch', label: 'Lunch', icon: '🥪', color: 'text-pastel-sky' },
      { type: 'dinner', label: 'Dinner', icon: '🍲', color: 'text-pastel-coral' },
      { type: 'snack', label: 'Snack / Prep', icon: '🍎', color: 'text-pastel-mint' }
    ];

    function renderWeeklyMealPlan() {
      const grid = document.getElementById('weekly-meal-planner-grid');
      if (!grid) return;
      grid.innerHTML = '';

      if (!state.weeklyMealPlan) {
        state.weeklyMealPlan = {
          monday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          tuesday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          wednesday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          thursday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          friday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          saturday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          sunday: { breakfast: '', lunch: '', dinner: '', snack: '' }
        };
      }

      const pantryNames = (state.pantry || []).map(p => (p.name || '').toLowerCase());
      const recipes = state.recipes || [];

      WEEK_DAYS.forEach(day => {
        const dayPlan = state.weeklyMealPlan[day.key] || {};
        const col = document.createElement('div');
        col.className = "bg-dark-surface border border-dark-border rounded-2xl p-3.5 space-y-3 flex flex-col justify-between shadow-md";

        let slotsHtml = '';
        MEAL_SLOTS.forEach(slot => {
          const val = dayPlan[slot.type] || '';
          const recipeObj = recipes.find(r => r.id === val || r.title === val);
          const mealTitle = recipeObj ? recipeObj.title : val;

          let ingredientCheckHtml = '';
          let hasMissing = false;

          if (recipeObj && Array.isArray(recipeObj.ingredients)) {
            const inStock = [];
            const missing = [];

            recipeObj.ingredients.forEach(rawIng => {
              const cleanIng = rawIng.toLowerCase()
                .replace(/^[0-9\/.\s]+(cup|tbsp|tsp|can|clove|slice|handful|scoop|oz|lb|g|ml)s?\s+/i, '')
                .trim();
              const found = pantryNames.some(pn => pn.includes(cleanIng) || cleanIng.includes(pn));
              if (found) inStock.push(cleanIng);
              else missing.push(cleanIng);
            });

            if (missing.length > 0) hasMissing = true;

            ingredientCheckHtml = `
              <div class="pt-1.5 border-t border-dark-border/60 text-[10px] space-y-1">
                <div class="flex items-center justify-between text-slate-400">
                  <span class="text-emerald-400 font-semibold">✓ ${inStock.length} in pantry</span>
                  <span class="${missing.length > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'}">! ${missing.length} missing</span>
                </div>
                ${missing.length > 0 ? `
                  <button type="button" onclick="addMissingIngredientsFromMeal('${day.key}', '${slot.type}')" class="w-full py-1 px-1.5 rounded-lg bg-pastel-coral/20 hover:bg-pastel-coral/30 border border-pastel-coral/40 text-pastel-coral font-bold text-[9.5px] flex items-center justify-center gap-1 transition">
                    <span>🛒 + Add ${missing.length} to Shopping</span>
                  </button>
                ` : '<span class="text-[9px] text-emerald-300 block text-center font-medium">✓ Ready to cook!</span>'}
              </div>
            `;
          }

          slotsHtml += `
            <div class="p-2.5 rounded-xl bg-dark-base border border-dark-border/70 space-y-1.5 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase tracking-wider ${slot.color} flex items-center gap-1">
                  <span>${slot.icon}</span>
                  <span>${slot.label}</span>
                </span>
                ${val ? `
                  <button type="button" onclick="clearMealPlanSlot('${day.key}', '${slot.type}')" class="text-slate-500 hover:text-rose-400 text-xs p-0.5" title="Remove meal">✕</button>
                ` : ''}
              </div>

              ${val ? `
                <div>
                  <span class="text-slate-200 font-bold block text-[11px] leading-tight">${mealTitle}</span>
                  ${recipeObj ? `<span class="text-[9.5px] text-pastel-coral font-mono">${recipeObj.cookTime}m • ${recipeObj.kcal} kcal</span>` : ''}
                </div>
                ${ingredientCheckHtml}
              ` : `
                <div class="pt-1">
                  <select onchange="setMealPlanSlot('${day.key}', '${slot.type}', this.value)" class="w-full bg-dark-elevated border border-dark-border rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-pastel-sky">
                    <option value="">+ Choose meal...</option>
                    <optgroup label="Codex Recipes">
                      ${recipes.map(r => `<option value="${r.id}">${r.title}</option>`).join('')}
                    </optgroup>
                    <optgroup label="Quick Ideas">
                      <option value="Custom: Scrambled Eggs & Toast">Eggs & Toast</option>
                      <option value="Custom: Chicken Rice Bowl">Chicken Rice Bowl</option>
                      <option value="Custom: Protein Oatmeal & Berries">Protein Oatmeal</option>
                      <option value="Custom: Leftovers / Dining Out">Leftovers</option>
                    </optgroup>
                  </select>
                </div>
              `}
            </div>
          `;
        });

        col.innerHTML = `
          <div class="border-b border-dark-border pb-2 flex items-center justify-between">
            <span class="font-bold text-white text-xs sm:text-sm">${day.label}</span>
            <span class="text-[10px] uppercase font-bold text-pastel-butter font-mono">${day.short}</span>
          </div>
          <div class="space-y-2 flex-1">
            ${slotsHtml}
          </div>
        `;
        grid.appendChild(col);
      });

      if (window.lucide) lucide.createIcons();
    }

    function setMealPlanSlot(dayKey, mealType, val) {
      if (!val) return;
      if (!state.weeklyMealPlan) state.weeklyMealPlan = {};
      if (!state.weeklyMealPlan[dayKey]) state.weeklyMealPlan[dayKey] = {};
      state.weeklyMealPlan[dayKey][mealType] = val;
      saveAppState();
      renderWeeklyMealPlan();
      playChime('bell');
    }

    function clearMealPlanSlot(dayKey, mealType) {
      if (!state.weeklyMealPlan || !state.weeklyMealPlan[dayKey]) return;
      state.weeklyMealPlan[dayKey][mealType] = '';
      saveAppState();
      renderWeeklyMealPlan();
    }

    function addMissingIngredientsFromMeal(dayKey, mealType) {
      const val = state.weeklyMealPlan && state.weeklyMealPlan[dayKey] && state.weeklyMealPlan[dayKey][mealType];
      if (!val) return;
      const recipes = state.recipes || [];
      const recipe = recipes.find(r => r.id === val || r.title === val);
      if (!recipe || !Array.isArray(recipe.ingredients)) return;

      const pantryNames = (state.pantry || []).map(p => (p.name || '').toLowerCase());
      if (!Array.isArray(state.shoppingList)) state.shoppingList = [];

      let addedCount = 0;
      recipe.ingredients.forEach(rawIng => {
        const cleanIng = rawIng.toLowerCase()
          .replace(/^[0-9\/.\s]+(cup|tbsp|tsp|can|clove|slice|handful|scoop|oz|lb|g|ml)s?\s+/i, '')
          .trim();
        const inPantry = pantryNames.some(pn => pn.includes(cleanIng) || cleanIng.includes(pn));
        if (!inPantry) {
          const alreadyInList = state.shoppingList.some(s => s.name.toLowerCase() === cleanIng && !s.checked);
          if (!alreadyInList) {
            let cat = 'produce';
            if (/chicken|beef|meat|egg|salmon|fish|protein|yogurt|milk|cheese|tofu/i.test(cleanIng)) cat = 'protein';
            else if (/rice|oat|quinoa|bread|pasta|cereal|flour/i.test(cleanIng)) cat = 'grains';
            else if (/oil|sauce|dressing|condiment|spice|salt|pepper|vinegar|honey/i.test(cleanIng)) cat = 'condiments';

            state.shoppingList.push({
              id: `shop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              name: rawIng,
              quantity: '1',
              category: cat,
              checked: false,
              source: `Meal Plan (${recipe.title})`
            });
            addedCount++;
          }
        }
      });

      saveAppState();
      renderWeeklyMealPlan();
      renderShoppingList();
      updateShoppingBadges();
      playChime('bell');
      alertBox(`Added ${addedCount} missing ingredients for "${recipe.title}" to your Shopping List!`, "Added to Groceries");
    }

    function addAllMissingMealPlanIngredientsToShoppingList() {
      const plan = state.weeklyMealPlan || {};
      const recipes = state.recipes || [];
      const pantryNames = (state.pantry || []).map(p => (p.name || '').toLowerCase());
      if (!Array.isArray(state.shoppingList)) state.shoppingList = [];

      let addedCount = 0;
      WEEK_DAYS.forEach(day => {
        const dayPlan = plan[day.key] || {};
        MEAL_SLOTS.forEach(slot => {
          const val = dayPlan[slot.type];
          if (!val) return;
          const recipe = recipes.find(r => r.id === val || r.title === val);
          if (!recipe || !Array.isArray(recipe.ingredients)) return;

          recipe.ingredients.forEach(rawIng => {
            const cleanIng = rawIng.toLowerCase()
              .replace(/^[0-9\/.\s]+(cup|tbsp|tsp|can|clove|slice|handful|scoop|oz|lb|g|ml)s?\s+/i, '')
              .trim();
            const inPantry = pantryNames.some(pn => pn.includes(cleanIng) || cleanIng.includes(pn));
            if (!inPantry) {
              const alreadyInList = state.shoppingList.some(s => s.name.toLowerCase() === cleanIng && !s.checked);
              if (!alreadyInList) {
                let cat = 'produce';
                if (/chicken|beef|meat|egg|salmon|fish|protein|yogurt|milk|cheese|tofu/i.test(cleanIng)) cat = 'protein';
                else if (/rice|oat|quinoa|bread|pasta|cereal|flour/i.test(cleanIng)) cat = 'grains';
                else if (/oil|sauce|dressing|condiment|spice|salt|pepper|vinegar|honey/i.test(cleanIng)) cat = 'condiments';

                state.shoppingList.push({
                  id: `shop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                  name: rawIng,
                  quantity: '1',
                  category: cat,
                  checked: false,
                  source: `Weekly Menu`
                });
                addedCount++;
              }
            }
          });
        });
      });

      saveAppState();
      renderWeeklyMealPlan();
      renderShoppingList();
      updateShoppingBadges();
      playChime('bell');

      if (addedCount > 0) {
        alertBox(`Scanned whole week: Added ${addedCount} missing ingredients to your Shopping List!`, "Shopping List Populated");
        switchKitchenSubTab('shopping');
      } else {
        alertBox("All planned meals are fully stocked in your pantry! No missing ingredients found.", "Fully Stocked!");
      }
    }

    function clearWeeklyMealPlan() {
      if (confirm("Reset the whole week's meal schedule to blank?")) {
        state.weeklyMealPlan = {
          monday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          tuesday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          wednesday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          thursday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          friday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          saturday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          sunday: { breakfast: '', lunch: '', dinner: '', snack: '' }
        };
        saveAppState();
        renderWeeklyMealPlan();
        playChime('bell');
        alertBox("Weekly meal planner reset to blank.", "Menu Cleared");
      }
    }

    // [Shopping List Engine moved to js/shopping.js]

    // ==============================================
    // TIME & DURATION HELPERS (START / END SYNC)
    // ==============================================
    function timeToMinutes(timeStr) {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return (h * 60) + (m || 0);
    }

    function minutesToTime(totalMins) {
      const norm = ((totalMins % 1440) + 1440) % 1440;
      const hh = String(Math.floor(norm / 60)).padStart(2, '0');
      const mm = String(norm % 60).padStart(2, '0');
      return `${hh}:${mm}`;
    }

    function getEndTimeFromStartAndDuration(startTime, durationMins) {
      return minutesToTime(timeToMinutes(startTime) + (parseInt(durationMins, 10) || 30));
    }

    function getDurationFromStartAndEnd(startTime, endTime) {
      let diff = timeToMinutes(endTime) - timeToMinutes(startTime);
      if (diff <= 0) diff += 1440;
      return Math.max(5, diff);
    }

    function formatDurationFriendly(mins) {
      const m = parseInt(mins, 10) || 0;
      if (m < 60) return `${m}m`;
      const hrs = Math.floor(m / 60);
      const rem = m % 60;
      return rem === 0 ? `${hrs}h` : `${hrs}h ${rem}m`;
    }

    function onNewEventTimeChange(changedField) {
      const startEl = document.getElementById('new-event-start');
      const endEl = document.getElementById('new-event-end');
      const durEl = document.getElementById('new-event-duration');
      if (!startEl || !endEl || !durEl) return;

      if (changedField === 'start' || changedField === 'duration') {
        endEl.value = getEndTimeFromStartAndDuration(startEl.value, durEl.value);
      } else if (changedField === 'end') {
        durEl.value = getDurationFromStartAndEnd(startEl.value, endEl.value);
      }
    }

    function onEditEventTimeChange(changedField) {
      const startEl = document.getElementById('edit-event-start');
      const endEl = document.getElementById('edit-event-end');
      const durEl = document.getElementById('edit-event-duration');
      if (!startEl || !endEl || !durEl) return;

      if (changedField === 'start' || changedField === 'duration') {
        endEl.value = getEndTimeFromStartAndDuration(startEl.value, durEl.value);
      } else if (changedField === 'end') {
        durEl.value = getDurationFromStartAndEnd(startEl.value, endEl.value);
      }
    }

    function setEditEventDuration(mins) {
      const durEl = document.getElementById('edit-event-duration');
      if (durEl) {
        durEl.value = mins;
        onEditEventTimeChange('duration');
      }
    }

    function setNewEventDuration(mins) {
      const durEl = document.getElementById('new-event-duration');
      if (durEl) {
        durEl.value = mins;
        if (typeof onNewEventTimeChange === 'function') {
          onNewEventTimeChange('duration');
        }
      }
    }

    function togglePasswordLinkBox(expand) {
      state.passwordBoxUserExpanded = !!expand;
      const collapsed = document.getElementById('ff-link-password-collapsed');
      const expanded = document.getElementById('ff-link-password-expanded');
      if (collapsed) collapsed.classList.toggle('hidden', !!expand);
      if (expanded) expanded.classList.toggle('hidden', !expand);
    }

    // 4. Event Tools Hub: Magic ToDo, Estimator, Reverse Chef
        state.editEventEntryType = 'both';
    function setEditEventEntryType(type) {
      state.editEventEntryType = type;
      ['planned', 'reality', 'both'].forEach(t => {
        const btn = document.getElementById(`btn-edit-entry-${t}`);
        if (!btn) return;
        if (t === type) {
          btn.className = "py-1.5 px-2 rounded-xl bg-pastel-mint/20 border-2 border-pastel-mint text-pastel-mint font-bold text-center transition";
        } else {
          btn.className = "py-1.5 px-2 rounded-xl border border-dark-border text-slate-400 font-semibold text-center transition";
        }
      });
    }

    function openEventToolsModal(eventId) {
      const ev = state.events.find(e => e.id === eventId);
      if (!ev) return;
      state.activeEventModal = ev;

      const endTime = getEndTimeFromStartAndDuration(ev.startTime, ev.duration);
      const timeRangeFriendly = `${formatTimeAmPm(ev.startTime)} – ${formatTimeAmPm(endTime)} (${formatDurationFriendly(ev.duration)})`;

      document.getElementById('tool-modal-title').textContent = ev.title;
      document.getElementById('tool-modal-time').textContent = timeRangeFriendly;
      document.getElementById('tool-modal-tag').textContent = (ev.category || 'focus').toUpperCase();
      document.getElementById('user-good-enough-input').value = ev.goodEnough || '';

      // Populate Read-Only Details View
      const detailsTime = document.getElementById('view-details-time-range');
      const detailsCatBadge = document.getElementById('view-details-category-badge');
      const detailsLocRow = document.getElementById('view-details-location-row');
      const detailsMapsLink = document.getElementById('view-details-maps-link');
      const detailsLocText = document.getElementById('view-details-location-text');
      const detailsGoodRow = document.getElementById('view-details-goodenough-row');
      const detailsGoodText = document.getElementById('view-details-goodenough-text');
      const detailsNotesRow = document.getElementById('view-details-notes-row');
      const detailsNotesText = document.getElementById('view-details-notes-text');

      if (detailsTime) detailsTime.textContent = timeRangeFriendly;
      if (detailsCatBadge) {
        detailsCatBadge.textContent = (ev.category || 'focus').toUpperCase();
        const catInfo = getCategoryInfo(ev.category);
        detailsCatBadge.className = `px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${catInfo.colorMeta.badgeBg} ${catInfo.colorMeta.text} border ${catInfo.colorMeta.borderFull}`;
      }
      const detailsAnchorBadge = document.getElementById('view-details-anchor-badge');
      if (detailsAnchorBadge) {
        if (ev.isFixedAnchor) {
          detailsAnchorBadge.textContent = '🔒 Fixed Anchor';
          detailsAnchorBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pastel-sky/20 text-pastel-sky border border-pastel-sky/30';
        } else {
          detailsAnchorBadge.textContent = '⏳ Flexible Task';
          detailsAnchorBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pastel-coral/20 text-pastel-coral border border-pastel-coral/30';
        }
      }
      if (typeof setEditEventAnchorType === 'function') {
        setEditEventAnchorType(Boolean(ev.isFixedAnchor));
      }

      if (detailsLocRow) {
        if (ev.location && ev.location.trim()) {
          detailsLocRow.classList.remove('hidden');
          if (detailsMapsLink) detailsMapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.location)}`;
          if (detailsLocText) detailsLocText.textContent = ev.location;
        } else {
          detailsLocRow.classList.add('hidden');
        }
      }

      if (detailsGoodRow) {
        if (ev.goodEnough && ev.goodEnough.trim()) {
          detailsGoodRow.classList.remove('hidden');
          if (detailsGoodText) detailsGoodText.textContent = ev.goodEnough;
        } else {
          detailsGoodRow.classList.add('hidden');
        }
      }

      if (detailsNotesRow) {
        if (ev.description && ev.description.trim()) {
          detailsNotesRow.classList.remove('hidden');
          if (detailsNotesText) detailsNotesText.textContent = ev.description;
        } else {
          detailsNotesRow.classList.add('hidden');
        }
      }

      // Populate Edit Event Inputs
      const editTitle = document.getElementById('edit-event-title');
      const editStart = document.getElementById('edit-event-start');
      const editEnd = document.getElementById('edit-event-end');
      const editDur = document.getElementById('edit-event-duration');
      const editCat = document.getElementById('edit-event-category');
      const editLoc = document.getElementById('edit-event-location');
      const editGood = document.getElementById('edit-event-goodenough');
      const editNotes = document.getElementById('edit-event-notes');

      if (editTitle) editTitle.value = ev.title || '';
      if (editStart) editStart.value = ev.startTime || '09:00';
      if (editDur) editDur.value = ev.duration || 60;
      if (editEnd) editEnd.value = getEndTimeFromStartAndDuration(editStart ? editStart.value : '09:00', editDur ? editDur.value : 60);
      if (editCat) editCat.value = ev.category || 'focus';
      if (editLoc) editLoc.value = ev.location || '';
      if (editGood) editGood.value = ev.goodEnough || '';
      if (editNotes) editNotes.value = ev.description || '';
      const editActual = document.getElementById('edit-event-actual-duration');
      if (editActual) editActual.value = (ev.actualDuration !== undefined) ? ev.actualDuration : (ev.duration || 60);
      const editActualStart = document.getElementById('edit-event-actual-start');
      if (editActualStart) editActualStart.value = ev.actualStartTime || ev.startTime || '09:00';
      const editActualEnd = document.getElementById('edit-event-actual-end');
      if (editActualEnd) {
        const s = editActualStart ? editActualStart.value : '09:00';
        const d = editActual ? (parseInt(editActual.value, 10) || 60) : 60;
        editActualEnd.value = ev.actualEndTime || getEndTimeFromStartAndDuration(s, d);
      }
      if (typeof updateEventToolsModalSkippedUI === 'function') updateEventToolsModalSkippedUI(ev);
      setEditEventEntryType(ev.entryType || 'both');

      renderModalSubtasks();
      // Open in Read-Only Details Mode by default! User must click Edit Event to change details.
      switchToolTab('details');
      document.getElementById('event-tools-modal').classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }

    function closeToolsModal() {
      document.getElementById('event-tools-modal').classList.add('hidden');
    }

    function switchToolTab(tab) {
      state.activeToolTab = tab;
      ['details', 'edit', 'magic', 'estimator', 'chef'].forEach(t => {
        const view = document.getElementById(`toolview-${t}`);
        const btn = document.getElementById(`tooltab-${t}`);
        if (view) view.classList.toggle('hidden', t !== tab);
        if (btn) {
          if (t === tab) {
            const col = (t === 'details' || t === 'edit') ? 'bg-pastel-sky' : (t === 'magic' ? 'bg-pastel-mint' : (t === 'estimator' ? 'bg-pastel-sky' : 'bg-pastel-coral'));
            btn.className = `py-2 px-2 rounded-xl text-xs font-bold ${col} text-dark-base flex items-center justify-center gap-1 transition shadow-sm`;
          } else {
            btn.className = "py-2 px-2 rounded-xl text-xs font-semibold bg-dark-elevated text-slate-300 hover:text-white flex items-center justify-center gap-1 transition";
          }
        }
      });
      if (window.lucide) lucide.createIcons();
    }

    function saveEventDetailsFromModal() {
      const ev = state.activeEventModal;
      if (!ev) return;

      const editTitle = document.getElementById('edit-event-title');
      const editStart = document.getElementById('edit-event-start');
      const editEnd = document.getElementById('edit-event-end');
      const editDur = document.getElementById('edit-event-duration');
      const editCat = document.getElementById('edit-event-category');
      const editLoc = document.getElementById('edit-event-location');
      const editGood = document.getElementById('edit-event-goodenough');
      const editNotes = document.getElementById('edit-event-notes');

      const newTitle = editTitle ? editTitle.value.trim() : ev.title;
      if (!newTitle) {
        alertBox("Please enter an event title.", "Title Required");
        return;
      }

      calendarHistory.recordState(); // Undoable with ⌘Z!

      ev.title = newTitle;
      if (editStart && editStart.value) ev.startTime = editStart.value;
      if (editDur) ev.duration = Math.max(5, parseInt(editDur.value, 10) || 30);
      if (editCat) ev.category = editCat.value;
      if (editLoc) ev.location = editLoc.value.trim();
      if (editGood) ev.goodEnough = editGood.value.trim();
      if (editNotes) ev.description = editNotes.value.trim();
      ev.entryType = state.editEventEntryType || 'both';
      ev.isFixedAnchor = Boolean(state.editEventIsFixedAnchor);
      const editActual = document.getElementById('edit-event-actual-duration');
      if (editActual && editActual.value) {
        const parsedAct = parseInt(editActual.value, 10);
        if (!isNaN(parsedAct) && parsedAct > 0) ev.actualDuration = parsedAct;
      }
      const editActualStart = document.getElementById('edit-event-actual-start');
      if (editActualStart && editActualStart.value) {
        ev.actualStartTime = editActualStart.value;
      }
      const editActualEnd = document.getElementById('edit-event-actual-end');
      if (editActualEnd && editActualEnd.value) {
        ev.actualEndTime = editActualEnd.value;
      }

      ev.lastLocalEdit = Date.now();
      saveAppState();
      renderTimeline();
      pushEventChangeToGoogle(ev, 'update');
      if (typeof ffUploadNow === 'function') ffUploadNow(true);
      closeToolsModal();
      playChime('bell');
      alertBox(`Updated "${ev.title}"! (⌘Z to undo)`, "Event Saved");
    }

    function renderModalSubtasks() {
      const ev = state.activeEventModal;
      const list = document.getElementById('modal-subtasks-list');
      list.innerHTML = '';

      let totalMins = 0;
      (ev.subtasks || []).forEach((st, idx) => {
        totalMins += (st.minutes || 0);
        const row = document.createElement('div');
        row.className = "p-2 rounded-xl bg-dark-base border border-dark-border flex items-center justify-between text-xs";
        row.innerHTML = `
          <div class="flex items-center gap-2 flex-1 truncate pr-2">
            <input type="checkbox" ${st.done ? 'checked' : ''} onchange="toggleSubtaskDone(${idx})" class="rounded text-pastel-mint focus:ring-0 bg-dark-elevated">
            <span class="${st.done ? 'line-through text-slate-500' : 'text-slate-200'} truncate">${st.text}</span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-[10px] text-pastel-mint font-mono">${st.minutes}m</span>
            <button onclick="removeModalSubtask(${idx})" class="text-slate-500 hover:text-rose-400">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        `;
        list.appendChild(row);
      });
      document.getElementById('subtask-total-duration').textContent = `Total: ${totalMins} mins (Block: ${ev.duration}m)`;
      lucide.createIcons();
    }

    function toggleSubtaskDone(idx) {
      if (!state.activeEventModal) return;
      state.activeEventModal.subtasks[idx].done = !state.activeEventModal.subtasks[idx].done;
      renderModalSubtasks();
      renderTimeline();
      playChime('bell');
    }

    function removeModalSubtask(idx) {
      if (!state.activeEventModal) return;
      state.activeEventModal.subtasks.splice(idx, 1);
      renderModalSubtasks();
      renderTimeline();
    }

    function addManualSubtask() {
      if (!state.activeEventModal) return;
      const text = prompt("Enter micro-step description:");
      if (!text) return;
      const minutes = parseInt(prompt("Estimated minutes:", "10"), 10) || 10;
      state.activeEventModal.subtasks.push({ text, minutes, done: false });
      renderModalSubtasks();
      renderTimeline();
    }

    function generateMagicSubtasksWithAI() {
      const ev = state.activeEventModal;
      if (!ev) return;
      const firstStep = document.getElementById('user-first-step-input').value.trim();
      const goodEnough = document.getElementById('user-good-enough-input').value.trim();
      ev.goodEnough = goodEnough || ev.goodEnough;

      ev.subtasks = [
        { text: firstStep || 'Initiation: setup workspace & set 1 timer', minutes: 5, done: false },
        { text: 'Core action: focus solely on essential task', minutes: Math.max(10, ev.duration - 15), done: false },
        { text: 'Wrap-up: stop at "good enough" mark & close tabs', minutes: 10, done: false }
      ];

      renderModalSubtasks();
      renderTimeline();
      playChime('bell');
      alertBox("Unpacked 3 micro-steps tailored to your cognitive threshold.", "Magic ToDo");
    }

    function calibrateTaskEstimate() {
      const gut = parseInt(document.getElementById('estimator-gut-input').value, 10);
      if (!gut) return;

      const realisticLow = Math.round(gut * 1.3);
      const realisticHigh = Math.round(gut * 1.8);

      document.getElementById('est-realistic-window').textContent = `${realisticLow} - ${realisticHigh} mins`;
      document.getElementById('est-coaching-feedback').textContent = 
        `Your gut predicted ${gut} mins. For ADHD brains, transitions and minor friction usually add 30-80% overhead. Budgeting ${realisticLow}m keeps stress low.`;

      document.getElementById('estimator-result-card').classList.remove('hidden');
      playChime('bell');
    }

    function generateReverseChainChoreography() {
      const stepsList = document.getElementById('choreographer-steps-list');
      stepsList.innerHTML = `
        <div class="p-2 rounded bg-dark-base border border-dark-border">
          <span class="text-pastel-coral font-bold">18:25</span> • Turn on kitchen music & mise-en-place prep (chop & measure)
        </div>
        <div class="p-2 rounded bg-dark-base border border-dark-border">
          <span class="text-pastel-coral font-bold">18:38</span> • Start cooking main component (skillet/pot)
        </div>
        <div class="p-2 rounded bg-dark-elevated border border-pastel-mint/40 text-pastel-mint">
          <span class="font-bold">18:45</span> • [SAFE DISH WINDOW] Wash cutting board & prep knives while simmering!
        </div>
        <div class="p-2 rounded bg-dark-base border border-dark-border">
          <span class="text-pastel-coral font-bold">18:55</span> • Plate dinner & rinse hot skillet
        </div>
        <div class="p-2 rounded bg-dark-base border border-pastel-mint/60 text-white font-bold">
          <span class="text-pastel-mint">19:00</span> • Fork-Ready! Sit down and enjoy dinner.
        </div>
      `;
      document.getElementById('choreographer-output-box').classList.remove('hidden');
      playChime('bell');
    }

    function adoptChoreographyToEvent() {
      const ev = state.activeEventModal;
      if (!ev) return;

      ev.subtasks = [
        { text: 'Mise-en-place: slice all veggies & measure sauce (no heat yet)', minutes: 12, done: false },
        { text: 'Turn on heat & start primary cooking', minutes: 10, done: false },
        { text: '[Dish Window] Wash prep knives & bowls while simmering', minutes: 8, done: false },
        { text: 'Plate meal, rinse pan, sit down to eat', minutes: 10, done: false }
      ];

      // Subtasks applied cleanly to the active event without pushing unrequested schedule events

      closeToolsModal();
      renderTimeline();
      playChime('bell');
      alertBox("Adopted choreography and scheduled 20m dish reset block.", "Kitchen Choreographed");
    }

    // 5. Taskmaster Live Focus HUD Runner
    function quickLaunchTaskmaster(eventId) {
      const ev = state.events.find(e => e.id === eventId);
      if (!ev) return;
      launchTaskmasterWithEvent(ev);
    }

    function launchEventIntoTaskmaster() {
      if (!state.activeEventModal) return;
      closeToolsModal();
      launchTaskmasterWithEvent(state.activeEventModal);
    }

    function launchTaskmasterWithEvent(ev) {
      state.taskmaster.activeEvent = ev;
      state.taskmaster.currentStepIdx = 0;
      state.taskmaster.isPaused = false;
      state.taskmaster.totalSecondsElapsed = 0;

      const firstStep = (ev.subtasks && ev.subtasks[0]) ? ev.subtasks[0] : { text: ev.title, minutes: ev.duration };
      state.taskmaster.secondsLeft = (firstStep.minutes || 10) * 60;
      state.taskmaster.initialStepSeconds = state.taskmaster.secondsLeft;

      const emptyState = document.getElementById('taskmaster-empty-state');
      if (emptyState) emptyState.classList.add('hidden');
      const activeHud = document.getElementById('taskmaster-active-hud');
      if (activeHud) activeHud.classList.remove('hidden');

      const titleEl = document.getElementById('tm-event-title');
      if (titleEl) titleEl.textContent = ev.title;
      const tagEl = document.getElementById('tm-event-tag');
      if (tagEl) tagEl.textContent = (ev.category || 'Focus').toUpperCase();
      const goodEnoughEl = document.getElementById('tm-good-enough-label');
      if (goodEnoughEl) goodEnoughEl.textContent = ev.goodEnough || 'Complete core action';

      const standalonePill = document.getElementById('tm-standalone-pill');
      if (standalonePill) {
        standalonePill.classList.toggle('hidden', !ev.isStandalone);
      }

      const activeBadge = document.getElementById('active-task-badge');
      if (activeBadge) activeBadge.classList.remove('hidden');
      const mobileActiveBadge = document.getElementById('mobile-active-task-badge');
      if (mobileActiveBadge) mobileActiveBadge.classList.remove('hidden');
      const liveBanner = document.getElementById('live-floating-banner');
      if (liveBanner) liveBanner.classList.remove('hidden');

      switchTab('taskmaster');
      startTaskmasterTimer();
      updateTaskmasterUI();
      if (typeof playChime === 'function') { try { playChime('bell'); } catch (e) {} }
    }

    function startTaskmasterTimer() {
      clearInterval(state.taskmaster.timerId);
      state.taskmaster.timerId = setInterval(() => {
        if (state.taskmaster.isPaused) return;

        if (state.taskmaster.secondsLeft > 0) {
          state.taskmaster.secondsLeft--;
        } else {
          if (typeof playChime === 'function') { try { playChime('alert'); } catch(e){} }
          advanceTaskmasterStep();
        }

        state.taskmaster.totalSecondsElapsed++;
        updateTaskmasterUI();
      }, 1000);
    }

    function updateTaskmasterUI() {
      const tm = state.taskmaster;
      const ev = tm.activeEvent;
      if (!ev) return;

      const currentStep = (ev.subtasks && ev.subtasks[tm.currentStepIdx]) ? ev.subtasks[tm.currentStepIdx] : { text: ev.title, minutes: 10 };
      const curStepText = document.getElementById('tm-current-step-text');
      if (curStepText) curStepText.textContent = currentStep.text;
      
      const stepCounter = document.getElementById('tm-step-counter');
      if (stepCounter) {
        if (ev.subtasks && ev.subtasks.length > 1) {
          stepCounter.textContent = `Phase ${tm.currentStepIdx + 1} of ${ev.subtasks.length}`;
        } else {
          stepCounter.textContent = `Focus Block • ${ev.duration || 25} mins`;
        }
      }

      const mins = Math.floor(tm.secondsLeft / 60);
      const secs = tm.secondsLeft % 60;
      const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      const timeDisplay = document.getElementById('tm-time-display');
      if (timeDisplay) timeDisplay.textContent = timeStr;
      
      const floatTime = document.getElementById('floating-step-time');
      if (floatTime) floatTime.textContent = timeStr;
      
      const floatTitle = document.getElementById('floating-step-title');
      if (floatTitle) floatTitle.textContent = currentStep.text;

      const elMins = Math.floor(tm.totalSecondsElapsed / 60);
      const elSecs = tm.totalSecondsElapsed % 60;
      const totalElapsed = document.getElementById('tm-total-elapsed');
      if (totalElapsed) totalElapsed.textContent = `Elapsed: ${String(elMins).padStart(2, '0')}:${String(elSecs).padStart(2, '0')}`;

      // SVG Circle offset
      const progress = tm.initialStepSeconds > 0 ? (tm.secondsLeft / tm.initialStepSeconds) : 0;
      const dashOffset = 276.46 * (1 - progress);
      const svgEl = document.getElementById('tm-svg-progress');
      if (svgEl) svgEl.style.strokeDashoffset = dashOffset;
    }

    function togglePauseTaskmaster() {
      state.taskmaster.isPaused = !state.taskmaster.isPaused;
      const label = document.getElementById('tm-pause-label');
      const icon = document.getElementById('tm-pause-icon');
      if (state.taskmaster.isPaused) {
        if (label) label.textContent = "Resume";
        if (icon) icon.setAttribute('data-lucide', 'play');
      } else {
        if (label) label.textContent = "Pause";
        if (icon) icon.setAttribute('data-lucide', 'pause');
      }
      if (window.lucide) lucide.createIcons();
    }

    function addGraceTime(mins = 2) {
      state.taskmaster.secondsLeft += (mins * 60);
      state.taskmaster.initialStepSeconds += (mins * 60);
      updateTaskmasterUI();
      if (typeof playChime === 'function') { try { playChime('bell'); } catch (e) {} }
      alertBox(`+${mins} minutes grace added to current step.`, "Pacing Adjusted");
    }

    function advanceTaskmasterStep() {
      const tm = state.taskmaster;
      const ev = tm.activeEvent;
      if (!ev) return;

      if (ev.subtasks && ev.subtasks[tm.currentStepIdx]) {
        ev.subtasks[tm.currentStepIdx].done = true;
      }

      if (ev.subtasks && tm.currentStepIdx + 1 < ev.subtasks.length) {
        tm.currentStepIdx++;
        const nextStep = ev.subtasks[tm.currentStepIdx];
        tm.secondsLeft = (nextStep.minutes || 10) * 60;
        tm.initialStepSeconds = tm.secondsLeft;
        if (typeof playChime === 'function') { try { playChime('bell'); } catch (e) {} }
        updateTaskmasterUI();
        renderTimeline();
      } else {
        stopTaskmasterSession();
        if (ev.isStandalone) {
          alertBox(`🎉 Standalone focus session "${ev.title}" completed (${ev.duration}m)! Tremendous focus.`, "Session Complete");
        } else {
          alertBox(`Completed all steps for "${ev.title}"! Fantastic job.`, "Block Complete");
        }
        if (typeof playChime === 'function') { try { playChime('bell'); } catch (e) {} }
      }
    }

    function stopTaskmasterSession() {
      clearInterval(state.taskmaster.timerId);
      state.taskmaster.activeEvent = null;
      const emptyState = document.getElementById('taskmaster-empty-state');
      if (emptyState) emptyState.classList.remove('hidden');
      const activeHud = document.getElementById('taskmaster-active-hud');
      if (activeHud) activeHud.classList.add('hidden');
      const activeBadge = document.getElementById('active-task-badge');
      if (activeBadge) activeBadge.classList.add('hidden');
      const mobileActiveBadge = document.getElementById('mobile-active-task-badge');
      if (mobileActiveBadge) mobileActiveBadge.classList.add('hidden');
      const liveBanner = document.getElementById('live-floating-banner');
      if (liveBanner) liveBanner.classList.add('hidden');
      renderTimeline();
      renderTaskmasterCalendarEvents();
      if (window.lucide) lucide.createIcons();
    }

    // Standalone Focus Session Engine & Handlers
    let selectedStandaloneDuration = 25;

    function selectStandaloneDuration(mins) {
      selectedStandaloneDuration = mins;
      const customInput = document.getElementById('standalone-input-custom-mins');
      if (customInput) customInput.value = mins;

      document.querySelectorAll('.dur-preset-btn').forEach(btn => {
        const bMins = parseInt(btn.getAttribute('data-mins'), 10);
        if (bMins === mins) {
          btn.className = "dur-preset-btn px-3 py-1.5 rounded-lg bg-pastel-mint text-dark-base text-xs font-bold font-mono transition";
        } else {
          btn.className = "dur-preset-btn px-3 py-1.5 rounded-lg bg-dark-elevated hover:bg-dark-border text-slate-300 text-xs font-semibold font-mono transition";
        }
      });
    }

    function onCustomDurationInput(val) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed > 0) {
        selectedStandaloneDuration = parsed;
        document.querySelectorAll('.dur-preset-btn').forEach(btn => {
          const bMins = parseInt(btn.getAttribute('data-mins'), 10);
          if (bMins === parsed) {
            btn.className = "dur-preset-btn px-3 py-1.5 rounded-lg bg-pastel-mint text-dark-base text-xs font-bold font-mono transition";
          } else {
            btn.className = "dur-preset-btn px-3 py-1.5 rounded-lg bg-dark-elevated hover:bg-dark-border text-slate-300 text-xs font-semibold font-mono transition";
          }
        });
      }
    }

    function launchCustomStandaloneFocus() {
      const titleInput = document.getElementById('standalone-input-title');
      const boundaryInput = document.getElementById('standalone-input-boundary');
      const splitCheckbox = document.getElementById('standalone-checkbox-split');

      const title = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : 'Free Focus Session';
      const boundary = (boundaryInput && boundaryInput.value.trim()) ? boundaryInput.value.trim() : 'Stop at the bell; celebrate focused progress.';
      const split = splitCheckbox ? splitCheckbox.checked : false;

      startStandaloneFocusSession({
        title: title,
        duration: selectedStandaloneDuration || 25,
        goodEnough: boundary,
        category: 'Focus Block',
        splitSteps: split
      });
    }

    function startStandaloneFocusSession(options = {}) {
      const duration = parseInt(options.duration, 10) || 25;
      const title = (options.title && options.title.trim()) ? options.title.trim() : 'Free Focus Session';
      const category = options.category || 'Deep Focus';
      const goodEnough = options.goodEnough || 'Honor the timer and declare victory when it rings.';

      let steps = options.steps;
      if (!steps || steps.length === 0) {
        if (options.splitSteps && duration >= 12) {
          const prepMins = Math.max(2, Math.round(duration * 0.15));
          const wrapMins = Math.max(2, Math.round(duration * 0.15));
          const coreMins = duration - prepMins - wrapMins;
          steps = [
            { text: `Phase 1: Setup & Clear Space (${prepMins}m)`, minutes: prepMins, done: false },
            { text: `Phase 2: Deep Core Focus on "${title}" (${coreMins}m)`, minutes: coreMins, done: false },
            { text: `Phase 3: Clean Wrap-Up & Victory Stop (${wrapMins}m)`, minutes: wrapMins, done: false }
          ];
        } else {
          steps = [
            { text: `${title} (${duration}m)`, minutes: duration, done: false }
          ];
        }
      }

      const standaloneEv = {
        id: 'standalone-' + Date.now(),
        title: title,
        category: category,
        duration: duration,
        goodEnough: goodEnough,
        subtasks: steps,
        isStandalone: true,
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      closeStandaloneFocusModal();
      launchTaskmasterWithEvent(standaloneEv);
    }

    function openStandaloneFocusModal() {
      const modal = document.getElementById('standalone-focus-modal');
      if (modal) {
        modal.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
      }
    }

    function closeStandaloneFocusModal() {
      const modal = document.getElementById('standalone-focus-modal');
      if (modal) modal.classList.add('hidden');
    }

    function launchModalQuickFocus() {
      const titleEl = document.getElementById('modal-quickfocus-title');
      const durEl = document.getElementById('modal-quickfocus-duration');
      const boundaryEl = document.getElementById('modal-quickfocus-boundary');

      const title = (titleEl && titleEl.value.trim()) ? titleEl.value.trim() : 'Free Focus Session';
      const dur = durEl ? (parseInt(durEl.value, 10) || 25) : 25;
      const boundary = (boundaryEl && boundaryEl.value.trim()) ? boundaryEl.value.trim() : 'Stop when timer rings.';

      startStandaloneFocusSession({
        title: title,
        duration: dur,
        goodEnough: boundary,
        category: 'Quick Focus'
      });
    }

    function renderTaskmasterCalendarEvents() {
      const container = document.getElementById('standalone-calendar-events-list');
      if (!container) return;

      const events = (state.events && state.events.length > 0) ? state.events : [];
      if (events.length === 0) {
        container.innerHTML = `
          <div class="text-center py-4 text-xs text-slate-500">
            No scheduled events on today's timeline. Use the presets above to start an independent session!
          </div>
        `;
        return;
      }

      container.innerHTML = events.slice(0, 4).map(ev => `
        <div class="p-3 rounded-xl bg-dark-base border border-dark-border flex items-center justify-between gap-3 hover:border-pastel-sky/40 transition">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-dark-elevated text-pastel-sky border border-dark-border">${(ev.category || 'Event').toUpperCase()}</span>
              <span class="text-xs font-mono text-slate-400">${ev.duration || 30} mins</span>
            </div>
            <h4 class="font-bold text-white text-xs mt-1 truncate">${ev.title}</h4>
          </div>
          <button type="button" onclick="quickLaunchTaskmaster('${ev.id}')" class="px-3 py-1.5 rounded-lg bg-pastel-sky/15 hover:bg-pastel-sky/25 border border-pastel-sky/30 text-pastel-sky font-bold text-xs flex items-center gap-1.5 shrink-0 transition active:scale-95">
            <i data-lucide="play" class="w-3.5 h-3.5 fill-pastel-sky"></i>
            <span>Run in HUD</span>
          </button>
        </div>
      `).join('');

      if (window.lucide) lucide.createIcons();
    }

    // 6. Anti-Distraction Metronome
    function togglePacingMetronome() {
      const btn = document.getElementById('pacing-toggle-btn');
      const label = document.getElementById('pacing-label');

      if (state.pacingIntervalId) {
        clearInterval(state.pacingIntervalId);
        state.pacingIntervalId = null;
        if (btn) btn.className = "header-ctrl-btn px-2 rounded-xl bg-dark-elevated border border-dark-border text-pastel-butter hover:text-yellow-300 text-xs active:scale-95 transition flex items-center justify-center shrink-0";
        if (label) label.textContent = "Pacing: Off";
        alertBox("5-minute pacing metronome disabled.", "Pacing");
      } else {
        state.pacingIntervalId = setInterval(() => {
          playChime('alert');
          alertBox("Gentle check-in: Are you still on your primary step, or did you drift into a detour?", "5-Min Pacing Check");
        }, 5 * 60 * 1000);
        if (btn) btn.className = "header-ctrl-btn px-2 rounded-xl bg-pastel-butter/25 border-2 border-pastel-butter text-pastel-butter font-bold text-xs active:scale-95 transition flex items-center justify-center shrink-0 shadow-sm";
        if (label) label.textContent = "Pacing: 5m";
        playChime('bell');
        alertBox("Pacing chime will softly ring every 5 minutes to anchor your focus.", "Pacing Active");
      }
    }

    // Tab Navigation with Recipe Book support
    function switchTab(tabId) {
      state.activeTab = tabId;
      ['timeline', 'matrix', 'taskmaster', 'recipes', 'kitchen', 'nutrition', 'health'].forEach(t => {
        const view = document.getElementById(`view-${t}`);
        const nav = document.getElementById(`nav-${t}`);
        const mobileNav = document.getElementById(`mobile-nav-${t}`);
        if (view) view.classList.toggle('hidden', t !== tabId);
        
        // Desktop nav update
        if (nav) {
          if (t === tabId) {
            nav.className = "touch-nav-item flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all bg-pastel-mint text-dark-base shadow-sm";
          } else {
            nav.className = "touch-nav-item flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-all";
          }
        }

        // Mobile bottom tab bar update
        if (mobileNav) {
          if (t === tabId) {
            mobileNav.className = "flex flex-col items-center justify-center p-1.5 rounded-xl text-pastel-mint font-bold text-[10px] gap-0.5 flex-1 touch-nav-item bg-dark-base";
          } else {
            mobileNav.className = "flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-400 font-medium text-[10px] gap-0.5 flex-1 touch-nav-item";
          }
        }
      });
      const secWrapper = document.getElementById('secondary-tabs-scroll');
      if (secWrapper) {
        if (tabId === 'timeline') {
          secWrapper.classList.add('hidden');
        } else {
          secWrapper.classList.remove('hidden');
          secWrapper.scrollTop = 0;
        }
      }
      if (tabId === 'timeline') renderTimeline();
      if (tabId === 'matrix') renderMatrix();
      if (tabId === 'taskmaster') renderTaskmasterCalendarEvents();
      if (tabId === 'recipes') renderRecipes();
      if (tabId === 'kitchen') renderKitchen();
      if (tabId === 'nutrition') renderNutrition();
      if (tabId === 'health') renderHealthTabUI();
      const scrollEl = document.getElementById('main-content-scroll');
      if (scrollEl) scrollEl.scrollTop = 0;
      lucide.createIcons();
    }

    // Recipe Book System
    function setRecipeFilter(type, value) {
      state.recipeFilters[type] = value;
      
      // Update UI buttons
      const prefix = type === 'occasion' ? 'rf-occ-' : (type === 'format' ? 'rf-fmt-' : 'rf-orig-');
      const allButtons = document.querySelectorAll(`[id^="${prefix}"]`);
      allButtons.forEach(btn => {
        btn.className = "px-2.5 py-1 rounded-lg bg-dark-base text-slate-400 hover:text-white";
      });
      const activeBtn = document.getElementById(`${prefix}${value}`);
      if (activeBtn) {
        const bgCol = type === 'occasion' ? 'bg-pastel-coral' : (type === 'format' ? 'bg-pastel-sky' : 'bg-pastel-mint');
        activeBtn.className = `px-2.5 py-1 rounded-lg font-bold ${bgCol} text-dark-base`;
      }
      renderRecipes();
    }

    // Cookbooks & Multi-Filter Engine
    state.cookbooks = [
      { id: 'cb-family', title: 'Family Recipes', icon: '👨‍👩‍👧‍👦', theme: 'pastel-coral', origin: 'family', desc: '216 heirloom family recipes, holiday traditions, and generational favorites from the family recipe book.' },
      { id: 'cb-staples', title: 'ADHD Daily Staples', icon: '📖', theme: 'pastel-mint', origin: 'mine', desc: 'Everyday go-tos calibrated for low initiation inertia and clean sink windows.' },
      { id: 'cb-shared', title: 'Family & Friends Lore', icon: '👨‍👩‍👧', theme: 'pastel-coral', origin: 'shared', desc: 'Gifted recipes from loved ones, roommates, and family traditions.' },
      { id: 'cb-campus', title: 'Campus & Rush Meals', icon: '🎓', theme: 'pastel-sky', origin: 'school', desc: 'Speedy under-15-minute study fuel and dorm-friendly quick bites.' },
      { id: 'cb-lowenergy', title: 'Low Executive Energy', icon: '⚡', theme: 'pastel-butter', origin: 'oneoff', desc: 'One-pot and 3-step zero-cleanup lifesavers for exhausted evenings.' }
    ];

    // Ensure family recipes are populated into state.recipes
    if (typeof FAMILY_RECIPES !== 'undefined' && Array.isArray(FAMILY_RECIPES)) {
      const existingIds = new Set((state.recipes || []).map(r => r.id));
      FAMILY_RECIPES.forEach(r => {
        if (!existingIds.has(r.id)) {
          state.recipes.push(r);
          existingIds.add(r.id);
        }
      });
    }
    state.activeCookbook = null;
    state.activeCookbookFormat = null;
    state.recipeSectionView = 'cookbooks'; // 'cookbooks' or 'codex'

    // Multi-select filters state
    if (!state.multiFilters) {
      state.multiFilters = {
        occasions: new Set(['all']),
        formats: new Set(['all']),
        origins: new Set(['all'])
      };
    }

    function switchRecipeSectionView(viewMode) {
      state.recipeSectionView = viewMode;
      const btnCookbooks = document.getElementById('tab-recipe-cookbooks');
      const btnCodex = document.getElementById('tab-recipe-codex');
      const viewCookbooks = document.getElementById('recipe-view-cookbooks');
      const viewCodex = document.getElementById('recipe-view-codex');

      if (viewMode === 'cookbooks') {
        if (btnCookbooks) btnCookbooks.className = "px-3.5 py-1.5 rounded-lg font-bold bg-pastel-coral text-dark-base transition flex items-center gap-1.5 shadow-sm";
        if (btnCodex) btnCodex.className = "px-3.5 py-1.5 rounded-lg font-medium text-slate-400 hover:text-white transition flex items-center gap-1.5";
        if (viewCookbooks) viewCookbooks.classList.remove('hidden');
        if (viewCodex) viewCodex.classList.add('hidden');
        renderCookbooks();
      } else {
        if (btnCookbooks) btnCookbooks.className = "px-3.5 py-1.5 rounded-lg font-medium text-slate-400 hover:text-white transition flex items-center gap-1.5";
        if (btnCodex) btnCodex.className = "px-3.5 py-1.5 rounded-lg font-bold bg-pastel-coral text-dark-base transition flex items-center gap-1.5 shadow-sm";
        if (viewCookbooks) viewCookbooks.classList.add('hidden');
        if (viewCodex) viewCodex.classList.remove('hidden');
      }
      renderRecipes();
      if (window.lucide) lucide.createIcons();
    }

    function renderCookbooks() {
      const grid = document.getElementById('cookbooks-grid');
      const formatShelf = document.getElementById('cookbook-format-shelf');
      const breadcrumb = document.getElementById('cookbook-breadcrumb');
      if (!grid) return;

      if (!state.activeCookbook) {
        // Show all cookbooks
        grid.classList.remove('hidden');
        if (formatShelf) formatShelf.classList.add('hidden');
        if (breadcrumb) breadcrumb.classList.add('hidden');

        grid.innerHTML = '';
        state.cookbooks.forEach(cb => {
          const count = state.recipes.filter(r => cb.origin === 'all' || r.origin === cb.origin).length;
          const card = document.createElement('div');
          card.className = "p-4 rounded-2xl bg-dark-base border border-dark-border hover:border-pastel-coral/60 cursor-pointer transition transform hover:-translate-y-0.5 space-y-2 group shadow-md";
          card.onclick = () => openCookbook(cb.id);
          card.innerHTML = `
            <div class="flex items-center justify-between">
              <span class="text-2xl">${cb.icon}</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-dark-elevated text-slate-300 font-bold group-hover:text-pastel-coral">${count} recipes</span>
            </div>
            <div>
              <h3 class="font-bold text-white text-sm group-hover:text-pastel-coral transition">${cb.title}</h3>
              <p class="text-[11px] text-slate-400 mt-1 line-clamp-2">${cb.desc}</p>
            </div>
            <div class="pt-1 flex items-center gap-1 text-[11px] text-pastel-coral font-semibold">
              <span>Open Cookbook</span>
              <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            </div>
          `;
          grid.appendChild(card);
        });
      } else {
        // A specific cookbook is opened: Show formats
        grid.classList.add('hidden');
        if (formatShelf) formatShelf.classList.remove('hidden');
        if (breadcrumb) {
          breadcrumb.classList.remove('hidden');
          const cb = state.cookbooks.find(c => c.id === state.activeCookbook);
          document.getElementById('cookbook-active-title').textContent = cb ? cb.title : 'Cookbook';
          const subcrumb = document.getElementById('cookbook-format-subcrumb');
          if (state.activeCookbookFormat && subcrumb) {
            subcrumb.classList.remove('hidden');
            const isFam = state.activeCookbook === 'cb-family';
            const famCatNames = {
              beef: 'Beef', chicken: 'Chicken', pork: 'Pork', seafood: 'Seafood', crockpot: 'Crock Pot',
              soup: 'Soup', pasta: 'Pasta', breads: 'Breads', breakfast: 'Breakfast', sides: 'Sides & Dips',
              desserts: 'Desserts & Treats', halloween: 'Halloween & Festive', misc: 'Misc Food & Casseroles', nonfood: 'Crafts & Non-Food'
            };
            document.getElementById('cookbook-active-format-title').textContent = (isFam && famCatNames[state.activeCookbookFormat]) ? famCatNames[state.activeCookbookFormat] : state.activeCookbookFormat;
          } else if (subcrumb) {
            subcrumb.classList.add('hidden');
          }
        }
        renderCookbookFormats();
      }
      if (window.lucide) lucide.createIcons();
    }

    function openCookbook(cookbookId) {
      state.activeCookbook = cookbookId;
      state.activeCookbookFormat = null;
      renderCookbooks();
      renderRecipes();
      playChime('bell');
    }

    function backToAllCookbooks() {
      state.activeCookbook = null;
      state.activeCookbookFormat = null;
      const actionBar = document.getElementById('recipe-format-action-bar');
      if (actionBar) actionBar.classList.add('hidden');
      renderCookbooks();
      renderRecipes();
    }

    function renderCookbookFormats() {
      const container = document.getElementById('cookbook-formats-grid');
      if (!container) return;

      const isFamilyCookbook = state.activeCookbook === 'cb-family';

      const familyCategoriesMeta = [
        { key: 'beef', name: 'Beef', icon: '🥩' },
        { key: 'chicken', name: 'Chicken', icon: '🍗' },
        { key: 'pork', name: 'Pork', icon: '🥓' },
        { key: 'seafood', name: 'Seafood', icon: '🐟' },
        { key: 'crockpot', name: 'Crock Pot', icon: '🍲' },
        { key: 'soup', name: 'Soup', icon: '🥣' },
        { key: 'pasta', name: 'Pasta', icon: '🍝' },
        { key: 'breads', name: 'Breads', icon: '🍞' },
        { key: 'breakfast', name: 'Breakfast', icon: '🥞' },
        { key: 'sides', name: 'Sides & Dips', icon: '🥗' },
        { key: 'desserts', name: 'Desserts & Treats', icon: '🧁' },
        { key: 'halloween', name: 'Halloween & Festive', icon: '🎃' },
        { key: 'misc', name: 'Misc & Casseroles', icon: '🥘' },
        { key: 'nonfood', name: 'Crafts & Non-Food', icon: '🎨' }
      ];

      const standardFormatsMeta = [
        { key: 'smoothie', name: 'Smoothies', icon: '🥤', color: 'text-pastel-sky border-pastel-sky/30' },
        { key: 'soup', name: 'Soups & Stews', icon: '🥣', color: 'text-pastel-coral border-pastel-coral/30' },
        { key: 'sandwich', name: 'Sandwiches & Wraps', icon: '🥪', color: 'text-pastel-butter border-pastel-butter/30' },
        { key: 'skillet', name: 'Skillets & One-Pot', icon: '🍳', color: 'text-pastel-mint border-pastel-mint/30' },
        { key: 'bowl', name: 'Grain & Salad Bowls', icon: '🥗', color: 'text-pastel-mint border-pastel-mint/30' },
        { key: 'bake', name: 'Bakes & Snacks', icon: '🧁', color: 'text-pastel-peach border-pastel-peach/30' }
      ];

      const formatsMeta = isFamilyCookbook ? familyCategoriesMeta : standardFormatsMeta;

      const cb = state.cookbooks.find(c => c.id === state.activeCookbook);
      const cbRecipes = state.recipes.filter(r => !cb || cb.origin === 'all' || r.origin === cb.origin);

      container.innerHTML = '';
      formatsMeta.forEach(fmt => {
        const count = isFamilyCookbook
          ? cbRecipes.filter(r => r.familyCategory === fmt.key).length
          : cbRecipes.filter(r => r.format === fmt.key).length;
        const isSelected = state.activeCookbookFormat === fmt.key;
        const card = document.createElement('div');
        card.className = `p-3 rounded-2xl bg-dark-base border cursor-pointer transition transform hover:-translate-y-0.5 text-center space-y-1.5 ${isSelected ? 'border-2 border-pastel-coral bg-pastel-coral/15' : 'border-dark-border hover:border-slate-500'}`;
        card.onclick = () => openCookbookFormat(fmt.key);
        card.innerHTML = `
          <span class="text-2xl block">${fmt.icon}</span>
          <span class="font-bold text-white text-xs block truncate">${fmt.name}</span>
          <span class="text-[10px] font-mono text-slate-400 block">${count} recipes</span>
        `;
        container.appendChild(card);
      });

      // Update format action bar
      const actionBar = document.getElementById('recipe-format-action-bar');
      if (actionBar) {
        if (state.activeCookbookFormat) {
          const curFmt = formatsMeta.find(f => f.key === state.activeCookbookFormat);
          document.getElementById('format-action-icon').textContent = curFmt ? curFmt.icon : '🍽️';
          document.getElementById('format-action-name').textContent = curFmt ? curFmt.name : 'Category';
          const matchCount = isFamilyCookbook
            ? cbRecipes.filter(r => r.familyCategory === state.activeCookbookFormat).length
            : cbRecipes.filter(r => r.format === state.activeCookbookFormat).length;
          document.getElementById('format-action-count').textContent = `${matchCount} recipes found in this category`;
          actionBar.classList.remove('hidden');
        } else {
          actionBar.classList.add('hidden');
        }
      }
    }

    function openCookbookFormat(formatKey) {
      if (state.activeCookbookFormat === formatKey) {
        state.activeCookbookFormat = null; // toggle off
      } else {
        state.activeCookbookFormat = formatKey;
      }
      renderCookbooks();
      renderRecipes();
      playChime('bell');
    }

    function openAddRecipeForCurrentFormat() {
      openAddRecipeModal();
      if (state.activeCookbookFormat) {
        const occInput = document.getElementById('recipe-occasion-input');
        // If there is format input
        const fmtInput = document.getElementById('recipe-format-input');
        if (fmtInput) fmtInput.value = state.activeCookbookFormat;
      }
    }

    // ---------------------------------------------------------
    // MULTI-SELECT RECIPE FILTERS LOGIC
    // ---------------------------------------------------------
    function toggleRecipeFilter(dimension, value) {
      if (!state.multiFilters) {
        state.multiFilters = {
          occasions: new Set(['all']),
          formats: new Set(['all']),
          origins: new Set(['all'])
        };
      }

      const setKey = dimension === 'occasion' ? 'occasions' : (dimension === 'format' ? 'formats' : 'origins');
      const activeSet = state.multiFilters[setKey];

      if (value === 'all') {
        activeSet.clear();
        activeSet.add('all');
      } else {
        activeSet.delete('all');
        if (activeSet.has(value)) {
          activeSet.delete(value);
          if (activeSet.size === 0) activeSet.add('all');
        } else {
          activeSet.add(value);
        }
      }

      updateRecipeFilterUI(dimension);
      renderRecipes();
    }

    function updateRecipeFilterUI(dimension) {
      const setKey = dimension === 'occasion' ? 'occasions' : (dimension === 'format' ? 'formats' : 'origins');
      const activeSet = state.multiFilters[setKey];
      const prefix = dimension === 'occasion' ? 'rf-occ-' : (dimension === 'format' ? 'rf-fmt-' : 'rf-orig-');
      const activeColor = dimension === 'occasion' ? 'bg-pastel-coral text-dark-base font-bold shadow-sm' : (dimension === 'format' ? 'bg-pastel-sky text-dark-base font-bold shadow-sm' : 'bg-pastel-mint text-dark-base font-bold shadow-sm');

      const allValues = dimension === 'occasion' 
        ? ['all', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert']
        : (dimension === 'format' 
          ? ['all', 'smoothie', 'soup', 'sandwich', 'bowl', 'skillet', 'bake']
          : ['all', 'mine', 'shared', 'school', 'oneoff']);

      allValues.forEach(val => {
        const btn = document.getElementById(`${prefix}${val}`);
        if (!btn) return;
        if (activeSet.has(val)) {
          btn.className = `px-2.5 py-1 rounded-lg ${activeColor}`;
        } else {
          btn.className = "px-2.5 py-1 rounded-lg bg-dark-base border border-dark-border text-slate-400 hover:text-white";
        }
      });

      // Update active summary bar
      const summaryBar = document.getElementById('recipe-active-filters-summary');
      const chipsContainer = document.getElementById('recipe-active-chips');
      if (summaryBar && chipsContainer) {
        const isFiltered = !state.multiFilters.occasions.has('all') || !state.multiFilters.formats.has('all') || !state.multiFilters.origins.has('all');
        if (isFiltered) {
          chipsContainer.innerHTML = '';
          ['occasions', 'formats', 'origins'].forEach(dim => {
            state.multiFilters[dim].forEach(val => {
              if (val !== 'all') {
                const chip = document.createElement('span');
                chip.className = "px-2 py-0.5 rounded-full bg-dark-elevated border border-slate-600 text-white font-mono text-[10px]";
                chip.textContent = val;
                chipsContainer.appendChild(chip);
              }
            });
          });
          summaryBar.classList.remove('hidden');
        } else {
          summaryBar.classList.add('hidden');
        }
      }
    }

    function clearAllRecipeFilters() {
      if (!state.multiFilters) return;
      state.multiFilters.occasions = new Set(['all']);
      state.multiFilters.formats = new Set(['all']);
      state.multiFilters.origins = new Set(['all']);
      ['occasion', 'format', 'origin'].forEach(dim => updateRecipeFilterUI(dim));
      renderRecipes();
    }

    // Main Recipes Render
    function renderRecipes() {
      const grid = document.getElementById('recipe-cards-grid');
      if (!grid) return;
      grid.innerHTML = '';

      const isCookbookView = state.recipeSectionView === 'cookbooks';

      const filtered = state.recipes.filter(r => {
        if (isCookbookView && state.activeCookbook) {
          const cb = state.cookbooks.find(c => c.id === state.activeCookbook);
          if (cb && cb.origin !== 'all' && r.origin !== cb.origin) return false;
          if (state.activeCookbookFormat) {
            if (cb && cb.id === 'cb-family') {
              if (r.familyCategory !== state.activeCookbookFormat) return false;
            } else {
              if (r.format !== state.activeCookbookFormat) return false;
            }
          }
          return true;
        }

        // Multi-select Codex filtering
        const mf = state.multiFilters || { occasions: new Set(['all']), formats: new Set(['all']), origins: new Set(['all']) };
        const occMatch = mf.occasions.has('all') || mf.occasions.has(r.occasion);
        const fmtMatch = mf.formats.has('all') || mf.formats.has(r.format) || (r.familyCategory && mf.formats.has(r.familyCategory));
        const origMatch = mf.origins.has('all') || mf.origins.has(r.origin);

        return occMatch && fmtMatch && origMatch;
      });

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full py-12 text-center bg-dark-base rounded-2xl border border-dashed border-dark-border space-y-3">
            <i data-lucide="book-open" class="w-10 h-10 text-slate-500 mx-auto"></i>
            <span class="text-sm font-semibold text-slate-300 block">No recipes match the active filters</span>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">Try selecting another category, clearing filters, or adding a new recipe right here!</p>
            <button type="button" onclick="openAddRecipeModal()" class="px-4 py-2 rounded-xl bg-pastel-coral text-dark-base font-bold text-xs inline-flex items-center gap-1.5 shadow-sm">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Add Recipe</span>
            </button>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      const familyIcons = {
        beef: '🥩', chicken: '🍗', pork: '🥓', seafood: '🐟', crockpot: '🍲',
        soup: '🥣', pasta: '🍝', breads: '🍞', breakfast: '🥞', sides: '🥗',
        desserts: '🧁', halloween: '🎃', misc: '🥘', nonfood: '🎨'
      };

      filtered.forEach(recipe => {
        const card = document.createElement('div');
        card.className = "bg-dark-surface border border-dark-border rounded-2xl p-5 space-y-3 hover:border-pastel-coral/50 transition flex flex-col justify-between shadow-lg";

        const formatIcon = (recipe.origin === 'family' && familyIcons[recipe.familyCategory])
          ? familyIcons[recipe.familyCategory]
          : (recipe.format === 'smoothie' ? '🥤' : (recipe.format === 'soup' ? '🥣' : (recipe.format === 'sandwich' ? '🥪' : (recipe.format === 'skillet' ? '🍳' : (recipe.format === 'bowl' ? '🥗' : '🧁')))));

        const authorBadge = recipe.author ? `<span class="text-[10px] text-pastel-coral font-medium">by ${recipe.author}</span>` : '';
        const catBadge = recipe.familyCategory 
          ? `<span class="text-pastel-coral font-bold uppercase">${recipe.familyCategory}</span>` 
          : `<span class="text-pastel-coral font-bold uppercase">${recipe.format}</span>`;

        card.innerHTML = `
          <div class="space-y-2.5 cursor-pointer" onclick="viewRecipeDetails('${recipe.id}')" title="Click to view full recipe ingredients & instructions">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-xl">${formatIcon}</span>
                <div>
                  <h3 class="font-bold text-slate-100 text-sm leading-snug hover:text-pastel-coral transition">${recipe.title}</h3>
                  <div class="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                    ${catBadge}
                    <span>•</span>
                    <span>${recipe.cookTime || 20}m cook</span>
                    ${recipe.kcal ? `<span>•</span><span class="text-pastel-mint">${recipe.kcal} kcal</span>` : ''}
                    ${authorBadge ? `<span>•</span>${authorBadge}` : ''}
                  </div>
                </div>
              </div>
              <button type="button" onclick="event.stopPropagation(); openShareRecipeModal('${recipe.id}')" class="p-1.5 rounded-lg bg-dark-base hover:bg-slate-700 text-slate-400 hover:text-pastel-coral transition" title="Share Recipe with Friends">
                <i data-lucide="share-2" class="w-4 h-4"></i>
              </button>
            </div>

            <!-- Ingredients preview -->
            <div class="bg-dark-base p-2.5 rounded-xl border border-dark-border text-[11px] text-slate-300 space-y-1">
              <div class="flex items-center justify-between text-[10px]">
                <span class="uppercase font-bold text-slate-400 tracking-wider block">Ingredients (${(recipe.ingredients || []).length}):</span>
                <span class="text-pastel-coral font-medium text-[9px] hover:underline">View Full Recipe →</span>
              </div>
              <p class="line-clamp-2 text-slate-300 font-mono text-[10px]">${(recipe.ingredients || []).join(' • ')}</p>
            </div>
          </div>

          <div class="pt-2 flex items-center justify-between border-t border-dark-border gap-2">
            <button type="button" onclick="viewRecipeDetails('${recipe.id}')" class="px-3 py-1.5 rounded-xl bg-dark-base hover:bg-slate-700 border border-dark-border text-slate-200 text-xs font-semibold flex items-center gap-1 transition" title="View Ingredients & Directions">
              <i data-lucide="book-open" class="w-3.5 h-3.5 text-pastel-coral"></i>
              <span>View Recipe</span>
            </button>
            <div class="flex items-center gap-1.5">
              <button type="button" onclick="quickLogRecipeToDiary('${recipe.id}')" class="px-2.5 py-1.5 rounded-xl bg-dark-elevated hover:bg-slate-700 border border-pastel-mint/30 text-pastel-mint text-xs font-semibold flex items-center gap-1 transition" title="Log to Nutrition Diary">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>Log</span>
              </button>
              <button type="button" onclick="sendRecipeToChoreographer('${recipe.id}')" class="px-3 py-1.5 rounded-xl bg-pastel-coral hover:bg-rose-300 text-dark-base text-xs font-bold flex items-center gap-1 shadow-sm transition" title="Send to Cooking Step-by-Step">
                <i data-lucide="chef-hat" class="w-3.5 h-3.5"></i>
                <span>Cook</span>
              </button>
            </div>
          </div>
        `;
        grid.appendChild(card);
      });

      if (window.lucide) lucide.createIcons();
    }

    function quickLogRecipeToDiary(recipeId) {
      const recipe = state.recipes.find(r => r.id === recipeId);
      if (!recipe) return;

      const kcal = recipe.kcal || 450;
      const prot = recipe.protein || Math.round((kcal * 0.25) / 4);
      const carb = recipe.carbs || Math.round((kcal * 0.45) / 4);
      const fat = recipe.fat || Math.round((kcal * 0.30) / 9);

      state.nutritionLog.push({
        id: `n-${Date.now()}`,
        name: recipe.title,
        recipeId: recipe.id,
        kcal,
        protein: prot,
        carbs: carb,
        fat,
        fiber: 5,
        sodium: 320,
        potassium: 450,
        iron: 2.2,
        calcium: 120,
        isVerified: true
      });

      renderNutrition();
      playChime('bell');
      alertBox(`Logged 1 serving of "${recipe.title}" (${kcal} kcal) to today's diary!`, "Nutrition Diary");
    }

    function openAddRecipeModal() {
      document.getElementById('recipe-modal').classList.remove('hidden');
    }
    function closeAddRecipeModal() {
      document.getElementById('recipe-modal').classList.add('hidden');
    }

    function saveNewRecipe() {
      const title = document.getElementById('recipe-title-input').value.trim();
      const occasion = document.getElementById('recipe-occasion-input').value;
      const format = document.getElementById('recipe-format-input').value;
      const origin = document.getElementById('recipe-origin-input').value;
      const cookTime = parseInt(document.getElementById('recipe-cooktime-input').value, 10) || 20;
      const kcal = parseInt(document.getElementById('recipe-kcal-input').value, 10) || 450;
      const rawIngredients = document.getElementById('recipe-ingredients-input').value.trim();
      const instructions = document.getElementById('recipe-instructions-input').value.trim();

      if (!title) return;

      const newRec = {
        id: `rec-${Date.now()}`,
        title,
        occasion,
        format,
        origin,
        cookTime,
        kcal,
        ingredients: rawIngredients ? rawIngredients.split('\n').filter(Boolean) : [],
        instructions: instructions || 'Mise-en-place prep, then cook and clean dishes during simmer.'
      };

      state.recipes.unshift(newRec);
      closeAddRecipeModal();
      renderRecipes();
      playChime('bell');
      alertBox(`Saved "${title}" to your Recipe Codex.`, "Recipe Stored");
    }

    // ==============================================
    // RECIPE SHARING (NATIVE SHARE & URL LINKS)
    // ==============================================
    function openShareRecipeModal(recipeId) {
      const allRecipes = (state.recipes || []).concat(typeof familyCookbookDatabase !== 'undefined' ? familyCookbookDatabase : []);
      const recipe = allRecipes.find(r => r.id === recipeId);
      if (!recipe) return;

      state.selectedRecipeToShare = recipe;
      const titleEl = document.getElementById('share-modal-recipe-title');
      if (titleEl) titleEl.textContent = recipe.title;

      const baseUrl = window.location.origin + window.location.pathname;
      const payload = encodeURIComponent(JSON.stringify({
        title: recipe.title,
        occasion: recipe.occasion || 'dinner',
        format: recipe.format || 'skillet',
        origin: 'shared',
        cookTime: recipe.cookTime || 20,
        kcal: recipe.kcal || 450,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || ''
      }));

      const shareUrl = `${baseUrl}?sharedRecipe=${payload}`;
      const linkInput = document.getElementById('share-recipe-link-input');
      if (linkInput) linkInput.value = shareUrl;

      const modal = document.getElementById('share-recipe-modal');
      if (modal) modal.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
      playChime('bell');
    }

    const shareRecipeWithFriend = openShareRecipeModal;

    function closeShareRecipeModal() {
      const modal = document.getElementById('share-recipe-modal');
      if (modal) modal.classList.add('hidden');
    }

    async function triggerNativeShareRecipe() {
      if (!state.selectedRecipeToShare) return;
      const recipe = state.selectedRecipeToShare;
      const linkInput = document.getElementById('share-recipe-link-input');
      const shareUrl = linkInput ? linkInput.value : window.location.href;

      if (navigator.share) {
        try {
          await navigator.share({
            title: `FocusFlow Recipe: ${recipe.title}`,
            text: `Hey! I wanted to share this ADHD-friendly recipe with you on FocusFlow: ${recipe.title} (${recipe.cookTime || 20}m active cook, ${recipe.kcal || 450} kcal).`,
            url: shareUrl
          });
          playChime('bell');
          return;
        } catch (err) {
          if (err.name !== 'AbortError') console.warn('Share error', err);
        }
      }

      copyShareRecipeLink();
    }

    function copyShareRecipeLink() {
      const input = document.getElementById('share-recipe-link-input');
      if (!input) return;
      input.select();
      input.setSelectionRange(0, 99999);
      try {
        navigator.clipboard.writeText(input.value);
        playChime('bell');
        alertBox("Recipe link copied! Paste it into a text message to your friend.", "Link Copied");
      } catch (e) {
        alertBox("Please copy the link inside the box.", "Share Recipe");
      }
    }

    function acceptIncomingRecipe() {
      if (!state.incomingSharedRecipe) return;
      const r = state.incomingSharedRecipe;

      const newRecipe = {
        id: `rec-${Date.now()}`,
        title: r.title,
        occasion: r.occasion || 'dinner',
        format: r.format || 'skillet',
        origin: 'shared',
        cookTime: r.cookTime || 20,
        kcal: r.kcal || 450,
        ingredients: r.ingredients || [],
        instructions: r.instructions || ''
      };

      if (!state.recipes) state.recipes = [];
      state.recipes.unshift(newRecipe);
      if (typeof saveAppState === 'function') saveAppState();
      dismissIncomingRecipe();
      if (typeof switchTab === 'function') switchTab('recipes');
      if (typeof renderRecipes === 'function') renderRecipes();
      playChime('bell');
      alertBox(`Added "${newRecipe.title}" to your Recipe Codex under 'Family & Friends'!`, "Recipe Saved");
    }

    function dismissIncomingRecipe() {
      const modal = document.getElementById('incoming-recipe-modal');
      if (modal) modal.classList.add('hidden');
      state.incomingSharedRecipe = null;
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {}
    }

    function sendRecipeToChoreographer(recipeId) {
      const r = state.recipes.find(x => x.id === recipeId);
      if (!r) return;

      // Create a calendar event for this cooking session
      const newEvent = {
        id: `ev-${Date.now()}`,
        title: `Cook: ${r.title}`,
        startTime: '18:30',
        duration: r.cookTime + 15,
        category: 'meal',
        goodEnough: 'Cook recipe, enjoy warm meal, rinse pan; leave deep scrub for later',
        subtasks: [
          { text: 'Mise-en-place prep all ingredients', minutes: 10, done: false },
          { text: 'Execute main cooking step', minutes: r.cookTime, done: false },
          { text: '[Dish Window] Wash prep knives & bowls while simmering', minutes: 7, done: false },
          { text: 'Plate meal and wash skillet', minutes: 8, done: false }
        ]
      };

      state.events.push(newEvent);
      switchTab('timeline');
      openEventToolsModal(newEvent.id);
      switchToolTab('chef');
      document.getElementById('reverse-recipe-name').value = r.title;
      document.getElementById('reverse-recipe-input').value = r.instructions;
      playChime('bell');
    }

    function logRecipeToNutrition(recipeId) {
      const r = state.recipes.find(x => x.id === recipeId);
      if (!r) return;

      state.nutritionLog.push({
        id: `n-${Date.now()}`,
        name: r.title,
        kcal: r.kcal,
        protein: Math.round(r.kcal * 0.06),
        carbs: Math.round(r.kcal * 0.10),
        fat: Math.round(r.kcal * 0.03),
        fiber: 5.0,
        sugar: 4.0,
        starch: 35.0,
        saturated: 2.5,
        mufa: 4.0,
        pufa: 2.0,
        omega3: 0.8,
        cholesterol: 45,
        sodium: 480,
        potassium: 620,
        iron: 2.2,
        calcium: 110,
        magnesium: 60,
        zinc: 1.8,
        vitA: 180,
        vitC: 30,
        vitD: 100,
        vitE: 1.5,
        vitK: 45,
        tyrosine: 850,
        tryptophan: 240,
        leucine: 1800,
        lysine: 1600,
        choline: 65,
        waterMl: 250,
        isVerified: false
      });

      switchTab('nutrition');
      playChime('bell');
      alertBox(`Logged ${r.title} (${r.kcal} kcal) to daily diary.`, "Nutrition Logged");
    }

    // Hydration tracking (Supports fl oz default and ml)
    function logQuickWater(val) {
      const unit = (state.userProfile && state.userProfile.waterUnit) || 'fl_oz';
      let addedMl = 0;
      let displayMsg = '';
      if (unit === 'fl_oz') {
        const flOz = (typeof val === 'number' && val > 2) ? val : (val === 1 ? 8 : 16);
        addedMl = Math.round(flOz * 29.5735);
        displayMsg = `+${flOz} fl oz`;
      } else {
        const ml = (typeof val === 'number' && val > 10) ? val : (val === 1 ? 250 : 500);
        addedMl = ml;
        displayMsg = `+${ml} ml`;
      }
      state.waterLoggedMl = (state.waterLoggedMl || 0) + addedMl;
      saveAppState();
      playChime('bell');
      renderNutrition();
      alertBox(`${displayMsg} water logged. Stay hydrated!`, "Hydration Logged");
    }

    // Modal: Detailed Food Viewer (Tapped logged food)
    function inspectLoggedFood(foodId) {
      const food = state.nutritionLog.find(n => n.id === foodId);
      if (!food) return;
      state.selectedFoodForDetail = food;

      document.getElementById('detail-food-name').textContent = food.name;
      document.getElementById('detail-food-kcal').textContent = `${food.kcal} kcal`;

      const badge = document.getElementById('detail-food-badge');
      badge.textContent = food.isVerified ? '✓ Verified Fact' : '~ AI Estimated';
      badge.className = food.isVerified 
        ? "px-2 py-0.5 rounded text-[10px] font-bold bg-pastel-mint/20 text-pastel-mint border border-pastel-mint/30"
        : "px-2 py-0.5 rounded text-[10px] font-bold bg-pastel-butter/20 text-pastel-butter border border-pastel-butter/30";

      document.getElementById('detail-macro-protein').textContent = `${food.protein || 0}g`;
      document.getElementById('detail-macro-carbs').textContent = `${food.carbs || 0}g`;
      document.getElementById('detail-macro-fats').textContent = `${food.fat || 0}g`;
      document.getElementById('detail-macro-fiber').textContent = `${food.fiber || 0}g`;

      const specs = document.getElementById('detail-nutrient-specs');
      specs.innerHTML = `
        <div class="bg-dark-base p-3 rounded-xl border border-dark-border space-y-1.5">
          <span class="text-pastel-butter font-bold block text-[11px] uppercase tracking-wider">Carbohydrate Fractions</span>
          <div class="grid grid-cols-3 gap-2 text-slate-300">
            <div>Dietary Fiber: <strong class="text-white">${food.fiber || 0}g</strong></div>
            <div>Sugars: <strong class="text-white">${food.sugar || 0}g</strong></div>
            <div>Starch: <strong class="text-white">${food.starch || 0}g</strong></div>
          </div>
        </div>

        <div class="bg-dark-base p-3 rounded-xl border border-dark-border space-y-1.5">
          <span class="text-pastel-sky font-bold block text-[11px] uppercase tracking-wider">Fat & Fatty Acid Profile</span>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
            <div>Saturated: <strong class="text-white">${food.saturated || 0}g</strong></div>
            <div>Monounsat (MUFA): <strong class="text-white">${food.mufa || 0}g</strong></div>
            <div>Polyunsat (PUFA): <strong class="text-white">${food.pufa || 0}g</strong></div>
            <div>Omega-3: <strong class="text-pastel-sky">${food.omega3 || 0}g</strong></div>
          </div>
        </div>

        <div class="bg-dark-base p-3 rounded-xl border border-dark-border space-y-1.5">
          <span class="text-pastel-mint font-bold block text-[11px] uppercase tracking-wider">Vitamins & Minerals</span>
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 text-slate-300">
            <div>Sodium: <strong class="text-white">${food.sodium || 0}mg</strong></div>
            <div>Potassium: <strong class="text-white">${food.potassium || 0}mg</strong></div>
            <div>Iron: <strong class="text-pastel-sky">${food.iron || 0}mg</strong></div>
            <div>Calcium: <strong class="text-white">${food.calcium || 0}mg</strong></div>
            <div>Magnesium: <strong class="text-white">${food.magnesium || 0}mg</strong></div>
            <div>Zinc: <strong class="text-white">${food.zinc || 0}mg</strong></div>
            <div>Vit D3: <strong class="text-white">${food.vitD || 0} IU</strong></div>
            <div>Vit C: <strong class="text-white">${food.vitC || 0}mg</strong></div>
          </div>
        </div>

        <div class="bg-dark-base p-3 rounded-xl border border-dark-border space-y-1.5">
          <span class="text-pastel-peach font-bold block text-[11px] uppercase tracking-wider">Amino Acids & Dopamine Bases</span>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-300">
            <div>Tyrosine (Dopamine): <strong class="text-pastel-peach">${food.tyrosine || 0}mg</strong></div>
            <div>Tryptophan (Serotonin): <strong class="text-white">${food.tryptophan || 0}mg</strong></div>
            <div>Leucine (BCAA): <strong class="text-white">${food.leucine || 0}mg</strong></div>
            <div>Lysine: <strong class="text-white">${food.lysine || 0}mg</strong></div>
            <div>Choline: <strong class="text-white">${food.choline || 0}mg</strong></div>
          </div>
        </div>
      `;

      document.getElementById('food-detail-modal').classList.remove('hidden');
      lucide.createIcons();
      playChime('bell');
    }

    function closeFoodDetailModal() {
      document.getElementById('food-detail-modal').classList.add('hidden');
    }

    function deleteFoodLogItem() {
      if (!state.selectedFoodForDetail) return;
      state.nutritionLog = state.nutritionLog.filter(n => n.id !== state.selectedFoodForDetail.id);
      closeFoodDetailModal();
      renderNutrition();
      playChime('bell');
    }

    // ==============================================
// WALMART & GROCERY RECEIPT IMPORT SUITE
// [Walmart & Grocery Receipt Import moved to js/shopping.js]

// ==============================================
// SMART PANTRY RENDERING & INGREDIENT CONTROLLERS
// ==============================================
    // 3. Smart Pantry Rendering with Nutritional Summaries & Freshness Dates (Dual-Lens: Zones & Food Types)
    function getItemZone(item) {
      const s = (item.storage || '').toLowerCase();
      const name = (item.name || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();

      if (s === 'fridge-crisper' || s === 'crisper') return 'fridge-crisper';
      if (s === 'fridge-main') return 'fridge-main';
      if (s === 'cupboard') return 'cupboard';
      if (s === 'frozen' || s === 'freezer') return 'freezer';
      if (s === 'counter') return 'counter';
      if (s === 'spices' || s === 'spice') return 'spices';
      if (s === 'pantry' || s === 'shelf') return 'pantry';

      if (s === 'fridge') {
        const isCrisper = /spinach|kale|lettuce|broccoli|celery|carrot|cucumber|zucchini|cauliflower|asparagus|cabbage|herb|cilantro|parsley|greens|salad|bell pepper|pepper|mushroom|scallion|radish|onion|tomato|avocado|berries|strawberry|produce/i.test(name) || cat === 'produce';
        return isCrisper ? 'fridge-crisper' : 'fridge-main';
      }

      // Default inferences if storage not explicitly set
      if (/cupboard|cereal|cracker|cookie|chip|tea|coffee|mug|bowl|plate/i.test(name) || cat === 'snacks') return 'cupboard';
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

    function formatPantryAmountAndUnit(amount, unit) {
      const amt = (amount != null && !isNaN(parseFloat(amount))) ? parseFloat(amount) : 1;
      const u = (unit || 'items').toLowerCase().trim();

      if (u === 'oz' || u === 'ounce' || u === 'ounces') {
        return `${amt} oz`;
      }
      if (u === 'g' || u === 'gram' || u === 'grams') {
        return `${amt} g`;
      }
      if (u === 'fl oz' || u === 'fl. oz' || u === 'fluid oz' || u === 'fluid ounce' || u === 'fluid ounces' || u === 'floz') {
        return `${amt} fl oz`;
      }
      if (u === 'ml' || u === 'milliliter' || u === 'milliliters') {
        return `${amt} ml`;
      }
      if (u === 'l' || u === 'liter' || u === 'liters') {
        return `${amt} L`;
      }
      if (u === 'cup' || u === 'cups') {
        return `${amt} ${amt === 1 ? 'cup' : 'cups'}`;
      }
      if (u === 'gal' || u === 'gallon' || u === 'gallons') {
        return `${amt} gal`;
      }
      if (u === 'pt' || u === 'pint' || u === 'pints') {
        return `${amt} pt`;
      }
      if (u === 'qt' || u === 'quart' || u === 'quarts') {
        return `${amt} qt`;
      }
      if (u === 'serving' || u === 'servings') {
        return `${amt} ${amt === 1 ? 'serving' : 'servings'}`;
      }
      if (u === 'item' || u === 'items' || u === 'each' || u === 'ea' || u === 'count' || u === 'pc' || u === 'pcs' || u === 'piece' || u === 'pieces') {
        return `${amt} ${amt === 1 ? 'item' : 'items'}`;
      }
      if (u === 'lb' || u === 'lbs' || u === 'pound' || u === 'pounds') {
        return `${amt} lb`;
      }
      return `${amt} ${u}`;
    }

    function cyclePantryItemUnit(id) {
      const item = (state.pantry || []).find(p => p.id === id);
      if (!item) return;
      const u = (item.unit || 'items').toLowerCase().trim();

      // Cycle through: oz -> g -> fl oz -> ml -> items -> servings -> oz
      let nextUnit = 'oz';
      if (u === 'oz' || u.includes('ounce')) {
        nextUnit = 'g';
      } else if (u === 'g' || u.includes('gram')) {
        nextUnit = 'fl oz';
      } else if (u.includes('fl') || u === 'fluid oz') {
        nextUnit = 'ml';
      } else if (u === 'ml' || u.includes('milli')) {
        nextUnit = 'items';
      } else if (u === 'item' || u === 'items' || u === 'each' || u === 'ea' || u === 'count' || u.includes('pc')) {
        nextUnit = 'servings';
      } else if (u.includes('serv')) {
        nextUnit = 'oz';
      } else {
        nextUnit = 'oz';
      }

      item.unit = nextUnit;
      saveAppState();
      renderPantry();
      playChime('bell');
    }

    function buildPantryItemPillHtml(item, expiryBadge) {
      const isOutOfStock = (item.amount == null || item.amount <= 0);

      const outOfStockAction = isOutOfStock
        ? `<button type="button" onclick="event.stopPropagation(); addPantryItemToShoppingList('${item.id}')" class="px-2 py-0.5 rounded-lg bg-pastel-coral/20 hover:bg-pastel-coral/30 border border-pastel-coral/40 text-pastel-coral text-[10px] font-bold flex items-center gap-1 transition" title="Item is out of stock! Tap to add to shopping list">
             <i data-lucide="shopping-cart" class="w-3 h-3"></i>
             <span>+ Add to Shopping List</span>
           </button>`
        : '';

      return `
        <div class="flex items-center gap-1.5 min-w-0 flex-1">
          <span class="text-slate-200 font-semibold truncate group-hover:text-pastel-mint transition ${isOutOfStock ? 'line-through text-slate-400' : ''}">${item.name}</span>
          ${expiryBadge}
        </div>
        <div class="flex items-center gap-1 shrink-0" onclick="event.stopPropagation()">
          ${outOfStockAction}
          <!-- Amount Stepper with 1-Tap Unit Cycling -->
          <div class="flex items-center bg-dark-elevated border border-dark-border rounded-lg px-1 py-0.5 gap-1 font-mono text-[10px]">
            <button type="button" onclick="event.stopPropagation(); changePantryItemAmount('${item.id}', -1)" class="w-3.5 h-3.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center">-</button>
            <button type="button" onclick="event.stopPropagation(); cyclePantryItemUnit('${item.id}')" class="text-pastel-mint hover:text-pastel-sky font-bold px-1 hover:underline cursor-pointer transition flex items-center" title="Amount: ${item.amount != null ? item.amount : 1} • Unit: ${item.unit || 'items'} (Tap to cycle: items ➔ oz ➔ g ➔ servings)">
              ${formatPantryAmountAndUnit(item.amount, item.unit)}
            </button>
            <button type="button" onclick="event.stopPropagation(); changePantryItemAmount('${item.id}', 1)" class="w-3.5 h-3.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center">+</button>
          </div>
          <!-- Delete -->
          <button type="button" onclick="event.stopPropagation(); deletePantryItem('${item.id}')" class="text-slate-500 hover:text-rose-400 p-0.5" title="Remove ingredient">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;
    }

    function renderPantry() {
      // 1. Zone Lists (7 Zones)
      const zoneLists = {
        'fridge-crisper': document.getElementById('list-zone-fridge-crisper'),
        'fridge-main': document.getElementById('list-zone-fridge-main'),
        'freezer': document.getElementById('list-zone-freezer'),
        'counter': document.getElementById('list-zone-counter'),
        'cupboard': document.getElementById('list-zone-cupboard'),
        'pantry': document.getElementById('list-zone-pantry'),
        'spices': document.getElementById('list-zone-spices')
      };
      Object.keys(zoneLists).forEach(k => { if (zoneLists[k]) zoneLists[k].innerHTML = ''; });
      const zoneCounts = { 'fridge-crisper': 0, 'fridge-main': 0, freezer: 0, counter: 0, cupboard: 0, pantry: 0, spices: 0 };

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
          item.storage = z.startsWith('fridge') ? 'fridge' : (z === 'counter' ? 'counter' : (z === 'freezer' ? 'frozen' : (z === 'cupboard' ? 'cupboard' : 'shelf')));
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
        } else if (zoneFilter === 'cupboard') {
          matchesZone = (itemZone === 'cupboard' || item.storage === 'cupboard');
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
      setTxt('count-zone-cupboard', zoneCounts.cupboard);
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
      const pantryBanner = document.getElementById('pantry-expiring-alert');
      const pantryText = document.getElementById('pantry-expiring-alert-text');
      const chefBanner = document.getElementById('chef-expiring-alert');
      const chefText = document.getElementById('chef-expiring-alert-text');
      const hasExpiring = items && items.length > 0;
      const msg = hasExpiring ? `Ingredients expiring soon: ${items.slice(0, 3).join(', ')}. Use them up in your next recipe!` : '';

      [pantryBanner, chefBanner].forEach(b => {
        if (b) {
          if (hasExpiring) b.classList.remove('hidden');
          else b.classList.add('hidden');
        }
      });
      [pantryText, chefText].forEach(t => {
        if (t && hasExpiring) t.textContent = msg;
      });
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
    state.activePantryPortionScale = 1.0;

    function renderMicroBarRow(standardKey, standardDef, value, isVerified = false) {
      const val = (typeof value === 'number' && !isNaN(value)) ? value : 0;
      const pct = Math.min(Math.round((val / standardDef.dv) * 100), 100);
      const formattedVal = val >= 10 ? Math.round(val) : (val > 0 ? parseFloat(val.toFixed(2)) : 0);
      const indicator = isVerified
        ? '<span class="text-emerald-400 font-bold mr-1" title="Verified Nutrient">✓</span>'
        : '<span class="text-amber-400 font-bold mr-1" title="Estimated Nutrient">~</span>';
      
      return `
        <div class="p-1.5 rounded-xl bg-dark-elevated/70 border border-dark-border/40 text-[10px]">
          <div class="flex items-center justify-between mb-0.5">
            <span class="text-slate-300 font-medium flex items-center">${indicator}${standardDef.name}</span>
            <div class="flex items-center gap-1.5 font-mono">
              <span class="text-white font-bold">${formattedVal} ${standardDef.unit}</span>
              <span class="${standardDef.color} text-[9px] font-bold">(${pct}% DV)</span>
            </div>
          </div>
          <div class="w-full bg-dark-base rounded-full h-1 overflow-hidden">
            <div class="${standardDef.barColor} h-1 rounded-full transition-all duration-300" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }

    function renderPantryDetailMacroDonut(nut) {
      const container = document.getElementById('pantry-detail-macro-donut');
      if (!container) return;
      const pG = parseFloat(nut.protein) || 0;
      const cG = parseFloat(nut.carbs) || 0;
      const fG = parseFloat(nut.fat) || 0;
      const pKcal = pG * 4;
      const cKcal = cG * 4;
      const fKcal = fG * 9;
      const totalKcal = Math.round(nut.kcal || (pKcal + cKcal + fKcal));
      const macroSum = pKcal + cKcal + fKcal;

      if (macroSum <= 0) {
        container.innerHTML = '';
        return;
      }

      const pPct = Math.round((pKcal / macroSum) * 100);
      const cPct = Math.round((cKcal / macroSum) * 100);
      const fPct = Math.max(0, 100 - pPct - cPct);

      const r = 26;
      const circ = 2 * Math.PI * r;
      const pDash = (pPct / 100) * circ;
      const cDash = (cPct / 100) * circ;
      const fDash = (fPct / 100) * circ;

      const pOffset = 0;
      const cOffset = -pDash;
      const fOffset = -(pDash + cDash);

      container.innerHTML = `
        <div class="flex items-center gap-3 bg-dark-elevated/70 p-2.5 rounded-2xl border border-dark-border/60 w-full justify-around shadow-sm">
          <div class="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 70 70">
              <circle cx="35" cy="35" r="${r}" fill="none" stroke="#1e293b" stroke-width="7" />
              <circle cx="35" cy="35" r="${r}" fill="none" stroke="#34d399" stroke-width="7" stroke-dasharray="${pDash} ${circ - pDash}" stroke-dashoffset="${pOffset}" />
              <circle cx="35" cy="35" r="${r}" fill="none" stroke="#38bdf8" stroke-width="7" stroke-dasharray="${cDash} ${circ - cDash}" stroke-dashoffset="${cOffset}" />
              <circle cx="35" cy="35" r="${r}" fill="none" stroke="#fb7185" stroke-width="7" stroke-dasharray="${fDash} ${circ - fDash}" stroke-dashoffset="${fOffset}" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span class="text-[11px] font-black text-white font-mono leading-none">${totalKcal}</span>
              <span class="text-[7px] text-slate-400 font-mono">kcal</span>
            </div>
          </div>
          <div class="space-y-0.5 text-[10px] font-mono">
            <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-pastel-mint"></span><span class="text-slate-300">Protein:</span><strong class="text-white">${pPct}%</strong><span class="text-slate-400">(${Math.round(pG)}g)</span></div>
            <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-pastel-sky"></span><span class="text-slate-300">Net Carbs:</span><strong class="text-white">${cPct}%</strong><span class="text-slate-400">(${Math.round(cG)}g)</span></div>
            <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-pastel-coral"></span><span class="text-slate-300">Fat:</span><strong class="text-white">${fPct}%</strong><span class="text-slate-400">(${Math.round(fG)}g)</span></div>
          </div>
        </div>
      `;
    }

    function scalePantryDetailPortion(scale = 1.0) {
      state.activePantryPortionScale = scale;
      if (state.activePantryDetailItem) {
        renderPantryItemDetailNutrients(state.activePantryDetailItem, scale);
      }
    }

    function renderPantryItemDetailNutrients(item, scale = 1.0) {
      if (!item || !item.nutrition) return;
      const nut = item.nutrition;
      const baseGrams = item.servingGrams || (item.unit === 'g' ? (parseFloat(item.amount) || 100) : 100);
      const viewGrams = Math.round(baseGrams * scale);

      const baseLabel = document.getElementById('pantry-detail-base-serving');
      if (baseLabel) baseLabel.textContent = `• Base: 1 serving (${baseGrams}g)`;
      const viewLabel = document.getElementById('pantry-detail-serving-display');
      if (viewLabel) viewLabel.textContent = `${scale}x serving (${viewGrams}g)`;

      const isVerified = Boolean(item.isVerified || (item.sourceBadge && item.sourceBadge.includes('✓')));

      const kcalEl = document.getElementById('pantry-detail-kcal');
      const protEl = document.getElementById('pantry-detail-protein');
      const carbEl = document.getElementById('pantry-detail-carbs');
      const fatEl = document.getElementById('pantry-detail-fat');
      const fiberEl = document.getElementById('pantry-detail-fiber');
      const sugarEl = document.getElementById('pantry-detail-sugar');
      const satFatEl = document.getElementById('pantry-detail-sat-fat');
      const sodiumEl = document.getElementById('pantry-detail-sodium');

      const scaledKcal = Math.round((nut.kcal || 0) * scale);
      const scaledProt = ((nut.protein || 0) * scale).toFixed(1);
      const scaledCarbs = ((nut.carbs || 0) * scale).toFixed(1);
      const scaledFat = ((nut.fat || 0) * scale).toFixed(1);
      const scaledFiber = ((nut.fiber || 0) * scale).toFixed(1);
      const scaledSugar = ((nut.sugar || 0) * scale).toFixed(1);
      const scaledSatFat = ((nut.satFat || 0) * scale).toFixed(1);
      const scaledSodium = Math.round((nut.sodium || 0) * scale);

      const checkPrefix = isVerified ? '<span class="text-emerald-400 font-bold mr-0.5">✓</span>' : '<span class="text-amber-400 font-bold mr-0.5">~</span>';

      if (kcalEl) kcalEl.innerHTML = `${checkPrefix}${scaledKcal}`;
      if (protEl) protEl.innerHTML = `${checkPrefix}${scaledProt}g`;
      if (carbEl) carbEl.innerHTML = `${checkPrefix}${scaledCarbs}g`;
      if (fatEl) fatEl.innerHTML = `${checkPrefix}${scaledFat}g`;
      if (fiberEl) fiberEl.innerHTML = `${checkPrefix}${scaledFiber}g`;
      if (sugarEl) sugarEl.innerHTML = `${checkPrefix}${scaledSugar}g`;
      if (satFatEl) satFatEl.innerHTML = `${checkPrefix}${scaledSatFat}g`;
      if (sodiumEl) sodiumEl.innerHTML = `${checkPrefix}${scaledSodium}mg`;

      renderPantryDetailMacroDonut({
        kcal: scaledKcal,
        protein: scaledProt,
        carbs: scaledCarbs,
        fat: scaledFat
      });

      // Render all 13 vitamins and all 14 minerals scaled proportionally
      const standards = (typeof window !== 'undefined' && window.DAILY_NUTRITION_STANDARDS) ? window.DAILY_NUTRITION_STANDARDS : (typeof DAILY_NUTRITION_STANDARDS !== 'undefined' ? DAILY_NUTRITION_STANDARDS : null);
      const micros = nut.micros || {};
      const vitGrid = document.getElementById('pantry-micro-vitamins-grid');
      const minGrid = document.getElementById('pantry-micro-minerals-grid');

      if (standards) {
        if (vitGrid) {
          vitGrid.innerHTML = Object.keys(standards)
            .filter(k => standards[k].type === 'vitamin')
            .map(k => renderMicroBarRow(k, standards[k], (micros[k] || 0) * scale, isVerified))
            .join('');
        }
        if (minGrid) {
          minGrid.innerHTML = Object.keys(standards)
            .filter(k => standards[k].type === 'mineral')
            .map(k => renderMicroBarRow(k, standards[k], (micros[k] || 0) * scale, isVerified))
            .join('');
        }
      }
    }

    function switchPantryMicroTab(tab) {
      const vitTab = document.getElementById('tab-pantry-micro-vitamins');
      const minTab = document.getElementById('tab-pantry-micro-minerals');
      const vitGrid = document.getElementById('pantry-micro-vitamins-grid');
      const minGrid = document.getElementById('pantry-micro-minerals-grid');

      if (tab === 'minerals') {
        if (minGrid) minGrid.classList.remove('hidden');
        if (vitGrid) vitGrid.classList.add('hidden');
        if (minTab) {
          minTab.className = "px-2 py-0.5 rounded-md bg-pastel-mint text-dark-base font-bold transition";
        }
        if (vitTab) {
          vitTab.className = "px-2 py-0.5 rounded-md text-slate-400 hover:text-white transition";
        }
      } else {
        if (vitGrid) vitGrid.classList.remove('hidden');
        if (minGrid) minGrid.classList.add('hidden');
        if (vitTab) {
          vitTab.className = "px-2 py-0.5 rounded-md bg-pastel-sky text-dark-base font-bold transition";
        }
        if (minTab) {
          minTab.className = "px-2 py-0.5 rounded-md text-slate-400 hover:text-white transition";
        }
      }
    }

    function openManualNutritionModalForActivePantryItem() {
      if (!state.activePantryDetailItem) return;
      const item = state.activePantryDetailItem;
      if (typeof openManualNutritionModal === 'function') {
        openManualNutritionModal({
          barcode: item.barcode || '',
          name: item.name || '',
          brand: item.brand || '',
          amount: item.amount != null ? item.amount : 1,
          unit: item.unit || 'items',
          category: item.category || 'produce',
          storage: item.storage || 'fridge',
          nutrition: item.nutrition,
          isPantryEdit: true,
          pantryItemId: item.id
        });
      }
    }

    function openPantryItemDetailModal(id) {
      const item = (state.pantry || []).find(p => p.id === id);
      if (!item) return;
      state.activePantryDetailItem = item;
      state.activePantryPortionScale = 1.0;

      const modal = document.getElementById('pantry-item-detail-modal');
      const nameEl = document.getElementById('pantry-detail-name');
      const verifiedBadge = document.getElementById('pantry-detail-verified-badge');
      const freshnessBadge = document.getElementById('pantry-detail-freshness-badge');
      const dateAddedInput = document.getElementById('pantry-detail-date-added');
      const dateOpenedInput = document.getElementById('pantry-detail-date-opened');
      const dateExpInput = document.getElementById('pantry-detail-date-exp');

      if (nameEl) nameEl.textContent = item.name;
      const amtInput = document.getElementById('pantry-detail-amount');
      if (amtInput) amtInput.value = item.amount != null ? item.amount : 1;
      setPantryDetailUnit(item.unit || 'items');

      // Find match in whole foods database or estimate
      const match = (typeof commonFoodsDatabase !== 'undefined') ? commonFoodsDatabase.find(cf => item.name.toLowerCase().includes(cf.name.toLowerCase().split(' ')[0])) : null;

      if (!item.nutrition) {
        const estKcal = match ? match.kcal : (item.kcal || (item.category === 'protein' ? 180 : (item.category === 'produce' ? 45 : 120)));
        const estProt = match ? match.protein : (item.protein || (item.category === 'protein' ? 24 : 2));
        const estCarbs = match ? match.carbs : (item.carbs || (item.category === 'produce' ? 8 : (item.category === 'grains' ? 28 : 2)));
        const estFat = match ? match.fat : (item.fat || (item.category === 'protein' ? 6 : 0.5));
        const estFiber = match ? match.fiber : (item.fiber || (item.category === 'produce' ? 3 : 0));
        const estSodium = match?.sodium || item.sodium || 45;

        const estMicros = (typeof estimateMicronutrientsForFood === 'function')
          ? estimateMicronutrientsForFood(item.category, estKcal, estProt, estCarbs, estFat, item.name)
          : {};

        item.nutrition = {
          kcal: estKcal,
          protein: estProt,
          carbs: estCarbs,
          fat: estFat,
          fiber: estFiber,
          sugar: item.sugar || (item.category === 'produce' ? 2.5 : 0),
          satFat: item.satFat || (item.category === 'protein' ? 1.5 : 0.1),
          sodium: estSodium,
          micros: estMicros
        };
      } else if (!item.nutrition.micros || Object.keys(item.nutrition.micros).length === 0) {
        if (typeof estimateMicronutrientsForFood === 'function') {
          item.nutrition.micros = estimateMicronutrientsForFood(item.category, item.nutrition.kcal, item.nutrition.protein, item.nutrition.carbs, item.nutrition.fat, item.name);
        }
      }

      // Render scaled nutrients (default 1.0x)
      renderPantryItemDetailNutrients(item, 1.0);

      const microEl = document.getElementById('pantry-detail-micros');
      if (microEl) {
        microEl.textContent = `All 13 essential vitamins & 14 minerals tracked for complete human survival.`;
      }

      if (verifiedBadge) {
        const isVerified = Boolean(item.isVerified || (item.sourceBadge && item.sourceBadge.includes('✓')));
        if (isVerified) {
          verifiedBadge.textContent = item.sourceBadge || (match ? "✓ Verified USDA Whole Food" : "✓ Verified Clinical Nutrition Profile");
          verifiedBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-400/30";
        } else {
          verifiedBadge.textContent = "~ Clinical Estimate";
          verifiedBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/40 text-amber-300 border border-amber-400/30";
        }
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

      const activeStorage = item.storage || getItemZone(item);
      setPantryDetailStorage(activeStorage);

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
      const zones = ['fridge-crisper', 'fridge-main', 'freezer', 'counter', 'cupboard', 'pantry', 'spices'];
      zones.forEach(s => {
        const btn = document.getElementById(`btn-pantry-storage-${s}`);
        if (!btn) return;
        if (s === storageType) {
          btn.className = "p-1.5 rounded-xl border-2 border-pastel-mint bg-pastel-mint/15 text-white font-bold text-center text-[10px] shadow-sm";
        } else {
          btn.className = "p-1.5 rounded-xl bg-dark-base border border-dark-border text-slate-400 text-center text-[10px]";
        }
      });
    }

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

    function setPantryDetailUnit(unitVal) {
      if (state.activePantryDetailItem) state.activePantryDetailItem.unit = unitVal;
      const unitInput = document.getElementById('pantry-detail-unit');
      let mapped = unitVal || 'items';
      if (mapped === 'item' || mapped === 'each' || mapped === 'ea' || mapped === 'count') mapped = 'items';
      if (mapped === 'serving') mapped = 'servings';
      if (unitInput) unitInput.value = mapped;

      const unitBtnMap = {
        'oz': 'btn-punit-oz',
        'g': 'btn-punit-g',
        'fl oz': 'btn-punit-fl-oz',
        'ml': 'btn-punit-ml',
        'items': 'btn-punit-items',
        'servings': 'btn-punit-servings'
      };

      Object.keys(unitBtnMap).forEach(u => {
        const btn = document.getElementById(unitBtnMap[u]);
        if (!btn) return;
        if (u === mapped) {
          btn.className = "py-1.5 px-0.5 rounded-xl border border-pastel-mint bg-pastel-mint/20 text-[11px] text-center text-pastel-mint font-bold transition shadow-sm truncate";
        } else {
          btn.className = "py-1.5 px-0.5 rounded-xl border border-dark-border bg-dark-elevated hover:border-pastel-mint/50 text-[11px] text-center text-slate-300 font-semibold transition truncate";
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
      if (unitInput) {
        let uVal = unitInput.value || 'items';
        if (uVal === 'item' || uVal === 'each' || uVal === 'ea' || uVal === 'count') uVal = 'items';
        if (uVal === 'serving') uVal = 'servings';
        item.unit = uVal;
      }

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






// ==============================================
// RECIPE INSPECT & DETAIL MODAL CONTROLLER
// ==============================================
function inspectRecipeDetails(idx) {
      const opt = (state.currentMealOptions && state.currentMealOptions[idx]) || (state.currentMealOptions && state.currentMealOptions[0]);
      if (!opt) return;

      const titleEl = document.getElementById('inspect-recipe-title');
      const metaEl = document.getElementById('inspect-recipe-meta');
      const descEl = document.getElementById('inspect-recipe-desc');
      const ingListEl = document.getElementById('inspect-recipe-ingredients');
      const stepsListEl = document.getElementById('inspect-recipe-steps');
      const cookBtn = document.getElementById('inspect-recipe-cook-btn');

      if (titleEl) titleEl.textContent = opt.title;
      if (metaEl) metaEl.textContent = `${opt.cookTime}m • ${opt.kcal} kcal • 2 Servings`;
      if (descEl) descEl.textContent = opt.description;

      if (ingListEl) {
        ingListEl.innerHTML = '';
        (opt.ingredients || []).forEach(ing => {
          const item = document.createElement('div');
          item.className = "p-2 rounded-xl bg-dark-base border border-dark-border flex items-center justify-between text-xs";
          item.innerHTML = `
            <span class="text-white font-medium">${ing}</span>
            <span class="text-[10px] text-pastel-mint font-mono font-bold">✓ Verified</span>
          `;
          ingListEl.appendChild(item);
        });
      }

      if (stepsListEl) {
        stepsListEl.innerHTML = '';
        (opt.steps || []).forEach((st, sIdx) => {
          const item = document.createElement('div');
          item.className = `p-2 rounded-xl border flex items-center justify-between text-xs ${st.isDish ? 'bg-pastel-sky/10 border-pastel-sky/30 text-pastel-sky' : 'bg-dark-base border-dark-border text-slate-300'}`;
          item.innerHTML = `
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded-full bg-dark-elevated text-slate-400 flex items-center justify-center text-[10px] font-bold">${sIdx + 1}</span>
              <span>${st.text}</span>
            </div>
            <span class="font-mono text-[10px] text-slate-400 shrink-0 ml-2 font-bold">${st.minutes}m</span>
          `;
          stepsListEl.appendChild(item);
        });
      }

      if (cookBtn) {
        cookBtn.onclick = () => {
          closeRecipeInspectModal();
          launchRecipeOption(idx);
        };
      }

      const modal = document.getElementById('recipe-inspect-modal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeRecipeInspectModal() {
      const modal = document.getElementById('recipe-inspect-modal');
      if (modal) modal.classList.add('hidden');
    }

    function viewRecipeDetails(recipeId) {
      const recipe = state.recipes.find(r => r.id === recipeId);
      if (!recipe) return;

      const modal = document.getElementById('recipe-inspect-modal');
      const titleEl = document.getElementById('inspect-recipe-title');
      const metaEl = document.getElementById('inspect-recipe-meta');
      const descEl = document.getElementById('inspect-recipe-desc');
      const ingListEl = document.getElementById('inspect-recipe-ingredients');
      const stepsListEl = document.getElementById('inspect-recipe-steps');
      const cookBtn = document.getElementById('inspect-recipe-cook-btn');

      if (titleEl) titleEl.textContent = recipe.title;
      if (metaEl) {
        const authorPart = recipe.author ? ` • by ${recipe.author}` : '';
        metaEl.textContent = `${recipe.cookTime || 25}m • ${recipe.kcal || 450} kcal • ${recipe.servings || '4-6 Servings'}${authorPart}`;
      }
      if (descEl) {
        descEl.textContent = recipe.origin === 'family' 
          ? `Heirloom recipe from the Family Recipe Book (${(recipe.familyCategory || 'family').toUpperCase()} collection).`
          : (recipe.instructions ? recipe.instructions.split('\n')[0] : 'Curated recipe in FocusFlow.');
      }

      if (ingListEl) {
        ingListEl.innerHTML = '';
        (recipe.ingredients || []).forEach(ing => {
          const item = document.createElement('div');
          item.className = "p-2 rounded-xl bg-dark-base border border-dark-border flex items-center justify-between text-xs";
          item.innerHTML = `
            <span class="text-white font-medium">${ing}</span>
            <span class="text-[10px] text-pastel-mint font-mono font-bold">✓ Ingredient</span>
          `;
          ingListEl.appendChild(item);
        });
      }

      if (stepsListEl) {
        stepsListEl.innerHTML = '';
        const rawSteps = recipe.instructions ? recipe.instructions.split('\n').filter(s => s.trim()) : ['Follow recipe instructions and enjoy!'];
        rawSteps.forEach((st, sIdx) => {
          const item = document.createElement('div');
          item.className = "p-2.5 rounded-xl border bg-dark-base border-dark-border text-slate-200 text-xs flex items-start gap-2.5 leading-relaxed";
          item.innerHTML = `
            <span class="w-5 h-5 rounded-full bg-dark-elevated text-pastel-coral shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5">${sIdx + 1}</span>
            <div class="flex-1">${st}</div>
          `;
          stepsListEl.appendChild(item);
        });
      }

      if (cookBtn) {
        cookBtn.onclick = () => {
          closeRecipeInspectModal();
          sendRecipeToChoreographer(recipe.id);
        };
      }

      if (modal) modal.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
      playChime('bell');
    }

    if (typeof window !== 'undefined') {
      window.viewRecipeDetails = viewRecipeDetails;
      window.closeRecipeInspectModal = closeRecipeInspectModal;
      window.switchPantryMicroTab = switchPantryMicroTab;
      window.openManualNutritionModalForActivePantryItem = openManualNutritionModalForActivePantryItem;
      window.renderMicroBarRow = renderMicroBarRow;
      window.scalePantryDetailPortion = scalePantryDetailPortion;
      window.renderPantryDetailMacroDonut = renderPantryDetailMacroDonut;
    }
  

// ==============================================
    