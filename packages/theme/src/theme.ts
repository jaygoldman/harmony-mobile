import { elevation, palette, radii, spacing, typography } from './tokens';

export type ThemeMode = 'light' | 'dark';

export interface HarmonySemanticColors {
  background: string;
  backgroundSubtle: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  callout: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export interface HarmonyTheme {
  mode: ThemeMode;
  colors: HarmonySemanticColors;
  palette: typeof palette;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
  elevation: typeof elevation;
}

const lightColors: HarmonySemanticColors = {
  background: palette.neutral0,
  backgroundSubtle: palette.neutral10,
  surface: palette.neutral0,
  surfaceElevated: palette.neutral0,
  textPrimary: palette.neutral100,
  textSecondary: palette.neutral60,
  border: palette.neutral20,
  callout: palette.primaryVariant,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  info: palette.info,
};

const darkColors: HarmonySemanticColors = {
  background: palette.neutral100,
  backgroundSubtle: palette.neutral90,
  surface: palette.neutral90,
  surfaceElevated: palette.neutral80,
  textPrimary: palette.neutral0,
  textSecondary: palette.neutral30,
  border: palette.neutral70,
  callout: palette.accent,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  info: palette.info,
};

const baseTheme: Omit<HarmonyTheme, 'mode' | 'colors'> = {
  palette,
  typography,
  spacing,
  radii,
  elevation,
};

export const createTheme = (mode: ThemeMode): HarmonyTheme => ({
  mode,
  colors: mode === 'light' ? lightColors : darkColors,
  ...baseTheme,
});

export const lightTheme = createTheme('light');
export const darkTheme = createTheme('dark');
