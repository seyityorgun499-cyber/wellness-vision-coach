/**
 * Myora – Client API Katmanı
 *
 * Tüm backend servislerine erişim sağlayan tip-güvenli API istemcisi.
 *
 * API Yapısı:
 * ├── authAPI          → Kimlik doğrulama & kullanıcı profili
 * ├── healthAPI        → Sağlık takibi (kalori, su, aktivite, oruç, hedefler, başarımlar)
 * ├── chatAPI          → AI sohbet botu (RAG tabanlı)
 * ├── supplementAPI    → Takviye gıda & sipariş
 * ├── communityAPI     → Topluluk
 * ├── familyAPI        → Aile takibi (ilaç & takviye kontrolü)
 * ├── wearableAPI      → Giyilebilir cihazlar
 * └── notificationAPI  → Akıllı bildirimler
 */

// ─────────────────────────────────────────────────────────────
// TİP TANIMLARI
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// TEMEL FETCH KATMANI
// ─────────────────────────────────────────────────────────────

import { supabase } from '@/lib/supabase';

let _userIdPromise: Promise<string> | null = null;
let _userIdCache: string | null = null;
let _userIdCacheTs = 0;
const USER_ID_TTL = 30_000; // 30s cache

async function getCurrentSupabaseUserId(): Promise<string> {
  if (_userIdCache && Date.now() - _userIdCacheTs < USER_ID_TTL) {
    return _userIdCache;
  }
  if (_userIdPromise) return _userIdPromise;

  _userIdPromise = (async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw new Error('Oturum bulunamadı');
      _userIdCache = data.user.id;
      _userIdCacheTs = Date.now();
      return data.user.id;
    } finally {
      _userIdPromise = null;
    }
  })();

  return _userIdPromise;
}

async function getCurrentAuthResponse(): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Oturum bulunamadı');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, date_of_birth, gender, height_cm, weight_kg, activity_level, language, timezone, onboarding_completed, created_at, updated_at')
    .eq('id', data.user.id)
    .maybeSingle();

  return {
    user: {
      id: data.user.id,
      email: data.user.email || '',
      displayName: profile?.display_name ?? data.user.user_metadata?.display_name ?? undefined,
      avatarUrl: profile?.avatar_url ?? undefined,
      dateOfBirth: profile?.date_of_birth ?? undefined,
      gender: profile?.gender ?? undefined,
      heightCm: profile?.height_cm ?? undefined,
      weightKg: profile?.weight_kg != null ? String(profile.weight_kg) : undefined,
      activityLevel: profile?.activity_level ?? undefined,
      language: profile?.language ?? undefined,
      timezone: profile?.timezone ?? undefined,
      onboardingCompleted: profile?.onboarding_completed ?? undefined,
      createdAt: profile?.created_at ?? new Date().toISOString(),
      updatedAt: profile?.updated_at ?? new Date().toISOString(),
    },
  };
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, content] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || 'application/octet-stream';
  const binary = atob(content);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

async function uploadDataUrlToStorage(dataUrl: string, path: string): Promise<string> {
  const blob = dataUrlToBlob(dataUrl);
  const { error } = await supabase.storage
    .from('health-uploads')
    .upload(path, blob, {
      contentType: blob.type,
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from('health-uploads').getPublicUrl(path);
  return data.publicUrl;
}

async function invokeHealthAnalysis(type: string, payload: Record<string, unknown>) {
  const timeoutMs = 45000;
  const invokePromise = supabase.functions.invoke('analyze-health-data', {
    body: { type, ...payload },
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('AI analiz zaman aşımına uğradı. Lütfen tekrar deneyin.'));
    }, timeoutMs);
  });

  const { data, error } = await Promise.race([
    invokePromise,
    timeoutPromise,
  ]) as Awaited<typeof invokePromise>;

  if (error) {
    throw new Error(typeof error === 'object' && 'message' in error ? (error as any).message : String(error));
  }

  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error(String((data as any).error));
  }

  if (!data) {
    throw new Error('AI analiz yanıt vermedi. Lütfen tekrar deneyin.');
  }

  return data as Record<string, any>;
}

function normalizeBloodTestMarkers(markers: unknown) {
  if (Array.isArray(markers)) return markers;
  if (!markers || typeof markers !== 'object') return [];
  return Object.entries(markers as Record<string, any>).map(([name, marker]) => ({
    name,
    value: marker?.value ?? null,
    unit: marker?.unit ?? null,
    referenceMin: marker?.referenceMin ?? marker?.min ?? null,
    referenceMax: marker?.referenceMax ?? marker?.max ?? null,
    status: marker?.status ?? null,
    category: marker?.category ?? null,
    interpretation: marker?.interpretation ?? null,
  }));
}

function toCamelDailyLog(row: any): DailyHealthLog {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    caloriesConsumed: row.calories_consumed ?? 0,
    caloriesBurned: row.calories_burned ?? 0,
    caloriesTarget: row.calories_target ?? 2100,
    proteinGrams: String(row.protein_grams ?? '0'),
    proteinTarget: String(row.protein_target ?? '180'),
    carbsGrams: String(row.carbs_grams ?? '0'),
    fatGrams: String(row.fat_grams ?? '0'),
    waterMl: row.water_ml ?? 0,
    waterTarget: row.water_target ?? 2400,
    steps: row.steps ?? 0,
    stepsTarget: row.steps_target ?? 10000,
    sleepMinutes: row.sleep_minutes ?? null,
    sleepTarget: row.sleep_target ?? 480,
    stressLevel: row.stress_level ?? null,
    moodScore: row.mood_score ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as DailyHealthLog;
}

function toCamelFoodEntry(row: any): FoodEntry {
  return {
    id: row.id,
    userId: row.user_id,
    mealType: row.meal_type,
    foodName: row.food_name,
    calories: row.calories,
    proteinGrams: row.protein_grams != null ? String(row.protein_grams) : null,
    carbsGrams: row.carbs_grams != null ? String(row.carbs_grams) : null,
    fatGrams: row.fat_grams != null ? String(row.fat_grams) : null,
    fiberGrams: row.fiber_grams != null ? String(row.fiber_grams) : null,
    servingSize: row.serving_size ?? null,
    imageUrl: row.image_url ?? null,
    barcode: row.barcode ?? null,
    aiConfidence: row.ai_confidence != null ? String(row.ai_confidence) : null,
    source: row.source ?? 'manual',
    loggedAt: row.logged_at,
    createdAt: row.created_at,
  } as FoodEntry;
}

function toCamelActivityEntry(row: any): ActivityEntry {
  return {
    id: row.id,
    userId: row.user_id,
    activityType: row.activity_type,
    durationMinutes: row.duration_minutes,
    caloriesBurned: row.calories_burned ?? null,
    intensity: row.intensity ?? 'moderate',
    heartRateAvg: row.heart_rate_avg ?? null,
    heartRateMax: row.heart_rate_max ?? null,
    distanceKm: row.distance_km != null ? String(row.distance_km) : null,
    notes: row.notes ?? null,
    startedAt: row.started_at,
    endedAt: row.ended_at ?? null,
    createdAt: row.created_at,
  } as ActivityEntry;
}

function toCamelVoiceEntry(row: any): VoiceEntry {
  return {
    id: row.id,
    userId: row.user_id,
    audioUrl: row.audio_url ?? null,
    durationSeconds: row.duration_seconds ?? null,
    transcription: row.transcription ?? null,
    sentiment: row.sentiment ?? null,
    mood: row.mood ?? null,
    keywords: row.keywords ?? [],
    aiSummary: row.ai_summary ?? null,
    aiRecommendations: row.ai_recommendations ?? null,
    createdAt: row.created_at,
  } as VoiceEntry;
}

function toCamelBloodTestResult(row: any): BloodTestResult {
  return {
    id: row.id,
    bloodTestId: row.blood_test_id,
    markerName: row.marker_name,
    value: row.value != null ? String(row.value) : '',
    unit: row.unit,
    referenceMin: row.reference_min != null ? String(row.reference_min) : null,
    referenceMax: row.reference_max != null ? String(row.reference_max) : null,
    status: row.status ?? null,
    category: row.category ?? null,
    aiInterpretation: row.ai_interpretation ?? null,
    createdAt: row.created_at,
  } as BloodTestResult;
}

function toCamelBloodTest(row: any): BloodTest {
  return {
    id: row.id,
    userId: row.user_id,
    testDate: row.test_date,
    labName: row.lab_name ?? null,
    documentUrl: row.document_url ?? null,
    ocrExtractedText: row.ocr_extracted_text ?? null,
    aiSummary: row.ai_summary ?? null,
    overallStatus: row.overall_status ?? null,
    results: (row.blood_test_results ?? row.results ?? []).map(toCamelBloodTestResult),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as BloodTest;
}

function toCamelHealthDocument(row: any): HealthDocument {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    documentType: row.document_type,
    fileUrl: row.file_url ?? null,
    mimeType: row.mime_type ?? null,
    fileSize: row.file_size ?? null,
    ocrText: row.ocr_text ?? null,
    aiAnalysis: row.ai_analysis ?? null,
    aiRecommendations: row.ai_recommendations ?? null,
    tags: row.tags ?? [],
    status: row.status ?? 'pending',
    uploadedAt: row.uploaded_at,
    createdAt: row.created_at,
  } as HealthDocument;
}

