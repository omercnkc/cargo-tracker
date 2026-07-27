# 5. Gün: Ana Ekran (Home) ve Kargo Listeleme Ekranlarının Geliştirilmesi

## Yapılan Çalışmalar
Bugün uygulamanın en çok kullanılacak sayfalarından olan `HomeScreen` ve `PackagesScreen` ekranlarının arayüz (UI) tasarımlarını ve işlevselliklerini koda döktüm.

`HomeScreen` üzerinde kullanıcının özet istatistiklerini (teslim edilen kargolar, yoldaki kargolar vb.) görebileceği bir dashboard tasarladım. Ayrıca yeni kargo ekleme butonu gibi hızlı eylemlere yer verdim.

`PackagesScreen` tarafında ise Supabase'den çekilen kargo verilerini bir `FlatList` yardımıyla listeleyecek yapıyı kurdum. Zustand veya React Query gibi araçlar kullanarak verilerin anlık ve performanslı bir şekilde arayüze yansıması için önlemler aldım. Arama ekranı (`SearchScreen.tsx`) için de temel input tasarımlarını yaptım.

## Kod Örneği

**`src/screens/HomeScreen.tsx`** içerisinden basit bir görünüm iskeleti:

```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hoş Geldiniz 👋</Text>
        <Text style={styles.subtitle}>Kargolarınızın güncel durumu</Text>
      </View>
      
      {/* İstatistikler Kartları veya Son İşlemler buraya gelecek */}
      <View style={styles.statsContainer}>
        {/* ... */}
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Yeni Kargo Ekle</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  statsContainer: { flex: 1 },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
```

## Günün Özeti
Uygulamanın ana gövdesini oluşturan sayfaların kodlaması tamamlandı. Ekran tasarımları React Native'in `StyleSheet` yapısı ile mobil cihazlara uygun ve duyarlı (responsive) bir şekilde kodlandı.
