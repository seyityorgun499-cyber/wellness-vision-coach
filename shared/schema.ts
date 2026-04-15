import { pgTable, text, serial, integer, boolean, timestamp, decimal, uuid, jsonb, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────
// 1. KULLANICILAR & KİMLİK DOĞRULAMA
// ─────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),                     // male | female | other
  heightCm: integer("height_cm"),
  weightKg: decimal("weight_kg", { precision: 5, scale: 2 }),
  activityLevel: text("activity_level").default("moderate"),
  language: text("language").default("tr"),    // tr | en
  timezone: text("timezone").default("Europe/Istanbul"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// 2. GİYİLEBİLİR CİHAZLAR
// ─────────────────────────────────────────────────────────────

export const wearableDevices = pgTable("wearable_devices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  type: text("type").notNull(),                // watch | band | ring | patch
  supportedMetrics: text("supported_metrics").array().notNull().default(sql`'{}'::text[]`),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userDevices = pgTable("user_devices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  deviceId: uuid("device_id").notNull().references(() => wearableDevices.id),
  deviceName: text("device_name"),
  isConnected: boolean("is_connected").default(true),
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const wearableData = pgTable("wearable_data", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  deviceId: uuid("device_id").notNull().references(() => wearableDevices.id),
  metricType: text("metric_type").notNull(),   // heart_rate | steps | sleep | spo2 | stress | hrv
  value: decimal("value").notNull(),
  unit: text("unit").notNull(),
  recordedAt: timestamp("recorded_at").notNull(),
  syncedAt: timestamp("synced_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_wearable_data_user_metric").on(table.userId, table.metricType),
  index("idx_wearable_data_recorded").on(table.recordedAt),
]);

// ─────────────────────────────────────────────────────────────
// 3. GÜNLÜK SAĞLIK TAKİBİ
// ─────────────────────────────────────────────────────────────

export const dailyHealthLogs = pgTable("daily_health_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),                // YYYY-MM-DD
  caloriesConsumed: integer("calories_consumed").default(0),
  caloriesBurned: integer("calories_burned").default(0),
  caloriesTarget: integer("calories_target").default(2100),
  proteinGrams: decimal("protein_grams", { precision: 6, scale: 2 }).default("0"),
  proteinTarget: decimal("protein_target", { precision: 6, scale: 2 }).default("180"),
  carbsGrams: decimal("carbs_grams", { precision: 6, scale: 2 }).default("0"),
  fatGrams: decimal("fat_grams", { precision: 6, scale: 2 }).default("0"),
  waterMl: integer("water_ml").default(0),
  waterTarget: integer("water_target").default(2400),
  steps: integer("steps").default(0),
  stepsTarget: integer("steps_target").default(10000),
  sleepMinutes: integer("sleep_minutes"),
  sleepTarget: integer("sleep_target").default(480),
  stressLevel: integer("stress_level"),        // 1-10
  moodScore: integer("mood_score"),            // 1-5
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_daily_health_user_date").on(table.userId, table.date),
]);

// ─────────────────────────────────────────────────────────────
// 4. YEMEK ANALİZİ / BESİN TAKİBİ
// ─────────────────────────────────────────────────────────────

export const foodEntries = pgTable("food_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mealType: text("meal_type").notNull(),       // breakfast | lunch | dinner | snack
  foodName: text("food_name").notNull(),
  calories: integer("calories").notNull(),
  proteinGrams: decimal("protein_grams", { precision: 6, scale: 2 }),
  carbsGrams: decimal("carbs_grams", { precision: 6, scale: 2 }),
  fatGrams: decimal("fat_grams", { precision: 6, scale: 2 }),
  fiberGrams: decimal("fiber_grams", { precision: 6, scale: 2 }),
  servingSize: text("serving_size"),
  imageUrl: text("image_url"),
  barcode: text("barcode"),
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 2 }),
  source: text("source").default("manual"),    // manual | camera | barcode | voice
  loggedAt: timestamp("logged_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_food_entries_user_date").on(table.userId, table.loggedAt),
]);

// ─────────────────────────────────────────────────────────────
// 5. AKTİVİTE & EGZERSİZ TAKİBİ
// ─────────────────────────────────────────────────────────────

