import React, { Suspense, useMemo } from "react";
import { BarChart3, TrendingUp, Target, Calendar, Award, Zap, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { healthAPI } from "@/lib/api";
import type { DailyHealthLog, UserAchievement, Achievement, FastingLog } from "@/lib/api";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useQuery } from "@tanstack/react-query";
import { queryKeys, staleTime } from "@/lib/queryKeys";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const LazyWeightTrendChart = React.lazy(() =>
  import('@/components/charts/AnalyticsCharts').then(m => ({ default: m.WeightTrendChart }))
);
const LazyMacroDistributionChart = React.lazy(() =>
  import('@/components/charts/AnalyticsCharts').then(m => ({ default: m.MacroDistributionChart }))
);
const LazyMonthlyProgressChart = React.lazy(() =>
  import('@/components/charts/AnalyticsCharts').then(m => ({ default: m.MonthlyProgressChart }))
);

function dateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

export const Analytics = () => {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const DAY_NAMES = t.dayNames.split(',');
  const MONTH_NAMES = t.monthNames.split(',');

  const today = useMemo(() => new Date(), []);
  const weekAgo = useMemo(() => { const d = new Date(today); d.setDate(d.getDate() - 6); return d; }, [today]);

  const { data: weeklyLogs = [], isLoading: logsLoading } = useQuery<DailyHealthLog[]>({
    queryKey: queryKeys.health.weeklyLogs(),
    queryFn: () => healthAPI.getDailyLogRange(dateStr(weekAgo), dateStr(today)),
    staleTime: staleTime.dynamic,
  });

  const { data: macroSummary } = useQuery({
    queryKey: ['health', 'macro-summary', dateStr(weekAgo), dateStr(today)],
    queryFn: () => healthAPI.getMacroSummary(dateStr(weekAgo), dateStr(today)),
    staleTime: staleTime.dynamic,
  });

  const { data: fastingHistory = [], isLoading: fastingLoading } = useQuery<FastingLog[]>({
    queryKey: queryKeys.health.fastingHistory(),
    queryFn: () => healthAPI.getFastingHistory(),
    staleTime: staleTime.dynamic,
  });

  const { data: allAchievements = [] } = useQuery<Achievement[]>({
    queryKey: queryKeys.health.achievements(),
    queryFn: () => healthAPI.getAchievements(),
    staleTime: staleTime.static,
  });

  const { data: myAchievements = [] } = useQuery<UserAchievement[]>({
    queryKey: queryKeys.health.userAchievements(),
    queryFn: () => healthAPI.getMyAchievements(),
    staleTime: staleTime.dynamic,
  });

  const loading = logsLoading || fastingLoading;

  const weightData = useMemo(() => {
    const today = new Date();
    const profileWeight = user?.weightKg ? Number(user.weightKg) : 0;
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const log = weeklyLogs.find(l => l.date === dateStr(d));
      return {
        day: DAY_NAMES[d.getDay()],
        weight: profileWeight,
        calories: log?.caloriesConsumed ?? 0,
      };
    });
  }, [weeklyLogs, DAY_NAMES, user?.weightKg]);

  const macroData = useMemo(() => {
    const totalProtein = macroSummary?.proteinGrams
      || weeklyLogs.reduce((s, l) => s + Number((l as any).proteinGrams || 0), 0);
    const totalCarbs = macroSummary?.carbsGrams
      || weeklyLogs.reduce((s, l) => s + Number((l as any).carbsGrams || 0), 0);
    const totalFat = macroSummary?.fatGrams
      || weeklyLogs.reduce((s, l) => s + Number((l as any).fatGrams || 0), 0);
    const total = totalProtein + totalCarbs + totalFat || 1;
    return [
      { name: t.proteinMacro, value: Math.round((totalProtein / total) * 100), color: '#ef4444' },
      { name: t.carbsMacro, value: Math.round((totalCarbs / total) * 100), color: '#3b82f6' },
      { name: t.fatMacro, value: Math.round((totalFat / total) * 100), color: '#f59e0b' },
    ];
  }, [macroSummary, weeklyLogs, t]);

  const monthlyProgress = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
      const monthNum = monthDate.getMonth();
      const year = monthDate.getFullYear();
      const fastingDays = fastingHistory.filter(f => {
        if (!f.completed) return false;
        const d = new Date(f.startedAt);
        return d.getMonth() === monthNum && d.getFullYear() === year;
      }).length;
      return { month: MONTH_NAMES[monthNum], fastingDays };
    });
  }, [fastingHistory, MONTH_NAMES]);

  const earnedIds = useMemo(() => new Set(myAchievements.map(a => a.achievementId)), [myAchievements]);

  const avgCalories = useMemo(() => {
    const withData = weeklyLogs.filter(l => l.caloriesConsumed > 0);
    if (withData.length === 0) return 0;
    return Math.round(withData.reduce((s, l) => s + l.caloriesConsumed, 0) / withData.length);
  }, [weeklyLogs]);

  const thisMonthFasting = useMemo(() => {
    const now = new Date();
    return fastingHistory.filter(f => {
      if (!f.completed) return false;
      const d = new Date(f.startedAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [fastingHistory]);

  const totalLogs = weeklyLogs.length;

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="bg-card border-b border-border px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              {t.statsAndAnalysis}
            </h1>
            <p className="text-muted-foreground">{t.detailedProgress}</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="card-modern">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{totalLogs}</div>
              <div className="text-sm text-muted-foreground">{t.weeklyLog}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-xs text-success">{t.last7Days}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{myAchievements.length}</div>
              <div className="text-sm text-muted-foreground">{t.achievementCount}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Target className="h-3 w-3 text-success" />
                <span className="text-xs text-success">{t.achievementsEarned}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{thisMonthFasting}</div>
              <div className="text-sm text-muted-foreground">{t.fastingDay}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Zap className="h-3 w-3 text-warning" />
                <span className="text-xs text-warning">{t.thisMonth}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{avgCalories > 0 ? avgCalories.toLocaleString(locale) : '\u2014'}</div>
              <div className="text-sm text-muted-foreground">{t.avgCalories}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Calendar className="h-3 w-3 text-primary" />
                <span className="text-xs text-primary">{t.daily}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t.weeklyTrend}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weightData.some(d => d.calories > 0) ? (
              <Suspense fallback={<LoadingSkeleton className="h-[200px] w-full" />}>
                <LazyWeightTrendChart data={weightData} />
              </Suspense>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                {t.notEnoughData}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader>
            <CardTitle>{t.macroDistribution}</CardTitle>
          </CardHeader>
          <CardContent>
            {macroData.some(m => m.value > 0) ? (
              <div className="flex items-center justify-between">
                <Suspense fallback={<LoadingSkeleton className="h-[150px] w-[60%]" />}>
                  <LazyMacroDistributionChart data={macroData} />
                </Suspense>
                <div className="space-y-2">
                  {macroData.map((macro, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: macro.color }}></div>
                      <span className="text-sm font-medium">{macro.name}</span>
                      <span className="text-sm text-muted-foreground">{macro.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[150px] flex items-center justify-center text-muted-foreground">
                {t.noFoodRecords}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader>
            <CardTitle>{t.monthlyProgressTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyProgress.some(m => m.fastingDays > 0) ? (
              <Suspense fallback={<LoadingSkeleton className="h-[200px] w-full" />}>
                <LazyMonthlyProgressChart data={monthlyProgress} />
              </Suspense>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                {t.noFastingRecords}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              {t.achievementsSection}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allAchievements.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {allAchievements.map((achievement) => {
                  const isEarned = earnedIds.has(achievement.id);
                  return (
                    <div
                      key={achievement.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                        isEarned
                          ? 'border-success bg-success-light'
                          : 'border-muted bg-background-subtle'
                      }`}
                    >
                      <div className="text-2xl">{achievement.iconUrl || '\uD83C\uDFC6'}</div>
                      <div className="flex-1">
                        <div className="font-medium">{achievement.name}</div>
                        <div className="text-sm text-muted-foreground">{achievement.description}</div>
                      </div>
                      {isEarned && (
                        <Badge variant="secondary" className="bg-success text-white">
                          {t.completed}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                {t.noAchievementDef}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
