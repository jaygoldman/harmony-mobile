import { asyncStorage, secureStorage } from '@harmony/utils';
import { FeatureFlagClient, FeatureFlagOverrides, createFeatureFlagClient } from './featureFlags';

export interface DeveloperCredentials {
  authToken: string;
  instanceUrl: string;
  userId: string;
  workspaceId: string;
}

export interface DeveloperSettings {
  enableMockLatency: boolean;
  mockLatencyMs: number;
  enableNetworkLogging: boolean;
  featureOverrides: FeatureFlagOverrides;
  qrBypassEnabled: boolean;
  qrBypassCredentials?: DeveloperCredentials | null;
}

const DEFAULT_SETTINGS: DeveloperSettings = {
  enableMockLatency: false,
  mockLatencyMs: 120,
  enableNetworkLogging: false,
  featureOverrides: {},
  qrBypassEnabled: false,
  qrBypassCredentials: null,
};

const DEV_SETTINGS_KEY = '@harmony/dev-settings';
const DEV_CREDENTIALS_KEY = 'harmony-dev-credentials';

type Listener = (settings: DeveloperSettings) => void;

export const createDeveloperSettingsStore = (
  featureFlags: FeatureFlagClient = createFeatureFlagClient()
) => {
  let settings: DeveloperSettings = { ...DEFAULT_SETTINGS };
  let loaded = false;
  const listeners = new Set<Listener>();

  const applyFeatureOverrides = async (overrides: FeatureFlagOverrides) => {
    const entries = Object.entries(overrides) as [keyof FeatureFlagOverrides, boolean][];
    await Promise.all(
      entries.map(([key, value]) =>
        typeof value === 'boolean' ? featureFlags.setOverride(key, value) : Promise.resolve()
      )
    );
  };

  const ensureLoaded = async () => {
    if (loaded) return;
    const persisted = await asyncStorage.getJSON<DeveloperSettings>(DEV_SETTINGS_KEY);
    const persistedCredentials = await secureStorage.get(DEV_CREDENTIALS_KEY);
    settings = {
      ...DEFAULT_SETTINGS,
      ...(persisted ?? {}),
      qrBypassCredentials: persistedCredentials
        ? (JSON.parse(persistedCredentials) as DeveloperCredentials)
        : null,
    };
    await applyFeatureOverrides(settings.featureOverrides ?? {});
    loaded = true;
  };

  const notify = () => listeners.forEach((listener) => listener({ ...settings }));

  const persist = async () => {
    const { qrBypassCredentials, ...rest } = settings;
    await asyncStorage.setJSON(DEV_SETTINGS_KEY, rest);
    if (qrBypassCredentials) {
      await secureStorage.set(DEV_CREDENTIALS_KEY, JSON.stringify(qrBypassCredentials));
    } else {
      await secureStorage.remove(DEV_CREDENTIALS_KEY);
    }
    notify();
  };

  return {
    async getSettings(): Promise<DeveloperSettings> {
      await ensureLoaded();
      return { ...settings };
    },
    async update(partial: Partial<DeveloperSettings>) {
      await ensureLoaded();
      const next: DeveloperSettings = {
        ...settings,
        ...partial,
        featureOverrides: {
          ...settings.featureOverrides,
          ...(partial.featureOverrides ?? {}),
        },
      };

      settings = next;
      if (partial.featureOverrides) {
        await applyFeatureOverrides(partial.featureOverrides);
      }

      await persist();
      return { ...settings };
    },
    async setQrBypassCredentials(credentials: DeveloperCredentials | null) {
      await ensureLoaded();
      settings = { ...settings, qrBypassCredentials: credentials, qrBypassEnabled: !!credentials };
      await persist();
    },
    async clear() {
      settings = { ...DEFAULT_SETTINGS };
      await featureFlags.resetAll();
      await asyncStorage.remove(DEV_SETTINGS_KEY);
      await secureStorage.remove(DEV_CREDENTIALS_KEY);
      notify();
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

export type DeveloperSettingsStore = ReturnType<typeof createDeveloperSettingsStore>;
