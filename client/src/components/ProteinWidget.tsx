import { Target, Plus, Minus, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHealthData } from "@/hooks/useHealthData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTabNavigate } from "@/hooks/useTabNavigate";

interface ProteinWidgetProps {
  onRemove: () => void;
  onTabChange?: (tab: string) => void;
}

export const ProteinWidget = ({ onRemove, onTabChange: onTabChangeProp }: ProteinWidgetProps) => {
  const _tabNavigate = useTabNavigate();
  const onTabChange = onTabChangeProp ?? _tabNavigate;
  const { healthData, updateDailyGoals } = useHealthData();
  const { t } = useLanguage();
  
  const current = healthData.dailyGoals.protein.current;
  const target = healthData.dailyGoals.protein.target;
  const progress = Math.min((current / target) * 100, 100);
  
  const updateProtein = (amount: number) => {
    const newAmount = Math.max(0, current + amount);
    updateDailyGoals({
      protein: { current: newAmount, target }
    });
  };
  
  return (
    <div className="cal-ai-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--macro-protein))' }}>
            <Target className="h-4 w-4 text-white" />
          </div>
          <span className="font-medium text-foreground">{t.protein} Tracker</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-foreground">{current}g</div>
          <div className="text-xs text-muted-foreground">of {target}g goal</div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateProtein(-5)}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateProtein(5)}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ backgroundColor: 'hsl(var(--macro-protein))', width: `${progress}%` }} 
        />
      </div>
      
      {/* Camera Button */}
      {onTabChange && (
        <Button
          onClick={() => onTabChange('camera')}
          className="w-full h-8 cal-ai-button-secondary flex items-center justify-center gap-2"
        >
          <Camera className="h-4 w-4" />
          <span className="text-sm">Take Photo</span>
        </Button>
      )}
    </div>
  );
};