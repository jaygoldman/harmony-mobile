export const Routes = {
  Harmony: 'Harmony',
  Activity: 'Activity',
  KPIs: 'KPIs',
  Tasks: 'Tasks',
  Podcasts: 'Podcasts',
  Settings: 'Settings'
} as const;
export type RouteKey = keyof typeof Routes;