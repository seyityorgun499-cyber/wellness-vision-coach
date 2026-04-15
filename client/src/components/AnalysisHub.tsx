import { BarChart3, Brain, Watch, Activity, Pill, Users, HeartHandshake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTabNavigate } from "@/hooks/useTabNavigate";
import { useHealthScore } from "@/hooks/useHealthScore";
import React from "react";

interface AnalysisHubProps {
  onTabChange?: (tab: string) => void;
}

export const AnalysisHub = ({ onTabChange: onTabChangeProp }: AnalysisHubProps) => {
  const _tabNavigate = useTabNavigate();
  const onTabChange = onTabChangeProp ?? _tabNavigate;
  const { t } = useLanguage();
  const { foodCount, activityCount, waterMl, waterTarget, caloriesConsumed, dataReady } = useHealthScore();

  const waterPct = waterTarget > 0 ? Math.round((waterMl / waterTarget) * 100) : 0;

  const insights = [
    {
      id: "health-profile",
      title: t.healthProfile,
      description: t.healthProfileDesc,
      icon: Brain,
      stat: dataReady ? `${foodCount} ${t.foodLabel ?? "food"} today` : null,
    },
    {
      id: "wearable-data",
      title: t.wearableData,
      description: t.wearableDataDesc,
      icon: Watch,
      stat: dataReady ? `${activityCount} ${t.activityLabel ?? "activities"} today` : null,
    },
    {
      id: "analytics",
      title: t.analytics,
      description: t.analyticsDesc,
      icon: Activity,
      stat: dataReady ? `${caloriesConsumed} kcal · ${waterPct}% ${t.waterLabel ?? "water"}` : null,
    },
  ];

  const ecosystem = [
    { id: "supplements", title: t.supplementStore, description: t.supplementStoreDesc, icon: Pill, stat: null },
    { id: "community", title: t.community, description: t.communityDesc, icon: Users, stat: null },
    { id: "family", title: t.familyTracking, description: t.familyTrackingDesc, icon: HeartHandshake, stat: null },
  ];

  const renderList = (items: Array<{ id: string; title: string; description: string; icon: React.ElementType; stat: string | null }>) => (
    <div className="space-y-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.id}
            className="cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
            onClick={() => onTabChange(item.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
                {item.stat && (
                  <p className="text-xs text-primary font-medium shrink-0">{item.stat}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t.analysisTitle}</h1>
            <p className="text-xs text-muted-foreground">{t.analysisSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">{t.insights}</h2>
          {renderList(insights)}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">{t.ecosystem}</h2>
          {renderList(ecosystem)}
        </div>
      </div>
    </div>
  );
};
