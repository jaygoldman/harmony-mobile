import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@harmony/theme';

interface PlaceholderTabScreenProps {
  title: string;
  description: string;
}

export const PlaceholderTabScreen: React.FC<PlaceholderTabScreenProps> = ({
  title,
  description,
}) => {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text
        style={{
          color: colors.textPrimary,
          fontFamily: typography.fontFamilies.sans.medium,
          fontSize: typography.fontSizes.lg,
        }}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.description,
          {
            color: colors.textSecondary,
            fontFamily: typography.fontFamilies.sans.regular,
            fontSize: typography.fontSizes.md,
            marginTop: spacing.sm,
          },
        ]}
      >
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  description: {
    maxWidth: 320,
    textAlign: 'center',
  },
});
