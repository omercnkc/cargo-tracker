import { useWindowDimensions } from 'react-native';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeScreen: boolean;
  deviceType: DeviceType;
  gridColumns: number;
  containerPadding: number;
  maxContentWidth: number;
}

export const useResponsive = (): ResponsiveInfo => {
  const { width, height } = useWindowDimensions();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isLargeScreen = width >= 768;

  let deviceType: DeviceType = 'mobile';
  let gridColumns = 1;
  let containerPadding = 16;
  const maxContentWidth = 1200;

  if (isDesktop) {
    deviceType = 'desktop';
    gridColumns = 3;
    containerPadding = 32;
  } else if (isTablet) {
    deviceType = 'tablet';
    gridColumns = 2;
    containerPadding = 24;
  } else {
    deviceType = 'mobile';
    gridColumns = 1;
    containerPadding = 16;
  }

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    deviceType,
    gridColumns,
    containerPadding,
    maxContentWidth,
  };
};

export default useResponsive;
