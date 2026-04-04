/**
 * Bank Statement CSV Parser (Indian Bank Formats)
 * ------------------------------------------------
 * Parses CSV bank statements with support for:
 *  - UPI (UPVDR/UPVCR/UPVCN) transactions
 *  - NEFT/RTGS/IMPS transfers
 *  - Standard CSV formats from SBI, HDFC, ICICI, Axis, etc.
 *  - Auto-categorization of expenses using keyword matching
 */

// ─────────────────────────────────────────────
// Category Classification Keywords
// ─────────────────────────────────────────────

const CATEGORY_KEYWORDS = {
  'Food & Grocery': [
    'swiggy', 'zomato', 'uber eats', 'dominos', 'pizza', 'mcdonald',
    'starbucks', 'dunkin', 'grocery', 'restaurant', 'cafe', 'diner',
    'bakery', 'food', 'eat', 'kitchen', 'burger', 'taco', 'sushi',
    'chipotle', 'wendys', 'subway', 'kfc', 'popeyes', 'panera',
    'big bazaar', 'dmart', 'reliance fresh', 'grofers', 'bigbasket',
    'blinkit', 'zepto', 'instamart', 'jiomart', 'spencers',
    'more supermarket', 'nature basket', 'eatfit', 'faasos', 'box8',
    'behrouz', 'biryani', 'chai', 'coffee', 'ice cream', 'sweet',
    'meat', 'fish', 'chicken', 'milk', 'dairy', 'bread', 'fruit',
    'vegetable', 'kirana', 'tea',
  ],
  'Transportation': [
    'uber', 'lyft', 'ola', 'rapido', 'metro', 'transit', 'bus', 'train',
    'railway', 'irctc', 'gas station', 'shell', 'bp ', 'chevron', 'exxon',
    'parking', 'toll', 'fuel', 'petrol', 'diesel', 'ev charging',
    'fastag', 'nhai', 'auto', 'cab', 'taxi', 'rickshaw', 'yulu',
    'bounce', 'vogo', 'blusmart', 'meru', 'indian oil', 'hp petrol',
    'bharat petroleum', 'iocl', 'bpcl', 'hpcl',
  ],
  'Entertainment': [
    'netflix', 'spotify', 'disney', 'hotstar', 'prime video', 'apple tv',
    'youtube', 'twitch', 'cinema', 'movie', 'theater', 'amc', 'pvr', 'inox',
    'gaming', 'steam', 'playstation', 'xbox', 'nintendo', 'concert', 'ticket',
    'bookmyshow', 'event', 'park', 'jio cinema', 'zee5', 'sonyliv',
    'voot', 'alt balaji',
  ],
  'Shopping': [
    'amazon', 'flipkart', 'myntra', 'ebay', 'etsy', 'target', 'walmart',
    'best buy', 'apple store', 'nike', 'adidas', 'zara', 'h&m', 'ikea',
    'home depot', 'lowes', 'nordstrom', 'macys', 'mall', 'shop', 'store',
    'market', 'purchase', 'retail', 'meesho', 'ajio', 'tatacliq',
    'nykaa', 'purplle', 'lenskart', 'croma', 'vijay sales',
    'reliance digital', 'puma', 'decathlon', 'lifestyle', 'shoppers stop',
    'pantaloons', 'westside', 'max fashion',
  ],
  'Bills & Utilities': [
    'electric', 'water', 'gas bill', 'internet', 'wifi', 'broadband',
    'phone bill', 'mobile recharge', 'airtel', 'jio', 'vodafone', 'vi ',
    'bsnl', 'at&t', 'verizon', 't-mobile', 'comcast', 'spectrum',
    'insurance', 'utility', 'sewage', 'trash', 'waste', 'tata sky',
    'dish tv', 'd2h', 'bescom', 'msedcl', 'tata power',
    'adani electricity', 'torrent power', 'lic', 'prepaid', 'postpaid',
    'dth',
  ],
  'Healthcare': [
    'pharmacy', 'hospital', 'clinic', 'doctor', 'dental', 'medical',
    'health', 'drug', 'prescription', 'cvs', 'walgreens', 'medplus',
    'apollo', 'practo', 'lab', 'diagnostic', 'optician', 'eye',
    '1mg', 'pharmeasy', 'netmeds', 'medlife', 'max hospital',
    'fortis', 'manipal', 'narayana',
  ],
  'Subscriptions': [
    'subscription', 'membership', 'patreon', 'substack', 'notion',
    'slack', 'zoom', 'dropbox', 'icloud', 'google one', 'microsoft 365',
    'adobe', 'canva', 'figma', 'github', 'chatgpt', 'openai',
    'linkedin premium', 'medium',
  ],
  'Education': [
    'udemy', 'coursera', 'skillshare', 'school', 'college', 'university',
    'tuition', 'books', 'library', 'education', 'learning', 'course',
    'byjus', 'unacademy', 'vedantu', 'upgrad', 'simplilearn',
    'great learning',
  ],
  'Travel': [
    'airline', 'flight', 'hotel', 'airbnb', 'booking.com', 'expedia',
    'makemytrip', 'goibibo', 'cleartrip', 'trivago', 'resort', 'travel',
    'vacation', 'luggage', 'hostel', 'oyo', 'treebo', 'yatra',
    'easemytrip', 'ixigo',
  ],
  'Investment': [
    'invest', 'mutual fund', 'sip', 'stock', 'share', 'zerodha', 'groww',
    'upstox', 'etrade', 'robinhood', 'fidelity', 'vanguard', 'schwab',
    'crypto', 'bitcoin', 'demat', 'trading', 'angel', '5paisa',
    'paytm money', 'kuvera', 'nps', 'ppf', 'gold', 'sovereign',
  ],
};

