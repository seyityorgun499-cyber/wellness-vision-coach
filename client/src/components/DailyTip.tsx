import { Lightbulb } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DailyTipProps {
  foodCount: number;
  waterPercent: number;
  activityCount: number;
  sleepMinutes: number | null;
  streak: number;
}

const waterTips = {
  en: [
    "Don't forget to drink water! Aim for at least 8 glasses a day.",
    "Dehydration can cause fatigue. Drink more water.",
    "Drinking water boosts your metabolism and helps with weight loss.",
    "Drink a glass of water when you wake up - your body deserves it!",
    "Drinking water keeps your skin glowing and healthy.",
    "Drink a glass of water before each meal - it increases satiety.",
  ],
  tr: [
    "Su icmeyi unutmayin! Gunde en az 8 bardak su icin hedeflemelisiniz.",
    "Dehidrasyon yorgunluga neden olabilir. Daha fazla su icin.",
    "Su icmek metabolizmanizi hizlandirir ve kilo vermenize yardimci olur.",
    "Sabah kalktiginizda bir bardak su icin - vucudunuz bunu hak ediyor!",
    "Su icmek cildinizi isiltili ve saglikli tutar.",
    "Her ogundan once bir bardak su icin - tokluk hissinizi artirir.",
  ],
};

const foodTips = {
  en: [
    "You haven't logged a meal today. Log your first meal!",
    "Tracking your nutrition is the first step to building healthy habits.",
    "Logging what you eat increases your calorie awareness.",
    "Track every meal to monitor your progress!",
    "Noting what you eat during the day is the key to mindful eating.",
    "Start the day healthy by logging your breakfast!",
  ],
  tr: [
    "Bugun henuz ogun kaydetmediniz. Ilk ogunununuzu kaydedin!",
    "Beslenmenizi takip etmek saglikli aliskanliklar olusturmanin ilk adimidir.",
    "Yediklerinizi kaydetmek kalori farkindaliginiziarttirir.",
    "Her ogunununuzu kaydederek ilerlemenizi takip edin!",
    "Gun icinde yediklerinizi not etmek bilincli beslenmenin anahtaridir.",
    "Kahvaltinizi kaydederek gune saglikli baslayin!",
  ],
};

const activityTips = {
  en: [
    "No activity logged today. Start with a 10-minute walk!",
    "Moving improves your mood. Add an activity!",
    "30 minutes of exercise a day supports heart health.",
    "Small steps create big changes. Get moving!",
    "Your body loves to move. Try an activity!",
    "Exercise reduces stress and boosts energy levels.",
  ],
  tr: [
    "Bugun henuz aktivite kaydi yok. 10 dakikalik yuruyusle baslayin!",
    "Hareket etmek ruh halinizi iyilestirir. Bir aktivite ekleyin!",
    "Gunde 30 dakika egzersiz kalp sagliginizi destekler.",
    "Kucuk adimlar buyuk degisimler yaratir. Harekete gecin!",
    "Vucudunuz hareket etmeyi sever. Bir aktivite deneyin!",
    "Egzersiz stresi azaltir ve enerji seviyenizi artirir.",
  ],
};

const sleepTips = {
  en: [
    "Your sleep seems low. Try going to bed early!",
    "Quality sleep is critical for body and mind health.",
    "7-8 hours of sleep keeps your metabolism balanced.",
    "Good sleep strengthens your immune system.",
    "Lack of sleep can cause weight gain. Get some rest!",
    "Creating a regular sleep routine improves your overall health.",
  ],
  tr: [
    "Uyku sureniz dusuk gorunuyor. Erken yatmayi deneyin!",
    "Kaliteli uyku vucut ve zihin sagliginiz icin kritiktir.",
    "7-8 saat uyku metabolizmanizi dengede tutar.",
    "Iyi uyku bagisiklik sisteminizi guclendirir.",
    "Uyku eksikligi kilo almaniza neden olabilir. Dinlenin!",
    "Duzenli uyku rutini olusturmak genel sagliginizi iyilestirir.",
  ],
};

const motivationalTips = {
  en: [
    "You're doing great! One step further every day.",
    "Consistency is the key to success. Keep it up!",
    "Today is your day to be better than yesterday!",
    "Healthy living is a marathon, not a sprint. Be patient!",
    "Every small progress deserves to be celebrated. Be proud of yourself!",
    "You're getting closer to your goal every day!",
    "You have a {{streak}} day streak! You're amazing!",
  ],
  tr: [
    "Harika gidiyorsunuz! Her gun bir adim daha ileri.",
    "Tutarlilik basarinin anahtaridir. Boyle devam edin!",
    "Bugun dun'den daha iyi olma gununuz!",
    "Saglikli yasam bir maraton, sprint degil. Sabirli olun!",
    "Her kucuk ilerleme kutlanmayi hak eder. Kendinizle gurur duyun!",
    "Hedefinize her gun biraz daha yaklasiyorsunuz!",
    "{{streak}} gunluk seriniz var! Muhteşemsiniz!",
  ],
};

const tipTitle = { en: "Tip of the Day", tr: "Gunun Ipucu" };

export const DailyTip = ({ foodCount, waterPercent, activityCount, sleepMinutes, streak }: DailyTipProps) => {
  const { language } = useLanguage();

  let selectedTips: string[];

  if (waterPercent < 50) {
    selectedTips = waterTips[language];
  } else if (foodCount === 0) {
    selectedTips = foodTips[language];
  } else if (activityCount === 0) {
    selectedTips = activityTips[language];
  } else if (sleepMinutes !== null && sleepMinutes < 420) {
    selectedTips = sleepTips[language];
  } else {
    selectedTips = motivationalTips[language];
  }

  const dayOfMonth = new Date().getDate();
  const tipIndex = dayOfMonth % selectedTips.length;
  let tip = selectedTips[tipIndex];

  if (streak > 0) {
    tip = tip.replace("{{streak}}", String(streak));
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
          <Lightbulb className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{tipTitle[language]}</h3>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed min-h-[2.5rem]">
        {tip}
      </p>
    </div>
  );
};
