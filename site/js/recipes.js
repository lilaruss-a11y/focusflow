// ==============================================
// RECIPE BOOK, COOKBOOKS, CODEX & INSPECT MODAL (js/recipes.js)
// ==============================================

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
      const allRecipes = (state.recipes || []).concat(typeof familyCookbookDatabase !== 'undefined' ? familyCookbookDatabase : []);
      const recipe = allRecipes.find(r => r.id === recipeId);
      if (!recipe) return;

      const built = (typeof buildRecipeUnifiedNutrition === 'function')
        ? buildRecipeUnifiedNutrition(recipe)
        : {
            serving: recipe.serving || '1 serving',
            servingGrams: recipe.servingGrams || 250,
            nutrition: {
              kcal: recipe.kcal || 450,
              protein: recipe.protein || Math.round(((recipe.kcal || 450) * 0.25) / 4),
              carbs: recipe.carbs || Math.round(((recipe.kcal || 450) * 0.45) / 4),
              fat: recipe.fat || Math.round(((recipe.kcal || 450) * 0.30) / 9),
              fiber: 5,
              sugar: 6,
              satFat: 3,
              sodium: 320,
              water: 95,
              micros: {}
            }
          };

      const nut = built.nutrition;

      state.nutritionLog.push({
        id: `n-${Date.now()}`,
        name: recipe.title,
        recipeId: recipe.id,
        serving: built.serving,
        servingGrams: built.servingGrams,
        kcal: nut.kcal,
        protein: nut.protein,
        carbs: nut.carbs,
        fat: nut.fat,
        fiber: nut.fiber || 5,
        sugar: nut.sugar || 0,
        satFat: nut.satFat || 0,
        sodium: nut.sodium || 320,
        water: nut.water || 0,
        potassium: nut.micros?.potassium || 450,
        iron: nut.micros?.iron || 2.2,
        calcium: nut.micros?.calcium || 120,
        micros: nut.micros || {},
        verifiedNutrients: nut.verifiedNutrients || {},
        nutrition: nut,
        isVerified: Boolean(recipe.isVerified)
      });

      if (typeof saveAppState === 'function') saveAppState();
      renderNutrition();
      playChime('bell');
      alertBox(`Logged 1 serving = ${built.serving} (${built.servingGrams} g) of "${recipe.title}" (${nut.kcal} kcal) to today's diary!`, "Nutrition Diary");
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




