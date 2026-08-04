import React from 'react';
import { View, Image, StyleProp, ImageStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';

interface CarrierLogoProps {
  logo: any; // SVG XML string or image require() module / { uri }
  size?: number;
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
}

export const CarrierLogo: React.FC<CarrierLogoProps> = ({
  logo,
  size = 32,
  width,
  height,
  style,
}) => {
  const w = width || size;
  const h = height || size;

  if (!logo) {
    return (
      <View style={[{ width: w, height: h, alignItems: 'center', justifyContent: 'center' }, style]}>
        <MaterialIcons name="local-shipping" size={Math.round(size * 0.7)} color="#0054a6" />
      </View>
    );
  }

  if (typeof logo === 'string' && logo.trim().startsWith('<svg')) {
    return <SvgXml xml={logo} width={w} height={h} style={style as any} />;
  }

  const imageSource = typeof logo === 'string' ? { uri: logo } : logo;
  return (
    <Image
      source={imageSource}
      style={[{ width: w, height: h }, style]}
      resizeMode="contain"
    />
  );
};

export default CarrierLogo;
