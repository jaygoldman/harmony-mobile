import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@harmony/theme';
import { useSession } from '../state/SessionProvider';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainNavigator } from './MainNavigator';
import { SessionStatus } from '@harmony/session';

export const RootNavigator: React.FC = () => {
  const { state } = useSession();

  return (
    <NavigationContainer>
      <StatefulNavigator status={state.status} />
    </NavigationContainer>
  );
};

type StatefulNavigatorProps = {
  status: SessionStatus;
};

const StatefulNavigator: React.FC<StatefulNavigatorProps> = ({ status }) => {
  const { colors, typography, spacing } = useTheme();

  if (status === 'unknown') {
    return (
      <View style={[styles.bootContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.callout} size="large" />
        <Text
          style={{
            color: colors.textSecondary,
            fontFamily: typography.fontFamilies.sans.regular,
            fontSize: typography.fontSizes.md,
            marginTop: spacing.md,
          }}
        >
          Preparing Conductor Mobile…
        </Text>
      </View>
    );
  }

  if (status === 'connected') {
    return <MainNavigator />;
  }

  return <OnboardingNavigator />;
};

const styles = StyleSheet.create({
  bootContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
