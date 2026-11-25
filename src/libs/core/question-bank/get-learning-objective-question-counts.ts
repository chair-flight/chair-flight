import type {
  QuestionBankIndex,
  QuestionBankLearningObjective,
} from "../content/question-bank-index.ts";

const cache = new WeakMap<QuestionBankIndex, Record<string, number>>();

export const getLearningObjectiveQuestionCounts = (
  index: QuestionBankIndex,
  learningObjectives: QuestionBankLearningObjective[],
) => {
  const cached = cache.get(index);
  if (cached) return cached;
  const parentIds = new Map(
    learningObjectives.map((item) => [item.id, item.parentId]),
  );
  const counts = index.questions.reduce<Record<string, number>>(
    (totals, question) => {
      const covered = new Set(
        question.learningObjectiveIds.flatMap((id) => {
          const chain: string[] = [];
          for (
            let current: string | null | undefined = id;
            current;
            current = parentIds.get(current)
          ) {
            chain.push(current);
          }
          return chain;
        }),
      );
      for (const id of covered) totals[id] = (totals[id] ?? 0) + 1;
      return totals;
    },
    {},
  );
  cache.set(index, counts);
  return counts;
};
