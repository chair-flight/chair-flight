import { z } from "zod";

export type QuestionBankRawQuestionAnnexAnnotationPath = {
  type: "path";
  points: [number, number][];
  color?: string;
  width?: number;
};

export const questionBankRawQuestionAnnexAnnotationPathSchema = z.strictObject({
  type: z.literal("path"),
  points: z.array(z.tuple([z.number(), z.number()])),
  color: z.string().optional(),
  width: z.number().optional(),
}) satisfies z.ZodType<QuestionBankRawQuestionAnnexAnnotationPath>;
