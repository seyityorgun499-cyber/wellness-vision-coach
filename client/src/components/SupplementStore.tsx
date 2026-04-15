/**
 * Myora – Takviye Gida Magazasi (Supplement Store)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supplementAPI } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingCart,
  Star,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  Package,
  Check,
  X,
  Pill,
  Leaf,
  Zap,
  Droplet,
  Fish,
} from "lucide-react";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorView } from "@/components/ui/error-view";
import { useLanguage } from "@/contexts/LanguageContext";

interface SupplementStoreProps {
  onBack?: () => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  vitamin: Zap,
  mineral: Droplet,
  amino_acid: Sparkles,
  herbal: Leaf,
  probiotic: Pill,
  omega: Fish,
  protein: Package,
};

export function SupplementStore({ onBack: onBackProp }: SupplementStoreProps) {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const onBack = onBackProp ?? (() => navigate('/'));
  const [activeTab, setActiveTab] = useState<"recommendations" | "store" | "orders">("recommendations");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const queryClient = useQueryClient();

  const CATEGORY_LABELS: Record<string, string> = {
    vitamin: t.catVitamins,
    mineral: t.catMinerals,
    amino_acid: t.catAminoAcids,
    herbal: t.catHerbal,
    probiotic: t.catProbiotics,
    omega: t.catOmega,
    protein: t.catProtein,
  };

  const { data: recommendations = [], isLoading: recsLoading, isError: recsError, error: recsErrorObj, refetch: recsRefetch } = useQuery({
    queryKey: ["supplement-recommendations"],
    queryFn: () => supplementAPI.getRecommendations() as Promise<any[]>,
  });

  const { data: supplements = [], isLoading: suppsLoading } = useQuery({
    queryKey: ["supplements", selectedCategory],
    queryFn: () => supplementAPI.getSupplements(selectedCategory) as Promise<any[]>,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["supplement-orders"],
    queryFn: () => supplementAPI.getOrders() as Promise<any[]>,
  });

  const updateRecStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      supplementAPI.updateRecommendationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplement-recommendations"] });
      toast.success(t.recStatusUpdated);
    },
    onError: (err: Error) => {
      toast.error(err.message || t.recStatusFailed);
    },
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold">{t.supplementTitle}</h1>
            <p className="text-xs text-muted-foreground">{t.supplementSubtitle}</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="px-4 pt-3">
        <TabsList className="w-full">
          <TabsTrigger value="recommendations" className="flex-1">
            <Sparkles className="h-3 w-3 mr-1" /> {t.recommendationsTab}
          </TabsTrigger>
          <TabsTrigger value="store" className="flex-1">
            <ShoppingCart className="h-3 w-3 mr-1" /> {t.storeTab}
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex-1">
            <Package className="h-3 w-3 mr-1" /> {t.ordersTab}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-3 mt-3">
          {recsLoading ? (
            <ListSkeleton count={3} />
          ) : recsError ? (
            <ErrorView message={recsErrorObj instanceof Error ? recsErrorObj.message : t.recsLoadFailed} onRetry={recsRefetch} />
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>{t.noRecommendationsYet}</p>
              <p className="text-sm">{t.recommendationsDesc}</p>
            </div>
          ) : (
            recommendations.map((rec: any) => (
              <Card key={rec.id} className={rec.priority === "high" ? "border-orange-300" : ""}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}>
                        {rec.priority === "high" ? t.highPriority : rec.priority === "medium" ? t.mediumPriority : t.lowPriority} {t.priority}
                      </Badge>
                    </div>
                    {rec.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => updateRecStatusMutation.mutate({ id: rec.id, status: "accepted" })}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => updateRecStatusMutation.mutate({ id: rec.id, status: "rejected" })}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium mb-1">{rec.supplementName || t.supplementTitle}</p>
                  <p className="text-xs text-muted-foreground mb-2">{rec.reason}</p>
                  {rec.suggestedDosage && (
                    <p className="text-xs"><span className="font-medium">{t.dosage}</span> {rec.suggestedDosage}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="store" className="space-y-3 mt-3">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              <Button variant={!selectedCategory ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(undefined)}>
                {t.all}
              </Button>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const Icon = CATEGORY_ICONS[key] || Pill;
                return (
                  <Button key={key} variant={selectedCategory === key ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(key)} className="whitespace-nowrap">
                    <Icon className="h-3 w-3 mr-1" /> {label}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>

          <div className="grid grid-cols-2 gap-3">
            {supplements.map((supp: any) => (
              <Card key={supp.id} className="overflow-hidden">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {supp.imageUrl ? (
                    <img src={supp.imageUrl} alt={supp.name} className="object-cover w-full h-full" />
                  ) : (
                    <Pill className="h-12 w-12 text-muted-foreground/30" />
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-sm line-clamp-2">{supp.name}</p>
                  <p className="text-xs text-muted-foreground">{supp.brand}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold text-sm">{supp.price ? `\u20BA${supp.price}` : "\u2014"}</p>
                    {supp.rating && (
                      <div className="flex items-center gap-0.5 text-xs text-yellow-600">
                        <Star className="h-3 w-3 fill-current" />
                        {supp.rating}
                      </div>
                    )}
                  </div>
                  {supp.externalUrl && (
                    <Button size="sm" variant="outline" className="w-full mt-2" asChild>
                      <a href={supp.externalUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" /> {t.orderNow}
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {suppsLoading ? (
            <ListSkeleton count={4} />
          ) : supplements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>{t.noCategoryProducts}</p>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="orders" className="space-y-3 mt-3">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>{t.noOrdersYet}</p>
            </div>
          ) : (
            orders.map((order: any) => (
              <Card key={order.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.orderedAt).toLocaleDateString(locale)}
                    </p>
                  </div>
                  <Badge>{order.orderStatus}</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
