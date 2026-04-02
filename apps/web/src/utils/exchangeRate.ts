const CACHE_KEY = 'exchange-rates';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

interface CachedRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

/**
 * Fetches exchange rates from a free API.
 * Uses frankfurter.app — free, no API key needed, reliable.
 * Caches rates in localStorage for 1 hour.
 */
export async function getExchangeRates(baseCurrency: string): Promise<Record<string, number>> {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const data: CachedRates = JSON.parse(cached);
    if (data.base === baseCurrency && Date.now() - data.timestamp < CACHE_DURATION) {
      return data.rates;
    }
  }

  try {
    const response = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}`);
    if (!response.ok) throw new Error('Failed to fetch rates');
    const data = await response.json();

    const rates: Record<string, number> = { [baseCurrency]: 1, ...data.rates };
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      base: baseCurrency,
      rates,
      timestamp: Date.now(),
    }));

    return rates;
  } catch {
    // Fallback: return 1:1 if API fails
    return { [baseCurrency]: 1 };
  }
}

/**
 * Convert an amount from one currency to another.
 * Returns the converted amount and the exchange rate used.
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<{ convertedAmount: number; exchangeRate: number }> {
  if (fromCurrency === toCurrency) {
    return { convertedAmount: amount, exchangeRate: 1 };
  }

  const rates = await getExchangeRates(fromCurrency);
  const rate = rates[toCurrency];

  if (!rate) {
    // If rate not found, try reverse lookup
    const reverseRates = await getExchangeRates(toCurrency);
    const reverseRate = reverseRates[fromCurrency];
    if (reverseRate) {
      const exchangeRate = 1 / reverseRate;
      return { convertedAmount: Math.round(amount * exchangeRate * 100) / 100, exchangeRate };
    }
    return { convertedAmount: amount, exchangeRate: 1 };
  }

  return { convertedAmount: Math.round(amount * rate * 100) / 100, exchangeRate: rate };
}
