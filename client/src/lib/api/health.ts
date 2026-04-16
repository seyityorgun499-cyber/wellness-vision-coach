/**
 * Myora – Health API
 * Sağlık takibi: günlük log, yemek, aktivite, oruç, kan tahlili, belgeler, sesli günlük, hedefler, başarımlar.
 */

import { getCurrentSupabaseUserId, invokeHealthAnalysis, normalizeBloodTestMarkers, supabase, uploadDataUrlToStorage } from './_common';
import type {
  DailyHealthLog, DailyLogUpdateData,
  FoodEntry, FoodEntryCreateData, FoodAnalysisResult,
  ActivityEntry, ActivityCreateData,
  FastingLog, FastingStartData,
  BloodTest, BloodTestResult, BloodTestUploadData,
  HealthDocument, DocumentUploadData,
  MedicalPhoto, MedicalPhotoUploadData,
  VoiceEntry, VoiceEntryCreateData,
  UserGoal, GoalCreateData, GoalUpdateData,
  Achievement, UserAchievement, UserStreak
} from './types';

// ─────────────────────────────────────────────────────────────
// HELPERS: DB Row → CamelCase
// ─────────────────────────────────────────────────────────────

function toCamelDailyLog(row: any): DailyHealthLog {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    caloriesConsumed: row.calories_consumed ?? 0,
    caloriesBurned: row.calories_burned ?? 0,
    caloriesTarget: row.calories_target ?? 2100,
    proteinGrams: String(row.protein_grams ?? '0'),
    proteinTarget: String(row.protein_target ?? '180'),
    carbsGrams: String(row.carbs_grams ?? '0'),
    fatGrams: String(row.fat_grams ?? '0'),
    waterMl: row.water_ml ?? 0,
    waterTarget: row.water_target ?? 2400,
    steps: row.steps ?? 0,
    stepsTarget: row.steps_target ?? 10000,
    sleepMinutes: row.sleep_minutes ?? null,
    sleepTarget: row.sleep_target ?? 480,
    stressLevel: row.stress_level ?? null,
    moodScore: row.mood_score ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as DailyHealthLog;
}

function toCamelFoodEntry(row: any): FoodEntry {
  return {
    id: row.id,
    userId: row.user_id,
    mealType: row.meal_type,
    foodName: row.food_name,
    calories: row.calories,
    proteinGrams: row.protein_grams != null ? String(row.protein_grams) : null,
    carbsGrams: row.carbs_grams != null ? String(row.carbs_grams) : null,
    fatGrams: row.fat_grams != null ? String(row.fat_grams) : null,
    fiberGrams: row.fiber_grams != null ? String(row.fiber_grams) : null,
    servingSize: row.serving_size ?? null,
    imageUrl: row.image_url ?? null,
    barcode: row.barcode ?? null,
    aiConfidence: row.ai_confidence != null ? String(row.ai_confidence) : null,
    source: row.source ?? 'manual',
    loggedAt: row.logged_at,
    createdAt: row.created_at,
  } as FoodEntry;
}

function toCamelActivityEntry(row: any): ActivityEntry {
  return {
    id: row.id,
    userId: row.user_id,
    activityType: row.activity_type,
    durationMinutes: row.duration_minutes,
    caloriesBurned: row.calories_burned ?? null,
    intensity: row.intensity ?? 'moderate',
    heartRateAvg: row.heart_rate_avg ?? null,
    heartRateMax: row.heart_rate_max ?? null,
    distanceKm: row.distance_km != null ? String(row.distance_km) : null,
    notes: row.notes ?? null,
    startedAt: row.started_at,
    endedAt: row.ended_at ?? null,
    createdAt: row.created_at,
  } as ActivityEntry;
}

function toCamelVoiceEntry(row: any): VoiceEntry {
  return {
    id: row.id,
    userId: row.user_id,
    audioUrl: row.audio_url ?? null,
    durationSeconds: row.duration_seconds ?? null,
    transcription: row.transcription ?? null,
    sentiment: row.sentiment ?? null,
    mood: row.mood ?? null,
    keywords: row.keywords ?? [],
    aiSummary: row.ai_summary ?? null,
    aiRecommendations: row.ai_recommendations ?? null,
    createdAt: row.created_at,
  } as VoiceEntry;
}

