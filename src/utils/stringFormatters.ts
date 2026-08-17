/**
 * Centralized User Input Standardization Module for Cargo Tracker.
 * Ensures consistent data formatting before saving to Supabase / Local Storage.
 */

/**
 * Converts text to Turkish Title Case (Her kelimenin ilk harfi büyük, diğerleri küçük).
 * Handles Turkish specific characters ('i' -> 'İ', 'I' -> 'ı').
 * Example: "ömer çanakçı" -> "Ömer Çanakçı", "AHMET YILMAZ" -> "Ahmet Yılmaz"
 */
export function formatTitleCaseTR(text: string): string {
  if (!text) return '';
  const trimmed = text.trim().replace(/\s+/g, ' ');
  return trimmed
    .split(' ')
    .map((word) => {
      if (!word) return '';
      const firstChar = word.charAt(0).toLocaleUpperCase('tr-TR');
      const rest = word.slice(1).toLocaleLowerCase('tr-TR');
      return firstChar + rest;
    })
    .join(' ');
}

/**
 * Standardizes email address to lowercase and trimmed string.
 * Example: "  User.Name@Domain.COM " -> "user.name@domain.com"
 */
export function formatEmail(email: string): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

/**
 * Standardizes phone number to 11-digit Turkish format (05XXXXXXXXX).
 * Example: "555 123 45 67" or "+90 555-123-4567" -> "05551234567"
 */
export function formatPhoneClean(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  let clean = digits;
  if (clean.startsWith('90') && clean.length === 12) {
    clean = clean.slice(2);
  }
  if (!clean.startsWith('0') && clean.length === 10) {
    clean = '0' + clean;
  }
  return clean;
}

/**
 * Standardizes Tracking Numbers to uppercase without any whitespace.
 * Example: " 1z 999 999 999 " -> "1Z999999999"
 */
export function formatTrackingNumber(trackingNo: string): string {
  if (!trackingNo) return '';
  return trackingNo.replace(/\s+/g, '').toUpperCase().trim();
}

/**
 * Standardizes package nickname / address title / city / district.
 * Applies Title Case and trims excessive whitespace.
 */
export function formatGeneralName(name: string): string {
  if (!name) return '';
  return formatTitleCaseTR(name);
}
