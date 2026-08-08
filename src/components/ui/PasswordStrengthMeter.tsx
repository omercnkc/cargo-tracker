import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getPasswordStrength, validatePassword } from '../../utils/validators';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

interface PasswordStrengthMeterProps {
  password?: string;
  showCriteria?: boolean;
}

export function PasswordStrengthMeter({
  password = '',
  showCriteria = true,
}: PasswordStrengthMeterProps) {
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  if (!password) return null;

  const strength = getPasswordStrength(password);
  const { criteria } = validatePassword(password);

  return (
    <View style={styles.container}>
      {/* Header & Label */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurfaceVariant }]}>
          {t('passwordStrengthTitle')}:
        </Text>
        <Text style={[styles.label, { color: strength.color }]}>
          {strength.label}
        </Text>
      </View>

      {/* Strength Bar */}
      <View
        style={[
          styles.barBackground,
          { backgroundColor: colors.surfaceContainerHighest || colors.outlineVariant + '40' },
        ]}
      >
        <View
          style={[
            styles.barFill,
            {
              width: `${strength.score}%`,
              backgroundColor: strength.color,
            },
          ]}
        />
      </View>

      {/* Rules Checklist */}
      {showCriteria && (
        <View style={styles.criteriaContainer}>
          <RuleBadge
            isValid={criteria.hasMinLength}
            text={t('ruleMinLength')}
            colors={colors}
          />
          <RuleBadge
            isValid={criteria.hasLetter}
            text={t('ruleHasLetter')}
            colors={colors}
          />
          <RuleBadge
            isValid={criteria.hasNumber}
            text={t('ruleHasNumber')}
            colors={colors}
          />
        </View>
      )}
    </View>
  );
}

function RuleBadge({
  isValid,
  text,
  colors,
}: {
  isValid: boolean;
  text: string;
  colors: any;
}) {
  return (
    <View style={styles.ruleItem}>
      <MaterialIcons
        name={isValid ? 'check-circle' : 'radio-button-unchecked'}
        size={14}
        color={isValid ? '#2E7D32' : colors.outline}
        style={styles.ruleIcon}
      />
      <Text
        style={[
          styles.ruleText,
          {
            color: isValid ? colors.onSurface : colors.outline,
            fontWeight: isValid ? '600' : '400',
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 12,
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  barBackground: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  criteriaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ruleIcon: {
    marginRight: 4,
  },
  ruleText: {
    fontSize: 11,
  },
});
