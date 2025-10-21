export type HarmonyAgentRole = 'harmony' | 'user' | 'agent' | 'system';

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: HarmonyAgentRole;
  content: string;
  timestamp: string;
  mentions?: string[];
}

export interface ChatSessionSummary {
  id: string;
  title: string;
  lastMessageAt: string;
  unreadCount: number;
  isFavorite: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'task' | 'risk' | 'podcast' | 'announcement' | 'kpi';
  platform: 'conductor' | 'harmony' | 'teams' | 'email';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  action?: {
    label: string;
    route: string;
  };
}

export interface KpiTile {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'flat';
  trendPercentage: number;
  status: 'green' | 'amber' | 'red';
  category?: string;
}

export interface TaskAssignee {
  id: string;
  name: string;
  email: string;
  workspaceId: string;
  preferences: Record<string, unknown>;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'inProgress' | 'blocked' | 'done';
  projectId: string;
  projectName: string;
  assignee: TaskAssignee;
  reminders?: string[];
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  audioUrl: string;
  artworkUrl: string;
  isDownloaded: boolean;
}

export interface DataProvider<T> {
  list(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  reset(): void;
}

export interface HarmonyDataClient {
  chat: {
    sessions: DataProvider<ChatSessionSummary>;
    messages: (sessionId: string) => Promise<ChatMessage[]>;
    appendMessage: (
      sessionId: string,
      message: Omit<ChatMessage, 'id' | 'timestamp' | 'sessionId'>
    ) => Promise<ChatMessage>;
  };
  activity: DataProvider<ActivityItem>;
  kpis: DataProvider<KpiTile>;
  tasks: DataProvider<TaskItem>;
  podcasts: DataProvider<PodcastEpisode>;
  resetAll(): void;
}
