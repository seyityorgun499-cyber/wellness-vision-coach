/**
 * Personalized Context Builder
 *
 * Kullanıcının tüm sağlık verilerini paralel olarak çeker ve
 * LLM prompt'una uygun özet blokları oluşturur.
 *
 * Kural: Ham veri dump etme — her blok kısa, yapısal özet olmalı.
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

// ── Types ──────────────────────────────────────────────

export interface UserContext {
  profile: string | null;
  nutrition: string | null;
  activity: string | null;
  wearables: string | null;
  bloodTests: string | null;
  fasting: string | null;
  voiceMood: string | null;
  documents: string | null;
  gaps: string[];
}

// ── Helpers ────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function round(v: number | null | undefined, decimals = 1): string {
  if (v == null) return '?';
  return Number(v).toFixed(decimals);
}

async function safeQuery(
  label: string,
  query: PromiseLike<{ data: any; error: { message?: string } | null }>,
): Promise<{ data: any; error: { message?: string } | null }> {
  const result = await query;
  if (result.error) {
    console.error(`Context query failed (${label}):`, result.error.message ?? result.error);
    return { data: null, error: result.error };
  }
  return { data: result.data ?? null, error: null };
}

// ── Main Builder ───────────────────────────────────────

export async function buildUserContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserContext> {
  const gaps: string[] = [];
  const sevenDaysAgo = daysAgo(7);

  // Paralel veri çekme
  const [
    baseProfileRes,
    profileRes,
    foodRes,
    dailyLogRes,
    activityRes,
    bloodTestRes,
    wearableRes,
    fastingRes,
    voiceRes,
    docRes,
  ] = await Promise.all([
    safeQuery(
      'profiles',
      supabase
        .from('profiles')
        .select('display_name, date_of_birth, gender, height_cm, weight_kg, activity_level')
        .eq('id', userId)
        .maybeSingle(),
    ),
    safeQuery(
      'health_profiles',
      supabase
        .from('health_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
    ),
    safeQuery(
      'food_entries',
      supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', sevenDaysAgo)
        .order('logged_at', { ascending: false })
        .limit(50),
    ),
    safeQuery(
      'daily_health_logs',
      supabase
        .from('daily_health_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', sevenDaysAgo)
        .order('date', { ascending: false })
        .limit(7),
    ),
    safeQuery(
      'activity_entries',
      supabase
        .from('activity_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('started_at', sevenDaysAgo)
        .order('started_at', { ascending: false })
        .limit(20),
    ),
    safeQuery(
      'blood_tests',
      supabase
        .from('blood_tests')
        .select('*, blood_test_results(*)')
        .eq('user_id', userId)
        .order('test_date', { ascending: false })
        .limit(2),
    ),
    safeQuery(
      'wearable_data',
      supabase
        .from('wearable_data')
        .select('*')
        .eq('user_id', userId)
        .gte('recorded_at', sevenDaysAgo)
        .order('recorded_at', { ascending: false })
        .limit(100),
    ),
    safeQuery(
      'fasting_logs',
      supabase
        .from('fasting_logs')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(10),
    ),
    safeQuery(
      'voice_entries',
      supabase
        .from('voice_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
    ),
    safeQuery(
      'health_documents',
      supabase
        .from('health_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3),
    ),
  ]);

  // ── Profile Summary ──────────────────────────────────
  let profile: string | null = null;
  const profileParts: string[] = [];

  // Temel profil bilgileri (profiles tablosu)
  const bp = baseProfileRes.data;
  if (bp) {
    if (bp.display_name) profileParts.push(`İsim: ${bp.display_name}`);
    if (bp.gender) profileParts.push(`Cinsiyet: ${bp.gender}`);
    if (bp.date_of_birth) {
      const age = Math.floor((Date.now() - new Date(bp.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      profileParts.push(`Yaş: ${age}`);
    }
    if (bp.height_cm) profileParts.push(`Boy: ${bp.height_cm} cm`);
    if (bp.weight_kg) profileParts.push(`Kilo: ${bp.weight_kg} kg`);
    if (bp.activity_level) profileParts.push(`Aktivite seviyesi: ${bp.activity_level}`);
  }
  if (!bp?.height_cm || !bp?.weight_kg) gaps.push('Boy ve kilo bilgisi girilmemiş — kişisel kalori/protein hedefi hesaplanamıyor');
  if (!bp?.date_of_birth) gaps.push('Doğum tarihi girilmemiş');
  if (!bp?.gender) gaps.push('Cinsiyet bilgisi girilmemiş');

  // AI hesaplı sağlık profili (health_profiles tablosu)
  if (profileRes.data) {
    const p = profileRes.data;
    if (p.bmi) profileParts.push(`BMI: ${round(p.bmi)}`);
    if (p.health_score != null) profileParts.push(`Sağlık skoru: ${p.health_score}/100`);
    if (p.bmr) profileParts.push(`BMR: ${p.bmr} kcal`);
    if (p.tdee) profileParts.push(`TDEE: ${p.tdee} kcal`);
    if (p.body_fat_estimate) profileParts.push(`Tahmini yağ oranı: %${round(p.body_fat_estimate)}`);
    if (p.risk_factors && Array.isArray(p.risk_factors) && p.risk_factors.length > 0) {
      profileParts.push(`Risk faktörleri: ${p.risk_factors.map((r: any) => r.description || r.type || r).join(', ')}`);
    }
    if (p.supplement_recommendations && Array.isArray(p.supplement_recommendations)) {
      const supps = p.supplement_recommendations.map((s: any) => s.name || s).join(', ');
      if (supps) profileParts.push(`Önerilen takviyeler: ${supps}`);
    }
    if (p.ai_generated_summary) profileParts.push(`AI özet: ${p.ai_generated_summary}`);
  }

  profile = profileParts.length > 0 ? profileParts.join('. ') : null;
  if (!profile) gaps.push('Sağlık profili henüz oluşturulmamış — profil bilgilerini doldurun');

  // ── Nutrition Summary ────────────────────────────────
  let nutrition: string | null = null;
  const foods = foodRes.data ?? [];
  const dailyLogs = dailyLogRes.data ?? [];

  if (foods.length > 0 || dailyLogs.length > 0) {
    const parts: string[] = [];

    if (dailyLogs.length > 0) {
      const avgCal = dailyLogs.reduce((s: number, l: any) => s + (l.calories_consumed || 0), 0) / dailyLogs.length;
      const avgProtein = dailyLogs.reduce((s: number, l: any) => s + (Number(l.protein_grams) || 0), 0) / dailyLogs.length;
      const avgCarbs = dailyLogs.reduce((s: number, l: any) => s + (Number(l.carbs_grams) || 0), 0) / dailyLogs.length;
      const avgFat = dailyLogs.reduce((s: number, l: any) => s + (Number(l.fat_grams) || 0), 0) / dailyLogs.length;
      const avgWater = dailyLogs.reduce((s: number, l: any) => s + (l.water_ml || 0), 0) / dailyLogs.length;

      parts.push(`Son ${dailyLogs.length} gün ort. kalori: ${Math.round(avgCal)} kcal`);
      if (avgProtein > 0) parts.push(`Ort. protein: ${Math.round(avgProtein)}g, karb: ${Math.round(avgCarbs)}g, yağ: ${Math.round(avgFat)}g`);
      if (avgWater > 0) parts.push(`Ort. su tüketimi: ${Math.round(avgWater)} mL`);
    }

    if (foods.length > 0) {
      const sources = new Set(foods.map((f: any) => f.source).filter(Boolean));
      parts.push(`Son 7 günde ${foods.length} yemek kaydı (kaynak: ${[...sources].join(', ') || 'manual'})`);

      // Bugünün yemek detayları ve makro toplamı
      const today = new Date().toISOString().slice(0, 10);
      const todayFoods = foods.filter((f: any) => (f.logged_at || '').slice(0, 10) === today);
      if (todayFoods.length > 0) {
        const todayCal = todayFoods.reduce((s: number, f: any) => s + (f.calories || 0), 0);
        const todayProtein = todayFoods.reduce((s: number, f: any) => s + (Number(f.protein_grams) || 0), 0);
        const todayCarbs = todayFoods.reduce((s: number, f: any) => s + (Number(f.carbs_grams) || 0), 0);
        const todayFat = todayFoods.reduce((s: number, f: any) => s + (Number(f.fat_grams) || 0), 0);
        parts.push(`BUGÜN toplam: ${todayCal} kcal, ${Math.round(todayProtein)}g protein, ${Math.round(todayCarbs)}g karb, ${Math.round(todayFat)}g yağ`);
        parts.push(`Bugün yenenler: ${todayFoods.map((f: any) => `${f.food_name} (${f.calories} kcal, ${Number(f.protein_grams) || 0}g protein)`).join(', ')}`);
      } else {
        parts.push('BUGÜN henüz besin kaydı girilmemiş: 0 kcal, 0g protein, 0g karb, 0g yağ alınmış');
      }

      // Son 7 gün toplam makrolar
      const totalCal = foods.reduce((s: number, f: any) => s + (f.calories || 0), 0);
      const totalProtein = foods.reduce((s: number, f: any) => s + (Number(f.protein_grams) || 0), 0);
      if (foods.length > 0) {
        parts.push(`7 gün toplam: ${totalCal} kcal, ${Math.round(totalProtein)}g protein (${foods.length} öğün)`);
      }

      // En sık yenen yemekler
      const nameCount: Record<string, number> = {};
      for (const f of foods) {
        const name = (f.food_name || '').toLowerCase();
        if (name) nameCount[name] = (nameCount[name] || 0) + 1;
      }
      const top3 = Object.entries(nameCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name);
      if (top3.length > 0) parts.push(`Sık tüketilen: ${top3.join(', ')}`);
    }

    nutrition = parts.join('. ');
  } else {
    // Hiç food entry ve daily log yoksa da bugünün durumunu belirt
    nutrition = 'BUGÜN henüz besin kaydı girilmemiş: 0 kcal, 0g protein, 0g karb, 0g yağ alınmış. Son 7 günde de beslenme kaydı yok.';
    gaps.push('Son 7 günde beslenme kaydı yok — kullanıcıya yemek kaydetmesini öner');
  }

  // ── Activity Summary ─────────────────────────────────
  let activity: string | null = null;
  const activities = activityRes.data ?? [];
  if (activities.length > 0) {
    const totalDuration = activities.reduce((s: number, a: any) => s + (a.duration_minutes || 0), 0);
    const totalCalBurned = activities.reduce((s: number, a: any) => s + (a.calories_burned || 0), 0);
    const types = [...new Set(activities.map((a: any) => a.activity_type).filter(Boolean))];
    activity = `Son 7 günde ${activities.length} aktivite, toplam ${totalDuration} dakika, ~${totalCalBurned} kcal yakıldı. Tipler: ${types.join(', ')}`;
  }
  if (!activity) gaps.push('Son 7 günde aktivite kaydı yok');

  // ── Wearable Summary ─────────────────────────────────
  let wearables: string | null = null;
  const wData = wearableRes.data ?? [];
  if (wData.length > 0) {
    const byMetric: Record<string, number[]> = {};
    for (const d of wData) {
      const key = d.metric_type;
      if (!byMetric[key]) byMetric[key] = [];
      byMetric[key].push(Number(d.value) || 0);
    }

    const parts: string[] = [];
    for (const [metric, values] of Object.entries(byMetric)) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const labels: Record<string, string> = {
        heart_rate: 'Ort. nabız',
        steps: 'Ort. günlük adım',
        sleep: 'Ort. uyku (dk)',
        spo2: 'Ort. SpO2',
        stress: 'Ort. stres skoru',
        hrv: 'Ort. HRV',
      };
      parts.push(`${labels[metric] || metric}: ${Math.round(avg)}`);
    }
    wearables = parts.join('. ');
  }
  if (!wearables) gaps.push('Giyilebilir cihaz verisi yok');

  // ── Blood Test Summary ───────────────────────────────
  let bloodTests: string | null = null;
  const tests = bloodTestRes.data ?? [];
  if (tests.length > 0) {
    const latest = tests[0];
    const results = latest.blood_test_results ?? [];
    const abnormal = results.filter((r: any) => r.status && r.status !== 'normal');

    const parts: string[] = [];
    parts.push(`Son kan tahlili: ${latest.test_date ? new Date(latest.test_date).toLocaleDateString('tr-TR') : '?'}`);
    if (latest.overall_status) parts.push(`Genel durum: ${latest.overall_status}`);

    if (abnormal.length > 0) {
      const markers = abnormal.slice(0, 6).map((r: any) =>
        `${r.marker_name}: ${r.value} ${r.unit} (${r.status})${r.ai_interpretation ? ' — ' + r.ai_interpretation : ''}`
      );
      parts.push(`Dikkat gereken belirteçler: ${markers.join('; ')}`);
    } else if (results.length > 0) {
      parts.push('Tüm belirteçler normal aralıkta');
    }

    if (latest.ai_summary) parts.push(`AI özet: ${latest.ai_summary}`);
    bloodTests = parts.join('. ');
  }
  if (!bloodTests) gaps.push('Kan tahlili kaydı yok');

  // ── Fasting Summary ──────────────────────────────────
  let fasting: string | null = null;
  const fastingLogs = fastingRes.data ?? [];
  if (fastingLogs.length > 0) {
    const completed = fastingLogs.filter((f: any) => f.completed);
    const active = fastingLogs.find((f: any) => !f.actual_end_at && !f.completed);
    const plans = [...new Set(fastingLogs.map((f: any) => f.fasting_plan))];

    const parts: string[] = [];
    parts.push(`Kullanılan planlar: ${plans.join(', ')}`);
    parts.push(`Son ${fastingLogs.length} oruçta ${completed.length} tamamlandı`);
    if (active) {
      parts.push(`Şu anda aktif oruç var (${active.fasting_plan}, başlangıç: ${new Date(active.started_at).toLocaleString('tr-TR')})`);
    }

    const moods = fastingLogs.filter((f: any) => f.mood_before != null && f.mood_after != null);
    if (moods.length > 0) {
      const avgBefore = moods.reduce((s: number, f: any) => s + f.mood_before, 0) / moods.length;
      const avgAfter = moods.reduce((s: number, f: any) => s + f.mood_after, 0) / moods.length;
      parts.push(`Ort. ruh hali: oruç öncesi ${round(avgBefore)}/5, sonrası ${round(avgAfter)}/5`);
    }
    fasting = parts.join('. ');
  }
  if (!fasting) gaps.push('Aralıklı oruç kaydı yok');

  // ── Voice / Mood Summary ─────────────────────────────
  let voiceMood: string | null = null;
  const voices = voiceRes.data ?? [];
  if (voices.length > 0) {
    const sentiments = voices.map((v: any) => v.sentiment).filter(Boolean);
    const moods = voices.map((v: any) => v.mood).filter(Boolean);
    const keywords = voices.flatMap((v: any) => v.keywords ?? []);
    const uniqueKeywords = [...new Set(keywords)].slice(0, 8);

    const parts: string[] = [];
    parts.push(`Son ${voices.length} sesli giriş`);
    if (sentiments.length > 0) {
      const counts: Record<string, number> = {};
      sentiments.forEach((s: string) => { counts[s] = (counts[s] || 0) + 1; });
      const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      parts.push(`Baskın duygu durumu: ${dominant[0]}`);
    }
    if (moods.length > 0) parts.push(`Son ruh halleri: ${moods.slice(0, 3).join(', ')}`);
    if (uniqueKeywords.length > 0) parts.push(`Anahtar kelimeler: ${uniqueKeywords.join(', ')}`);
    if (voices[0].ai_summary) parts.push(`Son kayıt özeti: ${voices[0].ai_summary}`);
    voiceMood = parts.join('. ');
  }
  if (!voiceMood) gaps.push('Sesli günlük kaydı yok');

  // ── Document Summary ─────────────────────────────────
  let documents: string | null = null;
  const docs = docRes.data ?? [];
  if (docs.length > 0) {
    const parts: string[] = [];
    parts.push(`${docs.length} yüklü belge`);
    for (const doc of docs.slice(0, 2)) {
      let entry = `"${doc.title}" (${doc.document_type})`;
      if (doc.ai_analysis) entry += ` — ${String(doc.ai_analysis).slice(0, 120)}`;
      parts.push(entry);
    }
    documents = parts.join('. ');
  }
  if (!documents) gaps.push('Yüklü sağlık belgesi yok');

  return {
    profile,
    nutrition,
    activity,
    wearables,
    bloodTests,
    fasting,
    voiceMood,
    documents,
    gaps,
  };
}
