import { z } from "zod";

export type QuestionBankRawLearningObjective = {
  id: string;
  parentId: string | null;
  subject: string;
  chapter: string;
  level: number;
  text: string;
  items: string[];
  source: string;
  courses: string[];
  version: string;
};

export const questionBankRawLearningObjectiveSchema = z
  .object({
    id: z.string(),
    parentId: z.string().nullable(),
    subject: z.string(),
    level: z.number(),
    text: z.string(),
    items: z.array(z.string()).default([]),
    source: z.string(),
    courses: z.array(z.string()).default([]),
    version: z.string(),
  })
  .transform((learningObjective) => ({
    ...learningObjective,
    chapter:
      learningObjective.level > 1
        ? learningObjective.id.split(".").slice(0, 2).join(".")
        : "",
  })) satisfies z.ZodType<QuestionBankRawLearningObjective, unknown>;
