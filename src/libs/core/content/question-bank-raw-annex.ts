import { z } from "zod";

export type QuestionBankRawAnnex = {
  id: string;
  format: string;
  description: string;
  source: string;
};

export const questionBankRawAnnexSchema = z.strictObject({
  id: z.string(),
  format: z.string(),
  description: z.string().default(""),
  source: z.string().default(""),
}) satisfies z.ZodType<QuestionBankRawAnnex>;
