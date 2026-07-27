# Teknoloji Kullanım Kuralları

## React Native (Native CLI, Expo değil)
- Native modül eklemek gerekirse doğrudan `ios/`/`android/` klasörlerine dokunulabilir; Expo managed workflow varsayılmaz, Expo-only paketler (örn. `expo-*` bazı modüller) önerilmez.

## TypeScript
- `strict: true` varsayılır. `any` yerine `unknown` + type guard, ya da doğru interface.
- Ortak tipler `src/types/` altında, feature'a özel tipler `features/<x>/types.ts` içinde.

## React Navigation
- Akış: `Splash → Auth → Main Tabs → Detail Pages`.
- Stack/Tab tanımları `navigation/` altında, ekran importları feature klasöründen yapılır (`import { HomeScreen } from '@/features/tracking'`).
- Deep linking (push notification'dan kargo detayına gitme gibi) `navigation/linking.ts` içinde tanımlanmalı — bu proje dokümanında henüz planlanmamıştı, eklenirken kullanıcıya hatırlat.

## Axios
- Tek bir merkezi client: `services/apiClient.ts`.
- Interceptor'lar burada tanımlanır: auth token ekleme, 401'de refresh token akışı, hata normalize etme.
```ts
// services/apiClient.ts
export const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```
- Feature service'leri `apiClient`'ı import eder, kendi axios instance'ı oluşturmaz.

## TanStack Query
- Query key konvansiyonu: `[featureName, resourceName, ...params]` → örn. `['tracking', 'shipments']`, `['tracking', 'shipment', id]`.
- `staleTime`/`cacheTime` feature bazında `features/<x>/queryConfig.ts` içinde merkezi tutulabilir.
- Mutation'lardan sonra ilgili query invalidate edilir (`queryClient.invalidateQueries`), manuel state güncellemesi tercih edilmez.

## Zustand
- Sadece gerçek "global client state" için kullanılır: tema, kullanıcı oturumu (token/profil özeti), dil, bildirim ayarları.
- Sunucudan çekilen liste/detay verisi (kargolar, kullanıcı geçmişi) Zustand'a KOYULMAZ — bu TanStack Query'nin işi.
- Her store kendi dosyasında: `store/authStore.ts`, `store/themeStore.ts` gibi (proje kökünde `store/` veya ilgiliyse feature içinde).

## React Hook Form
- Login, Register, Şifre değiştirme, Profil formlarında kullanılır.
- Validation şeması ayrı tutulur (zod veya yup önerilir, proje dokümanında netleşmemiş — kullanıcıya sorulabilir).
- Form submit handler'ları repository'yi çağırır, doğrudan servis/axios değil.

## Firebase
- **Authentication**: kullanıcı girişi, `AuthenticationProvider` içinde token/oturum durumu buradan beslenir.
- **Cloud Messaging**: push notification (örn. "Kargonuz dağıtıma çıktı"), gelen bildirim tracking feature'ındaki ilgili kargoya deep-link ile yönlendirilmeli.
- **Analytics**: kullanıcı davranış event'leri, event isimlendirmesi `snake_case` ve merkezi bir `analytics.ts` sarmalayıcı üzerinden gönderilir (doğrudan `analytics().logEvent(...)` her yerde çağrılmaz).
- **Crashlytics**: hata kayıtları; global bir Error Boundary ile entegre edilmeli (proje dokümanında bu henüz planlanmamıştı, eklenirken hatırlat).

## Backend (Node.js + Express)
- Modüller: Authentication, User API, Shipment API, Notification API, Admin API — her biri kendi route/controller/service katmanına sahip olmalı (frontend'deki repository pattern'in backend karşılığı gibi düşünülebilir).
- Veritabanı henüz netleşmemiş (PostgreSQL veya MongoDB); repository yapısı sayesinde bu karar servis katmanını etkilemez. Kod önerirken hangi DB'nin seçildiğini varsaymadan önce kullanıcıya sor.