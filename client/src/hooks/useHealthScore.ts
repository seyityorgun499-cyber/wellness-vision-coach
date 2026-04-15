import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { healthAPI } from "@/lib/api";
import { queryKeys, staleTime } from "@/lib/queryKeys";
import { isToday } from "@/lib/utils";

export interface HealthScoreData {
  foodCount: number;
  activityCount: number;
  voiceCount: number;
  documentCount: number;
  waterMl: number;
  waterTarget: number;
  caloriesConsumed: number;
  caloriesTarget: number;
  proteinGrams: number;
  proteinTarget: number;
  dataReady: boolean;
}

export function useHealthScore(): HealthScoreData {
  const { data: foods = [], isSuccess: foodsReady } = useQuery({
    queryKey: queryKeys.health.foods(),
    queryFn: () => healthAPI.getFoodEntries(),
    staleTime: staleTime.dynamic,
  });

  const { data: activities = [], isSuccess: activitiesReady } = useQuery({
    queryKey: queryKeys.health.activities(),
    queryFn: () => healthAPI.getActivities(100),
    staleTime: staleTime.dynamic,
  });

  const { data: voices = [], isSuccess: voicesReady } = useQuery({
    queryKey: queryKeys.health.voices(),
    queryFn: () => healthAPI.getVoiceEntries(),
    staleTime: staleTime.dynamic,
  });

  const { data: documents = [], isSuccess: documentsReady } = useQuery({
    queryKey: queryKeys.health.documents(),
    queryFn: () => healthAPI.getDocuments(),
    staleTime: staleTime.static,
  });

  const { data: dailyLog, isSuccess: logReady } = useQuery({
    queryKey: queryKeys.health.dailyLog(),
    queryFn: () => healthAPI.getDailyLog(),
    staleTime: staleTime.dynamic,
  });

  const dataReady = foodsReady && activitiesReady && voicesReady && logReady;

  return useMemo(() => {
    const todayFoods      = (foods as any[]).filter((f: any) => isToday(f.loggedAt || f.createdAt || f.timestamp));
    const todayActivities = (activities as any[]).filter((a: any) => isToday(a.startedAt || a.createdAt || a.timestamp));
    const todayVoices     = (voices as any[]).filter((v: any) => isToday(v.createdAt || v.timestamp));

    const caloriesConsumed = todayFoods.reduce((s: number, f: any) => s + (Number(f.calories) || 0), 0);
    const proteinGrams     = todayFoods.reduce((s: number, f: any) => s + (Number(f.protein)  || 0), 0);

    const dl = dailyLog as any;
    const waterMl       = dl?.waterMl      ?? 0;
    const waterTarget   = dl?.waterTarget  || 2400;
    const caloriesTarget = dl?.caloriesTarget > 0 ? dl.caloriesTarget : 2100;
    const proteinTarget  = Number(dl?.proteinTarget) > 0 ? Number(dl.proteinTarget) : 180;

    return {
      foodCount:       todayFoods.length,
      activityCount:   todayActivities.length,
      voiceCount:      todayVoices.length,
      documentCount:   (documents as any[]).length,
      waterMl,
      waterTarget,
      caloriesConsumed,
      caloriesTarget,
      proteinGrams,
      proteinTarget,
      dataReady,
    };
  }, [foods, activities, voices, documents, dailyLog, dataReady]);
}
