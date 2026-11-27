import { z } from "zod/mini";

export type QuestionBankRawQuestionTemplateTrueOrFalse = {
  type: "true-or-false";
  question: string;
  explanation: string;
  statements: {
    text: string;
    answer: boolean;
  }[];
};

export const questionBankRawQuestionTemplateTrueOrFalseSchema = z.strictObject({
  type: z.literal("true-or-false"),
  question: z.string(),
  explanation: z.string(),
  statements: z.array(
    z.strictObject({
      text: z.string(),
      answer: z.boolean(),
    }),
  ),
}) satisfies z.ZodMiniType<QuestionBankRawQuestionTemplateTrueOrFalse>;
