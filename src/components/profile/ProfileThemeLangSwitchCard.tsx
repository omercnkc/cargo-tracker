import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

export const ProfileThemeLangSwitchCard = () => {
  const { theme: colors, isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
      
      {/* Row 1: Tema */}
      <View style={styles.settingRow}>
        <View style={styles.labelGroup}>
          <MaterialIcons name="palette" size={20} color={colors.onSurface} />
          <Text style={[styles.labelTitle, { color: colors.onSurface }]}>{t('themeTitle')}</Text>
        </View>

        <View style={[styles.switchTrack, { backgroundColor: isDarkMode ? colors.surfaceContainerHigh : '#f1f5f9', borderColor: colors.outlineVariant }]}>
          <TouchableOpacity
            style={[
              styles.switchPill,
              !isDarkMode && styles.switchPillActiveLight,
            ]}
            onPress={() => isDarkMode && toggleTheme()}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 12 }}>☀️</Text>
            <Text style={[styles.pillText, { color: !isDarkMode ? colors.primary : colors.onSurfaceVariant }]}>{t('themeLight')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switchPill,
              isDarkMode && [styles.switchPillActiveDark, { backgroundColor: colors.primary }],
            ]}
            onPress={() => !isDarkMode && toggleTheme()}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 12 }}>🌙</Text>
            <Text style={[styles.pillText, { color: isDarkMode ? colors.onPrimary : colors.onSurfaceVariant }]}>{t('themeDark')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Row 2: Dil */}
      <View style={styles.settingRow}>
        <View style={styles.labelGroup}>
          <MaterialIcons name="language" size={20} color={colors.onSurface} />
          <Text style={[styles.labelTitle, { color: colors.onSurface }]}>{t('language')}</Text>
        </View>

        <View style={[styles.switchTrack, { backgroundColor: isDarkMode ? colors.surfaceContainerHigh : '#f1f5f9', borderColor: colors.outlineVariant }]}>
          <TouchableOpacity
            style={[
              styles.switchPill,
              language === 'tr' && [styles.switchPillActiveBlue, { backgroundColor: colors.primary }],
            ]}
            onPress={() => setLanguage('tr')}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 13 }}>🇹🇷</Text>
            <Text style={[styles.pillText, { color: language === 'tr' ? colors.onPrimary : colors.onSurfaceVariant }]}>
              TR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switchPill,
              language === 'en' && [styles.switchPillActiveBlue, { backgroundColor: colors.primary }],
            ]}
            onPress={() => setLanguage('en')}
            activeOpacity={0.8}
          >
            <Image 
              source={require('../../assets/eng-icon.png')} 
              style={styles.flagIcon} 
              resizeMode="cover"
            />
            <Text style={[styles.pillText, { color: language === 'en' ? colors.onPrimary : colors.onSurfaceVariant }]}>
              EN
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
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
    gap: 8,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  labelTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  switchTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 18,
    padding: 2,
    borderWidth: 1,
  },
  switchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 10,
    height: '100%',
    borderRadius: 15,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  switchPillActiveBlue: {
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
  flagIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