// ==============================================
// RECIPE INSPECT & DETAIL MODAL CONTROLLER
// ==============================================
    function renderRecipeInspectNutritionPanel(recipeObj) {
      const panel = document.getElementById('inspect-recipe-nutrition-panel');
      if (!panel) return;

      const built = (typeof buildRecipeUnifiedNutrition === 'function')
        ? buildRecipeUnifiedNutrition(recipeObj)
        : {
            serving: recipeObj.serving || '1 serving',
            servingGrams: recipeObj.servingGrams || 250,
            nutrition: {
              kcal: recipeObj.kcal || 450,
              protein: recipeObj.protein || Math.round(((recipeObj.kcal || 450) * 0.25) / 4),
              carbs: recipeObj.carbs || Math.round(((recipeObj.kcal || 450) * 0.45) / 4),
              fat: recipeObj.fat || Math.round(((recipeObj.kcal || 450) * 0.30) / 9),
              fiber: 5,
              sugar: 6,
              satFat: 3,
              sodium: 320,
              water: 95,
              verifiedNutrients: {},
              micros: {}
            }
          };

      const nut = built.nutrition;
      const verifiedMap = nut.verifiedNutrients || {};
      const profile = state.userProfile || {};
      const standards = window.DAILY_NUTRITION_STANDARDS || {};

      const macroDefs = [
        { key: 'kcal', name: 'Energy (Calories)', unit: 'kcal', dv: profile.dailyCaloriesTarget || 2130, val: nut.kcal },
        { key: 'protein', name: 'Protein', unit: 'g', dv: profile.dailyProteinTarget || 135, val: nut.protein },
        { key: 'carbs', name: 'Total Carbohydrates', unit: 'g', dv: profile.dailyCarbsTarget || 240, val: nut.carbs },
        { key: 'fat', name: 'Total Fat', unit: 'g', dv: profile.dailyFatTarget || 71, val: nut.fat },
        { key: 'fiber', name: 'Dietary Fiber', unit: 'g', dv: profile.dailyFiberTarget || 30, val: nut.fiber },
        { key: 'water', name: 'Water / Moisture', unit: 'ml', dv: profile.dailyWaterTargetMl || 2700, val: nut.water },
        { key: 'sugar', name: 'Total Sugars', unit: 'g', dv: 50, isUpperLimit: true, val: nut.sugar },
        { key: 'satFat', name: 'Saturated Fat', unit: 'g', dv: 20, isUpperLimit: true, val: nut.satFat },
        { key: 'sodium', name: 'Sodium', unit: 'mg', dv: profile.dailySodiumTarget || 2300, isUpperLimit: true, val: nut.sodium }
      ];

      const macroRowsHtml = macroDefs.map(m => renderMicroBarRow(m.key, m, m.val, Boolean(verifiedMap[m.key]))).join('');
      const vitRowsHtml = Object.keys(standards)
        .filter(k => standards[k].type === 'vitamin')
        .map(k => renderMicroBarRow(k, standards[k], nut.micros ? nut.micros[k] : null, Boolean(verifiedMap[k])))
        .join('');
      const minRowsHtml = Object.keys(standards)
        .filter(k => standards[k].type === 'mineral')
        .map(k => renderMicroBarRow(k, standards[k], nut.micros ? nut.micros[k] : null, Boolean(verifiedMap[k])))
        .join('');

      panel.innerHTML = `
        <div class="flex items-center justify-between flex-wrap gap-1 border-b border-dark-border/60 pb-2">
          <span class="font-bold text-white text-xs flex items-center gap-1.5">
            <i data-lucide="pie-chart" class="w-3.5 h-3.5 text-pastel-lavender"></i>
            Nutritional Profile &amp; Daily Goal Impact
          </span>
          <span class="text-[10.5px] font-mono text-pastel-sky font-bold">1 serving = ${built.serving} (${built.servingGrams} g)</span>
        </div>

        <div class="grid grid-cols-4 gap-1.5 text-center font-mono">
          <div class="p-2 rounded-xl bg-dark-elevated">
            <span class="text-[9px] text-pastel-lavender font-bold block">ENERGY</span>
            <span class="text-xs font-bold text-white">${nut.kcal} kcal</span>
          </div>
          <div class="p-2 rounded-xl bg-dark-elevated">
            <span class="text-[9px] text-pastel-coral font-bold block">PROTEIN</span>
            <span class="text-xs font-bold text-white">${nut.protein}g</span>
          </div>
          <div class="p-2 rounded-xl bg-dark-elevated">
            <span class="text-[9px] text-pastel-mint font-bold block">CARBS</span>
            <span class="text-xs font-bold text-white">${nut.carbs}g</span>
          </div>
          <div class="p-2 rounded-xl bg-dark-elevated">
            <span class="text-[9px] text-pastel-butter font-bold block">FAT</span>
            <span class="text-xs font-bold text-white">${nut.fat}g</span>
          </div>
        </div>

        <div class="space-y-1.5">
          <span class="text-[10px] font-bold text-pastel-lavender uppercase tracking-wider block">Macronutrients (Goal Range Color-Coded)</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
            ${macroRowsHtml}
          </div>
        </div>

        <div class="space-y-1.5 pt-1 border-t border-dark-border/50">
          <span class="text-[10px] font-bold text-pastel-sky uppercase tracking-wider block">Vitamins &amp; Minerals (Per 1 Serving = ${built.servingGrams} g)</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
            ${vitRowsHtml}
            ${minRowsHtml}
          </div>
        </div>
      `;
    }

