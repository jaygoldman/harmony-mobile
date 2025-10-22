import { asyncStorage, secureStorage } from '@harmony/utils';
import { createDeveloperSettingsStore } from '../devMode';

const DEV_SETTINGS_KEY = '@harmony/dev-settings';
const DEV_CREDENTIALS_KEY = 'harmony-dev-credentials';

beforeEach(async () => {
  await asyncStorage.remove(DEV_SETTINGS_KEY);
  await secureStorage.remove(DEV_CREDENTIALS_KEY);
});

describe('developer settings store', () => {
  it('persists updates and applies feature overrides', async () => {
    const store = createDeveloperSettingsStore();
    const settings = await store.getSettings();
    expect(settings.enableMockLatency).toBe(false);

    await store.update({ enableMockLatency: true, mockLatencyMs: 250 });
    const updated = await store.getSettings();
    expect(updated.enableMockLatency).toBe(true);
    expect(updated.mockLatencyMs).toBe(250);
  });

  it('stores QR bypass credentials securely', async () => {
    const store = createDeveloperSettingsStore();
    await store.setQrBypassCredentials({
      authToken: 'token',
      instanceUrl: 'https://example.com',
      userId: 'user-1',
      workspaceId: 'workspace-1',
    });

    const updated = await store.getSettings();
    expect(updated.qrBypassEnabled).toBe(true);
    expect(updated.qrBypassCredentials?.instanceUrl).toBe('https://example.com');

    await store.setQrBypassCredentials(null);
    const cleared = await store.getSettings();
    expect(cleared.qrBypassCredentials).toBeNull();
  });

  it('handles corrupted stored credentials gracefully', async () => {
    await secureStorage.set(DEV_CREDENTIALS_KEY, 'not-json');

    const store = createDeveloperSettingsStore();
    const settings = await store.getSettings();

    expect(settings.qrBypassEnabled).toBe(false);
    expect(settings.qrBypassCredentials).toBeNull();

    const persistedCredentials = await secureStorage.get(DEV_CREDENTIALS_KEY);
    expect(persistedCredentials).toBeNull();
  });
});
