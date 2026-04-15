import { Droplets, Activity, Flame, Sun, Apple, ClipboardList, Utensils, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { challengeAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHealthScore } from "@/hooks/useHealthScore";
import { useStreak } from "@/hooks/useStreak";

interface ChallengeContext {
  waterGlasses: number;
  foodCount: number;
  activityCount: number;
  streak: number;
}

interface Challenge {
  id: string;
  titleEn: string;
  titleTr: string;
  descEn: string;
  descTr: string;
  icon: React.ElementType;
  target: number;
  unitEn: string;
  unitTr: string;
}

const CHALLENGE_POOL: Challenge[] = [
  { id: 'water7',     titleEn: '7-Day Water Champion',  titleTr: '7 Gun Su Sampiyonu',    descEn: 'Drink 8 glasses of water for 7 consecutive days', descTr: '7 gun ust uste 8 bardak su ic',            icon: Droplets,     target: 7,  unitEn: 'days',       unitTr: 'gun' },
  { id: 'protein3',   titleEn: 'Protein Master',         titleTr: 'Protein Ustasi',        descEn: 'Hit your protein goal for 3 consecutive days',    descTr: '3 gun ust uste protein hedefini tut',     icon: Utensils,     target: 3,  unitEn: 'days',       unitTr: 'gun' },
  { id: 'activity5',  titleEn: 'Active Week',            titleTr: 'Hareket Haftasi',       descEn: 'Log 5 different activities this week',            descTr: 'Bu hafta 5 farkli aktivite kaydet',       icon: Activity,     target: 5,  unitEn: 'activities', unitTr: 'aktivite' },
  { id: 'streak5',    titleEn: '5-Day Streak',           titleTr: '5 Gun Serisi',          descEn: 'Use the app for 5 consecutive days',              descTr: '5 gun ust uste uygulamayi kullan',        icon: Flame,        target: 5,  unitEn: 'days',       unitTr: 'gun' },
  { id: 'earlybird',  titleEn: 'Early Bird',             titleTr: 'Erken Kus',             descEn: 'Log a meal before 9 AM for 3 days',               descTr: '3 gun sabah 9 dan once ogun kaydet',      icon: Sun,          target: 3,  unitEn: 'days',       unitTr: 'gun' },
  { id: 'variety',    titleEn: 'Variety Expert',         titleTr: 'Cesitlilik Uzmani',     descEn: 'Log 10 different foods this week',                descTr: 'Bu hafta 10 farkli yiyecek kaydet',       icon: Apple,        target: 10, unitEn: 'foods',      unitTr: 'yiyecek' },
  { id: 'hydration3', titleEn: 'Hydration Routine',      titleTr: 'Su Duzeni',             descEn: 'Complete water goal for 3 consecutive days',      descTr: '3 gun ust uste su hedefini tamamla',      icon: Droplets,     target: 3,  unitEn: 'days',       unitTr: 'gun' },
  { id: 'active3',    titleEn: 'Active Trio',            titleTr: 'Aktif Uclu',            descEn: 'Log activity for 3 consecutive days',             descTr: '3 gun ust uste aktivite kaydet',          icon: Activity,     target: 3,  unitEn: 'days',       unitTr: 'gun' },
  { id: 'streak10',   titleEn: '10-Day Legend',          titleTr: '10 Gun Efsanesi',       descEn: 'Build a 10-day streak',                           descTr: '10 gunluk seri olustur',                  icon: Flame,        target: 10, unitEn: 'days',       unitTr: 'gun' },
  { id: 'logger',     titleEn: 'Logging Master',         titleTr: 'Kayit Ustasi',          descEn: 'Make 5 different logs today',                     descTr: 'Bugun 5 farkli kayit yap',                icon: ClipboardList, target: 5, unitEn: 'logs',       unitTr: 'kayit' },
];

const WEEK_INDEX = Math.floor(Date.now() / (7 * 86400000));
const LOCAL_KEY = `myora_challenges_${WEEK_INDEX}`;

const selectChallenges = (weekIndex: number): Challenge[] => {
  const indices: number[] = [];
  let seed = weekIndex;
  while (indices.length < 3) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const idx = seed % CHALLENGE_POOL.length;
    if (!indices.includes(idx)) indices.push(idx);
  }
  return indices.map(i => CHALLENGE_POOL[i]);
};

