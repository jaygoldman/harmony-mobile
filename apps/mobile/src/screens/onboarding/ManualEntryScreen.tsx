import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@harmony/theme';
import { useSession } from '../../state/SessionProvider';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import type { OnboardingStackParamList } from './navigationTypes';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ManualEntry'>;

const formatCode = (value: string) => value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

const extractSiteFromUrl = (value: string) => {
  const raw = value.trim();
  if (!raw) return '';
  try {
    const url = /^https?:\/\//i.test(raw) ? new URL(raw) : new URL(`https://${raw}`);
    const host = url.hostname.toLowerCase();
    if (host.endsWith('.senseilabs.com')) {
      return host.replace(/\.senseilabs\.com$/i, '');
    }
    return host.replace(/\/.*$/, '');
  } catch {
    return raw
      .toLowerCase()
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .replace(/\.senseilabs\.com$/i, '');
  }
};

const buildApiUrl = (value: string) => {
  const raw = value.trim();
  if (!raw) return '';

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  const cleaned = raw
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/\s+/g, '');

  if (!cleaned) {
    return '';
  }

  if (cleaned.endsWith('.senseilabs.com')) {
    return `https://${cleaned}`;
  }

  return `https://${cleaned}.senseilabs.com`;
};

export const ManualEntryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, spacing, typography } = useTheme();
  const { state, connect, clearErrors } = useSession();
  const [code, setCode] = useState(route.params?.code ? formatCode(route.params.code) : '');
  const [site, setSite] = useState(
    route.params?.apiUrl ? extractSiteFromUrl(route.params.apiUrl) : ''
  );
  const [codeError, setCodeError] = useState<string | undefined>();
  const [siteError, setSiteError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (state.status === 'error' && state.error) {
      setSubmitError(state.error);
    } else if (state.status !== 'error') {
      setSubmitError(null);
    }
  }, [state]);

  useEffect(() => {
    return () => {
      clearErrors().catch(() => {
        // ignore
      });
    };
  }, [clearErrors]);

  const validate = (): string | null => {
    let hasError = false;
    if (code.length !== 8) {
      setCodeError('Enter the 8-character code shown on your desktop.');
      hasError = true;
    } else {
      setCodeError(undefined);
    }

    const resolvedUrl = buildApiUrl(site);
    if (!resolvedUrl) {
      setSiteError('Enter the Conductor site from the pairing screen.');
      hasError = true;
    } else {
      try {
        // eslint-disable-next-line no-new
        new URL(resolvedUrl);
        setSiteError(undefined);
      } catch {
        setSiteError('That Conductor site does not look right.');
        hasError = true;
      }
    }
    return hasError ? null : resolvedUrl;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    const resolvedUrl = validate();
    if (!resolvedUrl) {
      return;
    }
    setIsSubmitting(true);
    try {
      await connect({ code: code.trim(), apiUrl: resolvedUrl });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to connect right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.content,
          {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
          },
        ]}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontFamily: typography.fontFamilies.sans.medium,
            fontSize: typography.fontSizes.lg,
            marginBottom: spacing.xs,
          }}
        >
          Enter your connection code
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontFamily: typography.fontFamilies.sans.regular,
            fontSize: typography.fontSizes.md,
            marginBottom: spacing.xl,
          }}
        >
          The Harmony desktop app shows both the code and the Conductor site (the subdomain before
          .senseilabs.com). Codes expire after 10 minutes.
        </Text>

        <TextField
          label="Connection Code"
          value={code}
          onChangeText={(text) => setCode(formatCode(text))}
          autoCapitalize="characters"
          autoCorrect={false}
          keyboardType="ascii-capable"
          maxLength={8}
          autoFocus
          errorText={codeError}
          returnKeyType="next"
          textContentType="oneTimeCode"
        />

        <TextField
          label="Conductor site"
          value={site}
          onChangeText={(text) => setSite(text.replace(/\s+/g, '').toLowerCase())}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          helperText="Enter the subdomain shown on desktop, e.g. acme for acme.senseilabs.com."
          errorText={siteError}
          returnKeyType="done"
        />

        {submitError ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: spacing.sm,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              marginBottom: spacing.md,
            }}
          >
            <Text
              style={{
                color: colors.danger,
                fontFamily: typography.fontFamilies.sans.medium,
                fontSize: typography.fontSizes.sm,
              }}
            >
              {submitError}
            </Text>
          </View>
        ) : null}

        <Button
          label="Connect"
          onPress={handleSubmit}
          loading={isSubmitting || state.status === 'connecting'}
          disabled={isSubmitting}
        />

        <Button
          label="Back"
          onPress={() => navigation.goBack()}
          variant="ghost"
          style={{ marginTop: spacing.md }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    width: '100%',
  },
});
