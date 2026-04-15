/**
 * Myora RAG Chatbot — Edge Function
 *
 * Tam pipeline:
 * 1. Auth → kullanıcı doğrulama
 * 2. Safety → risk intent kontrolü
 * 3. Topic → konu sınıflandırma
 * 4. Context → kişisel sağlık verisi özeti
 * 5. Retrieval → bilimsel kaynak semantik arama
 * 6. Prompt → tüm bağlamı birleştirme
 * 7. Generation → GPT-4o JSON yanıt
 * 8. Logging → observability kaydı
 */

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { buildUserContext } from './lib/context.ts';
import { generateQueryEmbedding, retrieveChunks } from './lib/retrieval.ts';
import { classifyTopic } from './lib/topic.ts';
import { checkSafety } from './lib/safety.ts';
import { buildSystemPrompt, buildMessages } from './lib/prompt.ts';

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

type ChatResponse = {
  content: string;
  citations: Array<{ sourceId: string; title: string; excerpt: string }>;
  suggestedFollowUps: string[];
  contextUsed?: string[];
};

function fallbackResponse(message: string): ChatResponse {
  return {
    content: 'Şu anda yanıt oluşturamıyorum. Lütfen daha sonra tekrar deneyin veya sorunuzu farklı şekilde ifade edin.',
    citations: [],
    suggestedFollowUps: [
      'Beslenme hakkında bir soru sorabilir misin?',
      'Uyku kalitemi nasıl artırabilirim?',
      'Sağlık profilime göre ne önerirsin?',
    ],
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  const startTime = Date.now();

  try {
    // ── ENV ─────────────────────────────────────────────
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // ── Parse Request ──────────────────────────────────
    const body = await req.json();
    const message = String(body?.message ?? '');
    const history: Array<{ role: string; content: string }> = Array.isArray(body?.history) ? body.history : [];
    const existingTopic = body?.topic ? String(body.topic) : null;
    const conversationId = body?.conversationId ? String(body.conversationId) : null;

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // ── Auth: resolve user ─────────────────────────────
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      // Fallback: API key yoksa veya auth yoksa basit yanıt
      if (!openAiKey) {
        console.warn('[generate-chat-response] OPENAI_API_KEY not set — returning fallback response');
        return new Response(JSON.stringify(fallbackResponse(message)), {
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }

    const userId = user?.id ?? null;

    // Service-role client for data queries (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── Step 1: Safety Check ───────────────────────────
    const safety = checkSafety(message);

    // ── Step 2: Topic Classification ───────────────────
    const topic = classifyTopic(message, existingTopic);

    // ── Step 3 & 4: Context + Retrieval (parallel) ─────
    let userContext = null;
    let retrievedChunks: Awaited<ReturnType<typeof retrieveChunks>> = [];

    if (openAiKey) {
      const contextPromise = userId
        ? buildUserContext(supabase, userId)
        : Promise.resolve(null);

      const retrievalPromise = (async () => {
        try {
          const queryEmbedding = await generateQueryEmbedding(openAiKey, message);
          return await retrieveChunks(supabase, queryEmbedding, {
            category: topic !== 'general' ? topic : null,
            verifiedOnly: true,
            matchThreshold: 0.3,
            matchCount: 8,
          });
        } catch (err) {
          console.error('Retrieval failed, continuing without:', err);
          return [];
        }
      })();

      [userContext, retrievedChunks] = await Promise.all([contextPromise, retrievalPromise]);
    }

    // Eğer category filtreli sonuç az gelirse, filtresiz tekrar dene
    if (retrievedChunks.length < 3 && openAiKey) {
      try {
        const queryEmbedding = await generateQueryEmbedding(openAiKey, message);
        const broadChunks = await retrieveChunks(supabase, queryEmbedding, {
          category: null,
          verifiedOnly: true,
          matchThreshold: 0.3,
          matchCount: 8,
        });
        // Mevcut chunk'lara ekle (duplicate'leri çıkar)
        const existingIds = new Set(retrievedChunks.map(c => c.id));
        for (const chunk of broadChunks) {
          if (!existingIds.has(chunk.id)) {
            retrievedChunks.push(chunk);
          }
        }
        // Similarity'ye göre sırala ve en iyi 6'yı al
        retrievedChunks.sort((a, b) => b.similarity - a.similarity);
        retrievedChunks = retrievedChunks.slice(0, 6);
      } catch (_) { /* ignore broad retrieval failure */ }
    }

    // ── Step 5: Prompt Assembly ────────────────────────
    const defaultContext = {
      profile: null,
      nutrition: null,
      activity: null,
      wearables: null,
      bloodTests: null,
      fasting: null,
      voiceMood: null,
      documents: null,
      gaps: ['Kullanıcı henüz giriş yapmamış veya profili oluşturulmamış'],
    };

    const systemPrompt = buildSystemPrompt({
      userContext: userContext ?? defaultContext,
      retrievedChunks,
      topic,
      safety,
      conversationHistory: history,
      currentMessage: message,
    });

    const messages = buildMessages(systemPrompt, history, message);

    // ── Step 6: Generation ─────────────────────────────
    if (!openAiKey) {
      return new Response(JSON.stringify(fallbackResponse(message)), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000,
        messages,
      }),
    });

    let result: ChatResponse;

    if (!aiResponse.ok) {
      console.error('OpenAI API error:', aiResponse.status, await aiResponse.text());
      result = fallbackResponse(message);
    } else {
      const json = await aiResponse.json();
      const raw = json?.choices?.[0]?.message?.content;

      try {
        const parsed = raw ? JSON.parse(raw) : null;
        result = {
          content: parsed?.content || fallbackResponse(message).content,
          citations: Array.isArray(parsed?.citations) ? parsed.citations : [],
          suggestedFollowUps: Array.isArray(parsed?.suggestedFollowUps) ? parsed.suggestedFollowUps : [],
        };
      } catch {
        // JSON parse failed — use raw text as content
        result = {
          content: raw || fallbackResponse(message).content,
          citations: [],
          suggestedFollowUps: [],
        };
      }
    }

    // Safety override: prepend urgent message
    if (safety.isHighRisk && safety.urgentMessage) {
      result.content = `⚠️ **ÖNEMLİ UYARI**\n\n${safety.urgentMessage}\n\n---\n\n${result.content}`;
    }

    // Track which context blocks were actually used
    const contextUsed: string[] = [];
    if (userContext) {
      if (userContext.profile) contextUsed.push('profile');
      if (userContext.nutrition) contextUsed.push('nutrition');
      if (userContext.activity) contextUsed.push('activity');
      if (userContext.wearables) contextUsed.push('wearables');
      if (userContext.bloodTests) contextUsed.push('bloodTests');
      if (userContext.fasting) contextUsed.push('fasting');
      if (userContext.voiceMood) contextUsed.push('voiceMood');
      if (userContext.documents) contextUsed.push('documents');
    }
    result.contextUsed = contextUsed;

    // ── Step 7: Logging (fire-and-forget) ──────────────
    const latencyMs = Date.now() - startTime;
    if (userId) {
      supabase
        .from('rag_query_logs')
        .insert({
          user_id: userId,
          conversation_id: conversationId,
          query: message,
          topic,
          retrieved_chunk_ids: retrievedChunks.map(c => c.id),
          similarity_scores: retrievedChunks.map(c => c.similarity),
          context_blocks_used: contextUsed,
          model: 'gpt-4o',
          latency_ms: latencyMs,
        })
        .then(({ error }: any) => { if (error) console.error('RAG log insert error:', error); });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('RAG pipeline error:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    const result = fallbackResponse('');
    result.content = `Şu anda yanıt oluştururken teknik bir sorun oluştu: ${errMsg}`;
    return new Response(JSON.stringify(result), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});