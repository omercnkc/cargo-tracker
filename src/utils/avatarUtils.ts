/**
 * İsme veya e-postaya göre kullanıcının baş harf(ler)ini çıkarır.
 * Örn: "Ömer Çanakçı" -> "ÖÇ", "Ahmet" -> "A", "test@domain.com" -> "T"
 */
export const getInitials = (name?: string | null, email?: string | null): string => {
  if (name && typeof name === 'string' && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].charAt(0).toLocaleUpperCase('tr-TR');
    }
    if (parts.length >= 2) {
      const first = parts[0].charAt(0).toLocaleUpperCase('tr-TR');
      const last = parts[parts.length - 1].charAt(0).toLocaleUpperCase('tr-TR');
      return `${first}${last}`;
    }
  }

  if (email && typeof email === 'string' && email.trim().length > 0) {
    return email.trim().charAt(0).toLocaleUpperCase('tr-TR');
  }

  return 'K';
};

/**
 * URL'in gerçek ve geçerli bir profil fotoğrafı olup olmadığını kontrol eder.
 * Mock/placeholder (pravatar.cc vb.) URL'leri eler.
 */
export const isValidAvatarUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;

  // Placeholder / mock resimleri engelle
  if (trimmed.includes('pravatar.cc') || trimmed.includes('placeholder')) {
    return false;
  }

  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('data:')
  );
};
