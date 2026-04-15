/**
 * Prompt Assembly Module
 *
 * Kullanıcı bağlamı, bilimsel kanıtlar ve konuşma geçmişini
 * birleştirerek final system prompt'u oluşturur.
 */

import { type UserContext } from './context.ts';
import { type RetrievedChunk } from './retrieval.ts';
import { type SafetyCheck } from './safety.ts';
import { type Topic } from './topic.ts';

interface PromptInput {
  userContext: UserContext;
  retrievedChunks: RetrievedChunk[];
  topic: Topic;
  safety: SafetyCheck;
  conversationHistory: Array<{ role: string; content: string }>;
  currentMessage: string;
}

export function buildSystemPrompt(input: PromptInput): string {
  const { userContext, retrievedChunks, topic, safety } = input;

  // ── 1. Role & Rules ──────────────────────────────────
  let prompt = `Sen Myora AI sağlık danışmanısın. Bilimsel kaynaklara dayalı, kişiselleştirilmiş sağlık önerileri sunuyorsun.

KURALLAR:
1. GÜVENİLİR OL: Sadece kanıta dayalı bilgi paylaş. Hurafelere yer verme.
2. KİŞİSELLEŞTİR: Kullanıcının sağlık profilini, beslenme alışkanlıklarını, kan tahlili sonuçlarını, aktivite düzeyini ve giyilebilir cihaz verilerini dikkate al.
3. KAYNAKLI KONUŞ: Mümkün olduğunda bilimsel kaynaklara atıfta bulun. Kaynak numarasını [1], [2] şeklinde belirt.
4. EMPATİK OL: Sıcak ama profesyonel bir dil kullan. Türkçe yanıt ver.
5. SINIRLARINI BİL: Kesin tanı koyma, gerektiğinde doktora yönlendir.
6. DÜRÜST OL: Yeterli verin yoksa bunu açıkça belirt.
7. PRATİK OL: Somut, uygulanabilir öneriler ver.
8. VERİ ODAKLI OL: Kullanıcının BUGÜNKÜ besin alımını (kalori, protein, karb, yağ) mutlaka yanıtında referans al. Eğer bugün hiç besin kaydı yoksa "bugün henüz bir şey kaydetmemişsiniz" de ve günlük hedef öner. Eğer kayıt varsa mevcut toplamı belirt ve kalan hedefi hesapla.
9. EKSİK VERİ BELİRT: Profil, aktivite, kan tahlili gibi veriler eksikse bunu nazikçe belirt ve bu verileri girmesini öner — daha iyi kişiselleştirme için.`;

  // ── 2. Safety Override ───────────────────────────────
  if (safety.isHighRisk) {
    prompt += `

⚠️ YÜKSEK RİSKLİ DURUM TESPİT EDİLDİ (${safety.flags.join(', ')}).
Bu durumda:
- Wellness tarzı rahat tavsiye VERME.
- Acil tıbbi yardım gerektiğini net şekilde belirt.
- 112 veya ilgili acil hattını öner.
- Ardından genel bilgi verebilirsin ama önce güvenlik mesajını ver.`;
  }

  // ── 3. User Profile Context ──────────────────────────
  prompt += '\n\n─── KULLANICI VERİLERİ ───';

  if (userContext.profile) {
    prompt += `\n\n📋 Sağlık Profili:\n${userContext.profile}`;
  }
  if (userContext.nutrition) {
    prompt += `\n\n🍽️ Beslenme (son 7 gün):\n${userContext.nutrition}`;
  }
  if (userContext.activity) {
    prompt += `\n\n🏃 Aktivite (son 7 gün):\n${userContext.activity}`;
  }
  if (userContext.wearables) {
    prompt += `\n\n⌚ Giyilebilir Cihaz Verileri:\n${userContext.wearables}`;
  }
  if (userContext.bloodTests) {
    prompt += `\n\n🩸 Kan Tahlili:\n${userContext.bloodTests}`;
  }
  if (userContext.fasting) {
    prompt += `\n\n⏱️ Aralıklı Oruç:\n${userContext.fasting}`;
  }
  if (userContext.voiceMood) {
    prompt += `\n\n🎤 Ruh Hali / Sesli Günlük:\n${userContext.voiceMood}`;
  }
  if (userContext.documents) {
    prompt += `\n\n📄 Sağlık Belgeleri:\n${userContext.documents}`;
  }

  if (userContext.gaps.length > 0) {
    prompt += `\n\n⚠️ Eksik Veri Alanları:\n${userContext.gaps.map(g => `- ${g}`).join('\n')}`;
  }

  // ── 4. Scientific Evidence ───────────────────────────
  if (retrievedChunks.length > 0) {
    prompt += '\n\n─── BİLİMSEL KAYNAKLAR ───\n';
    retrievedChunks.forEach((chunk, i) => {
      const authors = chunk.sourceAuthors.length > 0
        ? chunk.sourceAuthors.slice(0, 2).join(', ') + (chunk.sourceAuthors.length > 2 ? ' et al.' : '')
        : 'Bilinmeyen yazar';
      prompt += `\n[${i + 1}] ${chunk.sourceTitle} (${authors}, ${chunk.sourceYear ?? '?'}) — ${chunk.sourceJournal ?? ''}\nBölüm: ${chunk.section}\n${chunk.content}\n`;
    });
  }

  // ── 5. Topic hint ────────────────────────────────────
  if (topic !== 'general') {
    const topicLabels: Record<string, string> = {
      nutrition: 'beslenme',
      exercise: 'egzersiz',
      sleep: 'uyku',
      supplements: 'takviye gıda',
      blood_test: 'kan tahlili',
      mental_health: 'mental sağlık',
      fasting: 'aralıklı oruç',
    };
    prompt += `\n\nBu soru "${topicLabels[topic] || topic}" konusuyla ilgili. Yanıtını bu alana odakla.`;
  }

  // ── 6. Output Format ────────────────────────────────
  prompt += `

─── ÇIKTI FORMATI ───
Yanıtını aşağıdaki JSON formatında ver. Başka bir şey yazma, sadece JSON döndür:
{
  "content": "Markdown formatında ana yanıt metni. Kaynaklara [1], [2] şeklinde atıf yap.",
  "citations": [
    { "sourceId": "kaynak-uuid", "title": "Kaynak başlığı", "excerpt": "İlgili kısa alıntı" }
  ],
  "suggestedFollowUps": ["Takip sorusu 1", "Takip sorusu 2", "Takip sorusu 3"]
}`;

  return prompt;
}

export function buildMessages(
  systemPrompt: string,
  history: Array<{ role: string; content: string }>,
  currentMessage: string,
): Array<{ role: string; content: string }> {
  return [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10),
    { role: 'user', content: currentMessage },
  ];
}
