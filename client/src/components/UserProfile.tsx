import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

interface ProfileForm {
  displayName: string;
  dateOfBirth: string;
  heightCm: string;
  weightKg: string;
  activityLevel: string;
}

export const UserProfile: React.FC = () => {
  const { user, signOut, refreshUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [formData, setFormData] = useState<ProfileForm>({
    displayName: '',
    dateOfBirth: '',
    heightCm: '',
    weightKg: '',
    activityLevel: 'moderate',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        dateOfBirth: user.dateOfBirth || '',
        heightCm: user.heightCm?.toString() || '',
        weightKg: user.weightKg || '',
        activityLevel: user.activityLevel || 'moderate',
      });
    }
  }, [user]);

  const saveMutation = useMutation({
    mutationFn: () =>
      authAPI.updateProfile({
        displayName: formData.displayName || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        heightCm: formData.heightCm ? parseInt(formData.heightCm) : undefined,
        weightKg: formData.weightKg || undefined,
        activityLevel: formData.activityLevel,
      }),
    onSuccess: async () => {
      await refreshUser();
      toast({ title: t.success, description: t.profileUpdated });
    },
    onError: () => {
      toast({ title: t.error, description: t.profileUpdateFailed, variant: 'destructive' });
    },
  });

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ title: t.error, description: t.signOutError, variant: 'destructive' });
    }
  };

  const set = (field: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const calculateBMI = () => {
    const height = parseFloat(formData.heightCm);
    const weight = parseFloat(formData.weightKg);
    if (height && weight) {
      const hm = height / 100;
      return (weight / (hm * hm)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: t.bmiUnderweight, color: 'text-blue-600' };
    if (bmi < 25)   return { label: t.bmiNormal,      color: 'text-green-600' };
    if (bmi < 30)   return { label: t.bmiOverweight,  color: 'text-yellow-600' };
    return               { label: t.bmiObese,         color: 'text-red-600' };
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.displayName || user?.email}</h2>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          {t.signOutLabel}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.profileInfo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">{t.displayName}</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={set('displayName')}
                placeholder={t.yourName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">{t.dateOfBirth}</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={set('dateOfBirth')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heightCm">{t.heightCm}</Label>
              <Input
                id="heightCm"
                type="number"
                value={formData.heightCm}
                onChange={set('heightCm')}
                placeholder="175"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weightKg">{t.weightKg}</Label>
              <Input
                id="weightKg"
                type="number"
                step="0.1"
                value={formData.weightKg}
                onChange={set('weightKg')}
                placeholder="70"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityLevel">{t.activityLevel}</Label>
            <Select
              value={formData.activityLevel}
              onValueChange={(value) => setFormData(prev => ({ ...prev, activityLevel: value }))}
            >
              <SelectTrigger id="activityLevel">
                <SelectValue placeholder={t.selectActivityLevel} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">{t.sedentary}</SelectItem>
                <SelectItem value="light">{t.lightlyActive}</SelectItem>
                <SelectItem value="moderate">{t.moderatelyActive}</SelectItem>
                <SelectItem value="active">{t.active}</SelectItem>
                <SelectItem value="very_active">{t.veryActive}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {bmi && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t.bmi}</span>
                <div className="text-right">
                  <span className="text-2xl font-bold">{bmi}</span>
                  {bmiCategory && (
                    <span className={`ml-2 ${bmiCategory.color}`}>({bmiCategory.label})</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={() => saveMutation.mutate()}
            className="w-full"
            isLoading={saveMutation.isPending}
          >
            {t.save}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
