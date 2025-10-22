export type ConnectionCodePayload = {
  code: string;
  apiUrl: string;
};

export type SessionDetails = {
  token: string;
  apiUrl: string;
  username: string;
  displayName: string;
  email: string;
};

export type SessionStatus = 'unknown' | 'disconnected' | 'connecting' | 'connected' | 'error';

export type SessionState = {
  status: SessionStatus;
  details?: SessionDetails;
  error?: string;
};

export type ConnectRequest = ConnectionCodePayload & {
  timeoutMs?: number;
};

export type ConnectResponse = {
  token: string;
  username: string;
  displayName: string;
  email: string;
};

export type SessionStoreListener = (state: SessionState) => void;
