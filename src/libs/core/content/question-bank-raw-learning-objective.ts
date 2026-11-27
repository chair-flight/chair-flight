import { z } from "zod/mini";

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

export const questionBankRawLearningObjectiveSchema = z.pipe(
  z.object({
    id: z.string(),
    parentId: z.nullable(z.string()),
    subject: z.string(),
    level: z.number(),
    text: z.string(),
    items: z._default(z.array(z.string()), []),
    source: z.string(),
    courses: z._default(z.array(z.string()), []),
    version: z.string(),
  }),
  z.transform((learningObjective) => ({
    ...learningObjective,
    chapter:
      learningObjective.level > 1
        ? learningObjective.id.split(".").slice(0, 2).join(".")
        : "",
  })),
) satisfies z.ZodMiniType<QuestionBankRawLearningObjective, unknown>;