const getChallengeProgress = (challenge: Challenge, props: ChallengeContext): number => {
  switch (challenge.id) {
    case 'water7':
    case 'hydration3':   return props.waterGlasses >= 8 ? 1 : 0;
    case 'activity5':    return Math.min(props.activityCount, challenge.target);
    case 'active3':      return props.activityCount > 0 ? 1 : 0;
    case 'streak5':
    case 'streak10':     return Math.min(props.streak, challenge.target);
    case 'protein3':
    case 'earlybird':    return 0;
    case 'variety':      return Math.min(props.foodCount, challenge.target);
    case 'logger': {
      const total = props.waterGlasses + props.foodCount + props.activityCount;
      return Math.min(total, challenge.target);
    }
    default: return 0;
  }
};

export const MiniChallenges = () => {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const { waterMl, waterTarget, foodCount, activityCount } = useHealthScore();
  const { currentStreak } = useStreak();

  const waterGlasses = waterTarget > 0 ? Math.round(waterMl / 300) : 0;
  const props = { waterGlasses, foodCount, activityCount, streak: currentStreak };

  const challenges = selectChallenges(WEEK_INDEX);

  const { data: completedIds = [] } = useQuery<string[]>({
    queryKey: ['challenges', WEEK_INDEX],
    queryFn: async () => {
      const remote = await challengeAPI.getCompletions(WEEK_INDEX);
      if (remote.length > 0) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(remote));
        return remote;
      }
      try {
        const cached = localStorage.getItem(LOCAL_KEY);
        return cached ? (JSON.parse(cached) as string[]) : [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60_000,
  });

  const completed = new Set(completedIds);

  const saveMutation = useMutation({
    mutationFn: (ids: string[]) => challengeAPI.saveCompletions(WEEK_INDEX, ids),
    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: ['challenges', WEEK_INDEX] });
      const prev = queryClient.getQueryData<string[]>(['challenges', WEEK_INDEX]);
      queryClient.setQueryData(['challenges', WEEK_INDEX], ids);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
      return { prev };
    },
    onError: (_err, _ids, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['challenges', WEEK_INDEX], ctx.prev);
    },
  });

  // Auto-complete challenges when target is reached
  const newCompleted = new Set(completedIds);
  let anyNew = false;
  challenges.forEach(c => {
    if (!completed.has(c.id) && getChallengeProgress(c, props) >= c.target) {
      newCompleted.add(c.id);
      anyNew = true;
    }
  });
  if (anyNew) {
    const ids = [...newCompleted];
    saveMutation.mutate(ids);
  }

  const headerTitle = language === 'tr' ? 'Haftalık Zorluklar' : 'Weekly Challenges';

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">{headerTitle}</h3>
      </div>

      <div className="space-y-3">
        {challenges.map((challenge) => {
          const progress = getChallengeProgress(challenge, props);
          const isCompleted = newCompleted.has(challenge.id);
          const progressPercent = Math.min((progress / challenge.target) * 100, 100);
          const Icon = challenge.icon;
          const title = language === 'tr' ? challenge.titleTr : challenge.titleEn;
          const desc  = language === 'tr' ? challenge.descTr  : challenge.descEn;
          const unit  = language === 'tr' ? challenge.unitTr  : challenge.unitEn;

          return (
            <div
              key={challenge.id}
              className={`relative rounded-xl border border-border bg-muted/30 p-3 transition-all ${isCompleted ? "opacity-60" : ""}`}
            >
              {isCompleted && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              )}

              <div className="flex items-start gap-3 mb-2">
                <div className="shrink-0 p-2 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium mb-0.5 ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {title}
                  </h4>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>

              <div className="h-1.5 rounded-full bg-muted mb-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-green-500" : "bg-primary"}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {Math.min(progress, challenge.target)}/{challenge.target} {unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
