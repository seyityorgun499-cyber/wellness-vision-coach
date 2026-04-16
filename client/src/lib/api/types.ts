/**
 * Myora – API Tip Tanımları
 * Tüm API modülleri tarafından paylaşılan arayüz (interface) tanımları.
 */

/* Auth / Kullanıcı */
export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  heightCm?: number;
  weightKg?: string;
  activityLevel?: string;
  language?: string;
  timezone?: string;
  onboardingCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface ProfileUpdateData {
  displayName?: string;
  heightCm?: number;
  weightKg?: string;
  activityLevel?: string;
  dateOfBirth?: string;
  gender?: string;
  language?: string;
  onboardingCompleted?: boolean;
}

/* Günlük Sağlık */
export interface DailyHealthLog {
  id: string;
  userId: string;
  date: string;
  caloriesConsumed: number;
  caloriesBurned: number;
  caloriesTarget: number;
  proteinGrams: string;
  proteinTarget: string;
  carbsGrams: string;
  fatGrams: string;
  waterMl: number;
  waterTarget: number;
  steps: number;
  stepsTarget: number;
  sleepMinutes: number | null;
  sleepTarget: number;
  stressLevel: number | null;
  moodScore: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyLogUpdateData {
  date?: string;
  caloriesConsumed?: number;
  caloriesBurned?: number;
  caloriesTarget?: number;
  proteinGrams?: string;
  proteinTarget?: string;
  carbsGrams?: string;
  fatGrams?: string;
  waterMl?: number;
  waterTarget?: number;
  steps?: number;
  stepsTarget?: number;
  sleepMinutes?: number;
  sleepTarget?: number;
  stressLevel?: number;
  moodScore?: number;
  notes?: string;
}

/* Yemek Girişleri */
export interface FoodEntry {
  id: string;
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  calories: number;
  proteinGrams: string | null;
  carbsGrams: string | null;
  fatGrams: string | null;
  fiberGrams: string | null;
  servingSize: string | null;
  imageUrl: string | null;
  barcode: string | null;
  aiConfidence: string | null;
  source: 'manual' | 'camera' | 'barcode' | 'voice';
  loggedAt: string;
  createdAt: string;
}

export interface FoodEntryCreateData {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  calories: number;
  proteinGrams?: string;
  carbsGrams?: string;
  fatGrams?: string;
  fiberGrams?: string;
  servingSize?: string;
  imageUrl?: string;
  barcode?: string;
  aiConfidence?: string;
  source?: string;
}

export interface FoodAnalysisResult {
  foodName: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  servingSize: string;
  confidence: number;
}

/* Aktivite Girişleri */
export interface ActivityEntry {
  id: string;
  userId: string;
  activityType: string;
  durationMinutes: number;
  caloriesBurned: number | null;
  intensity: 'light' | 'moderate' | 'vigorous';
  heartRateAvg: number | null;
  heartRateMax: number | null;
  distanceKm: string | null;
  notes: string | null;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
}

export interface ActivityCreateData {
  activityType: string;
  durationMinutes: number;
  caloriesBurned?: number;
  intensity?: 'light' | 'moderate' | 'vigorous';
  heartRateAvg?: number;
  heartRateMax?: number;
  distanceKm?: string;
  notes?: string;
  startedAt: string;
  endedAt?: string;
}

/* Aralıklı Oruç */
export interface FastingLog {
  id: string;
  userId: string;
  fastingPlan: '16:8' | '18:6' | '20:4' | '5:2' | 'eat_stop_eat';
  startedAt: string;
  targetEndAt: string;
  actualEndAt: string | null;
  completed: boolean;
  notes: string | null;
  moodBefore: number | null;
  moodAfter: number | null;
  createdAt: string;
}

export interface FastingStartData {
  fastingPlan: string;
  startedAt?: string;
  targetEndAt?: string;
  notes?: string;
  moodBefore?: number;
}

/* Kan Tahlili */
export interface BloodTest {
  id: string;
  userId: string;
  testDate: string;
  labName: string | null;
  documentUrl: string | null;
  ocrExtractedText: string | null;
  aiSummary: string | null;
  overallStatus: 'normal' | 'attention' | 'critical' | null;
  results?: BloodTestResult[];
  createdAt: string;
  updatedAt: string;
}

export interface BloodTestResult {
  id: string;
  bloodTestId: string;
  markerName: string;
  value: string;
  unit: string;
  referenceMin: string | null;
  referenceMax: string | null;
  status: 'normal' | 'low' | 'high' | 'critical' | null;
  category: string | null;
  aiInterpretation: string | null;
  createdAt: string;
}

export interface BloodTestUploadData {
  ocrText: string;
  labName?: string;
  testDate?: string;
}

/* Sağlık Belgeleri */
export interface HealthDocument {
  id: string;
  userId: string;
  title: string;
  documentType: 'blood_test' | 'prescription' | 'radiology' | 'pathology' | 'vaccination' | 'other';
  fileUrl: string | null;
  mimeType: string | null;
  fileSize: number | null;
  ocrText: string | null;
  aiAnalysis: string | null;
  aiRecommendations: string[] | null;
  tags: string[];
  status: 'pending' | 'processing' | 'analyzed' | 'error';
  uploadedAt: string;
  createdAt: string;
}

export interface DocumentUploadData {
  title?: string;
  documentType: string;
  imageBase64?: string;
  ocrText?: string;
  fileUrl?: string;
  tags?: string[];
}

/* Tıbbi Fotoğraf */
export interface MedicalPhoto {
  id: string;
  userId: string;
  photoType: 'urine' | 'stool' | 'tongue' | 'eyes' | 'skin';
  imageUrl: string;
  aiAnalysis: {
    color: string;
    observations: string[];
    concerns: string[];
    recommendations: string[];
    urgency: 'low' | 'medium' | 'high';
  } | null;
  confidence: string | null;
  notes: string | null;
  analyzedAt: string | null;
  createdAt: string;
}

export interface MedicalPhotoUploadData {
  imageData: string;
  photoType: 'urine' | 'stool' | 'tongue' | 'eyes' | 'skin';
  notes?: string;
}

/* Sesli Günlük */
export interface VoiceEntry {
  id: string;
  userId: string;
  audioUrl: string | null;
  durationSeconds: number | null;
  transcription: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  mood: string | null;
  keywords: string[];
  aiSummary: string | null;
  aiRecommendations: unknown | null;
  createdAt: string;
}

export interface VoiceEntryCreateData {
  transcription: string;
  mode?: 'food' | 'health';
  audioUrl?: string;
  durationSeconds?: number;
}

/* Hedefler */
export interface UserGoal {
  id: string;
  userId: string;
  goalType: 'weight_loss' | 'muscle_gain' | 'better_sleep' | 'stress_reduction' | 'hydration' | 'custom';
  title: string;
  description: string | null;
  targetValue: string | null;
  currentValue: string | null;
  unit: string | null;
  startDate: string | null;
  targetDate: string | null;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

export interface GoalCreateData {
  goalType: string;
  title: string;
  description?: string;
  targetValue?: string;
  currentValue?: string;
  unit?: string;
  startDate?: string;
  targetDate?: string;
}

export interface GoalUpdateData {
  title?: string;
  description?: string;
  targetValue?: string;
  currentValue?: string;
  status?: 'active' | 'completed' | 'paused' | 'abandoned';
  targetDate?: string;
}

/* Başarımlar & Streak */
export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  category: 'streak' | 'milestone' | 'challenge' | null;
  requirement: unknown;
  points: number;
  createdAt: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: string;
  createdAt: string;
  achievement?: Achievement;
}

export interface UserStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  updatedAt: string;
  createdAt: string;
}

