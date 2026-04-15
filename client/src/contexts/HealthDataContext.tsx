import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { HealthData, FoodAnalysis, VoiceEntry, ActivityEntry, DocumentEntry, DailyGoals, MedicalPhotoAnalysis } from '@/types/health';
import { nativeWidgetService } from '@/services/NativeWidgetService';
import { healthAPI } from '@/lib/api';
import type { DailyHealthLog, FoodEntry as APIFoodEntry, ActivityEntry as APIActivityEntry, VoiceEntry as APIVoiceEntry, HealthDocument as APIDocument } from '@/lib/api';
import { logger } from '@/lib/logger';

interface HealthDataContextType {
  healthData: HealthData;
  addFoodAnalysis: (food: FoodAnalysis) => void;
  addVoiceEntry: (voice: VoiceEntry) => void;
  addActivityEntry: (activity: ActivityEntry) => void;
  addDocumentEntry: (document: DocumentEntry) => void;
  addMedicalPhoto: (medical: MedicalPhotoAnalysis) => void;
  updateDailyGoals: (goals: Partial<DailyGoals>) => void;
  getTodaysCalories: () => number;
  getTodaysProtein: () => number;
  getRecentActivities: () => any[];
  activeWidgets: string[];
  addWidget: (widgetId: string) => void;
  removeWidget: (widgetId: string) => void;
  updateWaterIntake: (amount: number) => void;
}

