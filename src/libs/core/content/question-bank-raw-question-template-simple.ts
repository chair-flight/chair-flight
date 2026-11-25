import { z } from "zod";
import { questionBankRawQuestionAnnexAnnotationSchema } from "./question-bank-raw-question-annex-annotation.ts";
import { questionBankRawQuestionTemplateSimplePresetSchema } from "./question-bank-raw-question-template-simple-preset.ts";
import type { QuestionBankRawQuestionAnnexAnnotation } from "./question-bank-raw-question-annex-annotation.ts";
import type { QuestionBankRawQuestionTemplateSimplePreset } from "./question-bank-raw-question-template-simple-preset.ts";

export type QuestionBankRawQuestionTemplateSimple = {
  type: "simple";
  question: string;
  explanation: string;
  annexes?: Record<
    string,
    {
      annex: string;
      width?: number;
      height?: number;
      annotations: QuestionBankRawQuestionAnnexAnnotation[];
    }
  >;
  presets: QuestionBankRawQuestionTemplateSimplePreset[];
};

export const questionBankRawQuestionTemplateSimpleSchema = z.strictObject({
  type: z.literal("simple"),
  question: z.string(),
  explanation: z.string(),
  annexes: z
    .record(
      z.string(),
      z.strictObject({
        annex: z.string(),
        width: z.number().optional(),
        height: z.number().optional(),
        annotations: z.array(questionBankRawQuestionAnnexAnnotationSchema),
      }),
    )
    .optional(),
  presets: z.array(questionBankRawQuestionTemplateSimplePresetSchema),
}) satisfies z.ZodType<QuestionBankRawQuestionTemplateSimple>;
