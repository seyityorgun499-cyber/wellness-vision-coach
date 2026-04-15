# Kod Okuma Egitimi — Sifirdan Projeyi Okumak

> Bu egitim seni "kodu gorunce donan biri"nden "her satiri okuyan biri"ne cevirecek.
> Gercek proje dosyalari uzerinden gidiyoruz. Hic bir sey ezberlemene gerek yok —
> kaliplari taniyinca her dosyayi okuyabileceksin.

---

## DERS 1: Bir Dosyanin Anatomisi

Her `.tsx` veya `.ts` dosyasi 3 bolumden olusur:

```
┌─────────────────────────────┐
│  1. IMPORT'LAR (ice aktarma) │  ← Baska dosyalardan ne aliyoruz?
│                               │
│  2. MANTIK (logic)            │  ← Ne hesapliyoruz, ne yapiyoruz?
│                               │
│  3. RETURN / EXPORT          │  ← Ne donduruyoruz, ne paylasiyoruz?
└─────────────────────────────┘
```

Simdi gercek bir dosya acalim. En kisa dosya: `platform.ts`

```typescript
// ─── 1. IMPORT ───
import { Capacitor } from '@capacitor/core';
//       ↑ ne aliyoruz    ↑ nereden aliyoruz

// ─── 2. MANTIK + 3. EXPORT ───
export const platform = {
// ↑ disa aktar  ↑ degisken adi
  isNative: Capacitor.isNativePlatform(),
  //        ↑ Capacitor'a sor: "native platform miyiz?"
  //        ↑ Android/iOS ise true, tarayici ise false doner
  isAndroid: Capacitor.getPlatform() === 'android',
  isIOS: Capacitor.getPlatform() === 'ios',
  isWeb: !Capacitor.isNativePlatform(),
  //     ↑ ! = degil. Native degilse → web demek
} as const;
//  ↑ "bu degerler sabit, degistirilemez" demek
```

**Tebrikler**, ilk dosyayi okudun. Tamamen anladin.

**KURAL 1:** Her dosyayi okudiginda once `import`'lara bak — ne kullanildigini anlarsin.

---

## DERS 2: Import Satirlarini Okumak

Import'lar projede EN SIK goreceklerin. 4 cesit var:

### Cesit 1: Kutuphaneden alma
```typescript
import { useState, useEffect } from 'react';
//       ↑ bu iki seyi al          ↑ react kutuphanesinden
```

### Cesit 2: Dosyadan alma (`@/` ile)
```typescript
import { supabase } from '@/lib/supabase';
//       ↑ supabase nesnesini al   ↑ client/src/lib/supabase.ts dosyasindan
```
`@/` = `client/src/` klasorunun kisaltmasi. Yani `@/lib/supabase` = `client/src/lib/supabase.ts`

### Cesit 3: Varsayilan (default) alma
```typescript
import App from './App.tsx';
// ↑ App'i al (default export oldugu icin suslu parantez YOK)
```

### Cesit 4: Sadece tip alma
```typescript
import type { User } from '@supabase/supabase-js';
//     ↑ sadece tip — calisma zamaninda yok olur, sadece TypeScript icin
```

**PRATIK:** `AppLayout.tsx` dosyasinin import'larini oku:
```typescript
import { useState, useEffect, useCallback } from "react";
// react'ten 3 hook aliyoruz

import { Outlet, useNavigate, useLocation } from "react-router-dom";
// router'dan: Outlet (cocuk sayfa yeri), navigate (yonlendir), location (mevcut URL)

import { Capacitor } from "@capacitor/core";
// mobil platform tespiti

import { App } from "@capacitor/app";
// geri butonu, deep link gibi uygulama olaylari

import { Camera, Mic, FileText, Activity, Plus } from "lucide-react";
// 5 tane ikon bileseni
```

**KURAL 2:** Import'lardaki `{ }` icindeki her sey o dosyanin kullandigi araclari gosterir.

---

## DERS 3: Degisken ve Tip Tanimlarini Okumak

