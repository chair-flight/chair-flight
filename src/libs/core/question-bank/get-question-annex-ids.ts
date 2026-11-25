import type { QuestionBankRawQuestion } from "../content/question-bank-raw-question.ts";

export const getQuestionAnnexIds = (question: QuestionBankRawQuestion) =>
  [
    ...new Set(question.annexes.map((a) => ("base" in a ? a.base : a.id))),
  ].sort();
