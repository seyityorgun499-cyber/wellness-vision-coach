/**
 * Myora – Client API Katmanı (Modüler)
 *
 * Tüm backend servislerine erişim sağlayan tip-güvenli API istemcisi.
 * Önceki tek dosya (api.ts) yerine modüler yapıya dönüştürüldü.
 *
 * API Yapısı:
 * ├── authAPI          → Kimlik doğrulama & kullanıcı profili
 * ├── healthAPI        → Sağlık takibi (kalori, su, aktivite, oruç, hedefler, başarımlar)
 * ├── chatAPI          → AI sohbet botu (RAG tabanlı)
 * ├── supplementAPI    → Takviye gıda & sipariş
 * ├── communityAPI     → Topluluk
 * ├── familyAPI        → Aile takibi (ilaç & takviye kontrolü)
 * ├── wearableAPI      → Giyilebilir cihazlar
 * └── notificationAPI  → Akıllı bildirimler
 * └── challengeAPI     → Haftalık görevler
 */

// Re-export all types
export * from './types';

// Re-export all APIs
export { authAPI } from './auth';
export { healthAPI } from './health';
export { chatAPI } from './chat';
export { supplementAPI } from './supplement';
export { communityAPI } from './community';
export { familyAPI } from './family';
export { wearableAPI } from './wearable';
export { notificationAPI, challengeAPI } from './notification';

// Re-export common utilities for advanced use cases
export { getCurrentSupabaseUserId, supabase } from './_common';
