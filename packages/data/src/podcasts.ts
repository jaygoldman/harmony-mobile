import podcastSeeds from '../seeds/podcasts.json';
import { PodcastEpisode } from './types';
import { freezeDeep } from './utils';

const seededEpisodes: PodcastEpisode[] = podcastSeeds.map((episode) => ({
  ...episode,
}));

freezeDeep(seededEpisodes);

export const createPodcastProvider = () => {
  const initial = [...seededEpisodes];
  let items: PodcastEpisode[] = [...initial];

  const emitDelay = (value: unknown) =>
    new Promise((resolve) => setTimeout(() => resolve(value), 120));

  return {
    async list(): Promise<PodcastEpisode[]> {
      return emitDelay(items.map((item) => ({ ...item }))) as Promise<PodcastEpisode[]>;
    },
    async getById(id: string) {
      return emitDelay(items.find((item) => item.id === id)) as Promise<PodcastEpisode | undefined>;
    },
    async toggleDownload(id: string) {
      items = items.map((episode) =>
        episode.id === id ? { ...episode, isDownloaded: !episode.isDownloaded } : episode
      );
      return emitDelay(items.find((item) => item.id === id)) as Promise<PodcastEpisode | undefined>;
    },
    reset() {
      items = [...initial];
    },
  };
};
