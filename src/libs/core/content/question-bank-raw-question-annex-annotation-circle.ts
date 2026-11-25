import { z } from "zod";

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
    stroke: z.string().optional(),
    fill: z.string().optional(),
    width: z.number().optional(),
  }) satisfies z.ZodType<QuestionBankRawQuestionAnnexAnnotationCircle>;