function toCamelMedicalPhoto(row: any): MedicalPhoto {
  return {
    id: row.id,
    userId: row.user_id,
    photoType: row.photo_type,
    imageUrl: row.image_url,
    aiAnalysis: row.ai_analysis ?? null,
    confidence: row.confidence != null ? String(row.confidence) : null,
    notes: row.notes ?? null,
    analyzedAt: row.analyzed_at ?? null,
    createdAt: row.created_at,
  } as MedicalPhoto;
}

function toCamelAchievement(row: any): Achievement {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    iconUrl: row.icon_url ?? null,
    category: row.category ?? null,
    requirement: row.requirement ?? null,
    points: row.points ?? 0,
    createdAt: row.created_at,
  } as Achievement;
}

function toCamelUserAchievement(row: any): UserAchievement {
  return {
    id: row.id,
    userId: row.user_id,
    achievementId: row.achievement_id,
    earnedAt: row.earned_at,
    createdAt: row.created_at,
    achievement: row.achievement ? toCamelAchievement(row.achievement) : undefined,
  } as UserAchievement;
}

function toCamelUserStreak(row: any): UserStreak {
  return {
    id: row.id,
    userId: row.user_id,
    currentStreak: row.current_streak ?? 0,
    longestStreak: row.longest_streak ?? 0,
    lastActiveDate: row.last_active_date ?? null,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  } as UserStreak;
}

function toCamelGoal(row: any): UserGoal {
  return {
    id: row.id,
    userId: row.user_id,
    goalType: row.goal_type,
    title: row.title,
    description: row.description ?? null,
    targetValue: row.target_value != null ? String(row.target_value) : null,
    currentValue: row.current_value != null ? String(row.current_value) : null,
    unit: row.unit ?? null,
    startDate: row.start_date ?? null,
    targetDate: row.target_date ?? null,
    status: row.status ?? 'active',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as UserGoal;
}

function toCamelCommunityPost(row: any): CommunityPost {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title ?? null,
    content: row.content,
    category: row.category ?? null,
    imageUrl: row.image_url ?? null,
    likeCount: row.like_count ?? 0,
    commentCount: row.comment_count ?? 0,
    isPublished: row.is_published ?? true,
    isPinned: row.is_pinned ?? false,
    author: row.profiles ? {
      displayName: row.profiles.display_name || 'Anonim',
      avatarUrl: row.profiles.avatar_url || undefined,
    } : undefined,
    isLiked: row.isLiked,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as CommunityPost;
}

function toCamelCommunityComment(row: any): CommunityComment {
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    parentId: row.parent_id ?? null,
    content: row.content,
    likeCount: row.like_count ?? 0,
    author: row.profiles ? {
      displayName: row.profiles.display_name || 'Anonim',
      avatarUrl: row.profiles.avatar_url || undefined,
    } : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as CommunityComment;
}

function toCamelHealthProfile(row: any): HealthProfile {
  return {
    id: row.id,
    userId: row.user_id,
    bmi: row.bmi != null ? String(row.bmi) : null,
    bmr: row.bmr ?? null,
    tdee: row.tdee ?? null,
    bodyFatEstimate: row.body_fat_estimate != null ? String(row.body_fat_estimate) : null,
    healthScore: row.health_score ?? null,
    riskFactors: row.risk_factors ?? null,
    strengths: row.strengths ?? null,
    improvementAreas: row.improvement_areas ?? null,
    nutritionPlan: row.nutrition_plan ?? null,
    exercisePlan: row.exercise_plan ?? null,
    sleepRecommendation: row.sleep_recommendation ?? null,
    supplementRecommendations: row.supplement_recommendations ?? null,
    aiGeneratedSummary: row.ai_generated_summary ?? null,
    lastCalculatedAt: row.last_calculated_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as HealthProfile;
}

function toCamelChatConversation(row: any): ChatConversation {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title ?? null,
    topic: row.topic ?? null,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as ChatConversation;
}

function toCamelChatMessage(row: any): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    citations: row.citations ?? null,
    metadata: row.metadata ?? null,
    createdAt: row.created_at,
  } as ChatMessage;
}

function toCamelFamilyMember(row: any): FamilyMember {
  return {
    id: row.id,
    userId: row.user_id,
    linkedUserId: (row.linked_user_id ?? null) as any,
    name: row.name,
    relationship: row.relationship,
    dateOfBirth: row.date_of_birth ?? null,
    avatarUrl: row.avatar_url ?? null,
    notes: row.notes ?? null,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as FamilyMember;
}

function toCamelFamilyMedication(row: any): FamilyMedication {
  return {
    id: row.id,
    familyMemberId: row.family_member_id,
    name: row.name,
    dosage: row.dosage ?? null,
    frequency: row.frequency ?? null,
    scheduleTime: row.schedule_time ?? null,
    startDate: row.start_date ?? null,
    endDate: row.end_date ?? null,
    prescribedBy: row.prescribed_by ?? null,
    notes: row.notes ?? null,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as FamilyMedication;
}

function toCamelMedicationLog(row: any): MedicationLog {
  return {
    id: row.id,
    medicationId: row.medication_id,
    takenAt: row.taken_at,
    taken: row.taken,
    notes: row.notes ?? null,
    loggedBy: (row.logged_by ?? null) as any,
    createdAt: row.created_at,
  } as MedicationLog;
}

function toCamelSupplement(row: any): Supplement {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand ?? null,
    category: row.category,
    description: row.description ?? null,
    dosageForm: row.dosage_form ?? null,
    servingSize: row.serving_size ?? null,
    ingredients: row.ingredients ?? null,
    benefits: row.benefits ?? [],
    warnings: row.warnings ?? null,
    imageUrl: row.image_url ?? null,
    price: row.price != null ? String(row.price) : null,
    currency: row.currency ?? 'TRY',
    externalUrl: row.external_url ?? null,
    affiliateUrl: row.affiliate_url ?? null,
    rating: row.rating != null ? String(row.rating) : null,
    reviewCount: row.review_count ?? 0,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
  } as Supplement;
}

function toCamelSupplementRecommendation(row: any): SupplementRecommendation & { supplementName?: string } {
  return {
    id: row.id,
    userId: row.user_id,
    supplementId: row.supplement_id,
    reason: row.reason,
    priority: row.priority,
    basedOn: row.based_on ?? null,
    suggestedDosage: row.suggested_dosage ?? null,
    duration: row.duration ?? null,
    status: row.status,
    supplement: row.supplements ? toCamelSupplement(row.supplements) : undefined,
    supplementName: row.supplements?.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as SupplementRecommendation & { supplementName?: string };
}

function toCamelSupplementOrder(row: any): SupplementOrder {
  return {
    id: row.id,
    userId: row.user_id,
    supplementId: row.supplement_id,
    quantity: row.quantity,
    totalPrice: row.total_price != null ? String(row.total_price) : null,
    currency: row.currency ?? 'TRY',
    orderStatus: row.order_status,
    externalOrderId: row.external_order_id ?? null,
    supplement: row.supplements ? toCamelSupplement(row.supplements) : undefined,
    orderedAt: row.ordered_at,
    createdAt: row.created_at,
  } as SupplementOrder;
}

function toCamelWearableDevice(row: any): WearableDevice {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    type: row.type,
    supportedMetrics: row.supported_metrics ?? [],
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
  } as WearableDevice;
}

function toCamelUserDevice(row: any): UserDevice {
  return {
    id: row.id,
    userId: row.user_id,
    deviceId: row.device_id,
    deviceName: row.device_name ?? null,
    isConnected: row.is_connected ?? true,
    lastSync: row.last_sync ?? null,
    device: row.wearable_devices ? toCamelWearableDevice(row.wearable_devices) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as UserDevice;
}

function toCamelWearableDataEntry(row: any): WearableDataEntry {
  return {
    id: row.id,
    userId: row.user_id,
    deviceId: row.device_id,
    metricType: row.metric_type,
    value: row.value != null ? String(row.value) : '0',
    unit: row.unit,
    recordedAt: row.recorded_at,
    syncedAt: row.synced_at,
    createdAt: row.created_at,
  } as WearableDataEntry;
}

// ─────────────────────────────────────────────────────────────
// KİMLİK DOĞRULAMA & KULLANICI PROFİL API
// ─────────────────────────────────────────────────────────────

export const authAPI = {
  /** Yeni kullanıcı kaydı */
  register: async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName ?? null } },
    });
    if (error) throw error;
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      await supabase.from('profiles').upsert({
        id: userData.user.id,
        email: userData.user.email,
        display_name: displayName ?? null,
      }, { onConflict: 'id' });
    }
    return getCurrentAuthResponse();
  },

  /** Kullanıcı girişi */
  login: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return getCurrentAuthResponse();
  },

  /** Oturumu kapat */
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  },

  /** Mevcut oturumu doğrula ve kullanıcı bilgisini al */
  me: () => getCurrentAuthResponse(),

  /** Kullanıcı profilini güncelle */
  updateProfile: async (data: ProfileUpdateData) => {
    const userId = await getCurrentSupabaseUserId();
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: data.displayName,
        height_cm: data.heightCm,
        weight_kg: data.weightKg,
        activity_level: data.activityLevel,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        language: data.language,
        ...(data.onboardingCompleted !== undefined && { onboarding_completed: data.onboardingCompleted }),
      })
      .eq('id', userId);
    if (error) throw error;
    return getCurrentAuthResponse();
  },
};

