/**
 * Phone and Input Formatting Utilities
 * Standardized phone masking and cleaning logic for TR numbers.
 */

/**
 * Formats a raw phone string into standard TR format: 0 (5XX) XXX XX XX
 * Handles incremental typing and strips non-numeric characters.
 */
export function formatPhoneNumber(value: string): string {
  if (!value) return '';

  // Extract digits only
  let digits = value.replace(/\D/g, '');

  // Handle leading 90 (Turkey country code)
  if (digits.startsWith('90') && digits.length > 2) {
    digits = digits.slice(2);
  }

  // Prepend 0 if user starts typing 5 directly
  if (digits.startsWith('5')) {
    digits = '0' + digits;
  }

  // Limit to maximum 11 digits (e.g., 05551234567)
  digits = digits.slice(0, 11);

  if (digits.length === 0) return '';

  // Format: 0 (5XX) XXX XX XX
  let formatted = digits[0]; // '0'

  if (digits.length > 1) {
    formatted += ' (' + digits.slice(1, 4);
  }
  if (digits.length >= 4) {
    formatted += ')';
  }
  if (digits.length > 4) {
    formatted += ' ' + digits.slice(4, 7);
  }
  if (digits.length > 7) {
    formatted += ' ' + digits.slice(7, 9);
  }
  if (digits.length > 9) {
    formatted += ' ' + digits.slice(9, 11);
  }

  return formatted;
}

/**
 * Cleans phone input to produce a standardized format for database/API storage (e.g. "+905551234567" or "05551234567")
 */
export function cleanPhoneNumber(value: string): string {
  if (!value) return '';
  let digits = value.replace(/\D/g, '');

  if (digits.startsWith('90') && digits.length === 12) {
    return '+' + digits;
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return '+90' + digits.slice(1);
  }
  if (digits.startsWith('5') && digits.length === 10) {
    return '+90' + digits;
  }

  return digits;
}
