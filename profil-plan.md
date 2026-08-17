# Profil & Ayarlar Yeniden Yapılandırma Planı (profil-plan.md)

Bu doküman, CargoTracker uygulamasındaki Hamburger Menü (DrawerMenuModal), Ayarlar Sayfası (SettingsScreen), Profil Sayfası (ProfileScreen) ve Profil Güncelleme (AuthStore / UserProfile) alanlarında yapılacak geliştirmeleri detaylandırmaktadır.

---

## 1. Genel Hedefler ve Değişiklik Özeti

1. **Hamburger Menü (DrawerMenuModal):**
   - **Kişisel Bilgiler Alanı:** "Kişisel Bilgiler" butonuna tıklandığında, kullanıcının o anki İsim-Soyisim, E-Posta ve Telefon Numarası bilgilerini içeren detay kartı/açılır alan gösterilecek.
   - **Ayarlar Butonu Ekleme:** Hamburger menüye doğrudan `SettingsScreen` sayfasına yönlendiren "Ayarlar" butonu eklenecek.
   - **Şifre Değiştir Taşıma:** Şifre değiştirme seçeneği hamburger menünün ana listesinden kaldırılarak Ayarlar sayfasının içerisine taşınacak.

2. **Ayarlar Sayfası (SettingsScreen):**
   - Ayarlar sayfasında aşağıdaki modüller derli toplu şekilde yer alacak:
     - 🛡️ **Güvenlik & Biyometrik (Security & Biometrics):** Face ID / Touch ID ile uygulama kilidi.
     - 🔑 **Şifre Değiştir (Change Password):** Şifre değiştirme modalını açan buton/bölüm.
     - 📧 **Otomatik Kargo Taraması (Mail Import):** Trendyol, Hepsiburada, Amazon maillerini tarama e-posta bağlama ekranı.
     - 🔔 **Anlık Bildirimler (Push Notifications):** Kargo güncellemeleri bildirim anahtarı.
     - 🚪 **Hesap & Oturumu Kapat (Account & Sign Out):** Oturum kapatma işlemi.

3. **Profil Sayfası (ProfileScreen):**
   - **UI Korunması:** Profil sayfasının mevcut UI tasarımı (Avatar kartı, Bento istatistik kutuları, Tema/Dil değiştirme kartı) **olduğu gibi aynen korunacak**.
   - **Profili Düzenle Butonu:** "Profili Düzenle" butonuna basıldığında artık Ayarlar'a yönlendirmek yerine; kullanıcının İsim-Soyisim, Telefon Numarası ve Avatar bilgilerini güncelleyebileceği `EditProfileModal` açılacak.

4. **Veri ve Mağaza Mimarısı (AuthStore & AuthRepository):**
   - `users` Supabase tablosundaki ve Zustand `useAuthStore` içerisindeki `profile` verisini güncelleyen `updateProfile` fonksiyonu eklenecek.

---

## 2. Bileşen Bazlı Değişiklik Planı

### A. Auth Deposu ve Servis Katmanı (`src/features/auth/repositories/auth.repository.ts` & `src/store/auth.store.ts`)
- **`authRepository.updateProfile(userId, { full_name, phone, avatar_url })`**: Supabase `users` tablosundaki ilgili kullanıcının satırını günceller.
- **`useAuthStore.updateProfile(data)`**: `authRepository.updateProfile` çağrısını gerçekleştirip store'daki `profile` durumunu anında günceller.

### B. Hamburger Menü (`src/components/common/DrawerMenuModal.tsx`)
- "Kişisel Bilgiler" maddesine basıldığında kullanıcı detaylarını (İsim, E-Posta, Telefon) menü içinde şık bir kart şeklinde açıp kapatan (accordion/toggle) durum eklenecek.
- Hesap bölümüne "Ayarlar" (Settings) ikonu ve navigasyonu eklenecek.
- "Şifre Değiştir" maddesi menü ana listesinden kaldırılarak Ayarlar sayfasına konsolide edilecek.

### C. Ayarlar Sayfası (`src/screens/SettingsScreen.tsx`)
- Güvenlik & Biyometrik, Otomatik Kargo Taraması ve Anlık Bildirimler yanında **Şifre Değiştir (Change Password)** kartı eklenecek.
- "Şifre Değiştir" tıklandığında `useModalStore` üzerinden `openChangePasswordModal()` tetiklenecek.

### D. Profil Düzenleme Modalı (`src/components/profile/EditProfileModal.tsx`) [YENİ BİLEŞEN]
- İsim-Soyisim ve Telefon Numarası girdi alanlarını barındıran modern modal.
- Başarılı kayıtta `useAuthStore.updateProfile` çağırıp onay bildirimi (`ModernFeedbackModal`) gösterecek.

### E. Profil Sayfası (`src/screens/ProfileScreen.tsx`)
- UI tasarımı %100 korunacak.
- "Profili Düzenle" butonuna dokunulduğunda `EditProfileModal` görünür hale getirilecek.

---

## 3. Doğrulama ve Test Adımları

1. **Hamburger Menü:**
   - Menü açılıp "Kişisel Bilgiler" tıklandığında İsim, E-posta ve Telefon numarası görüntüleniyor mu?
   - "Ayarlar" butonuna basıldığında `SettingsScreen` açılıyor mu?
2. **Ayarlar Sayfası:**
   - Şifre Değiştir, Güvenlik Biyometrik, Otomatik Kargo Taraması ve Anlık Bildirimler doğru şekilde listelenip çalışıyor mu?
3. **Profil Sayfası:**
   - UI tasarımı ve Bento istatistiklerinin korunduğu doğrulanacak.
   - "Profili Düzenle" butonuna basıldığında `EditProfileModal` açılıp bilgiler başarıyla güncellenebiliyor mu?

---
*Bu plan [profil-plan.md](file:///c:/Users/omerc/cargo-tracker/profil-plan.md) dosyasında kaydedilmiştir.*
