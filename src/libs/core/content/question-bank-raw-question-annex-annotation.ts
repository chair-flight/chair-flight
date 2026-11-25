import { z } from "zod";
import { questionBankRawQuestionAnnexAnnotationCircleSchema } from "./question-bank-raw-question-annex-annotation-circle.ts";
import { questionBankRawQuestionAnnexAnnotationLineSchema } from "./question-bank-raw-question-annex-annotation-line.ts";
import { questionBankRawQuestionAnnexAnnotationPathSchema } from "./question-bank-raw-question-annex-annotation-path.ts";
import { questionBankRawQuestionAnnexAnnotationRectSchema } from "./question-bank-raw-question-annex-annotation-rect.ts";
import { questionBankRawQuestionAnnexAnnotationTextSchema } from "./question-bank-raw-question-annex-annotation-text.ts";
import type { QuestionBankRawQuestionAnnexAnnotationCircle } from "./question-bank-raw-question-annex-annotation-circle.ts";
import type { QuestionBankRawQuestionAnnexAnnotationLine } from "./question-bank-raw-question-annex-annotation-line.ts";
import type { QuestionBankRawQuestionAnnexAnnotationPath } from "./question-bank-raw-question-annex-annotation-path.ts";
import type { QuestionBankRawQuestionAnnexAnnotationRect } from "./question-bank-raw-question-annex-annotation-rect.ts";
import type { QuestionBankRawQuestionAnnexAnnotationText } from "./question-bank-raw-question-annex-annotation-text.ts";

export type QuestionBankRawQuestionAnnexAnnotation =
  | QuestionBankRawQuestionAnnexAnnotationText
  | QuestionBankRawQuestionAnnexAnnotationLine
  | QuestionBankRawQuestionAnnexAnnotationCircle
  | QuestionBankRawQuestionAnnexAnnotationPath
  | QuestionBankRawQuestionAnnexAnnotationRect;

export const questionBankRawQuestionAnnexAnnotationSchema =
  z.discriminatedUnion("type", [
    questionBankRawQuestionAnnexAnnotationTextSchema,
    questionBankRawQuestionAnnexAnnotationLineSchema,
    questionBankRawQuestionAnnexAnnotationCircleSchema,
    questionBankRawQuestionAnnexAnnotationPathSchema,
    questionBankRawQuestionAnnexAnnotationRectSchema,
  ]) satisfies z.ZodType<QuestionBankRawQuestionAnnexAnnotation>;
