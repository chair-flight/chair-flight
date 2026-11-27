import { z } from "zod/mini";

export type QuestionBankRawAnnex = {
  id: string;
  format: string;
  description: string;
  source: string;
};

export const questionBankRawAnnexSchema = z.strictObject({
  id: z.string(),
  format: z.string(),
  description: z._default(z.string(), ""),
  source: z._default(z.string(), ""),
}) satisfies z.ZodMiniType<QuestionBankRawAnnex>;
