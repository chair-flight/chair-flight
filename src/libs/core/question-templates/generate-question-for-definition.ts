import { getRandomShuffler } from "../../base/random.ts";
import type { QuestionBankRawQuestionTemplate } from "../content/question-bank-raw-question-template.ts";

export const generateQuestionForDefinition = (
  template: Extract<QuestionBankRawQuestionTemplate, { type: "definition" }>,
  variant: number,
  seed: string,
) => {
  const shuffle = getRandomShuffler(seed);
  const correctOption = template.options[variant - 1];
  const otherOptions = template.options.filter(
    (option) => option !== correctOption,
  );
  const withAnnexes = template.question.includes("annex:{{term}}");
  const fillTerm = (text: string) =>
    text
      .replace(
        /annex:\{\{term\}\}((?::(?:sm|md|lg|editable))*)/g,
        (_, modifiers: string) =>
          modifiers
            ? `${correctOption.term}#${modifiers.slice(1)}`
            : correctOption.term,
      )
      .replace("{{term}}", correctOption.term)
      .replace("{term}", correctOption.term);
  const wrongOptions = shuffle([
    ...otherOptions.map((option) => ({
      id: option.id,
      text: option.definition,
    })),
    ...template.fakeOptions.map((option) => ({
      id: option.id,
      text: option.definition,
    })),
  ]).slice(0, 3);
  const table = [
    `| ${withAnnexes ? "Image" : "Term"} | Meaning |`,
    "| --- | --- |",
    ...template.options.map(
      (option) =>
        `| ${withAnnexes ? `![](${option.term})` : option.term} | ${option.definition} |`,
    ),
  ].join("\n");
  return {
    questionType: "multiple-choice" as const,
    question: fillTerm(template.question),
    explanation: fillTerm(template.explanation).replace("{table}", table),
    correctOptionId: correctOption.id,
    options: shuffle([
      { id: correctOption.id, text: correctOption.definition },
      ...wrongOptions,
    ]),
    annexes: [] as string[],
  };
};
