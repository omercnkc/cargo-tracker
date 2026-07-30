/**
 * Kargo Etiketi ve Fişi Üzerindeki Takip Numarasını Metin (OCR) İçerisinde Algılama Servisi
 */

export interface OCRResult {
  detectedNumber: string | null;
  confidence: number;
  rawText: string;
}

// Türkiye ve global bilinen kargo takip numarası regex kalıpları
const TRACKING_PATTERNS = [
  /TR-?\d{6,12}/i,          // TR-12345678
  /KP\d{11,13}/i,           // PTT Kargo KP12345678901
  /1Z[A-Z0-9]{16}/i,        // UPS 1Z999...
  /\b\d{10,14}\b/,          // Standart 10-14 haneli kargo numaraları
];

export class OCRService {
  /**
   * Metin içerisindeki kargo takip numarasını tespit eder
   */
  static extractTrackingNumber(scannedText: string): OCRResult {
    if (!scannedText || scannedText.trim().length === 0) {
      return { detectedNumber: null, confidence: 0, rawText: scannedText };
    }

    const cleanText = scannedText.trim();

    for (const pattern of TRACKING_PATTERNS) {
      const match = cleanText.match(pattern);
      if (match) {
        const found = match[0].toUpperCase();
        return {
          detectedNumber: found,
          confidence: 0.95,
          rawText: cleanText,
        };
      }
    }

    // Harf ve rakamlardan oluşan en az 8 haneli kelimeleri tara
    const fallbackMatch = cleanText.match(/[A-Z0-9-]{8,20}/i);
    if (fallbackMatch) {
      return {
        detectedNumber: fallbackMatch[0].toUpperCase(),
        confidence: 0.70,
        rawText: cleanText,
      };
    }

    return { detectedNumber: null, confidence: 0, rawText: cleanText };
  }
}
