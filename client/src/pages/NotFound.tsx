import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/types/routes";
import { logger } from "@/lib/logger";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const { t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    logger.warn("404 — non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-display font-bold text-foreground">404</h1>
        <p className="text-body text-muted-foreground">{t.pageNotFound}</p>
        <Button asChild variant="outline">
          <Link to={ROUTES.HOME}>
            <Home className="h-4 w-4 mr-2" />
            {t.goHome}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
