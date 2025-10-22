import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@harmony/theme';

type StateMessageVariant = 'info' | 'error';

interface StateMessageProps {
  title: string;
  description?: string;
  variant?: StateMessageVariant;
}

const baseStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  description: {
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
  },
});

export const StateMessage: React.FC<StateMessageProps> = ({
  title,
  description,
  variant = 'info',
}) => {
  const { colors, spacing, typography } = useTheme();

  const styles = useMemo(
    () => ({
      container: StyleSheet.compose(baseStyles.container, {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
      }),
      description: StyleSheet.compose(baseStyles.description, {
        color: colors.textSecondary,
        fontFamily: typography.fontFamilies.sans.regular,
        fontSize: typography.fontSizes.sm,
        marginTop: spacing.xs,
      }),
      title: StyleSheet.compose(baseStyles.title, {
        color: variant === 'error' ? colors.danger : colors.textSecondary,
        fontFamily: typography.fontFamilies.sans.medium,
        fontSize: typography.fontSizes.md,
      }),
    }),
    [
      colors.danger,
      colors.textSecondary,
      spacing.lg,
      spacing.xl,
      spacing.xs,
      typography.fontFamilies.sans.medium,
      typography.fontFamilies.sans.regular,
      typography.fontSizes.md,
      typography.fontSizes.sm,
      variant,
    ]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
};
