/**
 * Myora – Aile Takip Bileseni (Family Tracking)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { familyAPI } from "@/lib/api";
import { toast } from "sonner";
import { notificationService } from "@/services/NotificationService";
import { addFamilyMemberSchema, addMedicationSchema, type AddFamilyMemberData, type AddMedicationData } from "@/lib/validations/forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Plus,
  Pill,
  Check,
  X,
  Clock,
  ArrowLeft,
  Heart,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorView } from "@/components/ui/error-view";
import { EmptyState } from "@/components/ui/empty-state";
import { useLanguage } from "@/contexts/LanguageContext";

interface FamilyTrackingProps {
  onBack?: () => void;
}

export function FamilyTracking({ onBack: onBackProp }: FamilyTrackingProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const onBack = onBackProp ?? (() => navigate('/'));
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddMed, setShowAddMed] = useState(false);
  const queryClient = useQueryClient();

  const RELATIONSHIPS: Record<string, string> = {
    parent: t.relParent,
    child: t.relChild,
    spouse: t.relSpouse,
    sibling: t.relSibling,
    grandparent: t.relGrandparent,
    other: t.relOther,
  };

  const memberForm = useForm<AddFamilyMemberData>({
    resolver: zodResolver(addFamilyMemberSchema),
    defaultValues: { name: "", relationship: "parent" },
  });

  const medForm = useForm<AddMedicationData>({
    resolver: zodResolver(addMedicationSchema),
    defaultValues: { name: "", dosage: "", frequency: "daily", scheduleTime: "08:00" },
  });

  const { data: members = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["family-members"],
    queryFn: () => familyAPI.getMembers() as Promise<any[]>,
  });

  const { data: medications = [] } = useQuery({
    queryKey: ["family-medications", selectedMember],
    queryFn: () => selectedMember ? familyAPI.getMedications(selectedMember) as Promise<any[]> : Promise.resolve([]),
    enabled: !!selectedMember,
  });

  const { data: adherence } = useQuery({
    queryKey: ["family-adherence", selectedMember],
    queryFn: () => selectedMember ? familyAPI.getAdherence(selectedMember) as Promise<any> : Promise.resolve(null),
    enabled: !!selectedMember,
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: AddFamilyMemberData) => familyAPI.addMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-members"] });
      setShowAddMember(false);
      memberForm.reset();
      toast.success(t.familyMemberAdded);
    },
    onError: (err: Error) => {
      toast.error(err.message || t.familyMemberAddFailed);
    },
  });

  const addMedMutation = useMutation({
    mutationFn: (data: AddMedicationData) => familyAPI.addMedication(selectedMember!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-medications"] });
      setShowAddMed(false);
      medForm.reset();
      toast.success(t.medicationAdded);
    },
    onError: (err: Error) => {
      toast.error(err.message || t.medicationAddFailed);
    },
  });

  const logMedMutation = useMutation({
    mutationFn: ({ medId, taken }: { medId: string; taken: boolean }) =>
      familyAPI.logMedication(medId, { taken, takenAt: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-medications", "family-adherence"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || t.medicationLogFailed);
    },
  });

  const activeMember = members.find((m: any) => m.id === selectedMember);

  useEffect(() => {
    if (!selectedMember || !activeMember) return;
    const medReminders = medications.map((med: any) => ({
      memberName: activeMember.name,
      medicationName: med.name,
      scheduleTime: med.scheduleTime || '09:00',
    }));
    notificationService.scheduleFamilyMedicationReminders(selectedMember, medReminders);
  }, [medications, activeMember, selectedMember]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          {onBack && !selectedMember && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {selectedMember && (
            <Button variant="ghost" size="icon" onClick={() => setSelectedMember(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold">
              {selectedMember ? activeMember?.name || t.familyMember : t.familyTrackingTitle}
            </h1>
            <p className="text-xs text-muted-foreground">
              {selectedMember ? t.medicationTracking : t.familyTrackingSubtitleHeader}
            </p>
          </div>
        </div>
      </div>

      {!selectedMember ? (
        <div className="px-4 py-4 space-y-3">
          {isLoading ? (
            <ListSkeleton count={3} />
          ) : isError ? (
            <ErrorView message={error instanceof Error ? error.message : t.familyLoadFailed} onRetry={refetch} />
          ) : members.length === 0 && !showAddMember ? (
            <EmptyState
              icon={<Users className="h-12 w-12" />}
              title={t.noFamilyMembers}
              description={t.addFamilyDesc}
              action={{ label: t.addFamilyMember, onClick: () => setShowAddMember(true) }}
            />
          ) : (
            <>
              {members.map((member: any) => (
                <Card
                  key={member.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedMember(member.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {RELATIONSHIPS[member.relationship] || member.relationship}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}

              {showAddMember ? (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <form onSubmit={memberForm.handleSubmit((data) => addMemberMutation.mutate(data))} className="space-y-3">
                      <div>
                        <Input placeholder={t.name} {...memberForm.register('name')} />
                        {memberForm.formState.errors.name && (
                          <p className="text-xs text-destructive mt-1">{memberForm.formState.errors.name.message}</p>
                        )}
                      </div>
                      <select
                        className="w-full p-2 rounded-md border bg-background text-sm"
                        {...memberForm.register('relationship')}
                      >
                        {Object.entries(RELATIONSHIPS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <Button size="sm" type="submit" disabled={addMemberMutation.isPending}>
                          {addMemberMutation.isPending ? t.adding : t.add}
                        </Button>
                        <Button size="sm" variant="outline" type="button" onClick={() => { setShowAddMember(false); memberForm.reset(); }}>
                          {t.cancel}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => setShowAddMember(true)}>
                  <UserPlus className="h-4 w-4 mr-2" /> {t.addFamilyMember}
                </Button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="px-4 py-4 space-y-4">
          {adherence && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{t.todayAdherence}</p>
                  <Badge variant={adherence.adherenceRate >= 80 ? "default" : "destructive"}>
                    %{adherence.adherenceRate}
                  </Badge>
                </div>
                <Progress value={adherence.adherenceRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {adherence.taken}/{adherence.total} {t.medicationsTaken}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-semibold px-1">{t.medicationsAndSupplements}</h3>
            {medications.length === 0 && !showAddMed ? (
            <EmptyState
              icon={<Pill className="h-10 w-10" />}
              title={t.noMedicationsYet}
              description={t.addMedicationDesc}
              action={{ label: t.addMedication, onClick: () => setShowAddMed(true) }}
            />
          ) : null}
          {medications.map((med: any) => (
              <Card key={med.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Pill className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{med.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {med.dosage} • {med.scheduleTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      onClick={() => logMedMutation.mutate({ medId: med.id, taken: true })}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => logMedMutation.mutate({ medId: med.id, taken: false })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {showAddMed ? (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <form onSubmit={medForm.handleSubmit((data) => addMedMutation.mutate(data))} className="space-y-3">
                    <div>
                      <Input placeholder={t.medicationName} {...medForm.register('name')} />
                      {medForm.formState.errors.name && (
                        <p className="text-xs text-destructive mt-1">{medForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input placeholder={t.dosage.replace(':', '')} {...medForm.register('dosage')} />
                        {medForm.formState.errors.dosage && (
                          <p className="text-xs text-destructive mt-1">{medForm.formState.errors.dosage.message}</p>
                        )}
                      </div>
                      <Input type="time" {...medForm.register('scheduleTime')} className="w-32" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" type="submit" disabled={addMedMutation.isPending}>
                        {addMedMutation.isPending ? t.adding : t.add}
                      </Button>
                      <Button size="sm" variant="outline" type="button" onClick={() => { setShowAddMed(false); medForm.reset(); }}>
                        {t.cancel}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setShowAddMed(true)}>
                <Plus className="h-4 w-4 mr-2" /> {t.addMedicationSupplement}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
