import { z } from "zod/mini";

export type QuestionBankRawQuestionAnnexAnnotationRect = {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  radius?: number;
};

export const questionBankRawQuestionAnnexAnnotationRectSchema = z.strictObject({
  type: z.literal("rect"),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  stroke: z.optional(z.string()),
  fill: z.optional(z.string()),
  strokeWidth: z.optional(z.number()),
  radius: z.optional(z.number()),
}) satisfies z.ZodMiniType<QuestionBankRawQuestionAnnexAnnotationRect>;
