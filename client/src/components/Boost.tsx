import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Zap, AlertTriangle, CheckCircle, ChevronRight,
  Dumbbell, Droplets, Utensils, Heart, Loader2,
  Pill, Flame, Beaker, Clock, CalendarDays, CalendarRange,
  Info, ChevronDown, ChevronUp, BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { healthAPI } from "@/lib/api";
import type { FoodEntry, ActivityEntry, DailyHealthLog, BloodTest, BloodTestResult } from "@/lib/api";
import { queryKeys, staleTime } from "@/lib/queryKeys";
import { SupplementTracker } from "@/components/SupplementTracker";
import { notificationService } from "@/services/NotificationService";
import { useAuth } from "@/contexts/AuthContext";
import { isWithinLastNDays } from "@/lib/utils";
import { calculatePersonalRDA, buildProfileFromUser } from "@/lib/nutrientRDA";
import { estimateWeeklyAverageMicronutrients } from "@/lib/foodNutrientEstimator";
import { calculateNutrientGaps, getDeficientNutrients, getOverallNutrientScore } from "@/lib/gapCalculator";
import {
  generateSupplementPlans, checkInteractions, buildDailySchedule,
} from "@/lib/supplementScheduler";
import type { SupplementPlan } from "@/lib/supplementScheduler";

type ViewTab = 'daily' | 'weekly' | 'monthly';

const ICON_MAP: Record<string, typeof Zap> = {
  Vitamin: Pill,
  Mineral: Beaker,
  'Yağ Asidi': Heart,
  Sindirim: Utensils,
  Protein: Dumbbell,
};

// ── Component ────────────────────────────────────────────

