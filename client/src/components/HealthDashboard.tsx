import { TrendingUp, Bell, Flame, Watch, Timer, Sparkles, LogOut, Utensils, Droplets, Activity, ChevronRight, MessageSquare } from "lucide-react";
import myoraLogo from "@/assets/myora-logo-cropped.png";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { useHealthData } from "@/hooks/useHealthData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from "react";
import type { ScoreCategory } from "@/components/ScoreBreakdownModal";
const ScoreBreakdownModal = lazy(() => import("@/components/ScoreBreakdownModal").then(m => ({ default: m.ScoreBreakdownModal })));
// Lazy load dashboard sections that are below the fold
const DailyQuests = lazy(() => import("@/components/DailyQuests").then(m => ({ default: m.DailyQuests })));
const MiniChallenges = lazy(() => import("@/components/MiniChallenges").then(m => ({ default: m.MiniChallenges })));
const AchievementsBadges = lazy(() => import("@/components/AchievementsBadges").then(m => ({ default: m.AchievementsBadges })));
const LevelBadge = lazy(() => import("@/components/LevelBadge").then(m => ({ default: m.LevelBadge })));
import { DailyTip } from "@/components/DailyTip";
import { healthAPI } from "@/lib/api";
import { useTabNavigate } from "@/hooks/useTabNavigate";
import { logger } from "@/lib/logger";
import { useHealthScore } from "@/hooks/useHealthScore";
import { useStreak } from "@/hooks/useStreak";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { haptic } from "@/lib/haptic";
interface HealthDashboardProps {
  onTabChange?: (tab: string) => void;
}
export const HealthDashboard = ({
  onTabChange: onTabChangeProp
}: HealthDashboardProps) => {
  const _tabNavigate = useTabNavigate();
  const onTabChange = onTabChangeProp ?? _tabNavigate;
  const { t, locale } = useLanguage();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const {
    healthData,
    getTodaysCalories,
    getTodaysProtein,
    getRecentActivities,
  } = useHealthData();

  const [isAnimating, setIsAnimating] = useState(false);
  const [showQuestCelebration, setShowQuestCelebration] = useState(false);
  const [lastActivityCount, setLastActivityCount] = useState(0);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const questCelebrationShownRef = useRef(false);
  const scoreAnimated = useRef(false);
  const recentActivities = useMemo(() => getRecentActivities(), [getRecentActivities]);
  const latestRecentActivityTimestamp = recentActivities[0]?.timestamp;

  const {
    foodCount: realFoodCount,
    activityCount: realActivityCount,
    voiceCount: realVoiceCount,
    documentCount: realDocumentCount,
    waterMl: realWaterMl,
    waterTarget: realWaterTarget,
    caloriesConsumed: realCaloriesConsumed,
    caloriesTarget: realCaloriesTarget,
    proteinGrams: realProteinGrams,
    proteinTarget: realProteinTarget,
    dataReady,
  } = useHealthScore();

  const streakData = useStreak();
  const queryClient = useQueryClient();

  // #5 Persistent fasting chip — lightweight query so it refreshes every 60s
  const { data: activeFasting } = useQuery({
    queryKey: queryKeys.health.fasting(),
    queryFn: () => healthAPI.getActiveFasting(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  // #6 Weekly summary card — only fetched on Mondays
  const isMonday = new Date().getDay() === 1;
  const lastWeekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  }, []);
  const lastWeekEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const { data: weeklyLogs } = useQuery({
    queryKey: ['health', 'weeklyLogs', lastWeekStart],
    queryFn: () => healthAPI.getDailyLogRange(lastWeekStart, lastWeekEnd),
    enabled: isMonday,
    staleTime: 3_600_000,
  });

  const weekSummary = useMemo(() => {
    if (!weeklyLogs || weeklyLogs.length === 0) return null;
    const totalCalories = weeklyLogs.reduce((s, l) => s + (l.caloriesConsumed ?? 0), 0);
    const avgCalories = Math.round(totalCalories / weeklyLogs.length);
    const totalSteps = weeklyLogs.reduce((s, l) => s + (l.steps ?? 0), 0);
    const totalWater = weeklyLogs.reduce((s, l) => s + (l.waterMl ?? 0), 0);
    const avgWater = Math.round(totalWater / weeklyLogs.length);
    const daysActive = weeklyLogs.filter(l => (l.caloriesConsumed ?? 0) > 0).length;
    return { avgCalories, totalSteps, avgWater, daysActive, days: weeklyLogs.length };
  }, [weeklyLogs]);

  // Fasting elapsed time helper
  const fastingElapsed = useMemo(() => {
    if (!activeFasting?.startedAt) return null;
    const start = new Date(activeFasting.startedAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const hrs = Math.floor(diffMs / 3_600_000);
    const mins = Math.floor((diffMs % 3_600_000) / 60_000);
    return `${hrs}h ${mins}m`;
  }, [activeFasting]);

  const addWaterMutation = useMutation({
    mutationFn: async () => {
      const currentMl = realWaterMl ?? 0;
      return healthAPI.updateDailyLog({ waterMl: currentMl + 300 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.health.dailyLog() });
      haptic.light();
    },
    onError: () => {
      haptic.error();
      toast({ title: t.waterLogFailed ?? "Could not update water intake", variant: "destructive" });
    },
  });

  // Check achievements after real score data is fetched
  useEffect(() => {
    if (realFoodCount === 0 && realActivityCount === 0 && realDocumentCount === 0) return;
    (async () => {
      try {
        const allQuestsComplete =
          realFoodCount > 0 &&
          realActivityCount > 0 &&
          realVoiceCount > 0 &&
          realWaterMl >= realWaterTarget;

        await healthAPI.checkAchievements({
          foodCount: realFoodCount,
          activityCount: realActivityCount,
          voiceCount: realVoiceCount,
          documentCount: realDocumentCount,
          waterGoalReached: realWaterMl >= realWaterTarget,
          currentStreak: streakData.currentStreak,
          allQuestsComplete,
        });
      } catch (err) { logger.warn('Achievement check failed:', err); }
    })();
  }, [realFoodCount, realActivityCount, realVoiceCount, realDocumentCount, realWaterMl, realWaterTarget, streakData.currentStreak]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const { error } = await signOut();
    if (error) {
      toast({
        title: t.error,
        description: t.signOutFailed,
        variant: "destructive",
      });
    }
    setIsSigningOut(false);
  };

  // #8: Trigger full-screen quest celebration when ALL quests complete for first time today
  useEffect(() => {
    if (!dataReady || questCelebrationShownRef.current) return;
    const allDone =
      realFoodCount > 0 && realActivityCount > 0 && realVoiceCount > 0 &&
      realWaterMl >= realWaterTarget;
    if (allDone) {
      questCelebrationShownRef.current = true;
      haptic.success();
      setShowQuestCelebration(true);
      setTimeout(() => setShowQuestCelebration(false), 3500);
    }
  }, [dataReady, realFoodCount, realActivityCount, realVoiceCount, realWaterMl, realWaterTarget]);


  // Track activity changes for animation with longer window and better detection
  const triggerCelebrationAnimation = useCallback(() => {
    logger.log('Starting celebration animation');
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
  }, []);

  useEffect(() => {
    const currentActivityCount = recentActivities.length;
    logger.log('Animation check:', {
      currentActivityCount,
      lastActivityCount,
      recentActivities: recentActivities.slice(0, 2),
      firstActivityTimestamp: latestRecentActivityTimestamp
    });
    
    // Check if there's a new activity (more activities than before)
    if (currentActivityCount > lastActivityCount && lastActivityCount > 0) {
      logger.log('Triggering animation - new activity detected');
      triggerCelebrationAnimation();
    }
    
    // Also check for very recent activities (within 30 seconds for navigation cases)
    const lastActivity = recentActivities[0];
    if (lastActivity) {
      const timeSinceLastActivity = Date.now() - new Date(lastActivity.timestamp).getTime();
      logger.log('Time since last activity:', timeSinceLastActivity, 'ms');
      if (timeSinceLastActivity < 30000 && lastActivityCount === 0) { // Initial load with recent activity
        logger.log('Triggering animation - recent activity on load');
        triggerCelebrationAnimation();
      }
    }
    
    setLastActivityCount(currentActivityCount);
  }, [recentActivities, latestRecentActivityTimestamp, lastActivityCount, triggerCelebrationAnimation]);

  const {
    dailyGoals
  } = healthData;
  const todaysCalories = realCaloriesConsumed || getTodaysCalories();
  const todaysProtein = realProteinGrams || getTodaysProtein();

  // Calculate progress metrics using real data
  const calTarget = realCaloriesTarget || dailyGoals.calories.target;
  const protTarget = realProteinTarget || dailyGoals.protein.target;
  const watTarget = realWaterTarget || dailyGoals.water.target;
  const watCurrent = realWaterMl || dailyGoals.water.current;
  const remainingCalories = Math.max(calTarget - todaysCalories, 0);
  const proteinProgress = Math.min(todaysProtein / protTarget * 100, 100);
  const waterProgress = Math.min(watCurrent / watTarget * 100, 100);

  // ═══════════════════════════════════════════════════════
  // MY SCORE — Weighted multi-category health score (REAL API DATA)
  // ═══════════════════════════════════════════════════════
  const haloScoreData = useMemo(() => {
    // Nutrition (30%): calorie balance + protein progress from real DB
    const realCalProg = realCaloriesTarget > 0 ? Math.min(realCaloriesConsumed / realCaloriesTarget * 100, 200) : 0;
    const calorieBalanceScore = Math.max(0, 100 - Math.abs(realCalProg - 100));
    const realProtProg = realProteinTarget > 0 ? Math.min(realProteinGrams / realProteinTarget * 100, 100) : 0;
    const nutritionScore = Math.round(calorieBalanceScore * 0.6 + realProtProg * 0.4);

    // Hydration (15%): water from daily log
    const realWaterProg = realWaterTarget > 0 ? Math.min(realWaterMl / realWaterTarget * 100, 100) : 0;
    const hydrationScore = Math.round(realWaterProg);

    // Activity (30%): real activity count today
    const rawActivityScore = Math.min(realActivityCount * 33, 100);
    const activityScore = Math.round(rawActivityScore);

    // Consistency (25%): how many categories logged today (food, activity, water, voice)
    const loggedCategories = [
      realFoodCount > 0,
      realActivityCount > 0,
      realWaterMl > 0,
      realVoiceCount > 0,
    ].filter(Boolean).length;
    const consistencyScore = Math.round((loggedCategories / 4) * 100);

    // Calculate weighted total (4 categories, no profile)
    const weights = { nutrition: 0.30, hydration: 0.15, activity: 0.30, consistency: 0.25 };
    const totalScore = Math.round(
      nutritionScore * weights.nutrition +
      hydrationScore * weights.hydration +
      activityScore * weights.activity +
      consistencyScore * weights.consistency
    );

    const categories: ScoreCategory[] = [
      {
        key: 'nutrition', label: t.nutritionLabel,
        score: nutritionScore, maxScore: 100, weight: weights.nutrition,
        icon: <Utensils className="h-4 w-4 text-white" />,
        color: 'bg-orange-500'
      },
      {
        key: 'hydration', label: t.waterLabel,
        score: hydrationScore, maxScore: 100, weight: weights.hydration,
        icon: <Droplets className="h-4 w-4 text-white" />,
        color: 'bg-blue-500'
      },
      {
        key: 'activity', label: t.activityLabel,
        score: activityScore, maxScore: 100, weight: weights.activity,
        icon: <Activity className="h-4 w-4 text-white" />,
        color: 'bg-green-500'
      },
      {
        key: 'consistency', label: t.consistencyLabel,
        score: consistencyScore, maxScore: 100, weight: weights.consistency,
        icon: <Flame className="h-4 w-4 text-white" />,
        color: 'bg-red-500'
      }
    ];

    return { totalScore: Math.min(totalScore, 100), categories };
  }, [realCaloriesConsumed, realCaloriesTarget, realProteinGrams, realProteinTarget, realWaterMl, realWaterTarget, realActivityCount, realFoodCount, realVoiceCount, t]);

  const healthScore = haloScoreData.totalScore;
  const healthScoreLabel = healthScore >= 80 ? t.statusVeryGood : healthScore >= 60 ? t.statusGood : healthScore >= 40 ? t.statusImprove : t.statusLow;
  const healthScoreTone = healthScore >= 80 ? "text-green-500" : healthScore >= 60 ? "text-primary" : healthScore >= 40 ? "text-yellow-500" : "text-red-500";
  const healthScoreHint = healthScore >= 80 ? t.hintVeryGood : healthScore >= 60 ? t.hintGood : healthScore >= 40 ? t.hintImprove : t.hintLow;

  // Score count-up animation
  useEffect(() => {
    if (healthScore > 0 && !scoreAnimated.current) {
      scoreAnimated.current = true;
      let current = 0;
      const step = Math.max(1, Math.floor(healthScore / 40));
      const timer = setInterval(() => {
        current += step;
        if (current >= healthScore) {
          current = healthScore;
          clearInterval(timer);
        }
        setAnimatedScore(current);
      }, 30);
      return () => clearInterval(timer);
    } else {
      setAnimatedScore(healthScore);
    }
  }, [healthScore]);

  // Gradient ring color based on score
  const ringGradientId = "haloScoreGradient";
  const getGradientStops = () => {
    if (healthScore >= 80) return { start: '#22c55e', end: '#10b981' }; // green
    if (healthScore >= 60) return { start: '#3b82f6', end: '#06b6d4' }; // blue-cyan
    if (healthScore >= 40) return { start: '#f59e0b', end: '#ef4444' }; // yellow-red
    return { start: '#ef4444', end: '#dc2626' }; // red
  };
  const gradientStops = getGradientStops();

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greeting;
    if (hour < 18) return t.greetingAfternoon;
    return t.greetingEvening;
  };

  // Context-aware hint shown below the date
  const contextHint = useMemo(() => {
    if (!dataReady) return null;
    const hour = new Date().getHours();
    const allQuestsDone =
      realFoodCount > 0 && realActivityCount > 0 && realVoiceCount > 0 &&
      realWaterMl >= realWaterTarget;
    if (allQuestsDone) return t.contextHintAllDone ?? 'All daily quests complete!';
    if (hour >= 6 && hour < 10 && realFoodCount === 0)
      return t.contextHintBreakfast ?? 'Time for breakfast — log your first meal!';
    if (hour >= 12 && hour < 14 && realFoodCount === 0)
      return t.contextHintLunch ?? 'Lunch time — haven\'t logged anything yet.';
    if (hour >= 14 && hour < 20 && realActivityCount === 0)
      return t.contextHintActivity ?? 'No activity logged yet — even a short walk counts!';
    if (streakData.currentStreak >= 3)
      return (t.contextHintStreak ?? '{{n}}-day streak — don\'t break it!').replace('{{n}}', String(streakData.currentStreak));
    return null;
  }, [dataReady, realFoodCount, realActivityCount, realVoiceCount, realWaterMl, realWaterTarget, streakData.currentStreak, t]);

  const today = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  return <div className="page-container bg-background">
      {/* Header with greeting */}
      <div className="bg-background px-4 pt-6 pb-2">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <img src={myoraLogo} alt="myora" className="w-28" data-testid="img-logo" />
            </div>
            <div className="flex items-center gap-1">
              <LanguageToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onTabChange('notifications')}
                data-testid="button-notifications"
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSignOutConfirm(true)}
                disabled={isSigningOut}
                data-testid="button-signout-quick"
              >
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
          
          {/* Personal Greeting — fades in after splash */}
          <div className="mb-4 animate-fade-in">
            <h2 className="text-xl font-bold text-foreground">
              {getGreeting()}, {user?.displayName?.split(' ')[0] || ''}
            </h2>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{today}</p>
              {/* Streak Badge */}
              {streakData.currentStreak > 0 && (
                <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-bold text-orange-500">{streakData.currentStreak}</span>
                  <span className="text-xs text-orange-500/70">{t.days}</span>
                </div>
              )}
            </div>
            {/* Fasting chip takes priority over context hint */}
            {activeFasting && fastingElapsed ? (
              <button
                className="mt-2 flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/25 rounded-full px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300 animate-fade-in hover:bg-violet-500/20 transition-colors"
                onClick={() => onTabChange('fasting')}
              >
                <Timer className="h-3.5 w-3.5" />
                <span>{t.fastingChipLabel ?? 'Fasting'}: {fastingElapsed}</span>
                <ChevronRight className="h-3 w-3 opacity-60" />
              </button>
            ) : contextHint ? (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary/80 animate-fade-in">
                <span>{contextHint}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-5">
        {/* Skeleton shimmer while initial data loads */}
        {!dataReady && (
          <div className="space-y-4 animate-fade-in">
            <CardSkeleton className="h-40" />
            <div className="grid grid-cols-4 gap-3">
              <CardSkeleton className="h-20" />
              <CardSkeleton className="h-20" />
              <CardSkeleton className="h-20" />
              <CardSkeleton className="h-20" />
            </div>
            <CardSkeleton className="h-32" />
          </div>
        )}

        {/* ═══ MY SCORE CARD ═══ */}
        {dataReady && (<>
        <div 
          className="rounded-xl border border-border bg-card p-5 shadow-card cursor-pointer active:scale-[0.99] transition-transform"
          onClick={() => setShowBreakdown(true)}
        >

          <div className="flex items-center gap-5">
            {/* Left: Score Ring */}
            <div className="relative w-28 h-28 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id={ringGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={gradientStops.start} />
                    <stop offset="100%" stopColor={gradientStops.end} />
                  </linearGradient>
                </defs>
                {/* Background track */}
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="7" opacity="0.4" />
                {/* Score arc */}
                <circle 
                  cx="50" cy="50" r="42" fill="none" 
                  stroke={`url(#${ringGradientId})`}
                  strokeWidth="7" 
                  strokeDasharray={`${2 * Math.PI * 42}`} 
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - healthScore / 100)}`} 
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Score number */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-black ${healthScoreTone} transition-all duration-500 ${
                  isAnimating ? 'scale-125' : ''
                }`}>
                  {animatedScore}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">/100</span>
              </div>

            </div>

            {/* Right: Score Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-muted-foreground">{t.healthScoreTitle}</h3>
                <Badge variant="secondary" className={`${healthScoreTone} bg-muted/60 border border-border text-[10px] px-1.5 py-0`}>
                  {healthScoreLabel}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {healthScoreHint}
              </p>

              {/* Category dot indicators */}
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-1">
                {haloScoreData.categories.slice(0, 4).map((cat) => (
                  <div key={cat.key} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${cat.color} flex-shrink-0`} />
                    <span className="text-[10px] text-muted-foreground font-medium">{cat.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1 mt-2 text-[10px] text-primary/70">
                <span>{t.tapForDetails}</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown Modal */}
        <Suspense fallback={null}>
          <ScoreBreakdownModal
            open={showBreakdown}
            onOpenChange={setShowBreakdown}
            categories={haloScoreData.categories}
            totalScore={healthScore}
          />
        </Suspense>

        {/* Sign-out confirmation dialog */}
        <AlertDialog open={showSignOutConfirm} onOpenChange={setShowSignOutConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.signOutConfirmTitle ?? 'Sign out?'}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.signOutConfirmBody ?? 'You will need to sign in again to access your data.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.cancel ?? 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => { setShowSignOutConfirm(false); handleSignOut(); }}
              >
                {t.signOut ?? 'Sign out'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        </>)}

        {/* ═══ DAILY TIP ═══ */}
        <DailyTip
          foodCount={realFoodCount}
          waterPercent={realWaterTarget > 0 ? Math.round(realWaterMl / realWaterTarget * 100) : 0}
          activityCount={realActivityCount}
          sleepMinutes={null}
          streak={streakData.currentStreak}
        />

        {/* Weekly Summary Card (Mondays) */}
        {isMonday && weekSummary && (
          <Card className="border border-border animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{t.weeklySummaryTitle ?? 'Last Week\'s Summary'}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-muted/40 rounded-xl p-2.5">
                  <p className="text-lg font-black text-primary">{weekSummary.avgCalories}</p>
                  <p className="text-[10px] text-muted-foreground">{t.weeklySummaryMeals ?? 'Avg kcal/day'}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-2.5">
                  <p className="text-lg font-black text-green-600">{weekSummary.daysActive}</p>
                  <p className="text-[10px] text-muted-foreground">{t.weeklySummaryActivities ?? 'Active days'}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-2.5">
                  <p className="text-lg font-black text-blue-500">{Math.round(weekSummary.avgWater / 300)}</p>
                  <p className="text-[10px] text-muted-foreground">{t.weeklySummaryAvgWater ?? 'Avg glasses/day'}</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                {(t.weeklySummaryOver ?? 'Over {{n}} days').replace('{{n}}', String(weekSummary.days))}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ═══ QUICK WATER LOG ═══ */}
        {dataReady && (() => {
          const glasses = realWaterTarget > 0 ? Math.round(realWaterMl / 300) : 0;
          const targetGlasses = Math.round((realWaterTarget || 2400) / 300);
          const pct = Math.min(100, (realWaterMl / (realWaterTarget || 2400)) * 100);
          const goalDone = realWaterMl >= (realWaterTarget || 2400);
          return (
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold text-foreground">{t.waterLabel ?? "Water"}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {glasses} / {targetGlasses} {t.waterGlassesUnit ?? "glasses"}
                </span>
              </div>

              <div className="h-2 rounded-full bg-muted mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center gap-1.5">
                {[...Array(Math.min(targetGlasses, 12))].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-7 rounded-lg flex items-center justify-center transition-all ${
                      i < glasses
                        ? "bg-blue-500/20 border border-blue-500/40"
                        : "bg-muted/50 border border-border"
                    }`}
                  >
                    <Droplets className={`h-2.5 w-2.5 ${i < glasses ? "text-blue-500" : "text-muted-foreground/30"}`} />
                  </div>
                ))}
              </div>

              <Button
                size="sm"
                variant={goalDone ? "outline" : "default"}
                className="w-full mt-3"
                onClick={() => addWaterMutation.mutate()}
                disabled={addWaterMutation.isPending}
              >
                <Droplets className="h-4 w-4 mr-1.5" />
                {goalDone
                  ? (t.waterGoalReached ?? "Goal reached! +1 glass")
                  : (t.addWaterGlass ?? "+ 1 glass  (300 ml)")}
              </Button>
            </div>
          );
        })()}

        {/* ═══ LEVEL BADGE ═══ */}
        <Suspense fallback={<CardSkeleton className="h-24" />}>
          <LevelBadge
            foodCount={realFoodCount}
            activityCount={realActivityCount}
            waterGlasses={realWaterTarget > 0 ? Math.round(realWaterMl / 300) : 0}
            voiceCount={realVoiceCount}
            streak={streakData.currentStreak}
          />
        </Suspense>

        {/* ═══ DAILY QUESTS ═══ */}
        <Suspense fallback={<CardSkeleton className="h-32" />}>
          <DailyQuests />
        </Suspense>

        {/* ═══ MINI CHALLENGES ═══ */}
        <Suspense fallback={<CardSkeleton className="h-32" />}>
          <MiniChallenges />
        </Suspense>

        {/* ═══ ACHIEVEMENTS BADGES ═══ */}
        <Suspense fallback={<CardSkeleton className="h-24" />}>
          <AchievementsBadges />
        </Suspense>

        {dataReady && (!user?.heightCm || !user?.weightKg) && (
          <div
            className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 rounded-xl px-4 py-3 cursor-pointer hover:bg-amber-100/80 dark:hover:bg-amber-950/30 transition-colors"
            onClick={() => onTabChange('profile')}
          >
            <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <Activity className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {t.profileNudgeTitle ?? 'Complete your profile'}
              </p>
              <p className="text-xs text-amber-700/70 dark:text-amber-400/60 truncate">
                {t.profileNudgeBody ?? 'Add your height & weight for more accurate health insights.'}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0" />
          </div>
        )}

        {/* Günlük Öneriler */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">{t.dailyRecommendations}</h3>
          <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide">
            {[
              { icon: Sparkles, title: t.calorieBalance, desc: t.calorieBalanceDesc.replace('{{remainingCalories}}', String(remainingCalories)) },
              { icon: Watch, title: t.waterGoal, desc: t.waterGoalDesc.replace('{{waterProgress}}', String(Math.round(waterProgress))) },
              { icon: TrendingUp, title: t.proteinTracking, desc: t.proteinTrackingDesc.replace('{{proteinProgress}}', String(Math.round(proteinProgress))) },
            ].map((rec) => {
              const Icon = rec.icon;
              return (
                <Card key={rec.title} className="min-w-[240px] snap-start shrink-0">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{rec.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{rec.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Health Tracking */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">{t.healthTracking}</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange('wearables')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <Watch className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t.devices}</div>
                    <div className="text-xs text-muted-foreground">{t.connectWearables}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange('fasting')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
                    <Timer className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t.fasting}</div>
                    <div className="text-xs text-muted-foreground">{t.trackIntermittent}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recently uploaded */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">{t.recentActivities}</h3>
          <div className="space-y-3">
            {recentActivities.slice(0, 2).map((activity, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                      <Flame className="h-4 w-4 text-success" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-foreground">{activity.description || t.mealEntry}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                        {' · '}{activity.calories || "0"} {t.calories}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {recentActivities.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground text-sm">{t.noRecentEntries}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.logFood}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Add Button */}
        
      </div>

      <button
        onClick={() => onTabChange('chat')}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Expert Chat"
      >
        <MessageSquare className="h-4.5 w-4.5" />
      </button>

      {/* #7 Streak Rescue — handled via native push notifications (scheduled in NotificationService) */}

      {showQuestCelebration && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 animate-fade-in pointer-events-none">
          <div className="bg-background rounded-2xl px-8 py-6 shadow-xl mx-4 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-semibold text-foreground">
              {t.questCelebrationTitle ?? 'All Quests Done!'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t.questCelebrationBody ?? 'You\'ve hit every goal today. Great work!'}
            </p>
          </div>
        </div>
      )}
    </div>;
};