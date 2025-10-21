import { asyncStorage, secureStorage } from '../index';

describe('storage utilities', () => {
  it('stores and retrieves JSON payloads via asyncStorage', async () => {
    await asyncStorage.setJSON('test:key', { value: 42 });
    expect(await asyncStorage.getJSON<{ value: number }>('test:key')).toEqual({ value: 42 });
  });

  it('stores and retrieves secure values', async () => {
    await secureStorage.set('secure:key', 'secret');
    expect(await secureStorage.get('secure:key')).toBe('secret');
    await secureStorage.remove('secure:key');
    expect(await secureStorage.get('secure:key')).toBeNull();
  });
});
