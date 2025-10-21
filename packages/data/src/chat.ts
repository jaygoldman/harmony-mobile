import rawChatSeeds from '../seeds/chatSamples.json';
import { ChatMessage, ChatSessionSummary, HarmonyAgentRole } from './types';
import { deterministicId, freezeDeep } from './utils';

const BASE_SESSION_ID = 'session-harmony-main';

type ChatSeed = {
  role: HarmonyAgentRole;
  content: string;
};

const chatSeeds = rawChatSeeds as ChatSeed[];

const seededMessages: ChatMessage[] = chatSeeds.map((seed, index) => ({
  id: deterministicId('msg', 'harmony', index),
  sessionId: BASE_SESSION_ID,
  role: seed.role,
  content: seed.content,
  timestamp: new Date(Date.UTC(2025, 0, 21, 12, index * 5)).toISOString(),
}));

const seededSession: ChatSessionSummary = {
  id: BASE_SESSION_ID,
  title: 'Weekly Insights',
  lastMessageAt: seededMessages[seededMessages.length - 1]?.timestamp ?? new Date().toISOString(),
  unreadCount: 0,
  isFavorite: true,
};

freezeDeep(seededMessages);
freezeDeep(seededSession);

export type ChatStoreState = {
  sessions: ChatSessionSummary[];
  messages: Record<string, ChatMessage[]>;
};

type ChatStore = {
  listSessions(): Promise<ChatSessionSummary[]>;
  getSession(id: string): Promise<ChatSessionSummary | undefined>;
  listMessages(sessionId: string): Promise<ChatMessage[]>;
  appendMessage(
    sessionId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp' | 'sessionId'>
  ): Promise<ChatMessage>;
  reset(): void;
};

export const createChatStore = (): ChatStore => {
  const initialState: ChatStoreState = {
    sessions: [seededSession],
    messages: {
      [BASE_SESSION_ID]: [...seededMessages],
    },
  };

  let state: ChatStoreState = {
    sessions: [...initialState.sessions],
    messages: { ...initialState.messages },
  };

  const emitDelay = (value: unknown) =>
    new Promise((resolve) => setTimeout(() => resolve(value), 100));

  return {
    async listSessions(): Promise<ChatSessionSummary[]> {
      return emitDelay(state.sessions.map((session) => ({ ...session }))) as Promise<
        ChatSessionSummary[]
      >;
    },
    async getSession(id: string): Promise<ChatSessionSummary | undefined> {
      return emitDelay(state.sessions.find((session) => session.id === id)) as Promise<
        ChatSessionSummary | undefined
      >;
    },
    async listMessages(sessionId: string): Promise<ChatMessage[]> {
      const messages = state.messages[sessionId] ?? [];
      return emitDelay(messages.map((message) => ({ ...message }))) as Promise<ChatMessage[]>;
    },
    async appendMessage(
      sessionId: string,
      message: Omit<ChatMessage, 'id' | 'timestamp' | 'sessionId'>
    ): Promise<ChatMessage> {
      const nextIndex = state.messages[sessionId]?.length ?? 0;
      const entry = {
        id: deterministicId('msg', `${sessionId}-${nextIndex}`, nextIndex + 1),
        sessionId,
        role: message.role,
        content: message.content,
        mentions: message.mentions,
        timestamp: new Date(Date.UTC(2025, 0, 21, 15, nextIndex * 3)).toISOString(),
      } satisfies ChatMessage;

      if (!state.messages[sessionId]) {
        state.messages[sessionId] = [];
        state.sessions.push({
          id: sessionId,
          title: 'Untitled Session',
          lastMessageAt: entry.timestamp,
          unreadCount: 0,
          isFavorite: false,
        });
      }

      state.messages[sessionId] = [...state.messages[sessionId], entry];
      state.sessions = state.sessions.map((session) =>
        session.id === sessionId ? { ...session, lastMessageAt: entry.timestamp } : session
      );

      return emitDelay(entry) as Promise<ChatMessage>;
    },
    reset(): void {
      state = {
        sessions: [...initialState.sessions],
        messages: { ...initialState.messages },
      };
    },
  };
};
