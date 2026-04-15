// ─────────────────────────────────────────────────────────────
// Takviye Zamanlama, Frekans ve Etkileşim Motoru
// Her besin eksikliği için optimal takviye şeması üretir
// ─────────────────────────────────────────────────────────────

import type { NutrientKey } from './nutrientRDA';
import type { NutrientGap } from './gapCalculator';

export type Frequency = 'daily' | 'every_other_day' | 'twice_weekly' | 'weekly' | 'monthly' | 'seasonal';
export type BestTime = 'morning_empty' | 'morning_meal' | 'afternoon_meal' | 'evening_meal' | 'bedtime';

export interface SupplementPlan {
  id: string;
  nutrient: NutrientKey;
  nameTR: string;
  supplementName: string;
  frequency: Frequency;
  frequencyLabel: string;
  dosagePerIntake: string;
  dailyEquivalent: string;
  weeklyTotal: string;
  monthlyTotal: string;
  bestTime: BestTime;
  bestTimeLabel: string;
  withFood: boolean;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  fulfillmentPercent: number;
  gapAmount: number;
  unit: string;
  interactions: string[];
  tips: string[];
  phase?: 'loading' | 'maintenance';
  phaseDurationWeeks?: number;
  bloodTestBased: boolean;
}

// ── Supplement definitions per nutrient ──────────────────────

interface SupplementDef {
  supplementName: string;
  category: string;
  frequency: Frequency;
  bestTime: BestTime;
  withFood: boolean;
  getDosage: (gap: number, priority: string) => { perIntake: string; dailyEq: string; weeklyTotal: string; monthlyTotal: string };
  interactions: string[];
  tips: string[];
  phase?: 'loading' | 'maintenance';
  phaseDurationWeeks?: number;
}

function fmtNum(n: number, decimals = 0): string {
  return decimals > 0 ? n.toFixed(decimals) : String(Math.round(n));
}

