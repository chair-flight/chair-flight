import {
  getRandomGenerator,
  getRandomId,
  getRandomShuffler,
} from "../../base/random.ts";
import type { QuestionBankRawQuestionTemplate } from "../content/question-bank-raw-question-template.ts";

const formatNumbers = (numbers: number[]) => {
  if (numbers.length === 0) return "None";
  if (numbers.length === 1) return String(numbers[0]);
  return `${numbers.slice(0, -1).join(", ")} and ${numbers.at(-1)}`;
};

const getSubsets = (size: number) =>
  Array.from({ length: 2 ** size }, (_, index) =>
    Array.from({ length: size }, (_, bit) => bit + 1).filter(
      (bit) => (index >> (bit - 1)) & 1,
    ),
  );

export const generateQuestionForMultipleCorrect = (
  template: Extract<
    QuestionBankRawQuestionTemplate,
    { type: "multiple-correct" }
  >,
  variant: number,
  seed: string,
) => {
  const shuffle = getRandomShuffler(seed);
  const random = getRandomGenerator(seed);
  const statements = shuffle(
    template.variants[variant - 1].show.map(
      (optionIndex) => template.options[optionIndex],
    ),
  );
  const correctNumbers = statements.flatMap((statement, index) =>
    statement.correct ? [index + 1] : [],
  );
  const distance = (numbers: number[]) =>
    statements.filter(
      (_, index) =>
        numbers.includes(index + 1) !== correctNumbers.includes(index + 1),
    ).length;
  const distractors = shuffle(
    getSubsets(statements.length).filter((numbers) => distance(numbers) > 0),
  )
    .sort((a, b) => distance(a) - distance(b))
    .slice(0, 3);
  const options = shuffle([correctNumbers, ...distractors]).map((numbers) => ({
    id: getRandomId(random),
    text: formatNumbers(numbers),
    correct: numbers === correctNumbers,
  }));
  return {
    questionType: "multiple-choice" as const,
    question: [
      template.question,
      ...statements.map(
        (statement, index) => `${index + 1}) ${statement.text}`,
      ),
    ].join("\n\n"),
    explanation: template.explanation,
    correctOptionId: options.find((option) => option.correct)?.id ?? "",
    options: options.map(({ id, text }) => ({ id, text })),
    annexes: [] as string[],
  };
};