function toCamelBloodTestResult(row: any): BloodTestResult {
  return {
    id: row.id,
    bloodTestId: row.blood_test_id,
    markerName: row.marker_name,
    value: row.value != null ? String(row.value) : '',
    unit: row.unit,
    referenceMin: row.reference_min != null ? String(row.reference_min) : null,
    referenceMax: row.reference_max != null ? String(row.reference_max) : null,
    status: row.status ?? null,
    category: row.category ?? null,
    aiInterpretation: row.ai_interpretation ?? null,
    createdAt: row.created_at,
  } as BloodTestResult;
}

function toCamelBloodTest(row: any): BloodTest {
  return {
    id: row.id,
    userId: row.user_id,
    testDate: row.test_date,
    labName: row.lab_name ?? null,
    documentUrl: row.document_url ?? null,
    ocrExtractedText: row.ocr_extracted_text ?? null,
    aiSummary: row.ai_summary ?? null,
    overallStatus: row.overall_status ?? null,
    results: (row.blood_test_results ?? row.results ?? []).map(toCamelBloodTestResult),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as BloodTest;
}

function toCamelHealthDocument(row: any): HealthDocument {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    documentType: row.document_type,
    fileUrl: row.file_url ?? null,
    mimeType: row.mime_type ?? null,
    fileSize: row.file_size ?? null,
    ocrText: row.ocr_text ?? null,
    aiAnalysis: row.ai_analysis ?? null,
    aiRecommendations: row.ai_recommendations ?? null,
    tags: row.tags ?? [],
    status: row.status ?? 'pending',
    uploadedAt: row.uploaded_at,
    createdAt: row.created_at,
  } as HealthDocument;
}

function toCamelMedicalPhoto(row: any): MedicalPhoto {
  return {
    id: row.id,
    userId: row.user_id,
    photoType: row.photo_type,
    imageUrl: row.image_url,
    aiAnalysis: row.ai_analysis ?? null,
    confidence: row.confidence != null ? String(row.confidence) : null,
    notes: row.notes ?? null,
    analyzedAt: row.analyzed_at ?? null,
    createdAt: row.created_at,
  } as MedicalPhoto;
}

function toCamelGoal(row: any): UserGoal {
  return {
    id: row.id,
    userId: row.user_id,
    goalType: row.goal_type,
    title: row.title,
    description: row.description ?? null,
    targetValue: row.target_value != null ? String(row.target_value) : null,
    currentValue: row.current_value != null ? String(row.current_value) : null,
    unit: row.unit ?? null,
    startDate: row.start_date ?? null,
    targetDate: row.target_date ?? null,
    status: row.status ?? 'active',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as UserGoal;
}

function toCamelAchievement(row: any): Achievement {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    iconUrl: row.icon_url ?? null,
    category: row.category ?? null,
    requirement: row.requirement ?? null,
    points: row.points ?? 0,
    createdAt: row.created_at,
  } as Achievement;
}

function toCamelUserAchievement(row: any): UserAchievement {
  return {
    id: row.id,
    userId: row.user_id,
    achievementId: row.achievement_id,
    earnedAt: row.earned_at,
    createdAt: row.created_at,
    achievement: row.achievement ? toCamelAchievement(row.achievement) : undefined,
  } as UserAchievement;
}

function toCamelUserStreak(row: any): UserStreak {
  return {
    id: row.id,
    userId: row.user_id,
    currentStreak: row.current_streak ?? 0,
    longestStreak: row.longest_streak ?? 0,
    lastActiveDate: row.last_active_date ?? null,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  } as UserStreak;
}

// ─────────────────────────────────────────────────────────────
// SAĞLIK TAKİP API
// ─────────────────────────────────────────────────────────────

