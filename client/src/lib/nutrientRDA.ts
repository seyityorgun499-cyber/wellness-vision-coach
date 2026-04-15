// ─────────────────────────────────────────────────────────────
// Kişisel RDA (Recommended Daily Allowance) Hesaplama Motoru
// NIH / WHO / Türkiye Beslenme Rehberi tabanlı
// ─────────────────────────────────────────────────────────────

export type NutrientKey =
  | 'vitaminD' | 'vitaminC' | 'vitaminB12' | 'vitaminA' | 'vitaminE'
  | 'vitaminK' | 'vitaminB6' | 'folate' | 'iron' | 'calcium'
  | 'magnesium' | 'zinc' | 'omega3' | 'potassium' | 'fiber'
  | 'protein' | 'selenium' | 'iodine';

export interface NutrientInfo {
  name: string;
  nameTR: string;
  unit: string;
  daily: number;
  upperLimit: number;       // -1 = no established UL
  weeklyEquivalent?: number;
  monthlyEquivalent?: number;
}

export interface PersonalProfile {
  age: number;
  gender: 'male' | 'female';
  weightKg: number;
  heightCm: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  isPregnant?: boolean;
  isLactating?: boolean;
  isVegan?: boolean;
  bmi?: number;
}

// ── Base RDA tables (NIH DRI) ─────────────────────────────

type AgeGenderKey = 'male_19_50' | 'male_51_70' | 'male_71plus'
  | 'female_19_50' | 'female_51_70' | 'female_71plus'
  | 'pregnant' | 'lactating';

