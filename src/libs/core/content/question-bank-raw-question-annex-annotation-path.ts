import { z } from "zod/mini";

export type QuestionBankRawQuestionAnnexAnnotationPath = {
  type: "path";
  points: [number, number][];
  color?: string;
  width?: number;
};

export const questionBankRawQuestionAnnexAnnotationPathSchema = z.strictObject({
  type: z.literal("path"),
  points: z.array(z.tuple([z.number(), z.number()])),
  color: z.optional(z.string()),
  width: z.optional(z.number()),
}) satisfies z.ZodMiniType<QuestionBankRawQuestionAnnexAnnotationPath>;
