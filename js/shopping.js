// ==============================================
// FOCUSFLOW - SHOPPING LIST & GROCERY RECEIPT SCANNER
// ==============================================

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

function saveCustomReceiptAlias(rawPattern, cleanName, category, storage, unit, amount) {
  if (!rawPattern || !cleanName) return;
  const rawKey = rawPattern.trim().toLowerCase();
  const aliases = getCustomReceiptAliases();
  aliases[rawKey] = {
    rawKey: rawPattern.trim(),
    name: cleanName.trim(),
    category: category || 'produce',
    storage: storage || 'fridge',
    unit: unit || 'items',
    amount: (amount != null && !isNaN(parseFloat(amount))) ? parseFloat(amount) : 1,
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
        unit: match.unit || item.unit,
        amount: (match.amount != null) ? match.amount : item.amount,
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
          unit: match.unit || item.unit,
          amount: (match.amount != null) ? match.amount : item.amount,
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
          <span class="text-[9px] px-1.5 py-0.2 rounded-full bg-dark-elevated text-slate-400 font-mono">${entry.category} • ${entry.storage}${entry.unit ? ' • ' + entry.unit : ''}</span>
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

// ==============================================
// RECEIPT NUTRITION LEARNING BRIDGE & RESOLUTION
// ==============================================
function getReceiptNutritionCatalog() {
  try {
    const raw = localStorage.getItem('focusflow_receipt_nutrition_catalog');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return (window.state && window.state.receiptNutritionCatalog) || {};
}

function saveReceiptNutritionCatalogEntry(codeOrName, data) {
  if (!codeOrName || !data) return;
  const catalog = getReceiptNutritionCatalog();
  const rawKey = codeOrName.trim().toLowerCase();
  catalog[rawKey] = {
    code: codeOrName.trim(),
    name: data.name,
    nutrition: data.nutrition,
    isVerified: true,
    source: data.source || 'Exact Label Verified',
    sourceBadge: data.sourceBadge || '✓ Exact Label Verified',
    barcode: data.barcode || '',
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem('focusflow_receipt_nutrition_catalog', JSON.stringify(catalog));
  } catch (e) {}
  if (window.state) window.state.receiptNutritionCatalog = catalog;
}

function resolveReceiptItemNutrition(item) {
  const origName = (item.name || '').trim();
  const origRaw = (item.rawName || origName).trim();
  const lowerName = origName.toLowerCase();
  const lowerRaw = origRaw.toLowerCase();

  // TIER 2 (OPTION 1): Check Personal Receipt-to-Label Catalog Bridge (Learned pairings)
  const catalog = getReceiptNutritionCatalog();
  if (catalog[lowerRaw] || catalog[lowerName]) {
    const match = catalog[lowerRaw] || catalog[lowerName];
    return {
      nutrition: match.nutrition,
      isVerified: true,
      nutritionSource: match.source || 'Exact Label Verified',
      sourceBadge: '✓ Exact Label Verified',
      tier: 2
    };
  }

  // TIER 1 (OPTION 2): USDA FoodData Central Branded / Whole Food Matching
  const usdaMatch = (typeof commonFoodsDatabase !== 'undefined')
    ? commonFoodsDatabase.find(cf => {
        const cfWord = cf.name.toLowerCase().split(' ')[0];
        return lowerName.includes(cfWord) || lowerRaw.includes(cfWord);
      })
    : null;

  if (usdaMatch) {
    const micros = (typeof estimateMicronutrientsForFood === 'function')
      ? estimateMicronutrientsForFood(item.category || 'produce', usdaMatch.kcal, usdaMatch.protein, usdaMatch.carbs, usdaMatch.fat, usdaMatch.name)
      : {};
    return {
      nutrition: {
        kcal: usdaMatch.kcal,
        protein: usdaMatch.protein,
        carbs: usdaMatch.carbs,
        fat: usdaMatch.fat,
        fiber: usdaMatch.fiber || 0,
        sodium: usdaMatch.sodium || 40,
        sugar: usdaMatch.sugar || 0,
        satFat: usdaMatch.satFat || 0,
        micros: micros
      },
      isVerified: true,
      nutritionSource: 'USDA Branded Match',
      sourceBadge: '✓ USDA Branded Match',
      tier: 1
    };
  }

  // TIER 3 (OPTION 4 FAIL-SAFE): Clinical Estimate
  const cat = item.category || 'produce';
  const estKcal = cat === 'protein' ? 180 : (cat === 'produce' || cat === 'vegetables' ? 35 : (cat === 'fruits' ? 60 : 120));
  const estProt = cat === 'protein' ? 24 : (cat === 'dairy' ? 8 : 2);
  const estCarbs = (cat === 'produce' || cat === 'vegetables') ? 6 : (cat === 'grains' ? 28 : (cat === 'fruits' ? 15 : 2));
  const estFat = cat === 'protein' ? 6 : (cat === 'dairy' ? 4 : 0.5);

  const estMicros = (typeof estimateMicronutrientsForFood === 'function')
    ? estimateMicronutrientsForFood(cat, estKcal, estProt, estCarbs, estFat, origName)
    : {};

  return {
    nutrition: {
      kcal: estKcal,
      protein: estProt,
      carbs: estCarbs,
      fat: estFat,
      fiber: 2,
      sodium: 40,
      sugar: 1,
      satFat: 0.2,
      micros: estMicros
    },
    isVerified: false,
    nutritionSource: 'Clinical Estimate',
    sourceBadge: '~ Clinical Estimate',
    tier: 3
  };
}

function pairReceiptItemWithLabelOrBarcode(idx) {
  const item = (state.incomingGroceriesApprovalList || [])[idx];
  if (!item) return;
  if (typeof openManualNutritionModal === 'function') {
    openManualNutritionModal({
      barcode: '',
      name: item.name,
      amount: item.amount || 1,
      unit: item.unit || 'items',
      category: item.category || 'produce',
      storage: item.storage || 'fridge-main',
      nutrition: item.nutrition,
      isReceiptPairing: true,
      receiptIndex: idx,
      receiptRawCode: item.rawName || item.name
    });
  }
}

function editReceiptItemNutrition(idx) {
  pairReceiptItemWithLabelOrBarcode(idx);
}

function renderIncomingGroceriesApprovalList(items) {
  state.incomingGroceriesApprovalList = items;
  const sec = document.getElementById('walmart-approval-section');
  const list = document.getElementById('walmart-approval-list');
  if (!sec || !list) return;

  sec.classList.remove('hidden');
  list.innerHTML = '';

  items.forEach((item, idx) => {
    // Auto-resolve nutritional accuracy profile (Tier 1 -> Tier 2 -> Tier 3)
    if (!item.nutrition) {
      const res = resolveReceiptItemNutrition(item);
      item.nutrition = res.nutrition;
      item.isVerified = res.isVerified;
      item.nutritionSource = res.nutritionSource;
      item.sourceBadge = res.sourceBadge;
    }

    const row = document.createElement('div');
    row.className = `p-3 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-2.5 transition shadow-sm ${item.approved ? 'bg-dark-base border-dark-border text-white' : 'bg-dark-base/40 border-dark-border/40 opacity-60 text-slate-400'}`;
    row.id = `grocery-row-${idx}`;

    const badgeHtml = item.isVerified
      ? `<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-400/30 flex items-center gap-1 font-mono"><span>✓</span><span>${item.sourceBadge || 'USDA / Label Verified'}</span></span>`
      : `<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950/40 text-amber-300 border border-amber-400/30 flex items-center gap-1 font-mono"><span>~</span><span>Clinical Estimate</span></span>`;

    row.innerHTML = `
      <div class="flex items-center gap-2.5 flex-1 min-w-0">
        <input type="checkbox" id="grocery-chk-${idx}" ${item.approved ? 'checked' : ''} onchange="toggleGroceryApproval(${idx})" class="w-4 h-4 rounded text-pastel-sky focus:ring-0 cursor-pointer shrink-0">
        <div class="flex-1 min-w-0">
          <input type="text" value="${item.name}" onchange="updateGroceryName(${idx}, this.value)" class="w-full bg-transparent text-xs font-semibold text-white focus:outline-none focus:border-b border-pastel-sky truncate" title="Edit item name (auto-saved for future receipts)">
          <div class="flex items-center gap-1.5 flex-wrap mt-0.5">
            ${badgeHtml}
            ${item.wasAutoTranslated ? '<span class="text-[9px] text-pastel-mint font-mono font-bold">✓ Learned alias</span>' : ''}
            ${item.rawName && item.rawName !== item.name ? `<span class="text-[9px] text-slate-500 truncate font-mono">Store code: "${item.rawName}"</span>` : ''}
            ${!item.isFood ? '<span class="text-[9px] text-amber-400 font-mono">Non-food item (excluded by default)</span>' : ''}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap shrink-0 text-xs">
        <!-- Nutrition Pair / Edit Buttons -->
        ${!item.isVerified ? `
          <button type="button" onclick="pairReceiptItemWithLabelOrBarcode(${idx})" class="px-2 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 transition shadow-sm" title="Scan package barcode or label to pair with this store code permanently">
            <i data-lucide="camera" class="w-3 h-3"></i>
            <span>📷 Pair Label/Barcode</span>
          </button>
        ` : ''}
        <button type="button" onclick="editReceiptItemNutrition(${idx})" class="px-2 py-1 rounded-xl bg-dark-elevated hover:bg-slate-700 text-slate-300 hover:text-white border border-dark-border text-[10px] flex items-center gap-1 transition" title="View or edit macro and micronutrient facts">
          <i data-lucide="edit-3" class="w-3 h-3"></i>
          <span>✏️ Facts</span>
        </button>

        <!-- Quantity & Unit -->
        <div class="flex items-center gap-1 bg-dark-elevated border border-dark-border rounded-xl px-2 py-1">
          <input type="number" min="0.1" step="any" value="${item.amount || 1}" onchange="updateGroceryAmount(${idx}, this.value)" class="w-12 bg-transparent text-center text-white font-mono text-[11px] focus:outline-none" title="Quantity / Package Weight">
          <select onchange="updateGroceryUnit(${idx}, this.value)" class="bg-transparent text-slate-300 font-mono text-[11px] focus:outline-none cursor-pointer" title="Unit">
            <optgroup label="Weight">
              <option value="oz" ${item.unit === 'oz' ? 'selected' : ''}>oz</option>
              <option value="g" ${item.unit === 'g' ? 'selected' : ''}>g</option>
              <option value="lb" ${item.unit === 'lb' ? 'selected' : ''}>lb</option>
            </optgroup>
            <optgroup label="Liquid / Volume">
              <option value="fl oz" ${(item.unit === 'fl oz' || item.unit === 'floz') ? 'selected' : ''}>fl oz</option>
              <option value="ml" ${item.unit === 'ml' ? 'selected' : ''}>ml</option>
              <option value="l" ${item.unit === 'l' ? 'selected' : ''}>L</option>
              <option value="cup" ${item.unit === 'cup' ? 'selected' : ''}>cup</option>
              <option value="gal" ${item.unit === 'gal' ? 'selected' : ''}>gal</option>
            </optgroup>
            <optgroup label="Count &amp; Portions">
              <option value="items" ${(!item.unit || item.unit === 'items' || item.unit === 'item' || item.unit === 'each') ? 'selected' : ''}>items</option>
              <option value="servings" ${(item.unit === 'servings' || item.unit === 'serving') ? 'selected' : ''}>servings</option>
              <option value="pack" ${item.unit === 'pack' ? 'selected' : ''}>pack</option>
              <option value="can" ${item.unit === 'can' ? 'selected' : ''}>can</option>
              <option value="bottle" ${item.unit === 'bottle' ? 'selected' : ''}>bottle</option>
            </optgroup>
          </select>
        </div>

        <!-- Food Type Selector (9 Food Types) -->
        <select onchange="updateGroceryCategory(${idx}, this.value)" class="bg-dark-elevated border border-dark-border rounded-xl px-2.5 py-1 text-slate-200 text-[11px] focus:border-pastel-sky focus:outline-none font-semibold" title="Food Type">
          <option value="protein" ${item.category === 'protein' ? 'selected' : ''}>🥩 Protein &amp; Meat</option>
          <option value="dairy" ${item.category === 'dairy' ? 'selected' : ''}>🥛 Dairy &amp; Alternatives</option>
          <option value="vegetables" ${(item.category === 'vegetables' || item.category === 'produce') ? 'selected' : ''}>🥦 Vegetables &amp; Greens</option>
          <option value="fruits" ${item.category === 'fruits' ? 'selected' : ''}>🍎 Fruits &amp; Berries</option>
          <option value="grains" ${item.category === 'grains' ? 'selected' : ''}>🌾 Grains &amp; Breads</option>
          <option value="canned" ${item.category === 'canned' ? 'selected' : ''}>🥫 Canned &amp; Jarred</option>
          <option value="baking" ${(item.category === 'baking' || item.category === 'condiments') ? 'selected' : ''}>🧂 Baking, Oils &amp; Spices</option>
          <option value="snacks" ${item.category === 'snacks' ? 'selected' : ''}>🍿 Snacks &amp; Drinks</option>
          <option value="leftovers" ${item.category === 'leftovers' ? 'selected' : ''}>🍲 Leftovers &amp; Meals</option>
        </select>

        <!-- Storage Location Selector (7 Physical Kitchen Storage Zones) -->
        <select onchange="updateGroceryStorage(${idx}, this.value)" class="bg-dark-elevated border border-dark-border rounded-xl px-2.5 py-1 text-slate-200 text-[11px] font-bold focus:border-pastel-sky focus:outline-none" title="Kitchen Storage Zone">
          <option value="fridge-crisper" ${item.storage === 'fridge-crisper' ? 'selected' : ''}>❄️ Crisper</option>
          <option value="fridge-main" ${(!item.storage || item.storage === 'fridge-main' || item.storage === 'fridge') ? 'selected' : ''}>🥛 Fridge</option>
          <option value="freezer" ${(item.storage === 'freezer' || item.storage === 'frozen') ? 'selected' : ''}>🧊 Freezer</option>
          <option value="counter" ${item.storage === 'counter' ? 'selected' : ''}>🧺 Counter</option>
          <option value="cupboard" ${item.storage === 'cupboard' ? 'selected' : ''}>🚪 Cupboard</option>
          <option value="pantry" ${(item.storage === 'pantry' || item.storage === 'shelf') ? 'selected' : ''}>🥫 Dry Pantry</option>
          <option value="spices" ${item.storage === 'spices' ? 'selected' : ''}>🧂 Spices</option>
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
    saveCustomReceiptAlias(it.rawName || clean, clean, it.category, it.storage, it.unit, it.amount);
  }
}

function updateGroceryCategory(idx, val) {
  if (state.incomingGroceriesApprovalList && state.incomingGroceriesApprovalList[idx]) {
    const it = state.incomingGroceriesApprovalList[idx];
    it.category = val;
    it.wasCustomEdited = true;
    saveCustomReceiptAlias(it.rawName || it.name, it.name, val, it.storage, it.unit, it.amount);
  }
}

function updateGroceryStorage(idx, val) {
  if (state.incomingGroceriesApprovalList && state.incomingGroceriesApprovalList[idx]) {
    const it = state.incomingGroceriesApprovalList[idx];
    it.storage = val;
    it.wasCustomEdited = true;
    saveCustomReceiptAlias(it.rawName || it.name, it.name, it.category, val, it.unit, it.amount);
  }
}

function updateGroceryAmount(idx, val) {
  if (state.incomingGroceriesApprovalList && state.incomingGroceriesApprovalList[idx]) {
    const it = state.incomingGroceriesApprovalList[idx];
    it.amount = parseFloat(val) || 1;
    it.wasCustomEdited = true;
    saveCustomReceiptAlias(it.rawName || it.name, it.name, it.category, it.storage, it.unit, it.amount);
  }
}

function updateGroceryUnit(idx, val) {
  if (state.incomingGroceriesApprovalList && state.incomingGroceriesApprovalList[idx]) {
    const it = state.incomingGroceriesApprovalList[idx];
    it.unit = (val || 'items').trim();
    it.wasCustomEdited = true;
    saveCustomReceiptAlias(it.rawName || it.name, it.name, it.category, it.storage, it.unit, it.amount);
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
      storage: item.storage || 'fridge-main',
      amount: parseFloat(item.amount) || 1,
      unit: item.unit || 'items',
      nutrition: item.nutrition,
      isVerified: Boolean(item.isVerified),
      nutritionSource: item.nutritionSource || (item.isVerified ? 'USDA / Label' : 'Clinical Estimate'),
      sourceBadge: item.sourceBadge || (item.isVerified ? '✓ Verified' : '~ Clinical Estimate'),
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
    { name: "Marketside Organic Baby Spinach 10 oz", category: "vegetables", storage: "fridge", amount: 10, unit: "oz", isFood: true },
    { name: "Organic Whole Milk 1 gal", category: "dairy", storage: "fridge", amount: 1, unit: "gal", isFood: true },
    { name: "Fresh Bananas", category: "fruits", storage: "counter", amount: 1, unit: "items", isFood: true },
    { name: "Great Value Extra Virgin Olive Oil 16.9 fl oz", category: "baking", storage: "shelf", amount: 16.9, unit: "fl oz", isFood: true },
    { name: "Great Value Black Beans 15.5 oz", category: "canned", storage: "shelf", amount: 15.5, unit: "oz", isFood: true },
    { name: "Great Value Jasmine Rice 5 lb", category: "grains", storage: "shelf", amount: 5, unit: "lb", isFood: true },
    { name: "Great Value Frozen Broccoli Florets 16 oz", category: "vegetables", storage: "frozen", amount: 16, unit: "oz", isFood: true },
    { name: "Bounty Paper Towels 6 rolls", category: "baking", storage: "shelf", amount: 6, unit: "pack", isFood: false }
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

if (typeof window !== 'undefined') {
  window.getReceiptNutritionCatalog = getReceiptNutritionCatalog;
  window.saveReceiptNutritionCatalogEntry = saveReceiptNutritionCatalogEntry;
  window.resolveReceiptItemNutrition = resolveReceiptItemNutrition;
  window.pairReceiptItemWithLabelOrBarcode = pairReceiptItemWithLabelOrBarcode;
  window.editReceiptItemNutrition = editReceiptItemNutrition;
}


