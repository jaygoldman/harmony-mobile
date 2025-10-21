import { asyncStorage } from '@harmony/utils';

export type FeatureFlagKey =
  | 'enableDeveloperMenu'
  | 'enableQrBypass'
  | 'enableHarmonyVoiceMode'
  | 'enableOfflinePodcasts'
  | 'enableWidgetPreviews';

export interface FeatureFlagMetadata {
  key: FeatureFlagKey;
  defaultValue: boolean;
  value: boolean;
  isOverridden: boolean;
}

export type FeatureFlagOverrides = Partial<Record<FeatureFlagKey, boolean>>;

const FEATURE_FLAG_STORAGE_KEY = '@harmony/feature-flags';

const defaultFlags: Record<FeatureFlagKey, boolean> = {
  enableDeveloperMenu: false,
  enableQrBypass: true,
  enableHarmonyVoiceMode: false,
  enableOfflinePodcasts: true,
  enableWidgetPreviews: false,
};

const computeMetadata = (overrides: FeatureFlagOverrides): FeatureFlagMetadata[] =>
  (Object.keys(defaultFlags) as FeatureFlagKey[]).map((key) => {
    const defaultValue = defaultFlags[key];
    const override = overrides[key];
    const isOverridden = typeof override === 'boolean';
    return {
      key,
      defaultValue,
      value: isOverridden ? override! : defaultValue,
      isOverridden,
    } satisfies FeatureFlagMetadata;
  });

export const createFeatureFlagClient = () => {
  let overrides: FeatureFlagOverrides = {};
  let loaded = false;
  const listeners = new Set<(metadata: FeatureFlagMetadata[]) => void>();

  const notify = () => {
    const metadata = computeMetadata(overrides);
    listeners.forEach((listener) => listener(metadata));
  };

  const ensureLoaded = async () => {
    if (loaded) return;
    overrides = (await asyncStorage.getJSON<FeatureFlagOverrides>(FEATURE_FLAG_STORAGE_KEY)) ?? {};
    loaded = true;
  };

  const persist = async () => {
    await asyncStorage.setJSON(FEATURE_FLAG_STORAGE_KEY, overrides);
    notify();
  };

  return {
    async list(): Promise<FeatureFlagMetadata[]> {
      await ensureLoaded();
      return computeMetadata(overrides);
    },
    async get(key: FeatureFlagKey): Promise<boolean> {
      await ensureLoaded();
      const hasOverride = Object.prototype.hasOwnProperty.call(overrides, key);
      return hasOverride ? Boolean(overrides[key]) : defaultFlags[key];
    },
    async setOverride(key: FeatureFlagKey, value: boolean) {
      await ensureLoaded();
      overrides = { ...overrides, [key]: value };
      await persist();
    },
    async clearOverride(key: FeatureFlagKey) {
      await ensureLoaded();
      const { [key]: _removed, ...rest } = overrides;
      overrides = rest;
      await persist();
    },
    async resetAll() {
      overrides = {};
      await persist();
    },
    subscribe(listener: (metadata: FeatureFlagMetadata[]) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getDefaults(): Record<FeatureFlagKey, boolean> {
      return { ...defaultFlags };
    },
  };
};

export type FeatureFlagClient = ReturnType<typeof createFeatureFlagClient>;
