# Coding Standards

## Purpose

Bu doküman, projede üretilecek tüm kodların aynı kalite, mimari ve okunabilirlik standartlarında olmasını sağlar.

Kod yalnızca çalışır durumda olmamalı; proje genelindeki mimariye, isimlendirme kurallarına ve geliştirme standartlarına da uygun olmalıdır.

Bu dokümandaki kurallar, yeni dosya oluştururken ve mevcut dosyaları güncellerken uygulanmalıdır.

---

# 1. Development Principles

Kod yazarken aşağıdaki prensipler uygulanmalıdır.

## Clean Code

- Kod okunabilir olmalıdır.
- Gereksiz karmaşıklıktan kaçınılmalıdır.
- Anlaşılır isimler kullanılmalıdır.
- Gereksiz yorum satırları eklenmemelidir.

---

## SOLID

Her sınıf, hook, repository ve service mümkün olduğunca SOLID prensiplerine uygun olmalıdır.

Özellikle:

- Single Responsibility Principle
- Dependency Inversion Principle

ihlal edilmemelidir.

---

## DRY

Aynı kod birden fazla yerde yazılmamalıdır.

Tekrarlayan kodlar;

- helper
- custom hook
- reusable component

haline getirilmelidir.

---

## KISS

Basit çözüm yeterliyse karmaşık çözüm üretilmemelidir.

---

## Readability First

Kod okunabilirliği önceliklidir.

Karmaşık optimizasyonlar yalnızca gerçekten gerekli olduğunda yapılmalıdır.

---

# 2. TypeScript Standards

## Genel Kurallar

- strict uyumlu kod yaz.
- any kullanma.
- unknown tercih et.
- Gereksiz type assertion kullanma.

---

## Interface

API modellerinde interface kullanılmalıdır.

Örnek

```ts
export interface Shipment {
  id: string;
  trackingNumber: string;
}
```

---

## Type

Utility type'larda type kullanılabilir.

Örnek

```ts
type ThemeMode = "light" | "dark";
```

---

## Nullable

Nullable alanlar açıkça belirtilmelidir.

```ts
image: string | null;
```

---

# 3. File Organization

Dosya sıralaması aşağıdaki gibi olmalıdır.

1. Imports
2. Types / Interfaces
3. Constants
4. Hooks
5. Component
6. Helper Functions
7. Styles
8. Export

---

# 4. Import Order

Importlar aşağıdaki sırayla yazılmalıdır.

1. React
2. React Native
3. Third Party Packages
4. Navigation
5. Services
6. Repositories
7. Hooks
8. Components
9. Types
10. Utils
11. Theme / Styles

---

# 5. Naming Convention

## Component

PascalCase

```
ShipmentCard
```

---

## Screen

PascalCase

```
TrackingScreen
```

---

## Hook

camelCase

```
useTracking
```

---

## Repository

PascalCase

```
ShipmentRepository
```

---

## Service

PascalCase

```
ShipmentService
```

---

## Store

camelCase

```
useAuthStore
```

---

## Types

PascalCase

```
ShipmentResponse
ShipmentStatus
```

---

## Constants

UPPER_SNAKE_CASE

```
DEFAULT_PAGE_SIZE
```

---

## Functions

camelCase

```
getShipmentById()
```

---

# 6. React Component Standards

- Functional Component kullanılmalıdır.
- Arrow Function kullanılmalıdır.
- Named Export tercih edilmelidir.
- Component tek sorumluluk taşımalıdır.
- Büyük componentler küçük componentlere ayrılmalıdır.
- Props interface ile tanımlanmalıdır.

---

# 7. React Native Standards

- Inline style kullanılmamalıdır.
- StyleSheet kullanılmalıdır.
- SafeAreaView tercih edilmelidir.
- FlatList mümkün olduğunca ScrollView yerine kullanılmalıdır.
- Responsive yapı korunmalıdır.
- Sabit width ve height değerlerinden kaçınılmalıdır.

---

# 8. State Management Standards

## TanStack Query

Sunucu verileri yalnızca TanStack Query ile yönetilir.

Örnekler

- Kargo Listesi
- Kargo Detayı
- Kullanıcı Bilgileri

---

## Zustand

Lokal durumlar Zustand ile yönetilir.

Örnekler

- Tema
- Dil
- Authentication
- Ayarlar

Sunucu verisi Zustand içerisinde tutulmamalıdır.

---

# 9. API Standards

API çağrıları aşağıdaki katmanlardan geçmelidir.

Screen

↓

Repository

↓

Service

↓

Axios

↓

Backend

Kurallar

- Screen axios kullanmaz.
- Hook axios kullanmaz.
- Repository business logic içerir.
- Service yalnızca API iletişimini sağlar.

---

# 10. Error Handling

- try/catch kullanılmalıdır.
- Ham hata kullanıcıya gösterilmemelidir.
- Hatalar anlamlı mesajlara dönüştürülmelidir.
- Sessizce hata yutulmamalıdır.

---

# 11. Performance Standards

Optimizasyon yalnızca gerekli olduğunda uygulanmalıdır.

Kullanılabilecek araçlar

- React.memo
- useMemo
- useCallback
- FlatList Optimization
- Lazy Loading

Gereksiz memoization yapılmamalıdır.

---

# 12. Styling Standards

- Hardcoded renk kullanılmamalıdır.
- Theme token kullanılmalıdır.
- spacing token kullanılmalıdır.
- typography token kullanılmalıdır.
- borderRadius token kullanılmalıdır.
- Inline style kullanılmamalıdır.

---

# 13. Security Standards

- Secret bilgiler kod içerisine yazılmamalıdır.
- Environment değişkenleri kullanılmalıdır.
- Hassas bilgiler loglanmamalıdır.
- Token güvenli şekilde saklanmalıdır.

---

# 14. Supabase Standards

Supabase yalnızca Service katmanında kullanılmalıdır.

Repository doğrudan Supabase SDK kullanmamalıdır.

Screen Supabase kullanmamalıdır.

---

# 15. Logging

Production kodunda console.log kullanılmamalıdır.

Hata logları merkezi bir logger üzerinden yönetilmelidir.

---

# 16. Git Convention

Commit mesajları Conventional Commits standardına uygun olmalıdır.

Örnekler

- feat:
- fix:
- refactor:
- docs:
- chore:
- test:

---

# 17. Code Review Checklist

Kod tamamlanmadan önce aşağıdaki maddeler kontrol edilmelidir.

- Mimariye uygun mu?
- Mevcut kod tekrar kullanılabiliyor mu?
- TypeScript kurallarına uygun mu?
- Theme token kullanılmış mı?
- Error handling eklenmiş mi?
- Performans açısından gereksiz render oluşturuyor mu?
- Naming convention doğru mu?
- Hardcoded değer bulunuyor mu?
- Dosya organizasyonu standartlara uygun mu?
- Kod okunabilir mi?