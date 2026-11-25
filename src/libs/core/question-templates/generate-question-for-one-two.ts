import {
  getRandomGenerator,
  getRandomId,
  getRandomShuffler,
} from "../../base/random.ts";
import type { QuestionBankRawQuestionTemplate } from "../content/question-bank-raw-question-template.ts";

const ONE_TWO_OPTIONS = [
  { text: "One is correct, two is correct", first: true, second: true },
  { text: "One is correct, two is incorrect", first: true, second: false },
  { text: "One is incorrect, two is correct", first: false, second: true },
  { text: "One is incorrect, two is incorrect", first: false, second: false },
];

export const generateQuestionForOneTwo = (
  template: Extract<QuestionBankRawQuestionTemplate, { type: "one-two" }>,
  variant: number,
  seed: string,
) => {
  const shuffle = getRandomShuffler(seed);
  const random = getRandomGenerator(seed);
  const [pairIndexes] = template.pairs
    .flatMap((_, second) =>
      Array.from({ length: second }, (_, first) => [first, second]),
    )
    .slice(variant - 1);
  const statements = shuffle(
    pairIndexes.map((pairIndex) => {
      const pair = template.pairs[pairIndex];
      const correct =
        pair.wrong.length === 0 || (pair.right.length > 0 && random() < 0.5);
      const sentences = correct ? pair.right : pair.wrong;
      return {
        correct,
        text: sentences[Math.floor(random() * sentences.length)],
      };
    }),
  );
  const options = shuffle(ONE_TWO_OPTIONS).map((option) => ({
    id: getRandomId(random),
    text: option.text,
    correct:
      option.first === statements[0].correct &&
      option.second === statements[1].correct,
  }));
  return {
    questionType: "multiple-choice" as const,
    question: [
      template.question,
      `1) ${statements[0].text}`,
      `2) ${statements[1].text}`,
    ].join("\n\n"),
    explanation: template.explanation,
    correctOptionId: options.find((option) => option.correct)?.id ?? "",
    options: options.map(({ id, text }) => ({ id, text })),
    annexes: [] as string[],
  };
};
