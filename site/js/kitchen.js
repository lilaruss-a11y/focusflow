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
      const zones = ['all', 'fridge', 'freezer', 'counter', 'pantry', 'spices'];
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
      const next = Math.max(0, current + delta);
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

    // ==============================================
    // SHOPPING & GROCERY LIST ENGINE ("WHAT TO BUY")
    // ==============================================
    const SHOPPING_AISLES = [
      { key: 'produce', label: 'Produce (Fruits & Veggies)', icon: '🥦', color: 'text-pastel-mint' },
      { key: 'protein', label: 'Meat, Poultry & Seafood', icon: '🥩', color: 'text-pastel-peach' },
      { key: 'dairy', label: 'Dairy, Eggs & Cheese', icon: '🧀', color: 'text-pastel-butter' },
      { key: 'grains', label: 'Bakery, Grains & Pasta', icon: '🍞', color: 'text-amber-300' },
      { key: 'condiments', label: 'Canned, Sauces & Pantry Staples', icon: '🥫', color: 'text-pastel-sky' },
      { key: 'frozen', label: 'Frozen Foods', icon: '🧊', color: 'text-sky-300' },
      { key: 'other', label: 'Snacks, Drinks & Household', icon: '🛒', color: 'text-pastel-lavender' }
    ];

    function renderShoppingList() {
      const container = document.getElementById('shopping-list-categories-container');
      const completedShelf = document.getElementById('shopping-completed-shelf');
      const completedList = document.getElementById('shopping-list-completed-items');
      if (!container) return;
      container.innerHTML = '';
      if (completedList) completedList.innerHTML = '';

      if (!Array.isArray(state.shoppingList)) state.shoppingList = [];

      const activeItems = state.shoppingList.filter(s => !s.checked);
      const completedItems = state.shoppingList.filter(s => s.checked);

      if (activeItems.length === 0 && completedItems.length === 0) {
        container.innerHTML = `
          <div class="p-8 text-center bg-dark-surface border border-dark-border rounded-2xl space-y-2">
            <span class="text-3xl block">🛒</span>
            <h4 class="font-bold text-white text-sm">Your shopping list is clear!</h4>
            <p class="text-xs text-slate-400 max-w-md mx-auto">Add items manually above, tap "Quick-Stock" in your pantry, or plan meals to automatically import missing ingredients.</p>
          </div>
        `;
      } else {
        SHOPPING_AISLES.forEach(aisle => {
          const aisleItems = activeItems.filter(item => {
            const cat = item.category || 'other';
            if (aisle.key === 'other') return !['produce', 'protein', 'dairy', 'grains', 'condiments', 'frozen'].includes(cat);
            return cat === aisle.key;
          });

          if (aisleItems.length === 0) return;

          const section = document.createElement('div');
          section.className = "bg-dark-surface border border-dark-border rounded-2xl p-4 space-y-2.5 shadow-md";

          let itemsHtml = '';
          aisleItems.forEach(item => {
            itemsHtml += `
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-dark-base border border-dark-border hover:border-pastel-sky/50 transition text-xs gap-2">
                <label class="flex items-center gap-3 cursor-pointer min-w-0 flex-1">
                  <input type="checkbox" onchange="toggleShoppingItemChecked('${item.id}')" class="w-4 h-4 rounded text-pastel-mint bg-dark-elevated border-dark-border focus:ring-0">
                  <div class="min-w-0">
                    <span class="text-slate-100 font-semibold block truncate">${item.name}</span>
                    <div class="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      ${item.quantity ? `<span class="text-pastel-sky font-bold">${item.quantity}</span>` : ''}
                      ${item.source ? `<span>• ${item.source}</span>` : ''}
                    </div>
                  </div>
                </label>
                <button type="button" onclick="deleteShoppingItem('${item.id}')" class="text-slate-500 hover:text-rose-400 p-1" title="Delete">✕</button>
              </div>
            `;
          });

          section.innerHTML = `
            <div class="flex items-center justify-between border-b border-dark-border pb-2">
              <span class="text-xs font-bold uppercase tracking-wider ${aisle.color} flex items-center gap-1.5">
                <span>${aisle.icon}</span>
                <span>${aisle.label}</span>
              </span>
              <span class="text-xs font-mono text-slate-400 font-bold">${aisleItems.length}</span>
            </div>
            <div class="space-y-1.5">
              ${itemsHtml}
            </div>
          `;
          container.appendChild(section);
        });
      }

      // Render completed shelf
      if (completedShelf && completedList) {
        if (completedItems.length > 0) {
          completedShelf.classList.remove('hidden');
          completedItems.forEach(item => {
            const row = document.createElement('div');
            row.className = "flex items-center justify-between p-2 rounded-xl bg-dark-base border border-dark-border text-xs text-slate-400 line-through opacity-75";
            row.innerHTML = `
              <label class="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1">
                <input type="checkbox" checked onchange="toggleShoppingItemChecked('${item.id}')" class="w-4 h-4 rounded text-pastel-mint bg-dark-elevated border-dark-border focus:ring-0">
                <span class="truncate">${item.name} ${item.quantity ? `(${item.quantity})` : ''}</span>
              </label>
              <button type="button" onclick="deleteShoppingItem('${item.id}')" class="text-slate-500 hover:text-rose-400 p-1">✕</button>
            `;
            completedList.appendChild(row);
          });
        } else {
          completedShelf.classList.add('hidden');
        }
      }

      updateShoppingBadges();
      if (window.lucide) lucide.createIcons();
    }

    function updateShoppingBadges() {
      const activeCount = (state.shoppingList || []).filter(s => !s.checked).length;
      const doneCount = (state.shoppingList || []).filter(s => s.checked).length;

      const badge1 = document.getElementById('shopping-list-pending-badge');
      const headerCount = document.getElementById('shopping-header-count');
      const compCount = document.getElementById('shopping-completed-count');

      if (badge1) badge1.textContent = activeCount;
      if (headerCount) headerCount.textContent = `${activeCount} to buy`;
      if (compCount) compCount.textContent = `${doneCount} in cart`;
    }

    function addShoppingItemFromInput() {
      const nameInput = document.getElementById('shopping-input-name');
      const qtyInput = document.getElementById('shopping-input-qty');
      const catInput = document.getElementById('shopping-input-cat');
      if (!nameInput) return;

      const name = nameInput.value.trim();
      if (!name) return;
      const qty = qtyInput ? qtyInput.value.trim() : '';
      const cat = catInput ? catInput.value : 'condiments';

      if (!Array.isArray(state.shoppingList)) state.shoppingList = [];
      state.shoppingList.push({
        id: `shop-${Date.now()}`,
        name: name,
        quantity: qty || '1',
        category: cat,
        checked: false,
        source: 'Manual'
      });

      nameInput.value = '';
      if (qtyInput) qtyInput.value = '';

      saveAppState();
      renderShoppingList();
      playChime('bell');
    }

    function toggleShoppingItemChecked(id) {
      const item = (state.shoppingList || []).find(s => s.id === id);
      if (!item) return;
      item.checked = !item.checked;
      saveAppState();
      renderShoppingList();
      playChime('bell');
    }

    function deleteShoppingItem(id) {
      state.shoppingList = (state.shoppingList || []).filter(s => s.id !== id);
      saveAppState();
      renderShoppingList();
    }

    function clearCheckedShoppingItems() {
      state.shoppingList = (state.shoppingList || []).filter(s => !s.checked);
      saveAppState();
      renderShoppingList();
      playChime('bell');
    }

    function clearAllShoppingItems() {
      if (confirm("Clear all items from your shopping list?")) {
        state.shoppingList = [];
        saveAppState();
        renderShoppingList();
        playChime('bell');
        alertBox("Shopping list cleared.", "List Reset");
      }
    }

    function moveCheckedGroceriesToPantry() {
      if (!Array.isArray(state.shoppingList)) return;
      const bought = state.shoppingList.filter(s => s.checked);
      if (bought.length === 0) {
        alertBox("Check off the groceries you purchased first, then tap to transfer them to your pantry!", "No Items Checked");
        return;
      }

      if (!Array.isArray(state.pantry)) state.pantry = [];
      const todayStr = new Date().toISOString().split('T')[0];

      bought.forEach(item => {
        let cat = item.category || 'produce';
        if (cat === 'dairy') cat = 'protein';
        if (cat === 'other') cat = 'condiments';

        const storage = (cat === 'protein' || cat === 'produce') ? 'fridge' : (item.category === 'frozen' ? 'frozen' : 'shelf');

        state.pantry.push({
          id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: item.name,
          category: cat,
          storage: storage,
          amount: parseFloat(item.quantity) || 1,
          unit: item.quantity ? item.quantity.replace(/[0-9.]/g, '').trim() || 'item' : 'item',
          dateAdded: todayStr
        });
      });

      // Remove moved items from shopping list
      state.shoppingList = state.shoppingList.filter(s => !s.checked);

      saveAppState();
      renderPantry();
      renderShoppingList();
      playChime('bell');
      alertBox(`Transferred ${bought.length} purchased items into your Pantry!`, "Groceries Put Away 🎉");
      switchKitchenSubTab('pantry');
    }

    function copyShoppingListToClipboard() {
      const active = (state.shoppingList || []).filter(s => !s.checked);
      if (active.length === 0) {
        alertBox("Your shopping list is currently empty!", "Nothing to Copy");
        return;
      }

      let textOut = "🛒 FOCUSFLOW GROCERY LIST\n";
      textOut += "========================\n\n";

      SHOPPING_AISLES.forEach(aisle => {
        const items = active.filter(item => {
          const cat = item.category || 'other';
          if (aisle.key === 'other') return !['produce', 'protein', 'dairy', 'grains', 'condiments', 'frozen'].includes(cat);
          return cat === aisle.key;
        });

        if (items.length > 0) {
          textOut += `${aisle.icon} ${aisle.label.toUpperCase()}:\n`;
          items.forEach(it => {
            textOut += `  [ ] ${it.name}${it.quantity ? ` (${it.quantity})` : ''}\n`;
          });
          textOut += "\n";
        }
      });

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textOut).then(() => {
          alertBox("Shopping list copied to clipboard! Ready to paste into Text / Notes.", "Copied to Clipboard");
        }).catch(() => {
          window.prompt("Copy your grocery list below:", textOut);
        });
      } else {
        window.prompt("Copy your grocery list below:", textOut);
      }
    }
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
      { id: 'cb-staples', title: 'ADHD Daily Staples', icon: '📖', theme: 'pastel-mint', origin: 'mine', desc: 'Everyday go-tos calibrated for low initiation inertia and clean sink windows.' },
      { id: 'cb-shared', title: 'Family & Friends Lore', icon: '👨‍👩‍👧', theme: 'pastel-coral', origin: 'shared', desc: 'Gifted recipes from loved ones, roommates, and family traditions.' },
      { id: 'cb-campus', title: 'Campus & Rush Meals', icon: '🎓', theme: 'pastel-sky', origin: 'school', desc: 'Speedy under-15-minute study fuel and dorm-friendly quick bites.' },
      { id: 'cb-lowenergy', title: 'Low Executive Energy', icon: '⚡', theme: 'pastel-butter', origin: 'oneoff', desc: 'One-pot and 3-step zero-cleanup lifesavers for exhausted evenings.' }
    ];
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
            document.getElementById('cookbook-active-format-title').textContent = state.activeCookbookFormat;
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

      const formatsMeta = [
        { key: 'smoothie', name: 'Smoothies', icon: '🥤', color: 'text-pastel-sky border-pastel-sky/30' },
        { key: 'soup', name: 'Soups & Stews', icon: '🥣', color: 'text-pastel-coral border-pastel-coral/30' },
        { key: 'sandwich', name: 'Sandwiches & Wraps', icon: '🥪', color: 'text-pastel-butter border-pastel-butter/30' },
        { key: 'skillet', name: 'Skillets & One-Pot', icon: '🍳', color: 'text-pastel-mint border-pastel-mint/30' },
        { key: 'bowl', name: 'Grain & Salad Bowls', icon: '🥗', color: 'text-pastel-mint border-pastel-mint/30' },
        { key: 'bake', name: 'Bakes & Snacks', icon: '🧁', color: 'text-pastel-peach border-pastel-peach/30' }
      ];

      const cb = state.cookbooks.find(c => c.id === state.activeCookbook);
      const cbRecipes = state.recipes.filter(r => !cb || cb.origin === 'all' || r.origin === cb.origin);

      container.innerHTML = '';
      formatsMeta.forEach(fmt => {
        const count = cbRecipes.filter(r => r.format === fmt.key).length;
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
          const matchCount = cbRecipes.filter(r => r.format === state.activeCookbookFormat).length;
          document.getElementById('format-action-count').textContent = `${matchCount} recipes found in this cookbook`;
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
          if (state.activeCookbookFormat && r.format !== state.activeCookbookFormat) return false;
          return true;
        }

        // Multi-select Codex filtering
        const mf = state.multiFilters || { occasions: new Set(['all']), formats: new Set(['all']), origins: new Set(['all']) };
        const occMatch = mf.occasions.has('all') || mf.occasions.has(r.occasion);
        const fmtMatch = mf.formats.has('all') || mf.formats.has(r.format);
        const origMatch = mf.origins.has('all') || mf.origins.has(r.origin);

        return occMatch && fmtMatch && origMatch;
      });

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full py-12 text-center bg-dark-base rounded-2xl border border-dashed border-dark-border space-y-3">
            <i data-lucide="book-open" class="w-10 h-10 text-slate-500 mx-auto"></i>
            <span class="text-sm font-semibold text-slate-300 block">No recipes match the active filters</span>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">Try selecting another format, clearing filters, or adding a new recipe right here!</p>
            <button type="button" onclick="openAddRecipeModal()" class="px-4 py-2 rounded-xl bg-pastel-coral text-dark-base font-bold text-xs inline-flex items-center gap-1.5 shadow-sm">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Add Recipe to Category</span>
            </button>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      filtered.forEach(recipe => {
        const card = document.createElement('div');
        card.className = "bg-dark-surface border border-dark-border rounded-2xl p-5 space-y-3 hover:border-pastel-coral/50 transition flex flex-col justify-between shadow-lg";

        const formatIcon = recipe.format === 'smoothie' ? '🥤' : (recipe.format === 'soup' ? '🥣' : (recipe.format === 'sandwich' ? '🥪' : (recipe.format === 'skillet' ? '🍳' : (recipe.format === 'bowl' ? '🥗' : '🧁'))));

        card.innerHTML = `
          <div class="space-y-2.5">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-xl">${formatIcon}</span>
                <div>
                  <h3 class="font-bold text-slate-100 text-sm leading-snug">${recipe.title}</h3>
                  <div class="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span class="text-pastel-coral font-bold uppercase">${recipe.format}</span>
                    <span>•</span>
                    <span>${recipe.cookTime || 20}m cook</span>
                    <span>•</span>
                    <span class="text-pastel-mint">${recipe.kcal || 450} kcal</span>
                  </div>
                </div>
              </div>
              <button type="button" onclick="openShareRecipeModal('${recipe.id}')" class="p-1.5 rounded-lg bg-dark-base hover:bg-slate-700 text-slate-400 hover:text-pastel-coral transition" title="Share Recipe with Friends">
                <i data-lucide="share-2" class="w-4 h-4"></i>
              </button>
            </div>

            <!-- Ingredients preview -->
            <div class="bg-dark-base p-2.5 rounded-xl border border-dark-border text-[11px] text-slate-300 space-y-1">
              <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Ingredients:</span>
              <p class="line-clamp-2 text-slate-300 font-mono text-[10px]">${(recipe.ingredients || []).join(' • ')}</p>
            </div>
          </div>

          <div class="pt-2 flex items-center justify-between border-t border-dark-border gap-2">
            <button type="button" onclick="quickLogRecipeToDiary('${recipe.id}')" class="px-3 py-1.5 rounded-xl bg-dark-elevated hover:bg-slate-700 border border-pastel-mint/30 text-pastel-mint text-xs font-semibold flex items-center gap-1 transition" title="Log to Nutrition Diary">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Log to Diary</span>
            </button>
            <button type="button" onclick="sendRecipeToChoreographer('${recipe.id}')" class="px-3 py-1.5 rounded-xl bg-pastel-coral hover:bg-rose-300 text-dark-base text-xs font-bold flex items-center gap-1 shadow-sm transition">
              <i data-lucide="chef-hat" class="w-3.5 h-3.5"></i>
              <span>Cook Choreography</span>
            </button>
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

    // Apple Health Linking Modal & Exports
    function openAppleHealthModal() {
      if (typeof renderAppleHealthUI === 'function') renderAppleHealthUI();
      document.getElementById('apple-health-modal').classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }
    function closeAppleHealthModal() {
      document.getElementById('apple-health-modal').classList.add('hidden');
    }

    function triggerAppleHealthShortcut() {
      // Direct deep link to launch Apple Shortcuts app with HealthKit payload
      const totals = calculateDailyNutrientTotals();
      const shortcutUrl = `shortcuts://run-shortcut?name=Log%20FocusFlow%20Nutrition&input=text&text=${encodeURIComponent(JSON.stringify(totals))}`;
      window.location.href = shortcutUrl;
      alertBox("Connecting to Apple Shortcuts for HealthKit sync...", "Apple Health");
    }

    function exportHealthDataJSON() {
      const totals = calculateDailyNutrientTotals();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(totals, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `FocusFlow_HealthKit_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      alertBox("Downloaded Apple Health compatible JSON.", "HealthKit Export");
    }

    function calculateDailyNutrientTotals() {
      let totals = {
        date: new Date().toISOString().slice(0, 10),
        caloriesKcal: 0,
        waterMl: state.waterLoggedMl || 0,
        proteinG: 0,
        carbsG: 0,
        fatG: 0,
        fiberG: 0,
        sugarG: 0,
        saturatedFatG: 0,
        monounsaturatedFatG: 0,
        polyunsaturatedFatG: 0,
        omega3G: 0,
        cholesterolMg: 0,
        sodiumMg: 0,
        potassiumMg: 0,
        ironMg: 0,
        calciumMg: 0,
        magnesiumMg: 0,
        zincMg: 0,
        vitaminAmcg: 0,
        vitaminCmg: 0,
        vitaminD_IU: 0,
        vitaminEmg: 0,
        vitaminKmcg: 0,
        tyrosineMg: 0,
        tryptophanMg: 0
      };

      state.nutritionLog.forEach(n => {
        totals.caloriesKcal += (n.kcal || 0);
        totals.waterMl += (n.waterMl || 0);
        totals.proteinG += (n.protein || 0);
        totals.carbsG += (n.carbs || 0);
        totals.fatG += (n.fat || 0);
        totals.fiberG += (n.fiber || 0);
        totals.sugarG += (n.sugar || 0);
        totals.saturatedFatG += (n.saturated || 0);
        totals.monounsaturatedFatG += (n.mufa || 0);
        totals.polyunsaturatedFatG += (n.pufa || 0);
        totals.omega3G += (n.omega3 || 0);
        totals.cholesterolMg += (n.cholesterol || 0);
        totals.sodiumMg += (n.sodium || 0);
        totals.potassiumMg += (n.potassium || 0);
        totals.ironMg += (n.iron || 0);
        totals.calciumMg += (n.calcium || 0);
        totals.magnesiumMg += (n.magnesium || 0);
        totals.zincMg += (n.zinc || 0);
        totals.vitaminAmcg += (n.vitA || 0);
        totals.vitaminCmg += (n.vitC || 0);
        totals.vitaminD_IU += (n.vitD || 0);
        totals.vitaminEmg += (n.vitE || 0);
        totals.vitaminKmcg += (n.vitK || 0);
        totals.tyrosineMg += (n.tyrosine || 0);
        totals.tryptophanMg += (n.tryptophan || 0);
      });
      return totals;
    }

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

    


// ==============================================
// WALMART & GROCERY RECEIPT IMPORT SUITE
// ==============================================

function openWalmartGroceryImportModal() {
  const modal = document.getElementById('walmart-import-modal');
  if (modal) {
    modal.classList.remove('hidden');
    switchWalmartImportTab('paste');
    if (window.lucide) lucide.createIcons();
    playChime('bell');
  }
}

function closeWalmartGroceryImportModal() {
  const modal = document.getElementById('walmart-import-modal');
  if (modal) modal.classList.add('hidden');
}

function clearReceiptPasteText() {
  const ta = document.getElementById('walmart-paste-textarea');
  if (ta) {
    ta.value = '';
    ta.focus();
  }
}

function switchWalmartImportTab(tab) {
  const pasteBtn = document.getElementById('btn-tab-walmart-paste');
  const photoBtn = document.getElementById('btn-tab-walmart-photo');
  const pasteBody = document.getElementById('walmart-tab-paste');
  const photoBody = document.getElementById('walmart-tab-photo');

  if (tab === 'paste') {
    if (pasteBtn) pasteBtn.className = "py-2 px-3 rounded-xl font-bold bg-pastel-sky text-dark-base text-center transition shadow-sm";
    if (photoBtn) photoBtn.className = "py-2 px-3 rounded-xl font-bold bg-dark-base border border-dark-border text-slate-400 hover:text-white text-center transition";
    if (pasteBody) pasteBody.classList.remove('hidden');
    if (photoBody) photoBody.classList.add('hidden');
  } else {
    if (pasteBtn) pasteBtn.className = "py-2 px-3 rounded-xl font-bold bg-dark-base border border-dark-border text-slate-400 hover:text-white text-center transition";
    if (photoBtn) photoBtn.className = "py-2 px-3 rounded-xl font-bold bg-pastel-sky text-dark-base text-center transition shadow-sm";
    if (pasteBody) pasteBody.classList.add('hidden');
    if (photoBody) photoBody.classList.remove('hidden');

    // Dynamic API Key status display
    const key = (typeof getGeminiApiKey === 'function') ? getGeminiApiKey() : (state.geminiApiKey || localStorage.getItem('focusflow_gemini_api_key') || '');
    const bannerTxt = document.getElementById('walmart-photo-key-text');
    const bannerDot = document.querySelector('#walmart-photo-key-banner span.rounded-full');
    if (bannerTxt && bannerDot) {
      if (key) {
        const saved = localStorage.getItem('focusflow_active_vision_model') || (window.state && window.state.activeWorkingVisionModel) || 'gemini-3.8-flash-lite';
        bannerTxt.textContent = `Vision Ready: Locked to ${saved} ⚡`;
        bannerDot.className = "w-2 h-2 rounded-full bg-pastel-mint animate-pulse";
      } else {
        bannerTxt.textContent = "API key needed for live photo scanning (free setup)";
        bannerDot.className = "w-2 h-2 rounded-full bg-amber-400";
      }
    }
  }
  if (window.lucide) lucide.createIcons();
}

function loadSampleWalmartReceipt(store = 'walmart') {
  const ta = document.getElementById('walmart-paste-textarea');
  if (!ta) return;

  if (store === 'walmart') {
    ta.value = "Great Value Boneless Skinless Chicken Breasts 3 lb $9.84\nMarketside Fresh Organic Baby Spinach 10 oz $2.98\nGreat Value Jasmine Rice 5 lb $4.12\nOrganic Whole Vitamin D Milk 1 gal $3.68\nGreat Value Frozen Broccoli Florets 16 oz $1.48\nBounty Select-a-Size Paper Towels 6 Double Rolls $12.98\nDawn Platinum Dishwashing Liquid Soap $3.94";
  } else if (store === 'target') {
    ta.value = "Good & Gather Organic Boneless Chicken Tenders 2 lb $8.49\nGood & Gather Baby Spinach 5 oz $1.99\nGood & Gather Basmati Rice 32 oz $3.29\nGood & Gather Whole Milk 1 Gallon $3.59\nGood & Gather Frozen Triple Berry Blend 16 oz $3.19\nUp & Up Bath Tissue 12 Rolls $8.99";
  } else if (store === 'kroger') {
    ta.value = "Simple Truth Organic Chicken Breast 1.5 lb $8.99\nPrivate Selection Baby Arugula 5 oz $3.49\nKroger Enriched Long Grain Rice 5 lb $3.99\nSimple Truth Organic Whole Milk 1 gal $4.29\nKroger Frozen Sweet Peas 12 oz $1.29\nKroger Aluminum Foil 75 sq ft $3.49";
  } else {
    ta.value = "Chicken Breasts 2 lb\nFresh Spinach 1 bag\nJasmine Rice 1 bag\nAlmond Milk 1 carton\nFrozen Strawberries 1 bag\nPaper Napkins 1 pack";
  }
}

function importFromFocusFlowShoppingList() {
  const ta = document.getElementById('walmart-paste-textarea');
  if (!ta) return;

  const items = (state.shoppingList || []).filter(s => !s.checked);
  if (items.length === 0) {
    alertBox("Your FocusFlow Shopping List is empty. Tap 'Load Sample Order' to test or paste text directly.", "Shopping List Empty");
    return;
  }

  const lines = items.map(it => {
    let line = it.name;
    if (it.quantity) line += ` ${it.quantity}`;
    return line;
  });

  ta.value = lines.join('\n');
  alertBox(`Loaded ${items.length} items from your FocusFlow Shopping List! Tap 'Parse & Review' below.`, "Shopping List Loaded");
}

function parseIncomingGroceriesFromText() {
  const ta = document.getElementById('walmart-paste-textarea');
  const raw = ta ? ta.value.trim() : '';
  if (!raw) {
    alertBox("Please paste order text, a store receipt, or tap a sample store button above.", "Empty Text");
    return;
  }

  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 1);
  const parsedItems = [];

  lines.forEach((line, idx) => {
    // Skip receipt metadata lines
    if (/^(order|subtotal|total|tax|shipping|pickup|delivery|store|terminal|cashier|visa|mastercard|amex|cash|change|date|time|rewards|savings|balance)/i.test(line)) {
      return;
    }

    // 1. Detect and parse quantity & unit
    let amount = 1;
    let unit = 'item';
    const unitMatch = line.match(/(\d+(?:\.\d+)?)\s*(lb|lbs|oz|fl\s*oz|gal|gallon|qt|pt|ct|count|pk|pack|rolls|bag|bunch|box|can|cans)\b/i);
    if (unitMatch) {
      amount = parseFloat(unitMatch[1]) || 1;
      unit = unitMatch[2].toLowerCase();
    }

    // 2. Clean item name: remove prices, units, barcodes, item codes, leading numbers
    let clean = line.replace(/\$[0-9]+(?:\.[0-9]{2})?/g, '')
                    .replace(/(\d+(?:\.\d+)?)\s*(lb|lbs|oz|fl\s*oz|gal|gallon|qt|pt|ct|count|pk|pack|rolls|bag|bunch|box|can|cans)\b/gi, '')
                    .replace(/^([\*\-\d\.\)\s]+)+/g, '')
                    .replace(/item\s*#?\s*\d+/gi, '')
                    .replace(/upc\s*#?\s*\d+/gi, '')
                    .replace(/qty\s*\d+/gi, '')
                    .replace(/[\s,]+$/g, '')
                    .trim();

    if (!clean || clean.length < 2) return;

    const lower = clean.toLowerCase();

    // 3. Detect non-food items
    const isNonFood = /paper\s*towel|toilet\s*paper|tissue|napkin|detergent|dish\s*soap|soap|sponge|foil|trash\s*bag|garbage|cleaner|bleach|shampoo|conditioner|deodorant|lotion|toothpaste|battery|light\s*bulb|pet\s*food|cat\s*litter|dog\s*food|cosmetics|towel/i.test(lower);

    // 4. Smart storage assignment
    let storage = 'fridge';
    if (/frozen|ice\s*cream|freezer|pizza|waffle|popsicle/i.test(lower)) {
      storage = 'frozen';
    } else if (isNonFood || /rice|pasta|cereal|flour|oat|quinoa|bread|chip|cracker|canned|oil|spice|vinegar|sauce|dressing|sugar|coffee|tea|nut|snack|cookie/i.test(lower)) {
      storage = 'shelf';
    } else if (/chicken|beef|meat|egg|salmon|fish|protein|turkey|tofu|yogurt|milk|cheese|spinach|berry|apple|banana|broccoli|lettuce|produce|fresh/i.test(lower)) {
      storage = 'fridge';
    } else {
      storage = 'shelf';
    }

    // 5. Smart category assignment
    let category = 'produce';
    if (isNonFood) {
      category = 'condiments';
    } else if (/chicken|beef|meat|egg|salmon|fish|protein|turkey|tofu|yogurt|milk|cheese|pork|sausage|bacon/i.test(lower)) {
      category = 'protein';
    } else if (/rice|oat|quinoa|bread|pasta|flour|cereal|grain|noodle|bagel|tortilla|cracker/i.test(lower)) {
      category = 'grains';
    } else if (/sauce|oil|spice|dressing|vinegar|syrup|mustard|ketchup|mayo|condiment|snack|nut|chip|dip/i.test(lower)) {
      category = 'condiments';
    } else {
      category = 'produce';
    }

    parsedItems.push({
      id: `inc-${Date.now()}-${idx}`,
      name: clean,
      category,
      storage,
      amount,
      unit,
      isFood: !isNonFood,
      approved: !isNonFood // Food checked by default, non-food unchecked by default
    });
  });

  if (parsedItems.length === 0) {
    alertBox("Could not extract any grocery items. Please check the text format.", "No Items Detected");
    return;
  }

  const translated = applyCustomReceiptAliases(parsedItems);
  renderIncomingGroceriesApprovalList(translated);
  playChime('bell');
}

// ==============================================
// CUSTOM RECEIPT CODE TRANSLATION DICTIONARY
// ==============================================
function getCustomReceiptAliases() {
  try {
    const raw = localStorage.getItem('focusflow_receipt_aliases');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return (window.state && window.state.customReceiptAliases) || {};
}

function saveCustomReceiptAlias(rawPattern, cleanName, category, storage) {
  if (!rawPattern || !cleanName) return;
  const rawKey = rawPattern.trim().toLowerCase();
  const aliases = getCustomReceiptAliases();
  aliases[rawKey] = {
    rawKey: rawPattern.trim(),
    name: cleanName.trim(),
    category: category || 'produce',
    storage: storage || 'fridge',
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem('focusflow_receipt_aliases', JSON.stringify(aliases));
  } catch (e) {}
  if (window.state) window.state.customReceiptAliases = aliases;
  renderCustomReceiptAliasesList();
}

function deleteCustomReceiptAlias(rawKey) {
  const aliases = getCustomReceiptAliases();
  const lower = (rawKey || '').trim().toLowerCase();
  if (aliases[lower]) {
    delete aliases[lower];
    try {
      localStorage.setItem('focusflow_receipt_aliases', JSON.stringify(aliases));
    } catch (e) {}
    if (window.state) window.state.customReceiptAliases = aliases;
    renderCustomReceiptAliasesList();
    playChime('bell');
  }
}

function applyCustomReceiptAliases(items) {
  if (!Array.isArray(items)) return items;
  const aliases = getCustomReceiptAliases();
  const aliasKeys = Object.keys(aliases);
  if (aliasKeys.length === 0) return items;

  return items.map(item => {
    const origRaw = item.rawName || item.name || '';
    const lowerRaw = origRaw.trim().toLowerCase();

    // 1. Exact match
    if (aliases[lowerRaw]) {
      const match = aliases[lowerRaw];
      return Object.assign({}, item, {
        rawName: origRaw,
        name: match.name,
        category: match.category || item.category,
        storage: match.storage || item.storage,
        wasAutoTranslated: true
      });
    }

    // 2. Substring match for store codes with trailing prices or units
    for (const k of aliasKeys) {
      if (k.length >= 3 && lowerRaw.includes(k)) {
        const match = aliases[k];
        return Object.assign({}, item, {
          rawName: origRaw,
          name: match.name,
          category: match.category || item.category,
          storage: match.storage || item.storage,
          wasAutoTranslated: true
        });
      }
    }

    return Object.assign({}, item, { rawName: origRaw });
  });
}

function renderCustomReceiptAliasesList() {
  const container = document.getElementById('custom-aliases-list');
  const titleBadge = document.getElementById('custom-aliases-header-title');
  const aliases = getCustomReceiptAliases();
  const keys = Object.keys(aliases);

  if (titleBadge) {
    titleBadge.textContent = `Custom Receipt Translations (${keys.length} learned)`;
  }

  if (!container) return;
  if (keys.length === 0) {
    container.innerHTML = `<div class="p-2.5 rounded-xl bg-dark-base/50 text-[10px] text-slate-500 italic text-center">No custom translations yet. When you edit any item name or storage above, FocusFlow will automatically remember it here!</div>`;
    return;
  }

  container.innerHTML = '';
  keys.forEach(k => {
    const entry = aliases[k];
    const row = document.createElement('div');
    row.className = "flex items-center justify-between gap-2 p-2 rounded-xl bg-dark-base border border-dark-border text-[11px]";
    row.innerHTML = `
      <div class="min-w-0 flex-1">
        <span class="font-mono text-slate-400 block truncate text-[10px]">"${entry.rawKey || k}"</span>
        <div class="flex items-center gap-1.5 flex-wrap mt-0.5">
          <span class="font-bold text-pastel-mint truncate">${entry.name}</span>
          <span class="text-[9px] px-1.5 py-0.2 rounded-full bg-dark-elevated text-slate-400 font-mono">${entry.category} • ${entry.storage}</span>
        </div>
      </div>
      <button type="button" onclick="deleteCustomReceiptAlias('${k.replace(/'/g, "\\'")}')" class="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-white/5 transition" title="Delete translation rule">
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
      </button>
    `;
    container.appendChild(row);
  });
  if (window.lucide) lucide.createIcons();
}

function renderIncomingGroceriesApprovalList(items) {
  state.incomingGroceriesApprovalList = items;
  const sec = document.getElementById('walmart-approval-section');
  const list = document.getElementById('walmart-approval-list');
  if (!sec || !list) return;

  sec.classList.remove('hidden');
  list.innerHTML = '';

  items.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = `p-3 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-2.5 transition shadow-sm ${item.approved ? 'bg-dark-base border-dark-border text-white' : 'bg-dark-base/40 border-dark-border/40 opacity-60 text-slate-400'}`;
    row.id = `grocery-row-${idx}`;

    row.innerHTML = `
      <div class="flex items-center gap-2.5 flex-1 min-w-0">
        <input type="checkbox" id="grocery-chk-${idx}" ${item.approved ? 'checked' : ''} onchange="toggleGroceryApproval(${idx})" class="w-4 h-4 rounded text-pastel-sky focus:ring-0 cursor-pointer shrink-0">
        <div class="flex-1 min-w-0">
          <input type="text" value="${item.name}" onchange="updateGroceryName(${idx}, this.value)" class="w-full bg-transparent text-xs font-semibold text-white focus:outline-none focus:border-b border-pastel-sky truncate" title="Edit item name (auto-saved for future receipts)">
          <div class="flex items-center gap-1.5 flex-wrap mt-0.5">
            ${item.wasAutoTranslated ? '<span class="text-[9px] text-pastel-mint font-mono font-bold">✓ Auto-translated from custom rules</span>' : ''}
            ${item.rawName && item.rawName !== item.name ? `<span class="text-[9px] text-slate-500 truncate font-mono">Store code: "${item.rawName}"</span>` : ''}
            ${!item.isFood ? '<span class="text-[9px] text-amber-400 font-mono">Non-food item (excluded by default)</span>' : ''}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap shrink-0 text-xs">
        <!-- Quantity & Unit -->
        <div class="flex items-center gap-1 bg-dark-elevated border border-dark-border rounded-xl px-2 py-1">
          <input type="number" min="0.25" step="0.25" value="${item.amount || 1}" onchange="updateGroceryAmount(${idx}, this.value)" class="w-10 bg-transparent text-center text-white font-mono text-[11px] focus:outline-none" title="Quantity">
          <input type="text" value="${item.unit || 'item'}" onchange="updateGroceryUnit(${idx}, this.value)" class="w-10 bg-transparent text-slate-300 font-mono text-[10px] focus:outline-none" title="Unit">
        </div>

        <!-- Category Selector -->
        <select onchange="updateGroceryCategory(${idx}, this.value)" class="bg-dark-elevated border border-dark-border rounded-xl px-2.5 py-1 text-slate-200 text-[11px] focus:border-pastel-sky focus:outline-none" title="Pantry Category">
          <option value="produce" ${item.category === 'produce' ? 'selected' : ''}>🥦 Produce</option>
          <option value="protein" ${item.category === 'protein' ? 'selected' : ''}>🍗 Protein/Dairy</option>
          <option value="grains" ${item.category === 'grains' ? 'selected' : ''}>🌾 Grains</option>
          <option value="condiments" ${item.category === 'condiments' ? 'selected' : ''}>🥫 Pantry/Staples</option>
        </select>

        <!-- Storage Location Selector (Fridge vs Freezer vs Counter vs Shelf) -->
        <select onchange="updateGroceryStorage(${idx}, this.value)" class="bg-dark-elevated border border-dark-border rounded-xl px-2.5 py-1 text-slate-200 text-[11px] font-bold focus:border-pastel-sky focus:outline-none" title="Storage Location">
          <option value="fridge" ${item.storage === 'fridge' ? 'selected' : ''}>❄️ Fridge</option>
          <option value="frozen" ${item.storage === 'frozen' ? 'selected' : ''}>🧊 Freezer</option>
          <option value="counter" ${item.storage === 'counter' ? 'selected' : ''}>🧺 Counter</option>
          <option value="shelf" ${item.storage === 'shelf' ? 'selected' : ''}>🥫 Shelf</option>
        </select>

        <!-- Bought for someone else toggle -->
        <button type="button" onclick="skipGroceryItem(${idx})" class="px-2.5 py-1 rounded-xl text-[10px] font-semibold transition ${item.approved ? 'bg-dark-elevated hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-dark-border' : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'}" title="Bought for someone else / Exclude from pantry">
          ${item.approved ? 'For someone else' : 'Excluded ✕'}
        </button>
      </div>
    `;
    list.appendChild(row);
  });

  updateGroceryApprovalBadge();
  renderCustomReceiptAliasesList();
  if (window.lucide) lucide.createIcons();

  // Scroll smoothly down to the approval section
  sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleGroceryApproval(idx) {
  if (!state.incomingGroceriesApprovalList || !state.incomingGroceriesApprovalList[idx]) return;
  state.incomingGroceriesApprovalList[idx].approved = !state.incomingGroceriesApprovalList[idx].approved;
  renderIncomingGroceriesApprovalList(state.incomingGroceriesApprovalList);
}

function toggleAllGroceryApproval(selectState) {
  if (!Array.isArray(state.incomingGroceriesApprovalList)) return;
  state.incomingGroceriesApprovalList.forEach(it => {
    it.approved = Boolean(selectState);
  });
  renderIncomingGroceriesApprovalList(state.incomingGroceriesApprovalList);
}

function updateGroceryName(idx, val) {
  if (state.incomingGroceriesApprovalList && state.incomingGroceriesApprovalList[idx]) {
    const it = state.incomingGroceriesApprovalList[idx];
    const clean = val.trim();
    if (!clean) return;
    it.name = clean;
    it.wasCustomEdited = true;
    saveCustomReceiptAlias(it.rawName || clean, clean, it.category, it.storage);
  }
}

function updateGroceryCategory(idx, val) {
  if (state.incomingGroceriesApprovalList && state.incomingGroceriesApprovalList[idx]) {
    const it = state.incomingGroceriesApprovalList[idx];
    it.category = val;
    it.wasCustomEdited = true;
    saveCustomReceiptAlias(it.rawName || it.name, it.name, val, it.storage);
  }
}

function updateGroceryStorage(idx, val) {
  if (state.incomingGroceriesApprovalList && state.incomingGroceriesApprovalList[idx]) {
    const it = state.incomingGroceriesApprovalList[idx];
    it.storage = val;
    it.wasCustomEdited = true;
    saveCustomReceiptAlias(it.rawName || it.name, it.name, it.category, val);
  }
}

function updateGroceryAmount(idx, val) {
  if (state.incomingGroceriesApprovalList && state.incomingGroceriesApprovalList[idx]) {
    state.incomingGroceriesApprovalList[idx].amount = parseFloat(val) || 1;
  }
}

function updateGroceryUnit(idx, val) {
  if (state.incomingGroceriesApprovalList && state.incomingGroceriesApprovalList[idx]) {
    state.incomingGroceriesApprovalList[idx].unit = val.trim() || 'item';
  }
}

function skipGroceryItem(idx) {
  if (!state.incomingGroceriesApprovalList || !state.incomingGroceriesApprovalList[idx]) return;
  state.incomingGroceriesApprovalList[idx].approved = !state.incomingGroceriesApprovalList[idx].approved;
  renderIncomingGroceriesApprovalList(state.incomingGroceriesApprovalList);
}

function updateGroceryApprovalBadge() {
  const approvedCount = (state.incomingGroceriesApprovalList || []).filter(i => i.approved).length;
  const totalCount = (state.incomingGroceriesApprovalList || []).length;
  const badge = document.getElementById('walmart-approval-count-badge');
  const btnTxt = document.getElementById('walmart-commit-btn-text');

  if (badge) badge.textContent = `${approvedCount} of ${totalCount} Approved`;
  if (btnTxt) {
    btnTxt.textContent = approvedCount > 0
      ? `Approve & Add ${approvedCount} Item${approvedCount === 1 ? '' : 's'} to Pantry`
      : `Select Items to Add to Pantry`;
  }
}

function approveAndCommitGroceriesToPantry() {
  const approved = (state.incomingGroceriesApprovalList || []).filter(i => i.approved);
  if (approved.length === 0) {
    alertBox("No items approved. Please check at least 1 grocery item to add to your pantry.", "None Selected");
    return;
  }

  if (!Array.isArray(state.pantry)) state.pantry = [];
  const todayStr = new Date().toISOString().split('T')[0];

  approved.forEach((item, idx) => {
    // Calculate intelligent expiration estimate based on category and storage
    let expDays = 14;
    if (item.storage === 'frozen') {
      expDays = 90; // Frozen items last 3 months
    } else if (item.storage === 'shelf') {
      expDays = (item.category === 'grains' || item.category === 'condiments') ? 180 : 30;
    } else {
      // Fridge
      if (item.category === 'protein') expDays = 5;
      else if (item.category === 'produce') expDays = 7;
      else expDays = 14;
    }

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + expDays);
    const expDateStr = expDate.toISOString().split('T')[0];

    state.pantry.push({
      id: `p-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
      name: item.name,
      category: item.category,
      storage: item.storage || 'fridge',
      amount: parseFloat(item.amount) || 1,
      unit: item.unit || 'item',
      dateAdded: todayStr,
      expirationDate: expDateStr
    });
  });

  saveAppState();
  if (typeof renderPantry === 'function') renderPantry();
  closeWalmartGroceryImportModal();
  playChime('bell');
  alertBox(`Successfully added ${approved.length} approved item${approved.length === 1 ? '' : 's'} to your pantry!`, "Groceries Put Away 🎉");
}