function inspectRecipeDetails(idx) {
      const opt = (state.currentMealOptions && state.currentMealOptions[idx]) || (state.currentMealOptions && state.currentMealOptions[0]);
      if (!opt) return;

      const titleEl = document.getElementById('inspect-recipe-title');
      const metaEl = document.getElementById('inspect-recipe-meta');
      const descEl = document.getElementById('inspect-recipe-desc');
      const ingListEl = document.getElementById('inspect-recipe-ingredients');
      const stepsListEl = document.getElementById('inspect-recipe-steps');
      const cookBtn = document.getElementById('inspect-recipe-cook-btn');

      const built = (typeof buildRecipeUnifiedNutrition === 'function') ? buildRecipeUnifiedNutrition(opt) : { serving: '1 serving', servingGrams: 250 };

      if (titleEl) titleEl.textContent = opt.title;
      if (metaEl) metaEl.textContent = `${opt.cookTime}m • ${opt.kcal} kcal • 1 serving = ${built.serving} (${built.servingGrams} g)`;
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

      renderRecipeInspectNutritionPanel(opt);

      if (cookBtn) {
        cookBtn.onclick = () => {
          closeRecipeInspectModal();
          launchRecipeOption(idx);
        };
      }

      const modal = document.getElementById('recipe-inspect-modal');
      if (modal) modal.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }

    function closeRecipeInspectModal() {
      const modal = document.getElementById('recipe-inspect-modal');
      if (modal) modal.classList.add('hidden');
    }

    function viewRecipeDetails(recipeId) {
      const allRecipes = (state.recipes || []).concat(typeof familyCookbookDatabase !== 'undefined' ? familyCookbookDatabase : []);
      const recipe = allRecipes.find(r => r.id === recipeId);
      if (!recipe) return;

      const modal = document.getElementById('recipe-inspect-modal');
      const titleEl = document.getElementById('inspect-recipe-title');
      const metaEl = document.getElementById('inspect-recipe-meta');
      const descEl = document.getElementById('inspect-recipe-desc');
      const ingListEl = document.getElementById('inspect-recipe-ingredients');
      const stepsListEl = document.getElementById('inspect-recipe-steps');
      const cookBtn = document.getElementById('inspect-recipe-cook-btn');

      const built = (typeof buildRecipeUnifiedNutrition === 'function') ? buildRecipeUnifiedNutrition(recipe) : { serving: '1 serving', servingGrams: 250, nutrition: { kcal: recipe.kcal || 450 } };

      if (titleEl) titleEl.textContent = recipe.title;
      if (metaEl) {
        const authorPart = recipe.author ? ` • by ${recipe.author}` : '';
        metaEl.textContent = `${recipe.cookTime || 25}m • ${built.nutrition.kcal} kcal • 1 serving = ${built.serving} (${built.servingGrams} g)${authorPart}`;
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

      renderRecipeInspectNutritionPanel(recipe);

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
  window.setRecipeFilter = setRecipeFilter;
  window.switchRecipeSectionView = switchRecipeSectionView;
  window.renderCookbooks = renderCookbooks;
  window.openCookbook = openCookbook;
  window.backToAllCookbooks = backToAllCookbooks;
  window.renderCookbookFormats = renderCookbookFormats;
  window.openCookbookFormat = openCookbookFormat;
  window.openAddRecipeForCurrentFormat = openAddRecipeForCurrentFormat;
  window.toggleRecipeFilter = toggleRecipeFilter;
  window.updateRecipeFilterUI = updateRecipeFilterUI;
  window.clearAllRecipeFilters = clearAllRecipeFilters;
  window.renderRecipes = renderRecipes;
  window.quickLogRecipeToDiary = quickLogRecipeToDiary;
  window.openAddRecipeModal = openAddRecipeModal;
  window.closeAddRecipeModal = closeAddRecipeModal;
  window.saveNewRecipe = saveNewRecipe;
  window.openShareRecipeModal = openShareRecipeModal;
  window.closeShareRecipeModal = closeShareRecipeModal;
  window.triggerNativeShareRecipe = triggerNativeShareRecipe;
  window.copyShareRecipeLink = copyShareRecipeLink;
  window.acceptIncomingRecipe = acceptIncomingRecipe;
  window.dismissIncomingRecipe = dismissIncomingRecipe;
  window.sendRecipeToChoreographer = sendRecipeToChoreographer;
  window.logRecipeToNutrition = logRecipeToNutrition;
  window.renderRecipeInspectNutritionPanel = renderRecipeInspectNutritionPanel;
  window.inspectRecipeDetails = inspectRecipeDetails;
  window.closeRecipeInspectModal = closeRecipeInspectModal;
  window.viewRecipeDetails = viewRecipeDetails;
}
