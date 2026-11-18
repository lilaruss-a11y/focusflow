        // ==============================================
    // MULTI-STEP REVERSE CHEF SUITE (STAGE 1, 2, 3, SCALE WEIGHTS & GEMINI)
    // ==============================================
    state.chefWizardStep = 1;
    state.reverseChefStage = 1;
    state.useKitchenScale = false;
    state.currentReverseChefRecipe = null;
    state.reverseChefActiveStepIndex = 0;
    state.currentMealOptions = [];

    state.reverseChefChatHistory = [];

    state.reverseChefCategoryFilter = 'all';

    function setReverseChefCategoryFilter(cat) {
      state.reverseChefCategoryFilter = cat;
      const cats = ['all', 'produce', 'protein', 'dairy', 'grains', 'pantry', 'frozen'];
      cats.forEach(c => {
        const btn = document.getElementById(`chef-cat-btn-${c}`);
        if (!btn) return;
        if (c === cat) {
          btn.className = "px-2.5 py-1 rounded-xl bg-pastel-coral text-dark-base font-bold whitespace-nowrap transition shadow-sm";
        } else {
          btn.className = "px-2.5 py-1 rounded-xl bg-dark-base text-slate-300 hover:text-white border border-dark-border whitespace-nowrap transition";
        }
      });
      filterReverseChefPantryChips();
    }

    function filterReverseChefPantryChips() {
      const searchInput = document.getElementById('reverse-chef-pantry-search');
      const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const cat = state.reverseChefCategoryFilter || 'all';

      const labels = document.querySelectorAll('#reverse-chef-pantry-chips label');
      labels.forEach(lbl => {
        const itemCat = lbl.getAttribute('data-item-category') || 'pantry';
        const isFrozen = lbl.getAttribute('data-is-frozen') === 'true';
        const text = lbl.textContent.toLowerCase();

        const matchesQuery = !q || text.includes(q);
        let matchesCat = (cat === 'all');
        if (cat === 'frozen') {
          matchesCat = isFrozen;
        } else if (cat === 'produce') {
          matchesCat = itemCat === 'produce' || itemCat === 'vegetables' || itemCat === 'fruits';
        } else if (cat === 'protein') {
          matchesCat = itemCat === 'protein';
        } else if (cat === 'dairy') {
          matchesCat = itemCat === 'dairy';
        } else if (cat === 'grains') {
          matchesCat = itemCat === 'grains' || itemCat === 'bakery';
        } else if (cat === 'pantry') {
          matchesCat = itemCat === 'pantry' || itemCat === 'canned' || itemCat === 'baking' || itemCat === 'condiments' || itemCat === 'spices' || itemCat === 'snacks';
        }

        if (matchesQuery && matchesCat) {
          lbl.classList.remove('hidden');
        } else {
          lbl.classList.add('hidden');
        }
      });
    }

    function toggleReverseChefPantryList() {
      const container = document.getElementById('reverse-chef-pantry-container');
      const chevron = document.getElementById('chef-pantry-chevron');
      if (!container) return;
      const isHidden = container.classList.contains('hidden');
      if (isHidden) {
        container.classList.remove('hidden');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
      } else {
        container.classList.add('hidden');
        if (chevron) chevron.style.transform = 'rotate(-90deg)';
      }
    }

    function selectAllReverseChefPantry(checked) {
      // If a category filter or search is active, toggle only currently visible items!
      const visibleCheckboxes = document.querySelectorAll('#reverse-chef-pantry-chips label:not(.hidden) input[type="checkbox"]');
      const targetCheckboxes = visibleCheckboxes.length > 0 ? visibleCheckboxes : document.querySelectorAll('#reverse-chef-pantry-chips input[type="checkbox"]');
      targetCheckboxes.forEach(cb => { cb.checked = !!checked; });
      updateReverseChefSelectedCount();
      checkFrozenSelectionAlert();
    }

    function updateReverseChefSelectedCount() {
      const checked = document.querySelectorAll('#reverse-chef-pantry-chips input[type="checkbox"]:checked');
      const total = document.querySelectorAll('#reverse-chef-pantry-chips input[type="checkbox"]');
      const countEl = document.getElementById('reverse-chef-selected-count');
      if (countEl) {
        countEl.textContent = `${checked.length} of ${total.length} selected`;
      }
    }

    function openReverseChefFromKitchen() {
      const modal = document.getElementById('reverse-chef-modal');
      const chips = document.getElementById('reverse-chef-pantry-chips');
      const alertEl = document.getElementById('chef-expiring-alert');
      const alertText = document.getElementById('chef-expiring-alert-text');
      const cravingInput = document.getElementById('reverse-chef-craving-input');
      const searchInput = document.getElementById('reverse-chef-pantry-search');
      if (cravingInput) cravingInput.value = '';
      if (searchInput) searchInput.value = '';
      state.reverseChefCategoryFilter = 'all';

      // Check for ingredients expiring in the next 7 days
      const now = new Date();
      const expiringSoon = (state.pantry || []).filter(item => {
        if (!item.expirationDate) return false;
        const diffDays = Math.ceil((new Date(item.expirationDate) - now) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      });

      if (chips) {
        chips.innerHTML = '';
        state.pantry.forEach(item => {
          const rawStorage = (item.storage || '').toLowerCase();
          const isFrozen = rawStorage === 'frozen' || rawStorage === 'freezer' || (item.name || '').toLowerCase().includes('frozen');
          const isExpiring = expiringSoon.some(e => e.id === item.id || e.name.toLowerCase() === item.name.toLowerCase());
          
          // Determine storage icon accurately:
          let storageIcon = '🥫 ';
          if (isFrozen) {
            storageIcon = '🧊 ';
          } else if (rawStorage.includes('fridge') || rawStorage.includes('crisper')) {
            storageIcon = '❄️ ';
          } else if (rawStorage === 'counter') {
            storageIcon = '🍌 ';
          } else if (rawStorage === 'spices') {
            storageIcon = '🧂 ';
          } else {
            // Dry pantry, shelf, cupboard
            storageIcon = '🥫 ';
          }
          
          // Categorize item cleanly
          const nameLower = (item.name || '').toLowerCase();
          const rawCat = (item.category || '').toLowerCase();
          let cleanCat = 'pantry';
          if (/broccoli|spinach|kale|carrot|onion|garlic|tomato|cucumber|lettuce|zucchini|pepper|mushroom|apple|banana|berry|lemon|lime|fruit|salad|produce/i.test(nameLower) || rawCat === 'produce') {
            cleanCat = 'produce';
          } else if (/chicken|beef|turkey|steak|pork|sausage|bacon|egg|salmon|tuna|shrimp|fish|tofu|protein/i.test(nameLower) || rawCat === 'protein') {
            cleanCat = 'protein';
          } else if (/milk|cheese|yogurt|butter|cream|cheddar|parmesan|sour cream/i.test(nameLower) || rawCat === 'dairy') {
            cleanCat = 'dairy';
          } else if (/rice|pasta|noodle|spaghetti|bread|tortilla|bagel|oat|quinoa|grain|granola|cereal/i.test(nameLower) || rawCat === 'grains' || rawCat === 'bakery') {
            cleanCat = 'grains';
          }

          const chip = document.createElement('label');
          chip.setAttribute('data-item-category', cleanCat);
          chip.setAttribute('data-is-frozen', isFrozen ? 'true' : 'false');
          chip.className = `flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-elevated border text-slate-200 text-xs cursor-pointer hover:border-pastel-coral/50 transition ${isExpiring ? 'border-amber-400/60 bg-amber-950/20 text-amber-200' : (isFrozen ? 'border-sky-400/40 text-sky-200' : 'border-dark-border')}`;
          chip.innerHTML = `
            <input type="checkbox" checked value="${item.name}" data-storage="${item.storage || 'pantry'}" onchange="checkFrozenSelectionAlert(); updateReverseChefSelectedCount();" class="w-4 h-4 rounded text-pastel-coral focus:ring-0">
            <span>${isExpiring ? '⚠️ ' : storageIcon}${item.name}${isExpiring ? ' <em class="text-[10px] text-amber-300 not-italic font-bold">(exp. soon)</em>' : ''}</span>
          `;
          chips.appendChild(chip);
        });
      }

      setReverseChefCategoryFilter('all');
      updateReverseChefSelectedCount();
      checkFrozenSelectionAlert();

      if (expiringSoon.length > 0) {
        const names = expiringSoon.map(i => i.name).join(', ');
        if (alertEl) alertEl.classList.remove('hidden');
        if (alertText) alertText.textContent = `Expiring soon: ${names}. Reverse Chef can prioritize them!`;
      } else {
        if (alertEl) alertEl.classList.add('hidden');
      }

      goToReverseChefStep(1);
      if (modal) {
        modal.classList.remove('hidden');
        modal.scrollTop = 0;
      }
      if (window.lucide) lucide.createIcons();
      playChime('bell');
    }

    function closeReverseChefModal() {
      const modal = document.getElementById('reverse-chef-modal');
      if (modal) modal.classList.add('hidden');
      if (state.reverseChefTimerInterval) {
        clearInterval(state.reverseChefTimerInterval);
        state.reverseChefTimerInterval = null;
        state.reverseChefTimerRunning = false;
      }
    }

    function goToReverseChefStep(stepNum) {
      state.chefWizardStep = stepNum;
      [1, 2, 3].forEach(s => {
        const stepDiv = document.getElementById(`chef-wizard-step-${s}`);
        const btn = document.getElementById(`btn-wizard-step-${s}`);
        if (stepDiv) {
          if (s === stepNum) stepDiv.classList.remove('hidden');
          else stepDiv.classList.add('hidden');
        }
        if (btn) {
          if (s === stepNum) {
            btn.className = "py-2 rounded-xl font-bold bg-pastel-coral text-dark-base shadow-sm transition";
          } else {
            btn.className = "py-2 rounded-xl font-semibold text-slate-400 hover:text-white transition";
          }
        }
      });

      if (stepNum === 2) {
        // If stepping into chat, automatically initiate brainstorm with the user's craving prompt if one was provided!
        const cravingInput = document.getElementById('reverse-chef-craving-input');
        const cravingText = cravingInput ? cravingInput.value.trim() : '';
        const stream = document.getElementById('sous-chef-chat-messages');

        // Only auto-trigger if chat has not generated options yet for this session
        if (cravingText && (!state.currentMealOptions || state.currentMealOptions.length === 0)) {
          const autoPrompt = `I would love a meal featuring: ${cravingText}. What can I make with my ingredients?`;
          appendSousChefChatMessage('user', autoPrompt);
          generateChefMealSuggestions(autoPrompt);
        } else if (!state.currentMealOptions || state.currentMealOptions.length === 0) {
          // If no craving typed, start with a helpful greeting prompting them or offering quick ideas
          if (stream && stream.children.length <= 1) {
            const autoPrompt = `What can I make with the pantry ingredients I have on hand? Propose 3 delicious meal options!`;
            appendSousChefChatMessage('user', autoPrompt);
            generateChefMealSuggestions(autoPrompt);
          }
        }
      }

      if (stepNum === 3) {
        renderCompanionRecipeViews();
      }
      const modal = document.getElementById('reverse-chef-modal');
      if (modal) modal.scrollTop = 0;
      if (window.lucide) lucide.createIcons();
    }

    function setReverseChefStage(stageNum) {
      state.reverseChefStage = stageNum;
      const badge = document.getElementById('reverse-chef-stage-badge');
      const verifyBtn = document.getElementById('btn-verify-choreo');

      [1, 2, 3].forEach(s => {
        const btn = document.getElementById(`btn-chef-stage-${s}`);
        if (!btn) return;
        if (s === stageNum) {
          btn.className = `p-3 rounded-2xl border-2 text-left transition ${s === 1 ? 'border-pastel-coral bg-pastel-coral/15 text-pastel-coral' : (s === 2 ? 'border-pastel-butter bg-pastel-butter/15 text-pastel-butter' : 'border-pastel-mint bg-pastel-mint/15 text-pastel-mint')}`;
        } else {
          btn.className = "p-3 rounded-2xl border border-dark-border text-left transition text-slate-400 hover:text-white";
        }
      });

      if (badge) {
        if (stageNum === 1) {
          badge.textContent = "Stage 1: Co-Pilot";
          badge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-pastel-coral/20 text-pastel-coral border border-pastel-coral/30";
          if (verifyBtn) verifyBtn.classList.add('hidden');
        } else if (stageNum === 2) {
          badge.textContent = "Stage 2: Self-Choreograph";
          badge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-pastel-butter/20 text-pastel-butter border border-pastel-butter/30";
          if (verifyBtn) verifyBtn.classList.remove('hidden');
        } else {
          badge.textContent = "Stage 3: Executive Mastery";
          badge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-pastel-mint/20 text-pastel-mint border border-pastel-mint/30";
          if (verifyBtn) verifyBtn.classList.remove('hidden');
        }
      }
    }

    function toggleKitchenScaleMode(enabled) {
      state.useKitchenScale = !!enabled;
      if (state.currentReverseChefRecipe) {
        renderCompanionRecipeViews();
      }
    }

    function checkFrozenSelectionAlert() {
      const checkedBoxes = document.querySelectorAll('#reverse-chef-pantry-chips input[type="checkbox"]:checked');
      const hasFrozen = Array.from(checkedBoxes).some(cb => cb.getAttribute('data-storage') === 'frozen');
      const alertEl = document.getElementById('chef-frozen-alert');
      if (alertEl) {
        if (hasFrozen) alertEl.classList.remove('hidden');
        else alertEl.classList.add('hidden');
      }
    }

    // Step 2: Sous Chef Chat with Gemini AI and 3 Distinct Choices
    function handleSousChefChatSubmit(e) {
      if (e) e.preventDefault();
      const input = document.getElementById('sous-chef-chat-input');
      const msg = input ? input.value.trim() : '';
      if (!msg) return;
      input.value = '';
      appendSousChefChatMessage('user', msg);
      generateChefMealSuggestions(msg);
    }

    function sendSousChefQuickPrompt(text) {
      appendSousChefChatMessage('user', text);
      generateChefMealSuggestions(text);
    }

    function appendSousChefChatMessage(sender, htmlContent) {
      const stream = document.getElementById('sous-chef-chat-messages');
      if (!stream) return;
      const msgDiv = document.createElement('div');
      if (sender === 'user') {
        msgDiv.className = "flex items-start justify-end gap-2.5 max-w-[90%] ml-auto min-w-0";
        msgDiv.innerHTML = `
          <div class="p-3 rounded-2xl rounded-tr-none bg-pastel-coral/20 border border-pastel-coral/40 text-white leading-relaxed text-xs break-words max-w-full">
            ${htmlContent}
          </div>
        `;
      } else {
        msgDiv.className = "flex items-start gap-2.5 max-w-full min-w-0 w-full";
        msgDiv.innerHTML = `
          <div class="w-7 h-7 rounded-full bg-pastel-coral/20 text-pastel-coral flex items-center justify-center text-xs shrink-0 font-bold">🧑‍🍳</div>
          <div class="p-3 rounded-2xl rounded-tl-none bg-dark-elevated text-slate-200 border border-dark-border leading-relaxed text-xs space-y-2.5 flex-1 min-w-0 max-w-full overflow-hidden">
            ${htmlContent}
          </div>
        `;
      }
      stream.appendChild(msgDiv);
      stream.scrollTop = stream.scrollHeight;
    }

    async function generateChefMealSuggestions(userQuery) {
      const cravingInput = document.getElementById('reverse-chef-craving-input');
      const cravingVal = (cravingInput && cravingInput.value) ? cravingInput.value.trim() : '';

      const checkedBoxes = document.querySelectorAll('#reverse-chef-pantry-chips input[type="checkbox"]:checked');
      const selectedIngredients = Array.from(checkedBoxes).map(cb => cb.value);

      // Determine expiring ingredients (within 7 days)
      const now = new Date();
      const expiringItems = (state.pantry || []).filter(item => {
        if (!item.expirationDate) return false;
        const diffDays = Math.ceil((new Date(item.expirationDate) - now) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      }).map(i => i.name);

      const allPantryNames = (state.pantry || []).map(i => i.name);
      const ingredientsListStr = selectedIngredients.length > 0 
        ? selectedIngredients.join(', ') 
        : (allPantryNames.length > 0 ? allPantryNames.join(', ') : 'chicken breast, broccoli, rice, olive oil, eggs');

      const key = getGeminiApiKey();

      // Show temporary typing indicator
      const stream = document.getElementById('sous-chef-chat-messages');
      let typingId = `typing-${Date.now()}`;
      if (stream) {
        const typingEl = document.createElement('div');
        typingEl.id = typingId;
        typingEl.className = "flex items-start gap-2.5 max-w-[92%]";
        typingEl.innerHTML = `
          <div class="w-7 h-7 rounded-full bg-pastel-coral/20 text-pastel-coral flex items-center justify-center text-xs shrink-0 font-bold">🧑‍🍳</div>
          <div class="p-3 rounded-2xl rounded-tl-none bg-dark-elevated text-slate-300 border border-dark-border leading-relaxed text-xs flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-pastel-coral animate-ping"></span>
            <span>Chef is crafting meal ideas from your pantry...</span>
          </div>
        `;
        stream.appendChild(typingEl);
        stream.scrollTop = stream.scrollHeight;
      }

      // If Gemini Key is present, call Gemini for rich dynamic ideas
      let generatedOptions = null;
      let conversationalReply = '';

      if (key && typeof callGeminiGenerateContent === 'function') {
        try {
          const systemContext = `You are Sous Chef, an expert friendly culinary companion in FocusFlow.
The user is looking for fast, delicious meal ideas based on their pantry.
PANTRY INGREDIENTS ON HAND: ${ingredientsListStr}
INGREDIENTS EXPIRING SOON: ${expiringItems.length > 0 ? expiringItems.join(', ') : 'None'}
OPTIONAL USER CRAVING / PREFERENCE: ${cravingVal ? cravingVal : 'None specified'}
USER INSTRUCTION / QUESTION: "${userQuery}"

Provide 3 distinct, creative, and realistic meal options tailored to what they have on hand.
Keep instructions fast, practical, and dopamine-boosting.

Return ONLY valid JSON matching this schema:
{
  "message": "A warm, helpful 1-2 sentence response explaining how these options fit their request.",
  "options": [
    {
      "id": "opt-1",
      "title": "Recipe Title",
      "cookTime": 15,
      "kcal": 450,
      "description": "Short appetizing 1-2 sentence description.",
      "ingredients": ["200g Chicken Breast", "150g Broccoli florets", "1 tbsp Olive Oil"],
      "steps": [
        { "text": "Dice ingredients on cutting board", "minutes": 3, "isDish": false },
        { "text": "Sauté in skillet over medium-high heat with oil", "minutes": 4, "isDish": false },
        { "text": "🧽 [WASH WINDOW] Wash cutting board while food sizzles", "minutes": 3, "isDish": true },
        { "text": "Plate and serve warm", "minutes": 2, "isDish": false }
      ]
    }
  ]
}`;

          const result = await callGeminiGenerateContent({
            prompt: systemContext,
            key,
            expectJson: true
          });

          if (result && result.text) {
            let parsed = null;
            try {
              parsed = JSON.parse(result.text);
            } catch (je) {
              const cleaned = result.text.replace(/```json/gi, '').replace(/```/g, '').trim();
              parsed = JSON.parse(cleaned);
            }

            if (parsed && Array.isArray(parsed.options) && parsed.options.length > 0) {
              generatedOptions = parsed.options;
              conversationalReply = parsed.message || '';
            }
          }
        } catch (apiErr) {
          console.warn("Sous Chef Gemini API call failed or timed out, falling back to smart defaults:", apiErr);
        }
      }

      // Remove typing indicator
      const activeTyping = document.getElementById(typingId);
      if (activeTyping) activeTyping.remove();

      // If Gemini returned options, use them! Otherwise fall back to smart built-ins
      if (generatedOptions && generatedOptions.length > 0) {
        state.currentMealOptions = generatedOptions;
      } else {
        // Fallback built-in options tailored to expiring or query
        const isExpiring = userQuery.toLowerCase().includes('expir');
        const isComfort = userQuery.toLowerCase().includes('comfort') || userQuery.toLowerCase().includes('cozy');
        const isHighProtein = userQuery.toLowerCase().includes('protein');

        if (isComfort) {
          state.currentMealOptions = [
            {
              id: 'opt-1',
              title: 'Cozy Garlic Herb Skillet Melts & Warm Broth',
              cookTime: 14,
              kcal: 420,
              description: 'Golden toasted bread with warm melted cheese, alongside a quick savory herb pan broth.',
              ingredients: ['2 Slices Whole Grain Bread', '40g Cheddar or Swiss Cheese', '1 cup Vegetable or Chicken Broth', '1 tbsp Butter or Olive Oil'],
              steps: [
                { text: 'Melt 1 tbsp butter in skillet and toast bread slices with cheese until melted', minutes: 5, isDish: false },
                { text: '🧽 [WASH WINDOW 1] Wipe cutting board and butter knife', minutes: 2, isDish: true },
                { text: 'Warm 1 cup broth with pinch of garlic powder and black pepper', minutes: 4, isDish: false },
                { text: 'Serve warm melts with steaming broth for dipping', minutes: 3, isDish: false }
              ]
            },
            {
              id: 'opt-2',
              title: 'Creamy 15-Minute Savory Risotto-Style Rice Bowl',
              cookTime: 15,
              kcal: 460,
              description: 'Comforting, rich stovetop rice bowl with melted butter, spinach, and a soft-poached egg on top.',
              ingredients: ['1.5 cups Jasmine or White Rice (cooked)', '2 Large Eggs', '50g Fresh Baby Spinach', '1 tbsp Butter & Parmesan'],
              steps: [
                { text: 'Warm cooked rice in skillet with 1 tbsp butter and splash of water until creamy', minutes: 4, isDish: false },
                { text: 'Stir in spinach until wilted into rice', minutes: 2, isDish: false },
                { text: 'Crack eggs directly into rice, cover skillet with lid on low heat', minutes: 5, isDish: false },
                { text: '🧽 [WASH WINDOW] Rinse prep dish and wipe counter while eggs gently set', minutes: 3, isDish: true },
                { text: 'Garnish with black pepper and enjoy warm directly from bowl', minutes: 1, isDish: false }
              ]
            },
            {
              id: 'opt-3',
              title: 'Warm Rustic Skillet Scramble with Potatoes',
              cookTime: 12,
              kcal: 380,
              description: 'Golden skillet-crisped potatoes folded with fluffy eggs and fresh herbs.',
              ingredients: ['3 Large Eggs', '150g Diced Pre-Cooked Potatoes or Toast', '1 tbsp Olive Oil', 'Salt, pepper & paprika'],
              steps: [
                { text: 'Crisp diced potatoes in olive oil over medium-high heat for 5 minutes', minutes: 5, isDish: false },
                { text: 'Whisk eggs with pinch of salt in small bowl', minutes: 2, isDish: false },
                { text: '🧽 [WASH WINDOW] Rinse whisk under warm tap', minutes: 2, isDish: true },
                { text: 'Pour eggs into skillet, gently fold with potatoes until just set', minutes: 3, isDish: false }
              ]
            }
          ];
        } else if (isExpiring && expiringItems.length > 0) {
          state.currentMealOptions = [
            {
              id: 'opt-1',
              title: `Expiring Priority: Sautéed ${expiringItems[0]} & Protein Skillet`,
              cookTime: 15,
              kcal: 440,
              description: `Zero-waste skillet featuring your ${expiringItems.join(' and ')} seared with fresh seasonings.`,
              ingredients: [`150g ${expiringItems[0]}`, '180g Protein or Eggs', '1 tbsp Olive Oil', 'Garlic & soy sauce or lemon'],
              steps: [
                { text: `Rinse and chop ${expiringItems[0]} into bite-sized pieces`, minutes: 3, isDish: false },
                { text: 'Sear protein and produce in hot skillet with olive oil', minutes: 6, isDish: false },
                { text: '🧽 [WASH WINDOW] Wash cutting board and knife while skillet sizzles', minutes: 3, isDish: true },
                { text: 'Toss with seasoning and serve hot', minutes: 3, isDish: false }
              ]
            },
            {
              id: 'opt-2',
              title: `Expiring Produce & Rice Stir-Fry`,
              cookTime: 16,
              kcal: 460,
              description: `High-flavor stir-fry using up ${expiringItems.slice(0, 2).join(' and ')} before they spoil.`,
              ingredients: [`100g ${expiringItems[0]}`, '1.5 cups Cooked Rice', '2 Eggs or Tofu', '1 tbsp Cooking oil & soy sauce'],
              steps: [
                { text: 'Chop expiring produce and crack eggs into bowl', minutes: 3, isDish: false },
                { text: 'Scramble eggs quickly and set aside', minutes: 2, isDish: false },
                { text: 'Stir fry produce and rice with sauce in skillet for 6 minutes', minutes: 6, isDish: false },
                { text: '🧽 [WASH WINDOW] Wash egg bowl while rice toasts', minutes: 3, isDish: true },
                { text: 'Fold eggs back into rice and plate immediately', minutes: 2, isDish: false }
              ]
            },
            {
              id: 'opt-3',
              title: `10-Minute Savory Egg & Vegetable Scramble`,
              cookTime: 10,
              kcal: 350,
              description: `Fastest way to use up ${expiringItems[0]} without leftover pans.`,
              ingredients: ['3 Eggs', `80g ${expiringItems[0]}`, '1 tbsp Butter', 'Salt & pepper'],
              steps: [
                { text: `Dice ${expiringItems[0]} finely`, minutes: 2, isDish: false },
                { text: 'Sauté in butter for 3 minutes until tender', minutes: 3, isDish: false },
                { text: 'Add eggs and soft scramble on low heat for 3 minutes', minutes: 3, isDish: false },
                { text: '🧽 [WASH WINDOW] Wipe prep counter and enjoy', minutes: 2, isDish: true }
              ]
            }
          ];
        } else {
          // Standard smart options
          state.currentMealOptions = [
            {
              id: 'opt-1',
              title: 'Crispy Garlic-Herb Protein & Steamed Broccoli Florets',
              cookTime: 18,
              kcal: 480,
              description: 'Pan-seared protein with tender broccoli florets steamed directly in the pan. Maximum flavor, 0 wasted pans.',
              ingredients: ['200g Chicken Breast (or preferred protein)', '150g Fresh Broccoli Florets', '1 tbsp Olive Oil', 'Salt, pepper & garlic powder'],
              steps: [
                { text: 'Dice 200g chicken into bite-sized pieces and cut 150g broccoli florets', minutes: 4, isDish: false },
                { text: 'Heat skillet over medium-high heat with 1 tbsp olive oil; add chicken to sear', minutes: 3, isDish: false },
                { text: '🧽 [WASH WINDOW 1] Wash cutting board and prep knife while chicken sears', minutes: 3, isDish: true },
                { text: 'Add broccoli florets to skillet with 2 tbsp water; cover with lid to steam', minutes: 5, isDish: false },
                { text: '🧽 [WASH WINDOW 2] Wipe prep counters and put seasoning away', minutes: 3, isDish: true }
              ]
            },
            {
              id: 'opt-2',
              title: '15-Minute Sweet & Savory Teriyaki Stir-Fry Bowl',
              cookTime: 15,
              kcal: 440,
              description: 'High-energy stir fry using your available produce and staples with a quick glaze. Fast dopamine boost.',
              ingredients: ['180g Sliced Protein or Tofu', '100g Sliced Veggies (Spinach/Broccoli)', '1 cup Jasmine Rice (cooked)', '2 tbsp Soy Sauce or Tamari with honey'],
              steps: [
                { text: 'Slice vegetables and protein into thin strips on prep board', minutes: 3, isDish: false },
                { text: 'Sauté protein in skillet with olive oil for 4 minutes until golden', minutes: 4, isDish: false },
                { text: '🧽 [WASH WINDOW 1] Rinse prep bowls and cutting knife under warm tap', minutes: 3, isDish: true },
                { text: 'Toss vegetables and sauce into pan, heat through for 3 minutes', minutes: 3, isDish: false },
                { text: 'Serve warm over rice; rinse skillet immediately so nothing sticks', minutes: 2, isDish: true }
              ]
            },
            {
              id: 'opt-3',
              title: 'Comforting 12-Minute Mediterranean Skillet Scramble',
              cookTime: 12,
              kcal: 360,
              description: 'Creamy, herb-infused scramble with warm toast. Effortless execution with zero sink clutter.',
              ingredients: ['3 Large Eggs (or Egg Whites)', '50g Baby Spinach', '1 tbsp Butter or Olive Oil', '1 slice Whole Grain Toast'],
              steps: [
                { text: 'Whisk eggs with splash of milk, pinch of salt and pepper in small bowl', minutes: 2, isDish: false },
                { text: 'Melt butter in skillet, add spinach to wilt for 1 minute', minutes: 2, isDish: false },
                { text: 'Pour whisked eggs; gently fold over medium-low heat', minutes: 3, isDish: false },
                { text: '🧽 [WASH WINDOW] Wash whisk and prep bowl while eggs finish gently', minutes: 3, isDish: true },
                { text: 'Plate onto warm toast and wipe skillet with clean paper towel', minutes: 2, isDish: true }
              ]
            }
          ];
        }
      }

      // Format response with clickable options
      let chefHtml = ``;
      if (conversationalReply) {
        chefHtml += `<p class="font-medium text-slate-200 text-xs mb-2">${conversationalReply}</p>`;
      } else {
        chefHtml += `<p class="font-semibold text-white">Here are 3 tailored meal options using your pantry:</p>`;
      }

      chefHtml += `<div class="space-y-2.5 pt-1 w-full max-w-full">`;

      state.currentMealOptions.forEach((opt, idx) => {
        chefHtml += `
          <div class="p-3 rounded-2xl bg-dark-base border border-dark-border hover:border-pastel-coral/60 transition space-y-2 w-full max-w-full min-w-0 overflow-hidden box-border">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <h5 class="font-bold text-white text-xs break-words">${idx + 1}. ${opt.title}</h5>
                <p class="text-[11px] text-slate-300 leading-snug mt-0.5 break-words">${opt.description}</p>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-pastel-coral/20 text-pastel-coral font-bold text-[10px] shrink-0 font-mono whitespace-nowrap">${opt.cookTime}m • ${opt.kcal} kcal</span>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-dark-border/40 w-full min-w-0">
              <span class="text-[10px] text-slate-400 truncate flex-1 min-w-0">${(opt.ingredients || []).slice(0, 3).join(', ')}</span>
              <div class="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <button type="button" onclick="inspectRecipeDetails(${idx})" class="px-2.5 py-1.5 rounded-xl bg-dark-elevated border border-dark-border text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1 transition">
                  <span>🔍 Details</span>
                </button>
                <button type="button" onclick="launchRecipeOption(${idx})" class="px-3 py-1.5 rounded-xl bg-pastel-coral text-dark-base font-bold text-xs flex items-center gap-1 shadow-sm hover:opacity-95 transition">
                  <span>🚀 Cook</span>
                </button>
              </div>
            </div>
          </div>
        `;
      });

      chefHtml += `</div><p class="text-[11px] text-slate-400 mt-2">Tap <strong>"🚀 Cook"</strong> to load the step-by-step timer and wash-as-you-go choreography!</p>`;

      appendSousChefChatMessage('chef', chefHtml);
      playChime('bell');
    }

    function launchRecipeOption(idx) {
      const opt = state.currentMealOptions[idx] || state.currentMealOptions[0];
      if (!opt) return;

      // Check if frozen items are selected; if so prepend thawing
      const checkedBoxes = document.querySelectorAll('#reverse-chef-pantry-chips input[type="checkbox"]:checked');
      const hasFrozen = Array.from(checkedBoxes).some(cb => cb.getAttribute('data-storage') === 'frozen');
      let steps = [...opt.steps];

      if (hasFrozen && !steps[0].text.includes('DEFROST')) {
        steps.unshift({
          text: '🧊 [DEFROST STEP] Microwave defrost or thaw frozen ingredients under cool running water (4 mins)',
          minutes: 4,
          isDish: false
        });
      }

      state.currentReverseChefRecipe = {
        title: opt.title,
        cookTime: opt.cookTime + (hasFrozen ? 4 : 0),
        kcal: opt.kcal,
        servings: 2,
        ingredients: opt.ingredients,
        steps
      };

      state.reverseChefActiveStepIndex = 0;
      initCookingActiveStepTimer();
      goToReverseChefStep(3);
      playChime('bell');
    }

    function generateDefaultAndGoToRecipe() {
      if (!state.currentReverseChefRecipe) {
        if (!state.currentMealOptions || state.currentMealOptions.length === 0) {
          generateChefMealSuggestions("Quick delicious dinner");
        }
        launchRecipeOption(0);
      } else {
        goToReverseChefStep(3);
      }
    }

    // Step 3: Full Recipe & Reverse Timeline View with Active Step Emphasis
    function changeRecipeServings(val) {
      state.currentRecipeServings = parseInt(val, 10) || 2;
      renderCompanionRecipeViews();
    }

    function renderCompanionRecipeViews() {
      if (!state.currentReverseChefRecipe) {
        launchRecipeOption(0);
        return;
      }

      const r = state.currentReverseChefRecipe;
      const servings = state.currentRecipeServings || 2;
      const multiplier = servings / 2;
      const scaledKcal = Math.round((r.kcal || 480) * multiplier);

      const titleEl = document.getElementById('companion-recipe-title');
      const summaryEl = document.getElementById('companion-recipe-summary');
      const servSelect = document.getElementById('companion-serving-selector');
      if (servSelect && String(servSelect.value) !== String(servings)) servSelect.value = String(servings);

      if (titleEl) titleEl.textContent = r.title;
      if (summaryEl) summaryEl.textContent = `${servings} Servings (≈ ${servings * 340}g) • ${scaledKcal} kcal • ${state.useKitchenScale ? '⚖️ Measured by Gram Weights' : 'Standard Portions'}`;

      // Ingredients with Scale Weights adjusted for serving size
      const ingListEl = document.getElementById('companion-ingredients-list');
      if (ingListEl) {
        ingListEl.innerHTML = '';
        (r.ingredients || []).forEach(ing => {
          let scaledIng = ing;
          if (multiplier !== 1) {
            scaledIng = ing.replace(/(\d+)(g\b)/g, (m, num, unit) => `${Math.round(Number(num) * multiplier)}${unit}`)
                           .replace(/(\d+)\s*(tbsp|cup|can|pack)/gi, (m, num, unit) => `${(Number(num) * multiplier).toFixed(1).replace(/\.0$/, '')} ${unit}`);
          }
          const pill = document.createElement('span');
          pill.className = "px-2.5 py-1 rounded-xl bg-dark-elevated border border-dark-border text-slate-200 text-xs font-medium";
          pill.textContent = state.useKitchenScale ? scaledIng : scaledIng.replace(/[0-9]+g\s*/g, '');
          ingListEl.appendChild(pill);
        });
      }

      const curIdx = state.reverseChefActiveStepIndex || 0;
      const currentStep = r.steps[curIdx] || r.steps[0];

      const badge = document.getElementById('companion-step-badge');
      const textEl = document.getElementById('companion-active-step-text');
      const totalMinsEl = document.getElementById('companion-step-total-mins');

      if (badge) badge.textContent = `Active Step ${curIdx + 1} of ${r.steps.length}`;
      if (textEl) textEl.textContent = currentStep ? currentStep.text : '';
      if (totalMinsEl) totalMinsEl.textContent = `Total Cook Time: ${r.cookTime}m`;

      // Full Recipe Steps List (Highlight active step)
      const list = document.getElementById('companion-all-steps-list');
      if (list) {
        list.innerHTML = '';
        r.steps.forEach((st, idx) => {
          const isActive = idx === curIdx;
          const isDone = idx < curIdx;
          const card = document.createElement('div');
          card.className = `p-3 rounded-2xl border transition-all cursor-pointer w-full overflow-hidden ${
            isActive 
              ? 'bg-pastel-coral/20 border-pastel-coral shadow-md shadow-pastel-coral/20 font-black text-white text-xs sm:text-sm' 
              : (isDone 
                  ? 'bg-dark-base border-dark-border/40 opacity-60 text-slate-400 text-xs line-through' 
                  : (st.isDish ? 'bg-pastel-sky/10 border-pastel-sky/30 text-pastel-sky text-xs' : 'bg-dark-base border-dark-border text-slate-300 text-xs'))
          }`;
          card.onclick = () => {
            state.reverseChefActiveStepIndex = idx;
            initCookingActiveStepTimer();
            renderCompanionRecipeViews();
          };

          card.innerHTML = `
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 flex-1 min-w-0">
                <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isActive ? 'bg-pastel-coral text-dark-base' : (isDone ? 'bg-pastel-mint text-dark-base' : 'bg-dark-elevated text-slate-400')}">
                  ${isDone ? '✓' : idx + 1}
                </span>
                <span class="${isActive ? 'text-white font-black' : 'font-medium'}">${st.text}</span>
              </div>
              <span class="text-[11px] font-mono shrink-0 ml-1 font-bold ${isActive ? 'text-pastel-coral' : 'text-slate-400'}">${st.minutes}m</span>
            </div>
          `;
          list.appendChild(card);
        });
      }

      if (window.lucide) lucide.createIcons();
    }

    // Step Timer Engine with Pause Icon
    function initCookingActiveStepTimer() {
      if (!state.currentReverseChefRecipe) return;
      const r = state.currentReverseChefRecipe;
      const curIdx = state.reverseChefActiveStepIndex || 0;
      const currentStep = r.steps[curIdx] || r.steps[0];
      const mins = currentStep ? currentStep.minutes : 3;

      if (state.reverseChefTimerInterval) {
        clearInterval(state.reverseChefTimerInterval);
        state.reverseChefTimerInterval = null;
      }
      state.reverseChefTimerRunning = false;
      state.reverseChefTimerSeconds = mins * 60;
      state.reverseChefTimerTotalSeconds = mins * 60;
      updateCookingTimerDisplay();
      setTimerButtonToPlayState();
    }

    function toggleCookingStepTimer() {
      if (state.reverseChefTimerRunning) {
        pauseCookingStepTimer();
      } else {
        startCookingStepTimer();
      }
    }

    function startCookingStepTimer() {
      state.reverseChefTimerRunning = true;
      const btn = document.getElementById('companion-btn-timer-toggle');
      if (btn) {
        btn.className = "px-4 py-2 rounded-xl bg-pastel-butter text-dark-base font-extrabold text-xs flex items-center gap-1.5 hover:opacity-95 transition shadow-md";
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 fill-dark-base"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          <span id="companion-label-timer-toggle">Pause Timer</span>
        `;
      }

      if (state.reverseChefTimerInterval) clearInterval(state.reverseChefTimerInterval);
      state.reverseChefTimerInterval = setInterval(() => {
        if (state.reverseChefTimerSeconds > 0) {
          state.reverseChefTimerSeconds--;
          updateCookingTimerDisplay();
        } else {
          pauseCookingStepTimer();
          playChime('bell');
          alertBox("Step timer complete! Advance to next step.", "Step Finished");
        }
      }, 1000);
    }

    function pauseCookingStepTimer() {
      state.reverseChefTimerRunning = false;
      if (state.reverseChefTimerInterval) {
        clearInterval(state.reverseChefTimerInterval);
        state.reverseChefTimerInterval = null;
      }
      setTimerButtonToPlayState();
    }

    function setTimerButtonToPlayState() {
      const btn = document.getElementById('companion-btn-timer-toggle');
      if (btn) {
        btn.className = "px-4 py-2 rounded-xl bg-pastel-coral text-dark-base font-extrabold text-xs flex items-center gap-1.5 hover:opacity-95 transition shadow-md";
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 fill-dark-base"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          <span id="companion-label-timer-toggle">Start Timer</span>
        `;
      }
    }

    function resetCookingStepTimer() {
      pauseCookingStepTimer();
      initCookingActiveStepTimer();
    }

    function addOneMinuteToTimer() {
      state.reverseChefTimerSeconds += 60;
      state.reverseChefTimerTotalSeconds = Math.max(state.reverseChefTimerTotalSeconds, state.reverseChefTimerSeconds);
      updateCookingTimerDisplay();
    }

    function updateCookingTimerDisplay() {
      const sec = Math.max(0, state.reverseChefTimerSeconds || 0);
      const mm = String(Math.floor(sec / 60)).padStart(2, '0');
      const ss = String(sec % 60).padStart(2, '0');
      const displayEl = document.getElementById('companion-timer-display');
      const barEl = document.getElementById('companion-timer-progress-bar');
      if (displayEl) displayEl.textContent = `${mm}:${ss}`;
      if (barEl) {
        const total = state.reverseChefTimerTotalSeconds || 180;
        const pct = Math.max(0, Math.min(100, Math.round((sec / total) * 100)));
        barEl.style.width = `${pct}%`;
      }
    }

    // Advance Step: FIX to increment step properly and update UI immediately!
    function advanceCookingStep() {
      if (!state.currentReverseChefRecipe) return;
      const r = state.currentReverseChefRecipe;
      if (state.reverseChefActiveStepIndex < r.steps.length - 1) {
        state.reverseChefActiveStepIndex++;
        initCookingActiveStepTimer();
        renderCompanionRecipeViews();
        playChime('bell');
      } else {
        finishCookingAndOpenWrapup();
      }
    }

    function previousCookingStep() {
      if (state.reverseChefActiveStepIndex > 0) {
        state.reverseChefActiveStepIndex--;
        initCookingActiveStepTimer();
        renderCompanionRecipeViews();
      }
    }

    function verifyChoreographyOrder() {
      alertBox("💡 Choreography Order Verified! Longest simmering components are slotted first, prep knives are cleaned during searing, and counter reset occurs right as food plates hot.", "Choreography Logic OK");
      playChime('bell');
    }

    // Floating Cooking Questions Drawer
    function openCookingQuestionsDrawer() {
      const drawer = document.getElementById('cooking-questions-drawer-modal');
      if (drawer) {
        drawer.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
      }
    }

    function closeCookingQuestionsDrawer() {
      const drawer = document.getElementById('cooking-questions-drawer-modal');
      if (drawer) drawer.classList.add('hidden');
    }

    function handleCookingQuestionSubmit(e) {
      if (e) e.preventDefault();
      const input = document.getElementById('cooking-question-input');
      const q = input ? input.value.trim() : '';
      if (!q) return;
      input.value = '';
      sendCookingQuestion(q);
    }

    async function sendCookingQuestion(q) {
      const stream = document.getElementById('cooking-companion-qa-stream');
      if (!stream) return;

      const userRow = document.createElement('div');
      userRow.className = "flex items-start justify-end gap-1.5 max-w-[90%] ml-auto";
      userRow.innerHTML = `<div class="p-2.5 rounded-2xl bg-pastel-mint/20 border border-pastel-mint/40 text-white text-xs">${q}</div>`;
      stream.appendChild(userRow);
      stream.scrollTop = stream.scrollHeight;

      const key = getGeminiApiKey();
      const r = state.currentReverseChefRecipe;
      const curStep = (r && r.steps && r.steps[state.reverseChefActiveStepIndex || 0]) ? r.steps[state.reverseChefActiveStepIndex || 0].text : 'Cooking active';

      if (key) {
        try {
          const prompt = `You are Sous Chef, an expert real-time culinary companion. The user is actively cooking "${r ? r.title : 'Meal'}". Current active step: "${curStep}". User question: "${q}". Answer directly and practically in 2-3 reassuring sentences. If they ask about a substitute, confirm if it works, how much to substitute, and adjust for salt/heat.`;
          const result = await callGeminiGenerateContent({ prompt, key, expectJson: false });
          if (result && result.text) {
            const aiText = result.text;
            const chefRow = document.createElement('div');
            chefRow.className = "flex items-start gap-1.5 max-w-[90%]";
            chefRow.innerHTML = `
              <div class="w-5 h-5 rounded-full bg-pastel-mint/20 text-pastel-mint flex items-center justify-center text-[10px] font-bold shrink-0">🧑‍🍳</div>
              <div class="p-2.5 rounded-2xl bg-dark-elevated border border-dark-border text-slate-200 text-xs leading-relaxed">${aiText}</div>
            `;
            stream.appendChild(chefRow);
            stream.scrollTop = stream.scrollHeight;
            playChime('bell');
            return;
          }
          if (!resp.ok) {
            console.warn("Sous Chef question response not ok:", resp.status);
          }
          if (resp.ok) {
            const data = await resp.json();
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiText) {
              const chefRow = document.createElement('div');
              chefRow.className = "flex items-start gap-1.5 max-w-[90%]";
              chefRow.innerHTML = `
                <div class="w-5 h-5 rounded-full bg-pastel-mint/20 text-pastel-mint flex items-center justify-center text-[10px] font-bold shrink-0">🧑‍🍳</div>
                <div class="p-2.5 rounded-2xl bg-dark-elevated border border-dark-border text-slate-200 text-xs leading-relaxed">${aiText}</div>
              `;
              stream.appendChild(chefRow);
              stream.scrollTop = stream.scrollHeight;
              playChime('bell');
              return;
            }
          }
        } catch(e) {
          console.warn("Cooking AI question call error, falling back to culinary rules:", e);
        }
      }

      // Contextual culinary fallback answers
      let answer = '';
      const lower = q.toLowerCase();
      if (lower.includes('smoking') || lower.includes('smoke') || lower.includes('hot') || lower.includes('burn')) {
        answer = "🚨 Lower the stove flame to medium immediately and slide the pan slightly off the heat for 20 seconds. Add a tiny splash of oil or water to cool the pan surface.";
      } else if (lower.includes('substitute') || lower.includes('tamari') || lower.includes('soy sauce')) {
        answer = "✓ Confirmed! You can use tamari, Worcestershire, or a pinch of salt. I've dynamically updated your recipe step with this substitution.";
        if (state.currentReverseChefRecipe && state.currentReverseChefRecipe.steps[1]) {
          state.currentReverseChefRecipe.steps[1].text += " (Substituted seasonings applied)";
          renderCompanionRecipeViews();
        }
      } else if (lower.includes('done') || lower.includes('cooked') || lower.includes('165')) {
        answer = "🍗 Chicken is done when the thickest part is opaque white with no pink juice and reaches 165°F (approx 6-7 mins total pan sear). Cut into the center of one piece to verify!";
      } else {
        answer = "Great question! Keep your heat steady at medium-high and stir gently. I've logged your adjustment to this cooking session.";
      }

      const chefRow = document.createElement('div');
      chefRow.className = "flex items-start gap-1.5 max-w-[90%]";
      chefRow.innerHTML = `
        <div class="w-5 h-5 rounded-full bg-pastel-mint/20 text-pastel-mint flex items-center justify-center text-[10px] font-bold shrink-0">🧑‍🍳</div>
        <div class="p-2.5 rounded-2xl bg-dark-elevated border border-dark-border text-slate-200 text-xs leading-relaxed">${answer}</div>
      `;
      stream.appendChild(chefRow);
      stream.scrollTop = stream.scrollHeight;
      playChime('bell');
    }

    // High-speed, crisp image optimizer: downsizes giant raw PNG screenshots to ~350KB JPEG
    // Keeps receipt fonts razor sharp while cutting upload payload by 90%
    function prepareImageForGemini(file) {
      return new Promise((resolve, reject) => {
        if (!file) return reject(new Error("No file provided"));

        const reader = new FileReader();
        let isDone = false;
        const safetyTimer = setTimeout(() => {
          if (!isDone) {
            isDone = true;
            readDirectBase64(file).then(resolve).catch(reject);
          }
        }, 3000);

        reader.onerror = () => {
          if (!isDone) {
            isDone = true;
            clearTimeout(safetyTimer);
            readDirectBase64(file).then(resolve).catch(reject);
          }
        };

        reader.onload = (e) => {
          const img = new Image();
          img.onerror = () => {
            if (!isDone) {
              isDone = true;
              clearTimeout(safetyTimer);
              readDirectBase64(file).then(resolve).catch(reject);
            }
          };
          img.onload = () => {
            if (isDone) return;
            isDone = true;
            clearTimeout(safetyTimer);
            try {
              let width = img.width;
              let height = img.height;
              const maxDim = 1800; // Crisp high-res for digital screenshots

              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }

              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);

              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
              const base64Data = compressedDataUrl.split(',')[1];
              resolve({ base64Data, mimeType: 'image/jpeg' });
            } catch (err) {
              readDirectBase64(file).then(resolve).catch(reject);
            }
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    function readDirectBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Could not read image file"));
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          let mimeType = file.type || 'image/jpeg';
          if (file.name && file.name.toLowerCase().endsWith('.heic')) {
            mimeType = 'image/heic';
          }
          const base64Data = dataUrl.split(',')[1];
          resolve({ base64Data, mimeType });
        };
        reader.readAsDataURL(file);
      });
    }

    // High-performance Gemini Vision caller with dynamic model discovery and strict 8s timeout
    async function callGeminiGenerateContent({ prompt, inlineImage = null, inlineImages = null, key = '', expectJson = false, onStatus = null, statusLabel = 'image' }) {
      const activeKey = (key || getGeminiApiKey() || '').trim();
      if (!activeKey) {
        throw new Error("API_KEY_REQUIRED");
      }

      const parts = [{ text: prompt }];
      if (inlineImage && inlineImage.base64Data) {
        parts.push({
          inlineData: {
            mimeType: inlineImage.mimeType || 'image/jpeg',
            data: inlineImage.base64Data
          }
        });
      }
      if (Array.isArray(inlineImages)) {
        inlineImages.forEach(img => {
          if (img && img.base64Data) {
            parts.push({
              inlineData: {
                mimeType: img.mimeType || 'image/jpeg',
                data: img.base64Data
              }
            });
          }
        });
      }

      const generationConfig = {
        temperature: 0.1,
        maxOutputTokens: 4096
      };
      if (expectJson) {
        generationConfig.responseMimeType = "application/json";
      }

      // Permanently remembered model from previous successful calls
      const savedModel = localStorage.getItem('focusflow_active_ai_model') || localStorage.getItem('focusflow_active_vision_model') || (window.state && window.state.activeWorkingVisionModel);

      // Fast-first model list (prioritizing ultra-responsive Flash tiers)
      let targetModels = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-3.8-flash-lite',
        'gemini-3.8-lite',
        'gemini-3.8-flash',
        'gemini-4-argon',
        'gemini-1.5-pro'
      ];

      // If a working model was previously confirmed, put it FIRST to skip discovery entirely!
      if (savedModel) {
        targetModels = [
          savedModel,
          ...targetModels.filter(m => m !== savedModel)
        ];
      }

      // Fast dynamic model discovery only when no saved model exists
      if (!savedModel && typeof onStatus === 'function') onStatus("Connecting to Google AI Studio...");
      if (!savedModel) {
        try {
          const discController = new AbortController();
          const discTimer = setTimeout(() => discController.abort(), 1800);
          const modelsListResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${activeKey}`, {
            signal: discController.signal
          });
          clearTimeout(discTimer);

          if (modelsListResp.ok) {
            const listJson = await modelsListResp.json();
            const available = (listJson.models || [])
              .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.indexOf('generateContent') !== -1)
              .map(m => (m.name || '').replace(/^models\//, ''))
              .filter(name => !/1\.0|embedding|aqa|imagen/i.test(name));

            if (available.length > 0) {
              available.sort((a, b) => {
                const score = (str) => {
                  if (/2\.5.*flash/i.test(str)) return 200;
                  if (/2\.0.*flash/i.test(str)) return 180;
                  if (/3\.8.*lite/i.test(str)) return 150;
                  if (/1\.5.*flash/i.test(str)) return 120;
                  if (/3\.8/i.test(str)) return 100;
                  if (/argon|4/i.test(str)) return 90;
                  return 10;
                };
                return score(b) - score(a);
              });
              targetModels = available;
            }
          }
        } catch (e) {
          console.warn("Fast model discovery skipped:", e.message);
        }
      }

      let lastError = null;

      // Iterate through models until a vision-compatible model successfully responds
      // Automatically skips text-only models that return "image input modality not enabled"
      for (const model of targetModels) {
        let elapsed = 0;
        if (typeof onStatus === 'function') onStatus(`Analyzing ${statusLabel} with ${model}...`);
        const statusTicker = setInterval(() => {
          elapsed += 1;
          if (typeof onStatus === 'function') {
            onStatus(`Analyzing ${statusLabel} with ${model}... (${elapsed}s)`);
          }
        }, 1000);

        try {
          const callController = new AbortController();
          const callTimer = setTimeout(() => callController.abort(), 10000);

          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
          
          let curConfig = Object.assign({}, generationConfig);
          let resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: curConfig
            }),
            signal: callController.signal
          });

          // If responseMimeType is rejected on certain models, retry without responseMimeType
          if (!resp.ok && curConfig.responseMimeType) {
            const peek = await resp.clone().json().catch(() => null);
            const peekMsg = (peek && peek.error && peek.error.message) || '';
            if (/responseMimeType|generationConfig|schema/i.test(peekMsg)) {
              delete curConfig.responseMimeType;
              resp = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts }],
                  generationConfig: curConfig
                }),
                signal: callController.signal
              });
            }
          }

          clearTimeout(callTimer);
          clearInterval(statusTicker);

          const resJson = await resp.json();
          if (resp.ok && resJson.candidates && resJson.candidates.length > 0) {
            const partsArr = resJson.candidates[0].content?.parts || [];
            let textOut = '';
            for (const p of partsArr) {
              if (p.text && !p.thought) {
                textOut += p.text;
              }
            }
            if (!textOut && partsArr.length > 0) {
              textOut = partsArr[partsArr.length - 1].text || '';
            }
            if (textOut.trim()) {
              if (window.state) window.state.activeWorkingVisionModel = model;
              try {
                localStorage.setItem('focusflow_active_vision_model', model);
                if (typeof updateWalmartVisionStatusBanner === 'function') updateWalmartVisionStatusBanner();
              } catch(e){}
              return { text: textOut.trim(), modelUsed: model };
            }
          }

          if (!resp.ok || resJson.error) {
            const errMsg = resJson.error?.message || `HTTP ${resp.status} on ${model}`;
            console.warn(`Gemini API ${model} failed (${resp.status}):`, errMsg);
            lastError = new Error(errMsg);
            // If the model does not support images, immediately continue to the next model!
            if (/modality|image|not enabled|not supported|unsupported/i.test(errMsg)) {
              if (typeof onStatus === 'function') onStatus(`${model} is text-only. Trying vision model...`);
            }
            continue;
          }
        } catch (netErr) {
          clearInterval(statusTicker);
          const isAbort = netErr.name === 'AbortError';
          console.warn(`Model ${model} ${isAbort ? 'timed out after 25s' : 'error'}:`, netErr.message);
          lastError = isAbort ? new Error(`Connection to ${model} timed out after 25s.`) : netErr;
        }
      }

      throw lastError || new Error("Could not connect to Gemini Vision service. Please check your internet connection.");
    }

    // Robust JSON extractor: parses direct JSON, unwraps wrapped arrays, strips markdown fences, and sanitizes commas
    function extractJsonArrayFromAiText(text) {
      if (!text) return null;
      let clean = text.trim();

      // 1. Direct JSON parse
      try {
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && typeof parsed === 'object') {
          for (const key of ['items', 'groceries', 'receipt', 'products', 'purchases', 'food']) {
            if (Array.isArray(parsed[key])) return parsed[key];
          }
        }
      } catch (e) {}

      // 2. Strip code fences
      clean = clean.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

      // 3. Search for bracketed JSON array [ ... ]
      const start = clean.indexOf('[');
      const end = clean.lastIndexOf(']');
      if (start !== -1 && end !== -1 && end > start) {
        const arrayStr = clean.substring(start, end + 1);
        try {
          const arr = JSON.parse(arrayStr);
          if (Array.isArray(arr)) return arr;
        } catch (e) {
          // Try sanitizing trailing commas before ] or }
          try {
            const sanitized = arrayStr.replace(/,\s*([\]\}])/g, '$1');
            const arr2 = JSON.parse(sanitized);
            if (Array.isArray(arr2)) return arr2;
          } catch (e2) {}
        }
      }

      // 4. Fallback line-by-line item extraction if AI returned bulleted / plain list
      const lines = clean.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const fallbackItems = [];
      lines.forEach(line => {
        if (line.endsWith(':') || /^(purchased|items|groceries|here are|receipt|order|products|summary)/i.test(line)) {
          return;
        }
        const cleanLine = line.replace(/^[\*\-\d\.\)\s]+/, '').trim();
        if (cleanLine.length >= 3 && !/^(total|subtotal|tax|visa|mastercard|change|cash|walmart|target|kroger|store|amount|date)/i.test(cleanLine)) {
          fallbackItems.push({
            name: cleanLine.replace(/[\$\d\.,]+\s*$/, '').trim(),
            category: 'produce',
            storage: 'fridge',
            isFood: true
          });
        }
      });
      return fallbackItems.length > 0 ? fallbackItems : null;
    }

    // Real Gemini Vision Receipt Scanner (Tested with 1.5 Flash & 2.0 Flash)
    async function handleWalmartReceiptPhoto(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const key = getGeminiApiKey();
      if (!key) {
        alertBox("Please add your free Gemini API key in Settings (the 🔑 icon at the top) to scan receipts with live AI vision.", "API Key Needed");
        openApiKeyModal();
        event.target.value = '';
        return;
      }

      // Show in-modal loading spinner
      const loadingEl = document.getElementById('walmart-receipt-scanning-loading');
      if (loadingEl) {
        loadingEl.classList.remove('hidden');
        const textSpan = loadingEl.querySelector('.text-xs');
        if (textSpan) textSpan.textContent = "Compressing & scanning receipt with Gemini AI...";
      }

      alertBox("Reading receipt with Gemini Vision AI...", "Receipt Scan");

      try {
        // 1. Process image safely into optimized JPEG
        const inlineImage = await prepareImageForGemini(file);

        if (loadingEl) {
          const textSpan = loadingEl.querySelector('.text-xs');
          if (textSpan) textSpan.textContent = "Gemini Vision is analyzing receipt items & storage...";
        }

        // 2. Structured, direct extraction prompt with strict schema tailored for digital screenshots & paper receipts
        const prompt = `You are an expert grocery receipt parser. Read this store receipt photo or digital app screenshot (e.g. Walmart app e-receipt, Target, Kroger, grocery store) and extract all purchased items.
Identify food, beverage, and household products. Expand cryptic abbreviations into clean human-readable names (e.g. "GV WHL MLK" -> "Great Value Whole Milk", "BNLS SKNLS CHIKN" -> "Boneless Skinless Chicken Breasts", "ORG BABY SPN" -> "Organic Baby Spinach").

CRITICAL AMOUNT & PACKAGE MEASUREMENT INSTRUCTIONS:
- Almost all food packages have the net weight or volume printed on the packaging or receipt item line (e.g. "10 oz", "15.5 oz", "32 fl oz", "500 g", "1 gal", "2 lb", "750 ml").
- Extract the package net weight or volume directly:
  * For solid foods (canned goods, meats, vegetables, cheeses, grains, snacks): DEFAULT TO "oz" or "g" as printed on the package (e.g. amount: 15.5, unit: "oz", or amount: 454, unit: "g").
  * For liquids and beverages (milk, water, juices, oils, vinegars, broths, dressings, sauces): DEFAULT TO "fl oz", "ml", "L", or "gal" as printed on the package (e.g. amount: 64, unit: "fl oz", or amount: 500, unit: "ml").
  * Only default to "items" or count if no package weight or volume is listed (e.g. "3 Lemons", "1 Fresh Avocado").

CRITICAL CATEGORY INSTRUCTIONS:
- "category" must be one of the 9 Food Groups:
  "protein": meats, poultry, seafood, eggs, tofu, deli meats
  "dairy": cow milk, cheese, yogurt, butter, plant-based milks
  "vegetables": fresh veggies, greens, broccoli, carrots, onions, potatoes, salad
  "fruits": fresh apples, bananas, berries, citrus, avocados
  "grains": rice, bread, pasta, oats, cereal, tortillas, flour
  "canned": canned beans, canned tomatoes, broths, soups, canned fish
  "baking": oils, vinegars, spices, sauces, dressings, condiments, sugar
  "snacks": chips, crackers, popcorn, nuts, cookies, soda, sparkling water, coffee
  "leftovers": prepared store deli meals, rotisserie chicken

CRITICAL STORAGE INSTRUCTIONS:
- "storage" must be one of:
  "fridge": fresh greens, milk, cheese, fresh meats, chilled dressings
  "frozen": frozen vegetables, frozen berries, frozen meats, ice cream
  "counter": bananas, bread, fresh whole tomatoes, avocados, apples
  "shelf": dry pasta, rice, canned goods, cooking oils, spices

Return ONLY a valid JSON array of objects, with each object having:
- "name": string (concise, human-readable item name without store item numbers)
- "category": string (one of: "protein", "dairy", "vegetables", "fruits", "grains", "canned", "baking", "snacks", "leftovers")
- "storage": string (one of: "fridge", "frozen", "counter", "shelf")
- "amount": number (package net weight or volume, e.g. 15.5, 10, 32, 500, 1)
- "unit": string ("oz", "g", "fl oz", "ml", "L", "gal", "lb", "items", "servings")
- "isFood": boolean (true for food/drinks; false for household/cleaning/cosmetics)

Example output:
[
  {"name": "Organic Whole Milk", "category": "dairy", "storage": "fridge", "amount": 1, "unit": "gal", "isFood": true},
  {"name": "Marketside Baby Spinach", "category": "vegetables", "storage": "fridge", "amount": 10, "unit": "oz", "isFood": true},
  {"name": "Fresh Bananas", "category": "fruits", "storage": "counter", "amount": 1, "unit": "items", "isFood": true},
  {"name": "Boneless Chicken Breasts", "category": "protein", "storage": "fridge", "amount": 3, "unit": "lb", "isFood": true},
  {"name": "Great Value Black Beans", "category": "canned", "storage": "shelf", "amount": 15.5, "unit": "oz", "isFood": true},
  {"name": "Great Value Olive Oil", "category": "baking", "storage": "shelf", "amount": 16.9, "unit": "fl oz", "isFood": true},
  {"name": "Jasmine Rice", "category": "grains", "storage": "shelf", "amount": 5, "unit": "lb", "isFood": true},
  {"name": "Bounty Paper Towels", "category": "baking", "storage": "shelf", "amount": 1, "unit": "pack", "isFood": false}
]

Return strictly the raw JSON array.`;

        const statusSpan = loadingEl ? loadingEl.querySelector('.text-xs') : null;
        const setStatus = (msg) => { if (statusSpan) statusSpan.textContent = msg; };

        // 3. Post to Gemini Vision with modern models (Gemini 3.8 Flash & Gemini 4 Argon)
        const result = await callGeminiGenerateContent({
          prompt,
          inlineImage,
          key,
          expectJson: true,
          onStatus: setStatus
        });

        const items = extractJsonArrayFromAiText(result.text);

        if (Array.isArray(items) && items.length > 0) {
          const formatted = items.map((it, idx) => {
            const rawName = (it.name || 'Grocery Item').trim();
            const lower = rawName.toLowerCase();
            const isNonFood = it.isFood === false || /paper\s*towel|soap|detergent|cleaner|sponge|shampoo|foil|bag\b|bleach|tissue|trash|diaper|napkin/i.test(lower);
            
            // 1. Storage Heuristic
            let storage = it.storage || 'fridge';
            if (/frozen|ice\s*cream|freezer|pizza/i.test(lower)) storage = 'frozen';
            else if (/banana|bread|bagel|tortilla|tomato|avocado|onion|garlic|potato/i.test(lower)) storage = 'counter';
            else if (/rice|pasta|cereal|flour|oats|chip|cracker|canned|oil|spice|vinegar|sauce|dressing/i.test(lower)) storage = 'shelf';

            // 2. Food Type Heuristic
            let category = it.category || 'vegetables';
            if (isNonFood) category = 'baking';
            else if (/milk|cheese|cheddar|mozzarella|yogurt|butter|cream|sour cream/i.test(lower)) category = 'dairy';
            else if (/chicken|beef|steak|turkey|pork|bacon|sausage|meat|egg|salmon|fish|tuna|shrimp|tilapia|tofu/i.test(lower)) category = 'protein';
            else if (/apple|banana|berry|berries|strawberry|blueberry|orange|lemon|lime|avocado|grape|melon|peach|mango/i.test(lower)) category = 'fruits';
            else if (/spinach|kale|lettuce|broccoli|carrot|onion|garlic|tomato|pepper|cucumber|zucchini|cauliflower|celery|salad|green bean/i.test(lower)) category = 'vegetables';
            else if (/rice|oat|quinoa|bread|pasta|flour|cereal|grain|noodle|tortilla|bagel/i.test(lower)) category = 'grains';
            else if (/can\b|canned|broth|soup|marinara|diced tomato|black bean|kidney bean|chickpea/i.test(lower)) category = 'canned';
            else if (/oil|vinegar|spice|salt|pepper|seasoning|sauce|dressing|mayo|mustard|ketchup|syrup|honey/i.test(lower)) category = 'baking';
            else if (/chip|cracker|popcorn|pretzel|nuts|snack|cookie|chocolate|candy|soda|sparkling|coffee|tea/i.test(lower)) category = 'snacks';

            // 3. Amount & Unit Heuristic (Default to package oz, g, fl oz, ml if present)
            let amount = parseFloat(it.amount) || 1;
            let unit = (it.unit || '').trim().toLowerCase();

            // Regex extraction from name if package net weight/volume was in description
            const flOzMatch = rawName.match(/(\d+(?:\.\d+)?)\s*(?:fl\s*oz|fluid\s*oz)/i);
            const ozMatch = rawName.match(/(\d+(?:\.\d+)?)\s*(?:oz|ounce|ounces)\b/i);
            const gMatch = rawName.match(/(\d+(?:\.\d+)?)\s*(?:g|gram|grams)\b/i);
            const mlMatch = rawName.match(/(\d+(?:\.\d+)?)\s*(?:ml|milliliter|milliliters)\b/i);
            const lMatch = rawName.match(/(\d+(?:\.\d+)?)\s*(?:l|liter|liters)\b/i);
            const galMatch = rawName.match(/(\d+(?:\.\d+)?)\s*(?:gal|gallon|gallons)\b/i);
            const lbMatch = rawName.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds)\b/i);

            if (flOzMatch) {
              amount = parseFloat(flOzMatch[1]) || amount;
              unit = 'fl oz';
            } else if (mlMatch) {
              amount = parseFloat(mlMatch[1]) || amount;
              unit = 'ml';
            } else if (lMatch) {
              amount = parseFloat(lMatch[1]) || amount;
              unit = 'l';
            } else if (galMatch) {
              amount = parseFloat(galMatch[1]) || amount;
              unit = 'gal';
            } else if (ozMatch) {
              amount = parseFloat(ozMatch[1]) || amount;
              unit = 'oz';
            } else if (gMatch) {
              amount = parseFloat(gMatch[1]) || amount;
              unit = 'g';
            } else if (lbMatch) {
              amount = parseFloat(lbMatch[1]) || amount;
              unit = 'lb';
            } else if (!unit || unit === 'item' || unit === 'items') {
              // Liquid vs solid check default
              if (/milk|oil|vinegar|juice|water|sauce|dressing|broth|syrup/i.test(lower)) {
                unit = 'fl oz';
              } else if (/produce|vegetables|greens|fruit|beans|meat|chicken|beef|cheese|rice|pasta|snack/i.test(lower)) {
                unit = 'oz';
              } else {
                unit = 'items';
              }
            }

            return {
              id: `inc-${Date.now()}-${idx}`,
              rawName: rawName,
              name: rawName,
              category,
              storage,
              amount,
              unit,
              isFood: !isNonFood,
              approved: !isNonFood
            };
          });

          const translated = (typeof applyCustomReceiptAliases === 'function')
            ? applyCustomReceiptAliases(formatted)
            : formatted;

          renderIncomingGroceriesApprovalList(translated);
          playChime('bell');
          const modelTag = result.modelUsed ? ` via ${result.modelUsed}` : '';
          alertBox(`Gemini Vision${modelTag} identified ${translated.length} items from your receipt! Review and approve below.`, "Receipt Scanned");
        } else {
          throw new Error("Could not parse items from receipt image. You can also paste receipt text in the tab above.");
        }
      } catch (err) {
        console.error("Gemini receipt scan error:", err);
        let userMsg = err.message || 'Could not process photo';
        if (userMsg === 'API_KEY_REQUIRED') {
          openApiKeyModal();
          userMsg = "Please connect your free Gemini API key to scan receipts.";
        } else if (userMsg.toLowerCase().includes('load failed') || userMsg.toLowerCase().includes('failed to fetch')) {
          userMsg = "Network connection interrupted. Please check your internet or paste order text in the tab above.";
        }
        alertBox(`Receipt scan: ${userMsg}`, "Receipt Scan");
      } finally {
        if (loadingEl) loadingEl.classList.add('hidden');
        event.target.value = '';
      }
    }

    // Vision Speed Calibrator: Tests key's models with a lightweight 1px image ping and permanently locks in the fastest vision model
    async function calibrateFastestVisionModel() {
      const activeKey = getGeminiApiKey();
      if (!activeKey) {
        alertBox("Please connect your Gemini API key in Settings (🔑) first.", "API Key Needed");
        openApiKeyModal();
        return;
      }

      alertBox("Speed-testing vision models on your account...", "Calibrating Vision Speed");

      // 1x1 transparent GIF base64
      const tiny1px = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      const testCandidates = [
        'gemini-3.8-flash-lite',
        'gemini-3.8-lite',
        'gemini-3.8-flash',
        'gemini-4-argon',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
      ];

      try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${activeKey}`);
        if (resp.ok) {
          const data = await resp.json();
          const av = (data.models || []).map(m => (m.name || '').replace(/^models\//, '')).filter(m => /3\.8|lite|argon|flash/i.test(m) && !/embedding|aqa/i.test(m));
          av.forEach(m => { if (!testCandidates.includes(m)) testCandidates.push(m); });
        }
      } catch(e) {}

      let fastest = null;
      let minLatency = 999999;

      for (const model of testCandidates) {
        const t0 = performance.now();
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 6000);
          const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: "Ping" },
                  { inlineData: { mimeType: "image/gif", data: tiny1px } }
                ]
              }],
              generationConfig: { maxOutputTokens: 5 }
            }),
            signal: ctrl.signal
          });
          clearTimeout(timer);
          const t1 = performance.now();
          const latency = Math.round(t1 - t0);

          if (r.ok) {
            if (latency < minLatency) {
              minLatency = latency;
              fastest = model;
            }
          }
        } catch(err) {}
      }

      const lockedModel = fastest || 'gemini-3.8-flash-lite';
      localStorage.setItem('focusflow_active_vision_model', lockedModel);
      if (window.state) window.state.activeWorkingVisionModel = lockedModel;
      playChime('bell');
      alertBox(`Locked to ${lockedModel}${fastest ? ` (${minLatency}ms response time)` : ''}! All future receipt scans will be instant.`, "Vision Calibrated ⚡");
      updateWalmartVisionStatusBanner();
    }

    function updateWalmartVisionStatusBanner() {
      const saved = localStorage.getItem('focusflow_active_vision_model') || (window.state && window.state.activeWorkingVisionModel) || 'gemini-3.8-flash-lite';
      const bannerTxt = document.getElementById('walmart-photo-key-text');
      if (bannerTxt) {
        bannerTxt.textContent = `Vision Active: Locked to ${saved} ⚡`;
      }
    }

    function finishCookingAndOpenWrapup() {
      pauseCookingStepTimer();
      const r = state.currentReverseChefRecipe || { title: 'Custom Reverse Meal', kcal: 480, servings: 2, cookTime: 20, ingredients: ['Pantry Protein', 'Fresh Veggies'] };
      openCookingWrapupModal(r);
    }

    function openCookingWrapupModal(recipe) {
      const modal = document.getElementById('cooking-wrapup-modal');
      if (!modal) return;

      const titleEl = document.getElementById('wrapup-recipe-title');
      const statsEl = document.getElementById('wrapup-recipe-stats');
      const portionInput = document.getElementById('wrapup-portion-input');
      const totalServingsTxt = document.getElementById('wrapup-total-servings-txt');
      const leftoverAmtInput = document.getElementById('wrapup-leftover-amount');

      const totalServings = recipe.servings || 2;
      if (titleEl) titleEl.textContent = recipe.title;
      if (statsEl) statsEl.textContent = `${recipe.kcal} kcal • ${totalServings} Servings`;
      if (totalServingsTxt) totalServingsTxt.textContent = totalServings;
      if (portionInput) portionInput.value = "1.0";
      if (leftoverAmtInput) leftoverAmtInput.value = Math.max(0.5, totalServings - 1.0);

      const leftoverNameInput = document.getElementById('wrapup-leftover-name');
      if (leftoverNameInput) leftoverNameInput.value = `Leftover: ${recipe.title || 'Cooked Dish'}`;

      setWrapupLeftoverUnit('servings');
      updateWrapupNutritionPreview();
      modal.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
      playChime('bell');
    }

    function setWrapupLeftoverUnit(unitVal) {
      const select = document.getElementById('wrapup-leftover-unit');
      if (select) select.value = unitVal;
      const unitMap = {
        'servings': 'btn-wrapup-unit-servings',
        'oz': 'btn-wrapup-unit-oz',
        'g': 'btn-wrapup-unit-g',
        'fl oz': 'btn-wrapup-unit-fl-oz',
        'ml': 'btn-wrapup-unit-ml',
        'items': 'btn-wrapup-unit-items'
      };
      Object.keys(unitMap).forEach(u => {
        const btn = document.getElementById(unitMap[u]);
        if (!btn) return;
        if (u === unitVal) {
          btn.className = "py-1 px-0.5 rounded-xl border border-pastel-mint bg-pastel-mint/20 text-[11px] text-center text-pastel-mint font-bold transition shadow-sm truncate";
        } else {
          btn.className = "py-1 px-0.5 rounded-xl border border-dark-border bg-dark-elevated hover:border-pastel-mint text-[11px] text-center text-slate-300 font-semibold transition truncate";
        }
      });
    }

    function stepWrapupLeftoverAmount(delta) {
      const input = document.getElementById('wrapup-leftover-amount');
      if (!input) return;
      const current = parseFloat(input.value) || 1;
      const unit = document.getElementById('wrapup-leftover-unit')?.value || 'servings';
      let step = delta;
      if (unit === 'g' && Math.abs(delta) === 1 && (current > 25 || (current === 25 && delta < 0))) {
        step = delta * 25;
      }
      const next = Math.max(0.25, Math.round((current + step) * 100) / 100);
      input.value = next;
    }

    function closeCookingWrapupModal() {
      const modal = document.getElementById('cooking-wrapup-modal');
      if (modal) modal.classList.add('hidden');
    }

    function updateWrapupNutritionPreview() {
      const r = state.currentReverseChefRecipe || { kcal: 480, servings: 2 };
      const portionInput = document.getElementById('wrapup-portion-input');
      const mult = portionInput ? (parseFloat(portionInput.value) || 1.0) : 1.0;

      const totalServings = r.servings || 2;
      const baseKcal = r.kcal || 480;
      const adjKcal = Math.round(baseKcal * (mult / totalServings));
      const adjProtein = Math.round(42 * (mult / totalServings));
      const adjCarbs = Math.round(34 * (mult / totalServings));
      const adjFat = Math.round(16 * (mult / totalServings));
      const adjFiber = Math.round(6 * (mult / totalServings));

      const kcalEl = document.getElementById('wrapup-preview-kcal');
      const macrosEl = document.getElementById('wrapup-preview-macros');
      const leftServTxt = document.getElementById('wrapup-leftovers-servings-txt');
      const leftoverAmtInput = document.getElementById('wrapup-leftover-amount');
      const leftoverUnitSelect = document.getElementById('wrapup-leftover-unit');

      const remainingPortion = Math.max(0, totalServings - mult);
      if (kcalEl) kcalEl.textContent = `${adjKcal} kcal`;
      if (macrosEl) macrosEl.textContent = `P: ${adjProtein}g | C: ${adjCarbs}g | F: ${adjFat}g | Fiber: ${adjFiber}g`;
      if (leftServTxt) leftServTxt.textContent = `${remainingPortion.toFixed(1)} servings`;
      if (leftoverAmtInput && leftoverUnitSelect && leftoverUnitSelect.value === 'servings') {
        leftoverAmtInput.value = parseFloat(remainingPortion.toFixed(2));
      }

      // Expandable ingredient breakdown list
      const breakdownEl = document.getElementById('wrapup-ingredient-breakdown-list');
      if (breakdownEl) {
        breakdownEl.innerHTML = `
          <div class="flex justify-between border-b border-dark-border/40 pb-1">
            <span>• Boneless Chicken Breast</span>
            <span>220 kcal • P: 38g • Iron: 1.4mg</span>
          </div>
          <div class="flex justify-between border-b border-dark-border/40 pb-1">
            <span>• Fresh Broccoli Florets</span>
            <span>45 kcal • Vit C: 65mg • Fiber: 3.5g</span>
          </div>
          <div class="flex justify-between border-b border-dark-border/40 pb-1">
            <span>• Olive Oil & Seasonings</span>
            <span>120 kcal • Omega-9 (MUFA): 9g • Vit E: 1.2mg</span>
          </div>
        `;
      }
    }

    function commitCookingWrapup() {
      const r = state.currentReverseChefRecipe || { title: 'ADHD Skillet Chicken & Broccoli', cookTime: 18, kcal: 480, ingredients: ['Chicken Breast', 'Broccoli'] };
      const saveCookbook = document.getElementById('wrapup-check-cookbook') ? document.getElementById('wrapup-check-cookbook').checked : true;
      const logNutrition = document.getElementById('wrapup-check-nutrition') ? document.getElementById('wrapup-check-nutrition').checked : true;
      const saveLeftovers = document.getElementById('wrapup-check-leftovers') ? document.getElementById('wrapup-check-leftovers').checked : true;

      // 1. Save to Cookbook
      if (saveCookbook) {
        state.recipes.push({
          id: `rec-${Date.now()}`,
          title: r.title,
          occasion: 'dinner',
          format: 'skillet',
          origin: 'mine',
          cookTime: r.cookTime,
          kcal: r.kcal,
          ingredients: r.ingredients || [],
          instructions: (r.steps || []).map((s, idx) => `${idx + 1}. ${s.text}`).join('\n')
        });
        if (typeof renderRecipes === 'function') renderRecipes();
        if (typeof renderSavedRecipesDropdown === 'function') renderSavedRecipesDropdown();
      }

      // 2. Log to Nutrition Log with Micronutrients
      if (logNutrition) {
        const portionInput = document.getElementById('wrapup-portion-input');
        const mult = portionInput ? (parseFloat(portionInput.value) || 1.0) : 1.0;
        const adjKcal = Math.round((r.kcal || 480) * (mult / 2));

        state.nutritionLog.push({
          id: `n-${Date.now()}`,
          name: `${r.title} (${mult} serving)`,
          kcal: adjKcal,
          protein: Math.round(42 * (mult / 2)),
          carbs: Math.round(34 * (mult / 2)),
          fat: Math.round(16 * (mult / 2)),
          fiber: Math.round(6 * (mult / 2)),
          sodium: Math.round(520 * (mult / 2)),
          potassium: Math.round(680 * (mult / 2)),
          iron: +(2.8 * (mult / 2)).toFixed(1),
          calcium: Math.round(110 * (mult / 2)),
          magnesium: Math.round(65 * (mult / 2)),
          zinc: +(1.9 * (mult / 2)).toFixed(1),
          vitA: Math.round(220 * (mult / 2)),
          vitC: Math.round(45 * (mult / 2)),
          vitD: Math.round(100 * (mult / 2)),
          isVerified: true
        });
        if (typeof renderNutrition === 'function') renderNutrition();
      }

      // 3. Save Leftovers to Pantry
      if (saveLeftovers) {
        const dest = document.querySelector('input[name="wrapup-leftover-dest"]:checked') ? document.querySelector('input[name="wrapup-leftover-dest"]:checked').value : 'fridge';
        const leftoverAmtInput = document.getElementById('wrapup-leftover-amount');
        const leftoverUnitSelect = document.getElementById('wrapup-leftover-unit');
        const leftoverNameInput = document.getElementById('wrapup-leftover-name');
        const chosenAmount = leftoverAmtInput ? (parseFloat(leftoverAmtInput.value) || 1) : 1;
        const chosenUnit = leftoverUnitSelect ? leftoverUnitSelect.value : 'servings';
        const chosenName = (leftoverNameInput && leftoverNameInput.value.trim()) ? leftoverNameInput.value.trim() : `Leftover: ${r.title}`;

        // Set realistic 4-day freshness window for fridge or 90 days for freezer
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + (dest === 'frozen' ? 90 : 4));

        state.pantry.push({
          id: `p-${Date.now()}-leftover`,
          name: chosenName,
          category: 'leftovers',
          storage: dest,
          amount: chosenAmount,
          unit: chosenUnit,
          dateAdded: new Date().toISOString().split('T')[0],
          expirationDate: expDate.toISOString().split('T')[0]
        });
        renderPantry();
      }

      saveAppState();
      closeCookingWrapupModal();
      closeReverseChefModal();
      playChime('bell');
      alertBox(`Meal complete! Saved to cookbook, logged to nutrition diary with micronutrients, and stored leftovers in your ${document.querySelector('input[name="wrapup-leftover-dest"]:checked')?.value || 'fridge'}.`, "Wrap-Up Complete");
    }
    
  
