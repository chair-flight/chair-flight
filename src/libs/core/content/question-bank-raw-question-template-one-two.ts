import { z } from "zod/mini";

export type QuestionBankRawQuestionTemplateOneTwo = {
  type: "one-two";
  question: string;
  explanation: string;
  pairs: {
    right: string[];
    wrong: string[];
  }[];
};

export const questionBankRawQuestionTemplateOneTwoSchema = z.strictObject({
  type: z.literal("one-two"),
  question: z.string(),
  explanation: z.string(),
  pairs: z.array(
    z.strictObject({
      right: z.array(z.string()),
      wrong: z.array(z.string()),
    }),
  ),
}) satisfies z.ZodMiniType<QuestionBankRawQuestionTemplateOneTwo>;
