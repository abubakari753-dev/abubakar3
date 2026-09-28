import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBirr(amount: number): string {
  return `${amount.toLocaleString("en-ET")} ETB`;
}

export function padCode(n: number | string, width = 2): string {
  return String(n).replace(/\.0$/, "").padStart(width, "0");
}

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function searchKey(value: string): string {
  return normalizeName(value).toLowerCase();
}

export function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function formatRecordedDate(
  day?: number | null,
  month?: number | null,
  year?: number | null,
): string {
  if (!day && !month && !year) return "—";
  const d = day ? padCode(day) : "??";
  const m = month ? padCode(month) : "??";
  const y = year ? String(year) : "????";
  return `${d}/${m}/${y}`;
}

export function ageFromYear(year?: number | null, now = new Date().getFullYear()): number | null {
  if (!year || year < 1900 || year > now) return null;
  return now - year;
}

export function fileStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}
