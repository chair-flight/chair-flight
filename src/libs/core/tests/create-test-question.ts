import { getRandomGenerator, getRandomId } from "../../base/random.ts";
import { countTemplateVariants } from "../question-templates/count-template-variants.ts";
import { generateQuestion } from "../question-templates/generate-question.ts";
import type { QuestionBankRawQuestionTemplate } from "../content/question-bank-raw-question-template.ts";
import type { Test } from "./test.ts";

const ANNEX_PATH_PATTERN = /\/content\/annexes\/[^\s)#?"'\]\\]+/g;

const collectAnnexPaths = (value: unknown, paths: Set<string>) => {
  if (typeof value === "string") {
    for (const match of value.matchAll(ANNEX_PATH_PATTERN)) paths.add(match[0]);
    return paths;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectAnnexPaths(item, paths);
    return paths;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectAnnexPaths(item, paths);
  }
  return paths;
};

export const createTestQuestion = ({
  id,
  templates,
  annexes = [],
  seed = getRandomId(),
  forcedVariant,
}: {
  id: string;
  templates: QuestionBankRawQuestionTemplate[];
  annexes?: string[];
  seed?: string;
  forcedVariant?: number;
}): Test["questions"][number] => {
  const random = getRandomGenerator(`${seed}-variant`);
  const variantCount = templates.reduce(
    (s, t) => s + countTemplateVariants(t),
    0,
  );
  const variant = forcedVariant ?? Math.floor(random() * variantCount) + 1;
  const { annexes: generatedAnnexes, ...question } = generateQuestion(
    templates,
    variant,
    seed,
  );
  const templateAnnexPaths = collectAnnexPaths(templates, new Set());
  const questionAnnexPaths = collectAnnexPaths(
    [question.question, question.options],
    new Set(),
  );
  const sharedAnnexes = annexes.filter((href) => {
    const path = href.split("?")[0];
    return !templateAnnexPaths.has(path) || questionAnnexPaths.has(path);
  });
  return {
    questionId: getRandomId(getRandomGenerator(`${seed}-id`)),
    templateId: id,
    seed,
    variant,
    variantCount,
    ...question,
    annexes: [...sharedAnnexes, ...generatedAnnexes],
  };
};
