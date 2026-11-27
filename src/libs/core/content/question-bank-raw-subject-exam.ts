import { z } from "zod/mini";
import { questionBankRawSubjectExamChapterSchema } from "./question-bank-raw-subject-exam-chapter.ts";
import type { QuestionBankRawSubjectExamChapter } from "./question-bank-raw-subject-exam-chapter.ts";

export type QuestionBankRawSubjectExam = {
  course: string;
  minutes: number;
  questions: number;
  chapters: QuestionBankRawSubjectExamChapter[] | null;
};

export const questionBankRawSubjectExamSchema = z.strictObject({
  course: z.string(),
  minutes: z.number(),
  questions: z.number(),
  chapters: z.nullable(z.array(questionBankRawSubjectExamChapterSchema)),
}) satisfies z.ZodMiniType<QuestionBankRawSubjectExam>;