### const vs let
```typescript
const isim = "Ali";     // SABIT — bir kez atanir, degistirilemez
let sayac = 0;           // DEGISKEN — sonra degistirilebilir (sayac = 5)
```

### Tip belirtme (: ile)
```typescript
const isim: string = "Ali";       // metin
const yas: number = 30;            // sayi
const aktif: boolean = true;       // dogru/yanlis
const liste: string[] = ["a","b"]; // metin dizisi
const kullanici: User | null = null; // User VEYA null olabilir
```

`?` isareti = opsiyonel (olmayabilir):
```typescript
interface User {
  id: string;              // ZORUNLU
  displayName?: string;    // OPSIYONEL — olmayabilir
}
```

### interface = nesnenin sekli
```typescript
interface HealthNotification {
  id: string;
  title: string;
  message: string;
  type: 'water' | 'calories' | 'protein';  // sadece bu 3 degerden biri olabilir
  priority: 'low' | 'medium' | 'high';
  scheduledFor: Date;
  data?: Record<string, unknown>;  // ? = opsiyonel. Record = anahtar-deger cifti
}
```

Bunu okuyabilirsin artik: "Bu bir bildirim nesnesi. id, baslik, mesaj zorunlu. tip 3 degerden biri. oncelik 3 seviyeden biri. zamanlanma tarihi var. data opsiyonel."

**KURAL 3:** `:` den sonrasi her zaman tiptir. `?` varsa opsiyoneldir.

---

## DERS 4: Fonksiyonlari Okumak

3 yazi sekli var, hepsi ayni seyi yapar:

```typescript
// Sekil 1: Normal fonksiyon
function topla(a: number, b: number): number {
  return a + b;
}
//          ↑ girdi tipleri      ↑ cikti tipi

// Sekil 2: Ok fonksiyonu (arrow function) — en sik kullanilan
const topla = (a: number, b: number): number => {
  return a + b;
};

// Sekil 3: Tek satirlik ok fonksiyonu (return gereksiz)
const topla = (a: number, b: number) => a + b;
```

**PROJEDEN ORNEK** — `utils.ts`:
```typescript
export function cn(...inputs: ClassValue[]) {
//                  ↑ "..." = istedigin kadar parametre al (dizi olarak)
  return twMerge(clsx(inputs))
  //     ↑ once clsx ile birlestir, sonra twMerge ile catismalari coz
}
```

**PROJEDEN ORNEK** — `queryKeys.ts`:
```typescript
foods: () => ['health', 'foods'] as const,
// ↑ ad  ↑ parametresiz fonksiyon  ↑ dondurdugu deger (sabit dizi)
```

**async fonksiyonlar** — "bu fonksiyon bekleyecek" demek:
```typescript
const veriGetir = async () => {
  const sonuc = await supabase.from('food_entries').select('*');
  // ↑ "await" = bu islem bitene kadar bekle, sonra devam et
  return sonuc.data;
};
```

**KURAL 4:** `=>` ok isareti = fonksiyon. `async/await` = beklemeli islem.

---

## DERS 5: React Bilesen Kalibini Okumak

PROJEDE HER SAYFA BU KALIPTADIR:

```typescript
// ─── 1. IMPORT'LAR ───
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// ─── 2. BILESEN FONKSIYONU ───
const BenimBilesen = () => {
  // 2a. Hook'lar (use ile baslar)
  const { t } = useLanguage();          // ceviri metinleri
  const [sayac, setSayac] = useState(0); // state (degisebilir deger)

  // 2b. Fonksiyonlar
  const artir = () => {
    setSayac(sayac + 1);  // state'i guncelle → ekran yeniden cizilir
  };

  // ─── 3. RETURN (JSX — ekranda gorunen kisim) ───
  return (
    <div className="p-4">
      <h1>{t.baslik}</h1>        {/* ceviri metnini goster */}
      <p>Sayac: {sayac}</p>       {/* state degerini goster */}
      <button onClick={artir}>    {/* tiklaninca artir() calisir */}
        Artir
      </button>
    </div>
  );
};

// ─── 4. EXPORT ───
export default BenimBilesen;
```