const BASE_RDA: Record<AgeGenderKey, Record<NutrientKey, { daily: number; ul: number }>> = {
  male_19_50: {
    vitaminD:   { daily: 600,   ul: 4000 },
    vitaminC:   { daily: 90,    ul: 2000 },
    vitaminB12: { daily: 2.4,   ul: -1 },
    vitaminA:   { daily: 900,   ul: 3000 },
    vitaminE:   { daily: 15,    ul: 1000 },
    vitaminK:   { daily: 120,   ul: -1 },
    vitaminB6:  { daily: 1.3,   ul: 100 },
    folate:     { daily: 400,   ul: 1000 },
    iron:       { daily: 8,     ul: 45 },
    calcium:    { daily: 1000,  ul: 2500 },
    magnesium:  { daily: 420,   ul: 350 },
    zinc:       { daily: 11,    ul: 40 },
    omega3:     { daily: 1600,  ul: 3000 },
    potassium:  { daily: 3400,  ul: -1 },
    fiber:      { daily: 38,    ul: -1 },
    protein:    { daily: 56,    ul: -1 },
    selenium:   { daily: 55,    ul: 400 },
    iodine:     { daily: 150,   ul: 1100 },
  },
  male_51_70: {
    vitaminD:   { daily: 600,   ul: 4000 },
    vitaminC:   { daily: 90,    ul: 2000 },
    vitaminB12: { daily: 2.4,   ul: -1 },
    vitaminA:   { daily: 900,   ul: 3000 },
    vitaminE:   { daily: 15,    ul: 1000 },
    vitaminK:   { daily: 120,   ul: -1 },
    vitaminB6:  { daily: 1.7,   ul: 100 },
    folate:     { daily: 400,   ul: 1000 },
    iron:       { daily: 8,     ul: 45 },
    calcium:    { daily: 1000,  ul: 2000 },
    magnesium:  { daily: 420,   ul: 350 },
    zinc:       { daily: 11,    ul: 40 },
    omega3:     { daily: 1600,  ul: 3000 },
    potassium:  { daily: 3400,  ul: -1 },
    fiber:      { daily: 30,    ul: -1 },
    protein:    { daily: 56,    ul: -1 },
    selenium:   { daily: 55,    ul: 400 },
    iodine:     { daily: 150,   ul: 1100 },
  },
  male_71plus: {
    vitaminD:   { daily: 800,   ul: 4000 },
    vitaminC:   { daily: 90,    ul: 2000 },
    vitaminB12: { daily: 2.4,   ul: -1 },
    vitaminA:   { daily: 900,   ul: 3000 },
    vitaminE:   { daily: 15,    ul: 1000 },
    vitaminK:   { daily: 120,   ul: -1 },
    vitaminB6:  { daily: 1.7,   ul: 100 },
    folate:     { daily: 400,   ul: 1000 },
    iron:       { daily: 8,     ul: 45 },
    calcium:    { daily: 1200,  ul: 2000 },
    magnesium:  { daily: 420,   ul: 350 },
    zinc:       { daily: 11,    ul: 40 },
    omega3:     { daily: 1600,  ul: 3000 },
    potassium:  { daily: 3400,  ul: -1 },
    fiber:      { daily: 30,    ul: -1 },
    protein:    { daily: 56,    ul: -1 },
    selenium:   { daily: 55,    ul: 400 },
    iodine:     { daily: 150,   ul: 1100 },
  },
  female_19_50: {
    vitaminD:   { daily: 600,   ul: 4000 },
    vitaminC:   { daily: 75,    ul: 2000 },
    vitaminB12: { daily: 2.4,   ul: -1 },
    vitaminA:   { daily: 700,   ul: 3000 },
    vitaminE:   { daily: 15,    ul: 1000 },
    vitaminK:   { daily: 90,    ul: -1 },
    vitaminB6:  { daily: 1.3,   ul: 100 },
    folate:     { daily: 400,   ul: 1000 },
    iron:       { daily: 18,    ul: 45 },
    calcium:    { daily: 1000,  ul: 2500 },
    magnesium:  { daily: 320,   ul: 350 },
    zinc:       { daily: 8,     ul: 40 },
    omega3:     { daily: 1100,  ul: 3000 },
    potassium:  { daily: 2600,  ul: -1 },
    fiber:      { daily: 25,    ul: -1 },
    protein:    { daily: 46,    ul: -1 },
    selenium:   { daily: 55,    ul: 400 },
    iodine:     { daily: 150,   ul: 1100 },
  },
  female_51_70: {
    vitaminD:   { daily: 600,   ul: 4000 },
    vitaminC:   { daily: 75,    ul: 2000 },
    vitaminB12: { daily: 2.4,   ul: -1 },
    vitaminA:   { daily: 700,   ul: 3000 },
    vitaminE:   { daily: 15,    ul: 1000 },
    vitaminK:   { daily: 90,    ul: -1 },
    vitaminB6:  { daily: 1.5,   ul: 100 },
    folate:     { daily: 400,   ul: 1000 },
    iron:       { daily: 8,     ul: 45 },
    calcium:    { daily: 1200,  ul: 2000 },
    magnesium:  { daily: 320,   ul: 350 },
    zinc:       { daily: 8,     ul: 40 },
    omega3:     { daily: 1100,  ul: 3000 },
    potassium:  { daily: 2600,  ul: -1 },
    fiber:      { daily: 21,    ul: -1 },
    protein:    { daily: 46,    ul: -1 },
    selenium:   { daily: 55,    ul: 400 },
    iodine:     { daily: 150,   ul: 1100 },
  },
  female_71plus: {
    vitaminD:   { daily: 800,   ul: 4000 },
    vitaminC:   { daily: 75,    ul: 2000 },
    vitaminB12: { daily: 2.4,   ul: -1 },
    vitaminA:   { daily: 700,   ul: 3000 },
    vitaminE:   { daily: 15,    ul: 1000 },
    vitaminK:   { daily: 90,    ul: -1 },
    vitaminB6:  { daily: 1.5,   ul: 100 },
    folate:     { daily: 400,   ul: 1000 },
    iron:       { daily: 8,     ul: 45 },
    calcium:    { daily: 1200,  ul: 2000 },
    magnesium:  { daily: 320,   ul: 350 },
    zinc:       { daily: 8,     ul: 40 },
    omega3:     { daily: 1100,  ul: 3000 },
    potassium:  { daily: 2600,  ul: -1 },
    fiber:      { daily: 21,    ul: -1 },
    protein:    { daily: 46,    ul: -1 },
    selenium:   { daily: 55,    ul: 400 },
    iodine:     { daily: 150,   ul: 1100 },
  },
  pregnant: {
    vitaminD:   { daily: 600,   ul: 4000 },
    vitaminC:   { daily: 85,    ul: 2000 },
    vitaminB12: { daily: 2.6,   ul: -1 },
    vitaminA:   { daily: 770,   ul: 3000 },
    vitaminE:   { daily: 15,    ul: 1000 },
    vitaminK:   { daily: 90,    ul: -1 },
    vitaminB6:  { daily: 1.9,   ul: 100 },
    folate:     { daily: 600,   ul: 1000 },
    iron:       { daily: 27,    ul: 45 },
    calcium:    { daily: 1000,  ul: 2500 },
    magnesium:  { daily: 360,   ul: 350 },
    zinc:       { daily: 11,    ul: 40 },
    omega3:     { daily: 1400,  ul: 3000 },
    potassium:  { daily: 2900,  ul: -1 },
    fiber:      { daily: 28,    ul: -1 },
    protein:    { daily: 71,    ul: -1 },
    selenium:   { daily: 60,    ul: 400 },
    iodine:     { daily: 220,   ul: 1100 },
  },
  lactating: {
    vitaminD:   { daily: 600,   ul: 4000 },
    vitaminC:   { daily: 120,   ul: 2000 },
    vitaminB12: { daily: 2.8,   ul: -1 },
    vitaminA:   { daily: 1300,  ul: 3000 },
    vitaminE:   { daily: 19,    ul: 1000 },
    vitaminK:   { daily: 90,    ul: -1 },
    vitaminB6:  { daily: 2.0,   ul: 100 },
    folate:     { daily: 500,   ul: 1000 },
    iron:       { daily: 9,     ul: 45 },
    calcium:    { daily: 1000,  ul: 2500 },
    magnesium:  { daily: 320,   ul: 350 },
    zinc:       { daily: 12,    ul: 40 },
    omega3:     { daily: 1300,  ul: 3000 },
    potassium:  { daily: 2800,  ul: -1 },
    fiber:      { daily: 29,    ul: -1 },
    protein:    { daily: 71,    ul: -1 },
    selenium:   { daily: 70,    ul: 400 },
    iodine:     { daily: 290,   ul: 1100 },
  },
};

