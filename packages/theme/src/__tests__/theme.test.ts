import { createTheme, lightTheme, darkTheme } from '../theme';

describe('theme tokens', () => {
  it('creates light theme by default', () => {
    expect(lightTheme.mode).toBe('light');
    expect(lightTheme.colors.background).toBe('#FFFFFF');
  });

  it('creates dark theme', () => {
    const theme = createTheme('dark');
    expect(theme.mode).toBe('dark');
    expect(theme.colors.background).toBe(darkTheme.colors.background);
  });
});
