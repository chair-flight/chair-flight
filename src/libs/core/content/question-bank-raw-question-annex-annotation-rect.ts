import { z } from "zod";

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
  stroke: z.string().optional(),
  fill: z.string().optional(),
  strokeWidth: z.number().optional(),
  radius: z.number().optional(),
}) satisfies z.ZodType<QuestionBankRawQuestionAnnexAnnotationRect>;
