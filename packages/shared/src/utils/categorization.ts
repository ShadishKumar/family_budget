import { CATEGORY_KEYWORDS } from '../constants/categories';

/**
 * Match OCR text or merchant name to a category using keyword matching.
 * Returns the best matching category name or null.
 */
export function categorizeFromText(text: string): string | null {
  const lowerText = text.toLowerCase();
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        // Longer keyword matches are more specific, so score higher
        const score = keyword.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = category;
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Extract amount from OCR text.
 * Looks for patterns like "Total: 1,234.56", "Grand Total ₹500", "Amount Due: 99.00"
 */
export function extractAmountFromText(text: string): number | null {
  const patterns = [
    /(?:grand\s*total|total\s*(?:amount|due|payable)?|amount\s*(?:due|payable)|net\s*amount|balance\s*due)\s*[:\-]?\s*[₹$€£]?\s*([\d,]+\.?\d*)/i,
    /[₹$€£]\s*([\d,]+\.?\d*)\s*(?:total|due)/i,
    /(?:total|amount)\s*[₹$€£]\s*([\d,]+\.?\d*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }

  return null;
}

/**
 * Extract date from OCR text.
 * Looks for common date formats.
 */
export function extractDateFromText(text: string): string | null {
  const patterns = [
    /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/,  // DD/MM/YYYY or MM/DD/YYYY
    /(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/,  // YYYY/MM/DD
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const dateStr = match[0];
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString().split('T')[0];
        }
      } catch {
        continue;
      }
    }
  }

  return null;
}

/**
 * Extract merchant/store name from OCR text (usually first non-empty line).
 */
export function extractMerchantFromText(text: string): string | null {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return null;

  // First meaningful line is usually the store name
  // Skip lines that are just numbers, dates, or very short
  for (const line of lines.slice(0, 3)) {
    if (line.length > 2 && !/^\d+[\/\-.]/.test(line) && !/^[\d\s.,]+$/.test(line)) {
      return line.substring(0, 100);
    }
  }

  return lines[0].substring(0, 100);
}
