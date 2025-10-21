import React, { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { HarmonyTheme, ThemeMode, darkTheme, lightTheme } from './theme';

type ThemeContextValue = {
  theme: HarmonyTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  mode: 'light',
  setMode: () => undefined,
  toggleMode: () => undefined,
});

export interface ThemeProviderProps extends PropsWithChildren {
  initialMode?: ThemeMode | 'system';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMode = 'system',
}) => {
  const systemMode = Appearance.getColorScheme() ?? 'light';
  const [mode, setMode] = useState<ThemeMode>(
    initialMode === 'system' ? (systemMode === 'dark' ? 'dark' : 'light') : initialMode
  );

  const value = useMemo<ThemeContextValue>(() => {
    const theme = mode === 'dark' ? darkTheme : lightTheme;

    return {
      theme,
      mode,
      setMode(nextMode) {
        setMode(nextMode);
      },
      toggleMode() {
        setMode((current) => (current === 'dark' ? 'light' : 'dark'));
      },
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useHarmonyTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useHarmonyTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useTheme = () => useHarmonyTheme().theme;
