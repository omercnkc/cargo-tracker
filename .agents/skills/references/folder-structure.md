# Existing Code First

## Temel İlke

Bu projede öncelik her zaman mevcut kod tabanını genişletmektir.

Kod üretmeden önce mevcut proje yapısı incelenmeli, ilgili dosyalar bulunmalı ve mümkün olduğunca mevcut implementasyon geliştirilmelidir.

Yeni dosya oluşturmak son çaredir.

---

## Read Before Write

Her geliştirmeden önce aşağıdaki adımlar uygulanmalıdır.

1. İlgili feature klasörünü bul.
2. İlgili dosyaları oku.
3. Aynı sorumluluğa sahip dosya mevcut mu kontrol et.
4. Dosya mevcutsa onu güncelle.
5. Yeni dosya yalnızca gerçekten gerekiyorsa oluştur.

Hiçbir dosya okunmadan;

- refactor yapılmaz,
- kod değiştirilmez,
- yeni dosya oluşturulmaz.

---

## Search Before Create

Kod üretmeden önce aşağıdaki yapılar mutlaka kontrol edilmelidir.

- Feature
- Screen
- Component
- Repository
- Service
- Hook
- Zustand Store
- TanStack Query Hook
- Navigation
- Theme
- Types
- Constants
- Utils

Bulunan yapı yeniden kullanılır.

---

## Screen Kuralları

Screen mevcutsa aynı ekran yeniden oluşturulmaz.

### Doğru

```
src/features/tracking/screens/TrackingScreen.tsx
```

↓

TrackingScreen içerisine yeni özellik eklenir.

### Yanlış

```
TrackingScreenV2.tsx
TrackingScreenNew.tsx
TrackingScreenCopy.tsx
```

---

## Component Kuralları

Yeni component oluşturmadan önce mevcut componentler kontrol edilir.

Component yeniden kullanılabiliyorsa yeni component oluşturulmaz.

Shared component mevcutsa öncelikle o kullanılır.

---

## Repository Kuralları

Repository mevcutsa aynı dosya genişletilir.

### Doğru

```
ShipmentRepository.ts
```

↓

Yeni metod eklenir.

### Yanlış

```
ShipmentRepositoryNew.ts
ShipmentRepositoryV2.ts
```

---

## Service Kuralları

Service mevcutsa aynı service dosyası geliştirilir.

Yeni endpoint aynı service içerisine eklenir.

---

## Hook Kuralları

Hook mevcutsa genişletilir.

Yeni hook yalnızca farklı bir sorumluluğa sahipse oluşturulur.

---

## Zustand Kuralları

Store mevcutsa aynı store geliştirilir.

Yeni store yalnızca farklı bir domain için oluşturulur.

---

## TanStack Query Kuralları

Mevcut query hookları yeniden kullanılır.

Aynı endpoint için ikinci query hook oluşturulmaz.

Query key tekrar edilmez.

---

## Navigation Kuralları

Mevcut route yeniden kullanılır.

Navigation dosyaları çoğaltılmaz.

---

## Types Kuralları

Var olan interface ve type dosyaları kontrol edilir.

Aynı modeli temsil eden ikinci type oluşturulmaz.

---

## Yeni Dosya Oluşturma

Yeni dosya yalnızca aşağıdaki durumlarda oluşturulabilir.

- İlgili dosya mevcut değilse.
- Yeni sorumluluk gerekiyorsa.
- Mevcut dosya SOLID prensiplerini bozacak kadar büyümüşse.
- Kullanıcı özellikle yeni dosya oluşturulmasını istemişse.

Bunun dışındaki durumlarda mevcut dosyalar güncellenmelidir.

---

## Yasaklar

Aşağıdaki davranışlardan kaçınılmalıdır.

- Aynı işi yapan ikinci Screen oluşturmak
- Aynı işi yapan ikinci Component oluşturmak
- Aynı işi yapan ikinci Repository oluşturmak
- Aynı işi yapan ikinci Service oluşturmak
- Aynı işi yapan ikinci Hook oluşturmak
- Aynı işi yapan ikinci Store oluşturmak
- Aynı işi yapan ikinci Provider oluşturmak
- Aynı işi yapan ikinci Navigation dosyası oluşturmak

---

## Dosya İsimlendirme

Aşağıdaki isimlendirmeler kullanılmamalıdır.

```
LoginScreen2.tsx
LoginScreenNew.tsx
TrackingScreenCopy.tsx

ShipmentRepositoryV2.ts
ShipmentRepositoryNew.ts

TrackingService2.ts

ButtonTemp.tsx
ButtonCopy.tsx
```

Bunun yerine mevcut dosyalar geliştirilmelidir.

---

## Çalışma Akışı

Kod üretirken aşağıdaki sıraya uyulmalıdır.

1. Mevcut klasör yapısını incele.
2. İlgili feature'ı bul.
3. İlgili dosyaları oku.
4. Mevcut implementasyonu anlamaya çalış.
5. Gerekli değişiklikleri mevcut dosyalar üzerinde yap.
6. Yeni dosya oluşturulması gerekiyorsa bunun nedenini doğrula.
7. En son yeni dosya oluştur.

Varsayılan davranış her zaman mevcut kodu geliştirmek olmalıdır.