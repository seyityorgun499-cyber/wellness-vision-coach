/**
 * Myora – AI Sağlık Profili Bileşeni (Health Profile)
 * 
 * Tüm sağlık verilerini birleştirerek oluşturulan kişiselleştirilmiş sağlık profili.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatAPI, healthAPI, supplementAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  RefreshCw,
  ArrowLeft,
  Heart,
  Activity,
  Moon,
  Apple,
  Dumbbell,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Shield,
  Target,
  Pill,
} from "lucide-react";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorView } from "@/components/ui/error-view";

interface HealthProfileProps {
  onBack?: () => void;
}

export function HealthProfile({ onBack: onBackProp }: HealthProfileProps) {
  const navigate = useNavigate();
  const onBack = onBackProp ?? (() => navigate('/'));
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["health-profile"],
    queryFn: async () => {
      try {
        return await chatAPI.getHealthProfile() as any;
      } catch (err: any) {
        if (err?.code === 'PGRST301' || err?.status === 401 || err?.message?.includes('JWT')) {
          return null;
        }
        throw err;
      }
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const [foodEntries, activities, dailyLog, bloodTests, supplements] = await Promise.all([
          healthAPI.getFoodEntries(today).catch(() => []),
          healthAPI.getActivities(30).catch(() => []),
          healthAPI.getDailyLog(today).catch(() => null),
          healthAPI.getBloodTests().catch(() => []),
          supplementAPI.getRecommendations().catch(() => []),
        ]);

        const healthData = {
          userData: user,
          todayFood: (foodEntries as any[]).map((f: any) => ({
            foodName: f.foodName, mealType: f.mealType,
            calories: f.calories, protein: f.proteinGrams, carbs: f.carbsGrams, fat: f.fatGrams,
          })),
          todayWater: { currentMl: (dailyLog as any)?.waterMl ?? 0, targetMl: (dailyLog as any)?.waterTarget ?? 2400 },
          todaySleep: { minutes: (dailyLog as any)?.sleepMinutes ?? null, target: (dailyLog as any)?.sleepTarget ?? 480 },
          recentActivities: (activities as any[]).slice(0, 15).map((a: any) => ({
            type: a.activityType, duration: a.durationMinutes, calories: a.caloriesBurned, intensity: a.intensity,
          })),
          bloodTests: (bloodTests as any[]).slice(0, 3).map((bt: any) => ({
            date: bt.testDate, labName: bt.labName, summary: bt.aiSummary, status: bt.overallStatus,
          })),
          supplements: (supplements as any[]).map((s: any) => ({
            name: s.supplements?.name ?? s.supplementName, status: s.status, reason: s.reason,
          })),
        };

        return await chatAPI.generateHealthProfile(healthData);
      } catch (err: any) {
        if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
          throw new Error('Oturum süresi dolmuş olabilir. Lütfen uygulamayı yeniden açın.');
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-profile"] });
      toast.success('Sağlık profili güncellendi');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Sağlık profili oluşturulamadı');
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-bold">Sağlık Profilim</h1>
              <p className="text-xs text-muted-foreground">AI destekli kişisel sağlık analizi</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${generateMutation.isPending ? "animate-spin" : ""}`} />
            {generateMutation.isPending ? "Hesaplanıyor..." : "Güncelle"}
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <div className="grid grid-cols-3 gap-3">
              <CardSkeleton /><CardSkeleton /><CardSkeleton />
            </div>
            <CardSkeleton />
          </div>
        ) : isError ? (
          <ErrorView message={error instanceof Error ? error.message : 'Sağlık profili yüklenemedi'} onRetry={refetch} />
        ) : !profile ? (
          <div className="text-center py-20">
            <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-lg font-semibold mb-2">Henüz sağlık profiliniz oluşturulmadı</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Verilerinizi analiz ederek kişiselleştirilmiş sağlık profilinizi oluşturalım
            </p>
            <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
              <Sparkles className="h-4 w-4 mr-2" />
              {generateMutation.isPending ? "Oluşturuluyor..." : "Profil Oluştur"}
            </Button>
          </div>
        ) : (
          <>
            {/* Sağlık Skoru */}
            <Card className="overflow-hidden">
              <div className="bg-muted/40 p-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Genel Sağlık Skoru</p>
                <p className={`text-5xl font-bold ${getScoreColor(profile.healthScore || 0)}`}>
                  {profile.healthScore || "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">/100</p>
              </div>
            </Card>

            {/* Temel Metrikler */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">BMI</p>
                  <p className="text-xl font-bold">{profile.bmi || "—"}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">BMR</p>
                  <p className="text-xl font-bold">{profile.bmr || "—"}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">TDEE</p>
                  <p className="text-xl font-bold">{profile.tdee || "—"}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </CardContent>
              </Card>
            </div>

            {/* AI Özeti */}
            {profile.aiGeneratedSummary && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" /> AI Değerlendirmesi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{profile.aiGeneratedSummary}</p>
                </CardContent>
              </Card>
            )}

            {/* Güçlü Yanlar */}
            {profile.strengths && (Array.isArray(profile.strengths) ? profile.strengths : []).length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" /> Güçlü Yanlarınız
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {(Array.isArray(profile.strengths) ? profile.strengths : []).map((s: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-3 w-3 text-green-600 shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gelişim Alanları */}
            {profile.improvementAreas && (Array.isArray(profile.improvementAreas) ? profile.improvementAreas : []).length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-600" /> Gelişim Alanları
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {(Array.isArray(profile.improvementAreas) ? profile.improvementAreas : []).map((a: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-3 w-3 text-orange-600 shrink-0" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Beslenme Planı */}
            {profile.nutritionPlan && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Apple className="h-4 w-4 text-green-600" /> Beslenme Planı
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Günlük Kalori:</span>
                    <span className="font-bold">{(profile.nutritionPlan as any).dailyCalories} kcal</span>
                  </div>
                  {(profile.nutritionPlan as any).macroSplit && (
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                        <p className="font-bold text-blue-600">{(profile.nutritionPlan as any).macroSplit.protein}%</p>
                        <p>Protein</p>
                      </div>
                      <div className="p-2 rounded bg-yellow-50 dark:bg-yellow-900/20">
                        <p className="font-bold text-yellow-600">{(profile.nutritionPlan as any).macroSplit.carbs}%</p>
                        <p>Karbonhidrat</p>
                      </div>
                      <div className="p-2 rounded bg-red-50 dark:bg-red-900/20">
                        <p className="font-bold text-red-600">{(profile.nutritionPlan as any).macroSplit.fat}%</p>
                        <p>Yağ</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Egzersiz Planı */}
            {profile.exercisePlan && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-purple-600" /> Egzersiz Planı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">{(profile.exercisePlan as any).weeklyGoal}</p>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray((profile.exercisePlan as any).suggestedActivities)
                      ? (profile.exercisePlan as any).suggestedActivities
                      : typeof (profile.exercisePlan as any).suggestedActivities === 'string'
                        ? (profile.exercisePlan as any).suggestedActivities.split(/[,،;]+/).map((s: string) => s.trim()).filter(Boolean)
                        : []
                    ).map((a: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Takviye Önerileri */}
            {profile.supplementRecommendations && Array.isArray(profile.supplementRecommendations) && profile.supplementRecommendations.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Pill className="h-4 w-4 text-blue-600" /> Takviye Önerileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(profile.supplementRecommendations as any[]).map((s: any, i: number) => (
                    <div key={i} className="p-2 rounded-lg bg-muted/50 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.reason}</p>
                      </div>
                      <Badge variant={s.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                        {s.dosage}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Son güncelleme */}
            {profile.lastCalculatedAt && (
              <p className="text-xs text-center text-muted-foreground">
                Son güncelleme: {new Date(profile.lastCalculatedAt).toLocaleString("tr-TR")}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