// ─────────────────────────────────────────────────────────────
// SAĞLIK TAKİP API
// ─────────────────────────────────────────────────────────────

export const healthAPI = {
  /* ── Günlük Sağlık Kaydı ─────────────────────────── */
  getDailyLog: async (date?: string) => {
    const userId = await getCurrentSupabaseUserId();
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('daily_health_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', targetDate)
      .maybeSingle();

    if (error) throw error;
    return data ? toCamelDailyLog(data) : null;
  },
  updateDailyLog: async (data: DailyLogUpdateData) => {
    const userId = await getCurrentSupabaseUserId();
    const targetDate = data.date || new Date().toISOString().slice(0, 10);
    const payload = {
      user_id: userId,
      date: targetDate,
      calories_consumed: data.caloriesConsumed,
      calories_burned: data.caloriesBurned,
      calories_target: data.caloriesTarget,
      protein_grams: data.proteinGrams,
      protein_target: data.proteinTarget,
      carbs_grams: data.carbsGrams,
      fat_grams: data.fatGrams,
      water_ml: data.waterMl,
      water_target: data.waterTarget,
      steps: data.steps,
      steps_target: data.stepsTarget,
      sleep_minutes: data.sleepMinutes,
      sleep_target: data.sleepTarget,
      stress_level: data.stressLevel,
      mood_score: data.moodScore,
      notes: data.notes,
    };

    const { data: upserted, error } = await supabase
      .from('daily_health_logs')
      .upsert(payload, { onConflict: 'user_id,date' })
      .select('*')
      .single();

    if (error) throw error;
    return toCamelDailyLog(upserted);
  },
  getDailyLogRange: async (startDate: string, endDate: string) => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('daily_health_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toCamelDailyLog);
  },

  /* ── Yemek Girişleri ─────────────────────────────── */
  getFoodEntries: async (date?: string) => {
    const userId = await getCurrentSupabaseUserId();
    let query = supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });

    if (date) {
      query = query.gte('logged_at', `${date}T00:00:00.000Z`).lt('logged_at', `${date}T23:59:59.999Z`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(toCamelFoodEntry);
  },
  getMacroSummary: async (startDate: string, endDate: string): Promise<{ proteinGrams: number; carbsGrams: number; fatGrams: number }> => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('food_entries')
      .select('protein_grams,carbs_grams,fat_grams')
      .eq('user_id', userId)
      .gte('logged_at', `${startDate}T00:00:00.000Z`)
      .lte('logged_at', `${endDate}T23:59:59.999Z`);
    if (error) throw error;
    const rows = data ?? [];
    return {
      proteinGrams: rows.reduce((s, r) => s + (Number(r.protein_grams) || 0), 0),
      carbsGrams:   rows.reduce((s, r) => s + (Number(r.carbs_grams)   || 0), 0),
      fatGrams:     rows.reduce((s, r) => s + (Number(r.fat_grams)     || 0), 0),
    };
  },
  addFoodEntry: async (data: FoodEntryCreateData) => {
    const userId = await getCurrentSupabaseUserId();
    const { data: inserted, error } = await supabase
      .from('food_entries')
      .insert({
        user_id: userId,
        meal_type: data.mealType,
        food_name: data.foodName,
        calories: data.calories,
        protein_grams: data.proteinGrams ?? null,
        carbs_grams: data.carbsGrams ?? null,
        fat_grams: data.fatGrams ?? null,
        fiber_grams: data.fiberGrams ?? null,
        serving_size: data.servingSize ?? null,
        image_url: data.imageUrl ?? null,
        barcode: data.barcode ?? null,
        ai_confidence: data.aiConfidence ?? null,
        source: data.source ?? 'manual',
      })
      .select('*')
      .single();

    if (error) throw error;

    // Sync daily_health_logs with today's food totals
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data: todayFoods } = await supabase
        .from('food_entries')
        .select('calories, protein_grams, carbs_grams, fat_grams')
        .eq('user_id', userId)
        .gte('logged_at', `${today}T00:00:00.000Z`)
        .lt('logged_at', `${today}T23:59:59.999Z`);

      const totalCal = (todayFoods ?? []).reduce((s, f) => s + (f.calories ?? 0), 0);
      const totalProtein = (todayFoods ?? []).reduce((s, f) => s + Number(f.protein_grams ?? 0), 0);
      const totalCarbs = (todayFoods ?? []).reduce((s, f) => s + Number(f.carbs_grams ?? 0), 0);
      const totalFat = (todayFoods ?? []).reduce((s, f) => s + Number(f.fat_grams ?? 0), 0);

      await supabase
        .from('daily_health_logs')
        .upsert({
          user_id: userId,
          date: today,
          calories_consumed: totalCal,
          protein_grams: String(totalProtein),
          carbs_grams: String(totalCarbs),
          fat_grams: String(totalFat),
        }, { onConflict: 'user_id,date' });
    } catch (e) {
      console.warn('Failed to sync daily log after food entry:', e);
    }

    return toCamelFoodEntry(inserted);
  },
  analyzeFood: async (imageData: string) => {
    let result: Record<string, any>;

    try {
      result = await invokeHealthAnalysis('food-image', { imageData });
    } catch (error) {
      console.warn('Food analysis edge function failed, using local fallback:', error);
      result = {
        food: 'Yemek',
        calories: 350,
        servingSize: '1 porsiyon',
        confidence: 55,
        macros: {
          protein: { amount: 18, percentage: 20 },
          carbs: { amount: 32, percentage: 45 },
          fat: { amount: 14, percentage: 35 },
          fiber: { amount: 4, percentage: 15 },
        },
        healthNotes: ['AI servisine ulaşılamadığı için tahmini sonuç gösteriliyor.'],
      };
    }

    // AI may return strings instead of numbers — safely extract first numeric value
    const safeNum = (v: unknown, fallback = 0): number => {
      if (typeof v === 'number' && !Number.isNaN(v)) return Math.round(v);
      if (typeof v === 'string') {
        const m = v.match(/(\d+)/);
        return m ? parseInt(m[1], 10) : fallback;
      }
      return fallback;
    };

    // AI may return macros as plain numbers (e.g. { protein: 25 })
    // or as objects (e.g. { protein: { amount: 25, percentage: 20 } })
    const macroVal = (macro: unknown): number => {
      if (macro == null) return 0;
      if (typeof macro === 'number' || typeof macro === 'string') return safeNum(macro);
      if (typeof macro === 'object' && macro !== null) {
        const obj = macro as Record<string, unknown>;
        return safeNum(obj.amount ?? obj.value ?? obj.grams ?? 0);
      }
      return 0;
    };

    const macros = result.macros ?? {};
    return {
      foodName: typeof result.food === 'string' ? result.food.split(':')[0].trim() : 'Yemek',
      calories: safeNum(result.calories, 200),
      proteinGrams: macroVal(macros.protein),
      carbsGrams: macroVal(macros.carbs),
      fatGrams: macroVal(macros.fat ?? macros.fats),
      fiberGrams: macroVal(macros.fiber),
      servingSize: typeof result.servingSize === 'string' ? result.servingSize : '1 porsiyon',
      confidence: (() => {
        const raw = safeNum(result.confidence, 70);
        // Normalize: AI sometimes returns fraction (0.92) instead of integer (92)
        return raw > 0 && raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
      })(),
    } as FoodAnalysisResult;
  },

  deleteFoodEntry: async (id: string) => {
    const userId = await getCurrentSupabaseUserId();
    const { error } = await supabase.from('food_entries').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  deleteActivityEntry: async (id: string) => {
    const userId = await getCurrentSupabaseUserId();
    const { error } = await supabase.from('activity_entries').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  deleteVoiceEntry: async (id: string) => {
    const userId = await getCurrentSupabaseUserId();
    const { error } = await supabase.from('voice_entries').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  /* ── Aktivite Takibi ─────────────────────────────── */
  getActivities: async (limit?: number) => {
    const userId = await getCurrentSupabaseUserId();
    let query = supabase
      .from('activity_entries')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(toCamelActivityEntry);
  },
  addActivity: async (data: ActivityCreateData | any) => {
    const userId = await getCurrentSupabaseUserId();
    const normalized = {
      activity_type: data.activityType ?? data.type,
      duration_minutes: data.durationMinutes ?? data.duration,
      calories_burned: data.caloriesBurned ?? data.calories ?? null,
      intensity: data.intensity ?? 'moderate',
      heart_rate_avg: data.heartRateAvg ?? null,
      heart_rate_max: data.heartRateMax ?? null,
      distance_km: data.distanceKm ?? null,
      notes: data.notes ?? null,
      started_at: data.startedAt ?? new Date().toISOString(),
      ended_at: data.endedAt ?? null,
    };

    const { data: inserted, error } = await supabase
      .from('activity_entries')
      .insert({ user_id: userId, ...normalized })
      .select('*')
      .single();

    if (error) throw error;
    return toCamelActivityEntry(inserted);
  },

  /* ── Aralıklı Oruç ──────────────────────────────── */
  getActiveFasting: async () => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('fasting_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('started_at', { ascending: false })
      .maybeSingle();
    if (error) throw error;
    return data ? ({
      id: data.id,
      userId: data.user_id,
      fastingPlan: data.fasting_plan,
      startedAt: data.started_at,
      targetEndAt: data.target_end_at,
      actualEndAt: data.actual_end_at ?? null,
      completed: data.completed,
      notes: data.notes ?? null,
      moodBefore: data.mood_before ?? null,
      moodAfter: data.mood_after ?? null,
      createdAt: data.created_at,
    } as FastingLog) : null;
  },
  startFasting: async (data: FastingStartData) => {
    const userId = await getCurrentSupabaseUserId();
    const startedAt = data.startedAt ?? new Date().toISOString();
    const hours = Number(String(data.fastingPlan).split(':')[0] || 16);
    const targetEndAt = data.targetEndAt ?? new Date(new Date(startedAt).getTime() + hours * 3600 * 1000).toISOString();
    const { data: inserted, error } = await supabase
      .from('fasting_logs')
      .insert({
        user_id: userId,
        fasting_plan: data.fastingPlan,
        started_at: startedAt,
        target_end_at: targetEndAt,
        notes: data.notes ?? null,
        mood_before: data.moodBefore ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return {
      id: inserted.id,
      userId: inserted.user_id,
      fastingPlan: inserted.fasting_plan,
      startedAt: inserted.started_at,
      targetEndAt: inserted.target_end_at,
      actualEndAt: inserted.actual_end_at ?? null,
      completed: inserted.completed,
      notes: inserted.notes ?? null,
      moodBefore: inserted.mood_before ?? null,
      moodAfter: inserted.mood_after ?? null,
      createdAt: inserted.created_at,
    } as FastingLog;
  },
  endFasting: async (id: string, moodAfter?: number) => {
    const { data, error } = await supabase
      .from('fasting_logs')
      .update({
        completed: true,
        actual_end_at: new Date().toISOString(),
        mood_after: moodAfter ?? null,
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      fastingPlan: data.fasting_plan,
      startedAt: data.started_at,
      targetEndAt: data.target_end_at,
      actualEndAt: data.actual_end_at ?? null,
      completed: data.completed,
      notes: data.notes ?? null,
      moodBefore: data.mood_before ?? null,
      moodAfter: data.mood_after ?? null,
      createdAt: data.created_at,
    } as FastingLog;
  },
  getFastingHistory: async () => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('fasting_logs')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((item: any) => ({
      id: item.id,
      userId: item.user_id as any,
      fastingPlan: item.fasting_plan,
      startedAt: item.started_at,
      targetEndAt: item.target_end_at,
      actualEndAt: item.actual_end_at ?? null,
      completed: item.completed,
      notes: item.notes ?? null,
      moodBefore: item.mood_before ?? null,
      moodAfter: item.mood_after ?? null,
      createdAt: item.created_at,
    } as FastingLog));
  },

  /* ── Kan Tahlilleri ──────────────────────────────── */
  getBloodTests: async () => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('blood_tests')
      .select('*')
      .eq('user_id', userId)
      .order('test_date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelBloodTest);
  },
  getBloodTest: async (id: string) => {
    const { data, error } = await supabase
      .from('blood_tests')
      .select('*, blood_test_results(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return toCamelBloodTest(data);
  },
  uploadBloodTest: async (data: BloodTestUploadData) => {
    const userId = await getCurrentSupabaseUserId();
    let analysis: Record<string, any>;
    try {
      analysis = await invokeHealthAnalysis('blood-test', {
        ocrText: data.ocrText,
      });
    } catch (err) {
      console.warn('Blood test analysis edge function failed, saving without AI analysis:', err);
      analysis = {
        summary: 'AI analizi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
        overallStatus: 'attention',
        markers: [],
      };
    }

    const { data: inserted, error } = await supabase
      .from('blood_tests')
      .insert({
        user_id: userId,
        test_date: data.testDate ?? new Date().toISOString(),
        lab_name: data.labName ?? null,
        ocr_extracted_text: data.ocrText,
        ai_summary: analysis.summary ?? null,
        overall_status: analysis.overallStatus ?? 'attention',
      })
      .select('*')
      .single();
    if (error) throw error;

    const markers = normalizeBloodTestMarkers(analysis.markers);

    if (markers.length > 0) {
      const { error: resultsError } = await supabase
        .from('blood_test_results')
        .insert(markers.map((marker: any) => ({
          blood_test_id: inserted.id,
          marker_name: marker.name,
          value: marker.value,
          unit: marker.unit,
          reference_min: marker.referenceMin ?? null,
          reference_max: marker.referenceMax ?? null,
          status: marker.status ?? null,
          category: marker.category ?? null,
          ai_interpretation: marker.interpretation ?? null,
        })));
      if (resultsError) throw resultsError;
    }

    return healthAPI.getBloodTest(inserted.id);
  },

  /* ── Sağlık Belgeleri ────────────────────────────── */
  getDocuments: async () => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('health_documents')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelHealthDocument);
  },
  uploadDocument: async (data: DocumentUploadData) => {
    const userId = await getCurrentSupabaseUserId();
    let fileUrl: string | null = (data as any).fileUrl ?? null;

    if (data.imageBase64) {
      const path = `${userId}/documents/${Date.now()}.jpg`;
      fileUrl = await uploadDataUrlToStorage(data.imageBase64, path);
    }

    let analysis: Record<string, any>;
    try {
      analysis = await invokeHealthAnalysis('document', {
        ocrText: data.ocrText ?? null,
        imageBase64: data.imageBase64 ?? null,
        documentType: data.documentType,
        title: data.title ?? null,
      });
    } catch (err) {
      console.warn('Document analysis edge function failed, saving without AI analysis:', err);
      analysis = {
        title: data.title ?? 'Sağlık Belgesi',
        summary: 'AI analizi şu anda kullanılamıyor.',
        recommendations: [],
        tags: data.tags ?? [],
      };
    }

    const { data: inserted, error } = await supabase
      .from('health_documents')
      .insert({
        user_id: userId,
        title: analysis.title ?? data.title ?? 'Sağlık Belgesi',
        document_type: data.documentType,
        file_url: fileUrl,
        mime_type: (data as any).mimeType ?? null,
        file_size: (data as any).fileSize ?? null,
        ocr_text: data.ocrText ?? null,
        ai_analysis: analysis.summary ?? null,
        ai_recommendations: analysis.recommendations ?? [],
        tags: analysis.tags ?? data.tags ?? [],
        status: 'analyzed',
      })
      .select('*')
      .single();
    if (error) throw error;
    return toCamelHealthDocument(inserted);
  },

  /* ── Tıbbi Fotoğraf Analizi ──────────────────────── */
  getMedicalPhotos: async () => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('medical_photos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelMedicalPhoto);
  },
  analyzeMedicalPhoto: async (data: MedicalPhotoUploadData) => {
    const userId = await getCurrentSupabaseUserId();
    const imagePath = `${userId}/medical-photos/${Date.now()}.jpg`;
    const imageUrl = await uploadDataUrlToStorage(data.imageData, imagePath);
    let analysis: Record<string, any>;
    try {
      analysis = await invokeHealthAnalysis('medical-photo', {
        imageData: data.imageData,
        photoType: data.photoType,
        notes: data.notes ?? null,
      });
    } catch (err) {
      console.warn('Medical photo analysis edge function failed, saving without AI analysis:', err);
      analysis = {
        analysis: {
          color: 'bilinmiyor',
          observations: ['AI analizi şu anda kullanılamıyor'],
          concerns: [],
          recommendations: ['Lütfen daha sonra tekrar deneyin'],
          urgency: 'low' as const,
        },
        detectedType: data.photoType,
        confidence: '0',
      };
    }

    const { data: inserted, error } = await supabase
      .from('medical_photos')
      .insert({
        user_id: userId,
        photo_type: analysis.detectedType ?? data.photoType,
        image_url: imageUrl,
        ai_analysis: analysis.analysis ?? null,
        confidence: analysis.confidence ?? null,
        notes: data.notes ?? null,
        analyzed_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw error;
    return {
      photo: toCamelMedicalPhoto(inserted),
      analysis: analysis.analysis,
      detectedType: analysis.detectedType ?? data.photoType,
      confidence: analysis.confidence ?? null,
    };
  },

  /* ── Sesli Günlük ────────────────────────────────── */
  getVoiceEntries: async () => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('voice_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelVoiceEntry);
  },
  addVoiceEntry: async (data: VoiceEntryCreateData) => {
    const userId = await getCurrentSupabaseUserId();
    let analysis: Record<string, any>;
    try {
      analysis = await invokeHealthAnalysis('voice-entry', {
        transcription: data.transcription,
      });
    } catch (err) {
      console.warn('Voice entry analysis edge function failed, saving without AI analysis:', err);
      analysis = {
        transcription: data.transcription,
        sentiment: null,
        mood: null,
        keywords: [],
        summary: 'AI analizi şu anda kullanılamıyor.',
        recommendations: null,
      };
    }

    const { data: inserted, error } = await supabase
      .from('voice_entries')
      .insert({
        user_id: userId,
        audio_url: data.audioUrl ?? null,
        duration_seconds: data.durationSeconds ?? null,
        transcription: analysis.transcription ?? data.transcription,
        sentiment: analysis.sentiment ?? null,
        mood: analysis.mood ?? null,
        keywords: analysis.keywords ?? [],
        ai_summary: analysis.summary ?? null,
        ai_recommendations: analysis.recommendations ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;

    let foodAnalysis: Record<string, any> | null = null;
    let foodEntries: FoodEntry[] = [];

    if (data.mode === 'food') {
      try {
        foodAnalysis = await invokeHealthAnalysis('voice-food', {
          transcription: data.transcription,
        });
      } catch (err) {
        console.warn('Voice food analysis edge function failed:', err);
        foodAnalysis = { foods: [] };
      }

      if ((foodAnalysis.foods ?? []).length > 0) {
        const { data: insertedFoods, error: foodError } = await supabase
          .from('food_entries')
          .insert((foodAnalysis.foods ?? []).map((food: any) => ({
            user_id: userId,
            meal_type: food.mealType || 'snack',
            food_name: food.food,
            calories: food.calories,
            protein_grams: String(food.protein ?? 0),
            carbs_grams: String(food.carbs ?? 0),
            fat_grams: String(food.fats ?? 0),
            serving_size: food.servingSize ?? null,
            ai_confidence: String(food.confidence ?? 0),
            source: 'voice',
          })))
          .select('*');
        if (foodError) throw foodError;
        foodEntries = (insertedFoods ?? []).map(toCamelFoodEntry);
      }
    }

    return {
      entry: toCamelVoiceEntry(inserted),
      analysis,
      foodEntries,
      foodAnalysis,
    };
  },

  /* ── Hedefler ────────────────────────────────────── */
  getGoals: async () => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelGoal);
  },
  createGoal: async (data: GoalCreateData) => {
    const userId = await getCurrentSupabaseUserId();
    const { data: inserted, error } = await supabase
      .from('user_goals')
      .insert({
        user_id: userId,
        goal_type: data.goalType,
        title: data.title,
        description: data.description ?? null,
        target_value: data.targetValue ?? null,
        current_value: data.currentValue ?? null,
        unit: data.unit ?? null,
        start_date: data.startDate ?? null,
        target_date: data.targetDate ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return toCamelGoal(inserted);
  },
  updateGoal: async (id: string, data: GoalUpdateData) => {
    const payload = {
      title: data.title,
      description: data.description,
      target_value: data.targetValue,
      current_value: data.currentValue,
      status: data.status,
      target_date: data.targetDate,
    };
    const { data: updated, error } = await supabase
      .from('user_goals')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return toCamelGoal(updated);
  },

  /* ── Başarımlar ──────────────────────────────────── */
  getAchievements: async () => {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toCamelAchievement);
  },
  getMyAchievements: async () => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('user_achievements')
      .select('id, user_id, achievement_id, earned_at, created_at, achievement:achievements(*)')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelUserAchievement);
  },
  checkAchievements: async (context: Record<string, unknown>) => {
    const userId = await getCurrentSupabaseUserId();
    const [allAchievements, earnedAchievements] = await Promise.all([
      healthAPI.getAchievements(),
      healthAPI.getMyAchievements(),
    ]);

    const earnedIds = new Set((earnedAchievements ?? []).map((item) => item.achievementId));
    const newlyEarnedIds: string[] = [];

    for (const achievement of allAchievements ?? []) {
      if (earnedIds.has(achievement.id)) continue;

      const requirement = achievement.requirement as { type?: string; value?: number } | null;
      if (!requirement?.type) continue;

      let shouldAward = false;
      switch (requirement.type) {
        case 'food_count':
          shouldAward = Number(context.foodCount ?? 0) >= Number(requirement.value ?? 0);
          break;
        case 'activity_count':
          shouldAward = Number(context.activityCount ?? 0) >= Number(requirement.value ?? 0);
          break;
        case 'document_count':
          shouldAward = Number(context.documentCount ?? 0) >= Number(requirement.value ?? 0);
          break;
        case 'voice_count':
          shouldAward = Number(context.voiceCount ?? 0) >= Number(requirement.value ?? 0);
          break;
        case 'water_goal':
          shouldAward = Boolean(context.waterGoalReached);
          break;
        case 'streak':
          shouldAward = Number(context.currentStreak ?? 0) >= Number(requirement.value ?? 0);
          break;
        case 'score':
          shouldAward = Number(context.haloScore ?? 0) >= Number(requirement.value ?? 0);
          break;
        case 'all_quests':
          shouldAward = Boolean(context.allQuestsComplete);
          break;
        default:
          shouldAward = false;
      }

      if (shouldAward) {
        newlyEarnedIds.push(achievement.id);
      }
    }

    if (newlyEarnedIds.length === 0) {
      return [] as UserAchievement[];
    }

    const { error } = await supabase
      .from('user_achievements')
      .insert(newlyEarnedIds.map((achievementId) => ({
        user_id: userId,
        achievement_id: achievementId,
      })));

    if (error) throw error;

    const updated = await healthAPI.getMyAchievements();
    return updated.filter((item) => newlyEarnedIds.includes(item.achievementId));
  },

  /* ── Streak ──────────────────────────────────────── */
  getStreak: async () => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return {
        id: '',
        userId: userId,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      } as UserStreak;
    }

    const streak = toCamelUserStreak(data);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (streak.lastActiveDate && streak.lastActiveDate !== today && streak.lastActiveDate !== yesterday) {
      const { data: resetData, error: resetError } = await supabase
        .from('user_streaks')
        .update({ current_streak: 0 })
        .eq('id', streak.id)
        .select('*')
        .single();

      if (resetError) throw resetError;
      return toCamelUserStreak(resetData);
    }

    return streak;
  },
  checkInStreak: async () => {
    const userId = await getCurrentSupabaseUserId();
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const existing = await healthAPI.getStreak();

    if (existing.id && existing.lastActiveDate === today) {
      return existing;
    }

    if (!existing.id) {
      const { data, error } = await supabase
        .from('user_streaks')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_active_date: today,
        })
        .select('*')
        .single();
      if (error) throw error;
      return toCamelUserStreak(data);
    }

    const newStreak = existing.lastActiveDate === yesterday ? existing.currentStreak + 1 : 1;
    const newLongest = Math.max(newStreak, existing.longestStreak);

    const { data, error } = await supabase
      .from('user_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_active_date: today,
      })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error) throw error;
    return toCamelUserStreak(data);
  },
};

