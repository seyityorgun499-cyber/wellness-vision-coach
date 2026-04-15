# Dosya Dosya Kod Aciklamasi

> Her dosyadaki kodlar satirla satirla, blok blok aciklanmistir.
> Sunumda "bu satirda ne oluyor?" sorusuna cevap verebileceksin.

---

## Icindekiler

1. [main.tsx — Giris Noktasi](#1-maintsx--giris-noktasi)
2. [App.tsx — Rota ve Provider'lar](#2-apptsx--rota-ve-providerlar)
3. [AppLayout.tsx — Ana Uygulama Kabugu](#3-applayouttsx--ana-uygulama-kabugu)
4. [supabase.ts — Veritabani Baglantisi](#4-supabasers--veritabani-baglantisi)
5. [platform.ts — Platform Tespiti](#5-platformts--platform-tespiti)
6. [utils.ts — Yardimci Fonksiyonlar](#6-utilsts--yardimci-fonksiyonlar)
7. [queryKeys.ts — Onbellek Anahtarlari](#7-querykeysts--onbellek-anahtarlari)
8. [routes.ts — Rota Sabitleri](#8-routests--rota-sabitleri)
9. [AuthContext.tsx — Kimlik Dogrulama](#9-authcontexttsx--kimlik-dogrulama)
10. [LanguageContext.tsx — Dil Sistemi](#10-languagecontexttsx--dil-sistemi)
11. [HealthDataContext.tsx — Saglik Verileri](#11-healthdatacontexttsx--saglik-verileri)
12. [useTabNavigate.ts — Sekme Navigasyonu](#12-usetabnavigatets--sekme-navigasyonu)
13. [useKeyboard.ts — Klavye Tespiti](#13-usekeyboardts--klavye-tespiti)
14. [api.ts — API Istemcisi](#14-apits--api-istemcisi)
15. [Validasyon Dosyalari](#15-validasyon-dosyalari)
16. [NotificationService.ts — Bildirim Servisi](#16-notificationservicets--bildirim-servisi)
17. [NativeWidgetService.ts — Widget Servisi](#17-nativewidgetservicets--widget-servisi)
18. [analyze-health-data — AI Analiz](#18-analyze-health-data--ai-analiz-edge-function)
19. [generate-health-profile — Saglik Profili](#19-generate-health-profile--saglik-profili-edge-function)
20. [generate-chat-response — RAG Chatbot](#20-generate-chat-response--rag-chatbot-edge-function)
21. [RAG Alt Modulleri](#21-rag-alt-modulleri)

---

## 1. main.tsx — Giris Noktasi

**Dosya:** `client/src/main.tsx` | **Uzunluk:** 44 satir | **Amac:** Uygulamayi DOM'a baglamak

```
SATIR 1-5: Kutuphaneleri ice aktar
  - createRoot: React'in "sayfaya baglanma" fonksiyonu
  - Component, ReactNode, ErrorInfo: TypeScript tipleri
  - App: Ana uygulama bileseni
  - index.css: Global stiller (Tailwind dahil)
  - ThemeProvider: Karanlik/aydinlik tema yonetimi
```

```
SATIR 7-30: ErrorBoundary sinifi
  NE YAPAR: Uygulamada ciddi bir hata olursa (bilesen coktugunde)
  ekrana kirmizi hata mesaji gosterir.

  - constructor: Baslangic durumu ayarlar (hasError: false)
  - getDerivedStateFromError: Hata olunca durumu gunceller
  - componentDidCatch: Hatayi konsola yazdirir
  - render: Hata varsa kirmizi mesaj goster, yoksa cocuklari goster
```

```
SATIR 32-44: Uygulamayi bagla
  - document.getElementById("root"): HTML'deki <div id="root"> elementini bul
  - createRoot: Bu elemente React'i bagla
  - render: Uygulamayi ciz
  - Siralama: ErrorBoundary → ThemeProvider → App
  - try/catch: Baglama islemi bile basarisiz olursa ham HTML olarak hata goster
```

**OZETLE:** Bu dosya uygulamanin tek giris noktasidir. Tarayici bu dosyayi calistirir, React baslar, ve tum uygulama `<div id="root">` icinde cizilir.

---

## 2. App.tsx — Rota ve Provider'lar

**Dosya:** `client/src/App.tsx` | **Uzunluk:** 111 satir | **Amac:** Rotalari tanimla + provider zincirini kur

```
SATIR 1-11: Ice aktarmalar
  - Toaster, Sonner: Ekranda kisa bildirim mesajlari (toast)
  - TooltipProvider: Fareyle ustune gelince bilgi gosteren ipucu sistemi
  - QueryClient, QueryClientProvider: React Query (sunucu verisi yonetimi)
  - BrowserRouter, HashRouter: URL yonlendirme
  - Capacitor: Mobil platform tespiti
  - AuthProvider, LanguageProvider: Oturum ve dil context'leri
  - ProtectedRoute: Giris yapmamis kullaniciyi /auth'a yonlendiren koruma
  - lazy, Suspense: Tembel yukleme
  - ROUTES: Rota yol sabitleri
```

```
SATIR 13-39: Tembel yuklenen bilesenler
  HER SATIR SU KALIPTADIR:
  const BilesenAdi = lazy(() => import("dosya/yolu").then(m => ({ default: m.BilesenAdi })));

  NE YAPAR: Bilesen "import" edildiginde yuklenir, oncesinde yuklenmez.
  ".then(m => ...)" kismi: Dosyadan belirli bir export'u cikartir.

  Toplam 20+ bilesen tembel yuklenir:
  AppLayout, Auth, Onboarding, NotFound, HealthDashboard, AllLogger,
  Boost, AnalysisHub, FoodCapture, VoiceLogger, DocumentUpload,
  ActivityLogger, IntervalFasting, Analytics, WidgetCreator,
  WearableDevices, WearableDataDashboard, ExpertChat,
  NotificationSettings, UserProfile, Community, FamilyTracking,
  SupplementStore, BloodTestAnalysis, HealthProfile
```

```
SATIR 41-52: React Query yapilandirmasi
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,              // Veri 30 saniye "taze" sayilir
        retry: 1,                        // Hata olursa 1 kez daha dene
        refetchOnWindowFocus: false,     // Sekme degisiminde cekmeyse
      },
      mutations: {
        retry: 0,                        // Yazma islemlerini tekrar deneme
      },
    },
  });
```

```
SATIR 53-57: Platform tespiti ve router secimi
  isNativeWebView = Capacitor.isNativePlatform() VEYA file:// VEYA capacitor://
  Eger mobilse → HashRouter kullan (URL: /#/profile)
  Eger webse → BrowserRouter kullan (URL: /profile)
```

```
SATIR 59-63: Yukleme animasyonu
  PageFallback: Tembel bilesen yuklenirken ekranda donen daire gosterir.
```

```
SATIR 65-108: Ana App bileseni
  DIS → IC SIRA:
  1. QueryClientProvider → React Query'yi tum uygulamaya sagla
  2. TooltipProvider → Tooltip sistemini ac
  3. LanguageProvider → Dil ceviri verilerini sagla
  4. AuthProvider → Oturum verilerini sagla
  5. Toaster + Sonner → Bildirim UI bilesenleri
  6. Router → URL yonlendirme baslat
  7. Suspense → Tembel bilesenleri yuklerken fallback goster
  8. Routes → Rota eslemelerini tanimla

  ROTA YAPISI:
  /auth → Giris sayfasi (korumasiz)
  /onboarding → Ilk kullanim (ProtectedRoute ile korumali)
  / → AppLayout (korumali, ic rotalari sarar)
    ├── index → HealthDashboard (ana sayfa)
    ├── log → AllLogger
    ├── boost → Boost
    ├── camera → FoodCapture
    ├── voice → VoiceLogger
    ├── chat → ExpertChat
    ├── profile → UserProfile
    └── ... (20+ alt rota)
  * → NotFound (eslesmeyen tum URL'ler)
```

---

## 3. AppLayout.tsx — Ana Uygulama Kabugu

**Dosya:** `client/src/pages/AppLayout.tsx` | **Uzunluk:** 169 satir

```
SATIR 1-19: Ice aktarmalar
  - useState, useEffect, useCallback: React hook'lari
  - Outlet, useNavigate, useLocation: Router araclari
  - Capacitor, App: Mobil platform erisimi
  - useKeyboard: Klavye acik/kapali hook'u
  - Camera, Mic, FileText, Activity, Plus: Ikon bilesenleri (lucide-react)
  - HealthDataProvider: Saglik verisi context'i
  - BottomNavigation: Alt navigasyon bileseni
  - Sheet, Button: shadcn/ui bilesenleri
```

```
SATIR 21: Izin verilen deep link host'lari
  ALLOWED_HOSTS = ['myora.app', 'localhost']
  Guvenlik icin: sadece bu domainlerden gelen deep link'ler kabul edilir.
```

```
SATIR 23-30: State ve hook'lar
  - t: Ceviri metinleri (Turkce/Ingilizce)
  - activeTab: Aktif sekme (URL'den okunur)
  - tabNavigate: Sekme navigasyon fonksiyonu
  - navigate: React Router navigasyon
  - location: Mevcut URL bilgisi
  - isQuickAddOpen: Hizli-ekleme menusunun acik/kapali durumu
  - isKeyboardOpen: Mobil klavyenin acik/kapali durumu
```

```
SATIR 33-51: Deep link guvenlik isleyicisi
  useEffect → sadece native platformda calisir

  AKIS:
  1. Capacitor 'appUrlOpen' olayini dinle
  2. URL'yi parse et (new URL ile)
  3. Hostname'i kontrol et (ALLOWED_HOSTS'da mi?)
  4. Gecerli degilse → uyari logla, islem yapma
  5. Gecerliyse → pathname'e navigate et

  NEDEN: Kotu niyetli bir link uygulamanin icinde keyfi sayfalar acmasin diye.
```

```
SATIR 54-77: Android geri butonu isleyicisi
  useEffect → sadece native platformda calisir

  AKIS:
  1. Hizli-ekleme aciksa → kapat, geri gitme
  2. Ana sayfadaysa (pathname === '/') → "Cikmak istediginize emin misiniz?" diyalogu
     - Evet → App.exitApp() ile uygulamadan cik
  3. Baska sayfadaysa → navigate(-1) ile bir onceki sayfaya don
```

```
SATIR 79-85: Sekme degisim isleyicisi
  Kullanici alt navigasyondan bir sekmeye tiklarsa:
  - "add" sekmesi → hizli-ekleme menusunu ac
  - Diger sekmeler → ilgili sayfaya navigate et
```

```
SATIR 87-112: Hizli-ekleme secenekleri
  4 secenek dizisi:
  1. camera → "Yemek Tara" (Camera ikonu)
  2. voice → "Sesli Kayit" (Mic ikonu)
  3. docs → "Dokuman Yukle" (FileText ikonu)
  4. activity → "Aktivite Kaydet" (Activity ikonu)
  Her birinin id, baslik, aciklama ve ikonu var.
```

```
SATIR 114-166: JSX ciktisi (ekranda gorunen kisim)
  YAPI:
  <HealthDataProvider>             ← Saglik verilerini sagla
    <div>
      <Outlet />                   ← Aktif sayfanin icerigi burada gosterilir
      {klavyeKapaliysa && <BottomNavigation />}  ← Alt 5 sekme
      <Sheet>                      ← Hizli-ekleme paneli
        <SheetContent>
          4 buton (kamera, ses, dokuman, aktivite)
          Her buton tiklandiginda:
            1. Paneli kapat
            2. Ilgili sayfaya navigate et
        </SheetContent>
      </Sheet>
    </div>
  </HealthDataProvider>
```

---

## 4. supabase.ts — Veritabani Baglantisi

**Dosya:** `client/src/lib/supabase.ts` | **Uzunluk:** 47 satir

```
SATIR 1-3: Kutuphaneleri ice aktar
  - createClient: Supabase baglanti fonksiyonu
  - Capacitor: Platform tespiti
  - Preferences: Veri saklama (Android: SharedPreferences, iOS: NSUserDefaults)
```

```
SATIR 5-10: Ortam degiskenleri
  VITE_SUPABASE_URL → Supabase projesinin URL'i
  VITE_SUPABASE_PUBLISHABLE_KEY → Herkese acik API anahtari
  Ikisi de .env dosyasindan okunur. Yoksa hata firlatilir.
```

```
SATIR 19-30: Capacitor depolama adaptoru
  NE YAPAR: Native platformlarda auth token'lari telefonun guvenli deposuna kaydeder.

  getItem → Preferences.get({ key })    // Veri oku
  setItem → Preferences.set({ key })    // Veri yaz
  removeItem → Preferences.remove({ key }) // Veri sil

  NEDEN: WebView icindeki localStorage guvenilmez olabilir.
  SharedPreferences/NSUserDefaults daha guvenli ve kalici.
```

```
SATIR 32-46: Supabase istemci olusturma
  createClient(url, anahtar, {
    auth: {
      persistSession: true,          // Oturumu kalici yap (uygulama kapatilinca kaybolmasin)
      autoRefreshToken: true,        // JWT suresi dolunca otomatik yenile
      detectSessionInUrl: !isNative, // Web'de URL'deki token'i oku, native'de yapma
      storage: isNative ? capacitorStorage : (localStorage — varsayilan)
      lock: isNative ? basit kilit   // Native'de kilit mekanizmasini basitlestir
    }
  })

  SONUC: supabase nesnesi tum uygulamada kullanilir:
  - supabase.from('tablo').select()
  - supabase.auth.signIn()
  - supabase.functions.invoke()
```

---

## 5. platform.ts — Platform Tespiti

**Dosya:** `client/src/lib/platform.ts` | **Uzunluk:** 8 satir

```typescript
export const platform = {
  isNative: Capacitor.isNativePlatform(),  // Android/iOS ise true
  isAndroid: Capacitor.getPlatform() === 'android',
  isIOS: Capacitor.getPlatform() === 'ios',
  isWeb: !Capacitor.isNativePlatform(),     // Tarayici ise true
} as const;  // "as const" = bu degerler degistirilemez
```

**KULLANIM:** Platforme gore farkli davranislar icin:
```typescript
if (platform.isAndroid) { /* Android'e ozel kod */ }
```

---

## 6. utils.ts — Yardimci Fonksiyonlar

**Dosya:** `client/src/lib/utils.ts` | **Uzunluk:** 6 satir

```typescript
import { clsx, type ClassValue } from "clsx"   // Kosullu sinif birlestirici
import { twMerge } from "tailwind-merge"        // Tailwind sinif catismasi cozucu

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**NE YAPAR:** Birden fazla CSS sinifini birlestirirken catismalari cozer:
```typescript
cn("p-4 p-2")           // → "p-2" (sonraki kazanir)
cn("text-red", kosul && "text-blue")  // Kosul dogruysa "text-blue"
```

---

## 7. queryKeys.ts — Onbellek Anahtarlari

**Dosya:** `client/src/lib/queryKeys.ts` | **Uzunluk:** 61 satir

```
SATIR 1-54: queryKeys nesnesi
  Her alan icin fabrika fonksiyonlari:

  health:
    dailyLog(tarih) → ['health', 'daily-log', tarih]  // Gunluk saglik kaydi
    foods()         → ['health', 'foods']              // Yemek listesi
    activities()    → ['health', 'activities']          // Aktiviteler
    voices()        → ['health', 'voices']              // Ses kayitlari
    fasting()       → ['health', 'fasting']             // Oruc durumu
    bloodTests()    → ['health', 'blood-tests']         // Kan testleri
    achievements()  → ['health', 'achievements']        // Basarimlar

  chat:
    conversations() → ['chat', 'conversations']
    messages(id)    → ['chat', 'messages', id]

  supplements, community, family, wearable, user: benzer yapi

  NEDEN: React Query verileri bu anahtarlarla onbellekler.
  Ayni anahtarla cagrildiktan sonra tekrar API'ye gitmez (staleTime suresince).
```

```
SATIR 56-60: Bayatlama sureleri
  static:   5 dakika = 300000 ms  (nadir degisen veriler)
  dynamic:  30 saniye = 30000 ms  (sik degisen veriler)
  realtime: 10 saniye = 10000 ms  (neredeyse anlik veriler)
```

---

## 8. routes.ts — Rota Sabitleri

**Dosya:** `client/src/types/routes.ts` | **Uzunluk:** 29 satir

```typescript
export const ROUTES = {
  AUTH: '/auth',                 // Giris sayfasi
  ONBOARDING: '/onboarding',    // Ilk kullanim
  HOME: '/',                     // Ana sayfa
  LOG: '/log',                   // Kayit sayfasi
  BOOST: '/boost',               // Oyunlastirma
  CAMERA: '/camera',             // Yemek tarama
  VOICE: '/voice',               // Sesli kayit
  CHAT: '/chat',                 // AI sohbet
  PROFILE: '/profile',           // Profil
  // ... toplam 22 rota
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
// RoutePath tipi: '/auth' | '/onboarding' | '/' | '/log' | ...
// TypeScript sadece gecerli rota yollarini kabul eder
```

---

## 9. AuthContext.tsx — Kimlik Dogrulama

**Dosya:** `client/src/contexts/AuthContext.tsx` | **Uzunluk:** 283 satir

```
SATIR 6-13: withTimeout yardimci fonksiyonu
  NE YAPAR: Bir isleme zaman siniri koyar.
  Ornek: 10 saniye icinde cevap gelmezse hata firlatir.

  Promise.race([
    gercekIslem,              // Asil islem
    10snSonraHata             // Zaman asimi
  ]);
  // Hangisi once biterse o gecerli olur
```

```
SATIR 15-27: User arayuzu (interface)
  Kullanici verisinin sekli:
  - id, email: zorunlu
  - displayName, dateOfBirth, gender, heightCm, weightKg: opsiyonel
  - activityLevel, language, timezone, onboardingCompleted, avatarUrl: opsiyonel
```

```
SATIR 39-46: AuthContext olusturma
  Varsayilan degerler: user=null, loading=true
  Tum fonksiyonlar bos (gercek degerler Provider'da saglanir)
```

```
SATIR 48-54: useAuth hook'u
  Context'i tuketmek icin hook.
  AuthProvider disinda kullanilirsa hata firlatir.
```

```
SATIR 56-58: AuthProvider — state tanimlari
  user: Giris yapmis kullanici bilgisi (veya null)
  loading: Ilk oturum kontrolu devam ediyor mu?
```

```
SATIR 60-73: mapUser fonksiyonu
  NE YAPAR: Supabase'den gelen auth kullanicisini + profil verisini birlestirip
  bizim User arayuzumuze donusturur.

  Supabase snake_case kullanir (display_name), biz camelCase kullaniyoruz (displayName).
  Bu fonksiyon cevirme islemi yapar.
```

```
SATIR 75-97: fetchProfile fonksiyonu
  NE YAPAR: Veritabanindan kullanicinin profil satırını getirir.

  AKIS:
  1. profiles tablosundan id'ye gore tek satir getir (10sn timeout)
  2. Hata varsa → auth verisini kullan (profil olmadan da devam et)
  3. Basariliysa → auth + profil verisiyle User olustur
```

```
SATIR 99-109: ensureProfile fonksiyonu
  NE YAPAR: Kayit olunca profiles tablosuna satir ekler/gunceller.
  upsert: Satir varsa guncelle, yoksa olustur.
  onConflict: 'id' → id cakisirsa guncelle.
```

```
SATIR 131-198: useEffect — Uygulama basladiginda oturum kontrolu
  AKIS:
  1. supabase.auth.getSession() → Mevcut oturum var mi?
  2. Varsa → profil getir, state guncelle
  3. Yoksa → user = null, loading = false

  4. supabase.auth.onAuthStateChange() dinleyici kur:
     - SIGNED_OUT → user temizle
     - SIGNED_IN / TOKEN_REFRESHED → profil getir
     - Token yenileme basarisizsa → cikis yap

  5. Cleanup: Bilesen kaldirilinca dinleyiciyi temizle
```

```
SATIR 200-262: signUp, signIn, signOut fonksiyonlari
  signUp(email, sifre, isim):
    1. supabase.auth.signUp() → Kullanici olustur
    2. ensureProfile() → Profil satiri ekle
    3. fetchProfile() → State'i guncelle

  signIn(email, sifre):
    1. supabase.auth.signInWithPassword()
    2. fetchProfile()

  signOut():
    1. supabase.auth.signOut()
    2. user = null
```

```
SATIR 277-282: Provider render
  <AuthContext.Provider value={user, loading, signUp, signIn, signOut, refreshUser}>
    {children}
  </AuthContext.Provider>
  // Tum alt bilesenler useAuth() ile bu degerlere erisebilir
```

---

## 10. LanguageContext.tsx — Dil Sistemi

**Dosya:** `client/src/contexts/LanguageContext.tsx` | **Uzunluk:** ~900+ satir

```
SATIR 1-2: Tip tanimlari
  Language = 'en' | 'tr'  // Sadece iki dil destekleniyor

SATIR 5-...: translations nesnesi
  en: { foodAnalysis: 'Food Analysis', protein: 'Protein', ... }  // 900+ anahtar
  tr: { foodAnalysis: 'Besin Analizi', protein: 'Protein', ... }  // 900+ anahtar

  TypeScript her iki nesnein AYNI anahtarlara sahip olmasini zorunlu kilar.
  "en"'e yeni anahtar eklersen "tr"'ye de eklemek ZORUNDASIN, yoksa hata verir.

PROVIDER KISMI:
  - language state'i localStorage'dan okunur (sayfa yenilenince hatirlenir)
  - setLanguage → dili degistirir + localStorage'a kaydeder
  - t → secili dilin ceviri nesnesi (t.protein = "Protein")
  - locale → tarih/sayi formatlama icin ('en-US' veya 'tr-TR')

KULLANIM:
  const { t, locale } = useLanguage();
  <h1>{t.bloodTest}</h1>  // Turkce: "Kan Testi", Ingilizce: "Blood Test"
  new Date().toLocaleDateString(locale)  // TR: "21.03.2026", EN: "3/21/2026"
```

---

## 11. HealthDataContext.tsx — Saglik Verileri

**Dosya:** `client/src/contexts/HealthDataContext.tsx` | **Uzunluk:** 351 satir

```
SATIR 25-38: Bos saglik verisi sablonu
  EMPTY_HEALTH_DATA = {
    dailyGoals: {
      calories: { current: 0, target: 2100 },  // Gunluk kalori
      protein: { current: 0, target: 180 },     // Gunluk protein (gram)
      water: { current: 0, target: 8 },          // Su (bardak)
      steps: { current: 0, target: 10000 },      // Adim
      sleep: { current: "0h", target: "8h" }      // Uyku
    },
    foodAnalyses: [],      // Yemek kayitlari
    voiceEntries: [],      // Ses kayitlari
    activityEntries: [],   // Aktivite kayitlari
    documentEntries: [],   // Dokuman kayitlari
    medicalPhotos: []      // Medikal foto kayitlari
  }
```

```
SATIR 48-145: Supabase'den veri cekme (useEffect)
  dataFetched ref'i: Verinin yalnizca 1 kez cekilmesini saglar.

  AKIS:
  1. 5 API cagrisini PARALEL baslat (Promise.all):
     - getDailyLog() → Gunluk saglik kaydi
     - getFoodEntries() → Yemek listesi
     - getActivities(50) → Son 50 aktivite
     - getVoiceEntries() → Ses kayitlari
     - getDocuments() → Dokumanlar
  2. Her birinin hatasini yakala (catchLog) — biri basarisiz olsa diger devam eder
  3. Gelen verileri state formatina donustur:
     - API snake_case → UI camelCase donusumu
     - Su miktari: ml → bardak donusumu (300ml = 1 bardak)
     - Uyku: dakika → "Xh Ym" formatina donustur
  4. setHealthData ile state'i guncelle
```

```
SATIR 148-170: Gunluk toplamları yeniden hesapla
  useEffect — foodAnalyses degistiginde tetiklenir
  1. Bugunun yemeklerini filtrele (tarihe gore)
  2. Toplam kalori ve protein hesapla
  3. Eger deger degistiyse state'i guncelle
```

```
SATIR 172-206: Veri ekleme fonksiyonlari
  addFoodAnalysis(yemek):
    Yeni yemegi listenin BASINA ekler: [yeni, ...oncekiler]

  addVoiceEntry, addActivityEntry, addDocumentEntry, addMedicalPhoto:
    Hepsi ayni mantikla calisir — yeni kaydi basa ekle.
```

```
SATIR 291-318: Su takibi
  updateWaterIntake(miktar):
  1. Yeni su degeri hesapla (0 ile hedef arasi sinirla)
  2. ml'ye cevir (bardak * 300)
  3. Native widget'i guncelle
  4. Supabase'e kaydet (healthAPI.updateDailyLog)
  5. State'i guncelle
```

```
SATIR 320-335: useMemo ile context degerini optimize et
  useMemo: Sadece bagimliliklar degistiginde yeni nesne olusturur.
  NEDEN: Her render'da yeni nesne olusursa tum alt bilesenler
  gereksiz yere yeniden cizilir. useMemo bunu onler.
```

---

## 12. useTabNavigate.ts — Sekme Navigasyonu

**Dosya:** `client/src/hooks/useTabNavigate.ts` | **Uzunluk:** 56 satir

```
SATIR 4-27: TAB_ROUTES esleme tablosu
  'home' → '/', 'camera' → '/camera', 'chat' → '/chat', ...
  Sekme adi verildiginde hangi URL'e gidilecegini belirler.

SATIR 29-31: Ters esleme (ROUTE_TO_TAB)
  '/' → 'home', '/camera' → 'camera', '/chat' → 'chat', ...
  URL verildiginde hangi sekmenin aktif oldugunu belirler.

SATIR 33-50: useTabNavigate() hook'u
  Girdi: sekme adi (orn: 'camera')
  Islem: TAB_ROUTES'da bul → navigate(rota)
  Bulunamazsa: ana sayfaya yonlendir

SATIR 52-55: useActiveTab() hook'u
  Mevcut URL'den aktif sekme adini dondurur.
  Eslesme yoksa 'home' dondurur.
```

---

## 13. useKeyboard.ts — Klavye Tespiti

**Dosya:** `client/src/hooks/useKeyboard.ts` | **Uzunluk:** 37 satir

```
NE YAPAR: Mobilde klavye acildiginda/kapandiginda bildirir.
NEDEN: Klavye acikken alt navigasyonu gizlemek icin.

AKIS:
1. Web platformunda: Hicbir sey yapma, varsayilan state don
2. Native platformda: Capacitor Keyboard olaylarini dinle
   - keyboardWillShow → isOpen: true, yukseklik kaydet
   - keyboardWillHide → isOpen: false, yukseklik 0
3. CSS degiskeni ayarla: --keyboard-height (tasarim icin)
4. Cleanup: Bilesenler kaldirilinca dinleyicileri temizle
```

---

## 14. api.ts — API Istemcisi

**Dosya:** `client/src/lib/api.ts` | **Uzunluk:** ~2950 satir

```
SATIR 1-15: Modul aciklamasi
  8 namespace: authAPI, healthAPI, chatAPI, supplementAPI,
  communityAPI, familyAPI, wearableAPI, notificationAPI

SATIR 17-300: Tip tanimlari (60+ interface)
  Her veritabani tablosu icin okuma/yazma tipleri tanimlanmis.
  Ornek: FoodEntry (okuma), FoodEntryCreateData (yazma)

SATIR 300+: API fonksiyonlari
  HER FONKSIYON SU KALIPLA CALISIR:

  1. supabase.from('tablo').select('*')         → Veri oku (SELECT)
  2. supabase.from('tablo').insert({veri})       → Veri ekle (INSERT)
  3. supabase.from('tablo').update({veri})       → Veri guncelle (UPDATE)
  4. supabase.from('tablo').delete()             → Veri sil (DELETE)
  5. supabase.functions.invoke('fonksiyon', {body}) → Edge Function cagir

  SNAKE_CASE → CAMELCASE DONUSUMU:
  Veritabani: food_name, calories_burned, protein_grams
  TypeScript: foodName, caloriesBurned, proteinGrams
  Her fonksiyon bu donusumu yapar.
```

**ORNEK — healthAPI.getFoodEntries():**
```typescript
// 1. Supabase'den bugunun yemeklerini cek
const { data } = await supabase
  .from('food_entries')           // food_entries tablosu
  .select('*')                     // tum sutunlari getir
  .eq('user_id', userId)          // sadece bu kullanicinin
  .gte('logged_at', bugun)        // bugunun tarihinden itibaren
  .order('logged_at', { ascending: false });  // yeniden eskiye sirala

// 2. snake_case → camelCase donusumu
return data.map(row => ({
  id: row.id,
  foodName: row.food_name,        // food_name → foodName
  calories: row.calories,
  proteinGrams: row.protein_grams, // protein_grams → proteinGrams
  ...
}));
```

---

## 15. Validasyon Dosyalari

### auth.ts
**Dosya:** `client/src/lib/validations/auth.ts` | **Uzunluk:** 35 satir

```
signInSchema (Giris formu):
  email: string, email formati zorunlu
  password: string, min 6 karakter

signUpSchema (Kayit formu):
  email: string, email formati zorunlu
  password: min 6 karakter + en az 1 harf + en az 1 rakam
  confirmPassword: password ile ayni olmali

  .refine() → ozel kural: iki sifre alani eslesmelidir
```

### forms.ts
**Dosya:** `client/src/lib/validations/forms.ts` | **Uzunluk:** 43 satir

```
addFamilyMemberSchema: isim (min 2), iliski (zorunlu)
addMedicationSchema: ilac adi (min 2), doz (zorunlu), siklik, saat
bloodTestUploadSchema: OCR metni (min 10), lab adi (opsiyonel), tarih (opsiyonel)
communityPostSchema: icerik (min 3), baslik (opsiyonel), kategori (varsayilan: general)
activityLogSchema: aktivite tipi (zorunlu), sure (min 1 dk), yogunluk (varsayilan: moderate)

HER SEMA: Zod kutuphane ile tanimlanir.
Kullanici formu gonderdikten sonra bu kurallara gore kontrol edilir.
Kurala uymazsa hata mesaji gosterilir.
```

---

## 16. NotificationService.ts — Bildirim Servisi

**Dosya:** `client/src/services/NotificationService.ts` | **Uzunluk:** 551 satir

```
SINIF: NotificationService

CONSTRUCTOR:
  - isNative: Capacitor platformu mu?
  - isWebSupported: Tarayici Notification API destekliyor mu?
  - webPermission: Bildirim izni durumu

requestPermission():
  Native → LocalNotifications.requestPermissions()
  Web → Notification.requestPermission()

showNotification(bildirim):
  Native → LocalNotifications.schedule() — zamanlama ile
  Web → new Notification() — anlik

generateSmartNotifications(saglikVerisi):
  MANTIK: Saglik verisine bakarak uygun bildirimleri olusturur:

  1. SU: Hedefe ne kadar uzak? Sabah/ogle/aksam'a gore farkli mesaj
  2. KALORi: 200+ kalori eksikse ogun hatirlatmasi
  3. PROTEIN: 10g+ eksikse protein onerisi
  4. AKTIVITE: Bugun hic aktivite yoksa hareket hatirlatmasi
  5. SES KAYDI: Aksam oldu, ses kaydi yoksa hatirlatma
  6. MEDIKAL FOTO: Pazartesi ve son 7 gunde foto yoksa hatirlatma
  7. MOTIVASYON: %30 olasilikla rastgele motivasyon mesaji

scheduleDailyReminders():
  Sabit saatli gunluk bildirimler (sadece native):
  08:00 → Gune baslama
  12:30 → Ogle yemegi kaydi
  15:00 → Su hatirlatmasi
  18:00 → Hareket zamani
  21:30 → Gunluk degerlendirme
  22:30 → Uyku zamani

scheduleStreakReminder(seriGunu):
  Seri > 0 ise her gun 20:00'de hatirlatma

scheduleWeeklySummary():
  Her Pazartesi 09:00'da haftalik ozet

scheduleSupplementReminders(takviyeler):
  Sabah 08:30 ve aksam 20:00'de takviye hatirlatmasi
```

---

## 17. NativeWidgetService.ts — Widget Servisi

**Dosya:** `client/src/services/NativeWidgetService.ts` | **Uzunluk:** 133 satir

```
NE YAPAR: Android ana ekran widget'larini yonetir (protein/su takipci).
DEPOLAMA: Capacitor Preferences (JSON olarak)

addWidget(config): Widget ekle → Preferences'a kaydet → Native olustur
removeWidget(id): Listeden cikar → Preferences'i guncelle → Native sil
updateWidget(id, veri): Bul → Guncelle → Preferences'a kaydet → Native guncelle
loadWidgets(): Preferences'dan yukle

isWidgetSupported(): Platform destekliyor mu?
  Android → her zaman true
  iOS → iOS 14+ (varsayilan true)
  Web → false

NOT: createNativeWidget, removeNativeWidget, updateNativeWidget
su an placeholder — gercek Android AppWidgetProvider entegrasyonu gerektirir.
```

---

## 18. analyze-health-data — AI Analiz (Edge Function)

**Dosya:** `supabase/functions/analyze-health-data/index.ts` | **Uzunluk:** 204 satir

```
CALISMA ORTAMI: Deno (Supabase sunucusunda)

SATIR 1-15: CORS header'lari ve yardimci fonksiyon
  jsonResponse: JSON formatinda yanit dondurmek icin

SATIR 17-63: buildPrompt fonksiyonu
  Analiz tipine gore AI prompt'u olusturur:

  'food-image' → "Bu yemegi analiz et" + resim
    Sistem: "Sen bir beslenme uzmanisin. JSON dondur: yemek, kalori, makrolar"
    Kullanici: [resim + "Bu yemegi analiz et"]

  'blood-test' → OCR metni analizi
    Sistem: "Sen bir laboratuvar uzmanisisin. JSON dondur: markerlar, durum, oneriler"
    Kullanici: "Kan tahlili sonuclari: [metin]"

  'document' → Belge analizi (metin veya resim)
  'medical-photo' → Medikal foto (idrar, gaita, dil, goz)
  'voice-entry' → Ses transkripsiyonu → ruh hali analizi
  'voice-food' → Ses transkripsiyonu → yemek tespiti
```

```
SATIR 65-128: fallback fonksiyonu
  OpenAI API anahtari yoksa veya hata olursa dondurulecek varsayilan veriler.
  Her tip icin uygun varsayilan JSON.

SATIR 130-204: Ana islem akisi (serve)
  1. CORS: OPTIONS istegine izin ver
  2. AUTH: Authorization header'dan kullaniciyi dogrula
  3. BODY: Istek govdesinden type ve verileri oku
  4. OPENAI KEY: Yoksa → fallback dondur
  5. PROMPT: Tipe gore prompt olustur
  6. TIMEOUT: 45 saniye zaman siniri koy (AbortController)
  7. API CALL: OpenAI GPT-4o'ya iste gonder
     - model: 'gpt-4o'
     - response_format: JSON zorunlu
     - max_tokens: 2500
  8. PARSE: Yaniti JSON olarak parse et
  9. RETURN: Sonucu dondur (veya hata durumunda fallback)
```

---

## 19. generate-health-profile — Saglik Profili (Edge Function)

**Dosya:** `supabase/functions/generate-health-profile/index.ts` | **Uzunluk:** 260 satir

```
SATIR 17-43: HealthProfileResult tipi
  Donecek verinin yapisi:
  - bmi, bmr, tdee: Fiziksel metrikler
  - healthScore: 0-100 arasi saglik skoru
  - riskFactors: Risk faktorleri dizisi
  - strengths: Guclu yanlar
  - nutritionPlan: Beslenme plani (kalori + makro dagılımı)
  - exercisePlan: Egzersiz plani
  - supplementRecommendations: Takviye onerileri
  - aiSummary: Ozet paragraf

SATIR 45-109: buildFallbackProfile fonksiyonu
  OpenAI yoksa MATEMATIKSEL hesaplama yapar:

  BMI = kilo / (boy/100)^2
  BMR = 10 * kilo + 6.25 * boy - 5 * yas + (erkek ? 5 : -161)  ← Mifflin-St Jeor formulu
  TDEE = BMR * aktivite carpani (1.2 ~ 1.9)

  SKOR hesabi (maks 100):
  - Normal BMI → +10
  - 3+ ogun kaydı → +10
  - Su hedefine ulasti → +10
  - 5+ aktivite → +10
  - 7+ saat uyku → +5

SATIR 150-196: AI icin prompt olusturma
  Tum kullanici verilerini bolumler halinde birlestirir:
  1. Kullanici profili (boy, kilo, yas, cinsiyet)
  2. Bugunun beslenme verileri (ogun sayisi, toplam kalori/protein)
  3. Su tuketimi
  4. Uyku suresi
  5. Son aktiviteler
  6. Kan tahlili sonuclari
  7. Kullanilan takviyeler

SATIR 198-253: OpenAI API cagrisi
  - Model: gpt-4o
  - JSON formati zorunlu
  - Sistem promptu: Turkce, kanita dayali saglik danismani
  - Basarisiz olursa → fallback profil dondur
```

---

## 20. generate-chat-response — RAG Chatbot (Edge Function)

**Dosya:** `supabase/functions/generate-chat-response/index.ts` | **Uzunluk:** 286 satir

```
SATIR 1-13: Modul aciklamasi — 8 adimli pipeline:
  1. Auth → kullanici dogrulama
  2. Safety → risk tespiti
  3. Topic → konu siniflandirma
  4. Context → kisisel saglik verisi
  5. Retrieval → bilimsel kaynak arama
  6. Prompt → tum baglami birlestirme
  7. Generation → GPT-4o ile yanit uretme
  8. Logging → kayit tutma

SATIR 55-99: Istek parse + Auth dogrulama
  1. Body'den message, history, topic, conversationId al
  2. Authorization header'dan kullaniciyi dogrula
  3. Dogrulanmazsa ve API key yoksa → fallback yanit

SATIR 105-109: Adim 1-2: Guvenlik + Konu
  checkSafety(mesaj) → Acil durum anahtar kelimeleri kontrol et
  classifyTopic(mesaj) → Konuyu siniflandir (beslenme, egzersiz, vb.)

SATIR 111-158: Adim 3-4: Baglam + Kaynak Alma (PARALEL)
  IKI ISLEM AYNI ANDA BASLAR:

  1. buildUserContext(supabase, userId):
     10 paralel veritabani sorgusu → kullanici saglik ozeti

  2. generateQueryEmbedding + retrieveChunks:
     Soruyu vektore cevir → pgvector'da benzer kaynaklari bul
     Esik: 0.3, maks 8 sonuc

  Az sonuc gelirse → filtre olmadan tekrar dene → en iyi 6'yi sec

SATIR 161-183: Adim 5: Prompt Birlestirme
  buildSystemPrompt({
    kullaniciBaglami,    // Profil, beslenme, aktivite, kan testi...
    bilimselKaynaklar,   // pgvector'dan gelen parcalar
    konu,                // beslenme/egzersiz/vb.
    guvenlik,            // Acil durum bayraklari
    gecmis,              // Onceki sohbet mesajlari
    mevcutMesaj          // Kullanicinin sorusu
  })

SATIR 186-231: Adim 6: AI Yanit Uretme
  OpenAI GPT-4o cagrisi:
  - temperature: 0.7 (biraz yaratici)
  - max_tokens: 2000
  - JSON format zorunlu

  Yanit: { content, citations[], suggestedFollowUps[] }

  Yuksek risk varsa → yanita acil uyari eklenir

SATIR 253-269: Adim 7: Loglama
  rag_query_logs tablosuna kaydet (atesl-ve-unut):
  - Kullanici ID, sohbet ID, sorgu
  - Konu, kullanilan chunk ID'leri
  - Benzerlik skorlari, gecikme suresi
```

---

## 21. RAG Alt Modulleri

### safety.ts — Guvenlik Kontrolu
**Dosya:** `supabase/functions/generate-chat-response/lib/safety.ts`

```
7 RISK KATEGORISI:
1. cardiac_emergency: "gogus agrisi", "kalp krizi" → 112 aray
2. respiratory_emergency: "nefes darligi" → 112 aray
3. syncope: "bayilma", "bilinc kaybi" → doktora basvur
4. mental_health_crisis: "intihar", "olmek istiyorum" → 182 aray
5. hemorrhage: "asiri kanama" → 112 aray
6. anaphylaxis: "alerjik sok" → adrenalin + 112
7. poisoning: "zehirlenme", "asiri doz" → 114 aray

CALISMA: Mesaji kucuk harfe cevir → her kategorinin anahtar kelimelerini kontrol et
Eslesen varsa → isHighRisk: true + acil mesaj dondur
```

### topic.ts — Konu Siniflandirma
**Dosya:** `supabase/functions/generate-chat-response/lib/topic.ts`

```
7 KONU + genel:
nutrition (beslenme): yemek, kalori, protein, diyet, vitamin...
exercise (egzersiz): antrenman, kosu, yoga, kas...
sleep (uyku): uyku, uykusuzluk, melatonin...
supplements (takviye): vitamin, omega, probiyotik...
blood_test (kan tahlili): ferritin, kolesterol, tiroid...
mental_health (ruh sagligi): stres, depresyon, meditasyon...
fasting (oruc): intermittent, 16:8, yeme penceresi...

CALISMA: Her kategori icin anahtar kelime sayisini say → en yuksek skoru alan konuyu dondur
Hicbir kategori 0'dan buyuk degilse → 'general'
```

### context.ts — Kullanici Baglami Olusturucu
**Dosya:** `supabase/functions/generate-chat-response/lib/context.ts`

```
buildUserContext(supabase, userId):
  10 PARALEL VERITABANI SORGUSU:
  1. profiles → isim, yas, cinsiyet, boy, kilo
  2. health_profiles → BMI, BMR, TDEE, saglik skoru
  3. food_entries → Son 7 gun yemekler
  4. daily_health_logs → Son 7 gun gunluk kayitlar
  5. activity_entries → Son 7 gun aktiviteler
  6. blood_tests → Son 2 kan tahlili
  7. wearable_data → Son 7 gun cihaz verileri
  8. fasting_logs → Son 10 oruc kaydi
  9. voice_entries → Son 5 ses kaydi
  10. health_documents → Son 3 dokuman

  Her sorgu sonucu OZETLENIR (ham veri dump edilmez):
  - Beslenme: "Son 7 gunde ort. 1800 kcal, 90g protein. Sik tuketilen: tavuk, pilav"
  - Aktivite: "5 aktivite, toplam 180 dakika, ~600 kcal yakildi"
  - Kan tahlili: "Son test: 15.03.2026. Dikkat: Ferritin 8 (dusuk)"

  EKSIK VERILER gaps dizisine eklenir:
  "Boy ve kilo girilmemis", "Kan tahlili kaydi yok" gibi
```

### retrieval.ts — Vektor Arama
**Dosya:** `supabase/functions/generate-chat-response/lib/retrieval.ts`

```
generateQueryEmbedding(apiKey, sorgu):
  OpenAI text-embedding-3-small modeli ile sorguyu 1536 boyutlu vektore cevirir.
  "D vitamini almali miyim?" → [0.23, -0.15, 0.87, ...]

retrieveChunks(supabase, vektör, secenekler):
  match_source_chunks RPC fonksiyonunu cagirir (PostgreSQL fonksiyonu)
  - Kosinus benzerligi ile en yakin bilimsel kaynak parcalarini getirir
  - Esik: 0.3 (bunun altindaki sonuclar filtrelenir)
  - Maks: 8 sonuc
  - Opsiyonel: kategori filtresi, dil filtresi, sadece dogrulanmis kaynaklar

  DONUS: { id, kaynak_basligi, yazarlar, icerik, benzerlik_skoru }
```

### prompt.ts — Prompt Olusturucu
**Dosya:** `supabase/functions/generate-chat-response/lib/prompt.ts`

```
buildSystemPrompt(girdi):
  5 BOLUMDEN OLUSAN SISTEM PROMPTU:

  1. ROL + 9 KURAL:
     "Sen Myora AI saglik danismanisin..."
     - Guvenilir ol, kisisellestir, kaynakli konus
     - Empatik ol, sinirlarini bil, durust ol
     - Pratik ol, veri odakli ol, eksik veri belirt

  2. GUVENLIK (risk varsa):
     "YUKSEK RISKLI DURUM — wellness tavsiye VERME, acil hat oner"

  3. KULLANICI VERILERI:
     Profil, beslenme, aktivite, giyilebilir, kan tahlili,
     oruc, ruh hali, belgeler — her biri emoji ile isaretli

  4. BILIMSEL KAYNAKLAR:
     [1] Kaynak basligi (yazarlar, yil) — dergi
     Icerik parcasi...
     [2] ...

  5. CIKTI FORMATI:
     JSON zorunlu: { content, citations[], suggestedFollowUps[] }

buildMessages(sistemPrompt, gecmis, mevcutMesaj):
  [sistem, ...son10mesaj, kullanicininSorusu]
  — Son 10 mesaji gonderir (hafiza icin)
```

---

> **Bu dosya sunumda en cok referans vereceginn kaynak olacak.** Her bilesen icin "bu satirda su oluyor" diyebileceksin. Daha detayli soru gelirse ilgili dosyayi acip satirla satirla gosterebilirsin.
