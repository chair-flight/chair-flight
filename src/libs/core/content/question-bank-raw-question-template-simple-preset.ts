import { z } from "zod/mini";

export type QuestionBankRawQuestionTemplateSimplePreset = {
  variables?: Record<string, string | number>;
  correctAnswers: {
    text: string;
  }[];
  wrongAnswers: {
    text: string;
    mistake?: string;
  }[];
};

export const questionBankRawQuestionTemplateSimplePresetSchema = z.strictObject(
  {
    variables: z.optional(
      z.record(z.string(), z.union([z.string(), z.number()])),
    ),
    correctAnswers: z.array(z.strictObject({ text: z.string() })),
    wrongAnswers: z.array(
      z.strictObject({
        text: z.string(),
        mistake: z.optional(z.string()),
      }),
    ),
  },
) satisfies z.ZodMiniType<QuestionBankRawQuestionTemplateSimplePreset>;
