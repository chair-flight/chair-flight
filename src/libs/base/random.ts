export const getRandomGenerator = (seed: string) => {
  const state = {
    h: Array.from(seed).reduce((h, char) => {
      const mixed = Math.imul(h ^ char.charCodeAt(0), 3432918353);
      return (mixed << 13) | (mixed >>> 19);
    }, 1779033703 ^ seed.length),
  };
  const seedNext = () => {
    state.h = Math.imul(state.h ^ (state.h >>> 16), 2246822507);
    state.h = Math.imul(state.h ^ (state.h >>> 13), 3266489909);
    state.h ^= state.h >>> 16;
    return state.h >>> 0;
  };

  const scf32 = {
    a: seedNext(),
    b: seedNext(),
    c: seedNext(),
    d: seedNext(),
  };

  return () => {
    const t = (((scf32.a + scf32.b) | 0) + ((scf32.d + 1) | 0)) | 0;
    scf32.d = (scf32.d + 1) | 0;
    scf32.a = scf32.b ^ (scf32.b >>> 9);
    scf32.b = (scf32.c + (scf32.c << 3)) | 0;
    scf32.c = (((scf32.c << 21) | (scf32.c >>> 11)) + t) | 0;
    return (t >>> 0) / 4294967296;
  };
};

export const getRandomShuffler = (seed: string) => {
  const random = getRandomGenerator(seed);
  return <T>(items: T[]) =>
    items
      .map((item) => ({ item, order: random() }))
      .sort((a, b) => a.order - b.order)
      .map(({ item }) => item);
};

export const getRandomId = (random: () => number = Math.random) => {
  const ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: 8 }, () =>
    ID_CHARS.charAt(Math.floor(random() * ID_CHARS.length)),
  ).join("");
};
