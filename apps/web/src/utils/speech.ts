type SpeechCallback = (transcript: string, isFinal: boolean) => void;

let recognition: any = null;

export function isSpeechSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function startListening(onResult: SpeechCallback, onError?: (error: string) => void): void {
  if (!isSpeechSupported()) {
    onError?.('Speech recognition is not supported in this browser');
    return;
  }

  const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  recognition = new SpeechRecognitionCtor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-IN';

  recognition.onresult = (event: any) => {
    let transcript = '';
    let isFinal = false;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
      if (event.results[i].isFinal) isFinal = true;
    }

    onResult(transcript, isFinal);
  };

  recognition.onerror = (event: any) => {
    onError?.(event.error);
  };

  recognition.start();
}

export function stopListening(): void {
  recognition?.stop();
  recognition = null;
}

/**
 * Parse a spoken transaction description.
 * Examples: "Spent 500 rupees on groceries" -> { amount: 500, description: "groceries" }
 *           "Received 50000 salary" -> { amount: 50000, description: "salary", type: "INCOME" }
 */
export function parseSpokenTransaction(text: string): {
  amount?: number;
  description?: string;
  type?: 'INCOME' | 'EXPENSE';
} {
  const lower = text.toLowerCase();

  // Detect type
  let type: 'INCOME' | 'EXPENSE' | undefined;
  if (/received|earned|got|income|salary|credited/.test(lower)) {
    type = 'INCOME';
  } else if (/spent|paid|bought|expense|debited/.test(lower)) {
    type = 'EXPENSE';
  }

  // Extract amount
  const amountMatch = lower.match(/(\d[\d,]*\.?\d*)\s*(?:rupees?|rs\.?|inr|dollars?|\$|€|£)?/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : undefined;

  // Extract description (everything after amount and filler words)
  let description = text;
  if (amountMatch) {
    description = text.replace(amountMatch[0], '').trim();
  }
  // Remove filler words
  description = description.replace(/\b(spent|paid|received|earned|got|on|for|at|from|rupees?|rs\.?|inr)\b/gi, '').trim();
  description = description.replace(/\s+/g, ' ').trim();

  return { amount, description: description || undefined, type };
}

