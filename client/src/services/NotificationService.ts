import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { HealthData, ActivityEntry, VoiceEntry, MedicalPhotoAnalysis } from '@/types/health';

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

export interface HealthNotification {
  id: string;
  title: string;
  message: string;
  type: 'water' | 'calories' | 'protein' | 'activity' | 'medical' | 'voice' | 'motivation';
  priority: 'low' | 'medium' | 'high';
  scheduledFor: Date;
  data?: Record<string, unknown>;
}

export interface NotificationPreferences {
  water: boolean;
  calories: boolean;
  protein: boolean;
  activity: boolean;
  voice: boolean;
  medical: boolean;
  motivation: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
  dailyLimit: number;
}

const PREFS_KEY = 'myora_notification_prefs';
const SENT_COUNT_KEY = 'myora_notif_sent_count';

const DEFAULT_PREFS: NotificationPreferences = {
  water: true,
  calories: true,
  protein: true,
  activity: true,
  voice: true,
  medical: true,
  motivation: true,
  quietHoursEnabled: true,
  quietHoursStart: 22,
  quietHoursEnd: 7,
  dailyLimit: 6,
};

function getLang(): 'tr' | 'en' {
  try {
    const lang = localStorage.getItem('language');
    return lang === 'tr' ? 'tr' : 'en';
  } catch {
    return 'en';
  }
}

