import { z } from "zod/mini";
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
  annexes: z.optional(
    z.record(
      z.string(),
      z.strictObject({
        annex: z.string(),
        width: z.optional(z.number()),
        height: z.optional(z.number()),
        annotations: z.array(questionBankRawQuestionAnnexAnnotationSchema),
      }),
    ),
  ),
  presets: z.array(questionBankRawQuestionTemplateSimplePresetSchema),
}) satisfies z.ZodMiniType<QuestionBankRawQuestionTemplateSimple>;