const SUPPLEMENT_DEFS: Record<NutrientKey, SupplementDef> = {
  vitaminD: {
    supplementName: 'D3 Vitamini',
    category: 'Vitamin',
    frequency: 'daily',
    bestTime: 'morning_meal',
    withFood: true,
    getDosage: (gap, priority) => {
      const iu = priority === 'high' ? 4000 : priority === 'medium' ? 2000 : 1000;
      return {
        perIntake: `${iu} IU`,
        dailyEq: `${iu} IU/gün`,
        weeklyTotal: `${fmtNum(iu * 7)} IU/hafta`,
        monthlyTotal: `${fmtNum(iu * 30)} IU/ay`,
      };
    },
    interactions: ['Kalsiyum ile birlikte alın (emilimi artırır)', 'Magnezyum ile birlikte alınabilir'],
    tips: ['Yağlı bir öğünle birlikte alın', 'Sabah güneş ışığı da D vitamini kaynağıdır'],
  },
  vitaminC: {
    supplementName: 'C Vitamini',
    category: 'Vitamin',
    frequency: 'daily',
    bestTime: 'morning_empty',
    withFood: false,
    getDosage: (gap, priority) => {
      const mg = priority === 'high' ? 1000 : 500;
      return {
        perIntake: `${mg} mg`,
        dailyEq: `${mg} mg/gün`,
        weeklyTotal: `${fmtNum(mg * 7)} mg/hafta`,
        monthlyTotal: `${fmtNum(mg * 30)} mg/ay`,
      };
    },
    interactions: ['Demir emilimini artırır — demir ile birlikte alın', 'B12 emilimini azaltabilir — 2 saat arayla alın'],
    tips: ['Bölünmüş dozlar daha iyi emilir (2x500mg > 1x1000mg)', 'Meyve/sebze tüketimini artırarak doğal C alımını yükseltin'],
  },
  vitaminB12: {
    supplementName: 'B12 Vitamini (Metilkobalamin)',
    category: 'Vitamin',
    frequency: 'daily',
    bestTime: 'morning_empty',
    withFood: false,
    getDosage: (gap, priority) => {
      const mcg = priority === 'high' ? 2000 : priority === 'medium' ? 1000 : 500;
      return {
        perIntake: `${mcg} mcg`,
        dailyEq: `${mcg} mcg/gün`,
        weeklyTotal: `${fmtNum(mcg * 7)} mcg/hafta`,
        monthlyTotal: `${fmtNum(mcg * 30)} mcg/ay`,
      };
    },
    interactions: ['Folik asit ile birlikte alınabilir', 'C vitamininden 2 saat arayla alın'],
    tips: ['Dilaltı (sublingual) formlar daha iyi emilir', 'Veganlarda mutlaka takviye gereklidir'],
  },
  vitaminA: {
    supplementName: 'A Vitamini (Beta-Karoten)',
    category: 'Vitamin',
    frequency: 'daily',
    bestTime: 'morning_meal',
    withFood: true,
    getDosage: (gap, priority) => {
      const mcg = priority === 'high' ? 900 : 600;
      return {
        perIntake: `${mcg} mcg RAE`,
        dailyEq: `${mcg} mcg/gün`,
        weeklyTotal: `${fmtNum(mcg * 7)} mcg/hafta`,
        monthlyTotal: `${fmtNum(mcg * 30)} mcg/ay`,
      };
    },
    interactions: ['Yağda çözünür — yağlı öğünle alın', 'Çinko A vitamini metabolizmasını destekler'],
    tips: ['Havuç, tatlı patates, ıspanak doğal kaynaklardır', 'Beta-karoten formunu tercih edin (daha güvenli)'],
  },
  vitaminE: {
    supplementName: 'E Vitamini',
    category: 'Vitamin',
    frequency: 'daily',
    bestTime: 'morning_meal',
    withFood: true,
    getDosage: () => ({
      perIntake: '15 mg',
      dailyEq: '15 mg/gün',
      weeklyTotal: '105 mg/hafta',
      monthlyTotal: '450 mg/ay',
    }),
    interactions: ['K vitamini emilimini etkileyebilir', 'Kan sulandırıcılarla dikkatli kullanılmalı'],
    tips: ['Badem, fındık, ceviz doğal kaynaklardır', 'Doğal d-alfa-tokoferol formunu tercih edin'],
  },
  vitaminK: {
    supplementName: 'K2 Vitamini (MK-7)',
    category: 'Vitamin',
    frequency: 'daily',
    bestTime: 'morning_meal',
    withFood: true,
    getDosage: () => ({
      perIntake: '100 mcg',
      dailyEq: '100 mcg/gün',
      weeklyTotal: '700 mcg/hafta',
      monthlyTotal: '3000 mcg/ay',
    }),
    interactions: ['D3 ile birlikte alın (kalsiyum yönlendirmesi)', 'Kan sulandırıcı kullanıyorsanız doktora danışın'],
    tips: ['Yeşil yapraklı sebzeler en iyi K1 kaynağıdır', 'K2-MK7 formu daha uzun etkilidir'],
  },
  vitaminB6: {
    supplementName: 'B6 Vitamini (P-5-P)',
    category: 'Vitamin',
    frequency: 'daily',
    bestTime: 'morning_meal',
    withFood: true,
    getDosage: () => ({
      perIntake: '2 mg',
      dailyEq: '2 mg/gün',
      weeklyTotal: '14 mg/hafta',
      monthlyTotal: '60 mg/ay',
    }),
    interactions: ['B kompleks ile birlikte alınabilir', 'Magnezyum emilimini destekler'],
    tips: ['Tavuk, balık, patates doğal kaynaklardır'],
  },
  folate: {
    supplementName: 'Folik Asit (Metilfolat)',
    category: 'Vitamin',
    frequency: 'daily',
    bestTime: 'morning_empty',
    withFood: false,
    getDosage: (gap, priority) => {
      const mcg = priority === 'high' ? 800 : 400;
      return {
        perIntake: `${mcg} mcg`,
        dailyEq: `${mcg} mcg/gün`,
        weeklyTotal: `${fmtNum(mcg * 7)} mcg/hafta`,
        monthlyTotal: `${fmtNum(mcg * 30)} mcg/ay`,
      };
    },
    interactions: ['B12 ile birlikte alın', 'Hamilelikte mutlaka takviye gereklidir'],
    tips: ['Mercimek, ıspanak, brokoli doğal kaynaklardır', 'Metilfolat formunu tercih edin (aktif form)'],
  },
  iron: {
    supplementName: 'Demir (Demir Bisglisinat)',
    category: 'Mineral',
    frequency: 'every_other_day',
    bestTime: 'morning_empty',
    withFood: false,
    getDosage: (gap, priority) => {
      const mg = priority === 'high' ? 50 : priority === 'medium' ? 25 : 18;
      return {
        perIntake: `${mg} mg`,
        dailyEq: `${fmtNum(mg / 2)} mg/gün (günaşırı)`,
        weeklyTotal: `${fmtNum(mg * 3.5)} mg/hafta`,
        monthlyTotal: `${fmtNum(mg * 15)} mg/ay`,
      };
    },
    interactions: [
      'C vitamini ile birlikte alın (emilim +%40)',
      'Kalsiyum ile birlikte ALMAYIN (en az 2 saat arayla)',
      'Çay/kahveden 1 saat uzak alın',
    ],
    tips: ['Günaşırı alımda emilim %40 daha iyi', 'Bisglisinat formu mide rahatsızlığı yapmaz', 'Kırmızı et, mercimek doğal kaynaklardır'],
  },
  calcium: {
    supplementName: 'Kalsiyum Sitrat + D3',
    category: 'Mineral',
    frequency: 'daily',
    bestTime: 'evening_meal',
    withFood: true,
    getDosage: (gap, priority) => {
      const mg = priority === 'high' ? 600 : 500;
      return {
        perIntake: `${mg} mg + 1000 IU D3`,
        dailyEq: `${mg} mg/gün`,
        weeklyTotal: `${fmtNum(mg * 7)} mg/hafta`,
        monthlyTotal: `${fmtNum(mg * 30)} mg/ay`,
      };
    },
    interactions: [
      'Demir ile birlikte ALMAYIN (en az 2 saat arayla)',
      'D3 ile birlikte alın (emilimi artırır)',
      'K2 ile birlikte alınabilir (kalsiyum yönlendirmesi)',
    ],
    tips: ['500mg üzerini bölünmüş dozlarda alın', 'Sitrat formu aç karnına da alınabilir'],
  },
  magnesium: {
    supplementName: 'Magnezyum Bisglisinat',
    category: 'Mineral',
    frequency: 'daily',
    bestTime: 'bedtime',
    withFood: false,
    getDosage: (gap, priority) => {
      const mg = priority === 'high' ? 400 : 300;
      return {
        perIntake: `${mg} mg`,
        dailyEq: `${mg} mg/gün`,
        weeklyTotal: `${fmtNum(mg * 7)} mg/hafta`,
        monthlyTotal: `${fmtNum(mg * 30)} mg/ay`,
      };
    },
    interactions: ['D3 emilimini destekler', 'Kalsiyum ile aynı anda almayın (rekabet eder)'],
    tips: ['Bisglisinat/glisin formu uyku kalitesini artırır', 'Yatmadan 30-60dk önce alın', 'Koyu yeşil sebzeler, kuruyemişler doğal kaynaklardır'],
  },
  zinc: {
    supplementName: 'Çinko (Çinko Bisglisinat)',
    category: 'Mineral',
    frequency: 'daily',
    bestTime: 'morning_meal',
    withFood: true,
    getDosage: (gap, priority) => {
      const mg = priority === 'high' ? 25 : 15;
      return {
        perIntake: `${mg} mg`,
        dailyEq: `${mg} mg/gün`,
        weeklyTotal: `${fmtNum(mg * 7)} mg/hafta`,
        monthlyTotal: `${fmtNum(mg * 30)} mg/ay`,
      };
    },
    interactions: ['Bakır emilimini azaltabilir (uzun süre yüksek doz alıyorsanız bakır ekleyin)', 'Demir ile aynı anda almayın'],
    tips: ['Bağışıklık ve cilt sağlığı için önemlidir', 'Kabak çekirdeği, et, kabuklu deniz ürünleri doğal kaynaklardır'],
  },
  omega3: {
    supplementName: 'Omega-3 (EPA+DHA Balık Yağı)',
    category: 'Yağ Asidi',
    frequency: 'daily',
    bestTime: 'morning_meal',
    withFood: true,
    getDosage: (gap, priority) => {
      const mg = priority === 'high' ? 2000 : 1000;
      return {
        perIntake: `${mg} mg EPA+DHA`,
        dailyEq: `${mg} mg/gün`,
        weeklyTotal: `${fmtNum(mg * 7)} mg/hafta`,
        monthlyTotal: `${fmtNum(mg * 30)} mg/ay`,
      };
    },
    interactions: ['Kan sulandırıcılarla dikkatli kullanın', 'D3 ve E vitamini ile birlikte alınabilir'],
    tips: [
      'Haftada 2 porsiyon yağlı balık ≈ 3500mg/hafta',
      'EPA kalp sağlığı, DHA beyin sağlığı için önemli',
      'Veganlar alg bazlı omega-3 kullanabilir',
    ],
  },
  potassium: {
    supplementName: 'Potasyum Sitrat',
    category: 'Mineral',
    frequency: 'daily',
    bestTime: 'morning_meal',
    withFood: true,
    getDosage: () => ({
      perIntake: '200 mg',
      dailyEq: '200 mg/gün (gıdalardan tamamlayın)',
      weeklyTotal: '1400 mg/hafta',
      monthlyTotal: '6000 mg/ay',
    }),
    interactions: ['Böbrek hastalarında dikkatli kullanılmalı', 'ACE inhibitörleri ile etkileşir'],
    tips: ['Muz, avokado, patates, fasulye doğal kaynaklardır', 'Gıda yoluyla alım her zaman tercih edilmelidir'],
  },
  fiber: {
    supplementName: 'Lif Takviyesi (Psyllium Husk)',
    category: 'Sindirim',
    frequency: 'daily',
    bestTime: 'morning_empty',
    withFood: false,
    getDosage: (gap, priority) => {
      const g = priority === 'high' ? 10 : 5;
      return {
        perIntake: `${g} g`,
        dailyEq: `${g} g/gün`,
        weeklyTotal: `${fmtNum(g * 7)} g/hafta`,
        monthlyTotal: `${fmtNum(g * 30)} g/ay`,
      };
    },
    interactions: ['İlaç emilimini azaltabilir — ilaçlardan 2 saat arayla alın', 'Bol su ile alın (en az 250ml)'],
    tips: ['Yavaş yavaş artırın (şişkinlik önlenir)', 'Sebze, meyve, baklagiller doğal lif kaynaklarıdır'],
  },
  protein: {
    supplementName: 'Whey Protein / Bitkisel Protein',
    category: 'Protein',
    frequency: 'daily',
    bestTime: 'afternoon_meal',
    withFood: false,
    getDosage: (gap, priority) => {
      const g = priority === 'high' ? 30 : 25;
      return {
        perIntake: `${g} g`,
        dailyEq: `${g} g/gün`,
        weeklyTotal: `${fmtNum(g * 7)} g/hafta`,
        monthlyTotal: `${fmtNum(g * 30)} g/ay`,
      };
    },
    interactions: ['Kreatin ile birlikte alınabilir'],
    tips: ['Antrenman sonrası 30dk içinde alın', 'Laktoz intoleransı varsa izolat veya bitkisel protein tercih edin'],
  },
  selenium: {
    supplementName: 'Selenyum',
    category: 'Mineral',
    frequency: 'daily',
    bestTime: 'morning_meal',
    withFood: true,
    getDosage: () => ({
      perIntake: '55 mcg',
      dailyEq: '55 mcg/gün',
      weeklyTotal: '385 mcg/hafta',
      monthlyTotal: '1650 mcg/ay',
    }),
    interactions: ['C vitamini emilimini artırır', 'Yüksek dozda toksik olabilir — üst sınır 400mcg'],
    tips: ['2 Brezilya fındığı günlük ihtiyacı karşılar', 'Tiroid fonksiyonu için önemlidir'],
  },
  iodine: {
    supplementName: 'İyot (Potasyum İyodür)',
    category: 'Mineral',
    frequency: 'daily',
    bestTime: 'morning_meal',
    withFood: true,
    getDosage: () => ({
      perIntake: '150 mcg',
      dailyEq: '150 mcg/gün',
      weeklyTotal: '1050 mcg/hafta',
      monthlyTotal: '4500 mcg/ay',
    }),
    interactions: ['Tiroid ilaçlarıyla etkileşir — doktora danışın'],
    tips: ['İyotlu tuz kullanımı genellikle yeterlidir', 'Deniz ürünleri ve süt ürünleri doğal kaynaklardır'],
  },
};

