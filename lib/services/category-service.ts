import type { Category } from '@/lib/mock-data';

// Keyword map — merchant name → category detection
const KEYWORD_MAP: Record<Category, string[]> = {
  food: [
    'swiggy', 'zomato', 'dominos', 'domino', 'mcdonalds', 'mcdonald',
    'kfc', 'pizza', 'burger', 'biryani', 'starbucks', 'cafe', 'coffee',
    'restaurant', 'food', 'eat', 'kitchen', 'dabba', 'barbeque', 'bbq',
    'haldiram', 'blinkit', 'zepto', 'dunzo', 'bigbasket', 'grofer',
    'bakery', 'dhaba', 'hotel', 'mess', 'canteen', 'tiffin',
  ],
  transport: [
    'uber', 'ola', 'rapido', 'irctc', 'metro', 'bus', 'indigo', 'airindia',
    'spicejet', 'vistara', 'goair', 'akasaair', 'cab', 'auto', 'taxi',
    'train', 'rail', 'flight', 'airways', 'airlines', 'petrol', 'fuel',
    'fastag', 'toll', 'parking', 'ixigo', 'makemytrip', 'redbus',
  ],
  shopping: [
    'amazon', 'flipkart', 'myntra', 'meesho', 'ajio', 'nykaa', 'snapdeal',
    'shopclues', 'reliance', 'jiomart', 'bigbazaar', 'dmart', 'croma',
    'apple', 'samsung', 'laptop', 'mobile', 'phone', 'electronics',
    'clothes', 'fashion', 'wear', 'retail', 'store', 'shop',
  ],
  utilities: [
    'airtel', 'jio', 'vi', 'vodafone', 'bsnl', 'electricity', 'bses',
    'tata power', 'adani', 'gas', 'indane', 'hp gas', 'bharat gas',
    'water', 'internet', 'broadband', 'recharge', 'prepaid', 'postpaid',
    'insurance', 'lic', 'premium', 'rent', 'maintenance', 'society',
  ],
  entertainment: [
    'netflix', 'prime', 'hotstar', 'disney', 'spotify', 'youtube',
    'bookmyshow', 'pvr', 'inox', 'cinepolis', 'steam', 'playstation',
    'xbox', 'game', 'gaming', 'concert', 'event', 'show', 'ticket',
    'zomato pro', 'swiggy one',
  ],
  health: [
    'pharmeasy', 'netmeds', 'apollo', 'medplus', 'practo', '1mg',
    'pharmacy', 'medicine', 'hospital', 'clinic', 'doctor', 'dental',
    'gym', 'cult fit', 'cultfit', 'yoga', 'fitness', 'healthkart',
    'diagnostic', 'lab', 'thyrocare', 'lal path',
  ],
  salary: [
    'salary', 'stipend', 'payroll', 'income', 'wage', 'bonus',
    'infosys', 'tcs', 'wipro', 'hcl', 'tech mahindra', 'accenture',
    'deloitte', 'pwc', 'ibm', 'google', 'microsoft', 'amazon pay',
    'freelance', 'consulting', 'payment received',
  ],
  other: [],
};

export function detectCategory(merchantName: string): Category {
  const lower = merchantName.toLowerCase().trim();

  for (const [category, keywords] of Object.entries(KEYWORD_MAP) as [Category, string[]][]) {
    if (category === 'other') continue;
    if (keywords.some(kw => lower.includes(kw))) {
      return category;
    }
  }

  return 'other';
}
