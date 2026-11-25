import { z } from "zod";
import { QUESTION_BANK_NAMES } from "./question-bank-name.ts";
import { questionBankRawAnnexSchema } from "./question-bank-raw-annex.ts";
import { questionBankRawChapterSchema } from "./question-bank-raw-chapter.ts";
import { questionBankRawCourseSchema } from "./question-bank-raw-course.ts";
import { questionBankRawSubjectSchema } from "./question-bank-raw-subject.ts";

export const questionBankRawMetadataSchema = z.strictObject({
  id: z.enum(QUESTION_BANK_NAMES),
  title: z.string(),
  shortTitle: z.string(),
  subtitle: z.string(),
  description: z.string(),
  annexes: z.array(questionBankRawAnnexSchema).default([]),
  courses: z.array(questionBankRawCourseSchema).default([]),
  subjects: z.array(questionBankRawSubjectSchema),
  chapters: z.array(questionBankRawChapterSchema),
});
