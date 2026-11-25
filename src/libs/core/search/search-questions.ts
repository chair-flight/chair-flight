import { getSearchWords } from "./get-search-words.ts";

type SearchableQuestion = {
  id: string;
  preview: string;
};

const PAGE_SIZE = 40;
const WORD_MATCH = /[a-z0-9]+/g;

const vocabularies = new WeakMap<object, Map<string, number>>();

const getVocabulary = (allQuestions: SearchableQuestion[]) => {
  const cached = vocabularies.get(allQuestions);
  if (cached) return cached;
  const vocabulary = new Map<string, number>();
  for (const { preview } of allQuestions) {
    for (const word of preview.toLowerCase().match(WORD_MATCH) ?? []) {
      if (word.length >= 3)
        vocabulary.set(word, (vocabulary.get(word) ?? 0) + 1);
    }
  }
  vocabularies.set(allQuestions, vocabulary);
  return vocabulary;
};

const measureEditDistance = (a: string, b: string) => {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let row = 1; row <= a.length; row++) {
    const current = [row];
    for (let column = 1; column <= b.length; column++) {
      current[column] = Math.min(
        (previous[column] ?? 0) + 1,
        (current[column - 1] ?? 0) + 1,
        (previous[column - 1] ?? 0) + (a[row - 1] === b[column - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length] ?? 0;
};

const correctWord = (word: string, vocabulary: Map<string, number>) => {
  if (word.length < 3) return word;
  const entries = [...vocabulary];
  if (entries.some(([known]) => known.startsWith(word))) return word;
  const maxDistance = word.length <= 3 ? 1 : 2;
  const [best] = entries
    .filter(([known]) => Math.abs(known.length - word.length) <= 2)
    .map(([known, uses]) => ({
      known,
      uses,
      distance: measureEditDistance(known, word),
    }))
    .filter(({ distance }) => distance <= maxDistance)
    .sort(
      (a, b) =>
        a.distance - b.distance ||
        Number(b.known[0] === word[0]) - Number(a.known[0] === word[0]) ||
        Math.abs(a.known.length - word.length) -
          Math.abs(b.known.length - word.length) ||
        b.uses - a.uses,
    );
  return best?.known ?? word;
};

const stemWord = (word: string) =>
  word.length > 4 ? word.replace(/(ing|ed|es|s)$/, "") : word;

const rankQuestions = <T extends SearchableQuestion>(
  questions: T[],
  query: string,
  field: "all" | "id" | "text",
) => {
  const words = getSearchWords(query).map((word) => word.toLowerCase());
  if (words.length === 0) return questions;
  const phrase = words.join(" ");
  return questions
    .flatMap((question) => {
      const id = question.id.toLowerCase();
      const text = question.preview.toLowerCase();
      const matchesId = (word: string) => id.includes(word);
      const matchesText = (word: string) =>
        text.includes(word) || text.includes(stemWord(word));
      const matches = words.every((word) =>
        field === "id"
          ? matchesId(word)
          : field === "text"
            ? matchesText(word)
            : matchesId(word) || matchesText(word),
      );
      if (!matches) return [];
      const tokens = new Set(text.match(WORD_MATCH) ?? []);
      const idScore =
        field === "text"
          ? 0
          : id === phrase
            ? 100
            : id.startsWith(phrase)
              ? 50
              : id.includes(phrase)
                ? 25
                : 0;
      const textScore =
        field === "id"
          ? 0
          : words.filter((word) => tokens.has(word)).length +
            (text.includes(phrase) ? 5 : 0);
      return { question, score: idScore + textScore };
    })
    .sort(
      (a, b) => b.score - a.score || a.question.id.localeCompare(b.question.id),
    )
    .map(({ question }) => question);
};

export const searchQuestions = <T extends SearchableQuestion>({
  allQuestions,
  candidates,
  query,
  field = "all",
  offset = 0,
  limit = PAGE_SIZE,
}: {
  allQuestions: SearchableQuestion[];
  candidates: T[];
  query: string;
  field?: "all" | "id" | "text";
  offset?: number;
  limit?: number;
}) => {
  const run = (text: string) => rankQuestions(candidates, text, field);
  const matches = run(query);
  const words = getSearchWords(query).map((word) =>
    word.toLowerCase().slice(0, 40),
  );
  const correctedQuery =
    matches.length > 0 || field === "id" || words.length === 0
      ? null
      : (() => {
          const vocabulary = getVocabulary(allQuestions);
          const corrected = words
            .map((word) => correctWord(word, vocabulary))
            .join(" ");
          return corrected === words.join(" ") ? null : corrected;
        })();
  const found = correctedQuery ? run(correctedQuery) : matches;
  return {
    items: found.slice(offset, offset + limit),
    nextOffset: found.length > offset + limit ? offset + limit : null,
    correctedQuery,
  };
};
