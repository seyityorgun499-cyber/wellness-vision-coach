import React, { useState, useEffect, useCallback, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Heart, Footprints, Flame, Moon, Droplets, Brain, TrendingUp } from "lucide-react";
import { wearableAPI } from "@/lib/api";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

const LazyWearableLineChart = React.lazy(() =>
  import('@/components/charts/WearableChart').then(m => ({ default: m.WearableLineChart }))
);

interface WearableDataPoint {
  id: string;
  metric_type: string;
  value: number;
  unit: string;
  recorded_at: string;
}

interface MetricData {
  timestamp: string;
  value: number;
}

export function WearableDataDashboard() {
  const [data, setData] = useState<WearableDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState("heart_rate");

  const fetchWearableData = useCallback(async () => {
    try {
      const apiData = await wearableAPI.getData();
      setData(apiData.map((item) => ({
        id: item.id,
        metric_type: item.metricType,
        value: Number(item.value),
        unit: item.unit,
        recorded_at: item.recordedAt,
      })));
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWearableData();
  }, [fetchWearableData]);

  const getMetricIcon = (metric: string) => {
    const icons: Record<string, JSX.Element> = {
      'heart_rate': <Heart className="h-5 w-5 text-destructive" />,
      'steps': <Footprints className="h-5 w-5 text-primary" />,
      'calories': <Flame className="h-5 w-5 text-warning" />,
      'sleep': <Moon className="h-5 w-5 text-primary" />,
      'blood_oxygen': <Droplets className="h-5 w-5 text-primary" />,
      'stress': <Brain className="h-5 w-5 text-warning" />,
      'exercise_minutes': <Activity className="h-5 w-5 text-success" />,
      'vo2_max': <TrendingUp className="h-5 w-5 text-primary" />
    };
    return icons[metric] || <Activity className="h-5 w-5" />;
  };

  const getMetricDisplayName = (metric: string) => {
    const names: Record<string, string> = {
      'heart_rate': 'Kalp Atışı',
      'steps': 'Adım Sayısı',
      'calories': 'Kalori',
      'sleep': 'Uyku Kalitesi',
      'blood_oxygen': 'Kan Oksijeni',
      'stress': 'Stres Seviyesi',
      'exercise_minutes': 'Egzersiz Süresi',
      'vo2_max': 'VO2 Max'
    };
    return names[metric] || metric;
  };

  const getMetricData = (metricType: string): MetricData[] => {
    return data
      .filter(item => item.metric_type === metricType)
      .map(item => ({
        timestamp: new Date(item.recorded_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        value: item.value
      }))
      .reverse()
      .slice(-12);
  };

  const getLatestValue = (metricType: string) => {
    const latestData = data.find(item => item.metric_type === metricType);
    return latestData ? { value: latestData.value, unit: latestData.unit } : null;
  };

  const availableMetrics = ['heart_rate', 'steps', 'calories', 'sleep', 'blood_oxygen'];

  const hasData = data.length > 0;

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-40 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Sağlık Verileri</h2>
        <p className="text-muted-foreground">Giyilebilir cihazlarınızdan gelen veriler</p>
      </div>

      {!hasData && (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz veri yok</h3>
            <p className="text-muted-foreground">Bir giyilebilir cihaz bağlayarak sağlık verilerinizi takip etmeye başlayın.</p>
          </CardContent>
        </Card>
      )}

      {hasData && (<>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {availableMetrics.map(metric => {
            const latest = getLatestValue(metric);
            return (
              <Card 
                key={metric}
                className={`cursor-pointer transition-all ${activeMetric === metric ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setActiveMetric(metric)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getMetricIcon(metric)}
                    <span className="text-sm font-medium">{getMetricDisplayName(metric)}</span>
                  </div>
                  {latest && (
                    <div className="text-2xl font-bold">
                      {latest.value}
                      <span className="text-sm text-muted-foreground ml-1">{latest.unit}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getMetricIcon(activeMetric)}
              {getMetricDisplayName(activeMetric)}
            </CardTitle>
            <CardDescription>Son 12 saatlik veriler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Suspense fallback={<LoadingSkeleton className="h-full w-full" />}>
                <LazyWearableLineChart data={getMetricData(activeMetric)} />
              </Suspense>
            </div>
          </CardContent>
        </Card>
      </>)}
    </div>
  );
}
