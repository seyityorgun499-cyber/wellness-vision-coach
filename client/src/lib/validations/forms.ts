import { z } from 'zod';

export interface FormValidationMessages {
  nameMin: string;
  relationRequired: string;
  medNameMin: string;
  dosageRequired: string;
  timeRequired: string;
  bloodTestMin: string;
  contentMin: string;
  activityRequired: string;
  durationMin: string;
}

export const defaultFormMessages: FormValidationMessages = {
  nameMin: 'İsim en az 2 karakter olmalı',
  relationRequired: 'İlişki türü seçiniz',
  medNameMin: 'İlaç adı en az 2 karakter olmalı',
  dosageRequired: 'Dozaj giriniz',
  timeRequired: 'Saat seçiniz',
  bloodTestMin: 'Tahlil sonuçlarını giriniz (en az 10 karakter)',
  contentMin: 'İçerik en az 3 karakter olmalı',
  activityRequired: 'Aktivite türü seçiniz',
  durationMin: 'Süre en az 1 dakika olmalı',
};

export const createAddFamilyMemberSchema = (m: FormValidationMessages = defaultFormMessages) =>
  z.object({
    name: z.string().min(2, m.nameMin),
    relationship: z.string().min(1, m.relationRequired),
  });

export const createAddMedicationSchema = (m: FormValidationMessages = defaultFormMessages) =>
  z.object({
    name: z.string().min(2, m.medNameMin),
    dosage: z.string().min(1, m.dosageRequired),
    frequency: z.string().default('daily'),
    scheduleTime: z.string().min(1, m.timeRequired),
  });

export const createBloodTestUploadSchema = (m: FormValidationMessages = defaultFormMessages) =>
  z.object({
    ocrText: z.string().min(10, m.bloodTestMin),
    labName: z.string().optional(),
    testDate: z.string().optional(),
  });

export const createCommunityPostSchema = (m: FormValidationMessages = defaultFormMessages) =>
  z.object({
    title: z.string().optional(),
    content: z.string().min(3, m.contentMin),
    category: z.string().default('general'),
  });

export const createActivityLogSchema = (m: FormValidationMessages = defaultFormMessages) =>
  z.object({
    activityType: z.string().min(1, m.activityRequired),
    durationMinutes: z.coerce.number().min(1, m.durationMin),
    intensity: z.enum(['light', 'moderate', 'vigorous']).default('moderate'),
    notes: z.string().optional(),
  });

export const addFamilyMemberSchema = createAddFamilyMemberSchema();
export const addMedicationSchema = createAddMedicationSchema();
export const bloodTestUploadSchema = createBloodTestUploadSchema();
export const communityPostSchema = createCommunityPostSchema();
export const activityLogSchema = createActivityLogSchema();

export type AddFamilyMemberData = z.infer<ReturnType<typeof createAddFamilyMemberSchema>>;
export type AddMedicationData = z.infer<ReturnType<typeof createAddMedicationSchema>>;
export type BloodTestUploadData = z.infer<ReturnType<typeof createBloodTestUploadSchema>>;
export type CommunityPostData = z.infer<ReturnType<typeof createCommunityPostSchema>>;
export type ActivityLogData = z.infer<ReturnType<typeof createActivityLogSchema>>;
