# Mimari Detayları

## Katman akışı

```
Screen (UI)
   ↓
Repository (veri erişim soyutlaması)
   ↓
Service (iş kuralları / dış servis çağrısı)
   ↓
Axios Client (HTTP)
   ↓
Backend (Node.js / Express)
```

**Yanlış:**
```ts
// screens/Home/HomeScreen.tsx
const { data } = useQuery(['shipments'], () => axios.get('/api/shipments'));
```

**Doğru:**
```ts
// features/tracking/repositories/shipmentRepository.ts
export const shipmentRepository = {
  getAll: () => shipmentService.getShipments(),
  getById: (id: string) => shipmentService.getShipmentById(id),
};

// features/tracking/services/shipmentService.ts
import { apiClient } from '@/services/apiClient';
export const shipmentService = {
  getShipments: () => apiClient.get<Shipment[]>('/api/shipments'),
  getShipmentById: (id: string) => apiClient.get<Shipment>(`/api/shipments/${id}`),
};

// features/tracking/screens/HomeScreen.tsx
const { data } = useQuery({
  queryKey: ['shipments'],
  queryFn: shipmentRepository.getAll,
});
```

Neden bu ayrım var:
- **Service**: dış dünyayla (HTTP, Firebase, vb.) konuşan, "nasıl" katmanı.
- **Repository**: ekranın gördüğü arayüz, "ne" katmanı. Ekran servis detaylarını (endpoint, header, retry mantığı) bilmez.
- Backend değişse (REST → GraphQL, PostgreSQL → MongoDB) sadece service/repository güncellenir, ekran kodu dokunulmaz.

## Provider zinciri

```
App
 └─ QueryProvider          (TanStack Query client)
     └─ ThemeProvider       (light/dark, tema context)
         └─ AuthenticationProvider   (kullanıcı/token durumu)
             └─ NavigationProvider   (auth durumuna göre stack seçer)
                 └─ Application
```

Önemli: **AuthenticationProvider, NavigationProvider'dan önce mount olmalı.** Aksi halde navigation, henüz kullanıcının login olup olmadığını bilmeden hangi stack'i (Auth stack vs Main Tabs) göstereceğine karar veremez ve splash/flicker sorunları ortaya çıkar.

```tsx
// app/App.tsx
export default function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthenticationProvider>
          <NavigationProvider>
            <RootNavigator />
          </NavigationProvider>
        </AuthenticationProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
```

## Repository Pattern — kapsam

- Her feature kendi `repositories/` klasörüne sahiptir (`features/tracking/repositories/`), global bir repository klasörü değil.
- Repository fonksiyonları her zaman feature'a özel tipleri döner (`Shipment`, `ShipmentStatus`), ham API response'u değil.
- Repository içinde hata yönetimi/normalize etme yapılabilir (örn. backend'den gelen `snake_case` alanları `camelCase`'e çevirmek) — ekran katmanı asla ham backend formatıyla uğraşmaz.

## Testability

Repository pattern sayesinde ekran testlerinde gerçek Axios/Firebase çağrısı yapılmaz; repository mock'lanır. Test yazarken:
```ts
jest.mock('@/features/tracking/repositories/shipmentRepository');
```