**SIMDI GERCEK DOSYAYI OKUYALIM** — `AppLayout.tsx` bileseni:

```typescript
const AppLayout = () => {
  // HOOK'LAR — bilesenin kullandigi araclar
  const { t } = useLanguage();                    // ceviri metinleri
  const activeTab = useActiveTab();                // aktif sekme (URL'den)
  const tabNavigate = useTabNavigate();            // sekme navigasyonu
  const navigate = useNavigate();                  // sayfa yonlendirme
  const location = useLocation();                  // mevcut URL
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);  // menu acik mi?
  const { isOpen: isKeyboardOpen } = useKeyboard();             // klavye acik mi?
  //      ↑ "isOpen" degerini al ama "isKeyboardOpen" olarak adlandir

  // RETURN — ekranda gorunen kisim
  return (
    <HealthDataProvider>           {/* saglik verileri sagla */}
      <div className="relative">
        <div className="animate-fade-in">
          <Outlet />               {/* ← aktif alt sayfa BURADA gosterilir */}
        </div>
        {!isKeyboardOpen && (      /* klavye KAPALI ise */
          <BottomNavigation        /* alt navigasyonu goster */
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        )}
      </div>
    </HealthDataProvider>
  );
};
```

**KURAL 5:** Her bilesen: hook'lar → fonksiyonlar → return(JSX). JSX = HTML + {JavaScript}.

---

## DERS 6: useState Okumak — Degisebilir Veri

```typescript
const [deger, setDeger] = useState(baslangic);
//     ↑         ↑                    ↑
//  oku      guncelle         ilk deger
```

**PROJEDEN ORNEKLER:**

```typescript
// AuthContext.tsx
const [user, setUser] = useState<User | null>(null);
// user: giris yapmis kullanici (veya null)
// setUser(yeniKullanici) → kullaniciyi gunceller
// <User | null> → tip belirtme: User veya null olabilir
// useState(null) → baslangicta kimse giris yapmamis

// AppLayout.tsx
const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
// isQuickAddOpen: hizli-ekleme menusu acik mi? (false = kapali)
// setIsQuickAddOpen(true) → menuyu ac
// setIsQuickAddOpen(false) → menuyu kapat
```

State degisince NE OLUR?
```
setUser(ali) cagirildi
  → React fark eder: "user degisti!"
  → Bileseni yeniden cizer (render)
  → Ekranda "Merhaba Ali" gozukur
```

**KURAL 6:** `useState` goren her yerde: `[okunanDeger, guncellemeFonksiyonu]` var. Guncelleme yapilinca ekran yeniden cizilir.

---

## DERS 7: useEffect Okumak — Yan Etkiler

```typescript
useEffect(() => {
  // BURASI NE ZAMAN CALISIR?
  // Cevap: bagimlilik dizisine gore
}, [bagimlilik]);
//  ↑ bu dizi cok onemli!
```

**3 KULLANIM:**

```typescript
// 1. BOŞ DİZİ [] = sadece ILK yuklemede calis (1 kez)
useEffect(() => {
  veriGetir();  // Sayfa ilk acildiginda API'den veri cek
}, []);

// 2. DEGERLI DIZI [x] = x her degistiginde calis
useEffect(() => {
  console.log("Dil degisti:", language);  // Dil her degistiginde calisir
}, [language]);

// 3. CLEANUP (temizlik) = return ile
useEffect(() => {
  const listener = dinleyiciKur();
  return () => { listener.kaldir(); };  // Bilesen kaldirilinca temizle
  //     ↑ bu fonksiyon "cleanup" — hafiza sizintisini onler
}, []);
```

