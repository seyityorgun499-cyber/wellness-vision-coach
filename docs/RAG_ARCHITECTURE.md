# Myora — Sekme Analizi, Çalışır Hale Getirme Planı & RAG Chatbot Mimarisi

> **Tarih**: 27 Mart 2026  
> **Versiyon**: 1.1 (sekme durumları güncellenmiştir)

---

## İçindekiler

1. [Tüm Sekmelerin Listesi ve Durumları](#1-tüm-sekmelerin-listesi-ve-durumları)
2. [Mock Sekmeleri Çalışır Hale Getirme Planı](#2-mock-sekmeleri-çalışır-hale-getirme-planı)
3. [Veri Akışı: Sekmelerden RAG Chatbot'a](#3-veri-akışı-sekmelerden-rag-chatbota)
4. [Expert Chat → RAG Chatbot Dönüşüm Mimarisi](#4-expert-chat--rag-chatbot-dönüşüm-mimarisi)
5. [Boost Sekmesi — Akıllı Takviye Önerisi Mimarisi](#5-boost-sekmesi--akıllı-takviye-önerisi-mimarisi)
6. [Uçtan Uca Mimari Diyagram](#6-uçtan-uca-mimari-diyagram)
7. [Uygulama Yol Haritası](#7-uygulama-yol-haritası)

---

## 1. Tüm Sekmelerin Listesi ve Durumları

### Alt Navigasyon (Bottom Navigation)

| # | Sekme ID | Sekme Adı | Bileşen | Durum |
|---|----------|-----------|---------|-------|
| 1 | `home` | Ana Sayfa | `HealthDashboard` | ✅ Çalışıyor (context verisi ile) |
| 2 | `log` | Kayıt | `AllLogger` | ❌ Mock (statik placeholder) |
| 3 | `add` | Hızlı Ekle (+) | Quick Add Sheet | ✅ Çalışıyor (yönlendirme) |
| 4 | `coach` | Koç | `CoachHub` | ✅ Navigasyon kabuğu |
| 5 | `analysis` | Analiz | `AnalysisHub` | ✅ Navigasyon kabuğu |

### Hızlı Ekle (Quick Add) Menüsünden Erişilen Sekmeler

| # | Sekme ID | Sekme Adı | Bileşen | Durum |
|---|----------|-----------|---------|-------|
| 6 | `camera` | Yemek Tara | `FoodCapture` | ✅ Çalışıyor (AI görüntü analizi) |
| 7 | `voice` | Sesli Kayıt | `VoiceLogger` | ⚠️ Kısmen Mock (mikrofon gerçek, analiz sahte) |
| 8 | `docs` | Doküman Yükle | `DocumentUpload` | ❌ Mock (dosya yükleme UI'ı var, analiz sahte) |
| 9 | `activity` | Aktivite Kaydet | `ActivityLog` | ✅ Çalışıyor (context'ten veri okuyor) |

### Koç Hub (Coach) Alt Sekmeleri

| # | Sekme ID | Sekme Adı | Bileşen | Durum |
|---|----------|-----------|---------|-------|
| 10 | `chat` | Uzman Chat | `ExpertChat` | ✅ Çalışıyor (RAG pipeline, Supabase Edge Function) |
| 11 | `boost` | Takviye Önerisi | `Boost` | ✅ Çalışıyor (context verisine dayalı mantık) |

### Analiz Hub Alt Sekmeleri

| # | Sekme ID | Sekme Adı | Bileşen | Durum |
|---|----------|-----------|---------|-------|
| 12 | `health-profile` | Sağlık Profili | `HealthProfile` | ✅ Çalışıyor (AI profil oluşturma) |
| 13 | `wearable-data` | Giyilebilir Veri | `WearableDataDashboard` | ✅ Çalışıyor |
| 14 | `analytics` | Analitik | `Analytics` | ⚠️ Kısmen (kilo grafiği profil verisine bağlı, diğer grafikler statik) |
| 15 | `supplements` | Takviye Mağaza | `SupplementStore` | ✅ Çalışıyor (API entegrasyonu) |
| 16 | `community` | Topluluk | `Community` | ✅ Çalışıyor (API entegrasyonu) |
| 17 | `family` | Aile Takibi | `FamilyTracking` | ✅ Çalışıyor (API entegrasyonu) |

### Diğer Sekmeler

| # | Sekme ID | Sekme Adı | Bileşen | Durum |
|---|----------|-----------|---------|-------|
| 18 | `barcode` | Barkod Tarayıcı | `BarcodeScanner` | ❌ Mock (sahte ürün veritabanı) |
| 19 | `fasting` | IF Oruç Takibi | `IntervalFasting` | ⚠️ Kısmen (zamanlayıcı çalışıyor, veri kalıcı değil) |
| 20 | `wearables` | Cihaz Bağlantısı | `WearableDevices` | ✅ Çalışıyor (API + fallback mock) |
| 21 | `widgets` | Widget Oluşturucu | `WidgetCreator` | ⚠️ Kısmen (Capacitor gerekli) |
| 22 | `notifications` | Bildirim Ayarları | `NotificationSettings` | ✅ Çalışıyor |
| 23 | `profile` | Kullanıcı Profili | `UserProfile` | ✅ Çalışıyor |
| 24 | `bloodtest` | Kan Testi Analizi | `BloodTestAnalysis` | ✅ Çalışıyor (AI OCR analizi) |

### Durum Özeti

| Kategori | Sayı | Sekmeler |
|----------|------|----------|
| ✅ Tam Çalışıyor | 15 | home, add, coach, analysis, camera, activity, boost, health-profile, wearable-data, supplements, community, family, wearables, bloodtest, chat |
| ⚠️ Kısmen Çalışıyor | 4 | voice, fasting, widgets, analytics |
| ❌ Mock/Placeholder | 3 | log, docs, barcode |

---

## 2. Mock Sekmeleri Çalışır Hale Getirme Planı

### 2.1 AllLogger (Kayıt Sekmesi) — `log`

**Mevcut Durum**: Tamamen statik HTML. "3 yemek kaydedildi" gibi sabit metinler.

**Çözüm**:
```
AllLogger.tsx
│
├── useHealthData() context'inden gerçek veri çek:
│   ├── foodAnalyses[] → yemek kayıtları
│   ├── voiceEntries[] → sesli kayıtlar
│   ├── activityEntries[] → aktivite kayıtları
│   └── documentAnalyses[] → doküman kayıtları
│
├── API entegrasyonu ekle:
│   ├── GET /api/health/food-entries?date=today
│   ├── GET /api/health/voice-entries
│   └── GET /api/health/activities?limit=20
│
└── Günlük özet kartları (hesaplanmış verilerle)
```

**Yapılacaklar**:
1. `useHealthData()` hook'undan gerçek verileri oku
2. `healthAPI.getFoodEntries()`, `healthAPI.getVoiceEntries()`, `healthAPI.getActivities()` API çağrılarıyla backend'den veri çek
3. Tarihe göre gruplama yap (bugün, dün, bu hafta)
4. Gerçek sayıları ve son kayıtları göster

---

### 2.2 ExpertChat (Uzman Chat) — `chat`

**Mevcut Durum**: Client-side keyword matching ile sahte yanıtlar. AI bağlantısı yok.

**Çözüm** (Detay Bölüm 4'te):
```
ExpertChat.tsx
│
├── Mevcut mock yanıt mantığını SİL
├── API entegrasyonu:
│   ├── POST /api/chat/conversations → yeni konuşma oluştur
│   ├── GET /api/chat/conversations/:id/messages → geçmiş mesajları yükle
│   └── POST /api/chat/conversations/:id/messages → mesaj gönder → RAG yanıtı al
│
└── RAG yanıtı render (citations + suggested followups)
```

**Yapılacaklar**:
1. `chatAPI.createConversation()` ve `chatAPI.sendMessage()` kullan
2. Backend zaten RAG pipeline'ı var (`ragService.ts`)
3. Frontend'de loading state, citation gösterimi ve follow-up önerileri ekle

---

### 2.3 DocumentUpload (Doküman Yükleme) — `docs`

**Mevcut Durum**: Dosya seçimi çalışıyor ama analiz tamamen sahte (setTimeout + statik veri).

**Çözüm**:
```
DocumentUpload.tsx
│
├── Gerçek dosya yükleme:
│   └── POST /api/health/documents (multipart/form-data veya base64)
│       → Backend aiService.analyzeHealthDocument() çağırır
│       → Sonuç DB'ye kaydedilir
│
├── Yüklenen dokümanları listeleme:
│   └── GET /api/health/documents
│
└── AI analiz sonuçlarını gösterme (gerçek)
```

**Yapılacaklar**:
1. `healthAPI.uploadDocument()` API çağrısı ekle
2. Mock `setTimeout` ve statik verileri kaldır
3. `healthAPI.getDocuments()` ile yüklenen dokümanları listele
4. AI analiz sonuçlarını (`aiAnalysis`, `aiRecommendations`) render et

---

### 2.4 Analytics (Analitik) — `analytics`

**Mevcut Durum**: Tüm grafik verileri hardcoded array'ler.

**Çözüm**:
```
Analytics.tsx
│
├── Gerçek veri kaynakları:
│   ├── GET /api/health/daily-log/range?startDate=...&endDate=...
│   │   → Haftalık kalori/kilo trendi
│   ├── GET /api/health/food-entries?date=...
│   │   → Makro dağılımı (protein/carb/fat)
│   ├── GET /api/health/fasting/history
│   │   → Aylık oruç grafiği
│   └── useHealthData() context
│       → Günlük hedefler vs gerçekleşen
│
└── Recharts grafiklerini gerçek veriyle besle
```

**Yapılacaklar**:
1. `healthAPI.getDailyLogRange()` ile tarih aralığı verisi çek
2. Hardcoded array'leri API yanıtlarıyla değiştir
3. Tarih filtresi ekle (haftalık/aylık/yıllık)
4. Başarımları `healthAPI.getAchievements()` ile çek

---

### 2.5 BarcodeScanner (Barkod Tarayıcı) — `barcode`

**Mevcut Durum**: Kamera açılıyor ama barkod okuma yok, rastgele mock ürün döndürülüyor.

**Çözüm**:
```
BarcodeScanner.tsx
│
├── Gerçek barkod okuma:
│   ├── Seçenek A: quagga2 veya @AzureSoft/barcode-scanner (web)
│   ├── Seçenek B: @capacitor-community/barcode-scanner (native)
│   └── Seçenek C: ZXing-js/library (web, açık kaynak)
│
├── Ürün veritabanı sorgusu:
│   ├── Open Food Facts API (https://world.openfoodfacts.org/api/v0/product/{barcode}.json)
│   │   → Ücretsiz, 3M+ ürün, besin değerleri dahil
│   ├── Veya: Backend proxy endpoint oluştur
│   │   POST /api/health/barcode-lookup
│   │   → Open Food Facts + cache
│   │
│   └── Sonucu food_entries tablosuna kaydet
│
└── Besin değerlerini göster + yemek kaydı olarak ekle
```

**Yapılacaklar**:
1. `quagga2` veya `zxing-js` kütüphanesi ekle
2. Backend'e `/api/health/barcode-lookup` endpoint'i ekle (Open Food Facts proxy)
3. Mock ürün listesini kaldır
4. Bulunan ürünü `healthAPI.addFoodEntry()` ile kaydet

---

### 2.6 VoiceLogger (Sesli Kayıt) — `voice`

**Mevcut Durum**: Mikrofon ve kayıt gerçek, transkripsiyon ve analiz sahte.

**Çözüm**:
```
VoiceLogger.tsx
│
├── Gerçek transkripsiyon:
│   ├── Seçenek A: Web Speech API (navigator.mediaDevices → SpeechRecognition)
│   │   → Ücretsiz, tarayıcı desteği gerekli
│   ├── Seçenek B: OpenAI Whisper API
│   │   → POST audio blob → backend → Whisper → text
│   └── Endpoint: POST /api/health/voice-entries (audio blob veya text)
│
├── Gerçek analiz:
│   └── Backend aiService.analyzeVoiceEntry() ZATEN MEVCUT
│       → Sentiment, mood, keyword, summary, recommendations
│
└── Mock veri ve mockFoodDatabase'i kaldır
```

**Yapılacaklar**:
1. Web Speech API veya Whisper entegrasyonu
2. `healthAPI.addVoiceEntry({ transcription })` API çağrısı ekle
3. Backend zaten `analyzeVoiceEntry()` fonksiyonuna sahip → sadece frontend bağlantısı gerekli
4. Mock transkripsiyon ve `mockFoodDatabase`'i kaldır

---

### 2.7 IntervalFasting (IF Oruç) — `fasting`

**Mevcut Durum**: Zamanlayıcı çalışıyor ama veri kalıcı değil (sayfa yenilenince sıfırlanıyor).

**Çözüm**:
```
IntervalFasting.tsx
│
├── API entegrasyonu:
│   ├── GET /api/health/fasting/active → aktif oruç var mı?
│   ├── POST /api/health/fasting/start → başlat (plan seçimi ile)
│   ├── POST /api/health/fasting/:id/end → bitir
│   └── GET /api/health/fasting/history → geçmiş
│
└── Timer state'ini aktif oruç kaydından hesapla
```

**Yapılacaklar**:
1. Sayfa yüklendiğinde `GET /api/health/fasting/active` çağır
2. Aktif oruç varsa kalan süreyi hesapla, yoksa başlat butonu göster
3. Streak değerini geçmiş verilerden hesapla
4. `healthAPI` wrapper fonksiyonlarını kullan

---

## 3. Veri Akışı: Sekmelerden RAG Chatbot'a

Bu bölüm, kullanıcının uygulamadaki tüm etkileşimlerinin nasıl toplanıp RAG chatbot'a besleneceğini gösterir.

### 3.1 Veri Toplama Noktaları

```
┌─────────────────────────────────────────────────────────────────┐
│                    KULLANICI ETKİLEŞİMLERİ                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📷 FoodCapture ──────→ food_entries (yemek, kalori, makro)     │
│  🎤 VoiceLogger ─────→ voice_entries (transkripsiyon, duygu)    │
│  📄 DocumentUpload ──→ health_documents (OCR, AI analiz)        │
│  🏃 ActivityLog ─────→ activity_entries (egzersiz, kalori)      │
│  📊 BarcodeScanner ──→ food_entries (barkod, besin değeri)      │
│  🩸 BloodTest ───────→ blood_tests + blood_test_results         │
│  ⏱️  IntervalFasting ─→ fasting_logs (plan, süre, tamamlanma)   │
│  ⌚ WearableDevices ──→ wearable_data (nabız, adım, uyku)      │
│  👨‍👩‍👧 FamilyTracking ──→ family_members + medications + logs    │
│  📈 HealthDashboard ─→ daily_health_logs (günlük özet)          │
│  🏥 HealthProfile ───→ health_profiles (BMI, skor, plan)       │
│  📸 MedicalPhoto ────→ medical_photos (idrar, dil, cilt)       │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │     PostgreSQL DB      │
              │  (22+ tablo, tüm      │
              │   kullanıcı verileri)  │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   RAG Context Builder  │
              │  (ragService.ts)       │
              │                        │
              │  buildUserContext()    │
              │  ├── health_profiles   │
              │  ├── blood_tests       │
              │  ├── food_entries      │
              │  ├── activity_entries  │
              │  ├── daily_health_logs │
              │  ├── voice_entries     │
              │  ├── wearable_data     │
              │  ├── fasting_logs      │
              │  └── medical_photos    │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Expert Chat (RAG)     │
              │  Kişiselleştirilmiş    │
              │  AI yanıtları          │
              └────────────────────────┘
```

### 3.2 Her Sekmeden Toplanan Veri Tipleri

| Sekme | DB Tablosu | RAG İçin Kullanılacak Veri |
|-------|-----------|---------------------------|
| Yemek Tara (camera) | `food_entries` | Günlük kalori alımı, makro dağılımı, yemek alışkanlıkları, eksik besinler |
| Sesli Kayıt (voice) | `voice_entries` | Ruh hali trendi, stres seviyesi, uyku kalitesi geri bildirimi |
| Doküman Yükle (docs) | `health_documents` | Tıbbi raporlar, laboratuvar sonuçları, reçeteler |
| Aktivite (activity) | `activity_entries` | Egzersiz sıklığı, yoğunluk, yakılan kalori, tip |
| Barkod (barcode) | `food_entries` | İşlenmiş gıda tüketimi, marka tercihleri |
| Kan Testi (bloodtest) | `blood_tests` + `blood_test_results` | Vitamin/mineral eksiklikleri, kolesterol, kan şekeri, karaciğer/böbrek fonksiyonları |
| IF Oruç (fasting) | `fasting_logs` | Oruç düzeni, tutarlılık, oruç öncesi/sonrası ruh hali |
| Giyilebilir (wearables) | `wearable_data` | Kalp atış hızı, adım sayısı, uyku süresi, SpO2, stres, HRV |
| Sağlık Profili | `health_profiles` | BMI, BMR, TDEE, risk faktörleri, mevcut planlar |
| Tıbbi Fotoğraf | `medical_photos` | Cilt, idrar, dil analiz sonuçları |
| Günlük Log | `daily_health_logs` | Günlük kalori dengesi, su tüketimi, adım, uyku, stres, ruh hali |

---

## 4. Expert Chat → RAG Chatbot Dönüşüm Mimarisi

### 4.1 Mevcut Durum vs Hedef

```
MEVCUT (Mock):                          HEDEF (RAG Chatbot):
┌──────────────┐                        ┌──────────────────────────────┐
│ ExpertChat   │                        │ ExpertChat                   │
│              │                        │                              │
│ Kullanıcı    │                        │ Kullanıcı mesajı             │
│ mesajı       │                        │        │                     │
│     │        │                        │        ▼                     │
│     ▼        │                        │ POST /api/chat/conv/:id/msg  │
│ Keyword      │                        │        │                     │
│ matching     │                        │        ▼                     │
│ (client)     │                        │ ┌────────────────────┐       │
│     │        │                        │ │ RAG Pipeline       │       │
│     ▼        │                        │ │                    │       │
│ Statik       │                        │ │ 1. Keyword Extract │       │
│ yanıt        │                        │ │ 2. DB Retrieval    │       │
│              │                        │ │ 3. User Context    │       │
└──────────────┘                        │ │ 4. GPT-4o Generate │       │
                                        │ └────────────────────┘       │
                                        │        │                     │
                                        │        ▼                     │
                                        │ Kişisel yanıt +             │
                                        │ bilimsel kaynaklar +        │
                                        │ takip soruları              │
                                        └──────────────────────────────┘
```

### 4.2 RAG Pipeline Detaylı Mimari

```
┌─────────────────────────────────────────────────────────────────────┐
│                        RAG PIPELINE                                  │
│                                                                      │
│  ┌──────────┐    ┌───────────────┐    ┌──────────────────────┐      │
│  │ Kullanıcı │    │ Keyword       │    │ Paralel Veri Çekme   │      │
│  │ Sorusu    │───▶│ Extraction    │───▶│                      │      │
│  │           │    │ (stop words   │    │ ┌──────────────────┐ │      │
│  └──────────┘    │  temizleme)   │    │ │ Scientific       │ │      │
│                  └───────────────┘    │ │ Sources (ILIKE)  │ │      │
│                                      │ └──────────────────┘ │      │
│                                      │ ┌──────────────────┐ │      │
│                                      │ │ Health Profile   │ │      │
│                                      │ └──────────────────┘ │      │
│                                      │ ┌──────────────────┐ │      │
│                                      │ │ Blood Tests (3)  │ │      │
│                                      │ └──────────────────┘ │      │
│                                      │ ┌──────────────────┐ │      │
│                                      │ │ Food Entries (7d)│ │      │
│                                      │ └──────────────────┘ │      │
│                                      │ ┌──────────────────┐ │      │
│                                      │ │ Daily Logs (7d)  │ │      │
│                                      │ └──────────────────┘ │      │
│                                      │ ┌──────────────────┐ │      │
│                                      │ │ Activities (7d)  │ │      │
│                                      │ └──────────────────┘ │      │
│                                      │ ┌──────────────────┐ │      │
│                                      │ │ Wearable Data    │ │      │
│                                      │ └──────────────────┘ │      │
│                                      │ ┌──────────────────┐ │      │
│                                      │ │ Fasting Logs     │ │      │
│                                      │ └──────────────────┘ │      │
│                                      │ ┌──────────────────┐ │      │
│                                      │ │ Voice Entries    │ │      │
│                                      │ └──────────────────┘ │      │
│                                      └──────────┬───────────┘      │
│                                                 │                   │
│                                                 ▼                   │
│                              ┌──────────────────────────────┐       │
│                              │ CONTEXT ASSEMBLY              │       │
│                              │                               │       │
│                              │ System Prompt:                │       │
│                              │ "Sen Myora sağlık asistanısın│       │
│                              │  Kullanıcının verileri:       │       │
│                              │  - BMI: 24.5, Skor: 72/100   │       │
│                              │  - Son 7 gün ort. kalori: X  │       │
│                              │  - Protein eksikliği: %15    │       │
│                              │  - D vitamini düşük (kan)     │       │
│                              │  - Günlük su: 1.2L/2.5L      │       │
│                              │  - Uyku: ort. 6.2 saat        │       │
│                              │  - Stres: yüksek (ses+giy.)  │       │
│                              │                               │       │
│                              │ Bilimsel Kaynaklar:           │       │
│                              │  [1] Smith et al. (2024)...   │       │
│                              │  [2] Johnson et al. (2023)... │       │
│                              │                               │       │
│                              │ Son 10 mesaj (konuşma geçmişi)│       │
│                              └──────────────┬───────────────┘       │
│                                             │                       │
│                                             ▼                       │
│                              ┌──────────────────────────────┐       │
│                              │ GPT-4o API                    │       │
│                              │ response_format: json_object  │       │
│                              │                               │       │
│                              │ Çıktı:                        │       │
│                              │ {                              │       │
│                              │   content: "Markdown yanıt",  │       │
│                              │   citations: [...],           │       │
│                              │   suggestedFollowUps: [...]   │       │
│                              │ }                              │       │
│                              └──────────────────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.3 Geliştirilmiş `buildUserContext()` Fonksiyonu

Mevcut `ragService.ts`'deki `buildUserContext()` sadece health profile ve blood test çekiyor. Aşağıdaki genişletme gerekli:

```typescript
// server/services/ragService.ts — GENİŞLETİLMİŞ buildUserContext()

async function buildUserContext(userId: number): Promise<string> {
  const [
    healthProfile,       // health_profiles tablosu
    recentBloodTests,    // blood_tests + blood_test_results (son 3)
    recentFoodEntries,   // food_entries (son 7 gün)
    recentDailyLogs,     // daily_health_logs (son 7 gün)
    recentActivities,    // activity_entries (son 7 gün)
    recentWearableData,  // wearable_data (son 7 gün)
    recentFastingLogs,   // fasting_logs (son 30 gün)
    recentVoiceEntries,  // voice_entries (son 7 gün)
    recentMedicalPhotos, // medical_photos (son 3)
    userGoals,           // user_goals (aktif)
    familyMembers,       // family_members + medications
  ] = await Promise.all([
    getHealthProfile(userId),
    getRecentBloodTests(userId, 3),
    getRecentFoodEntries(userId, 7),     // YENİ
    getRecentDailyLogs(userId, 7),       // YENİ
    getRecentActivities(userId, 7),      // YENİ
    getRecentWearableData(userId, 7),    // YENİ
    getRecentFastingLogs(userId, 30),    // YENİ
    getRecentVoiceEntries(userId, 7),    // YENİ
    getRecentMedicalPhotos(userId, 3),   // YENİ
    getActiveGoals(userId),              // YENİ
    getFamilyMembers(userId),            // YENİ
  ]);

  // Her veri grubunu özetleyerek context string oluştur
  let context = "";

  // Sağlık Profili
  if (healthProfile) {
    context += `\n## Sağlık Profili\n`;
    context += `BMI: ${healthProfile.bmi}, BMR: ${healthProfile.bmr}, `;
    context += `TDEE: ${healthProfile.tdee}, Skor: ${healthProfile.healthScore}/100\n`;
    context += `Risk Faktörleri: ${JSON.stringify(healthProfile.riskFactors)}\n`;
  }

  // Beslenme Özeti (son 7 gün)
  if (recentFoodEntries.length > 0) {
    const avgCalories = average(recentFoodEntries.map(f => f.calories));
    const avgProtein = average(recentFoodEntries.map(f => f.protein));
    context += `\n## Beslenme (Son 7 Gün)\n`;
    context += `Ortalama günlük kalori: ${avgCalories} kcal\n`;
    context += `Ortalama protein: ${avgProtein}g\n`;
    context += `En sık yenen gıdalar: ${topFoods(recentFoodEntries)}\n`;
    context += `Eksik besin grupları: ${missingFoodGroups(recentFoodEntries)}\n`;
  }

  // Kan Testi Sonuçları
  if (recentBloodTests.length > 0) {
    context += `\n## Kan Testi Sonuçları\n`;
    for (const test of recentBloodTests) {
      context += `Tarih: ${test.testDate}, Lab: ${test.labName}\n`;
      context += `Özet: ${test.aiSummary}\n`;
      // Anormal sonuçları vurgula
      const abnormal = test.results.filter(r => r.status !== 'normal');
      if (abnormal.length > 0) {
        context += `Anormal değerler: ${abnormal.map(r => 
          `${r.markerName}: ${r.value} ${r.unit} (${r.status})`
        ).join(', ')}\n`;
      }
    }
  }

  // Aktivite ve Egzersiz
  if (recentActivities.length > 0) {
    context += `\n## Aktivite (Son 7 Gün)\n`;
    context += `Toplam egzersiz: ${recentActivities.length} seans\n`;
    context += `Yakılan kalori: ${sum(recentActivities.map(a => a.caloriesBurned))}\n`;
    context += `Aktivite tipleri: ${unique(recentActivities.map(a => a.activityType)).join(', ')}\n`;
  }

  // Giyilebilir Cihaz Verileri
  if (recentWearableData.length > 0) {
    context += `\n## Giyilebilir Cihaz Verileri\n`;
    const heartRates = recentWearableData.filter(d => d.metricType === 'heart_rate');
    const sleepData = recentWearableData.filter(d => d.metricType === 'sleep');
    const stressData = recentWearableData.filter(d => d.metricType === 'stress');
    if (heartRates.length) context += `Ort. nabız: ${average(heartRates.map(h => h.value))} bpm\n`;
    if (sleepData.length) context += `Ort. uyku: ${average(sleepData.map(s => s.value))} saat\n`;
    if (stressData.length) context += `Ort. stres: ${average(stressData.map(s => s.value))}/100\n`;
  }

  // Oruç Takibi
  if (recentFastingLogs.length > 0) {
    const completed = recentFastingLogs.filter(f => f.completed).length;
    context += `\n## Aralıklı Oruç (Son 30 Gün)\n`;
    context += `Tamamlanan: ${completed}/${recentFastingLogs.length}\n`;
    context += `Tercih edilen plan: ${mostCommon(recentFastingLogs.map(f => f.fastingPlan))}\n`;
  }

  // Ruh Hali ve Duygu Durumu (sesli kayıtlardan)
  if (recentVoiceEntries.length > 0) {
    context += `\n## Ruh Hali (Sesli Kayıtlardan)\n`;
    context += `Son duygu durumları: ${recentVoiceEntries.map(v => v.mood).join(', ')}\n`;
    context += `Genel sentiment: ${mostCommon(recentVoiceEntries.map(v => v.sentiment))}\n`;
  }

  // Günlük Loglar
  if (recentDailyLogs.length > 0) {
    context += `\n## Günlük Sağlık Logları (Son 7 Gün)\n`;
    context += `Ort. su: ${average(recentDailyLogs.map(l => l.waterIntake))}ml\n`;
    context += `Ort. adım: ${average(recentDailyLogs.map(l => l.steps))}\n`;
    context += `Ort. uyku: ${average(recentDailyLogs.map(l => l.sleepHours))} saat\n`;
  }

  // Aktif Hedefler
  if (userGoals.length > 0) {
    context += `\n## Aktif Hedefler\n`;
    for (const goal of userGoals) {
      context += `- ${goal.title}: ${goal.currentValue}/${goal.targetValue} (${goal.status})\n`;
    }
  }

  return context;
}
```

### 4.4 Geliştirilmiş Retrieval (Vector Search)

Mevcut keyword-based ILIKE araması yerine embedding tabanlı vector search:

```
GELİŞTİRME PLANI:

1. scientific_sources tablosundaki embeddingVector kolonunu aktifleştir

2. Embedding oluşturma pipeline'ı ekle:
   ┌──────────────┐     ┌───────────────────┐     ┌──────────────┐
   │ Bilimsel      │────▶│ OpenAI Embeddings │────▶│ pgvector     │
   │ makale/kaynak │     │ text-embedding-3  │     │ veritabanı   │
   │ yükleme       │     │ -small            │     │              │
   └──────────────┘     └───────────────────┘     └──────────────┘

3. Sorgu zamanı:
   ┌─────────────┐     ┌───────────────────┐     ┌──────────────┐
   │ Kullanıcı   │────▶│ Sorguyu embed et  │────▶│ pgvector     │
   │ sorusu      │     │                   │     │ cosine       │
   │             │     │                   │     │ similarity   │
   └─────────────┘     └───────────────────┘     │ TOP 5        │
                                                  └──────────────┘

4. PostgreSQL pgvector extension:
   CREATE EXTENSION IF NOT EXISTS vector;
   
   -- Mevcut tablo güncelleme
   ALTER TABLE scientific_sources 
   ALTER COLUMN embedding_vector TYPE vector(1536);
   
   -- İndeks
   CREATE INDEX ON scientific_sources 
   USING ivfflat (embedding_vector vector_cosine_ops);
```

### 4.5 ExpertChat Bileşeni Yeniden Yazımı

```typescript
// client/src/components/ExpertChat.tsx — YENİ VERSİYON API TASLAGI

export const ExpertChat = () => {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sayfa yüklendiğinde mevcut konuşma var mı kontrol et
  useEffect(() => {
    loadOrCreateConversation();
  }, []);

  const loadOrCreateConversation = async () => {
    const conversations = await chatAPI.getConversations();
    if (conversations.length > 0) {
      // En son konuşmayı yükle
      const latest = conversations[0];
      setConversationId(latest.id);
      const msgs = await chatAPI.getMessages(latest.id);
      setMessages(msgs);
    } else {
      // Yeni konuşma oluştur
      const conv = await chatAPI.createConversation("Sağlık Asistanı");
      setConversationId(conv.id);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;
    
    // Kullanıcı mesajını ekle
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Backend RAG pipeline'ı çalıştır
      const response = await chatAPI.sendMessage(conversationId, input);
      
      // AI yanıtını ekle (citations ve followUps ile)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.content,
        citations: response.citations,
        suggestedFollowUps: response.suggestedFollowUps,
      }]);
    } catch (error) {
      // Hata yönetimi
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Mesaj listesi */}
      {messages.map(msg => (
        <MessageBubble 
          message={msg}
          // Citation'ları kaynak olarak göster
          // Suggested follow-up'ları tıklanabilir chip'ler olarak göster
        />
      ))}
      
      {/* Loading indicator */}
      {isLoading && <TypingIndicator />}
      
      {/* Input */}
      <ChatInput value={input} onChange={setInput} onSend={sendMessage} />
    </div>
  );
};
```

---

## 5. Boost Sekmesi — Akıllı Takviye Önerisi Mimarisi

### 5.1 Mevcut Durum

`Boost.tsx` halihazırda `useHealthData()` context'inden okunan verilere göre takviye önerisi üretiyor. Mantık client-side'da çalışıyor ve şunları kontrol ediyor:

- Protein oranı düşük mü?
- Kalori alımı yetersiz mi?
- Su tüketimi düşük mü?
- Aktivite seviyesi düşük mü?
- Balık/süt/sebze/meyve tüketimi var mı?

### 5.2 Hedef — AI-Powered Boost Mimarisi

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BOOST — AKILLI TAKVİYE ÖNERİSİ                   │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────┐      │
│  │                    VERİ KAYNAKLARI                          │      │
│  │                                                            │      │
│  │  📊 daily_health_logs                                      │      │
│  │     → kalori dengesi, makro eksikliği, su tüketimi         │      │
│  │                                                            │      │
│  │  🩸 blood_test_results                                     │      │
│  │     → vitamin/mineral eksiklikleri (D vit, B12, demir...)  │      │
│  │     → kolesterol, kan şekeri anormallikleri                │      │
│  │                                                            │      │
│  │  🍎 food_entries (son 30 gün)                              │      │
│  │     → yemek çeşitliliği, eksik besin grupları             │      │
│  │     → omega-3 kaynağı tüketimi (balık)                    │      │
│  │     → lifli gıda tüketimi                                 │      │
│  │                                                            │      │
│  │  🏃 activity_entries                                       │      │
│  │     → egzersiz yoğunluğu → protein/BCAA ihtiyacı          │      │
│  │     → kas ağrısı → magnezyum önerisi                      │      │
│  │                                                            │      │
│  │  ⌚ wearable_data                                          │      │
│  │     → uyku kalitesi → melatonin önerisi                   │      │
│  │     → stres seviyesi → ashwagandha / magnezyum             │      │
│  │     → HRV düşük → CoQ10 / omega-3                        │      │
│  │                                                            │      │
│  │  🎤 voice_entries                                          │      │
│  │     → ruh hali / duygu durumu → adaptogen önerileri       │      │
│  │                                                            │      │
│  │  ⏱️  fasting_logs                                          │      │
│  │     → oruç tutarlılığı → elektrolit önerisi               │      │
│  │                                                            │      │
│  │  🏥 health_profiles                                        │      │
│  │     → genel sağlık skoru → öncelik sıralaması             │      │
│  │                                                            │      │
│  └───────────────────────────────┬───────────────────────────┘      │
│                                  │                                   │
│                                  ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐      │
│  │              TAKVİYE ÖNERİ MOTORU                          │      │
│  │                                                            │      │
│  │  Adım 1: Veri Toplama                                     │      │
│  │  ├── Tüm veri kaynaklarını paralel çek                    │      │
│  │  └── Özet metriklere dönüştür                             │      │
│  │                                                            │      │
│  │  Adım 2: Eksiklik Analizi                                 │      │
│  │  ├── Beslenme eksiklikleri                                │      │
│  │  ├── Kan testi anormallikleri                             │      │
│  │  ├── Yaşam tarzı faktörleri (uyku, stres)                │      │
│  │  └── Aktivite bazlı ihtiyaçlar                           │      │
│  │                                                            │      │
│  │  Adım 3: AI Değerlendirme (GPT-4o)                       │      │
│  │  ├── Tüm verileri + bilimsel kaynakları gönder            │      │
│  │  ├── Kişiselleştirilmiş takviye listesi oluştur          │      │
│  │  ├── Öncelik sırası belirle                               │      │
│  │  ├── Dozaj + zamanlama öner                               │      │
│  │  └── Etkileşim uyarıları ekle                            │      │
│  │                                                            │      │
│  │  Adım 4: Supplement Eşleştirme                            │      │
│  │  ├── supplements tablosundan uygun ürünleri eşleştir     │      │
│  │  └── supplement_recommendations tablosuna kaydet          │      │
│  │                                                            │      │
│  └───────────────────────────────┬───────────────────────────┘      │
│                                  │                                   │
│                                  ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐      │
│  │              BOOST UI                                      │      │
│  │                                                            │      │
│  │  ┌─────────────────────────────────────────────────┐      │      │
│  │  │ 🔴 Yüksek Öncelik                               │      │      │
│  │  │ ┌───────────────────────────────────────────┐   │      │      │
│  │  │ │ D Vitamini (5000 IU)                       │   │      │      │
│  │  │ │ Neden: Kan testinde 12 ng/mL (düşük)      │   │      │      │
│  │  │ │ Kaynak: Smith et al., 2024 [1]             │   │      │      │
│  │  │ │ Zamanlama: Sabah, yağlı yemekle            │   │      │      │
│  │  │ │ [✅ Kabul Et] [❌ Reddet] [🛒 Satın Al]    │   │      │      │
│  │  │ └───────────────────────────────────────────┘   │      │      │
│  │  └─────────────────────────────────────────────────┘      │      │
│  │                                                            │      │
│  │  ┌─────────────────────────────────────────────────┐      │      │
│  │  │ 🟡 Orta Öncelik                                 │      │      │
│  │  │ ┌───────────────────────────────────────────┐   │      │      │
│  │  │ │ Omega-3 (1000mg EPA/DHA)                   │   │      │      │
│  │  │ │ Neden: 30 günde 0 balık tüketimi           │   │      │      │
│  │  │ │ + HRV düşük (giyilebilir veri)             │   │      │      │
│  │  │ │ Zamanlama: Akşam yemeğiyle                  │   │      │      │
│  │  │ │ [✅ Kabul Et] [❌ Reddet] [🛒 Satın Al]    │   │      │      │
│  │  │ └───────────────────────────────────────────┘   │      │      │
│  │  └─────────────────────────────────────────────────┘      │      │
│  │                                                            │      │
│  │  ┌─────────────────────────────────────────────────┐      │      │
│  │  │ 🟢 Düşük Öncelik                               │      │      │
│  │  │ ┌───────────────────────────────────────────┐   │      │      │
│  │  │ │ Melatonin (3mg)                            │   │      │      │
│  │  │ │ Neden: Ortalama uyku 5.8 saat/gece         │   │      │      │
│  │  │ │ Zamanlama: Yatmadan 30 dk önce             │   │      │      │
│  │  │ │ [✅ Kabul Et] [❌ Reddet] [🛒 Satın Al]    │   │      │      │
│  │  │ └───────────────────────────────────────────┘   │      │      │
│  │  └─────────────────────────────────────────────────┘      │      │
│  │                                                            │      │
│  └───────────────────────────────────────────────────────────┘      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3 Backend Endpoint: AI Takviye Önerisi

```typescript
// server/services/supplementRecommendationService.ts

interface SupplementRecommendation {
  supplementName: string;
  dosage: string;
  timing: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  basedOn: {
    source: string;      // "blood_test" | "food_analysis" | "wearable" | "activity" | "sleep"
    dataPoint: string;   // "Vitamin D: 12 ng/mL"
    referenceRange?: string;
  }[];
  scientificSource?: string;
  interactions?: string[];  // Diğer takviyelerle etkileşim uyarıları
}

async function generateSupplementRecommendations(userId: number): Promise<SupplementRecommendation[]> {
  // 1. Tüm kullanıcı verilerini topla
  const userData = await buildUserContext(userId);
  
  // 2. Bilimsel kaynakları çek (takviye ile ilgili)
  const sources = await getScientificSources(['supplement', 'vitamin', 'mineral', 'nutrition']);
  
  // 3. GPT-4o'ya gönder
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Sen bir klinik beslenme uzmanısın. Kullanıcının sağlık verilerine dayanarak 
        kişiselleştirilmiş takviye önerileri oluştur.

        KURALLAR:
        - Sadece verilere dayanarak öner (spekülasyon yapma)
        - Kan testi sonuçları en güvenilir kaynaktır
        - İlaç etkileşimlerini kontrol et
        - Dozajları bilimsel kanıtlara dayandır
        - Öncelik sırasını belirle (high/medium/low)
        - Her önerinin nedenini açıkla
        
        Kullanıcı Verileri:
        ${userData}
        
        Bilimsel Kaynaklar:
        ${sources.map(s => `[${s.id}] ${s.title}: ${s.abstract}`).join('\n')}`
      },
      {
        role: "user",
        content: "Bu kullanıcı için kişiselleştirilmiş takviye önerileri oluştur."
      }
    ]
  });

  // 4. Sonuçları parse et
  const recommendations = JSON.parse(response.choices[0].message.content);
  
  // 5. supplements tablosundan eşleşen ürünleri bul
  for (const rec of recommendations) {
    const matchedSupplement = await findMatchingSupplement(rec.supplementName);
    if (matchedSupplement) {
      rec.supplementId = matchedSupplement.id;
      rec.product = matchedSupplement;
    }
  }
  
  // 6. supplement_recommendations tablosuna kaydet
  await saveRecommendations(userId, recommendations);
  
  return recommendations;
}
```

### 5.4 RAG Chatbot ↔ Boost Entegrasyonu

Expert Chat ve Boost sekmesi birbirine bağlı çalışmalıdır:

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│   Expert Chat                        Boost                    │
│   ┌─────────────────┐               ┌─────────────────┐     │
│   │ Kullanıcı:       │               │ AI Önerileri:    │     │
│   │ "D vitaminim     │──────────────▶│                  │     │
│   │  düşük çıktı,    │  Chatbot      │ 🔴 D Vitamini   │     │
│   │  ne yapmalıyım?" │  önerir ve    │    5000 IU       │     │
│   │                  │  Boost'a      │    Kaynak: Kan   │     │
│   │ AI Yanıtı:       │  yönlendirir  │    testi         │     │
│   │ "D vitamini...   │               │                  │     │
│   │  Boost sekmesine │               │ 🟡 K2 Vitamini  │     │
│   │  baktığınızda    │               │    100mcg        │     │
│   │  kişisel öneriniz│               │    (D vit. ile   │     │
│   │  hazır."         │               │     birlikte)    │     │
│   └─────────────────┘               └─────────────────┘     │
│          ▲                                   │               │
│          │                                   │               │
│          │        ┌──────────────┐           │               │
│          └────────│ Ortak Veri   │◀──────────┘               │
│                   │ Katmanı      │                            │
│                   │              │                            │
│                   │ • health_profiles                        │
│                   │ • blood_tests                            │
│                   │ • food_entries                            │
│                   │ • supplement_recommendations             │
│                   │ • scientific_sources                     │
│                   └──────────────┘                            │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Çapraz Referans Kuralları:**
1. **Chat → Boost**: Chatbot bir takviye önerdiğinde, `supplement_recommendations` tablosuna kaydeder ve kullanıcıyı Boost sekmesine yönlendirir
2. **Boost → Chat**: Kullanıcı Boost'ta bir takviye hakkında soru sorduğunda, "Uzman Chat'te sor" butonu ile detaylı bilgi alabilir
3. **Ortak Veri**: İkisi de aynı `buildUserContext()` fonksiyonunu kullanır

---

## 6. Uçtan Uca Mimari Diyagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React + Vite)                         │
│                                                                              │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  Home   │ │   Log    │ │  Quick   │ │  Coach   │ │ Analysis │          │
│  │Dashboard│ │ AllLogger│ │  Add (+) │ │   Hub    │ │   Hub    │          │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│       │           │            │             │             │                 │
│  Gösterir    Gösterir    Yönlendirir    ┌────┴────┐   ┌────┴────┐          │
│  • Skor      • Tüm       • Camera      │         │   │         │          │
│  • Hedefler    kayıtlar   • Voice       │ Expert  │   │ Health  │          │
│  • Widgets   • Timeline   • Docs        │ Chat    │   │ Profile │          │
│  • Öneriler              • Activity     │ (RAG)   │   │ Blood   │          │
│                                         │         │   │ Test    │          │
│                                         │ Boost   │   │ Analyze │          │
│                                         │ (Takv.) │   │ Wearabl │          │
│                                         └────┬────┘   │ Family  │          │
│                                              │        │ Commun  │          │
│                                              │        └────┬────┘          │
│  ┌──────────────────────────────────────────┐│             │                │
│  │         VERİ TOPLAMA SEKMELERİ            ││             │                │
│  │                                           ││             │                │
│  │  📷 FoodCapture ────┐                     ││             │                │
│  │  🎤 VoiceLogger ────┤                     ││             │                │
│  │  📄 DocumentUpload ─┤  POST /api/health/* ││             │                │
│  │  🏃 ActivityLog ────┤─────────────────────┤┤─────────────┤                │
│  │  📊 BarcodeScanner ─┤                     ││             │                │
│  │  🩸 BloodTest ──────┤                     ││             │                │
│  │  ⏱️  Fasting ────────┤                     ││             │                │
│  │  ⌚ Wearable ───────┘                     ││             │                │
│  └───────────────────────────────────────────┘│             │                │
│                                               │             │                │
└───────────────────────────────────────────────┼─────────────┼────────────────┘
                                                │             │
                        ┌───────────────────────┼─────────────┼──────┐
                        │           BACKEND (Express.js + Node)       │
                        │                       │             │       │
                        │  ┌────────────────────▼─────────────▼──┐   │
                        │  │              ROUTE HANDLERS          │   │
                        │  │  /api/health/*  │  /api/chat/*      │   │
                        │  │  /api/auth/*    │  /api/supplements/*│   │
                        │  │  /api/community/*  /api/family/*    │   │
                        │  │  /api/wearables/*                   │   │
                        │  └──────┬──────────────┬───────────────┘   │
                        │         │              │                    │
                        │  ┌──────▼──────┐ ┌─────▼───────────┐      │
                        │  │ AI Service  │ │  RAG Service     │      │
                        │  │             │ │                  │      │
                        │  │ • Food      │ │ 1. Keyword       │      │
                        │  │   Analysis  │ │    Extraction    │      │
                        │  │ • Blood     │ │ 2. Vector Search │      │
                        │  │   Test OCR  │ │    (pgvector)    │      │
                        │  │ • Document  │ │ 3. User Context  │      │
                        │  │   Analysis  │ │    Building      │      │
                        │  │ • Voice     │ │ 4. GPT-4o        │      │
                        │  │   Sentiment │ │    Generation    │      │
                        │  │ • Medical   │ │ 5. Citations     │      │
                        │  │   Photo     │ │                  │      │
                        │  │ • Health    │ │ • buildUserCtx() │      │
                        │  │   Profile   │ │   ├ health_prof  │      │
                        │  │ • Supplmnt  │ │   ├ blood_tests  │      │
                        │  │   Recommend │ │   ├ food_entries  │      │
                        │  └──────┬──────┘ │   ├ activities    │      │
                        │         │        │   ├ wearable_data │      │
                        │         │        │   ├ fasting_logs  │      │
                        │         │        │   ├ voice_entries │      │
                        │         │        │   ├ daily_logs    │      │
                        │         │        │   └ medical_phot  │      │
                        │         │        └─────────┬─────────┘      │
                        │         │                  │                 │
                        │  ┌──────▼──────────────────▼─────────┐      │
                        │  │         OpenAI API                 │      │
                        │  │  • GPT-4o (chat, analysis)         │      │
                        │  │  • text-embedding-3-small (embed)  │      │
                        │  │  • Whisper (voice transcription)   │      │
                        │  └───────────────────────────────────┘      │
                        │                                             │
                        │  ┌───────────────────────────────────┐      │
                        │  │     PostgreSQL + pgvector           │      │
                        │  │                                    │      │
                        │  │  ┌──────────────┐ ┌────────────┐  │      │
                        │  │  │ users        │ │ food_      │  │      │
                        │  │  │ sessions     │ │ entries    │  │      │
                        │  │  │ daily_logs   │ │ activities │  │      │
                        │  │  │ blood_tests  │ │ voice_     │  │      │
                        │  │  │ blood_results│ │ entries    │  │      │
                        │  │  │ fasting_logs │ │ health_    │  │      │
                        │  │  │ wearable_data│ │ documents  │  │      │
                        │  │  │ medical_phot │ │ health_    │  │      │
                        │  │  │ supplements  │ │ profiles   │  │      │
                        │  │  │ suppl_recom  │ │ scientific │  │      │
                        │  │  │ suppl_orders │ │ _sources   │  │      │
                        │  │  │ chat_convs   │ │ (vectors)  │  │      │
                        │  │  │ chat_msgs    │ │            │  │      │
                        │  │  │ community_*  │ │ family_*   │  │      │
                        │  │  │ notificatns  │ │ goals      │  │      │
                        │  │  └──────────────┘ └────────────┘  │      │
                        │  └───────────────────────────────────┘      │
                        │                                             │
                        └─────────────────────────────────────────────┘
```

---

## 7. Uygulama Yol Haritası

### Faz 1 — Temel Altyapı (1-2 hafta)

| # | Görev | Öncelik | Etkilenen Bileşenler |
|---|-------|---------|---------------------|
| 1.1 | `buildUserContext()` fonksiyonunu genişlet — tüm veri kaynaklarını dahil et | 🔴 Yüksek | ragService.ts |
| 1.2 | ExpertChat mock yanıtları kaldır → API entegrasyonu | 🔴 Yüksek | ExpertChat.tsx |
| 1.3 | AllLogger statik veriyi kaldır → useHealthData + API | 🔴 Yüksek | AllLogger.tsx |
| 1.4 | IntervalFasting API entegrasyonu (fasting endpoints) | 🟡 Orta | IntervalFasting.tsx |
| 1.5 | DocumentUpload API entegrasyonu | 🟡 Orta | DocumentUpload.tsx |

### Faz 2 — AI Güçlendirme (2-3 hafta)

| # | Görev | Öncelik | Etkilenen Bileşenler |
|---|-------|---------|---------------------|
| 2.1 | pgvector extension etkinleştir + embedding pipeline | 🔴 Yüksek | ragService.ts, DB migration |
| 2.2 | Bilimsel kaynak veritabanını doldur (scientific_sources) | 🔴 Yüksek | Seed script |
| 2.3 | VoiceLogger — Web Speech API veya Whisper entegrasyonu | 🟡 Orta | VoiceLogger.tsx, backend |
| 2.4 | BarcodeScanner — quagga2 + Open Food Facts API | 🟡 Orta | BarcodeScanner.tsx, backend |
| 2.5 | Analytics — gerçek veri ile grafikleri güncelle | 🟡 Orta | Analytics.tsx |

### Faz 3 — Akıllı Takviye Sistemi (2-3 hafta)

| # | Görev | Öncelik | Etkilenen Bileşenler |
|---|-------|---------|---------------------|
| 3.1 | `generateSupplementRecommendations()` AI servisi | 🔴 Yüksek | supplementService.ts, aiService.ts |
| 3.2 | Boost ↔ Expert Chat çapraz referans | 🟡 Orta | Boost.tsx, ExpertChat.tsx |
| 3.3 | Otomatik öneri tetikleme (kan testi yükleme sonrası) | 🟡 Orta | healthRoutes.ts |
| 3.4 | Takviye etkileşim uyarı sistemi | 🟢 Düşük | supplementService.ts |

### Faz 4 — İyileştirme ve Optimizasyon (2 hafta)

| # | Görev | Öncelik | Etkilenen Bileşenler |
|---|-------|---------|---------------------|
| 4.1 | RAG yanıt kalitesi değerlendirme ve prompt tuning | 🟡 Orta | ragService.ts |
| 4.2 | Context window optimizasyonu (veri özetleme) | 🟡 Orta | ragService.ts |
| 4.3 | Chat geçmişi yönetimi (eski konuşmaları arşivle) | 🟢 Düşük | chatRoutes.ts |
| 4.4 | Rate limiting ve cache katmanı | 🟢 Düşük | middleware |
| 4.5 | Kullanıcı geri bildirim döngüsü (yanıt kalitesi puanlama) | 🟢 Düşük | ExpertChat.tsx, chat_messages |

---

## Özet

Bu mimari doküman, Myora uygulamasının mevcut 24 sekmesini analiz etmiş, 5 mock/placeholder sekmenin çalışır hale getirilmesi için somut adımlar belirlemiş ve merkezi bir **RAG (Retrieval-Augmented Generation)** chatbot mimarisi tasarlamıştır.

**Temel prensipler:**
1. **Veri odaklı**: Her kullanıcı etkileşimi veritabanına kaydedilir
2. **Kişiselleştirilmiş**: RAG chatbot tüm kullanıcı verilerini context olarak kullanır
3. **Bilimsel dayanak**: Bilimsel kaynaklar (scientific_sources) ile yanıtlar desteklenir
4. **Çapraz referans**: Chat ve Boost sekmeleri birbirine bağlı çalışır
5. **Kademeli geliştirme**: 4 fazlık yol haritası ile önceliklendirme yapılmıştır
