import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import PackagesScreen from '../screens/PackagesScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddPackageScreen from '../screens/AddPackageScreen';
import { MainTabParamList } from './types';
import useResponsive from '../hooks/useResponsive';
import { useTheme } from '../theme/useTheme';
import { useTranslation } from '../hooks/useTranslation';

import AnimatedCurvedTabBar from '../components/navigation/AnimatedCurvedTabBar';
import SwipeableTabWrapper from '../components/navigation/SwipeableTabWrapper';

const Tab = createBottomTabNavigator<MainTabParamList>();

const withSwipe = (Component: React.ComponentType<any>) => (props: any) => (
  <SwipeableTabWrapper>
    <Component {...props} />
  </SwipeableTabWrapper>
);

const HomeScreenWithSwipe = withSwipe(HomeScreen);
const PackagesScreenWithSwipe = withSwipe(PackagesScreen);
const AddPackageScreenWithSwipe = withSwipe(AddPackageScreen);
const StatisticsScreenWithSwipe = withSwipe(StatisticsScreen);
const ProfileScreenWithSwipe = withSwipe(ProfileScreen);

// Custom Left Sidebar for Large Screens (Tablet / Desktop)
const CustomDesktopSidebar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { theme: colors } = useTheme();

  return (
    <View style={[styles.sidebarContainer, { paddingTop: insets.top + 16, backgroundColor: colors.surfaceContainerLowest, borderRightColor: colors.outlineVariant + '4D' }]}>
      {/* Brand Header */}
      <View style={styles.sidebarBrand}>
        <View style={[styles.brandIconBg, { backgroundColor: colors.primary }]}>
          <MaterialIcons name="inventory" size={24} color={colors.onPrimary} />
        </View>
        <Text style={[styles.brandText, { color: colors.primary }]}>KargoTakip</Text>
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
          if (route.name === 'AddPackage') iconName = 'add';
          if (route.name === 'Statistics') iconName = 'leaderboard';
          if (route.name === 'Profile') iconName = 'person';

          return (
            <TouchableOpacity
              key={route.key}
              style={[
                styles.sidebarNavItem,
                isFocused && { backgroundColor: colors.primaryContainer + '33' },
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
                  { color: isFocused ? colors.primary : colors.onSurfaceVariant },
                  isFocused && { fontWeight: '700' }
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
  const { isLargeScreen } = useResponsive();
  const { theme: colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => (isLargeScreen ? <CustomDesktopSidebar {...props} /> : <AnimatedCurvedTabBar {...props} />)}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreenWithSwipe} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Packages" 
        component={PackagesScreenWithSwipe} 
        options={{
          tabBarLabel: 'Packages',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="inventory" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="AddPackage" 
        component={AddPackageScreenWithSwipe} 
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="add" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Statistics" 
        component={StatisticsScreenWithSwipe} 
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="leaderboard" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreenWithSwipe} 
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
    borderRightWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
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
  sidebarNavText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BottomTabs;
