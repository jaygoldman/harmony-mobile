import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@harmony/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  testID,
}) => {
  const { colors, typography, spacing } = useTheme();
  const isDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: StyleSheet.hairlineWidth,
          },
          textColor: colors.textPrimary,
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          textColor: colors.textSecondary,
        };
      case 'primary':
      default:
        return {
          container: {
            backgroundColor: colors.callout,
          },
          textColor: colors.surface,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.wrapper, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          variantStyles.container,
          {
            opacity: pressed && !isDisabled ? 0.85 : 1,
            borderRadius: spacing.md,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
          },
        ]}
        testID={testID}
      >
        {loading ? (
          <ActivityIndicator color={variantStyles.textColor} />
        ) : (
          <Text
            style={[
              styles.label,
              {
                color: variantStyles.textColor,
                fontFamily: typography.fontFamilies.sans.medium,
                fontSize: typography.fontSizes.md,
              },
            ]}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
  wrapper: {
    alignSelf: 'stretch',
  },
});

export type ButtonComponent = typeof Button;