**PROJEDEN ORNEK** — `AuthContext.tsx`:
```typescript
useEffect(() => {
  let isMounted = true;
  // ↑ bilesen hala var mi? (asenkron islem bittiginda bilesen kaldirilmis olabilir)

  const initialize = async () => {
    const { data } = await supabase.auth.getSession();
    // ↑ Supabase'den mevcut oturumu sor

    if (!isMounted) return;
    // ↑ bilesen artik yoksa hicbir sey yapma (hata onleme)

    if (data.session?.user) {
      await fetchProfile(data.session.user);
      // ↑ oturum varsa profili cek
    } else {
      setUser(null);
      // ↑ oturum yoksa kullanici null
    }
  };

  initialize();

  // ── Dinleyici kur: oturum degisikliklerini takip et ──
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);    // cikis yapildi → kullanici temizle
      }
      if (session?.user) {
        await fetchProfile(session.user);  // giris yapildi → profil cek
      }
    }
  );

  // ── Cleanup: bilesen kaldirilinca dinleyiciyi iptal et ──
  return () => {
    isMounted = false;
    subscription.unsubscribe();
  };
}, [fetchProfile]);
// ↑ fetchProfile degisirse tekrar calis (pratikte 1 kez calisir)
```

**KURAL 7:** `useEffect` = "bilesen hazirlandi, simdi su isleri yap". `[]` = 1 kez. `[x]` = x degisince.

---

## DERS 8: useCallback ve useMemo — Performans

### useCallback = fonksiyonu hafizada tut
```typescript
const hesapla = useCallback(() => {
  return a + b;
}, [a, b]);
// ↑ a veya b degismezse → ayni fonksiyonu kullan (yeniden olusturma)
// ↑ a veya b degisirse → yeni fonksiyon olustur
```

**PROJEDEN:**
```typescript
// AuthContext.tsx
const mapUser = useCallback((authUser, profile) => ({
  id: authUser.id,
  email: authUser.email || '',
  displayName: profile?.display_name ?? undefined,
  // ...
}), []);
// [] = hicbir bagimliligi yok, fonksiyon HIC degismez
```

### useMemo = hesaplanmis degeri hafizada tut
```typescript
// HealthDataContext.tsx
const contextValue = useMemo(() => ({
  healthData,
  addFoodAnalysis,
  addVoiceEntry,
  // ...
}), [healthData, activeWidgets, ...]);
// ↑ bu degerler degismezse → ayni nesneyi kullan
// ↑ NEDEN: Her render'da yeni nesne olusursa tum alt bilesenler
//   gereksiz yere yeniden cizilir
```

**KURAL 8:** `useCallback` = fonksiyon hafizala. `useMemo` = deger hafizala. Ikisi de performans icin.

---

## DERS 9: JSX Okumak — Ekranda Gorunen Kisim

JSX = HTML + JavaScript karisimi. Kurallar:

```tsx
// 1. JavaScript icin { } kullan
<h1>{kullaniciAdi}</h1>           // degisken goster
<p>{2 + 3}</p>                     // hesaplama yap → "5" gosterilir
<span>{t.hosgeldin}</span>         // ceviri metnini goster

// 2. Kosullu gosterim
{aktif && <span>Aktif</span>}      // aktif=true ise goster, false ise hicbir sey
{skor > 80 ? <p>Harika</p> : <p>Devam et</p>}  // kosul ? dogru : yanlis

// 3. Liste render
{yemekler.map((yemek) => (
  <div key={yemek.id}>             // key = her oge icin benzersiz kimlik (zorunlu)
    <p>{yemek.isim}</p>
    <p>{yemek.kalori} kcal</p>
  </div>
))}

// 4. Olay isleyiciler
<button onClick={() => setSayac(sayac + 1)}>Artir</button>
//       ↑ tiklaninca bu fonksiyonu calistir

// 5. Kosullu sinif
<div className={cn("p-4", aktif && "bg-green-500", "rounded-lg")}>
//              ↑ cn = siniflari birlestir. aktif=true ise yesil arka plan ekle
```

