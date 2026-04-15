/**
 * Myora AI Chat Handler — Vite Middleware
 *
 * Kullanıcının gerçek sağlık verilerine dayanarak kişiselleştirilmiş
 * AI yanıtları üretir. Supabase RLS + OpenAI GPT-4o kullanır.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { createClient } from '@supabase/supabase-js';

// ── Helpers ──────────────────────────────────────────────

function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk: Buffer) => { raw += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(raw)); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function round(v: number | null | undefined, dec = 1): string {
  if (v == null) return '?';
  return Number(v).toFixed(dec);
}

// ── Context Builder ──────────────────────────────────────

async function buildContext(supabase: any, userId: string): Promise<string> {
  const sevenDaysAgo = daysAgo(7);
  const today = new Date().toISOString().slice(0, 10);

  const [
    profileRes,
    healthProfileRes,
    dailyLogRes,
    foodRes,
    activityRes,
    bloodTestRes,
    fastingRes,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, date_of_birth, gender, height_cm, weight_kg, activity_level')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('health_profiles')
      .select('bmi, health_score, bmr, tdee, body_fat_estimate, risk_factors, ai_generated_summary')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('daily_health_logs')
      .select('date, calories_consumed, calories_target, protein_grams, protein_target, carbs_grams, fat_grams, water_ml, water_target, steps, steps_target, sleep_minutes')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgo)
      .order('date', { ascending: false })
      .limit(7),
    supabase
      .from('food_entries')
      .select('food_name, calories, protein_grams, carbs_grams, fat_grams, logged_at, meal_type')
      .eq('user_id', userId)
      .gte('logged_at', sevenDaysAgo)
      .order('logged_at', { ascending: false })
      .limit(50),
    supabase
      .from('activity_entries')
      .select('activity_type, duration_minutes, calories_burned, started_at')
      .eq('user_id', userId)
      .gte('started_at', sevenDaysAgo)
      .order('started_at', { ascending: false })
      .limit(20),
    supabase
      .from('blood_tests')
      .select('test_date, overall_status, ai_summary, blood_test_results(marker_name, value, unit, status, reference_min, reference_max)')
      .eq('user_id', userId)
      .order('test_date', { ascending: false })
      .limit(2),
    supabase
      .from('fasting_logs')
      .select('fasting_plan, started_at, actual_end_at, completed, mood_before, mood_after')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(5),
  ]);

  const parts: string[] = [];
  const gaps: string[] = [];

  // ── Profil ───────────────────────────────────────────
  const bp = profileRes.data;
  if (bp) {
    const profParts: string[] = [];
    if (bp.display_name) profParts.push(`İsim: ${bp.display_name}`);
    if (bp.gender) profParts.push(`Cinsiyet: ${bp.gender}`);
    if (bp.date_of_birth) {
      const age = Math.floor((Date.now() - new Date(bp.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000));
      profParts.push(`Yaş: ${age}`);
    }
    if (bp.height_cm) profParts.push(`Boy: ${bp.height_cm} cm`);
    if (bp.weight_kg) profParts.push(`Kilo: ${bp.weight_kg} kg`);
    if (bp.activity_level) profParts.push(`Aktivite seviyesi: ${bp.activity_level}`);
    if (profParts.length > 0) parts.push(`📋 PROFİL:\n${profParts.join(', ')}`);

    if (!bp.height_cm || !bp.weight_kg) gaps.push('Boy/kilo bilgisi eksik');
    if (!bp.date_of_birth) gaps.push('Doğum tarihi girilmemiş');
  }

  const hp = healthProfileRes.data;
  if (hp) {
    const hpParts: string[] = [];
    if (hp.bmi) hpParts.push(`BMI: ${round(hp.bmi)}`);
    if (hp.health_score != null) hpParts.push(`Sağlık skoru: ${hp.health_score}/100`);
    if (hp.bmr) hpParts.push(`BMR: ${hp.bmr} kcal`);
    if (hp.tdee) hpParts.push(`TDEE (günlük kalori ihtiyacı): ${hp.tdee} kcal`);
    if (hp.body_fat_estimate) hpParts.push(`Yağ oranı: %${round(hp.body_fat_estimate)}`);
    if (hp.risk_factors?.length > 0) {
      hpParts.push(`Risk faktörleri: ${hp.risk_factors.map((r: any) => r.description || r.type || r).join(', ')}`);
    }
    if (hp.ai_generated_summary) hpParts.push(`AI özet: ${hp.ai_generated_summary}`);
    if (hpParts.length > 0) parts.push(`🧬 SAĞLIK PROFİLİ:\n${hpParts.join(', ')}`);
  }

  // ── Su ve Günlük Takip ───────────────────────────────
  const logs: any[] = dailyLogRes.data ?? [];
  const todayLog = logs.find(l => l.date === today);
  const waterParts: string[] = [];

  if (todayLog) {
    const waterNow = todayLog.water_ml ?? 0;
    const waterTarget = todayLog.water_target ?? 2400;
    const waterPct = Math.round((waterNow / waterTarget) * 100);
    const waterRemaining = Math.max(0, waterTarget - waterNow);

    waterParts.push(`BUGÜN su: ${waterNow} mL / hedef ${waterTarget} mL (${waterPct}% tamamlandı)`);
    waterParts.push(waterRemaining > 0
      ? `Kalan: ${waterRemaining} mL daha içilmesi gerekiyor`
      : `Günlük su hedefine ulaşıldı`);
  } else {
    waterParts.push('BUGÜN su kaydı yok (0 mL içilmiş). Varsayılan hedef: 2400 mL');
    gaps.push('Bugün su kaydı girilmemiş');
  }

  if (logs.length > 0) {
    const avgWater = logs.reduce((s: number, l: any) => s + (l.water_ml || 0), 0) / logs.length;
    if (avgWater > 0) waterParts.push(`Son ${logs.length} gün ort. su: ${Math.round(avgWater)} mL/gün`);
  }
  parts.push(`💧 SU TÜKETİMİ:\n${waterParts.join('\n')}`);

  // ── Beslenme ─────────────────────────────────────────
  const foods: any[] = foodRes.data ?? [];
  const nutritionParts: string[] = [];

  if (todayLog) {
    const cal = todayLog.calories_consumed ?? 0;
    const calTarget = todayLog.calories_target ?? 2100;
    const prot = Number(todayLog.protein_grams ?? 0);
    const protTarget = Number(todayLog.protein_target ?? 150);
    const carbs = Number(todayLog.carbs_grams ?? 0);
    const fat = Number(todayLog.fat_grams ?? 0);

    nutritionParts.push(`BUGÜN kalori: ${cal} kcal / hedef ${calTarget} kcal (kalan: ${Math.max(0, calTarget - cal)} kcal)`);
    nutritionParts.push(`BUGÜN protein: ${Math.round(prot)}g / hedef ${Math.round(protTarget)}g, Karb: ${Math.round(carbs)}g, Yağ: ${Math.round(fat)}g`);
  } else {
    nutritionParts.push('BUGÜN kalori kaydı yok (0 kcal). Varsayılan hedef: 2100 kcal');
    gaps.push('Bugün kalori kaydı girilmemiş');
  }

  const todayFoods = foods.filter(f => (f.logged_at || '').slice(0, 10) === today);
  if (todayFoods.length > 0) {
    nutritionParts.push(`Bugün yenenler: ${todayFoods.map((f: any) => `${f.food_name} (${f.calories} kcal, ${Number(f.protein_grams || 0).toFixed(0)}g protein)`).join(', ')}`);
  }

  if (logs.length > 0) {
    const avgCal = logs.reduce((s: number, l: any) => s + (l.calories_consumed || 0), 0) / logs.length;
    const avgProt = logs.reduce((s: number, l: any) => s + (Number(l.protein_grams) || 0), 0) / logs.length;
    nutritionParts.push(`Son ${logs.length} gün ort.: ${Math.round(avgCal)} kcal/gün, ${Math.round(avgProt)}g protein/gün`);
  }
  parts.push(`🍽️ BESLENME:\n${nutritionParts.join('\n')}`);

  // ── Adım ve Uyku ─────────────────────────────────────
  if (todayLog) {
    const steps = todayLog.steps ?? 0;
    const stepsTarget = todayLog.steps_target ?? 10000;
    const sleep = todayLog.sleep_minutes;
    const stepInfo = `BUGÜN adım: ${steps} / hedef ${stepsTarget} (${Math.round((steps / stepsTarget) * 100)}%)`;
    const sleepInfo = sleep ? `BUGÜN uyku: ${Math.round(sleep / 60 * 10) / 10} saat (${sleep} dk)` : 'Bugün uyku kaydı yok';
    parts.push(`🏃 ADIM & UYKU:\n${stepInfo}\n${sleepInfo}`);
  }

  // ── Aktivite ─────────────────────────────────────────
  const activities: any[] = activityRes.data ?? [];
  if (activities.length > 0) {
    const totalMin = activities.reduce((s: number, a: any) => s + (a.duration_minutes || 0), 0);
    const totalCal = activities.reduce((s: number, a: any) => s + (a.calories_burned || 0), 0);
    const types = [...new Set(activities.map((a: any) => a.activity_type).filter(Boolean))];
    parts.push(`🏋️ AKTİVİTE (son 7 gün):\n${activities.length} antrenman, toplam ${totalMin} dk, ${totalCal} kcal yakıldı. Tipler: ${types.join(', ')}`);
  } else {
    gaps.push('Son 7 günde aktivite kaydı yok');
  }

  // ── Kan Tahlili ───────────────────────────────────────
  const tests: any[] = bloodTestRes.data ?? [];
  if (tests.length > 0) {
    const latest = tests[0];
    const results: any[] = latest.blood_test_results ?? [];
    const abnormal = results.filter((r: any) => r.status && r.status !== 'normal');
    const bloodParts: string[] = [];
    bloodParts.push(`Son kan tahlili: ${latest.test_date ? new Date(latest.test_date).toLocaleDateString('tr-TR') : '?'}`);
    if (latest.overall_status) bloodParts.push(`Genel durum: ${latest.overall_status}`);
    if (abnormal.length > 0) {
      bloodParts.push(`Dikkat gerektiren belirteçler: ${abnormal.slice(0, 6).map((r: any) => `${r.marker_name}: ${r.value}${r.unit} (${r.status})`).join(', ')}`);
    } else if (results.length > 0) {
      bloodParts.push('Tüm belirteçler normal');
    }
    if (latest.ai_summary) bloodParts.push(`AI özet: ${latest.ai_summary}`);
    parts.push(`🩸 KAN TAHLİLİ:\n${bloodParts.join('\n')}`);
  } else {
    gaps.push('Kan tahlili kaydı yok');
  }

  // ── Oruç ─────────────────────────────────────────────
  const fastings: any[] = fastingRes.data ?? [];
  if (fastings.length > 0) {
    const active = fastings.find((f: any) => !f.actual_end_at && !f.completed);
    const completed = fastings.filter((f: any) => f.completed).length;
    const plans = [...new Set(fastings.map((f: any) => f.fasting_plan))];
    const fastParts = [
      `Planlar: ${plans.join(', ')}`,
      `${fastings.length} orucun ${completed}'i tamamlandı`,
    ];
    if (active) fastParts.push(`Şu anda aktif oruç: ${active.fasting_plan} (başlangıç: ${new Date(active.started_at).toLocaleString('tr-TR')})`);
    parts.push(`⏱️ ARALIKLI ORUÇ:\n${fastParts.join('\n')}`);
  }

  // ── Eksik Veri ───────────────────────────────────────
  if (gaps.length > 0) {
    parts.push(`⚠️ EKSİK VERİ:\n${gaps.map(g => `- ${g}`).join('\n')}`);
  }

  return parts.join('\n\n');
}

// ── System Prompt ────────────────────────────────────────

function buildSystemPrompt(userContext: string): string {
  return `Sen Myora AI sağlık danışmanısın. Bilimsel ve kişiselleştirilmiş sağlık önerileri sunuyorsun.

KURALLAR:
1. KİŞİSELLEŞTİR: Kullanıcının gerçek verilerine (su miktarı, kalori, adım, kan tahlili vb.) dayanarak yanıt ver. Genel cevaplar verme.
2. RAKAMSAL OL: "Bugün X mL su içmişsin, Y mL daha içmen gerekiyor" gibi somut rakamlar ver.
3. EMPATİK OL: Sıcak, destekleyici ama profesyonel bir dil kullan. Türkçe yanıt ver.
4. SINIRLARINI BİL: Kesin tanı koyma, gerektiğinde doktora yönlendir.
5. EKSİK VERİ: Veri yoksa nazikçe belirt ve kayıt girmesini öner.
6. KISA & PRATIK: Somut, uygulanabilir öneriler ver. Gereksiz uzatma.

KULLANICI VERİLERİ:
${userContext || 'Henüz veri girilmemiş. Kullanıcıya kayıt girmesini önerilebilir.'}

Yanıtını şu JSON formatında ver (başka hiçbir şey yazma):
{
  "content": "Markdown formatında yanıt metni",
  "suggestedFollowUps": ["Takip sorusu 1", "Takip sorusu 2", "Takip sorusu 3"]
}`;
}

// ── Main Handler ─────────────────────────────────────────

export async function handleChatRequest(req: IncomingMessage, res: ServerResponse) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return json(res, 500, { error: 'Supabase yapılandırması eksik' });
  }
  if (!openAiKey) {
    return json(res, 500, { error: 'OpenAI API anahtarı ayarlı değil. Lütfen OPENAI_API_KEY secret\'ını ekleyin.' });
  }

  const body = await parseBody(req);
  const message: string = body?.message ?? '';
  const history: Array<{ role: string; content: string }> = Array.isArray(body?.history) ? body.history : [];

  if (!message.trim()) {
    return json(res, 400, { error: 'Mesaj boş olamaz' });
  }

  const authHeader = req.headers['authorization'] ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  // Kullanıcıyı doğrula
  const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  let userId: string | null = null;
  if (token) {
    const { data: { user } } = await supabaseAdmin.auth.getUser();
    userId = user?.id ?? null;
  }

  // Kullanıcı verisini çek
  let userContext = '';
  if (userId) {
    try {
      userContext = await buildContext(supabaseAdmin, userId);
    } catch (err) {
      console.error('[chatHandler] Context build error:', err);
    }
  }

  const systemPrompt = buildSystemPrompt(userContext);

  // OpenAI çağrısı
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-8),
    { role: 'user', content: message },
  ];

  let result: { content: string; suggestedFollowUps: string[] };

  try {
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 1500,
        messages,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('[chatHandler] OpenAI error:', aiRes.status, errText);
      return json(res, 200, {
        content: 'Şu anda yanıt üretemiyorum. Lütfen kısa süre sonra tekrar deneyin.',
        citations: [],
        suggestedFollowUps: ['Su ihtiyacım nedir?', 'Bugünkü kalori durumum?', 'Aktivite önerisi?'],
        contextUsed: [],
      });
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content;
    const parsed = raw ? JSON.parse(raw) : null;

    result = {
      content: parsed?.content ?? 'Yanıt oluşturulamadı.',
      suggestedFollowUps: Array.isArray(parsed?.suggestedFollowUps) ? parsed.suggestedFollowUps : [],
    };
  } catch (err) {
    console.error('[chatHandler] Error:', err);
    return json(res, 200, {
      content: `Teknik hata oluştu: ${err instanceof Error ? err.message : String(err)}`,
      citations: [],
      suggestedFollowUps: [],
      contextUsed: [],
    });
  }

  const contextUsed: string[] = [];
  if (userId && userContext) {
    if (userContext.includes('PROFİL')) contextUsed.push('profile');
    if (userContext.includes('BESLENME')) contextUsed.push('nutrition');
    if (userContext.includes('SU TÜKETİMİ')) contextUsed.push('water');
    if (userContext.includes('AKTİVİTE')) contextUsed.push('activity');
    if (userContext.includes('KAN TAHLİLİ')) contextUsed.push('bloodTests');
    if (userContext.includes('ARALIKLI ORUÇ')) contextUsed.push('fasting');
  }

  return json(res, 200, {
    content: result.content,
    citations: [],
    suggestedFollowUps: result.suggestedFollowUps,
    contextUsed,
  });
}
