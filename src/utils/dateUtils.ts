/**
 * Centralized Date Formatting Utilities for Cargo Tracker.
 * Ensures consistent Day-Month-Year (GG.AA.YYYY) format across the entire application without touching backend data.
 */

/**
 * Formats a date string, timestamp or Date object into standard DD.MM.YYYY (GG.AA.YYYY) format.
 * Example: "2026-08-17T14:30:00Z" -> "17.08.2026"
 */
export function formatDateDDMMYYYY(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '';

  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      // If already in text format (e.g. "2026-08-17"), try to parse manually
      if (typeof dateInput === 'string' && dateInput.includes('-')) {
        const parts = dateInput.split('-');
        if (parts.length === 3) {
          const [year, month, day] = parts;
          return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
        }
      }
      return String(dateInput);
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}.${month}.${year}`;
  } catch {
    return String(dateInput || '');
  }
}

/**
 * Formats a date with full localized month name: "17 Ağustos 2026"
 */
export function formatDateWithMonthName(
  dateInput?: string | number | Date | null,
  locale: string = 'tr-TR'
): string {
  if (!dateInput) return '';

  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return String(dateInput || '');
  }
}

/**
 * Formats date and time: "17.08.2026, 14:30"
 */
export function formatDateTimeDDMMYYYY(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '';

  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year}, ${hours}:${minutes}`;
  } catch {
    return String(dateInput || '');
  }
}
