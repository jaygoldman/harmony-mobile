import rawTaskSeeds from '../seeds/tasks.json';
import { TaskItem } from './types';
import { deterministicId, freezeDeep } from './utils';

type TaskSeed = Omit<TaskItem, 'reminders'> & { reminders?: TaskItem['reminders'] };

const taskSeeds = rawTaskSeeds as TaskSeed[];

const seededTasks: TaskItem[] = taskSeeds.map((task, index) => ({
  ...task,
  reminders: task.reminders ?? [],
  id: task.id ?? deterministicId('task', 'seed', index),
}));

freezeDeep(seededTasks);

export const createTaskProvider = () => {
  const initial = [...seededTasks];
  let items: TaskItem[] = [...initial];

  const emitDelay = (value: unknown) =>
    new Promise((resolve) => setTimeout(() => resolve(value), 70));

  return {
    async list(): Promise<TaskItem[]> {
      return emitDelay(
        items.map((item) => ({ ...item, reminders: [...(item.reminders ?? [])] }))
      ) as Promise<TaskItem[]>;
    },
    async getById(id: string) {
      return emitDelay(items.find((item) => item.id === id)) as Promise<TaskItem | undefined>;
    },
    async upsert(task: TaskItem) {
      const index = items.findIndex((entry) => entry.id === task.id);
      if (index >= 0) {
        items[index] = { ...task };
      } else {
        items.push({ ...task });
      }
      return emitDelay({ ...task }) as Promise<TaskItem>;
    },
    async delete(id: string) {
      items = items.filter((item) => item.id !== id);
      return emitDelay(undefined) as Promise<void>;
    },
    reset() {
      items = [...initial];
    },
  };
};
