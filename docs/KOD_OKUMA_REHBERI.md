# Myora - Kod Okuma Rehberi

> Projeyi sifirdan anlamak isteyen biri icin optimize edilmis dosya okuma sirasi.
> Her asamayi tamamladiktan sonra bir sonrakine gec.

---

## Genel Veri Akisi

```
Kullanici
   |
   v
React Bilesen (client/src/components/)
   |
   v
API Istemcisi (client/src/lib/api.ts)
   |
   v
Express Rotalari (server/routes/)
   |
   v
Servis Katmani (server/services/)
   |
   +---> PostgreSQL (shared/schema.ts)
   +---> OpenAI GPT-4o (aiService / ragService)
   |
   v
JSON Yanit --> UI Guncelleme
```

---

## Asama 1: Buyuk Resim

Projenin ne yaptigini ve nasil calistirildigini anla.

| # | Dosya | Neden Oku |
|---|-------|-----------|
| 1 | `docs/ARCHITECTURE.md` | Tum mimarinin ozeti, teknolojiler, veri akislari |
| 2 | `package.json` | Bagimliliklar, calistirma scriptleri (`dev`, `build`, `db:push`) |
| 3 | `vite.config.ts` | Alias tanimlari (`@/`, `@shared/`), build ayarlari |
| 4 | `tsconfig.json` | TypeScript yapilandirmasi ve path mapping |
| 5 | `capacitor.config.ts` | Mobil uygulama ayarlari (appId, plugins) |

**Sorular:** "Bu proje ne yapiyor? Hangi teknolojileri kullaniyor? Nasil calistirilir?"

---

## Asama 2: Frontend Giris Noktasi

Uygulama kullanici tarafindan nasil baslatiliyor?

| # | Dosya | Neden Oku |
|---|-------|-----------|
| 6 | `client/index.html` | SPA giris noktasi, `main.tsx` burada yukleniyor |
| 7 | `client/src/main.tsx` | ReactDOM render, uygulamanin en ust noktasi |
| 8 | `client/src/App.tsx` | Provider hiyerarsisi (Query, Language, Auth, HealthData) + Router |
| 9 | `client/src/pages/Auth.tsx` | Giris/kayit ekrani - kullanici ilk bunu gorur |
| 10 | `client/src/pages/Index.tsx` | Ana sayfa - tab-state ve hub yapisi |
| 11 | `client/src/pages/AppLayout.tsx` | Layout wrapper + bottom navigation |

**Provider Hiyerarsisi:**
```
QueryClientProvider
  TooltipProvider
    LanguageProvider
      AuthProvider
        HealthDataProvider
          BrowserRouter
            Routes --> Auth | Index | NotFound
```

**Sorular:** "Kullanici uygulamayi acinca hangi dosyalar devreye giriyor?"

---

## Asama 3: Kimlik Dogrulama (Auth) Akisi

Giris/cikis sistemi projenin omurgasi. Cogu sey "giris yapmis kullanici" mantigi ile calisiyor.

| # | Dosya | Neden Oku |
|---|-------|-----------|
| 12 | `client/src/contexts/AuthContext.tsx` | Kullanici oturumu nasil tutuluyor, login/logout/register |
| 13 | `client/src/lib/supabase.ts` | Supabase istemci olusturma |
| 14 | `client/src/lib/validations/auth.ts` | Login/register form dogrulamasi (Zod) |
| 15 | `server/middleware/auth.ts` | `requireAuth` ve `optionalAuth` middleware |
| 16 | `server/routes/authRoutes.ts` | `/api/auth/*` endpoint'leri |

**Akis:**
```
Auth.tsx --> AuthContext --> supabase.ts / api.ts --> authRoutes --> DB
```

**Sorular:** "Login olduktan sonra kullanici bilgisi nereden geliyor? Oturum nasil korunuyor?"

---

## Asama 4: API Katmani (Frontend <-> Backend Koprusu)

| # | Dosya | Neden Oku |
|---|-------|-----------|
| 17 | `client/src/lib/api-types.ts` | API yanit tipleri - merkezi tip tanimlari |
| 18 | `client/src/lib/api.ts` | Ana API istemcisi - 6 modul (health, chat, supplement, community, family, wearable) |
| 19 | `client/src/lib/queryKeys.ts` | TanStack Query anahtarlari - cache yonetimi |
| 20 | `client/src/lib/logger.ts` | Istemci tarafi loglama |
| 21 | `client/src/lib/platform.ts` | Platform algilama (web/ios/android) |

**Zihinsel Model:**
```
UI Bileseni --> api.ts --> Backend/Supabase --> Cevap --> UI
```

**Sorular:** "Bir component veri cekmek isterse nereye gider?"

---

## Asama 5: Backend Omurgasi

| # | Dosya | Neden Oku |
|---|-------|-----------|
| 22 | `server/index.ts` | Express baslatma, middleware zinciri, port (5000) |
| 23 | `server/routes.ts` | Merkezi rota kaydi - tum `/api/*` yollari burada birlesir |
| 24 | `server/db.ts` | PostgreSQL baglantisi + Drizzle ORM instance |
| 25 | `server/vite.ts` | Dev: Vite HMR, Prod: static dosya servisi |
| 26 | `server/storage.ts` | IStorage arayuzu + DatabaseStorage implementasyonu |