export const healthAPI = {
  /* ── Günlük Sağlık Kaydı ─────────────────────────── */
  getDailyLog: async (date?: string) => {
    const userId = await getCurrentSupabaseUserId();
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('daily_health_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', targetDate)
      .maybeSingle();
    if (error) throw error;
    return data ? toCamelDailyLog(data) : null;
  },

  updateDailyLog: async (data: DailyLogUpdateData) => {
    const userId = await getCurrentSupabaseUserId();
    const targetDate = data.date || new Date().toISOString().slice(0, 10);
    const payload = {
      user_id: userId,
      date: targetDate,
      calories_consumed: data.caloriesConsumed,
      calories_burned: data.caloriesBurned,
      calories_target: data.caloriesTarget,
      protein_grams: data.proteinGrams,
      protein_target: data.proteinTarget,
      carbs_grams: data.carbsGrams,
      fat_grams: data.fatGrams,
      water_ml: data.waterMl,
      water_target: data.waterTarget,
      steps: data.steps,
      steps_target: data.stepsTarget,
      sleep_minutes: data.sleepMinutes,
      sleep_target: data.sleepTarget,
      stress_level: data.stressLevel,
      mood_score: data.moodScore,
      notes: data.notes,
    };
    const { data: upserted, error } = await supabase
      .from('daily_health_logs')
      .upsert(payload, { onConflict: 'user_id,date' })
      .select('*')
      .single();
    if (error) throw error;
    return toCamelDailyLog(upserted);
  },

  getDailyLogRange: async (startDate: string, endDate: string) => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('daily_health_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toCamelDailyLog);
  },

  /* ── Yemek Girişleri ─────────────────────────────── */
  getFoodEntries: async (date?: string) => {
    const userId = await getCurrentSupabaseUserId();
    let query = supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });
    if (date) {
      query = query.gte('logged_at', `${date}T00:00:00.000Z`).lt('logged_at', `${date}T23:59:59.999Z`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(toCamelFoodEntry);
  },

  getMacroSummary: async (startDate: string, endDate: string): Promise<{ proteinGrams: number; carbsGrams: number; fatGrams: number }> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('food_entries')
      .select('protein_grams,carbs_grams,fat_grams')
      .eq('user_id', userId)
      .gte('logged_at', `${startDate}T00:00:00.000Z`)
      .lte('logged_at', `${endDate}T23:59:59.999Z`);
    if (error) throw error;
    const rows = data ?? [];
    return {
      proteinGrams: rows.reduce((s, r) => s + (Number(r.protein_grams) || 0), 0),
      carbsGrams: rows.reduce((s, r) => s + (Number(r.carbs_grams) || 0), 0),
      fatGrams: rows.reduce((s, r) => s + (Number(r.fat_grams) || 0), 0),
    };
  },

  addFoodEntry: async (data: FoodEntryCreateData) => {
    const userId = await getCurrentSupabaseUserId();
    const { data: inserted, error } = await supabase
      .from('food_entries')
      .insert({
        user_id: userId,
        meal_type: data.mealType,
        food_name: data.foodName,
        calories: data.calories,
        protein_grams: data.proteinGrams ?? null,
        carbs_grams: data.carbsGrams ?? null,
        fat_grams: data.fatGrams ?? null,
        fiber_grams: data.fiberGrams ?? null,
        serving_size: data.servingSize ?? null,
        image_url: data.imageUrl ?? null,
        barcode: data.barcode ?? null,
        ai_confidence: data.aiConfidence ?? null,
        source: data.source ?? 'manual',
      })
      .select('*')
      .single();
    if (error) throw error;
    // Sync daily log
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data: todayFoods } = await supabase
        .from('food_entries')
        .select('calories, protein_grams, carbs_grams, fat_grams')
        .eq('user_id', userId)
        .gte('logged_at', `${today}T00:00:00.000Z`)
        .lt('logged_at', `${today}T23:59:59.999Z`);
      const totalCal = (todayFoods ?? []).reduce((s, f) => s + (f.calories ?? 0), 0);
      const totalProtein = (todayFoods ?? []).reduce((s, f) => s + Number(f.protein_grams ?? 0), 0);
      const totalCarbs = (todayFoods ?? []).reduce((s, f) => s + Number(f.carbs_grams ?? 0), 0);
      const totalFat = (todayFoods ?? []).reduce((s, f) => s + Number(f.fat_grams ?? 0), 0);
      await supabase
        .from('daily_health_logs')
        .upsert({
          user_id: userId,
          date: today,
          calories_consumed: totalCal,
          protein_grams: String(totalProtein),
          carbs_grams: String(totalCarbs),
          fat_grams: String(totalFat),
        }, { onConflict: 'user_id,date' });
    } catch (e) {
      console.warn('Failed to sync daily log after food entry:', e);
    }
    return toCamelFoodEntry(inserted);
  },

  analyzeFood: async (imageData: string): Promise<FoodAnalysisResult> => {
    let result: Record<string, any>;
    try {
      result = await invokeHealthAnalysis('food-image', { imageData });
    } catch (error) {
      console.warn('Food analysis edge function failed, using local fallback:', error);
      result = {
        food: 'Yemek',
        calories: 350,
        servingSize: '1 porsiyon',
        confidence: 55,
        macros: { protein: { amount: 18, percentage: 20 }, carbs: { amount: 32, percentage: 45 }, fat: { amount: 14, percentage: 35 }, fiber: { amount: 4, percentage: 15 } },
        healthNotes: ['AI servisine ulaşılamadığı için tahmini sonuç gösteriliyor.'],
      };
    }
    const safeNum = (v: unknown, fallback = 0): number => {
      if (typeof v === 'number' && !Number.isNaN(v)) return Math.round(v);
      if (typeof v === 'string') {
        const m = v.match(/(\d+)/);
        return m ? parseInt(m[1], 10) : fallback;
      }
      return fallback;
    };
    const macroVal = (macro: unknown): number => {
      if (macro == null) return 0;
      if (typeof macro === 'number' || typeof macro === 'string') return safeNum(macro);
      if (typeof macro === 'object' && macro !== null) {
        const obj = macro as Record<string, unknown>;
        return safeNum(obj.amount ?? obj.value ?? obj.grams ?? 0);
      }
      return 0;
    };
    const macros = result.macros ?? {};
    return {
      foodName: typeof result.food === 'string' ? result.food.split(':')[0].trim() : 'Yemek',
      calories: safeNum(result.calories, 200),
      proteinGrams: macroVal(macros.protein),
      carbsGrams: macroVal(macros.carbs),
      fatGrams: macroVal(macros.fat ?? macros.fats),
      fiberGrams: macroVal(macros.fiber),
      servingSize: typeof result.servingSize === 'string' ? result.servingSize : '1 porsiyon',
      confidence: (() => {
        const raw = safeNum(result.confidence, 70);
        return raw > 0 && raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
      })(),
    };
  },

  deleteFoodEntry: async (id: string) => {
    const userId = await getCurrentSupabaseUserId();
    const { error } = await supabase.from('food_entries').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  /* ── Aktivite Takibi ─────────────────────────────── */
  getActivities: async (limit?: number) => {
    const userId = await getCurrentSupabaseUserId();
    let query = supabase
      .from('activity_entries')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(toCamelActivityEntry);
  },

  addActivity: async (data: ActivityCreateData | any) => {
    const userId = await getCurrentSupabaseUserId();
    const normalized = {
      activity_type: data.activityType ?? data.type,
      duration_minutes: data.durationMinutes ?? data.duration,
      calories_burned: data.caloriesBurned ?? data.calories ?? null,
      intensity: data.intensity ?? 'moderate',
      heart_rate_avg: data.heartRateAvg ?? null,
      heart_rate_max: data.heartRateMax ?? null,
      distance_km: data.distanceKm ?? null,
      notes: data.notes ?? null,
      started_at: data.startedAt ?? new Date().toISOString(),
      ended_at: data.endedAt ?? null,
    };
    const { data: inserted, error } = await supabase
      .from('activity_entries')
      .insert({ user_id: userId, ...normalized })
      .select('*')
      .single();
    if (error) throw error;
    return toCamelActivityEntry(inserted);
  },

  deleteActivityEntry: async (id: string) => {
    const userId = await getCurrentSupabaseUserId();
    const { error } = await supabase.from('activity_entries').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  /* ── Aralıklı Oruç ──────────────────────────────── */
  getActiveFasting: async (): Promise<FastingLog | null> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('fasting_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('started_at', { ascending: false })
      .maybeSingle();
    if (error) throw error;
    return data ? ({
      id: data.id,
      userId: data.user_id,
      fastingPlan: data.fasting_plan,
      startedAt: data.started_at,
      targetEndAt: data.target_end_at,
      actualEndAt: data.actual_end_at ?? null,
      completed: data.completed,
      notes: data.notes ?? null,
      moodBefore: data.mood_before ?? null,
      moodAfter: data.mood_after ?? null,
      createdAt: data.created_at,
    } as FastingLog) : null;
  },

  startFasting: async (data: FastingStartData): Promise<FastingLog> => {
    const userId = await getCurrentSupabaseUserId();
    const startedAt = data.startedAt ?? new Date().toISOString();
    const hours = Number(String(data.fastingPlan).split(':')[0] || 16);
    const targetEndAt = data.targetEndAt ?? new Date(new Date(startedAt).getTime() + hours * 3600 * 1000).toISOString();
    const { data: inserted, error } = await supabase
      .from('fasting_logs')
      .insert({
        user_id: userId,
        fasting_plan: data.fastingPlan,
        started_at: startedAt,
        target_end_at: targetEndAt,
        notes: data.notes ?? null,
        mood_before: data.moodBefore ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return {
      id: inserted.id,
      userId: inserted.user_id,
      fastingPlan: inserted.fasting_plan,
      startedAt: inserted.started_at,
      targetEndAt: inserted.target_end_at,
      actualEndAt: inserted.actual_end_at ?? null,
      completed: inserted.completed,
      notes: inserted.notes ?? null,
      moodBefore: inserted.mood_before ?? null,
      moodAfter: inserted.mood_after ?? null,
      createdAt: inserted.created_at,
    } as FastingLog;
  },

  endFasting: async (id: string, moodAfter?: number): Promise<FastingLog> => {
    const { data, error } = await supabase
      .from('fasting_logs')
      .update({ completed: true, actual_end_at: new Date().toISOString(), mood_after: moodAfter ?? null })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      fastingPlan: data.fasting_plan,
      startedAt: data.started_at,
      targetEndAt: data.target_end_at,
      actualEndAt: data.actual_end_at ?? null,
      completed: data.completed,
      notes: data.notes ?? null,
      moodBefore: data.mood_before ?? null,
      moodAfter: data.mood_after ?? null,
      createdAt: data.created_at,
    } as FastingLog;
  },

  getFastingHistory: async (): Promise<FastingLog[]> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('fasting_logs')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((item: any) => ({
      id: item.id,
      userId: item.user_id as any,
      fastingPlan: item.fasting_plan,
      startedAt: item.started_at,
      targetEndAt: item.target_end_at,
      actualEndAt: item.actual_end_at ?? null,
      completed: item.completed,
      notes: item.notes ?? null,
      moodBefore: item.mood_before ?? null,
      moodAfter: item.mood_after ?? null,
      createdAt: item.created_at,
    } as FastingLog));
  },

  /* ── Kan Tahlilleri ──────────────────────────────── */
  getBloodTests: async (): Promise<BloodTest[]> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('blood_tests')
      .select('*')
      .eq('user_id', userId)
      .order('test_date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelBloodTest);
  },

  getBloodTest: async (id: string): Promise<BloodTest> => {
    const { data, error } = await supabase
      .from('blood_tests')
      .select('*, blood_test_results(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return toCamelBloodTest(data);
  },

  uploadBloodTest: async (data: BloodTestUploadData): Promise<BloodTest> => {
    const userId = await getCurrentSupabaseUserId();
    let analysis: Record<string, any>;
    try {
      analysis = await invokeHealthAnalysis('blood-test', { ocrText: data.ocrText });
    } catch (err) {
      console.warn('Blood test analysis edge function failed, saving without AI analysis:', err);
      analysis = { summary: 'AI analizi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.', overallStatus: 'attention', markers: [] };
    }
    const { data: inserted, error } = await supabase
      .from('blood_tests')
      .insert({
        user_id: userId,
        test_date: data.testDate ?? new Date().toISOString(),
        lab_name: data.labName ?? null,
        ocr_extracted_text: data.ocrText,
        ai_summary: analysis.summary ?? null,
        overall_status: analysis.overallStatus ?? 'attention',
      })
      .select('*')
      .single();
    if (error) throw error;
    const markers = normalizeBloodTestMarkers(analysis.markers);
    if (markers.length > 0) {
      const { error: resultsError } = await supabase
        .from('blood_test_results')
        .insert(markers.map((marker: any) => ({
          blood_test_id: inserted.id,
          marker_name: marker.name,
          value: marker.value,
          unit: marker.unit,
          reference_min: marker.referenceMin ?? null,
          reference_max: marker.referenceMax ?? null,
          status: marker.status ?? null,
          category: marker.category ?? null,
          ai_interpretation: marker.interpretation ?? null,
        })));
      if (resultsError) throw resultsError;
    }
    return healthAPI.getBloodTest(inserted.id);
  },

  /* ── Sağlık Belgeleri ────────────────────────────── */
  getDocuments: async (): Promise<HealthDocument[]> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('health_documents')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelHealthDocument);
  },

  uploadDocument: async (data: DocumentUploadData): Promise<HealthDocument> => {
    const userId = await getCurrentSupabaseUserId();
    let fileUrl: string | null = (data as any).fileUrl ?? null;
    if (data.imageBase64) {
      const path = `${userId}/documents/${Date.now()}.jpg`;
      fileUrl = await uploadDataUrlToStorage(data.imageBase64, path);
    }
    let analysis: Record<string, any>;
    try {
      analysis = await invokeHealthAnalysis('document', {
        ocrText: data.ocrText ?? null,
        imageBase64: data.imageBase64 ?? null,
        documentType: data.documentType,
        title: data.title ?? null,
      });
    } catch (err) {
      console.warn('Document analysis edge function failed, saving without AI analysis:', err);
      analysis = { title: data.title ?? 'Sağlık Belgesi', summary: 'AI analizi şu anda kullanılamıyor.', recommendations: [], tags: data.tags ?? [] };
    }
    const { data: inserted, error } = await supabase
      .from('health_documents')
      .insert({
        user_id: userId,
        title: analysis.title ?? data.title ?? 'Sağlık Belgesi',
        document_type: data.documentType,
        file_url: fileUrl,
        mime_type: (data as any).mimeType ?? null,
        file_size: (data as any).fileSize ?? null,
        ocr_text: data.ocrText ?? null,
        ai_analysis: analysis.summary ?? null,
        ai_recommendations: analysis.recommendations ?? [],
        tags: analysis.tags ?? data.tags ?? [],
        status: 'analyzed',
      })
      .select('*')
      .single();
    if (error) throw error;
    return toCamelHealthDocument(inserted);
  },

  /* ── Tıbbi Fotoğraf Analizi ──────────────────────── */
  getMedicalPhotos: async (): Promise<MedicalPhoto[]> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('medical_photos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelMedicalPhoto);
  },

  analyzeMedicalPhoto: async (data: MedicalPhotoUploadData) => {
    const userId = await getCurrentSupabaseUserId();
    const imagePath = `${userId}/medical-photos/${Date.now()}.jpg`;
    const imageUrl = await uploadDataUrlToStorage(data.imageData, imagePath);
    let analysis: Record<string, any>;
    try {
      analysis = await invokeHealthAnalysis('medical-photo', { imageData: data.imageData, photoType: data.photoType, notes: data.notes ?? null });
    } catch (err) {
      console.warn('Medical photo analysis edge function failed, saving without AI analysis:', err);
      analysis = {
        analysis: { color: 'bilinmiyor', observations: ['AI analizi şu anda kullanılamıyor'], concerns: [], recommendations: ['Lütfen daha sonra tekrar deneyin'], urgency: 'low' as const },
        detectedType: data.photoType,
        confidence: '0',
      };
    }
    const { data: inserted, error } = await supabase
      .from('medical_photos')
      .insert({
        user_id: userId,
        photo_type: analysis.detectedType ?? data.photoType,
        image_url: imageUrl,
        ai_analysis: analysis.analysis ?? null,
        confidence: analysis.confidence ?? null,
        notes: data.notes ?? null,
        analyzed_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw error;
    return {
      photo: toCamelMedicalPhoto(inserted),
      analysis: analysis.analysis,
      detectedType: analysis.detectedType ?? data.photoType,
      confidence: analysis.confidence ?? null,
    };
  },

  /* ── Sesli Günlük ────────────────────────────────── */
  getVoiceEntries: async (): Promise<VoiceEntry[]> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('voice_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelVoiceEntry);
  },

  addVoiceEntry: async (data: VoiceEntryCreateData) => {
    const userId = await getCurrentSupabaseUserId();
    let analysis: Record<string, any>;
    try {
      analysis = await invokeHealthAnalysis('voice-entry', { transcription: data.transcription });
    } catch (err) {
      console.warn('Voice entry analysis edge function failed, saving without AI analysis:', err);
      analysis = { transcription: data.transcription, sentiment: null, mood: null, keywords: [], summary: 'AI analizi şu anda kullanılamıyor.', recommendations: null };
    }
    const { data: inserted, error } = await supabase
      .from('voice_entries')
      .insert({
        user_id: userId,
        audio_url: data.audioUrl ?? null,
        duration_seconds: data.durationSeconds ?? null,
        transcription: analysis.transcription ?? data.transcription,
        sentiment: analysis.sentiment ?? null,
        mood: analysis.mood ?? null,
        keywords: analysis.keywords ?? [],
        ai_summary: analysis.summary ?? null,
        ai_recommendations: analysis.recommendations ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    let foodAnalysis: Record<string, any> | null = null;
    let foodEntries: FoodEntry[] = [];
    if (data.mode === 'food') {
      try {
        foodAnalysis = await invokeHealthAnalysis('voice-food', { transcription: data.transcription });
      } catch (err) {
        console.warn('Voice food analysis edge function failed:', err);
        foodAnalysis = { foods: [] };
      }
      if ((foodAnalysis.foods ?? []).length > 0) {
        const { data: insertedFoods, error: foodError } = await supabase
          .from('food_entries')
          .insert((foodAnalysis.foods ?? []).map((food: any) => ({
            user_id: userId,
            meal_type: food.mealType || 'snack',
            food_name: food.food,
            calories: food.calories,
            protein_grams: String(food.protein ?? 0),
            carbs_grams: String(food.carbs ?? 0),
            fat_grams: String(food.fats ?? 0),
            serving_size: food.servingSize ?? null,
            ai_confidence: String(food.confidence ?? 0),
            source: 'voice',
          })))
          .select('*');
        if (foodError) throw foodError;
        foodEntries = (insertedFoods ?? []).map(toCamelFoodEntry);
      }
    }
    return { entry: toCamelVoiceEntry(inserted), analysis, foodEntries, foodAnalysis };
  },

  deleteVoiceEntry: async (id: string) => {
    const userId = await getCurrentSupabaseUserId();
    const { error } = await supabase.from('voice_entries').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  /* ── Hedefler ────────────────────────────────────── */
  getGoals: async (): Promise<UserGoal[]> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelGoal);
  },

  createGoal: async (data: GoalCreateData): Promise<UserGoal> => {
    const userId = await getCurrentSupabaseUserId();
    const { data: inserted, error } = await supabase
      .from('user_goals')
      .insert({
        user_id: userId,
        goal_type: data.goalType,
        title: data.title,
        description: data.description ?? null,
        target_value: data.targetValue ?? null,
        current_value: data.currentValue ?? null,
        unit: data.unit ?? null,
        start_date: data.startDate ?? null,
        target_date: data.targetDate ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return toCamelGoal(inserted);
  },

  updateGoal: async (id: string, data: GoalUpdateData): Promise<UserGoal> => {
    const payload = Object.fromEntries(Object.entries({
      title: data.title,
      description: data.description,
      target_value: data.targetValue,
      current_value: data.currentValue,
      status: data.status,
      target_date: data.targetDate,
    }).filter(([, value]) => value !== undefined));
    const { data: updated, error } = await supabase
      .from('user_goals')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return toCamelGoal(updated);
  },

  /* ── Başarımlar ──────────────────────────────────── */
  getAchievements: async (): Promise<Achievement[]> => {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toCamelAchievement);
  },

  getMyAchievements: async (): Promise<UserAchievement[]> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('user_achievements')
      .select('id, user_id, achievement_id, earned_at, created_at, achievement:achievements(*)')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelUserAchievement);
  },

  checkAchievements: async (context: Record<string, unknown>): Promise<UserAchievement[]> => {
    const userId = await getCurrentSupabaseUserId();
    const [allAchievements, earnedAchievements] = await Promise.all([
      healthAPI.getAchievements(),
      healthAPI.getMyAchievements(),
    ]);
    const earnedIds = new Set((earnedAchievements ?? []).map((item) => item.achievementId));
    const newlyEarnedIds: string[] = [];
    for (const achievement of allAchievements ?? []) {
      if (earnedIds.has(achievement.id)) continue;
      const requirement = achievement.requirement as { type?: string; value?: number } | null;
      if (!requirement?.type) continue;
      let shouldAward = false;
      switch (requirement.type) {
        case 'food_count': shouldAward = Number(context.foodCount ?? 0) >= Number(requirement.value ?? 0); break;
        case 'activity_count': shouldAward = Number(context.activityCount ?? 0) >= Number(requirement.value ?? 0); break;
        case 'document_count': shouldAward = Number(context.documentCount ?? 0) >= Number(requirement.value ?? 0); break;
        case 'voice_count': shouldAward = Number(context.voiceCount ?? 0) >= Number(requirement.value ?? 0); break;
        case 'water_goal': shouldAward = Boolean(context.waterGoalReached); break;
        case 'streak': shouldAward = Number(context.currentStreak ?? 0) >= Number(requirement.value ?? 0); break;
        case 'score': shouldAward = Number(context.haloScore ?? 0) >= Number(requirement.value ?? 0); break;
        case 'all_quests': shouldAward = Boolean(context.allQuestsComplete); break;
      }
      if (shouldAward) newlyEarnedIds.push(achievement.id);
    }
    if (newlyEarnedIds.length === 0) return [] as UserAchievement[];
    const { error } = await supabase
      .from('user_achievements')
      .insert(newlyEarnedIds.map((achievementId) => ({ user_id: userId, achievement_id: achievementId })));
    if (error) throw error;
    const updated = await healthAPI.getMyAchievements();
    return updated.filter((item) => newlyEarnedIds.includes(item.achievementId));
  },

  /* ── Streak ──────────────────────────────────────── */
  getStreak: async (): Promise<UserStreak> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return {
        id: '', userId, currentStreak: 0, longestStreak: 0, lastActiveDate: null,
        updatedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
      } as UserStreak;
    }
    const streak = toCamelUserStreak(data);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (streak.lastActiveDate && streak.lastActiveDate !== today && streak.lastActiveDate !== yesterday) {
      const { data: resetData, error: resetError } = await supabase
        .from('user_streaks')
        .update({ current_streak: 0 })
        .eq('id', streak.id)
        .select('*')
        .single();
      if (resetError) throw resetError;
      return toCamelUserStreak(resetData);
    }
    return streak;
  },

  checkInStreak: async (): Promise<UserStreak> => {
    const userId = await getCurrentSupabaseUserId();
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const existing = await healthAPI.getStreak();
    if (existing.id && existing.lastActiveDate === today) return existing;
    if (!existing.id) {
      const { data, error } = await supabase
        .from('user_streaks')
        .insert({ user_id: userId, current_streak: 1, longest_streak: 1, last_active_date: today })
        .select('*')
        .single();
      if (error) throw error;
      return toCamelUserStreak(data);
    }
    const newStreak = existing.lastActiveDate === yesterday ? existing.currentStreak + 1 : 1;
    const newLongest = Math.max(newStreak, existing.longestStreak);
    const { data, error } = await supabase
      .from('user_streaks')
      .update({ current_streak: newStreak, longest_streak: newLongest, last_active_date: today })
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw error;
    return toCamelUserStreak(data);
  },
};
