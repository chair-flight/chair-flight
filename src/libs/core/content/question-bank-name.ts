import { z } from "zod/mini";

export const questionBankNameSchema = z.enum([
  "atpl_a",
  "ppl_a",
  "b737",
  "a320",
]);

export type QuestionBankName = z.infer<typeof questionBankNameSchema>;
