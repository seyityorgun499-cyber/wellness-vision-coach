/**
 * Safety & Guardrails Module
 *
 * Yüksek riskli sağlık intent'lerini tespit eder.
 * Acil durumları işaretleyerek chatbot'un doktora yönlendirmesini sağlar.
 */

export interface SafetyCheck {
  isHighRisk: boolean;
  flags: string[];
  urgentMessage: string | null;
}

interface RiskPattern {
  keywords: string[];
  flag: string;
  urgentMessage: string;
}

const RISK_PATTERNS: RiskPattern[] = [
  {
    keywords: ['göğüs ağrısı', 'göğsüm ağrıyor', 'kalp ağrısı', 'kalp krizi', 'chest pain'],
    flag: 'cardiac_emergency',
    urgentMessage: 'Göğüs ağrısı ciddi bir semptom olabilir. Lütfen en kısa sürede 112 veya en yakın acil servisi arayın.',
  },
  {
    keywords: ['nefes darlığı', 'nefes alamıyorum', 'soluk alamıyorum', 'boğuluyorum', 'shortness of breath'],
    flag: 'respiratory_emergency',
    urgentMessage: 'Nefes darlığı acil tıbbi müdahale gerektirebilir. Lütfen 112 veya en yakın acil servisi arayın.',
  },
  {
    keywords: ['bayılma', 'bayıldım', 'bilinç kaybı', 'kendimden geçtim', 'fainting'],
    flag: 'syncope',
    urgentMessage: 'Bayılma veya bilinç kaybı önemli bir sağlık belirtisidir. Lütfen en kısa sürede bir doktora başvurun.',
  },
  {
    keywords: ['intihar', 'kendime zarar', 'yaşamak istemiyorum', 'ölmek istiyorum', 'suicidal'],
    flag: 'mental_health_crisis',
    urgentMessage: 'Zor bir dönemden geçtiğinizi anlıyorum. Lütfen hemen 182 (İntihar Önleme Hattı) veya 112\'yi arayın. Yalnız değilsiniz.',
  },
  {
    keywords: ['aşırı kanama', 'çok kanıyor', 'kan durmuyor', 'heavy bleeding'],
    flag: 'hemorrhage',
    urgentMessage: 'Durdurulamayan kanama acil tıbbi müdahale gerektirir. Lütfen 112\'yi arayın.',
  },
  {
    keywords: ['alerjik şok', 'anafilaksi', 'yüzüm şişti', 'dudağım şişti', 'nefes yolu tıkanıyor', 'anaphylaxis'],
    flag: 'anaphylaxis',
    urgentMessage: 'Alerjik reaksiyon hayati tehlike oluşturabilir. Eğer adrenalin otoenjektörünüz varsa kullanın ve 112\'yi arayın.',
  },
  {
    keywords: ['zehirlenme', 'yanlış ilaç', 'aşırı doz', 'overdose', 'poisoning'],
    flag: 'poisoning',
    urgentMessage: 'Zehirlenme veya aşırı doz şüphesi durumunda lütfen 114 (Ulusal Zehir Danışma Merkezi) veya 112\'yi arayın.',
  },
];

export function checkSafety(message: string): SafetyCheck {
  const lower = message.toLowerCase();
  const flags: string[] = [];
  let urgentMessage: string | null = null;

  for (const pattern of RISK_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        flags.push(pattern.flag);
        if (!urgentMessage) {
          urgentMessage = pattern.urgentMessage;
        }
        break;
      }
    }
  }

  return {
    isHighRisk: flags.length > 0,
    flags: [...new Set(flags)],
    urgentMessage,
  };
}