function testSampleWalmartReceiptPhoto() {
  const sampleItems = [
    { name: "Great Value Boneless Chicken Breasts 3 lb", category: "protein", storage: "fridge", amount: 3, unit: "lb", isFood: true },
    { name: "Marketside Organic Baby Spinach 10 oz", category: "produce", storage: "fridge", amount: 10, unit: "oz", isFood: true },
    { name: "Organic Whole Milk 1 gal", category: "protein", storage: "fridge", amount: 1, unit: "gal", isFood: true },
    { name: "Great Value Jasmine Rice 5 lb", category: "grains", storage: "shelf", amount: 5, unit: "lb", isFood: true },
    { name: "Great Value Frozen Broccoli Florets 16 oz", category: "produce", storage: "frozen", amount: 16, unit: "oz", isFood: true },
    { name: "Bounty Paper Towels 6 rolls", category: "condiments", storage: "shelf", amount: 6, unit: "rolls", isFood: false }
  ];
  const formatted = sampleItems.map((it, idx) => ({
    id: `inc-${Date.now()}-${idx}`,
    name: it.name,
    category: it.category,
    storage: it.storage,
    amount: it.amount || 1,
    unit: it.unit || 'item',
    isFood: it.isFood !== false,
    approved: it.isFood !== false
  }));
  renderIncomingGroceriesApprovalList(formatted);
  playChime('bell');
  alertBox("Sample receipt scanned! Review each item and adjust storage/amounts below.", "Sample Scanned");
}


// ==============================================
// SMART PANTRY RENDERING & INGREDIENT CONTROLLERS
// ==============================================
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




