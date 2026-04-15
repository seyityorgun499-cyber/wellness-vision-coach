# Sunum Icin Soru-Cevap Hazirligi

> Bu dokuman, sunumda gelebilecek teknik sorulara hazirlik icin yazilmistir.
> Sorular "muhtemel" kategorilere ayrilmistir.

---

## KATEGORI 1: Genel Mimari

### S: Bu uygulama ne yapar?
**C:** Myora, mobil-oncelikli bir saglik yonetim uygulamasidir. Kullanicilar yemek kaydedebilir (kamera ile AI analiz), aktivite ve su takibi yapabilir, sesli saglik gunlugu tutabilir, kan testi sonuclarini AI ile analiz ettirebilir, ve bilimsel kaynakli bir AI chatbot'a saglik sorulari sorabilir. Tum bunlari kisisellestirilmis bir saglik skoru (My Score) ile takip eder.

### S: Neden bu teknolojileri sectiniz?
**C:**
- **React + TypeScript**: Tip guvenligi hatalari azaltir, buyuk ekiplerde maintainability saglar
- **Vite**: Cok hizli derleme (webpack'e gore 10-100x)
- **Supabase**: Firebase alternatifi ama acik kaynakli, PostgreSQL tabanli — SQL bilgisi ile her seyi yapabilirsiniz
- **Capacitor**: Tek kod tabanından Android + iOS + Web. Flutter'dan farki: web teknolojilerini kullaniyor, ayri bir dil ogrenmek gerekmiyor
- **Tailwind CSS**: Tutarli tasarim, hizli gelistirme, kucuk bundle boyutu (kullanilmayan stiller silinir)
- **shadcn/ui**: Kopyala-yapistir bilesen kutuphanesi — tam kontrol, vendor lock-in yok

### S: Neden Express/Node backend degil de Supabase?
**C:** Baslangicta Express backend vardi (`server/` klasorunde hala referans olarak duruyor). Supabase'e gecis sebebi:
1. **Auth hazir**: Email/sifre, sosyal giris, JWT yonetimi — yazmak yerine yapilandirdik
2. **RLS ile guvenlik**: Satir bazli guvenlik veritabani seviyesinde — API'de tek tek kontrol yazmak yerine SQL politikasi
3. **Edge Functions**: Sunucu kodu gerektiginde Deno fonksiyonlari — bagimsiz olceklenebilir
4. **Altyapi yonetimi yok**: Sunucu kurma, SSL, veritabani yedekleme gibi islerle ugrasma yok
5. **Maliyet**: Kucuk-orta olcekte cok daha ucuz

### S: Uygulama offline calisabiliyor mu?
**C:** Sinirli olarak. Capacitor Preferences ile auth token ve bazi ayarlar saklanıyor. Ama saglik verileri Supabase'den cekildiginden internet gerekli. Offline destegi icin service worker + IndexedDB eklenerek gelistirilebilir ama su an kapsamda degil.

---

## KATEGORI 2: Frontend

### S: Neden her bilesen lazy-loaded?
**C:** Performans icin. Uygulama 20+ sayfaya sahip — hepsini ilk yuklemede indirmek yerine sadece ziyaret edilen sayfa indirilir. Bu ilk acilis suresini (First Contentful Paint) onemli olcude azaltir. Ozellikle mobilde ag hizi sinirli olabilir.

### S: Provider zinciri neden bu sirada?
**C:** Bagimlilk sirasina gore:
1. **ThemeProvider**: En dista cunku tema her seyi etkiler
2. **QueryClient**: Veri yonetimi temelden gerekli
3. **LanguageProvider**: Ceviri metinleri her yerde kullanılır
4. **AuthProvider**: Kimlik dogrulamasi dil ayarlarindan sonra gelir (kullanicinin dil tercihi profile'da)
5. **HealthDataProvider**: En icte cunku auth gerektirir + sadece AppLayout icinde

Her Provider kendi altindaki bilesenlere veri saglar. Dis olan ic olana erisemez, ama ic olan disa erisebilir.

### S: State yonetimi icin neden Redux degil Context kullaniyorsunuz?
**C:** 3 sebep:
1. **Karmasiklik**: Redux icin cok fazla boilerplate (action, reducer, store, selector) gerekir. Context + useState yeterli.
2. **Proje olcegi**: 3 context (auth, dil, saglik) yeterli — Redux'un faydali olacagi karmasiklik seviyesinde degiliz.
3. **Sunucu verisi**: Cogu veri React Query ile yonetiliyor — Redux'un en cok kullanildigi alan sunucu verisi cache'lemesi, ama React Query bunu zaten yapiyor.

### S: cn() fonksiyonu ne ise yariyor?
**C:** Tailwind CSS siniflarini birlestirir ve catismalari cozer. Ornegin `cn("p-4", "p-2")` → `"p-2"` olur (sonraki kazanir). Koşullu siniflar icin: `cn("base-sinif", aktif && "aktif-sinif")`.

### S: `@/` ne anlama geliyor?
**C:** `client/src/` klasorunun kisaltmasi. `vite.config.ts` ve `tsconfig.json`'da tanimli. `@/components/Button` yazmak `../../components/Button` yazmaktan daha temiz ve dosya tasindiktan sonra kırılmıyor.

---

## KATEGORI 3: Veri Akisi

### S: Bir yemek fotografi cekildiginde arka planda ne oluyor?
**C:** 7 adimli akis:
1. **Kamera**: Capacitor Camera plugin'i native kamerayi acar (veya web'de getUserMedia)
2. **Base64**: Fotografı base64 string'e cevirir
3. **API cagrisi**: `healthAPI.analyzeFood(base64)` → Supabase Edge Function'a gonderir
4. **Edge Function**: `analyze-health-data` fonksiyonu cagirilir (tip: food-image)
5. **OpenAI**: GPT-4o Vision modeli fotografı analiz eder → JSON dondurur: {yemekAdi, kalori, makrolar, guven}
6. **Onay**: Kullanici sonucu gorur ve onaylar
7. **Kayit**: `food_entries` tablosuna eklenir → React Query cache gecersizlenir → Dashboard guncellenir

### S: RAG chatbot nasil calisir?
**C:** 7 adimli pipeline:
1. **Guvenlik**: Mesajda "gogus agrisi", "intihar" gibi acil kelimeler var mi? Varsa → acil uyari ekle
2. **Konu**: Mesaj hangi konuda? (beslenme, egzersiz, uyku...) → anahtar kelime puanlama ile siniflandirilir
3. **Kullanici Baglami**: 10 paralel veritabani sorgusu ile kullanicinin tum saglik verisi ozetlenir (profil, yemekler, aktiviteler, kan testleri...)
4. **Vektor Arama**: Soru embedding'e cevirilir → pgvector'da bilimsel kaynaklardan en yakin 8 parca getirilir (kosinüs benzerligi)
5. **Prompt**: Kullanici verisi + bilimsel kaynaklar + kurallar birlestirilerek sistem promptu olusturulur
6. **GPT-4o**: JSON formatta yanit uretir: {icerik, alıntılar[], takipSorulari[]}
7. **Loglama**: Sorgu, konu, bulunan kaynaklar ve gecikme rag_query_logs tablosuna kaydedilir

### S: Veri neden snake_case geliyor ama frontend'de camelCase?
**C:** PostgreSQL konvansiyonu snake_case (`food_name`), JavaScript/TypeScript konvansiyonu camelCase (`foodName`). `api.ts` dosyasında her veri alindiginda ve gonderildiginde otomatik donusum yapilir. Bu standart bir pratiktir.

---

## KATEGORI 4: Güvenlik

### S: Kullanici basak kullanicinin verisini gorebilir mi?
**C:** Hayir. Iki katmanli guvenlik var:
1. **JWT Token**: Her API cagrisi kullanicinin oturumuna bagli bir token tasiyor
2. **RLS (Row-Level Security)**: Veritabani seviyesinde her tabloda `auth.uid() = user_id` politikasi var. SQL seviyesinde filtreleme yapilir — API katmani atlanılsa bile veri sızamaz.

### S: Deep link saldirisi olabilir mi?
**C:** Olmaz. `AppLayout.tsx`'de ALLOWED_HOSTS kontrolu var. Sadece `myora.app` ve `localhost` domain'lerinden gelen deep link'ler kabul edilir, diger tum host'lar reddedilir ve loglanır.

### S: AI yanlis tibbi tavsiye verirse ne olur?
**C:** 3 katmanli koruma:
1. **Sistem promptu**: "Kesin tani koyma, doktora yonlendir" kurali var
2. **Guvenlik modulu**: "gogus agrisi", "intihar" gibi acil durumlarda AI yanit vermeden once 112/182 numaralari gosterilir
3. **Disclaimer**: AI onerilerinin tibbi tavsiye olmadigi uyarisi

### S: OPENAI_API_KEY yoksa ne olur?
**C:** Uygulama cokmez. Her Edge Function'da fallback mekanizmasi var:
- `analyze-health-data`: Varsayilan besin degerleri doner (350 kcal, 18g protein)
- `generate-health-profile`: BMI/BMR/TDEE matematiksel hesaplanir
- `generate-chat-response`: "Su anda yanit olusturamiyorum" mesaji

---

## KATEGORI 5: Performans

### S: Ilk yukleme suresi nasil optimize edilmis?
**C:** 5 teknik:
1. **Lazy loading**: 20+ bilesen ihtiyac olunca yuklenir
2. **Chunk splitting**: vendor kutuphaneleri ayri dosyalara bolunmus (react, supabase, radix-ui, vb.)
3. **Tailwind purge**: Kullanilmayan CSS siniflari uretim derlemesinde silinir
4. **SWC**: Babel yerine SWC ile 20x daha hizli transpilasyon
5. **React Query cache**: Ayni veriyi tekrar cekmez (staleTime ile)

### S: Veritabani sorgu performansi?
**C:**
- **Paralel sorgular**: HealthDataContext'te 5, RAG context'te 10 paralel sorgu calisir
- **Index'ler**: user_id + tarih alanlarinda index var (migration dosyalarinda)
- **Limit**: Her sorgu sinirlandirilmis (son 50 yemek, son 7 gun log, son 10 oruc)
- **pgvector HNSW index**: Vektor aramalari icin yaklasik en yakin komsu aramasi — binlerce chunk'ta bile hizli

### S: React Query neden kullaniliyor?
**C:** 4 ana fayda:
1. **Onbellekleme**: Ayni veri icin gereksiz API cagrisi yapmaz
2. **Arka plan yenileme**: Veri bayatladiginda otomatik gunceller
3. **Optimistik guncelleme**: Kullanici beklemeden UI'i gunceller, arka planda API'yi cagirir
4. **Hata yonetimi**: Otomatik retry, loading/error durumlari

---

## KATEGORI 6: Mobil

### S: Neden native degil de hybrid?
**C:** 3 sebep:
1. **Tek kod tabani**: Ayni kodu Android, iOS ve Web'de kullaniyoruz — 3 ayri ekip gerektirmez
2. **Web yetkinlikleri**: React/TypeScript bilen gelistirici hemen katkida bulunabilir — Kotlin/Swift ogrenmek gerekmez
3. **Hizli iterasyon**: Web kodunu degistirip `cap sync` ile aninda teste alabilirsiniz

### S: HashRouter neden gerekli?
**C:** Capacitor WebView `file://` protokolunu kullanir. Normal BrowserRouter (`/profile`) file:// ile calismiyor cunku sunucu yok. HashRouter (`/#/profile`) ise istemci tarafinda calisir — sunucu gerektirmez.

### S: Geri butonu nasil calisir?
**C:** Android'e ozel isleyici var:
1. Hizli-ekleme paneli aciksa → kapat
2. Ana sayfadaysa → "Cikmak istiyor musunuz?" diyalogu → App.exitApp()
3. Baska sayfada → bir onceki sayfaya don
iOS'ta native geri hareketi (swipe) otomatik calisir.

### S: Kamera izni nasil aliniyor?
**C:** Iki katmanda:
1. **AndroidManifest.xml**: CAMERA izni tanimli
2. **MainActivity.java**: WebChromeClient, kamera/mikrofon izinlerini otomatik olarak grant eder
Kullanicidan izin isteme dialogi Android OS tarafindan gosterilir.

---

## KATEGORI 7: AI ve RAG Sistemi

### S: Neden sadece GPT kullanmiyorsunuz, neden RAG?
**C:** GPT tek basina:
- Guncel bilimsel verilere erisemez (egitim verisi tarihle sinirli)
- Kaynaksiz yanit verir — guvenilirlik dusuk
- Kisisellestiremez — kullanicinin kan testini, yemek kaydini bilmez

RAG ile:
- Bilimsel makaleler pgvector'da depolanir → her soruda ilgili kaynaklar bulunur
- Kullanicinin TUM saglik verisi (10 tablodan) prompt'a eklenir → kisisel oneri
- Kaynaklar [1], [2] seklinde gosterilir → dogrulanabilir

### S: pgvector ne? Neden PostgreSQL'de?
**C:** pgvector, PostgreSQL eklentisidir. Vektor embedding'lerini saklamak ve benzerlik araması yapmak icin kullanilir. PostgreSQL'de olmasinin avantaji: ayri bir vektor veritabani (Pinecone, Weaviate) kurmak yerine mevcut Supabase PostgreSQL'de her sey tek yerde.

### S: Embedding boyutu neden 1536?
**C:** OpenAI'nin `text-embedding-3-small` modeli 1536 boyutlu vektor uretir. Bu model boyutu, kalite/performans dengesi icin en optimum secenektir. Daha buyuk model (3-large, 3072 boyut) daha hassas ama daha yavas ve pahali.

### S: Semantic search esigi neden 0.3?
**C:** Kosinüs benzerligi 0-1 arasi. 0.3 nispeten dusuk bir esik — daha fazla sonuc getirir ama bazen ilgisiz olabilir. Yukseltirseniz (0.5) daha kesin ama daha az sonuc gelir. 0.3, recall (hatırlama) oncelikli bir secim — eksik kalmasin diye.

### S: Kullanici baglami neden 10 paralel sorgu?
**C:** Tek seri sorgu yapmak yerine paralel sorgu ~10x daha hizli. Promise.all ile 10 sorgunun hepsi ayni anda baslar, en yavas olan kadar bekler. Her sorgu bagimsiz oldugundan paralellestirme guvenlidir.

---

## KATEGORI 8: Dil ve Lokalizasyon

### S: Yeni dil nasil eklenir?
**C:** LanguageContext.tsx dosyasinda:
1. `Language` tipine yeni kodu ekle: `'en' | 'tr' | 'de'`
2. `translations` nesnesine yeni dil blogu ekle: `de: { foodAnalysis: 'Lebensmittelanalyse', ... }`
3. TypeScript otomatik olarak eksik anahtarlar icin hata verir — 900+ anahtar cevrilmeli

### S: "Myora" neden cevirilmiyor?
**C:** Marka tutarliligi. "Myora" ve "My Score" tum dillerde Ingilizce kalir — CLAUDE.md dosyasinda kural olarak belirtilmis.

---

## KATEGORI 9: Veritabani

### S: Neden 14 migration dosyasi var?
**C:** Artimsal migration stratejisi. Her ozellik eklendikce yeni migration dosyasi olusturulur. Bu sayede:
- Degisiklik gecmisi takip edilir
- Rollback yapilabilir
- Farkli ortamlarda (staging, production) ayni sirada uygulanır

### S: Saglik skoru nasil hesaplanıyor?
**C:** 4 kategori, agirlikli toplam:

| Kategori | Agirlik | Hesaplama |
|----------|---------|-----------|
| Beslenme | %30 | Kalori dengesi (%60) + protein ilerlemesi (%40) |
| Aktivite | %30 | min(aktivite_sayisi * 33, 100) |
| Tutarlilik | %25 | Kaydedilen kategori sayisi / 4 * 100 |
| Hidrasyon | %15 | Tuketilen su / hedef su * 100 |

Toplam = agirlikli toplam, maks 100.

---

## KATEGORI 10: Olasi Zor Sorular

### S: Bu projede en buyuk teknik zorluk ne oldu?
**Onerilen cevap:** "RAG pipeline'inin kisisellestirilmesi. Sadece bilimsel kaynak getirmek yeterli degil — kullanicinin kan testi sonuclari, yemek aliskanliklari, aktivite duzeyi gibi verileri de prompt'a eklemek gerekti. 10 farkli tablodan paralel veri cekip, bunlari LLM'in anlayacagi sekilde ozetlemek ve token limitini asmamak icin dikkatli prompt muhendisligi yapildi."

### S: Olceklenebilirlik (scalability) icin ne dusundunuz?
**Onerilen cevap:** "Supabase altyapisi zaten olceklenebilir — PostgreSQL connection pooling, Edge Functions bagimsiz olceklenir. Frontend'de chunk splitting ve lazy loading ile bundle boyutu optimize. React Query ile gereksiz API cagirilari engelleniyor. pgvector'da HNSW indeksi binlerce chunk'ta bile hizli arama yapar."

### S: Test stratejiniz ne?
**Onerilen cevap:** "TypeScript strict mode ile tip duzeyinde guvenlik saglanıyor — cok sayida hata derleme asamasinda yakalaniyor. Zod ile runtime validasyon yapiliyor. Edge Function'larda fallback mekanizmalari var — herhangi bir servis coktugunde uygulama graceful degrade yapar."

### S: Bu projeyi daha da gelistirmek isteseydiniz ne yapardınız?
**Onerilen cevap (secenekler):**
- Offline destek (service worker + IndexedDB)
- Push notification backend (FCM/APNs)
- Wearable cihaz gercek entegrasyonu (Fitbit/Apple Health API)
- A/B testing altyapisi
- End-to-end sifreleme (hassas saglik verileri icin)
- iOS build ve App Store yayini

---

## SUNUM IPLCUARI

1. **Teknik terimlerden kacma** — dinleyici anlamayabilir. "React Query" yerine "veri onbellek sistemi" de.
2. **Akis diyagramlari goster** — CODEBASE_GUIDE.md'deki diyagramlari slayt olarak kullan.
3. **Demo yap** — Canli demo en etkili sunum yontemidir. Yemek foto cek → AI analiz → dashboard guncellendi → chatbot'a soru sor
4. **Rakamlari paylas** — "38 bilesen", "3 Edge Function", "14 migration", "900+ ceviri anahtari", "10 paralel sorgu"
5. **"Neden?" sorusuna hazir ol** — Her teknoloji seciminin bir sebebi var, onu acikla
6. **Bilmedigini soyle** — Cevabini bilmedigin soruya "Bunu arastirip donecegim" demek uydurmaaktan iyidir
