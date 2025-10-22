import type { Dispatch, SetStateAction } from 'react';

export type AsyncStorageEngine = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  multiGet?: (keys: readonly string[]) => Promise<[string, string | null][]>;
  multiSet?: (entries: [string, string][]) => Promise<void>;
};

const isAsyncStorageEngine = (candidate: unknown): candidate is AsyncStorageEngine => {
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }
  const objectCandidate = candidate as Partial<AsyncStorageEngine>;
  return (
    typeof objectCandidate.getItem === 'function' &&
    typeof objectCandidate.setItem === 'function' &&
    typeof objectCandidate.removeItem === 'function' &&
    typeof objectCandidate.clear === 'function'
  );
};

const resolveNativeAsyncStorage = (): AsyncStorageEngine | undefined => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const required = require('@react-native-async-storage/async-storage') as unknown;
    if (isAsyncStorageEngine(required)) {
      return required;
    }
    if (
      required &&
      typeof required === 'object' &&
      isAsyncStorageEngine((required as { default?: unknown }).default)
    ) {
      return (required as { default?: unknown }).default as AsyncStorageEngine;
    }
  } catch {
    // fall through to memory engine
  }
  return undefined;
};

const memoryStore = new Map<string, string>();

const memoryEngine: AsyncStorageEngine = {
  async getItem(key) {
    return memoryStore.has(key) ? memoryStore.get(key)! : null;
  },
  async setItem(key, value) {
    memoryStore.set(key, value);
  },
  async removeItem(key) {
    memoryStore.delete(key);
  },
  async clear() {
    memoryStore.clear();
  },
  async multiGet(keys) {
    return keys.map((key) => [key, memoryStore.get(key) ?? null]);
  },
  async multiSet(entries) {
    entries.forEach(([key, value]) => memoryStore.set(key, value));
  },
};

const engine: AsyncStorageEngine = resolveNativeAsyncStorage() ?? memoryEngine;

export const asyncStorage = {
  engine,
  async getString(key: string) {
    return engine.getItem(key);
  },
  async setString(key: string, value: string) {
    await engine.setItem(key, value);
  },
  async getJSON<T>(key: string): Promise<T | null> {
    const value = await engine.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      return null;
    }
  },
  async setJSON(key: string, value: unknown) {
    await engine.setItem(key, JSON.stringify(value));
  },
  async remove(key: string) {
    await engine.removeItem(key);
  },
  async clear() {
    await engine.clear();
  },
  async multiGet(keys: readonly string[]) {
    if (engine.multiGet) {
      return engine.multiGet(keys);
    }
    const pairs: [string, string | null][] = [];
    for (const key of keys) {
      // eslint-disable-next-line no-await-in-loop
      pairs.push([key, await engine.getItem(key)]);
    }
    return pairs;
  },
  async multiSet(entries: [string, string][]) {
    if (engine.multiSet) {
      await engine.multiSet(entries);
      return;
    }
    for (const [key, value] of entries) {
      // eslint-disable-next-line no-await-in-loop
      await engine.setItem(key, value);
    }
  },
  bindToState<T>(key: string, setter: Dispatch<SetStateAction<T>>, fallback: T) {
    asyncStorage.getJSON<T>(key).then((value) => {
      if (value !== null) {
        setter(value);
      } else {
        setter(fallback);
      }
    });

    return async (value: T) => {
      setter(value);
      await asyncStorage.setJSON(key, value);
    };
  },
};

export type AsyncStorageClient = typeof asyncStorage;
