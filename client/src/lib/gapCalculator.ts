// ─────────────────────────────────────────────────────────────
// Besin İhtiyaç-Alım Farkı (GAP) Hesaplama Motoru
// RDA - Besinden Alınan ± Kan Tahlili Düzeltmesi
// ─────────────────────────────────────────────────────────────

import type { NutrientKey, PersonalRDA } from './nutrientRDA';
import type { BloodTestResult } from './api';

export interface NutrientGap {
  nutrient: NutrientKey;
  nameTR: string;
  unit: string;
  dailyRDA: number;
  weeklyRDA: number;
  monthlyRDA: number;
  dailyIntake: number;
  weeklyIntake: number;
  monthlyIntake: number;
  dailyGap: number;
  weeklyGap: number;
  monthlyGap: number;
  fulfillmentPercent: number;
  needsSupplement: boolean;
  priority: 'high' | 'medium' | 'low';
  bloodTestStatus?: 'normal' | 'low' | 'high' | 'critical';
  bloodTestAdjusted: boolean;
}

// ── Blood marker → nutrient mapping ─────────────────────────

interface MarkerMapping {
  keywords: string[];
  nutrient: NutrientKey;
  lowMultiplier: number;
  criticalMultiplier: number;
}

const MARKER_MAPPINGS: MarkerMapping[] = [
  { keywords: ['demir', 'iron', 'ferritin', 'ferrit'], nutrient: 'iron', lowMultiplier: 1.5, criticalMultiplier: 2.5 },
  { keywords: ['b12', 'kobalamin', 'cobalamin'], nutrient: 'vitaminB12', lowMultiplier: 1.5, criticalMultiplier: 2.0 },
  { keywords: ['d vit', 'vitamin d', '25-oh', '25oh', 'd3'], nutrient: 'vitaminD', lowMultiplier: 1.5, criticalMultiplier: 2.5 },
  { keywords: ['kalsiyum', 'calcium', 'ca '], nutrient: 'calcium', lowMultiplier: 1.3, criticalMultiplier: 1.8 },
  { keywords: ['folat', 'folic', 'folik'], nutrient: 'folate', lowMultiplier: 1.5, criticalMultiplier: 2.0 },
  { keywords: ['çinko', 'zinc', 'zn'], nutrient: 'zinc', lowMultiplier: 1.3, criticalMultiplier: 1.8 },
  { keywords: ['selenyum', 'selenium', 'se '], nutrient: 'selenium', lowMultiplier: 1.3, criticalMultiplier: 1.5 },
  { keywords: ['magnezyum', 'magnesium', 'mg '], nutrient: 'magnesium', lowMultiplier: 1.3, criticalMultiplier: 1.8 },
  { keywords: ['hemoglobin', 'hgb', 'hb '], nutrient: 'iron', lowMultiplier: 1.8, criticalMultiplier: 2.5 },
  { keywords: ['potasyum', 'potassium', 'k '], nutrient: 'potassium', lowMultiplier: 1.2, criticalMultiplier: 1.5 },
];

// ── Build blood test adjustment map ─────────────────────────

export interface BloodTestAdjustment {
  nutrient: NutrientKey;
  multiplier: number;
  status: 'low' | 'critical' | 'high';
  markerName: string;
  value: string;
  unit: string;
}

export function getBloodTestAdjustments(results: BloodTestResult[]): BloodTestAdjustment[] {
  const adjustments: BloodTestAdjustment[] = [];
  const seen = new Set<NutrientKey>();

  for (const result of results) {
    if (result.status === 'normal') continue;
    const name = result.markerName.toLowerCase();

    for (const mapping of MARKER_MAPPINGS) {
      if (seen.has(mapping.nutrient)) continue;
      const matches = mapping.keywords.some(k => name.includes(k.toLowerCase()));
      if (!matches) continue;

      if (result.status === 'low' || result.status === 'critical') {
        adjustments.push({
          nutrient: mapping.nutrient,
          multiplier: result.status === 'critical' ? mapping.criticalMultiplier : mapping.lowMultiplier,
          status: result.status as 'low' | 'critical',
          markerName: result.markerName,
          value: String(result.value),
          unit: result.unit,
        });
        seen.add(mapping.nutrient);
      } else if (result.status === 'high') {
        adjustments.push({
          nutrient: mapping.nutrient,
          multiplier: 0.5,
          status: 'high',
          markerName: result.markerName,
          value: String(result.value),
          unit: result.unit,
        });
        seen.add(mapping.nutrient);
      }
    }
  }

  return adjustments;
}

