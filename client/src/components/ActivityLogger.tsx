import { Activity, Plus, Save, Calendar, Clock, Target, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useHealthData } from "@/hooks/useHealthData";
import { ActivityEntry } from "@/types/health";
import { healthAPI } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useLanguage } from "@/contexts/LanguageContext";

const activityFormSchema = z.object({
  activityType: z.string().min(1, 'Aktivite türü seçiniz'),
  duration: z.coerce.number().min(1, 'Süre en az 1 dakika olmalı'),
  intensity: z.string().default('moderate'),
  calories: z.coerce.number().optional(),
  notes: z.string().optional(),
});
type ActivityFormData = z.infer<typeof activityFormSchema>;

export const ActivityLogger = () => {
  const { t, locale } = useLanguage();
  const { addActivityEntry, healthData } = useHealthData();
  const [isSaving, setIsSaving] = useState(false);
  const [dbActivities, setDbActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: { activityType: '', duration: undefined as any, intensity: 'moderate', calories: undefined, notes: '' },
  });

  // Load activities from database on mount
  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await healthAPI.getActivities(20);
        setDbActivities(Array.isArray(data) ? data : []);
      } catch (error) {
        logger.log("Could not load activities from server, using local data");
      } finally {
        setIsLoading(false);
      }
    };
    loadActivities();
  }, []);

  const handleSaveActivity = async (data: ActivityFormData) => {
    setIsSaving(true);

    const activityData = {
      type: data.activityType,
      duration: data.duration,
      intensity: data.intensity || 'moderate',
      calories: data.calories || undefined,
      notes: data.notes || undefined,
    };

    try {
      const savedEntry = await healthAPI.addActivity(activityData);

      const activityEntry: ActivityEntry = {
        id: savedEntry?.id?.toString() || Date.now().toString(),
        timestamp: savedEntry?.createdAt || new Date().toISOString(),
        type: data.activityType,
        duration: data.duration,
        intensity: data.intensity || 'moderate',
        calories: data.calories || undefined,
        notes: data.notes || undefined,
      };
      addActivityEntry(activityEntry);
      setDbActivities(prev => [savedEntry || activityEntry, ...prev]);
      toast.success(`${data.activityType} ${t.loggedSuccessfully}`);
      form.reset();
    } catch (err) {
      logger.error('Failed to save activity:', err);
      const activityEntry: ActivityEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: data.activityType,
        duration: data.duration,
        intensity: data.intensity || 'moderate',
        calories: data.calories || undefined,
        notes: data.notes || undefined,
      };
      addActivityEntry(activityEntry);
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      toast.warning(`${t.saveError}: ${msg}`);
      form.reset();
    } finally {
      setIsSaving(false);
    }
  };

  const activityTypes = [
    "Running", "Walking", "Cycling", "Swimming", "Weightlifting", 
    "Yoga", "Pilates", "Basketball", "Soccer", "Tennis", 
    "Dancing", "Hiking", "Climbing", "Other"
  ];

  return (
    <div className="min-h-screen bg-background p-4 space-y-6 pb-20">
      <div className="text-center space-y-2 pt-2">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          {t.activityLogTitle}
        </h1>
        <p className="text-muted-foreground">{t.activityLogSubtitle}</p>
      </div>

      {/* Activity Form */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            {t.newActivity}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSaveActivity)} className="space-y-4">
            {/* Activity Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.activityType}</label>
              <Controller
                control={form.control}
                name="activityType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectActivityType} />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.activityType && (
                <p className="text-xs text-destructive">{form.formState.errors.activityType.message}</p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" /> {t.durationMinutes}
              </label>
              <Input type="number" placeholder="30" {...form.register('duration')} />
              {form.formState.errors.duration && (
                <p className="text-xs text-destructive">{form.formState.errors.duration.message}</p>
              )}
            </div>

            {/* Intensity */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" /> {t.intensity}
              </label>
              <Controller
                control={form.control}
                name="intensity"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectIntensity} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t.intensityLow}</SelectItem>
                      <SelectItem value="moderate">{t.intensityModerate}</SelectItem>
                      <SelectItem value="vigorous">{t.intensityHigh}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Estimated Calories */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.estimatedCalories}</label>
              <Input type="number" placeholder="250" {...form.register('calories')} />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.notesOptional}</label>
              <Textarea placeholder={t.notesPlaceholder} {...form.register('notes')} rows={3} />
            </div>

            {/* Save Button */}
            <Button variant="health" className="w-full" type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? t.saving : t.activityLogTitle}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Today's Activities */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {t.todaysActivities}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center p-4">
              <Loader className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">{t.loadingActivities}</p>
            </div>
          ) : (
            <>
              {(dbActivities.length > 0 ? dbActivities : healthData.activityEntries).slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-success-light rounded-lg">
                  <Activity className="h-4 w-4 text-success" />
                  <div className="flex-1">
                    <div className="font-medium">{activity.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {activity.duration} {t.minutes} • {activity.intensity} {t.intensityLabel}
                      {activity.calories && ` • ~${activity.calories} ${t.calories}`}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.createdAt || activity.timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              
              {(dbActivities.length === 0 && healthData.activityEntries.length === 0) && (
                <div className="text-center p-4 text-muted-foreground">
                  <p>{t.noActivitiesYet}</p>
                  <p className="text-xs">{t.logFirstActivity}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};