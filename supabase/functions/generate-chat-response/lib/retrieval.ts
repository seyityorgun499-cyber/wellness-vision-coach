/**
 * RAG Retrieval Module
 *
 * Kullanıcının sorusunu embedding'e çevirip bilimsel kaynak chunk'larını
 * pgvector ile semantik arama yaparak getirir.
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

export interface RetrievedChunk {
  id: string;
  sourceId: string;
  chunkIndex: number;
  section: string;
  content: string;
  tokenCount: number;
  similarity: number;
  sourceTitle: string;
  sourceAuthors: string[];
  sourceJournal: string | null;
  sourceYear: number | null;
  sourceCategory: string | null;
}

interface RetrievalOptions {
  category?: string | null;
  language?: string;
  verifiedOnly?: boolean;
  matchThreshold?: number;
  matchCount?: number;
}

export async function retrieveChunks(
  supabase: SupabaseClient,
  queryEmbedding: number[],
  options: RetrievalOptions = {},
): Promise<RetrievedChunk[]> {
  const {
    category = null,
    language = null,
    verifiedOnly = true,
    matchThreshold = 0.35,
    matchCount = 8,
  } = options;

  const { data, error } = await supabase.rpc('match_source_chunks', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: matchThreshold,
    match_count: matchCount,
    filter_category: category,
    filter_language: language,
    filter_verified: verifiedOnly ? true : null,
  });

  if (error) {
    console.error('Retrieval error:', error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    sourceId: row.source_id,
    chunkIndex: row.chunk_index,
    section: row.section,
    content: row.content,
    tokenCount: row.token_count,
    similarity: row.similarity,
    sourceTitle: row.source_title,
    sourceAuthors: row.source_authors ?? [],
    sourceJournal: row.source_journal,
    sourceYear: row.source_year,
    sourceCategory: row.source_category,
  }));
}

export async function generateQueryEmbedding(
  openAiKey: string,
  query: string,
): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: query,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding API error: ${response.status} ${errorText}`);
  }

  const json = await response.json();
  return json.data[0].embedding;
}
