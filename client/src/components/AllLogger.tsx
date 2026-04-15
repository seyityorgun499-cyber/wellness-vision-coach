import { Camera, Mic, Activity, ClipboardList, FileText, UtensilsCrossed, Dumbbell, Plus, RotateCcw, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { healthAPI } from "@/lib/api";
import type { FoodEntry, ActivityEntry as APIActivityEntry, VoiceEntry, HealthDocument } from "@/lib/api";
import { useMemo, useState } from "react";
import { haptic } from "@/lib/haptic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, staleTime } from "@/lib/queryKeys";
import { toast } from "sonner";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorView } from "@/components/ui/error-view";
import { EmptyState } from "@/components/ui/empty-state";
import { useTabNavigate } from "@/hooks/useTabNavigate";

/* ─── Types ─────────────────────────────────────────────── */

interface UnifiedEntry {
  id: string;
  type: 'food' | 'activity' | 'voice' | 'document';
  title: string;
  description: string;
  timestamp: Date;
}

/* ─── Date Utilities ────────────────────────────────────── */

const parseTS = (raw: unknown): Date => {
  if (raw instanceof Date) return raw;
  if (typeof raw === 'number') {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  if (typeof raw === 'string' && raw.length > 0) {
    const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  return new Date();
};

const formatRelative = (d: Date, t: Record<string, string>): string => {
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return t.justNow;
  if (mins < 60) return `${mins} ${t.minAgo}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ${t.hrAgo}`;
  const days = Math.floor(hrs / 24);
  return `${days} ${t.dayAgo}`;
};

/* ─── Entry Mappers ─────────────────────────────────────── */

const mapFood = (e: FoodEntry, t: Record<string, string>): UnifiedEntry => ({
  id: `food-${e.id}`,
  type: 'food',
  title: e.foodName || t.mealEntry,
  description: `${e.calories ?? 0} kcal${e.proteinGrams ? ` · P:${e.proteinGrams}g` : ''}${e.carbsGrams ? ` · C:${e.carbsGrams}g` : ''}${e.fatGrams ? ` · F:${e.fatGrams}g` : ''}`,
  timestamp: parseTS(e.loggedAt ?? e.createdAt),
});

const mapActivity = (e: APIActivityEntry, t: Record<string, string>): UnifiedEntry => ({
  id: `act-${e.id}`,
  type: 'activity',
  title: e.activityType || t.activityLogged,
  description: `${e.durationMinutes ?? 0} ${t.min}${e.caloriesBurned ? ` · ${e.caloriesBurned} kcal` : ''} · ${e.intensity}`,
  timestamp: parseTS(e.startedAt ?? e.createdAt),
});

const mapVoice = (e: VoiceEntry, t: Record<string, string>): UnifiedEntry => ({
  id: `voice-${e.id}`,
  type: 'voice',
  title: e.aiSummary?.slice(0, 50) || e.mood || t.voiceEntry,
  description: e.transcription?.slice(0, 80) || (e.keywords?.length ? e.keywords.join(', ') : ''),
  timestamp: parseTS(e.createdAt),
});

const mapDocument = (e: HealthDocument, t: Record<string, string>): UnifiedEntry => ({
  id: `doc-${e.id}`,
  type: 'document',
  title: e.title || t.documents,
  description: `${e.documentType?.replace('_', ' ') ?? ''} · ${e.status}`,
  timestamp: parseTS(e.uploadedAt ?? e.createdAt),
});

/* ─── Component ─────────────────────────────────────────── */

export const AllLogger = () => {
  const { t } = useLanguage();
  const onTabChange = useTabNavigate();
  const queryClient = useQueryClient();
  const [reloggingId, setReloggingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: string; label: string } | null>(null);

  const { data: foodEntries = [], isLoading: foodLoading, isError: foodError } = useQuery<FoodEntry[]>({
    queryKey: queryKeys.health.foods(),
    queryFn: () => healthAPI.getFoodEntries(),
    staleTime: staleTime.dynamic,
  });
  const { data: activityEntries = [], isLoading: actLoading, isError: actError } = useQuery<APIActivityEntry[]>({
    queryKey: queryKeys.health.activities(),
    queryFn: () => healthAPI.getActivities(100),
    staleTime: staleTime.dynamic,
  });
  const { data: voiceEntries = [], isLoading: voiceLoading, isError: voiceError } = useQuery<VoiceEntry[]>({
    queryKey: queryKeys.health.voices(),
    queryFn: () => healthAPI.getVoiceEntries(),
    staleTime: staleTime.dynamic,
  });
  const { data: documents = [], isLoading: docLoading, isError: docError } = useQuery<HealthDocument[]>({
    queryKey: queryKeys.health.documents(),
    queryFn: () => healthAPI.getDocuments(),
    staleTime: staleTime.dynamic,
  });

  const isLoading = foodLoading || actLoading || voiceLoading || docLoading;
  const isError = foodError || actError || voiceError || docError;

  // #12 Smart Logging Nudge — context-aware based on time + what's been logged
  const todayStart = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);
  const todayFoodCount = useMemo(() =>
    foodEntries.filter(e => new Date(e.loggedAt ?? e.createdAt ?? '') >= todayStart).length,
    [foodEntries, todayStart]
  );
  const todayActCount = useMemo(() =>
    activityEntries.filter(e => new Date(e.startedAt ?? e.createdAt ?? '') >= todayStart).length,
    [activityEntries, todayStart]
  );

  const smartNudge = useMemo(() => {
    if (isLoading) return null;
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10 && todayFoodCount === 0)
      return { emoji: '🍳', text: t.nudgeBreakfast ?? 'Breakfast time — log your first meal of the day!' };
    if (hour >= 12 && hour < 14 && todayFoodCount === 0)
      return { emoji: '🥗', text: t.nudgeLunch ?? 'Lunch time — don\'t forget to log!' };
    if (hour >= 18 && hour < 21 && todayFoodCount < 2)
      return { emoji: '🍽️', text: t.nudgeDinner ?? 'Dinner time — log your evening meal.' };
    if (hour >= 10 && hour < 20 && todayActCount === 0)
      return { emoji: '🏃', text: t.nudgeActivity ?? 'No activity logged yet — add a workout or walk!' };
    return null;
  }, [isLoading, todayFoodCount, todayActCount, t]);

  /* ── Re-log mutation ──────────────────────────────────── */
  const reLogMutation = useMutation({
    mutationFn: async (entry: FoodEntry) => {
      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
      const now = new Date();
      const hour = now.getHours();
      const autoMeal: typeof mealTypes[number] =
        hour < 10 ? 'breakfast' : hour < 14 ? 'lunch' : hour < 19 ? 'dinner' : 'snack';
      return healthAPI.addFoodEntry({
        mealType: (mealTypes.includes(entry.mealType as any) ? entry.mealType : autoMeal) as any,
        foodName: entry.foodName,
        calories: Number(entry.calories) || 0,
        proteinGrams: entry.proteinGrams ?? undefined,
        carbsGrams:   entry.carbsGrams   ?? undefined,
        fatGrams:     entry.fatGrams     ?? undefined,
        servingSize:  entry.servingSize  ?? undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.health.foods() });
      queryClient.invalidateQueries({ queryKey: queryKeys.health.dailyLog() });
      toast.success(t.foodRelogged ?? 'Meal logged again!');
      haptic.medium();
      setReloggingId(null);
    },
    onError: () => {
      toast.error(t.relogFailed ?? 'Could not re-log meal');
      haptic.error();
      setReloggingId(null);
    },
  });

  /* ── Delete mutation ──────────────────────────────────── */
  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      const rawId = id.replace(/^(food-|act-|voice-|doc-)/, '');
      if (type === 'food') return healthAPI.deleteFoodEntry(rawId);
      if (type === 'activity') return healthAPI.deleteActivityEntry(rawId);
      if (type === 'voice') return healthAPI.deleteVoiceEntry(rawId);
      throw new Error('Unsupported type');
    },
    onSuccess: (_, { type }) => {
      if (type === 'food') queryClient.invalidateQueries({ queryKey: queryKeys.health.foods() });
      if (type === 'activity') queryClient.invalidateQueries({ queryKey: queryKeys.health.activities() });
      if (type === 'voice') queryClient.invalidateQueries({ queryKey: queryKeys.health.voices() });
      queryClient.invalidateQueries({ queryKey: queryKeys.health.dailyLog() });
      toast.success(t.entryDeleted ?? 'Entry deleted');
      haptic.medium();
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error(t.deleteFailed ?? 'Could not delete entry');
      haptic.error();
      setDeleteTarget(null);
    },
  });

  /* ── Recent unique foods (last 5 distinct names) ─────── */
  const recentUniqueFoods = useMemo(() => {
    const seen = new Set<string>();
    const result: FoodEntry[] = [];
    for (const e of foodEntries) {
      const key = e.foodName?.toLowerCase().trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        result.push(e);
      }
      if (result.length >= 5) break;
    }
    return result;
  }, [foodEntries]);

  /* ── Derived Data ─────────────────────────────────────── */

  // Today check: compare just the date portion of the ISO string
  const todayStr = new Date().toISOString().slice(0, 10); // "2026-03-07"

  const getDateStr = (raw: unknown): string => {
    const d = parseTS(raw);
    return d.toISOString().slice(0, 10);
  };

  const todayCounts = {
    food: foodEntries.filter(e => getDateStr(e.loggedAt ?? e.createdAt) === todayStr).length,
    activity: activityEntries.filter(e => getDateStr(e.startedAt ?? e.createdAt) === todayStr).length,
    voice: voiceEntries.filter(e => getDateStr(e.createdAt) === todayStr).length,
    docs: documents.filter(e => getDateStr(e.uploadedAt ?? e.createdAt) === todayStr).length,
  };

  const allEntries: UnifiedEntry[] = [
    ...foodEntries.map(e => mapFood(e, t)),
    ...activityEntries.map(e => mapActivity(e, t)),
    ...voiceEntries.map(e => mapVoice(e, t)),
    ...documents.map(e => mapDocument(e, t)),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const groupedEntries = useMemo(() => {
    const todayStr = new Date().toDateString();
    const yesterdayStr = new Date(Date.now() - 86_400_000).toDateString();
    const map = new Map<string, UnifiedEntry[]>();
    for (const entry of allEntries.slice(0, 30)) {
      const key = entry.timestamp.toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return Array.from(map.entries()).map(([key, entries]) => {
      let label = key;
      if (key === todayStr) label = t.today ?? 'Bugün';
      else if (key === yesterdayStr) label = t.yesterday ?? 'Dün';
      else {
        const d = new Date(key);
        label = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
      }
      return { label, entries };
    });
  }, [allEntries, t]);

  const entryIcon = (type: string) => {
    switch (type) {
      case 'food': return <Camera className="h-4 w-4 text-health" />;
      case 'activity': return <Activity className="h-4 w-4 text-success" />;
      case 'voice': return <Mic className="h-4 w-4 text-widget" />;
      case 'document': return <FileText className="h-4 w-4 text-primary" />;
      default: return <ClipboardList className="h-4 w-4 text-muted-foreground" />;
    }
  };
  const entryBg = (type: string) => {
    switch (type) {
      case 'food': return 'bg-health-light';
      case 'activity': return 'bg-success-light';
      case 'voice': return 'bg-widget-light';
      case 'document': return 'bg-background-subtle';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-5 pb-20">
      <div className="pt-2">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          {t.loggerTitle}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t.loggerSubtitle}</p>
      </div>

      {smartNudge && (
        <div className="flex items-center gap-3 bg-muted/60 border border-border rounded-xl px-4 py-3 text-sm">
          <p className="text-foreground/80 font-medium">{smartNudge.text}</p>
        </div>
      )}

      {/* Quick Log Actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { id: 'camera', icon: Camera, label: t.foodLog, color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
          { id: 'activity', icon: Dumbbell, label: t.activityLogged, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
          { id: 'voice', icon: Mic, label: t.voiceEntries, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
          { id: 'docs', icon: FileText, label: t.documents, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
        ].map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onTabChange(action.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${action.color} active:scale-[0.97] transition-transform`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium leading-tight text-center">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Recent Foods — Quick Re-log */}
      {!foodLoading && recentUniqueFoods.length > 0 && (
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-green-600" />
              {t.recentFoodsTitle ?? 'Log Again'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {recentUniqueFoods.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30"
                >
                  <UtensilsCrossed className="h-4 w-4 text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.foodName}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.calories} kcal{entry.proteinGrams ? ` · P: ${entry.proteinGrams}g` : ''}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 h-7 px-2 text-xs border-green-300 dark:border-green-700"
                    disabled={reloggingId === entry.id || reLogMutation.isPending}
                    onClick={() => {
                      setReloggingId(entry.id);
                      reLogMutation.mutate(entry);
                    }}
                  >
                    {reloggingId === entry.id
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <><Plus className="h-3 w-3 mr-0.5" /> {t.logAgain ?? 'Log'}</>}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">{t.todayLoggingProgress}</CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <ErrorView message={t.dataLoadFailed} />
          ) : isLoading ? (
            <ListSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                <UtensilsCrossed className="h-4 w-4 mx-auto mb-1 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{todayCounts.food}</div>
                <div className="text-xs text-muted-foreground">{t.mealsLogged}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <Dumbbell className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{todayCounts.activity}</div>
                <div className="text-xs text-muted-foreground">{t.activityLogged}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <Mic className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{todayCounts.voice}</div>
                <div className="text-xs text-muted-foreground">{t.voiceEntries}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                <FileText className="h-4 w-4 mx-auto mb-1 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">{todayCounts.docs}</div>
                <div className="text-xs text-muted-foreground">{t.documents}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>{t.recentEntries}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isError ? (
            <ErrorView message={t.entriesLoadFailed} />
          ) : isLoading ? (
            <ListSkeleton count={5} />
          ) : allEntries.length === 0 ? (
            <EmptyState
              title={t.noRecentEntries}
              icon={<ClipboardList className="h-6 w-6 text-muted-foreground" />}
            />
          ) : (
            groupedEntries.map(({ label, entries }) => (
              <div key={label}>
                <div className="flex items-center gap-2 mb-2 mt-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="space-y-2">
                  {entries.map(entry => (
                    <div key={entry.id} className={`flex items-center gap-3 p-3 ${entryBg(entry.type)} rounded-lg`}>
                      {entryIcon(entry.type)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{entry.title}</div>
                        <div className="text-sm text-muted-foreground truncate">{entry.description}</div>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">{formatRelative(entry.timestamp, t)}</div>
                      {entry.type !== 'document' && (
                        <button
                          className="shrink-0 p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={() => setDeleteTarget({ id: entry.id, type: entry.type, label: entry.title })}
                          aria-label={t.deleteEntry ?? 'Delete'}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteEntryTitle ?? 'Delete this entry?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {(t.deleteEntryBody ?? 'This will permanently remove "{{name}}" from your log.').replace('{{name}}', deleteTarget?.label ?? '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel ?? 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id, type: deleteTarget.type })}
            >
              {t.delete ?? 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};