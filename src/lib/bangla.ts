/**
 * Utility functions for Bengali language support, numeral conversion,
 * currency formatting, and month/category translations.
 */

const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(n: number | string | null | undefined): string {
  if (n === null || n === undefined) return '০';
  const str = typeof n === 'number' ? n.toLocaleString('en-IN') : String(n);
  return str.replace(/[0-9]/g, (w) => bengaliDigits[+w]);
}

export function formatBDT(amount: number | null | undefined, useBengaliDigits = true): string {
  const safeAmount = Number(amount || 0);
  if (useBengaliDigits) {
    return `৳ ${toBengaliNumber(safeAmount.toLocaleString('en-IN'))}`;
  }
  return `৳ ${safeAmount.toLocaleString('en-US')}`;
}

export const BANGLA_MONTHS = [
  { value: 1, label: 'জানুয়ারি', en: 'January' },
  { value: 2, label: 'ফেব্রুয়ারি', en: 'February' },
  { value: 3, label: 'মার্চ', en: 'March' },
  { value: 4, label: 'এপ্রিল', en: 'April' },
  { value: 5, label: 'মে', en: 'May' },
  { value: 6, label: 'জুন', en: 'June' },
  { value: 7, label: 'জুলাই', en: 'July' },
  { value: 8, label: 'আগস্ট', en: 'August' },
  { value: 9, label: 'সেপ্টেম্বর', en: 'September' },
  { value: 10, label: 'অক্টোবর', en: 'October' },
  { value: 11, label: 'নভেম্বর', en: 'November' },
  { value: 12, label: 'ডিসেম্বর', en: 'December' },
];

export function getBanglaMonthName(monthNumber: number): string {
  const found = BANGLA_MONTHS.find((m) => m.value === monthNumber);
  return found ? found.label : `${monthNumber}`;
}

export const ROLE_LABELS: Record<string, { bn: string; en: string }> = {
  admin: { bn: 'প্রধান অ্যাডমিন', en: 'Admin' },
  committee: { bn: 'কমিটি সদস্য', en: 'Committee' },
  member: { bn: 'সাধারণ সদস্য', en: 'General Member' },
};

export const STATUS_LABELS: Record<string, { bn: string; en: string; color: string }> = {
  paid: { bn: 'পরিশোধিত', en: 'Paid', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  partial: { bn: 'আংশিক পরিশোধ', en: 'Partial', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  due: { bn: 'বকেয়া', en: 'Due', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  active: { bn: 'সক্রিয়', en: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  inactive: { bn: 'নিষ্ক্রিয়', en: 'Inactive', color: 'bg-gray-100 text-gray-600 border-gray-300' },
};

export const EXPENSE_CATEGORIES = [
  { value: 'Charity', bn: 'সাধারণ সাদাকাহ / অনুদান', en: 'Charity' },
  { value: 'Medical Assistance', bn: 'চিকিৎসা সহায়তা', en: 'Medical Assistance' },
  { value: 'Food Assistance', bn: 'খাদ্য সহায়তা', en: 'Food Assistance' },
  { value: 'Islamic Activities', bn: 'ইসলামিক কার্যক্রম', en: 'Islamic Activities' },
  { value: 'Mosque or Madrasa', bn: 'মসজিদ / মাদ্রাসা অনুদান', en: 'Mosque or Madrasa' },
  { value: 'Other', bn: 'অন্যান্য খরচ', en: 'Other' },
];

export function getBanglaCategoryName(category: string): string {
  const found = EXPENSE_CATEGORIES.find((c) => c.value === category);
  return found ? found.bn : category;
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

