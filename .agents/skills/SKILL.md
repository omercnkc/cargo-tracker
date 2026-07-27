---
name: kargo-takip-app
description: React Native + TypeScript ile geliştirilen "Kargo Takip" mobil uygulamasının mimari kuralları, klasör yapısı, teknoloji kullanım standartları ve kod stilini tanımlar. Bu projede (kullanıcının farklı kargo firmalarındaki gönderilerini tek uygulamadan takip ettiği app) HERHANGİ BİR kod yazma, ekran/component oluşturma, repository/service ekleme, state yönetimi (Zustand/TanStack Query), tema (light/dark) düzenleme, navigation kurma, klasör oluşturma veya yeni feature ekleme isteği geldiğinde MUTLAKA bu skill'i kullan — kullanıcı "kargo takip", "shipment", "tracking app" ya da proje adını açıkça anmasa bile, konuşma bu projeyle ilgiliyse tetikle. Ayrıca proje roadmap'i (V0-V7), provider mimarisi veya repository pattern hakkında soru geldiğinde de kullan.
---

# Kargo Takip App — Proje Skill'i

Bu skill, "Kargo Takip" React Native uygulaması için Claude'un tutarlı, projenin baştan belirlenmiş mimarisine uygun kod ve kararlar üretmesini sağlar. Amaç: küçük bir demo app değil, katmanlı mimariye sahip gerçek bir ürün gibi davranmak.

## Projenin özü

Kullanıcı farklı kargo firmalarındaki gönderilerini tek uygulamadan takip eder: hesap oluşturma, kargo numarası ekleme, anlık durum takibi, bildirimler, geçmiş gönderiler, light/dark tema. İleri sürümlerde: barkod okutma, AI destekli analiz, widget, teslimat tahmini, harita takibi.

## Her zaman uygulanacak temel kurallar

1. **Ekranlar asla doğrudan API çağırmaz.** Akış her zaman: `Screen → Repository → Service → Axios Client → Backend`. Bir ekranda `axios.get(...)` veya doğrudan fetch görürsen bunu yanlış kabul et ve repository katmanına taşı. Detay: `references/architecture.md`.
2. **Server state ≠ Client state.** API'den gelen veriler (kargolar, kullanıcı profili vb.) TanStack Query ile; tema/dil/token/bildirim ayarları gibi global-ama-sunucudan-gelmeyen state Zustand ile yönetilir. İkisini birbirinin yerine kullanma.
3. **Feature-based klasörleme.** Yeni bir iş alanı eklerken (`tracking`, `profile`, `settings` gibi) `src/features/<feature>/` altında bağımsız bir modül oluştur — ekranı `src/screens` gibi düz bir yere atma. Detay: `references/folder-structure.md`. Yeni feature iskeleti için `scripts/scaffold_feature.sh` kullanılabilir.
4. **Tamamen TypeScript, strict tip güvenliği.** `any` kullanımından kaçın, ortak tipler `src/types` altında toplanır.
5. **Merkezi tema sistemi.** Renk/spacing/typography değerleri asla component içine hardcode edilmez; `theme/` dosyasından okunur. Detay: `references/theme-system.md`.
6. **Provider sırası.** Doğru sıralama Auth'un Navigation'dan ÖNCE gelmesidir, çünkü hangi stack'in (Auth stack / Main Tabs) gösterileceğine Auth Provider karar verir:
   `App → QueryProvider → ThemeProvider → AuthenticationProvider → NavigationProvider → Application`
   (Not: orijinal proje dokümanında Navigation, Auth'tan önce sıralanmıştı — bu düzeltilmiş sıradır, kod yazarken bunu kullan.)
7. **Kütüphane kullanım kuralları** (Axios, TanStack Query, Zustand, React Hook Form, Firebase, React Navigation) için: `references/tech-stack.md`.
8. **Roadmap'e sadık kal.** Hangi versiyonda (V0-V7) ne yapılacağı bellidir; kullanıcı aksini belirtmedikçe V1 (Auth) bitmeden V3 (Kargo Takibi detay ekranları) gibi ileri işlere atlama. Detay: `references/roadmap.md`.

## Ne zaman hangi referansa bakılır

| İhtiyaç | Dosya |
|---|---|
| Repository/Service/Provider zinciri, katman kuralları | `references/architecture.md` |
| Axios/TanStack Query/Zustand/RHF/Firebase/Navigation kullanım detayları ve örnek kod | `references/tech-stack.md` |
| Renk paleti, light/dark tema, örnek `theme.ts` | `references/theme-system.md` |
| Tam klasör ağacı | `references/folder-structure.md` |
| Yeni feature/version planlaması | `references/roadmap.md` |
| Yeni feature klasörü hızlıca oluşturma | `scripts/scaffold_feature.sh` |

## Kod üretirken kontrol listesi

Yeni kod önerirken/yazarken şunları doğrula:
- [ ] Ekran, repository'yi çağırıyor mu (API'yi değil)?
- [ ] Doğru state yönetim aracı seçildi mi (server → Query, client → Zustand)?
- [ ] Dosya doğru klasörde mi (`features/<isim>/...`)?
- [ ] Renkler/spacing `theme/` üzerinden mi geliyor?
- [ ] Tipler `types/` altında mı tanımlı, `any` var mı?
- [ ] Bu iş roadmap'teki mevcut versiyonla uyumlu mu?

Emin olmadığın bir mimari kararda (örn. veritabanı PostgreSQL mi MongoDB mi, offline stratejisi, refresh token akışı gibi proje dokümanında henüz netleşmemiş noktalar) varsayım yapıp sessizce ilerlemek yerine kısaca kullanıcıya sor veya net bir varsayımla belirterek devam et.


### Existing Code First

Kod üretmeden önce her zaman mevcut proje yapısını incele.

Varsayılan davranış mevcut dosyaları geliştirmektir.

Her geliştirmede aşağıdaki sıra uygulanmalıdır.

1. İlgili feature klasörünü bul.
2. İlgili dosyaları oku.
3. Aynı sorumluluğa sahip Screen, Component, Repository, Service, Hook ve Store mevcut mu kontrol et.
4. Dosya mevcutsa onu güncelle.
5. Yeni dosya yalnızca gerçekten gerekli olduğunda oluştur.

Aynı işi yapan ikinci Screen, Component, Repository, Service, Hook, Store veya Provider oluşturma.

Referans:
`references/folder-structure.md`

### Coding Standards

Kod üretirken `references/coding-standards.md` dosyasındaki kurallar uygulanmalıdır.

Kod yalnızca çalışır durumda olmamalı; proje genelindeki mimari, isimlendirme, TypeScript, performans ve güvenlik standartlarına da uygun olmalıdır.

Her yeni geliştirmede aşağıdaki kontrol listesi uygulanmalıdır:

- Development Principles
- TypeScript Standards
- Naming Convention
- File Organization
- React & React Native Standards
- State Management Standards
- API Standards
- Error Handling
- Performance Standards
- Styling Standards
- Security Standards

Kodun amacı yalnızca özelliği geliştirmek değil, proje genelindeki kalite standardını korumaktır.