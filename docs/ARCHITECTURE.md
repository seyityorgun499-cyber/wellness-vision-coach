# Myora – Proje Mimarisi Dokümantasyonu

> **Versiyon:** 1.5
> **Son Güncelleme:** 28 Mart 2026 (Kişiselleştirilmiş AI chatbot — Vite middleware ile kullanıcı verisine dayalı yanıtlar)
> **Platform:** iOS & Android (Capacitor) + Web

---

## İçindekiler

1. [Proje Tanımı](#1-proje-tanımı)
2. [Teknoloji Yığını (Tech Stack)](#2-teknoloji-yığını)
3. [Dizin Yapısı](#3-dizin-yapısı)
4. [Mimari Genel Bakış](#4-mimari-genel-bakış)
5. [Veritabanı Katmanı](#5-veritabanı-katmanı)
6. [Sunucu (Backend) Katmanı](#6-sunucu-backend-katmanı)
7. [İstemci (Frontend) Katmanı](#7-istemci-frontend-katmanı)
8. [AI & RAG Mimarisi](#8-ai--rag-mimarisi)
9. [API Referansı](#9-api-referansı)
10. [Mobil (Capacitor) Katmanı](#10-mobil-capacitor-katmanı)
11. [Güvenlik & Kimlik Doğrulama](#11-güvenlik--kimlik-doğrulama)
12. [Veri Akış Diyagramları](#12-veri-akış-diyagramları)
13. [Geliştirme & Dağıtım](#13-geliştirme--dağıtım)
14. [Gelecek Yol Haritası](#14-gelecek-yol-haritası)
15. [Projeye Hakim Olma Rehberi](#15-projeye-hakim-olma-rehberi-dosya-okuma-sırası)

---

## 1. Proje Tanımı

**Myora**, çoklu sağlık verisini (giyilebilir cihazlar, kan tahlilleri, belgeler ve yaşam alışkanlıkları) tek bir yapay zekâ merkezinde birleştirerek kullanıcıya özel bir sağlık profili oluşturan mobil-öncelikli sağlık yönetim platformudur.

### Temel Özellikler

| # | Özellik | Açıklama |
|---|---------|----------|
| 1 | **AI Sağlık Profili** | Tüm veri kaynaklarını birleştirerek BMI, BMR, TDEE hesabı + risk analizi + kişisel beslenme/egzersiz planı |
| 2 | **RAG Chatbot** | Bilimsel yayınlarla desteklenen, hurafeden uzak, kaynaklı AI sağlık danışmanı |
| 3 | **Kan Tahlili Analizi** | OCR/metin girişi → AI analiz → belirteç yorumlama → takviye önerisi |
| 4 | **Yemek Fotoğraf Analizi** | Kamera ile yemek tanıma → kalori & makro besin hesabı |
| 5 | **Takviye Gıda Mağazası** | AI tabanlı kişisel takviye önerileri + online sipariş entegrasyonu |
| 6 | **Aile Takibi** | Yakınların ilaç/takviye kullanım takibi + uyum analizi + hatırlatıcılar |
| 7 | **Topluluk** | Deneyim paylaşımı, soru-cevap, tarif ve başarı hikayeleri |
| 8 | **Giyilebilir Cihaz Entegr.** | Akıllı saat / bileklik / yüzük verilerini (nabız, adım, uyku, SpO2, HRV) toplama |
| 9 | **Tıbbi Fotoğraf Analizi** | İdrar, dışkı, dil, göz, cilt fotoğrafı → AI ön değerlendirme |
| 10 | **Sesli Günlük** | Transkripsiyon → duygu analizi → ruh hali takibi → sağlık önerileri |
| 11 | **Aralıklı Oruç** | 16:8, 18:6, 20:4, 5:2 planları + takip + ruh hali kaydı |
| 12 | **Hedefler & Başarımlar** | Kişisel sağlık hedefleri + gamifikasyon rozet sistemi |
| 13 | **Akıllı Bildirimler** | Saat dilimine göre su, yemek, uyku, ilaç hatırlatıcıları |

---

## 2. Teknoloji Yığını

### Frontend
| Katman | Teknoloji | Versiyon | Açıklama |
|--------|-----------|----------|----------|
| UI Framework | React | 18.3 | SPA, hook-tabanlı |
| Build Tool | Vite + SWC | 5.4 | Hızlı HMR, ESM-first |
| Styling | Tailwind CSS | 3.4 | Utility-first CSS |
| UI Bileşenleri | Radix UI + shadcn/ui | — | Erişilebilir, headless |
| Durum Yönetimi | TanStack React Query | 5.x | Sunucu-durumu caching |
| Router | React Router DOM | 6.x (v7 future flags aktif) | SPA yönlendirme |
| Grafikler | Recharts | 2.x | Sağlık veri görselleştirme |
| Bildirimler | Sonner | 1.x | Toast bildirimleri |
| İkonlar | Lucide React | 0.462 | SVG ikon kütüphanesi |




### Mobil
| Katman | Teknoloji | Versiyon | Açıklama |
|--------|-----------|----------|----------|
| Hibrit Çerçeve | Capacitor | 7.x | Native bridge |
| iOS | @capacitor/ios | 7.4 | XCode projesi |
| Android | @capacitor/android | 7.4 | Android Studio projesi |
| Tercihler | @capacitor/preferences | 7.x | Native depolama |

### Geliştirme Araçları
| Araç | Açıklama |
|------|----------|
| TypeScript 5.8 | End-to-end tip güvenliği |
| ESLint 9 | Kod kalitesi |
| PostCSS | CSS işleme pipeline |
| autoprefixer | Cross-browser uyumluluk |

---

## 3. Dizin Yapısı

```
myora/
├── capacitor.config.ts          # Capacitor yapılandırması (appId, plugins)
├── drizzle.config.ts            # Drizzle Kit yapılandırması (şema tanımı)
├── package.json                 # Proje bağımlılıkları & scriptler
├── vite.config.ts               # Vite yapılandırması (alias, chunk splitting) + chatApiPlugin() middleware
├── tsconfig.json                # TypeScript yapılandırması (paths)
├── tsconfig.app.json            # Vite client TypeScript config
├── tsconfig.node.json           # Vite node TypeScript config
├── tailwind.config.ts           # Tailwind CSS yapılandırması
├── postcss.config.js            # PostCSS pipeline
├── eslint.config.js             # ESLint kuralları
├── components.json              # shadcn/ui CLI yapılandırması
│
├── shared/                      # ─── PAYLAŞILAN KATMAN ───
│   └── schema.ts                # Drizzle ORM şeması (17+ tablo, tip exportları)
│
├── server/                      # ─── SUNUCU KATMANI ───
│   ├── chatHandler.ts           # ★ AI Chat API — Vite middleware (/api/chat)
│   │                            #   JWT doğrulama + 7 tablo paralel çekme + GPT-4o
│   ├── index.ts                 # Express uygulama başlatıcı (legacy/referans)
│   ├── routes.ts                # Merkezi rota kaydı + oturum yapılandırması
│   ├── db.ts                    # PostgreSQL bağlantı havuzu + Drizzle instance
│   ├── storage.ts               # IStorage arayüzü + DatabaseStorage implementasyonu
│   ├── vite.ts                  # Vite dev server entegrasyonu
│   ├── middleware/
│   │   └── auth.ts              # requireAuth & optionalAuth middleware
│   ├── services/                # İş mantığı katmanı (referans)
│   │   ├── aiService.ts         # OpenAI GPT-4o (6 analiz fonksiyonu)
│   │   ├── ragService.ts        # RAG chatbot motoru
│   │   ├── healthTrackingService.ts  # Sağlık verisi CRUD
│   │   ├── supplementService.ts # Takviye öneri motoru
│   │   ├── communityService.ts  # Topluluk servisi
│   │   └── familyService.ts     # Aile takip servisi
│   └── routes/                  # API rotaları (referans)
│       ├── authRoutes.ts, healthRoutes.ts, chatRoutes.ts
│       ├── supplementRoutes.ts, communityRoutes.ts
│       ├── familyRoutes.ts, wearableRoutes.ts
│
├── client/                      # ─── İSTEMCİ KATMANI ───
│   ├── index.html               # SPA giriş noktası
│   └── src/
│       ├── App.tsx              # Kök bileşen (providers + Router + SplashScreen + AppContent)
│       ├── main.tsx             # ReactDOM render
│       ├── index.css            # Tasarım sistemi (3 tema: light/dark/black, CSS değişkenli makro renkleri)
│       │
│       ├── pages/
│       │   ├── AppLayout.tsx    # Ana layout wrapper (Outlet + BottomNav + Quick-Add Sheet)
│       │   ├── Auth.tsx         # Giriş/Kayıt sayfası (autoComplete destekli)
│       │   ├── Onboarding.tsx   # Yeni kullanıcı karşılama (myora-o-rings.png logo)
│       │   ├── Index.tsx        # Legacy redirect → /
│       │   └── NotFound.tsx     # 404 sayfası
│       │
│       ├── components/
│       │   ├── BottomNavigation.tsx  # Alt navigasyon (5 sekme: home/log/add/boost/analysis)
│       │   ├── HealthDashboard.tsx   # Ana dashboard (sağlık skoru + widget'lar + öneriler)
│       │   ├── AllLogger.tsx         # Kayıt özet ekranı
│       │   ├── Boost.tsx             # Günlük motivasyon (CoachHub'dan erişilir)
│       │   ├── CoachHub.tsx          # Koç modülleri merkezi (Chat + Boost)
│       │   ├── AnalysisHub.tsx       # Analiz modülleri merkezi (insights + ecosystem)
│       │   ├── ExpertChat.tsx        # RAG tabanlı AI sohbet arayüzü
│       │   ├── HealthProfile.tsx     # AI sağlık profili
│       │   ├── Community.tsx         # Topluluk sayfası
│       │   ├── SupplementStore.tsx   # Takviye mağazası
│       │   ├── BloodTestAnalysis.tsx # Kan tahlili analizi
│       │   ├── FamilyTracking.tsx    # Aile ilaç takibi
│       │   ├── FoodCapture.tsx       # Yemek fotoğraf analizi
│       │   ├── VoiceLogger.tsx       # Sesli günlük kaydı
│       │   ├── DocumentUpload.tsx    # Belge yükleme & AI analizi
│       │   ├── IntervalFasting.tsx   # Aralıklı oruç takibi
│       │   ├── Analytics.tsx         # Veri analitik grafikleri
│       │   ├── ActivityLog.tsx       # Aktivite günlüğü
│       │   ├── ActivityLogger.tsx    # Aktivite kayıt formu
│       │   ├── WearableDevices.tsx   # Cihaz bağlantı yönetimi
│       │   ├── WearableDataDashboard.tsx # Cihaz veri panosu
│       │   ├── UserProfile.tsx       # Kullanıcı profil & ayarlar
│       │   ├── MedicalPhotoAnalysis.tsx # Tıbbi fotoğraf analizi
│       │   ├── NotificationSettings.tsx # Bildirim tercihleri
│       │   ├── WidgetCreator.tsx     # Özel widget oluşturucu
│       │   ├── ProteinWidget.tsx     # Protein takip widget'ı
│       │   ├── WaterWidget.tsx       # Su takip widget'ı
│       │   ├── QuickActions.tsx      # Hızlı aksiyonlar
│       │   ├── DarkModeToggle.tsx    # Karanlık mod toggle
│       │   ├── LanguageToggle.tsx    # Dil değişimi (TR/EN)
│       │   ├── DailyQuests.tsx       # Günlük görevler & streak
│       │   ├── ScoreBreakdownModal.tsx # Sağlık skoru detay modal
│       │   ├── AchievementsBadges.tsx  # Rozet görüntüleme
│       │   ├── OfflineBanner.tsx     # Çevrimdışı uyarı banner'ı
│       │   ├── ProtectedRoute.tsx    # Auth guard
│       │   ├── ThemeProvider.tsx     # Tema sağlayıcı (light/dark/black)
│       │   ├── charts/               # Grafik bileşenleri (lazy-loaded)
│       │   │   ├── AnalyticsCharts.tsx
│       │   │   └── WearableChart.tsx
│       │   └── ui/                   # shadcn/ui primitif bileşenler
│       │       ├── (40+ standart shadcn bileşen)
│       │       ├── empty-state.tsx   # Boş durum gösterimi
│       │       ├── error-view.tsx    # Hata görünümü
│       │       ├── loading-skeleton.tsx # Yükleme iskeleti
│       │       └── page-wrapper.tsx  # Sayfa wrapper bileşeni
│       │
│       ├── contexts/
│       │   ├── AuthContext.tsx       # Kimlik doğrulama durumu
│       │   ├── HealthDataContext.tsx # Sağlık verisi durumu
│       │   └── LanguageContext.tsx   # Dil tercihi durumu
│       │
│       ├── hooks/
│       │   ├── use-mobile.tsx       # Mobil cihaz algılama
│       │   ├── use-toast.ts         # Toast hook
│       │   ├── useHealthData.tsx     # Sağlık verisi hook
│       │   ├── useKeyboard.ts       # Mobil klavye yönetimi
│       │   └── useTabNavigate.ts    # Tab/rota navigasyon hook
│       │
│       ├── lib/
│       │   ├── api.ts               # Tip-güvenli API istemcisi (6 modül)
│       │   ├── api-types.ts         # API yanıt tipleri (merkezi)
│       │   ├── logger.ts            # İstemci-tarafı loglama (warn/error seviyeleri)
│       │   ├── platform.ts          # Platform algılama (web/ios/android)
│       │   ├── queryKeys.ts         # TanStack Query anahtar tanımları
│       │   ├── supabase.ts          # Supabase istemci oluşturma
│       │   ├── utils.ts             # Yardımcı fonksiyonlar (cn, vb.)
│       │   └── validations/         # Zod doğrulama şemaları (factory pattern, i18n-ready)
│       │       ├── auth.ts          # Login/register validasyonu (createSignInSchema, createSignUpSchema)
│       │       └── forms.ts         # Form validasyonları (createAdd*Schema factory fonksiyonları)
│       │
│       ├── services/
│       │   ├── NativeWidgetService.ts  # Native widget bridge
│       │   └── NotificationService.ts  # Bildirim servisi
│       │
│       └── types/
│           ├── health.ts            # İstemci-tarafı sağlık tipleri
│           └── routes.ts            # Rota sabitleri (ROUTES const)
│
├── scripts/                        # ─── YARDIMCI BETİKLER ───
│   └── rag/
│       ├── seed-sources.ts         # RAG bilimsel kaynak veri beslemesi
│       └── ingest-urls.ts          # URL tabanlı kaynak çekme & chunking
│
├── supabase/                       # ─── SUPABASE KATMANI ───
│   ├── config.toml                 # Supabase yerel yapılandırma
│   ├── migrations/                 # SQL migrasyon dosyaları (13 dosya)
│   │   ├── 202603110001_profiles.sql ... 202603110010_fasting.sql
│   │   ├── 202603160001_rag_chunks.sql     # RAG chunk tabloları
│   │   ├── 202603160002_add_source_url.sql # Kaynak URL alanı
│   │   └── 202603200001_rls_audit_fixes.sql # RLS güvenlik düzeltmeleri
│   │
│   └── functions/                  # Supabase Edge Functions (Deno)
│       ├── analyze-health-data/
│       │   └── index.ts            # Sağlık verisi analiz fonksiyonu
│       ├── generate-chat-response/
│       │   ├── index.ts            # Chat yanıt edge function
│       │   └── lib/                # Yardımcı modüller
│       │       ├── context.ts      # Kullanıcı bağlamı oluşturma
│       │       ├── prompt.ts       # Sistem prompt'u
│       │       ├── retrieval.ts    # Kaynak arama (RAG)
│       │       ├── safety.ts       # Güvenlik filtreleri
│       │       └── topic.ts        # Konu sınıflandırma
│       └── generate-health-profile/
│           └── index.ts            # Sağlık profili oluşturma
│
├── docs/                           # ─── DOKÜMANTASYON ───
│   ├── ARCHITECTURE.md             # Bu dosya – proje mimarisi
│   ├── KOD_OKUMA_REHBERI.md        # 12 aşamalı kod okuma rehberi
│   ├── RAG_ARCHITECTURE.md         # RAG sistemi detaylı mimari dokümanı
│   ├── SUPABASE_CLI_COMMANDS.md    # Supabase CLI kullanım rehberi
│   ├── SUPABASE_DEPLOY_CHECKLIST.md # Deploy kontrol listesi
│   └── TYPESCRIPT_OGRENME_PLANI.md # TypeScript öğrenme planı
│
├── netlify.toml                    # Netlify deploy yapılandırması
├── railway.json                    # Railway deploy yapılandırması
├── vercel.json                     # Vercel deploy yapılandırması
│
└── public/
    ├── robots.txt
    ├── _redirects                  # SPA redirect kuralları
    ├── favicon.ico / favicon.png
    └── placeholder.svg
```

---

## 4. Mimari Genel Bakış

### 4.1 Katmanlı Mimari

Myora **3+1 katmanlı** bir mimari kullanır (frontend-only + Supabase BaaS + Vite middleware):

```
┌─────────────────────────────────────────────────────────────────┐
│                     MOBİL KATMAN (Capacitor)                    │
│                  iOS (Swift) | Android (Kotlin)                 │
├─────────────────────────────────────────────────────────────────┤
│                     İSTEMCİ KATMANI (React)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Sayfalar │ │Bileşenler│ │ Hooks    │ │ Contexts │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                        │                                        │
│            API İstemcisi (lib/api.ts + lib/supabase.ts)         │
├──────────────── Supabase Client SDK (HTTP) ────────────────────┤
│                     SUPABASE KATMANI (BaaS)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │   Auth    │ │PostgreSQL│ │  Edge    │ │ Storage  │           │
│  │          │ │          │ │Functions │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                        │                                        │
│              AI Servisleri (OpenAI GPT-4o)                       │
│              RAG Pipeline (Bilimsel Kaynaklar)                  │
├─────────────────────────────────────────────────────────────────┤
│                     VITE MIDDLEWARE KATMANI                      │
│          /api/chat → server/chatHandler.ts → GPT-4o             │
│          (Kullanıcı verisi + kişiselleştirilmiş AI yanıt)       │
├─────────────────────────────────────────────────────────────────┤
│                     VERİTABANI KATMANI                          │
│                PostgreSQL (Supabase-hosted)                      │
│                  17+ Tablo Grubu + RLS                          │
└─────────────────────────────────────────────────────────────────┘
```

> **Not:** `server/` dizinindeki Express kodu legacy/referans olarak korunmaktadır. Aktif backend mantığı Supabase Edge Functions ve Vite middleware (`server/chatHandler.ts`) üzerinden çalışır. AI chatbot artık `/api/chat` endpoint'i üzerinden Vite middleware ile hizmet vermektedir.

### 4.2 Monorepo Yapısı

Proje bir monorepo olarak yapılandırılmıştır:

- **`shared/`** — Sunucu ve istemci arasında paylaşılan şema & tipler
- **`server/`** — Express backend uygulaması
- **`client/`** — React frontend uygulaması

TypeScript path alias'ları ile import kısayolları tanımlıdır:

| Alias | Hedef | Kullanım |
|-------|-------|----------|
| `@/*` | `client/src/*` | İstemci bileşenleri & lib |
| `@shared/*` | `shared/*` | Paylaşılan şema & tipler |
| `@assets/*` | `attached_assets/*` | Statik dosyalar |

---

## 5. Veritabanı Katmanı

### 5.1 Şema Dosyası

Tüm veritabanı şeması `shared/schema.ts` dosyasında Drizzle ORM ile tanımlıdır. Her tablo için `Select` ve `Insert` tipleri otomatik olarak dışarı aktarılır.

### 5.2 Tablo Grupları

#### Grup 1: Kullanıcı & Kimlik Doğrulama

| Tablo | Açıklama | Temel Sütunlar |
|-------|----------|----------------|
| `users` | Kullanıcı profilli | email, password (bcrypt), displayName, heightCm, weightKg, gender, language, activityLevel, onboardingCompleted |
| `user_sessions` | Oturumlar (connect-pg-simple) | Otomatik oluşturulur |

#### Grup 2: Giyilebilir Cihazlar

| Tablo | Açıklama | Temel Sütunlar |
|-------|----------|----------------|
| `wearable_devices` | Desteklenen cihazlar kataloğu | name, brand, type (watch\|band\|ring\|patch), supportedMetrics |
| `user_devices` | Kullanıcı-cihaz bağlantıları | userId → users, deviceId → wearable_devices, isConnected, lastSync |
| `wearable_data` | Cihaz metrik verileri | userId, deviceId, metricType (heart_rate\|steps\|sleep\|spo2\|stress\|hrv), value, unit, recordedAt |

**İndeksler:** `idx_wearable_data_user_metric(userId, metricType)`, `idx_wearable_data_recorded(recordedAt)`

#### Grup 3: Günlük Sağlık Takibi

| Tablo | Açıklama | Temel Sütunlar |
|-------|----------|----------------|
| `daily_health_logs` | Günlük özet (upsert pattern) | userId, date (YYYY-MM-DD), caloriesConsumed/Burned, proteinGrams, carbsGrams, fatGrams, waterMl, steps, sleepMinutes, stressLevel (1-10), moodScore (1-5) |
| `food_entries` | Bireysel yemek kayıtları | userId, mealType, foodName, calories, macros, source (manual\|camera\|barcode\|voice), aiConfidence |
| `activity_entries` | Egzersiz kayıtları | userId, activityType, durationMinutes, caloriesBurned, intensity, heartRateAvg/Max, distanceKm |

**İndeksler:** Tüm tablolarda `(userId, date/loggedAt/startedAt)` indeksleri

#### Grup 4: Kan Tahlili & Laboratuvar

| Tablo | Açıklama | Temel Sütunlar |
|-------|----------|----------------|
| `blood_tests` | Tahlil üst kayıtları | userId, testDate, labName, ocrExtractedText, aiSummary, overallStatus (normal\|attention\|critical) |
| `blood_test_results` | Bireysel belirteçler | bloodTestId, markerName, value, unit, referenceMin/Max, status (normal\|low\|high\|critical), category (hematoloji\|biyokimya\|hormon\|vitamin), aiInterpretation |

#### Grup 5: Sağlık Belgeleri & Tıbbi Görüntüler

| Tablo | Açıklama | Temel Sütunlar |
|-------|----------|----------------|
| `health_documents` | Yüklenen belgeler | userId, title, documentType (blood_test\|prescription\|radiology\|...), ocrText, aiAnalysis, aiRecommendations (JSONB), tags, status |
| `medical_photos` | Tıbbi fotoğraflar | userId, photoType (urine\|stool\|tongue\|eyes\|skin), imageUrl, aiAnalysis (JSONB: color, observations, concerns, recommendations, urgency) |
| `voice_entries` | Sesli günlükler | userId, transcription, sentiment, mood, keywords, aiSummary, aiRecommendations (JSONB) |

#### Grup 6: AI Sağlık Profili

| Tablo | Açıklama | Temel Sütunlar |
|-------|----------|----------------|
| `health_profiles` | Kullanıcıya özel tek kayıt (userId UNIQUE) | bmi, bmr, tdee, bodyFatEstimate, healthScore (0-100), riskFactors (JSONB), strengths (JSONB), improvementAreas (JSONB), nutritionPlan (JSONB), exercisePlan (JSONB), sleepRecommendation (JSONB), supplementRecommendations (JSONB), aiGeneratedSummary |

#### Grup 7: RAG Chatbot Altyapısı

| Tablo | Açıklama | Temel Sütunlar |
|-------|----------|----------------|
| `scientific_sources` | Bilimsel yayın deposu (RAG knowledge base) | title, authors, journal, publishedYear, doi, abstract, fullText, category, tags, embeddingVector, language, isVerified |
| `chat_conversations` | Sohbet oturumları | userId, title, topic (general\|nutrition\|exercise\|supplements\|blood_test\|mental_health), isActive |
| `chat_messages` | Mesajlar | conversationId, role (user\|assistant\|system), content, citations (JSONB: sourceId, title, excerpt), metadata (JSONB) |

#### Grup 8: Takviye Gıda Ekosistemi

| Tablo | Açıklama | Temel Sütunlar |
|-------|----------|----------------|
| `supplements` | Ürün kataloğu | name, brand, category (vitamin\|mineral\|amino_acid\|herbal\|probiotic\|omega\|protein), price, currency (TRY), externalUrl, rating |
| `supplement_recommendations` | AI tabanlı kişisel öneriler | userId, supplementId, reason, priority (low\|medium\|high), basedOn (JSONB), suggestedDosage, status (pending\|accepted\|rejected\|purchased) |
| `supplement_orders` | Sipariş yönetimi | userId, supplementId, quantity, totalPrice, orderStatus (pending\|confirmed\|shipped\|delivered\|cancelled) |

#### Grup 9: Aralıklı Oruç

| Tablo | Açıklama | Temel Sütunlar |
|-------|----------|----------------|
| `fasting_logs` | Oruç takibi | userId, fastingPlan (16:8\|18:6\|20:4\|5:2\|eat_stop_eat), startedAt, targetEndAt, actualEndAt, completed, moodBefore/After |

#### Grup 10: Topluluk (Community)

| Tablo | Açıklama | Temel Sütunlar |
|-------|----------|----------------|
| `community_posts` | Paylaşımlar | userId, title, content, category, likeCount, commentCount, isPinned |
| `community_comments` | Yorumlar (nested) | postId, userId, parentId (self-referans), content, likeCount |
| `community_likes` | Beğeniler (toggle) | userId, postId, commentId |

#### Grup 11: Aile Takibi

| Tablo | Açıklama | Temel Sütunlar |
|-------|----------|----------------|
| `family_members` | Aile üyeleri | userId (takip eden), linkedUserId (opsiyonel), name, relationship (parent\|child\|spouse\|sibling\|grandparent\|other), isActive |
| `family_medications` | İlaç/takviye tanımları | familyMemberId, name, dosage, frequency, scheduleTime (HH:mm), isActive |
| `family_medication_logs` | Kullanım logları | medicationId, takenAt, taken (boolean), loggedBy (userId) |

#### Grup 12: Bildirimler

| Tablo | Açıklama | Temel Sütunlar |
|-------|----------|----------------|
| `notifications` | Bildirim kuyruğu | userId, title, message, type (reminder\|health_alert\|community\|supplement\|family\|system), isRead |
| `notification_preferences` | Tercihler (userId UNIQUE) | waterReminder, mealReminder, exerciseReminder, medicationReminder, fastingReminder, quietHoursStart/End |

#### Grup 13: Hedefler & Başarımlar

| Tablo | Açıklama | Temel Sütunlar |
|-------|----------|----------------|
| `user_goals` | Kişisel hedefler | userId, goalType, title, targetValue, currentValue, unit, status (active\|completed\|paused\|abandoned) |
| `achievements` | Rozet tanımları | name, description, category (streak\|milestone\|challenge), requirement (JSONB), points |
| `user_achievements` | Kazanılan rozetler | userId, achievementId, earnedAt |

### 5.3 İlişki Diyagramı (ER Özet)

```
users (PK: id)
 ├──< user_devices >── wearable_devices
 ├──< wearable_data >── wearable_devices
 ├──< daily_health_logs
 ├──< food_entries
 ├──< activity_entries
 ├──< blood_tests ──< blood_test_results
 ├──< health_documents
 ├──< medical_photos
 ├──< voice_entries
 ├──< health_profiles (1:1)
 ├──< chat_conversations ──< chat_messages
 ├──< supplement_recommendations >── supplements
 ├──< supplement_orders >── supplements
 ├──< fasting_logs
 ├──< community_posts ──< community_comments
 │                     ──< community_likes
 ├──< family_members ──< family_medications ──< family_medication_logs
 ├──< notifications
 ├──< notification_preferences (1:1)
 ├──< user_goals
 └──< user_achievements >── achievements
```

---

## 6. Sunucu (Backend) Katmanı

> **Durum:** Bu bölüm `server/` dizinindeki legacy Express kodunu belgelemektedir. Mevcut mimari Supabase Edge Functions + istemci-tarafı Supabase SDK + Vite middleware kullanır. Express kodu referans/geçiş amaçlı korunmaktadır.
>
> **Aktif sunucu bileşeni:** `server/chatHandler.ts` — Vite middleware olarak `/api/chat` endpoint'ini sunar. Bu dosya aktif olarak kullanılmaktadır (legacy değil).

### 6.0 Vite Middleware — AI Chat API (Aktif)

`server/chatHandler.ts` dosyası Vite middleware olarak `/api/chat` endpoint'ini sunar. `vite.config.ts`'deki `chatApiPlugin()` fonksiyonu bu middleware'i Vite dev server'a kaydeder.

**Akış:**
```
Frontend (ExpertChat.tsx)
    │
    │  POST /api/chat
    │  Authorization: Bearer <JWT>
    │  { message, history }
    │
    ▼
chatApiPlugin() (vite.config.ts)
    │
    ▼
handleChatRequest() (server/chatHandler.ts)
    │
    ├── 1. JWT doğrulama → Supabase Auth
    ├── 2. buildContext() → 7 tabloyu paralel çekme:
    │     ├── profiles (isim, yaş, boy, kilo)
    │     ├── health_profiles (BMI, BMR, TDEE, sağlık skoru)
    │     ├── daily_health_logs (son 7 gün: su, kalori, adım, uyku)
    │     ├── food_entries (son 7 gün yemek kayıtları)
    │     ├── activity_entries (son 7 gün egzersiz)
    │     ├── blood_tests + blood_test_results (son 2 tahlil)
    │     └── fasting_logs (son 5 oruç kaydı)
    ├── 3. buildSystemPrompt() → Kullanıcı verisini prompt'a dahil etme
    ├── 4. OpenAI GPT-4o çağrısı (JSON mode, temperature: 0.6)
    └── 5. Yanıt: { content, citations, suggestedFollowUps, contextUsed }
```

**Kişiselleştirme Detayı:** Chatbot güncel verilere göre somut rakamlar verir:
- "Bugün 800 mL su içmişsin, 1600 mL daha gerekiyor"
- "Bugün toplam 485 kcal almışsın, 1615 kcal daha alabilirsin"
- "Son kan tahlilinde D vitamini 12 ng/mL — düşük, takviye önerilir"

> **Deployment Notu:** `/api/chat` endpoint'i Vite `configureServer` middleware'i üzerinden çalışır — bu yalnızca geliştirme sunucusu (`npm run dev`) sırasında aktiftir. Production build'de (`vite build`) bu middleware dahil edilmez. Production ortamı için ya bir Node.js sunucusu/reverse proxy'si arkasında çalıştırılmalı ya da Supabase Edge Function alternatifine (`generate-chat-response`) geçilmelidir.

### 6.1 Giriş Noktası (server/index.ts) — Legacy

```
Express App
  │
  ├── JSON Body Parser (50MB limit)
  ├── URL-Encoded Parser
  ├── İstek Loglama Middleware
  │
  ├── registerRoutes(app) ← routes.ts
  │   ├── Session Yapılandırması (PostgreSQL-backed)
  │   └── Rota Kaydı (7 modül)
  │
  ├── Error Handler
  │
  └── Dev: Vite HMR | Prod: Static Files
      Port: 5000
```

### 6.2 Rota Kaydı (server/routes.ts)

Ana rota dosyası, oturum yapılandırması ve tüm modüler rotaları birleştirir:

```
registerRoutes(app)
  │
  ├── Session Config (PgSession, 30 gün TTL)
  │
  ├── /api/auth/*         → authRoutes
  ├── /api/user/*          → authRoutes (profil güncelleme)
  ├── /api/health/*        → healthRoutes
  ├── /api/chat/*          → chatRoutes
  ├── /api/wearables/*     → wearableRoutes
  ├── /api/supplements/*   → supplementRoutes
  ├── /api/community/*     → communityRoutes
  ├── /api/family/*        → familyRoutes
  │
  ├── /api/smart-notifications  → Akıllı bildirim endpoint'i
  └── Legacy uyumluluk yönlendirmeleri
```

### 6.3 Middleware (server/middleware/auth.ts)

| Middleware | Açıklama |
|-----------|----------|
| `requireAuth` | Session'da userId yoksa 401 döner, varsa `req.userId` olarak ekler |
| `optionalAuth` | userId varsa ekler, yoksa devam eder (public + auth-enriched endpoint'ler için) |

### 6.4 Servis Katmanı

#### aiService.ts – AI İşleme Merkezi

OpenAI GPT-4o üzerinden tüm AI işlemlerini yönetir. Lazy-init pattern ile tek OpenAI instance kullanır.

| Fonksiyon | Girdi | Çıktı | Kullanım |
|-----------|-------|-------|----------|
| `analyzeFoodImage(base64)` | Yemek fotoğrafı (base64) | `FoodAnalysisResult` (food, calories, macros, healthNotes) | Yemek tanıma |
| `analyzeBloodTest(ocrText, profile?)` | OCR metin + opsiyonel profil | `BloodTestAnalysisResult` (markers[], overallStatus, summary, recommendations, supplementSuggestions) | Tahlil yorumlama |
| `analyzeHealthDocument(ocrText, type)` | Belge metni + türü | `DocumentAnalysisResult` (title, summary, keyFindings, recommendations, tags) | Belge analizi |
| `analyzeMedicalPhoto(base64, type)` | Fotoğraf + tür | `MedicalPhotoResult` (analysis.observations/concerns/recommendations/urgency, confidence) | Tıbbi görüntü |
| `analyzeVoiceEntry(transcription)` | Transkript | `VoiceAnalysisResult` (sentiment, mood, keywords, summary, recommendations) | Duygu analizi |
| `generateHealthProfile(input)` | Tüm sağlık verileri | `HealthProfileResult` (healthScore, bmi/bmr/tdee, planlar, öneriler, aiSummary) | Profil oluşturma |

#### ragService.ts – RAG Chatbot Motoru

Bilimsel kaynaklarla desteklenen güvenilir sağlık sohbet botu.

**Akış:**
```
Kullanıcı Sorusu
  │
  ├── 1. Anahtar Kelime Çıkarma (extractKeywords)
  │     ├── Türkçe/İngilizce stop-word filtreleme
  │     └── Max 8 anahtar kelime
  │
  ├── 2. Kaynak Arama (retrieveRelevantSources)
  │     ├── scientific_sources tablosunda fulltext arama
  │     ├── Başlık + Özet + Tam metin üzerinde ilike
  │     └── Max 5 kaynak döner
  │
  ├── 3. Kullanıcı Bağlamı (buildUserContext)
  │     ├── Sağlık profili (health_profiles)
  │     ├── Bilimsel kaynaklar
  │     └── Son kan tahlilleri (blood_tests) — Paralel fetch
  │
  ├── 4. Sistem Prompt'u Oluşturma
  │     ├── Rol: "Myora AI sağlık danışmanı"
  │     ├── 5 kural: Güvenilir, kişisel, kaynaklı, empatik, sınırlı
  │     ├── Bilimsel kaynak bağlamı
  │     └── Sağlık profili bağlamı
  │
  └── 5. GPT-4o JSON Yanıtı (generateRAGResponse)
        ├── content: Markdown formatında yanıt
        ├── citations: [{sourceId, title, excerpt}]
        └── suggestedFollowUps: ["Takip sorusu 1", ...]
```

#### healthTrackingService.ts – Sağlık Verisi CRUD

| Kategori | Fonksiyonlar |
|----------|-------------|
| Günlük Loglar | `getDailyLog`, `upsertDailyLog` (upsert pattern), `getDailyLogRange` |
| Yemek | `addFoodEntry`, `getFoodEntries` (tarih filtrelemeli) |
| Aktivite | `addActivityEntry`, `getActivityEntries` |
| Oruç | `startFasting`, `endFasting`, `getActiveFasting`, `getFastingHistory` |
| Kan Tahlili | `createBloodTest`, `addBloodTestResults`, `getBloodTests`, `getBloodTestWithResults` |
| Belgeler | `createHealthDocument`, `getHealthDocuments`, `updateHealthDocument` |
| Tıbbi Foto | `createMedicalPhoto`, `getMedicalPhotos` |
| Sesli Günlük | `createVoiceEntry`, `getVoiceEntries` |
| Hedefler | `createGoal`, `getUserGoals`, `updateGoal` |
| Başarımlar | `getAchievements`, `getUserAchievements`, `awardAchievement` (duplicate-safe) |

#### supplementService.ts – Takviye Gıda Motoru

| Fonksiyon | Açıklama |
|-----------|----------|
| `getSupplements(category?)` | Aktif takviyeleri kategori filtrelemeli getirir |
| `getUserRecommendations(userId)` | Kullanıcıya özel AI önerilerini getirir |
| `createRecommendation(data)` | Yeni öneri oluşturur |
| `updateRecommendationStatus(id, status)` | Öneri durumunu günceller (accepted/rejected/purchased) |
| `generateAutoRecommendations(input, aiSuggestions)` | AI'ın önerdiği takviyeleri DB'deki ürünlerle eşleştirerek otomatik öneri oluşturur |
| `createOrder(data)` | Sipariş oluşturur |
| `getUserOrders(userId)` | Kullanıcı siparişlerini getirir |

#### communityService.ts – Topluluk Servisi

| Fonksiyon | Açıklama |
|-----------|----------|
| `getPosts(category?, page, limit)` | Sayfalanmış paylaşımlar (author join, pinned-first sıralama) |
| `createPost(data)` | Yeni paylaşım |
| `deletePost(postId, userId)` | Sahiplik kontrolüyle silme |
| `getComments(postId)` | Paylaşım yorumları (author join) |
| `createComment(data)` | Yorum + commentCount otomatik güncelleme |
| `toggleLike(userId, postId?, commentId?)` | Beğen/geri al (like count otomatik yönetim) |

#### familyService.ts – Aile Takip Servisi

| Fonksiyon | Açıklama |
|-----------|----------|
| `getFamilyMembers(userId)` | Aktif aile üyeleri |
| `createFamilyMember(data)` | Yeni üye ekleme |
| `getMedications(familyMemberId)` | Aktif ilaçlar |
| `createMedication(data)` | İlaç/takviye ekleme |
| `logMedicationTaken(data)` | Kullanım logu |
| `getDailyAdherence(memberId, date)` | Günlük uyum hesaplama (taken/total × 100) |

### 6.5 Storage Katmanı (server/storage.ts)

`IStorage` arayüzü ve `DatabaseStorage` implementasyonu tüm temel CRUD operasyonlarını merkezi olarak sağlar. Yeni servisler (aiService, ragService, vb.) doğrudan Drizzle ORM kullanır.

```typescript
interface IStorage {
  // Kullanıcılar (4 metot)
  // Giyilebilir Cihazlar (7 metot)
  // Günlük Loglar (2 metot)
  // Yemek Kayıtları (2 metot)
  // Kan Tahlilleri (2 metot)
  // Sağlık Profili (2 metot)
  // Chat (4 metot)
  // Topluluk (2 metot)
  // Aile (4 metot)
  // Bildirimler (3 metot)
}
```

---

## 7. İstemci (Frontend) Katmanı

### 7.1 Uygulama Hiyerarşisi

```
<QueryClientProvider>              ← TanStack React Query (staleTime: 30s, retry: 1)
  <TooltipProvider>                ← Radix Tooltip
    <LanguageProvider>             ← TR/EN dil desteği
      <AuthProvider>               ← Kimlik doğrulama durumu
        <Toaster /> <Sonner />     ← Toast bildirimleri
        <Router>                   ← HashRouter (native) | BrowserRouter (web)
          <Suspense>               ← Lazy loading fallback (spinner)
            <Routes>
              /auth → <Auth />
              / → <ProtectedRoute> → <AppLayout>    ← Outlet + BottomNav
                    index → <HealthDashboard />
                    /log → <AllLogger />
                    /boost → <Boost />
                    /analysis → <AnalysisHub />
                    /camera → <FoodCapture />
                    /voice → <VoiceLogger />
                    /chat → <ExpertChat />
                    ... (20+ nested route)
              * → <NotFound />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  </TooltipProvider>
</QueryClientProvider>

AppLayout (pages/AppLayout.tsx):
  <HealthDataProvider>             ← Sağlık verisi durumu (sadece auth sonrası)
    <Outlet />                     ← Nested route render
    <BottomNavigation />           ← Klavye açıkken gizlenir
    <Sheet />                      ← Quick-Add bottom sheet
  </HealthDataProvider>
```

**Önemli Değişiklikler (v1.3):**
- `HealthDataProvider` artık `App.tsx`'te değil, `AppLayout.tsx`'te (sadece auth sonrası yüklenir)
- Tüm sayfa bileşenleri `React.lazy()` ile lazy-loaded
- `HashRouter` Capacitor native platformda, `BrowserRouter` web'de kullanılır
- `Index.tsx` artık sadece legacy redirect, gerçek layout `AppLayout.tsx`'te

### 7.2 React Router Nested Navigasyon

Uygulama React Router nested routes + `AppLayout` Outlet pattern kullanır. Tüm bileşenler `React.lazy()` ile lazy-loaded'dır. Rota sabitleri `client/src/types/routes.ts` dosyasında tanımlıdır.

| Giriş Noktası | Sekme ID | Bileşen | Açıklama |
|--------------|----------|---------|----------|
| Ana Sayfa | `home` | `HealthDashboard` | Tek sağlık skoru, widget özeti, günlük öneriler |
| Kayıt | `log` | `AllLogger` | Log ilerleme özeti ve son kayıtlar |
| Hızlı Ekle | `add` | `Sheet` (bottom) | Kamera/ses/belge/aktivite kısa kayıt girişleri |
| Boost | `boost` | `Boost` | Günlük motivasyon + CoachHub erişimi |
| Analiz | `analysis` | `AnalysisHub` | Insight + ekosistem modüllerine geçiş |

Nested rotalar (AppLayout altında):

| Rota | Bileşen | Kaynak |
|------|---------|--------|
| `/camera` | `FoodCapture` | Hızlı Ekle |
| `/voice` | `VoiceLogger` | Hızlı Ekle |
| `/docs` | `DocumentUpload` | Hızlı Ekle |
| `/activity` | `ActivityLogger` | Hızlı Ekle |
| `/chat` | `ExpertChat` | Koç Hub / Dashboard |
| `/coach` | `Boost` | Legacy route (= /boost) |
| `/health-profile` | `HealthProfile` | Analiz Hub |
| `/wearable-data` | `WearableDataDashboard` | Analiz Hub |
| `/analytics` | `Analytics` | Analiz Hub |
| `/supplements` | `SupplementStore` | Analiz Hub |
| `/community` | `Community` | Analiz Hub |
| `/family` | `FamilyTracking` | Analiz Hub |
| `/notifications` | `NotificationSettings` | Ana Sayfa üst bar |
| `/widgets` | `WidgetCreator` | Ana Sayfa widget alanı |
| `/profile` | `UserProfile` | İç navigasyon |
| `/wearables` | `WearableDevices` | İç navigasyon |
| `/fasting` | `IntervalFasting` | İç navigasyon |
| `/bloodtest` | `BloodTestAnalysis` | İç navigasyon |

### 7.3 Alt Navigasyon Çubuğu

5 slotlu sabit alt navigasyon çubuğu (`BottomNavigation.tsx`) — klavye açıkken gizlenir:

| Sıra | İkon | Etiket | Hedef |
|------|------|--------|-------|
| 1 | Home | Ana Sayfa | `home` → `/` |
| 2 | ClipboardList | Kayıt | `log` → `/log` |
| 3 | Plus (FAB) | — | `add` → Quick-Add Sheet |
| 4 | Zap | Boost | `boost` → `/boost` |
| 5 | BarChart3 | Analiz | `analysis` → `/analysis` |

Notlar:
- Orta buton (FAB) etiket göstermeden sadece “+” aksiyonu verir.
- `add` sekmesi sayfa değiştirmez; alttan açılan quick-add sheet'i tetikler.
- Quick-Add Sheet seçenekleri: Kamera, Ses, Belge, Aktivite
- Klavye açıkken `useKeyboard` hook'u ile bottom nav gizlenir.

### 7.4 API İstemci Katmanı (client/src/lib/api.ts)

Tip-güvenli, modüler API istemcisi. Her modül bir JavaScript nesnesi olarak gruplandırılmıştır:

| Modül | Endpoint Grubu | Metot Sayısı |
|-------|---------------|-------------|
| `healthAPI` | `/api/health/*` | 20 metot |
| `chatAPI` | `/api/chat/*` | 6 metot |
| `supplementAPI` | `/api/supplements/*` | 6 metot |
| `communityAPI` | `/api/community/*` | 7 metot |
| `familyAPI` | `/api/family/*` | 11 metot |
| `wearableAPI` | `/api/wearables/*` | 6 metot |

Temel fonksiyonlar:
- `apiFetch(path, options)` — Base fetch wrapper (credentials: include)
- `apiGet<T>`, `apiPost<T>`, `apiPut<T>`, `apiDelete` — Tip-güvenli yardımcılar

### 7.5 Context'ler

| Context | Sorumluluk |
|---------|-----------|
| `AuthContext` | Kullanıcı oturum durumu, login/logout, register |
| `HealthDataContext` | İstemci-tarafı sağlık verisi state yönetimi |
| `LanguageContext` | TR/EN dil tercihi, çeviri sözlüğü (`t`), locale tabanlı tarih/saat formatlama |

---

## 8. AI & RAG Mimarisi

### 8.1 AI Model Entegrasyonu

Myora tüm AI işlemlerini **OpenAI GPT-4o** modeli üzerinden gerçekleştirir. Tüm yanıtlar **JSON format** (`response_format: { type: "json_object" }`) ile alınır ve yapılandırılmış olarak işlenir.

```
┌─────────────────────────────────────────────┐
│              MYORA AI KATMANI               │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │          aiService.ts               │    │
│  │  ┌────────┐  ┌────────┐  ┌──────┐  │    │
│  │  │ Yemek  │  │  Kan   │  │ Belge│  │    │
│  │  │Analizi │  │Tahlili │  │Analiz│  │    │
│  │  └────────┘  └────────┘  └──────┘  │    │
│  │  ┌────────┐  ┌────────┐  ┌──────┐  │    │
│  │  │ Tıbbi  │  │  Ses   │  │Sağlık│  │    │
│  │  │ Foto   │  │Analizi │  │Profil│  │    │
│  │  └────────┘  └────────┘  └──────┘  │    │
│  └──────────────────┬──────────────────┘    │
│                     │                       │
│  ┌──────────────────▼──────────────────┐    │
│  │          ragService.ts              │    │
│  │                                     │    │
│  │  Soru → Kaynak Arama → Bağlam      │    │
│  │       → Profil + Tahlil            │    │
│  │       → GPT-4o + Kaynaklar         │    │
│  │       → Kaynaklı Yanıt             │    │
│  └─────────────────────────────────────┘    │
│                     │                       │
│                     ▼                       │
│              OpenAI GPT-4o                  │
└─────────────────────────────────────────────┘
```

### 8.2 RAG Pipeline Detay

```
Kullanıcı Mesajı
       │
       ▼
┌──────────────────┐    ┌──────────────────┐
│ Anahtar Kelime   │    │ Bilimsel Kaynak  │
│ Çıkarma          │───▶│ DB Arama         │
│ (extractKeywords)│    │ (ilike fulltext)  │
└──────────────────┘    └────────┬─────────┘
                                 │
       ┌─────────────────────────┤ Paralel
       │                         │
┌──────▼──────────┐    ┌────────▼─────────┐
│ Sağlık Profili  │    │ Son Kan          │
│ (health_profiles)│   │ Tahlilleri       │
└───────┬─────────┘    │ (blood_tests)    │
        │              └────────┬─────────┘
        │                       │
        └───────────┬───────────┘
                    │
           ┌────────▼────────┐
           │ Sistem Prompt   │
           │ Oluşturma       │
           │                 │
           │ • AI rolü       │
           │ • 5 kural       │
           │ • Kaynaklar     │
           │ • Profil verileri│
           │ • Son 10 mesaj  │
           └────────┬────────┘
                    │
           ┌────────▼────────┐
           │ GPT-4o          │
           │ JSON Response   │
           │                 │
           │ • content (MD)  │
           │ • citations[]   │
           │ • followUps[]   │
           └─────────────────┘
```

### 8.3 AI Güvenlik Politikası

1. **Yanıt Dili:** Tüm AI yanıtları Türkçe
2. **Bilimsel Yaklaşım:** Hurafelere yer verilmez, kanıta dayalı bilgi
3. **Sınır Farkındalığı:** AI kesin tanı koymaz, gerektiğinde doktora yönlendirir
4. **Kaynak Atfı:** Mümkün olduğunda bilimsel kaynağa referans verilir
5. **Kişiselleştirme:** Yanıtlar kullanıcının sağlık profiline göre uyarlanır

---

## 9. API Referansı

### 9.1 Kimlik Doğrulama (`/api/auth`)

| Metot | Endpoint | Auth | Açıklama |
|-------|----------|------|----------|
| POST | `/api/auth/register` | — | Yeni kullanıcı kayıt (email, password, displayName) |
| POST | `/api/auth/login` | — | Giriş (email, password) |
| POST | `/api/auth/logout` | — | Oturumu sonlandır |
| GET | `/api/auth/me` | Session | Mevcut kullanıcı bilgisi |
| PUT | `/api/user/profile` | Session | Profil güncelleme (heightCm, weightKg, gender, language, ...) |

### 9.2 Sağlık Takibi (`/api/health`)

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/daily-log?date=YYYY-MM-DD` | Günlük sağlık özeti |
| PUT | `/daily-log` | Günlük log güncelle (upsert) |
| GET | `/daily-log/range?startDate=&endDate=` | Tarih aralığı logları |
| GET | `/food-entries?date=` | Yemek kayıtları |
| POST | `/food-entries` | Yeni yemek kaydı |
| POST | `/analyze-food` | AI yemek fotoğraf analizi |
| GET | `/activities?limit=` | Aktivite kayıtları |
| POST | `/activities` | Yeni aktivite |
| GET | `/fasting/active` | Aktif oruç oturumu |
| POST | `/fasting/start` | Oruç başlat |
| POST | `/fasting/:id/end` | Oruç bitir |
| GET | `/fasting/history` | Oruç geçmişi |
| GET | `/blood-tests` | Kan tahlilleri listesi |
| GET | `/blood-tests/:id` | Tahlil detayı + sonuçlar |
| POST | `/blood-tests` | Yeni tahlil yükle (OCR → AI analiz → sonuç kaydetme) |
| GET | `/documents` | Sağlık belgeleri |
| POST | `/documents` | Belge yükle (+ arka plan AI analizi) |
| GET | `/medical-photos` | Tıbbi fotoğraflar |
| POST | `/medical-photos` | Fotoğraf + AI analiz |
| GET | `/voice-entries` | Sesli günlükler |
| POST | `/voice-entries` | Ses kaydı + AI analiz (duygu, ruh hali) |
| GET | `/goals` | Kullanıcı hedefleri |
| POST | `/goals` | Yeni hedef |
| PUT | `/goals/:id` | Hedef güncelle |
| GET | `/achievements` | Kazanılan rozetler |

**Not:** Tüm endpoint'ler `requireAuth` middleware ile korunmaktadır.

### 9.3 AI Chatbot (`/api/chat`)

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/conversations` | Konuşma listesi |
| POST | `/conversations` | Yeni konuşma oluştur (title, topic) |
| GET | `/conversations/:id/messages` | Konuşma mesajları |
| POST | `/conversations/:id/messages` | Mesaj gönder → RAG yanıtı al |
| GET | `/health-profile` | AI sağlık profili oku |
| POST | `/health-profile/generate` | AI sağlık profili oluştur/güncelle |

### 9.4 Takviye Gıda (`/api/supplements`)

| Metot | Endpoint | Auth | Açıklama |
|-------|----------|------|----------|
| GET | `/` | — | Tüm ürünler (category filtre) |
| GET | `/:id` | — | Ürün detayı |
| GET | `/recommendations/me` | ✓ | Kişisel öneriler |
| PUT | `/recommendations/:id/status` | ✓ | Öneri kabul/reddet |
| GET | `/orders/me` | ✓ | Siparişlerim |
| POST | `/orders` | ✓ | Yeni sipariş |

### 9.5 Topluluk (`/api/community`)

| Metot | Endpoint | Auth | Açıklama |
|-------|----------|------|----------|
| GET | `/posts?category=&page=&limit=` | Opsiyonel | Paylaşımlar (sayfalı) |
| GET | `/posts/:id` | Opsiyonel | Paylaşım detayı + yorumlar + liked |
| POST | `/posts` | ✓ | Yeni paylaşım |
| DELETE | `/posts/:id` | ✓ | Paylaşım sil (sahiplik kontrolü) |
| GET | `/posts/:id/comments` | — | Yorumlar |
| POST | `/posts/:id/comments` | ✓ | Yorum ekle |
| POST | `/posts/:id/like` | ✓ | Beğen/geri al (toggle) |

### 9.6 Aile Takibi (`/api/family`)

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/members` | Aile üyeleri |
| GET | `/members/:id` | Üye detayı |
| POST | `/members` | Üye ekle |
| PUT | `/members/:id` | Üye güncelle |
| DELETE | `/members/:id` | Üye kaldır (soft delete) |
| GET | `/members/:memberId/medications` | İlaçları listele |
| POST | `/members/:memberId/medications` | İlaç ekle |
| PUT | `/medications/:id` | İlaç güncelle |
| DELETE | `/medications/:id` | İlaç kaldır (soft delete) |
| POST | `/medications/:id/log` | İlaç alındı/alınmadı logu |
| GET | `/medications/:id/logs` | İlaç kullanım logları |
| GET | `/members/:memberId/adherence?date=` | Günlük uyum raporu |

### 9.7 Giyilebilir Cihazlar (`/api/wearables`)

| Metot | Endpoint | Auth | Açıklama |
|-------|----------|------|----------|
| GET | `/devices` | — | Desteklenen cihaz kataloğu |
| GET | `/user-devices` | ✓ | Bağlı cihazlarım |
| POST | `/user-devices` | ✓ | Cihaz bağla |
| DELETE | `/user-devices/:id` | ✓ | Cihaz kaldır |
| GET | `/data` | ✓ | Cihaz verilerim |
| POST | `/data` | ✓ | Veri senkronize |

### 9.8 Diğer Endpoint'ler

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/api/smart-notifications` | Saat dilimine göre akıllı bildirimler |

---

## 10. Mobil (Capacitor) Katmanı

### 10.1 Yapılandırma

```typescript
// capacitor.config.ts
{
  appId: 'com.myora.app',
  appName: 'Myora',
  webDir: 'dist/public',      // Vite build çıktısı
  server: { cleartext: true }, // HTTP dev desteği
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
    }
  }
}
```

### 10.2 Native Servisler

| Servis | Dosya | Açıklama |
|--------|-------|----------|
| Widget | `NativeWidgetService.ts` | iOS/Android ana ekran widget bridge |
| Bildirim | `NotificationService.ts` | Push bildirim yönetimi |
| Tercihler | `@capacitor/preferences` | Native key-value depolama |

### 10.3 Desteklenen Platformlar

| Platform | Durum | Notlar |
|----------|-------|--------|
| iOS | ✓ | Swift bridge via @capacitor/ios 7.4 |
| Android | ✓ | Kotlin bridge via @capacitor/android 7.4 |
| Web | ✓ | PWA olarak kullanılabilir |

---

## 11. Güvenlik & Kimlik Doğrulama

### 11.1 Oturum Yönetimi

```
İstemci                    Sunucu                    PostgreSQL
   │                         │                           │
   │  POST /api/auth/login   │                           │
   │ ─────────────────────▶  │                           │
   │                         │  bcrypt.compare()         │
   │                         │ ─────────────────────▶    │
   │                         │  ◀──────────────────      │
   │                         │                           │
   │                         │  session.userId = id      │
   │                         │ ──────────────────────▶   │
   │                         │  user_sessions INSERT     │
   │  ◀──────────────────── │                           │
   │  Set-Cookie: connect.sid│                           │
   │                         │                           │
   │  GET /api/health/...    │                           │
   │  Cookie: connect.sid    │                           │
   │ ─────────────────────▶  │                           │
   │                         │  session lookup           │
   │                         │ ──────────────────────▶   │
   │                         │  requireAuth middleware   │
   │  ◀──────────────────── │                           │
   │  { data... }            │                           │
```

### 11.2 Güvenlik Önlemleri

| Önlem | Uygulama |
|-------|----------|
| Kimlik Doğrulama | Supabase Auth (JWT tabanlı) |
| RLS (Row Level Security) | Tüm tablolarda `user_id = auth.uid()` kuralı |
| Parola Hashleme | Supabase Auth tarafından yönetilir (bcrypt) |
| Girdi Doğrulama | Zod şema validasyonu (factory pattern, i18n-ready) |
| Edge Function JWT | `generate-health-profile` ve `analyze-health-data` JWT doğrulaması yapar |
| Hata Loglama | Silent catch blokları logger.warn/error ile değiştirildi |
| Form Güvenliği | autoComplete öznitelikleri (email, password, name) |
| Yetkilendirme | ProtectedRoute bileşeni + AuthContext guard |

---

## 12. Veri Akış Diyagramları

### 12.1 Kan Tahlili Analizi Akışı

```
Kullanıcı                  Frontend                Backend                AI                    DB
   │                          │                       │                    │                     │
   │  Tahlil OCR girişi       │                       │                    │                     │
   │ ────────────────────▶    │                       │                    │                     │
   │                          │  POST /blood-tests    │                    │                     │
   │                          │ ─────────────────▶    │                    │                     │
   │                          │                       │  INSERT blood_tests│                     │
   │                          │                       │ ──────────────────────────────────────▶  │
   │                          │                       │                    │                     │
   │                          │                       │  analyzeBloodTest()│                     │
   │                          │                       │ ──────────────▶    │                     │
   │                          │                       │                    │  GPT-4o             │
   │                          │                       │  ◀──────────────   │  JSON parse         │
   │                          │                       │                    │                     │
   │                          │                       │  INSERT blood_test_results              │
   │                          │                       │ ──────────────────────────────────────▶  │
   │                          │                       │                    │                     │
   │                          │  ◀────────────────    │                    │                     │
   │  ◀─────────────────────  │  { test, analysis }   │                    │                     │
   │  Sonuçlar gösterilir     │                       │                    │                     │
```

### 12.2 Takviye Öneri Akışı

```
Kan Tahlili AI Analizi
        │
        ▼
supplementSuggestions: [{name, reason, priority}]
        │
        ▼
generateAutoRecommendations()
        │
        ├── DB'deki supplements tablosunda isim eşleştirme
        │     (fuzzy: includes/toLowerCase)
        │
        ├── Eşleşen ürünler için supplement_recommendations INSERT
        │     (status: "pending", basedOn: {bloodTestId})
        │
        └── Kullanıcı bildirimi (opsiyonel)

Kullanıcı → Önerileri görür → Kabul/Reddet → Sipariş Ver
```

### 12.3 Aile İlaç Uyum Takibi

```
Kullanıcı
    │
    ├── Aile üyesi ekler (familyMembers INSERT)
    │
    ├── İlaç/takviye tanımlar (familyMedications INSERT)
    │     ├── Dozaj, frekans, saat (scheduleTime)
    │
    ├── Her gün: İlaç alındı mı? (familyMedicationLogs INSERT)
    │     ├── taken: true/false
    │     └── takenAt: timestamp
    │
    └── Uyum raporu görüntüler (getDailyAdherence)
          ├── total: Toplam aktif ilaç
          ├── taken: Bugün alınan
          ├── adherenceRate: (taken/total) * 100
          └── Görsel: Progress bar
```

---

## 13. Geliştirme & Dağıtım

### 13.1 NPM Scriptleri

| Script | Komut | Açıklama |
|--------|-------|----------|
| `dev` | `vite` | Geliştirme sunucusu (Vite HMR, frontend-only) |
| `build` | `vite build` | Production build → `dist/public/` |
| `start` | `vite preview --host 0.0.0.0 --port ${PORT}` | Production preview sunucusu |
| `db:push` | `drizzle-kit push` | Şema değişikliklerini DB'ye uygula |
| `supabase:db:push` | `npx supabase db push` | Supabase migration'ları uygula |
| `supabase:functions:serve` | `npx supabase functions serve` | Edge Functions yerel geliştirme |
| `supabase:functions:deploy` | (3 fonksiyon deploy) | Edge Functions production'a deploy |
| `supabase:deploy` | db:push + functions:deploy | Tam Supabase deploy |
| `rag:seed` | `npx tsx scripts/rag/seed-sources.ts` | RAG bilimsel kaynak yükleme |
| `rag:ingest` | `npx tsx scripts/rag/ingest-urls.ts` | URL'lerden kaynak çekme |
| `lint` | `eslint .` | Kod kalitesi kontrolü |
| `preview` | `vite preview` | Build'i yerel önizleme |

### 13.2 Build Pipeline

```
Dev Ortamı:
  vite
    └── Vite Dev Server (HMR, port 5173)
        + Supabase Edge Functions (ayrı terminal: supabase functions serve)

Production Build:
  1. vite build → dist/public/ (client bundle, chunk splitting)
     ├── vendor-react, vendor-query, vendor-supabase
     ├── vendor-ui, vendor-capacitor, vendor-icons
     ├── vendor-forms, vendor-utils
     └── Lazy chunks (recharts, sayfa bileşenleri)
  2. Deploy: Netlify / Vercel / Railway (static hosting)
  3. Supabase: npm run supabase:deploy

Capacitor Build:
  1. npm run build
  2. npx cap sync
  3. npx cap open ios|android
```

### 13.3 Ortam Değişkenleri

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `VITE_SUPABASE_URL` | ✓ | Supabase proje URL'si |
| `VITE_SUPABASE_ANON_KEY` | ✓ | Supabase anonim API anahtarı |
| `OPENAI_API_KEY` | ✓ | OpenAI API anahtarı — AI chatbot Vite middleware'i (`server/chatHandler.ts`) + Edge Functions tarafından kullanılır |
| `DATABASE_URL` | — | PostgreSQL bağlantı dizesi (legacy/Drizzle push) |

### 13.4 Veritabanı Migrasyonu

```bash
# Supabase migration'ları uygula (birincil yöntem)
npm run supabase:db:push

# Drizzle ile şema push (alternatif / lokal geliştirme)
npm run db:push

# Yeni migration oluşturma
supabase migration new <migration_name>
```

---

## 14. Gelecek Yol Haritası

### Kısa Vadeli (v1.1)
- [ ] Embedding-tabanlı vektör arama (pgvector) ile RAG iyileştirme
- [ ] Fotoğraf yükleme desteği (S3/R2 entegrasyonu)
- [ ] Push bildirimler (Firebase Cloud Messaging)
- [ ] E-posta doğrulama ve şifre sıfırlama
- [x] Onboarding akışı (tamamlandı — myora-o-rings.png logo ile)
- [ ] Uygulama içi takviye mağazası (sepet + sipariş sistemi)

### Orta Vadeli (v1.5)
- [ ] Gerçek giyilebilir cihaz SDK entegrasyonu (Apple HealthKit, Google Health Connect)
- [ ] Gerçek takviye gıda mağaza entegrasyonu (affiliate API)
- [ ] Multi-tenant aile hesapları (linkedUserId tam entegrasyon)
- [ ] Daha detaylı gamifikasyon (seviyeler, liderlik tablosu)
- [ ] Offline desteği (Capacitor SQLite + sync)

### Uzun Vadeli (v2.0)
- [ ] Yapay zekâ model fine-tuning (sağlık domain-specific)
- [ ] Telemonitörizasyon (doktor entegrasyonu)
- [ ] Genetik test entegrasyonu (DNA analizi)
- [ ] Soğuk zincir takviye siparişi (kurye entegrasyonu)
- [ ] FHIR/HL7 sağlık veri standardı uyumluluğu

---

> **Bu doküman** Myora projesinin mevcut mimarisini (v1.5 — 28 Mart 2026) yansıtmaktadır.
> Frontend-only + Supabase mimarisine geçiş yapılmıştır. Her kod değişikliğinde güncellenmesi önerilir.
>
> **v1.5 değişiklikleri:** Kişiselleştirilmiş AI chatbot — `server/chatHandler.ts` Vite middleware olarak `/api/chat` endpoint'i eklendi. 7 Supabase tablosunu (profiles, health_profiles, daily_health_logs, food_entries, activity_entries, blood_tests, fasting_logs) paralel çeker, kullanıcı bağlamı oluşturur ve OpenAI GPT-4o ile kişiselleştirilmiş yanıt üretir. `vite.config.ts`'e `chatApiPlugin()` eklendi. `client/src/lib/api.ts` artık Supabase Edge Function yerine yerel `/api/chat` endpoint'ini çağırıyor.
>
> **v1.4 değişiklikleri:** SplashScreen auth-bağımlı dismiss, React Router v7 future flags, widget tema değişkenleri, autoComplete form öznitelikleri, validasyon factory fonksiyonları (i18n-ready), logger.warn/error ile hata loglama, Onboarding logo, Analytics kilo grafiği profil verisi bağlantısı, AppContent bileşeni, OfflineBanner bileşeni.
>
> **Silinen bileşenler (v1.3):** `BarcodeScanner.tsx`, `MacroWidget.tsx`, `HealthMetrics.tsx`

---

## 15. Projeye Hakim Olma Rehberi (Dosya Okuma Sırası)

Aşağıdaki sıra, projeyi sıfırdan öğrenmek isteyen biri için optimize edilmiştir. Her dosyayı CodeWiki ile açıp incelemelisin.

### Aşama 1: Büyük Resim (Gün 1)

Önce projenin ne yaptığını ve nasıl çalıştığını anla.

| # | Dosya | Neden |
|---|-------|-------|
| 1 | `docs/ARCHITECTURE.md` | Projenin tüm mimarisini, teknolojilerini ve veri akışını anlatır. Şu an okuyorsun. |
| 2 | `package.json` | Hangi paketler kullanılıyor, hangi scriptlerle çalıştırılıyor (`dev`, `build`, `db:push`). |
| 3 | `vite.config.ts` | Alias tanımları (`@/`, `@shared/`), proxy ayarları, build yapılandırması. |
| 4 | `tsconfig.json` | TypeScript yapılandırması ve path mapping. |

**Hedef:** "Bu proje ne yapıyor, hangi teknolojileri kullanıyor, nasıl çalıştırılıyor?" sorularına cevap verebilmek.

---

### Aşama 2: Frontend Giriş Noktası (Gün 2)

Uygulamanın kullanıcı tarafından nasıl başlatıldığını anla.

| # | Dosya | Neden |
|---|-------|-------|
| 5 | `client/src/main.tsx` | ReactDOM render, uygulamanın en üst giriş noktası. |
| 6 | `client/src/App.tsx` | Provider hiyerarşisi (Query, Language, Auth, HealthData), router tanımları. |
| 7 | `client/src/pages/Auth.tsx` | Giriş/kayıt ekranı – kullanıcı ilk bunu görür. |
| 8 | `client/src/pages/Index.tsx` | Ana sayfa – tab-state ve hub yapısı burada. |
| 9 | `client/src/pages/AppLayout.tsx` | Uygulama düzen bileşeni, bottom navigation wrapper. |

**Hedef:** "Kullanıcı uygulamayı açınca hangi dosyalar devreye giriyor?" sorusunu cevaplayabilmek.

---

### Aşama 3: Kimlik Doğrulama Akışı (Gün 3)

Giriş/çıkış sistemi projenin omurgası. Çoğu şey "giriş yapmış kullanıcı" mantığıyla çalışıyor.

| # | Dosya | Neden |
|---|-------|-------|
| 10 | `client/src/contexts/AuthContext.tsx` | Kullanıcı oturumu nasıl tutuluyor, login/logout/register mantığı. |
| 11 | `client/src/lib/supabase.ts` | Supabase istemci oluşturma (VITE_SUPABASE_URL, ANON_KEY). |
| 12 | `client/src/lib/validations/auth.ts` | Login/register form doğrulaması (Zod). |
| 13 | `server/middleware/auth.ts` | `requireAuth` ve `optionalAuth` – backend tarafında oturum kontrolü. |
| 14 | `server/routes/authRoutes.ts` | `/api/auth/*` endpoint'leri – register, login, logout, me, profil güncelleme. |

**Hedef:** "Login olduktan sonra kullanıcı bilgisi nereden geliyor, oturum nasıl korunuyor?" sorusunu çözebilmek.

---

### Aşama 4: API Katmanı (Gün 4)

Frontend ile backend arasındaki köprüyü anla.

| # | Dosya | Neden |
|---|-------|-------|
| 15 | `client/src/lib/api-types.ts` | API yanıt tipleri – merkezi tip tanımları. |
| 16 | `client/src/lib/api.ts` | **Ana API istemcisi** – 6 modül (health, chat, supplement, community, family, wearable). Bu dosya büyük, modül modül oku. |
| 17 | `client/src/lib/queryKeys.ts` | TanStack Query anahtarları – cache yönetimi. |
| 18 | `client/src/lib/logger.ts` | İstemci tarafı loglama yardımcısı. |
| 19 | `client/src/lib/platform.ts` | Platform algılama (web/ios/android). |

**Zihinsel model:** `UI bileşeni → api.ts → backend / supabase → cevap → UI`

**Hedef:** "Bir component veri çekmek isterse nereye gider?" sorusunu çözebilmek.

---

### Aşama 5: Backend Omurgası (Gün 5)

Sunucu tarafının nasıl çalıştığını anla.

| # | Dosya | Neden |
|---|-------|-------|
| 20 | `server/index.ts` | Express başlatma, middleware zinciri, port yapılandırması. |
| 21 | `server/routes.ts` | **Merkezi rota kaydı** – tüm `/api/*` yolları burada birleşiyor. Backend'in haritası. |
| 22 | `server/db.ts` | PostgreSQL bağlantısı + Drizzle ORM instance. |
| 23 | `server/vite.ts` | Dev modda Vite HMR entegrasyonu, prod'da static dosya servisi. |
| 24 | `server/storage.ts` | `IStorage` arayüzü + `DatabaseStorage` – temel CRUD katmanı. |

**Hedef:** "Bir HTTP request backend'de ilk nereden geçiyor?" sorusunu cevaplayabilmek.

---

### Aşama 6: Veritabanı Şeması (Gün 6)

Verilerin nasıl yapılandırıldığını anla.

| # | Dosya | Neden |
|---|-------|-------|
| 25 | `shared/schema.ts` | **Tüm veritabanı tabloları** – Drizzle ORM ile tanımlanmış 17+ tablo, select/insert tipleri. Büyük dosya, grup grup oku. |
| 26 | `drizzle.config.ts` | Drizzle Kit migrasyon yapılandırması. |

**Hedef:** "Veri nerede saklanıyor, tablolar arası ilişkiler nasıl?" sorusunu çözebilmek.

---

### Aşama 7: Bir Feature'ı Uçtan Uca İzle – Health (Gün 7)

Şimdi bir feature seç ve baştan sona takip et. En iyi başlangıç: **sağlık takibi**.

| # | Dosya | Rol |
|---|-------|-----|
| 27 | `client/src/components/HealthDashboard.tsx` | Ana dashboard – kullanıcının gördüğü ekran. |
| 28 | `client/src/contexts/HealthDataContext.tsx` | Sağlık verisi state yönetimi. |
| 29 | `client/src/lib/api.ts` → `healthAPI` bölümü | Frontend'in backend'e çağrıları. |
| 30 | `server/routes/healthRoutes.ts` | Backend endpoint tanımları. |
| 31 | `server/services/healthTrackingService.ts` | İş mantığı katmanı (CRUD). |

**Zincir:** `Dashboard ekranı → HealthDataContext → api.ts (healthAPI) → /api/health/* → healthRoutes → healthTrackingService → shared/schema tablosu`

---

### Aşama 8: AI & RAG Sistemi (Gün 8)

Projenin AI kısmını öğren.

| # | Dosya | Rol |
|---|-------|-----|
| 32 | `server/services/aiService.ts` | GPT-4o entegrasyonu – 6 analiz fonksiyonu (yemek, kan, belge, foto, ses, profil). |
| 33 | `server/services/ragService.ts` | RAG chatbot motoru – kaynak arama, bağlam oluşturma, yanıt üretme. |
| 34 | `server/routes/chatRoutes.ts` | Chat endpoint'leri. |
| 35 | `client/src/components/ExpertChat.tsx` | Chat arayüzü. |
| 36 | `docs/RAG_ARCHITECTURE.md` | RAG mimarisinin detaylı dokümanı. |

---

### Aşama 9: Supabase & Edge Functions (Gün 9)

Supabase tarafını anla.

| # | Dosya | Rol |
|---|-------|-----|
| 37 | `supabase/config.toml` | Yerel Supabase yapılandırması. |
| 38 | `supabase/functions/generate-chat-response/index.ts` | Chat yanıt edge function (en karmaşık). |
| 39 | `supabase/functions/analyze-health-data/index.ts` | Sağlık verisi analiz edge function. |
| 40 | `supabase/functions/generate-health-profile/index.ts` | Sağlık profili oluşturma. |
| 41 | `supabase/migrations/202603110001_profiles.sql` | İlk migration – tablo yapısını SQL'de gör. |
| 42 | `supabase/migrations/202603200001_rls_audit_fixes.sql` | RLS (Row Level Security) kuralları. |

---

### Aşama 10: RAG Veri Besleme & Diğer Servisler (Gün 10)

| # | Dosya | Rol |
|---|-------|-----|
| 43 | `scripts/rag/seed-sources.ts` | Bilimsel kaynak verisini DB'ye yükleme betiği. |
| 44 | `scripts/rag/ingest-urls.ts` | URL'lerden kaynak çekme & chunking. |
| 45 | `server/services/supplementService.ts` | Takviye gıda motoru. |
| 46 | `server/services/communityService.ts` | Topluluk servisi. |
| 47 | `server/services/familyService.ts` | Aile takip servisi. |

---

### Aşama 11: Önemli UI Bileşenleri (Gün 11-12)

Bunları ihtiyaca göre, istediğin sırada oku.

| # | Dosya | Açıklama |
|---|-------|----------|
| 48 | `client/src/components/FoodCapture.tsx` | Yemek fotoğraf analizi (kamera). |
| 49 | `client/src/components/VoiceLogger.tsx` | Sesli günlük kaydı (transkripsiyon + duygu). |
| 50 | `client/src/components/BloodTestAnalysis.tsx` | Kan tahlili yükleme & analiz. |
| 51 | `client/src/components/DocumentUpload.tsx` | Belge yükleme + AI analiz. |
| 52 | `client/src/components/MedicalPhotoAnalysis.tsx` | Tıbbi fotoğraf analizi. |
| 53 | `client/src/components/IntervalFasting.tsx` | Aralıklı oruç takibi. |
| 54 | `client/src/components/FamilyTracking.tsx` | Aile ilaç takibi. |
| 55 | `client/src/components/Community.tsx` | Topluluk sayfası. |
| 56 | `client/src/components/SupplementStore.tsx` | Takviye mağazası. |
| 57 | `client/src/components/WearableDevices.tsx` | Cihaz bağlantı yönetimi. |
| 58 | `client/src/components/Analytics.tsx` | Veri analitik grafikleri. |
| 59 | `client/src/components/ActivityLogger.tsx` | Aktivite kayıt formu. |
| 60 | `client/src/components/DailyQuests.tsx` | Günlük görevler & streak. |
| 61 | `client/src/components/Boost.tsx` | Günlük motivasyon. |
| 62 | `client/src/components/HealthProfile.tsx` | AI sağlık profili. |
| 63 | `client/src/components/UserProfile.tsx` | Kullanıcı profil & ayarlar. |
| 64 | `client/src/components/BottomNavigation.tsx` | Alt navigasyon çubuğu. |
| 65 | `client/src/components/ProtectedRoute.tsx` | Auth guard bileşeni. |
| 66 | `client/src/components/NotificationSettings.tsx` | Bildirim tercihleri. |

---

### Aşama 12: Mobil & Yardımcı (İhtiyaç halinde)

| # | Dosya | Açıklama |
|---|-------|----------|
| 67 | `capacitor.config.ts` | Capacitor yapılandırması. |
| 68 | `client/src/services/NativeWidgetService.ts` | Native widget bridge. |
| 69 | `client/src/services/NotificationService.ts` | Push bildirim servisi. |
| 70 | `client/src/hooks/useKeyboard.ts` | Mobil klavye yönetimi. |
| 71 | `client/src/hooks/useTabNavigate.ts` | Tab navigasyon hook. |
| 72 | `client/src/types/health.ts` | İstemci tarafı sağlık tipleri. |
| 73 | `client/src/types/routes.ts` | Rota tip tanımları. |
| 74 | `client/src/lib/validations/forms.ts` | Form validasyonları. |
| 75 | `netlify.toml` | Netlify deploy yapılandırması. |
| 76 | `railway.json` | Railway deploy yapılandırması. |
| 77 | `docs/SUPABASE_DEPLOY_CHECKLIST.md` | Deploy kontrol listesi. |
| 78 | `docs/TYPESCRIPT_OGRENME_PLANI.md` | TypeScript öğrenme planı. |

---

### Her Dosyada Çıkarman Gereken Notlar

Her dosyayı okurken şu soruları cevapla:

- **Dosya amacı:** Bu dosya ne yapıyor?
- **Kim çağırıyor:** Bu dosyayı hangi dosya(lar) kullanıyor?
- **Kimi çağırıyor:** Bu dosya hangi dosya/servislere bağımlı?
- **Ana fonksiyonlar:** İçindeki önemli fonksiyonlar neler?
- **Bağlı tablo/endpoint:** Hangi DB tablosu veya API endpoint'i ile ilişkili?

### Önemli Zihinsel Modeller

**Frontend veri akışı:**
```
Kullanıcı → Bileşen → api.ts → Backend API → Servis → DB → Cevap → UI güncelleme
```

**Auth akışı:**
```
Auth.tsx → AuthContext → supabase.ts / api.ts (authAPI) → server/authRoutes → DB
```

**AI akışı:**
```
Bileşen → api.ts → chatRoutes / healthRoutes → aiService / ragService → OpenAI GPT-4o → JSON → DB + UI
```