// ── Main GAP calculation ────────────────────────────────────

export function calculateNutrientGaps(
  personalRDAs: PersonalRDA[],
  avgDailyIntake: Partial<Record<NutrientKey, number>>,
  bloodTestResults?: BloodTestResult[],
): NutrientGap[] {
  const btAdjustments = bloodTestResults ? getBloodTestAdjustments(bloodTestResults) : [];
  const btMap = new Map(btAdjustments.map(a => [a.nutrient, a]));

  return personalRDAs.map(rda => {
    const intake = avgDailyIntake[rda.nutrient] ?? 0;
    const btAdj = btMap.get(rda.nutrient);

    let effectiveDailyRDA = rda.dailyRDA;
    let bloodTestAdjusted = false;
    let bloodTestStatus: NutrientGap['bloodTestStatus'];

    if (btAdj) {
      bloodTestAdjusted = true;
      bloodTestStatus = btAdj.status === 'high' ? 'high' : btAdj.status;

      if (btAdj.status === 'low' || btAdj.status === 'critical') {
        effectiveDailyRDA = Math.round(rda.dailyRDA * btAdj.multiplier * 10) / 10;
      } else if (btAdj.status === 'high') {
        effectiveDailyRDA = Math.round(rda.dailyRDA * btAdj.multiplier * 10) / 10;
      }
    }

    const dailyGap = Math.max(0, effectiveDailyRDA - intake);
    const fulfillment = effectiveDailyRDA > 0
      ? Math.min(100, Math.round((intake / effectiveDailyRDA) * 100))
      : 100;

    let needsSupplement = false;
    let priority: 'high' | 'medium' | 'low' = 'low';

    if (btAdj && (btAdj.status === 'critical')) {
      needsSupplement = true;
      priority = 'high';
    } else if (btAdj && btAdj.status === 'low') {
      needsSupplement = true;
      priority = fulfillment < 50 ? 'high' : 'medium';
    } else if (fulfillment < 30) {
      needsSupplement = true;
      priority = 'high';
    } else if (fulfillment < 50) {
      needsSupplement = true;
      priority = 'medium';
    } else if (fulfillment < 70) {
      needsSupplement = true;
      priority = 'low';
    }

    // High status means overconsuming, no supplement needed
    if (btAdj?.status === 'high') {
      needsSupplement = false;
      priority = 'low';
    }

    const effectiveWeeklyRDA = Math.round(effectiveDailyRDA * 7 * 10) / 10;
    const effectiveMonthlyRDA = Math.round(effectiveDailyRDA * 30 * 10) / 10;

    return {
      nutrient: rda.nutrient,
      nameTR: rda.nameTR,
      unit: rda.unit,
      dailyRDA: effectiveDailyRDA,
      weeklyRDA: effectiveWeeklyRDA,
      monthlyRDA: effectiveMonthlyRDA,
      dailyIntake: Math.round(intake * 10) / 10,
      weeklyIntake: Math.round(intake * 7 * 10) / 10,
      monthlyIntake: Math.round(intake * 30 * 10) / 10,
      dailyGap,
      weeklyGap: Math.round(dailyGap * 7 * 10) / 10,
      monthlyGap: Math.round(dailyGap * 30 * 10) / 10,
      fulfillmentPercent: fulfillment,
      needsSupplement,
      priority,
      bloodTestStatus,
      bloodTestAdjusted,
    };
  });
}

// ── Summary helpers ─────────────────────────────────────────

export function getDeficientNutrients(gaps: NutrientGap[]): NutrientGap[] {
  return gaps
    .filter(g => g.needsSupplement)
    .sort((a, b) => {
      const prio = { high: 0, medium: 1, low: 2 };
      return (prio[a.priority] - prio[b.priority]) || (a.fulfillmentPercent - b.fulfillmentPercent);
    });
}

export function getOverallNutrientScore(gaps: NutrientGap[]): number {
  if (gaps.length === 0) return 100;
  const avg = gaps.reduce((s, g) => s + g.fulfillmentPercent, 0) / gaps.length;
  return Math.round(avg);
}
