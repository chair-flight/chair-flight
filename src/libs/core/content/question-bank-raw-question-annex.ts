import { z } from "zod";
import { questionBankRawQuestionAnnexAnnotationSchema } from "./question-bank-raw-question-annex-annotation.ts";
import type { QuestionBankRawQuestionAnnexAnnotation } from "./question-bank-raw-question-annex-annotation.ts";

export type QuestionBankRawQuestionAnnex =
  | {
      id: string;
    }
  | {
      id: string;
      base: string;
      width: number;
      height: number;
      annotations: QuestionBankRawQuestionAnnexAnnotation[];
    };

export const questionBankRawQuestionAnnexSchema = z.union([
  z.strictObject({
    id: z.string(),
  }),
  z.strictObject({
    id: z.string(),
    base: z.string(),
    width: z.number(),
    height: z.number(),
    annotations: z.array(questionBankRawQuestionAnnexAnnotationSchema),
  }),
]) satisfies z.ZodType<QuestionBankRawQuestionAnnex>;
