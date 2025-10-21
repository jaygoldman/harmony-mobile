# Developer Mode & Feature Flags

Phase 0 introduces a lightweight developer-mode infrastructure that keeps feature toggles and QR-bypass credentials isolated from production builds.

## Feature Flags

- Implemented via `createFeatureFlagClient` in `@harmony/config`.
- Default flags are stored in-code; overrides persist to `AsyncStorage` under the key `@harmony/feature-flags`.
- Subscribe to updates to refresh UI elements when toggles flip.

```ts
import { createFeatureFlagClient } from '@harmony/config';

const featureFlags = createFeatureFlagClient();
const isDeveloperMenuEnabled = await featureFlags.get('enableDeveloperMenu');
```

## Developer Settings Store

- Located at `createDeveloperSettingsStore` in `@harmony/config`.
- Persists non-sensitive values to `AsyncStorage` and stores QR bypass credentials securely via Keychain.
- Synchronises any feature flag overrides with the global feature flag client so the rest of the app picks them up immediately.

```ts
import { createDeveloperSettingsStore } from '@harmony/config';

const developerSettings = createDeveloperSettingsStore();
await developerSettings.update({ enableMockLatency: true, mockLatencyMs: 300 });
```

## Secure Credential Handling

- The `@harmony/utils` package wraps `@react-native-async-storage/async-storage` and `react-native-keychain` with in-memory fallbacks for testing environments.
- Sensitive tokens (e.g., QR bypass credentials) are stored with the service name `harmony-dev-credentials` so they can be revoked independently of other Keychain entries.

## Next Steps

- Wire a developer settings screen into the navigation stack (Phase 1).
- Surface feature flag toggles within that screen and add analytics breadcrumbs when flags change.
- Extend the store to broadcast events over React Context once the settings UI exists.