// ─────────────────────────────────────────────
// UPI / NEFT Payee Name Extraction
// ─────────────────────────────────────────────

const SKIP_PREFIXES = [
  'UPI', 'WDLTFR', 'DEPTFR', 'SOUTFR', 'SAMTRF', 'CR', 'DR',
  'AT', 'S2', 'S3', 'S4', 'UPVDR', 'UPVCR', 'UPVCN', 'NEFT',
  'IMPS', 'RTGS', 'BY TRANSFER', 'TOWER', 'CSN', 'RAMDAS',
  'SBIN', 'HDFC', 'ICIC', 'UTIB', 'KKBK', 'BARB', 'PUNB',
  'CNRB', 'IDIB', 'YESB', 'ATESB', 'VERCE', 'FED', 'SM',
  '83', 'PAYM', 'VOL',
];

/**
 * Extract a human-readable payee name from a UPI/bank description.
 */
function extractPayeeName(description) {
  const parts = description.split(/[\/,]/).map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    // Skip numeric-only parts
    if (/^[\d.\-\s]+$/.test(part)) continue;
    // Skip parts that start with known bank/system prefixes
    const upper = part.toUpperCase();
    if (SKIP_PREFIXES.some((prefix) => upper.startsWith(prefix))) continue;
    // Skip parts that contain @  (UPI IDs)
    if (part.includes('@')) continue;
    // Skip date patterns
    if (/^\d{2}[/\-]\d{2}[/\-]\d{2,4}/.test(part)) continue;
    // Skip very short parts
    if (part.length < 3) continue;
    // Skip parts that are mostly digits
    if (part.replace(/\d/g, '').length < 2) continue;

    // Clean the name
    let name = part.replace(/\d+/g, '').trim();
    if (name.length >= 2) {
      // Capitalize first letter of each word
      return name
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
  }

  // Fallback: return a cleaned-up version of the description
  return description.replace(/[\d\/,]+/g, ' ').trim().slice(0, 30) || 'Unknown';
}

/**
 * Categorize a transaction description by keyword matching.
 */
