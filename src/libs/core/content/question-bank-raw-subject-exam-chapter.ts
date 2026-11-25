import { z } from "zod";

export type QuestionBankRawSubjectExamChapter = {
  chapter: string;
  numberOfQuestions: number;
};

export const questionBankRawSubjectExamChapterSchema = z.strictObject({
  chapter: z.string(),
  numberOfQuestions: z.number(),
}) satisfies z.ZodType<QuestionBankRawSubjectExamChapter>;