const NUTRIENT_META: Record<NutrientKey, { name: string; nameTR: string; unit: string }> = {
  vitaminD:   { name: 'Vitamin D3',      nameTR: 'D3 Vitamini',     unit: 'IU' },
  vitaminC:   { name: 'Vitamin C',       nameTR: 'C Vitamini',      unit: 'mg' },
  vitaminB12: { name: 'Vitamin B12',     nameTR: 'B12 Vitamini',    unit: 'mcg' },
  vitaminA:   { name: 'Vitamin A',       nameTR: 'A Vitamini',      unit: 'mcg RAE' },
  vitaminE:   { name: 'Vitamin E',       nameTR: 'E Vitamini',      unit: 'mg' },
  vitaminK:   { name: 'Vitamin K',       nameTR: 'K Vitamini',      unit: 'mcg' },
  vitaminB6:  { name: 'Vitamin B6',      nameTR: 'B6 Vitamini',     unit: 'mg' },
  folate:     { name: 'Folate',          nameTR: 'Folik Asit',      unit: 'mcg DFE' },
  iron:       { name: 'Iron',            nameTR: 'Demir',           unit: 'mg' },
  calcium:    { name: 'Calcium',         nameTR: 'Kalsiyum',        unit: 'mg' },
  magnesium:  { name: 'Magnesium',       nameTR: 'Magnezyum',       unit: 'mg' },
  zinc:       { name: 'Zinc',            nameTR: 'Çinko',           unit: 'mg' },
  omega3:     { name: 'Omega-3 (ALA)',   nameTR: 'Omega-3',         unit: 'mg' },
  potassium:  { name: 'Potassium',       nameTR: 'Potasyum',        unit: 'mg' },
  fiber:      { name: 'Fiber',           nameTR: 'Lif',             unit: 'g' },
  protein:    { name: 'Protein',         nameTR: 'Protein',         unit: 'g' },
  selenium:   { name: 'Selenium',        nameTR: 'Selenyum',        unit: 'mcg' },
  iodine:     { name: 'Iodine',          nameTR: 'İyot',            unit: 'mcg' },
};

// ── Activity multipliers for specific nutrients ──────────

const ACTIVITY_NUTRIENT_MULTIPLIERS: Record<string, Partial<Record<NutrientKey, number>>> = {
  sedentary:   {},
  light:       { magnesium: 1.05, potassium: 1.05, vitaminC: 1.05 },
  moderate:    { magnesium: 1.15, potassium: 1.10, vitaminC: 1.10, iron: 1.05, zinc: 1.05 },
  active:      { magnesium: 1.30, potassium: 1.20, vitaminC: 1.15, iron: 1.10, zinc: 1.10, vitaminB6: 1.10, protein: 1.20 },
  very_active: { magnesium: 1.45, potassium: 1.30, vitaminC: 1.20, iron: 1.15, zinc: 1.15, vitaminB6: 1.15, protein: 1.40 },
};

