import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

export const HeaderRightActions = () => {
  const { theme: colors, isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.langChip, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outlineVariant }]} 
        onPress={toggleLanguage}
        activeOpacity={0.7}
      >
        <Text style={[styles.langText, { color: colors.primary }]}>{language.toUpperCase()}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.iconButton, { backgroundColor: colors.surfaceContainerHigh }]} 
        onPress={toggleTheme}
        activeOpacity={0.7}
      >
        <MaterialIcons 
          name={isDarkMode ? "wb-sunny" : "dark-mode"} 
          size={20} 
          color={colors.primary} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  langText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HeaderRightActions;
