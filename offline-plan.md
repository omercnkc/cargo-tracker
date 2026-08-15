# Cargo Tracker - Offline-First (Çevrimdışı Çalışma) Mimari Plânı

Bu doküman, **Cargo Tracker** mobil uygulamasının tamamen çevrimdışı (offline-first) ortamda sorunsuz çalışması, internet bağlantısı olmadığında veri kaybı yaşamadan işlem yapabilmesi ve bağlantı kurulduğunda verilerin **Supabase BaaS (Database, Auth & Storage)** altyapısı ile otomatik senkronize edilmesi için hazırlanmış teknik mimari ve uygulama planıdır.

---

## 🔴 1. Gerçek Mimari ve Altyapı Varsayımları (Supabase BaaS)

- **Backend & Veritabanı**: **Supabase PostgreSQL** (Tüm veritabanı sorguları `@supabase/supabase-js` istemcisi üzerinden Row Level Security (RLS) kuralları ile gerçekleşir).
- **Kimlik Doğrulama (Auth)**: **Supabase Auth** (E-posta/parola ve Google OAuth sosyal girişleri Supabase Auth SDK, `AuthenticationProvider` ve `expo-secure-store` / `AsyncStorage` oturum kalıcılığı ile yönetilir).
- **Katmanlı Mimari (Layer Architecture)**:
  `Screen / Hook` ➔ `Repository` ➔ `SQLite Storage / Supabase Client` ➔ `Supabase PostgreSQL`
  *(Ekranlar ve Hook'lar asla doğrudan Supabase servisi ile konuşmaz, her şey Repository katmanından geçer).*
- **Çift Katmanlı Depolama Mimarisi (Dual Storage)**:
  1. **Çevrimdışı Okuma Önbelleği (Read Access Cache)**: Uygulama çevrimdışıyken açıldığında son çekilen kargo verilerinin anında görünmesi için **`PersistQueryClientProvider`** katmanı.
  2. **Çevrimdışı Yazma ve Senkronizasyon (Write & Mutation Queue)**: Eşzamanlı yazma ve mutasyon güvenliği için Native CLI C++ JSI tabanlı **`op-sqlite`** veritabanı motoru.
- **Tek Doğruluk Kaynağı (Single Source of Truth - SSOT)**: **SQLite `shipments` tablosu kalıcı verinin TEK DOĞRU KAYNAĞIDIR.** TanStack Query'nin hafıza içi ve AsyncStorage kalıcı cache'i yalnızca geçici UI okuma (Read-layer) katmanıdır. Hem offline hem de online kanaldan gelen çakışmalar (`status: 'conflict'`) istisnasız SQLite `mutations` tablosundaki `server_data` sütununa kalıcı olarak yazılır.
- **Client Persistent Primary Key (UUID)**: İstemcide üretilen `clientShipmentId` doğrudan PostgreSQL veritabanında birincil anahtar (Primary Key `id`) olarak yazılır. Karmaşık geçici-ID ➔ gerçek-ID dönüşümlerine gerek yoktur.
- **Single Source of Truth (`RepositoryMutationResult`)**: `onSettled` yarış durumunu önlemek için repository fiilen ne yaptığını (`synced: true`, `queued: true`, `conflict: true`) kendisi bildirir.
- **Modüler Klasör Yapısı**: Tüm offline altyapısı `src/features/offline/` altında toplanacak ve dış dünyaya `index.ts` üzerinden açılacaktır.
- **Single-Flight Sync Lock (Single Mutex)**: Eşzamanlı tetiklemelerin aynı kuyruğu çift işlemesini önleyen kilit mekanizması bulunur.
- **User-Scoped Queue & İzolasyon**: Yerel kuyruktaki her işlem Supabase `user_id` ile etiketlenir; çıkışta (logout) AsyncStorage persisted cache `removeClient()` ile temizlenir.
- **Client State Yönetimi**: İstemci durumları **Zustand** (`offlineSync.store.ts`) ile yönetilecektir.

---

## 🏗️ 2. Katmanlı Mimari Akışı ve Entegrasyon

```
+-----------------------------------------------------------------------------------+
|                                  EKRAN KATMANI                                    |
|   (ShipmentHomeScreen, PackageDetailScreen, ScannerScreen, etc.)                   |
+-----------------------------------------+-----------------------------------------+
                                          | (Yalnızca Repository Metotlarını Çağırır)
                                          v
+-----------------------------------------------------------------------------------+
|                                REPOSITORY KATMANI                                 |
|   (ShipmentRepository, OfflineQueueRepository, PodStorageRepository)              |
|                                                                                   |
|  IF (isOnline) ➔ Send to Supabase Client ➔ Return { synced: true, data }          |
|  ELSE ➔ Write to SQLite & Enqueue ➔ Return { synced: false, queued: true }        |
+--------------------+------------------------------------+-------------------------+
                     |                                    |
                     v                                    v
+--------------------+------------------+  +--------------+-------------------------+
|     SERVICE KATMANI / SUPABASE SDK    |  |           ZUSTAND STORE                |
|  - supabase.ts (Client)               |  |   (src/features/offline/store/        |
|  - Supabase Auth Session              |  |    offlineSync.store.ts)              |
|  - Supabase PostgreSQL & RLS          |  |  - isOnline, pendingCount, syncStatus   |
+--------------------+------------------+  +----------------------------------------+
                     |
                     v
+--------------------+--------------------------------------------------------------+
|               SENKRONİZASYON MOTORU (SYNC ENGINE) & SINGLE-FLIGHT LOCK            |
|   - Single-Flight Mutex (`isSyncing`) ile eşzamanlı çift işlemeyi engeller         |
|   - SELECT ... WHERE status = 'pending' ile Çakışan Kayıtları Dışlama              |
|   - Re-basing (serverVersion güncellemesi) ile Çakışma Çözüm Protokolü            |
|   - SQLite server_data Sütunu & Constraint-Safe Conflict Persistence Protokolü    |
|   - Storage Deterministik Path & Pre-Flight Check ile POD Bant Genişliği Tasarrufu|
|   - parentMutationId ile Cascading Failure Önleme & Kurtarma (Recovery)           |
|   - Dinamik Zamanaşımı Crash Recovery (JSON: 60s, Medya: 180s)                    |
|   - Supabase Native Idempotency (onConflict: idempotency_key) ile Güvenli İletim  |
+-----------------------------------------------------------------------------------+
```

---

## 📁 3. Modüler Klasör Yapısı (`src/features/offline/`)

```
src/features/offline/
├── index.ts                            # Feature dış kapısı (Public API Exports)
├── components/
│   ├── OfflineStatusBar.tsx            # Çevrimdışı şeridi ve senkronize durum göstergesi
│   ├── SyncBadge.tsx                   # Kargolarda pending/conflict/dead/blocked durum rozetleri
│   └── ConflictResolutionModal.tsx     # Çakışma ve DLQ hatalarını çözme modali
├── hooks/
│   ├── useNetworkStatus.ts             # NetInfo bağlantı durumu ve Zustand senkronizasyonu
│   └── useOfflineSync.ts               # Senkronizasyonu manuel/otomatik tetikleyen hook
├── database/
│   ├── db.ts                           # op-sqlite veritabanı bağlantı ve JSI motoru
│   ├── schema.ts                       # SQL Tablo tanımları (server_data, ON DELETE SET NULL)
│   └── migrations.ts                   # PRAGMA user_version versiyonlu SQL migration yönetimi
├── repositories/
│   ├── offlineQueue.repository.ts      # SQLite tabanlı mutasyon saklama/okuma repository'si
│   └── podStorage.repository.ts        # react-native-fs ile yerel POD medya yönetimi
├── services/
│   ├── syncEngine.service.ts           # Single-flight lock & Supabase senkronizasyon motoru
│   └── podUpload.service.ts            # Fotoğrafları Supabase Storage bucket'ına yükleme
├── store/
│   └── offlineSync.store.ts            # Zustand client state (pendingCount, syncStatus)
└── types/
    └── offline.types.ts                # Strictly-typed discriminated union ve interface'ler
```

---

## 🛡️ 4. Strict Type Tanımları & Repositories Sözleşmesi (`offline.types.ts`)

```typescript
export type RepositoryMutationResult<T> =
  | { synced: true; data: T }
  | { synced: false; queued: true; mutationId: string }
  | { synced: false; conflict: true; mutationId: string; serverData: T; serverVersion?: number };

export type MutationType =
  | 'ADD_SHIPMENT'
  | 'UPDATE_SHIPMENT_STATUS'
  | 'UPDATE_SHIPMENT_DETAILS'
  | 'ARCHIVE_SHIPMENT'
  | 'UPLOAD_POD_IMAGE';

export interface AddShipmentPayload {
  clientShipmentId: string;
  trackingNumber: string;
  carrierId: string;
  title: string;
  senderAddress?: string;
  receiverAddress?: string;
  createdAt: string;
}

export interface UpdateShipmentStatusPayload {
  shipmentId: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed';
  location?: string;
  note?: string;
  updatedAt: string;
  baseVersion: number; // ZORUNLU
}

export interface UpdateShipmentDetailsPayload {
  shipmentId: string;
  title?: string;
  notes?: string;
  updatedAt: string;
  baseVersion: number; // ZORUNLU
}

export interface ArchiveShipmentPayload {
  shipmentId: string;
  isArchived: boolean;
  updatedAt: string;
  baseVersion: number; // ZORUNLU
}

export interface UploadPodImagePayload {
  shipmentId: string;
  localFileUri: string;
  mimeType: string;
  capturedAt: string;
}

export type MutationPayload =
  | { type: 'ADD_SHIPMENT'; payload: AddShipmentPayload }
  | { type: 'UPDATE_SHIPMENT_STATUS'; payload: UpdateShipmentStatusPayload }
  | { type: 'UPDATE_SHIPMENT_DETAILS'; payload: UpdateShipmentDetailsPayload }
  | { type: 'ARCHIVE_SHIPMENT'; payload: ArchiveShipmentPayload }
  | { type: 'UPLOAD_POD_IMAGE'; payload: UploadPodImagePayload };

export type MutationStatus = 'pending' | 'processing' | 'failed' | 'dead' | 'conflict' | 'blocked';

export interface PendingMutation {
  id: string; // Mutation transaction UUID
  userId: string; // Supabase user.id
  idempotencyKey: string; // Sabit idempotency anahtarı (retry'lar boyunca değişmez)
  parentMutationId?: string | null; // Cascading bağımlılık ağacı için ebeveyn mutasyon ID'si
  mutation: MutationPayload;
  createdAt: string;
  processingStartedAt?: string | null;
  retryCount: number;
  maxRetries: number;
  status: MutationStatus;
  lastError?: string;
  serverData?: string | null; // Nullable JSON string (Çakışan sunucu verisini saklar)
}

export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'conflict' | 'error' | 'success';

export interface ShipmentCacheItem {
  id: string;
  tracking_number: string;
  status: string;
  base_version: number; // ZORUNLU
  is_pending_sync?: boolean;
  is_tombstone?: boolean;
  tombstoned_at?: string;
  [key: string]: unknown;
}
```

---

## ✨ 5. İyimser UI Güncellemeleri & Çift Kanallı Çakışma Yönetimi

### 5.1 Ekleme İşlemleri (`useAddShipment`)

```typescript
export const useAddShipment = () => {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore.getState().user?.id;

  return useMutation({
    mutationFn: (newShipment: AddShipmentPayload) => shipmentRepository.createShipment(newShipment),
    onMutate: async (newShipment) => {
      await queryClient.cancelQueries({ queryKey: ['tracking', 'shipments', currentUserId] });
      const previousShipments = queryClient.getQueryData<ShipmentCacheItem[]>(['tracking', 'shipments', currentUserId]);

      const optimisticShipment: ShipmentCacheItem = {
        id: newShipment.clientShipmentId,
        tracking_number: newShipment.trackingNumber,
        status: 'pending',
        base_version: 1,
        is_pending_sync: true,
        is_tombstone: false,
        created_at: newShipment.createdAt,
        ...newShipment,
      };

      queryClient.setQueryData<ShipmentCacheItem[]>(['tracking', 'shipments', currentUserId], (old = []) => [
        optimisticShipment,
        ...old,
      ]);

      return { previousShipments };
    },
    onError: (_err, _newShipment, context) => {
      if (context?.previousShipments) {
        queryClient.setQueryData(['tracking', 'shipments', currentUserId], context.previousShipments);
      }
    },
    onSettled: (result) => {
      if (result && 'synced' in result && result.synced) {
        queryClient.invalidateQueries({ queryKey: ['tracking', 'shipments', currentUserId] });
      }
    },
  });
};
```

### 5.2 Constraint-Safe Online Çakışma Kalıcılık Protokolü (`useUpdateShipmentStatus`)

```typescript
export const useUpdateShipmentStatus = () => {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore.getState().user?.id;

  return useMutation({
    mutationFn: (payload: UpdateShipmentStatusPayload) => shipmentRepository.updateShipmentStatus(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['tracking', 'shipments', currentUserId] });
      const previousShipments = queryClient.getQueryData<ShipmentCacheItem[]>(['tracking', 'shipments', currentUserId]);

      queryClient.setQueryData<ShipmentCacheItem[]>(['tracking', 'shipments', currentUserId], (old = []) =>
        old.map((item) =>
          item.id === payload.shipmentId
            ? { ...item, status: payload.status, is_pending_sync: true }
            : item
        )
      );

      return { previousShipments };
    },
    onError: (_err, _payload, context) => {
      if (context?.previousShipments) {
        queryClient.setQueryData(['tracking', 'shipments', currentUserId], context.previousShipments);
      }
    },
    onSettled: async (result, payload, context) => {
      if (result && 'synced' in result && result.synced) {
        queryClient.invalidateQueries({ queryKey: ['tracking', 'shipments', currentUserId] });
      } else if (result && 'conflict' in result && result.conflict) {
        // Online Anlık Çakışma Protokolü:
        // 1. İyimser Güncellemeyi Geri Al (Rollback)
        if (context?.previousShipments) {
          queryClient.setQueryData(['tracking', 'shipments', currentUserId], context.previousShipments);
        }

        // 2. Constraint-Safe SQLite Yazımı: Orijinal Idempotency Key Saklanır
        await OfflineQueueRepository.saveConflictMutation({
          id: result.mutationId,
          userId: currentUserId!,
          idempotencyKey: `idemp_orig_${result.mutationId}`,
          parentMutationId: null,
          mutation: { type: 'UPDATE_SHIPMENT_STATUS', payload },
          createdAt: new Date().toISOString(),
          retryCount: 0,
          maxRetries: 5,
          status: 'conflict',
          serverData: JSON.stringify(result.serverData),
        });

        // 3. Zustand Store ve UI Modali Tetikle
        useOfflineSyncStore.getState().setConflictState(result.mutationId, result.serverData);
      }
    },
  });
};
```

---

## 🎨 6. SyncBadge Görsel Durum Bileşeni

`SyncBadge` bileşeni mutasyonun durumlarını görsel olarak birbirinden net şekilde ayırır:

| Mutasyon Statüsü (`MutationStatus`) | Rozet Rengi | İkon / Metin | Tanım |
| :--- | :--- | :--- | :--- |
| **`pending`** | **Sarı** (`#EAB308`) | ⏳ Senkronize Bekliyor | Cihazda kuyrukta bekleyen çevrimdışı işlem. |
| **`conflict`** | **Turuncu** (`#F97316`) | ⚠️ Çakışma - Çözüm Var | Sunucu ile versiyon çakışması yaşandı, kullanıcı çözümü bekleniyor. |
| **`dead`** | **Kırmızı** (`#EF4444`) | 🚫 Hata - Başarısız | 4xx/RLS hatası alan ve DLQ'ya çekilmiş kalıcı hata. |
| **`blocked`** | **Gri** (`#6B7280`) | ⛔ Engellendi | Ebeveyn mutasyon düştüğü için bekletilen alt mutasyon. |

---

## ⚡ 8. Sync Engine: Re-basing Çakışma Çözüm Protokolü & Single-Flight Lock

### 8.1 Single-Flight Sync Lock & SQL Sorgu Filtresi (`status = 'pending'`)
`SyncEngine` kuyruğu işlerken **yalnızca `'pending'`** statüsündeki kayıtları sorgular (`WHERE status = 'pending'`).

### 8.2 ConflictResolutionModal & Re-basing Çözüm Protokolü

> [!IMPORTANT]
> **Re-basing & Taze Idempotency Key Protokolü**: Kullanıcı `ConflictResolutionModal` üzerinden **"Benim Değişikliğimi Uygula (Overwrite)"** kararı verdiğinde:
> 1. Mutasyondaki `payload.baseVersion` değeri sunucudaki güncel `serverVersion` (veya `serverData.base_version`) değerine yükseltilir (Re-basing).
> 2. Kullanıcının manuel kararından türeyen taze bir Idempotency Key (`idemp_resolve_${mutationId}_${Date.now()}`) atanır.
> 3. SQLite statüsü `'pending'` yapılarak `SyncEngine` tetiklenir. Güncelleme Supabase'e yeni versiyon temeliyle atıldığı için 0 satır dönme hatası yaşanmadan ilk denemede başarıyla tamamlanır!

```typescript
// ConflictResolutionModal: Kullanıcı "Benim Değişikliğimi Uygula (Overwrite)" Seçtiğinde
export const handleResolveConflictUserChoice = async (
  conflictMutation: PendingMutation,
  serverVersion: number
) => {
  // 1. Re-basing: Mutasyon payload'ındaki baseVersion güncel serverVersion değerine yükseltilir
  const updatedPayload = {
    ...conflictMutation.mutation,
    payload: {
      ...(conflictMutation.mutation.payload as UpdateShipmentStatusPayload),
      baseVersion: serverVersion,
    },
  };

  // 2. Kullanıcının manuel çözüm kararından doğan yepyeni bir Idempotency Key üretilir
  const newResolutionIdempotencyKey = `idemp_resolve_${conflictMutation.id}_${Date.now()}`;

  // 3. Mutasyon SQLite'ta güncellenerek statüsü 'pending' konumuna getirilir
  await OfflineQueueRepository.updateConflictResolution({
    mutationId: conflictMutation.id,
    updatedMutation: updatedPayload,
    newIdempotencyKey: newResolutionIdempotencyKey,
    status: 'pending',
  });

  // 4. SyncEngine tetiklenir ve güncellemeyi Supabase'e sorunsuz aktarır
  SyncEngineService.triggerSync();
};
```

---

## 🏛️ 11. V6.0 Storage Foundation & PostgreSQL / SQLite Şemaları

### 11.1 PostgreSQL Sunucu Şeması (Supabase)
```sql
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT UNIQUE NOT NULL,
  last_idempotency_key TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tracking_number TEXT NOT NULL,
  carrier_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  base_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 11.2 Local SQLite Veritabanı Şeması (`op-sqlite`)
```sql
CREATE TABLE IF NOT EXISTS mutations (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  parent_mutation_id TEXT,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'failed', 'dead', 'conflict', 'blocked')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 5,
  processing_started_at TEXT,
  last_error TEXT,
  server_data TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (parent_mutation_id) REFERENCES mutations(id) ON DELETE SET NULL
);
```

---

## 🧪 12. Test ve Doğrulama Stratejisi (Unit + E2E)

### 12.1 Unit & Integration Testleri (Jest)
- `storageEngine.test.ts`: SQLite CRUD, Migration ve Bozulma/Kurtarma Spike testleri.
- `supabaseConflict.test.ts`: 3-way union `conflict: true` dönüşü ve Re-basing çözüm protokolünün testi.
- `onlineConflictPersistence.test.ts`: Online anlık çakışmanın `server_data` ile SQLite `mutations` tablosuna kalıcı kaydedildiğinin testi.

---

## ⚠️ 13. Riskler ve Çözüm Önerileri

| Risk | Tanım | Çözüm |
| :--- | :--- | :--- |
| **Eski baseVersion Çözüm Çökmesi** | Çakışma çözülürken eski baseVersion kullanılırsa tekrar 0 satır döner. | `handleResolveConflictUserChoice` ile Re-basing yapılıp `serverVersion` yazılır. |
| **SQLite Constraint İhlali** | Eksiksiz objeyle `saveConflictMutation` çağrılırsa SQLite hatası alınır. | Tüm NOT NULL alanlar ve `server_data` sütununu içeren tam nesne yazılır. |

---

## 🚚 14. Detaylı Mevcut Kod Taşıma Plânı (Migration Strategy)

1. **Aşama 1 - Şema ve Tablo Hazırlığı**: `src/features/offline/database/schema.ts` altında `op-sqlite` veritabanı DDL komutları çalıştırılır.
2. **Aşama 2 - Veri Aktarımı & Dönüştürme**: `src/services/offline/offlineQueue.ts` içindeki `AsyncStorage` tabanlı ham JSON mutasyonları okunur ve `mutations` tablosuna aktarılır.
3. **Aşama 3 - Eski Taslak Kodun Silinmesi**: `src/services/offline/` taslak klasörü silinir.

---

## 🗺️ 15. Proje Yol Haritası ve Sürüm Planı (Roadmap Integration)

- **`V6.0` — Storage Foundation & Recovery Spike**: `op-sqlite` veritabanı kurulumu, SQL şemaları (`server_data`, `ON DELETE SET NULL`), `PersistQueryClientProvider` katmanı, SQLite Corruption Recovery Spike görevi ve unit testler.
- **`V6.1` — Feature Architecture & Zustand Store**: `src/features/offline/` modül yapısı, `index.ts`, `RepositoryMutationResult` (3-Way Union) ve `offlineSyncStore` kurulumu.
- **`V6.2` — Single-Flight Lock & Supabase Status Matrix**: `isSyncing` kilit mekanizması, `parentMutationId` cascading failure & blocked recovery mantığı.
- **`V6.3` — TanStack Query Bridge & Offline Re-hydration**: SQLite ➔ TanStack Query UI re-hydration köprü kodu.
- **`V6.4` — Native POD Media Storage & Storage Idempotency**: `react-native-fs` saklama, deterministik path & pre-flight check ile POD senkronizasyonu.
- **`V6.5` — Optimistic UI, Tombstones & Re-basing Protocol**: İyimser UI güncellemeleri, Tombstone filtresi ve Supabase 3-Way Conflict / Re-basing entegrasyonu.
- **`V6.6` — Verification & E2E Testing**: Jest unit & E2E testlerin tamamlanması.

---
*Son Güncelleme Tarihi: 15 Ağustos 2026*
