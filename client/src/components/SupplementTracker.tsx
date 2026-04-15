import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supplementAPI } from "@/lib/api";
import { toast } from "sonner";
import {
  CheckCircle2, Circle, Pill, TrendingUp, Calendar,
  Loader2, ChevronDown, ChevronUp, X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TrackedSupplement {
  id: string;
  name: string;
  dosage: string;
  timing: string;
}

interface SupplementTrackerProps {
  trackedSupplements: TrackedSupplement[];
  onRemove: (id: string) => void;
}

interface SupplementStat {
  supplementKey: string;
  supplementName: string;
  dosage: string | null;
  timing: string | null;
  totalDays: number;
  last7Days: number;
  takenToday: boolean;
  dates: string[];
}

export const SupplementTracker = ({ trackedSupplements, onRemove }: SupplementTrackerProps) => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: stats = [], isLoading } = useQuery<SupplementStat[]>({
    queryKey: ["supplement-stats"],
    queryFn: () => supplementAPI.getTrackedSupplementStats(),
    staleTime: 30_000,
  });

  const checkInMutation = useMutation({
    mutationFn: async (sup: TrackedSupplement) => {
      return supplementAPI.checkInIntake(sup.id, sup.name, sup.dosage, sup.timing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplement-stats"] });
      toast.success("Takviye alındı olarak işaretlendi");
    },
    onError: () => toast.error("İşaretleme başarısız"),
  });

  const uncheckMutation = useMutation({
    mutationFn: async (supplementKey: string) => {
      return supplementAPI.uncheckIntake(supplementKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplement-stats"] });
      toast.success("İşaret kaldırıldı");
    },
    onError: () => toast.error("İşlem başarısız"),
  });

  if (trackedSupplements.length === 0) return null;

  const getStatForSupplement = (id: string): SupplementStat | undefined =>
    stats.find(s => s.supplementKey === id);

  const isTakenToday = (id: string): boolean =>
    getStatForSupplement(id)?.takenToday ?? false;

  const getConsistency7d = (id: string): number => {
    const stat = getStatForSupplement(id);
    return stat ? Math.round((stat.last7Days / 7) * 100) : 0;
  };

  const getConsistency30d = (id: string): number => {
    const stat = getStatForSupplement(id);
    return stat ? Math.round((stat.totalDays / 30) * 100) : 0;
  };

  // Generate last 30 days for calendar
  const getLast30Days = (): string[] => {
    const days: string[] = [];
    for (let i = 29; i >= 0; i--) {
      days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
    }
    return days;
  };

  const allTakenToday = trackedSupplements.every(s => isTakenToday(s.id));
  const takenCount = trackedSupplements.filter(s => isTakenToday(s.id)).length;

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <Card className={allTakenToday ? "border-green-500/30 bg-green-500/5" : "border-primary/30 bg-primary/5"}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${allTakenToday ? "bg-green-500/10" : "bg-primary/10"}`}>
              <Pill className={`h-5 w-5 ${allTakenToday ? "text-green-500" : "text-primary"}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {allTakenToday
                  ? "Tüm takviyeler alındı!"
                  : `${takenCount}/${trackedSupplements.length} takviye alındı`}
              </p>
              <p className="text-xs text-muted-foreground">
                {allTakenToday
                  ? "Bugünkü takviyelerin tamamlandı, harika!"
                  : "Almadıklarını işaretle"}
              </p>
            </div>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </CardContent>
      </Card>

      {/* Supplement check-in cards */}
      {trackedSupplements.map(sup => {
        const taken = isTakenToday(sup.id);
        const consistency7 = getConsistency7d(sup.id);
        const consistency30 = getConsistency30d(sup.id);
        const stat = getStatForSupplement(sup.id);
        const isExpanded = expandedId === sup.id;
        const isPending = checkInMutation.isPending || uncheckMutation.isPending;
        const last30 = getLast30Days();
        const takenDatesSet = new Set(stat?.dates ?? []);

        return (
          <Card key={sup.id} className={taken ? "border-green-500/20" : ""}>
            <CardContent className="p-4">
              {/* Main row: check-in */}
              <div className="flex items-center gap-3">
                <button
                  disabled={isPending}
                  onClick={() =>
                    taken
                      ? uncheckMutation.mutate(sup.id)
                      : checkInMutation.mutate(sup)
                  }
                  className="shrink-0 transition-transform active:scale-90"
                >
                  {taken ? (
                    <CheckCircle2 className="h-7 w-7 text-green-500" />
                  ) : (
                    <Circle className="h-7 w-7 text-muted-foreground/40" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${taken ? "line-through text-muted-foreground" : ""}`}>
                    {sup.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{sup.dosage} · {sup.timing}</p>
                </div>

                <div className="flex items-center gap-2">
                  {consistency7 > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                      %{consistency7}
                    </Badge>
                  )}
                  <button onClick={() => setExpandedId(isExpanded ? null : sup.id)}>
                    {isExpanded
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>

              {/* Expanded: calendar + stats */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t space-y-3">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{stat?.last7Days ?? 0}/7</p>
                      <p className="text-[10px] text-muted-foreground">Son 7 gün</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{stat?.totalDays ?? 0}/30</p>
                      <p className="text-[10px] text-muted-foreground">Son 30 gün</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">%{consistency30}</p>
                      <p className="text-[10px] text-muted-foreground">Tutarlılık</p>
                    </div>
                  </div>

                  {/* Mini calendar: last 30 days */}
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium">Son 30 Gün</span>
                    </div>
                    <div className="grid grid-cols-10 gap-1">
                      {last30.map(day => {
                        const isTaken = takenDatesSet.has(day);
                        const isToday = day === new Date().toISOString().slice(0, 10);
                        return (
                          <div
                            key={day}
                            title={day}
                            className={`w-full aspect-square rounded-sm transition-colors ${
                              isTaken
                                ? "bg-green-500"
                                : isToday
                                ? "bg-primary/30 ring-1 ring-primary"
                                : "bg-muted/60"
                            }`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
                        <span>Alındı</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-sm bg-muted/60" />
                        <span>Alınmadı</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-sm bg-primary/30 ring-1 ring-primary" />
                        <span>Bugün</span>
                      </div>
                    </div>
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={() => onRemove(sup.id)}
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" /> Takibi Kaldır
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
