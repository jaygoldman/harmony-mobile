type KeychainAccessible = string | undefined;

type KeychainModule = {
  setGenericPassword: (
    username: string,
    password: string,
    options?: {
      service?: string;
      accessible?: KeychainAccessible;
      accessGroup?: string;
    }
  ) => Promise<void>;
  getGenericPassword: (options: { service?: string }) => Promise<
    | {
        username: string;
        password: string;
      }
    | false
  >;
  resetGenericPassword: (options: { service?: string }) => Promise<void>;
};

let KeychainModule: KeychainModule | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const required = require('react-native-keychain') as unknown;
  const isKeychainModule = (candidate: unknown): candidate is KeychainModule => {
    if (!candidate || typeof candidate !== 'object') {
      return false;
    }
    const moduleCandidate = candidate as Partial<KeychainModule>;
    return (
      typeof moduleCandidate.setGenericPassword === 'function' &&
      typeof moduleCandidate.getGenericPassword === 'function' &&
      typeof moduleCandidate.resetGenericPassword === 'function'
    );
  };

  if (isKeychainModule(required)) {
    KeychainModule = required;
  } else if (
    required &&
    typeof required === 'object' &&
    isKeychainModule((required as { default?: unknown }).default)
  ) {
    KeychainModule = (required as { default?: unknown }).default as KeychainModule;
  } else {
    KeychainModule = undefined;
  }
} catch (error) {
  KeychainModule = undefined;
}

export type SecureStorageOptions = {
  service?: string;
  accessible?: KeychainAccessible;
  accessGroup?: string;
};

const memorySecureStore = new Map<string, string>();

const resolveService = (key: string, options?: SecureStorageOptions) =>
  options?.service ?? `harmony.${key}`;

export const secureStorage = {
  async set(key: string, value: string, options?: SecureStorageOptions) {
    if (KeychainModule) {
      await KeychainModule.setGenericPassword(key, value, {
        service: resolveService(key, options),
        accessible: options?.accessible,
        accessGroup: options?.accessGroup,
      });
      return;
    }
    memorySecureStore.set(resolveService(key, options), value);
  },
  async get(key: string, options?: SecureStorageOptions) {
    if (KeychainModule) {
      const credentials = await KeychainModule.getGenericPassword({
        service: resolveService(key, options),
      });
      if (!credentials) return null;
      return credentials.password;
    }
    return memorySecureStore.get(resolveService(key, options)) ?? null;
  },
  async remove(key: string, options?: SecureStorageOptions) {
    if (KeychainModule) {
      await KeychainModule.resetGenericPassword({ service: resolveService(key, options) });
      return;
    }
    memorySecureStore.delete(resolveService(key, options));
  },
};

export type SecureStorageClient = typeof secureStorage;