export const Boost = () => {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<ViewTab>('daily');
  const [showSchedule, setShowSchedule] = useState(false);
  const [showNutrientBars, setShowNutrientBars] = useState(false);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('boost-tracked');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  // ── Fetch real data from DB ──
  const { data: foods = [], isLoading: foodLoading } = useQuery<FoodEntry[]>({
    queryKey: queryKeys.health.foods(),
    queryFn: () => healthAPI.getFoodEntries(),
    staleTime: staleTime.dynamic,
  });

  const { data: activities = [], isLoading: actLoading } = useQuery<ActivityEntry[]>({
    queryKey: queryKeys.health.activities(),
    queryFn: () => healthAPI.getActivities(50),
    staleTime: staleTime.dynamic,
  });

  const { data: dailyLog, isLoading: logLoading } = useQuery<DailyHealthLog | null>({
    queryKey: queryKeys.health.dailyLog(),
    queryFn: () => healthAPI.getDailyLog(),
    staleTime: staleTime.dynamic,
  });

  const { data: bloodTests = [], isLoading: btLoading } = useQuery<BloodTest[]>({
    queryKey: ["blood-tests"],
    queryFn: () => healthAPI.getBloodTests(),
    staleTime: staleTime.static,
  });

  // Fetch latest blood test with detailed results
  const latestBT = bloodTests[0];
  const { data: bloodTestDetail } = useQuery<BloodTest>({
    queryKey: ["blood-test-detail", latestBT?.id],
    queryFn: () => healthAPI.getBloodTest(latestBT!.id),
    enabled: !!latestBT?.id,
    staleTime: staleTime.static,
  });

  const loading = foodLoading || actLoading || logLoading || btLoading;

  // ── Personal RDA ──
  const personalProfile = useMemo(() => {
    if (!user) return null;
    return buildProfileFromUser({
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      weightKg: user.weightKg,
      heightCm: user.heightCm,
      activityLevel: user.activityLevel,
    });
  }, [user]);

  const personalRDAs = useMemo(() => {
    if (!personalProfile) return [];
    return calculatePersonalRDA(personalProfile);
  }, [personalProfile]);

  // ── Food micronutrient estimation (7-day average) ──
  const recentFoods = useMemo(
    () => foods.filter(f => isWithinLastNDays(f.loggedAt || f.createdAt, 7)),
    [foods],
  );

  const avgDailyMicros = useMemo(
    () => estimateWeeklyAverageMicronutrients(
      recentFoods.map(f => ({
        foodName: f.foodName,
        calories: f.calories || 0,
        proteinGrams: f.proteinGrams,
        fatGrams: f.fatGrams,
        fiberGrams: f.fiberGrams,
      })),
      7,
    ),
    [recentFoods],
  );

  // ── Blood test results ──
  const btResults = useMemo(() => bloodTestDetail?.results ?? [], [bloodTestDetail]);
  const btAge = latestBT?.testDate
    ? Math.floor((Date.now() - new Date(latestBT.testDate).getTime()) / 86400000)
    : null;

  // ── GAP calculation ──
  const nutrientGaps = useMemo(
    () => calculateNutrientGaps(personalRDAs, avgDailyMicros, btResults),
    [personalRDAs, avgDailyMicros, btResults],
  );

  const deficientNutrients = useMemo(() => getDeficientNutrients(nutrientGaps), [nutrientGaps]);
  const nutrientScore = useMemo(() => getOverallNutrientScore(nutrientGaps), [nutrientGaps]);

  // ── Supplement plans ──
  const supplementPlans = useMemo(() => generateSupplementPlans(nutrientGaps), [nutrientGaps]);
  const interactions = useMemo(() => checkInteractions(supplementPlans), [supplementPlans]);
  const dailySchedule = useMemo(() => buildDailySchedule(supplementPlans), [supplementPlans]);

  // ── Legacy context analysis (for activity/hydration/sleep extras) ──
  const contextAnalysis = useMemo(() => {
    const recentActivities = activities.filter(a => isWithinLastNDays(a.startedAt || a.createdAt, 7));
    const waterMl = (dailyLog as any)?.waterMl ?? 0;
    const waterTarget = (dailyLog as any)?.waterTarget ?? 2400;
    const sleepMinutes = (dailyLog as any)?.sleepMinutes ?? null;
    const weeklyActivityMinutes = recentActivities.reduce(
      (s: number, a: any) => s + (a.durationMinutes ?? 0), 0
    );
    return { waterMl, waterTarget, sleepMinutes, weeklyActivityMinutes, recentFoodCount: recentFoods.length };
  }, [activities, dailyLog, recentFoods]);

  // ── Tracking ──
  const toggleTracked = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTrackedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem('boost-tracked', JSON.stringify([...next])); } catch { /* noop */ }

      const tracked = supplementPlans.filter(s => next.has(s.id));
      notificationService.scheduleSupplementReminders(
        tracked.map(s => ({ name: s.supplementName, timing: s.bestTimeLabel }))
      ).catch(() => {});

      return next;
    });
  };

  // ── Grouping ──
  const bloodBased = supplementPlans.filter(s => s.bloodTestBased);
  const highPriority = supplementPlans.filter(s => s.priority === "high" && !s.bloodTestBased);
  const mediumPriority = supplementPlans.filter(s => s.priority === "medium");
  const lowPriority = supplementPlans.filter(s => s.priority === "low");

  const getPriorityColor = (p: string) =>
    p === "high" ? "destructive" : p === "medium" ? "default" : "secondary";
  const getPriorityLabel = (p: string) =>
    p === "high" ? "Yüksek Öncelik" : p === "medium" ? "Orta Öncelik" : "Düşük Öncelik";

  const getTabDosage = (plan: SupplementPlan) => {
    if (viewTab === 'weekly') return plan.weeklyTotal;
    if (viewTab === 'monthly') return plan.monthlyTotal;
    return plan.dosagePerIntake;
  };
  const getTabLabel = () => {
    if (viewTab === 'weekly') return 'Haftalık';
    if (viewTab === 'monthly') return 'Aylık';
    return 'Günlük';
  };

  // ── Fulfillment bar color ──
  const getFulfillColor = (pct: number) => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 50) return 'bg-yellow-500';
    if (pct >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // ── Render supplement card ──
  const renderCard = (plan: SupplementPlan) => {
    const Icon = ICON_MAP[plan.category] ?? Pill;
    const isExpanded = expandedId === plan.id;

    return (
      <Card
        key={plan.id}
        className="cursor-pointer transition-all"
        onClick={() => setExpandedId(isExpanded ? null : plan.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0 mt-0.5">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="font-semibold text-sm">{plan.supplementName}</h3>
                <Badge variant={getPriorityColor(plan.priority) as any}>
                  {getPriorityLabel(plan.priority)}
                </Badge>
              </div>

              {/* Fulfillment bar */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getFulfillColor(plan.fulfillmentPercent)}`}
                    style={{ width: `${Math.min(100, plan.fulfillmentPercent)}%` }}
                  />
                </div>
                <span className="text-xs font-medium w-10 text-right">%{plan.fulfillmentPercent}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {plan.nameTR}: beslenmeyle günlük ihtiyacın %{plan.fulfillmentPercent}'i karşılanıyor
              </p>

              <p className="text-sm mt-2">{plan.reason}</p>

              {isExpanded && (
                <div className="mt-3 space-y-3 border-t pt-3">
                  {/* Dosage by period */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className={`p-2 rounded-lg ${viewTab === 'daily' ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-muted/50'}`}>
                      <p className="text-xs font-bold">{plan.dosagePerIntake}</p>
                      <p className="text-[10px] text-muted-foreground">Günlük</p>
                    </div>
                    <div className={`p-2 rounded-lg ${viewTab === 'weekly' ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-muted/50'}`}>
                      <p className="text-xs font-bold">{plan.weeklyTotal}</p>
                      <p className="text-[10px] text-muted-foreground">Haftalık</p>
                    </div>
                    <div className={`p-2 rounded-lg ${viewTab === 'monthly' ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-muted/50'}`}>
                      <p className="text-xs font-bold">{plan.monthlyTotal}</p>
                      <p className="text-[10px] text-muted-foreground">Aylık</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frekans:</span>
                      <span className="font-medium">{plan.frequencyLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Zamanlama:</span>
                      <span className="font-medium">{plan.bestTimeLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yemekle:</span>
                      <span className="font-medium">{plan.withFood ? 'Evet' : 'Hayır (aç karnına)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Eksik miktar:</span>
                      <span className="font-medium">{plan.gapAmount} {plan.unit}/gün</span>
                    </div>
                  </div>

                  {plan.interactions.length > 0 && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5">
                      <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 mb-1">Etkileşim Uyarıları:</p>
                      {plan.interactions.map((int, i) => (
                        <p key={i} className="text-[11px] text-amber-600 dark:text-amber-300">• {int}</p>
                      ))}
                    </div>
                  )}

                  {plan.tips.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-muted-foreground">İpuçları:</p>
                      {plan.tips.map((tip, i) => (
                        <p key={i} className="text-[11px] text-muted-foreground">• {tip}</p>
                      ))}
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant={trackedIds.has(plan.id) ? "secondary" : "default"}
                    className="w-full mt-2"
                    onClick={(e) => toggleTracked(plan.id, e)}
                  >
                    {trackedIds.has(plan.id) ? (
                      <><CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Takip Ediliyor</>
                    ) : (
                      <><Zap className="h-3.5 w-3.5 mr-1.5" /> Almaya Başla</>
                    )}
                  </Button>
                </div>
              )}

              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <ChevronRight className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                <span className="ml-1">{isExpanded ? "Daralt" : "Detaylar"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ── Render ──
  if (loading) {
    return (
      <div className="page-container pb-20">
        <div className="max-w-md mx-auto px-4 py-6 flex flex-col items-center justify-center gap-3 min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verileriniz analiz ediliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pb-20">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Boost</h1>
            <p className="text-sm text-muted-foreground">
              Kişisel RDA analizi ile akıllı takviye önerileri
            </p>
          </div>
        </div>

        {/* Nutrient Score */}
        <Card className={nutrientScore >= 70 ? 'border-green-500/30 bg-green-500/5' : nutrientScore >= 40 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-red-500/30 bg-red-500/5'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="3"
                    strokeDasharray={`${nutrientScore}, 100`}
                    className={nutrientScore >= 70 ? 'stroke-green-500' : nutrientScore >= 40 ? 'stroke-yellow-500' : 'stroke-red-500'}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                  {nutrientScore}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Besin Karşılama Skoru</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {personalProfile
                    ? `${personalProfile.age} yaş, ${personalProfile.gender === 'male' ? 'Erkek' : 'Kadın'}, ${personalProfile.weightKg}kg`
                    : 'Profil bilgisi eksik'}
                  {' · '}
                  {deficientNutrients.length > 0
                    ? `${deficientNutrients.length} besin eksikliği tespit edildi`
                    : 'Tüm besinler yeterli'}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {contextAnalysis.recentFoodCount} öğün (7 gün)
                  {btResults.length > 0 && ` · Kan tahlili${btAge !== null ? ` (${btAge} gün önce)` : ''}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplement Tracker */}
        {trackedIds.size > 0 && (
          <SupplementTracker
            trackedSupplements={supplementPlans
              .filter(s => trackedIds.has(s.id))
              .map(s => ({ id: s.id, name: s.supplementName, dosage: s.dosagePerIntake, timing: s.bestTimeLabel }))}
            onRemove={(id) => {
              setTrackedIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                try { localStorage.setItem('boost-tracked', JSON.stringify([...next])); } catch { /* noop */ }
                return next;
              });
            }}
          />
        )}

        {/* Period tabs */}
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          {([
            { key: 'daily' as ViewTab, label: 'Günlük', icon: Clock },
            { key: 'weekly' as ViewTab, label: 'Haftalık', icon: CalendarDays },
            { key: 'monthly' as ViewTab, label: 'Aylık', icon: CalendarRange },
          ]).map(({ key, label, icon: TabIcon }) => (
            <button
              key={key}
              onClick={() => setViewTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                viewTab === key
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TabIcon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Nutrient fulfillment bars (collapsible) */}
        <Card>
          <CardContent className="p-0">
            <button
              className="w-full flex items-center justify-between p-4"
              onClick={() => setShowNutrientBars(!showNutrientBars)}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Besin Karşılama Oranları</span>
              </div>
              {showNutrientBars
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {showNutrientBars && (
              <div className="px-4 pb-4 space-y-2">
                {nutrientGaps
                  .filter(g => g.nutrient !== 'iodine' && g.nutrient !== 'selenium')
                  .sort((a, b) => a.fulfillmentPercent - b.fulfillmentPercent)
                  .map(gap => (
                    <div key={gap.nutrient} className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className={gap.needsSupplement ? 'font-medium' : 'text-muted-foreground'}>
                          {gap.nameTR}
                        </span>
                        <span className="text-muted-foreground">
                          {viewTab === 'daily' && `${gap.dailyIntake}/${gap.dailyRDA} ${gap.unit}`}
                          {viewTab === 'weekly' && `${gap.weeklyIntake}/${gap.weeklyRDA} ${gap.unit}`}
                          {viewTab === 'monthly' && `${gap.monthlyIntake}/${gap.monthlyRDA} ${gap.unit}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getFulfillColor(gap.fulfillmentPercent)}`}
                            style={{ width: `${Math.min(100, gap.fulfillmentPercent)}%` }}
                          />
                        </div>
                        <span className="text-[10px] w-8 text-right text-muted-foreground">%{gap.fulfillmentPercent}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily schedule (collapsible) */}
        {dailySchedule.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <button
                className="w-full flex items-center justify-between p-4"
                onClick={() => setShowSchedule(!showSchedule)}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Günlük Alım Programı</span>
                </div>
                {showSchedule
                  ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
              {showSchedule && (
                <div className="px-4 pb-4 space-y-3">
                  {dailySchedule.map((slot) => (
                    <div key={slot.time} className="flex gap-3">
                      <div className="w-1 rounded-full bg-primary/30 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-primary">{slot.timeLabel}</p>
                        {slot.supplements.map((sup, i) => (
                          <div key={i} className="flex items-center justify-between mt-1">
                            <span className="text-xs">{sup.name}</span>
                            <span className="text-[10px] text-muted-foreground">{sup.dosage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Interaction warnings */}
        {interactions.length > 0 && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Etkileşim Uyarıları</p>
                  {interactions.map((w, i) => (
                    <p key={i} className="text-[11px] text-amber-600 dark:text-amber-300 mt-1">
                      • {w.warning}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data sources */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={contextAnalysis.recentFoodCount > 0 ? "default" : "secondary"} className="text-xs">
            <Utensils className="h-3 w-3 mr-1" /> Beslenme {contextAnalysis.recentFoodCount > 0 ? `(${contextAnalysis.recentFoodCount})` : "(veri yok)"}
          </Badge>
          <Badge variant={contextAnalysis.weeklyActivityMinutes > 0 ? "default" : "secondary"} className="text-xs">
            <Flame className="h-3 w-3 mr-1" /> Aktivite {contextAnalysis.weeklyActivityMinutes > 0 ? `(${contextAnalysis.weeklyActivityMinutes}dk)` : "(veri yok)"}
          </Badge>
          <Badge variant={contextAnalysis.waterMl > 0 ? "default" : "secondary"} className="text-xs">
            <Droplets className="h-3 w-3 mr-1" /> Su {contextAnalysis.waterMl > 0 ? `(${contextAnalysis.waterMl}ml)` : "(veri yok)"}
          </Badge>
          <Badge variant={btResults.length > 0 ? "default" : "secondary"} className="text-xs">
            <Beaker className="h-3 w-3 mr-1" /> Kan Tahlili {btResults.length > 0 ? "" : "(yok)"}
          </Badge>
          <Badge variant={personalProfile ? "default" : "secondary"} className="text-xs">
            <Info className="h-3 w-3 mr-1" /> RDA {personalProfile ? `(${personalProfile.age}y/${personalProfile.gender === 'male' ? 'E' : 'K'})` : "(profil eksik)"}
          </Badge>
        </div>

        {/* Blood test based - highest priority */}
        {bloodBased.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Beaker className="h-4 w-4 text-red-600" />
              <h2 className="font-semibold text-sm">Kan Tahlili Bazlı ({getTabLabel()})</h2>
            </div>
            {bloodBased.map(renderCard)}
          </div>
        )}

        {highPriority.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <h2 className="font-semibold text-sm">Ciddi Eksiklikler ({getTabLabel()})</h2>
            </div>
            {highPriority.map(renderCard)}
          </div>
        )}

        {mediumPriority.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">Orta Düzey Eksiklikler ({getTabLabel()})</h2>
            </div>
            {mediumPriority.map(renderCard)}
          </div>
        )}

        {lowPriority.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-sm">Hafif Eksiklikler ({getTabLabel()})</h2>
            </div>
            {lowPriority.map(renderCard)}
          </div>
        )}

        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground text-center">
              RDA değerleri yaş, cinsiyet ve aktivite seviyenize göre kişiselleştirilmiştir (NIH/WHO).
              Besin alımı 7 günlük beslenme verilerinizden tahmin edilmektedir.
              Herhangi bir takviyeye başlamadan önce sağlık profesyonelinize danışınız.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
