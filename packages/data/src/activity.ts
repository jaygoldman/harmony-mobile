import rawActivitySeeds from '../seeds/activity.json';
import { ActivityItem } from './types';
import { freezeDeep } from './utils';

type ActivitySeed = Omit<ActivityItem, 'action'> & { action?: ActivityItem['action'] };

const activitySeeds = rawActivitySeeds as ActivitySeed[];

const seededActivity: ActivityItem[] = activitySeeds.map((item) => ({
  ...item,
  action: item.action ?? undefined,
}));

freezeDeep(seededActivity);

export const createActivityProvider = () => {
  const initial = [...seededActivity];
  let items: ActivityItem[] = [...initial];

  const emitDelay = (value: unknown) =>
    new Promise((resolve) => setTimeout(() => resolve(value), 80));

  return {
    async list(): Promise<ActivityItem[]> {
      return emitDelay(items.map((item) => ({ ...item }))) as Promise<ActivityItem[]>;
    },
    async getById(id: string) {
      return emitDelay(items.find((item) => item.id === id)) as Promise<ActivityItem | undefined>;
    },
    reset() {
      items = [...initial];
    },
  };
};
