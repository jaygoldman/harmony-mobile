import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@harmony/theme';
import { SessionProvider } from './src/state/SessionProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { dataClient, developerSettingsStore } from './src/state/stores';

const App: React.FC = () => (
  <ThemeProvider initialMode="system">
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <SessionProvider>
        <RootNavigator />
      </SessionProvider>
    </SafeAreaProvider>
  </ThemeProvider>
);

export default App;

export { dataClient, developerSettingsStore };
