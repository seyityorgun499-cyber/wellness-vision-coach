import { Home, ClipboardList, Zap, BarChart3, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation = ({
  activeTab,
  onTabChange
}: BottomNavigationProps) => {
  const { t } = useLanguage();
  const navItems = [
    { id: 'home', icon: Home, label: t.home },
    { id: 'log', icon: ClipboardList, label: t.log },
    { id: 'add', icon: Plus, label: '' },
    { id: 'boost', icon: Zap, label: t.boost },
    { id: 'analysis', icon: BarChart3, label: t.analysis },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label={t.mainNavigation}
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = item.id !== "add" && activeTab === item.id;

          if (item.id === 'add') {
            return (
              <button
                key="add"
                onClick={() => onTabChange('add')}
                className="flex items-center justify-center"
                data-testid="nav-add"
                aria-label={t.quickAddLabel}
              >
                <div className="h-11 w-11 -mt-3 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center active:scale-95 transition-transform">
                  <Plus size={22} strokeWidth={2.5} />
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
              data-testid={`nav-${item.id}`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`relative px-3 py-1 rounded-full transition-all duration-200 ${
                isActive ? 'bg-primary/10' : ''
              }`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] leading-tight ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
