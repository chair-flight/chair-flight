import { getRandomId, getRandomShuffler } from "../../../libs/base/random";
import { getQuestionAnnexIds } from "../../../libs/core/question-bank/get-question-annex-ids";
import { createTest } from "../../../libs/core/tests/create-test";
import { getQuestionBankDb } from "../../../libs/providers/question-bank-db";
import type { QuestionBankName } from "../../../libs/core/content/question-bank-name";
import type { Test } from "../../../libs/core/tests/test";

export const buildQuestionBankTest = async ({
  questionBank,
  mode,
  title,
  durationInMinutes,
  candidateIds,
  numberOfQuestions,
}: {
  questionBank: QuestionBankName;
  mode: Test["mode"];
  title: string;
  durationInMinutes: number;
  candidateIds: string[];
  numberOfQuestions: number;
}) => {
  const seed = getRandomId();
  const questionIds = getRandomShuffler(seed)(candidateIds).slice(
    0,
    numberOfQuestions,
  );
  if (questionIds.length === 0) {
    throw new Error("No questions match the selected chapters.");
  }
  const db = getQuestionBankDb();
  const index = await db.getQuestionBank(questionBank);
  const hrefsByAnnexId = new Map(
    index.annexes.map((annex) => [annex.id, annex.href]),
  );
  const questions = questionIds.flatMap(
    (id) => index.questionsMap.get(id) ?? [],
  );
  return createTest({
    questionBank,
    mode,
    title,
    seed,
    durationInMinutes,
    templates: questions.map((question) => ({
      id: question.id,
      templates: question.templates,
      annexes: getQuestionAnnexIds(question).flatMap(
        (annexId) => hrefsByAnnexId.get(annexId) ?? [],
      ),
    })),
  });
};
