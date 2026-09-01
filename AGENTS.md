---
name: kargo-takip-app
description: React Native + Expo + Supabase ile geliştirilen "Kargo Takip" mobil uygulamasının mimari kuralları, klasör yapısı, teknoloji kullanım standartları ve kod stilini tanımlar. Bu projede (kullanıcının farklı kargo firmalarındaki gönderilerini tek uygulamadan takip ettiği app) HERHANGİ BİR kod yazma, ekran/component oluşturma, repository/service ekleme, state yönetimi (Zustand/TanStack Query), tema (light/dark) düzenleme, navigation kurma, klasör oluşturma veya yeni feature ekleme isteği geldiğinde MUTLAKA bu skill'i kullan — kullanıcı "kargo takip", "shipment", "tracking app" ya da proje adını açıkça anmasa bile, konuşma bu projeyle ilgiliyse tetikle. Ayrıca proje roadmap'i (V0-V7), provider mimarisi veya repository pattern hakkında soru geldiğinde de kullan.
---

# Kargo Takip App — Proje Skill'i

Bu skill, "Kargo Takip" React Native (Expo + Supabase BaaS) uygulaması için tutarlı, projenin baştan belirlenmiş mimarisine uygun kod ve kararlar üretilmesini sağlar. Amaç: katmanlı mimariye sahip gerçek bir ürün sunmaktır.

## Projenin Özü

Kullanıcı farklı kargo firmalarındaki gönderilerini tek uygulamadan takip eder: hesap oluşturma, kargo numarası ekleme, anlık durum takibi, bildirimler, geçmiş gönderiler, light/dark tema. Özellikler: Supabase Auth, Supabase PostgreSQL, Supabase Realtime WebSocket canlı takip, Supabase Storage (teslimat kanıtı POD), harita canlı rota takibi (`OpenStreetMap Leaflet`), OCR kargo etiketi tarama.

## Her Zaman Uygulanacak Temel Kurallar

1. **Ekranlar asla doğrudan Supabase API çağırmaz.** Akış her zaman: `Screen → Repository → Service / Supabase Client → Supabase Backend`. Bir ekranda doğrudan `supabase.from(...)` veya fetch görürsen bunu yanlış kabul et ve repository katmanına taşı. Detay: `references/architecture.md`.
2. **Server state ≠ Client state.** API/Supabase'den gelen veriler (kargolar, kuryeler, kullanıcı profili vb.) TanStack Query ile; tema/dil/offline senkronizasyon durumu (`syncStatus`, `pendingCount`) gibi global-ama-sunucudan-gelmeyen state Zustand ile yönetilir. İkisini birbirinin yerine kullanma.
3. **Feature-based klasörleme.** Yeni bir iş alanı eklerken (`tracking`, `shipment`, `profile`, `settings`, `offline` gibi) `src/features/<feature>/` altında bağımsız bir modül oluştur — ekranı `src/screens` gibi düz bir yere atma. Detay: `references/folder-structure.md`.
4. **Tamamen TypeScript, strict tip güvenliği.** `any` kullanımından kaçın, ortak tipler `src/types` altında toplanır.
5. **Merkezi tema sistemi.** Renk/spacing/typography değerleri asla component içine hardcode edilmez; `theme/` dosyasından okunur. Detay: `references/theme-system.md`.
6. **Provider sırası.** Doğru sıralama Auth'un Navigation'dan ÖNCE gelmesidir, çünkü hangi stack'in (Auth stack / Main Tabs) gösterileceğine Auth Provider karar verir:
   `App → QueryClientProvider → PersistQueryClientProvider → ThemeProvider → AuthenticationProvider → NavigationContainer → ToastProvider`
7. **Kütüphane kullanım kuralları** (Supabase SDK, TanStack Query, Zustand, React Hook Form, React Navigation) için: `references/tech-stack.md`.
8. **Roadmap'e sadık kal.** Hangi versiyonda (V0-V7) ne yapılacağı bellidir. Detay: `references/roadmap.md`.

## Ne Zaman Hangi Referansa Bakılır

| İhtiyaç | Dosya |
|---|---|
| Repository/Service/Provider zinciri, katman kuralları | `references/architecture.md` |
| Supabase/TanStack Query/Zustand/RHF/Navigation detayları ve örnek kod | `references/tech-stack.md` |
| Renk paleti, light/dark tema, örnek `theme.ts` | `references/theme-system.md` |
| Tam klasör ağacı | `references/folder-structure.md` |
| Yeni feature/version planlaması | `references/roadmap.md` |

## Kod Üretirken Kontrol Listesi

Yeni kod önerirken/yazarken şunları doğrula:
- [ ] Ekran, repository'yi çağırıyor mu (doğrudan Supabase'i değil)?
- [ ] Doğru state yönetim aracı seçildi mi (server → Query, client → Zustand)?
- [ ] Dosya doğru klasörde mi (`features/<isim>/...`)?
- [ ] Renkler/spacing `theme/` üzerinden mi geliyor?
- [ ] Tipler `types/` altında mı tanımlı, `any` var mı?
- [ ] Bu iş roadmap'teki mevcut versiyonla uyumlu mu?

### Existing Code First

Kod üretmeden önce her zaman mevcut proje yapısını incele. Varsayılan davranış mevcut dosyaları geliştirmektir.