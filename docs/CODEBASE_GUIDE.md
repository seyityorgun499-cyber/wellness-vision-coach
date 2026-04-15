# Myora - Kod Rehberi ve Mimari Sema

> Tum mimari aciklamalar, kod akislari ve interaktif sema.
> Son guncelleme: Mart 2026

---

## Mimari Sema (Interaktif)

> Asagidaki kutulara tiklayarak ilgili bolumun detayli aciklamasina gidebilirsiniz.

```
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                                    MYORA MIMARISI                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │                          KULLANICI KATMANI                                      │
  │                                                                                 │
  │   ┌─────────────┐    ┌──────────────┐    ┌──────────────┐                      │
  │   │  Android     │    │   iOS        │    │   Web        │                      │
  │   │  (Capacitor) │    │  (Capacitor) │    │  (Browser)   │                      │
  │   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                      │
  │          └───────────────────┼───────────────────┘                               │
  │                              ▼                                                   │
  │                   ┌─────────────────────┐                                        │
  │                   │    WebView / DOM     │                                        │
  │                   └──────────┬──────────┘                                        │
  └──────────────────────────────┼──────────────────────────────────────────────────┘
                                 ▼
  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │                         FRONTEND KATMANI (React SPA)                            │
  │                                                                                 │
  │  ┌──────────────────────────────────────────────────────────────────────────┐   │
  │  │                        PROVIDER ZINCIRI                                  │   │
  │  │  ThemeProvider → QueryClient → LanguageProvider → AuthProvider → Router  │   │
  │  └──────────────────────────────────────────────────────────────────────────┘   │
  │                                                                                 │
  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐    │
  │  │  Sayfa        │  │  Bilesenler   │  │  Context'ler  │  │  Hook'lar    │    │
  │  │  Katmani      │  │  (38 adet)    │  │  (3 adet)     │  │  (5 adet)    │    │
  │  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  └──────┬───────┘    │
  │          └───────────────────┼───────────────────┼────────────────┘             │
  │                              ▼                   ▼                               │
  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐    │
  │  │  UI Kutupane  │  │  API Katmani  │  │  Validasyon   │  │  Servisler   │    │
  │  │  (shadcn/ui)  │  │  (api.ts)     │  │  (Zod)        │  │  (2 adet)    │    │
  │  └───────────────┘  └───────┬───────┘  └───────────────┘  └──────────────┘    │
  └──────────────────────────────┼──────────────────────────────────────────────────┘
                                 ▼
  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │                         BACKEND KATMANI (Supabase)                              │
  │                                                                                 │
  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐    │
  │  │  Auth         │  │  PostgreSQL   │  │  Edge         │  │  Storage     │    │
  │  │  (JWT)        │  │  + pgvector   │  │  Functions    │  │  (Dosyalar)  │    │
  │  └───────────────┘  └───────────────┘  └───────┬───────┘  └──────────────┘    │
  └──────────────────────────────────────────────────┼──────────────────────────────┘
                                                     ▼
  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │                         YAPAY ZEKA KATMANI                                      │
  │                                                                                 │
  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐              │
  │  │  RAG Chatbot     │  │  Saglik Profili  │  │  Coklu Analiz    │              │
  │  │  (Vektör Arama)  │  │  Uretici         │  │  Motoru          │              │
  │  └──────────────────┘  └──────────────────┘  └──────────────────┘              │
  │                              ▼                                                   │
  │                   ┌─────────────────────┐                                        │
  │                   │   OpenAI GPT-4o     │                                        │
  │                   └─────────────────────┘                                        │
  └─────────────────────────────────────────────────────────────────────────────────┘
```

### Hizli Erisim - Tikla ve Git