// ── Frequency labels ────────────────────────────────────────

const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: 'Her gün',
  every_other_day: 'Günaşırı',
  twice_weekly: 'Haftada 2 kez',
  weekly: 'Haftada 1 kez',
  monthly: 'Ayda 1 kez',
  seasonal: 'Mevsimsel',
};

const BEST_TIME_LABELS: Record<BestTime, string> = {
  morning_empty: 'Sabah, aç karnına',
  morning_meal: 'Sabah, kahvaltıyla',
  afternoon_meal: 'Öğle/ikindi, yemekle',
  evening_meal: 'Akşam, yemekle',
  bedtime: 'Yatmadan önce',
};

// ── Main: generate supplement plans from gaps ───────────────

export function generateSupplementPlans(gaps: NutrientGap[]): SupplementPlan[] {
  const plans: SupplementPlan[] = [];

  for (const gap of gaps) {
    if (!gap.needsSupplement) continue;

    const def = SUPPLEMENT_DEFS[gap.nutrient];
    if (!def) continue;

    const dosage = def.getDosage(gap.dailyGap, gap.priority);

    plans.push({
      id: `sup-${gap.nutrient}`,
      nutrient: gap.nutrient,
      nameTR: gap.nameTR,
      supplementName: def.supplementName,
      frequency: def.frequency,
      frequencyLabel: FREQUENCY_LABELS[def.frequency],
      dosagePerIntake: dosage.perIntake,
      dailyEquivalent: dosage.dailyEq,
      weeklyTotal: dosage.weeklyTotal,
      monthlyTotal: dosage.monthlyTotal,
      bestTime: def.bestTime,
      bestTimeLabel: BEST_TIME_LABELS[def.bestTime],
      withFood: def.withFood,
      reason: buildReason(gap),
      priority: gap.priority,
      category: def.category,
      fulfillmentPercent: gap.fulfillmentPercent,
      gapAmount: gap.dailyGap,
      unit: gap.unit,
      interactions: def.interactions,
      tips: def.tips,
      phase: def.phase,
      phaseDurationWeeks: def.phaseDurationWeeks,
      bloodTestBased: gap.bloodTestAdjusted,
    });
  }

  // Sort: blood-test-based first, then by priority, then by fulfillment
  plans.sort((a, b) => {
    if (a.bloodTestBased !== b.bloodTestBased) return a.bloodTestBased ? -1 : 1;
    const prio = { high: 0, medium: 1, low: 2 };
    if (prio[a.priority] !== prio[b.priority]) return prio[a.priority] - prio[b.priority];
    return a.fulfillmentPercent - b.fulfillmentPercent;
  });

  return plans;
}