**PROJEDEN ORNEK** — AppLayout.tsx:
```tsx
{quickAddOptions.map((option) => {
  // ↑ 4 secenek dizisini donguyle gez
  const Icon = option.icon;
  // ↑ ikon bilesenini degiskene ata
  return (
    <Button
      key={option.id}
      // ↑ benzersiz kimlik
      variant="ghost"
      // ↑ saydam buton stili
      className="w-full h-auto justify-start p-3"
      // ↑ tam genislik, baslangiç hizalama, ic bosluk
      onClick={() => {
        setIsQuickAddOpen(false);   // menuyu kapat
        tabNavigate(option.id);      // sayfaya git (camera, voice, vb.)
      }}
    >
      <div className="flex items-center gap-3 text-left">
        {/* ↑ yatay diz, ortala, 3 birim bosluk, sola yasla */}
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          {/* ↑ 36x36 kare, yuvarlatilmis, acik birincil renk arka plan */}
          <Icon className="h-4 w-4 text-primary" />
          {/* ↑ 16x16 ikon, birincil renk */}
        </div>
        <div>
          <p className="text-sm font-medium leading-none">{option.title}</p>
          {/* ↑ kucuk, kalin, satir yuksekligi yok → baslik */}
          <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
          {/* ↑ daha kucuk, soluk renk, ust bosluk → aciklama */}
        </div>
      </div>
    </Button>
  );
})}
```

**KURAL 9:** `{ }` = JavaScript kodu. `className` = CSS siniflari. `.map()` = listeyi donguyle ciz.

---

## DERS 10: Context + Provider Kalibini Okumak

Bu kalip projede 3 kez kullaniliyor (Auth, Language, HealthData). Hep ayni:

### Adim 1: Context olustur
```typescript
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  // ... varsayilan degerler
});
```
"Bos bir kutu olustur, icerigini daha sonra dolduracagiz."

### Adim 2: Hook olustur
```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```
"Bu hook ile kutunun icindekini al. Kutu yoksa hata ver."

### Adim 3: Provider olustur
```typescript
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // ... tum mantik burda

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, ... }}>
      {children}
    </AuthContext.Provider>
  );
};
```
"Kutuyu GERCEK verilerle doldur ve alt bilesenlere sagla."

### Adim 4: Kullanim
```typescript
// HERHANGi bir alt bilesen icinde:
const { user, signOut } = useAuth();
// ↑ kullanici verisini ve cikis fonksiyonunu al
```

**KURAL 10:** `createContext` = kutu olustur. `Provider` = kutuyu doldur. `useXxx` = kutudan al.

---

## DERS 11: API Cagrilarini Okumak

### Supabase ile veritabani sorgusu
```typescript
// OKUMA (SELECT)
const { data, error } = await supabase
  .from('food_entries')              // food_entries tablosundan
  .select('*')                        // tum sutunlari getir
  .eq('user_id', userId)             // user_id = bu kullanicinin id'si
  .gte('logged_at', bugun)           // logged_at >= bugun (bugun ve sonrasi)
  .order('logged_at', { ascending: false })  // yeniden eskiye sirala
  .limit(50);                         // en fazla 50 satir getir
// data = gelen satirlar dizisi, error = hata (varsa)
```

```typescript
// YAZMA (INSERT)
const { error } = await supabase
  .from('food_entries')
  .insert({
    user_id: userId,
    food_name: 'Tavuk gogsu',
    calories: 250,
    protein_grams: '35',
  });
```

```typescript
// GUNCELLEME (UPDATE)
const { error } = await supabase
  .from('daily_health_logs')
  .update({ water_ml: 1800 })        // su miktarini guncelle
  .eq('user_id', userId)
  .eq('date', bugun);                 // bugune ait kaydi guncelle
```

```typescript
// EDGE FUNCTION CAGRISI
const { data, error } = await supabase.functions.invoke(
  'analyze-health-data',              // fonksiyon adi
  {
    body: {
      type: 'food-image',             // analiz tipi
      imageData: base64Resim,         // resim verisi
    }
  }
);
// data = AI'in dondurdugu analiz sonucu
```

**KURAL 11:** `supabase.from('tablo')` = SQL tablosu sec. `.select/.insert/.update/.delete` = islem. `.eq/.gte/.order/.limit` = filtre.

---

## DERS 12: Edge Function Kalibini Okumak

Tum Edge Function'lar ayni iskeletle baslar:

