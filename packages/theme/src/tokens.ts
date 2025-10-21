export const palette = {
  primary: '#712E91',
  primaryVariant: '#473D9E',
  accent: '#51D2DE',
  success: '#33B764',
  warning: '#FFC04D',
  danger: '#E04545',
  info: '#3F7CAD',
  neutral100: '#0B0D12',
  neutral90: '#1A1C24',
  neutral80: '#2B2E3A',
  neutral70: '#3C4150',
  neutral60: '#4F5667',
  neutral50: '#646C80',
  neutral40: '#80889E',
  neutral30: '#9CA3B6',
  neutral20: '#CBD1DE',
  neutral10: '#E4E8F1',
  neutral0: '#FFFFFF',
} as const;

export const brand = {
  gradientStart: palette.primary,
  gradientEnd: palette.primaryVariant,
  shimmer: 'rgba(113, 46, 145, 0.16)',
  logo: 'assets/images/brand/logo-placeholder.svg',
} as const;

export const typography = {
  fontFamilies: {
    sans: {
      regular: 'Glober-Regular',
      medium: 'Glober-SemiBold',
      bold: 'NeoSansPro-Bold',
    },
    serif: {
      regular: 'TimesNewRomanPSMT',
    },
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  lineHeights: {
    tight: 1.1,
    regular: 1.35,
    loose: 1.5,
  },
  letterSpacing: {
    tight: -0.3,
    normal: 0,
    wide: 0.4,
  },
} as const;

export const spacing = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const elevation = {
  level1: {
    shadowColor: '#0B0D12',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    shadowOpacity: 0.12,
    elevation: 3,
  },
  level2: {
    shadowColor: '#0B0D12',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    shadowOpacity: 0.14,
    elevation: 6,
  },
} as const;

export type Palette = typeof palette;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Radii = typeof radii;
export type Elevation = typeof elevation;
