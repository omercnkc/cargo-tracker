import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { hapticService } from '../../services/haptics.service';

export const HeaderRightActions = () => {
  const { theme: colors, isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage } = useTranslation();

  return (
    <View style={styles.container}>
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
          onPress={() => {
            if (isDarkMode) {
              hapticService.selection();
              toggleTheme();
            }
          }}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="wb-sunny"
            size={14}
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
          onPress={() => {
            if (!isDarkMode) {
              hapticService.selection();
              toggleTheme();
            }
          }}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="dark-mode"
            size={14}
            color={isDarkMode ? '#ffffff' : '#94a3b8'}
          />
        </TouchableOpacity>
      </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  switchTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    borderRadius: 14,
    padding: 2,
    borderWidth: 1,
  },
  switchPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 26,
  },
  switchPillActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  switchText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});

export default HeaderRightActions;