class NotificationService {
  private isNative: boolean;
  private isWebSupported: boolean;
  private webPermission: NotificationPermission;
  private periodicTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.isWebSupported = !this.isNative && typeof window !== 'undefined' && 'Notification' in window;
    this.webPermission = (this.isWebSupported && 'Notification' in window) ? Notification.permission : 'denied';
  }

  loadPreferences(): NotificationPreferences {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      if (stored) {
        return { ...DEFAULT_PREFS, ...JSON.parse(stored) };
      }
    } catch { /* ignore */ }
    return { ...DEFAULT_PREFS };
  }

  savePreferences(prefs: NotificationPreferences): void {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch { /* ignore */ }
  }

  private getTodaySentCount(): number {
    try {
      const stored = localStorage.getItem(SENT_COUNT_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.date === new Date().toDateString()) {
          return data.count;
        }
      }
    } catch { /* ignore */ }
    return 0;
  }

  private incrementSentCount(): void {
    try {
      const today = new Date().toDateString();
      const current = this.getTodaySentCount();
      localStorage.setItem(SENT_COUNT_KEY, JSON.stringify({ date: today, count: current + 1 }));
    } catch { /* ignore */ }
  }

  private isInQuietHours(prefs: NotificationPreferences): boolean {
    if (!prefs.quietHoursEnabled) return false;
    const hour = new Date().getHours();
    const start = prefs.quietHoursStart;
    const end = prefs.quietHoursEnd;
    if (start > end) {
      return hour >= start || hour < end;
    }
    return hour >= start && hour < end;
  }

  private canSendNotification(type: HealthNotification['type'], prefs?: NotificationPreferences): boolean {
    const p = prefs || this.loadPreferences();
    if (!p[type as keyof NotificationPreferences]) return false;
    if (this.isInQuietHours(p)) return false;
    if (this.getTodaySentCount() >= p.dailyLimit) return false;
    return true;
  }

  async requestPermission(): Promise<boolean> {
    if (this.isNative) {
      try {
        const result = await LocalNotifications.requestPermissions();
        return result.display === 'granted';
      } catch (err) {
        console.warn('Native notification permission request failed:', err);
        return false;
      }
    }

    if (!this.isWebSupported) {
      console.warn('Notifications not supported');
      return false;
    }

    if (this.webPermission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.webPermission = permission;
    return permission === 'granted';
  }

  async showNotification(notification: HealthNotification): Promise<void> {
    const prefs = this.loadPreferences();
    if (!this.canSendNotification(notification.type, prefs)) return;

    if (this.isNative) {
      await this.showNativeNotification(notification);
      this.incrementSentCount();
      return;
    }

    if (!this.isWebSupported || this.webPermission !== 'granted') {
      console.warn('Cannot show notification: not supported or permission denied');
      return;
    }

    const options: NotificationOptions = {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.type,
      requireInteraction: notification.priority === 'high',
      data: {
        ...notification.data,
        type: notification.type,
        id: notification.id
      }
    };

    if (navigator.vibrate && notification.priority === 'high') {
      navigator.vibrate([200, 100, 200]);
    }

    new Notification(notification.title, options);
    this.incrementSentCount();
  }

  private async showNativeNotification(notification: HealthNotification): Promise<void> {
    try {
      const numericId = Math.abs(hashCode(notification.id));

      await LocalNotifications.schedule({
        notifications: [
          {
            id: numericId,
            title: notification.title,
            body: notification.message,
            schedule: notification.scheduledFor > new Date()
              ? { at: notification.scheduledFor }
              : undefined,
            extra: {
              ...notification.data,
              type: notification.type,
              originalId: notification.id,
            },
          },
        ],
      });
    } catch (err) {
      console.error('Failed to schedule native notification:', err);
    }
  }

  generateSmartNotifications(healthData: HealthData): HealthNotification[] {
    const notifications: HealthNotification[] = [];
    const now = new Date();
    const today = now.toDateString();
    const prefs = this.loadPreferences();
    const lang = getLang();

    if (prefs.water) {
      const waterCurrent = healthData.dailyGoals.water.current;
      const waterTarget = healthData.dailyGoals.water.target;
      const waterDeficit = waterTarget - waterCurrent;

      if (waterDeficit > 0) {
        const hour = now.getHours();
        let message = '';
        let priority: 'low' | 'medium' | 'high' = 'medium';

        if (lang === 'tr') {
          if (hour < 12) {
            message = `Gunaydin! Bugun ${waterDeficit} bardak daha su icmen gerekiyor. Gune bir bardak suyla basla!`;
          } else if (hour < 18) {
            message = `Su icmeyi unutma! ${waterDeficit} bardak daha su icersen hedefine ulasacaksin.`;
          } else {
            message = `Gun bitiyor! Hala ${waterDeficit} bardak su eksik. Uyumadan once su icmeyi unutma.`;
            priority = 'high';
          }
        } else {
          if (hour < 12) {
            message = `Good morning! You need ${waterDeficit} more glasses of water today. Start with a glass!`;
          } else if (hour < 18) {
            message = `Don't forget to drink water! ${waterDeficit} more glasses to reach your goal.`;
          } else {
            message = `Day is ending! Still ${waterDeficit} glasses short. Drink water before bed.`;
            priority = 'high';
          }
        }

        notifications.push({
          id: `water-${Date.now()}`,
          title: lang === 'tr' ? 'Su Hatirlatmasi' : 'Water Reminder',
          message,
          type: 'water',
          priority,
          scheduledFor: now,
          data: { deficit: waterDeficit }
        });
      }
    }

    if (prefs.calories) {
      const caloriesCurrent = healthData.dailyGoals.calories.current;
      const caloriesTarget = healthData.dailyGoals.calories.target;
      const calorieDeficit = caloriesTarget - caloriesCurrent;

      if (calorieDeficit > 200) {
        const hour = now.getHours();
        let message = '';

        if (lang === 'tr') {
          if (hour < 14) {
            message = `Ogle yemegi zamani! ${calorieDeficit} kalori daha alman gerekiyor. Saglikli bir ogun yemeye ne dersin?`;
          } else if (hour < 20) {
            message = `Aksam yemegi yaklasiyor! ${calorieDeficit} kalori daha almaniz gerekiyor.`;
          } else {
            message = `Gun bitiyor ama ${calorieDeficit} kalori eksik! Hafif bir atistirmalik alabilirsin.`;
          }
        } else {
          if (hour < 14) {
            message = `Lunchtime! You need ${calorieDeficit} more calories. How about a healthy meal?`;
          } else if (hour < 20) {
            message = `Dinner is approaching! You still need ${calorieDeficit} more calories.`;
          } else {
            message = `Day is ending with ${calorieDeficit} calorie deficit! Consider a light snack.`;
          }
        }

        notifications.push({
          id: `calories-${Date.now()}`,
          title: lang === 'tr' ? 'Kalori Hatirlatmasi' : 'Calorie Reminder',
          message,
          type: 'calories',
          priority: 'medium',
          scheduledFor: now,
          data: { deficit: calorieDeficit }
        });
      }
    }

    if (prefs.protein) {
      const proteinCurrent = healthData.dailyGoals.protein.current;
      const proteinTarget = healthData.dailyGoals.protein.target;
      const proteinDeficit = proteinTarget - proteinCurrent;

      if (proteinDeficit > 10) {
        notifications.push({
          id: `protein-${Date.now()}`,
          title: lang === 'tr' ? 'Protein Hatirlatmasi' : 'Protein Reminder',
          message: lang === 'tr'
            ? `Protein hedefine ulasmak icin ${proteinDeficit}g daha protein alman gerekiyor. Yumurta, tavuk veya bakliyat tuketebilirsin!`
            : `You need ${proteinDeficit}g more protein to reach your goal. Try eggs, chicken, or legumes!`,
          type: 'protein',
          priority: 'medium',
          scheduledFor: now,
          data: { deficit: proteinDeficit }
        });
      }
    }

    if (prefs.activity) {
      const todaysActivities = healthData.activityEntries?.filter(
        (activity: ActivityEntry) => new Date(activity.timestamp).toDateString() === today
      ) || [];

      if (todaysActivities.length === 0) {
        const hour = now.getHours();
        let message = '';

        if (lang === 'tr') {
          if (hour < 10) {
            message = 'Gunaydin! Bugun harika bir gun hareket etmek icin. 10 dakika yuruyusle baslayabilirsin!';
          } else if (hour < 16) {
            message = 'Bugun hic egzersiz yapmadiniz! Kisa bir yuruyus veya basit egzersizlerle harekete gecmeye ne dersin?';
          } else {
            message = 'Gun bitmeden once biraz hareket et! 5 dakika bile olsa vucudun tesekkur edecek.';
          }
        } else {
          if (hour < 10) {
            message = 'Good morning! Great day to move. Start with a 10-minute walk!';
          } else if (hour < 16) {
            message = 'No exercise today! How about a short walk or some simple exercises?';
          } else {
            message = 'Move before the day ends! Even 5 minutes will make your body happy.';
          }
        }

        notifications.push({
          id: `activity-${Date.now()}`,
          title: lang === 'tr' ? 'Aktivite Hatirlatmasi' : 'Activity Reminder',
          message,
          type: 'activity',
          priority: 'medium',
          scheduledFor: now
        });
      }
    }

    if (prefs.voice) {
      const todaysVoiceEntries = healthData.voiceEntries?.filter(
        (entry: VoiceEntry) => new Date(entry.timestamp).toDateString() === today
      ) || [];

      if (todaysVoiceEntries.length === 0 && now.getHours() > 18) {
        notifications.push({
          id: `voice-${Date.now()}`,
          title: lang === 'tr' ? 'Ruh Hali Kaydi' : 'Mood Log',
          message: lang === 'tr'
            ? 'Bugun nasil hissettigini kaydetmeyi unutma! Gunluk ruh hali takibin sagligin icin cok onemli.'
            : 'Don\'t forget to record how you feel today! Daily mood tracking is important for your health.',
          type: 'voice',
          priority: 'low',
          scheduledFor: now
        });
      }
    }

    if (prefs.medical) {
      const recentMedicalPhotos = healthData.medicalPhotos?.filter(
        (photo: MedicalPhotoAnalysis) => {
          const photoDate = new Date(photo.timestamp);
          const daysDiff = (now.getTime() - photoDate.getTime()) / (1000 * 3600 * 24);
          return daysDiff <= 7;
        }
      ) || [];

      if (recentMedicalPhotos.length === 0 && now.getDay() === 1) {
        notifications.push({
          id: `medical-${Date.now()}`,
          title: lang === 'tr' ? 'Saglik Kontrolu' : 'Health Check',
          message: lang === 'tr'
            ? 'Haftalik saglik kontrolu zamani! Tibbi fotograf analizi yaparak sagligini takip etmeyi unutma.'
            : 'Weekly health check time! Don\'t forget to do a medical photo analysis to track your health.',
          type: 'medical',
          priority: 'low',
          scheduledFor: now
        });
      }
    }

    if (prefs.motivation && Math.random() < 0.3) {
      const motivationalMessages = lang === 'tr'
        ? [
            'Harika gidiyorsun! Saglik hedeflerine odaklanmaya devam et!',
            'Her kucuk adim buyuk degisikliklere yol acar! Sen basarabilirsin!',
            'Saglikli yasam bir maraton, sprint degil. Sabirli ol!',
            'Bugun kendine iyi bak! Vucudun senin en degerli varligin.',
            'Su icmeyi, hareket etmeyi ve saglikli beslenmeyi unutma!'
          ]
        : [
            'You\'re doing great! Keep focusing on your health goals!',
            'Every small step leads to big changes! You can do this!',
            'Healthy living is a marathon, not a sprint. Be patient!',
            'Take care of yourself today! Your body is your most valuable asset.',
            'Don\'t forget to drink water, move, and eat healthy!'
          ];

      notifications.push({
        id: `motivation-${Date.now()}`,
        title: lang === 'tr' ? 'Motivasyon' : 'Motivation',
        message: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
        type: 'motivation',
        priority: 'low',
        scheduledFor: now
      });
    }

    return notifications;
  }

  async scheduleSmartNotifications(healthData: HealthData): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('Notification permission denied — skipping smart notifications');
      return;
    }

    const prefs = this.loadPreferences();
    if (this.isInQuietHours(prefs)) {
      console.log('In quiet hours — skipping smart notifications');
      return;
    }

    const notifications = this.generateSmartNotifications(healthData);

    notifications.forEach(notification => {
      const delay = Math.random() * 30000;
      setTimeout(() => {
        this.showNotification(notification);
      }, delay);
    });
  }

  setupPeriodicChecks(getHealthData: () => HealthData, intervalMinutes: number = 120): void {
    if (this.periodicTimer) {
      clearInterval(this.periodicTimer);
    }
    this.periodicTimer = setInterval(() => {
      this.scheduleSmartNotifications(getHealthData());
    }, intervalMinutes * 60 * 1000);
  }

  async scheduleDailyReminders(): Promise<void> {
    if (!this.isNative) {
      console.warn('Daily reminders only available on native platform');
      return;
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('Notification permission denied — skipping daily reminders');
      return;
    }

    const lang = getLang();

    try {
      const notifications = [
        {
          id: 1001,
          title: lang === 'tr' ? 'Gunaydin!' : 'Good Morning!',
          body: lang === 'tr' ? 'Bugunku saglik hedeflerini kontrol et.' : 'Check your health goals for today.',
          schedule: {
            on: { hour: 8, minute: 0 },
            every: 'day' as const,
          },
          extra: { type: 'motivation' },
        },
        {
          id: 1002,
          title: lang === 'tr' ? 'Ogle Yemegi' : 'Lunch Time',
          body: lang === 'tr' ? 'Ogle yemegi zamani! Yedigini kaydetmeyi unutma.' : 'Lunch time! Don\'t forget to log your meal.',
          schedule: {
            on: { hour: 12, minute: 30 },
            every: 'day' as const,
          },
          extra: { type: 'calories' },
        },
        {
          id: 1003,
          title: lang === 'tr' ? 'Su Hatirlatmasi' : 'Water Reminder',
          body: lang === 'tr' ? 'Su icme zamani! Hedefine ne kadar yakinsin?' : 'Time to drink water! How close are you to your goal?',
          schedule: {
            on: { hour: 15, minute: 0 },
            every: 'day' as const,
          },
          extra: { type: 'water' },
        },
        {
          id: 1004,
          title: lang === 'tr' ? 'Hareket Zamani' : 'Time to Move',
          body: lang === 'tr' ? 'Bugun biraz hareket ettin mi? Kisa bir yuruyus harika olur.' : 'Have you moved today? A short walk would be great.',
          schedule: {
            on: { hour: 18, minute: 0 },
            every: 'day' as const,
          },
          extra: { type: 'activity' },
        },
        {
          id: 1005,
          title: lang === 'tr' ? 'Gunluk Degerlendirme' : 'Daily Reflection',
          body: lang === 'tr' ? 'Gunu degerlendir! Sesli gunluk kaydet ve skorunu gor.' : 'Reflect on your day! Record a voice log and check your score.',
          schedule: {
            on: { hour: 21, minute: 30 },
            every: 'day' as const,
          },
          extra: { type: 'voice' },
        },
        {
          id: 1006,
          title: lang === 'tr' ? 'Uyku Zamani' : 'Bedtime',
          body: lang === 'tr' ? 'Uyku zamani yaklasiyor. Ekranlari kapat, kaliteli uyku icin hazirlan.' : 'Bedtime is near. Put away screens and prepare for quality sleep.',
          schedule: {
            on: { hour: 22, minute: 30 },
            every: 'day' as const,
          },
          extra: { type: 'motivation' },
        },
      ];

      await LocalNotifications.schedule({ notifications });
      console.log('Daily reminders scheduled successfully');
    } catch (err) {
      console.error('Failed to schedule daily reminders:', err);
    }
  }

  async scheduleStreakReminder(currentStreak: number): Promise<void> {
    if (!this.isNative) {
      console.warn('Streak reminders only available on native platform');
      return;
    }

    if (currentStreak === 0) {
      try {
        await LocalNotifications.cancel({ notifications: [{ id: 1007 }] });
      } catch (err) {
        console.warn('Failed to cancel streak reminder:', err);
      }
      return;
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('Notification permission denied — skipping streak reminder');
      return;
    }

    const lang = getLang();
    const title = lang === 'tr' ? 'Seriyi Koru!' : 'Don\'t Break Your Streak!';
    const body = lang === 'tr'
      ? `${currentStreak} gunluk serin tehlikede! Gece yarisinda once bir sey kaydet.`
      : `Your ${currentStreak}-day streak is at risk — log something before midnight!`;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1007,
            title,
            body,
            schedule: {
              on: { hour: 21, minute: 0 },
              every: 'day' as const,
            },
            extra: { type: 'motivation', priority: 'high' },
          },
        ],
      });
      console.log(`Streak reminder scheduled for ${currentStreak} day streak`);
    } catch (err) {
      console.error('Failed to schedule streak reminder:', err);
    }
  }

  async scheduleEveningReminders(): Promise<void> {
    if (!this.isNative) return;

    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    const lang = getLang();

    try {
      await LocalNotifications.cancel({ notifications: [{ id: 1009 }, { id: 1010 }] });
    } catch { /* ignore */ }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1009,
            title: lang === 'tr' ? 'Su Hedefinize Ulastiniz mi?' : 'Hit Your Water Goal Today?',
            body: lang === 'tr'
              ? 'Yatmadan once bir bardak su icmek hem serini hem bedeninizi mutlu eder!'
              : 'A glass of water before bed keeps your streak — and your body — happy!',
            schedule: {
              on: { hour: 21, minute: 15 },
              every: 'day' as const,
            },
            extra: { type: 'water', priority: 'medium' },
          },
          {
            id: 1010,
            title: lang === 'tr' ? 'Aksam Ilac & Takviye Hatirlatmasi' : 'Evening Meds & Supplements',
            body: lang === 'tr'
              ? 'Aksam ilaclarinizi, takviyelerinizi veya vitaminlerinizi almayi unutmayin!'
              : 'Don\'t forget your evening medications, supplements, or vitamins before bed!',
            schedule: {
              on: { hour: 21, minute: 30 },
              every: 'day' as const,
            },
            extra: { type: 'motivation', priority: 'medium' },
          },
        ],
      });
      console.log('Evening reminders scheduled (water 21:15, meds 21:30)');
    } catch (err) {
      console.error('Failed to schedule evening reminders:', err);
    }
  }

  async scheduleWeeklySummary(): Promise<void> {
    if (!this.isNative) {
      console.warn('Weekly summary only available on native platform');
      return;
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('Notification permission denied — skipping weekly summary');
      return;
    }

    const lang = getLang();

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1008,
            title: lang === 'tr' ? 'Haftalik Ozet' : 'Weekly Summary',
            body: lang === 'tr'
              ? 'Haftalik saglik ozetin hazir! Gecen haftanin detaylarini incele.'
              : 'Your weekly health summary is ready! Review last week\'s details.',
            schedule: {
              on: { hour: 9, minute: 0, weekday: 2 },
              every: 'week' as const,
            },
            extra: { type: 'motivation' },
          },
        ],
      });
      console.log('Weekly summary scheduled successfully');
    } catch (err) {
      console.error('Failed to schedule weekly summary:', err);
    }
  }

  async cancelAllScheduled(): Promise<void> {
    if (!this.isNative) {
      console.warn('Cancel only available on native platform');
      return;
    }

    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
        console.log(`Cancelled ${pending.notifications.length} scheduled notifications`);
      }
    } catch (err) {
      console.error('Failed to cancel scheduled notifications:', err);
    }
  }

  async initSmartNotifications(currentStreak: number): Promise<void> {
    if (!this.isNative) {
      console.warn('Smart notifications only available on native platform');
      return;
    }

    await this.cancelAllScheduled();
    await this.scheduleDailyReminders();
    await this.scheduleStreakReminder(currentStreak);
    await this.scheduleEveningReminders();
    await this.scheduleWeeklySummary();

    console.log('Smart notifications initialized successfully');
  }

  async scheduleSupplementReminders(supplements: { name: string; timing: string }[]): Promise<void> {
    if (!this.isNative || supplements.length === 0) return;

    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    try {
      const pending = await LocalNotifications.getPending();
      const supIds = pending.notifications
        .filter(n => n.id >= 1020 && n.id <= 1029)
        .map(n => ({ id: n.id }));
      if (supIds.length > 0) await LocalNotifications.cancel({ notifications: supIds });
    } catch { /* ignore */ }

    const lang = getLang();
    const names = supplements.map(s => s.name).join(', ');
    const notifications = [
      {
        id: 1020,
        title: lang === 'tr' ? 'Sabah Takviyeleri' : 'Morning Supplements',
        body: lang === 'tr' ? `Almayi unutma: ${names}` : `Don't forget: ${names}`,
        schedule: { on: { hour: 8, minute: 30 }, every: 'day' as const },
      },
      {
        id: 1021,
        title: lang === 'tr' ? 'Aksam Takviye Hatirlatmasi' : 'Evening Supplement Reminder',
        body: lang === 'tr' ? `Bugun takviyelerini aldin mi? ${names}` : `Did you take your supplements today? ${names}`,
        schedule: { on: { hour: 20, minute: 0 }, every: 'day' as const },
      },
    ];

    try {
      await LocalNotifications.schedule({ notifications });
    } catch (err) {
      console.error('Failed to schedule supplement reminders:', err);
    }
  }

  async scheduleFamilyMedicationReminders(memberId: string, medications: { memberName: string; medicationName: string; scheduleTime: string }[]): Promise<void> {
    if (!this.isNative) return;

    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    const memberHash = Math.abs(hashCode(`family-med-${memberId}`)) % 100;
    const baseId = 1100 + memberHash * 10;

    try {
      const idsToCancel = Array.from({ length: 10 }, (_, i) => ({ id: baseId + i }));
      await LocalNotifications.cancel({ notifications: idsToCancel });
    } catch { /* ignore */ }

    if (medications.length === 0) return;

    const lang = getLang();
    const notifs = medications.slice(0, 10).map((med, i) => {
      const [hourStr, minuteStr] = (med.scheduleTime || '09:00').split(':');
      const hour = parseInt(hourStr, 10) || 9;
      const minute = parseInt(minuteStr, 10) || 0;

      return {
        id: baseId + i,
        title: lang === 'tr' ? `${med.memberName} — Ilac Hatirlatmasi` : `${med.memberName} — Medication Reminder`,
        body: lang === 'tr'
          ? `${med.memberName} icin ${med.medicationName} zamani.`
          : `Time for ${med.memberName}'s ${med.medicationName}.`,
        schedule: { on: { hour, minute }, every: 'day' as const },
        extra: { type: 'motivation', memberId },
      };
    });

    try {
      await LocalNotifications.schedule({ notifications: notifs });
      console.log(`Scheduled ${notifs.length} family medication reminders for member ${memberId}`);
    } catch (err) {
      console.error('Failed to schedule family medication reminders:', err);
    }
  }
}

export const notificationService = new NotificationService();
