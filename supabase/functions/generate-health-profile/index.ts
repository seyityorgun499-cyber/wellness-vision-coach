import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map((s: string) => s.trim()).filter(Boolean);

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin');
  const allowed = !origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin);
  return {
    'Access-Control-Allow-Origin': allowed && origin ? origin : (ALLOWED_ORIGINS[0] || '*'),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

type HealthProfileResult = {
  bmi: number | null;
  bmr: number | null;
  tdee: number | null;
  bodyFatEstimate: number | null;
  healthScore: number | null;
  riskFactors: { type: string; level: string; description: string }[];
  strengths: string[];
  improvementAreas: string[];
  nutritionPlan: {
    dailyCalories: number;
    macroSplit: Record<string, number>;
    mealSuggestions: string[];
  } | null;
  exercisePlan: {
    weeklyGoal: string;
    suggestedActivities: string[];
  } | null;
  sleepRecommendation: Record<string, unknown> | null;
  supplementRecommendations: {
    name: string;
    reason: string;
    dosage: string;
    priority: string;
  }[];
  aiSummary: string | null;
};

function buildFallbackProfile(body: Record<string, any>): HealthProfileResult {
  const userData = body?.userData;
  const heightCm = Number(userData?.heightCm ?? 0);
  const weightKg = Number(userData?.weightKg ?? 0);
  const age = userData?.dateOfBirth ? Math.floor((Date.now() - new Date(userData.dateOfBirth).getTime()) / 31557600000) : 30;
  const isMale = userData?.gender !== 'female';
  const bmi = heightCm > 0 && weightKg > 0 ? weightKg / ((heightCm / 100) ** 2) : null;
  const bmr = heightCm > 0 && weightKg > 0 ? Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + (isMale ? 5 : -161)) : null;
  const activityMultiplier = ({ sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 } as Record<string, number>)[userData?.activityLevel ?? ''] ?? 1.4;
  const tdee = bmr ? Math.round(bmr * activityMultiplier) : null;

  // Calculate a more realistic fallback score based on available data
  let score = 50;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (bmi && bmi >= 18.5 && bmi <= 24.9) { score += 10; strengths.push('Normal BMI'); }
  else if (bmi) { improvements.push('BMI normal aralığa getirilmeli'); }

  const todayFood = body?.todayFood as any[] ?? [];
  if (todayFood.length >= 3) { score += 10; strengths.push('Düzenli öğün takibi'); }
  else if (todayFood.length > 0) { score += 5; }
  else { improvements.push('Günlük öğün takibi yapılmalı'); }

  const waterMl = body?.todayWater?.currentMl ?? 0;
  const waterTarget = body?.todayWater?.targetMl ?? 2400;
  if (waterMl >= waterTarget) { score += 10; strengths.push('Yeterli su tüketimi'); }
  else if (waterMl > 0) { score += 5; improvements.push('Su tüketimi artırılmalı'); }
  else { improvements.push('Günlük su takibi yapılmalı'); }

  const activities = body?.recentActivities as any[] ?? [];
  if (activities.length >= 5) { score += 10; strengths.push('Düzenli fiziksel aktivite'); }
  else if (activities.length > 0) { score += 5; improvements.push('Fiziksel aktivite artırılmalı'); }
  else { improvements.push('Egzersiz rutini oluşturulmalı'); }

  const sleepMin = body?.todaySleep?.minutes;
  if (sleepMin && sleepMin >= 420) { score += 5; strengths.push('Yeterli uyku süresi'); }
  else if (sleepMin) { improvements.push('Uyku süresi artırılmalı'); }

  return {
    bmi: bmi ? Number(bmi.toFixed(1)) : null,
    bmr,
    tdee,
    bodyFatEstimate: null,
    healthScore: Math.min(score, 100),
    riskFactors: [],
    strengths: strengths.length > 0 ? strengths : ['Sağlık takibine başladınız'],
    improvementAreas: improvements.length > 0 ? improvements : ['Daha fazla veri ile analiz zenginleşecek'],
    nutritionPlan: tdee ? {
      dailyCalories: tdee,
      macroSplit: { protein: 30, carbs: 40, fat: 30 },
      mealSuggestions: ['Protein ağırlıklı kahvaltı', 'Lif içeriği yüksek öğle öğünü', 'Dengeli akşam yemeği'],
    } : null,
    exercisePlan: {
      weeklyGoal: 'Haftada en az 150 dakika orta yoğunluklu aktivite',
      suggestedActivities: ['Yürüyüş', 'Kuvvet antrenmanı', 'Esneme'],
    },
    sleepRecommendation: {
      targetHours: 8,
      advice: 'Her gün benzer saatte uyuyup uyanmayı hedefleyin.',
    },
    supplementRecommendations: [],
    aiSummary: 'Mevcut verilerinize göre sağlık profili oluşturuldu. Daha fazla veri girdikçe profil daha doğru hale gelecek.',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    // ── Auth: verify user ──────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    const body = await req.json().catch(() => ({})) as Record<string, any>;

    if (!openAiKey) {
      console.warn('[generate-health-profile] OPENAI_API_KEY not set — returning fallback profile');
      return new Response(JSON.stringify(buildFallbackProfile(body)), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Build a rich prompt with all available health data
    const sections: string[] = [];

    // User profile
    if (body.userData) {
      sections.push(`## Kullanıcı Profili\n${JSON.stringify(body.userData, null, 2)}`);
    }

    // Today's food entries
    if (body.todayFood?.length > 0) {
      const totalCal = body.todayFood.reduce((s: number, f: any) => s + (Number(f.calories) || 0), 0);
      const totalProt = body.todayFood.reduce((s: number, f: any) => s + (Number(f.protein) || 0), 0);
      sections.push(`## Bugünkü Beslenme (${body.todayFood.length} öğün, toplam ${totalCal} kcal, ${totalProt}g protein)\n${JSON.stringify(body.todayFood, null, 2)}`);
    } else {
      sections.push('## Bugünkü Beslenme\nHenüz öğün kaydedilmemiş.');
    }

    // Water intake
    if (body.todayWater) {
      sections.push(`## Su Tüketimi\nBugün: ${body.todayWater.currentMl}ml / Hedef: ${body.todayWater.targetMl}ml`);
    }

    // Sleep
    if (body.todaySleep?.minutes) {
      const hrs = Math.floor(body.todaySleep.minutes / 60);
      const mins = body.todaySleep.minutes % 60;
      sections.push(`## Uyku\nBugün: ${hrs} saat ${mins} dakika / Hedef: ${Math.floor((body.todaySleep.target || 480) / 60)} saat`);
    }

    // Recent activities
    if (body.recentActivities?.length > 0) {
      sections.push(`## Son Aktiviteler (${body.recentActivities.length} kayıt)\n${JSON.stringify(body.recentActivities, null, 2)}`);
    } else {
      sections.push('## Aktiviteler\nHenüz aktivite kaydedilmemiş.');
    }

    // Blood tests
    if (body.bloodTests?.length > 0) {
      sections.push(`## Kan Tahlili Sonuçları (${body.bloodTests.length} test)\n${JSON.stringify(body.bloodTests, null, 2)}`);
    }

    // Supplements
    if (body.supplements?.length > 0) {
      sections.push(`## Kullanılan Takviyeler\n${JSON.stringify(body.supplements, null, 2)}`);
    }

    const fullPrompt = sections.join('\n\n');

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        max_tokens: 3000,
        messages: [
          {
            role: 'system',
            content: `Sen kanıta dayalı öneriler üreten bir AI sağlık danışmanısın. Kullanıcının tüm sağlık verilerini (beslenme, su, uyku, aktivite, kan tahlili, takviyeler) analiz ederek kapsamlı bir sağlık profili oluştur.

Sadece JSON döndür. JSON alanları:
- bmi (number): Vücut kitle indeksi
- bmr (number): Bazal metabolizma hızı (kcal)
- tdee (number): Toplam günlük enerji harcaması (kcal)
- bodyFatEstimate (number|null): Tahmini vücut yağ oranı
- healthScore (number 0-100): Tüm verilere dayalı genel sağlık skoru
- riskFactors (array): [{type, level, description}]
- strengths (string array): Güçlü yanlar
- improvementAreas (string array): Gelişim alanları
- nutritionPlan: {dailyCalories, macroSplit: {protein, carbs, fat}, mealSuggestions}
- exercisePlan: {weeklyGoal, suggestedActivities}
- sleepRecommendation: {targetHours, advice}
- supplementRecommendations: [{name, reason, dosage, priority}]
- aiSummary (string): Genel değerlendirme özeti

healthScore hesaplarken bugünkü verileri (beslenme, su, aktivite, uyku) ve genel profili (BMI, kan tahlili, düzenlilik) birlikte değerlendir. Türkçe yaz.`,
          },
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
      }),
    });

    if (!openAiResponse.ok) {
      const fallback = buildFallbackProfile(body);
      return new Response(JSON.stringify(fallback), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const json = await openAiResponse.json();
    const content = json?.choices?.[0]?.message?.content;
    const parsed = content ? JSON.parse(content) : buildFallbackProfile(body);

    return new Response(JSON.stringify(parsed), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});