function buildReason(gap: NutrientGap): string {
  const pct = gap.fulfillmentPercent;
  const name = gap.nameTR;

  if (gap.bloodTestAdjusted && gap.bloodTestStatus === 'critical') {
    return `Kan tahlilinde ${name} seviyeniz kritik düşük. Günlük ihtiyacınız artırılmış durumda. Acil takviye önerilir.`;
  }
  if (gap.bloodTestAdjusted && gap.bloodTestStatus === 'low') {
    return `Kan tahlilinde ${name} seviyeniz düşük çıktı. Beslenmenizle günlük ihtiyacın %${pct}'ini karşılıyorsunuz. Takviye ile desteklemeniz önerilir.`;
  }
  if (pct < 30) {
    return `${name} alımınız günlük ihtiyacın sadece %${pct}'i seviyesinde. Ciddi eksiklik riski mevcut. Hem beslenmenizi zenginleştirin hem takviye alın.`;
  }
  if (pct < 50) {
    return `${name} alımınız günlük ihtiyacın %${pct}'i. Eksiklik belirtileri ortaya çıkabilir. Takviye ile desteklemeniz önerilir.`;
  }
  return `${name} alımınız günlük ihtiyacın %${pct}'i. Hafif eksiklik mevcut. Beslenme düzenlenmesiyle birlikte düşük doz takviye yeterli olabilir.`;
}

