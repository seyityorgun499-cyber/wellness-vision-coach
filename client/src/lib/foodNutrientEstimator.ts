// ─────────────────────────────────────────────────────────────
// Yiyecek → Mikro Besin Tahmini
// food_entries tablosundaki yiyecek ismi + kaloriden
// yaklaşık mikro besin içeriğini tahmin eder.
// ─────────────────────────────────────────────────────────────

import type { NutrientKey } from './nutrientRDA';

export type MicroNutrients = Partial<Record<NutrientKey, number>>;

interface FoodInput {
  foodName: string;
  calories: number;
  proteinGrams?: number | string | null;
  fatGrams?: number | string | null;
  fiberGrams?: number | string | null;
}

// ── Food category patterns ──────────────────────────────────

interface FoodPattern {
  pattern: RegExp;
  category: string;
  per100kcal: MicroNutrients;
}

const FOOD_PATTERNS: FoodPattern[] = [
  // ── Balık / Deniz Ürünleri ──
  {
    pattern: /bal[ıi]k|somon|salmon|ton|tuna|levrek|hamsi|sardaly|fish|trout|sea\s*bass|karides|shrimp|midye|mussel/i,
    category: 'fish',
    per100kcal: {
      vitaminD: 150, vitaminB12: 2.5, omega3: 800, selenium: 20,
      protein: 15, iron: 0.5, zinc: 0.6, iodine: 30,
      vitaminB6: 0.3, vitaminA: 30, vitaminE: 0.5,
    },
  },
  // ── Kırmızı Et ──
  {
    pattern: /et\b|k[öo]fte|biftek|kuzu|dana|steak|beef|meat|kebap|kebab|sucuk|past[ıi]rma|kavurma/i,
    category: 'red_meat',
    per100kcal: {
      iron: 1.8, zinc: 2.5, vitaminB12: 2.0, protein: 14,
      selenium: 12, vitaminB6: 0.25, potassium: 150,
      magnesium: 10, folate: 5,
    },
  },
  // ── Tavuk / Kümes Hayvanları ──
  {
    pattern: /tavuk|chicken|hindi|turkey|piliç|kanat|göğüs|but\b|bonfile/i,
    category: 'poultry',
    per100kcal: {
      protein: 18, vitaminB6: 0.35, vitaminB12: 0.3, selenium: 15,
      zinc: 1.2, iron: 0.6, potassium: 140, magnesium: 12,
    },
  },
  // ── Yumurta ──
  {
    pattern: /yumurta|egg|omlet|omelette|menemen/i,
    category: 'egg',
    per100kcal: {
      vitaminD: 40, vitaminB12: 0.8, vitaminA: 80, selenium: 15,
      protein: 9, iron: 1.0, zinc: 0.8, folate: 25,
      vitaminE: 0.7, vitaminK: 3, iodine: 15,
    },
  },
  // ── Süt Ürünleri ──
  {
    pattern: /s[üu]t|yo[ğg]urt|peynir|kefir|milk|cheese|dairy|ayran|lor|kaşar|beyaz\s*peynir|cream|krema/i,
    category: 'dairy',
    per100kcal: {
      calcium: 200, vitaminD: 40, vitaminB12: 0.6, protein: 6,
      potassium: 120, zinc: 0.6, vitaminA: 50, magnesium: 10,
      iodine: 20, selenium: 5, vitaminB6: 0.05,
    },
  },
  // ── Yeşil Yapraklı Sebzeler ──
  {
    pattern: /[ıi]spanak|spinach|marul|lettuce|roka|arugula|pazı|chard|kale|lahana|brokoli|broccoli/i,
    category: 'leafy_green',
    per100kcal: {
      vitaminK: 250, vitaminC: 45, folate: 100, vitaminA: 300,
      calcium: 100, magnesium: 40, potassium: 250, iron: 1.5,
      fiber: 4, vitaminE: 1.0, vitaminB6: 0.1,
    },
  },
  // ── Diğer Sebzeler ──
  {
    pattern: /sebze|salata|havuç|carrot|domates|tomato|biber|pepper|patl[ıi]can|eggplant|kabak|zucchini|so[ğg]an|onion|sar[ıi]msak|garlic|fasulye|bean|bezelye|pea|enginar|artichoke|mantar|mushroom|turp|bamya|p[ıi]rasa|leek|kereviz|celery/i,
    category: 'vegetable',
    per100kcal: {
      vitaminC: 35, vitaminA: 150, potassium: 200, fiber: 5,
      folate: 40, magnesium: 20, vitaminK: 30, iron: 0.8,
      calcium: 30, vitaminB6: 0.15, vitaminE: 0.5,
    },
  },
  // ── Meyveler ──
  {
    pattern: /meyve|elma|apple|portakal|orange|muz|banana|[çc]ilek|strawberry|armut|pear|karpuz|watermelon|[üu]z[üu]m|grape|kiraz|cherry|şeftali|peach|kayısı|apricot|erik|plum|ananas|pineapple|kivi|kiwi|nar|pomegranate|kavun|melon|incir|fig|hurma|date/i,
    category: 'fruit',
    per100kcal: {
      vitaminC: 40, potassium: 180, fiber: 3, folate: 15,
      vitaminA: 30, magnesium: 10, vitaminK: 5, vitaminB6: 0.1,
      vitaminE: 0.3,
    },
  },
  // ── Kuruyemişler ──
  {
    pattern: /ceviz|walnut|badem|almond|f[ıi]nd[ıi]k|hazelnut|f[ıi]st[ıi]k|peanut|pistachio|nut|kaju|cashew|pecan|chia|keten|flax/i,
    category: 'nuts',
    per100kcal: {
      magnesium: 25, vitaminE: 3, zinc: 0.5, omega3: 200,
      fiber: 1.5, protein: 4, selenium: 3, potassium: 80,
      iron: 0.5, calcium: 20, folate: 10, vitaminB6: 0.05,
    },
  },
  // ── Baklagiller ──
  {
    pattern: /mercimek|lentil|nohut|chickpea|kuru\s*fasulye|barbunya|black\s*bean|kidney|börülce/i,
    category: 'legume',
    per100kcal: {
      fiber: 5, folate: 80, iron: 2.0, magnesium: 25,
      potassium: 200, zinc: 1.0, protein: 7, vitaminB6: 0.15,
      selenium: 3, calcium: 20,
    },
  },
  // ── Tam Tahıllar ──
  {
    pattern: /yulaf|oat|bulgur|kinoa|quinoa|esmer\s*pirinç|brown\s*rice|tam\s*bu[ğg]day|whole\s*wheat|çavdar|rye|karabuğday|buckwheat|arpa|barley/i,
    category: 'whole_grain',
    per100kcal: {
      fiber: 3, magnesium: 20, zinc: 0.8, iron: 1.0,
      vitaminB6: 0.1, selenium: 8, folate: 15, potassium: 80,
      protein: 4,
    },
  },
  // ── Ekmek / Makarna / Pirinç (rafine) ──
  {
    pattern: /ekmek|bread|makarna|pasta|pirinç|rice|pilav|noodle|erişte|börek|pide|simit|poğaça|lavaş/i,
    category: 'refined_grain',
    per100kcal: {
      fiber: 1, iron: 0.5, folate: 15, magnesium: 5,
      selenium: 5, zinc: 0.3, protein: 3, potassium: 30,
    },
  },
  // ── Şekerli / Tatlı ──
  {
    pattern: /şeker|sugar|çikolata|chocolate|tatl[ıi]|dessert|pasta|cake|kurabiye|cookie|dondurma|ice\s*cream|bal\b|honey|reçel|jam|helva|baklava|lokum/i,
    category: 'sweet',
    per100kcal: {
      calcium: 10, iron: 0.3, magnesium: 5, potassium: 20,
    },
  },
  // ── Yağlar ──
  {
    pattern: /zeytinya[ğg]|olive\s*oil|tereya[ğg]|butter|ya[ğg]\b|oil|margarin|avokado|avocado/i,
    category: 'fat',
    per100kcal: {
      vitaminE: 2, vitaminK: 10, omega3: 100,
    },
  },
];

