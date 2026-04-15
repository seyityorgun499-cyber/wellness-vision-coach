import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function toDate(ts: unknown): Date | null {
  if (!ts) return null;
  const raw = ts instanceof Date ? ts.toISOString() : String(ts);
  const d = new Date(raw.replace(' ', 'T'));
  return isNaN(d.getTime()) ? null : d;
}

export function isToday(ts: unknown): boolean {
  const d = toDate(ts);
  if (!d) return false;
  return d.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
}

export function isWithinLastNDays(ts: unknown, days: number): boolean {
  const d = toDate(ts);
  if (!d) return false;
  return (Date.now() - d.getTime()) < days * 86_400_000;
}
