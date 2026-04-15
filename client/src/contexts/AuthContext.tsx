import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number, message: string): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}

interface User {
  id: string;
  email: string;
  dateOfBirth?: string;
  displayName?: string;
  gender?: string;
  heightCm?: number;
  weightKg?: string;
  activityLevel?: string;
  language?: string;
  timezone?: string;
  onboardingCompleted?: boolean;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: { message: string } | null }>;
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  signOut: () => Promise<{ error: { message: string } | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  refreshUser: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const mapUser = useCallback((authUser: SupabaseAuthUser, profile?: Record<string, any> | null): User => ({
    id: authUser.id,
    email: authUser.email || '',
    displayName: profile?.display_name ?? authUser.user_metadata?.display_name ?? undefined,
    dateOfBirth: profile?.date_of_birth ?? undefined,
    gender: profile?.gender ?? undefined,
    heightCm: profile?.height_cm ?? undefined,
    weightKg: profile?.weight_kg != null ? String(profile.weight_kg) : undefined,
    activityLevel: profile?.activity_level ?? undefined,
    language: profile?.language ?? undefined,
    timezone: profile?.timezone ?? undefined,
    onboardingCompleted: profile?.onboarding_completed ?? undefined,
    avatarUrl: profile?.avatar_url ?? undefined,
  }), []);

  const fetchProfile = useCallback(async (authUser: SupabaseAuthUser) => {
    try {
      const result = await withTimeout(
        supabase
          .from('profiles')
          .select('id, display_name, date_of_birth, gender, height_cm, weight_kg, activity_level, language, timezone, onboarding_completed, avatar_url')
          .eq('id', authUser.id)
          .maybeSingle()
          .then((r) => r),
        10000,
        'Profil sorgusu zaman aşımına uğradı',
      );

      if (result.error) {
        setUser(mapUser(authUser));
        return;
      }

      setUser(mapUser(authUser, result.data));
    } catch (err) {
      logger.error('Failed to fetch profile:', err);
      setUser(mapUser(authUser));
    }
  }, [mapUser]);

  const ensureProfile = useCallback(async (authUser: SupabaseAuthUser, displayName?: string) => {
    try {
      await supabase.from('profiles').upsert({
        id: authUser.id,
        email: authUser.email,
        display_name: displayName ?? authUser.user_metadata?.display_name ?? null,
      }, { onConflict: 'id' });
    } catch (err) {
      logger.warn('Profile upsert failed (table may not exist):', err);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const { data, error } = await withTimeout(
        supabase.auth.getUser(),
        10000,
        'Kullanıcı oturum sorgusu zaman aşımına uğradı',
      );
      if (error || !data.user) {
        setUser(null);
        return;
      }

      await fetchProfile(data.user);
    } catch (err) {
      logger.error('fetchUser failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const { data } = await withTimeout(
          supabase.auth.getSession(),
          10000,
          'Session sorgusu zaman aşımına uğradı',
        );
        if (!isMounted) return;

        if (data.session?.user) {
          await fetchProfile(data.session.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        logger.error('Auth initialization failed:', err);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      logger.log('Auth state change:', event);

      if (event === 'TOKEN_REFRESHED' && !session) {
        logger.log('Token refresh failed — signing out');
        setUser(null);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        if (session?.user) {
          await fetchProfile(session.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        logger.error('Auth state change handler failed:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName ?? null,
          },
        },
      });

      if (error) {
        return { error: { message: error.message } };
      }

      if (data.user) {
        await ensureProfile(data.user, displayName);
      }

      if (data.session?.user) {
        await fetchProfile(data.session.user);
      }

      return { error: null };
    } catch (err) {
      return { error: { message: err instanceof Error ? err.message : 'Bilinmeyen hata' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: { message: error.message } };
      }

      if (data.user) {
        await fetchProfile(data.user);
      }

      return { error: null };
    } catch (err) {
      return { error: { message: err instanceof Error ? err.message : 'Bilinmeyen hata' } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: { message: error.message } };
      }
      setUser(null);
      return { error: null };
    } catch (err) {
      return { error: { message: err instanceof Error ? err.message : 'Bilinmeyen hata' } };
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
