import { secureStorage, asyncStorage } from '@harmony/utils';
import type {
  ConnectionCodePayload,
  ConnectRequest,
  ConnectResponse,
  SessionDetails,
  SessionState,
  SessionStoreListener,
} from './types';

export type FetchImplementation = typeof fetch;

type SessionStoreDependencies = {
  fetchImpl?: FetchImplementation;
  secureStorageClient?: typeof secureStorage;
  asyncStorageClient?: typeof asyncStorage;
};

const SESSION_STORAGE_KEY = 'harmony/session';
const SESSION_STATE_KEY = '@harmony/session-state';

const createDefaultState = (): SessionState => ({
  status: 'unknown',
});

const isValidConnectionPayload = (payload: ConnectionCodePayload) => {
  if (!payload.code?.trim()) {
    return false;
  }
  if (!payload.apiUrl?.trim()) {
    return false;
  }
  try {
    // eslint-disable-next-line no-new
    new URL(payload.apiUrl);
  } catch {
    return false;
  }
  return true;
};

const createResponseError = (status: number, body: unknown) => {
  const message =
    typeof body === 'object' && body && 'message' in body
      ? String((body as { message: unknown }).message)
      : status === 401
        ? 'Expired or invalid connection code.'
        : 'Unable to connect with the provided code.';
  const error = new Error(message);
  error.name = 'ConnectionError';
  return error;
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs = 10000): Promise<T> => {
  if (!timeoutMs || timeoutMs <= 0) {
    return promise;
  }
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error('Connection timed out. Please try again.');
      error.name = 'ConnectionTimeoutError';
      reject(error);
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

const parseConnectionResponse = (payload: ConnectionCodePayload, response: ConnectResponse) => {
  const { token, username, displayName, email } = response;
  if (!token || !username || !displayName || !email) {
    throw new Error('Received invalid response while connecting. Please try again.');
  }

  const details: SessionDetails = {
    token,
    username,
    displayName,
    email,
    apiUrl: payload.apiUrl,
  };

  return details;
};

export const createSessionStore = ({
  fetchImpl = fetch,
  secureStorageClient = secureStorage,
  asyncStorageClient = asyncStorage,
}: SessionStoreDependencies = {}) => {
  let state: SessionState = createDefaultState();
  let loaded = false;
  const listeners = new Set<SessionStoreListener>();

  const notify = () => {
    const snapshot = { ...state, details: state.details ? { ...state.details } : undefined };
    listeners.forEach((listener) => listener(snapshot));
  };

  const persist = async (details: SessionDetails | null) => {
    if (details) {
      await secureStorageClient.set(SESSION_STORAGE_KEY, JSON.stringify(details));
      await asyncStorageClient.setJSON(SESSION_STATE_KEY, { status: 'connected' });
    } else {
      await secureStorageClient.remove(SESSION_STORAGE_KEY);
      await asyncStorageClient.remove(SESSION_STATE_KEY);
    }
  };

  const load = async () => {
    if (loaded) return;
    loaded = true;
    try {
      const rawDetails = await secureStorageClient.get(SESSION_STORAGE_KEY);
      if (rawDetails) {
        const parsed = JSON.parse(rawDetails) as SessionDetails;
        state = { status: 'connected', details: parsed };
        notify();
        return;
      }
      state = { status: 'disconnected' };
      notify();
    } catch (error) {
      state = { status: 'error', error: error instanceof Error ? error.message : String(error) };
      notify();
    }
  };

  const setState = (next: SessionState) => {
    state = next;
    notify();
  };

  const ensureLoaded = async () => {
    if (!loaded) {
      await load();
    }
  };

  return {
    getState(): SessionState {
      return {
        ...state,
        details: state.details ? { ...state.details } : undefined,
      };
    },
    subscribe(listener: SessionStoreListener) {
      listeners.add(listener);
      if (state.status !== 'unknown') {
        listener(this.getState());
      }
      return () => listeners.delete(listener);
    },
    async initialise() {
      await ensureLoaded();
      return this.getState();
    },
    async connect(request: ConnectRequest) {
      await ensureLoaded();
      if (!isValidConnectionPayload(request)) {
        throw new Error('Please provide a valid code and API URL.');
      }

      const payload = {
        code: request.code.trim(),
        apiUrl: request.apiUrl.trim(),
      };

      setState({ status: 'connecting' });

      try {
        const controller =
          typeof AbortController !== 'undefined' ? new AbortController() : undefined;
        const timeoutMs = request.timeoutMs ?? 10000;
        const response = await withTimeout(
          fetchImpl(`${payload.apiUrl.replace(/\/$/, '')}/api/mobile/connect`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: payload.code }),
            signal: controller?.signal,
          }),
          timeoutMs
        );

        if (!response.ok) {
          let body: unknown = null;
          try {
            body = await response.json();
          } catch {
            // ignore parse errors
          }
          throw createResponseError(response.status, body);
        }

        const json = (await response.json()) as ConnectResponse;
        const details = parseConnectionResponse(payload, json);
        await persist(details);
        setState({ status: 'connected', details });
        return details;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error while connecting.';
        setState({ status: 'error', error: message });
        throw error;
      }
    },
    async applyDeveloperBypass(details: SessionDetails) {
      await ensureLoaded();
      await persist(details);
      setState({ status: 'connected', details });
    },
    async disconnect() {
      await ensureLoaded();
      await persist(null);
      setState({ status: 'disconnected' });
    },
    async clearErrors() {
      if (state.status === 'error') {
        setState({ status: 'disconnected' });
      }
    },
  };
};

export type SessionStore = ReturnType<typeof createSessionStore>;
