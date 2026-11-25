import { z } from "zod";
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
  annexes: QuestionBankRawQuestionAnnex[];
  templates: QuestionBankRawQuestionTemplate[];
};

export const questionBankRawQuestionSchema = z.strictObject({
  id: z.string(),
  subjectId: z.string(),
  chapterId: z.string(),
  templates: z.array(questionBankRawQuestionTemplateSchema),
  learningObjectiveIds: z.array(z.string()).default([]),
  relatedQuestionIds: z.array(z.string()).default([]),
  externalQuestionIds: z.array(z.string()).default([]),
  annexes: z.array(questionBankRawQuestionAnnexSchema).default([]),
}) satisfies z.ZodType<QuestionBankRawQuestion>;
