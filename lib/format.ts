// ── Currency registry ────────────────────────────────────────────────
export const CURRENCY_META: Record<string, { symbol: string; inrRate: number; locale: string }> = {
  INR: { symbol: '₹', inrRate: 1,      locale: 'en-IN' },
  USD: { symbol: '$', inrRate: 83.92,  locale: 'en-US' },
  EUR: { symbol: '€', inrRate: 90.11,  locale: 'en-DE' },
  GBP: { symbol: '£', inrRate: 106.3,  locale: 'en-GB' },
  CAD: { symbol: 'C$', inrRate: 61.45, locale: 'en-CA' },
};

/** Format an INR amount in any display currency. */
export function formatAmount(inrAmount: number, currencyCode: string, compact = false): string {
  if (currencyCode === 'INR') return formatINR(inrAmount, compact);
  const meta = CURRENCY_META[currencyCode];
  if (!meta) return formatINR(inrAmount, compact);
  const converted = inrAmount / meta.inrRate;
  if (compact && converted >= 1_000_000) return `${meta.symbol}${(converted / 1_000_000).toFixed(1)}M`;
  if (compact && converted >= 1_000)     return `${meta.symbol}${(converted / 1_000).toFixed(1)}K`;
  return `${meta.symbol}${new Intl.NumberFormat(meta.locale, { maximumFractionDigits: 0 }).format(converted)}`;
}

// Indian number formatting
export function formatINR(amount: number, compact = false): string {
  if (compact && amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
  }
  if (compact && amount >= 1000) {
    const k = amount / 1000;
    return `₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRDecimal(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = MONTH_SHORT[d.getMonth()];
  const year = d.getFullYear();
  const now = new Date();

  if (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  ) {
    return 'Today';
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  }

  return `${DAY_SHORT[d.getDay()]}, ${day} ${month}${year !== now.getFullYear() ? ` ${year}` : ''}`;
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}

export function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

// Group transactions by date label
export function groupByDate<T extends { date: string }>(items: T[]): { title: string; data: T[] }[] {
  const groups: Record<string, T[]> = {};
  const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const item of sorted) {
    const label = formatDate(item.date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }

  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}
