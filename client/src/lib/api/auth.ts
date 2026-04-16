/**
 * Myora – Auth API
 * Kimlik doğrulama ve kullanıcı profili işlemleri.
 */

import { getCurrentSupabaseUserId, supabase } from './_common';
import type { AuthResponse, ProfileUpdateData } from './types';

async function getCurrentAuthResponse(): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Oturum bulunamadı');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, date_of_birth, gender, height_cm, weight_kg, activity_level, language, timezone, onboarding_completed, created_at, updated_at')
    .eq('id', data.user.id)
    .maybeSingle();

  return {
    user: {
      id: data.user.id,
      email: data.user.email || '',
      displayName: profile?.display_name ?? data.user.user_metadata?.display_name ?? undefined,
      avatarUrl: profile?.avatar_url ?? undefined,
      dateOfBirth: profile?.date_of_birth ?? undefined,
      gender: profile?.gender ?? undefined,
      heightCm: profile?.height_cm ?? undefined,
      weightKg: profile?.weight_kg != null ? String(profile.weight_kg) : undefined,
      activityLevel: profile?.activity_level ?? undefined,
      language: profile?.language ?? undefined,
      timezone: profile?.timezone ?? undefined,
      onboardingCompleted: profile?.onboarding_completed ?? undefined,
      createdAt: profile?.created_at ?? new Date().toISOString(),
      updatedAt: profile?.updated_at ?? new Date().toISOString(),
    },
  };
}

export const authAPI = {
  /** Yeni kullanıcı kaydı */
  register: async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName ?? null } },
    });
    if (error) throw error;
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      await supabase.from('profiles').upsert({
        id: userData.user.id,
        email: userData.user.email,
        display_name: displayName ?? null,
      }, { onConflict: 'id' });
    }
    return getCurrentAuthResponse();
  },

  /** Kullanıcı girişi */
  login: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return getCurrentAuthResponse();
  },

  /** Oturumu kapat */
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  },

  /** Mevcut oturumu doğrula ve kullanıcı bilgisini al */
  me: () => getCurrentAuthResponse(),

  /** Kullanıcı profilini güncelle */
  updateProfile: async (data: ProfileUpdateData) => {
    const userId = await getCurrentSupabaseUserId();
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: data.displayName,
        height_cm: data.heightCm,
        weight_kg: data.weightKg,
        activity_level: data.activityLevel,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        language: data.language,
        ...(data.onboardingCompleted !== undefined && { onboarding_completed: data.onboardingCompleted }),
      })
      .eq('id', userId);
    if (error) throw error;
    return getCurrentAuthResponse();
  },
};
