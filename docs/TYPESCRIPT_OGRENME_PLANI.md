# TypeScript Öğrenme Planı (Repo İçi)

Bu plan, projeyi geliştirirken TypeScript öğrenmen için hazırlandı.
Hedef: 4 hafta sonunda jüri karşısında kodu teknik olarak anlatabilecek seviyeye gelmek.

## Nasıl İlerleyeceğiz

- Her gün 45-60 dakika çalış.
- Sıra: 1) kısa teori, 2) ilgili dosyayı okuma, 3) küçük görev.
- Her görevden sonra uygulamayı çalıştırıp sonucu gör.

## 4 Haftalık Yol Haritası

### 1. Hafta — TypeScript Temelleri

- Tipler: `string`, `number`, `boolean`, `null`, `undefined`
- Fonksiyon tipleri ve dönüş tipleri
- `type` ve `interface`
- Optional alanlar (`?`) ve union tipler (`A | B`)

Çalışılacak dosyalar:
- `client/src/contexts/AuthContext.tsx`
- `client/src/components/BottomNavigation.tsx`

### 2. Hafta — React + TS

- Component prop tipleri
- State tipleri (`useState<T>`)
- Context tipleri
- Async fonksiyonlarda tip kullanımı

Çalışılacak dosyalar:
- `client/src/pages/Index.tsx`
- `client/src/components/HealthDashboard.tsx`

### 3. Hafta — Backend + TS

- Request/response akışı
- Route handler yapısı
- Zod validation ve tip güvenliği
- Hata yönetimi

Çalışılacak dosyalar:
- `server/routes/authRoutes.ts`
- `server/routes/healthRoutes.ts`

### 4. Hafta — Veri Modeli ve Jüri Hazırlığı

- Şema okuma (Drizzle)
- API sözleşmesi anlatımı
- Uçtan uca akış anlatımı (frontend → backend → db → frontend)

Çalışılacak dosya:
- `shared/schema.ts`

---

## Ders 1 (Bugün): AuthContext Üzerinden Tip Okuma

Dosya: `client/src/contexts/AuthContext.tsx`

### Bu derste anlayacağın 4 şey

1. `interface User` neden var?
2. `AuthContextType` neden gerekli?
3. `signIn/signOut` neden `Promise<{ error: any }>` dönüyor?
4. `user: User | null` neden union tip?

### Mini Egzersizler

1) `User` tipine yeni alan ekle:
- `language?: string;`

2) `signOut` dönüş tipini güçlendir:
- `Promise<{ error: { message: string } | null }>`

3) `signIn` ve `signUp` için de aynı hata tipini kullan.

4) Dosyada `any` geçen yerleri bul, mümkün olanları daha güvenli tipe çek.

### Kontrol Soruları (Kendine Sor)

- `User | null` yerine sadece `User` yazsak ne kırılır?
- `error: any` neden riskli?
- Context tipi olmasa editör bize hangi yardımları veremez?

---

## Jüri İçin Konuşma Cümlesi (Ezber)

"Bu projede TypeScript’i sadece derlenme için değil, frontend ve backend arasında tip sözleşmesini korumak için kullanıyoruz. Özellikle auth akışında context tipleri ve API dönüş tipleri sayesinde runtime hatalarını erken yakalıyoruz."

---

## Yarın (Ders 2)

`BottomNavigation` ve `Index` üzerinde:
- `activeTab` için literal union tip
- yanlış tab ID gönderimini derleme aşamasında engelleme

