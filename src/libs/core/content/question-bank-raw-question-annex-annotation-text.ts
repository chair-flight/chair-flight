import { z } from "zod";

export type QuestionBankRawQuestionAnnexAnnotationText = {
  type: "text";
  x: number | number[];
  y: number;
  text: string;
  size?: number;
  rotation?: number;
  color?: string;
  weight?: string;
  anchor?: "start" | "middle" | "end";
};

export const questionBankRawQuestionAnnexAnnotationTextSchema = z.strictObject({
  type: z.literal("text"),
  x: z.union([z.number(), z.array(z.number())]),
  y: z.number(),
  text: z.string(),
  size: z.number().optional(),
  rotation: z.number().optional(),
  color: z.string().optional(),
  weight: z.string().optional(),
  anchor: z.enum(["start", "middle", "end"]).optional(),
}) satisfies z.ZodType<QuestionBankRawQuestionAnnexAnnotationText>;
