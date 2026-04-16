/**
 * Myora – Client API Katmanı (Backward Compatibility Barrel)
 *
 * TÜM İÇERİK api/ DİZİNİNE TAŞINDI.
 * Bu dosya sadece geriye uyumluluk için barrel export sağlar.
 *
 * API Yapısı:
 * ├── authAPI          → Kimlik doğrulama (api/auth.ts)
 * ├── healthAPI        → Sağlık takibi (api/health.ts)
 * ├── chatAPI          → AI sohbet (api/chat.ts)
 * ├── supplementAPI    → Takviyeler (api/supplement.ts)
 * ├── communityAPI     → Topluluk (api/community.ts)
 * ├── familyAPI        → Aile takibi (api/family.ts)
 * ├── wearableAPI      → Giyilebilirler (api/wearable.ts)
 * ├── notificationAPI  → Bildirimler (api/notification.ts)
 * └── challengeAPI     → Görevler (api/notification.ts)
 *
 * Yeni import yolu: @/lib/api (auto-resolves to api/index.ts)
 */

// Re-export everything from modular api/
export * from './api/index';
