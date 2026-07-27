# 2. Gün: Ortam Kurulumu ve Proje İskeletinin Oluşturulması

## Yapılan Çalışmalar
Bugün evden (online) çalışarak geliştirme ortamının hazırlanması ve projenin iskeletinin oluşturulması adımlarını gerçekleştirdim. React Native geliştirme sürecini hızlandırdığı için Expo'yu tercih etmiştik. Öncelikle Expo CLI kullanarak TypeScript destekli yeni bir proje başlattım.

Daha sonra proje boyunca kullanacağımız kütüphaneleri sisteme dâhil ettim. Bunlar arasında navigasyon için `react-navigation`, veritabanı iletişimi için `supabase-js`, durum yönetimi için `zustand` ve form yönetimi için `react-hook-form` yer aldı.

Klasör mimarisini temiz kod prensiplerine uygun olarak ölçeklenebilir şekilde tasarladım: `src` altında `screens`, `navigation`, `services`, `components`, `store`, `types` gibi modülleri oluşturdum.

## Kod Örneği

Proje bağımlılıklarının kurulması (package.json içerisinden bir kesit):

```json
"dependencies": {
  "@react-navigation/bottom-tabs": "^7.18.13",
  "@react-navigation/native": "^7.3.13",
  "@react-navigation/native-stack": "^7.18.5",
  "@supabase/supabase-js": "^2.110.8",
  "expo": "~54.0.0",
  "react": "^19.1.0",
  "react-native": "^0.81.5",
  "zustand": "^5.0.14"
}
```

Klasör hiyerarşisinin `src` altındaki dizilimi için boş dosyalar ve dizinler açıldı, git takibine alındı.

## Günün Özeti
Projeyi kodlamaya hazır hale getirdim ve temel altyapıyı oluşturdum. Expo sayesinde uygulamanın fiziksel cihazda ve emülatörde nasıl derlenip çalıştığını test ettim. Herhangi bir kurulum hatası almadan ortamı stabilize ettim.
