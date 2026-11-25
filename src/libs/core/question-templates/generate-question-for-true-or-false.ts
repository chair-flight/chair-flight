import { getRandomShuffler } from "../../base/random.ts";
import type { QuestionBankRawQuestionTemplate } from "../content/question-bank-raw-question-template.ts";

export const generateQuestionForTrueOrFalse = (
  template: Extract<QuestionBankRawQuestionTemplate, { type: "true-or-false" }>,
  variant: number,
  seed: string,
) => {
  const statement = template.statements[variant - 1];
  return {
    questionType: "true-or-false" as const,
    question: [template.question, statement.text]
      .filter((part) => part)
      .join("\n\n"),
    explanation: template.explanation,
    correctOptionId: statement.answer ? "true" : "false",
    options: getRandomShuffler(seed)([
      { id: "true", text: "True" },
      { id: "false", text: "False" },
    ]),
    annexes: [] as string[],
  };
};