// ── Resolve age-gender key ──────────────────────────────

function resolveKey(profile: PersonalProfile): AgeGenderKey {
  if (profile.isPregnant) return 'pregnant';
  if (profile.isLactating) return 'lactating';
  const g = profile.gender === 'female' ? 'female' : 'male';
  if (profile.age >= 71) return `${g}_71plus` as AgeGenderKey;
  if (profile.age >= 51) return `${g}_51_70` as AgeGenderKey;
  return `${g}_19_50` as AgeGenderKey;
}

// ── Main: Calculate personalised RDA ─────────────────────

export interface PersonalRDA {
  nutrient: NutrientKey;
  name: string;
  nameTR: string;
  unit: string;
  dailyRDA: number;
  upperLimit: number;
  weeklyRDA: number;
  monthlyRDA: number;
}

export function calculatePersonalRDA(profile: PersonalProfile): PersonalRDA[] {
  const key = resolveKey(profile);
  const base = BASE_RDA[key];
  const actMult = ACTIVITY_NUTRIENT_MULTIPLIERS[profile.activityLevel] ?? {};

  const results: PersonalRDA[] = [];

  for (const [nk, val] of Object.entries(base)) {
    const nutrient = nk as NutrientKey;
    const meta = NUTRIENT_META[nutrient];
    let daily = val.daily;

    // Activity adjustment
    const mult = actMult[nutrient] ?? 1.0;
    daily = Math.round(daily * mult * 10) / 10;

    // Weight-based protein adjustment: 0.8g/kg sedentary → 1.6g/kg very active
    if (nutrient === 'protein' && profile.weightKg > 0) {
      const proteinPerKg: Record<string, number> = {
        sedentary: 0.8, light: 1.0, moderate: 1.2, active: 1.4, very_active: 1.6,
      };
      daily = Math.round(profile.weightKg * (proteinPerKg[profile.activityLevel] ?? 1.2));
    }

    // BMI-based vitamin D adjustment (obezite → emilim düşer)
    if (nutrient === 'vitaminD') {
      const bmi = profile.bmi ?? (profile.weightKg / ((profile.heightCm / 100) ** 2));
      if (bmi >= 30) daily = Math.round(daily * 1.5);
      else if (bmi >= 25) daily = Math.round(daily * 1.2);
    }

    // Vegan adjustments
    if (profile.isVegan) {
      if (nutrient === 'vitaminB12') daily = Math.max(daily, 25); // vegans need supplemental B12
      if (nutrient === 'iron') daily = Math.round(daily * 1.8);   // non-heme iron bioavail lower
      if (nutrient === 'omega3') daily = Math.round(daily * 1.5); // ALA→EPA/DHA conversion low
      if (nutrient === 'zinc') daily = Math.round(daily * 1.5);   // phytate interference
      if (nutrient === 'calcium') daily = Math.max(daily, 1000);
      if (nutrient === 'iodine') daily = Math.max(daily, 150);
    }

    results.push({
      nutrient,
      name: meta.name,
      nameTR: meta.nameTR,
      unit: meta.unit,
      dailyRDA: daily,
      upperLimit: val.ul,
      weeklyRDA: Math.round(daily * 7 * 10) / 10,
      monthlyRDA: Math.round(daily * 30 * 10) / 10,
    });
  }

  return results;
}

export function buildProfileFromUser(user: {
  dateOfBirth?: string;
  gender?: string;
  weightKg?: string | number;
  heightCm?: number;
  activityLevel?: string;
}): PersonalProfile {
  const age = user.dateOfBirth
    ? Math.floor((Date.now() - new Date(user.dateOfBirth).getTime()) / 31557600000)
    : 30;
  return {
    age,
    gender: user.gender === 'female' ? 'female' : 'male',
    weightKg: Number(user.weightKg) || 70,
    heightCm: user.heightCm ?? 170,
    activityLevel: (['sedentary', 'light', 'moderate', 'active', 'very_active'].includes(user.activityLevel ?? '')
      ? user.activityLevel
      : 'moderate') as PersonalProfile['activityLevel'],
  };
}

export { NUTRIENT_META };
