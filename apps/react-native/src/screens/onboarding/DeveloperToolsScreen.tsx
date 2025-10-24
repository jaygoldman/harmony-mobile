import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@harmony/theme';
import { DeveloperCredentials, DeveloperSettings } from '@harmony/config';
import { SessionDetails } from '@harmony/session';
import { useSession } from '../../state/SessionProvider';
import { developerSettingsStore } from '../../state/stores';
import { Button } from '../../components/Button';
import type { OnboardingStackParamList } from './navigationTypes';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'DeveloperTools'>;

const MOCK_SESSION_DETAILS: SessionDetails = {
  token: 'mock-token-1234',
  apiUrl: 'https://mock.harmony.local',
  username: 'developer',
  displayName: 'Harmony Dev',
  email: 'developer@harmony.test',
};

const MOCK_DEVELOPER_CREDENTIALS: DeveloperCredentials = {
  authToken: MOCK_SESSION_DETAILS.token,
  instanceUrl: MOCK_SESSION_DETAILS.apiUrl,
  userId: MOCK_SESSION_DETAILS.username,
  workspaceId: 'demo-workspace',
};

const credentialsToSession = (credentials: DeveloperCredentials): SessionDetails => ({
  token: credentials.authToken,
  apiUrl: credentials.instanceUrl,
  username: credentials.userId,
  displayName: 'Developer Tester',
  email: `${credentials.userId}@harmony.test`,
});

export const DeveloperToolsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, spacing, typography } = useTheme();
  const { applyDeveloperBypass, disconnect } = useSession();
  const [settings, setSettings] = useState<DeveloperSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const current = await developerSettingsStore.getSettings();
        if (isMounted) {
          setSettings(current);
        }
      } catch {
        // ignore
      }
    };

    load();
    const unsubscribe = developerSettingsStore.subscribe((next) => {
      if (isMounted) {
        setSettings(next);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(timeout);
  }, [message]);

  const handleInjectMock = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await developerSettingsStore.setQrBypassCredentials(MOCK_DEVELOPER_CREDENTIALS);
      await developerSettingsStore.update({ qrBypassEnabled: true });
      await applyDeveloperBypass(MOCK_SESSION_DETAILS);
      setMessage('Mock session injected.');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Unable to inject mock session right now.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleUseStoredCredentials = async () => {
    if (busy || !settings?.qrBypassCredentials) return;
    setBusy(true);
    try {
      await developerSettingsStore.update({ qrBypassEnabled: true });
      await applyDeveloperBypass(credentialsToSession(settings.qrBypassCredentials));
      setMessage('Stored credentials applied.');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Unable to apply stored credentials right now.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDisableBypass = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await developerSettingsStore.update({ qrBypassEnabled: false });
      await developerSettingsStore.setQrBypassCredentials(null);
      await disconnect();
      setMessage('Developer bypass disabled.');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Unable to disable developer bypass right now.'
      );
    } finally {
      setBusy(false);
    }
  };

  const bypassEnabled = settings?.qrBypassEnabled ?? false;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text
        style={{
          color: colors.textPrimary,
          fontFamily: typography.fontFamilies.sans.medium,
          fontSize: typography.fontSizes.lg,
          marginBottom: spacing.sm,
        }}
      >
        Developer Tools
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontFamily: typography.fontFamilies.sans.regular,
          fontSize: typography.fontSizes.md,
          marginBottom: spacing.xl,
        }}
      >
        Inject credentials to skip QR pairing when working against mocked services.
      </Text>

      <View style={[styles.fullWidth, { gap: spacing.md }]}>
        <Button
          label="Inject Mock Session"
          onPress={handleInjectMock}
          loading={busy}
          disabled={busy}
        />
        <Button
          label="Use Stored Credentials"
          onPress={handleUseStoredCredentials}
          disabled={busy || !settings?.qrBypassCredentials}
          variant="secondary"
        />
        <Button
          label={bypassEnabled ? 'Disable Developer Bypass' : 'Back'}
          onPress={bypassEnabled ? handleDisableBypass : () => navigation.goBack()}
          variant="ghost"
        />
      </View>

      <View style={[styles.fullWidth, { marginTop: spacing.xl }]}>
        <Text
          style={{
            color: colors.textSecondary,
            fontFamily: typography.fontFamilies.sans.regular,
            fontSize: typography.fontSizes.sm,
            marginBottom: spacing.sm,
          }}
        >
          Bypass status: {bypassEnabled ? 'Enabled' : 'Disabled'}
        </Text>
        {settings?.qrBypassCredentials ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: spacing.sm,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
            }}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontFamily: typography.fontFamilies.sans.medium,
                fontSize: typography.fontSizes.sm,
              }}
            >
              Stored user: {settings.qrBypassCredentials.userId}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontFamily: typography.fontFamilies.sans.regular,
                fontSize: typography.fontSizes.sm,
                marginTop: spacing.xs,
              }}
            >
              Instance: {settings.qrBypassCredentials.instanceUrl}
            </Text>
          </View>
        ) : (
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.fontFamilies.sans.regular,
              fontSize: typography.fontSizes.sm,
            }}
          >
            No credentials stored yet.
          </Text>
        )}
      </View>

      {message ? (
        <View style={[styles.message, { backgroundColor: colors.surface }]}>
          <Text
            style={{
              color: colors.textPrimary,
              fontFamily: typography.fontFamilies.sans.medium,
              fontSize: typography.fontSizes.sm,
            }}
          >
            {message}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  fullWidth: {
    width: '100%',
  },
  message: {
    alignSelf: 'center',
    borderRadius: 12,
    bottom: 24,
    opacity: 0.95,
    paddingHorizontal: 16,
    paddingVertical: 10,
    position: 'absolute',
  },
});