// ─────────────────────────────────────────────────────────────
// AI SOHBET API (RAG Tabanlı)
// ─────────────────────────────────────────────────────────────

export const chatAPI = {
  /** Kullanıcının sohbet geçmişini listele */
  getConversations: async () => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelChatConversation);
  },

  /** Yeni sohbet başlat */
  createConversation: async (data?: ConversationCreateData) => {
    const userId = await getCurrentSupabaseUserId();
    const { data: inserted, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: userId,
        title: data?.title ?? 'Yeni Konuşma',
        topic: data?.topic ?? 'general',
      })
      .select('*')
      .single();
    if (error) throw error;
    return toCamelChatConversation(inserted);
  },

  /** Bir sohbetin mesajlarını getir */
  getMessages: async (conversationId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toCamelChatMessage);
  },

  /** Mesaj gönder ve AI yanıtını al */
  sendMessage: async (conversationId: string, content: string) => {
    const { data: userInserted, error: userError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content,
      })
      .select('*')
      .single();
    if (userError) throw userError;

    const { data: history, error: historyError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (historyError) throw historyError;

    const { data: conversation, error: conversationError } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    if (conversationError) throw conversationError;

    const { data: response, error: chatError } = await supabase.functions.invoke('generate-chat-response', {
      body: {
        conversationId,
        topic: conversation.topic,
        message: content,
        history: (history ?? []).map((item: any) => ({ role: item.role, content: item.content })),
      },
    });

    if (chatError) {
      const errMsg = typeof chatError === 'object' && 'message' in chatError
        ? (chatError as any).message
        : String(chatError);
      throw new Error(`Chat API error: ${errMsg}`);
    }

    if (!response || typeof response !== 'object') {
      throw new Error('Chat API yanıt vermedi');
    }
    const { data: assistantInserted, error: assistantError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: response.content ?? 'Yanıt oluşturulamadı.',
        citations: response.citations ?? [],
        metadata: { suggestedFollowUps: response.suggestedFollowUps ?? [], contextUsed: response.contextUsed ?? [] },
      })
      .select('*')
      .single();
    if (assistantError) throw assistantError;

    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return {
      userMessage: toCamelChatMessage(userInserted),
      assistantMessage: toCamelChatMessage(assistantInserted),
    } as { userMessage: ChatMessage; assistantMessage: ChatMessage };
  },

  /** AI sağlık profilini getir */
  getHealthProfile: async () => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data ? toCamelHealthProfile(data) : null;
  },

  /** Sağlık profili oluştur / güncelle */
  generateHealthProfile: async (data?: Record<string, unknown>) => {
    const userId = await getCurrentSupabaseUserId();
    const body = (data ?? {}) as Record<string, any>;

    let result: Record<string, any>;

    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('generate-health-profile', {
        body,
      });

      if (fnError) {
        console.warn('[generateHealthProfile] Edge function failed, using client fallback:', fnError.message);
        throw fnError;
      }

      result = (fnData ?? {}) as Record<string, any>;
    } catch (_edgeErr) {
      // ── Client-side fallback profile ──
      const ud = body.userData as Record<string, any> | undefined;
      const heightCm = Number(ud?.heightCm ?? 0);
      const weightKg = Number(ud?.weightKg ?? 0);
      const age = ud?.dateOfBirth
        ? Math.floor((Date.now() - new Date(ud.dateOfBirth as string).getTime()) / 31557600000)
        : 30;
      const isMale = ud?.gender !== 'female';
      const bmi = heightCm > 0 && weightKg > 0 ? weightKg / ((heightCm / 100) ** 2) : null;
      const bmr = heightCm > 0 && weightKg > 0
        ? Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + (isMale ? 5 : -161))
        : null;
      const actMul: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
      const tdee = bmr ? Math.round(bmr * (actMul[ud?.activityLevel as string] ?? 1.4)) : null;

      let score = 50;
      const strengths: string[] = [];
      const improvements: string[] = [];

      if (bmi && bmi >= 18.5 && bmi <= 24.9) { score += 10; strengths.push('Normal BMI'); }
      else if (bmi) { improvements.push('BMI normal aralığa getirilmeli'); }

      const foods = (body.todayFood as any[]) ?? [];
      if (foods.length >= 3) { score += 10; strengths.push('Düzenli öğün takibi'); }
      else if (foods.length > 0) { score += 5; } else { improvements.push('Günlük öğün takibi yapılmalı'); }

      const waterMl = (body.todayWater as any)?.currentMl ?? 0;
      const waterTarget = (body.todayWater as any)?.targetMl ?? 2400;
      if (waterMl >= waterTarget) { score += 10; strengths.push('Yeterli su tüketimi'); }
      else if (waterMl > 0) { score += 5; improvements.push('Su tüketimi artırılmalı'); }
      else { improvements.push('Günlük su takibi yapılmalı'); }

      const acts = (body.recentActivities as any[]) ?? [];
      if (acts.length >= 5) { score += 10; strengths.push('Düzenli fiziksel aktivite'); }
      else if (acts.length > 0) { score += 5; improvements.push('Fiziksel aktivite artırılmalı'); }
      else { improvements.push('Egzersiz rutini oluşturulmalı'); }

      const sleepMin = (body.todaySleep as any)?.minutes;
      if (sleepMin && sleepMin >= 420) { score += 5; strengths.push('Yeterli uyku süresi'); }
      else if (sleepMin) { improvements.push('Uyku süresi artırılmalı'); }

      result = {
        bmi: bmi ? Number(bmi.toFixed(1)) : null,
        bmr, tdee, bodyFatEstimate: null,
        healthScore: Math.min(score, 100),
        riskFactors: [],
        strengths: strengths.length > 0 ? strengths : ['Sağlık takibine başladınız'],
        improvementAreas: improvements.length > 0 ? improvements : ['Daha fazla veri ile analiz zenginleşecek'],
        nutritionPlan: tdee ? { dailyCalories: tdee, macroSplit: { protein: 30, carbs: 40, fat: 30 }, mealSuggestions: ['Protein ağırlıklı kahvaltı', 'Lif içeriği yüksek öğle öğünü', 'Dengeli akşam yemeği'] } : null,
        exercisePlan: { weeklyGoal: 'Haftada en az 150 dakika orta yoğunluklu aktivite', suggestedActivities: ['Yürüyüş', 'Kuvvet antrenmanı', 'Esneme'] },
        sleepRecommendation: { targetHours: 8, advice: 'Her gün benzer saatte uyuyup uyanmayı hedefleyin.' },
        supplementRecommendations: [],
        aiSummary: 'Mevcut verilerinize göre sağlık profili oluşturuldu. Daha fazla veri girdikçe profil daha doğru hale gelecek.',
      };
    }
    const payload = {
      user_id: userId,
      bmi: result.bmi != null ? String(result.bmi) : null,
      bmr: result.bmr ?? null,
      tdee: result.tdee ?? null,
      body_fat_estimate: result.bodyFatEstimate != null ? String(result.bodyFatEstimate) : null,
      health_score: result.healthScore ?? null,
      risk_factors: result.riskFactors ?? null,
      strengths: result.strengths ?? null,
      improvement_areas: result.improvementAreas ?? null,
      nutrition_plan: result.nutritionPlan ?? null,
      exercise_plan: result.exercisePlan ?? null,
      sleep_recommendation: result.sleepRecommendation ?? null,
      supplement_recommendations: result.supplementRecommendations ?? null,
      ai_generated_summary: result.aiSummary ?? null,
      last_calculated_at: new Date().toISOString(),
    };

    const { data: upserted, error } = await supabase
      .from('health_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) throw error;
    return toCamelHealthProfile(upserted);
  },
};

