# Temel Kavramlar Sozlugu

> Bu rehber, projede gecen tum teknik terimleri programlama bilmeyenler icin sade Turkce ile aciklar.
> Sunumda birisi "bu ne?" diye sorarsa bu sozluge bakabilirsin.

---

## BOLUM 1: Dil ve Araclar

### TypeScript (TS)
JavaScript'in "tip guvenli" versiyonu. Normal JavaScript'te bir degiskene her sey atayabilirsin (`sayi = "merhaba"` bile calisir). TypeScript'te bunu yapamazsin — `sayi: number = 5` dersin, artik oraya metin atayamazsin. Hatalari kod calistirilmadan once yakalar.

**Projede:** Tum `.ts` ve `.tsx` dosyalari TypeScript ile yazilmistir. `tsconfig.json` dosyasi TypeScript ayarlarini icerir.

### JSX / TSX
HTML gibi gorunen ama aslinda JavaScript icinde yazilan soz dizimi. `.tsx` = TypeScript + JSX demek.

```tsx
// Bu bir TSX kodu — HTML gibi gorunuyor ama aslinda JavaScript
<div className="card">
  <h1>{kullaniciAdi}</h1>    // Suslu parantez icinde JS kodu calisir
  <p>Hosgeldin!</p>
</div>
```

