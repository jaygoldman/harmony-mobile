import { createDeveloperSettingsStore } from '../devMode';

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
});
