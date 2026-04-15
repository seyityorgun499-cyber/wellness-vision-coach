import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, User, Target, Activity, Brain, BarChart3, Trophy, Check } from 'lucide-react';
import myoraORings from '@/assets/myora-o-rings.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { authAPI, healthAPI } from '@/lib/api';
import myoraLogo from '@/assets/myora-logo-cropped.png';

type Goal = 'weight_loss' | 'muscle_gain' | 'stay_healthy' | 'better_sleep' | 'stress_reduction';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';

interface OnboardingData {
  gender: string;
  heightCm: string;
  weightKg: string;
  dateOfBirth: string;
  goal: Goal | '';
  activityLevel: ActivityLevel | '';
}

const goalToApiType: Record<Goal, string> = {
  weight_loss: 'weight_loss',
  muscle_gain: 'muscle_gain',
  stay_healthy: 'custom',
  better_sleep: 'better_sleep',
  stress_reduction: 'stress_reduction',
};

const goalTitles: Record<Goal, string> = {
  weight_loss: 'Lose Weight',
  muscle_gain: 'Build Muscle',
  stay_healthy: 'Stay Healthy',
  better_sleep: 'Better Sleep',
  stress_reduction: 'Reduce Stress',
};

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isAnimating, setIsAnimating] = useState(false);
  const animTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [data, setData] = useState<OnboardingData>({
    gender: user?.gender || '',
    heightCm: user?.heightCm ? String(user.heightCm) : '',
    weightKg: user?.weightKg || '',
    dateOfBirth: user?.dateOfBirth || '',
    goal: '',
    activityLevel: (user?.activityLevel as ActivityLevel) || '',
  });

  const update = (fields: Partial<OnboardingData>) => setData(prev => ({ ...prev, ...fields }));

  const animateStep = useCallback((newStep: number) => {
    if (isAnimating) return;
    setDirection(newStep > step ? 'forward' : 'backward');
    setIsAnimating(true);
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    animTimerRef.current = setTimeout(() => {
      setStep(newStep);
      animTimerRef.current = setTimeout(() => setIsAnimating(false), 50);
    }, 200);
  }, [isAnimating, step]);

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await authAPI.updateProfile({
        gender: data.gender || undefined,
        heightCm: data.heightCm ? Number(data.heightCm) : undefined,
        weightKg: data.weightKg || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        activityLevel: data.activityLevel || 'moderate',
        onboardingCompleted: true,
      });

      if (data.goal) {
        try {
          await healthAPI.createGoal({
            goalType: goalToApiType[data.goal],
            title: goalTitles[data.goal] || data.goal,
          });
        } catch (goalErr) {
          console.warn('Could not save onboarding goal:', goalErr);
        }
      }

      await refreshUser();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Onboarding save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await authAPI.updateProfile({ onboardingCompleted: true });
      await refreshUser();
      navigate('/', { replace: true });
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return data.gender !== '';
    if (step === 2) return data.goal !== '';
    if (step === 3) return data.activityLevel !== '';
    return true;
  };

  const totalSteps = 3;

  const goals: { id: Goal; label: string; emoji: string }[] = [
    { id: 'weight_loss', label: t.onboardingGoalWeightLoss, emoji: '🏃' },
    { id: 'muscle_gain', label: t.onboardingGoalMuscle, emoji: '💪' },
    { id: 'stay_healthy', label: t.onboardingGoalHealth, emoji: '🌿' },
    { id: 'better_sleep', label: t.onboardingGoalSleep, emoji: '😴' },
    { id: 'stress_reduction', label: t.onboardingGoalStress, emoji: '🧘' },
  ];

  const activityLevels: { id: ActivityLevel; label: string; desc: string; emoji: string }[] = [
    { id: 'sedentary', label: t.onboardingActivitySedentary, desc: t.onboardingActivitySedentaryDesc, emoji: '🪑' },
    { id: 'light', label: t.onboardingActivityLight, desc: t.onboardingActivityLightDesc, emoji: '🚶' },
    { id: 'moderate', label: t.onboardingActivityModerate, desc: t.onboardingActivityModerateDesc, emoji: '🏋️' },
    { id: 'very_active', label: t.onboardingActivityVery, desc: t.onboardingActivityVeryDesc, emoji: '🔥' },
  ];

  const features = [
    { icon: Brain, label: t.onboardingFeature1, desc: t.onboardingFeature1Desc, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { icon: BarChart3, label: t.onboardingFeature2, desc: t.onboardingFeature2Desc, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Trophy, label: t.onboardingFeature3, desc: t.onboardingFeature3Desc, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  const transitionClass = isAnimating
    ? direction === 'forward'
      ? 'opacity-0 -translate-x-4'
      : 'opacity-0 translate-x-4'
    : 'opacity-100 translate-x-0';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-4 pt-6 pb-2">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <img src={myoraLogo} alt="myora" className="w-24" />
          <button
            onClick={handleSkip}
            disabled={saving}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.onboardingSkip}
          </button>
        </div>
      </div>

      {step > 0 && (
        <div className="px-4 pt-2">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">
                {step} {t.onboardingStepOf} {totalSteps}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div
          className={`w-full max-w-md transition-all duration-300 ease-out ${transitionClass}`}
        >

          {step === 0 && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4DB6AC]/15 to-[#80D8CD]/10 rounded-full blur-2xl scale-150" />
                  <img src={myoraORings} alt="Myora" className="relative z-10 w-24 h-24 object-contain animate-pulse" style={{ animationDuration: '3s' }} />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{t.onboardingWelcome}</h1>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-[280px] mx-auto">{t.onboardingWelcomeDesc}</p>
              </div>
              <div className="space-y-2.5 text-left pt-2">
                {features.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border/40"
                    >
                      <div className={`h-10 w-10 rounded-xl ${f.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`h-5 w-5 ${f.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight">{f.label}</p>
                        <p className="text-xs text-muted-foreground leading-snug mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-2 pt-3">
                {[
                  { icon: User, label: t.onboardingStep1Title },
                  { icon: Target, label: t.onboardingStep2Title },
                  { icon: Activity, label: t.onboardingStep3Title },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      {i > 0 && <div className="w-6 h-px bg-border" />}
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/60">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground font-medium">{s.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">{t.onboardingStep1Title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t.onboardingStep1Desc}</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t.onboardingGender}</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'male', label: t.onboardingMale, emoji: '👨' },
                    { id: 'female', label: t.onboardingFemale, emoji: '👩' },
                    { id: 'other', label: t.onboardingOther, emoji: '🧑' },
                  ] as const).map(g => (
                    <button
                      key={g.id}
                      onClick={() => update({ gender: g.id })}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        data.gender === g.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <span className="text-2xl block">{g.emoji}</span>
                      <span className="text-xs font-medium mt-1 block">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t.onboardingHeight}
                  type="number"
                  placeholder="170"
                  value={data.heightCm}
                  onChange={e => update({ heightCm: e.target.value })}
                />
                <Input
                  label={t.onboardingWeight}
                  type="number"
                  placeholder="70"
                  value={data.weightKg}
                  onChange={e => update({ weightKg: e.target.value })}
                />
              </div>

              <Input
                label={t.onboardingBirthDate}
                type="date"
                value={data.dateOfBirth}
                onChange={e => update({ dateOfBirth: e.target.value })}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">{t.onboardingStep2Title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t.onboardingStep2Desc}</p>
              </div>

              <div className="space-y-2">
                {goals.map(g => (
                  <Card
                    key={g.id}
                    className={`cursor-pointer transition-all ${
                      data.goal === g.id
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => update({ goal: g.id })}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <span className="text-2xl">{g.emoji}</span>
                      <span className="text-sm font-medium">{g.label}</span>
                      {data.goal === g.id && (
                        <div className="ml-auto h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">{t.onboardingStep3Title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t.onboardingStep3Desc}</p>
              </div>

              <div className="space-y-2">
                {activityLevels.map(a => (
                  <Card
                    key={a.id}
                    className={`cursor-pointer transition-all ${
                      data.activityLevel === a.id
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => update({ activityLevel: a.id })}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <span className="text-2xl">{a.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{a.label}</p>
                        <p className="text-xs text-muted-foreground">{a.desc}</p>
                      </div>
                      {data.activityLevel === a.id && (
                        <div className="ml-auto h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-8 pt-4">
        <div className="max-w-md mx-auto flex gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => animateStep(step - 1)}
              className="rounded-full px-6"
              disabled={isAnimating}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t.onboardingBack}
            </Button>
          )}

          <Button
            className="flex-1 rounded-full"
            onClick={() => {
              if (step < totalSteps) {
                animateStep(step + 1);
              } else {
                handleFinish();
              }
            }}
            disabled={(step > 0 && !canProceed()) || isAnimating}
            isLoading={saving}
          >
            {step === totalSteps ? t.onboardingFinish : t.onboardingNext}
            {step < totalSteps && !saving && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
