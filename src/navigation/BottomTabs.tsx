import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import PackagesScreen from '../screens/PackagesScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import colors from '../theme/colors';
import { MainTabParamList } from './types';
import useResponsive from '../hooks/useResponsive';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom Left Sidebar for Large Screens (Tablet / Desktop)
const CustomDesktopSidebar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.sidebarContainer, { paddingTop: insets.top + 16 }]}>
      {/* Brand Header */}
      <View style={styles.sidebarBrand}>
        <View style={styles.brandIconBg}>
          <MaterialIcons name="inventory" size={24} color={colors.onPrimary} />
        </View>
        <Text style={styles.brandText}>KargoTakip</Text>
      </View>

      {/* Nav Links */}
      <View style={styles.sidebarNav}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName: any = 'home';
          if (route.name === 'Home') iconName = 'home';
          if (route.name === 'Packages') iconName = 'inventory';
          if (route.name === 'Statistics') iconName = 'leaderboard';
          if (route.name === 'Profile') iconName = 'person';

          return (
            <TouchableOpacity
              key={route.key}
              style={[
                styles.sidebarNavItem,
                isFocused && styles.sidebarNavItemActive,
              ]}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={iconName}
                size={22}
                color={isFocused ? colors.primary : colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.sidebarNavText,
                  isFocused && styles.sidebarNavTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const BottomTabs = () => {
  const insets = useSafeAreaInsets();
  const { isLargeScreen } = useResponsive();
  const bottomInset = insets.bottom > 0 ? insets.bottom : 12;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarStyle: isLargeScreen
          ? { display: 'none' }
          : {
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.outlineVariant + '4D',
              height: 56 + bottomInset,
              paddingBottom: bottomInset,
              paddingTop: 6,
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
            },
      }}
      tabBar={isLargeScreen ? (props) => <CustomDesktopSidebar {...props} /> : undefined}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Packages" 
        component={PackagesScreen} 
        options={{
          tabBarLabel: 'Packages',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="inventory" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Statistics" 
        component={StatisticsScreen} 
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="leaderboard" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 240,
    backgroundColor: colors.surfaceContainerLowest,
    borderRightWidth: 1,
    borderRightColor: colors.outlineVariant + '4D',
    paddingHorizontal: 16,
    zIndex: 100,
  },
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  brandIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  sidebarNav: {
    gap: 8,
  },
  sidebarNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  sidebarNavItemActive: {
    backgroundColor: colors.primaryContainer + '33', // 20% opacity
  },
  sidebarNavText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  sidebarNavTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default BottomTabs;