**Request Yolculugu:**
```
HTTP Request
  --> Express Middleware (JSON parse, logging)
  --> Session kontrolu
  --> requireAuth middleware
  --> Rota handler (routes/*.ts)
  --> Servis katmani (services/*.ts)
  --> DB veya AI
  --> JSON Response
```

**Sorular:** "Bir HTTP request backend'de ilk nereden geciyor?"

---

## Asama 6: Veritabani Semasi

| # | Dosya | Neden Oku |
|---|-------|-----------|
| 27 | `shared/schema.ts` | Tum veritabani tablolari (17+), Drizzle ORM ile tanimli. Buyuk dosya - grup grup oku |
| 28 | `drizzle.config.ts` | Migrasyon yapilandirmasi |

**Tablo Gruplari (shared/schema.ts icinde):**
```
1. users                          --> Kullanici profili
2. wearable_devices, user_devices --> Giyilebilir cihazlar
3. daily_health_logs              --> Gunluk saglik takibi
4. food_entries                   --> Yemek kayitlari
5. activity_entries               --> Egzersiz kayitlari
6. blood_tests, blood_test_results --> Kan tahlili
7. health_documents               --> Saglik belgeleri
8. medical_photos                 --> Tibbi fotograflar
9. voice_entries                  --> Sesli gunlukler
10. health_profiles               --> AI saglik profili (1:1)
11. scientific_sources             --> RAG bilimsel kaynaklar
12. chat_conversations, chat_messages --> Chat
13. supplements, supplement_*      --> Takviye gida
14. fasting_logs                   --> Aralikli oruc
15. community_posts, comments, likes --> Topluluk
16. family_members, medications    --> Aile takibi
17. notifications, preferences     --> Bildirimler
18. user_goals, achievements       --> Hedefler & rozetler
```

**Sorular:** "Veri nerede saklaniyor? Tablolar arasi iliskiler nasil?"

---

## Asama 7: Bir Feature'i Uctan Uca Izle (Saglik Takibi)

Bir ozelligin bastan sona nasil calistigini izle. En iyi baslangic: saglik takibi.

| # | Dosya | Rol |
|---|-------|-----|
| 29 | `client/src/components/HealthDashboard.tsx` | Kullanicinin gordugu ana ekran |
| 30 | `client/src/contexts/HealthDataContext.tsx` | Saglik verisi state yonetimi |
| 31 | `client/src/lib/api.ts` --> `healthAPI` bolumu | Frontend'in backend'e cagrilari |
| 32 | `server/routes/healthRoutes.ts` | Backend endpoint tanimlari |
| 33 | `server/services/healthTrackingService.ts` | Is mantigi (CRUD) |

**Tam Zincir:**
```
HealthDashboard --> HealthDataContext --> api.ts (healthAPI)
  --> /api/health/* --> healthRoutes --> healthTrackingService
  --> shared/schema tablosu --> JSON --> UI
```

---

## Asama 8: AI ve RAG Sistemi

| # | Dosya | Rol |
|---|-------|-----|
| 34 | `server/services/aiService.ts` | GPT-4o entegrasyonu - 6 analiz fonksiyonu |
| 35 | `server/services/ragService.ts` | RAG chatbot motoru - kaynak arama + baglam + yanit |
| 36 | `server/routes/chatRoutes.ts` | Chat endpoint'leri |
| 37 | `client/src/components/ExpertChat.tsx` | Chat arayuzu |
| 38 | `docs/RAG_ARCHITECTURE.md` | RAG mimarisinin detayli dokumani |

**AI Akisi:**
```
Kullanici Sorusu
  --> Anahtar kelime cikarma
  --> Bilimsel kaynak arama (scientific_sources)
  --> Kullanici baglami (profil + kan tahlili)
  --> Sistem prompt olusturma
  --> GPT-4o JSON yaniti (content + citations + followUps)
```

**aiService.ts Fonksiyonlari:**
```
analyzeFoodImage()      --> Yemek tanimlama
analyzeBloodTest()      --> Kan tahlili yorumlama
analyzeHealthDocument() --> Belge analizi
analyzeMedicalPhoto()   --> Tibbi goruntu
analyzeVoiceEntry()     --> Duygu analizi
generateHealthProfile() --> Saglik profili
```

---

## Asama 9: Supabase Katmani

| # | Dosya | Rol |
|---|-------|-----|
| 39 | `supabase/config.toml` | Yerel Supabase yapilandirmasi |
| 40 | `supabase/functions/generate-chat-response/index.ts` | Chat yanit edge function |
| 41 | `supabase/functions/analyze-health-data/index.ts` | Saglik verisi analiz |
| 42 | `supabase/functions/generate-health-profile/index.ts` | Saglik profili olusturma |
| 43 | `supabase/migrations/202603110001_profiles.sql` | Ilk migration - SQL tablo yapisi |
| 44 | `supabase/migrations/202603200001_rls_audit_fixes.sql` | RLS (Row Level Security) kurallari |

