import type { QuestionBankIndex } from "../content/question-bank-index.ts";

export const getQuestionsInScope = (
  index: QuestionBankIndex,
  scopeId: string,
) =>
  index.questions
    .filter(
      (question) =>
        question.chapterId === scopeId ||
        question.subjectId === scopeId ||
        question.learningObjectiveIds.some(
          (id) => id === scopeId || id.startsWith(`${scopeId}.`),
        ),
    )
    .toSorted((first, second) => first.id.localeCompare(second.id));
