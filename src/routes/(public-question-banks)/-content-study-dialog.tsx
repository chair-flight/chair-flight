import { useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { getRandomId, getRandomShuffler } from "../../libs/base/random";
import { getQuestionAnnexIds } from "../../libs/core/question-bank/get-question-annex-ids";
import { createTest } from "../../libs/core/tests/create-test";
import { Button } from "../../libs/ui/components/base/button";
import { Modal } from "../../libs/ui/components/base/modal";
import { ClockIcon } from "../../libs/ui/components/icons/clock-icon";
import { EyeIcon } from "../../libs/ui/components/icons/eye-icon";
import { ListIcon } from "../../libs/ui/components/icons/list-icon";
import { useTests } from "../-hooks/use-tests";
import type { FC } from "react";
import type {
  QuestionBankAnnex,
  QuestionBankQuestion,
} from "../../libs/core/content/question-bank-index";
import type { QuestionBankName } from "../../libs/core/content/question-bank-name";

const MAX_TEST_QUESTIONS = 200;

type StudyQuestions = {
  questions: QuestionBankQuestion[];
  annexes: QuestionBankAnnex[];
};

export const ContentStudyDialog: FC<{
  questionBank: QuestionBankName;
  contentId: string;
  questionCount: number;
  loadQuestions: () => StudyQuestions | Promise<StudyQuestions>;
  onClose: () => void;
}> = ({ questionBank, contentId, questionCount, loadQuestions, onClose }) => {
  const [studySubmitting, setStudySubmitting] = useState(false);
  const [studyError, setStudyError] = useState("");
  const navigate = useNavigate();
  const { saveTest } = useTests();

  const closeStudy = useCallback(() => {
    if (!studySubmitting) onClose();
  }, [onClose, studySubmitting]);

  const startStudy = useCallback(async () => {
    setStudySubmitting(true);
    setStudyError("");
    try {
      const studyScope = await loadQuestions();
      const seed = getRandomId();
      const picked = getRandomShuffler(seed)(studyScope.questions).slice(
        0,
        MAX_TEST_QUESTIONS,
      );
      if (picked.length === 0) {
        setStudyError("No questions match this scope.");
        return;
      }
      const hrefsByAnnexId = new Map(
        studyScope.annexes.map((annex) => [annex.id, annex.href]),
      );
      const test = createTest({
        questionBank,
        mode: "study",
        title: `${contentId} study`,
        seed,
        durationInMinutes: 0,
        templates: picked.map((question) => ({
          id: question.id,
          templates: question.templates,
          annexes: getQuestionAnnexIds(question).flatMap(
            (annexId) => hrefsByAnnexId.get(annexId) ?? [],
          ),
        })),
      });
      saveTest(test);
      await navigate({
        to: "/question-banks/$questionBank/tests/$testId",
        params: { questionBank, testId: test.id },
      });
    } catch (cause) {
      setStudyError(
        cause instanceof Error ? cause.message : "Something went wrong",
      );
    } finally {
      setStudySubmitting(false);
    }
  }, [contentId, loadQuestions, navigate, questionBank, saveTest]);

  const studyIncluded = Math.min(questionCount, MAX_TEST_QUESTIONS);

  return (
    <Modal open onClose={closeStudy}>
      <div className="flex w-[min(26rem,calc(100vw-2rem))] flex-col gap-4 p-6">
        <h2 className="m-0 text-lg font-bold">
          Create a new Test (Study Mode)
        </h2>
        <p className="m-0 text-sm text-muted">
          You will create a test with the following setup
        </p>
        <ul className="m-0 flex list-none flex-col gap-3 p-0 text-sm">
          <li className="flex items-center gap-3">
            <ClockIcon size={18} />
            Unlimited Time
          </li>
          <li className="flex items-center gap-3">
            <EyeIcon size={18} />
            See the correct answer as soon as you answer
          </li>
          <li className="flex items-center gap-3">
            <ListIcon size={18} />
            {studyIncluded} out of {questionCount} questions for {contentId}
          </li>
        </ul>
        {studyError && <p className="m-0 text-sm text-danger">{studyError}</p>}
        <hr className="-mx-6 m-0 border-0 border-t border-rule" />
        <div className="flex justify-end gap-2">
          <Button onClick={closeStudy} disabled={studySubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={startStudy}
            disabled={studySubmitting || questionCount === 0}
          >
            {studySubmitting ? "Creating..." : "Start"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
