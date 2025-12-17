import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Screen size detection
export const isSmallDevice = width < 375;
export const isTablet = width >= 600 && width < 1024;
export const isDesktop = width >= 1024;

// Responsive width and height calculations
const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Responsive padding/margin
const spacingMultiplier = isTablet ? 1.2 : isDesktop ? 1.5 : 1;

export const responsiveSpacing = {
  xs: 4 * spacingMultiplier,
  sm: 8 * spacingMultiplier,
  md: 16 * spacingMultiplier,
  lg: 24 * spacingMultiplier,
  xl: 32 * spacingMultiplier,
  xxl: 48 * spacingMultiplier,
} as const;

// Responsive font sizes
export const responsiveFontSizes = {
  xs: 10 * (isTablet ? 1.1 : isDesktop ? 1.2 : 1),
  sm: 12 * (isTablet ? 1.1 : isDesktop ? 1.2 : 1),
  md: 14 * (isTablet ? 1.1 : isDesktop ? 1.2 : 1),
  lg: 16 * (isTablet ? 1.1 : isDesktop ? 1.2 : 1),
  xl: 18 * (isTablet ? 1.1 : isDesktop ? 1.2 : 1),
  xxl: 24 * (isTablet ? 1.1 : isDesktop ? 1.2 : 1),
  display: 32 * (isTablet ? 1.2 : isDesktop ? 1.3 : 1),
} as const;

// Responsive border radius
export const responsiveBorderRadius = {
  small: 4 * (isTablet ? 1.2 : isDesktop ? 1.5 : 1),
  medium: 8 * (isTablet ? 1.2 : isDesktop ? 1.5 : 1),
  large: 16 * (isTablet ? 1.2 : isDesktop ? 1.5 : 1),
  xl: 24 * (isTablet ? 1.2 : isDesktop ? 1.5 : 1),
  round: 999,
} as const;

// Grid system
export const grid = {
  gutter: 16 * spacingMultiplier,
  column: (width - 16 * 2) / 12, // 16 = default padding
  container: {
    width: isDesktop ? 1200 : '100%',
    paddingHorizontal: isDesktop ? 24 : 16,
  },
} as const;

export const responsive = {
  scale,
  verticalScale,
  moderateScale,
  spacing: responsiveSpacing,
  fontSize: responsiveFontSizes,
  borderRadius: responsiveBorderRadius,
  grid,
  isTablet,
  isDesktop,
  isSmallDevice,
} as const;

export default responsive;
