import { CheckCircle2, Circle, Utensils, Droplets, Activity, BarChart3, Gift, Mic, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { healthAPI } from "@/lib/api";
import type { FoodEntry, ActivityEntry, VoiceEntry, DailyHealthLog } from "@/lib/api";
import { queryKeys, staleTime } from "@/lib/queryKeys";
import { isToday } from "@/lib/utils";

interface Quest {
  key: string;
  label: string;
  completed: boolean;
  icon: React.ReactNode;
  color: string;
}

export const DailyQuests = () => {
  const { t } = useLanguage();

  const { data: foods = [], isLoading: foodLoading, isError: foodError } = useQuery<FoodEntry[]>({
    queryKey: queryKeys.health.foods(),
    queryFn: () => healthAPI.getFoodEntries(),
    staleTime: staleTime.dynamic,
    refetchInterval: 30_000,
  });
  const { data: activities = [], isLoading: actLoading, isError: actError } = useQuery<ActivityEntry[]>({
    queryKey: queryKeys.health.activities(),
    queryFn: () => healthAPI.getActivities(50),
    staleTime: staleTime.dynamic,
    refetchInterval: 30_000,
  });
  const { data: voices = [], isLoading: voiceLoading, isError: voiceError } = useQuery<VoiceEntry[]>({
    queryKey: queryKeys.health.voices(),
    queryFn: () => healthAPI.getVoiceEntries(),
    staleTime: staleTime.dynamic,
    refetchInterval: 30_000,
  });
  const { data: dailyLog, isLoading: logLoading, isError: logError } = useQuery<DailyHealthLog | null>({
    queryKey: queryKeys.health.dailyLog(),
    queryFn: () => healthAPI.getDailyLog(),
    staleTime: staleTime.dynamic,
    refetchInterval: 30_000,
  });

  const loading = foodLoading || actLoading || voiceLoading || logLoading;
  const hasError = foodError || actError || voiceError || logError;

  const hasFood = useMemo(() => foods.some((f) => isToday(f.loggedAt || f.createdAt)), [foods]);
  const hasActivity = useMemo(() => activities.some((a) => isToday(a.startedAt || a.createdAt)), [activities]);
  const hasVoice = useMemo(() => voices.some((v) => isToday(v.createdAt)), [voices]);
  const hasWater = useMemo(() => dailyLog ? (dailyLog.waterMl ?? 0) > 0 : false, [dailyLog]);

  const quests: Quest[] = [
    {
      key: "logMeal",
      label: t.questLogMeal,
      completed: hasFood,
      icon: <Utensils className="h-4 w-4" />,
      color: "text-orange-500",
    },
    {
      key: "drinkWater",
      label: t.questDrinkWater,
      completed: hasWater,
      icon: <Droplets className="h-4 w-4" />,
      color: "text-blue-500",
    },
    {
      key: "doActivity",
      label: t.questDoActivity,
      completed: hasActivity,
      icon: <Activity className="h-4 w-4" />,
      color: "text-green-500",
    },
    {
      key: "voiceLog",
      label: t.questVoiceLog,
      completed: hasVoice,
      icon: <Mic className="h-4 w-4" />,
      color: "text-violet-500",
    },
    {
      key: "checkScore",
      label: t.questCheckScore,
      completed: true, // always true since user is on this page
      icon: <BarChart3 className="h-4 w-4" />,
      color: "text-purple-500",
    },
  ];

  const completedCount = quests.filter((q) => q.completed).length;
  const allComplete = completedCount === quests.length;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">{t.dailyQuests}</h3>
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        ) : (
          <span className="text-xs text-muted-foreground">
            {completedCount}/{quests.length} {t.questsCompleted}
          </span>
        )}
      </div>

      <div className="h-1.5 rounded-full bg-muted mb-3 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${(completedCount / quests.length) * 100}%` }}
        />
      </div>

      {/* Error state */}
      {hasError && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2 mb-2">
          <span className="text-xs text-destructive">{t.questDataLoadFailed}</span>
        </div>
      )}

      {/* Quest list */}
      <div className="space-y-2">
        {quests.map((quest) => (
          <div
            key={quest.key}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-all ${
              quest.completed
                ? "bg-primary/5 opacity-80"
                : "bg-muted/50"
            }`}
          >
            {quest.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground/50 shrink-0" />
            )}
            <div className={`shrink-0 ${quest.color}`}>{quest.icon}</div>
            <span
              className={`text-sm flex-1 ${
                quest.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {quest.label}
            </span>
          </div>
        ))}
      </div>

      {allComplete && (
        <div className="mt-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200/60 dark:border-green-800/30 px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <Gift className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              {t.questsCompleted}!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
