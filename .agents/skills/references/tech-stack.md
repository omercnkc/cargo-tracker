# Teknoloji Kullanım Kuralları

## Frontend Framework & Tooling
- **React Native (v0.81.5)** + **Expo SDK (v54.0.0)**
- TypeScript `strict: true`. `any` yerine `unknown` + type guard veya tam interface.
- Ortak tipler `src/types/` altında, feature'a özel tipler `src/features/<x>/types/` içinde.

## Backend & Database (Supabase BaaS)
- **Supabase JS Client (`@supabase/supabase-js`)**: `src/services/supabase/supabase.ts`.
- **Database**: PostgreSQL (Row Level Security - RLS kuralları ile korunan `shipments`, `courier_companies`, `shipment_events`, `users` tabloları).
- **Authentication**: **Supabase Auth** (`supabase.auth.signInWithPassword`, `signUp`, `signOut`, `getSession`). Oturum token'ları `AsyncStorage` / `SecureStore` üzerinde otomatik yönetilir.
- **Realtime WebSockets**: Supabase Realtime kanalları (`supabase.channel(...)`).
- **Storage**: Supabase Storage buckets (`shipment-pod-images`).

## React Navigation (v7.x)
- Akış: `Splash → Auth → Main Tabs → Detail Pages`.
- Navigation Container `App.tsx` içinde `AuthenticationProvider` altında mount olur.

## TanStack Query (v5.x)
- Query key konvansiyonu: `[featureName, resourceName, ...params, userId]` → örn. `['tracking', 'shipments', userId]`, `['tracking', 'shipment', id, userId]`.
- Mutation'lardan sonra ilgili query `RepositoryMutationResult.synced === true` durumunda invalidate edilir (`queryClient.invalidateQueries`).

## Zustand (v5.x)
- Sadece gerçek "global client state" için kullanılır: tema, dil, offline senkronizasyon durumu (`syncStatus`, `pendingCount`), modal durumları.
- Sunucudan çekilen kargo/kurye verisi Zustand'a konulmaz — TanStack Query'nin işidir.
- Mağazalar `src/store/` veya `src/features/<feature>/store/` altında yer alır.

## React Hook Form
- Login, Register, Şifre Değiştirme, Kargo Ekleme formlarında kullanılır.
- Form submit handler'ları repository'yi çağırır.