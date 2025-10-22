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

const ZERO_WIDTH_CHARS = /\u200B|\u200C|\u200D|\u200E|\u200F|\uFEFF/g;
const sanitiseUrlInput = (value: string) => value.replace(ZERO_WIDTH_CHARS, '').trim();

type ParsedHttpUrl = {
  protocol: 'http' | 'https';
  host: string;
  path: string;
};

const parseHttpUrl = (value: string): ParsedHttpUrl | null => {
  const match = value.match(/^(https?):\/\/([^/?#]+)(.*)$/i);
  if (!match) {
    return null;
  }
  const protocol = match[1].toLowerCase() as ParsedHttpUrl['protocol'];
  if (protocol !== 'http' && protocol !== 'https') {
    return null;
  }
  const host = match[2].trim();
  if (!host) {
    return null;
  }
  const path = match[3] ?? '';
  return {
    protocol,
    host,
    path,
  };
};

const isValidConnectionPayload = (payload: ConnectionCodePayload) => {
  const code = payload.code?.trim();
  const apiUrl = payload.apiUrl ? sanitiseUrlInput(payload.apiUrl) : '';
  if (!code) {
    return false;
  }
  if (!apiUrl) {
    return false;
  }
  const parsed = parseHttpUrl(apiUrl);
  if (!parsed) {
    return false;
  }
  if (parsed.protocol !== 'http' && parsed.protocol !== 'https') {
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

const sanitiseJsonString = (value: string) =>
  value
    .replace(/^\uFEFF/, '')
    .replace(/^while\s*\(1\);\s*/i, '')
    .replace(/^\)\]\}',?\s*/, '')
    .trim();

const normaliseApiUrl = (value: string) => {
  const sanitised = sanitiseUrlInput(value);
  const parsed = parseHttpUrl(sanitised);
  if (!parsed) {
    throw new Error(`Unable to normalise API URL: ${value}`);
  }
  const protocol = 'https';
  const base = `${protocol}://${parsed.host}`;
  const path = parsed.path.replace(/\/$/, '');
  return path ? `${base}${path}` : base;
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
  const displayName = response.displayName ?? (response as { name?: string }).name;
  const { token, username, email } = response;
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
      const rawCode = request.code ?? '';
      const rawApiUrl = request.apiUrl ?? '';
      const trimmedCode = rawCode.trim();
      const sanitisedApiUrl = sanitiseUrlInput(rawApiUrl);

      if (!isValidConnectionPayload({ code: trimmedCode, apiUrl: sanitisedApiUrl })) {
        throw new Error('Please provide a valid code and API URL.');
      }

      const payload = {
        code: trimmedCode,
        apiUrl: normaliseApiUrl(sanitisedApiUrl),
      };

      setState({ status: 'connecting' });

      try {
        const controller =
          typeof AbortController !== 'undefined' ? new AbortController() : undefined;
        const timeoutMs = request.timeoutMs ?? 10000;
        const connectUrl = `${payload.apiUrl}/api/mobile/connect`;
        const response = await withTimeout(
          fetchImpl(connectUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: payload.code }),
            signal: controller?.signal,
          }),
          timeoutMs
        );

        const rawBody = await response.text();
        const sanitisedBody = sanitiseJsonString(rawBody);
        let parsedBody: unknown = null;

        if (sanitisedBody) {
          try {
            parsedBody = JSON.parse(sanitisedBody);
          } catch (parseError) {
            if (response.ok) {
              throw new Error('Received invalid response while connecting. Please try again.');
            }
          }
        }

        console.log('[session] API response', {
          status: response.status,
          ok: response.ok,
          body: parsedBody ?? sanitisedBody ?? null,
        });

        if (!response.ok) {
          throw createResponseError(response.status, parsedBody);
        }

        if (typeof parsedBody !== 'object' || parsedBody === null) {
          throw new Error('Received invalid response while connecting. Please try again.');
        }

        const json = parsedBody as ConnectResponse;
        if ('success' in json && json.success === true) {
          // allow API responses that include a success flag alongside the credential fields
        } else if (
          !('token' in json && 'username' in json && 'displayName' in json && 'email' in json)
        ) {
          throw new Error('Received invalid response while connecting. Please try again.');
        }

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
