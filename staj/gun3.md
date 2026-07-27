# 3. Gün: Supabase Veritabanı Kurulumu ve Entegrasyonu

## Yapılan Çalışmalar
Bugün yine uzaktan bağlanarak projenin backend ve veritabanı ihtiyacını karşılamak için hızlı ve güçlü bir BaaS (Backend as a Service) çözümü olan Supabase'i kurmaya odaklandım. Ekip ile gün içi online durum değerlendirmesi (daily) yaptıktan sonra Supabase paneline giriş yaparak `cargo-tracker` adında yeni bir proje oluşturdum.

Veritabanı tablolarının mimarisini tasarladım. Kullanıcılar (users), kargolar (packages) ve bildirimler (notifications) için gerekli tabloları PostgreSQL üzerinden oluşturduk. Daha sonra, React Native uygulamamızdan bu veritabanına bağlanabilmek için `@supabase/supabase-js` kütüphanesini kullanarak bağlantı ayarlarını yapılandırdım.

Güvenlik amacıyla Supabase URL ve Anon Key bilgilerini kök dizindeki `.env` dosyasında saklayarak projeye entegre ettim.

## Kod Örneği

**`src/services/supabase/supabase.ts`** dosyasının oluşturulması ve yapılandırılması:

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// .env dosyasından çekilen değişkenler (Örnek kullanım)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## Günün Özeti
Uygulamanın veri katmanı başarıyla oluşturuldu ve test edildi. Supabase istemcisi aracılığıyla uygulamanın kullanıcı doğrulama ve veri ekleme/çekme işlemleri için hazır bir altyapıya sahip olduk.
