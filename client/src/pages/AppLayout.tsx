import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { useKeyboard } from "@/hooks/useKeyboard";
import { Camera, Mic, FileText, Activity, Plus } from "lucide-react";
import { HealthDataProvider } from "@/contexts/HealthDataContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useTabNavigate, useActiveTab } from "@/hooks/useTabNavigate";
import { useLanguage } from "@/contexts/LanguageContext";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const ALLOWED_HOSTS = ['myora.app', 'localhost'];

const AppLayout = () => {
  const { t } = useLanguage();
  const activeTab = useActiveTab();
  const tabNavigate = useTabNavigate();
  const navigate = useNavigate();
  const location = useLocation();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const { isOpen: isKeyboardOpen } = useKeyboard();

  // Deep link security handler
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = App.addListener('appUrlOpen', ({ url }) => {
      try {
        const parsed = new URL(url);
        if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
          console.warn('Geçersiz deep link host:', parsed.hostname);
          return;
        }
        const path = parsed.pathname || '/';
        navigate(path);
      } catch {
        console.warn('Geçersiz deep link URL:', url);
      }
    });

    return () => { listener.then(l => l.remove()); };
  }, [navigate]);

  // Android back button handler
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = App.addListener('backButton', ({ canGoBack }) => {
      // If quick-add sheet is open, close it
      if (isQuickAddOpen) {
        setIsQuickAddOpen(false);
        return;
      }
      // If on home page, confirm exit
      if (location.pathname === '/') {
        if (window.confirm(t.exitAppConfirm)) {
          App.exitApp();
        }
        return;
      }
      // Otherwise navigate back
      if (canGoBack) {
        navigate(-1);
      }
    });

    return () => { listener.then(l => l.remove()); };
  }, [isQuickAddOpen, location.pathname, navigate]);

  const handleTabChange = (tab: string) => {
    if (tab === "add") {
      setIsQuickAddOpen(true);
      return;
    }
    tabNavigate(tab);
  };

  const quickAddOptions = [
    {
      id: "camera",
      title: t.scanFood,
      description: t.scanFoodDesc,
      icon: Camera,
    },
    {
      id: "voice",
      title: t.voiceLog,
      description: t.voiceLogDesc,
      icon: Mic,
    },
    {
      id: "docs",
      title: t.uploadDocuments,
      description: t.uploadDocumentsDesc,
      icon: FileText,
    },
    {
      id: "activity",
      title: t.logActivity,
      description: t.logActivityDesc,
      icon: Activity,
    },
  ];

  return (
    <HealthDataProvider>
      <div className="relative">
        <div className="animate-fade-in">
          <Outlet />
        </div>
        {!isKeyboardOpen && (
          <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        )}

        <Sheet open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
          <SheetContent side="bottom" className="max-w-md mx-auto rounded-t-2xl p-0 pb-6">
            <SheetHeader className="p-4 pb-2">
              <SheetTitle className="flex items-center gap-2 text-base">
                <Plus className="h-4 w-4 text-primary" />
                {t.quickAdd}
              </SheetTitle>
              <SheetDescription>
                {t.chooseNewEntry}
              </SheetDescription>
            </SheetHeader>

            <div className="px-4 pb-4 space-y-2">
              {quickAddOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.id}
                    variant="ghost"
                    className="w-full h-auto justify-start p-3"
                    onClick={() => {
                      setIsQuickAddOpen(false);
                      tabNavigate(option.id);
                    }}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{option.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </HealthDataProvider>
  );
};

export default AppLayout;
