/**
 * Myora – API Ortak Katman
 * Tüm API modülleri tarafından paylaşılan tipler, yardımcı fonksiyonlar ve Supabase erişimi.
 */

import { supabase } from '@/lib/supabase';

// Re-export supabase for use in API modules
export { supabase };

// ─────────────────────────────────────────────────────────────
// USER ID CACHE
// ─────────────────────────────────────────────────────────────

let _userIdPromise: Promise<string> | null = null;
let _userIdCache: string | null = null;
let _userIdCacheTs = 0;
const USER_ID_TTL = 30_000; // 30s cache

export async function getCurrentSupabaseUserId(): Promise<string> {
  if (_userIdCache && Date.now() - _userIdCacheTs < USER_ID_TTL) {
    return _userIdCache;
  }
  if (_userIdPromise) return _userIdPromise;

  _userIdPromise = (async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw new Error('Oturum bulunamadı');
      _userIdCache = data.user.id;
      _userIdCacheTs = Date.now();
      return data.user.id;
    } finally {
      _userIdPromise = null;
    }
  })();

  return _userIdPromise;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, content] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || 'application/octet-stream';
  const binary = atob(content);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

export async function uploadDataUrlToStorage(dataUrl: string, path: string): Promise<string> {
  const blob = dataUrlToBlob(dataUrl);
  const { error } = await supabase.storage
    .from('health-uploads')
    .upload(path, blob, {
      contentType: blob.type,
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from('health-uploads').getPublicUrl(path);
  return data.publicUrl;
}

export async function invokeHealthAnalysis(type: string, payload: Record<string, unknown>) {
  const timeoutMs = 45000;
  const invokePromise = supabase.functions.invoke('analyze-health-data', {
    body: { type, ...payload },
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('AI analiz zaman aşımına uğradı. Lütfen tekrar deneyin.'));
    }, timeoutMs);
  });

  const { data, error } = await Promise.race([
    invokePromise,
    timeoutPromise,
  ]) as Awaited<typeof invokePromise>;

  if (error) {
    throw new Error(typeof error === 'object' && 'message' in error ? (error as any).message : String(error));
  }

  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error(String((data as any).error));
  }

  if (!data) {
    throw new Error('AI analiz yanıt vermedi. Lütfen tekrar deneyin.');
  }

  return data as Record<string, any>;
}

export function normalizeBloodTestMarkers(markers: unknown) {
  if (Array.isArray(markers)) return markers;
  if (!markers || typeof markers !== 'object') return [];
  return Object.entries(markers as Record<string, any>).map(([name, marker]) => ({
    name,
    value: marker?.value ?? null,
    unit: marker?.unit ?? null,
    referenceMin: marker?.referenceMin ?? marker?.min ?? null,
    referenceMax: marker?.referenceMax ?? marker?.max ?? null,
    status: marker?.status ?? null,
    category: marker?.category ?? null,
    interpretation: marker?.interpretation ?? null,
  }));
}