**Onemli fark:** HTML'de `class` yazilir, JSX'te `className` yazilir (class JS'de ayrılmış kelime oldugu icin).

### Vite
Projeyi derleyen ve gelistirme sirasinda canli onizleme sunan arac. `npm run dev` dediginde Vite devreye girer, her degisiklikte sayfayi aninda gunceller (buna **HMR** = Hot Module Replacement denir).

**Build:** `npm run build` dediginde tum kodu kucultup `dist/public/` klasorune cikti verir.

### npm (Node Package Manager)
JavaScript kutuphanelerini (paketleri) yuklemek ve yonetmek icin kullanilan arac. `package.json` dosyasi projenin tum bagimlilikların listeler.

```bash
npm install      # Tum paketleri yukle
npm run dev      # Gelistirme sunucusunu baslat
npm run build    # Uretim derlemesi yap
```

---

## BOLUM 2: React Kavramlari

### React
Kullanici arayuzu (UI) olusturmak icin kullanilan bir kutuphane. Sayfayi kucuk **bilesenlere** (component) bolmenizi saglar. Her bilesen bagimsiz bir HTML + mantik parcasidir.

### Component (Bilesen)
Sayfanin tekrar kullanilabilir bir parcasi. Ornegin bir "Buton" bileseni, bir "Kart" bileseni, bir "BottomNavigation" bileseni. Her bilesen bir fonksiyon olarak yazilir:

```tsx
// Bu bir bilesen — goruntuyu dondurur
const Merhaba = () => {
  return <h1>Merhaba Dunya!</h1>;
};
```

**Projede:** 38 ozellik bileseni (`client/src/components/`) + 54 UI bileseni (`client/src/components/ui/`) vardir.

### Props (Ozellikler)
Bir bilesene disaridan gonderilen veriler. HTML'deki attribute'lara benzer:

```tsx
// Bileseni tanimla
const Selamlama = ({ isim }: { isim: string }) => {
  return <h1>Merhaba {isim}!</h1>;
};

// Kullan — isim "props" olarak gonderilir
<Selamlama isim="Ali" />
```

### State (Durum)
Bilesenin icindeki degisebilir veri. State degisince bilesen otomatik yeniden cizilir (render olur).

```tsx
const [sayac, setSayac] = useState(0);  // sayac = 0 ile baslar
// setSayac(5) dersen: sayac 5 olur ve ekran guncellenir
```

**`useState`**: State tanimlamak icin kullanilan React hook'u.

### useEffect
"Bilesen yuklendikten sonra su islemi yap" demektir. API'den veri cekmek, zamanlayici kurmak gibi yan etkiler icin kullanilir.

```tsx
useEffect(() => {
  // Bilesen ilk yuklendiginde calisir
  veriGetir();
}, []);  // [] = sadece ilk yuklemede calis

useEffect(() => {
  // "deger" her degistiginde calisir
  console.log(deger);
}, [deger]);
```

### useCallback
Bir fonksiyonu "hafizada tut" demektir. Fonksiyonun her render'da yeniden olusturulmasini onler — performans icin kullanilir.

```tsx
const hesapla = useCallback(() => {
  return a + b;
}, [a, b]);  // Sadece a veya b degisince yeni fonksiyon olusturulur
```

### useMemo
Bir hesaplamayi "hafizada tut" demektir. useCallback'in fonksiyon yerine deger versiyonu.

```tsx
const toplam = useMemo(() => {
  return yemekler.reduce((s, y) => s + y.kalori, 0);
}, [yemekler]);  // Sadece yemekler degisince yeniden hesapla
```

### useRef
Render'lar arasinda degismeden kalan bir referans tutar. State'den farki: degistiginde ekrani yeniden cizmez.

```tsx
const veriYuklendi = useRef(false);  // ilk deger false
veriYuklendi.current = true;          // degistirdik ama ekran yeniden cizilmez
```

**Projede:** `HealthDataContext` icinde veri tekrar cekilmesin diye `dataFetched` ref'i kullanilir.

### Context (Baglam)
Bilesenler arasinda veri paylasmak icin kullanilir. Normalde props ile veri alt bilesenlere gecirilir — ama cok fazla seviye varsa bu zorlaşır. Context ile "global degisken" gibi her yerden erisirsin.

```
Normalde: UstBilesen → OrtaBilesen → AltBilesen (props zinciri)
Context ile: UstBilesen → Context → [her bilesen erisir]
```

**Projede 3 Context var:**
- **AuthContext**: Kullanici oturumu (giris/cikis)
- **LanguageContext**: Dil sistemi (TR/EN)
- **HealthDataContext**: Saglik verileri (yemek, aktivite, su)

### Provider (Saglayici)
Context verisini alt bilesenlere "saglar". Bir agacin koku gibi dusun — kokte Provider varsa tum dallardaki bilesenler o veriye erisebilir.

```tsx
<AuthProvider>        {/* Oturum verisini saglar */}
  <LanguageProvider>  {/* Dil verisini saglar */}
    <AppLayout />     {/* Icindeki her bilesen hem auth'a hem dile erisir */}
  </LanguageProvider>
</AuthProvider>
```

### Hook (Kanca)
`use` ile baslayan ozel fonksiyonlar. React'in sagladigi (useState, useEffect) veya kendinizin yazdigi (useAuth, useLanguage) olabilir. Bilesenlere ekstra yetenekler katar.

**Projede ozel hook'lar:**
| Hook | Dosya | Ne yapar |
|------|-------|----------|
| `useAuth()` | AuthContext.tsx | Kullanici bilgisi, giris/cikis fonksiyonlari |
| `useLanguage()` | LanguageContext.tsx | Ceviri metinleri (t.xxx), dil degistirme |
| `useHealthData()` | HealthDataContext.tsx | Saglik verileri, yemek/aktivite ekleme |
| `useTabNavigate()` | useTabNavigate.ts | Sekme navigasyonu |
| `useActiveTab()` | useTabNavigate.ts | Aktif sekme bilgisi |
| `useKeyboard()` | useKeyboard.ts | Mobil klavye acik/kapali durumu |

### React.lazy() ve Suspense
**Lazy loading** = tembel yukleme. Bilesen ilk basta yuklenmez, ihtiyac olunca yuklenir. Bu sayede uygulama hizli acilir — kullanicinin gitmedigi sayfalar bosta yuklenmez.

```tsx
const ExpertChat = lazy(() => import("@/components/ExpertChat"));
// ExpertChat sadece /chat sayfasina gidildiginde yuklenir

<Suspense fallback={<YukleniyorAnimasyonu />}>
  <ExpertChat />
</Suspense>
// Yuklenene kadar animasyon gosterir
```

**Projede:** App.tsx'te TUM 20+ sayfa bileseni lazy yuklenir.

### React Router
URL'e gore hangi bilesenin gosterilecegini belirler. Tarayicinin adres cubugundaki `/profile` gibi yolları bilesen eslestirmesine cevirir.

```tsx
<Routes>
  <Route path="/profile" element={<UserProfile />} />  {/* /profile → UserProfile goster */}
  <Route path="/chat" element={<ExpertChat />} />       {/* /chat → ExpertChat goster */}
</Routes>
```

**HashRouter vs BrowserRouter:**
- `BrowserRouter`: URL'ler temiz gorunur (`myora.app/profile`)
- `HashRouter`: URL'de `#` vardir (`myora.app/#/profile`) — Capacitor (mobil) icin gereklidir cunku `file://` protokolu hash yonlendirme gerektirir

### Outlet
Ic ice (nested) rotalarda "cocuk rotanin gosterilecegi yer" demektir.

```tsx
// AppLayout.tsx
<div>
  <Outlet />           {/* Burada cocuk rota render olur */}
  <BottomNavigation /> {/* Alt navigasyon her zaman gorunur */}
</div>
```

---

## BOLUM 3: Veri Yonetimi

### React Query (TanStack Query)
Sunucudan gelen verileri yoneten kutuphane. Kendi basina su ozellikleri saglar:
- **Onbellekleme**: Ayni veriyi tekrar tekrar cekmez
- **Otomatik yenileme**: Veri bayatladiginda arka planda gunceller
- **Hata yonetimi**: API cagrilari basarisiz olursa yeniden dener
- **Yukleme durumu**: `isLoading`, `isError`, `data` gibi durumlari otomatik saglar

**Projede:** `QueryClientProvider` App.tsx'te en uste sarilir. Ayarlar:
- `staleTime: 30_000` → Veri 30 saniye boyunca "taze" sayilir (tekrar cekilmez)
- `retry: 1` → Basarisiz olursa 1 kez daha dener
- `refetchOnWindowFocus: false` → Sekme degistiginde yeniden cekmez

### Query Keys (Sorgu Anahtarlari)
React Query her veriyi bir "anahtar" ile tanir. Onbellek bu anahtarlarla calisir:

```typescript
queryKeys.health.foods()    → ['health', 'foods']     // Yemek listesi icin anahtar
queryKeys.chat.messages(id) → ['chat', 'messages', id] // Belirli sohbetin mesajlari
```

**Stale Time (Bayatlama Suresi):**
| Tip | Sure | Ornek |
|-----|------|-------|
| `static` | 5 dakika | Basarimlar, cihaz listesi |
| `dynamic` | 30 saniye | Yemek, aktivite girisleri |
| `realtime` | 10 saniye | Gunluk kayit, oruc durumu |

---

## BOLUM 4: Stil ve UI

### Tailwind CSS
CSS siniflarini dogrudan HTML/JSX icinde yazmanizi saglayan bir yardimci-sinif (utility-first) framework'u.

```tsx
// Geleneksel CSS:  .card { padding: 16px; background: white; border-radius: 8px; }
// Tailwind:
<div className="p-4 bg-white rounded-lg">
```

**Sik kullanilan siniflar:**
| Sinif | Anlami |
|-------|--------|
| `p-4` | padding: 16px (her yon) |
| `mt-2` | margin-top: 8px |
| `flex` | display: flex |
| `items-center` | align-items: center |
| `text-sm` | font-size: 14px |
| `bg-primary` | arka plan: ana renk |
| `rounded-lg` | border-radius: 8px |
| `hidden` | display: none |
| `animate-spin` | donen animasyon |

### shadcn/ui
Hazir UI bilesenleri kutuphanesi. `Button`, `Card`, `Dialog`, `Sheet` gibi 54 bilesen saglar. Radix UI uzerine insa edilmistir ve Tailwind ile stillendirilir.

**Projede:** `client/src/components/ui/` klasorunde 54 bilesen vardir (button.tsx, card.tsx, dialog.tsx, vb.)

### Sheet
Alt veya yandan kayan panel. Mobilde "hizli ekleme" menusu olarak kullanilir.

```tsx
<Sheet open={acik} onOpenChange={setAcik}>
  <SheetContent side="bottom">
    {/* Icerdeki menuler */}
  </SheetContent>
</Sheet>
```

### cn() Fonksiyonu
CSS siniflarini birlestiren yardimci fonksiyon. Catismalari otomatik cozer:

```typescript
cn("p-4 text-sm", kosul && "text-red-500", "bg-white")
// → "p-4 text-sm text-red-500 bg-white" (kosul dogru ise)
```

---

## BOLUM 5: Backend ve API

### Supabase
Firebase alternatifi, acik kaynakli bir backend platformu. Su servisleri saglar:
- **Auth**: Kullanici girisi/kaydi (email/sifre)
- **PostgreSQL**: Veritabani (SQL ile sorgular)
- **Edge Functions**: Sunucu tarafinda calisacak fonksiyonlar (Deno runtime)
- **Storage**: Dosya saklama (resimler, belgeler)
- **Realtime**: Canli veri degisimleri

### Supabase Client
Frontend'den Supabase'e baglanmak icin kullanilan kutuphane. `supabase.ts` dosyasinda yapilandirilir.

```typescript
// Veritabanindan veri cek
const { data, error } = await supabase.from('food_entries').select('*');

// Edge Function cagir
const { data } = await supabase.functions.invoke('analyze-health-data', {
  body: { type: 'food-image', imageData: base64 }
});
```

### Edge Function
Supabase sunucusunda calisan kucuk fonksiyonlar. **Deno** runtime uzerinde calisir (Node.js benzeri ama farkli). Projede 3 tane vardir:
1. `analyze-health-data`: Yemek/ses/dokuman/foto AI analizi
2. `generate-chat-response`: RAG chatbot
3. `generate-health-profile`: AI saglik profili

### RLS (Row-Level Security)
PostgreSQL'in "satir bazli guvenlik" ozelligi. Her kullanici sadece kendi verisini gorebilir:

```sql
-- Bu politika sayesinde kullanici sadece kendi yemeklerini gorebilir
CREATE POLICY "users_own_data" ON food_entries
  FOR ALL USING (auth.uid() = user_id);
```

### API Namespace
`api.ts` dosyasinda fonksiyonlar gruplara ayrilmistir. Her grup bir "namespace" dir:

```typescript
healthAPI.getFoodEntries()     // Saglik → yemek listesi
chatAPI.sendMessage(id, text)  // Sohbet → mesaj gonder
familyAPI.getMembers()         // Aile → uye listesi
```

---

## BOLUM 6: AI ve RAG

### OpenAI GPT-4o
Yapay zeka modeli. Metin olusturma, goruntu analizi, soru cevaplama yapabilir. Projede Edge Function'lar uzerinden cagirilir.

### RAG (Retrieval-Augmented Generation)
"Alma-Destekli Uretim". AI'in sadece kendi bilgisiyle degil, disaridan saglan bilimsel kaynaklarla da yanit vermesi:

```
Normal AI: "D vitamini faydalidir" (genel bilgi, kaynaksiz)
RAG AI: "Kan testinizdeki D vitamini 18 ng/mL ki bu dusuktur [1].
         WHO kilavuzuna gore gunluk 2000 IU oneriliyor [2]."
         (kisisel + kaynakli)
```

### Embedding (Gomme)
Metni bir sayi dizisine (vektore) donusturme islemi. "D vitamini" → [0.23, -0.15, 0.87, ...] (1536 sayi). Benzer konular benzer vektorler uretir.

### pgvector
PostgreSQL icin vektor arama eklentisi. Embedding'leri veritabaninda saklar ve benzerlik aramasi yapar.

### Cosine Similarity (Kosinus Benzerligi)
Iki vektorun ne kadar benzer oldugunu olcen matematik formulu. 1.0 = ayni, 0 = ilgisiz.

### Chunk (Parca)
Uzun bilimsel makalelerin kucuk parcalara bolunmus hali. RAG sistemi bu parcalari arar, en ilgili olanlari AI'a gonderi.

---

## BOLUM 7: Mobil (Capacitor)

### Capacitor
Web uygulamasini native mobil uygulamaya ceviren arac. WebView (tarayici motoru) icinde web kodu calistirir ama telefon ozelliklerine (kamera, bildirim, bluetooth) erisim saglar.

```
Web kodu (HTML/CSS/JS) → Capacitor → Android APK / iOS IPA
```

### WebView
Uygulama icinde gomulu tarayici. Capacitor, web uygulamasini bu tarayicida calistirir.

### Plugin (Eklenti)
Telefon ozelliklerine erisen kucuk kutuphaneler:
- `@capacitor/camera` → Kamera
- `@capacitor/keyboard` → Klavye olaylari
- `@capacitor/preferences` → Veri saklama (SharedPreferences)
- `@capacitor/local-notifications` → Yerel bildirimler
- `@capacitor/app` → Geri butonu, deep link

### Deep Link
Bir URL'e tiklayinca uygulamanin acilmasi. `myora.app/profile` linkine tiklayinca uygulama acilip profil sayfasina gider.

---

## BOLUM 8: Proje Kaliplari

### import / export
Dosyalar arasi kod paylaşımı:

```typescript
// supabase.ts'den disa aktar
export const supabase = createClient(...);

// api.ts'de iceri al
import { supabase } from '@/lib/supabase';
```

### `@/` Yol Kisaltmasi
`@/` yazmak `client/src/` klasorune isaret eder. Uzun yol yazmamak icin:

```typescript
import { Button } from "@/components/ui/button";
// Aslinda: import { Button } from "../../components/ui/button";
```

### `as const`
TypeScript'e "bu degerin sabittir, degismeyecek" der. Tip cikarimsini sıkılastırır:

```typescript
const ROUTES = { HOME: '/', CHAT: '/chat' } as const;
// ROUTES.HOME tipi: string degil '/' (tam deger)
```

### interface
TypeScript'te nesnenin seklini tanimlayan yapi:

```typescript
interface Kullanici {
  id: string;
  isim: string;
  yas?: number;  // ? = opsiyonel
}
```

### `async / await`
Asenkron islemleri (API cagirilari, veritabani sorgusu) beklemek icin:

```typescript
const veri = await supabase.from('food_entries').select('*');
// "Veri gelene kadar bekle, sonra devam et"
```

### `Promise.all()`
Birden fazla asenkron islemi ayni anda baslatip hepsinin bitmesini bekle:

```typescript
const [yemekler, aktiviteler, sesler] = await Promise.all([
  healthAPI.getFoodEntries(),    // Ayni anda baslar
  healthAPI.getActivities(50),   // Ayni anda baslar
  healthAPI.getVoiceEntries(),   // Ayni anda baslar
]);
// Hepsi bitince devam eder — sirayla yapmaktan cok daha hizli
```

### Zod
Form dogrulama kutuphanesi. Kullanicidan gelen veriyi kontrol eder:

```typescript
const schema = z.object({
  email: z.string().email("Gecerli email girin"),
  sifre: z.string().min(6, "En az 6 karakter"),
});
// Kullanici formu gonderdikten sonra dogrulama yapar
```

### Spread Operator (`...`)
Bir nesneyi veya diziyi acarak kopyalar/birlestirir:

```typescript
const eski = { isim: "Ali", yas: 30 };
const yeni = { ...eski, yas: 31 };
// yeni = { isim: "Ali", yas: 31 } — eski kopyalandi, yas guncellendi
```

**Projede cok sik kullanilir** — ozellikle state guncellemelerinde:
```typescript
setHealthData(prev => ({
  ...prev,  // Onceki tum veriyi kopyala
  foodAnalyses: [yeniYemek, ...prev.foodAnalyses]  // Yeni yemegi basa ekle
}));
```

### CORS (Cross-Origin Resource Sharing)
Farkli alan adlari arasinda istek yapmaya izin veren guvenlik mekanizmasi. Edge Function'larin basinda CORS header'lari tanimlanir ki frontend bu fonksiyonlari cagirabilsin.

---

## BOLUM 9: Kisaltmalar

| Kisaltma | Tam Adi | Anlami |
|----------|---------|--------|
| SPA | Single Page Application | Tek sayfa uygulama — sayfa yenilenmeden icerik degisir |
| HMR | Hot Module Replacement | Gelistirmede kod degisince sayfa aninda guncellenir |
| JWT | JSON Web Token | Kullanici kimligini dogrulayan sifreli belirtec |
| RLS | Row-Level Security | Satir bazli veritabani guvenligi |
| RAG | Retrieval-Augmented Generation | Bilgi getirme destekli AI metin uretimi |
| BMI | Body Mass Index | Vucut kitle indeksi |
| BMR | Basal Metabolic Rate | Bazal metabolizma hizi |
| TDEE | Total Daily Energy Expenditure | Toplam gunluk enerji harcamasi |
| CRUD | Create, Read, Update, Delete | Temel veritabani islemleri |
| OCR | Optical Character Recognition | Goruntuden metin cikarma |
| i18n | Internationalization | Coklu dil destegi |
| UI | User Interface | Kullanici arayuzu |
| API | Application Programming Interface | Uygulamalar arasi iletisim arayuzu |
| SDK | Software Development Kit | Yazilim gelistirme kiti |
| DOM | Document Object Model | Tarayicidaki sayfa yapisi |
| CSS | Cascading Style Sheets | Stil tanimlama dili |
| RPC | Remote Procedure Call | Uzaktan fonksiyon cagrisi |
