import { createHarmonyDataClient } from '@harmony/data';
import { createDeveloperSettingsStore } from '@harmony/config';

export const dataClient = createHarmonyDataClient();
export const developerSettingsStore = createDeveloperSettingsStore();
