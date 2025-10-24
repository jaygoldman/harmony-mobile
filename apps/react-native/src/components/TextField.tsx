import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@harmony/theme';

export interface TextFieldProps extends TextInputProps {
  label: string;
  helperText?: string;
  errorText?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  testID?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  helperText,
  errorText,
  containerStyle,
  labelStyle,
  style,
  testID,
  ...props
}) => {
  const { colors, typography, spacing } = useTheme();
  const showError = Boolean(errorText);

  return (
    <View style={[styles.container, { marginBottom: spacing.md }, containerStyle]}>
      <Text
        style={[
          styles.label,
          {
            color: colors.textSecondary,
            fontFamily: typography.fontFamilies.sans.medium,
            marginBottom: spacing.xs,
          },
          labelStyle,
        ]}
      >
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.input,
          {
            borderColor: showError ? colors.danger : colors.border,
            color: colors.textPrimary,
            fontFamily: typography.fontFamilies.sans.regular,
            fontSize: typography.fontSizes.md,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: spacing.sm,
          },
          style,
        ]}
        testID={testID}
        {...props}
      />
      {showError ? (
        <Text
          style={{
            color: colors.danger,
            fontFamily: typography.fontFamilies.sans.medium,
            fontSize: typography.fontSizes.sm,
            marginTop: spacing.xs,
          }}
        >
          {errorText}
        </Text>
      ) : helperText ? (
        <Text
          style={{
            color: colors.textSecondary,
            fontFamily: typography.fontFamilies.sans.regular,
            fontSize: typography.fontSizes.sm,
            marginTop: spacing.xs,
          }}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export type TextFieldComponent = typeof TextField;
