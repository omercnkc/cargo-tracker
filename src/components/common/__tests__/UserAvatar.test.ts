import { getInitials, isValidAvatarUrl } from '../../../utils/avatarUtils';

describe('UserAvatar Utility Functions', () => {
  describe('getInitials', () => {
    it('returns first and last initials for full names', () => {
      expect(getInitials('Ömer Çanakçı')).toBe('ÖÇ');
      expect(getInitials('Ahmet Mehmet Yılmaz')).toBe('AY');
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('returns first letter for single names', () => {
      expect(getInitials('Ömer')).toBe('Ö');
      expect(getInitials('Ayşe')).toBe('A');
      expect(getInitials('ahmet')).toBe('A');
    });

    it('handles Turkish characters with uppercase correctly', () => {
      expect(getInitials('ömer çanakçı')).toBe('ÖÇ');
      expect(getInitials('şükrü ural')).toBe('ŞU');
      expect(getInitials('ibrahim çelik')).toBe('İÇ');
    });

    it('falls back to email initial if name is missing', () => {
      expect(getInitials('', 'omercnkc123@gmail.com')).toBe('O');
      expect(getInitials(null, 'test@domain.com')).toBe('T');
      expect(getInitials(undefined, 'ömer@domain.com')).toBe('Ö');
    });

    it('falls back to default initial if neither name nor email is provided', () => {
      expect(getInitials('', '')).toBe('K');
      expect(getInitials(null, null)).toBe('K');
      expect(getInitials(undefined, undefined)).toBe('K');
    });
  });

  describe('isValidAvatarUrl', () => {
    it('returns true for valid https URLs', () => {
      expect(isValidAvatarUrl('https://lh3.googleusercontent.com/a/ACg8ocL...')).toBe(true);
      expect(isValidAvatarUrl('https://my-supabase.supabase.co/storage/v1/object/public/avatars/user.jpg')).toBe(true);
    });

    it('rejects mock pravatar and placeholder URLs', () => {
      expect(isValidAvatarUrl('https://i.pravatar.cc/300?img=11')).toBe(false);
      expect(isValidAvatarUrl('https://via.placeholder.com/150')).toBe(false);
    });

    it('returns false for empty or non-string values', () => {
      expect(isValidAvatarUrl('')).toBe(false);
      expect(isValidAvatarUrl('   ')).toBe(false);
      expect(isValidAvatarUrl(null)).toBe(false);
      expect(isValidAvatarUrl(undefined)).toBe(false);
    });
  });
});
