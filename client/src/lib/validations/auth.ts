import { z } from "zod";

export interface AuthValidationMessages {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMinLength: string;
  passwordLetter: string;
  passwordNumber: string;
  nameMin: string;
  nameMax: string;
  confirmRequired: string;
  confirmMismatch: string;
}

export const defaultAuthMessages: AuthValidationMessages = {
  emailRequired: "E-posta adresi gerekli",
  emailInvalid: "Geçerli bir e-posta adresi girin",
  passwordRequired: "Şifre gerekli",
  passwordMinLength: "Şifre en az 6 karakter olmalı",
  passwordLetter: "Şifre en az bir harf içermeli",
  passwordNumber: "Şifre en az bir rakam içermeli",
  nameMin: "Ad en az 2 karakter olmalı",
  nameMax: "Ad en fazla 50 karakter olabilir",
  confirmRequired: "Şifre tekrarı gerekli",
  confirmMismatch: "Şifreler eşleşmiyor",
};

export const createSignInSchema = (m: AuthValidationMessages = defaultAuthMessages) =>
  z.object({
    email: z.string().min(1, m.emailRequired).email(m.emailInvalid),
    password: z.string().min(1, m.passwordRequired).min(6, m.passwordMinLength),
  });

export const createSignUpSchema = (m: AuthValidationMessages = defaultAuthMessages) =>
  z
    .object({
      displayName: z.string().min(2, m.nameMin).max(50, m.nameMax),
      email: z.string().min(1, m.emailRequired).email(m.emailInvalid),
      password: z
        .string()
        .min(1, m.passwordRequired)
        .min(6, m.passwordMinLength)
        .regex(/[A-Za-z]/, m.passwordLetter)
        .regex(/[0-9]/, m.passwordNumber),
      confirmPassword: z.string().min(1, m.confirmRequired),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: m.confirmMismatch,
      path: ["confirmPassword"],
    });

export const signInSchema = createSignInSchema();
export const signUpSchema = createSignUpSchema();

export type SignInFormData = z.infer<ReturnType<typeof createSignInSchema>>;
export type SignUpFormData = z.infer<ReturnType<typeof createSignUpSchema>>;
