/**
 * Myora – Supplement API (Takviye Gıda & Sipariş)
 */

import { getCurrentSupabaseUserId, supabase } from './_common';
import type { Supplement, SupplementRecommendation, SupplementOrder, OrderCreateData } from './types';

function toCamelSupplement(row: any): Supplement {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand ?? null,
    category: row.category,
    description: row.description ?? null,
    dosageForm: row.dosage_form ?? null,
    servingSize: row.serving_size ?? null,
    ingredients: row.ingredients ?? null,
    benefits: row.benefits ?? [],
    warnings: row.warnings ?? null,
    imageUrl: row.image_url ?? null,
    price: row.price != null ? String(row.price) : null,
    currency: row.currency ?? 'TRY',
    externalUrl: row.external_url ?? null,
    affiliateUrl: row.affiliate_url ?? null,
    rating: row.rating != null ? String(row.rating) : null,
    reviewCount: row.review_count ?? 0,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
  } as Supplement;
}

function toCamelSupplementRecommendation(row: any): SupplementRecommendation & { supplementName?: string } {
  return {
    id: row.id,
    userId: row.user_id,
    supplementId: row.supplement_id,
    reason: row.reason,
    priority: row.priority,
    basedOn: row.based_on ?? null,
    suggestedDosage: row.suggested_dosage ?? null,
    duration: row.duration ?? null,
    status: row.status,
    supplement: row.supplements ? toCamelSupplement(row.supplements) : undefined,
    supplementName: row.supplements?.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as SupplementRecommendation & { supplementName?: string };
}

function toCamelSupplementOrder(row: any): SupplementOrder {
  return {
    id: row.id,
    userId: row.user_id,
    supplementId: row.supplement_id,
    quantity: row.quantity,
    totalPrice: row.total_price != null ? String(row.total_price) : null,
    currency: row.currency ?? 'TRY',
    orderStatus: row.order_status,
    externalOrderId: row.external_order_id ?? null,
    supplement: row.supplements ? toCamelSupplement(row.supplements) : undefined,
    orderedAt: row.ordered_at,
    createdAt: row.created_at,
  } as SupplementOrder;
}

export const supplementAPI = {
  /** Takviyeleri listele */
  getSupplements: async (category?: string): Promise<Supplement[]> => {
    let query = supabase.from('supplements').select('*').eq('is_active', true).order('name', { ascending: true });
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(toCamelSupplement);
  },

  /** Takviye detayı */
  getSupplement: async (id: string): Promise<Supplement> => {
    const { data, error } = await supabase.from('supplements').select('*').eq('id', id).single();
    if (error) throw error;
    return toCamelSupplement(data);
  },

  /** Kullanıcıya özel AI önerileri */
  getRecommendations: async (): Promise<(SupplementRecommendation & { supplementName?: string })[]> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('supplement_recommendations')
      .select('*, supplements(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelSupplementRecommendation);
  },

  /** Öneri durumunu güncelle */
  updateRecommendationStatus: async (id: string, status: string): Promise<SupplementRecommendation & { supplementName?: string }> => {
    const { data, error } = await supabase
      .from('supplement_recommendations')
      .update({ status })
      .eq('id', id)
      .select('*, supplements(*)')
      .single();
    if (error) throw error;
    return toCamelSupplementRecommendation(data);
  },

  /** Kullanıcının siparişleri */
  getOrders: async (): Promise<SupplementOrder[]> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('supplement_orders')
      .select('*, supplements(*)')
      .eq('user_id', userId)
      .order('ordered_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelSupplementOrder);
  },

  /** Get intake logs for a supplement (last N days) */
  getIntakeLogs: async (supplementKey?: string, days: number = 30) => {
    const userId = await getCurrentSupabaseUserId();
    const startDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    let query = supabase.from('supplement_intake_logs').select('*').eq('user_id', userId).gte('date', startDate).order('date', { ascending: false });
    if (supplementKey) query = query.eq('supplement_key', supplementKey);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      id: row.id,
      supplementKey: row.supplement_key,
      supplementName: row.supplement_name,
      dosage: row.dosage,
      timing: row.timing,
      takenAt: row.taken_at,
      date: row.date,
      notes: row.notes,
    }));
  },

  /** Check in: mark a supplement as taken today */
  checkInIntake: async (supplementKey: string, supplementName: string, dosage?: string, timing?: string) => {
    const userId = await getCurrentSupabaseUserId();
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('supplement_intake_logs')
      .upsert({
        user_id: userId,
        supplement_key: supplementKey,
        supplement_name: supplementName,
        dosage: dosage ?? null,
        timing: timing ?? null,
        date: today,
        taken_at: new Date().toISOString(),
      }, { onConflict: 'user_id,supplement_key,date' })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  /** Undo check-in */
  uncheckIntake: async (supplementKey: string) => {
    const userId = await getCurrentSupabaseUserId();
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from('supplement_intake_logs').delete().eq('user_id', userId).eq('supplement_key', supplementKey).eq('date', today);
    if (error) throw error;
  },

  /** Get all tracked supplements with their intake stats */
  getTrackedSupplementStats: async () => {
    const userId = await getCurrentSupabaseUserId();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('supplement_intake_logs')
      .select('supplement_key, supplement_name, dosage, timing, date')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo)
      .order('date', { ascending: false });
    if (error) throw error;

    const map = new Map<string, { name: string; dosage: string | null; timing: string | null; dates: string[] }>();
    for (const row of (data ?? []) as any[]) {
      const existing = map.get(row.supplement_key);
      if (existing) {
        existing.dates.push(row.date);
      } else {
        map.set(row.supplement_key, { name: row.supplement_name, dosage: row.dosage, timing: row.timing, dates: [row.date] });
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    return Array.from(map.entries()).map(([key, val]) => ({
      supplementKey: key,
      supplementName: val.name,
      dosage: val.dosage,
      timing: val.timing,
      totalDays: val.dates.length,
      last7Days: val.dates.filter(d => d >= new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)).length,
      takenToday: val.dates.includes(today),
      dates: val.dates,
    }));
  },

  /** Sipariş oluştur */
  createOrder: async (data: OrderCreateData): Promise<SupplementOrder> => {
    const userId = await getCurrentSupabaseUserId();
    const supplement = await supplementAPI.getSupplement(data.supplementId);
    const quantity = data.quantity ?? 1;
    const totalPrice = supplement.price ? Number(supplement.price) * quantity : null;

    const { data: inserted, error } = await supabase
      .from('supplement_orders')
      .insert({
        user_id: userId,
        supplement_id: data.supplementId,
        quantity,
        total_price: totalPrice,
        currency: supplement.currency || 'TRY',
      })
      .select('*, supplements(*)')
      .single();
    if (error) throw error;
    return toCamelSupplementOrder(inserted);
  },
};
