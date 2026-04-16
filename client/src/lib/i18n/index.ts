/**
 * Myora – i18n Module
 * Dynamic language loading for reduced initial bundle size
 */

import type { TranslationKeys as ENKeys } from './en';
import type { TranslationKeys as TRKeys } from './tr';

export type Language = 'en' | 'tr';
export type TranslationKeys = ENKeys & TRKeys;

// Static imports for default language (TR) to avoid flash of untranslated content
import { tr } from './tr';

const defaultTranslations = tr;

// Dynamic import loader - only loads the active language
export async function loadTranslations(lang: Language): Promise<Record<string, string>> {
  if (lang === 'en') {
    const { en } = await import('./en');
    return en;
  }
  // TR is statically imported (default)
  return defaultTranslations;
}

// Merge with defaults to ensure no missing keys
export function mergeTranslations(loaded: Record<string, string>): Record<string, string> {
  return { ...defaultTranslations, ...loaded };
}

// Re-export type for convenience
export type { ENKeys, TRKeys };
