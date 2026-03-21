import { categorizeFromText, extractAmountFromText, extractDateFromText, extractMerchantFromText, OcrScanResult } from '@family-budget/shared';
import { env } from '../config/env';
import Tesseract from 'tesseract.js';

export class OcrService {
  /**
   * Process a receipt image and extract transaction data.
   * Uses Google Cloud Vision API if configured, otherwise falls back to Tesseract.js (local OCR).
   */
  static async scanReceipt(imageBuffer: Buffer): Promise<OcrScanResult> {
    let rawText: string;
    let ocrConfidence: number;

    if (env.GOOGLE_CLOUD_VISION_API_KEY) {
      rawText = await OcrService.callGoogleVision(imageBuffer);
      ocrConfidence = rawText ? 0.9 : 0;
    } else {
      const result = await OcrService.callTesseract(imageBuffer);
      rawText = result.text;
      ocrConfidence = result.confidence / 100;
    }

    if (!rawText.trim()) {
      return {
        rawText: '',
        confidence: 0,
        merchantName: undefined,
        totalAmount: undefined,
        date: undefined,
        suggestedCategory: undefined,
        items: [],
      };
    }

    const merchantName = extractMerchantFromText(rawText);
    const totalAmount = extractAmountFromText(rawText);
    const date = extractDateFromText(rawText);
    const suggestedCategory = categorizeFromText(rawText);

    return {
      rawText,
      confidence: totalAmount ? ocrConfidence : ocrConfidence * 0.4,
      merchantName: merchantName ?? undefined,
      totalAmount: totalAmount ?? undefined,
      date: date ?? undefined,
      suggestedCategory: suggestedCategory ?? undefined,
      items: [],
    };
  }

  /**
   * Local OCR using Tesseract.js — free, no API key needed.
   * Works best with clear, well-lit receipt images.
   */
  private static async callTesseract(imageBuffer: Buffer): Promise<{ text: string; confidence: number }> {
    const { data } = await Tesseract.recognize(imageBuffer, 'eng', {
      logger: () => {},
    });
    return { text: data.text, confidence: data.confidence };
  }

  /**
   * Google Cloud Vision API — higher accuracy, requires API key.
   * Set GOOGLE_CLOUD_VISION_API_KEY in .env to enable.
   */
  private static async callGoogleVision(imageBuffer: Buffer): Promise<string> {
    const base64Image = imageBuffer.toString('base64');
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${env.GOOGLE_CLOUD_VISION_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    const annotations = data.responses?.[0]?.textAnnotations;
    return annotations?.[0]?.description ?? '';
  }
}
