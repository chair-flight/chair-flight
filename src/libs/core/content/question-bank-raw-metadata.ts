import { z } from "zod/mini";
import { questionBankNameSchema } from "./question-bank-name.ts";
import { questionBankRawAnnexSchema } from "./question-bank-raw-annex.ts";
import { questionBankRawChapterSchema } from "./question-bank-raw-chapter.ts";
import { questionBankRawCourseSchema } from "./question-bank-raw-course.ts";
import { questionBankRawSubjectSchema } from "./question-bank-raw-subject.ts";

export const questionBankRawMetadataSchema = z.strictObject({
  id: questionBankNameSchema,
  title: z.string(),
  shortTitle: z.string(),
  subtitle: z.string(),
  description: z.string(),
  annexes: z._default(z.array(questionBankRawAnnexSchema), []),
  courses: z._default(z.array(questionBankRawCourseSchema), []),
  subjects: z.array(questionBankRawSubjectSchema),
  chapters: z.array(questionBankRawChapterSchema),
});
