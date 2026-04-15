/**
 * RAG Web Ingestion Pipeline
 *
 * URL'lerden sayfa içeriği çeker, chunklar, embed eder ve Supabase'e kaydeder.
 *
 * Kullanım:
 *   npx tsx scripts/rag/ingest-urls.ts
 *
 * Gereksinimler (.env):
 *   SUPABASE_URL (veya VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *   OPENAI_API_KEY
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as cheerio from 'cheerio';

// ── ENV ────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ── İngest Edilecek URL'ler ────────────────────────────
interface SourceURL {
  url: string;
  title: string;
  authors: string[];
  journal: string;
  published_year: number;
  category: string;
  tags: string[];
  language: string;
}

const SOURCE_URLS: SourceURL[] = [
  // ═══ Huberman Lab Newsletters (doğrulanmış URL'ler) ═══
  {
    url: 'https://www.hubermanlab.com/newsletter/toolkit-for-sleep',
    title: 'Huberman Lab: Sleep Toolkit — Uyku Optimizasyonu',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Newsletter',
    published_year: 2024,
    category: 'sleep',
    tags: ['huberman', 'uyku', 'sirkadiyen', 'protokol'],
    language: 'en',
  },
  {
    url: 'https://www.hubermanlab.com/newsletter/foundational-fitness-protocol',
    title: 'Huberman Lab: Foundational Fitness Protocol',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Newsletter',
    published_year: 2024,
    category: 'exercise',
    tags: ['huberman', 'egzersiz', 'fitness', 'protokol'],
    language: 'en',
  },
  {
    url: 'https://www.hubermanlab.com/newsletter/tools-to-manage-dopamine-and-improve-motivation-and-drive',
    title: 'Huberman Lab: Dopamin Yönetimi ve Motivasyon',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Newsletter',
    published_year: 2024,
    category: 'mental_health',
    tags: ['huberman', 'dopamin', 'motivasyon', 'protokol'],
    language: 'en',
  },
  {
    url: 'https://www.hubermanlab.com/newsletter/teach-and-learn-better-with-a-neuroplasticity-super-protocol',
    title: 'Huberman Lab: Nöroplastisite Süper Protokolü',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Newsletter',
    published_year: 2024,
    category: 'mental_health',
    tags: ['huberman', 'nöroplastisite', 'öğrenme', 'protokol'],
    language: 'en',
  },
  {
    url: 'https://www.hubermanlab.com/newsletter/the-science-and-use-of-cold-exposure-for-health-and-performance',
    title: 'Huberman Lab: Soğuk Maruziyet Bilimi ve Sağlık',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Newsletter',
    published_year: 2024,
    category: 'exercise',
    tags: ['huberman', 'soğuk', 'dopamin', 'toparlanma', 'protokol'],
    language: 'en',
  },
  {
    url: 'https://www.hubermanlab.com/newsletter/deliberate-heat-exposure-protocols-for-health-and-performance',
    title: 'Huberman Lab: Isı Maruziyeti ve Sauna Protokolleri',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Newsletter',
    published_year: 2024,
    category: 'exercise',
    tags: ['huberman', 'sauna', 'ısı', 'kardiyovasküler', 'protokol'],
    language: 'en',
  },
  {
    url: 'https://www.hubermanlab.com/newsletter/improve-working-memory-attention',
    title: 'Huberman Lab: Çalışma Belleği ve Dikkat Geliştirme',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Newsletter',
    published_year: 2024,
    category: 'mental_health',
    tags: ['huberman', 'odaklanma', 'dikkat', 'bellek', 'protokol'],
    language: 'en',
  },
  // ═══ Huberman Lab Blog Posts (doğrulanmış URL'ler) ═══
  {
    url: 'https://www.hubermanlab.com/newsletter/toolkit-for-setting-achieving-goals',
    title: 'Huberman Lab: Hedef Belirleme ve Başarma Toolkit',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Newsletter',
    published_year: 2024,
    category: 'mental_health',
    tags: ['huberman', 'hedef', 'motivasyon', 'dopamin'],
    language: 'en',
  },
  {
    url: 'https://www.hubermanlab.com/newsletter/breathwork-protocols-for-health-focus-stress',
    title: 'Huberman Lab: Nefes Protokolleri — Sağlık, Odak, Stres',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Newsletter',
    published_year: 2024,
    category: 'general',
    tags: ['huberman', 'nefes', 'stres', 'performans'],
    language: 'en',
  },
  {
    url: 'https://www.hubermanlab.com/newsletter/using-light-for-health',
    title: 'Huberman Lab: Sağlık İçin Işık Kullanımı',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Newsletter',
    published_year: 2024,
    category: 'sleep',
    tags: ['huberman', 'ışık', 'sirkadiyen', 'güneş'],
    language: 'en',
  },
  {
    url: 'https://www.hubermanlab.com/newsletter/6-key-tools-to-improve-your-gut-microbiome-health',
    title: 'Huberman Lab: Bağırsak Mikrobiyomu İyileştirme',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Newsletter',
    published_year: 2024,
    category: 'nutrition',
    tags: ['huberman', 'mikrobiyom', 'bağırsak', 'probiyotik'],
    language: 'en',
  },
  {
    url: 'https://www.hubermanlab.com/newsletter/build-or-break-habits-using-science-based-tools',
    title: 'Huberman Lab: Bilimsel Alışkanlık Oluşturma',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Newsletter',
    published_year: 2024,
    category: 'mental_health',
    tags: ['huberman', 'alışkanlık', 'dopamin', 'davranış'],
    language: 'en',
  },
  {
    url: 'https://www.hubermanlab.com/newsletter/improve-your-sleep',
    title: 'Huberman Lab: Uykunuzu İyileştirin',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Newsletter',
    published_year: 2024,
    category: 'sleep',
    tags: ['huberman', 'uyku', 'melatonin', 'sirkadiyen'],
    language: 'en',
  },
  {
    url: 'https://www.hubermanlab.com/newsletter/exercises-and-nutrition-to-support-eye-health',
    title: 'Huberman Lab: Göz Sağlığı İçin Egzersiz ve Beslenme',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Newsletter',
    published_year: 2024,
    category: 'general',
    tags: ['huberman', 'göz-sağlığı', 'görme', 'beslenme'],
    language: 'en',
  },
  {
    url: 'https://www.hubermanlab.com/newsletter/5-science-based-steps-to-improve-your-workspace',
    title: 'Huberman Lab: Çalışma Alanı Optimizasyonu',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Newsletter',
    published_year: 2024,
    category: 'mental_health',
    tags: ['huberman', 'verimlilik', 'odaklanma', 'çalışma-alanı'],
    language: 'en',
  },
  // ═══ PubMed / Bilimsel Kaynaklar ═══
  {
    url: 'https://pubmed.ncbi.nlm.nih.gov/29497353/',
    title: 'Systematic Review: Protein Supplementation and Resistance Training',
    authors: ['Morton RW', 'Murphy KT', 'McKellar SR'],
    journal: 'British Journal of Sports Medicine',
    published_year: 2018,
    category: 'nutrition',
    tags: ['protein', 'kas', 'egzersiz', 'meta-analiz'],
    language: 'en',
  },
  {
    url: 'https://pubmed.ncbi.nlm.nih.gov/28768407/',
    title: 'Vitamin D and Health Outcomes: Umbrella Review',
    authors: ['Theodoratou E', 'Tzoulaki I', 'Zgaga L'],
    journal: 'BMJ',
    published_year: 2014,
    category: 'supplements',
    tags: ['vitamin-d', 'kemik', 'bağışıklık', 'meta-analiz'],
    language: 'en',
  },
  {
    url: 'https://pubmed.ncbi.nlm.nih.gov/32527625/',
    title: 'Sleep Duration and Health: Systematic Review and Meta-Analysis',
    authors: ['Yin J', 'Jin X', 'Shan Z'],
    journal: 'Sleep Medicine Reviews',
    published_year: 2017,
    category: 'sleep',
    tags: ['uyku', 'kardiyovasküler', 'mortalite', 'meta-analiz'],
    language: 'en',
  },
  {
    url: 'https://pubmed.ncbi.nlm.nih.gov/30153464/',
    title: 'Intermittent Fasting: Effects on Health, Aging, and Disease',
    authors: ['de Cabo R', 'Mattson MP'],
    journal: 'New England Journal of Medicine',
    published_year: 2019,
    category: 'nutrition',
    tags: ['oruç', 'aralıklı-oruç', 'metabolizma', 'otofaji'],
    language: 'en',
  },
  {
    url: 'https://pubmed.ncbi.nlm.nih.gov/30817827/',
    title: 'Gut Microbiota and Diet in Health and Disease',
    authors: ['Zmora N', 'Suez J', 'Elinav E'],
    journal: 'Nature Reviews Gastroenterology & Hepatology',
    published_year: 2019,
    category: 'nutrition',
    tags: ['mikrobiyom', 'bağırsak', 'probiyotik', 'fermente'],
    language: 'en',
  },
];

// ── Web Scraping ───────────────────────────────────────

async function fetchPageContent(url: string): Promise<string> {
  console.log(`  🌐 Fetching: ${url}`);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; WellnessVisionCoach/1.0; RAG-Ingestion)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.text();
}

function extractTextFromHTML(html: string): { title: string; sections: { heading: string; content: string }[] } {
  const $ = cheerio.load(html);

  // Remove non-content elements
  $('script, style, nav, footer, header, iframe, noscript, .sidebar, .navigation, .menu, .ad, .advertisement, .cookie-banner, .popup').remove();

  const pageTitle = $('title').text().trim() || $('h1').first().text().trim();

  const sections: { heading: string; content: string }[] = [];
  let currentHeading = 'Introduction';
  let currentContent: string[] = [];

  // Walk through main content area
  const mainContent = $('article, main, .content, .post-content, .entry-content, .newsletter-content, [role="main"]').first();
  const contentRoot = mainContent.length > 0 ? mainContent : $('body');

  contentRoot.find('h1, h2, h3, h4, h5, h6, p, li, blockquote, td').each((_, el) => {
    const tag = (el as any).tagName?.toLowerCase();
    const text = $(el).text().trim().replace(/\s+/g, ' ');

    if (!text || text.length < 10) return;

    if (tag && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
      // Save previous section
      if (currentContent.length > 0) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join(' '),
        });
      }
      currentHeading = text;
      currentContent = [];
    } else {
      currentContent.push(text);
    }
  });

  // Push last section
  if (currentContent.length > 0) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join(' '),
    });
  }

  // If no sections found, try plain text extraction
  if (sections.length === 0) {
    const bodyText = contentRoot.text().trim().replace(/\s+/g, ' ');
    if (bodyText.length > 100) {
      sections.push({ heading: 'Content', content: bodyText });
    }
  }

  return { title: pageTitle, sections };
}

// ── Chunking ───────────────────────────────────────────

const MAX_CHUNK_CHARS = 1500;
const OVERLAP_CHARS = 200;

function chunkText(text: string, sectionHeading: string): { section: string; content: string }[] {
  if (text.length <= MAX_CHUNK_CHARS) {
    return [{ section: sectionHeading, content: text }];
  }

  const chunks: { section: string; content: string }[] = [];
  let start = 0;
  let partNum = 1;

  while (start < text.length) {
    let end = start + MAX_CHUNK_CHARS;

    // Try to break at sentence boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('. ', end);
      const lastNewline = text.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > start + MAX_CHUNK_CHARS * 0.5) {
        end = breakPoint + 1;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 50) {
      chunks.push({
        section: sections_count > 1 ? `${sectionHeading} (Part ${partNum})` : sectionHeading,
        content: chunk,
      });
      partNum++;
    }

    start = end - OVERLAP_CHARS;
    if (start < 0) start = 0;
    if (end >= text.length) break;
  }

  return chunks;
}

// Hack for chunk naming
let sections_count = 0;

function chunkSections(sections: { heading: string; content: string }[]): { section: string; content: string }[] {
  const allChunks: { section: string; content: string }[] = [];
  sections_count = sections.length;

  for (const sec of sections) {
    if (sec.content.length < 50) continue;
    const chunks = chunkText(sec.content, sec.heading);
    allChunks.push(...chunks);
  }

  return allChunks;
}

// ── Embedding ──────────────────────────────────────────

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000), // Token limit safety
  });
  return response.data[0].embedding;
}

// ── Duplicate Check ────────────────────────────────────

async function sourceExists(url: string): Promise<boolean> {
  const { data } = await supabase
    .from('scientific_sources')
    .select('id')
    .eq('url', url)
    .maybeSingle();
  return !!data;
}

// ── Main Pipeline ──────────────────────────────────────

async function ingestURL(source: SourceURL): Promise<{ chunks: number; skipped: boolean }> {
  // Check duplicate
  if (await sourceExists(source.url)) {
    console.log(`  ⏭️  Zaten mevcut, atlanıyor: ${source.title}`);
    return { chunks: 0, skipped: true };
  }

  // Fetch page
  let html: string;
  try {
    html = await fetchPageContent(source.url);
  } catch (err: any) {
    console.error(`  ❌ Fetch hatası: ${err.message}`);
    return { chunks: 0, skipped: true };
  }

  // Extract text
  const { title: pageTitle, sections } = extractTextFromHTML(html);
  if (sections.length === 0) {
    console.error(`  ⚠️  İçerik çıkarılamadı: ${source.url}`);
    return { chunks: 0, skipped: true };
  }

  const totalText = sections.map(s => s.content).join(' ');
  console.log(`  📝 Çıkarılan metin: ${totalText.length} karakter, ${sections.length} bölüm`);

  // Chunk
  const chunks = chunkSections(sections);
  if (chunks.length === 0) {
    console.error(`  ⚠️  Chunklanacak içerik yok`);
    return { chunks: 0, skipped: true };
  }
  console.log(`  🧩 ${chunks.length} chunk oluşturuldu`);

  // Insert source
  const { data: inserted, error: sourceError } = await supabase
    .from('scientific_sources')
    .insert({
      title: source.title || pageTitle,
      authors: source.authors,
      journal: source.journal,
      published_year: source.published_year,
      url: source.url,
      category: source.category,
      tags: source.tags,
      language: source.language,
      is_verified: false, // Web'den çekilen kaynaklar doğrulanmamış
      abstract: totalText.slice(0, 500),
    })
    .select('id')
    .single();

  if (sourceError) {
    console.error(`  ❌ Source insert hatası:`, sourceError.message);
    return { chunks: 0, skipped: true };
  }

  const sourceId = inserted.id;

  // Embed and insert chunks
  let successCount = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      const embedding = await generateEmbedding(chunk.content);

      const { error: chunkError } = await supabase
        .from('scientific_source_chunks')
        .insert({
          source_id: sourceId,
          chunk_index: i,
          section: chunk.section,
          content: chunk.content,
          token_count: Math.ceil(chunk.content.split(/\s+/).length * 1.3),
          embedding,
        });

      if (chunkError) {
        console.error(`    ❌ Chunk ${i} insert hatası:`, chunkError.message);
      } else {
        successCount++;
      }
    } catch (err: any) {
      console.error(`    ❌ Chunk ${i} embedding hatası:`, err.message);
    }

    // Rate limit: OpenAI embedding API
    if (i < chunks.length - 1) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log(`  ✅ ${successCount}/${chunks.length} chunk kaydedildi`);
  return { chunks: successCount, skipped: false };
}

async function main() {
  console.log('🚀 Web Ingestion Pipeline başlatılıyor...\n');
  console.log(`📋 ${SOURCE_URLS.length} URL işlenecek\n`);

  let totalSources = 0;
  let totalChunks = 0;
  let skippedCount = 0;

  for (const source of SOURCE_URLS) {
    console.log(`\n📄 ${source.title}`);
    const result = await ingestURL(source);
    if (result.skipped) {
      skippedCount++;
    } else {
      totalSources++;
      totalChunks += result.chunks;
    }

    // Rate limit between sources
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`✅ Tamamlandı!`);
  console.log(`   Yeni kaynaklar: ${totalSources}`);
  console.log(`   Toplam chunk: ${totalChunks}`);
  console.log(`   Atlanan (mevcut/hatalı): ${skippedCount}`);
  console.log('═'.repeat(50));
}

main().catch((err) => {
  console.error('💥 Pipeline hatası:', err);
  process.exit(1);
});
