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

export const ManualEntryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, spacing, typography } = useTheme();
  const { state, connect, clearErrors } = useSession();
  const [code, setCode] = useState(route.params?.code ? formatCode(route.params.code) : '');
  const [apiUrl, setApiUrl] = useState(route.params?.apiUrl ?? '');
  const [codeError, setCodeError] = useState<string | undefined>();
  const [apiError, setApiError] = useState<string | undefined>();
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

  const validate = () => {
    let hasError = false;
    if (code.length !== 8) {
      setCodeError('Enter the 8-character code shown on your desktop.');
      hasError = true;
    } else {
      setCodeError(undefined);
    }

    if (!apiUrl.trim()) {
      setApiError('Enter the API URL from the pairing screen.');
      hasError = true;
    } else {
      try {
        // eslint-disable-next-line no-new
        new URL(apiUrl.trim());
        setApiError(undefined);
      } catch {
        setApiError('That does not look like a valid URL.');
        hasError = true;
      }
    }
    return !hasError;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!validate()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await connect({ code: code.trim(), apiUrl: apiUrl.trim() });
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
          The Harmony desktop app shows both the code and the API URL. Codes expire after 15
          minutes.
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
          label="API URL"
          value={apiUrl}
          onChangeText={(text) => setApiUrl(text.trimStart())}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          errorText={apiError}
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