---

## Asama 10: RAG Veri Besleme ve Diger Servisler

| # | Dosya | Rol |
|---|-------|-----|
| 45 | `scripts/rag/seed-sources.ts` | Bilimsel kaynak verisini DB'ye yukleme |
| 46 | `scripts/rag/ingest-urls.ts` | URL'lerden kaynak cekme ve chunking |
| 47 | `server/services/supplementService.ts` | Takviye gida motoru |
| 48 | `server/services/communityService.ts` | Topluluk servisi |
| 49 | `server/services/familyService.ts` | Aile takip servisi |

---

## Asama 11: UI Bilesenleri (Ihtiyaca Gore)

Bunlari istedigin sirayla, ihtiyac duydukca oku.

| # | Dosya | Aciklama |
|---|-------|----------|
| 50 | `client/src/components/FoodCapture.tsx` | Yemek fotograf analizi |
| 51 | `client/src/components/VoiceLogger.tsx` | Sesli gunluk kaydi |
| 52 | `client/src/components/BloodTestAnalysis.tsx` | Kan tahlili analizi |
| 53 | `client/src/components/DocumentUpload.tsx` | Belge yukleme + AI analiz |
| 54 | `client/src/components/MedicalPhotoAnalysis.tsx` | Tibbi fotograf analizi |
| 55 | `client/src/components/IntervalFasting.tsx` | Aralikli oruc takibi |
| 56 | `client/src/components/FamilyTracking.tsx` | Aile ilac takibi |
| 57 | `client/src/components/Community.tsx` | Topluluk sayfasi |
| 58 | `client/src/components/SupplementStore.tsx` | Takviye magazasi |
| 59 | `client/src/components/WearableDevices.tsx` | Cihaz baglanti yonetimi |
| 60 | `client/src/components/WearableDataDashboard.tsx` | Cihaz veri panosu |
| 61 | `client/src/components/Analytics.tsx` | Analitik grafikleri |
| 62 | `client/src/components/ActivityLogger.tsx` | Aktivite kayit formu |
| 63 | `client/src/components/DailyQuests.tsx` | Gunluk gorevler ve streak |
| 64 | `client/src/components/HealthProfile.tsx` | AI saglik profili |
| 65 | `client/src/components/BottomNavigation.tsx` | Alt navigasyon cubugu |
| 66 | `client/src/components/NotificationSettings.tsx` | Bildirim tercihleri |
| 67 | `client/src/components/ProtectedRoute.tsx` | Auth guard bileseni |
| 68 | `client/src/components/CoachHub.tsx` | Koc modulleri merkezi |
| 69 | `client/src/components/AnalysisHub.tsx` | Analiz modulleri merkezi |
| 70 | `client/src/components/AllLogger.tsx` | Kayit ozet ekrani |

---

## Asama 12: Mobil ve Yardimci Dosyalar

| # | Dosya | Aciklama |
|---|-------|----------|
| 71 | `client/src/services/NativeWidgetService.ts` | Native widget bridge |
| 72 | `client/src/services/NotificationService.ts` | Push bildirim servisi |
| 73 | `client/src/hooks/useKeyboard.ts` | Mobil klavye yonetimi |
| 74 | `client/src/hooks/useTabNavigate.ts` | Tab navigasyon hook |
| 75 | `client/src/types/health.ts` | Istemci tarafi saglik tipleri |
| 76 | `client/src/types/routes.ts` | Rota tip tanimlari |
| 77 | `client/src/lib/validations/forms.ts` | Form validasyonlari |

---

## Her Dosyada Cikarman Gereken Notlar

Her dosyayi okurken su sorulari cevapla:

1. **Dosya amaci:** Bu dosya ne yapiyor?
2. **Kim cagiriyor:** Bu dosyayi hangi dosya(lar) kullaniyor?
3. **Kimi cagiriyor:** Bu dosya hangi dosya/servislere bagimli?
4. **Ana fonksiyonlar:** Icindeki onemli fonksiyonlar neler?
5. **Bagli tablo/endpoint:** Hangi DB tablosu veya API endpoint'i ile iliskili?

---

## Hizli Referans: Dosya -> Katman Eslesmesi

```
client/src/pages/        --> Sayfalar (Auth, Index, AppLayout)
client/src/components/   --> UI Bilesenleri (30+)
client/src/contexts/     --> State Yonetimi (Auth, Health, Language)
client/src/hooks/        --> Custom Hook'lar
client/src/lib/          --> Yardimci Kutuphaneler (api, supabase, utils)
client/src/services/     --> Native Servisler (Widget, Notification)
client/src/types/        --> Tip Tanimlari

server/routes/           --> API Endpoint Tanimlari
server/services/         --> Is Mantigi Katmani
server/middleware/       --> Auth Middleware

shared/schema.ts         --> Veritabani Semasi (tek dosya, 17+ tablo)

supabase/functions/      --> Edge Functions (AI islemleri)
supabase/migrations/     --> SQL Migrasyonlar

scripts/rag/             --> RAG veri besleme betikleri
docs/                    --> Dokumantasyon
```
