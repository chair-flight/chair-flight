import { z } from "zod/mini";

export type QuestionBankRawChapter = {
  id: string;
  subject: string;
  title: string;
};

export const questionBankRawChapterSchema = z.strictObject({
  id: z.string(),
  subject: z.string(),
  title: z.string(),
}) satisfies z.ZodMiniType<QuestionBankRawChapter>;
