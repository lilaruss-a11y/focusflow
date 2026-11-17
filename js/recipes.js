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
    const defaultCookbooks = [
      { id: 'cb-family', title: 'Family Recipes', icon: '👨‍👩‍👧‍👦', theme: 'pastel-coral', origin: 'family', desc: '216 heirloom family recipes, holiday traditions, and generational favorites from the family recipe book.' },
      { id: 'cb-staples', title: 'ADHD Daily Staples', icon: '📖', theme: 'pastel-mint', origin: 'mine', desc: 'Everyday go-tos calibrated for low initiation inertia and clean sink windows.' },
      { id: 'cb-shared', title: 'Family & Friends Lore', icon: '👨‍👩‍👧', theme: 'pastel-coral', origin: 'shared', desc: 'Gifted recipes from loved ones, roommates, and family traditions.' },
      { id: 'cb-campus', title: 'Campus & Rush Meals', icon: '🎓', theme: 'pastel-sky', origin: 'school', desc: 'Speedy under-15-minute study fuel and dorm-friendly quick bites.' },
      { id: 'cb-lowenergy', title: 'Low Executive Energy', icon: '⚡', theme: 'pastel-butter', origin: 'oneoff', desc: 'One-pot and 3-step zero-cleanup lifesavers for exhausted evenings.' }
    ];

    if (!state.cookbooks || !Array.isArray(state.cookbooks) || state.cookbooks.length === 0) {
      state.cookbooks = defaultCookbooks;
    } else {
      // Ensure default books exist if not present
      defaultCookbooks.forEach(d => {
        if (!state.cookbooks.some(c => c.id === d.id)) {
          state.cookbooks.push(d);
        }
      });
    }

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

    // Clean slate: Purge any hardcoded demo recipes from state.recipes
    if (Array.isArray(state.recipes)) {
      state.recipes = state.recipes.filter(r => !['rec-1', 'rec-2', 'rec-3', 'rec-4'].includes(r.id));
    }

    state.activeCookbook = null;
    state.activeCookbookFormat = null;
    state.recipeSectionView = 'cookbooks'; // 'cookbooks' or 'codex'
    state.recipeSearchQuery = '';
    state.recipeSortBy = 'alpha-asc';

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
        const q = (state.recipeSearchQuery || '').toLowerCase().trim();
        const visibleCookbooks = state.cookbooks.filter(cb => {
          if (!q) return true;
          const titleMatch = (cb.title || '').toLowerCase().includes(q);
          const descMatch = (cb.desc || '').toLowerCase().includes(q);
          // Also match if any recipe within this cookbook contains the search query
          const recipeMatch = state.recipes.some(r => (cb.origin === 'all' || r.origin === cb.origin) && ((r.title || '').toLowerCase().includes(q) || (r.ingredients || []).some(i => i.toLowerCase().includes(q))));
          return titleMatch || descMatch || recipeMatch;
        });

        if (visibleCookbooks.length === 0) {
          grid.innerHTML = `
            <div class="col-span-full py-8 text-center bg-dark-base rounded-2xl border border-dashed border-dark-border space-y-2">
              <i data-lucide="book" class="w-8 h-8 text-slate-500 mx-auto"></i>
              <span class="text-xs font-semibold text-slate-300 block">No cookbooks match "${state.recipeSearchQuery}"</span>
              <button type="button" onclick="clearRecipeSearchInput()" class="text-pastel-coral text-xs underline font-semibold">Clear Search</button>
            </div>
          `;
        } else {
          visibleCookbooks.forEach(cb => {
            const count = state.recipes.filter(r => cb.origin === 'all' || r.origin === cb.origin).length;
            const card = document.createElement('div');
            card.className = "relative p-3 sm:p-4 rounded-2xl bg-dark-base border border-dark-border hover:border-pastel-coral/60 cursor-pointer transition transform hover:-translate-y-0.5 flex flex-col justify-between group shadow-md text-left";
            card.onclick = (e) => {
              if (e.target.closest('.cookbook-edit-btn')) return;
              openCookbook(cb.id);
            };
            card.innerHTML = `
              <div>
                <div class="flex items-start justify-between gap-1.5 mb-2.5">
                  <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-dark-elevated border border-dark-border/80 flex items-center justify-center text-lg sm:text-xl shadow-inner group-hover:border-pastel-coral/40 group-hover:bg-pastel-coral/10 transition">
                    ${cb.icon || '📖'}
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button type="button" onclick="event.stopPropagation(); openCookbookModal('${cb.id}')" class="cookbook-edit-btn p-1 rounded-lg hover:bg-dark-elevated text-slate-500 hover:text-white transition" title="Edit Cookbook">
                      <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                    </button>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-dark-elevated text-slate-300 font-bold group-hover:text-pastel-coral whitespace-nowrap">${count}</span>
                  </div>
                </div>
                <h3 class="font-bold text-white text-xs sm:text-sm group-hover:text-pastel-coral transition line-clamp-1 leading-snug">${cb.title}</h3>
                <p class="text-[10px] sm:text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">${cb.desc || ''}</p>
              </div>
              <div class="pt-2.5 mt-2 border-t border-dark-border/40 flex items-center justify-between text-[10px] sm:text-[11px] text-pastel-coral font-semibold">
                <span>Open</span>
                <i data-lucide="chevron-right" class="w-3 h-3"></i>
              </div>
            `;
            grid.appendChild(card);
          });

          // Add New Cookbook Card at the end of the shelf
          const addCard = document.createElement('div');
          addCard.className = "p-3 sm:p-4 rounded-2xl bg-dark-base/60 border border-dashed border-dark-border hover:border-pastel-coral/60 cursor-pointer transition flex flex-col items-center justify-center text-center group min-h-[130px] space-y-2";
          addCard.onclick = () => openCookbookModal();
          addCard.innerHTML = `
            <div class="w-9 h-9 rounded-xl bg-dark-elevated border border-dark-border flex items-center justify-center text-pastel-coral group-hover:scale-110 transition shadow-inner">
              <i data-lucide="plus" class="w-5 h-5"></i>
            </div>
            <div>
              <span class="text-xs font-bold text-white group-hover:text-pastel-coral transition block">Add Cookbook</span>
              <span class="text-[10px] text-slate-500 block">Create new theme</span>
            </div>
          `;
          grid.appendChild(addCard);
        }
      } else {
        // A specific cookbook is opened
        grid.classList.add('hidden');
        if (breadcrumb) {
          breadcrumb.classList.remove('hidden');
          const cb = state.cookbooks.find(c => c.id === state.activeCookbook);
          const bookTitleBtn = document.getElementById('cookbook-crumb-book-btn');
          if (bookTitleBtn) bookTitleBtn.textContent = cb ? cb.title : 'Cookbook';

          const subcrumb = document.getElementById('cookbook-format-subcrumb');
          if (state.activeCookbookFormat && subcrumb) {
            subcrumb.classList.remove('hidden');
            const isFam = state.activeCookbook === 'cb-family';
            const famCatNames = {
              beef: 'Beef', chicken: 'Chicken', pork: 'Pork', seafood: 'Seafood', crockpot: 'Crock Pot',
              soup: 'Soup', pasta: 'Pasta', breads: 'Breads', breakfast: 'Breakfast', sides: 'Sides & Dips',
              desserts: 'Desserts & Treats', halloween: 'Halloween & Festive', misc: 'Misc Food & Casseroles', nonfood: 'Crafts & Non-Food'
            };
            const customCat = (cb && cb.customCategories) ? cb.customCategories.find(c => c.key === state.activeCookbookFormat) : null;
            const formatTitle = customCat ? customCat.name : ((isFam && famCatNames[state.activeCookbookFormat]) ? famCatNames[state.activeCookbookFormat] : state.activeCookbookFormat);
            document.getElementById('cookbook-active-format-title').textContent = formatTitle;
          } else if (subcrumb) {
            subcrumb.classList.add('hidden');
          }
        }

        // Folder Mode: If a format/category folder is selected, hide the folder shelf; only show it when choosing a folder
        if (formatShelf) {
          if (state.activeCookbookFormat) {
            formatShelf.classList.add('hidden');
          } else {
            formatShelf.classList.remove('hidden');
            renderCookbookFormats();
          }
        }
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
      const searchSortBar = document.getElementById('recipe-search-sort-bar');
      if (searchSortBar) searchSortBar.classList.add('hidden');
      const actionBar = document.getElementById('recipe-format-action-bar');
      if (actionBar) actionBar.classList.add('hidden');
      renderCookbooks();
      renderRecipes();
    }

    function backToCookbookFormats() {
      state.activeCookbookFormat = null;
      renderCookbooks();
      renderRecipes();
    }

    function editCurrentCookbookFromBreadcrumb() {
      if (state.activeCookbook) {
        openCookbookModal(state.activeCookbook);
      }
    }

    function renderCookbookFormats() {
      const container = document.getElementById('cookbook-formats-grid');
      if (!container) return;

      const isFamilyCookbook = state.activeCookbook === 'cb-family';
      const cb = state.cookbooks.find(c => c.id === state.activeCookbook);

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
        { key: 'smoothie', name: 'Smoothies', icon: '🥤' },
        { key: 'soup', name: 'Soups & Stews', icon: '🥣' },
        { key: 'sandwich', name: 'Sandwiches & Wraps', icon: '🥪' },
        { key: 'skillet', name: 'Skillets & One-Pot', icon: '🍳' },
        { key: 'bowl', name: 'Grain & Salad Bowls', icon: '🥗' },
        { key: 'bake', name: 'Bakes & Snacks', icon: '🧁' }
      ];

      let formatsMeta = isFamilyCookbook ? [...familyCategoriesMeta] : [...standardFormatsMeta];
      if (cb && Array.isArray(cb.customCategories)) {
        formatsMeta = formatsMeta.concat(cb.customCategories);
      }

      const cbRecipes = state.recipes.filter(r => !cb || cb.origin === 'all' || r.origin === cb.origin);

      const q = (state.recipeSearchQuery || '').toLowerCase().trim();
      const visibleFormats = formatsMeta.filter(fmt => {
        if (!q) return true;
        const nameMatch = (fmt.name || '').toLowerCase().includes(q);
        // Also match if any recipe in this category matches the search query
        const recipeMatch = cbRecipes.some(r => ((r.familyCategory === fmt.key) || (r.format === fmt.key) || (r.category === fmt.key)) && ((r.title || '').toLowerCase().includes(q) || (r.ingredients || []).some(i => i.toLowerCase().includes(q))));
        return nameMatch || recipeMatch;
      });

      container.innerHTML = '';
      if (visibleFormats.length === 0) {
        container.innerHTML = `
          <div class="col-span-full py-8 text-center bg-dark-base rounded-2xl border border-dashed border-dark-border space-y-2">
            <i data-lucide="folder" class="w-8 h-8 text-slate-500 mx-auto"></i>
            <span class="text-xs font-semibold text-slate-300 block">No categories match "${state.recipeSearchQuery}"</span>
            <button type="button" onclick="clearRecipeSearchInput()" class="text-pastel-coral text-xs underline font-semibold">Clear Search</button>
          </div>
        `;
      } else {
        visibleFormats.forEach(fmt => {
          const count = isFamilyCookbook
            ? cbRecipes.filter(r => r.familyCategory === fmt.key || r.format === fmt.key).length
            : cbRecipes.filter(r => r.format === fmt.key || r.familyCategory === fmt.key).length;

          const card = document.createElement('div');
          card.className = "p-3 sm:p-4 rounded-2xl bg-dark-base border border-dark-border hover:border-pastel-coral/60 cursor-pointer transition transform hover:-translate-y-0.5 flex flex-col justify-between group shadow-md text-left";
          card.onclick = () => openCookbookFormat(fmt.key);
          card.innerHTML = `
            <div>
              <div class="flex items-start justify-between gap-1.5 mb-2.5">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-dark-elevated border border-dark-border/80 flex items-center justify-center text-lg sm:text-xl shadow-inner group-hover:border-pastel-coral/40 group-hover:bg-pastel-coral/10 transition">
                  ${fmt.icon || '📁'}
                </div>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-dark-elevated text-slate-300 font-bold group-hover:text-pastel-coral whitespace-nowrap">${count}</span>
              </div>
              <h3 class="font-bold text-white text-xs sm:text-sm group-hover:text-pastel-coral transition line-clamp-1 leading-snug">${fmt.name}</h3>
              <p class="text-[10px] text-slate-400 mt-0.5">Category folder</p>
            </div>
            <div class="pt-2 mt-2 border-t border-dark-border/40 flex items-center justify-between text-[10px] sm:text-[11px] text-pastel-coral font-semibold">
              <span>Open Folder</span>
              <i data-lucide="chevron-right" class="w-3 h-3"></i>
            </div>
          `;
          container.appendChild(card);
        });

        // Add Category Card at the end of the folder shelf
        const addCatCard = document.createElement('div');
        addCatCard.className = "p-3 sm:p-4 rounded-2xl bg-dark-base/60 border border-dashed border-dark-border hover:border-pastel-coral/60 cursor-pointer transition flex flex-col items-center justify-center text-center group min-h-[110px] space-y-1.5";
        addCatCard.onclick = () => openAddCategoryModal();
        addCatCard.innerHTML = `
          <div class="w-8 h-8 rounded-xl bg-dark-elevated border border-dark-border flex items-center justify-center text-pastel-coral group-hover:scale-110 transition shadow-inner">
            <i data-lucide="folder-plus" class="w-4 h-4"></i>
          </div>
          <div>
            <span class="text-xs font-bold text-white group-hover:text-pastel-coral transition block">+ Category</span>
            <span class="text-[10px] text-slate-500 block">Create folder</span>
          </div>
        `;
        container.appendChild(addCatCard);
      }
    }

    function openCookbookFormat(formatKey) {
      state.activeCookbookFormat = formatKey;
      renderCookbooks();
      renderRecipes();
      playChime('bell');
    }

    // Modal controls for adding a category to current cookbook
    function openAddCategoryModal() {
      const modal = document.getElementById('cookbook-category-modal');
      const input = document.getElementById('cookbook-category-name-input');
      const iconInput = document.getElementById('cookbook-category-icon-input');
      if (input) input.value = '';
      if (iconInput) iconInput.value = '📁';
      if (modal) modal.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }

    function closeAddCategoryModal() {
      const modal = document.getElementById('cookbook-category-modal');
      if (modal) modal.classList.add('hidden');
    }

    function setCategoryModalIcon(emoji) {
      const iconInput = document.getElementById('cookbook-category-icon-input');
      if (iconInput) iconInput.value = emoji;
    }

    function saveCookbookCategory() {
      const input = document.getElementById('cookbook-category-name-input');
      const iconInput = document.getElementById('cookbook-category-icon-input');
      const name = (input?.value || '').trim();
      const icon = (iconInput?.value || '📁').trim();

      if (!name) {
        alertBox('Please enter a category name.', 'Name Required');
        return;
      }

      const cb = (state.cookbooks || []).find(c => c.id === state.activeCookbook);
      if (!cb) return;

      cb.customCategories = cb.customCategories || [];
      const key = `cat-${Date.now()}`;
      cb.customCategories.push({ key, name, icon });

      if (typeof saveAppState === 'function') saveAppState();
      closeAddCategoryModal();
      renderCookbookFormats();
      playChime('bell');
      alertBox(`Added category "${name}" to ${cb.title}!`, 'Category Created');
    }

    function openAddRecipeForCurrentFormat() {
      openAddRecipeModal();
      if (state.activeCookbookFormat) {
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

    function updateRecipeSearchUI() {
      const searchInput = document.getElementById('recipe-search-input');
      const clearBtn = document.getElementById('recipe-search-clear-btn');
      const sortContainer = document.getElementById('recipe-sort-container');

      if (clearBtn) {
        clearBtn.classList.toggle('hidden', !state.recipeSearchQuery);
      }

      const isCookbookView = state.recipeSectionView === 'cookbooks';

      // Update placeholder dynamically based on current navigation level
      if (searchInput) {
        if (!isCookbookView) {
          searchInput.placeholder = 'Search recipes in Codex by title or ingredient...';
        } else if (!state.activeCookbook) {
          searchInput.placeholder = 'Search cookbooks or recipes by name...';
        } else if (!state.activeCookbookFormat) {
          const cb = state.cookbooks.find(c => c.id === state.activeCookbook);
          searchInput.placeholder = `Search folders or recipes in ${cb ? cb.title : 'this book'}...`;
        } else {
          const cb = state.cookbooks.find(c => c.id === state.activeCookbook);
          searchInput.placeholder = `Search recipes in ${state.activeCookbookFormat}...`;
        }
      }

      // Show sort dropdown when recipes are being displayed (in a folder, in codex, or search has matched recipes)
      if (sortContainer) {
        const showSort = !isCookbookView || Boolean(state.activeCookbookFormat) || Boolean(state.recipeSearchQuery && state.recipeSearchQuery.trim());
        sortContainer.classList.toggle('hidden', !showSort);
      }
    }

    function handleRecipeSearchInput() {
      const input = document.getElementById('recipe-search-input');
      state.recipeSearchQuery = input ? input.value : '';
      updateRecipeSearchUI();
      renderCookbooks();
      renderRecipes();
    }

    function clearRecipeSearchInput() {
      const input = document.getElementById('recipe-search-input');
      if (input) input.value = '';
      state.recipeSearchQuery = '';
      updateRecipeSearchUI();
      renderCookbooks();
      renderRecipes();
    }

    function handleRecipeSortChange() {
      const select = document.getElementById('recipe-sort-select');
      state.recipeSortBy = select ? select.value : 'alpha-asc';
      renderRecipes();
    }

    // Main Recipes Render
    function renderRecipes() {
      const grid = document.getElementById('recipe-cards-grid');
      if (!grid) return;
      grid.innerHTML = '';

      updateRecipeSearchUI();

      const isCookbookView = state.recipeSectionView === 'cookbooks';
      const hasSearch = Boolean(state.recipeSearchQuery && state.recipeSearchQuery.trim());

      // When in Cookbooks view without a format folder open:
      // If the user has typed a search query, show matching recipe cards below the filtered books/folders!
      // If no search query is typed, keep recipe cards hidden until entering a folder.
      if (isCookbookView && (!state.activeCookbook || !state.activeCookbookFormat) && !hasSearch) {
        grid.classList.add('hidden');
        return;
      }
      grid.classList.remove('hidden');

      let filtered = state.recipes.filter(r => {
        if (isCookbookView && state.activeCookbook) {
          const cb = state.cookbooks.find(c => c.id === state.activeCookbook);
          if (cb && cb.origin !== 'all' && r.origin !== cb.origin) return false;
          if (state.activeCookbookFormat) {
            const matchesCat = (r.familyCategory === state.activeCookbookFormat) || (r.format === state.activeCookbookFormat) || (r.category === state.activeCookbookFormat);
            if (!matchesCat) return false;
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

      // Search Query Filtering
      if (state.recipeSearchQuery && state.recipeSearchQuery.trim()) {
        const q = state.recipeSearchQuery.toLowerCase().trim();
        filtered = filtered.filter(r => {
          const titleMatch = (r.title || '').toLowerCase().includes(q);
          const authorMatch = (r.author || '').toLowerCase().includes(q);
          const ingMatch = (r.ingredients || []).some(i => i.toLowerCase().includes(q));
          return titleMatch || authorMatch || ingMatch;
        });
      }

      // Sorting
      const sortBy = state.recipeSortBy || 'alpha-asc';
      filtered.sort((a, b) => {
        if (sortBy === 'alpha-asc') {
          return (a.title || '').localeCompare(b.title || '');
        } else if (sortBy === 'alpha-desc') {
          return (b.title || '').localeCompare(a.title || '');
        } else if (sortBy === 'cooktime-asc') {
          return (a.cookTime || 0) - (b.cookTime || 0);
        } else if (sortBy === 'kcal-asc') {
          return (a.kcal || 0) - (b.kcal || 0);
        } else if (sortBy === 'recent') {
          return (b.id || '').localeCompare(a.id || '');
        }
        return 0;
      });

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full py-12 text-center bg-dark-base rounded-2xl border border-dashed border-dark-border space-y-3">
            <i data-lucide="book-open" class="w-10 h-10 text-slate-500 mx-auto"></i>
            <span class="text-sm font-semibold text-slate-300 block">No recipes found</span>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">Try a different search, switch categories, or add a new recipe to this folder!</p>
            <button type="button" onclick="openAddRecipeForCurrentFormat()" class="px-4 py-2 rounded-xl bg-pastel-coral text-dark-base font-bold text-xs inline-flex items-center gap-1.5 shadow-sm">
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

    // ==============================================
    // COOKBOOK CREATION & EDITING ENGINE
    // ==============================================
    function openCookbookModal(cookbookId) {
      const modal = document.getElementById('cookbook-modal');
      if (!modal) return;

      const titleEl = document.getElementById('cookbook-modal-title');
      const saveText = document.getElementById('cookbook-save-btn-text');
      const idInput = document.getElementById('cookbook-edit-id');
      const titleInput = document.getElementById('cookbook-title-input');
      const descInput = document.getElementById('cookbook-desc-input');
      const iconInput = document.getElementById('cookbook-icon-input');
      const deleteBtn = document.getElementById('cookbook-delete-btn');

      if (cookbookId) {
        const cb = (state.cookbooks || []).find(c => c.id === cookbookId);
        if (!cb) return;
        if (titleEl) titleEl.textContent = 'Edit Cookbook';
        if (saveText) saveText.textContent = 'Save Changes';
        if (idInput) idInput.value = cb.id;
        if (titleInput) titleInput.value = cb.title || '';
        if (descInput) descInput.value = cb.desc || '';
        if (iconInput) iconInput.value = cb.icon || '📖';

        // Cannot delete default family heirloom book
        if (deleteBtn) {
          if (cb.id === 'cb-family') {
            deleteBtn.classList.add('hidden');
          } else {
            deleteBtn.classList.remove('hidden');
          }
        }
      } else {
        if (titleEl) titleEl.textContent = 'New Cookbook';
        if (saveText) saveText.textContent = 'Create Book';
        if (idInput) idInput.value = '';
        if (titleInput) titleInput.value = '';
        if (descInput) descInput.value = '';
        if (iconInput) iconInput.value = '📖';
        if (deleteBtn) deleteBtn.classList.add('hidden');
      }

      modal.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }

    function closeCookbookModal() {
      const modal = document.getElementById('cookbook-modal');
      if (modal) modal.classList.add('hidden');
    }

    function setCookbookModalIcon(iconEmoji) {
      const iconInput = document.getElementById('cookbook-icon-input');
      if (iconInput) iconInput.value = iconEmoji;
    }

    function saveCookbookModal() {
      const idInput = document.getElementById('cookbook-edit-id');
      const titleInput = document.getElementById('cookbook-title-input');
      const descInput = document.getElementById('cookbook-desc-input');
      const iconInput = document.getElementById('cookbook-icon-input');

      const title = (titleInput?.value || '').trim();
      if (!title) {
        alertBox('Please enter a cookbook title.', 'Title Required');
        return;
      }
      const desc = (descInput?.value || '').trim();
      const icon = (iconInput?.value || '📖').trim();
      const editId = idInput?.value;

      state.cookbooks = state.cookbooks || [];

      if (editId) {
        const cb = state.cookbooks.find(c => c.id === editId);
        if (cb) {
          cb.title = title;
          cb.desc = desc;
          cb.icon = icon;
        }
      } else {
        const newId = `cb-custom-${Date.now()}`;
        state.cookbooks.push({
          id: newId,
          title,
          icon,
          theme: 'pastel-coral',
          origin: newId,
          desc
        });
      }

      if (typeof saveAppState === 'function') saveAppState();
      closeCookbookModal();
      renderCookbooks();
      playChime('bell');
      alertBox(`Cookbook "${title}" saved successfully!`, 'Cookbook Updated');
    }

    function deleteCurrentCookbook() {
      const idInput = document.getElementById('cookbook-edit-id');
      const editId = idInput?.value;
      if (!editId || editId === 'cb-family') return;

      const idx = (state.cookbooks || []).findIndex(c => c.id === editId);
      if (idx !== -1) {
        const removed = state.cookbooks.splice(idx, 1)[0];
        if (state.activeCookbook === editId) {
          state.activeCookbook = null;
        }
        if (typeof saveAppState === 'function') saveAppState();
        closeCookbookModal();
        renderCookbooks();
        renderRecipes();
        alertBox(`Removed cookbook "${removed.title}".`, 'Cookbook Deleted');
      }
    }

    function openAddRecipeModal() {
      // Auto-populate origin dropdown with all current cookbooks
      const originSelect = document.getElementById('recipe-origin-input');
      if (originSelect && state.cookbooks) {
        const currentVal = state.activeCookbook ? ((state.cookbooks.find(c => c.id === state.activeCookbook)?.origin) || 'mine') : originSelect.value;
        originSelect.innerHTML = state.cookbooks.map(cb => {
          return `<option value="${cb.origin}" ${cb.origin === currentVal ? 'selected' : ''}>${cb.icon || '📖'} ${cb.title}</option>`;
        }).join('');
      }
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
  window.openCookbookModal = openCookbookModal;
  window.closeCookbookModal = closeCookbookModal;
  window.setCookbookModalIcon = setCookbookModalIcon;
  window.saveCookbookModal = saveCookbookModal;
  window.deleteCurrentCookbook = deleteCurrentCookbook;
  window.backToCookbookFormats = backToCookbookFormats;
  window.editCurrentCookbookFromBreadcrumb = editCurrentCookbookFromBreadcrumb;
  window.openAddCategoryModal = openAddCategoryModal;
  window.closeAddCategoryModal = closeAddCategoryModal;
  window.setCategoryModalIcon = setCategoryModalIcon;
  window.saveCookbookCategory = saveCookbookCategory;
  window.handleRecipeSearchInput = handleRecipeSearchInput;
  window.clearRecipeSearchInput = clearRecipeSearchInput;
  window.handleRecipeSortChange = handleRecipeSortChange;
}
