import { getRandomGenerator, getRandomId } from "../../base/random.ts";
import { createTestQuestion } from "./create-test-question.ts";
import type { QuestionBankName } from "../content/question-bank-name.ts";
import type { QuestionBankRawQuestionTemplate } from "../content/question-bank-raw-question-template.ts";
import type { Test } from "./test.ts";

export const createTest = ({
  questionBank,
  mode,
  title,
  seed,
  durationInMinutes,
  templates,
}: {
  questionBank: QuestionBankName;
  mode: Test["mode"];
  title: string;
  seed: string;
  durationInMinutes: number;
  templates: {
    id: string;
    annexes: string[];
    templates: QuestionBankRawQuestionTemplate[];
  }[];
}): Test => {
  const random = getRandomGenerator(seed);
  return {
    id: getRandomId(),
    questionBank,
    title,
    mode,
    status: "created",
    currentQuestionIndex: 0,
    timeSpentInMs: 0,
    durationInMs: durationInMinutes * 60 * 1000,
    createdAtEpochMs: Date.now(),
    startedAtEpochMs: null,
    finishedAtEpochMs: null,
    questions: templates.map((template) =>
      createTestQuestion({ ...template, seed: getRandomId(random) }),
    ),
  };
};