// ─────────────────────────────────────────────────────────────
// TAKVİYE GIDA & SİPARİŞ API
// ─────────────────────────────────────────────────────────────

export const supplementAPI = {
  /** Takviyeleri listele (opsiyonel kategori filtresi) */
  getSupplements: async (category?: string) => {
    let query = supabase
      .from('supplements')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(toCamelSupplement);
  },

  /** Takviye detayı */
  getSupplement: async (id: string) => {
    const { data, error } = await supabase
      .from('supplements')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return toCamelSupplement(data);
  },

  /** Kullanıcıya özel AI önerileri */
  getRecommendations: async () => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('supplement_recommendations')
      .select('*, supplements(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelSupplementRecommendation);
  },

  /** Öneri durumunu güncelle (accepted | rejected | purchased) */
  updateRecommendationStatus: async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('supplement_recommendations')
      .update({ status })
      .eq('id', id)
      .select('*, supplements(*)')
      .single();
    if (error) throw error;
    return toCamelSupplementRecommendation(data);
  },

  /** Kullanıcının siparişleri */
  getOrders: async () => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('supplement_orders')
      .select('*, supplements(*)')
      .eq('user_id', userId)
      .order('ordered_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelSupplementOrder);
  },

  // ── Supplement Intake Tracking ──

  /** Get intake logs for a supplement (last N days) */
  getIntakeLogs: async (supplementKey?: string, days: number = 30) => {
    const userId = await getCurrentSupabaseUserId();
    const startDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    let query = supabase
      .from('supplement_intake_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .order('date', { ascending: false });
    if (supplementKey) query = query.eq('supplement_key', supplementKey);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      id: row.id,
      supplementKey: row.supplement_key,
      supplementName: row.supplement_name,
      dosage: row.dosage,
      timing: row.timing,
      takenAt: row.taken_at,
      date: row.date,
      notes: row.notes,
    }));
  },

  /** Check in: mark a supplement as taken today */
  checkInIntake: async (supplementKey: string, supplementName: string, dosage?: string, timing?: string) => {
    const userId = await getCurrentSupabaseUserId();
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('supplement_intake_logs')
      .upsert({
        user_id: userId,
        supplement_key: supplementKey,
        supplement_name: supplementName,
        dosage: dosage ?? null,
        timing: timing ?? null,
        date: today,
        taken_at: new Date().toISOString(),
      }, { onConflict: 'user_id,supplement_key,date' })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  /** Undo check-in: remove today's intake */
  uncheckIntake: async (supplementKey: string) => {
    const userId = await getCurrentSupabaseUserId();
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from('supplement_intake_logs')
      .delete()
      .eq('user_id', userId)
      .eq('supplement_key', supplementKey)
      .eq('date', today);
    if (error) throw error;
  },

  /** Get all tracked supplements with their intake stats */
  getTrackedSupplementStats: async () => {
    const userId = await getCurrentSupabaseUserId();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('supplement_intake_logs')
      .select('supplement_key, supplement_name, dosage, timing, date')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo)
      .order('date', { ascending: false });
    if (error) throw error;

    // Group by supplement_key
    const map = new Map<string, { name: string; dosage: string | null; timing: string | null; dates: string[] }>();
    for (const row of (data ?? []) as any[]) {
      const existing = map.get(row.supplement_key);
      if (existing) {
        existing.dates.push(row.date);
      } else {
        map.set(row.supplement_key, {
          name: row.supplement_name,
          dosage: row.dosage,
          timing: row.timing,
          dates: [row.date],
        });
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    return Array.from(map.entries()).map(([key, val]) => ({
      supplementKey: key,
      supplementName: val.name,
      dosage: val.dosage,
      timing: val.timing,
      totalDays: val.dates.length,
      last7Days: val.dates.filter(d => d >= new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)).length,
      takenToday: val.dates.includes(today),
      dates: val.dates,
    }));
  },

  /** Sipariş oluştur */
  createOrder: async (data: OrderCreateData) => {
    const userId = await getCurrentSupabaseUserId();
    const supplement = await supplementAPI.getSupplement(data.supplementId);
    const quantity = data.quantity ?? 1;
    const totalPrice = supplement.price ? Number(supplement.price) * quantity : null;

    const { data: inserted, error } = await supabase
      .from('supplement_orders')
      .insert({
        user_id: userId,
        supplement_id: data.supplementId,
        quantity,
        total_price: totalPrice,
        currency: supplement.currency || 'TRY',
      })
      .select('*, supplements(*)')
      .single();
    if (error) throw error;
    return toCamelSupplementOrder(inserted);
  },
};