// ── Interaction check across all plans ──────────────────────

export interface InteractionWarning {
  supplements: string[];
  warning: string;
  severity: 'high' | 'medium';
}

const INTERACTION_RULES: { nutrients: NutrientKey[]; warning: string; severity: 'high' | 'medium' }[] = [
  {
    nutrients: ['iron', 'calcium'],
    warning: 'Demir ve Kalsiyum birlikte alınmamalı — en az 2 saat arayla alın. Demir sabah, Kalsiyum akşam önerilir.',
    severity: 'high',
  },
  {
    nutrients: ['iron', 'zinc'],
    warning: 'Demir ve Çinko aynı anda alınırsa emilim düşer — farklı saatlerde alın.',
    severity: 'medium',
  },
  {
    nutrients: ['vitaminC', 'vitaminB12'],
    warning: 'Yüksek doz C vitamini B12 emilimini azaltabilir — 2 saat arayla alın.',
    severity: 'medium',
  },
  {
    nutrients: ['calcium', 'magnesium'],
    warning: 'Kalsiyum ve Magnezyum yüksek dozlarda rekabet eder — farklı saatlerde alın (Ca: sabah, Mg: akşam).',
    severity: 'medium',
  },
];

export function checkInteractions(plans: SupplementPlan[]): InteractionWarning[] {
  const activeNutrients = new Set(plans.map(p => p.nutrient));
  const warnings: InteractionWarning[] = [];

  for (const rule of INTERACTION_RULES) {
    if (rule.nutrients.every(n => activeNutrients.has(n))) {
      warnings.push({
        supplements: rule.nutrients.map(n => plans.find(p => p.nutrient === n)?.supplementName ?? n),
        warning: rule.warning,
        severity: rule.severity,
      });
    }
  }

  return warnings;
}

// ── Build daily schedule from plans ─────────────────────────

export interface ScheduleSlot {
  time: BestTime;
  timeLabel: string;
  supplements: { name: string; dosage: string; withFood: boolean; frequency: string }[];
}

export function buildDailySchedule(plans: SupplementPlan[]): ScheduleSlot[] {
  const timeOrder: BestTime[] = ['morning_empty', 'morning_meal', 'afternoon_meal', 'evening_meal', 'bedtime'];
  const grouped = new Map<BestTime, ScheduleSlot>();

  for (const time of timeOrder) {
    grouped.set(time, { time, timeLabel: BEST_TIME_LABELS[time], supplements: [] });
  }

  for (const plan of plans) {
    const slot = grouped.get(plan.bestTime)!;
    slot.supplements.push({
      name: plan.supplementName,
      dosage: plan.dosagePerIntake,
      withFood: plan.withFood,
      frequency: plan.frequencyLabel,
    });
  }

  return timeOrder
    .map(t => grouped.get(t)!)
    .filter(slot => slot.supplements.length > 0);
}
