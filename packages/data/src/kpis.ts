import rawKpiSeeds from '../seeds/kpis.json';
import { KpiTile } from './types';
import { freezeDeep } from './utils';

type KpiSeed = Omit<KpiTile, 'category'> & { category?: KpiTile['category'] };

const kpiSeeds = rawKpiSeeds as KpiSeed[];

const seededTiles: KpiTile[] = kpiSeeds.map((tile) => ({
  ...tile,
  category: tile.category ?? 'executive',
}));

freezeDeep(seededTiles);

export const createKpiProvider = () => {
  const initial = [...seededTiles];
  let items: KpiTile[] = [...initial];

  const emitDelay = (value: unknown) =>
    new Promise((resolve) => setTimeout(() => resolve(value), 90));

  return {
    async list(): Promise<KpiTile[]> {
      return emitDelay(items.map((item) => ({ ...item }))) as Promise<KpiTile[]>;
    },
    async getById(id: string) {
      return emitDelay(items.find((item) => item.id === id)) as Promise<KpiTile | undefined>;
    },
    reset() {
      items = [...initial];
    },
  };
};
