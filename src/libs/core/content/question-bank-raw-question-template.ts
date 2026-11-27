import { z } from "zod/mini";
import { questionBankRawQuestionTemplateDefinitionSchema } from "./question-bank-raw-question-template-definition.ts";
import { questionBankRawQuestionTemplateMultipleCorrectSchema } from "./question-bank-raw-question-template-multiple-correct.ts";
import { questionBankRawQuestionTemplateOneTwoSchema } from "./question-bank-raw-question-template-one-two.ts";
import { questionBankRawQuestionTemplateSimpleSchema } from "./question-bank-raw-question-template-simple.ts";
import { questionBankRawQuestionTemplateTrueOrFalseSchema } from "./question-bank-raw-question-template-true-or-false.ts";
import type { QuestionBankRawQuestionTemplateDefinition } from "./question-bank-raw-question-template-definition.ts";
import type { QuestionBankRawQuestionTemplateMultipleCorrect } from "./question-bank-raw-question-template-multiple-correct.ts";
import type { QuestionBankRawQuestionTemplateOneTwo } from "./question-bank-raw-question-template-one-two.ts";
import type { QuestionBankRawQuestionTemplateSimple } from "./question-bank-raw-question-template-simple.ts";
import type { QuestionBankRawQuestionTemplateTrueOrFalse } from "./question-bank-raw-question-template-true-or-false.ts";

export type QuestionBankRawQuestionTemplate =
  | QuestionBankRawQuestionTemplateSimple
  | QuestionBankRawQuestionTemplateTrueOrFalse
  | QuestionBankRawQuestionTemplateOneTwo
  | QuestionBankRawQuestionTemplateDefinition
  | QuestionBankRawQuestionTemplateMultipleCorrect;

export const questionBankRawQuestionTemplateSchema = z.discriminatedUnion(
  "type",
  [
    questionBankRawQuestionTemplateSimpleSchema,
    questionBankRawQuestionTemplateTrueOrFalseSchema,
    questionBankRawQuestionTemplateOneTwoSchema,
    questionBankRawQuestionTemplateDefinitionSchema,
    questionBankRawQuestionTemplateMultipleCorrectSchema,
  ],
) satisfies z.ZodMiniType<QuestionBankRawQuestionTemplate>;