| Katman | Bolum | Aciklama |
|--------|-------|----------|
| 📱 Mobil | [Capacitor & WebView](#1-capacitor--mobil-katman) | Android/iOS sarmalayici, WebView yapilandirmasi |
| 🧭 Yonlendirme | [Router & Sayfalar](#2-router--sayfa-katmani) | HashRouter/BrowserRouter, 22+ rota |
| 🔗 Provider Zinciri | [Context Sistemi](#3-provider-zinciri--context-sistemi) | Theme, Auth, Language, HealthData |
| 🏠 Ana Sayfa | [HealthDashboard](#4-ana-sayfa--healthdashboard) | Skor, gorevler, seviye, ipuclari |
| 📊 Bilesenler | [38 Bilesen Detayi](#5-bilesenler-detayli-aciklama) | Tum sayfa bilesenleri |
| 🎨 UI Kutuphanesi | [shadcn/ui + Tailwind](#6-ui-kutuphanesi) | 54 Radix primitive + Tailwind |
| 🔌 API Katmani | [api.ts Modulu](#7-api-katmani) | 8 namespace, 60+ endpoint |
| 🗄️ Veritabani | [PostgreSQL Semasi](#8-veritabani-semasi) | 20+ tablo, RLS politikalari |
| 🤖 Edge Functions | [Sunucu Fonksiyonlari](#9-edge-functions--sunucu-fonksiyonlari) | 3 Deno fonksiyonu |
| 🧠 RAG Sistemi | [Vektor Arama & Chat](#10-rag-sistemi--yapay-zeka) | Bilimsel kaynak, pgvector, GPT-4o |
| 🌍 Dil Sistemi | [i18n (EN/TR)](#11-dil-sistemi-i18n) | 900+ ceviri anahtari |
| ✅ Validasyon | [Zod Semalari](#12-validasyon-katmani) | Form dogrulama |
| 🔔 Servisler | [Bildirim & Widget](#13-servisler) | Akilli bildirimler, native widget |
| ⚙️ Yapilandirma | [Config Dosyalari](#14-yapilandirma-dosyalari) | Vite, Tailwind, TypeScript |
| 📁 Dosya Agaci | [Proje Yapisi](#15-proje-dosya-agaci) | Tam dizin haritasi |

---

## 1. Capacitor & Mobil Katman

[⬆ Semaya Don](#mimari-sema-interaktif)

Myora, **Capacitor 7.x** ile sarilmis bir hybrid uygulamadir. Web kodu native bir WebView icinde calisir.

### Nasil Calisir?

```
npm run build  →  dist/public/  →  npx cap sync android  →  Android Studio Run
     │                 │                    │                        │
  Vite derler     Statik dosya     Android'e kopyalar         APK uretir
```

### `capacitor.config.ts`
- **appId**: `com.myora.app`
- **webDir**: `dist/public` (Vite ciktisi)
- **SplashScreen**: 2 saniye beyaz ekran
- **Keyboard**: Body'yi yeniden boyutlandirir (mobil klavye acildiginda)
- **LocalNotifications**: Mavi ikon

### `android/app/.../MainActivity.java`
- `BridgeActivity` sinifini genisletir (Capacitor temeli)
- **onCreate()**: Dosya secici launcher'i kaydeder (dokuman yukleme icin)
- **onStart()**: WebView'i yapilandirir:
  - Kamera/mikrofon izinlerini otomatik verir
  - Dosya erisimini acar
  - Medya oynatma icin kullanici hareketi gerektirmez

### `AndroidManifest.xml` Izinleri
| Izin | Amac |
|------|------|
| INTERNET | Ag erisimi |
| CAMERA | Yemek/medikal foto cekimi |
| RECORD_AUDIO | Sesli kayit |
| POST_NOTIFICATIONS | Bildirimler (Android 13+) |
| BLUETOOTH_CONNECT/SCAN | Giyilebilir cihaz baglantisi |
| READ_MEDIA_* | Galeri erisimi (Android 13+) |

### Deep Linking
- `https://myora.app/*` (auto-verified)
- `myora://*` (ozel sema)

### Platform Tespiti (`lib/platform.ts`)
```typescript
isNative  → Capacitor.isNativePlatform()  // Android veya iOS
isAndroid → Capacitor.getPlatform() === 'android'
isWeb     → !isNative                      // Tarayici
```

---

## 2. Router & Sayfa Katmani

[⬆ Semaya Don](#mimari-sema-interaktif)

### Router Secimi
- **Native** (Capacitor): `HashRouter` — file:// protokolu hash yonlendirme gerektirir
- **Web** (Tarayici): `BrowserRouter` — temiz URL'ler

### Tum Rotalar (`App.tsx`)

```
/auth              → Auth (giris/kayit)
/onboarding        → Onboarding (ilk kullanim sihirbazi)
/                  → AppLayout (korunakli, tum uygulama rotalari sarar)
  ├── /            → HealthDashboard (ana sayfa)
  ├── /log         → AllLogger (birlesmis kayit)
  ├── /boost       → Boost (oyunlastirma)
  ├── /analysis    → AnalysisHub (analiz merkezi)
  ├── /camera      → FoodCapture (yemek tarama)
  ├── /voice       → VoiceLogger (sesli kayit)
  ├── /docs        → DocumentUpload (dokuman yukleme)
  ├── /activity    → ActivityLogger (aktivite kaydi)
  ├── /fasting     → IntervalFasting (oruc zamanlayici)
  ├── /analytics   → Analytics (grafikler)
  ├── /widgets     → WidgetCreator (widget olusturucu)
  ├── /wearables   → WearableDevices (cihaz yonetimi)
  ├── /wearable-data → WearableDataDashboard
  ├── /chat        → ExpertChat (RAG chatbot)
  ├── /notifications → NotificationSettings
  ├── /profile     → UserProfile (profil ayarlari)
  ├── /community   → Community (topluluk)
  ├── /family      → FamilyTracking (aile takibi)
  ├── /supplements → SupplementStore (takviye magazasi)
  ├── /bloodtest   → BloodTestAnalysis (kan testi)
  └── /health-profile → HealthProfile (saglik profili)
*                  → NotFound (404)
```

- **Tum bilesenler** `React.lazy()` ile tembel yuklenir (bundle boyutunu azaltir)
- Rota sabitleri `client/src/types/routes.ts` dosyasinda merkezi olarak tanimlidir

### `AppLayout.tsx` — Ana Uygulama Kabugu

```
┌──────────────────────────────┐
│        Sayfa Icerigi          │
│    (Outlet - aktif rota)      │
│                               │
│                               │
│                               │
├───────────────────────────────┤
│  Home │ Log │ [+] │ Bst │ An │  ← BottomNavigation
└──────────────────────────────┘
```

**Sorumluluklar:**
1. Cocuklari `HealthDataProvider` ile sarar
2. `BottomNavigation` render eder (klavye acikken gizlenir)
3. Hizli-Ekleme sayfasi (Kamera/Ses/Dokuman/Aktivite)
4. Deep link isleyicisi (Capacitor)
5. Android geri butonu davranisi:
   - Hizli-ekleme aciksa → kapat
   - Ana sayfadaysa → cikis onay diyalogu
   - Diger → geri git

### `BottomNavigation.tsx`
- 5 sekme: Ana Sayfa | Kayit | [+] (hizli-ekleme) | Boost | Analiz
- Ortadaki "+" butonu `AppLayout`'taki hizli-ekleme sayfasini acar
- Aktif sekmede birincil renk + nokta gostergesi

### `useTabNavigate.ts` Hook'u
- `useTabNavigate()`: Sekme adina gore navigasyon (`'home'` → `/`, `'camera'` → `/camera`)
- `useActiveTab()`: URL'den aktif sekme adini okur

---

## 3. Provider Zinciri & Context Sistemi

[⬆ Semaya Don](#mimari-sema-interaktif)

React Context'leri uygulama genelinde state yonetimi saglar. Siralama onemlidir:

```
main.tsx
  └── ThemeProvider (karanlik/aydinlik mod)
        └── App.tsx
              └── QueryClientProvider (React Query onbellegi)
                    └── TooltipProvider (Radix tooltip'ler)
                          └── LanguageProvider (i18n: en/tr)
                                └── AuthProvider (kullanici oturumu)
                                      └── Router (Hash veya Browser)
                                            └── AppLayout
                                                  └── HealthDataProvider (saglik verileri)
                                                        └── [Sayfa Bilesenleri]
```

### AuthContext (`contexts/AuthContext.tsx`)

**State:**
- `user`: Profil verileriyle birlestirilmis kullanici | null
- `loading`: Ilk auth kontrolu

**Akis:**
1. Mount'ta `supabase.auth.onAuthStateChange()` dinler
2. SIGNED_IN/TOKEN_REFRESHED → profiles tablosundan profil getirir
3. SIGNED_OUT → state'i temizler

**Metodlar:**
| Metod | Aciklama |
|-------|----------|
| `signUp(email, password, name)` | Kullanici olusturur + profil satirini ekler |
| `signIn(email, password)` | Email/sifre ile giris |
| `signOut()` | Cikis yapar, `/auth`'a yonlendirir |
| `refreshUser()` | Profili yeniden getirir (10s zaman asimi) |

### LanguageContext (`contexts/LanguageContext.tsx`)

**Yapi:**
- `translations.en` = 900+ anahtar-deger cifti (Ingilizce)
- `translations.tr` = 900+ anahtar-deger cifti (Turkce)
- TypeScript her iki dilin ayni anahtarlara sahip olmasini zorunlu kilar

**Sagladiklari:**
| Deger | Tip | Aciklama |
|-------|-----|----------|
| `t` | TranslationStrings | Tip-guvenli ceviri nesnesi |
| `language` | `'en'` \| `'tr'` | Aktif dil kodu |
| `locale` | `'en-US'` \| `'tr-TR'` | Intl API'leri icin |
| `setLanguage` | function | Dil degistirme |

### HealthDataContext (`contexts/HealthDataContext.tsx`)

**State (mount'ta paralel API cagirilariyla yuklenir):**
- `foodAnalyses`, `voiceEntries`, `activityEntries`, `documentEntries`, `medicalPhotos`
- `dailyGoals`: kalori, protein, su hedefleri ve mevcut degerler

**Hesaplananlar:**
- `getTodaysCalories()` → bugunun yemeklerinden toplam kalori
- `getTodaysProtein()` → bugunun toplam proteini
- `getRecentActivities()` → son 10 giris

**Mutasyonlar (yerel state + Supabase'e kayit):**
- `addFoodAnalysis()`, `addVoiceEntry()`, `addActivityEntry()`
- `addDocumentEntry()`, `addMedicalPhoto()`, `updateWaterIntake()`

---

## 4. Ana Sayfa — HealthDashboard

[⬆ Semaya Don](#mimari-sema-interaktif)

```
┌─────────────────────────────────────┐
│  Merhaba, [isim]!     🌙 ⚙️        │
├─────────────────────────────────────┤
│         ┌───────────┐               │
│         │  MY SCORE │               │
│         │    78     │  ← Animasyonlu│
│         │   /100    │     halka     │
│         └───────────┘               │
│  [Seviye Rozeti: Gumus ⭐ 450 XP]   │
├─────────────────────────────────────┤
│  📌 Gunun Ipucu                     │
│  "Bugün 8 bardak su icmeyi..."      │
├─────────────────────────────────────┤
│  ✅ Gunluk Gorevler (3/5)           │
│  ☑ Yemek kaydet                     │
│  ☑ Su ic                            │
│  ☐ Aktivite yap                     │
│  ☑ Sesli kayit                      │
│  ☐ Skoru kontrol et                 │
├─────────────────────────────────────┤
│  🏆 Mini Meydan Okumalar           │
│  "7 Gun Su Sampiyonu" [%60]        │
├─────────────────────────────────────┤
│  🎖️ Basarimlar                     │
│  [Ilk Yemek] [3 Gun Seri] [🔒]    │
└─────────────────────────────────────┘
```

### Skor Hesaplama (4 Kategori)

```
My Score = Beslenme(30%) + Aktivite(30%) + Tutarlilik(25%) + Hidrasyon(15%)

Beslenme (30%):
  kalori_dengesi = 100 - |hedef - tuketilen| / hedef * 100   (agirlik: %60)
  protein_ilerlemesi = tuketilen_protein / hedef_protein * 100 (agirlik: %40)

Aktivite (30%):
  min(aktivite_sayisi * 33, 100)

Tutarlilik (25%):
  kaydedilen_kategoriler / 4 * 100
  (yemek, aktivite, su, ses)

Hidrasyon (15%):
  tuketilen_su / hedef_su * 100
```

### Alt Bilesenler

| Bilesen | Dosya | Islem |
|---------|-------|-------|
| **DailyQuests** | `DailyQuests.tsx` | 5 gunluk gorev, 30s polling ile gercek zamanli |
| **DailyTip** | `DailyTip.tsx` | En zayif alana gore ipucu secer, gunluk rotasyon |
| **LevelBadge** | `LevelBadge.tsx` | XP tabanlı: Baslangic→Bronz→Gumus→Altin→Elmas |
| **MiniChallenges** | `MiniChallenges.tsx` | Havuzdan 3 haftalik meydan okuma, localStorage takibi |
| **AchievementsBadges** | `AchievementsBadges.tsx` | Kazanilmis ve kilitli rozetler |

### XP Sistemi
| Kaynak | XP |
|--------|----|
| Yemek kaydi | +10 |
| Aktivite | +15 |
| Su bardagi | +5 |
| Sesli kayit | +10 |
| Seri gunu | +20 |

---

## 5. Bilesenler (Detayli Aciklama)

[⬆ Semaya Don](#mimari-sema-interaktif)

### Saglik Takibi

#### FoodCapture.tsx — Yemek Tarama
```
Kullanici foto ceker → Capacitor Camera (native) veya getUserMedia (web)
  → Base64 gonderilir → healthAPI.analyzeFood()
  → Edge Function: analyze-health-data (tip: food-image)
  → GPT-4o Vision analiz eder
  → Donus: {yemekAdi, kalori, protein, karb, yag, guven}
  → Kullanici onaylar → food_entries tablosuna eklenir
  → React Query onbellegi gecersizlenir → Dashboard guncellenir
```

#### VoiceLogger.tsx — Sesli Kayit
- Ses kaydi + konusmadan metne cevirme + AI analizi
- **Iki mod**: Saglik gunlugu (ruh hali, anahtar kelimeler) ve yemek kaydi (besin bilgisi)
- Mikrofon izni gerektirir

#### ActivityLogger.tsx — Aktivite Kaydi
- Manuel aktivite girisi: tip, sure, yogunluk (hafif/orta/yogun)
- Zod ile form dogrulamasi
- Yakilan kalori hesaplayicisi

#### IntervalFasting.tsx — Aralikli Oruc
- Zamanlayici ile oruc takibi
- Planlar: 12:12, 14:10, 16:8, 18:6, 20:4
- Seri takibi ve gecmis goruntuleme
- Aktif oruc durumu API'den cekilir

#### WaterWidget / ProteinWidget
- Dashboard'daki hizli ekleme widget'lari
- Tek tikla su/protein kaydi

### Analiz & Yapay Zeka

#### ExpertChat.tsx — RAG Chatbot
```
┌─────────────────────────────┐
│  🤖 Saglik Uzmani           │
│                              │
│  Kullanici: "D vitamini      │
│  almali miyim?"              │
│                              │
│  Bot: "Kan testlerinize      │
│  gore D vitamininiz 18       │
│  ng/mL ki bu dusuk. [1]     │
│  Gunluk 2000 IU D3           │
│  onerilir. [2]"              │
│                              │
│  [1] WHO Kilavuzu            │
│  [2] PubMed #38291           │
│                              │
│  Onerilen sorular:           │
│  • "Ne zaman almali?"        │
│  • "Yan etkileri var mi?"    │
│                              │
│  [Mesaj yaz...]         [>]  │
└─────────────────────────────┘
```
- Bilimsel kaynakli alinti sistemi
- Kullanici saglik baglamini kullanir (kan testleri, profil, vb.)
- Acil durum anahtar kelime tespiti (gogus agrisi, intihar → 112/182)

#### BloodTestAnalysis.tsx — Kan Testi Analizi
- OCR metin yukleme + AI ile marker analizi
- Her marker icin durum: Normal / Dusuk / Yuksek
- AI ozeti ve oneriler

#### HealthProfile.tsx — Saglik Profili
- AI tarafindan uretilmis kapsamli profil
- BMI, BMR, TDEE hesaplari
- Beslenme plani, egzersiz plani, uyku onerisi
- Takviye onerileri: {isim, neden, doz, oncelik}

#### Analytics.tsx — Grafikler
- Haftalik/aylik trendler (recharts kutuphanesi)
- Makro dagılımı, kilo takibi, aylık ilerleme
- Tembel yuklenmis grafik bilesenleri (`charts/` dizini)

#### MedicalPhotoAnalysis.tsx — Medikal Foto Analizi
- Foto cekimi + AI analizi
- Tipler: idrar, gaita, dil, goz
- Gozlemler ve endiseler raporlanir

### Sosyal & Aile

#### Community.tsx — Topluluk
- Kategorili forum: genel, beslenme, egzersiz, tarifler
- Gonderi olusturma, begeni
- Topluluk meydan okumalari ve liderlik tablosu

#### FamilyTracking.tsx — Aile Takibi
- Aile uyesi ekleme (isim, iliski)
- Ilac/takviye takibi: isim, doz, siklik, zamanlama
- Uyum orani hesaplama

#### SupplementStore.tsx — Takviye Magazasi
- AI onerileri + magaza + siparisler
- Kategori filtreleme

#### SupplementTracker.tsx — Takviye Takibi
- Gunluk takviye alim kaydi
- Sabah/aksam hatirlatici

### Ayarlar

| Bilesen | Islem |
|---------|-------|
| **UserProfile.tsx** | Profil duzenleme: isim, dogum tarihi, boy, kilo, BMI |
| **NotificationSettings.tsx** | Akilli bildirim tercihleri |
| **WearableDevices.tsx** | Cihaz baglama/cikarma/silme |
| **LanguageToggle.tsx** | EN/TR dil degistirici |
| **DarkModeToggle.tsx** | Tema degistirici |

### Diger Bilesenler

| Bilesen | Islem |
|---------|-------|
| **AllLogger.tsx** | Birlesmis kayit sayfasi (sekmeli) |
| **AnalysisHub.tsx** | Analiz araclari merkezi |
| **Boost.tsx** | Oyunlastirma ana sayfasi |
| **ProtectedRoute.tsx** | Auth guard (giris yapmamissa /auth'a yonlendirir) |
| **WidgetCreator.tsx** | Ozel dashboard widget olusturucu |
| **WearableDataDashboard.tsx** | Giyilebilir cihaz verisi gosterimi |
| **ScoreBreakdownModal.tsx** | My Score hesaplama detayi |
| **QuickActions.tsx** | Hizli erisim butonlari |

---

## 6. UI Kutuphanesi

[⬆ Semaya Don](#mimari-sema-interaktif)

### shadcn/ui + Radix + Tailwind

**54 hazir bilesen** `client/src/components/ui/` dizininde:

```
accordion, alert, alert-dialog, aspect-ratio, avatar, badge,
breadcrumb, button, calendar, card, carousel, chart, checkbox,
collapsible, command, context-menu, dialog, drawer, dropdown-menu,
empty-state, error-view, form, hover-card, input, input-otp,
label, loading-skeleton, menubar, navigation-menu, page-wrapper,
pagination, popover, progress, radio-group, resizable, scroll-area,
select, separator, sheet, sidebar, skeleton, slider, sonner, switch,
table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip
```

### Tailwind Yapilandirmasi (`tailwind.config.ts`)
- **Karanlik mod**: sinif tabanli (`class`)
- **Ozel renkler**: primary, secondary, success, warning, destructive
- **Makro renkleri**: protein (kirmizi), karb (mavi), yag (amber), kalori (yesil)
- **Animasyonlar**: pulse-glow, slide-up, fade-in, scale-in, accordion

---

## 7. API Katmani

[⬆ Semaya Don](#mimari-sema-interaktif)

### `client/src/lib/api.ts` — Merkezi API Istemcisi

~2950 satir, 60+ TypeScript arayuzu, 8 isim alani:

```
┌─────────────────────────────────────────────────────────────────┐
│                        api.ts                                    │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐              │
│  │ healthAPI  │  │  chatAPI   │  │supplementAPI │              │
│  │ 20+ metod  │  │  4 metod   │  │  4 metod     │              │
│  └────────────┘  └────────────┘  └──────────────┘              │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐              │
│  │communityAPI│  │ familyAPI  │  │ wearableAPI  │              │
│  │  4 metod   │  │  6 metod   │  │  5 metod     │              │
│  └────────────┘  └────────────┘  └──────────────┘              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │notificationAPI│  │   authAPI    │                             │
│  │  2 metod      │  │  3 metod     │                             │
│  └──────────────┘  └──────────────┘                             │
│                                                                  │
│  Hepsi → supabase.from('tablo').select/insert/update/delete     │
│       veya supabase.functions.invoke('edge-fonksiyon', {body})  │
└─────────────────────────────────────────────────────────────────┘
```

### healthAPI (En Buyuk Namespace)

| Metod | Aciklama |
|-------|----------|
| `getDailyLog()` | Gunun saglik kaydini getirir |
| `updateDailyLog(data)` | Gunluk kaydi gunceller |
| `getFoodEntries()` | Yemek girisleri listesi |
| `addFoodEntry(data)` | Yemek girisi ekler |
| `analyzeFood(base64)` | AI ile yemek analizi (Edge Function) |
| `getActivities(limit)` | Aktivite listesi |
| `addActivity(data)` | Aktivite kaydi |
| `getVoiceEntries()` | Ses kayitlari listesi |
| `addVoiceEntry(data)` | Ses kaydi ekler |
| `getDocuments()` | Dokumanlar listesi |
| `uploadDocument(data)` | Dokuman yukler |
| `getBloodTests()` | Kan testleri listesi |
| `uploadBloodTest(data)` | Kan testi yukler |
| `getStreak()` | Mevcut seriyi getirir |
| `checkInStreak()` | Seri check-in yapar |
| `getAchievements()` | Basarim listesi |
| `startFasting(plan)` | Oruc baslatir |
| `getActiveFasting()` | Aktif orucu getirir |
| `endFasting(id)` | Orucu bitirir |
| `getDailyLogRange(from, to)` | Tarih araliginda loglar |

### chatAPI

| Metod | Aciklama |
|-------|----------|
| `getConversations()` | Sohbet gecmisi |
| `createConversation(data)` | Yeni sohbet |
| `getMessages(conversationId)` | Mesajlar |
| `sendMessage(conversationId, text)` | Mesaj gonder (RAG Edge Function cagirir) |

### React Query Entegrasyonu (`queryKeys.ts`)

```typescript
queryKeys.health.foods()         → ['health', 'foods']
queryKeys.health.activities()    → ['health', 'activities']
queryKeys.health.dailyLog()      → ['health', 'daily-log']
queryKeys.chat.conversations()   → ['chat', 'conversations']
// ... 20+ anahtar fabrikasi

staleTime.static   = 5 dakika   (basarimlar, cihazlar)
staleTime.dynamic  = 30 saniye  (yemek, aktivite)
staleTime.realtime = 10 saniye  (gunluk kayit, oruc)
```

### `supabase.ts` — Supabase Istemcisi

```
Native (Capacitor):
  Depolama = Capacitor Preferences (SharedPreferences / NSUserDefaults)
  → Auth token'lari native platformda dogru sekilde kalici olur

Web (Tarayici):
  Depolama = localStorage (varsayilan)

Her ikisinde de:
  persistSession: true
  autoRefreshToken: true
```

---

## 8. Veritabani Semasi

[⬆ Semaya Don](#mimari-sema-interaktif)

### Tablo Iliskileri

```
profiles ─────────┬──────────────────────────────────────────────┐
  │                │                                              │
  ├── daily_health_logs        ├── conversations                  │
  ├── food_entries             │     └── chat_messages            │
  ├── activity_entries         ├── health_profiles                │
  ├── voice_entries            ├── community_posts                │
  ├── health_documents         ├── user_achievements              │
  ├── medical_photos           ├── user_streaks                   │
  ├── blood_tests              ├── user_goals                     │
  │     └── blood_test_results ├── user_devices                   │
  ├── fasting_logs             │     └── wearable_data            │
  ├── family_members           └── notification_settings          │
  │     └── family_medications                                    │
  │           └── family_medication_logs                           │
  │                                                               │
  │  (bagimsiz tablolar)                                          │
  ├── achievements (tanimlari)                                    │
  ├── wearable_devices (tanimlari)                                │
  ├── scientific_sources → scientific_source_chunks (pgvector)    │
  └── rag_query_logs                                              │
```

### Anahtar Tablolar

| Tablo | Sutunlar | Amac |
|-------|----------|------|
| `profiles` | id, email, display_name, date_of_birth, gender, height_cm, weight_kg, activity_level | Kullanici profili |
| `food_entries` | id, user_id, food_name, calories, protein/carbs/fat_grams, meal_type, source, ai_confidence | Yemek kayitlari |
| `activity_entries` | id, user_id, activity_type, duration_minutes, intensity, calories_burned | Aktivite kayitlari |
| `daily_health_logs` | id, user_id, date, water_ml, calories_consumed, protein_grams, sleep_minutes | Gunluk ozet |
| `voice_entries` | id, user_id, transcription, mode, ai_summary, mood, keywords, sentiment | Ses kayitlari |
| `fasting_logs` | id, user_id, fasting_plan, started_at, target_end_at, completed | Oruc kayitlari |
| `health_profiles` | id, user_id, bmi, bmr, tdee, health_score, risk_factors, nutrition_plan | AI saglik profili |
| `conversations` | id, user_id, title, topic | Sohbet gecmisi |
| `chat_messages` | id, conversation_id, role, content, citations, metadata | Chat mesajlari |
| `blood_tests` | id, user_id, lab_name, test_date, overall_status, ai_summary | Kan testleri |
| `scientific_source_chunks` | id, content, embedding(vector 1536), source_title, category, language | RAG bilgi bankasi |

### Migration Dosyalari (Sirasıyla)

| # | Dosya | Icerik |
|---|-------|--------|
| 1 | `202603110001_profiles.sql` | Profiller + auth.users tetikleyicisi |
| 2 | `202603110002_core_health.sql` | Gunluk log, yemek, aktivite tablolari |
| 3 | `202603110003_streak_achievements.sql` | Seri ve basarim sistemi |
| 4 | `202603110004_goals_community.sql` | Hedefler + topluluk |
| 5 | `202603110005_family_supplements.sql` | Aile takibi, ilaclar |
| 6 | `202603110006_health_profiles.sql` | AI saglik profilleri |
| 7 | `202603110007_chat.sql` | Sohbet gecmisi |
| 8 | `202603110008_analysis_assets.sql` | Ses, dokuman, kan testi, medikal foto |
| 9 | `202603110009_wearables.sql` | Giyilebilir cihazlar |
| 10 | `202603110010_fasting.sql` | Oruc kayitlari |
| 11 | `202603160001_rag_chunks.sql` | RAG vektör tablosu (pgvector) |
| 12 | `202603160002_add_source_url.sql` | source_url sutunu ekleme |
| 13 | `202603200001_rls_audit_fixes.sql` | RLS politikasi duzeltmeleri |
| 14 | `202603210001_supplement_tracking.sql` | Takviye takip ozellikleri |

### Row-Level Security (RLS)
Tum tablolarda RLS aktif. Kullanicilar yalnizca kendi verilerini okur/yazar:
```sql
CREATE POLICY "users_own_data" ON tablo_adi
  FOR ALL USING (auth.uid() = user_id);
```

---

## 9. Edge Functions — Sunucu Fonksiyonlari

[⬆ Semaya Don](#mimari-sema-interaktif)

3 Edge Function, Deno runtime uzerinde calisir:

```
supabase/functions/
  ├── analyze-health-data/index.ts     → Coklu AI analiz
  ├── generate-chat-response/index.ts  → RAG chatbot
  │   └── lib/
  │       ├── context.ts               → Kullanici saglik baglami
  │       ├── prompt.ts                → LLM sistem promptu
  │       ├── retrieval.ts             → pgvector anlamsal arama
  │       ├── safety.ts                → Acil durum tespiti
  │       └── topic.ts                 → Sorgu konu siniflandirmasi
  └── generate-health-profile/index.ts → AI saglik profili
```

### analyze-health-data — Coklu Analiz Motoru

6 analiz tipi:

| Tip | Girdi | Cikti |
|-----|-------|-------|
| `food-image` | Base64 foto | yemekAdi, kalori, makrolar, guven |
| `blood-test` | OCR metni | markerlar, AI ozeti, genel durum |
| `document` | Dokuman metni | ozet, etiketler, oneriler |
| `medical-photo` | Base64 foto | tip, gozlemler, endiseler |
| `voice-entry` | Transkripsiyon | ruh hali, anahtar kelimeler, ozet |
| `voice-food` | Transkripsiyon | yemekler[], toplamKalori |

- 45 saniye zaman asimi
- Auth zorunlu (`verify_jwt=true`)
- OpenAI anahtari yoksa placeholder veri doner

### generate-chat-response — RAG Chatbot

**7 Adimli Pipeline:**

```
1. CORS + Auth dogrulamasi
     ↓
2. Guvenlik kontrolu (acil anahtar kelimeler)
   "gogus agrisi", "intihar" → acil uyari + 112/182
     ↓
3. Konu siniflandirmasi
   beslenme / egzersiz / uyku / takviye / kan_testi / ruh_sagligi / oruc / genel
     ↓
4. Kullanici baglami olusturma (10 paralel DB sorgusu)
   profil, saglik profili, yemek, gunluk log, aktivite,
   kan testleri, giyilebilir, oruc, ses, dokuman
     ↓
5. Anlamsal alma (pgvector)
   sorgu → text-embedding-3-small → vektör
   → cosine similarity arama (esik 0.35, maks 8 sonuc)
     ↓
6. Sistem promptu birlestirme
   Rol + guvenlik kurallari + kullanici baglami + kaynaklar + konu ipucu
     ↓
7. GPT-4o cagri
   → JSON: {content, citations[], suggestedFollowUps[], contextUsed[]}
   → rag_query_logs tablosuna kayit
```

### generate-health-profile — Saglik Profili Uretici

**Girdi:** Kullanici profili + 7 gunluk saglik verisi
**Cikti:**
- Fiziksel metrikler: BMI, BMR, TDEE, vucut yag tahmini
- Saglik skoru: 0-100, risk faktorleri, guclu yanlar
- Beslenme plani: gunluk kalori, makro dagılımı, ogun onerileri
- Egzersiz plani: haftalik hedef, onerilen aktiviteler
- Uyku onerisi
- Takviye onerileri: [{isim, neden, doz, oncelik}]
- AI ozet paragraf

---

## 10. RAG Sistemi & Yapay Zeka

[⬆ Semaya Don](#mimari-sema-interaktif)

### RAG Pipeline'i

```
  ┌──────────────────────────────────────────────────────────┐
  │              BILGI BANKASI OLUSTURMA (tek sefer)          │
  │                                                           │
  │  Bilimsel Kaynaklar (PubMed, WHO, vb.)                   │
  │       ↓                                                   │
  │  scripts/rag/seed-sources.ts → Kaynak tanimlari          │
  │       ↓                                                   │
  │  scripts/rag/ingest-urls.ts                               │
  │       ↓                                                   │
  │  URL'leri al → Parcala → Gom (text-embedding-3-small)    │
  │       ↓                                                   │
  │  scientific_source_chunks tablosu (pgvector 1536-boyut)  │
  └──────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────┐
  │              SORGU ZAMANI (her sohbet mesaji)             │
  │                                                           │
  │  Kullanici: "D vitamini almali miyim?"                   │
  │       ↓                                                   │
  │  text-embedding-3-small → Sorgu vektoru                  │
  │       ↓                                                   │
  │  match_source_chunks RPC → Kosinüs benzerlik arama      │
  │       ↓          (esik: 0.35, maks: 8 sonuc)            │
  │  Ilgili bilimsel parcalar + alinti bilgisi               │
  │       ↓                                                   │
  │  Kullanici saglık baglami (10 paralel sorgu)             │
  │       ↓                                                   │
  │  Sistem promptu = Rol + Kurallar + Baglam + Kaynaklar   │
  │       ↓                                                   │
  │  GPT-4o → Kisisellestirilmis, kaynakli, guvenli yanit   │
  └──────────────────────────────────────────────────────────┘
```

### RAG Kutuphanesi Modulleri

| Modul | Dosya | Islem |
|-------|-------|-------|
| **Retrieval** | `lib/retrieval.ts` | OpenAI ile sorgu gomme, pgvector'da kosinüs benzerlik arama |
| **Context** | `lib/context.ts` | 10 paralel Supabase sorgusu → kullanici saglik baglami |
| **Safety** | `lib/safety.ts` | 7 acil durum kategorisi (kardiyak, solunum, bayilma, ruh sagligi, kanama, anafilaksi, zehirlenme) |
| **Topic** | `lib/topic.ts` | Anahtar kelime tabanli konu siniflandirmasi (7 saglik konusu + genel) |
| **Prompt** | `lib/prompt.ts` | Rol tanimi + 9 guvenlik kurali + baglam + kaynaklar + JSON cikti formati |

### Guvenlik Kurallari (Chat Promptunda)
1. Asla teshis koymaz, her zaman profesyonel danisma onerir
2. Kaynaklari [1], [2] formatiyla belirtir
3. Kullanicinin dilinde yanitlar (Turkce/Ingilizce)
4. Empatik ama kanita dayali olur
5. Acil durumlarda 112, 114, 182 numaralarini paylaşır

---

## 11. Dil Sistemi (i18n)

[⬆ Semaya Don](#mimari-sema-interaktif)

### Calisma Sekli

```
LanguageContext.tsx
  │
  ├── translations.en = { anahtar1: 'English text', ... }  (900+ anahtar)
  ├── translations.tr = { anahtar1: 'Turkce metin', ... }  (900+ anahtar)
  │
  │   TypeScript her iki nesnenin ayni anahtarlara sahip olmasini garanti eder
  │
  └── useLanguage() hook'u:
        t        → tip-guvenli ceviri nesnesi
        language → 'en' | 'tr'
        locale   → 'en-US' | 'tr-TR'
        setLanguage → dil degistirme fonksiyonu
```

### Kullanim Ornegi
```typescript
const { t, locale } = useLanguage();
<h1>{t.bloodTest}</h1>
{new Date().toLocaleDateString(locale)}
```

### Satir Ici Ceviri Kalıbı
Bazi bilesenler dile gore dizi secerler:
```typescript
// DailyTip.tsx
const ipuclari = {
  en: ["Don't forget to drink water!", ...],
  tr: ["Su icmeyi unutmayin!", ...],
};
const aktifIpuclari = ipuclari[language];
```

### Kurallar
- "Myora" ve "My Score" her iki dilde Ingilizce kalir
- Tum kullaniciya gorunen metinler `t.xxx` kullanmalidir
- Locale-duyarli API'ler (toLocaleDateString, vb.) `locale` degerini kullanmalidir

---

## 12. Validasyon Katmani

[⬆ Semaya Don](#mimari-sema-interaktif)

Zod semalari + react-hook-form + @hookform/resolvers/zod

### `validations/auth.ts`

| Sema | Alanlar |
|------|---------|
| `signInSchema` | email: gecerli format, password: min 6 |
| `signUpSchema` | email: gecerli, password: min 6 + harf+rakam, confirmPassword: eslesme |

### `validations/forms.ts`

| Sema | Alanlar |
|------|---------|
| `addFamilyMemberSchema` | name: min 2, relationship: enum |
| `addMedicationSchema` | name: min 2, dosage: min 1, frequency: enum, scheduleTime |
| `bloodTestUploadSchema` | ocrText: min 10, labName: opsiyonel, testDate: opsiyonel |
| `communityPostSchema` | content: min 3, title: opsiyonel, category: opsiyonel enum |
| `activityLogSchema` | activityType: zorunlu, durationMinutes: min 1, intensity: enum |

---

## 13. Servisler

[⬆ Semaya Don](#mimari-sema-interaktif)

### NotificationService.ts — Akilli Bildirim Motoru

```
Platform tespiti: Capacitor native → LocalNotifications plugin
                  Web → Notification API

Zamanlama Takvimi:
  08:00  Sabah su hatirlitcisi
  12:30  Ogle yemegi kayit hatirlitcisi
  15:00  Ogleden sonra su + aktivite kontrolu
  18:00  Aksam yemegi kayit hatirlitcisi
  21:30  Gunluk ozet
  22:30  Uyku hatirlitcisi
  20:00  Seri hatirlatici (seri > 0 ise)
  Pzt 09:00  Haftalik ozet
  Sabah + Aksam  Takviye hatirlaticilari

Tum mesajlar Turkce, saglik emojileri ile
```

### NativeWidgetService.ts — Android Widget Yonetimi
- Capacitor Preferences'da widget yapilandirmalarini saklar
- Widget tipleri: protein takipci, su takipci
- Metodlar: addWidget, removeWidget, updateWidget, loadWidgets

---

## 14. Yapilandirma Dosyalari

[⬆ Semaya Don](#mimari-sema-interaktif)

### `vite.config.ts`
- SWC ile React plugin'i (hizli transpilasyon)
- Ozel plugin: `crossorigin` niteligi kaldırır (Capacitor WebView uyumlulugu)
- Yol takma adlari: `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`
- Derleme ciktisi: `dist/public/`
- Manuel chunk bolmeleri:
  - `vendor-react`, `vendor-query`, `vendor-supabase`, `vendor-ui`
  - `vendor-capacitor`, `vendor-icons`, `vendor-forms`, `vendor-utils`

### `tailwind.config.ts`
- Karanlik mod: sinif tabanli
- Ozel renkler + makro renkleri + animasyonlar
- Container: maks-genislik 1400px

### `tsconfig.json`
- Hedef: ES2020, Siki mod, JSX: react-jsx
- Yol takma adlari vite.config.ts ile eslesir

### `package.json` Anahtar Bagimliliklar
| Paket | Versiyon | Amac |
|-------|----------|------|
| react | 18.3.1 | UI framework |
| react-router | 6.30.1 | Istemci yonlendirme |
| vite | 5.4.19 | Derleme araci |
| typescript | 5.8.3 | Tip guvenligi |
| @tanstack/react-query | 5.83.0 | Sunucu state yonetimi |
| @supabase/supabase-js | 2.99.1 | Backend istemci |
| @capacitor/core | 7.5.0 | Native mobil sarmalayici |
| recharts | 2.15.4 | Grafik kutuphanesi |
| react-hook-form | 7.71.2 | Form yonetimi |
| zod | 3.25.76 | Sema dogrulamasi |
| lucide-react | 0.462.0 | Ikon kutuphanesi |

---

## 15. Proje Dosya Agaci

[⬆ Semaya Don](#mimari-sema-interaktif)

```
wellness-vision-coach/
├── android/                          # Android Capacitor projesi
│   └── app/src/main/java/com/myora/app/
│       └── MainActivity.java         # WebView yapilandirmasi
├── client/                           # React SPA frontend
│   └── src/
│       ├── components/               # 38 ozellik bileseni
│       │   ├── charts/               # Tembel yuklenmis grafik sarmalayicilari
│       │   └── ui/                   # 54 shadcn/ui bileseni
│       ├── contexts/                 # Auth, HealthData, Language
│       ├── hooks/                    # useHealthData, useTabNavigate, vb.
│       ├── lib/                      # Cekirdek yardimcilar
│       │   ├── validations/          # Zod semalari
│       │   ├── api.ts                # Ana API istemcisi (~2950 satir)
│       │   ├── api-types.ts          # TypeScript tip tanimlari
│       │   ├── supabase.ts           # Supabase istemci + depolama adaptoru
│       │   ├── queryKeys.ts          # React Query anahtar fabrikasi
│       │   ├── platform.ts           # Platform tespiti
│       │   └── utils.ts              # Genel yardimcilar
│       ├── pages/                    # Ust duzey rota kabukları
│       │   ├── AppLayout.tsx         # Ana kabuk + BottomNav
│       │   ├── Auth.tsx              # Giris/kayit
│       │   ├── Onboarding.tsx        # Ilk kullanim
│       │   └── NotFound.tsx          # 404
│       ├── services/                 # Platform servisleri
│       │   ├── NotificationService.ts
│       │   └── NativeWidgetService.ts
│       ├── types/                    # Tip tanimlari
│       ├── App.tsx                   # Kok + yonlendirme + provider'lar
│       └── main.tsx                  # Giris noktasi
├── docs/                             # Dokumantasyon
├── scripts/rag/                      # RAG pipeline betikleri
│   ├── seed-sources.ts               # Bilimsel kaynak tanimlari
│   └── ingest-urls.ts                # URL cekme + gomme
├── supabase/                         # Supabase backend
│   ├── functions/                    # 3 Edge Function (Deno)
│   │   ├── analyze-health-data/      # Coklu AI analiz
│   │   ├── generate-chat-response/   # RAG chatbot
│   │   │   └── lib/                  # context, prompt, retrieval, safety, topic
│   │   └── generate-health-profile/  # AI saglik profili
│   └── migrations/                   # 14 SQL migration dosyasi
├── capacitor.config.ts               # Capacitor yapilandirmasi
├── vite.config.ts                    # Vite derleme yapilandirmasi
├── tailwind.config.ts                # Tailwind CSS yapilandirmasi
├── tsconfig.json                     # TypeScript yapilandirmasi
└── package.json                      # Bagimliliklar ve betikler
```

---

## Veri Akis Diyagramlari

[⬆ Semaya Don](#mimari-sema-interaktif)

### Kimlik Dogrulama Akisi

```
Kullanici uygulamayi acar
  → main.tsx → App.tsx render eder
  → AuthProvider: supabase.auth.getSession() kontrol eder
  → Oturum yoksa: Auth sayfasi (giris/kayit)
  → Oturum varsa: profiles tablosundan profil getirir
  → ProtectedRoute erisimine izin verir → AppLayout
  → HealthDataProvider tum saglik verilerini yukler
  → HealthDashboard render olur
```

### Yemek Analizi Akisi

```
Kullanici FoodCapture'da foto ceker
  → Capacitor Camera (native) veya getUserMedia (web)
  → Base64 → healthAPI.analyzeFood()
  → Edge Function: analyze-health-data (tip: food-image)
  → GPT-4o Vision fotoyu analiz eder
  → Donus: yemekAdi, kalori, makrolar, guven
  → Kullanici onaylar → healthAPI.addFoodEntry()
  → food_entries tablosuna eklenir
  → React Query onbellegi gecersizlenir
  → Dashboard kalori toplamlari guncellenir
```

### AI Sohbet Akisi

```
Kullanici ExpertChat'te mesaj yazar
  → chatAPI.sendMessage(conversationId, text)
  → Edge Function: generate-chat-response
     1. Guvenlik kontrolu (acil anahtar kelimeler)
     2. Konu sinifla
     3. Kullanici baglami olustur (10 paralel sorgu)
     4. Sorguyu gom → pgvector anlamsal arama
     5. Sistem promptu birlestur
     6. GPT-4o yanit uretir (alintili)
     7. chat_messages tablosuna kaydet
  → Yanit alinti + takip onerileri ile gelir
  → ExpertChat mesaji kaynak rozetleriyle render eder
```

---

> **Not:** Bu dokuman, kodun tamamini kapsayan bir rehberdir. Her bolum bagimsiz okunabilir. Semadaki kutuların baglantilari ilgili detayli aciklamalara yonlendirir.
