# Sürüm Planı (V0–V7)

| Versiyon | Kapsam |
|---|---|
| V0 | Altyapı: Navigation, Axios, Firebase, Query, Zustand, Theme, Folder Structure |
| V1 | Authentication: Login, Register, Forgot Password |
| V2 | Ana Sayfa: Dashboard, Son Kargolar |
| V3 | Kargo Takibi: Liste, Detay, Durum geçmişi |
| V4 | Profil: Profil, Ayarlar, Tema, Dil |
| V5 | Bildirimler: Firebase Push |
| V6 | Performans: Lazy Loading, Optimization, Cache |
| V7 | Release: Test, Store hazırlığı, Yayınlama |

## Kullanım notu
Kod/özellik önerirken kullanıcının hangi versiyonda olduğunu göz önünde bulundur. Kullanıcı açıkça "V3'e geç" ya da "sırayı önemsemiyorum" demedikçe, örneğin V1 (Auth) tamamlanmadan V4 (Profil ayarları) gibi ileri bir işe başlanması önerilmez — ama kullanıcı bunu isterse elbette yardımcı ol, sadece hatırlat.

## Planda henüz yer almayan ama düşünülmesi gereken konular
Bunlar proje dokümanında netleşmemiş; ilgili işe girişilirken kullanıcıya sorulmalı veya makul bir varsayımla belirtilerek ilerlenmeli:
- Veritabanı seçimi: PostgreSQL vs MongoDB
- Offline-first strateji (TanStack Query persist, AsyncStorage cache)
- Global Error Boundary / kullanıcıya gösterilecek hata UI'ı
- Refresh token akışı (401 sonrası otomatik yenileme)
- Test stratejisi (yalnızca V7'de değil, repository/service katmanları için erken testler)
- CI/CD pipeline
- Push notification → deep link entegrasyonu (bildirime tıklayınca ilgili kargo detayına gitme)