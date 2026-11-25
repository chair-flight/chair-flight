import { z } from "zod";

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
  color: z.string().optional(),
  width: z.number().optional(),
  dash: z.string().optional(),
  arrow: z.boolean().optional(),
}) satisfies z.ZodType<QuestionBankRawQuestionAnnexAnnotationLine>;
