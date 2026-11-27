import { z } from "zod/mini";
import { questionBankRawQuestionAnnexSchema } from "./question-bank-raw-question-annex.ts";
import { questionBankRawQuestionTemplateSchema } from "./question-bank-raw-question-template.ts";
import type { QuestionBankRawQuestionAnnex } from "./question-bank-raw-question-annex.ts";
import type { QuestionBankRawQuestionTemplate } from "./question-bank-raw-question-template.ts";

export type QuestionBankRawQuestion = {
  id: string;
  subjectId: string;
  chapterId: string;
  learningObjectiveIds: string[];
  relatedQuestionIds: string[];
  externalQuestionIds: string[];
  tags: string[];
  annexes: QuestionBankRawQuestionAnnex[];
  templates: QuestionBankRawQuestionTemplate[];
};

export const questionBankRawQuestionSchema = z.strictObject({
  id: z.string(),
  subjectId: z.string(),
  chapterId: z.string(),
  templates: z.array(questionBankRawQuestionTemplateSchema),
  learningObjectiveIds: z._default(z.array(z.string()), []),
  relatedQuestionIds: z._default(z.array(z.string()), []),
  externalQuestionIds: z._default(z.array(z.string()), []),
  tags: z._default(
    z.array(z.string().check(z.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/))),
    [],
  ),
  annexes: z._default(z.array(questionBankRawQuestionAnnexSchema), []),
}) satisfies z.ZodMiniType<QuestionBankRawQuestion>;
