import { z } from "zod/mini";

export type QuestionBankRawQuestionTemplateDefinition = {
  type: "definition";
  question: string;
  explanation: string;
  options: {
    id: string;
    term: string;
    definition: string;
  }[];
  fakeOptions: {
    id: string;
    definition: string;
  }[];
};

export const questionBankRawQuestionTemplateDefinitionSchema = z.strictObject({
  type: z.literal("definition"),
  question: z.string(),
  explanation: z.string(),
  options: z.array(
    z.strictObject({
      id: z.string(),
      term: z.string(),
      definition: z.string(),
    }),
  ),
  fakeOptions: z.array(
    z.strictObject({
      id: z.string(),
      definition: z.string(),
    }),
  ),
}) satisfies z.ZodMiniType<QuestionBankRawQuestionTemplateDefinition>;
