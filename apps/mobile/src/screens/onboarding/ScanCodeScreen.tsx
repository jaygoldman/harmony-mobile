import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@harmony/theme';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import type { OnboardingStackParamList } from './navigationTypes';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Scan'>;

type ParsedPayload = {
  code: string;
  apiUrl: string;
};

const parsePayload = (raw: string): ParsedPayload | null => {
  if (!raw.trim()) return null;

  try {
    const json = JSON.parse(raw);
    if (typeof json.code === 'string' && typeof json.apiUrl === 'string') {
      return { code: json.code, apiUrl: json.apiUrl };
    }
  } catch {
    // not JSON, fall back to simple parsing
  }

  const queryPattern = /code=([A-Za-z0-9]{5,})/i;
  const urlPattern = /apiUrl=([^&\s]+)/i;
  const codeMatch = raw.match(queryPattern);
  const urlMatch = raw.match(urlPattern);
  if (codeMatch && urlMatch) {
    return { code: codeMatch[1], apiUrl: decodeURIComponent(urlMatch[1]) };
  }
  return null;
};

export const ScanCodeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, spacing, typography } = useTheme();
  const [payload, setPayload] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSimulateScan = () => {
    const parsed = parsePayload(payload);
    if (!parsed) {
      setError('Unable to parse the payload. Paste the QR result containing the code and apiUrl.');
      return;
    }
    navigation.replace('ManualEntry', parsed);
  };

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
        Scan QR Code
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontFamily: typography.fontFamilies.sans.regular,
          fontSize: typography.fontSizes.md,
          marginBottom: spacing.xl,
        }}
      >
        Camera integration is coming soon. Paste the decoded QR payload below to continue, or use
        manual entry.
      </Text>

      <TextField
        label="QR Payload"
        value={payload}
        onChangeText={(text) => {
          setPayload(text);
          setError(null);
        }}
        multiline
        numberOfLines={4}
        helperText="Accepts JSON like { code, apiUrl } or query strings such as code=ABCD1234&apiUrl=https://..."
        errorText={error ?? undefined}
        style={styles.payloadInput}
      />

      <Button label="Simulate Scan" onPress={handleSimulateScan} />
      <Button
        label="Enter Code Manually"
        onPress={() => navigation.replace('ManualEntry', undefined)}
        variant="ghost"
        style={{ marginTop: spacing.md }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  payloadInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
