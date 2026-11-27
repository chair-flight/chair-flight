import { z } from "zod/mini";

export type QuestionBankRawQuestionAnnexAnnotationCircle = {
  type: "circle";
  x: number;
  y: number;
  r: number;
  stroke?: string;
  fill?: string;
  width?: number;
};

export const questionBankRawQuestionAnnexAnnotationCircleSchema =
  z.strictObject({
    type: z.literal("circle"),
    x: z.number(),
    y: z.number(),
    r: z.number(),
    stroke: z.optional(z.string()),
    fill: z.optional(z.string()),
    width: z.optional(z.number()),
  }) satisfies z.ZodMiniType<QuestionBankRawQuestionAnnexAnnotationCircle>;