```typescript
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// ↑ Deno'nun HTTP sunucu fonksiyonu

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
// ↑ Supabase istemcisi (veritabani erisimi icin)

// CORS header'lari — tarayicinin bu sunucuya istek yapmasina izin ver
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',      // herkes erisebilir
  'Access-Control-Allow-Headers': '...',   // izin verilen header'lar
};

serve(async (req: Request) => {
  // ↑ "Bir HTTP istegi geldiginde bu fonksiyonu calistir"

  // 1. OPTIONS istegine izin ver (CORS preflight)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // 2. Kullaniciyi dogrula
  const authHeader = req.headers.get('Authorization');
  // ... auth kontrolu ...

  // 3. Istek govdesini oku
  const body = await req.json();

  // 4. Islemi yap (AI cagrisi, veri isleme, vb.)
  // ...

  // 5. Sonucu dondur
  return new Response(JSON.stringify(sonuc), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
});
```

**PROJEDEN ORNEK** — analyze-health-data icindeki AI cagrisi:
```typescript
response = await fetch('https://api.openai.com/v1/chat/completions', {
  // ↑ OpenAI API'sine HTTP istegi gonder
  method: 'POST',
  headers: {
    Authorization: `Bearer ${openAiKey}`,  // API anahtari
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o',                       // kullanilacak model
    response_format: { type: 'json_object' }, // JSON formatta yanit zorunlu
    max_tokens: 2500,                       // maks yanit uzunlugu
    messages: [
      { role: 'system', content: prompt.system },  // "Sen bir beslenme uzmanisin..."
      { role: 'user', content: prompt.user },       // resim + "Bu yemegi analiz et"
    ],
  }),
});
```

**KURAL 12:** `serve(async (req) => { ... })` = sunucu. `fetch()` = disari istek at. `req.json()` = gelen veriyi oku.

---

## DERS 13: Sik Gorulen Kaliplar Sozlugu

Kodda surekli karsilasacagin kalipler:

### `?.` (Optional Chaining)
```typescript
user?.displayName
// ↑ user varsa displayName'i al, user null ise undefined don (hata VERMEZ)
// Onsuz: user && user.displayName (daha uzun)
```

### `??` (Nullish Coalescing)
```typescript
isim ?? 'Misafir'
// ↑ isim null veya undefined ise 'Misafir' kullan
// isim = "Ali" → "Ali"
// isim = null → "Misafir"
```

### `||` (Logical OR)
```typescript
deger || 0
// ↑ deger falsy ise (null, undefined, 0, '', false) → 0 kullan
```

### `!` (Non-null assertion)
```typescript
document.getElementById("root")!
// ↑ "Bu kesinlikle null degildir, TypeScript'e soyle" (tehlikeli — dikkatli kullan)
```

### `...` (Spread)
```typescript
// Nesne kopyalama + guncelleme
const yeni = { ...eski, isim: "Yeni isim" };
// ↑ eski nesneyi kopyala, isim alanini degistir

// Dizi birlestirme
const hepsi = [...eskiListe, yeniOge];
// ↑ eski listenin elemanlarini ac + yeni oge ekle

// State guncelleme (PROJEDE COK SIK)
setHealthData(prev => ({
  ...prev,                                    // onceki tum veriyi kopyala
  foodAnalyses: [yemek, ...prev.foodAnalyses]  // yeni yemegi basa ekle
}));
```

### `.map()` (Donusum)
```typescript
const isimler = kullanicilar.map(k => k.isim);
// ↑ her kullanicidan sadece isim al → yeni dizi olustur
// [{isim:"Ali",yas:30}, {isim:"Ayse",yas:25}] → ["Ali", "Ayse"]
```

### `.filter()` (Filtreleme)
```typescript
const bugunkuler = yemekler.filter(y => y.tarih === bugun);
// ↑ sadece bugunun yemeklerini sec
```

### `.reduce()` (Toplama/Birlestirme)
```typescript
const toplamKalori = yemekler.reduce((toplam, y) => toplam + y.kalori, 0);
// ↑ tum yemeklerin kalorilerini topla. Baslangic: 0
// [300, 450, 200] → 950
```

