import { z } from "zod";

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
    variables: z
      .record(z.string(), z.union([z.string(), z.number()]))
      .optional(),
    correctAnswers: z.array(z.strictObject({ text: z.string() })),
    wrongAnswers: z.array(
      z.strictObject({
        text: z.string(),
        mistake: z.string().optional(),
      }),
    ),
  },
) satisfies z.ZodType<QuestionBankRawQuestionTemplateSimplePreset>;
