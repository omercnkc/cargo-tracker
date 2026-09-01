import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { getInitials, isValidAvatarUrl } from '../../utils/avatarUtils';

export interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  email?: string | null;
  size?: number;
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export { getInitials, isValidAvatarUrl };

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  name,
  email,
  size = 64,
  borderWidth = 0,
  borderColor,
  backgroundColor,
  textColor,
  fontSize,
  style,
  textStyle,
}) => {
  const { theme: colors } = useTheme();
  const [imageError, setImageError] = useState(false);

  const hasValidImage = isValidAvatarUrl(avatarUrl);
  const initials = getInitials(name, email);
  const calculatedFontSize = fontSize || Math.round(size * 0.38);
  const radius = Math.round(size / 2);

  const finalBorderColor = borderColor || colors.surfaceContainer;
  const finalBgColor = backgroundColor || colors.primary;
  const finalTextColor = textColor || '#ffffff';

  if (hasValidImage && !imageError) {
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth,
            borderColor: finalBorderColor,
          },
          style,
        ]}
      >
        <Image
          source={{ uri: avatarUrl! }}
          style={{ width: '100%', height: '100%', borderRadius: radius }}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        styles.initialsContainer,
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth,
          borderColor: finalBorderColor,
          backgroundColor: finalBgColor,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.initialsText,
          {
            fontSize: calculatedFontSize,
            color: finalTextColor,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initialsContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  initialsText: {
    fontFamily: 'Inter',
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
