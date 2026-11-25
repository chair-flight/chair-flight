import type { QuestionBankRawQuestionTemplate } from "../content/question-bank-raw-question-template.ts";

export const countTemplateVariants = (
  template: QuestionBankRawQuestionTemplate,
) => {
  switch (template.type) {
    case "simple":
      return template.presets.reduce((s, p) => s + p.correctAnswers.length, 0);
    case "true-or-false":
      return template.statements.length;
    case "one-two":
      return (template.pairs.length * (template.pairs.length - 1)) / 2;
    case "definition":
      return template.options.length;
    case "multiple-correct":
      return template.variants.length;
  }
};
