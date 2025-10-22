import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@harmony/theme';

interface LoadingStateProps {
  label?: string;
}

const baseStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});

export const LoadingState: React.FC<LoadingStateProps> = ({ label = 'Loading…' }) => {
  const { colors, spacing, typography } = useTheme();
  const styles = useMemo(
    () => ({
      container: StyleSheet.compose(baseStyles.container, {
        paddingHorizontal: spacing.lg,
      }),
      label: StyleSheet.compose(baseStyles.label, {
        color: colors.textSecondary,
        fontFamily: typography.fontFamilies.sans.regular,
        fontSize: typography.fontSizes.md,
        marginTop: spacing.md,
      }),
    }),
    [
      colors.textSecondary,
      spacing.lg,
      spacing.md,
      typography.fontFamilies.sans.regular,
      typography.fontSizes.md,
    ]
  );

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.callout} size="large" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};
