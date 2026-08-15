# Mimari Detayları

## Katman Akışı

```
Screen (UI)
   ↓
Repository (veri erişim soyutlaması)
   ↓
Service (iş kuralları / Supabase Client)
   ↓
Supabase Client (@supabase/supabase-js)
   ↓
Backend (Supabase BaaS / PostgreSQL)
```

**Yanlış:**
```ts
// screens/Home/HomeScreen.tsx
const { data } = useQuery(['shipments'], () => supabase.from('shipments').select('*'));
```

**Doğru:**
```ts
// features/shipment/repositories/shipment.repository.ts
export const shipmentRepository = {
  getShipments: (userId: string) => shipmentService.getShipments(userId),
};

// features/shipment/services/shipment.service.ts
import { supabase } from '@/services/supabase/supabase';
export const shipmentService = {
  getShipments: (userId: string) => supabase.from('shipments').select('*').eq('user_id', userId),
};

// features/shipment/hooks/useShipments.ts
const { data } = useQuery({
  queryKey: ['tracking', 'shipments', userId],
  queryFn: () => shipmentRepository.getShipments(userId),
});
```

Neden bu ayrım var:
- **Service**: Dış dünyayla (Supabase Client, REST API vb.) konuşan "nasıl" katmanı.
- **Repository**: Ekranın gördüğü arayüz, "ne" katmanı. Ekran servis detaylarını (endpoint, RLS, retry, offline queue) bilmez.

## Provider Zinciri

```
App
 └─ QueryClientProvider        (TanStack Query client)
     └─ PersistQueryClientProvider  (AsyncStorage kalıcı okuma önbelleği)
         └─ ThemeProvider      (light/dark tema context)
             └─ AuthenticationProvider  (Supabase Auth oturum durumu)
                 └─ NavigationContainer (React Navigation)
                     └─ ToastProvider
                         └─ RootNavigator
```

Önemli: **AuthenticationProvider, NavigationContainer'dan önce mount olmalı.**

## Repository Pattern — Kapsam

- Her feature kendi `repositories/` klasörüne sahiptir (`src/features/shipment/repositories/`), global bir repository klasörü değil.
- Repository fonksiyonları her zaman feature'a özel tipleri ve `RepositoryMutationResult` döner.