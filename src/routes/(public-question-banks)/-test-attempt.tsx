import { useMemo } from "react";
import { formatMillisecondsAsClock } from "../../libs/base/format-values";
import { TestNotFound } from "../../libs/ui/components/tests/test-not-found";
import { TestViewer } from "../../libs/ui/components/tests/test-viewer";
import { useTestAnnex } from "../-hooks/use-test-annex";
import { useTestRoute } from "../-hooks/use-test-route";
import { useTestSession } from "../-hooks/use-test-session";
import type { ComponentProps, FC } from "react";

export const TestAttempt: FC = () => {
  const { test, saveTest } = useTestRoute();
  const session = useTestSession(test, saveTest);
  const annex = useTestAnnex();
  const { goToQuestion, selectOption, secondsRemaining } = session;
  const { currentQuestionIndex, durationInMs, mode, questions } = test;
  const current = questions[currentQuestionIndex];

  const question = useMemo(
    () => ({
      ...current,
      title: mode === "study" ? current?.templateId : undefined,
      onOptionClick: selectOption,
      onAnnexClick: annex.onAnnexClick,
    }),
    [annex.onAnnexClick, current, mode, selectOption],
  );
  const navigation = useMemo<ComponentProps<typeof TestViewer>["navigation"]>(
    () => ({
      currentQuestionIndex,
      items: questions.map((item) => ({
        id: item.questionId,
        flagged: item.flagged,
        status: !item.selectedOptionId
          ? "unanswered"
          : mode === "exam"
            ? "answered"
            : item.selectedOptionId === item.correctOptionId
              ? "correct"
              : "wrong",
      })),
      onNavigation: goToQuestion,
    }),
    [currentQuestionIndex, goToQuestion, mode, questions],
  );
  const information = useMemo(
    () => ({ explanation: current?.explanation }),
    [current],
  );
  const timer = useMemo(
    () => ({
      remaining: formatMillisecondsAsClock(
        secondsRemaining * 1000,
        durationInMs >= 60 * 60 * 1000,
      ),
      warning: secondsRemaining <= 5 * 60,
      expired: secondsRemaining === 0,
    }),
    [durationInMs, secondsRemaining],
  );

  if (!current) return <TestNotFound />;

  return (
    <div className="fixed inset-0">
      <TestViewer
        {...annex}
        mode={mode}
        title={test.title}
        question={question}
        navigation={navigation}
        information={information}
        timer={timer}
        onToggleFlag={session.toggleFlag}
        onFinish={session.finishTest}
      />
    </div>
  );
};
