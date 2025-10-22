import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@harmony/theme';
import { developerSettingsStore } from '../../state/stores';
import { Button } from '../../components/Button';
import type { OnboardingStackParamList } from './navigationTypes';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

const TAP_THRESHOLD = 7;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, spacing, typography } = useTheme();
  const [developerUnlocked, setDeveloperUnlocked] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const tapCounter = useRef(0);

  useEffect(() => {
    let isMounted = true;
    developerSettingsStore
      .getSettings()
      .then((settings) => {
        if (isMounted) {
          setDeveloperUnlocked(settings.qrBypassEnabled);
        }
      })
      .catch(() => {
        // ignore load failures; onboarding can proceed without dev settings
      });

    const unsubscribe = developerSettingsStore.subscribe((settings) => {
      if (isMounted) {
        setDeveloperUnlocked(settings.qrBypassEnabled);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timeout = setTimeout(() => setNotification(null), 2000);
    return () => clearTimeout(timeout);
  }, [notification]);

  const handleHiddenTap = useCallback(() => {
    tapCounter.current += 1;
    if (tapCounter.current < TAP_THRESHOLD) {
      return;
    }

    tapCounter.current = 0;
    developerSettingsStore
      .update({ qrBypassEnabled: true })
      .then(() => developerSettingsStore.getSettings())
      .then((settings) => {
        setDeveloperUnlocked(settings.qrBypassEnabled);
        setNotification('Developer options unlocked');
      })
      .catch(() => {
        setNotification('Unable to unlock developer options');
      });
  }, []);

  const subtitle = useMemo(
    () =>
      developerUnlocked
        ? 'Scan the desktop QR code or use developer tools to inject test credentials.'
        : 'Scan the desktop QR code or enter your 8-character connection code manually.',
    [developerUnlocked]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable
        accessibilityRole="header"
        onPress={handleHiddenTap}
        style={{ paddingVertical: spacing.lg }}
      >
        <Text
          style={[
            styles.title,
            {
              color: colors.textPrimary,
              fontFamily: typography.fontFamilies.sans.medium,
              fontSize: typography.fontSizes.xl,
            },
          ]}
        >
          Harmony Mobile
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
              fontFamily: typography.fontFamilies.sans.regular,
              fontSize: typography.fontSizes.md,
              marginTop: spacing.sm,
            },
          ]}
        >
          {subtitle}
        </Text>
      </Pressable>

      <View style={[styles.actions, { gap: spacing.md, marginTop: spacing.xl }]}>
        <Button
          label="Scan QR Code"
          onPress={() => navigation.navigate('Scan')}
          variant="primary"
        />
        <Button
          label="Enter Code Manually"
          onPress={() => navigation.navigate('ManualEntry')}
          variant="secondary"
        />
        {developerUnlocked ? (
          <Button
            label="Developer Options"
            onPress={() => navigation.navigate('DeveloperTools')}
            variant="ghost"
          />
        ) : null}
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <Text
          style={[
            styles.info,
            {
              color: colors.textSecondary,
              fontFamily: typography.fontFamilies.sans.regular,
              fontSize: typography.fontSizes.sm,
            },
          ]}
        >
          Codes expire after 15 minutes. Request a new one from the Harmony desktop app if needed.
        </Text>
      </View>

      {notification ? (
        <View style={[styles.toast, { backgroundColor: colors.surface }]}>
          <Text
            style={{
              color: colors.textPrimary,
              fontFamily: typography.fontFamilies.sans.medium,
              fontSize: typography.fontSizes.sm,
            }}
          >
            {notification}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    width: '100%',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  info: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
  },
  toast: {
    alignSelf: 'center',
    borderRadius: 12,
    bottom: 24,
    opacity: 0.95,
    paddingHorizontal: 18,
    paddingVertical: 10,
    position: 'absolute',
  },
});
