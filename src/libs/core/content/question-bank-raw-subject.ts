import { z } from "zod/mini";
import { questionBankRawSubjectExamSchema } from "./question-bank-raw-subject-exam.ts";
import type { QuestionBankRawSubjectExam } from "./question-bank-raw-subject-exam.ts";

export type QuestionBankRawSubject = {
  id: string;
  learningObjective: string;
  longName: string;
  shortName: string;
  exams: QuestionBankRawSubjectExam[];
};

export const questionBankRawSubjectSchema = z.strictObject({
  id: z.string(),
  learningObjective: z.string(),
  longName: z.string(),
  shortName: z.string(),
  exams: z.array(questionBankRawSubjectExamSchema),
}) satisfies z.ZodMiniType<QuestionBankRawSubject>;
