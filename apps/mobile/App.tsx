import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, useTheme } from '@harmony/theme';
import { createHarmonyDataClient } from '@harmony/data';
import { createDeveloperSettingsStore } from '@harmony/config';

const dataClient = createHarmonyDataClient();
const developerSettingsStore = createDeveloperSettingsStore();

const BootScreen: React.FC = () => {
  const { colors, typography, spacing } = useTheme();
  const [status, setStatus] = useState('Preparing workspace…');

  useEffect(() => {
    const initialise = async () => {
      const settings = await developerSettingsStore.getSettings();
      const sessions = await dataClient.chat.sessions.list();
      if (settings.qrBypassEnabled) {
        setStatus('Developer bypass active');
        return;
      }
      const suffix = sessions.length === 1 ? '' : 's';
      setStatus(`Loaded ${sessions.length} mock chat session${suffix}`);
    };

    initialise();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.callout} size="large" />
      <Text
        accessibilityRole="header"
        style={{
          color: colors.textPrimary,
          marginTop: spacing.md,
          fontFamily: typography.fontFamilies.sans.medium,
          fontSize: typography.fontSizes.lg,
        }}
      >
        Harmony Mobile
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          marginTop: spacing.xs,
          fontFamily: typography.fontFamilies.sans.regular,
          fontSize: typography.fontSizes.sm,
        }}
      >
        {status}
      </Text>
    </View>
  );
};

const RootNavigator: React.FC = () => (
  <NavigationContainer>
    <BootScreen />
  </NavigationContainer>
);

const App: React.FC = () => (
  <ThemeProvider initialMode="system">
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <RootNavigator />
    </SafeAreaProvider>
  </ThemeProvider>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default App;

export { dataClient, developerSettingsStore };
