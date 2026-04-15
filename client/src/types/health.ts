export interface FoodAnalysis {
  id: string;
  timestamp: string;
  food: string;
  calories: number;
  macros: {
    protein: { amount: number; percentage: number };
    carbs: { amount: number; percentage: number };
    fats: { amount: number; percentage: number };
  };
  confidence: number;
  servingSize: string;
  image?: string;
}

export interface VoiceEntry {
  id: string;
  timestamp: string;
  title: string;
  duration: string;
  mood: string;
  keywords: string[];
  summary: string;
  audioUrl?: string;
}

export interface ActivityEntry {
  id: string;
  timestamp: string;
  type: string;
  duration: number;
  intensity: string;
  calories?: number;
  notes?: string;
  heartRate?: string;
}

export interface DocumentEntry {
  id: string;
  timestamp: string;
  title: string;
  type: string;
  status: string;
  insights: string[];
  recommendations: string[];
  fileUrl?: string;
}

export interface MedicalPhotoAnalysis {
  id: string;
  timestamp: string;
  type: 'urine' | 'stool' | 'tongue' | 'eyes';
  image: string;
  analysis: {
    color: string;
    consistency?: string;
    clarity?: string;
    observations: string[];
    concerns: string[];
    recommendations: string[];
    urgency: 'low' | 'medium' | 'high';
  };
  confidence: number;
}

export interface DailyGoals {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  water: { current: number; target: number };
  steps: { current: number; target: number };
  sleep: { current: string; target: string };
}

export interface HealthData {
  dailyGoals: DailyGoals;
  foodAnalyses: FoodAnalysis[];
  voiceEntries: VoiceEntry[];
  activityEntries: ActivityEntry[];
  documentEntries: DocumentEntry[];
  medicalPhotos: MedicalPhotoAnalysis[];
}

export type LoggedActivity = {
  id: string;
  type: 'food' | 'voice' | 'activity' | 'document' | 'medical';
  timestamp: string;
  title: string;
  details: any;
};