import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ConnectRequest, SessionDetails, SessionState, createSessionStore } from '@harmony/session';

type SessionContextValue = {
  state: SessionState;
  connect: (request: ConnectRequest) => Promise<SessionDetails>;
  disconnect: () => Promise<void>;
  applyDeveloperBypass: (details: SessionDetails) => Promise<void>;
  clearErrors: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

const store = createSessionStore();

type SessionProviderProps = {
  children: React.ReactNode;
};

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [state, setState] = useState<SessionState>(store.getState());

  useEffect(() => {
    let isMounted = true;
    store.initialise().catch(() => {
      // errors are surfaced through state updates
    });
    const unsubscribe = store.subscribe((next) => {
      if (isMounted) {
        setState(next);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      state,
      connect: (request) => store.connect(request),
      disconnect: () => store.disconnect(),
      applyDeveloperBypass: (details) => store.applyDeveloperBypass(details),
      clearErrors: () => store.clearErrors(),
    }),
    [state]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
