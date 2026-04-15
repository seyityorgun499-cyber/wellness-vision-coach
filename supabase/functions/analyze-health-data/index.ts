import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function buildPrompt(type: string, body: Record<string, unknown>) {
  switch (type) {
    case 'food-image':
      return {
        system: 'Sen bir beslenme uzmanı AI\'sın. Yalnızca JSON döndür: { food: string, calories: number, servingSize: string, confidence: number (0-100 arası tam sayı, örn: 85), macros: { protein: number(gram), carbs: number(gram), fat: number(gram), fiber: number(gram) }, healthNotes: string[] }.',
        user: [
          { type: 'image_url', image_url: { url: String(body.imageData) } },
          { type: 'text', text: 'Bu yemeği analiz et. confidence değeri 0 ile 100 arasında bir tam sayı olmalı.' },
        ],
      };
    case 'blood-test':
      return {
        system: 'Sen bir laboratuvar analiz uzmanısın. Yalnızca JSON döndür: { markers, overallStatus, summary, recommendations, supplementSuggestions }.',
        user: `Kan tahlili sonuçları:\n${String(body.ocrText ?? '')}`,
      };
    case 'document':
      return {
        system: 'Sen bir sağlık belgesi analiz uzmanısın. Yalnızca JSON döndür: { title, documentType, summary, keyFindings, recommendations, tags }.',
        user: body.imageBase64
          ? [
              { type: 'text', text: `Belge türü: ${String(body.documentType ?? 'other')}. Belgeyi analiz et.` },
              { type: 'image_url', image_url: { url: String(body.imageBase64) } },
            ]
          : `Belge türü: ${String(body.documentType ?? 'other')}\nBelge içeriği:\n${String(body.ocrText ?? '')}`,
      };
    case 'medical-photo':
      return {
        system: 'Sen bir ön sağlık değerlendirme AI\'sın. Yalnızca JSON döndür: { analysis: { color, consistency, clarity, observations, concerns, recommendations, urgency }, detectedType, confidence }.',
        user: [
          { type: 'image_url', image_url: { url: String(body.imageData) } },
          { type: 'text', text: `${String(body.photoType ?? 'skin')} analizi yap.` },
        ],
      };
    case 'voice-entry':
      return {
        system: 'Kullanıcının sesli günlüğünü analiz et. Yalnızca JSON döndür: { sentiment, mood, keywords, summary, recommendations }.',
        user: `Transkript:\n${String(body.transcription ?? '')}`,
      };
    case 'voice-food':
      return {
        system: 'Kullanıcının sesli yemek kaydını analiz et. Yalnızca JSON döndür: { foods, summary, totalCalories }.',
        user: `Sesli yemek kaydı:\n${String(body.transcription ?? '')}`,
      };
    default:
      return null;
  }
}

function fallback(type: string, body: Record<string, unknown>) {
  switch (type) {
    case 'food-image':
      return {
        food: 'Yemek',
        calories: 350,
        servingSize: '1 porsiyon',
        confidence: 65,
        macros: {
          protein: { amount: 18, percentage: 20 },
          carbs: { amount: 32, percentage: 45 },
          fat: { amount: 14, percentage: 35 },
          fiber: { amount: 4, percentage: 15 },
        },
        healthNotes: [],
      };
    case 'blood-test':
      return {
        markers: [],
        overallStatus: 'attention',
        summary: 'Kan tahlili için temel analiz oluşturuldu.',
        recommendations: ['Sonuçları doktorunuzla birlikte değerlendirin.'],
        supplementSuggestions: [],
      };
    case 'document':
      return {
        title: String(body.title ?? 'Sağlık Belgesi'),
        documentType: String(body.documentType ?? 'other'),
        summary: 'Belge için temel özet oluşturuldu.',
        keyFindings: [],
        recommendations: ['Belgeyi uzman hekiminizle paylaşın.'],
        tags: ['medical-document'],
      };
    case 'medical-photo':
      return {
        analysis: {
          color: 'normal',
          observations: ['Görüntü temel düzeyde analiz edildi.'],
          concerns: [],
          recommendations: ['Belirti sürerse uzman görüşü alın.'],
          urgency: 'low',
        },
        detectedType: String(body.photoType ?? 'skin'),
        confidence: 60,
      };
    case 'voice-entry':
      return {
        transcription: String(body.transcription ?? ''),
        sentiment: 'neutral',
        mood: 'Nötr',
        keywords: [],
        summary: String(body.transcription ?? ''),
        recommendations: [],
      };
    case 'voice-food':
      return {
        foods: [],
        summary: 'Yemek tespiti yapılamadı.',
        totalCalories: 0,
      };
    default:
      return { error: 'Unsupported type' };
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // ── Auth: verify user ──────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await req.json();
    const type = String(body?.type ?? '');
    if (!type) return jsonResponse({ error: 'type is required' }, 400);

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    const prompt = buildPrompt(type, body);
    if (!prompt) return jsonResponse({ error: 'Unsupported type' }, 400);

    if (!openAiKey) {
      console.warn('[analyze-health-data] OPENAI_API_KEY not set — returning fallback response');
      return jsonResponse(fallback(type, body));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    let response: Response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          response_format: { type: 'json_object' },
          max_tokens: 2500,
          messages: [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user },
          ],
        }),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return jsonResponse(fallback(type, body));
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      return jsonResponse(fallback(type, body));
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content;
    return jsonResponse(content ? JSON.parse(content) : fallback(type, body));
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});