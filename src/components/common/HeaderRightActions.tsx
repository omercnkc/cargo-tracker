import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

export const HeaderRightActions = () => {
  const { theme: colors, isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage } = useTranslation();

  return (
    <View style={styles.container}>
      {/* CopyCase Dribbble Style Language Switcher */}
      <View
        style={[
          styles.switchTrack,
          {
            backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0',
            borderColor: isDarkMode ? '#334155' : '#cbd5e1',
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.switchPill,
            language === 'tr' && [
              styles.switchPillActive,
              { backgroundColor: colors.primary, shadowColor: colors.primary },
            ],
          ]}
          onPress={() => setLanguage('tr')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.switchText,
              { color: language === 'tr' ? '#ffffff' : isDarkMode ? '#94a3b8' : '#64748b' },
            ]}
          >
            TR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.switchPill,
            language === 'en' && [
              styles.switchPillActive,
              { backgroundColor: colors.primary, shadowColor: colors.primary },
            ],
          ]}
          onPress={() => setLanguage('en')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.switchText,
              { color: language === 'en' ? '#ffffff' : isDarkMode ? '#94a3b8' : '#64748b' },
            ]}
          >
            EN
          </Text>
        </TouchableOpacity>
      </View>

      {/* CopyCase Dribbble Style Light/Dark Mode Switcher */}
      <View
        style={[
          styles.switchTrack,
          {
            backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9',
            borderColor: isDarkMode ? '#1e293b' : '#cbd5e1',
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.switchPill,
            !isDarkMode && [
              styles.switchPillActive,
              { backgroundColor: '#ffffff', shadowColor: '#000' },
            ],
          ]}
          onPress={() => isDarkMode && toggleTheme()}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="wb-sunny"
            size={16}
            color={!isDarkMode ? '#f59e0b' : '#64748b'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.switchPill,
            isDarkMode && [
              styles.switchPillActive,
              { backgroundColor: '#3b82f6', shadowColor: '#3b82f6' },
            ],
          ]}
          onPress={() => !isDarkMode && toggleTheme()}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="dark-mode"
            size={16}
            color={isDarkMode ? '#ffffff' : '#94a3b8'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 18,
    padding: 3,
    borderWidth: 1,
  },
  switchPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 30,
  },
  switchPillActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  switchText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});

export default HeaderRightActions;