### `.find()` (Tek eleman bul)
```typescript
const aktifOruc = oruclar.find(o => !o.completed);
// ↑ completed=false olan ilk orucu bul
```

### `Promise.all()` (Paralel bekle)
```typescript
const [yemekler, aktiviteler, sesler] = await Promise.all([
  getYemekler(),    // 3 islem AYNI ANDA baslar
  getAktiviteler(),
  getSesler(),
]);
// Hepsi bitince devam eder — sirayla yapmaktan 3x hizli
```

### Ternary (Uclu kosul)
```typescript
const mesaj = skor > 80 ? "Harika" : "Devam et";
//                  ↑ kosul   ↑ dogru   ↑ yanlis
```

### Template literal (Sablonlu metin)
```typescript
const selamlama = `Merhaba ${isim}, skorun ${skor} puan!`;
// ↑ backtick (`) icinde ${} ile degisken gom
```

---

## DERS 14: Gercek Dosya Okuma Pratigi

Simdi ogrendiklerini birlestirip gercek bir dosya oku.

### `useKeyboard.ts` — Satirla satirla:

```typescript
import { useState, useEffect } from 'react';
// useState: degisebilir veri tutma
// useEffect: yan etki (dinleyici kurma)

import { Capacitor } from '@capacitor/core';
// Capacitor: platform tespiti

import { Keyboard } from '@capacitor/keyboard';
// Keyboard: mobil klavye olaylari

interface KeyboardState {
  isOpen: boolean;        // klavye acik mi?
  keyboardHeight: number;  // klavye yuksekligi (piksel)
}

