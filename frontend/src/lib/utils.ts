import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function calculateSI(principal: number, tenureDays: number): { si: number; total: number } {
  const si = (principal * 12 * tenureDays) / (365 * 100);
  return { si: Math.round(si * 100) / 100, total: Math.round((principal + si) * 100) / 100 };
}

export const STATUS_COLORS: Record<string, string> = {
  incomplete: 'bg-gray-100 text-gray-700',
  applied: 'bg-blue-100 text-blue-700',
  sanctioned: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  disbursed: 'bg-purple-100 text-purple-700',
  closed: 'bg-emerald-100 text-emerald-700',
};
