import { z } from "zod/mini";

export type QuestionBankRawQuestionTemplateMultipleCorrect = {
  type: "multiple-correct";
  question: string;
  explanation: string;
  options: {
    text: string;
    correct: boolean;
  }[];
  variants: {
    show: number[];
  }[];
};

export const questionBankRawQuestionTemplateMultipleCorrectSchema =
  z.strictObject({
    type: z.literal("multiple-correct"),
    question: z.string(),
    explanation: z.string(),
    options: z.array(
      z.strictObject({
        text: z.string(),
        correct: z.boolean(),
      }),
    ),
    variants: z.array(z.strictObject({ show: z.array(z.number()) })),
  }) satisfies z.ZodMiniType<QuestionBankRawQuestionTemplateMultipleCorrect>;