export function useKeyboard(): KeyboardState {
  // ↑ Hook tanimla, KeyboardState tipinde deger dondurur

  const [state, setState] = useState<KeyboardState>(
    { isOpen: false, keyboardHeight: 0 }
  );
  // ↑ baslangic: klavye kapali, yukseklik 0

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    // ↑ web'de calisma — klavye olaylari sadece native'de var
    //   return = useEffect'ten erken cikis

    const showListener = Keyboard.addListener('keyboardWillShow', (info) => {
      // ↑ "klavye acilacak" olayini dinle
      setState({ isOpen: true, keyboardHeight: info.keyboardHeight });
      // ↑ state guncelle: acik + yukseklik
      document.documentElement.style.setProperty(
        '--keyboard-height', `${info.keyboardHeight}px`
      );
      // ↑ CSS degiskeni ayarla (tasarimda kullanilabilir)
    });

    const hideListener = Keyboard.addListener('keyboardWillHide', () => {
      // ↑ "klavye kapanacak" olayini dinle
      setState({ isOpen: false, keyboardHeight: 0 });
      document.documentElement.style.setProperty('--keyboard-height', '0px');
    });

    return () => {
      // ↑ CLEANUP: bilesen kaldirilinca dinleyicileri temizle
      showListener.then(l => l.remove());
      hideListener.then(l => l.remove());
    };
  }, []);
  // ↑ [] = sadece 1 kez calis (bilesen ilk yuklendiginde)

  return state;
  // ↑ { isOpen, keyboardHeight } dondur
}
```

**TEBRIKLER** — Bu dosyadaki HER SATIRI anladin.

---

## DERS 15: Tailwind CSS Siniflarini Okumak

Kodda surekli goreceksin. En sik kullanilan 30 sinif:

### Bosluk
| Sinif | CSS | Anlam |
|-------|-----|-------|
| `p-4` | padding: 1rem (16px) | Ic bosluk (her yon) |
| `px-4` | padding-left/right: 1rem | Yatay ic bosluk |
| `py-2` | padding-top/bottom: 0.5rem | Dikey ic bosluk |
| `m-4` | margin: 1rem | Dis bosluk |
| `mt-2` | margin-top: 0.5rem | Ust dis bosluk |
| `gap-3` | gap: 0.75rem | Ogeler arasi bosluk |
| `space-y-2` | cocuklar arasi dikey bosluk | Alt alta ogeler arasi |

### Boyut
| Sinif | CSS | Anlam |
|-------|-----|-------|
| `w-full` | width: 100% | Tam genislik |
| `w-9` | width: 2.25rem (36px) | Sabit genislik |
| `h-8` | height: 2rem (32px) | Sabit yukseklik |
| `min-h-[60vh]` | min-height: 60vh | Ekranin %60'i kadar |
| `max-w-md` | max-width: 28rem | Orta maks genislik |

### Duzenleme (Layout)
| Sinif | CSS | Anlam |
|-------|-----|-------|
| `flex` | display: flex | Esnek kutu |
| `items-center` | align-items: center | Dikey ortala |
| `justify-center` | justify-content: center | Yatay ortala |
| `justify-start` | justify-content: flex-start | Basa yasla |
| `relative` | position: relative | Goreceli konum |
| `hidden` | display: none | Gizle |

### Gorunum
| Sinif | CSS | Anlam |
|-------|-----|-------|
| `rounded-lg` | border-radius: 0.5rem | Yuvarlatilmis kose |
| `rounded-full` | border-radius: 9999px | Tam daire |
| `bg-primary` | birincil arka plan rengi | |
| `bg-primary/10` | birincil renk %10 opaklık | Acik ton |
| `text-sm` | font-size: 0.875rem | Kucuk yazi |
| `text-xs` | font-size: 0.75rem | Daha kucuk yazi |
| `font-medium` | font-weight: 500 | Orta kalinlik |
| `text-muted-foreground` | soluk metin rengi | Ikincil metin |
| `animate-spin` | donen animasyon | Yukleme gostergesi |
| `animate-fade-in` | belirme animasyonu | Sayfa gecisi |

### Sayi sistemi: 1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px, 8=32px

---

## OZET: 15 KURAL

| # | Kural |
|---|-------|
| 1 | Import'lara bak → dosyanin ne kullandigini anla |
| 2 | `{ }` icindeki import'lar = kullanilan araclar |
| 3 | `:` den sonrasi tip. `?` = opsiyonel |
| 4 | `=>` = fonksiyon. `async/await` = beklemeli islem |
| 5 | Bilesen = hook'lar → fonksiyonlar → return(JSX) |
| 6 | `useState` = [okunanDeger, guncelleyici]. Degisince ekran yenilenir |
| 7 | `useEffect` = yan etki. `[]` = 1 kez. `[x]` = x degisince |
| 8 | `useCallback/useMemo` = performans icin hafizalama |
| 9 | JSX: `{ }` = JS kodu. `.map()` = liste. `&&` = kosullu gosterim |
| 10 | Context: `createContext` = kutu. `Provider` = doldur. `useXxx` = al |
| 11 | Supabase: `.from('tablo').select/insert/update` = veritabani islemi |
| 12 | Edge Function: `serve()` = sunucu. `fetch()` = disari istek |
| 13 | `?.` = guvenli erisim. `??` = varsayilan deger. `...` = kopyala/birlestir |
| 14 | Pratik yap — gercek dosyalari okuyarak pekistir |
| 15 | Tailwind: sayi=bosluk, flex=duzenleme, bg/text=renk, rounded=kose |

---

> **SIMDI NE YAPMALISIN:**
> 1. `client/src/lib/platform.ts` ac — okuyabilirsin (8 satir)
> 2. `client/src/hooks/useKeyboard.ts` ac — okuyabilirsin (37 satir)
> 3. `client/src/hooks/useTabNavigate.ts` ac — okuyabilirsin (56 satir)
> 4. `client/src/lib/supabase.ts` ac — okuyabilirsin (47 satir)
> 5. `client/src/pages/AppLayout.tsx` ac — okuyabilirsin (169 satir)
> 6. `client/src/contexts/AuthContext.tsx` ac — okuyabilirsin (283 satir)
>
> Kucukten buyuge. Her dosyada "bu satir ne yapiyor?" diye sor. Yukaridaki 15 kurali uygula.
