// FocusFlow - USDA Common Whole Foods Database
// Clinical reference data for whole foods, macros & micronutrients
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


if (typeof window !== "undefined") {
  window.commonFoodsDatabase = commonFoodsDatabase;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = commonFoodsDatabase;
}
