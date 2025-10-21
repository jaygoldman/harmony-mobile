import { createActivityProvider } from './activity';
import { createChatStore } from './chat';
import { createKpiProvider } from './kpis';
import { createPodcastProvider } from './podcasts';
import { createTaskProvider } from './tasks';
import { HarmonyDataClient } from './types';

export const createHarmonyDataClient = (): HarmonyDataClient => {
  const chatStore = createChatStore();
  const activity = createActivityProvider();
  const kpis = createKpiProvider();
  const tasks = createTaskProvider();
  const podcasts = createPodcastProvider();

  return {
    chat: {
      sessions: {
        list: () => chatStore.listSessions(),
        getById: (id) => chatStore.getSession(id),
        reset: () => chatStore.reset(),
      },
      messages: (sessionId) => chatStore.listMessages(sessionId),
      appendMessage: (sessionId, message) => chatStore.appendMessage(sessionId, message),
    },
    activity: {
      list: () => activity.list(),
      getById: (id) => activity.getById(id),
      reset: () => activity.reset(),
    },
    kpis: {
      list: () => kpis.list(),
      getById: (id) => kpis.getById(id),
      reset: () => kpis.reset(),
    },
    tasks: {
      list: () => tasks.list(),
      getById: (id) => tasks.getById(id),
      reset: () => tasks.reset(),
    },
    podcasts: {
      list: () => podcasts.list(),
      getById: (id) => podcasts.getById(id),
      reset: () => podcasts.reset(),
    },
    resetAll() {
      chatStore.reset();
      activity.reset();
      kpis.reset();
      tasks.reset();
      podcasts.reset();
    },
  };
};

export {
  createChatStore,
  createActivityProvider,
  createKpiProvider,
  createTaskProvider,
  createPodcastProvider,
};
