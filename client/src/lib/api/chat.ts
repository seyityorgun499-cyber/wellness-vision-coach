/**
 * Myora – Chat API (RAG Tabanlı AI Sohbet)
 */

import { getCurrentSupabaseUserId, supabase } from './_common';
import type { ChatConversation, ChatMessage, ConversationCreateData, HealthProfile } from './types';

function toCamelChatConversation(row: any): ChatConversation {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title ?? null,
    topic: row.topic ?? null,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as ChatConversation;
}

function toCamelChatMessage(row: any): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    citations: row.citations ?? null,
    metadata: row.metadata ?? null,
    createdAt: row.created_at,
  } as ChatMessage;
}

function toCamelHealthProfile(row: any): HealthProfile {
  return {
    id: row.id,
    userId: row.user_id,
    bmi: row.bmi != null ? String(row.bmi) : null,
    bmr: row.bmr ?? null,
    tdee: row.tdee ?? null,
    bodyFatEstimate: row.body_fat_estimate != null ? String(row.body_fat_estimate) : null,
    healthScore: row.health_score ?? null,
    riskFactors: row.risk_factors ?? null,
    strengths: row.strengths ?? null,
    improvementAreas: row.improvement_areas ?? null,
    nutritionPlan: row.nutrition_plan ?? null,
    exercisePlan: row.exercise_plan ?? null,
    sleepRecommendation: row.sleep_recommendation ?? null,
    supplementRecommendations: row.supplement_recommendations ?? null,
    aiGeneratedSummary: row.ai_generated_summary ?? null,
    lastCalculatedAt: row.last_calculated_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as HealthProfile;
}

export const chatAPI = {
  /** Kullanıcının sohbet geçmişini listele */
  getConversations: async (): Promise<ChatConversation[]> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelChatConversation);
  },

  /** Yeni sohbet başlat */
  createConversation: async (data?: ConversationCreateData): Promise<ChatConversation> => {
    const userId = await getCurrentSupabaseUserId();
    const { data: inserted, error } = await supabase
      .from('chat_conversations')
      .insert({ user_id: userId, title: data?.title ?? 'Yeni Konuşma', topic: data?.topic ?? 'general' })
      .select('*')
      .single();
    if (error) throw error;
    return toCamelChatConversation(inserted);
  },

  /** Bir sohbetin mesajlarını getir */
  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toCamelChatMessage);
  },

  /** Mesaj gönder ve AI yanıtını al */
  sendMessage: async (conversationId: string, content: string) => {
    const { data: userInserted, error: userError } = await supabase
      .from('chat_messages')
      .insert({ conversation_id: conversationId, role: 'user', content })
      .select('*')
      .single();
    if (userError) throw userError;

    const { data: history, error: historyError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (historyError) throw historyError;

    const { data: conversation, error: conversationError } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    if (conversationError) throw conversationError;

    const { data: response, error: chatError } = await supabase.functions.invoke('generate-chat-response', {
      body: {
        conversationId,
        topic: conversation.topic,
        message: content,
        history: (history ?? []).map((item: any) => ({ role: item.role, content: item.content })),
      },
    });

    if (chatError) {
      const errMsg = typeof chatError === 'object' && 'message' in chatError ? (chatError as any).message : String(chatError);
      throw new Error(`Chat API error: ${errMsg}`);
    }
    if (!response || typeof response !== 'object') {
      throw new Error('Chat API yanıt vermedi');
    }

    const { data: assistantInserted, error: assistantError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: response.content ?? 'Yanıt oluşturulamadı.',
        citations: response.citations ?? [],
        metadata: { suggestedFollowUps: response.suggestedFollowUps ?? [], contextUsed: response.contextUsed ?? [] },
      })
      .select('*')
      .single();
    if (assistantError) throw assistantError;

    await supabase.from('chat_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);

    return {
      userMessage: toCamelChatMessage(userInserted),
      assistantMessage: toCamelChatMessage(assistantInserted),
    };
  },

  /** AI sağlık profilini getir */
  getHealthProfile: async (): Promise<HealthProfile | null> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data ? toCamelHealthProfile(data) : null;
  },

  /** Sağlık profili oluştur / güncelle */
  generateHealthProfile: async (data?: Record<string, unknown>) => {
    const userId = await getCurrentSupabaseUserId();
    const body = (data ?? {}) as Record<string, any>;
    let result: Record<string, any>;

    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('generate-health-profile', { body });
      if (fnError) {
        console.warn('[generateHealthProfile] Edge function failed, using client fallback:', fnError.message);
        throw fnError;
      }
      result = (fnData ?? {}) as Record<string, any>;
    } catch (_edgeErr) {
      // Client-side fallback
      const ud = body.userData as Record<string, any> | undefined;
      const heightCm = Number(ud?.heightCm ?? 0);
      const weightKg = Number(ud?.weightKg ?? 0);
      const age = ud?.dateOfBirth ? Math.floor((Date.now() - new Date(ud.dateOfBirth as string).getTime()) / 31557600000) : 30;
      const isMale = ud?.gender !== 'female';
      const bmi = heightCm > 0 && weightKg > 0 ? weightKg / ((heightCm / 100) ** 2) : null;
      const bmr = heightCm > 0 && weightKg > 0 ? Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + (isMale ? 5 : -161)) : null;
      const actMul: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
      const tdee = bmr ? Math.round(bmr * (actMul[ud?.activityLevel as string] ?? 1.4)) : null;

      let score = 50;
      const strengths: string[] = [];
      const improvements: string[] = [];

      if (bmi && bmi >= 18.5 && bmi <= 24.9) { score += 10; strengths.push('Normal BMI'); }
      else if (bmi) { improvements.push('BMI normal aralığa getirilmeli'); }

      const foods = (body.todayFood as any[]) ?? [];
      if (foods.length >= 3) { score += 10; strengths.push('Düzenli öğün takibi'); }
      else if (foods.length > 0) { score += 5; } else { improvements.push('Günlük öğün takibi yapılmalı'); }

      const waterMl = (body.todayWater as any)?.currentMl ?? 0;
      const waterTarget = (body.todayWater as any)?.targetMl ?? 2400;
      if (waterMl >= waterTarget) { score += 10; strengths.push('Yeterli su tüketimi'); }
      else if (waterMl > 0) { score += 5; improvements.push('Su tüketimi artırılmalı'); }
      else { improvements.push('Günlük su takibi yapılmalı'); }

      const acts = (body.recentActivities as any[]) ?? [];
      if (acts.length >= 5) { score += 10; strengths.push('Düzenli fiziksel aktivite'); }
      else if (acts.length > 0) { score += 5; improvements.push('Fiziksel aktivite artırılmalı'); }
      else { improvements.push('Egzersiz rutini oluşturulmalı'); }

      const sleepMin = (body.todaySleep as any)?.minutes;
      if (sleepMin && sleepMin >= 420) { score += 5; strengths.push('Yeterli uyku süresi'); }
      else if (sleepMin) { improvements.push('Uyku süresi artırılmalı'); }

      result = {
        bmi: bmi ? Number(bmi.toFixed(1)) : null,
        bmr, tdee, bodyFatEstimate: null,
        healthScore: Math.min(score, 100),
        riskFactors: [],
        strengths: strengths.length > 0 ? strengths : ['Sağlık takibine başladınız'],
        improvementAreas: improvements.length > 0 ? improvements : ['Daha fazla veri ile analiz zenginleşecek'],
        nutritionPlan: tdee ? { dailyCalories: tdee, macroSplit: { protein: 30, carbs: 40, fat: 30 }, mealSuggestions: ['Protein ağırlıklı kahvaltı', 'Lif içeriği yüksek öğle öğünü', 'Dengeli akşam yemeği'] } : null,
        exercisePlan: { weeklyGoal: 'Haftada en az 150 dakika orta yoğunluklu aktivite', suggestedActivities: ['Yürüyüş', 'Kuvvet antrenmanı', 'Esneme'] },
        sleepRecommendation: { targetHours: 8, advice: 'Her gün benzer saatte uyuyup uyanmayı hedefleyin.' },
        supplementRecommendations: [],
        aiSummary: 'Mevcut verilerinize göre sağlık profili oluşturuldu. Daha fazla veri girdikçe profil daha doğru hale gelecek.',
      };
    }

    const payload = {
      user_id: userId,
      bmi: result.bmi != null ? String(result.bmi) : null,
      bmr: result.bmr ?? null,
      tdee: result.tdee ?? null,
      body_fat_estimate: result.bodyFatEstimate != null ? String(result.bodyFatEstimate) : null,
      health_score: result.healthScore ?? null,
      risk_factors: result.riskFactors ?? null,
      strengths: result.strengths ?? null,
      improvement_areas: result.improvementAreas ?? null,
      nutrition_plan: result.nutritionPlan ?? null,
      exercise_plan: result.exercisePlan ?? null,
      sleep_recommendation: result.sleepRecommendation ?? null,
      supplement_recommendations: result.supplementRecommendations ?? null,
      ai_generated_summary: result.aiSummary ?? null,
      last_calculated_at: new Date().toISOString(),
    };

    const { data: upserted, error } = await supabase
      .from('health_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) throw error;
    return toCamelHealthProfile(upserted);
  },
};