// ── Default fallback (mixed meal) ───────────────────────────

const DEFAULT_PER_100KCAL: MicroNutrients = {
  vitaminD: 15, vitaminC: 8, vitaminB12: 0.3, vitaminA: 40,
  vitaminE: 0.8, vitaminK: 10, vitaminB6: 0.1, folate: 20,
  iron: 0.8, calcium: 40, magnesium: 12, zinc: 0.5,
  omega3: 50, potassium: 100, fiber: 1.5, protein: 5,
  selenium: 5, iodine: 5,
};

// ── Main estimation function ────────────────────────────────

export function estimateFoodMicronutrients(food: FoodInput): MicroNutrients {
  const cal = food.calories || 0;
  if (cal <= 0) return {};

  const name = food.foodName.toLowerCase();
  const scale = cal / 100;

  // Find best matching pattern
  const matched = FOOD_PATTERNS.find(p => p.pattern.test(name));
  const basePer100 = matched ? matched.per100kcal : DEFAULT_PER_100KCAL;

  const result: MicroNutrients = {};
  for (const [key, val] of Object.entries(basePer100)) {
    result[key as NutrientKey] = Math.round((val as number) * scale * 100) / 100;
  }

  // Override protein if we have actual data
  const actualProtein = Number(food.proteinGrams);
  if (actualProtein > 0) {
    result.protein = actualProtein;
  }

  // Override fiber if we have actual data
  const actualFiber = Number(food.fiberGrams);
  if (actualFiber > 0) {
    result.fiber = actualFiber;
  }

  return result;
}

// ── Aggregate for multiple foods ────────────────────────────

export interface DailyMicronutrientEstimate {
  totals: Record<NutrientKey, number>;
  foodCount: number;
  estimatedCategories: string[];
}

export function estimateDailyMicronutrients(foods: FoodInput[]): DailyMicronutrientEstimate {
  const totals: Record<string, number> = {};
  const categories = new Set<string>();

  for (const food of foods) {
    const nutrients = estimateFoodMicronutrients(food);
    const name = food.foodName.toLowerCase();
    const matched = FOOD_PATTERNS.find(p => p.pattern.test(name));
    if (matched) categories.add(matched.category);

    for (const [key, val] of Object.entries(nutrients)) {
      totals[key] = (totals[key] || 0) + (val as number);
    }
  }

  // Round all values
  for (const key of Object.keys(totals)) {
    totals[key] = Math.round(totals[key] * 10) / 10;
  }

  return {
    totals: totals as Record<NutrientKey, number>,
    foodCount: foods.length,
    estimatedCategories: Array.from(categories),
  };
}

// ── 7-day average helper ────────────────────────────────────

export function estimateWeeklyAverageMicronutrients(
  recentFoods: FoodInput[],
  days: number = 7
): Record<NutrientKey, number> {
  const { totals } = estimateDailyMicronutrients(recentFoods);
  const avg: Record<string, number> = {};
  for (const [key, val] of Object.entries(totals)) {
    avg[key] = Math.round((val / days) * 10) / 10;
  }
  return avg as Record<NutrientKey, number>;
}
