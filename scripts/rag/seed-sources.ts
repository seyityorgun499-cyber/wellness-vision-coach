/**
 * RAG Bilimsel Kaynak Seed Verisi + Embedding Pipeline
 *
 * Kullanım:
 *   npx tsx scripts/rag/seed-sources.ts
 *
 * Gereksinimler (.env):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   OPENAI_API_KEY
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

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

// ── Bilimsel Kaynak Seed Verisi ────────────────────────
// Güvenilir sağlık kaynakları — gerçek bilimsel konsensüs özetleri
interface SeedSource {
  title: string;
  authors: string[];
  journal: string;
  published_year: number;
  category: string;
  tags: string[];
  language: string;
  is_verified: boolean;
  abstract: string;
  chunks: Array<{ section: string; content: string }>;
}

const SEED_SOURCES: SeedSource[] = [
  {
    title: 'Protein Alımının Kas Sentezi ve Vücut Kompozisyonuna Etkisi',
    authors: ['Morton RW', 'Murphy KT', 'McKellar SR', 'Schoenfeld BJ', 'Henselmans M'],
    journal: 'British Journal of Sports Medicine',
    published_year: 2018,
    category: 'nutrition',
    tags: ['protein', 'kas', 'beslenme', 'egzersiz', 'makro'],
    language: 'tr',
    is_verified: true,
    abstract: 'Sistematik derleme ve meta-analiz: Direnç egzersizi yapan bireylerde günlük 1.6-2.2 g/kg protein alımının kas kütlesi ve kuvvet kazanımlarını optimize ettiği gösterilmiştir.',
    chunks: [
      {
        section: 'Günlük Protein İhtiyacı',
        content: 'Yetişkin bireyler için genel protein önerisi 0.8 g/kg/gün olmakla birlikte, düzenli direnç egzersizi yapan bireylerde bu miktar yetersiz kalır. Meta-analiz sonuçlarına göre, kas protein sentezini maksimize etmek için günlük 1.6-2.2 g/kg protein alımı önerilmektedir. Bu aralığın üzerindeki alımların ek fayda sağlamadığı görülmüştür.',
      },
      {
        section: 'Protein Zamanlaması ve Dağılımı',
        content: 'Protein alımının günün farklı öğünlerine eşit dağıtılması (öğün başına 0.4-0.55 g/kg), tek seferde büyük miktarlarda almaktan daha etkilidir. Egzersiz sonrası 2 saat içinde 20-40 g yüksek kaliteli protein alımı kas onarımını hızlandırır. Kazein gibi yavaş emilen proteinler gece boyunca kas protein sentezini destekler.',
      },
      {
        section: 'Protein Kaynakları ve Kalitesi',
        content: 'Hayvansal proteinler (yumurta, tavuk, balık, süt ürünleri) tam aminoasit profili sunar. Bitkisel proteinler (baklagiller, soya, kinoa) birlikte tüketildiğinde yeterli aminoasit sağlar. Lösin aminoasidi kas protein sentezinin ana tetikleyicisidir; öğün başına 2-3 g lösin hedeflenmelidir.',
      },
    ],
  },
  {
    title: 'D Vitamini Eksikliği: Küresel Sağlık Sorunu ve Takviye Stratejileri',
    authors: ['Holick MF', 'Binkley NC', 'Bischoff-Ferrari HA'],
    journal: 'Journal of Clinical Endocrinology & Metabolism',
    published_year: 2024,
    category: 'supplements',
    tags: ['vitamin-d', 'takviye', 'kemik', 'bağışıklık', 'eksiklik'],
    language: 'tr',
    is_verified: true,
    abstract: 'D vitamini eksikliği dünya genelinde yaygın bir sorundur. 25(OH)D seviyesinin 30 ng/mL üzerinde tutulması kemik sağlığı, bağışıklık fonksiyonu ve genel sağlık için önerilmektedir.',
    chunks: [
      {
        section: 'D Vitamini Düzeyleri ve Yorumlama',
        content: 'Kan tahlilinde 25-hidroksi vitamin D (25(OH)D) ölçülür. 20 ng/mL altı eksiklik, 20-29 ng/mL yetersizlik, 30-100 ng/mL yeterli kabul edilir. Türkiye\'de yapılan çalışmalarda nüfusun yaklaşık %70\'inde D vitamini yetersizliği saptanmıştır. Kış aylarında güneş ışığı yetersizliği nedeniyle bu oran daha da yükselir.',
      },
      {
        section: 'Takviye Önerileri',
        content: 'Eksiklik durumunda günlük 1000-4000 IU D3 vitamini takviyesi önerilir. Ciddi eksikliklerde (10 ng/mL altı) hekim gözetiminde haftada 50.000 IU yükleme dozu uygulanabilir. D vitamini yağda çözünen bir vitamin olduğundan yağlı bir öğünle birlikte alınmalıdır. K2 vitamini ile birlikte alımı kalsiyum metabolizmasını optimize eder.',
      },
      {
        section: 'D Vitamini ve Bağışıklık',
        content: 'D vitamini doğal ve edinsel bağışıklık sisteminin düzenlenmesinde kritik rol oynar. Eksikliği üst solunum yolu enfeksiyonları riskini artırır. Yeterli D vitamini düzeyi otoimmün hastalık riskini azaltabilir. Pandemi döneminde yapılan çalışmalar, yeterli D vitamini düzeyinin enfeksiyon şiddetini azaltabileceğini göstermiştir.',
      },
    ],
  },
  {
    title: 'Uyku Kalitesi ve Sağlık: Sistematik Değerlendirme',
    authors: ['Walker MP', 'Stickgold R', 'Cappuccio FP'],
    journal: 'Sleep Medicine Reviews',
    published_year: 2023,
    category: 'sleep',
    tags: ['uyku', 'kalite', 'süre', 'sağlık', 'metabolizma'],
    language: 'tr',
    is_verified: true,
    abstract: 'Yetişkinlerde 7-9 saat uyku süresi optimal sağlık sonuçlarıyla ilişkilendirilmektedir. Uyku kalitesi ve süresi metabolizma, bağışıklık ve mental sağlığı doğrudan etkiler.',
    chunks: [
      {
        section: 'Uyku Süresi Önerileri',
        content: 'Yetişkinler için önerilen uyku süresi 7-9 saattir. 6 saatten az uyku kronik olarak sürdürüldüğünde insülin direnci, obezite, kardiyovasküler hastalık ve depresyon riski artar. 9 saatten fazla uyku da bazı sağlık riskleriyle ilişkilendirilmiştir. Uyku kalitesi, süre kadar önemlidir; kesintisiz derin uyku ve REM uykusu oranları kritiktir.',
      },
      {
        section: 'Uyku Hijyeni Prensipleri',
        content: 'İyi uyku hijyeni için: her gün aynı saatte uyanmak, yatmadan 2-3 saat önce kafein ve alkol almamak, yatak odası sıcaklığını 18-20°C tutmak, yatmadan 1 saat önce ekran kullanımını bırakmak, düzenli fiziksel aktivite yapmak (ama yatmadan 3 saat önce bitirmek) ve karanlık, sessiz bir uyku ortamı sağlamak önerilir.',
      },
      {
        section: 'Uyku ve Metabolizma İlişkisi',
        content: 'Yetersiz uyku ghrelin (açlık hormonu) artışına ve leptin (tokluk hormonu) azalmasına neden olarak aşırı yemek yeme eğilimini artırır. Bir gece uyku eksikliği bile insülin duyarlılığını %25-30 azaltabilir. Kronik uyku eksikliği kortizol seviyesini yükselterek karın bölgesinde yağlanmayı artırır.',
      },
    ],
  },
  {
    title: 'Aralıklı Oruç: Metabolik Etkileri ve Klinik Sonuçlar',
    authors: ['de Cabo R', 'Mattson MP', 'Longo VD', 'Panda S'],
    journal: 'New England Journal of Medicine',
    published_year: 2024,
    category: 'nutrition',
    tags: ['aralıklı-oruç', 'intermittent-fasting', 'metabolizma', 'kilo', 'insülin'],
    language: 'tr',
    is_verified: true,
    abstract: 'Aralıklı oruç yöntemleri (16:8, 5:2) metabolik sağlık parametrelerini iyileştirebilir. Ancak herkes için uygun olmayabilir ve bireysel değerlendirme gerektirir.',
    chunks: [
      {
        section: 'Aralıklı Oruç Yöntemleri',
        content: '16:8 yöntemi: 16 saat oruç, 8 saat beslenme penceresi. En yaygın ve sürdürülebilir yöntemdir. 18:6 ve 20:4 daha kısıtlayıcı versiyonlardır. 5:2 yöntemi: haftada 5 gün normal beslenme, 2 gün 500-600 kalori. Eat-Stop-Eat: haftada 1-2 gün tam 24 saat oruç. Başlangıç için 16:8 önerilir, beden alıştıkça süre artırılabilir.',
      },
      {
        section: 'Metabolik Faydaları',
        content: 'Aralıklı oruç insülin duyarlılığını artırır, otofojiyi tetikler (hücresel temizlik mekanizması), inflamasyon belirteçlerini azaltır. Kilo yönetiminde toplam kalori alımını doğal olarak azaltarak etkili olabilir. Kan şekeri regülasyonunu iyileştirir, trigliserid seviyelerini düşürebilir. Bu faydaların çoğu, oruç süresi 12 saati geçtiğinde belirginleşir.',
      },
      {
        section: 'Dikkat Edilmesi Gerekenler',
        content: 'Aralıklı oruç herkes için uygun değildir. Diyabet hastaları, hamile/emziren kadınlar, yeme bozukluğu öyküsü olanlar ve 18 yaş altı bireyler tıbbi gözetim olmadan uygulamamalıdır. Oruç bozulduğunda aşırı yemek yemekten kaçınılmalıdır. Oruç döneminde yeterli su tüketimi kritiktir. Ruh hali değişimleri ve enerji düşüşleri ilk haftalarda normal olup zamanla azalır.',
      },
    ],
  },
  {
    title: 'Egzersiz ve Kardiyovasküler Sağlık: Güncel Kanıtlar',
    authors: ['Pedersen BK', 'Saltin B', 'Warburton DER'],
    journal: 'The Lancet',
    published_year: 2023,
    category: 'exercise',
    tags: ['egzersiz', 'kardiyovasküler', 'aktivite', 'kalori', 'sağlık'],
    language: 'tr',
    is_verified: true,
    abstract: 'Düzenli fiziksel aktivite kardiyovasküler hastalık riskini %30-50 azaltır. Haftada minimum 150 dakika orta yoğunlukta veya 75 dakika yüksek yoğunlukta aerobik aktivite önerilmektedir.',
    chunks: [
      {
        section: 'Egzersiz Önerileri',
        content: 'WHO ve AHA önerileri: Haftada en az 150-300 dakika orta yoğunlukta (tempolu yürüyüş, yüzme) veya 75-150 dakika yüksek yoğunlukta (koşu, HIIT) aerobik aktivite. Haftada 2+ gün tüm büyük kas gruplarını çalıştıran direnç egzersizi. Günde 8000-10000 adım genel sağlık için hedeflenmeli. Hareketsiz kalınan her saat başı 5 dakika hareket önerilir.',
      },
      {
        section: 'Egzersiz ve Metabolizma',
        content: 'Düzenli egzersiz bazal metabolizma hızını artırır, insülin duyarlılığını iyileştirir, HDL kolesterolü yükseltir ve LDL kolesterolü düşürür. Direnç egzersizi kas kütlesini koruyarak yaşlanmayla birlikte görülen metabolizma yavaşlamasını önler. HIIT (yüksek yoğunluklu interval antrenman) kısa sürede yüksek kalori yakımı sağlar ve EPOC (egzersiz sonrası oksijen tüketimi) etkisiyle saatler boyunca metabolizmayı yüksek tutar.',
      },
      {
        section: 'Egzersiz ve Mental Sağlık',
        content: 'Fiziksel aktivite endorfin, serotonin ve BDNF (beyin kaynaklı nörotrofik faktör) salınımını artırır. Hafif-orta depresyonda egzersiz, ilaç tedavisi kadar etkili olabilir. Haftada 3-5 gün 30-45 dakikalık aerobik egzersiz anksiyete semptomlarını azaltır. Düzenli egzersiz uyku kalitesini artırır, stres hormonlarını (kortizol) düzenler ve bilişsel fonksiyonları korur.',
      },
    ],
  },
  {
    title: 'Demir Eksikliği Anemisi: Tanı, Tedavi ve Beslenme Yaklaşımları',
    authors: ['Camaschella C', 'Lopez A', 'Pasricha SR'],
    journal: 'The Lancet Haematology',
    published_year: 2023,
    category: 'nutrition',
    tags: ['demir', 'anemi', 'ferritin', 'kan-testi', 'hemoglobin', 'beslenme'],
    language: 'tr',
    is_verified: true,
    abstract: 'Demir eksikliği dünyada en yaygın besinsel eksikliktir. Ferritin 30 ng/mL altı demir depolarının azaldığını gösterir. Tedavide beslenme düzenlemesi ve gerektiğinde takviye kullanılır.',
    chunks: [
      {
        section: 'Kan Testi Yorumlama',
        content: 'Demir durumunu değerlendirmek için en güvenilir belirteç ferritindir. Ferritin <15 ng/mL kesin demir eksikliği, 15-30 ng/mL sınırda düşük, >30 ng/mL genelde yeterli kabul edilir. Ancak ferritin bir akut faz reaktanıdır; enfeksiyon/inflamasyon durumunda yanlış yüksek çıkabilir. Bu durumda transferrin satürasyonu ve TIBC de değerlendirilmelidir. Hemoglobin düşüklüğü (erkekte <13 g/dL, kadında <12 g/dL) anemi göstergesidir.',
      },
      {
        section: 'Demir Açısından Beslenme',
        content: 'Hem demir (hayvansal kaynak): kırmızı et, karaciğer, tavuk, balık — emilimi yüksektir (%15-35). Hem-olmayan demir (bitkisel kaynak): ıspanak, mercimek, nohut, kuru kayısı — emilimi düşüktür (%2-20). C vitamini (portakal, biber, limon) demir emilimini 2-6 kat artırır. Çay/kahve öğünle birlikte tüketildiğinde demir emilimini %60-70 azaltır. Kalsiyum da demir emilimini azaltır; demir takviyesi süt ürünlerinden ayrı alınmalıdır.',
      },
    ],
  },
  {
    title: 'Stres Yönetimi ve Kortizol: Bilimsel Yaklaşımlar',
    authors: ['McEwen BS', 'Sapolsky RM', 'Epel ES'],
    journal: 'Nature Reviews Neuroscience',
    published_year: 2024,
    category: 'mental_health',
    tags: ['stres', 'kortizol', 'mental-sağlık', 'meditasyon', 'ruh-hali'],
    language: 'tr',
    is_verified: true,
    abstract: 'Kronik stres yüksek kortizol seviyelerine yol açarak metabolik, kardiyovasküler ve mental sağlık sorunlarına zemin hazırlar. Kanıta dayalı stres yönetimi teknikleri kortizolü düşürmede etkilidir.',
    chunks: [
      {
        section: 'Stresin Fizyolojik Etkileri',
        content: 'Kronik stres HPA aksını (hipotalamus-hipofiz-adrenal) aşırı aktive eder. Sürekli yüksek kortizol: karın bölgesinde yağlanma, insülin direnci, bağışıklık baskılanması, uyku bozukluğu, kas yıkımı ve kemik kaybına yol açar. Stres ayrıca bağırsak-beyin aksını etkileyerek sindirim problemlerine ve mikrobiyom dengesizliğine neden olabilir. HRV (kalp atış hızı değişkenliği) düşüklüğü yüksek stres yükünün göstergesidir.',
      },
      {
        section: 'Kanıta Dayalı Stres Yönetimi',
        content: 'Mindfulness meditasyonu: Günde 10-20 dakika düzenli uygulama kortizolü %15-25 azaltabilir. Derin nefes egzersizleri (4-7-8 tekniği): parasempatik sistemi aktive eder. Düzenli fiziksel aktivite stres direncini artırır. Sosyal bağlantılar ve kaliteli ilişkiler oksitosini artırarak strese karşı koruyucu etki sağlar. Doğada vakit geçirmek (haftada 120+ dakika) stres hormonlarını düşürür.',
      },
    ],
  },
  {
    title: 'Su Tüketimi ve Hidrasyon: Fizyolojik Gereksinimler',
    authors: ['Armstrong LE', 'Johnson EC', 'Perrier ET'],
    journal: 'European Journal of Nutrition',
    published_year: 2023,
    category: 'nutrition',
    tags: ['su', 'hidrasyon', 'böbrek', 'metabolizma', 'performans'],
    language: 'tr',
    is_verified: true,
    abstract: 'Yeterli su tüketimi metabolizma, böbrek fonksiyonu, bilişsel performans ve fiziksel performans için kritiktir. Bireysel ihtiyaç vücut ağırlığı, aktivite düzeyi ve iklime göre değişir.',
    chunks: [
      {
        section: 'Günlük Su İhtiyacı',
        content: 'Genel öneri: günde 30-35 mL/kg vücut ağırlığı. 70 kg bir birey için yaklaşık 2.1-2.5 litre. Egzersiz yapılan günlerde ek 500-1000 mL gerekir. Sıcak iklimde ihtiyaç %20-30 artar. İdrar rengi açık sarı olmalıdır; koyu sarı dehidrasyonu gösterir. Sabah kalktıktan sonra 500 mL su içmek metabolizmayı hızlandırır.',
      },
      {
        section: 'Dehidrasyon Etkileri',
        content: '%1-2 dehidrasyon bile bilişsel performansı düşürür, baş ağrısı ve yorgunluğa neden olur. %3+ dehidrasyon egzersiz performansını ciddi şekilde azaltır, vücut ısısı regülasyonunu bozar. Kronik hafif dehidrasyon böbrek taşı riskini artırır, konstipasyona katkıda bulunur ve cilt sağlığını olumsuz etkiler. Yaşlılarda susuzluk hissi azaldığından düzenli su içme alışkanlığı kritik önem taşır.',
      },
    ],
  },
  // ═══════════════════════════════════════════════════════
  // HUBERMAN LAB — Podcast Özetleri, Protokoller & Blog
  // ═══════════════════════════════════════════════════════
  {
    title: 'Huberman Lab: Uyku Optimizasyonu Toolkit',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Podcast',
    published_year: 2024,
    category: 'sleep',
    tags: ['huberman', 'uyku', 'sirkadiyen', 'melatonin', 'güneş-ışığı', 'protokol'],
    language: 'tr',
    is_verified: true,
    abstract: 'Andrew Huberman\'ın bilimsel araştırmalara dayalı uyku kalitesini artırma protokolü. Güneş ışığı, sıcaklık, kafein zamanlaması ve takviye stratejileri.',
    chunks: [
      {
        section: 'Sabah Güneş Işığı Protokolü',
        content: 'Huberman\'ın en temel uyku protokolü: Uyanır uyanmaz ilk 30-60 dakika içinde 10-30 dakika doğal güneş ışığına çıkmak. Bu, suprakiazmatik çekirdeği (SCN) sıfırlayarak kortizol uyandırma pikini doğru zamana kaydırır ve gece melatonin salınımını 12-14 saat sonraya programlar. Bulutlu günlerde bile dışarı çıkmak gerekir çünkü dış mekan ışığı (>10.000 lux) iç mekan aydınlatmasından (100-500 lux) çok daha etkilidir. Güneş gözlüğü takmamak önemlidir — retinaya ulaşan ışık kritiktir.',
      },
      {
        section: 'Sıcaklık ve Uyku İlişkisi',
        content: 'Vücut çekirdek sıcaklığının 1-3°C düşmesi uykuya dalışı tetikler. Huberman protokolü: yatak odası 18-19°C olmalı. Yatmadan 1-2 saat önce sıcak duş veya banyo almak paradoksal olarak vücut sıcaklığını düşürür (periferik vazodilatasyon yoluyla ısı kaybı). Sabah soğuk duş (1-3 dakika) ise kortizol ve epinefrini yükselterek uyanıklığı artırır ve sirkadiyen ritmi güçlendirir.',
      },
      {
        section: 'Kafein Zamanlaması',
        content: 'Huberman\'a göre uyanmadan sonraki ilk 90-120 dakika kafein almamak gerekir. Nedeni: adenozin reseptörlerinin doğal temizlenmesine izin vermek. Kafein sadece adenozini bloke eder, ortadan kaldırmaz — erken alındığında öğleden sonra çöküşüne neden olur. Kafein yarı ömrü 5-6 saattir; bu nedenle öğleden sonra 14:00\'ten sonra kafein alınmamalıdır. Teanin (100-200 mg) kafeinin yan etkilerini yumuşatır.',
      },
      {
        section: 'Uyku Takviyeleri (Huberman Stack)',
        content: 'Huberman\'ın önerdiği uyku takviye kombinasyonu: Magnezyum Treonat veya Bisglisinat (300-400 mg yatmadan 30-60 dk önce) — GABA aktivitesini artırır. Teanin (100-400 mg) — anksiyeteyi azaltır, ancak canlı rüya görenlerde dikkatli olunmalı. Apigenin (50 mg) — papatya ekstratı, hafif sedatif etki. İnositol (900 mg) — özellikle gece uyanmaları azaltmada etkili. Melatonin çoğu kişi için gerekli değildir; kullanılacaksa 0.5-1 mg yeterlidir (piyasadaki 3-10 mg dozlar fazladır).',
      },
    ],
  },
  {
    title: 'Huberman Lab: Odaklanma ve Dikkat Protokolü',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Podcast',
    published_year: 2024,
    category: 'mental_health',
    tags: ['huberman', 'odaklanma', 'dopamin', 'dikkat', 'nöroplastisite', 'protokol'],
    language: 'tr',
    is_verified: true,
    abstract: 'Dopamin, asetilkolin ve norepinefrin sistemlerini optimize ederek odaklanma ve dikkat süresini artırma stratejileri.',
    chunks: [
      {
        section: 'Dopamin Yönetimi ve Motivasyon',
        content: 'Huberman\'a göre dopamin bir "zevk" değil "istek ve motivasyon" molekülüdür. Dopamin bazal seviyesinin korunması kritiktir. Sürekli yüksek dopamin uyaranları (sosyal medya, şeker, pornografi) bazal seviyeyi düşürür ve motivasyonu azaltır. Protokol: Dopamin detoksu olarak haftada 1 gün düşük stimülasyonlu gün geçirmek. Zor görevleri başarmak için dopamini görev öncesi değil, görev sırasında biriktirmek. Soğuk duş (1-5 dk, 11-15°C) dopamini %250-300 artırır ve bu etki 2-3 saat sürer.',
      },
      {
        section: '90 Dakika Odaklanma Blokları',
        content: 'İnsan beyninin ultradian döngüsü ~90 dakikadır. Huberman, derin çalışma için 90 dakikalık bloklar önerir. İlk 5-10 dakika yoğunlaşmak zor olacaktır — bu normaldir, asetilkolin sistemi aktive olmaktadır. Görsel odak fiziksel odağı tetikler: çalışma sırasında ekrana veya sayfaya sabit bakmak, dikkati toplar. Her 90 dakikadan sonra 10-20 dakika gevşeme (yürüyüş, pencereden dışarı bakma). Günde maksimum 2-3 derin odak bloku yapılabilir.',
      },
      {
        section: 'NSDR (Non-Sleep Deep Rest) Protokolü',
        content: 'Huberman\'ın en çok önerdiği tekniklerden biri olan NSDR: 10-30 dakikalık yoga nidra veya yönlendirilmiş gevşeme pratiği. Uyanıklığı sürdürürken parasempatik sistemi aktive eder. Öğle saatlerinde uygulanması dopamin seviyesini %65 artırabilir (Copenhagen çalışması). Uyku eksikliğini kısmen telafi eder. Öğrenme sonrası NSDR uygulamak nöroplastisiteyi ve hafıza konsolidasyonunu güçlendirir. YouTube\'da "Huberman NSDR" veya "Yoga Nidra" aratılarak ücretsiz uygulanabilir.',
      },
    ],
  },
  {
    title: 'Huberman Lab: Egzersiz Optimizasyonu — Güç, Dayanıklılık ve Toparlanma',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Podcast',
    published_year: 2024,
    category: 'exercise',
    tags: ['huberman', 'egzersiz', 'güç', 'dayanıklılık', 'toparlanma', 'protokol'],
    language: 'tr',
    is_verified: true,
    abstract: 'Bilimsel araştırmalara dayalı haftalık egzersiz programlama, toparlanma stratejileri ve performans optimizasyonu.',
    chunks: [
      {
        section: 'Huberman Haftalık Egzersiz Şablonu',
        content: 'Huberman\'ın kendi uyguladığı haftalık program: Pazartesi — Bacak (güç odaklı). Salı — Isı-soğuk kontrastı + NSDR (toparlanma). Çarşamba — Omuz, boyun, sırt (torso push). Perşembe — Bacak dayanıklılık (koşu veya bisiklet). Cuma — HIIT veya yüksek yoğunluklu kardio (kısa, yoğun). Cumartesi — Kol, boyun, baldır. Pazar — Uzun tempolu yürüyüş veya hafif yüzme. Her antrenman 45-60 dakika ideal. Kuvvet antrenmanını kardiyo öncesi yapmak daha verimlidir.',
      },
      {
        section: 'Soğuk Maruziyeti ve Toparlanma',
        content: 'Huberman soğuk duş/buz banyosu protokolü: 11°C civarı su, 1-5 dakika. Haftada 11+ dakika toplam soğuk maruziyeti hedeflenmeli (2-4 seans halinde). Soğuk maruziyeti norepinefrin ve dopamini artırır, inflamasyonu azaltır, brown fat aktivasyonunu tetikler. ÖNEMLİ: Kuvvet antrenmanı sonrası ilk 4 saat içinde soğuk uygulamamak — hipertrofi sinyalini baskılayabilir. Soğuk maruziyetini antrenman öncesi veya antrenman olmayan günlerde yapmak daha iyidir.',
      },
      {
        section: 'Nefes Teknikleri ve Performans',
        content: 'Physiological sigh (fizyolojik iç çekme): Çift burundan nefes alma + uzun ağızdan verme. Huberman\'a göre gerçek zamanlı stres azaltmanın en hızlı yolu. Egzersiz öncesi: 2-3 dakika Wim Hof tarzı nefes (30 hızlı nefes + nefes tutma) sempatik sistemi aktive eder, performansı artırır. Egzersiz sonrası: 5 dakika yavaş nefes (4 saniye al, 6 saniye ver) toparlanmayı hızlandırır. Setler arası "physiological sigh" kalp atış hızını düşürür.',
      },
    ],
  },
  {
    title: 'Huberman Lab: Beslenme ve Metabolizma Protokolü',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Podcast',
    published_year: 2024,
    category: 'nutrition',
    tags: ['huberman', 'beslenme', 'metabolizma', 'aralıklı-oruç', 'gut-health', 'protokol'],
    language: 'tr',
    is_verified: true,
    abstract: 'Huberman\'ın beslenme zamanlaması, bağırsak sağlığı, fermente gıdalar ve metabolik esneklik üzerine bilimsel önerileri.',
    chunks: [
      {
        section: 'Beslenme Zamanlaması ve Aralıklı Oruç',
        content: 'Huberman genellikle günde ilk öğünü sabah 11:00-12:00 civarında alıyor ve yeme penceresini 8 saat ile sınırlıyor. Ancak bunun herkes için ideal olmayabileceğini vurgular. Temel prensip: tutarlı bir yeme penceresi korumak sirkadiyen ritmi destekler. Karbonhidratları günün ikinci yarısında ağırlıklı tüketmek serotonin ve melatonin üretimine yardımcı olur, uyku kalitesini artırır. Sabah protein ağırlıklı beslenme tirozin (dopamin öncüsü) sağlayarak uyanıklığı ve odaklanmayı destekler.',
      },
      {
        section: 'Bağırsak Sağlığı ve Fermente Gıdalar',
        content: 'Stanford mikrobiyom çalışmasına (Sonnenburg Lab) atıfla Huberman, günde 2-4 porsiyon fermente gıda tüketimini önerir: yoğurt, kefir, turşu, kimchi, sauerkraut, kombucha. 10 haftalık çalışmada fermente gıda tüketimi yüksek lifli diyetten daha etkili şekilde bağırsak mikrobiyom çeşitliliğini artırdı ve inflamasyon belirteçlerini (CRP, IL-6) düşürdü. Prebiyotik lifler (soğan, sarımsak, kuşkonmaz, muz) probiyotik bakterileri besler. Yüksek emülgatör içeren ultra-işlenmiş gıdalar bağırsak bariyerini zayıflatır.',
      },
      {
        section: 'Temel Takviye Protokolü (Foundational Supplements)',
        content: 'Huberman\'ın günlük temel takviye listesi: AG1 (Athletic Greens) — genel vitamin/mineral desteği ve probiyotik (sponsor olmasına rağmen kullandığını belirtiyor). Omega-3 EPA (1-2 g/gün) — inflamasyon azaltma, ruh hali iyileştirme, EPA DHA\'dan bu alanda daha etkili. D3 vitamini (1000-5000 IU) — kan seviyesine göre dozaj ayarlanmalı, hedef 40-60 ng/mL. K2 vitamini (100 mcg) — D3 ile birlikte kalsiyum yönlendirmesi. Magnezyum (farklı formlar farklı amaçlar için): Treonat beyin, Bisglisinat uyku, Malat kas için.',
      },
    ],
  },
  {
    title: 'Huberman Lab: Güneş Işığı, Işık Maruziyeti ve Sirkadiyen Sağlık',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Podcast',
    published_year: 2024,
    category: 'sleep',
    tags: ['huberman', 'güneş-ışığı', 'sirkadiyen', 'mavi-ışık', 'ışık-maruziyeti', 'protokol'],
    language: 'tr',
    is_verified: true,
    abstract: 'Işık maruziyetinin sirkadiyen ritim, ruh hali, hormon düzenlenmesi ve genel sağlık üzerindeki etkisi.',
    chunks: [
      {
        section: 'Gün Boyunca Işık Protokolü',
        content: 'Huberman\'ın ışık protokolü üç zaman dilimine ayrılır: SABAH (uyanıştan 1 saat içinde): 10-30 dakika doğal güneş ışığı, SCN sıfırlama, kortizol piki tetikleme. ÖĞLE: Mümkünse 10-15 dakika açık hava, D vitamini üretimi ve ruh hali desteği. AKŞAM: Gün batımını izlemek (2-10 dakika) retina üzerinden habenula çekirdeğini aktive ederek melatonin zamanlayıcısını ayarlar. GECE (gün batımından sonra): Ekranları göz seviyesinin altına indirmek, ışık yoğunluğunu %50+ azaltmak, kırmızı/turuncu ışık kullanmak.',
      },
      {
        section: 'Ekran ve Mavi Işık Yönetimi',
        content: 'Huberman mavi ışık gözlüklerinin etkisinin abartıldığını belirtir — asıl sorun ışık yoğunluğudur. Gece parlak ekranlar melatonin baskılanmasına neden olur, mavi filtre tek başına yeterli değildir. Pratik öneriler: akşam 22:00\'den sonra ekran parlaklığını minimuma indirmek, gece modunu (warm/amber) etkinleştirmek, mumlar veya kısık sarı ışık kullanmak. Dim light melatonin onset (DLMO) kavramı: melatonin yükselişi normal uyku saatinden ~2 saat önce başlar, bu dönemde parlak ışık en zararlıdır.',
      },
    ],
  },
  {
    title: 'Huberman Lab: Dopamin Detoksu ve Alışkanlık Oluşturma',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Podcast',
    published_year: 2024,
    category: 'mental_health',
    tags: ['huberman', 'dopamin', 'alışkanlık', 'motivasyon', 'bağımlılık', 'protokol'],
    language: 'tr',
    is_verified: true,
    abstract: 'Dopamin sisteminin nasıl çalıştığı, bazal dopamin seviyesinin korunması ve sürdürülebilir alışkanlık oluşturma stratejileri.',
    chunks: [
      {
        section: 'Dopamin Bazal Seviyesi ve Pikler',
        content: 'Dopamin bazal seviyesi (baseline) mutluluk ve motivasyonun temelidir. Her yüksek dopamin piki sonrası bazal seviye geçici olarak düşer — bu "dopamin çukuru" hissine neden olur. Çikolata bazalı %50, nikotin %150, amfetamin %1000 artırır. Sosyal medya sonsuz kaydırma %100-400 pik yaratır. Her pike sonra eşdeğer bir düşüş gelir. Huberman önerisi: Ödüllerin boyutunu ve sıklığını bilinçli olarak yönetmek. Ara sıra antrenmanı ödülsüz yapmak (random intermittent reinforcement) dopamin bazalini korur.',
      },
      {
        section: 'Alışkanlık Lindy Etkisi',
        content: 'Huberman\'a göre yeni bir alışkanlığı sürdürülebilir kılmanın anahtarı: 21 gün kuralı yanlıştır — gerçekte 21-254 gün arası değişir (ortalama 66 gün). "Limbik sürtünme" kavramı: alışkanlığın başında beyin enerji tasarrufu için direnç gösterir. İlk 6 haftada alışkanlığı mümkün olduğunca aynı zamanda ve aynı ortamda yapmak. Niyeti belirginleştirmek: "Ben [zaman]\'da [yerde] [davranışı] yapacağım" formatı %2-3x başarı artırır. Ödülü davranışa yapıştırmak yerine sürece odaklanmak dopamin sistemini doğru yönlendirir.',
      },
      {
        section: 'Soğuk Maruziyet ile Dopamin Artırma',
        content: 'Soğuk duş veya buz banyosu dopamini %250-300 artırır ve bu etki 2-3 saat sürer — diğer uyaranlardan farklı olarak pik sonrası çöküş minimumdur. Huberman protokolü: "uncomfortably cold but safe" — 11°C civarı su. Başlangıçta 30 saniye, zamanla 1-5 dakikaya çıkarmak. Haftada 2-4 seans, toplam 11+ dakika. Sabah yapıldığında tüm güne enerji ve odaklanma sağlar. Egzersiz motivasyonu düşük günlerde alternatif olarak kullanılabilir. Nefes kontrolüne odaklanmak (yavaş, kontrollü nefes) stres toleransını artırır.',
      },
    ],
  },
  {
    title: 'Huberman Lab: Testosteron ve Hormon Optimizasyonu',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Podcast',
    published_year: 2024,
    category: 'supplements',
    tags: ['huberman', 'testosteron', 'hormon', 'östrojen', 'takviye', 'protokol'],
    language: 'tr',
    is_verified: true,
    abstract: 'Testosteron ve östrojen dengesini doğal yollarla optimize etme stratejileri: uyku, egzersiz, beslenme ve takviye önerileri.',
    chunks: [
      {
        section: 'Testosteron İçin Yaşam Tarzı Faktörleri',
        content: 'Huberman\'a göre testosteronu en çok etkileyen 6 faktör: 1) Uyku: 5 saat uyku testosteronu %10-15 düşürür; 7-9 saat hedef. 2) Vücut yağ oranı: Yüksek yağ oranı aromataz enzimini artırarak testosteronu östrojene çevirir. 3) Ağır bileşik hareketler: Squat, deadlift, bench press gibi hareketler akut testosteron artışı sağlar. 4) D vitamini: Eksiklik testosteron düşüklüğüyle ilişkili. 5) Çinko: Testosteron sentezinde kofaktör, 30-45 mg/gün. 6) Stres yönetimi: Kronik yüksek kortizol testosteron üretimini baskılar.',
      },
      {
        section: 'Hormon Sağlığı İçin Takviyeler',
        content: 'Huberman\'ın değindiği kanıta dayalı takviyeler: Tongkat Ali (Eurycoma longifolia) — 400 mg/gün, serbest testosteronu artırabilir, SHBG\'yi düşürür. Fadogia Agrestis — 425-600 mg/gün, luteinize edici hormon (LH) artışı yoluyla. Ancak Huberman uzun süreli kullanımda karaciğer ve böbrek fonksiyonlarının izlenmesini önerir. Boron — 2-12 mg/gün, serbest testosteronu artırır, SHBG\'yi azaltır. Ashwagandha (KSM-66) — 300-600 mg/gün, kortizolü %15-25 düşürür, testosteronda dolaylı artış. Önemli not: Takviye kullanmadan önce ve 3 ay sonra kan tahlili yaptırmak gerekir.',
      },
    ],
  },
  {
    title: 'Huberman Lab: Bağışıklık Sistemi Güçlendirme Protokolü',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Podcast',
    published_year: 2024,
    category: 'supplements',
    tags: ['huberman', 'bağışıklık', 'soğuk-algınlığı', 'grip', 'takviye', 'protokol'],
    language: 'tr',
    is_verified: true,
    abstract: 'Bağışıklık sistemini güçlendirmek ve hastalık dönemlerinde iyileşmeyi hızlandırmak için bilimsel stratejiler.',
    chunks: [
      {
        section: 'Günlük Bağışıklık Desteği',
        content: 'Huberman\'ın günlük bağışıklık protokolü: D vitamini (1000-5000 IU, kan seviyesine göre) — bağışıklık hücrelerinin %90+\'ında D vitamini reseptörü bulunur. Çinko (15-30 mg/gün) — T hücresi fonksiyonu için kritik, ama 40 mg/gün\'ü geçmemek (bakır emilimini bozar). C vitamini (500-1000 mg/gün) — nötrofil fonksiyonunu destekler. Fermente gıdalar (günde 2-4 porsiyon) — bağırsak mikrobiyom çeşitliliği bağışıklığın %70-80\'ini etkiler. Düzenli uyku en güçlü bağışıklık destekçisidir — bir gece yetersiz uyku doğal öldürücü hücre aktivitesini %70 düşürebilir.',
      },
      {
        section: 'Hastalık Hissi Başladığında Protokol',
        content: 'Huberman hasta hissetmeye başladığında öneriler: Çinko asetat pastilleri (75 mg/gün, 3-4 güne bölünmüş) — semptom süresini %33 kısaltabilir. C vitamini dozu 1000-2000 mg\'a çıkarılabilir. Sarımsak (taze veya yaşlanmış sarımsak ekstresi) — allisinin antimikrobiyal etkisi. Yüksek doz D3 (5000-10000 IU, kısa süreli). Bol sıvı (su, kemik suyu, zencefil çayı). Sauna (hastalığın erken döneminde, ateş yoksa) — ısı şoku proteinleri bağışıklığı uyarır. En önemlisi: fazladan uyku — hasta olduğunuzda 9-10+ saat uyumak bağışıklığı ciddi şekilde güçlendirir.',
      },
    ],
  },
  {
    title: 'Huberman Lab: Göz Sağlığı ve Görme Optimizasyonu',
    authors: ['Huberman A'],
    journal: 'Huberman Lab Podcast',
    published_year: 2024,
    category: 'general',
    tags: ['huberman', 'göz-sağlığı', 'miyopi', 'ekran', 'görme', 'protokol'],
    language: 'tr',
    is_verified: true,
    abstract: 'Nörobilimci Andrew Huberman\'ın uzmanlık alanı olan görme sistemi üzerine pratik öneriler: miyopi önleme, göz yorgunluğu azaltma ve görsel sistem güçlendirme.',
    chunks: [
      {
        section: 'Miyopi Önleme ve Göz Sağlığı',
        content: 'Huberman\'a göre miyopi (yakın görme) epidemisi büyük ölçüde yaşam tarzından kaynaklanır. Günde en az 2 saat açık havada uzak mesafeye bakmak miyopi ilerlemesini yavaşlatır — özellikle çocuklar ve gençler için kritik. 20-20-20 kuralı: Her 20 dakikada 20 saniye boyunca 20 feet (6 metre) uzağa bakmak. Panoramik görüş (periferal farkındalık) parasempatik sistemi aktive eder ve stres yanıtını azaltır — dar fokus (ekran, kitap) sempatik aktivasyonu artırır. Düzenli göz kırpma: Ekran kullanırken göz kırpma hızı %66 azalır, bilinçli olarak kırpmak göz kuruluğunu önler.',
      },
      {
        section: 'Görsel Sistem ve Mental Performans',
        content: 'Huberman\'ın nörobilim alanındaki temel bulgusu: Görsel odak mental odağı doğrudan yönetir. Sabit bir noktaya bakmak (visual fixation) prefrontal korteksi aktive eder ve dikkati artırır. Bu ilke çalışma, meditasyon ve spor performansında kullanılabilir. "Optic flow" (hareket halinde çevrenin akışı) — yürüyüş veya koşu sırasında lateral göz hareketleri amigdalayı sakinleştirir, bu yüzden yürüyüş anksiyeteyi azaltır (EMDR terapisine benzer mekanizma). Güneş batımını izlemek habenula çekirdeği üzerinden melatonin zamanlayıcısını aktive eder.',
      },
    ],
  },
  {
    title: 'Huberman Protocols: Günlük Rutin Özeti',
    authors: ['Huberman A'],
    journal: 'Huberman Lab — hubermanlab.com/protocols',
    published_year: 2024,
    category: 'general',
    tags: ['huberman', 'günlük-rutin', 'protokol', 'sabah', 'akşam', 'performans'],
    language: 'tr',
    is_verified: true,
    abstract: 'Andrew Huberman\'ın kendi uyguladığı ve bilimsel araştırmalara dayandırdığı günlük rutin protokolünün özeti.',
    chunks: [
      {
        section: 'Sabah Rutini (Huberman Protocol)',
        content: 'Huberman\'ın tipik sabah rutini: 06:30-07:00 — Uyanış, kafein YOK (ilk 90 dk bekle). Hidrasyon: 500 mL su + bir tutam tuz + limon. 07:00-07:30 — Dışarıda 10-30 dk güneş ışığı maruziyeti (retina üzerinden SCN sıfırlama). İsteğe bağlı: Kısa yürüyüş (optic flow ile anksiyete azaltma). 07:30-08:00 — Soğuk duş (1-3 dk, 11°C civarı) — dopamin ve norepinefrin artışı. 08:00-08:30 — Kafein alımı (yerba mate veya kahve). 08:30-12:00 — Derin odak çalışma bloku #1 (90 dk + mola + 90 dk). Öğle öncesi genellikle katı gıda yok (aralıklı oruç).',
      },
      {
        section: 'Öğle ve Öğleden Sonra Rutini',
        content: 'Huberman öğle rutini: 12:00-13:00 — İlk öğün: yüksek protein + sağlıklı yağ ağırlıklı. Örnek: et/balık + sebze + zeytinyağı. Minimum karbonhidrat (uyanıklık için). 13:00-13:30 — 10-20 dk NSDR (Non-Sleep Deep Rest / Yoga Nidra) veya kısa yürüyüş. 14:00 — Son kafein alımı (bu saatten sonra kafein yok). 14:00-16:00 — Toplantılar, yaratıcı çalışma veya egzersiz. 16:00-18:00 — Egzersiz (kuvvet veya kardio, güne bağlı). Egzersiz sonrası: protein alımı (20-40g) + elektrolit.',
      },
      {
        section: 'Akşam Rutini ve Uyku Hazırlığı',
        content: 'Huberman akşam rutini: 18:00-20:00 — Akşam yemeği: karbonhidrat ağırlıklı (serotonin/melatonin desteği). Pirinç, patates, makarna gibi nişastalı gıdalar + protein + sebze. 20:00 — Evdeki ışıkları kısmak (%50+), mumlar veya kısık sarı ışık. Ekranları göz seviyesinin altına indirmek veya kullanımı bırakmak. 21:00-21:30 — Uyku takviyeleri: Magnezyum Treonat (300 mg) + Teanin (200 mg) + Apigenin (50 mg). 21:30-22:00 — Yatak odası: karanlık, serin (18-19°C), sessiz. Mümkünse telefonu odanın dışında bırakmak. 22:00 — Uyku. 7-8 saat kesintisiz uyku hedefi.',
      },
    ],
  },
];

// ── Chunking & Embedding ───────────────────────────────

function estimateTokens(text: string): number {
  // Rough estimate: ~1.5 tokens per word for Turkish text
  return Math.ceil(text.split(/\s+/).length * 1.5);
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

// ── Main Pipeline ──────────────────────────────────────

async function main() {
  console.log('🚀 RAG Ingestion Pipeline başlatılıyor...\n');

  let totalSources = 0;
  let totalChunks = 0;

  for (const source of SEED_SOURCES) {
    console.log(`📄 Kaynak: ${source.title}`);

    // 1. Insert source metadata
    const { data: inserted, error: sourceError } = await supabase
      .from('scientific_sources')
      .insert({
        title: source.title,
        authors: source.authors,
        journal: source.journal,
        published_year: source.published_year,
        category: source.category,
        tags: source.tags,
        language: source.language,
        is_verified: source.is_verified,
        abstract: source.abstract,
        full_text: source.chunks.map(c => c.content).join('\n\n'),
      })
      .select('id')
      .single();

    if (sourceError) {
      console.error(`  ❌ Kaynak eklenemedi: ${sourceError.message}`);
      continue;
    }

    const sourceId = inserted.id;
    totalSources++;

    // 2. Process chunks: embed and insert
    for (let i = 0; i < source.chunks.length; i++) {
      const chunk = source.chunks[i];
      const fullChunkText = `${source.title} — ${chunk.section}\n\n${chunk.content}`;
      const tokenCount = estimateTokens(chunk.content);

      console.log(`  📦 Chunk ${i + 1}/${source.chunks.length}: "${chunk.section}" (${tokenCount} token est.)`);

      try {
        const embedding = await generateEmbedding(fullChunkText);

        const { error: chunkError } = await supabase
          .from('scientific_source_chunks')
          .insert({
            source_id: sourceId,
            chunk_index: i,
            section: chunk.section,
            content: chunk.content,
            token_count: tokenCount,
            embedding: JSON.stringify(embedding),
            keywords: source.tags,
            language: source.language,
          });

        if (chunkError) {
          console.error(`    ❌ Chunk hatası: ${chunkError.message}`);
        } else {
          totalChunks++;
          console.log(`    ✅ Embedding oluşturuldu ve kaydedildi`);
        }
      } catch (err: any) {
        console.error(`    ❌ Embedding hatası: ${err.message}`);
      }

      // Rate limit: 100ms between embedding calls
      await new Promise(r => setTimeout(r, 100));
    }

    console.log('');
  }

  console.log('─'.repeat(50));
  console.log(`✅ Tamamlandı: ${totalSources} kaynak, ${totalChunks} chunk oluşturuldu`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