export const activityEntries = pgTable("activity_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  activityType: text("activity_type").notNull(),  // running | walking | cycling | swimming | yoga | gym | other
  durationMinutes: integer("duration_minutes").notNull(),
  caloriesBurned: integer("calories_burned"),
  intensity: text("intensity").default("moderate"), // light | moderate | vigorous
  heartRateAvg: integer("heart_rate_avg"),
  heartRateMax: integer("heart_rate_max"),
  distanceKm: decimal("distance_km", { precision: 8, scale: 3 }),
  notes: text("notes"),
  startedAt: timestamp("started_at").notNull(),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_activity_entries_user_date").on(table.userId, table.startedAt),
]);

// ─────────────────────────────────────────────────────────────
// 6. KAN TAHLİLİ & LABORATUVAR SONUÇLARI
// ─────────────────────────────────────────────────────────────

export const bloodTests = pgTable("blood_tests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  testDate: timestamp("test_date").notNull(),
  labName: text("lab_name"),
  documentUrl: text("document_url"),           // uploaded PDF/image
  ocrExtractedText: text("ocr_extracted_text"),
  aiSummary: text("ai_summary"),
  overallStatus: text("overall_status"),       // normal | attention | critical
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_blood_tests_user").on(table.userId),
]);

export const bloodTestResults = pgTable("blood_test_results", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  bloodTestId: uuid("blood_test_id").notNull().references(() => bloodTests.id, { onDelete: "cascade" }),
  markerName: text("marker_name").notNull(),   // glucose, HbA1c, TSH, vitamin_d, ferritin, etc.
  value: decimal("value", { precision: 10, scale: 4 }).notNull(),
  unit: text("unit").notNull(),
  referenceMin: decimal("reference_min", { precision: 10, scale: 4 }),
  referenceMax: decimal("reference_max", { precision: 10, scale: 4 }),
  status: text("status"),                      // normal | low | high | critical
  category: text("category"),                  // hematoloji | biyokimya | hormon | vitamin
  aiInterpretation: text("ai_interpretation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// 7. SAĞLIK BELGELERİ
// ─────────────────────────────────────────────────────────────

export const healthDocuments = pgTable("health_documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  documentType: text("document_type").notNull(),  // blood_test | prescription | radiology | pathology | vaccination | other
  fileUrl: text("file_url"),
  mimeType: text("mime_type"),
  fileSize: integer("file_size"),
  ocrText: text("ocr_text"),
  aiAnalysis: text("ai_analysis"),
  aiRecommendations: jsonb("ai_recommendations"), // string[]
  tags: text("tags").array().default(sql`'{}'::text[]`),
  status: text("status").default("pending"),   // pending | processing | analyzed | error
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_health_documents_user").on(table.userId),
]);

// ─────────────────────────────────────────────────────────────
// 8. TIBBI FOTOĞRAF ANALİZİ
// ─────────────────────────────────────────────────────────────

export const medicalPhotos = pgTable("medical_photos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  photoType: text("photo_type").notNull(),     // urine | stool | tongue | eyes | skin
  imageUrl: text("image_url").notNull(),
  aiAnalysis: jsonb("ai_analysis"),            // { color, observations[], concerns[], recommendations[], urgency }
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  notes: text("notes"),
  analyzedAt: timestamp("analyzed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_medical_photos_user").on(table.userId),
]);

// ─────────────────────────────────────────────────────────────
// 9. SESLİ GÜNLÜK / VOICE ENTRIES
// ─────────────────────────────────────────────────────────────

export const voiceEntries = pgTable("voice_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  audioUrl: text("audio_url"),
  durationSeconds: integer("duration_seconds"),
  transcription: text("transcription"),
  sentiment: text("sentiment"),                // positive | neutral | negative
  mood: text("mood"),
  keywords: text("keywords").array().default(sql`'{}'::text[]`),
  aiSummary: text("ai_summary"),
  aiRecommendations: jsonb("ai_recommendations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_voice_entries_user").on(table.userId),
]);

// ─────────────────────────────────────────────────────────────
// 10. AI SAĞLIK PROFİLİ (Kişiselleştirilmiş)
// ─────────────────────────────────────────────────────────────

