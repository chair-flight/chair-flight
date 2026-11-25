import { getSearchWords } from "./get-search-words.ts";

export const searchLearningObjectives = ({
  learningObjectives,
  query,
  limit = 8,
}: {
  learningObjectives: {
    id: string;
    text: string;
  }[];
  query: string;
  limit?: number;
}) => {
  const words = getSearchWords(query).map((word) => word.toLowerCase());
  const items = words.length
    ? learningObjectives
        .filter((learningObjective) =>
          words.every((word) =>
            `${learningObjective.id} ${learningObjective.text}`
              .toLowerCase()
              .includes(word),
          ),
        )
        .slice(0, limit)
        .map(({ id, text }) => ({ id, text }))
    : [];

  return { words, items };
};
