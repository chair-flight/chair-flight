import { z } from "zod/mini";

export type QuestionBankRawCourse = {
  id: string;
  text: string;
};

export const questionBankRawCourseSchema = z.strictObject({
  id: z.string(),
  text: z.string(),
}) satisfies z.ZodMiniType<QuestionBankRawCourse>;
