// ==============================================
    // CLOUD SYNC SETUP (Google sign-in + Firebase)
    // To turn on cloud sync, replace `null` below with the config object from
    // Firebase Console → Project settings → Your apps → Web app → "SDK setup and configuration" (Config),
    // e.g. { apiKey: "...", authDomain: "...", projectId: "...", storageBucket: "...", messagingSenderId: "...", appId: "..." }
    // While this is null, FocusFlow works exactly as before (data stays on this device only).
    // ==============================================
    const FIREBASE_CONFIG = {
      apiKey: "AIzaSyAiZMbfCD1deaaiEDOPMmlw6NWBrXkGu-Q",
      authDomain: "focusflow-40398.firebaseapp.com",
      projectId: "focusflow-40398",
      storageBucket: "focusflow-40398.firebasestorage.app",
      messagingSenderId: "263524620993",
      appId: "1:263524620993:web:ab683c7a87b8a37fd19240"
    };

    const state = {
      activeTab: 'timeline',
      connectedCalendars: null,
      calendarCategories: null,
      scaffoldStages: {
        tasks: 1,
        kitchen: 1,
        calendar: 1,
        focus: 1
      },
      weightGoal: {
        currentWeightLbs: 175,
        targetWeightLbs: 165,
        suggestedWeightLbs: 155,
        weeklyPaceLbs: 0.5,
        startDate: '2026-11-01',
        targetDate: '2027-02-15'
      },
      ocdSettings: {
        flexibleRanges: true,
        goalLock: false,
        lockedUntil: null,
        completedSurfsCount: 3
      },
      appleHealthData: {
        steps: 8420,
        activeBurnKcal: 480,
        sleepHours: 7.6,
        restingHeartRate: 64,
        cyclePhase: 'follicular',
        autoSyncEnabled: true,
        lastSyncedAt: 'Today at 8:15 AM'
      },
      healthHistory: [
        { date: 'Oct 25', calories: 2120, protein: 132, carbs: 195, fat: 68, fiber: 29, water: 2600, sodium: 2180, potassium: 2540, calcium: 980, iron: 17.5, magnesium: 330, zinc: 9.4, vitA: 720, vitC: 82, vitD: 580, vitE: 14.5, vitK: 92, sugar: 32, saturated: 15, steps: 8900, sleep: 7.8, cycle: 'follicular', taskCompletionRate: 85, focusMinutes: 110, restingHeartRate: 63, energyCrashScore: 2, ocdUrgeScore: 2, cognitiveFlexibility: 85 },
        { date: 'Oct 26', calories: 2050, protein: 128, carbs: 210, fat: 67, fiber: 27, water: 2400, sodium: 2240, potassium: 2460, calcium: 950, iron: 16.8, magnesium: 315, zinc: 8.9, vitA: 690, vitC: 76, vitD: 550, vitE: 13.8, vitK: 89, sugar: 36, saturated: 17, steps: 7600, sleep: 7.2, cycle: 'follicular', taskCompletionRate: 80, focusMinutes: 95, restingHeartRate: 65, energyCrashScore: 3, ocdUrgeScore: 3, cognitiveFlexibility: 80 },
        { date: 'Oct 27', calories: 2180, protein: 138, carbs: 190, fat: 72, fiber: 31, water: 2800, sodium: 2150, potassium: 2620, calcium: 1020, iron: 18.4, magnesium: 345, zinc: 9.8, vitA: 760, vitC: 90, vitD: 610, vitE: 15.6, vitK: 98, sugar: 28, saturated: 14, steps: 9400, sleep: 8.0, cycle: 'follicular', taskCompletionRate: 90, focusMinutes: 125, restingHeartRate: 62, energyCrashScore: 1, ocdUrgeScore: 1, cognitiveFlexibility: 92 },
        { date: 'Oct 28', calories: 1940, protein: 110, carbs: 220, fat: 62, fiber: 22, water: 2100, sodium: 2380, potassium: 2210, calcium: 840, iron: 14.2, magnesium: 280, zinc: 7.8, vitA: 620, vitC: 62, vitD: 480, vitE: 11.5, vitK: 74, sugar: 48, saturated: 21, steps: 6100, sleep: 6.4, cycle: 'follicular', taskCompletionRate: 62, focusMinutes: 55, restingHeartRate: 69, energyCrashScore: 6, ocdUrgeScore: 7, cognitiveFlexibility: 58 },
        { date: 'Oct 29', calories: 2160, protein: 135, carbs: 200, fat: 71, fiber: 30, water: 2750, sodium: 2120, potassium: 2580, calcium: 990, iron: 17.8, magnesium: 335, zinc: 9.5, vitA: 740, vitC: 85, vitD: 590, vitE: 15.0, vitK: 94, sugar: 30, saturated: 15, steps: 8700, sleep: 7.5, cycle: 'ovulatory', taskCompletionRate: 88, focusMinutes: 115, restingHeartRate: 64, energyCrashScore: 2, ocdUrgeScore: 2, cognitiveFlexibility: 88 },
        { date: 'Oct 30', calories: 2240, protein: 140, carbs: 215, fat: 74, fiber: 32, water: 2700, sodium: 2190, potassium: 2650, calcium: 1040, iron: 18.6, magnesium: 350, zinc: 9.9, vitA: 770, vitC: 88, vitD: 620, vitE: 15.8, vitK: 96, sugar: 34, saturated: 16, steps: 8200, sleep: 7.6, cycle: 'ovulatory', taskCompletionRate: 86, focusMinutes: 120, restingHeartRate: 63, energyCrashScore: 2, ocdUrgeScore: 2, cognitiveFlexibility: 86 },
        { date: 'Oct 31', calories: 2150, protein: 135, carbs: 210, fat: 71, fiber: 30, water: 2700, sodium: 2140, potassium: 2590, calcium: 1000, iron: 18.0, magnesium: 335, zinc: 9.5, vitA: 730, vitC: 84, vitD: 600, vitE: 15.2, vitK: 95, sugar: 31, saturated: 15, steps: 8420, sleep: 7.6, cycle: 'follicular', taskCompletionRate: 85, focusMinutes: 110, restingHeartRate: 64, energyCrashScore: 2, ocdUrgeScore: 2, cognitiveFlexibility: 85 }
      ],
      skillGrowthData: [
        { day: 1, date: 'Oct 2', overallScore: 42, kitchenSkill: 38, nutritionAdherence: 45, focusScore: 44, milestone: 'Day 1 Baseline' },
        { day: 5, date: 'Oct 6', overallScore: 50, kitchenSkill: 46, nutritionAdherence: 52, focusScore: 51, milestone: 'Mise en Place Habits' },
        { day: 10, date: 'Oct 11', overallScore: 61, kitchenSkill: 58, nutritionAdherence: 64, focusScore: 62, milestone: 'Batch Prep Mastery' },
        { day: 15, date: 'Oct 16', overallScore: 72, kitchenSkill: 69, nutritionAdherence: 74, focusScore: 73, milestone: 'Macro Balancing Routine' },
        { day: 20, date: 'Oct 21', overallScore: 79, kitchenSkill: 76, nutritionAdherence: 82, focusScore: 80, milestone: 'Buffer Pacing Active' },
        { day: 25, date: 'Oct 26', overallScore: 85, kitchenSkill: 83, nutritionAdherence: 87, focusScore: 86, milestone: 'Reverse Chef Intuition' },
        { day: 30, date: 'Oct 31', overallScore: 92, kitchenSkill: 90, nutritionAdherence: 94, focusScore: 91, milestone: 'Level 3 Executive Flow' }
      ],
      selectedSkillMetric: 'overallScore',
      selectedCorrelationFactorA: 'protein',
      selectedCorrelationFactorB: 'focusMinutes',
      averagesFilter: 'all',
      activeSkillMilestoneIndex: 6,
      pacingIntervalId: null,
      waterLoggedMl: 750,
      recipeFilters: {
        occasion: 'all',
        format: 'all',
        origin: 'all'
      },
      selectedFoodForDetail: null,
      events: [],
      recipes: [
        {
          id: 'rec-1',
          title: 'Golden Turmeric Lemon Lentil Pot',
          occasion: 'dinner',
          format: 'soup',
          origin: 'mine',
          cookTime: 25,
          kcal: 420,
          ingredients: ['1 cup red lentils', '1 chopped yellow onion', '2 carrots sliced', '1 tsp turmeric', '1/2 lemon juiced', '3 cups vegetable broth'],
          instructions: '1. Sauté onion and carrots in 1 pot.\n2. Add turmeric and washed lentils with broth.\n3. Simmer 18 mins (WASH CUTTING BOARD AND KNIVES HERE).\n4. Squeeze fresh lemon and serve.'
        },
        {
          id: 'rec-2',
          title: 'Creamy Berry Dopamine Power Smoothie',
          occasion: 'breakfast',
          format: 'smoothie',
          origin: 'mine',
          cookTime: 5,
          kcal: 360,
          ingredients: ['1 cup Greek yogurt', '1/2 cup blueberries', '1 tbsp chia seeds', '1 scoop protein powder', '1 cup almond milk'],
          instructions: '1. Place all items into blender pitcher.\n2. Blend on high for 45 seconds.\n3. Rinse blender immediately so no dried residue remains.'
        },
        {
          id: 'rec-3',
          title: 'Campus Dining Style Crispy Chickpea Wrap',
          occasion: 'lunch',
          format: 'sandwich',
          origin: 'school',
          cookTime: 12,
          kcal: 480,
          ingredients: ['1 large tortilla', '1/2 can chickpeas seasoned with smoked paprika', 'Handful baby spinach', '2 tbsp hummus', 'Cucumber slices'],
          instructions: '1. Warm tortilla in dry skillet.\n2. Spread hummus, layer spinach, cucumber, and chickpeas.\n3. Fold tightly and slice diagonally.'
        },
        {
          id: 'rec-4',
          title: "Mom's Honey Dijon Salmon & Broccoli Skillet",
          occasion: 'dinner',
          format: 'skillet',
          origin: 'shared',
          cookTime: 20,
          kcal: 520,
          ingredients: ['6 oz salmon fillet', '1 head broccoli florets', '1 tbsp Dijon mustard', '1 tsp honey', '1 tbsp olive oil'],
          instructions: '1. Chop broccoli into bite-sized florets.\n2. Whisk Dijon and honey.\n3. Sear salmon skin-side down for 5 mins.\n4. Toss broccoli into skillet, cover with lid to steam (WASH PREP BOWLS NOW).\n5. Drizzle glaze and serve.'
        }
      ],
      matrixTasks: [
        { id: 'm-1', text: 'Prepare dinner & wash prep pans', quadrant: 'important-noturgent', estMinutes: 35 },
        { id: 'm-2', text: 'Hydrate & 10-minute stretch', quadrant: 'important-noturgent', estMinutes: 10 },
        { id: 'm-3', text: 'Reply to urgent email', quadrant: 'urgent-important', estMinutes: 15 },
        { id: 'm-4', text: 'Browse random rabbit hole articles', quadrant: 'neither', estMinutes: 30 }
      ],
            showPlanVsReality: false,
      timeEstimationHistory: [
        { id: 'te-1', date: 'Oct 29', title: 'Morning Getting Ready', category: 'care', isFixed: false, plannedMin: 30, actualMin: 48, deltaMin: 18 },
        { id: 'te-2', date: 'Oct 29', title: 'CSci 201 Lecture', category: 'focus', isFixed: true, plannedMin: 60, actualMin: 60, deltaMin: 0 },
        { id: 'te-3', date: 'Oct 30', title: 'Deep Work Homework', category: 'focus', isFixed: false, plannedMin: 45, actualMin: 70, deltaMin: 25 },
        { id: 'te-4', date: 'Oct 31', title: 'Reverse Cooking Dinner', category: 'meal', isFixed: false, plannedMin: 25, actualMin: 32, deltaMin: 7 },
        { id: 'te-5', date: 'Nov 01', title: 'Evening Reset & Chores', category: 'chores', isFixed: false, plannedMin: 20, actualMin: 35, deltaMin: 15 },
        { id: 'te-6', date: 'Nov 02', title: 'Chemistry Lab', category: 'focus', isFixed: true, plannedMin: 90, actualMin: 90, deltaMin: 0 },
        { id: 'te-7', date: 'Nov 03', title: 'Morning Getting Ready', category: 'care', isFixed: false, plannedMin: 30, actualMin: 50, deltaMin: 20 }
      ],
      reverseChefStage: 1,
      reverseChefActiveStepIndex: 0,
      reverseChefTimerSeconds: 240,
      reverseChefTimerRunning: false,
      reverseChefTimerInterval: null,
      reverseChefChatMessages: [],
      incomingGroceriesApprovalList: [],
      kitchenSubTab: 'pantry',
      pantryStorageFilter: 'all',
      shoppingList: [],
      weeklyMealPlan: {
        monday: { breakfast: '', lunch: '', dinner: '', snack: '' },
        tuesday: { breakfast: '', lunch: '', dinner: '', snack: '' },
        wednesday: { breakfast: '', lunch: '', dinner: '', snack: '' },
        thursday: { breakfast: '', lunch: '', dinner: '', snack: '' },
        friday: { breakfast: '', lunch: '', dinner: '', snack: '' },
        saturday: { breakfast: '', lunch: '', dinner: '', snack: '' },
        sunday: { breakfast: '', lunch: '', dinner: '', snack: '' }
      },
      pantry: [
        {
          id: 'p-1',
          name: 'Fresh Broccoli',
          brand: 'Organic Farm Fresh',
          category: 'produce',
          storage: 'fridge',
          amount: 1,
          unit: 'items',
          dateAdded: '2026-11-01',
          expirationDate: '2026-11-18',
          kcal: 45,
          protein: 3.7,
          carbs: 8.9,
          fat: 0.5,
          fiber: 3.3,
          sugar: 2.2,
          satFat: 0.1,
          sodium: 44,
          sourceBadge: '✓ Verified USDA Whole Food',
          nutrition: {
            kcal: 45,
            protein: 3.7,
            carbs: 8.9,
            fat: 0.5,
            fiber: 3.3,
            sugar: 2.2,
            satFat: 0.1,
            sodium: 44,
            micros: {
              vitA: 567, vitC: 89.2, vitD: 0, vitE: 1.1, vitK: 101.6,
              vitB1: 0.1, vitB2: 0.15, vitB3: 0.9, vitB5: 0.7, vitB6: 0.25, vitB7: 1.5, vitB9: 71, vitB12: 0, choline: 25.6,
              potassium: 410, calcium: 62, iron: 0.9, magnesium: 29, zinc: 0.5, phosphorus: 88, chloride: 55, sulfur: 120, copper: 0.08, manganese: 0.28, selenium: 3.3, iodine: 4.2, chromium: 2.1, molybdenum: 4.5
            }
          }
        },
        {
          id: 'p-2',
          name: 'Eggs (Dozen)',
          brand: 'Pasture-Raised Organic',
          category: 'protein',
          storage: 'fridge',
          amount: 12,
          unit: 'items',
          dateAdded: '2026-11-03',
          expirationDate: '2026-12-05',
          kcal: 143,
          protein: 12.6,
          carbs: 0.8,
          fat: 9.5,
          fiber: 0,
          sugar: 0.4,
          satFat: 3.1,
          sodium: 142,
          sourceBadge: '✓ Verified USDA Whole Food',
          nutrition: {
            kcal: 143,
            protein: 12.6,
            carbs: 0.8,
            fat: 9.5,
            fiber: 0,
            sugar: 0.4,
            satFat: 3.1,
            sodium: 142,
            micros: {
              vitA: 160, vitC: 0, vitD: 2.0, vitE: 1.05, vitK: 0.3,
              vitB1: 0.04, vitB2: 0.46, vitB3: 0.1, vitB5: 1.4, vitB6: 0.17, vitB7: 20.0, vitB9: 47, vitB12: 1.1, choline: 294,
              potassium: 138, calcium: 56, iron: 1.8, magnesium: 12, zinc: 1.3, phosphorus: 198, chloride: 180, sulfur: 160, copper: 0.07, manganese: 0.03, selenium: 30.8, iodine: 49.0, chromium: 1.8, molybdenum: 9.2
            }
          }
        },
        {
          id: 'p-3',
          name: 'Chicken Breast',
          brand: 'Free-Range Organic',
          category: 'protein',
          storage: 'fridge',
          amount: 16,
          unit: 'oz',
          dateAdded: '2026-11-06',
          expirationDate: '2026-11-14',
          kcal: 165,
          protein: 31.0,
          carbs: 0,
          fat: 3.6,
          fiber: 0,
          sugar: 0,
          satFat: 1.0,
          sodium: 74,
          sourceBadge: '✓ Verified USDA Whole Food',
          nutrition: {
            kcal: 165,
            protein: 31.0,
            carbs: 0,
            fat: 3.6,
            fiber: 0,
            sugar: 0,
            satFat: 1.0,
            sodium: 74,
            micros: {
              vitA: 6, vitC: 0, vitD: 0.1, vitE: 0.3, vitK: 0.3,
              vitB1: 0.09, vitB2: 0.14, vitB3: 13.7, vitB5: 1.5, vitB6: 0.88, vitB7: 2.1, vitB9: 5, vitB12: 0.34, choline: 85.0,
              potassium: 334, calcium: 15, iron: 1.0, magnesium: 29, zinc: 1.0, phosphorus: 228, chloride: 85, sulfur: 280, copper: 0.05, manganese: 0.02, selenium: 27.6, iodine: 8.0, chromium: 0.8, molybdenum: 3.0
            }
          }
        },
        {
          id: 'p-4',
          name: 'Jasmine Rice',
          brand: 'Royal Selection',
          category: 'grains',
          storage: 'shelf',
          amount: 32,
          unit: 'oz',
          dateAdded: '2026-10-25',
          expirationDate: '2027-10-25',
          kcal: 195,
          protein: 3.6,
          carbs: 43.0,
          fat: 0.4,
          fiber: 0.6,
          sugar: 0.1,
          satFat: 0.1,
          sodium: 2,
          sourceBadge: '✓ Verified USDA Whole Food',
          nutrition: {
            kcal: 195,
            protein: 3.6,
            carbs: 43.0,
            fat: 0.4,
            fiber: 0.6,
            sugar: 0.1,
            satFat: 0.1,
            sodium: 2,
            micros: {
              vitA: 0, vitC: 0, vitD: 0, vitE: 0.05, vitK: 0.1,
              vitB1: 0.26, vitB2: 0.02, vitB3: 2.3, vitB5: 0.6, vitB6: 0.15, vitB7: 1.0, vitB9: 90, vitB12: 0, choline: 5.8,
              potassium: 53, calcium: 15, iron: 1.9, magnesium: 19, zinc: 0.8, phosphorus: 68, chloride: 22, sulfur: 42, copper: 0.1, manganese: 0.74, selenium: 9.8, iodine: 2.1, chromium: 1.2, molybdenum: 8.5
            }
          }
        },
        {
          id: 'p-5',
          name: 'Rolled Oats',
          brand: "Bob's Red Mill",
          category: 'grains',
          storage: 'shelf',
          amount: 32,
          unit: 'oz',
          dateAdded: '2026-10-28',
          expirationDate: '2027-10-28',
          kcal: 152,
          protein: 5.3,
          carbs: 27.0,
          fat: 2.7,
          fiber: 4.0,
          sugar: 0.5,
          satFat: 0.5,
          sodium: 2,
          sourceBadge: '✓ Verified USDA Whole Food',
          nutrition: {
            kcal: 152,
            protein: 5.3,
            carbs: 27.0,
            fat: 2.7,
            fiber: 4.0,
            sugar: 0.5,
            satFat: 0.5,
            sodium: 2,
            micros: {
              vitA: 0, vitC: 0, vitD: 0, vitE: 0.4, vitK: 1.2,
              vitB1: 0.2, vitB2: 0.06, vitB3: 0.5, vitB5: 0.5, vitB6: 0.05, vitB7: 4.0, vitB9: 22, vitB12: 0, choline: 16.0,
              potassium: 140, calcium: 20, iron: 1.4, magnesium: 55, zinc: 1.2, phosphorus: 150, chloride: 30, sulfur: 65, copper: 0.18, manganese: 1.4, selenium: 11.5, iodine: 3.5, chromium: 3.2, molybdenum: 18.0
            }
          }
        },
        {
          id: 'p-6',
          name: 'Greek Yogurt',
          brand: 'Chobani Non-Fat Plain',
          category: 'dairy',
          storage: 'fridge',
          amount: 32,
          unit: 'oz',
          dateAdded: '2026-11-04',
          expirationDate: '2026-11-28',
          kcal: 100,
          protein: 17.5,
          carbs: 6.1,
          fat: 0.7,
          fiber: 0,
          sugar: 5.5,
          satFat: 0.2,
          sodium: 61,
          sourceBadge: '✓ Verified USDA Whole Food',
          nutrition: {
            kcal: 100,
            protein: 17.5,
            carbs: 6.1,
            fat: 0.7,
            fiber: 0,
            sugar: 5.5,
            satFat: 0.2,
            sodium: 61,
            micros: {
              vitA: 12, vitC: 0, vitD: 1.0, vitE: 0.05, vitK: 0.2,
              vitB1: 0.05, vitB2: 0.4, vitB3: 0.3, vitB5: 0.8, vitB6: 0.08, vitB7: 2.5, vitB9: 12, vitB12: 0.75, choline: 25.0,
              potassium: 240, calcium: 187, iron: 0.1, magnesium: 19, zinc: 0.9, phosphorus: 200, chloride: 115, sulfur: 90, copper: 0.03, manganese: 0.01, selenium: 15.0, iodine: 40.0, chromium: 1.5, molybdenum: 6.0
            }
          }
        },
        {
          id: 'p-7',
          name: 'Soy Sauce & Olive Oil',
          brand: 'Pantry Pair',
          category: 'condiments',
          storage: 'shelf',
          amount: 1,
          unit: 'items',
          dateAdded: '2026-10-15',
          expirationDate: '2027-10-15',
          kcal: 125,
          protein: 1.5,
          carbs: 1.2,
          fat: 13.5,
          fiber: 0.2,
          sugar: 0.4,
          satFat: 1.9,
          sodium: 879,
          sourceBadge: '✓ Verified USDA Whole Food',
          nutrition: {
            kcal: 125,
            protein: 1.5,
            carbs: 1.2,
            fat: 13.5,
            fiber: 0.2,
            sugar: 0.4,
            satFat: 1.9,
            sodium: 879,
            micros: {
              vitA: 0, vitC: 0, vitD: 0, vitE: 1.9, vitK: 8.1,
              vitB1: 0.02, vitB2: 0.03, vitB3: 0.4, vitB5: 0.1, vitB6: 0.04, vitB7: 0.5, vitB9: 4, vitB12: 0, choline: 4.2,
              potassium: 112, calcium: 8, iron: 0.5, magnesium: 12, zinc: 0.3, phosphorus: 38, chloride: 1350, sulfur: 40, copper: 0.04, manganese: 0.12, selenium: 1.8, iodine: 5.0, chromium: 0.9, molybdenum: 2.0
            }
          }
        }
      ],
      userProfile: {
        frameSize: 'large',
        heightInches: 67,
        currentWeightLbs: 175,
        targetWeightLbs: 165,
        activityLevel: 'light',
        weeklyPaceLbs: 0.5,
        baselineMaintenanceKcal: 2380,
        dailyEnergyDeficitKcal: 250,
        dailyCaloriesTarget: 2130,
        dailyProteinTarget: 135,
        dailyCarbsTarget: 240,
        dailyFatTarget: 71,
        dailyFiberTarget: 30,
        macroPercentages: {
          protein: 25,
          carbs: 45,
          fat: 30
        },
        macroDistributionPreset: 'balanced',
        macroIsManualOverride: false,
        dailySodiumTarget: 2300,
        dailyPotassiumTarget: 2600,
        dailyIronTarget: 18,
        dailyCalciumTarget: 1000,
        dailyWaterTargetMl: 2700,
        dailyWaterTargetFlOz: 90,
        waterUnit: 'fl_oz'
      },
      nutritionLog: [
        { 
          id: 'n-1', 
          name: 'Greek Yogurt (170g) & Rolled Oats (40g)', 
          kcal: 250, protein: 22, carbs: 33, fat: 3.2, 
          fiber: 4.0, sugar: 6.0, starch: 23.0,
          saturated: 1.2, mufa: 0.8, pufa: 0.9, omega3: 0.1, cholesterol: 10,
          sodium: 62, potassium: 380, iron: 1.8, calcium: 210, magnesium: 55, zinc: 1.4,
          vitA: 40, vitC: 0, vitD: 40, vitE: 0.4, vitK: 1.5,
          tyrosine: 950, tryptophan: 280, leucine: 2100, lysine: 1750, choline: 32,
          waterMl: 140,
          isVerified: true 
        },
        { 
          id: 'n-2', 
          name: 'Pan-seared salmon with rice & broccoli', 
          kcal: 540, protein: 42, carbs: 62, fat: 12, 
          fiber: 5.5, sugar: 2.5, starch: 54.0,
          saturated: 2.1, mufa: 5.2, pufa: 4.2, omega3: 1.8, cholesterol: 75,
          sodium: 480, potassium: 840, iron: 2.4, calcium: 95, magnesium: 85, zinc: 2.1,
          vitA: 320, vitC: 65, vitD: 420, vitE: 2.8, vitK: 85,
          tyrosine: 1450, tryptophan: 460, leucine: 3200, lysine: 3400, choline: 110,
          waterMl: 220,
          isVerified: false 
        }
      ],
      activeEventModal: null,
      activeToolTab: 'magic',
      taskmaster: {
        activeEvent: null,
        currentStepIdx: 0,
        secondsLeft: 0,
        initialStepSeconds: 0,
        timerId: null,
        isPaused: false,
        totalSecondsElapsed: 0
      },
      currentFoodAccuracyMode: 'verified',
      selectedRecipeToShare: null,
      incomingSharedRecipe: null
    };

    // ==============================================
    // RENDERING & INTERACTION CONTROLLERS
    // ==============================================

    // ==============================================
    // INDIVIDUALIZED SECTIONAL SCAFFOLDING CONTROLLERS
    // ==============================================

    function openScaffoldHubModal() {
      const modal = document.getElementById('scaffold-hub-modal');
      if (modal) modal.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
      playChime('bell');
    }

    function closeScaffoldHubModal() {
      const modal = document.getElementById('scaffold-hub-modal');
      if (modal) modal.classList.add('hidden');
    }

    function setSectionScaffold(section, level, silent = false) {
      if (!state.scaffoldStages) state.scaffoldStages = { tasks: 1, kitchen: 1, calendar: 1, focus: 1 };
      state.scaffoldStages[section] = level;
      try {
        localStorage.setItem('focusflow_scaffold_stages', JSON.stringify(state.scaffoldStages));
      } catch (e) {}

      // Color scheme based on section
      const col = section === 'tasks' ? 'bg-pastel-mint' : (section === 'kitchen' ? 'bg-pastel-coral' : (section === 'calendar' ? 'bg-pastel-sky' : 'bg-pastel-butter'));

      // Update in-tool buttons (e.g. scaffold-tasks-1)
      [1, 2, 3].forEach(l => {
        const btn = document.getElementById(`scaffold-${section}-${l}`);
        if (btn) {
          btn.className = (l === level) 
            ? `px-2 py-1 rounded-lg font-bold ${col} text-dark-base transition` 
            : "px-2 py-1 rounded-lg text-slate-400 hover:text-white transition";
        }

        // Also update hub modal buttons
        const hubBtn = document.getElementById(`hub-btn-${section}-${l}`);
        if (hubBtn) {
          hubBtn.className = (l === level) 
            ? `px-2 py-1 rounded-lg font-bold ${col} text-dark-base transition` 
            : "px-2 py-1 rounded-lg text-slate-400 hover:text-white transition";
        }
      });

      // Update contextual descriptions
      const descs = {
        tasks: {
          1: "Level 1 Co-Pilot: Unpacks microscopic steps to break initiation inertia and sets B-minus boundaries.",
          2: "Level 2 Self-Draft: You draft your tasks first; AI reviews realistic time bounds.",
          3: "Level 3 Solo Flight: Minimal prompts; relying on your own established routine habits."
        },
        kitchen: {
          1: "Level 1 Co-Pilot: Step-by-step reverse choreography with enforced passive dish-washing windows.",
          2: "Level 2 Self-Draft: Draft your cook flow; AI suggests safe dish cleaning pockets.",
          3: "Level 3 Solo Flight: Cook without interruption; prompt for 20m kitchen reset after eating."
        },
        calendar: {
          1: "Level 1 Co-Pilot: Automatically injects 10m buffers, 3-step action breakdowns, and hydration stops.",
          2: "Level 2 Self-Draft: Imports calendar schedule with optional 10m buffer padding.",
          3: "Level 3 Solo Flight: Direct calendar import with on-demand check-ins."
        },
        focus: {
          1: "Level 1 Co-Pilot: 5-minute anti-distraction metronome chime and visual countdown rings.",
          2: "Level 2 Self-Draft: Visual countdown ring with +2m grace extension prompts.",
          3: "Level 3 Solo Flight: Unobtrusive background focus timer with gentle completion alert."
        }
      };

      const descEl = document.getElementById(section === 'tasks' ? 'magic-scaffold-description' : (section === 'kitchen' ? 'scaffold-kitchen-desc' : `scaffold-${section}-desc`));
      if (descEl && descs[section] && descs[section][level]) {
        descEl.textContent = descs[section][level];
      }

      const hubStatusEl = document.getElementById(`hub-${section}-status`);
      if (hubStatusEl) {
        const labels = {
          1: "Level 1: Co-Pilot (Full scaffolding)",
          2: "Level 2: Self-Draft + Coach",
          3: "Level 3: Solo Flight (Independent)"
        };
        hubStatusEl.textContent = labels[level];
      }

      if (!silent && typeof playChime === 'function') {
        try { playChime('bell'); } catch (e) {}
      }
    }

    // ==============================================
    // CORE NOTIFICATION & ERROR POPUP SYSTEM
    // Errors NEVER auto-dismiss; stay until user taps [✕], with [Copy Error] button
    // ==============================================
    function alertBox(msg, title = "FocusFlow") {
      const msgStr = String(msg || '');
      const titleStr = String(title || 'FocusFlow');
      const isError = /error|failed|failure|timed out|not enabled|needed|required|invalid|rejected/i.test(`${titleStr} ${msgStr}`);
      const box = document.createElement('div');
      
      const borderColor = isError ? 'border-rose-400/80 bg-dark-elevated shadow-rose-900/40' : 'border-pastel-mint bg-dark-elevated shadow-2xl';
      const titleColor = isError ? 'text-rose-400' : 'text-pastel-mint';
      const iconName = isError ? 'alert-triangle' : 'bell';
      const iconColor = isError ? 'text-rose-400' : 'text-pastel-mint';

      box.className = `fixed bottom-5 right-5 z-[9999] ${borderColor} text-white p-4 rounded-2xl shadow-2xl flex flex-col gap-2.5 text-xs max-w-sm border backdrop-blur-md transition-all duration-300`;
      
      const safeEscaped = msgStr.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
      
      box.innerHTML = `
        <div class="flex items-start justify-between gap-3 w-full">
          <div class="flex items-start gap-2.5 min-w-0">
            <i data-lucide="${iconName}" class="w-5 h-5 ${iconColor} shrink-0 mt-0.5"></i>
            <div class="min-w-0">
              <strong class="block ${titleColor} font-bold text-xs">${titleStr}</strong>
              <div class="text-[11px] text-slate-200 break-words mt-0.5 leading-relaxed">${msgStr}</div>
            </div>
          </div>
          <button type="button" aria-label="Close" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 shrink-0 transition" onclick="this.closest('.fixed').remove()">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
        ${isError ? `
          <div class="pt-1 flex items-center justify-end gap-2 border-t border-dark-border/50">
            <button type="button" class="px-2.5 py-1 rounded-lg bg-dark-base border border-dark-border text-[10px] text-slate-300 hover:text-white font-medium flex items-center gap-1 transition" onclick="navigator.clipboard.writeText('${safeEscaped}'); this.textContent='✓ Copied!'; setTimeout(()=>this.textContent='Copy Error', 2000)">
              <i data-lucide="copy" class="w-3 h-3"></i>
              <span>Copy Error</span>
            </button>
            <button type="button" class="px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-[10px] text-rose-300 hover:bg-rose-500/30 font-semibold transition" onclick="this.closest('.fixed').remove()">
              Dismiss ✕
            </button>
          </div>
        ` : ''}
      `;
      
      document.body.appendChild(box);
      if (window.lucide) lucide.createIcons();

      // Only auto-dismiss non-error notices
      if (!isError) {
        setTimeout(() => {
          if (box.parentNode) {
            box.style.opacity = '0';
            setTimeout(() => box.remove(), 300);
          }
        }, 5000);
      }
    }

    // Merge Heirloom Family Recipes into state.recipes if loaded
    if (typeof window !== 'undefined' && window.FAMILY_RECIPES && Array.isArray(window.FAMILY_RECIPES)) {
      const existingIds = new Set(state.recipes.map(r => r.id));
      window.FAMILY_RECIPES.forEach(r => {
        if (!existingIds.has(r.id)) {
          state.recipes.push(r);
          existingIds.add(r.id);
        }
      });
    }
