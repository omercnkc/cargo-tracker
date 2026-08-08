# Telefon ve Şifre Girişi Standartları Planı (plan.md)

Bu doküman, Cargo Tracker projesinde **Telefon Girişi** ve **Şifre Girişi** süreçlerini belirli standartlara oturtmak için kullanıcı onayları doğrultusunda güncellenmiş mimari planı içermektedir.

---

## 🎯 Onaylanan Kurallar ve Amaçlar

1. **Telefon Girişi Standartları**:
   - Sadece Türkiye numaraları (`+90` / `0 (5XX) XXX XX XX`) desteklenecek.
   - Kullanıcı numarayı yazarken `0 (5XX) XXX XX XX` şeklinde anlık maskelenecek.
   - Veritabanına/API'ye aktarılırken `cleanPhoneNumber` fonksiyonu ile `5XXXXXXXXX` / `+905XXXXXXXXX` temiz formatına çevrilecek.
2. **Şifre Girişi Standartları**:
   - Minimum şifre uzunluğu: **6 karakter**.
   - Şifre kuralları: Min 6 karakter, en az 1 harf, en az 1 rakam.
   - Şifre karmaşıklık kuralları ve Görsel Güç Göstergesi (**PasswordStrengthMeter**) sadece **Kayıt Ol** ve **Şifre Değiştir** ekranlarında aktif olacak.
   - **Giriş Yap (Login)** ekranında mevcut kullanıcıların girişi için sadece boş olmama kontrolü yapılacak.
3. **DRY Prensibi (Tekil Implementasyon)**:
   - Şifre göster/gizle ikonu, telefon maskeleme, doğrulama kuralları gibi tüm ortak mantıklar tek merkezde (`validators.ts`, `formatter.ts`, `PhoneInput.tsx`, `PasswordInput.tsx`) yazılacak ve tüm ekranlarda bu bileşenler çağrılacak.

---

## 🛠️ Modüller ve Dosya Yapısı

- **`src/utils/validators.ts`**: Centralized validation logic (`validatePhone`, `validatePassword`, `getPasswordStrength`).
- **`src/utils/formatter.ts`**: Formatting & masking logic (`formatPhoneNumber`, `cleanPhoneNumber`).
- **`src/components/ui/PhoneInput.tsx`**: Standard phone input with TR prefix & masking.
- **`src/components/ui/PasswordInput.tsx`**: Standard password input with eye toggle & error status.
- **`src/components/ui/PasswordStrengthMeter.tsx`**: Visual password strength bar & rule indicators.
- **`src/i18n/locales/tr.ts` & `en.ts`**: Localized error & status strings.
- **Ekran Entegrasyonları**:
  - `LoginScreen.tsx`
  - `RegisterScreen.tsx`
  - `ChangePasswordModal.tsx`
  - `AddAddressModal.tsx`

---

## 🧪 Test ve Doğrulama
- Birim fonksiyon kontrolleri ve TypeScript derleme kontrolü (`npx tsc --noEmit`).
- Kullanıcı arayüzünde canlı maskeleme ve göz ikonlarının testi.
