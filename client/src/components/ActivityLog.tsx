import { Calendar, Camera, Mic, FileText, Activity, Filter, Search, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useHealthData } from "@/hooks/useHealthData";
import { LoggedActivity } from "@/types/health";

export const ActivityLog = () => {
  const { healthData } = useHealthData();
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Convert health data to logged activities format
  const loggedActivities: LoggedActivity[] = [
    ...healthData.foodAnalyses.map(food => ({
      id: food.id,
      type: 'food' as const,
      timestamp: food.timestamp,
      title: food.food,
      details: {
        calories: food.calories,
        protein: `${food.macros.protein.amount}g`,
        carbs: `${food.macros.carbs.amount}g`,
        fats: `${food.macros.fats.amount}g`,
        confidence: `${food.confidence}%`
      }
    })),
    ...healthData.voiceEntries.map(voice => ({
      id: voice.id,
      type: 'voice' as const,
      timestamp: voice.timestamp,
      title: voice.title,
      details: {
        duration: voice.duration,
        mood: voice.mood,
        keywords: voice.keywords,
        summary: voice.summary
      }
    })),
    ...healthData.activityEntries.map(activity => ({
      id: activity.id,
      type: 'activity' as const,
      timestamp: activity.timestamp,
      title: activity.type,
      details: {
        duration: `${activity.duration} minutes`,
        intensity: activity.intensity,
        calories: activity.calories?.toString() || "Not specified",
        heartRate: activity.heartRate || "Not measured"
      }
    })),
    ...healthData.documentEntries.map(doc => ({
      id: doc.id,
      type: 'document' as const,
      timestamp: doc.timestamp,
      title: doc.title,
      details: {
        type: doc.type,
        status: doc.status,
        insights: doc.insights,
        recommendations: doc.recommendations
      }
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "food": return Camera;
      case "voice": return Mic;
      case "activity": return Activity;
      case "document": return FileText;
      default: return Calendar;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "food": return "bg-health-light text-health border-health";
      case "voice": return "bg-widget-light text-widget border-widget";
      case "activity": return "bg-success-light text-success border-success";
      case "document": return "bg-warning-light text-warning border-warning";
      default: return "bg-muted text-muted-foreground border-muted";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const filteredActivities = loggedActivities.filter(activity => {
    const matchesType = filterType === "all" || activity.type === filterType;
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, typeof loggedActivities>);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Aktivite Günlüğü
            </h1>
            <p className="text-muted-foreground">Tüm aktivitelerinizin kayıtları</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">

        {/* Filters and Search */}
        <Card className="card-modern">
        <CardContent className="p-4 space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Aktivite ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="food">Yemek</SelectItem>
                  <SelectItem value="voice">Ses</SelectItem>
                  <SelectItem value="activity">Aktivite</SelectItem>
                  <SelectItem value="document">Doküman</SelectItem>
                </SelectContent>
              </Select>
            </div>
          
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 bg-primary-light rounded">
                <div className="text-sm font-bold text-primary">
                  {loggedActivities.filter(a => a.type === "food").length}
                </div>
                <div className="text-xs text-muted-foreground">Yemek</div>
              </div>
              <div className="text-center p-2 bg-secondary-light rounded">
                <div className="text-sm font-bold text-secondary">
                  {loggedActivities.filter(a => a.type === "voice").length}
                </div>
                <div className="text-xs text-muted-foreground">Ses</div>
              </div>
              <div className="text-center p-2 bg-success-light rounded">
                <div className="text-sm font-bold text-success">
                  {loggedActivities.filter(a => a.type === "activity").length}
                </div>
                <div className="text-xs text-muted-foreground">Aktivite</div>
              </div>
              <div className="text-center p-2 bg-warning-light rounded">
                <div className="text-sm font-bold text-warning">
                  {loggedActivities.filter(a => a.type === "document").length}
                </div>
                <div className="text-xs text-muted-foreground">Doküman</div>
              </div>
            </div>
        </CardContent>
      </Card>

        {/* Grouped Activities */}
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, activities]) => (
            <div key={date} className="space-y-3">
              <h3 className="section-header flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                {date === new Date().toDateString() ? "Bugün" : new Date(date).toLocaleDateString('tr-TR')}
              </h3>
              
              <div className="space-y-3">
                {activities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <Card key={activity.id} className="card-modern hover:shadow-widget transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{activity.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {activity.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(activity.timestamp)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Activity Details */}
                          <div className="bg-background-subtle p-3 rounded-lg space-y-2">
                            {activity.type === "food" && (
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <span>Calories: <strong>{activity.details.calories}</strong></span>
                                <span>Protein: <strong>{activity.details.protein}</strong></span>
                                <span>Carbs: <strong>{activity.details.carbs}</strong></span>
                                <span>Fats: <strong>{activity.details.fats}</strong></span>
                                <span className="col-span-2">Confidence: <strong>{activity.details.confidence}</strong></span>
                              </div>
                            )}
                            
                            {activity.type === "voice" && (
                              <div className="space-y-2 text-sm">
                                <div>Duration: <strong>{activity.details.duration}</strong></div>
                                <div>Mood: <strong>{activity.details.mood}</strong></div>
                                <div>Keywords: {activity.details.keywords.map(keyword => (
                                  <Badge key={keyword} variant="outline" className="ml-1 text-xs">
                                    {keyword}
                                  </Badge>
                                ))}</div>
                                <div className="italic text-muted-foreground">{activity.details.summary}</div>
                              </div>
                            )}
                            
                            {activity.type === "activity" && (
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <span>Duration: <strong>{activity.details.duration}</strong></span>
                                <span>Intensity: <strong>{activity.details.intensity}</strong></span>
                                <span>Calories: <strong>{activity.details.calories}</strong></span>
                                <span>Heart Rate: <strong>{activity.details.heartRate}</strong></span>
                              </div>
                            )}
                            
                            {activity.type === "document" && (
                              <div className="space-y-2 text-sm">
                                <div>Type: <strong>{activity.details.type}</strong></div>
                                <div>Status: <strong>{activity.details.status}</strong></div>
                                <div>
                                  <div className="font-medium">Insights:</div>
                                  <ul className="list-disc list-inside text-muted-foreground ml-2">
                                    {activity.details.insights.map((insight, idx) => (
                                      <li key={idx}>{insight}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <div className="font-medium">Recommendations:</div>
                                  <ul className="list-disc list-inside text-muted-foreground ml-2">
                                    {activity.details.recommendations.map((rec, idx) => (
                                      <li key={idx}>{rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

        {filteredActivities.length === 0 && (
          <Card className="card-modern">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Aktivite bulunamadı</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Aramayı veya filtreyi değiştirin." : "Aktivitelerinizi kaydetmeye başlayın."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};