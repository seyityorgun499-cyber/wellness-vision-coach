import { Clock, Play, Pause, RotateCcw, Flame, Droplets, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { healthAPI } from "@/lib/api";
import type { FastingLog } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { useLanguage } from "@/contexts/LanguageContext";

function calcStreak(history: FastingLog[]): number {
  const completed = history.filter(h => h.completed);
  if (completed.length === 0) return 0;
  const days = completed.map(h => new Date(h.startedAt).toDateString());
  const unique = [...new Set(days)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < unique.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (unique[i] === expected.toDateString()) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export const IntervalFasting = () => {
  const { t } = useLanguage();
  const [activeFast, setActiveFast] = useState<FastingLog | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(16 * 60 * 60);
  const [fastingGoal, setFastingGoal] = useState(16);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const initDone = useRef(false);
  const endAtRef = useRef<number | null>(null);
  const queryClient = useQueryClient();

  const fastingPlans = [
    { name: "12:12", hours: 12, description: t.fastingPlanBeginner },
    { name: "14:10", hours: 14, description: t.fastingPlanIntermediate },
    { name: "16:8", hours: 16, description: t.fastingPlanPopular },
    { name: "18:6", hours: 18, description: t.fastingPlanAdvanced },
    { name: "20:4", hours: 20, description: t.fastingPlanExpert }
  ];

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    (async () => {
      try {
        const [active, history] = await Promise.all([
          healthAPI.getActiveFasting().catch(() => null),
          healthAPI.getFastingHistory().catch(() => []),
        ]);
        setStreak(calcStreak(history));
        if (active) {
          setActiveFast(active);
          const hours = Number(String(active.fastingPlan).split(':')[0] || 16);
          setFastingGoal(hours);
          const endTime = new Date(active.targetEndAt).getTime();
          endAtRef.current = endTime;
          const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
          setTimeLeft(remaining);
          setIsActive(remaining > 0);
        }
      } catch { /* silent */ }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      if (endAtRef.current === null) return;
      const remaining = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        setIsActive(false);
        if (activeFast) {
          healthAPI.endFasting(activeFast.id).then(() => {
            setActiveFast(null);
            setStreak(s => s + 1);
            queryClient.invalidateQueries({ queryKey: queryKeys.health.fastingHistory() });
          }).catch(() => {});
        }
        toast.success(t.fastingCongrats);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, activeFast]);

  const startFasting = useCallback(async () => {
    setSaving(true);
    try {
      const plan = `${fastingGoal}:${24 - fastingGoal}` as any;
      const created = await healthAPI.startFasting({ fastingPlan: plan });
      setActiveFast(created);
      const endTime = new Date(created.targetEndAt).getTime();
      endAtRef.current = endTime;
      setTimeLeft(Math.max(0, Math.round((endTime - Date.now()) / 1000)));
      setIsActive(true);
      toast.success(t.fastingStarted);
    } catch (err: any) {
      toast.error(err?.message || t.fastingStartFailed);
    }
    setSaving(false);
  }, [fastingGoal, t]);

  const pauseFasting = () => {
    setIsActive(false);
    toast.info(t.fastingPaused);
  };

  const resetFasting = useCallback(async () => {
    if (activeFast) {
      setSaving(true);
      try {
        await healthAPI.endFasting(activeFast.id);
        queryClient.invalidateQueries({ queryKey: queryKeys.health.fastingHistory() });
      } catch { /* silent */ }
      setSaving(false);
    }
    setActiveFast(null);
    setIsActive(false);
    setTimeLeft(fastingGoal * 60 * 60);
    toast.info(t.fastingReset);
  }, [activeFast, fastingGoal, t]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalSeconds = fastingGoal * 60 * 60;
    const elapsedSeconds = totalSeconds - timeLeft;
    return Math.min(100, (elapsedSeconds / totalSeconds) * 100);
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasActiveFast = !!activeFast;

  return (
    <div className="page-container">
      <div className="bg-card border-b border-border px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              {t.intermittentFasting}
            </h1>
            <p className="text-muted-foreground">{t.fastingSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t.currentFast} ({fastingGoal}:{24-fastingGoal})</span>
            <Badge variant="secondary" className="bg-primary-light text-primary">
              {streak} {t.dayStreak}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative mx-auto w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted opacity-20" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 45}`} strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`} className="text-primary transition-all duration-1000" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-primary">{formatTime(timeLeft)}</div>
              <div className="text-sm text-muted-foreground">
                {timeLeft > 0 ? t.timeRemaining : t.fastingComplete}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t.progress}</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
            <Progress value={getProgress()} className="h-3" />
          </div>

          <div className="flex gap-3 justify-center">
            {!hasActiveFast && !isActive && (
              <Button onClick={startFasting} disabled={saving} className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                {t.startFast}
              </Button>
            )}

            {isActive && (
              <Button variant="outline" onClick={pauseFasting} className="flex-1">
                <Pause className="h-4 w-4 mr-2" />
                {t.pauseFast}
              </Button>
            )}

            {hasActiveFast && !isActive && timeLeft > 0 && (
              <Button onClick={() => setIsActive(true)} className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground">
                <Play className="h-4 w-4 mr-2" />
                {t.resumeFast}
              </Button>
            )}

            {hasActiveFast && (
              <Button variant="outline" onClick={resetFasting} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}
                {t.endFast}
              </Button>
            )}
          </div>

          {isActive && (
            <div className="text-center p-3 bg-success-light rounded-lg">
              <div className="text-sm font-medium text-success">
                {t.fastingActive}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

        <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t.fastingPlans}
            {hasActiveFast && (
              <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {t.fastingLockedHint ?? 'Locked during fast'}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {fastingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`p-4 rounded-lg border-2 transition-all ${
                  hasActiveFast
                    ? 'opacity-50 cursor-not-allowed border-muted'
                    : fastingGoal === plan.hours
                    ? 'border-primary bg-primary-light cursor-pointer'
                    : 'border-muted hover:border-primary-light cursor-pointer'
                }`}
                onClick={() => {
                  if (hasActiveFast) return;
                  setFastingGoal(plan.hours);
                  setTimeLeft(plan.hours * 60 * 60);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-semibold ${hasActiveFast ? 'text-muted-foreground' : ''}`}>{plan.name}</div>
                    <div className="text-sm text-muted-foreground">{plan.description}</div>
                  </div>
                  <div className={`text-2xl font-bold ${hasActiveFast ? 'text-muted-foreground' : 'text-primary'}`}>{plan.hours}h</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

        <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {t.todayBenefits}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3 p-3 bg-background-subtle rounded-lg">
              <Flame className="h-6 w-6 text-orange-500" />
              <div>
                <div className="font-medium">{t.fatBurning}</div>
                <div className="text-sm text-muted-foreground">{t.metabolismBoosted}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background-subtle rounded-lg">
              <Droplets className="h-6 w-6 text-blue-500" />
              <div>
                <div className="font-medium">{t.detox}</div>
                <div className="text-sm text-muted-foreground">{t.cellsRenewing}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background-subtle rounded-lg">
              <Target className="h-6 w-6 text-green-500" />
              <div>
                <div className="font-medium">{t.focus}</div>
                <div className="text-sm text-muted-foreground">{t.mentalClarity}</div>
              </div>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
