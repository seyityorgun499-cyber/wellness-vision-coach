/**
 * Myora – Family API (Aile Takibi)
 */

import { getCurrentSupabaseUserId, supabase } from './_common';
import type { FamilyMember, FamilyMemberCreateData, FamilyMedication, MedicationCreateData, MedicationLog, MedicationLogData, AdherenceData } from './types';

function toCamelFamilyMember(row: any): FamilyMember {
  return {
    id: row.id,
    userId: row.user_id,
    linkedUserId: (row.linked_user_id ?? null) as any,
    name: row.name,
    relationship: row.relationship,
    dateOfBirth: row.date_of_birth ?? null,
    avatarUrl: row.avatar_url ?? null,
    notes: row.notes ?? null,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as FamilyMember;
}

function toCamelFamilyMedication(row: any): FamilyMedication {
  return {
    id: row.id,
    familyMemberId: row.family_member_id,
    name: row.name,
    dosage: row.dosage ?? null,
    frequency: row.frequency ?? null,
    scheduleTime: row.schedule_time ?? null,
    startDate: row.start_date ?? null,
    endDate: row.end_date ?? null,
    prescribedBy: row.prescribed_by ?? null,
    notes: row.notes ?? null,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as FamilyMedication;
}

function toCamelMedicationLog(row: any): MedicationLog {
  return {
    id: row.id,
    medicationId: row.medication_id,
    takenAt: row.taken_at,
    taken: row.taken,
    notes: row.notes ?? null,
    loggedBy: (row.logged_by ?? null) as any,
    createdAt: row.created_at,
  } as MedicationLog;
}

export const familyAPI = {
  /* ── Üyeler ──────────────────────────────────────── */
  getMembers: async (): Promise<FamilyMember[]> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toCamelFamilyMember);
  },

  getMember: async (id: string): Promise<FamilyMember> => {
    const { data, error } = await supabase.from('family_members').select('*').eq('id', id).single();
    if (error) throw error;
    return toCamelFamilyMember(data);
  },

  addMember: async (data: FamilyMemberCreateData): Promise<FamilyMember> => {
    const userId = await getCurrentSupabaseUserId();
    const { data: inserted, error } = await supabase
      .from('family_members')
      .insert({
        user_id: userId,
        linked_user_id: (data.linkedUserId as any) ?? null,
        name: data.name,
        relationship: data.relationship,
        date_of_birth: data.dateOfBirth ?? null,
        avatar_url: data.avatarUrl ?? null,
        notes: data.notes ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return toCamelFamilyMember(inserted);
  },

  updateMember: async (id: string, data: Partial<FamilyMemberCreateData>): Promise<FamilyMember> => {
    const payload = Object.fromEntries(Object.entries({
      linked_user_id: data.linkedUserId,
      name: data.name,
      relationship: data.relationship,
      date_of_birth: data.dateOfBirth,
      avatar_url: data.avatarUrl,
      notes: data.notes,
    }).filter(([, value]) => value !== undefined));

    const { data: updated, error } = await supabase.from('family_members').update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    return toCamelFamilyMember(updated);
  },

  deleteMember: async (id: string) => {
    const { error } = await supabase.from('family_members').update({ is_active: false }).eq('id', id);
    if (error) throw error;
  },

  /* ── İlaçlar ─────────────────────────────────────── */
  getMedications: async (memberId: string): Promise<FamilyMedication[]> => {
    const { data, error } = await supabase
      .from('family_medications')
      .select('*')
      .eq('family_member_id', memberId)
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toCamelFamilyMedication);
  },

  addMedication: async (memberId: string, data: MedicationCreateData): Promise<FamilyMedication> => {
    const { data: inserted, error } = await supabase
      .from('family_medications')
      .insert({
        family_member_id: memberId,
        name: data.name,
        dosage: data.dosage ?? null,
        frequency: data.frequency ?? null,
        schedule_time: data.scheduleTime ?? null,
        start_date: data.startDate ?? null,
        end_date: data.endDate ?? null,
        prescribed_by: data.prescribedBy ?? null,
        notes: data.notes ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return toCamelFamilyMedication(inserted);
  },

  updateMedication: async (id: string, data: Partial<MedicationCreateData>): Promise<FamilyMedication> => {
    const payload = Object.fromEntries(Object.entries({
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      schedule_time: data.scheduleTime,
      start_date: data.startDate,
      end_date: data.endDate,
      prescribed_by: data.prescribedBy,
      notes: data.notes,
    }).filter(([, value]) => value !== undefined));

    const { data: updated, error } = await supabase.from('family_medications').update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    return toCamelFamilyMedication(updated);
  },

  deleteMedication: async (id: string) => {
    const { error } = await supabase.from('family_medications').update({ is_active: false }).eq('id', id);
    if (error) throw error;
  },

  /* ── İlaç Kaydı & Uyum ──────────────────────────── */
  logMedication: async (medicationId: string, data?: MedicationLogData): Promise<MedicationLog> => {
    const userId = await getCurrentSupabaseUserId();
    const takenAt = data?.takenAt ?? new Date().toISOString();
    const todayStart = takenAt.slice(0, 10) + 'T00:00:00.000Z';
    const todayEnd = takenAt.slice(0, 10) + 'T23:59:59.999Z';

    const { data: existing } = await supabase
      .from('family_medication_logs')
      .select('id')
      .eq('medication_id', medicationId)
      .eq('logged_by', userId)
      .gte('taken_at', todayStart)
      .lte('taken_at', todayEnd)
      .maybeSingle();

    const payload = { medication_id: medicationId, taken_at: takenAt, taken: data?.taken !== false, notes: data?.notes ?? null, logged_by: userId };

    if (existing?.id) {
      const { data: updated, error } = await supabase
        .from('family_medication_logs')
        .update({ taken: payload.taken, taken_at: payload.taken_at, notes: payload.notes })
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) throw error;
      return toCamelMedicationLog(updated);
    }

    const { data: inserted, error } = await supabase.from('family_medication_logs').insert(payload).select('*').single();
    if (error) throw error;
    return toCamelMedicationLog(inserted);
  },

  getMedicationLogs: async (medicationId: string): Promise<MedicationLog[]> => {
    const { data, error } = await supabase
      .from('family_medication_logs')
      .select('*')
      .eq('medication_id', medicationId)
      .order('taken_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelMedicationLog);
  },

  getAdherence: async (memberId: string, date?: string): Promise<any> => {
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const medications = await familyAPI.getMedications(memberId);

    if (medications.length === 0) {
      return { date: targetDate, medications: [], overallRate: 0, total: 0, taken: 0, missed: 0, adherenceRate: 0 };
    }

    const medicationIds = medications.map((med) => med.id);
    const start = `${targetDate}T00:00:00.000Z`;
    const end = `${targetDate}T23:59:59.999Z`;

    const { data: logs, error } = await supabase
      .from('family_medication_logs')
      .select('*')
      .in('medication_id', medicationIds)
      .gte('taken_at', start)
      .lte('taken_at', end)
      .order('taken_at', { ascending: false });
    if (error) throw error;

    const logsByMedication = new Map<string, MedicationLog[]>();
    for (const log of (logs ?? []).map(toCamelMedicationLog)) {
      const list = logsByMedication.get(log.medicationId) ?? [];
      list.push(log);
      logsByMedication.set(log.medicationId, list);
    }

    const adherenceItems = medications.map((medication) => {
      const medicationLogs = logsByMedication.get(medication.id) ?? [];
      const taken = medicationLogs.some((log) => log.taken);
      return { medication, logs: medicationLogs, adherenceRate: taken ? 100 : 0 };
    });

    const takenCount = adherenceItems.filter((item) => item.adherenceRate > 0).length;
    const total = adherenceItems.length;
    const overallRate = total > 0 ? Math.round((takenCount / total) * 100) : 0;

    return { date: targetDate, medications: adherenceItems, overallRate, total, taken: takenCount, missed: total - takenCount, adherenceRate: overallRate };
  },
};