export const healthProfiles = pgTable("health_profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  bmi: decimal("bmi", { precision: 5, scale: 2 }),
  bmr: integer("bmr"),                        // Basal metabolic rate
  tdee: integer("tdee"),                      // Total daily energy expenditure
  bodyFatEstimate: decimal("body_fat_estimate", { precision: 5, scale: 2 }),
  healthScore: integer("health_score"),        // 0-100 genel sağlık skoru
  riskFactors: jsonb("risk_factors"),          // { type, level, description }[]
  strengths: jsonb("strengths"),               // string[]
  improvementAreas: jsonb("improvement_areas"),// string[]
  nutritionPlan: jsonb("nutrition_plan"),       // { dailyCalories, macroSplit, mealSuggestions }
  exercisePlan: jsonb("exercise_plan"),         // { weeklyGoal, suggestedActivities }
  sleepRecommendation: jsonb("sleep_recommendation"),
  supplementRecommendations: jsonb("supplement_recommendations"), // { name, reason, dosage, priority }[]
  aiGeneratedSummary: text("ai_generated_summary"),               // Genel sağlık durumu özeti
  lastCalculatedAt: timestamp("last_calculated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// 11. RAG TABANLI AI SOHBET (Bilimsel Kaynaklı)
// ─────────────────────────────────────────────────────────────

export const scientificSources = pgTable("scientific_sources", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  authors: text("authors").array().default(sql`'{}'::text[]`),
  journal: text("journal"),
  publishedYear: integer("published_year"),
  doi: text("doi"),
  abstract: text("abstract"),
  fullText: text("full_text"),
  category: text("category"),                 // nutrition | exercise | sleep | mental_health | supplements | chronic_disease
  tags: text("tags").array().default(sql`'{}'::text[]`),
  embeddingVector: text("embedding_vector"),   // vector embedding for RAG (stored as text, converted in app)
  language: text("language").default("en"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatConversations = pgTable("chat_conversations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  topic: text("topic"),                       // general | nutrition | exercise | supplements | blood_test | mental_health
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_chat_conversations_user").on(table.userId),
]);

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: uuid("conversation_id").notNull().references(() => chatConversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),                // user | assistant | system
  content: text("content").notNull(),
  citations: jsonb("citations"),               // { sourceId, title, excerpt }[]
  metadata: jsonb("metadata"),                 // { healthProfileUsed, bloodTestsReferenced, etc. }
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_chat_messages_conversation").on(table.conversationId),
]);

// ─────────────────────────────────────────────────────────────
// 12. TAKVİYE GIDA & SİPARİŞ
// ─────────────────────────────────────────────────────────────

export const supplements = pgTable("supplements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brand: text("brand"),
  category: text("category").notNull(),        // vitamin | mineral | amino_acid | herbal | probiotic | omega | protein
  description: text("description"),
  dosageForm: text("dosage_form"),             // tablet | capsule | powder | liquid | gummy
  servingSize: text("serving_size"),
  ingredients: jsonb("ingredients"),            // { name, amount, unit, dailyValuePct }[]
  benefits: text("benefits").array().default(sql`'{}'::text[]`),
  warnings: text("warnings"),
  imageUrl: text("image_url"),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: text("currency").default("TRY"),
  externalUrl: text("external_url"),           // Online sipariş linki
  affiliateUrl: text("affiliate_url"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supplementRecommendations = pgTable("supplement_recommendations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  supplementId: uuid("supplement_id").notNull().references(() => supplements.id),
  reason: text("reason").notNull(),            // AI tarafından üretilen öneri gerekçesi
  priority: text("priority").default("medium"), // low | medium | high
  basedOn: jsonb("based_on"),                  // { bloodTestId?, healthProfileField?, scientificSourceIds[] }
  suggestedDosage: text("suggested_dosage"),
  duration: text("duration"),                  // 30_days | 60_days | 90_days | ongoing
  status: text("status").default("pending"),   // pending | accepted | rejected | purchased
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_supplement_recs_user").on(table.userId),
]);

export const supplementOrders = pgTable("supplement_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  supplementId: uuid("supplement_id").notNull().references(() => supplements.id),
  quantity: integer("quantity").notNull().default(1),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  currency: text("currency").default("TRY"),
  orderStatus: text("order_status").default("pending"), // pending | confirmed | shipped | delivered | cancelled
  externalOrderId: text("external_order_id"),
  orderedAt: timestamp("ordered_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// 13. ARALIKLI ORUÇ TAKİBİ
// ─────────────────────────────────────────────────────────────

export const fastingLogs = pgTable("fasting_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fastingPlan: text("fasting_plan").notNull(), // 16:8 | 18:6 | 20:4 | 5:2 | eat_stop_eat
  startedAt: timestamp("started_at").notNull(),
  targetEndAt: timestamp("target_end_at").notNull(),
  actualEndAt: timestamp("actual_end_at"),
  completed: boolean("completed").default(false),
  notes: text("notes"),
  moodBefore: integer("mood_before"),          // 1-5
  moodAfter: integer("mood_after"),            // 1-5
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_fasting_logs_user").on(table.userId),
]);

// ─────────────────────────────────────────────────────────────
// 14. TOPLULUK (Community)
// ─────────────────────────────────────────────────────────────

export const communityPosts = pgTable("community_posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  content: text("content").notNull(),
  category: text("category"),                  // general | nutrition | exercise | supplements | recipes | success_story | question
  imageUrl: text("image_url"),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  isPublished: boolean("is_published").default(true),
  isPinned: boolean("is_pinned").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_community_posts_user").on(table.userId),
  index("idx_community_posts_category").on(table.category),
]);

export const communityComments = pgTable("community_comments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: uuid("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id"),                 // Nested comments
  content: text("content").notNull(),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communityLikes = pgTable("community_likes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: uuid("post_id").references(() => communityPosts.id, { onDelete: "cascade" }),
  commentId: uuid("comment_id").references(() => communityComments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// 15. AİLE TAKİBİ (İlaç & Takviye Kontrolü)
// ─────────────────────────────────────────────────────────────

export const familyMembers = pgTable("family_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),       // takip eden
  linkedUserId: integer("linked_user_id").references(() => users.id),   // takip edilen (uygulama kullanıcısıysa)
  name: text("name").notNull(),
  relationship: text("relationship").notNull(), // parent | child | spouse | sibling | grandparent | other
  dateOfBirth: text("date_of_birth"),
  avatarUrl: text("avatar_url"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_family_members_user").on(table.userId),
]);

export const familyMedications = pgTable("family_medications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  familyMemberId: uuid("family_member_id").notNull().references(() => familyMembers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dosage: text("dosage"),
  frequency: text("frequency"),                // daily | twice_daily | weekly | as_needed
  scheduleTime: text("schedule_time"),         // HH:mm format
  startDate: text("start_date"),
  endDate: text("end_date"),
  prescribedBy: text("prescribed_by"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const familyMedicationLogs = pgTable("family_medication_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  medicationId: uuid("medication_id").notNull().references(() => familyMedications.id, { onDelete: "cascade" }),
  takenAt: timestamp("taken_at").notNull(),
  taken: boolean("taken").notNull().default(true),
  notes: text("notes"),
  loggedBy: integer("logged_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// 16. BİLDİRİMLER
// ─────────────────────────────────────────────────────────────

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),                // reminder | health_alert | community | supplement | family | system
  relatedEntityType: text("related_entity_type"), // blood_test | medication | post | supplement
  relatedEntityId: text("related_entity_id"),
  isRead: boolean("is_read").default(false),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_notifications_user").on(table.userId),
]);

export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  waterReminder: boolean("water_reminder").default(true),
  mealReminder: boolean("meal_reminder").default(true),
  exerciseReminder: boolean("exercise_reminder").default(true),
  medicationReminder: boolean("medication_reminder").default(true),
  fastingReminder: boolean("fasting_reminder").default(true),
  communityUpdates: boolean("community_updates").default(true),
  healthAlerts: boolean("health_alerts").default(true),
  supplementReminder: boolean("supplement_reminder").default(true),
  quietHoursStart: text("quiet_hours_start"),  // HH:mm
  quietHoursEnd: text("quiet_hours_end"),      // HH:mm
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// 17. KULLANICI HEDEFLERİ & BAŞARIMLAR
// ─────────────────────────────────────────────────────────────

export const userGoals = pgTable("user_goals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  goalType: text("goal_type").notNull(),       // weight_loss | muscle_gain | better_sleep | stress_reduction | hydration | custom
  title: text("title").notNull(),
  description: text("description"),
  targetValue: decimal("target_value", { precision: 10, scale: 2 }),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }),
  unit: text("unit"),
  startDate: text("start_date"),
  targetDate: text("target_date"),
  status: text("status").default("active"),    // active | completed | paused | abandoned
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_user_goals_user").on(table.userId),
]);

export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  category: text("category"),                  // streak | milestone | challenge
  requirement: jsonb("requirement"),           // { type, value, unit }
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementId: uuid("achievement_id").notNull().references(() => achievements.id),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// USER STREAKS — Tracks consecutive daily logging
// ─────────────────────────────────────────────────────────────

export const userStreaks = pgTable("user_streaks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastActiveDate: text("last_active_date"),      // YYYY-MM-DD
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type WearableDevice = typeof wearableDevices.$inferSelect;
export type InsertWearableDevice = typeof wearableDevices.$inferInsert;
export type UserDevice = typeof userDevices.$inferSelect;
export type InsertUserDevice = typeof userDevices.$inferInsert;
export type WearableData = typeof wearableData.$inferSelect;
export type InsertWearableData = typeof wearableData.$inferInsert;

export type DailyHealthLog = typeof dailyHealthLogs.$inferSelect;
export type InsertDailyHealthLog = typeof dailyHealthLogs.$inferInsert;

export type FoodEntry = typeof foodEntries.$inferSelect;
export type InsertFoodEntry = typeof foodEntries.$inferInsert;

export type ActivityEntryDB = typeof activityEntries.$inferSelect;
export type InsertActivityEntry = typeof activityEntries.$inferInsert;

export type BloodTest = typeof bloodTests.$inferSelect;
export type InsertBloodTest = typeof bloodTests.$inferInsert;
export type BloodTestResult = typeof bloodTestResults.$inferSelect;
export type InsertBloodTestResult = typeof bloodTestResults.$inferInsert;

export type HealthDocument = typeof healthDocuments.$inferSelect;
export type InsertHealthDocument = typeof healthDocuments.$inferInsert;

export type MedicalPhoto = typeof medicalPhotos.$inferSelect;
export type InsertMedicalPhoto = typeof medicalPhotos.$inferInsert;

export type VoiceEntryDB = typeof voiceEntries.$inferSelect;
export type InsertVoiceEntry = typeof voiceEntries.$inferInsert;

export type HealthProfile = typeof healthProfiles.$inferSelect;
export type InsertHealthProfile = typeof healthProfiles.$inferInsert;

export type ScientificSource = typeof scientificSources.$inferSelect;
export type InsertScientificSource = typeof scientificSources.$inferInsert;

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

export type Supplement = typeof supplements.$inferSelect;
export type InsertSupplement = typeof supplements.$inferInsert;
export type SupplementRecommendation = typeof supplementRecommendations.$inferSelect;
export type InsertSupplementRecommendation = typeof supplementRecommendations.$inferInsert;
export type SupplementOrder = typeof supplementOrders.$inferSelect;
export type InsertSupplementOrder = typeof supplementOrders.$inferInsert;

export type FastingLog = typeof fastingLogs.$inferSelect;
export type InsertFastingLog = typeof fastingLogs.$inferInsert;

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;
export type CommunityComment = typeof communityComments.$inferSelect;
export type InsertCommunityComment = typeof communityComments.$inferInsert;
export type CommunityLike = typeof communityLikes.$inferSelect;
export type InsertCommunityLike = typeof communityLikes.$inferInsert;

export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = typeof familyMembers.$inferInsert;
export type FamilyMedication = typeof familyMedications.$inferSelect;
export type InsertFamilyMedication = typeof familyMedications.$inferInsert;
export type FamilyMedicationLog = typeof familyMedicationLogs.$inferSelect;
export type InsertFamilyMedicationLog = typeof familyMedicationLogs.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

export type UserGoal = typeof userGoals.$inferSelect;
export type InsertUserGoal = typeof userGoals.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

export type UserStreak = typeof userStreaks.$inferSelect;
export type InsertUserStreak = typeof userStreaks.$inferInsert;
