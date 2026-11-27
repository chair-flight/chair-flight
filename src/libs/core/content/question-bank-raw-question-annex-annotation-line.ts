import { z } from "zod/mini";

export type QuestionBankRawQuestionAnnexAnnotationLine = {
  type: "line";
  from: [number, number];
  to: [number, number];
  color?: string;
  width?: number;
  dash?: string;
  arrow?: boolean;
};

export const questionBankRawQuestionAnnexAnnotationLineSchema = z.strictObject({
  type: z.literal("line"),
  from: z.tuple([z.number(), z.number()]),
  to: z.tuple([z.number(), z.number()]),
  color: z.optional(z.string()),
  width: z.optional(z.number()),
  dash: z.optional(z.string()),
  arrow: z.optional(z.boolean()),
}) satisfies z.ZodMiniType<QuestionBankRawQuestionAnnexAnnotationLine>;