function categorize(description) {
  const lower = description.toLowerCase();

  // First check keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }

  // Pattern-based classification for Indian bank descriptions
  if (/upvdr|upvcr|upvcn|upi/i.test(description)) {
    return 'UPI Transfer';
  }
  if (/neft|rtgs/i.test(description)) {
    return 'Bank Transfer';
  }
  if (/imps/i.test(description)) {
    return 'Bank Transfer';
  }
  if (/atm|cwdr|cash withdrawal/i.test(description)) {
    return 'Cash Withdrawal';
  }
  if (/emi|loan/i.test(description)) {
    return 'Loan/EMI';
  }

  return 'Other';
}

// ─────────────────────────────────────────────
// CSV Parsing Utilities
// ─────────────────────────────────────────────

/**
 * Split a CSV line respecting quoted fields.
 */
function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/**
 * Parse a CSV string into rows of objects.
 */
function parseCSVRows(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) throw new Error('File has no data rows.');

  // Find header row (skip any metadata rows at the top)
  let headerIdx = 0;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const lower = lines[i].toLowerCase();
    if (
      lower.includes('date') &&
      (lower.includes('debit') || lower.includes('credit') ||
       lower.includes('amount') || lower.includes('description') ||
       lower.includes('details') || lower.includes('narration'))
    ) {
      headerIdx = i;
      break;
    }
  }

  // Parse header
  const headers = splitCSVLine(lines[headerIdx]).map((h) => h.trim().toLowerCase());

  const rows = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    if (values.length === 0) continue;

    // Skip summary/total rows
    const joined = values.join(' ').toLowerCase();
    if (
      joined.includes('statement summary') ||
      joined.includes('total debits') ||
      joined.includes('total credits') ||
      joined.includes('opening balance') ||
      joined.includes('closing balance') ||
      joined.includes('brought forward') ||
      joined.includes('dr count')
    ) {
      continue;
    }

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || '').trim();
    });
    rows.push(row);
  }
  return { headers, rows };
}

/**
 * Detect column mappings from headers.
 */
function detectColumns(headers) {
  const find = (patterns) =>
    headers.find((h) => patterns.some((p) => h.includes(p))) || null;

  return {
    date: find(['date', 'txn date', 'transaction date', 'posting date', 'value date']),
    description: find(['description', 'narration', 'details', 'particulars', 'memo', 'merchant', 'payee', 'name']),
    debit: find(['debit', 'withdrawal', 'dr', 'amount debited']),
    credit: find(['credit', 'deposit', 'cr', 'amount credited']),
    amount: find(['amount', 'transaction amount', 'txn amount']),
    balance: find(['balance', 'closing balance', 'running balance']),
  };
}

/**
 * Parse a monetary value string to a number (handles Indian format: 1,23,456.78).
 */
