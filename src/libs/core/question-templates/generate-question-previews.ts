import { countTemplateVariants } from "./count-template-variants.ts";
import { generateQuestion } from "./generate-question.ts";
import type { QuestionBankRawQuestionTemplate } from "../content/question-bank-raw-question-template.ts";

export const generateQuestionPreviews = (
  templates: QuestionBankRawQuestionTemplate[],
) =>
  templates.flatMap((template) =>
    Array.from({ length: countTemplateVariants(template) }, (_, index) => {
      try {
        const { question, options, correctOptionId } = generateQuestion(
          [template],
          index + 1,
          "preview",
        );
        const answer =
          options.find((o) => o.id === correctOptionId)?.text ?? "";
        return { question, answer };
      } catch (error) {
        console.error(`Variant ${index + 1} failed to render.`, error);
        return { question: "Variant failed to render.", answer: "" };
      }
    }),
  );
