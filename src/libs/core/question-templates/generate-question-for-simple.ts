import {
  getRandomGenerator,
  getRandomId,
  getRandomShuffler,
} from "../../base/random.ts";
import { fillTemplate } from "./fill-template.ts";
import type { QuestionBankRawQuestionTemplate } from "../content/question-bank-raw-question-template.ts";

export const generateQuestionForSimple = (
  template: Extract<QuestionBankRawQuestionTemplate, { type: "simple" }>,
  variant: number,
  seed: string,
) => {
  const shuffle = getRandomShuffler(seed);
  const random = getRandomGenerator(seed);
  const [{ preset, correctAnswer }] = template.presets
    .flatMap((preset) =>
      preset.correctAnswers.map((correctAnswer) => ({
        preset,
        correctAnswer,
      })),
    )
    .slice(variant - 1);
  const shownWrongAnswers = shuffle(preset.wrongAnswers).slice(0, 3);
  const mistakes = shownWrongAnswers.filter((answer) => answer.mistake);
  const wrongAnswersTable = mistakes.length
    ? [
        "| Answer | Mistake |",
        "| --- | --- |",
        ...mistakes.map((answer) => `| ${answer.text} | ${answer.mistake} |`),
      ].join("\n")
    : "";
  const context = {
    variables: preset.variables,
    annexes: template.annexes,
    wrongAnswersTable,
  };
  const options = shuffle([
    { text: correctAnswer.text, correct: true },
    ...shownWrongAnswers.map((answer) => ({
      text: answer.text,
      correct: false,
    })),
  ]).map((option) => ({ ...option, id: getRandomId(random) }));
  return {
    questionType: "multiple-choice" as const,
    question: fillTemplate(template.question, context),
    explanation: fillTemplate(template.explanation, context),
    correctOptionId: options.find((option) => option.correct)?.id ?? "",
    options: options.map(({ id, text }) => ({ id, text })),
    annexes: [] as string[],
  };
};
