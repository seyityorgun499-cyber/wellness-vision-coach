import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, BellRing, Clock, Droplets, Utensils, Activity, Mic, Microscope, Sparkles, Moon, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { notificationService, type NotificationPreferences } from '@/services/NotificationService';
import { useHealthData } from '@/contexts/HealthDataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const NotificationSettings = () => {
  const { healthData } = useHealthData();
  const { language } = useLanguage();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences>(notificationService.loadPreferences());

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted');
    }
  }, []);

  const updatePref = <K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    notificationService.savePreferences(updated);
  };

  const requestNotificationPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermissionGranted(granted);

    if (granted) {
      toast.success(language === 'tr' ? 'Bildirimler aktif!' : 'Notifications enabled!');
      notificationService.setupPeriodicChecks(() => healthData, 120);
    } else {
      toast.error(language === 'tr' ? 'Bildirim izni reddedildi' : 'Notification permission denied');
    }
  };

  const testNotification = () => {
    if (permissionGranted) {
      notificationService.showNotification({
        id: 'test',
        title: language === 'tr' ? 'Test Bildirimi' : 'Test Notification',
        message: language === 'tr'
          ? 'Bildirimler calisiyor! Artik saglik hatirlatmalarini alacaksin.'
          : 'Notifications are working! You will now receive health reminders.',
        type: 'motivation',
        priority: 'medium',
        scheduledFor: new Date()
      });
      toast.success(language === 'tr' ? 'Test bildirimi gonderildi!' : 'Test notification sent!');
    }
  };

  const generateSmartNotifications = () => {
    if (permissionGranted) {
      notificationService.scheduleSmartNotifications(healthData);
      toast.success(language === 'tr' ? 'Akilli bildirimler olusturuldu!' : 'Smart notifications generated!');
    }
  };

  const notificationTypes: {
    key: keyof NotificationPreferences;
    titleTr: string;
    titleEn: string;
    descTr: string;
    descEn: string;
    icon: typeof Droplets;
    color: string;
  }[] = [
    {
      key: 'water',
      titleTr: 'Su Hatirlatmasi',
      titleEn: 'Water Reminder',
      descTr: 'Su icme hedeflerini takip et',
      descEn: 'Track your water intake goals',
      icon: Droplets,
      color: 'text-blue-500',
    },
    {
      key: 'calories',
      titleTr: 'Kalori Hatirlatmasi',
      titleEn: 'Calorie Reminder',
      descTr: 'Gunluk kalori hedefini tamamla',
      descEn: 'Complete your daily calorie goal',
      icon: Utensils,
      color: 'text-orange-500',
    },
    {
      key: 'protein',
      titleTr: 'Protein Hatirlatmasi',
      titleEn: 'Protein Reminder',
      descTr: 'Protein hedefine ulas',
      descEn: 'Reach your protein goal',
      icon: Shield,
      color: 'text-red-500',
    },
    {
      key: 'activity',
      titleTr: 'Aktivite Hatirlatmasi',
      titleEn: 'Activity Reminder',
      descTr: 'Hareket etmeyi unutma',
      descEn: 'Don\'t forget to move',
      icon: Activity,
      color: 'text-green-500',
    },
    {
      key: 'voice',
      titleTr: 'Ruh Hali Kaydi',
      titleEn: 'Mood Log',
      descTr: 'Gunluk ruh hali takibi',
      descEn: 'Daily mood tracking',
      icon: Mic,
      color: 'text-violet-500',
    },
    {
      key: 'medical',
      titleTr: 'Saglik Kontrolu',
      titleEn: 'Health Check',
      descTr: 'Haftalik saglik analizi',
      descEn: 'Weekly health analysis',
      icon: Microscope,
      color: 'text-teal-500',
    },
    {
      key: 'motivation',
      titleTr: 'Motivasyon Mesajlari',
      titleEn: 'Motivation Messages',
      descTr: 'Ilham verici hatirlatmalar',
      descEn: 'Inspiring reminders',
      icon: Sparkles,
      color: 'text-amber-500',
    },
  ];

  const isTr = language === 'tr';

  return (
    <div className="min-h-screen bg-background p-4 space-y-4 pb-24">
      <div className="max-w-lg mx-auto">
        <div className="mb-5 pt-2">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            {isTr ? 'Bildirim Ayarlari' : 'Notification Settings'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isTr ? 'Kisisellestirilmis saglik hatirlatmalari' : 'Personalized health reminders'}
          </p>
        </div>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {permissionGranted ? (
                  <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <BellOff className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{isTr ? 'Bildirim Izni' : 'Notification Permission'}</p>
                  <Badge
                    variant={permissionGranted ? 'secondary' : 'destructive'}
                    className={`text-[10px] mt-0.5 ${permissionGranted ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : ''}`}
                  >
                    {permissionGranted ? (isTr ? 'Aktif' : 'Active') : (isTr ? 'Inaktif' : 'Inactive')}
                  </Badge>
                </div>
              </div>
            </div>

            {!permissionGranted ? (
              <Button onClick={requestNotificationPermission} className="w-full" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                {isTr ? 'Bildirimleri Aktiflestir' : 'Enable Notifications'}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={testNotification} className="flex-1" size="sm">
                  <BellRing className="h-3.5 w-3.5 mr-1.5" />
                  {isTr ? 'Test' : 'Test'}
                </Button>
                <Button onClick={generateSmartNotifications} className="flex-1" size="sm">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  {isTr ? 'Akilli Bildirimler' : 'Smart Reminders'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground px-1">
            {isTr ? 'Bildirim Turleri' : 'Notification Types'}
          </h3>

          {notificationTypes.map((type) => {
            const Icon = type.icon;
            const isEnabled = prefs[type.key as keyof NotificationPreferences] as boolean;
            return (
              <div
                key={type.key}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 ${type.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{isTr ? type.titleTr : type.titleEn}</p>
                    <p className="text-xs text-muted-foreground truncate">{isTr ? type.descTr : type.descEn}</p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(val) => updatePref(type.key as keyof NotificationPreferences, val)}
                  disabled={!permissionGranted}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-1 py-1"
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {isTr ? 'Gelismis Ayarlar' : 'Advanced Settings'}
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-indigo-500" />
                    <p className="text-sm font-medium">{isTr ? 'Sessiz Saatler' : 'Quiet Hours'}</p>
                  </div>
                  <Switch
                    checked={prefs.quietHoursEnabled}
                    onCheckedChange={(val) => updatePref('quietHoursEnabled', val)}
                  />
                </div>
                {prefs.quietHoursEnabled && (
                  <div className="flex items-center gap-2 mt-2">
                    <select
                      className="flex-1 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm"
                      value={prefs.quietHoursStart}
                      onChange={(e) => updatePref('quietHoursStart', parseInt(e.target.value))}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                      ))}
                    </select>
                    <span className="text-xs text-muted-foreground">—</span>
                    <select
                      className="flex-1 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm"
                      value={prefs.quietHoursEnd}
                      onChange={(e) => updatePref('quietHoursEnd', parseInt(e.target.value))}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                      ))}
                    </select>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {isTr
                    ? 'Bu saatler arasinda bildirim gonderilmez.'
                    : 'No notifications will be sent during these hours.'}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{isTr ? 'Gunluk Limit' : 'Daily Limit'}</p>
                    <p className="text-xs text-muted-foreground">
                      {isTr ? 'Gunde en fazla bildirim sayisi' : 'Maximum notifications per day'}
                    </p>
                  </div>
                  <select
                    className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm w-16 text-center"
                    value={prefs.dailyLimit}
                    onChange={(e) => updatePref('dailyLimit', parseInt(e.target.value))}
                  >
                    {[3, 4, 5, 6, 8, 10].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{isTr ? 'Akilli Zamanlama' : 'Smart Timing'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isTr
                    ? 'Bildirimler gunun farkli saatlerinde, saglik verilerinize gore kisisellestirilmis olarak gonderilir.'
                    : 'Notifications are sent at different times of the day, personalized based on your health data.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationSettings;
