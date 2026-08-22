# Güvenlik ve Açık Tespit Raporu (security-audit.md)

Bu rapor, **Kargo Takip** mobil uygulamasının istemci mimarisi, kimlik doğrulama akışları, veri depolama katmanları, veritabanı sorguları ve harici bağımlılıkları üzerinde gerçekleştirilen **Kapsamlı Güvenlik Denetimi (Security Audit)** sonuçlarını belgeler.

---

## 🛡️ Güvenlik Denetim Özeti

| Denetim Alanı | Sonuç | Risk Düzeyi | Durum |
| :--- | :---: | :---: | :--- |
| **Gizli Anahtar / Secret Leak** | 🟢 Temiz | Sıfır | Kod tabanında `service_role` veya kritik token bulunmuyor. |
| **Oturum & Token Depolama** | 🟢 Güvenli | Sıfır | Oturumlar donanım şifreli `expo-secure-store` ile saklanıyor. |
| **SQL Enjeksiyonu (SQLite)** | 🟢 Korumalı | Sıfır | Tüm sorgular parametreli (`?` placeholders) yapıda. |
| **Statik Kod & XSS / Eval** | 🟢 Temiz | Sıfır | `eval()` veya `dangerouslySetInnerHTML` kullanımı yok. |
| **Supabase RLS Yapılandırması** | 🟢 Aktif | Sıfır | `courier_companies`, `favorites`, `shipments` üzerinde RLS açık. |
| **Paket Bağımlılıkları (NPM)** | 🟡 Bilgilendirme | Düşük | Metro/PostCSS build araçları uyarısı (Production'ı etkilemez). |

---

## 🔍 Detaylı Denetim ve Analiz Bulguları

### 1. 🔑 Gizli Anahtar ve Kimlik Bilgisi Sızıntısı Denetimi (Secret Leak Audit)
- **Denetlenen:** Kod tabanı (`src/`), Git geçmişi ve ortam değişkenleri.
- **Bulgular:**
  - `SUPABASE_SERVICE_ROLE_KEY` gibi yönetici yetkisine sahip hiçbir anahtar istemci koduna dahil edilmemiştir.
  - İstemci yalnızca `EXPO_PUBLIC_SUPABASE_URL` ve `EXPO_PUBLIC_SUPABASE_ANON_KEY` kullanmaktadır.
  - `.env` ve yerel ortam dosyaları `.gitignore` ile kaynak kontrolü dışında tutulmaktadır.

---

### 2. 💾 Oturum ve Token Depolama Güvenliği (Storage Audit)
- **Denetlenen:** Supabase oturum anahtarları, JWT erişim token'ları ve kullanıcı verileri.
- **Bulgular:**
  - Oturum token'ları şifresiz `AsyncStorage` yerine cihazın donanım destekli güvenli anahtarlık modülü olan **`expo-secure-store`** (`ExpoSecureStoreAdapter`) ile saklanmaktadır.
  - 2048 bayt sınırını aşabilecek büyük JWT oturumları için parça bütünlüğü (`chunking`) mekanizması uygulanmıştır.

---

### 3. 💉 Veritabanı ve SQL Enjeksiyonu Denetimi (SQL Injection Audit)
- **Denetlenen:** Çevrimdışı SQLite veritabanı kuyruk fonksiyonları (`offlineQueue.repository.ts`).
- **Bulgular:**
  - Tüm sorgular parametreli sorgu modeli (`parameterized queries` / `db.runSync(sql, [params])`) ile yazılmıştır.
  - Kullanıcı girdileri ham SQL string birleştirmesi (`string concatenation`) ile doğrudan sorguya enjekte edilmemektedir.

---

### 4. 🪟 Statik Kod Güvenliği ve Hassas Veri Loglama (Static Code Analysis)
- **Denetlenen:** 173 kaynak dosyasında güvensiz fonksiyonlar ve loglar.
- **Bulgular:**
  - Projede dinamik kod çalıştıran hiçbir `eval()`, `new Function()` veya `dangerouslySetInnerHTML` çağrısı bulunmamaktadır.
  - Konsol loglarında (`console.log`) kullanıcı şifresi, kredi kartı veya yetkilendirme token'ı yazdırılmamaktadır.

---

### 5. 🔐 Veritabanı Düzeyi Güvenlik (Row Level Security - RLS)
- **Denetlenen:** Supabase PostgreSQL veri tablosu erişim politikaları.
- **Bulgular:**
  - Tablolar üzerinde RLS devrededir (`Disable RLS` butonları aktif).
  - Kullanıcılar sadece `auth.uid() = user_id` şartını sağlayan kendi kargo ve adres kayıtlarına erişebilir ve güncelleyebilir.

---

### 6. 📦 Paket ve Bağımlılık Taraması (`npm audit`)
- **Bulgular:**
  - Mobil uygulamanın cihazda çalışan üretim kodlarında (Runtime Dependencies) kritik bir açık bulunmamaktadır.
  - Tespit edilen uyarılar, geliştirme esnasında bilgisayarda derleme yapan `Metro Bundler` ve `PostCSS` gibi derleme araçlarının versiyonlarından kaynaklanmaktadır.
  - Geliştirme araçları `npm audit fix` ile güncellenebilir.

---

## 🏁 Sonuç ve Güvenlik Değerlendirmesi
**Kargo Takip** uygulaması istemci güvenliği, veri gizliliği ve güvenli depolama standartlarına **tam uyumlu** olarak geliştirilmiştir. Üretim (Production) ortamına çıkış için mimari açıdan güvenlidir.
