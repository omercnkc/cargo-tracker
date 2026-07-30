import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

export const ProfileThemeLangSwitchCard = () => {
  const { theme: colors, isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage } = useTranslation();

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
      
      {/* Row 1: Tema */}
      <View style={styles.settingRow}>
        <View style={styles.labelGroup}>
          <MaterialIcons name="palette" size={22} color={colors.onSurface} />
          <Text style={[styles.labelTitle, { color: colors.onSurface }]}>Tema</Text>
        </View>

        <View style={[styles.switchTrack, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', borderColor: colors.outlineVariant }]}>
          <TouchableOpacity
            style={[
              styles.switchPill,
              !isDarkMode && styles.switchPillActiveLight,
            ]}
            onPress={() => isDarkMode && toggleTheme()}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 13 }}>☀️</Text>
            <Text style={[styles.pillText, { color: !isDarkMode ? '#00236f' : '#94a3b8' }]}>Açık</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switchPill,
              isDarkMode && styles.switchPillActiveDark,
            ]}
            onPress={() => !isDarkMode && toggleTheme()}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 13 }}>🌙</Text>
            <Text style={[styles.pillText, { color: isDarkMode ? '#ffffff' : '#94a3b8' }]}>Koyu</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Row 2: Dil */}
      <View style={styles.settingRow}>
        <View style={styles.labelGroup}>
          <MaterialIcons name="language" size={22} color={colors.onSurface} />
          <Text style={[styles.labelTitle, { color: colors.onSurface }]}>Dil</Text>
        </View>

        <View style={[styles.switchTrack, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', borderColor: colors.outlineVariant }]}>
          <TouchableOpacity
            style={[
              styles.switchPill,
              language === 'tr' && styles.switchPillActiveBlue,
            ]}
            onPress={() => setLanguage('tr')}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 12 }}>🇹🇷</Text>
            <Text style={[styles.pillText, { color: language === 'tr' ? '#ffffff' : isDarkMode ? '#94a3b8' : '#64748b' }]}>
              Türkçe (TR)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switchPill,
              language === 'en' && styles.switchPillActiveBlue,
            ]}
            onPress={() => setLanguage('en')}
            activeOpacity={0.8}
          >
            <Text style={[styles.pillText, { color: language === 'en' ? '#ffffff' : isDarkMode ? '#94a3b8' : '#64748b' }]}>
              English (EN)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  labelTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  switchTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
  },
  switchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: '100%',
    borderRadius: 17,
  },
  switchPillActiveLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  switchPillActiveDark: {
    backgroundColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  switchPillActiveBlue: {
    backgroundColor: '#00236f',
    shadowColor: '#00236f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});
