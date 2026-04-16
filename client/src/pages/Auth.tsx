import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { signInSchema, signUpSchema, type SignInFormData, type SignUpFormData } from '@/lib/validations/auth';
import myoraLogo from "@/assets/myora-logo-cropped.png";

function SignInForm() {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: SignInFormData) => {
    const { error } = await signIn(data.email, data.password);
    if (error) {
      toast({ title: t.signInError, description: error.message, variant: "destructive" });
    } else {
      toast({ title: t.success, description: t.loginSuccess });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label={t.email}
        type="email"
        autoComplete="email"
        placeholder={t.exampleEmail}
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label={t.password}
        type="password"
        autoComplete="current-password"
        showPasswordToggle
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={!isValid}>
        {t.signIn}
      </Button>
    </form>
  );
}

function SignUpForm() {
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: SignUpFormData) => {
    const { error } = await signUp(data.email, data.password, data.displayName);
    if (error) {
      toast({ title: t.signUpError, description: error.message, variant: "destructive" });
    } else {
      toast({ title: t.success, description: t.accountCreated });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label={t.displayName ?? "Ad Soyad"}
        type="text"
        autoComplete="name"
        placeholder={t.displayNamePlaceholder ?? "Adınız"}
        error={errors.displayName?.message}
        {...register('displayName')}
      />
      <Input
        label={t.email}
        type="email"
        autoComplete="email"
        placeholder={t.exampleEmail}
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label={t.password}
        type="password"
        autoComplete="new-password"
        showPasswordToggle
        hint={t.passwordHint}
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label={t.passwordRepeat}
        type="password"
        autoComplete="new-password"
        showPasswordToggle
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={!isValid}>
        {t.signUp}
      </Button>
    </form>
  );
}

export default function Auth() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect to home - ProtectedRoute will handle onboarding check
      navigate('/');
    }
  }, [user, navigate]);

  // Don't render anything while auth is initializing - splash screen handles this
  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={myoraLogo} alt="myora" className="w-36 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {t.authSubtitle}
          </p>
        </div>
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">{t.signIn}</TabsTrigger>
                <TabsTrigger value="signup">{t.signUp}</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <SignInForm />
              </TabsContent>
              <TabsContent value="signup">
                <SignUpForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}