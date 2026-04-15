import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Utensils, Droplets, Activity, Flame, Target, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemo } from "react";

export interface ScoreCategory {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  weight: number;
  icon: React.ReactNode;
  color: string;
}

interface ScoreBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ScoreCategory[];
  totalScore: number;
}

export const ScoreBreakdownModal = ({ open, onOpenChange, categories, totalScore }: ScoreBreakdownModalProps) => {
  const { t } = useLanguage();
  
  const weakest = categories.reduce((min, cat) => 
    (cat.score / cat.maxScore) < (min.score / min.maxScore) ? cat : min
  , categories[0]);

  const potentialScore = useMemo(() => {
    if (!weakest) return totalScore;
    const gain = (weakest.maxScore - weakest.score) * weakest.weight;
    return Math.min(100, Math.round(totalScore + gain));
  }, [weakest, totalScore]);

  const getScoreColor = (ratio: number) => {
    if (ratio >= 0.8) return "text-green-500";
    if (ratio >= 0.6) return "text-primary";
    if (ratio >= 0.4) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (ratio: number) => {
    if (ratio >= 0.8) return "bg-green-500";
    if (ratio >= 0.6) return "bg-primary";
    if (ratio >= 0.4) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {t.scoreBreakdown}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Total Score Section */}
          <div className="text-center py-3">
            <div className="text-5xl font-black text-primary">{totalScore}</div>
            <p className="text-xs text-muted-foreground mt-1">/ 100</p>
            {potentialScore > totalScore && (
              <div className="mt-2 inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  {(t.scorePotential ?? 'Complete {{cat}} → could reach {{n}}')
                    .replace('{{cat}}', weakest?.label ?? '')
                    .replace('{{n}}', String(potentialScore))}
                </span>
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3">
            {categories.map((cat) => {
              const ratio = cat.score / cat.maxScore;
              const isWeakest = cat.key === weakest?.key;
              const gap = Math.round(cat.maxScore - cat.score);
              return (
                <div
                  key={cat.key}
                  className={`rounded-xl p-3 border transition-all ${
                    isWeakest ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                        {cat.icon}
                      </div>
                      <div>
                        <span className="text-sm font-medium">{cat.label}</span>
                        {isWeakest && (
                          <Badge variant="outline" className="ml-2 text-[10px] border-yellow-500 text-yellow-600">
                            <Target className="h-2.5 w-2.5 mr-0.5" /> {t.focusOn}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${getScoreColor(ratio)}`}>
                        {Math.round(cat.score)}/{cat.maxScore}
                      </span>
                      {gap > 0 && (
                        <p className="text-[9px] text-muted-foreground">+{gap} possible</p>
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getProgressColor(ratio)}`}
                      style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {t.healthScoreTitle} ağırlık: %{Math.round(cat.weight * 100)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
