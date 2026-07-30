import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

export const ProfileThemeLangSwitchCard = () => {
  const { theme: colors, isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
      <Text style={[styles.cardTitle, { color: colors.primary }]}>Uygulama Tercihleri</Text>
      <Text style={[styles.cardSubtitle, { color: colors.onSurfaceVariant }]}>
        Görünüm temasını ve uygulama dilini kolayca değiştirin.
      </Text>

      <View style={styles.switchesRow}>
        {/* Enlarge Dribbble CopyCase Theme Switcher */}
        <View style={styles.switchGroup}>
          <Text style={[styles.groupLabel, { color: colors.onSurface }]}>Görünüm Teması</Text>
          <View
            style={[
              styles.switchTrackLarge,
              {
                backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9',
                borderColor: isDarkMode ? '#1e293b' : '#cbd5e1',
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.switchPillLarge,
                !isDarkMode && [
                  styles.switchPillActiveLarge,
                  { backgroundColor: '#ffffff', shadowColor: '#000' },
                ],
              ]}
              onPress={() => isDarkMode && toggleTheme()}
              activeOpacity={0.8}
            >
              <MaterialIcons name="wb-sunny" size={20} color={!isDarkMode ? '#f59e0b' : '#64748b'} />
              <Text style={[styles.pillLabelText, { color: !isDarkMode ? '#0f172a' : '#64748b' }]}>Açık</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.switchPillLarge,
                isDarkMode && [
                  styles.switchPillActiveLarge,
                  { backgroundColor: '#3b82f6', shadowColor: '#3b82f6' },
                ],
              ]}
              onPress={() => !isDarkMode && toggleTheme()}
              activeOpacity={0.8}
            >
              <MaterialIcons name="dark-mode" size={20} color={isDarkMode ? '#ffffff' : '#94a3b8'} />
              <Text style={[styles.pillLabelText, { color: isDarkMode ? '#ffffff' : '#94a3b8' }]}>Koyu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enlarge Dribbble CopyCase Language Switcher */}
        <View style={styles.switchGroup}>
          <Text style={[styles.groupLabel, { color: colors.onSurface }]}>Uygulama Dili</Text>
          <View
            style={[
              styles.switchTrackLarge,
              {
                backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0',
                borderColor: isDarkMode ? '#334155' : '#cbd5e1',
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.switchPillLarge,
                language === 'tr' && [
                  styles.switchPillActiveLarge,
                  { backgroundColor: colors.primary, shadowColor: colors.primary },
                ],
              ]}
              onPress={() => setLanguage('tr')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.pillTextBold,
                  { color: language === 'tr' ? '#ffffff' : isDarkMode ? '#94a3b8' : '#64748b' },
                ]}
              >
                Türkçe (TR)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.switchPillLarge,
                language === 'en' && [
                  styles.switchPillActiveLarge,
                  { backgroundColor: colors.primary, shadowColor: colors.primary },
                ],
              ]}
              onPress={() => setLanguage('en')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.pillTextBold,
                  { color: language === 'en' ? '#ffffff' : isDarkMode ? '#94a3b8' : '#64748b' },
                ]}
              >
                English (EN)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter',
    marginTop: -10,
    lineHeight: 18,
  },
  switchesRow: {
    gap: 16,
    marginTop: 4,
  },
  switchGroup: {
    gap: 8,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  switchTrackLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
  },
  switchPillLarge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: '100%',
    borderRadius: 20,
  },
  switchPillActiveLarge: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  pillLabelText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  pillTextBold: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});
