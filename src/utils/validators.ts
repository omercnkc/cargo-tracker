/**
 * Centralized Validator Utilities for Cargo Tracker
 * Handles phone and password validation standards.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PasswordCriteria {
  hasMinLength: boolean; // At least 6 characters
  hasLetter: boolean;    // At least 1 letter (a-z, A-Z)
  hasNumber: boolean;    // At least 1 digit (0-9)
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  criteria: PasswordCriteria;
}

export interface PasswordStrengthResult {
  score: number; // 0 to 100
  level: 'weak' | 'medium' | 'strong';
  label: string;
  color: string;
}

/**
 * Validates a Turkish phone number
 * Expected raw or formatted digits: 10 digits starting with 5 (e.g. 5551234567) or 11 digits starting with 05
 */
export function validatePhone(phone: string): PhoneValidationResult {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Telefon numarası girilmesi zorunludur.' };
  }

  const digits = phone.replace(/\D/g, '');

  if (digits.length === 0) {
    return { isValid: false, error: 'Telefon numarası geçersizdir.' };
  }

  // TR mobile numbers: 05XX... (11 digits) or 5XX... (10 digits) or +905XX... (12 digits)
  let cleanDigits = digits;
  if (cleanDigits.startsWith('90') && cleanDigits.length === 12) {
    cleanDigits = cleanDigits.slice(2);
  }
  if (cleanDigits.startsWith('0')) {
    cleanDigits = cleanDigits.slice(1);
  }

  if (cleanDigits.length !== 10) {
    return { isValid: false, error: 'Telefon numarası 10 haneli olmalıdır (05XX...)' };
  }

  if (!cleanDigits.startsWith('5')) {
    return { isValid: false, error: 'Geçerli bir cep telefonu numarası giriniz (05XX...)' };
  }

  return { isValid: true };
}

/**
 * Validates password requirements for registration & change password screens.
 * Enforces min 6 characters, at least 1 letter, and at least 1 digit.
 */
export function validatePassword(password: string): PasswordValidationResult {
  const criteria: PasswordCriteria = {
    hasMinLength: (password || '').length >= 6,
    hasLetter: /[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(password || ''),
    hasNumber: /[0-9]/.test(password || ''),
  };

  const errors: string[] = [];

  if (!criteria.hasMinLength) {
    errors.push('Şifre en az 6 karakter olmalıdır.');
  }
  if (!criteria.hasLetter) {
    errors.push('Şifre en az 1 harf içermelidir.');
  }
  if (!criteria.hasNumber) {
    errors.push('Şifre en az 1 rakam içermelidir.');
  }

  const isValid = criteria.hasMinLength && criteria.hasLetter && criteria.hasNumber;

  return {
    isValid,
    errors,
    criteria,
  };
}

/**
 * Calculates visual password strength score (0-100) and level
 */
export function getPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { score: 0, level: 'weak', label: 'Çok Zayıf', color: '#B00020' };
  }

  let score = 0;
  const len = password.length;

  if (len >= 6) score += 30;
  if (len >= 8) score += 15;
  if (len >= 12) score += 15;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 10;

  if (score < 45) {
    return { score, level: 'weak', label: 'Zayıf', color: '#EF5350' };
  } else if (score < 75) {
    return { score, level: 'medium', label: 'Orta', color: '#FFA726' };
  } else {
    return { score: Math.min(100, score), level: 'strong', label: 'Güçlü', color: '#66BB6A' };
  }
}
