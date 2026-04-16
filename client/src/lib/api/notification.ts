/**
 * Myora – Notification API (Akıllı Bildirimler)
 */

import type { SmartNotification, SmartNotificationResponse } from './types';

export const notificationAPI = {
  /** Saate göre akıllı bildirim önerilerini al */
  getSmartNotifications: async (): Promise<SmartNotificationResponse> => {
    const currentHour = new Date().getHours();
    const notifications: SmartNotification[] = [];

    if (currentHour >= 7 && currentHour <= 9) {
      notifications.push({ title: 'Günaydın! ☀️', message: 'Güne bir bardak su ile başlayın.', type: 'morning_water', priority: 'medium' });
    }
    if (currentHour >= 12 && currentHour <= 14) {
      notifications.push({ title: 'Öğle Yemeği 🍽️', message: 'Sağlıklı bir öğle yemeği zamanı!', type: 'lunch_reminder', priority: 'medium' });
    }
    if (currentHour >= 15 && currentHour <= 16) {
      notifications.push({ title: 'Su Hatırlatması 💧', message: 'Günlük su hedefinize yaklaşın.', type: 'water_reminder', priority: 'low' });
    }
    if (currentHour >= 20 && currentHour <= 22) {
      notifications.push({ title: 'Uyku Zamanı 🌙', message: 'Kaliteli uyku için ekranları kapatın.', type: 'sleep_reminder', priority: 'medium' });
    }

    return { success: true, notifications, timestamp: new Date().toISOString(), hour: currentHour };
  },
};

// ─────────────────────────────────────────────────────────────
// WEEKLY CHALLENGES API
// ─────────────────────────────────────────────────────────────

import { supabase } from './_common';

export const challengeAPI = {
  /** Load completed challenge IDs for a given week from user metadata */
  getCompletions: async (weekIndex: number): Promise<string[]> => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return [];
    const key = `challenges_${weekIndex}`;
    const meta = data.user.user_metadata as Record<string, any> | null;
    return Array.isArray(meta?.[key]) ? (meta![key] as string[]) : [];
  },

  /** Persist completed challenge IDs for a given week into user metadata */
  saveCompletions: async (weekIndex: number, completedIds: string[]): Promise<void> => {
    const key = `challenges_${weekIndex}`;
    const { error } = await supabase.auth.updateUser({ data: { [key]: completedIds } });
    if (error) throw error;
  },
};