function parseMoney(val) {
  if (!val) return 0;
  const cleaned = val.replace(/[^0-9.\-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Parse a date string into a Date object (Indian formats supported).
 */
function parseDate(val) {
  if (!val) return new Date();

  // Try ISO format first
  const d = new Date(val);
  if (!isNaN(d.getTime()) && val.includes('-') && val.length >= 10) return d;

  // Try DD/MM/YYYY or DD-MM-YYYY
  const parts = val.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    if (c > 100) return new Date(c, b - 1, a); // DD/MM/YYYY
    if (a > 100) return new Date(a, b - 1, c); // YYYY/MM/DD
    // DD/MM/YY
    if (c < 100 && a <= 31 && b <= 12) {
      const year = c < 50 ? 2000 + c : 1900 + c;
      return new Date(year, b - 1, a);
    }
  }
  return new Date();
}

// ─────────────────────────────────────────────
// Main Parser
// ─────────────────────────────────────────────

/**
 * Main parser: takes a CSV file string, returns structured data.
 */
export function parseStatement(csvText) {
  const { headers, rows } = parseCSVRows(csvText);
  const cols = detectColumns(headers);

  if (!cols.description) {
    throw new Error('Could not find a description/narration column. Please check your CSV format.');
  }
  if (!cols.date) {
    throw new Error('Could not find a date column. Please check your CSV format.');
  }

  const transactions = [];
  let idCounter = 1;

  for (const row of rows) {
    const rawDescription = row[cols.description] || 'Unknown';
    const date = parseDate(row[cols.date]);

    let amount = 0;
    let type = 'expense';

    if (cols.debit && cols.credit) {
      const debit = parseMoney(row[cols.debit]);
      const credit = parseMoney(row[cols.credit]);
      if (credit > 0) {
        amount = credit;
        type = 'income';
      } else if (debit > 0) {
        amount = debit;
        type = 'expense';
      }
    } else if (cols.amount) {
      amount = parseMoney(row[cols.amount]);
      if (amount < 0) {
        amount = Math.abs(amount);
        type = 'expense';
      } else {
        type = 'income';
      }
    }

    if (amount === 0) continue; // skip zero-amount rows

    // Extract payee and categorize
    const payeeName = extractPayeeName(rawDescription);
    const category = type === 'income' ? 'Income' : categorize(rawDescription);

    transactions.push({
      id: `stmt-${String(idCounter++).padStart(4, '0')}`,
      type,
      amount,
      category,
      recipientName: payeeName,
      rawDescription: rawDescription.slice(0, 100),
      status: 'completed',
      date: date.toISOString(),
      notes: null,
      createdAt: new Date().toISOString(),
    });
  }

  if (transactions.length === 0) {
    throw new Error('No valid transactions found in the file.');
  }

  // Sort by date
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  return buildAnalytics(transactions);
}

// ─────────────────────────────────────────────
// Analytics Builder
// ─────────────────────────────────────────────

/**
 * Build analytics from parsed transactions.
 */
function buildAnalytics(transactions) {
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Category breakdown (expenses only)
  const categoryMap = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = { total: 0, count: 0, transactions: [] };
      }
      categoryMap[t.category].total += t.amount;
      categoryMap[t.category].count += 1;
      categoryMap[t.category].transactions.push(t);
    });

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([name, data]) => ({
      name,
      total: Math.round(data.total * 100) / 100,
      count: data.count,
      percentage: totalExpense > 0 ? Math.round((data.total / totalExpense) * 100) : 0,
      transactions: data.transactions,
    }))
    .sort((a, b) => b.total - a.total);

  // Top merchants / payees (expenses only)
  const merchantMap = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const name = t.recipientName;
      if (!merchantMap[name]) {
        merchantMap[name] = { total: 0, count: 0 };
      }
      merchantMap[name].total += t.amount;
      merchantMap[name].count += 1;
    });

  const topMerchants = Object.entries(merchantMap)
    .map(([name, data]) => ({
      name,
      total: Math.round(data.total * 100) / 100,
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Daily spending (expenses only)
  const dailyMap = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const day = new Date(t.date).toISOString().split('T')[0];
      dailyMap[day] = (dailyMap[day] || 0) + t.amount;
    });

  const dailySpending = Object.entries(dailyMap)
    .map(([date, total]) => ({
      date,
      total: Math.round(total * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Income sources
  const incomeMap = {};
  transactions
    .filter((t) => t.type === 'income')
    .forEach((t) => {
      const name = t.recipientName;
      if (!incomeMap[name]) {
        incomeMap[name] = { total: 0, count: 0 };
      }
      incomeMap[name].total += t.amount;
      incomeMap[name].count += 1;
    });

  const incomeSources = Object.entries(incomeMap)
    .map(([name, data]) => ({
      name,
      total: Math.round(data.total * 100) / 100,
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    transactions,
    summary: {
      totalExpense: Math.round(totalExpense * 100) / 100,
      totalIncome: Math.round(totalIncome * 100) / 100,
      netFlow: Math.round((totalIncome - totalExpense) * 100) / 100,
      transactionCount: transactions.length,
      dateRange: {
        from: transactions[0]?.date,
        to: transactions[transactions.length - 1]?.date,
      },
    },
    categoryBreakdown,
    topMerchants,
    dailySpending,
    incomeSources,
  };
}
