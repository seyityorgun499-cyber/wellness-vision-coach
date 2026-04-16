import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { lazy, Suspense, useState, useEffect, useCallback } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ROUTES } from "@/types/routes";
import splashLogo from "@/assets/myora-splash-logo.png";
import { useAuth } from "@/contexts/AuthContext";

const AppLayout = lazy(() => import("./pages/AppLayout"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/NotFound"));

const HealthDashboard = lazy(() => import("@/components/HealthDashboard").then(m => ({ default: m.HealthDashboard })));
const AllLogger = lazy(() => import("@/components/AllLogger").then(m => ({ default: m.AllLogger })));
const Boost = lazy(() => import("@/components/Boost").then(m => ({ default: m.Boost })));
const AnalysisHub = lazy(() => import("@/components/AnalysisHub").then(m => ({ default: m.AnalysisHub })));
const FoodCapture = lazy(() => import("@/components/FoodCapture").then(m => ({ default: m.FoodCapture })));
const VoiceLogger = lazy(() => import("@/components/VoiceLogger").then(m => ({ default: m.VoiceLogger })));
const DocumentUpload = lazy(() => import("@/components/DocumentUpload").then(m => ({ default: m.DocumentUpload })));
const ActivityLogger = lazy(() => import("@/components/ActivityLogger").then(m => ({ default: m.ActivityLogger })));

const IntervalFasting = lazy(() => import("@/components/IntervalFasting").then(m => ({ default: m.IntervalFasting })));
const Analytics = lazy(() => import("@/components/Analytics").then(m => ({ default: m.Analytics })));
const WidgetCreator = lazy(() => import("@/components/WidgetCreator").then(m => ({ default: m.WidgetCreator })));
const WearableDevices = lazy(() => import("@/components/WearableDevices").then(m => ({ default: m.WearableDevices })));
const WearableDataDashboard = lazy(() => import("@/components/WearableDataDashboard").then(m => ({ default: m.WearableDataDashboard })));
const ExpertChat = lazy(() => import("@/components/ExpertChat").then(m => ({ default: m.ExpertChat })));
const NotificationSettings = lazy(() => import("@/components/NotificationSettings"));
const UserProfile = lazy(() => import("@/components/UserProfile").then(m => ({ default: m.UserProfile })));
const Community = lazy(() => import("@/components/Community").then(m => ({ default: m.Community })));
const FamilyTracking = lazy(() => import("@/components/FamilyTracking").then(m => ({ default: m.FamilyTracking })));
const SupplementStore = lazy(() => import("@/components/SupplementStore").then(m => ({ default: m.SupplementStore })));
const BloodTestAnalysis = lazy(() => import("@/components/BloodTestAnalysis").then(m => ({ default: m.BloodTestAnalysis })));
const HealthProfile = lazy(() => import("@/components/HealthProfile").then(m => ({ default: m.HealthProfile })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
const isNativeWebView =
  Capacitor.isNativePlatform() ||
  window.location.protocol === 'capacitor:' ||
  window.location.protocol === 'file:';
const Router = isNativeWebView ? HashRouter : BrowserRouter;

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    {/* Loading handled by splash screen */}
  </div>
);

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const { loading } = useAuth();

  useEffect(() => {
    // Minimum 1s splash, maximum 2s - fade out when auth ready
    const minTimer = setTimeout(() => {
      if (!loading) {
        setFadeOut(true);
        setTimeout(onFinish, 300);
      }
    }, 1000);

    // Force finish after 2s regardless
    const maxTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, 300);
    }, 2000);

    return () => { clearTimeout(minTimer); clearTimeout(maxTimer); };
  }, [onFinish, loading]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-300"
      style={{ opacity: fadeOut ? 0 : 1, pointerEvents: fadeOut ? 'none' : 'auto' }}
    >
      <img src={splashLogo} alt="Myora" style={{ width: '70vw', maxWidth: '320px' }} className="animate-fade-in" />
    </div>
  );
};

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const dismissSplash = useCallback(() => setShowSplash(false), []);
  const { loading: authLoading } = useAuth();

  return (
    <>
      <OfflineBanner />
      <Toaster />
      <Sonner />
      {showSplash && <SplashScreen onFinish={dismissSplash} />}
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {/* Routes render after splash ends. Auth loading happens behind splash. */}
        {showSplash ? (
          <div className="fixed inset-0 bg-background z-40" />
        ) : (
        <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
          <Routes>

            <Route path={ROUTES.AUTH} element={<Auth />} />
            <Route path={ROUTES.ONBOARDING} element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path={ROUTES.HOME} element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<HealthDashboard />} />
              <Route path="log" element={<AllLogger />} />
              <Route path="boost" element={<Boost />} />
              <Route path="analysis" element={<AnalysisHub />} />
              <Route path="camera" element={<FoodCapture />} />
              <Route path="voice" element={<VoiceLogger />} />
              <Route path="docs" element={<DocumentUpload />} />
              <Route path="activity" element={<ActivityLogger />} />
              <Route path="fasting" element={<IntervalFasting />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="widgets" element={<WidgetCreator />} />
              <Route path="wearables" element={<WearableDevices />} />
              <Route path="wearable-data" element={<WearableDataDashboard />} />
              <Route path="chat" element={<ExpertChat />} />
              <Route path="notifications" element={<NotificationSettings />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="community" element={<Community />} />
              <Route path="family" element={<FamilyTracking />} />
              <Route path="supplements" element={<SupplementStore />} />
              <Route path="bloodtest" element={<BloodTestAnalysis />} />
              <Route path="health-profile" element={<HealthProfile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
        )}
      </Router>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