const EMPTY_HEALTH_DATA: HealthData = {
  dailyGoals: {
    calories: { current: 0, target: 2100 },
    protein: { current: 0, target: 180 },
    water: { current: 0, target: 8 },
    steps: { current: 0, target: 10000 },
    sleep: { current: "0h", target: "8h" }
  },
  foodAnalyses: [],
  voiceEntries: [],
  activityEntries: [],
  documentEntries: [],
  medicalPhotos: []
};

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const HealthDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeWidgets, setActiveWidgets] = useState<string[]>([]);
  const [healthData, setHealthData] = useState<HealthData>(EMPTY_HEALTH_DATA);
  const dataFetched = useRef(false);

  // Fetch real data from Supabase on mount
  useEffect(() => {
    if (dataFetched.current) return;
    dataFetched.current = true;

    const loadData = async () => {
      try {
        const catchLog = (label: string) => (err: unknown) => {
          logger.error(`HealthData: ${label} failed:`, err);
          return null;
        };
        const [dailyLog, foods, activities, voices, docs] = await Promise.all([
          healthAPI.getDailyLog().catch(catchLog('getDailyLog')) as Promise<DailyHealthLog | null>,
          healthAPI.getFoodEntries().catch(catchLog('getFoodEntries')) as Promise<APIFoodEntry[] | null>,
          healthAPI.getActivities(50).catch(catchLog('getActivities')) as Promise<APIActivityEntry[] | null>,
          healthAPI.getVoiceEntries().catch(catchLog('getVoiceEntries')) as Promise<APIVoiceEntry[] | null>,
          healthAPI.getDocuments().catch(catchLog('getDocuments')) as Promise<APIDocument[] | null>,
        ]);

        const log = dailyLog as DailyHealthLog | null;
        const typedFoods = Array.isArray(foods) ? foods as APIFoodEntry[] : [];
        const typedActivities = Array.isArray(activities) ? activities as APIActivityEntry[] : [];
        const typedVoices = Array.isArray(voices) ? voices as APIVoiceEntry[] : [];
        const typedDocs = Array.isArray(docs) ? docs as APIDocument[] : [];

        setHealthData(prev => ({
          ...prev,
          dailyGoals: {
            calories: {
              current: log?.caloriesConsumed ?? 0,
              target: log?.caloriesTarget ?? prev.dailyGoals.calories.target,
            },
            protein: {
              current: Number(log?.proteinGrams ?? 0),
              target: Number(log?.proteinTarget ?? prev.dailyGoals.protein.target),
            },
            water: {
              current: Math.round((log?.waterMl ?? 0) / 300),
              target: Math.round((log?.waterTarget ?? 2400) / 300),
            },
            steps: {
              current: log?.steps ?? 0,
              target: log?.stepsTarget ?? prev.dailyGoals.steps.target,
            },
            sleep: {
              current: log?.sleepMinutes
                ? `${Math.floor(log.sleepMinutes / 60)}h ${log.sleepMinutes % 60}m`
                : "0h",
              target: prev.dailyGoals.sleep.target,
            },
          },
          foodAnalyses: typedFoods.map((f) => ({
            id: f.id,
            timestamp: f.loggedAt || f.createdAt,
            food: f.foodName,
            calories: f.calories,
            macros: {
              protein: { amount: Number(f.proteinGrams ?? 0), percentage: 0 },
              carbs: { amount: Number(f.carbsGrams ?? 0), percentage: 0 },
              fats: { amount: Number(f.fatGrams ?? 0), percentage: 0 },
            },
            confidence: Number(f.aiConfidence ?? 0),
            servingSize: f.servingSize || '',
          })),
          activityEntries: typedActivities.map((a) => ({
            id: a.id,
            timestamp: a.startedAt || a.createdAt,
            type: a.activityType,
            duration: a.durationMinutes,
            intensity: a.intensity || 'moderate',
            calories: a.caloriesBurned ?? 0,
            notes: a.notes || '',
          })),
          voiceEntries: typedVoices.map((v) => ({
            id: v.id,
            timestamp: v.createdAt,
            title: v.mood || 'Voice Entry',
            duration: v.durationSeconds ? `${Math.floor(v.durationSeconds / 60)}m ${v.durationSeconds % 60}s` : '',
            mood: v.mood || '',
            keywords: v.keywords || [],
            summary: v.aiSummary || v.transcription || '',
          })),
          documentEntries: typedDocs.map((d) => ({
            id: d.id,
            timestamp: d.uploadedAt || d.createdAt,
            title: d.title,
            type: d.documentType,
            status: d.status || 'pending',
            insights: Array.isArray(d.aiRecommendations) ? d.aiRecommendations : [],
            recommendations: Array.isArray(d.aiRecommendations) ? d.aiRecommendations : [],
          })),
        }));
      } catch (err) {
        logger.error('Failed to load health data from Supabase:', err);
      }
    };

    loadData();
  }, []);

  // Calculate current daily totals from logged food
  useEffect(() => {
    const today = new Date().toDateString();
    const todaysFoods = healthData.foodAnalyses.filter(
      food => new Date(food.timestamp).toDateString() === today
    );

    const totalCalories = todaysFoods.reduce((sum, food) => sum + food.calories, 0);
    const totalProtein = todaysFoods.reduce((sum, food) => sum + food.macros.protein.amount, 0);

    setHealthData(prev => {
      if (prev.dailyGoals.calories.current !== totalCalories || prev.dailyGoals.protein.current !== totalProtein) {
        return {
          ...prev,
          dailyGoals: {
            ...prev.dailyGoals,
            calories: { ...prev.dailyGoals.calories, current: totalCalories },
            protein: { ...prev.dailyGoals.protein, current: totalProtein }
          }
        };
      }
      return prev;
    });
  }, [healthData.foodAnalyses]);

  const addFoodAnalysis = (food: FoodAnalysis) => {
    setHealthData(prev => ({
      ...prev,
      foodAnalyses: [food, ...prev.foodAnalyses]
    }));
  };

  const addVoiceEntry = (voice: VoiceEntry) => {
    setHealthData(prev => ({
      ...prev,
      voiceEntries: [voice, ...prev.voiceEntries]
    }));
  };

  const addActivityEntry = (activity: ActivityEntry) => {
    setHealthData(prev => ({
      ...prev,
      activityEntries: [activity, ...prev.activityEntries]
    }));
  };

  const addDocumentEntry = (document: DocumentEntry) => {
    logger.log('Adding document entry to context:', document.title);
    setHealthData(prev => ({
      ...prev,
      documentEntries: [document, ...prev.documentEntries]
    }));
  };

  const addMedicalPhoto = (medical: MedicalPhotoAnalysis) => {
    setHealthData(prev => ({
      ...prev,
      medicalPhotos: [medical, ...prev.medicalPhotos]
    }));
  };

  const updateDailyGoals = (goals: Partial<DailyGoals>) => {
    setHealthData(prev => {
      const newData = {
        ...prev,
        dailyGoals: { ...prev.dailyGoals, ...goals }
      };
      
      // Update native widgets for protein changes
      if (goals.protein) {
        nativeWidgetService.updateWidget('protein', {
          current: goals.protein.current || prev.dailyGoals.protein.current,
          target: goals.protein.target || prev.dailyGoals.protein.target
        });
      }
      
      return newData;
    });
  };

  const getTodaysCalories = () => {
    return healthData.dailyGoals.calories.current;
  };

  const getTodaysProtein = () => {
    return healthData.dailyGoals.protein.current;
  };

  const getRecentActivities = () => {
    const allActivities = [
      ...healthData.foodAnalyses.map(food => ({
        type: 'food',
        timestamp: food.timestamp,
        title: food.food,
        description: `${food.calories} calories`,
        icon: 'Camera'
      })),
      ...healthData.voiceEntries.map(voice => ({
        type: 'voice',
        timestamp: voice.timestamp,
        title: voice.title,
        description: voice.summary,
        icon: 'Mic'
      })),
      ...healthData.activityEntries.map(activity => ({
        type: 'activity',
        timestamp: activity.timestamp,
        title: `${activity.type}`,
        description: `${activity.duration} minutes - ${activity.calories} calories`,
        icon: 'Activity'
      })),
      ...healthData.documentEntries.map(doc => ({
        type: 'document',
        timestamp: doc.timestamp,
        title: doc.title,
        description: doc.insights[0] || "AI recommendations generated",
        icon: 'FileText'
      })),
      ...healthData.medicalPhotos.map(medical => ({
        type: 'medical',
        timestamp: medical.timestamp,
        title: `${medical.type} Analysis`,
        description: `${medical.analysis.observations.length} observations - ${medical.analysis.urgency} urgency`,
        icon: 'Camera'
      }))
    ];

    return allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3);
  };

  const addWidget = (widgetId: string) => {
    if (!activeWidgets.includes(widgetId)) {
      setActiveWidgets(prev => [...prev, widgetId]);
    }
  };

  const removeWidget = (widgetId: string) => {
    setActiveWidgets(prev => prev.filter(id => id !== widgetId));
    // Also remove from native widgets
    nativeWidgetService.removeWidget(widgetId);
  };

  const updateWaterIntake = (amount: number) => {
    setHealthData(prev => {
      const newWaterValue = Math.max(0, Math.min(prev.dailyGoals.water.current + amount, prev.dailyGoals.water.target));
      const newWaterMl = newWaterValue * 300;

      // Update native widgets
      nativeWidgetService.updateWidget('water', {
        current: newWaterValue,
        target: prev.dailyGoals.water.target
      });

      // Persist to Supabase
      healthAPI.updateDailyLog({ waterMl: newWaterMl }).catch(err =>
        logger.error('Failed to persist water intake:', err)
      );

      return {
        ...prev,
        dailyGoals: {
          ...prev.dailyGoals,
          water: {
            ...prev.dailyGoals.water,
            current: newWaterValue
          }
        }
      };
    });
  };

  const contextValue = useMemo(() => ({
    healthData,
    addFoodAnalysis,
    addVoiceEntry,
    addActivityEntry,
    addDocumentEntry,
    addMedicalPhoto,
    updateDailyGoals,
    getTodaysCalories,
    getTodaysProtein,
    getRecentActivities,
    activeWidgets,
    addWidget,
    removeWidget,
    updateWaterIntake
  }), [healthData, activeWidgets, addFoodAnalysis, addVoiceEntry, addActivityEntry, addDocumentEntry, addMedicalPhoto, updateDailyGoals, getTodaysCalories, getTodaysProtein, getRecentActivities, addWidget, removeWidget, updateWaterIntake]);

  return (
    <HealthDataContext.Provider value={contextValue}>
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    logger.error('useHealthData called outside of HealthDataProvider');
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};