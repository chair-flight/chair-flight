export const keepUnique = <T>(array: T[]): T[] => [...new Set(array)];

export const countUnique = <T>(array: T[]): number => keepUnique(array).length;