/* AI Sohbet */
export interface ChatConversation {
  id: string;
  userId: string;
  title: string | null;
  topic: 'general' | 'nutrition' | 'exercise' | 'supplements' | 'blood_test' | 'mental_health' | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations: { sourceId: string; title: string; excerpt: string }[] | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ConversationCreateData {
  title?: string;
  topic?: string;
}

/* Sağlık Profili */
export interface HealthProfile {
  id: string;
  userId: string;
  bmi: string | null;
  bmr: number | null;
  tdee: number | null;
  bodyFatEstimate: string | null;
  healthScore: number | null;
  riskFactors: { type: string; level: string; description: string }[] | null;
  strengths: string[] | null;
  improvementAreas: string[] | null;
  nutritionPlan: {
    dailyCalories: number;
    macroSplit: Record<string, number>;
    mealSuggestions: string[];
  } | null;
  exercisePlan: {
    weeklyGoal: string;
    suggestedActivities: string[];
  } | null;
  sleepRecommendation: unknown | null;
  supplementRecommendations: {
    name: string;
    reason: string;
    dosage: string;
    priority: string;
  }[] | null;
  aiGeneratedSummary: string | null;
  lastCalculatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/* Takviye Gıda */
export interface Supplement {
  id: string;
  name: string;
  brand: string | null;
  category: 'vitamin' | 'mineral' | 'amino_acid' | 'herbal' | 'probiotic' | 'omega' | 'protein';
  description: string | null;
  dosageForm: string | null;
  servingSize: string | null;
  ingredients: { name: string; amount: string; unit: string; dailyValuePct?: number }[] | null;
  benefits: string[];
  warnings: string | null;
  imageUrl: string | null;
  price: string | null;
  currency: string;
  externalUrl: string | null;
  affiliateUrl: string | null;
  rating: string | null;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface SupplementRecommendation {
  id: string;
  userId: string;
  supplementId: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  basedOn: unknown | null;
  suggestedDosage: string | null;
  duration: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'purchased';
  supplement?: Supplement;
  createdAt: string;
  updatedAt: string;
}

export interface SupplementOrder {
  id: string;
  userId: string;
  supplementId: string;
  quantity: number;
  totalPrice: string | null;
  currency: string;
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  externalOrderId: string | null;
  supplement?: Supplement;
  orderedAt: string;
  createdAt: string;
}

export interface OrderCreateData {
  supplementId: string;
  quantity?: number;
}

/* Topluluk */
export interface CommunityPost {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  category: 'general' | 'nutrition' | 'exercise' | 'supplements' | 'recipes' | 'success_story' | 'question' | null;
  imageUrl: string | null;
  likeCount: number;
  commentCount: number;
  isPublished: boolean;
  isPinned: boolean;
  author?: { displayName: string; avatarUrl?: string };
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
  likeCount: number;
  author?: { displayName: string; avatarUrl?: string };
  createdAt: string;
  updatedAt: string;
}

export interface PostCreateData {
  title?: string;
  content: string;
  category?: string;
  imageUrl?: string;
}

export interface CommentCreateData {
  content: string;
  parentId?: string;
}

/* Aile Takibi */
export interface FamilyMember {
  id: string;
  userId: string;
  linkedUserId: number | null;
  name: string;
  relationship: 'parent' | 'child' | 'spouse' | 'sibling' | 'grandparent' | 'other';
  dateOfBirth: string | null;
  avatarUrl: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMemberCreateData {
  name: string;
  relationship: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  notes?: string;
  linkedUserId?: number;
}

export interface FamilyMedication {
  id: string;
  familyMemberId: string;
  name: string;
  dosage: string | null;
  frequency: 'daily' | 'twice_daily' | 'weekly' | 'as_needed' | null;
  scheduleTime: string | null;
  startDate: string | null;
  endDate: string | null;
  prescribedBy: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationCreateData {
  name: string;
  dosage?: string;
  frequency?: string;
  scheduleTime?: string;
  startDate?: string;
  endDate?: string;
  prescribedBy?: string;
  notes?: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  takenAt: string;
  taken: boolean;
  notes: string | null;
  loggedBy: number | null;
  createdAt: string;
}

export interface MedicationLogData {
  takenAt?: string;
  taken?: boolean;
  notes?: string;
}

export interface AdherenceData {
  date: string;
  medications: {
    medication: FamilyMedication;
    logs: MedicationLog[];
    adherenceRate: number;
  }[];
  overallRate: number;
}

/* Giyilebilir Cihaz */
export interface WearableDevice {
  id: string;
  name: string;
  brand: string;
  type: 'watch' | 'band' | 'ring' | 'patch';
  supportedMetrics: string[];
  isActive: boolean;
  createdAt: string;
}

export interface UserDevice {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string | null;
  isConnected: boolean;
  lastSync: string | null;
  device?: WearableDevice;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceConnectData {
  deviceId: string;
  deviceName?: string;
}

export interface WearableDataEntry {
  id: string;
  userId: string;
  deviceId: string;
  metricType: 'heart_rate' | 'steps' | 'sleep' | 'spo2' | 'stress' | 'hrv';
  value: string;
  unit: string;
  recordedAt: string;
  syncedAt: string;
  createdAt: string;
}

export interface WearableSyncData {
  deviceId: string;
  metricType: string;
  value: string;
  unit: string;
  recordedAt: string;
}

/* Bildirimler */
export interface SmartNotification {
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
}

export interface SmartNotificationResponse {
  success: boolean;
  notifications: SmartNotification[];
  timestamp: string;
  hour: number;
}
