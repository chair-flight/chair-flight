import { countTemplateVariants } from "./count-template-variants.ts";
import { generateQuestionForDefinition } from "./generate-question-for-definition.ts";
import { generateQuestionForMultipleCorrect } from "./generate-question-for-multiple-correct.ts";
import { generateQuestionForOneTwo } from "./generate-question-for-one-two.ts";
import { generateQuestionForSimple } from "./generate-question-for-simple.ts";
import { generateQuestionForTrueOrFalse } from "./generate-question-for-true-or-false.ts";
import type { QuestionBankRawQuestionTemplate } from "../content/question-bank-raw-question-template.ts";

export const generateQuestion = (
  templates: QuestionBankRawQuestionTemplate[],
  variant: number,
  seed: string,
) => {
  const templateIndex = templates.findIndex((_, index) => {
    const total = templates
      .slice(0, index + 1)
      .reduce((s, t) => s + countTemplateVariants(t), 0);
    return total >= variant;
  });
  const template = templates[templateIndex];
  variant -= templates
    .slice(0, templateIndex)
    .reduce((s, t) => s + countTemplateVariants(t), 0);
  switch (template.type) {
    case "simple":
      return generateQuestionForSimple(template, variant, seed);
    case "true-or-false":
      return generateQuestionForTrueOrFalse(template, variant, seed);
    case "one-two":
      return generateQuestionForOneTwo(template, variant, seed);
    case "definition":
      return generateQuestionForDefinition(template, variant, seed);
    case "multiple-correct":
      return generateQuestionForMultipleCorrect(template, variant, seed);
  }
};
