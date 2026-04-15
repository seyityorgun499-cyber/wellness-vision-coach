import { Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LevelBadgeProps {
  foodCount: number;
  activityCount: number;
  waterGlasses: number;
  voiceCount: number;
  streak: number;
}

interface LevelInfo {
  level: number;
  nameEn: string;
  nameTr: string;
  minXP: number;
  maxXP: number;
  color: string;
  bgColor: string;
}

const levels: LevelInfo[] = [
  { level: 1, nameEn: "Beginner", nameTr: "Baslangic", minXP: 0, maxXP: 99, color: "text-gray-500", bgColor: "bg-gray-500" },
  { level: 2, nameEn: "Bronze", nameTr: "Bronz", minXP: 100, maxXP: 299, color: "text-amber-700", bgColor: "bg-amber-700" },
  { level: 3, nameEn: "Silver", nameTr: "Gumus", minXP: 300, maxXP: 599, color: "text-gray-400", bgColor: "bg-gray-400" },
  { level: 4, nameEn: "Gold", nameTr: "Altin", minXP: 600, maxXP: 999, color: "text-yellow-500", bgColor: "bg-yellow-500" },
  { level: 5, nameEn: "Diamond", nameTr: "Elmas", minXP: 1000, maxXP: Infinity, color: "text-cyan-400", bgColor: "bg-cyan-400" },
];

export const LevelBadge = ({ foodCount, activityCount, waterGlasses, voiceCount, streak }: LevelBadgeProps) => {
  const { language } = useLanguage();
  const levelLabel = language === 'tr' ? 'Seviye' : 'Level';
  const maxLevelLabel = language === 'tr' ? 'Maksimum Seviye!' : 'Max Level!';

  const totalXP =
    (foodCount * 10) +
    (activityCount * 15) +
    (waterGlasses * 5) +
    (voiceCount * 10) +
    (streak * 20);

  const currentLevel = levels.find(l => totalXP >= l.minXP && totalXP <= l.maxXP) || levels[0];
  const nextLevel = levels.find(l => l.level === currentLevel.level + 1);
  const levelName = language === 'tr' ? currentLevel.nameTr : currentLevel.nameEn;
  const nextLevelName = nextLevel ? (language === 'tr' ? nextLevel.nameTr : nextLevel.nameEn) : '';

  const xpInCurrentLevel = totalXP - currentLevel.minXP;
  const xpNeededForNextLevel = nextLevel ? nextLevel.minXP - currentLevel.minXP : 0;
  const progressPercent = nextLevel
    ? Math.min((xpInCurrentLevel / xpNeededForNextLevel) * 100, 100)
    : 100;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 ${currentLevel.bgColor} rounded-xl flex items-center justify-center shrink-0`}>
          <Shield className="h-6 w-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-semibold text-foreground">{levelName}</span>
            <span className="text-xs text-muted-foreground">{levelLabel} {currentLevel.level}</span>
          </div>

          {nextLevel ? (
            <>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full ${currentLevel.bgColor} rounded-full transition-all duration-500`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground">
                {xpInCurrentLevel}/{xpNeededForNextLevel} XP → {nextLevelName}
              </div>
            </>
          ) : (
            <div className="text-xs text-muted-foreground font-medium">{maxLevelLabel}</div>
          )}
        </div>

        <div className="text-right shrink-0">
          <div className="text-xl font-bold text-foreground">{totalXP}</div>
          <div className="text-[10px] text-muted-foreground">XP</div>
        </div>
      </div>
    </div>
  );
};
