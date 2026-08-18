import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { hapticService } from '../../services/haptics.service';
import { styles } from './ProfileThemeLangSwitchCard.styles';

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
            onPress={() => {
              if (isDarkMode) {
                hapticService.selection();
                toggleTheme();
              }
            }}
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
            onPress={() => {
              if (!isDarkMode) {
                hapticService.selection();
                toggleTheme();
              }
            }}
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
            onPress={() => {
              if (language !== 'tr') {
                hapticService.selection();
                setLanguage('tr');
              }
            }}
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
            onPress={() => {
              if (language !== 'en') {
                hapticService.selection();
                setLanguage('en');
              }
            }}
            activeOpacity={0.8}
          >
            <Image 
              source={require('../../assets/company-icons/eng-icon.png')} 
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

export default ProfileThemeLangSwitchCard;
