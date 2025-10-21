export type Seed = string | number;

const hashSeed = (seed: Seed): number => {
  const str = String(seed);
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0 || 1;
};

export const createSeededRandom = (seed: Seed) => {
  let state = hashSeed(seed);
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const pickDeterministic = <T>(items: T[], seed: Seed, count: number): T[] => {
  if (count >= items.length) {
    return [...items];
  }
  const random = createSeededRandom(seed);
  const result: T[] = [];
  const used = new Set<number>();

  while (result.length < count) {
    const index = Math.floor(random() * items.length);
    if (!used.has(index)) {
      used.add(index);
      result.push(items[index]);
    }
  }
  return result;
};

export const deterministicId = (prefix: string, seed: Seed, index: number) => {
  const random = createSeededRandom(`${prefix}-${seed}-${index}`);
  return `${prefix}-${Math.floor(random() * 1_000_000)}`;
};

export const freezeDeep = <T>(value: T): T => {
  if (Array.isArray(value)) {
    value.forEach((item) => freezeDeep(item));
  } else if (value && typeof value === 'object') {
    Object.freeze(value);
    Object.values(value).forEach((entry) => freezeDeep(entry));
  }
  return Object.freeze(value);
};
