import { z } from "zod";

export type QuestionBankRawCourse = {
  id: string;
  text: string;
};

export const questionBankRawCourseSchema = z.strictObject({
  id: z.string(),
  text: z.string(),
}) satisfies z.ZodType<QuestionBankRawCourse>;
