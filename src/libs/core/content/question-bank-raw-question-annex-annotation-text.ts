import { z } from "zod/mini";

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
  size: z.optional(z.number()),
  rotation: z.optional(z.number()),
  color: z.optional(z.string()),
  weight: z.optional(z.string()),
  anchor: z.optional(z.enum(["start", "middle", "end"])),
}) satisfies z.ZodMiniType<QuestionBankRawQuestionAnnexAnnotationText>;
