import { z } from "zod";

export type QuestionBankRawChapter = {
  id: string;
  subject: string;
  title: string;
};

export const questionBankRawChapterSchema = z.strictObject({
  id: z.string(),
  subject: z.string(),
  title: z.string(),
}) satisfies z.ZodType<QuestionBankRawChapter>;
