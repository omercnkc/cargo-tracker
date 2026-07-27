# 4. Gün: Navigasyon Mimarisinin Kurulması ve Kimlik Doğrulama Ekranları

## Yapılan Çalışmalar
Kullanıcı deneyimini sağlamak için sayfalar arası geçişleri yönetecek React Navigation kurulumunu tamamladım. Uygulamanın iki ana navigasyon akışı (Stack ve Bottom Tabs) olmasını planladım. 

Öncelikle kullanıcıların sisteme giriş yapabileceği veya kayıt olabileceği kimlik doğrulama (Auth) akışını geliştirdim. `LoginScreen.tsx` ve `RegisterScreen.tsx` ekranlarını tasarlayarak `react-hook-form` yardımıyla form validasyonlarını ekledim. Şifremi unuttum ekranı (`ForgotPasswordScreen.tsx`) için de bir altyapı hazırladım.

Kullanıcı giriş yaptıktan sonra yönlendirileceği ana sekmeleri barındıran `BottomTabs.tsx` bileşenini oluşturdum.

## Kod Örneği

**`src/navigation/BottomTabs.tsx`** dosyasında alt sekme (Bottom Tab) navigasyonunun temel kurgusu:

```tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import PackagesScreen from '../screens/PackagesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Packages') iconName = 'cube-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Packages" component={PackagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

## Günün Özeti
Uygulama içi ekran geçişleri (routing) sorunsuz hale getirildi. Kullanıcı giriş/çıkış işlemlerinin temelleri atılarak yetkisiz erişimlerin önüne geçmek için Stack Navigator korumaları planlandı.
