import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { healthAPI } from "@/lib/api";
import { queryKeys, staleTime } from "@/lib/queryKeys";
import { notificationService } from "@/services/NotificationService";
import { logger } from "@/lib/logger";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

export function useStreak(): StreakData {
  const queryClient = useQueryClient();

  const { data } = useQuery<StreakData>({
    queryKey: queryKeys.health.streaks(),
    queryFn: async () => {
      await healthAPI.checkInStreak();
      const res = await healthAPI.getStreak();
      return {
        currentStreak: res?.currentStreak ?? 0,
        longestStreak: res?.longestStreak ?? 0,
      };
    },
    staleTime: staleTime.static,
  });

  useEffect(() => {
    if (data?.currentStreak !== undefined) {
      notificationService.initSmartNotifications(data.currentStreak).catch(() => {});
    }
  }, [data?.currentStreak]);

  return data ?? { currentStreak: 0, longestStreak: 0 };
}
