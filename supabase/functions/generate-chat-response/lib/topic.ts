/**
 * Topic Classification Module
 *
 * Kullanıcının mesajından konuyu belirler.
 * İlk versiyon keyword-based; ileride LLM-based routing eklenebilir.
 */

export type Topic =
  | 'nutrition'
  | 'exercise'
  | 'sleep'
  | 'supplements'
  | 'blood_test'
  | 'mental_health'
  | 'fasting'
  | 'general';

interface TopicRule {
  topic: Topic;
  keywords: string[];
}

const TOPIC_RULES: TopicRule[] = [
  {
    topic: 'nutrition',
    keywords: [
      'yemek', 'kalori', 'protein', 'karbonhidrat', 'yağ', 'makro', 'beslenme',
      'diyet', 'besin', 'vitamin', 'mineral', 'öğün', 'kahvaltı', 'öğle', 'akşam',
      'atıştırmalık', 'su', 'hidrasyon', 'demir', 'kalsiyum', 'lif', 'fiber',
      'meyve', 'sebze', 'et', 'balık', 'süt', 'yumurta', 'gluten', 'vegan',
      'vejeteryan', 'food', 'nutrition', 'calorie', 'macro', 'diet',
    ],
  },
  {
    topic: 'exercise',
    keywords: [
      'egzersiz', 'antrenman', 'spor', 'koşu', 'yürüyüş', 'yüzme', 'bisiklet',
      'yoga', 'pilates', 'ağırlık', 'kas', 'kardio', 'HIIT', 'adım', 'kalori yakma',
      'aktivite', 'fitness', 'gym', 'bench', 'squat', 'deadlift', 'stretching',
      'exercise', 'workout', 'running', 'walking', 'steps',
    ],
  },
  {
    topic: 'sleep',
    keywords: [
      'uyku', 'uyumak', 'uyanmak', 'insomnia', 'uykusuzluk', 'melatonin',
      'uyku kalitesi', 'uyku düzeni', 'REM', 'derin uyku', 'uyku hijyeni',
      'gece', 'yatmak', 'sabah', 'sleep', 'rest', 'nap',
    ],
  },
  {
    topic: 'supplements',
    keywords: [
      'takviye', 'vitamin', 'mineral', 'omega', 'probiyotik', 'kreatin',
      'magnezyum', 'çinko', 'B12', 'D vitamini', 'C vitamini', 'demir takviye',
      'supplement', 'multivitamin', 'fish oil', 'whey', 'BCAA', 'kolajen',
    ],
  },
  {
    topic: 'blood_test',
    keywords: [
      'kan', 'tahlil', 'test', 'ferritin', 'hemoglobin', 'kolesterol', 'trigliserid',
      'HDL', 'LDL', 'TSH', 'tiroid', 'HbA1c', 'glukoz', 'şeker', 'karaciğer',
      'böbrek', 'kreatinin', 'ALT', 'AST', 'CRP', 'sedimentasyon', 'lökosit',
      'eritrosit', 'trombosit', 'blood', 'lab', 'marker', 'iron',
    ],
  },
  {
    topic: 'mental_health',
    keywords: [
      'stres', 'anksiyete', 'depresyon', 'ruh hali', 'mood', 'kaygı', 'panik',
      'meditasyon', 'nefes', 'mindfulness', 'motivasyon', 'enerji', 'yorgunluk',
      'tükenmişlik', 'burnout', 'mutluluk', 'üzüntü', 'öfke', 'mental', 'psikoloji',
    ],
  },
  {
    topic: 'fasting',
    keywords: [
      'oruç', 'intermittent', 'fasting', 'aralıklı', '16:8', '18:6', '20:4',
      '5:2', 'eat-stop-eat', 'yeme penceresi', 'oruç tutmak', 'açlık',
    ],
  },
];

export function classifyTopic(message: string, existingTopic?: string | null): Topic {
  // Mevcut topic zaten spesifikse onu kullan
  if (existingTopic && existingTopic !== 'general') {
    return existingTopic as Topic;
  }

  const lower = message.toLowerCase();
  const scores: Record<Topic, number> = {
    nutrition: 0,
    exercise: 0,
    sleep: 0,
    supplements: 0,
    blood_test: 0,
    mental_health: 0,
    fasting: 0,
    general: 0,
  };

  for (const rule of TOPIC_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        scores[rule.topic]++;
      }
    }
  }

  const best = Object.entries(scores)
    .filter(([key]) => key !== 'general')
    .sort((a, b) => b[1] - a[1])[0];

  return (best && best[1] > 0) ? best[0] as Topic : 'general';
}
