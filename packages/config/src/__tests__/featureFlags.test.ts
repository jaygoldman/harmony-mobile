import { createFeatureFlagClient } from '../featureFlags';

describe('feature flags', () => {
  it('returns defaults when no overrides are set', async () => {
    const client = createFeatureFlagClient();
    const flags = await client.list();
    expect(flags.every((flag) => flag.value === flag.defaultValue)).toBe(true);
  });

  it('allows overriding a flag', async () => {
    const client = createFeatureFlagClient();
    await client.setOverride('enableDeveloperMenu', true);
    expect(await client.get('enableDeveloperMenu')).toBe(true);
  });
});
