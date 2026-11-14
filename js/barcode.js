// ==============================================
// BARCODE SCANNER & OPEN FOOD FACTS INTEGRATION (js/barcode.js)
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

    function openLabelScannerModal() {
      if (typeof openBarcodeScannerModal === 'function') {
        openBarcodeScannerModal('food');
      }
    }
    window.openLabelScannerModal = openLabelScannerModal;

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

    function stopBarcodeCamera() {
      // 1. Reset and nullify ZXing scanning loop
      if (zxingBarcodeReader) {
        try {
          zxingBarcodeReader.reset();
        } catch (e) {}
        zxingBarcodeReader = null;
      }

      // 2. Stop tracks on captured barcodeStream
      if (barcodeStream) {
        try {
          barcodeStream.getTracks().forEach(track => {
            track.stop();
          });
        } catch (e) {}
        barcodeStream = null;
      }

      // 3. Stop tracks on video element's srcObject (ensures hardware camera releases completely)
      const video = document.getElementById('barcode-camera-video');
      if (video) {
        try {
          if (video.srcObject && typeof video.srcObject.getTracks === 'function') {
            video.srcObject.getTracks().forEach(track => {
              track.stop();
            });
          }
          video.pause();
          video.srcObject = null;
        } catch (e) {}
        video.classList.add('hidden');
      }

      const ph = document.getElementById('barcode-camera-placeholder');
      const reticle = document.getElementById('barcode-scanner-reticle');
      const liveStatus = document.getElementById('barcode-live-status');
      const flipBtn = document.getElementById('barcode-flip-cam-btn');

      if (ph) ph.classList.remove('hidden');
      if (reticle) reticle.classList.add('hidden');
      if (liveStatus) liveStatus.classList.add('hidden');
      if (flipBtn) flipBtn.classList.add('hidden');
    }

    function closeBarcodeScannerModal() {
      isBarcodeScanningLocked = false;
      stopBarcodeCamera();

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
      stopBarcodeCamera();

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
          if (video && video.srcObject && !barcodeStream) {
            barcodeStream = video.srcObject;
          }
          if (result && !isBarcodeScanningLocked) {
            const foundCode = result.getText();
            if (foundCode) {
              onBarcodeDetected(foundCode);
            }
          }
        });
        if (video && video.srcObject) {
          barcodeStream = video.srcObject;
        }
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

    // Tier 5: Gemini AI Vision Scanner for Nutrition Facts Label & Package (Dual-Photo Front + Nutrition Facts)
    window.stagedPackagePhotos = {
      barcode: { front: null, nutrition: null },
      manual: { front: null, nutrition: null }
    };

    function compressImageForVision(file, maxDimension = 1600, quality = 0.85) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onerror = () => resolve(null);
        reader.onload = (ev) => {
          const img = new Image();
          img.onerror = () => {
            const rawDataUrl = ev.target.result;
            const b64 = (rawDataUrl.indexOf(',') !== -1) ? rawDataUrl.split(',')[1] : rawDataUrl;
            resolve({ base64Data: b64, mimeType: file.type || 'image/jpeg' });
          };
          img.onload = () => {
            try {
              let width = img.width;
              let height = img.height;
              if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                  height = Math.round((height * maxDimension) / width);
                  width = maxDimension;
                } else {
                  width = Math.round((width * maxDimension) / height);
                  height = maxDimension;
                }
              }
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
              const b64 = compressedDataUrl.split(',')[1];
              resolve({ base64Data: b64, mimeType: 'image/jpeg' });
            } catch (e) {
              const rawDataUrl = ev.target.result;
              const b64 = (rawDataUrl.indexOf(',') !== -1) ? rawDataUrl.split(',')[1] : rawDataUrl;
              resolve({ base64Data: b64, mimeType: file.type || 'image/jpeg' });
            }
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    async function stagePackagePhoto(event, type, context = 'barcode') {
      const file = event && event.target && event.target.files && event.target.files[0];
      if (!file) return;

      const badgeId = `${context}-${type}-badge`;
      const badgeEl = document.getElementById(badgeId);
      if (badgeEl) {
        badgeEl.textContent = '⏳ Compressing...';
        badgeEl.className = 'text-[9px] text-pastel-lavender font-bold animate-pulse';
      }

      const compressed = await compressImageForVision(file);
      if (!compressed || !compressed.base64Data) {
        if (badgeEl) {
          badgeEl.textContent = '⚠️ Photo error';
          badgeEl.className = 'text-[9px] text-rose-400 font-bold';
        }
        return;
      }

      if (!window.stagedPackagePhotos[context]) {
        window.stagedPackagePhotos[context] = { front: null, nutrition: null };
      }
      window.stagedPackagePhotos[context][type] = {
        base64Data: compressed.base64Data,
        mimeType: compressed.mimeType || 'image/jpeg',
        fileName: file.name
      };

      if (badgeEl) {
        badgeEl.textContent = '✓ Ready (' + (type === 'front' ? 'Front' : 'Label') + ')';
        badgeEl.className = 'text-[9px] text-pastel-mint font-bold';
      }

      const labelId = `${context}-${type}-stage-label`;
      const labelEl = document.getElementById(labelId);
      if (labelEl) {
        labelEl.classList.remove('border-dashed');
        labelEl.classList.add('border-solid', 'border-pastel-mint');
      }

      if (typeof playChime === 'function') playChime('pop');
    }

    async function runDualPackageAiScan(barcode = '', context = 'barcode') {
      const staged = window.stagedPackagePhotos[context] || {};
      const inlineImages = [];

      if (staged.front && staged.front.base64Data) {
        inlineImages.push({
          base64Data: staged.front.base64Data,
          mimeType: staged.front.mimeType || 'image/jpeg'
        });
      }
      if (staged.nutrition && staged.nutrition.base64Data) {
        inlineImages.push({
          base64Data: staged.nutrition.base64Data,
          mimeType: staged.nutrition.mimeType || 'image/jpeg'
        });
      }

      if (inlineImages.length === 0) {
        alertBox("Please snap at least one photo (Front of package or Nutrition Facts label) before scanning.", "Photo Needed");
        return;
      }

      const resBox = document.getElementById('barcode-lookup-result');
      if (resBox && context === 'barcode') {
        resBox.innerHTML = `
          <div class="p-3.5 rounded-2xl bg-dark-elevated border border-pastel-lavender/50 text-xs space-y-2">
            <div class="flex items-center gap-2 text-pastel-lavender font-semibold">
              <i data-lucide="loader" class="w-4 h-4 animate-spin"></i>
              <span id="barcode-ai-label-status">Analyzing ${inlineImages.length === 2 ? 'Front & Label Photos' : 'Package Photo'} with Gemini Vision...</span>
            </div>
            <p class="text-[11px] text-slate-300">Reading product name, package net weight, calories, macro &amp; micro nutrients (all 13 vitamins and 14 minerals), serving size, and volume...</p>
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
        const prompt = `You are an expert clinical dietitian and OCR engine for food packages, containers, and product labels.
Analyze the provided photo(s). These photos may include:
1. FRONT OF PACKAGE: Look closely for the exact product name, brand name, variety, and the net weight or volume printed on the front (e.g. "16 fl oz", "1 lb", "500 g", "12 oz", "1 gal", "32 fl oz", "6 count").
2. NUTRITION FACTS PANEL / BACK OF PACKAGE: Look for calories, serving size, macronutrients, and vitamins/minerals.
3. CURVED BOTTLES, JARS, TUBS & CANS: Text may wrap around curved surfaces or have glare. Account for perspective distortion and specular reflections.

CRITICAL EXTRACTION GOALS:
- Extract the exact product name and brand from the package front.
- Extract the exact total package size/weight (e.g. 16, 32, 500, 1) and unit (e.g. "fl oz", "oz", "g", "lb", "ml", "items").
- Extract the serving size description (e.g. "1 cup (240ml)", "2 tbsp (30g)", "1 pouch").
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

        // Handle both string return and { text: '...', modelUsed: '...' } return
        const responseText = (rawResponse && typeof rawResponse === 'object' && rawResponse.text) ? rawResponse.text : (rawResponse || '');
        if (!responseText || typeof responseText !== 'string') {
          throw new Error("Empty response received from Gemini Vision");
        }

        let parsed = null;
        try {
          const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
          parsed = JSON.parse(cleanJson);
        } catch (e) {
          const match = responseText.match(/\{[\s\S]*\}/);
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

          // Save to personal database immediately if barcode present
          if (barcode) {
            saveCustomBarcodeItem(barcode, product);
          }

          if (context === 'manual') {
            openManualNutritionModal({
              ...product,
              barcode: barcode || (document.getElementById('manual-nut-barcode') || {}).value || '',
              isReceiptPairing: activeManualNutritionContext ? activeManualNutritionContext.isReceiptPairing : false,
              receiptIndex: activeManualNutritionContext ? activeManualNutritionContext.receiptIndex : null,
              receiptRawCode: activeManualNutritionContext ? activeManualNutritionContext.receiptRawCode : null
            });
            alertBox(`Successfully extracted all nutrition data & package size for "${product.name}"!`, "AI Nutrition Extracted ✓");
          } else {
            renderBarcodeProductResult(product);
          }
          if (typeof playChime === 'function') playChime('bell');
        } else {
          throw new Error("Unable to parse nutrition data from photos");
        }
      } catch (err) {
        console.warn("AI label vision error:", err);
        if (resBox && context === 'barcode') {
          resBox.innerHTML = `
            <div class="p-3.5 rounded-2xl bg-dark-elevated border border-amber-400/50 text-xs space-y-2.5">
              <div class="text-amber-300 font-semibold flex items-center gap-1.5">
                <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                <span>Could not extract nutrition facts from photo(s)</span>
              </div>
              <p class="text-slate-300 text-[11px] leading-relaxed">Curved surfaces, reflections, or motion blur can obscure the text. You can take clearer photos or enter complete nutritional data manually:</p>
              <div class="flex flex-col sm:flex-row gap-2 pt-1">
                <button type="button" onclick="runDualPackageAiScan('${barcode}')" class="px-3.5 py-1.5 rounded-xl bg-dark-base border border-dark-border hover:border-slate-400 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5">
                  <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                  <span>Retry AI Scan</span>
                </button>
                <button type="button" onclick="openManualNutritionFromScanner('${barcode}')" class="px-3.5 py-1.5 rounded-xl bg-pastel-mint text-dark-base font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-300 transition">
                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                  <span>Enter Nutrition Manually</span>
                </button>
              </div>
            </div>
          `;
          if (window.lucide) lucide.createIcons();
        } else {
          alertBox("Could not extract nutrition facts from photo. Please ensure good lighting and clear text, or enter values manually.", "AI Extraction Notice");
        }
      }
    }

    // Backward compatibility wrapper for single input events
    async function handleNutritionLabelVisionUpload(event, barcode) {
      const files = event && event.target && event.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target.result;
        const mimeType = file.type || 'image/jpeg';
        const base64Data = dataUrl.split(',')[1];
        window.stagedPackagePhotos.barcode.nutrition = { base64Data, mimeType, fileName: file.name };
        await runDualPackageAiScan(barcode, 'barcode');
      };
      reader.readAsDataURL(file);
      if (event && event.target) event.target.value = '';
    }

    // Global product caching for reliable inspection & manual entry without string escaping issues
    window.lastScannedBarcodeProduct = null;

    function openManualNutritionFromScanner(barcode = '') {
      const activeCode = barcode || (document.getElementById('barcode-manual-input') || {}).value || '';
      closeBarcodeScannerModal();
      
      let initialData = { barcode: activeCode };
      if (window.activeReceiptPairingItem) {
        initialData.isReceiptPairing = true;
        initialData.receiptIndex = window.activeReceiptPairingItem.receiptIndex;
        initialData.receiptRawCode = window.activeReceiptPairingItem.receiptRawCode;
        initialData.name = window.activeReceiptPairingItem.name;
      }
      openManualNutritionModal(initialData);
    }

    function inspectScannedProductFullDetails() {
      if (!window.lastScannedBarcodeProduct) return;
      const product = window.lastScannedBarcodeProduct;
      closeBarcodeScannerModal();
      
      let modalParams = { ...product };
      if (barcodeScannerContext === 'receipt_pair' && window.activeReceiptPairingItem) {
        modalParams.isReceiptPairing = true;
        modalParams.receiptIndex = window.activeReceiptPairingItem.receiptIndex;
        modalParams.receiptRawCode = window.activeReceiptPairingItem.receiptRawCode;
      }
      openManualNutritionModal(modalParams);
    }
    function renderBarcodeProductResult(product) {
      const resBox = document.getElementById('barcode-lookup-result');
      if (!resBox) return;

      const qParsed = (product.amount && product.unit) ? { amount: product.amount, unit: product.unit } : parsePackageQuantity(product.quantity);
      const fullProduct = {
        ...product,
        amount: qParsed.amount,
        unit: qParsed.unit
      };
      window.lastScannedBarcodeProduct = fullProduct;
      const safeProductJson = JSON.stringify(fullProduct).replace(/"/g, '&quot;');

      const servingDesc = product.serving || product.nutrition?.serving || '1 serving';
      const servingGrams = product.servingGrams || product.nutrition?.servingGrams || 100;

      resBox.innerHTML = `
        <div class="space-y-3 text-xs bg-dark-elevated p-3.5 rounded-2xl border border-pastel-lavender/40 shadow-xl">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-[9px] px-2 py-0.5 rounded-md bg-pastel-lavender/15 text-pastel-lavender font-bold uppercase tracking-wider">${product.sourceBadge || 'Verified Food'}</span>
                ${product.brand ? `<span class="text-[10px] text-slate-400 font-semibold">• ${product.brand}</span>` : ''}
              </div>
              <h4 class="font-bold text-white text-sm leading-tight">${product.name}</h4>
              <span class="text-[11px] text-slate-300 font-mono mt-0.5 block">1 serving = <strong>${servingDesc} (${servingGrams} g)</strong> • Pkg: ${qParsed.amount} ${qParsed.unit}</span>
            </div>
            <div class="text-right shrink-0">
              <span class="px-2.5 py-1.5 rounded-xl bg-pastel-lavender/15 text-pastel-lavender font-mono font-bold text-sm block">${product.kcal} kcal</span>
            </div>
          </div>

          <!-- Macros Breakdown -->
          <div class="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-dark-base border border-dark-border text-center font-mono text-[11px]">
            <div><span class="text-slate-400 block text-[9px]">PROTEIN</span><span class="text-pastel-coral font-bold">${product.protein}g</span></div>
            <div><span class="text-slate-400 block text-[9px]">CARBS</span><span class="text-pastel-mint font-bold">${product.carbs}g</span></div>
            <div><span class="text-slate-400 block text-[9px]">FAT</span><span class="text-pastel-butter font-bold">${product.fat}g</span></div>
            <div><span class="text-slate-400 block text-[9px]">FIBER</span><span class="text-pastel-mint font-bold">${product.fiber || 0}g</span></div>
          </div>

          <!-- Detailed Micronutrients & Inspection Action -->
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-pastel-lavender/10 border border-pastel-lavender/30 text-[11px]">
            <div class="text-slate-300">
              <span class="font-bold text-white block">Detailed Nutritional Analysis</span>
              <span class="text-slate-400 text-[10px]">Vitamins, Minerals, Sugars, Sodium, Serving Size</span>
            </div>
            <button type="button" onclick="inspectScannedProductFullDetails()" class="px-3 py-1.5 rounded-xl bg-pastel-lavender text-dark-base font-bold text-xs flex items-center gap-1.5 hover:bg-purple-300 transition shrink-0 shadow-sm">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              <span>Inspect Full Details</span>
            </button>
          </div>

          <!-- Action buttons based on context -->
          <div class="pt-1 flex flex-col sm:flex-row gap-2 justify-end">
            <button type="button" onclick="startBarcodeCamera()" class="px-3 py-1.5 rounded-xl bg-dark-base border border-dark-border text-slate-300 hover:text-white text-xs flex items-center justify-center gap-1.5">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              <span>Scan Next Barcode</span>
            </button>
            <button type="button" onclick="applyScannedBarcodeFood(window.lastScannedBarcodeProduct)" class="px-4 py-2 rounded-xl bg-gradient-to-r from-pastel-mint to-emerald-400 text-dark-base font-extrabold text-xs shadow-md shadow-pastel-mint/20 flex items-center justify-center gap-1.5 hover:opacity-95 transition">
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
              <span>${barcodeScannerContext === 'receipt_pair' ? 'Pair to Receipt Item' : (barcodeScannerContext === 'pantry' ? 'Add Item to Pantry' : (barcodeScannerContext === 'recipe' ? 'Add to Recipe' : 'Log Food'))}</span>
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
              <button type="button" onclick="closeBarcodeScannerModal(); openManualNutritionModal({ barcode: '${code}', name: (document.getElementById('barcode-fallback-name') || {}).value })" class="px-3.5 py-1.5 rounded-xl bg-pastel-mint text-dark-base font-bold text-xs flex items-center justify-center gap-1 hover:bg-emerald-300 transition shrink-0">
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

    function triggerBarcodeScannerFromManualModal() {
      const currentName = (document.getElementById('manual-nut-name') || {}).value || '';
      openBarcodeScannerModal('manual_modal');
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

      if (barcodeScannerContext === 'receipt_pair' && window.activeReceiptPairingItem) {
        const pairingInfo = window.activeReceiptPairingItem;
        const rawCode = pairingInfo.receiptRawCode || product.name;
        if (typeof saveReceiptNutritionCatalogEntry === 'function') {
          saveReceiptNutritionCatalogEntry(rawCode, product);
        }
        if (state.incomingGroceriesApprovalList && state.incomingGroceriesApprovalList[pairingInfo.receiptIndex]) {
          const rItem = state.incomingGroceriesApprovalList[pairingInfo.receiptIndex];
          rItem.name = product.name;
          if (product.amount && !isNaN(product.amount)) rItem.amount = product.amount;
          if (product.unit) rItem.unit = product.unit;
          if (product.storage) rItem.storage = product.storage;
          if (product.category) rItem.category = product.category;
          rItem.nutrition = completeNutrition;
          rItem.isVerified = true;
          rItem.sourceBadge = '✓ Exact Label Verified';
          rItem.nutritionSource = 'Exact Label Verified';
          if (product.barcode) rItem.barcode = product.barcode;
          if (typeof renderIncomingGroceriesApprovalList === 'function') {
            renderIncomingGroceriesApprovalList(state.incomingGroceriesApprovalList);
          }
        }
        window.activeReceiptPairingItem = null;
        alertBox(`Paired "${product.name}" to receipt store code! FocusFlow learned exact nutrition and package size.`, "Receipt Code Paired ✓");
        return;
      }

      if (barcodeScannerContext === 'manual_modal') {
        const setVal = (id, val) => {
          const el = document.getElementById(id);
          if (el && val != null && val !== '') el.value = val;
        };
        setVal('manual-nut-barcode', product.barcode || '');
        setVal('manual-nut-name', product.name);
        setVal('manual-nut-brand', product.brand || '');
        setVal('manual-nut-amount', product.amount || 1);
        setVal('manual-nut-unit', product.unit || 'items');
        setVal('manual-nut-cat', cat);
        setVal('manual-nut-storage', stor);
        setVal('manual-nut-kcal', kcal);
        setVal('manual-nut-protein', protein);
        setVal('manual-nut-carbs', carbs);
        setVal('manual-nut-fat', fat);
        setVal('manual-nut-fiber', fiber);
        setVal('manual-nut-sugar', sugar);
        setVal('manual-nut-sat-fat', satFat);
        setVal('manual-nut-sodium', sodium);

        const bBadge = document.getElementById('manual-nut-barcode-badge');
        if (bBadge && product.barcode) {
          bBadge.textContent = `UPC: ${product.barcode}`;
          bBadge.classList.remove('hidden');
        }

        const modal = document.getElementById('manual-nutrition-modal');
        if (modal) modal.classList.remove('hidden');
        alertBox(`Auto-filled nutrition & package facts for "${product.name}"!`, "Scanned Info Loaded");
        return;
      }

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
  window.initZXingReader = initZXingReader;
  window.openLabelScannerModal = openLabelScannerModal;
  window.openBarcodeScannerModal = openBarcodeScannerModal;
  window.closeBarcodeScannerModal = closeBarcodeScannerModal;
  window.toggleBarcodeCameraFacing = toggleBarcodeCameraFacing;
  window.startBarcodeCamera = startBarcodeCamera;
  window.handleBarcodePhotoUpload = handleBarcodePhotoUpload;
  window.onBarcodeDetected = onBarcodeDetected;
  window.setAndLookupBarcode = setAndLookupBarcode;
  window.parsePackageQuantity = parsePackageQuantity;
  window.inferFoodCategory = inferFoodCategory;
  window.inferStorageZone = inferStorageZone;
  window.getCustomBarcodeDb = getCustomBarcodeDb;
  window.saveCustomBarcodeItem = saveCustomBarcodeItem;
  window.queryUsdaFoodDataCentral = queryUsdaFoodDataCentral;
  window.queryNutritionix = queryNutritionix;
  window.queryOpenFoodFacts = queryOpenFoodFacts;
  window.compressImageForVision = compressImageForVision;
  window.stagePackagePhoto = stagePackagePhoto;
  window.runDualPackageAiScan = runDualPackageAiScan;
  window.handleNutritionLabelVisionUpload = handleNutritionLabelVisionUpload;
  window.openManualNutritionFromScanner = openManualNutritionFromScanner;
  window.inspectScannedProductFullDetails = inspectScannedProductFullDetails;
  window.renderBarcodeProductResult = renderBarcodeProductResult;
  window.renderBarcodeMissingWithAiPrompt = renderBarcodeMissingWithAiPrompt;
  window.lookupBarcode = lookupBarcode;
  window.saveUnknownBarcodeItem = saveUnknownBarcodeItem;
  window.triggerBarcodeScannerFromManualModal = triggerBarcodeScannerFromManualModal;
  window.applyScannedBarcodeFood = applyScannedBarcodeFood;
}
