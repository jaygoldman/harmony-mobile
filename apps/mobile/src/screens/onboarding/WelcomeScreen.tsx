import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@harmony/theme';
import { useIsFocused } from '@react-navigation/native';
import { RNCamera, type BarCodeReadEvent } from 'react-native-camera';
import { developerSettingsStore } from '../../state/stores';
import { Button } from '../../components/Button';
import { useSession } from '../../state/SessionProvider';
import type { OnboardingStackParamList } from './navigationTypes';
import { OnboardingBackground } from './OnboardingBackground';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

const TAP_THRESHOLD = 7;

type ParsedPayload = {
  code: string;
  apiUrl: string;
};

type ScannerState = 'scanning' | 'processing' | 'error';

const parseQrPayload = (raw: string): ParsedPayload | null => {
  if (!raw.trim()) {
    return null;
  }

  try {
    const json = JSON.parse(raw);
    if (typeof json.code === 'string' && typeof json.apiUrl === 'string') {
      return { code: json.code, apiUrl: json.apiUrl };
    }
  } catch {
    // ignore json parse errors
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

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { spacing, typography, palette } = useTheme();
  const { state: sessionState, connect, clearErrors } = useSession();
  const [developerUnlocked, setDeveloperUnlocked] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'pending' | 'ready' | 'denied'>('pending');
  const tapCounter = useRef(0);
  const [scannerState, setScannerState] = useState<ScannerState>('scanning');
  const scanLockRef = useRef(false);
  const clearErrorsRef = useRef(clearErrors);

  useEffect(() => {
    clearErrorsRef.current = clearErrors;
  }, [clearErrors]);

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

  useEffect(() => {
    if (sessionState.status === 'error' && sessionState.error) {
      setScannerError(sessionState.error);
      setScannerState('error');
    }
    if (sessionState.status === 'connected') {
      setScannerError(null);
    }
  }, [sessionState]);

  const resetScanner = useCallback(() => {
    setScannerError(null);
    setScannerState('scanning');
    scanLockRef.current = false;
  }, []);

  useEffect(() => {
    if (!isFocused) {
      return;
    }
    resetScanner();
    clearErrorsRef
      .current()
      .catch(() => {
        // ignore clear errors failure
      })
      .finally(() => {
        scanLockRef.current = false;
      });
  }, [isFocused, resetScanner]);

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

  const handleStatusChange = useCallback((event: { cameraStatus: string }) => {
    if (event.cameraStatus === 'READY') {
      setCameraStatus('ready');
    } else if (event.cameraStatus === 'NOT_AUTHORIZED') {
      setCameraStatus('denied');
    } else {
      setCameraStatus('pending');
    }
  }, []);

  const handleTryAgain = useCallback(() => {
    resetScanner();
    clearErrorsRef.current().catch(() => {
      // ignore
    });
  }, [resetScanner]);

  const handleBarcodeRead = useCallback(
    (event: BarCodeReadEvent) => {
      if (!isFocused || scannerState !== 'scanning' || scanLockRef.current) {
        return;
      }
      const payload = parseQrPayload(event.data ?? '');
      if (!payload) {
        setScannerError('That QR code is not recognized. Try again.');
        setScannerState('error');
        return;
      }

      console.log('[onboarding] scanned QR payload', payload);
      scanLockRef.current = true;
      setScannerError(null);
      setScannerState('processing');

      clearErrors()
        .catch(() => {
          // ignore
        })
        .finally(() => {
          connect({ code: payload.code, apiUrl: payload.apiUrl }).catch((error) => {
            setScannerError(
              error instanceof Error
                ? error.message
                : 'Unable to connect with that QR code. Try again.'
            );
            setScannerState('error');
            scanLockRef.current = false;
          });
        });
    },
    [clearErrors, connect, isFocused, scannerState]
  );

  const onSurface = palette.neutral0;
  const mutedOnSurface = 'rgba(255, 255, 255, 0.72)';
  const isCameraActive = scannerState === 'scanning' && isFocused && cameraStatus !== 'denied';
  const themedStyles = useMemo(
    () => ({
      cameraPausedText: {
        color: palette.neutral0,
        fontFamily: typography.fontFamilies.sans.medium,
        fontSize: typography.fontSizes.sm,
        textAlign: 'center' as const,
      },
      connectingText: {
        color: palette.neutral0,
        fontFamily: typography.fontFamilies.sans.medium,
        fontSize: typography.fontSizes.md,
        marginTop: spacing.md,
        textAlign: 'center' as const,
      },
      corner: {
        borderColor: palette.neutral0,
      },
      developerButton: {
        marginTop: spacing.md,
      },
      errorText: {
        color: palette.neutral0,
        fontFamily: typography.fontFamilies.sans.medium,
        fontSize: typography.fontSizes.sm,
        textAlign: 'center' as const,
      },
      footerText: {
        color: mutedOnSurface,
        fontFamily: typography.fontFamilies.sans.regular,
        fontSize: typography.fontSizes.sm,
        textAlign: 'center' as const,
      },
      fullWidth: {
        width: '100%' as const,
      },
      scannerHelperText: {
        color: mutedOnSurface,
        fontFamily: typography.fontFamilies.sans.regular,
        fontSize: typography.fontSizes.sm,
        marginTop: spacing.md,
        textAlign: 'center' as const,
      },
      toast: {
        backgroundColor: palette.neutral0,
      },
      toastText: {
        color: palette.primary,
        fontFamily: typography.fontFamilies.sans.medium,
        fontSize: typography.fontSizes.sm,
      },
      tryAgainButton: {
        alignSelf: 'center' as const,
        marginTop: spacing.lg,
        width: 'auto' as const,
      },
    }),
    [mutedOnSurface, palette, spacing, typography]
  );

  return (
    <View style={styles.container}>
      <OnboardingBackground />
      <View
        style={[
          styles.content,
          {
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.xxl,
            paddingBottom: spacing.xl,
            gap: spacing.xl,
          },
        ]}
      >
        <View>
          <Pressable
            accessibilityRole="header"
            onPress={handleHiddenTap}
            style={[styles.brandLockup, { paddingVertical: spacing.lg }]}
          >
            <Text
              style={{
                color: mutedOnSurface,
                fontFamily: typography.fontFamilies.sans.medium,
                fontSize: typography.fontSizes.sm,
                letterSpacing: typography.letterSpacing.wide,
              }}
            >
              CONDUCTOR
            </Text>
            <Text
              style={{
                color: onSurface,
                fontFamily: typography.fontFamilies.sans.bold,
                fontSize: typography.fontSizes.xxl,
                marginTop: spacing.xs,
              }}
            >
              Welcome
            </Text>
          </Pressable>
          <Text
            style={{
              color: onSurface,
              fontFamily: typography.fontFamilies.sans.medium,
              fontSize: typography.fontSizes.lg,
              marginTop: spacing.lg,
            }}
          >
            👋 Connect your app to Conductor
          </Text>
          <Text
            style={{
              color: mutedOnSurface,
              fontFamily: typography.fontFamilies.sans.regular,
              fontSize: typography.fontSizes.md,
              lineHeight: typography.fontSizes.md * typography.lineHeights.regular,
              marginTop: spacing.sm,
            }}
          >
            {
              'On your desktop, in Conductor, open the user menu in the top-right corner and select "Connect Mobile App". Scan the QR code here.'
            }
          </Text>
        </View>

        <View style={styles.scannerSection}>
          <View
            style={[
              styles.scannerFrame,
              {
                borderColor: mutedOnSurface,
              },
            ]}
          >
            {isCameraActive ? (
              <RNCamera
                style={styles.camera}
                type={RNCamera.Constants.Type.back}
                captureAudio={false}
                onBarCodeRead={handleBarcodeRead}
                barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
                onStatusChange={handleStatusChange}
                androidCameraPermissionOptions={{
                  title: 'Camera Permission',
                  message: 'Conductor needs access to your camera to scan QR codes.',
                  buttonPositive: 'Allow',
                  buttonNegative: 'Cancel',
                }}
              >
                <View style={styles.scannerOverlayCorners}>
                  <View style={[styles.corner, themedStyles.corner, styles.cornerTopLeft]} />
                  <View style={[styles.corner, themedStyles.corner, styles.cornerTopRight]} />
                  <View style={[styles.corner, themedStyles.corner, styles.cornerBottomLeft]} />
                  <View style={[styles.corner, themedStyles.corner, styles.cornerBottomRight]} />
                </View>
              </RNCamera>
            ) : scannerState === 'processing' ? (
              <View style={styles.cameraFallback}>
                <ActivityIndicator color={palette.neutral0} size="large" />
                <Text style={themedStyles.connectingText}>Connecting…</Text>
              </View>
            ) : scannerState === 'error' && cameraStatus !== 'denied' ? (
              <View style={styles.cameraFallback}>
                <Text style={themedStyles.errorText}>
                  {scannerError ??
                    'Unable to connect with that QR code. Try again or enter the code manually.'}
                </Text>
                <Button
                  label="Try Again"
                  onPress={handleTryAgain}
                  style={themedStyles.tryAgainButton}
                  variant="secondary"
                />
              </View>
            ) : (
              <View style={styles.cameraFallback}>
                <Text style={themedStyles.cameraPausedText}>
                  {cameraStatus === 'denied'
                    ? 'Camera access is disabled. Enable it in Settings to scan the QR code.'
                    : 'Camera paused. Return to this screen to resume scanning.'}
                </Text>
              </View>
            )}
          </View>
          <Text style={themedStyles.scannerHelperText}>
            Position the QR code from your desktop within the square to connect automatically.
          </Text>
        </View>

        <View style={themedStyles.fullWidth}>
          <Button
            label="Enter manual code"
            onPress={() => navigation.navigate('ManualEntry')}
            variant="primary"
          />
          {developerUnlocked ? (
            <Button
              label="Developer Options"
              onPress={() => navigation.navigate('DeveloperTools')}
              variant="ghost"
              style={themedStyles.developerButton}
            />
          ) : null}
        </View>

        <Text style={themedStyles.footerText}>
          Codes expire after 10 minutes. Request a new one from the Harmony desktop app if needed.
        </Text>
      </View>

      {notification ? (
        <View style={[styles.toast, themedStyles.toast]}>
          <Text style={themedStyles.toastText}>{notification}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  brandLockup: {
    alignSelf: 'flex-start',
  },
  camera: {
    flex: 1,
  },
  cameraFallback: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  corner: {
    borderRadius: 8,
    height: 32,
    position: 'absolute',
    width: 32,
  },
  cornerBottomLeft: {
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    bottom: 24,
    left: 24,
  },
  cornerBottomRight: {
    borderBottomWidth: 4,
    borderRightWidth: 4,
    bottom: 24,
    right: 24,
  },
  cornerTopLeft: {
    borderLeftWidth: 4,
    borderTopWidth: 4,
    left: 24,
    top: 24,
  },
  cornerTopRight: {
    borderRightWidth: 4,
    borderTopWidth: 4,
    right: 24,
    top: 24,
  },
  scannerFrame: {
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    maxWidth: 280,
    overflow: 'hidden',
    width: '100%',
  },
  scannerOverlayCorners: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  scannerSection: {
    alignItems: 'center',
    width: '100%',
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
