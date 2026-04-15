import { Trophy, Lock, Utensils, Footprints, Droplets, Mic, Gift, Flame, Zap, Award, Star, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { healthAPI } from "@/lib/api";
import { useState, useEffect, useRef } from "react";

const emojiToIcon: Record<string, { icon: LucideIcon; color: string }> = {
  "🍽️": { icon: Utensils, color: "text-orange-500" },
  "🏃": { icon: Footprints, color: "text-green-500" },
  "💧": { icon: Droplets, color: "text-blue-500" },
  "🎤": { icon: Mic, color: "text-violet-500" },
  "🎁": { icon: Gift, color: "text-pink-500" },
  "🔥": { icon: Flame, color: "text-red-500" },
  "⚡": { icon: Zap, color: "text-yellow-500" },
  "⭐": { icon: Star, color: "text-yellow-500" },
  "🏆": { icon: Trophy, color: "text-amber-500" },
  "🥇": { icon: Award, color: "text-yellow-500" },
};

interface Achievement {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  category: string | null;
  points: number | null;
}

interface EarnedAchievement extends Achievement {
  achievementId: string;
  earnedAt: string;
}

export const AchievementsBadges = () => {
  const { t } = useLanguage();
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<EarnedAchievement[]>([]);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    (async () => {
      try {
        const [all, earned] = await Promise.all([
          healthAPI.getAchievements(),
          healthAPI.getMyAchievements(),
        ]);
        setAllAchievements((all || []) as Achievement[]);
        setEarnedAchievements((earned || []) as unknown as EarnedAchievement[]);
      } catch (e) {
        console.error("Achievement fetch error:", e);
      }
    })();
  }, []);

  const earnedIds = new Set(earnedAchievements.map((e) => e.achievementId));
  const earnedCount = earnedIds.size;
  const totalCount = allAchievements.length;

  if (totalCount === 0) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <h3 className="text-sm font-semibold text-foreground">{t.achievementsTitle}</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {earnedCount}/{totalCount} {t.achievementsEarned}
        </span>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-5 gap-2">
        {allAchievements.map((ach) => {
          const isEarned = earnedIds.has(ach.id);
          return (
            <div
              key={ach.id}
              className={`relative flex flex-col items-center rounded-xl p-2 transition-all ${
                isEarned
                  ? "bg-primary/5 border border-primary/20"
                  : "bg-muted/40 border border-transparent opacity-50"
              }`}
              title={`${ach.name}: ${ach.description || ""}`}
            >
              <span className="mb-0.5">
                {isEarned ? (() => {
                  const mapped = emojiToIcon[ach.iconUrl || ""];
                  const Icon = mapped?.icon || Trophy;
                  const iconColor = mapped?.color || "text-primary";
                  return <Icon className={`h-5 w-5 ${iconColor}`} />;
                })() : (
                  <Lock className="h-4 w-4 text-muted-foreground/40" />
                )}
              </span>
              <span className="text-[9px] text-center leading-tight font-medium text-foreground truncate w-full">
                {ach.name}
              </span>
              {isEarned && ach.points && (
                <span className="text-[8px] text-primary font-bold mt-0.5">
                  +{ach.points} {t.achievementsPoints}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
