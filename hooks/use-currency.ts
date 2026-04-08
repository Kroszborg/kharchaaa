import { useUIStore } from '@/store';
import { formatAmount, CURRENCY_META } from '@/lib/format';

/**
 * Returns the active display currency and a format helper.
 * All amounts in the app are stored in INR — call `fmt(inrAmount)` to
 * display them in whatever currency the user has selected.
 */
export function useCurrency() {
  const code = useUIStore(s => s.selectedCurrency);
  const meta = CURRENCY_META[code] ?? CURRENCY_META.INR;

  function fmt(inrAmount: number, compact = false): string {
    return formatAmount(inrAmount, code, compact);
  }

  return {
    code,
    symbol: meta.symbol,
    fmt,
  };
}
