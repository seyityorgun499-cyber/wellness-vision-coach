/**
 * Myora – Kan Tahlili Analizi Bileseni (Blood Test Analysis)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { healthAPI } from "@/lib/api";
import { toast } from "sonner";
import { bloodTestUploadSchema, type BloodTestUploadData } from "@/lib/validations/forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TestTube,
  Upload,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
} from "lucide-react";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorView } from "@/components/ui/error-view";
import { EmptyState } from "@/components/ui/empty-state";
import { useLanguage } from "@/contexts/LanguageContext";

interface BloodTestAnalysisProps {
  onBack?: () => void;
}

export function BloodTestAnalysis({ onBack: onBackProp }: BloodTestAnalysisProps) {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const onBack = onBackProp ?? (() => navigate('/'));
  const [showUpload, setShowUpload] = useState(false);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const STATUS_CONFIG = {
    normal: { color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", icon: CheckCircle, label: t.statusNormal },
    low: { color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20", icon: AlertTriangle, label: t.statusLow },
    high: { color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20", icon: AlertTriangle, label: t.statusHigh },
    critical: { color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", icon: XCircle, label: t.statusCritical },
  };

  const uploadForm = useForm<BloodTestUploadData>({
    resolver: zodResolver(bloodTestUploadSchema),
    defaultValues: { ocrText: "", labName: "", testDate: "" },
  });

  const { data: bloodTests = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["blood-tests"],
    queryFn: () => healthAPI.getBloodTests() as Promise<any[]>,
  });

  const uploadMutation = useMutation({
    mutationFn: (data: BloodTestUploadData) => healthAPI.uploadBloodTest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-tests"] });
      setShowUpload(false);
      uploadForm.reset();
      toast.success(t.bloodTestUploaded);
    },
    onError: (err: Error) => {
      toast.error(err.message || t.bloodTestUploadFailed);
    },
  });

  const { data: testDetails } = useQuery({
    queryKey: ["blood-test-details", expandedTest],
    queryFn: () => expandedTest ? healthAPI.getBloodTest(expandedTest) as Promise<any> : Promise.resolve(null),
    enabled: !!expandedTest,
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-bold">{t.bloodTest}</h1>
              <p className="text-xs text-muted-foreground">{t.analyzeWithAi}</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowUpload(true)}>
            <Upload className="h-4 w-4 mr-1" /> {t.upload}
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {showUpload && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TestTube className="h-4 w-4" /> {t.uploadNewTest}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={uploadForm.handleSubmit((data) => uploadMutation.mutate(data))} className="space-y-3">
                <Input placeholder={t.labNamePlaceholder} {...uploadForm.register('labName')} />
                <Input type="date" {...uploadForm.register('testDate')} />
                <div>
                  <textarea
                    className="w-full min-h-[120px] p-3 rounded-md border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t.testResultsPlaceholder}
                    {...uploadForm.register('ocrText')}
                  />
                  {uploadForm.formState.errors.ocrText && (
                    <p className="text-xs text-destructive mt-1">{uploadForm.formState.errors.ocrText.message}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" type="submit" disabled={uploadMutation.isPending}>
                    {uploadMutation.isPending ? t.analyzing : t.analyze}
                  </Button>
                  <Button size="sm" variant="outline" type="button" onClick={() => { setShowUpload(false); uploadForm.reset(); }}>
                    {t.cancel}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <ListSkeleton count={3} />
        ) : isError ? (
          <ErrorView message={error instanceof Error ? error.message : t.bloodTestsLoadFailed} onRetry={refetch} />
        ) : bloodTests.length === 0 ? (
          <EmptyState
            icon={<TestTube className="h-12 w-12" />}
            title={t.noBloodTestsYet}
            description={t.uploadTestsForAi}
            action={{ label: t.uploadTest, onClick: () => setShowUpload(true) }}
          />
        ) : (
          bloodTests.map((test: any) => {
            const isExpanded = expandedTest === test.id;
            const StatusIcon = STATUS_CONFIG[test.overallStatus as keyof typeof STATUS_CONFIG]?.icon || FileText;

            return (
              <Card key={test.id} className="overflow-hidden">
                <CardContent
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedTest(isExpanded ? null : test.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-5 w-5 ${STATUS_CONFIG[test.overallStatus as keyof typeof STATUS_CONFIG]?.color || "text-gray-400"}`} />
                      <div>
                        <p className="font-medium text-sm">{test.labName || t.bloodTest}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(test.testDate).toLocaleDateString(locale)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={test.overallStatus === "normal" ? "default" : "destructive"}>
                        {test.overallStatus === "normal" ? t.statusNormal : test.overallStatus === "attention" ? t.statusAttention : t.statusCritical}
                      </Badge>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {isExpanded && testDetails && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {testDetails.aiSummary && (
                        <div className="p-3 rounded-lg bg-primary/5 text-sm">
                          <p className="font-medium mb-1">{t.aiSummary}</p>
                          <p className="text-muted-foreground text-xs">{testDetails.aiSummary}</p>
                        </div>
                      )}

                      {testDetails.results?.map((result: any) => {
                        const config = STATUS_CONFIG[result.status as keyof typeof STATUS_CONFIG];
                        const range = result.referenceMin && result.referenceMax
                          ? `${result.referenceMin} - ${result.referenceMax} ${result.unit}`
                          : "";
                        const percentage = result.referenceMin && result.referenceMax
                          ? Math.min(100, Math.max(0, ((parseFloat(result.value) - parseFloat(result.referenceMin)) / (parseFloat(result.referenceMax) - parseFloat(result.referenceMin))) * 100))
                          : 50;

                        return (
                          <div key={result.id} className={`p-3 rounded-lg ${config?.bg || "bg-gray-50"}`}>
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-sm font-medium">{result.markerName}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold">{result.value} {result.unit}</span>
                                {config && (
                                  <Badge variant={result.status === "normal" ? "secondary" : "destructive"} className="text-xs">
                                    {config.label}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {range && (
                              <>
                                <Progress value={percentage} className="h-1.5 mt-1" />
                                <p className="text-xs text-muted-foreground mt-1">{t.ref}: {range}</p>
                              </>
                            )}
                            {result.aiInterpretation && (
                              <p className="text-xs text-muted-foreground mt-1 italic">{result.aiInterpretation}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
