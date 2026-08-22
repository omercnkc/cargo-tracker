/**
 * Phone and Input Formatting Utilities
 * Standardized phone masking and cleaning logic for TR numbers.
 */

/**
 * Formats a raw phone string into standard TR national format: (5XX) XXX XX XX
 * Handles incremental typing, strips leading 0/+90 since +90 badge is used.
 */
export function formatPhoneNumber(value: string): string {
  if (!value) return '';

  // Extract digits only
  let digits = value.replace(/\D/g, '');

  // Handle leading 90 (Turkey country code)
  if (digits.startsWith('90') && digits.length > 2) {
    digits = digits.slice(2);
  }

  // Strip leading 0 since country code +90 is prefixed in UI
  while (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Limit to maximum 10 digits (e.g., 5551234567)
  digits = digits.slice(0, 10);

  if (digits.length === 0) return '';

  // Format: (5XX) XXX XX XX
  let formatted = '(' + digits.slice(0, Math.min(3, digits.length));
  if (digits.length >= 3) {
    formatted += ')';
  }
  if (digits.length > 3) {
    formatted += ' ' + digits.slice(3, Math.min(6, digits.length));
  }
  if (digits.length > 6) {
    formatted += ' ' + digits.slice(6, Math.min(8, digits.length));
  }
  if (digits.length > 8) {
    formatted += ' ' + digits.slice(8, Math.min(10, digits.length));
  }

  return formatted;
}

/**
 * Checks if raw user input starts with leading 0 or +900
 */
export function startsWithLeadingZero(value: string): boolean {
  if (!value) return false;
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('900')) return true;
  return value.trim().startsWith('0');
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