// ─────────────────────────────────────────────────────────────
// TOPLULUK API
// ─────────────────────────────────────────────────────────────

export const communityAPI = {
  /** Gönderileri listele (sayfalama & filtre) */
  getPosts: async (category?: string, page?: number, limit?: number) => {
    const currentUserId = await getCurrentSupabaseUserId().catch(() => null);
    const currentPage = page || 1;
    const pageSize = limit || 20;
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('community_posts')
      .select('*, profiles!community_posts_user_id_fkey(display_name, avatar_url)', { count: 'exact' })
      .eq('is_published', true)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    let likedPostIds = new Set<string>();
    if (currentUserId && data?.length) {
      const { data: likes } = await supabase
        .from('community_likes')
        .select('post_id')
        .eq('user_id', currentUserId)
        .in('post_id', data.map((post) => post.id));
      likedPostIds = new Set((likes ?? []).map((like: any) => like.post_id));
    }

    const posts = (data ?? []).map((post: any) => toCamelCommunityPost({
      ...post,
      isLiked: likedPostIds.has(post.id),
    }));

    return { posts, total: count || 0, page: currentPage };
  },

  /** Gönderi detayı (yorumlar & beğeni durumu dahil) */
  getPost: async (id: string) => {
    const currentUserId = await getCurrentSupabaseUserId().catch(() => null);
    const { data: post, error } = await supabase
      .from('community_posts')
      .select('*, profiles!community_posts_user_id_fkey(display_name, avatar_url)')
      .eq('id', id)
      .single();
    if (error) throw error;

    const comments = await communityAPI.getComments(id);

    let liked = false;
    if (currentUserId) {
      const { data: likeRow } = await supabase
        .from('community_likes')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('post_id', id)
        .maybeSingle();
      liked = !!likeRow;
    }

    return {
      ...toCamelCommunityPost({ ...post, isLiked: liked }),
      comments,
      liked,
    } as CommunityPost;
  },

  /** Yeni gönderi oluştur */
  createPost: async (data: PostCreateData) => {
    const userId = await getCurrentSupabaseUserId();
    const { data: inserted, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: userId,
        title: data.title ?? null,
        content: data.content,
        category: data.category ?? null,
        image_url: data.imageUrl ?? null,
      })
      .select('*, profiles!community_posts_user_id_fkey(display_name, avatar_url)')
      .single();
    if (error) throw error;
    return toCamelCommunityPost(inserted);
  },

  /** Gönderiyi sil (yalnızca sahibi) */
  deletePost: async (id: string) => {
    const { error } = await supabase.from('community_posts').delete().eq('id', id);
    if (error) throw error;
  },

  /** Beğeni değiştir (toggle) */
  toggleLike: async (postId: string) => {
    const userId = await getCurrentSupabaseUserId();
    const { data: existing } = await supabase
      .from('community_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();

    let liked = false;
    if (existing) {
      const { error } = await supabase.from('community_likes').delete().eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('community_likes').insert({ user_id: userId, post_id: postId });
      if (error) throw error;
      liked = true;
    }

    const { count } = await supabase
      .from('community_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    await supabase.from('community_posts').update({ like_count: count || 0 }).eq('id', postId);
    return { liked, likeCount: count || 0 };
  },

  /** Gönderinin yorumlarını getir */
  getComments: async (postId: string) => {
    const { data, error } = await supabase
      .from('community_comments')
      .select('*, profiles!community_comments_user_id_fkey(display_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toCamelCommunityComment);
  },

  /** Yorum ekle */
  addComment: async (postId: string, content: string, parentId?: string) => {
    const userId = await getCurrentSupabaseUserId();
    const { data: inserted, error } = await supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content,
        parent_id: parentId ?? null,
      })
      .select('*, profiles!community_comments_user_id_fkey(display_name, avatar_url)')
      .single();
    if (error) throw error;

    const { count } = await supabase
      .from('community_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);
    await supabase.from('community_posts').update({ comment_count: count || 0 }).eq('id', postId);

    return toCamelCommunityComment(inserted);
  },
};

// ─────────────────────────────────────────────────────────────
// AİLE TAKİP API
// ─────────────────────────────────────────────────────────────

export const familyAPI = {
  /* ── Üyeler ──────────────────────────────────────── */
  getMembers: async () => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toCamelFamilyMember);
  },
  getMember: async (id: string) => {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return toCamelFamilyMember(data);
  },
  addMember: async (data: FamilyMemberCreateData) => {
    const userId = await getCurrentSupabaseUserId();
    const { data: inserted, error } = await supabase
      .from('family_members')
      .insert({
        user_id: userId,
        linked_user_id: (data.linkedUserId as any) ?? null,
        name: data.name,
        relationship: data.relationship,
        date_of_birth: data.dateOfBirth ?? null,
        avatar_url: data.avatarUrl ?? null,
        notes: data.notes ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return toCamelFamilyMember(inserted);
  },
  updateMember: async (id: string, data: Partial<FamilyMemberCreateData>) => {
    const payload = Object.fromEntries(Object.entries({
      linked_user_id: data.linkedUserId,
      name: data.name,
      relationship: data.relationship,
      date_of_birth: data.dateOfBirth,
      avatar_url: data.avatarUrl,
      notes: data.notes,
    }).filter(([, value]) => value !== undefined));

    const { data: updated, error } = await supabase
      .from('family_members')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return toCamelFamilyMember(updated);
  },
  deleteMember: async (id: string) => {
    const { error } = await supabase
      .from('family_members')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw error;
  },

  /* ── İlaçlar ─────────────────────────────────────── */
  getMedications: async (memberId: string) => {
    const { data, error } = await supabase
      .from('family_medications')
      .select('*')
      .eq('family_member_id', memberId)
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toCamelFamilyMedication);
  },
  addMedication: async (memberId: string, data: MedicationCreateData) => {
    const { data: inserted, error } = await supabase
      .from('family_medications')
      .insert({
        family_member_id: memberId,
        name: data.name,
        dosage: data.dosage ?? null,
        frequency: data.frequency ?? null,
        schedule_time: data.scheduleTime ?? null,
        start_date: data.startDate ?? null,
        end_date: data.endDate ?? null,
        prescribed_by: data.prescribedBy ?? null,
        notes: data.notes ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return toCamelFamilyMedication(inserted);
  },
  updateMedication: async (id: string, data: Partial<MedicationCreateData>) => {
    const payload = Object.fromEntries(Object.entries({
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      schedule_time: data.scheduleTime,
      start_date: data.startDate,
      end_date: data.endDate,
      prescribed_by: data.prescribedBy,
      notes: data.notes,
    }).filter(([, value]) => value !== undefined));

    const { data: updated, error } = await supabase
      .from('family_medications')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return toCamelFamilyMedication(updated);
  },
  deleteMedication: async (id: string) => {
    const { error } = await supabase
      .from('family_medications')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw error;
  },

  /* ── İlaç Kaydı & Uyum ──────────────────────────── */
  logMedication: async (medicationId: string, data?: MedicationLogData) => {
    const userId = await getCurrentSupabaseUserId();
    const takenAt = data?.takenAt ?? new Date().toISOString();
    const todayStart = takenAt.slice(0, 10) + 'T00:00:00.000Z';
    const todayEnd   = takenAt.slice(0, 10) + 'T23:59:59.999Z';

    const { data: existing } = await supabase
      .from('family_medication_logs')
      .select('id')
      .eq('medication_id', medicationId)
      .eq('logged_by', userId)
      .gte('taken_at', todayStart)
      .lte('taken_at', todayEnd)
      .maybeSingle();

    const payload = {
      medication_id: medicationId,
      taken_at: takenAt,
      taken: data?.taken !== false,
      notes: data?.notes ?? null,
      logged_by: userId,
    };

    if (existing?.id) {
      const { data: updated, error } = await supabase
        .from('family_medication_logs')
        .update({ taken: payload.taken, taken_at: payload.taken_at, notes: payload.notes })
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) throw error;
      return toCamelMedicationLog(updated);
    }

    const { data: inserted, error } = await supabase
      .from('family_medication_logs')
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;
    return toCamelMedicationLog(inserted);
  },
  getMedicationLogs: async (medicationId: string) => {
    const { data, error } = await supabase
      .from('family_medication_logs')
      .select('*')
      .eq('medication_id', medicationId)
      .order('taken_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelMedicationLog);
  },
  getAdherence: async (memberId: string, date?: string) => {
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const medications = await familyAPI.getMedications(memberId);

    if (medications.length === 0) {
      return {
        date: targetDate,
        medications: [],
        overallRate: 0,
        total: 0,
        taken: 0,
        missed: 0,
        adherenceRate: 0,
      } as any;
    }

    const medicationIds = medications.map((med) => med.id);
    const start = `${targetDate}T00:00:00.000Z`;
    const end = `${targetDate}T23:59:59.999Z`;

    const { data: logs, error } = await supabase
      .from('family_medication_logs')
      .select('*')
      .in('medication_id', medicationIds)
      .gte('taken_at', start)
      .lte('taken_at', end)
      .order('taken_at', { ascending: false });
    if (error) throw error;

    const logsByMedication = new Map<string, MedicationLog[]>();
    for (const log of (logs ?? []).map(toCamelMedicationLog)) {
      const list = logsByMedication.get(log.medicationId) ?? [];
      list.push(log);
      logsByMedication.set(log.medicationId, list);
    }

    const adherenceItems = medications.map((medication) => {
      const medicationLogs = logsByMedication.get(medication.id) ?? [];
      const taken = medicationLogs.some((log) => log.taken);
      return {
        medication,
        logs: medicationLogs,
        adherenceRate: taken ? 100 : 0,
      };
    });

    const takenCount = adherenceItems.filter((item) => item.adherenceRate > 0).length;
    const total = adherenceItems.length;
    const overallRate = total > 0 ? Math.round((takenCount / total) * 100) : 0;

    return {
      date: targetDate,
      medications: adherenceItems,
      overallRate,
      total,
      taken: takenCount,
      missed: total - takenCount,
      adherenceRate: overallRate,
    } as any;
  },
};

// ─────────────────────────────────────────────────────────────
// GİYİLEBİLİR CİHAZ API
// ─────────────────────────────────────────────────────────────

export const wearableAPI = {
  /** Desteklenen tüm cihazları listele */
  getDevices: async () => {
    const { data, error } = await supabase
      .from('wearable_devices')
      .select('*')
      .eq('is_active', true)
      .order('brand', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toCamelWearableDevice);
  },

  /** Kullanıcının bağlı cihazlarını listele */
  getUserDevices: async () => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('user_devices')
      .select('*, wearable_devices(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelUserDevice);
  },

  /** Yeni cihaz bağla */
  connectDevice: async (data: DeviceConnectData) => {
    const userId = await getCurrentSupabaseUserId();
    const { data: inserted, error } = await supabase
      .from('user_devices')
      .insert({
        user_id: userId,
        device_id: data.deviceId,
        device_name: data.deviceName ?? null,
        is_connected: true,
      })
      .select('*, wearable_devices(*)')
      .single();
    if (error) throw error;
    return toCamelUserDevice(inserted);
  },

  /** Cihaz bağlantı durumunu güncelle */
  setDeviceConnection: async (id: string, isConnected: boolean) => {
    const { data, error } = await supabase
      .from('user_devices')
      .update({
        is_connected: isConnected,
        last_sync: isConnected ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .select('*, wearable_devices(*)')
      .single();
    if (error) throw error;
    return toCamelUserDevice(data);
  },

  /** Cihaz bağlantısını kes */
  disconnectDevice: async (id: string) => {
    const { error } = await supabase.from('user_devices').delete().eq('id', id);
    if (error) throw error;
  },

  /** Senkronize edilmiş verileri getir */
  getData: async () => {
    const userId = await getCurrentSupabaseUserId();
    const { data, error } = await supabase
      .from('wearable_data')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCamelWearableDataEntry);
  },

  /** Cihazdan yeni veri senkronize et */
  syncData: async (data: WearableSyncData) => {
    const userId = await getCurrentSupabaseUserId();
    const { data: device } = await supabase
      .from('user_devices')
      .select('device_id')
      .eq('id', data.deviceId)
      .maybeSingle();

    const targetDeviceId = device?.device_id ?? data.deviceId;

    const { data: inserted, error } = await supabase
      .from('wearable_data')
      .insert({
        user_id: userId,
        device_id: targetDeviceId,
        metric_type: data.metricType,
        value: data.value,
        unit: data.unit,
        recorded_at: data.recordedAt,
      })
      .select('*')
      .single();
    if (error) throw error;
    return toCamelWearableDataEntry(inserted);
  },
};

// ─────────────────────────────────────────────────────────────
// AKILLI BİLDİRİMLER API
// ─────────────────────────────────────────────────────────────

export const notificationAPI = {
  /** Saate göre akıllı bildirim önerilerini al */
  getSmartNotifications: async () => {
    const currentHour = new Date().getHours();
    const notifications: SmartNotification[] = [];

    if (currentHour >= 7 && currentHour <= 9) {
      notifications.push({ title: 'Günaydın! ☀️', message: 'Güne bir bardak su ile başlayın.', type: 'morning_water', priority: 'medium' });
    }
    if (currentHour >= 12 && currentHour <= 14) {
      notifications.push({ title: 'Öğle Yemeği 🍽️', message: 'Sağlıklı bir öğle yemeği zamanı!', type: 'lunch_reminder', priority: 'medium' });
    }
    if (currentHour >= 15 && currentHour <= 16) {
      notifications.push({ title: 'Su Hatırlatması 💧', message: 'Günlük su hedefinize yaklaşın.', type: 'water_reminder', priority: 'low' });
    }
    if (currentHour >= 20 && currentHour <= 22) {
      notifications.push({ title: 'Uyku Zamanı 🌙', message: 'Kaliteli uyku için ekranları kapatın.', type: 'sleep_reminder', priority: 'medium' });
    }

    return { success: true, notifications, timestamp: new Date().toISOString(), hour: currentHour };
  },
};

// ─────────────────────────────────────────────────────────────
// WEEKLY CHALLENGES
// ─────────────────────────────────────────────────────────────
export const challengeAPI = {
  /** Load completed challenge IDs for a given week from user metadata */
  getCompletions: async (weekIndex: number): Promise<string[]> => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return [];
    const key = `challenges_${weekIndex}`;
    const meta = data.user.user_metadata as Record<string, any> | null;
    return Array.isArray(meta?.[key]) ? (meta![key] as string[]) : [];
  },

  /** Persist completed challenge IDs for a given week into user metadata */
  saveCompletions: async (weekIndex: number, completedIds: string[]): Promise<void> => {
    const key = `challenges_${weekIndex}`;
    const { error } = await supabase.auth.updateUser({
      data: { [key]: completedIds },
    });
    if (error) throw error;
  },
};
