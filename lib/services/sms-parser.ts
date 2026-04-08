/**
 * SMS Parser — Android only
 * Parses bank/UPI SMS notifications into structured transaction data.
 * Raw SMS text is never stored or transmitted — only the parsed result.
 */

export interface ParsedSMS {
  amount: number;
  type: 'debit' | 'credit';
  merchant: string;
  bank: string;
  reference?: string;
  balance?: number;
}

type SMSPattern = {
  bank: string;
  pattern: RegExp;
  extract: (match: RegExpMatchArray) => ParsedSMS | null;
};

function amt(raw: string): number {
  return parseFloat(raw.replace(/,/g, '').replace(/Rs\.?|INR/gi, '').trim());
}

const PATTERNS: SMSPattern[] = [
  // UPI debit: "Rs.1,234.56 debited to VPA merchant@upi Ref:12345"
  {
    bank: 'UPI',
    pattern: /Rs\.?\s*([\d,]+\.?\d*)\s+debited\s+(?:to\s+VPA\s+)?([^\s]+@[^\s]+).*?(?:Ref[:\s]*(\w+))?/i,
    extract: (m) => ({
      amount: amt(m[1]),
      type: 'debit',
      merchant: m[2]?.split('@')[0] ?? 'Unknown',
      bank: 'UPI',
      reference: m[3],
    }),
  },
  // UPI credit: "Rs.1,234.56 credited from VPA sender@upi Ref:12345"
  {
    bank: 'UPI',
    pattern: /Rs\.?\s*([\d,]+\.?\d*)\s+credited\s+(?:from\s+VPA\s+)?([^\s]+@[^\s]+).*?(?:Ref[:\s]*(\w+))?/i,
    extract: (m) => ({
      amount: amt(m[1]),
      type: 'credit',
      merchant: m[2]?.split('@')[0] ?? 'Unknown',
      bank: 'UPI',
      reference: m[3],
    }),
  },
  // HDFC debit: "Rs 1,234.00 debited from A/c XX1234 on 01-04-26. Info: SWIGGY"
  {
    bank: 'HDFC',
    pattern: /Rs\.?\s*([\d,]+\.?\d*)\s+debited from A\/c\s+\S+.*?Info:\s*([^\n.]+)/i,
    extract: (m) => ({
      amount: amt(m[1]),
      type: 'debit',
      merchant: m[2]?.trim() ?? 'HDFC',
      bank: 'HDFC',
    }),
  },
  // HDFC credit: "Rs 1,234.00 credited to A/c XX1234"
  {
    bank: 'HDFC',
    pattern: /Rs\.?\s*([\d,]+\.?\d*)\s+credited to A\/c\s+\S+.*?(?:Info:\s*([^\n.]+))?/i,
    extract: (m) => ({
      amount: amt(m[1]),
      type: 'credit',
      merchant: m[2]?.trim() ?? 'HDFC',
      bank: 'HDFC',
    }),
  },
  // ICICI: "INR 1,234.00 debited from a/c XX1234. MERCHANT via UPI Ref 123456"
  {
    bank: 'ICICI',
    pattern: /INR\s*([\d,]+\.?\d*)\s+(debited|credited).*?(?:\.\s*([A-Z][^.]+?)\s+via)/i,
    extract: (m) => ({
      amount: amt(m[1]),
      type: /debit/i.test(m[2]) ? 'debit' : 'credit',
      merchant: m[3]?.trim() ?? 'ICICI',
      bank: 'ICICI',
    }),
  },
  // SBI: "Your A/c XXXX1234 debited by Rs.1234.00 on 01-04-26. Info: UPI-SWIGGY"
  {
    bank: 'SBI',
    pattern: /A\/c\s+\w+\s+(debited|credited) by Rs\.?\s*([\d,]+\.?\d*).*?Info:\s*([^\n.]+)/i,
    extract: (m) => ({
      amount: amt(m[2]),
      type: /debit/i.test(m[1]) ? 'debit' : 'credit',
      merchant: m[3]?.replace(/^UPI-/, '').trim() ?? 'SBI',
      bank: 'SBI',
    }),
  },
  // Axis: "INR 1,234.00 debited from AXIS Bank A/c XX1234 at SWIGGY on 01-04-2026"
  {
    bank: 'Axis',
    pattern: /INR\s*([\d,]+\.?\d*)\s+(debited|credited).*?at\s+([A-Z][^\d\n]+?)\s+on/i,
    extract: (m) => ({
      amount: amt(m[1]),
      type: /debit/i.test(m[2]) ? 'debit' : 'credit',
      merchant: m[3]?.trim() ?? 'Axis',
      bank: 'Axis',
    }),
  },
  // Kotak: "Rs.1,234.00 debited from Kotak A/c XX1234 at SWIGGY on 01-04-26. Avl Bal: Rs.9,876.00"
  {
    bank: 'Kotak',
    pattern: /Rs\.?\s*([\d,]+\.?\d*)\s+(debited|credited).*?at\s+([A-Z][^\d\n]+?)\s+on.*?Avl Bal:\s*Rs\.?\s*([\d,]+\.?\d*)/i,
    extract: (m) => ({
      amount: amt(m[1]),
      type: /debit/i.test(m[2]) ? 'debit' : 'credit',
      merchant: m[3]?.trim() ?? 'Kotak',
      bank: 'Kotak',
      balance: amt(m[4]),
    }),
  },
  // Generic fallback: "debited Rs 1,234 for MERCHANT"
  {
    bank: 'Unknown',
    pattern: /(debited|credited)\s+Rs\.?\s*([\d,]+\.?\d*)\s+(?:for|to|from)\s+([A-Za-z][^\n.]+)/i,
    extract: (m) => ({
      amount: amt(m[2]),
      type: /debit/i.test(m[1]) ? 'debit' : 'credit',
      merchant: m[3]?.trim() ?? 'Unknown',
      bank: 'Unknown',
    }),
  },
];

export const SMSParser = {
  parse(smsBody: string): ParsedSMS | null {
    const normalised = smsBody.replace(/\s+/g, ' ').trim();
    for (const p of PATTERNS) {
      const match = normalised.match(p.pattern);
      if (match) {
        const result = p.extract(match);
        if (result && result.amount > 0) return result;
      }
    }
    return null;
  },
};
